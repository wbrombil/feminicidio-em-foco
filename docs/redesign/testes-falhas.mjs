// Testes locais de falha e recuperação, sem dependências adicionais.
import { spawn } from 'node:child_process'
import { mkdtemp, readFile, mkdir, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'

const output = resolve('docs/redesign/entrega-2026-11-06/testes-falhas-complementar.json')
const profile = await mkdtemp(join(tmpdir(), 'femfoco-falhas-'))
const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  '--disable-background-networking', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank',
], { windowsHide: true, stdio: 'ignore' })
let socket
const result = { url: 'http://localhost:5173/', injected: [], observedFetches: [], steps: {}, limits: ['Falhas simuladas por CDP em requisições Fetch locais; não mede problemas reais de rede.'] }
try {
  let port
  for (let i = 0; i < 100; i++) {
    try { port = (await readFile(join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]; break } catch { await delay(200) }
  }
  if (!port) throw new Error(`Chrome não iniciou; exitCode=${chrome.exitCode}`)
  const page = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json()
  socket = new WebSocket(page.webSocketDebuggerUrl)
  await new Promise((ok, fail) => { socket.addEventListener('open', ok, { once: true }); socket.addEventListener('error', fail, { once: true }) })
  let id = 0
  const pending = new Map()
  let failure = 'services'
  socket.addEventListener('message', event => {
    const msg = JSON.parse(event.data)
    if (msg.id && pending.has(msg.id)) {
      const p = pending.get(msg.id); pending.delete(msg.id)
      if (msg.error) p.reject(new Error(msg.error.message)); else p.resolve(msg.result)
    }
    if (msg.method === 'Fetch.requestPaused') {
      const { requestId, request, resourceType } = msg.params
      result.observedFetches.push({ url: request.url, resourceType })
      const local = new URL(request.url).hostname === 'localhost' || new URL(request.url).hostname === '127.0.0.1'
      // Chrome classifica estes pedidos feitos com fetch() como XHR no evento CDP.
      const target = resourceType === 'XHR' && ((failure === 'base' && request.url.includes('/ibge/rs-municipios-2025.geojson')) || (failure === 'services' && request.url.includes('/rede-protecao/services.json')) || (failure === 'annual' && request.url.includes('/generated/feminicidio-consumado-2020.json')) || (failure === 'news' && request.url.includes('/ssp-rs/case-news-2026.json')))
      if (target || !local) {
        result.injected.push({ url: request.url, resourceType, reason: target ? failure : 'external-blocked' })
        call('Fetch.failRequest', { requestId, errorReason: 'Failed' }).catch(() => {})
      } else call('Fetch.continueRequest', { requestId }).catch(() => {})
    }
  })
  const call = (method, params = {}) => new Promise((ok, fail) => {
    const request = ++id; pending.set(request, { resolve: ok, reject: fail }); socket.send(JSON.stringify({ id: request, method, params }))
  })
  const evaluate = async expression => {
    const response = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
    if (response.exceptionDetails) throw new Error(response.exceptionDetails.text)
    return response.result.value
  }
  const wait = async (expression, label) => {
    for (let i = 0; i < 100; i++) { if (await evaluate(expression)) return; await delay(150) }
    throw new Error(`Tempo esgotado: ${label}`)
  }
  await Promise.all([call('Page.enable'), call('Runtime.enable'), call('Network.enable')])
  await call('Network.setCacheDisabled', { cacheDisabled: true })
  await call('Fetch.enable', { patterns: [{ urlPattern: '*', resourceType: 'Fetch', requestStage: 'Request' }] })
  await call('Page.navigate', { url: result.url })
  await wait("!!document.querySelector('.network-load-note .retry-button') && !!document.querySelector('.map-summary')", 'erro de serviços e mapa')
  result.steps.servicesFailure = await evaluate(`({notice:document.querySelector('.network-load-note').innerText, mapSummary:document.querySelector('.map-summary').innerText, retry:!!document.querySelector('.network-load-note .retry-button')})`)
  failure = ''
  await evaluate("document.querySelector('.network-load-note .retry-button').click()")
  await wait("!!document.querySelector('.network-filters') && !document.querySelector('.network-load-note .retry-button')", 'recuperação dos serviços')
  result.steps.servicesRecovery = await evaluate(`({filters:document.querySelector('.network-filters').innerText, mapSummary:document.querySelector('.map-summary').innerText, errorVisible:!!document.querySelector('.network-load-note .retry-button')})`)
  await evaluate("document.querySelector('.methodology-history').open=true")
  failure = 'annual'
  await evaluate("document.querySelector('#view-data-2020').click()")
  await wait("!!document.querySelector('dialog[open] [role=alert]')", 'erro de dados anuais')
  result.steps.annualFailure = await evaluate(`({alert:document.querySelector('dialog[open] [role=alert]').innerText, dialog:document.querySelector('dialog[open]').innerText.slice(0,600)})`)
  await evaluate("document.querySelector('dialog[open] .annual-dialog-close').click()")
  failure = ''
  await evaluate("document.querySelector('#view-data-2020').click()")
  await wait("!!document.querySelector('dialog[open] .annual-data-controls input')", 'reabertura dos dados anuais')
  result.steps.annualRecovery = await evaluate(`({title:document.querySelector('dialog[open] h2')?.innerText, rows:document.querySelectorAll('dialog[open] tbody tr').length, alert:document.querySelector('dialog[open] [role=alert]')?.innerText ?? null, controls:document.querySelector('dialog[open] .annual-data-controls')?.innerText})`)
  await evaluate("document.querySelector('dialog[open] .annual-dialog-close').click()")
  failure = 'news'
  await call('Page.navigate', { url: result.url })
  await wait("!!document.querySelector('.latest-news-retry')", 'erro das notícias recentes')
  result.steps.newsFailure = await evaluate(`({notice:document.querySelector('.latest-news [role=status]')?.innerText,retry:!!document.querySelector('.latest-news-retry')})`)
  await wait("!!document.querySelector('.municipality-search select option[value=\"4314902\"]')", 'lista de municípios')
  await evaluate("{ const s=document.querySelector('.municipality-search select'); s.value='4314902'; s.dispatchEvent(new Event('change',{bubbles:true})) }")
  await wait("!!document.querySelector('.case-news .retry-button')", 'erro das referências municipais')
  await evaluate("document.querySelector('.case-news').open=true")
  result.steps.municipalNewsFailure = await evaluate(`({notice:document.querySelector('.case-news [role=status]').innerText})`)
  failure = ''
  await evaluate("document.querySelector('.case-news .retry-button').click()")
  await wait("!document.querySelector('.case-news .retry-button') && !document.querySelector('.case-news [role=status]')", 'recuperação das referências municipais')
  result.steps.municipalNewsRecovery = await evaluate(`({text:document.querySelector('.case-news-content').innerText, cards:document.querySelectorAll('.case-news-card').length})`)
  await evaluate("document.querySelector('.latest-news-retry').click()")
  await wait("document.querySelectorAll('.latest-news-card').length === 5", 'recuperação das notícias recentes')
  result.steps.newsRecovery = await evaluate(`({cards:document.querySelectorAll('.latest-news-card').length,errorVisible:!!document.querySelector('.latest-news-retry')})`)
  failure = 'base'
  await call('Page.navigate', { url: result.url })
  await wait("!!document.querySelector('.map-message-error button')", 'erro da malha municipal')
  result.steps.baseFailure = await evaluate(`({alert:document.querySelector('.map-message-error').innerText})`)
  failure = ''
  await evaluate("document.querySelector('.map-message-error button').click()")
  await wait("!!document.querySelector('.leaflet-container') && !document.querySelector('.map-message-error')", 'recuperação da malha municipal')
  result.steps.baseRecovery = await evaluate(`({map:!!document.querySelector('.leaflet-container'), errorVisible:!!document.querySelector('.map-message-error')})`)
  result.success = ['services','annual','news','base'].every(reason => result.injected.some(x => x.reason === reason)) && result.steps.annualRecovery.rows > 0 && result.steps.municipalNewsFailure.notice.includes('Não foi possível') && result.steps.municipalNewsRecovery.cards > 0 && result.steps.newsRecovery.cards === 5 && result.steps.baseRecovery.map
} catch (error) {
  result.success = false
  result.error = String(error)
  process.exitCode = 1
} finally {
  socket?.close()
  chrome.kill()
  await mkdir(resolve('docs/redesign/entrega-2026-11-06'), { recursive: true })
  await writeFile(output, JSON.stringify(result, null, 2), 'utf8')
  console.log(JSON.stringify(result, null, 2))
}
