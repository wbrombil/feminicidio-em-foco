// Inspeção local com Chrome instalado e protocolo DevTools; não instala dependências.
import { spawn } from 'node:child_process'
import { mkdtemp, readFile, writeFile, mkdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const outputDir = resolve(process.argv[2] ?? 'docs/redesign/baseline-2026-11-06/capturas')
const profile = await mkdtemp(join(tmpdir(), 'femfoco-headless-'))
await mkdir(outputDir, { recursive: true })
const chrome = spawn(chromePath, [
  '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank',
], { windowsHide: true, stdio: 'ignore' })
let socket
try {
  let port
  for (let i = 0; i < 100; i++) {
    try { port = (await readFile(join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]; break } catch { await delay(200) }
  }
  if (!port) throw new Error(`Chrome não criou DevToolsActivePort; exitCode=${chrome.exitCode}`)
  const page = await (await fetch(`http://127.0.0.1:${port}/json/new?http://localhost:5173/`, { method: 'PUT' })).json()
  socket = new WebSocket(page.webSocketDebuggerUrl)
  await new Promise((ok, fail) => { socket.addEventListener('open', ok, { once: true }); socket.addEventListener('error', fail, { once: true }) })
  let id = 0
  const pending = new Map()
  const errors = []
  const expectedErrors = []
  let injectFailure = false
  socket.addEventListener('message', event => {
    const msg = JSON.parse(event.data)
    if (msg.id && pending.has(msg.id)) {
      const p = pending.get(msg.id); pending.delete(msg.id)
      if (msg.error) p.reject(new Error(msg.error.message)); else p.resolve(msg.result)
    }
    if (msg.method === 'Runtime.exceptionThrown') (injectFailure ? expectedErrors : errors).push(msg.params.exceptionDetails.text)
    if (msg.method === 'Log.entryAdded' && msg.params.entry.level === 'error') (injectFailure ? expectedErrors : errors).push(`${msg.params.entry.text} ${msg.params.entry.url ?? ''}`.trim())
  })
  const call = (method, params = {}) => new Promise((resolveCall, reject) => {
    const request = ++id; pending.set(request, { resolve: resolveCall, reject }); socket.send(JSON.stringify({ id: request, method, params }))
  })
  const evaluate = async expression => {
    const result = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text)
    return result.result.value
  }
  await Promise.all([call('Page.enable'), call('Runtime.enable'), call('Log.enable')])
  const capture = async name => {
    const { cssContentSize } = await call('Page.getLayoutMetrics')
    const screenshot = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: Math.ceil(cssContentSize.width), height: Math.ceil(cssContentSize.height), scale: 1 } })
    await writeFile(join(outputDir, `${name}.png`), Buffer.from(screenshot.data, 'base64'))
  }
  const waitReady = async () => {
    for (let i = 0; i < 100; i++) {
      if (await evaluate("document.readyState === 'complete' && !!document.querySelector('.map-summary')")) return
      await delay(200)
    }
    throw new Error('Dados do mapa não ficaram disponíveis no prazo.')
  }
  const result = { url: 'http://localhost:5173/', profile: 'isolado temporário', views: {}, interactions: {}, errors, expectedErrors }
  for (const view of [{ name: 'desktop', width: 1440, height: 900 }, { name: 'celular', width: 390, height: 844 }, { name: 'estreito', width: 320, height: 800 }, { name: 'intermediario', width: 768, height: 900 }, { name: 'intermediario-largo', width: 1024, height: 900 }]) {
    await call('Emulation.setDeviceMetricsOverride', { width: view.width, height: view.height, deviceScaleFactor: 1, mobile: false })
    await call('Page.navigate', { url: 'http://localhost:5173/' })
    await waitReady()
    await delay(500)
    result.views[view.name] = await evaluate(`(() => ({width:innerWidth,height:innerHeight,documentWidth:document.documentElement.scrollWidth,documentHeight:document.documentElement.scrollHeight,title:document.title,headings:[...document.querySelectorAll('h1,h2,h3,summary')].map(e=>e.innerText.trim()).filter(Boolean),summary:document.querySelector('.map-summary')?.innerText,logo:document.querySelector('.wordmark img')?.getAttribute('src')}))()`)
    await capture(`${view.name}-pagina-inteira`)
  }
  await call('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false })
  await call('Page.navigate', { url: 'http://localhost:5173/' })
  await waitReady()
  result.interactions.default = await evaluate(`(() => ({ selects:[...document.querySelectorAll('.map-controls select')].map(s=>({value:s.value,options:s.options.length})),checks:[...document.querySelectorAll('.network-filters input')].map(x=>x.checked), panel:document.querySelector('.municipality-panel')?.innerText }))()`)
  await evaluate(`(() => { const s=document.querySelectorAll('.map-controls select')[2]; s.value=[...s.options].find(o=>o.textContent.trim()==='Porto Alegre').value; s.dispatchEvent(new Event('change',{bubbles:true})); })()`)
  await delay(500)
  result.interactions.municipality = await evaluate(`document.querySelector('.municipality-panel')?.innerText`)
  await evaluate(`document.querySelector('.case-news summary')?.click()`)
  await delay(500)
  result.interactions.news = await evaluate(`document.querySelector('.case-news')?.innerText`)
  await evaluate(`document.querySelector('.network-directory:not(.case-news) summary')?.click()`)
  await delay(200)
  result.interactions.directory = await evaluate(`document.querySelector('.network-directory:not(.case-news)')?.innerText.slice(0,1200)`)
  await capture('desktop-municipio-noticias-servicos')
  await evaluate(`document.querySelector('.methodology-history summary').click()`)
  await evaluate(`document.querySelector('#view-data-2026').click()`)
  await delay(800)
  result.interactions.annual2026 = await evaluate(`document.querySelector('dialog[open]')?.innerText.slice(0,1800)`)
  await capture('desktop-dados-anuais-2026')
  await evaluate(`document.querySelector('dialog[open] .annual-dialog-close').click()`)
  await evaluate(`document.querySelector('.education-topic summary').click()`)
  result.interactions.education = await evaluate(`document.querySelector('.education-topic')?.innerText`)
  await capture('desktop-educacao-metodologia-abertas')
  result.interactions.filterCombinations = []
  for (const desired of [[true, true], [true, false], [false, true], [false, false]]) {
    await evaluate(`(() => { const checks=[...document.querySelectorAll('.network-filters input')]; ${JSON.stringify(desired)}.forEach((wanted,i)=>{if(checks[i].checked!==wanted) checks[i].click()}) })()`)
    result.interactions.filterCombinations.push(await evaluate(`(() => ({checks:[...document.querySelectorAll('.network-filters input')].map(x=>x.checked), summary:document.querySelector('.map-summary').innerText, directory:document.querySelector('.network-directory:not(.case-news)')?.innerText}))()`))
  }
  await evaluate(`(() => { const checks=[...document.querySelectorAll('.network-filters input')]; checks.forEach(c=>{if(!c.checked)c.click()}) })()`)
  await evaluate(`document.querySelector('.network-directory:not(.case-news) button')?.click()`)
  result.interactions.service = await evaluate(`document.querySelector('.municipality-panel')?.innerText`)
  await evaluate(`document.querySelector('.clear-selection')?.click()`)
  result.interactions.afterServiceClear = await evaluate(`document.querySelector('.municipality-panel')?.innerText`)
  await evaluate(`(() => { const s=document.querySelectorAll('.map-controls select')[0]; s.value='2025'; s.dispatchEvent(new Event('change',{bubbles:true})) })()`)
  for (let i=0;i<50;i++) { if (await evaluate(`document.querySelector('.map-summary')?.innerText.includes('2025')`)) break; await delay(200) }
  result.interactions.year2025 = await evaluate(`(() => ({summary:document.querySelector('.map-summary')?.innerText, selects:[...document.querySelectorAll('.map-controls select')].map(s=>s.value)}))()`)
  result.interactions.annualYears = []
  for (let year=2020; year<=2026; year++) {
    await evaluate(`document.querySelector('#view-data-${year}').click()`)
    for (let i=0;i<100;i++) { if (await evaluate(`!!document.querySelector('dialog[open] .annual-data-controls input')`)) break; await delay(100) }
    result.interactions.annualYears.push(await evaluate(`(() => {const d=document.querySelector('dialog[open]'); return {title:d?.querySelector('h2')?.innerText, count:d?.querySelector('.annual-data-controls p')?.innerText, rows:d?.querySelectorAll('tbody tr').length, hasUnavailable:d?.innerText.includes('Indisponível')};})()`))
    if (year===2026) {
      await evaluate(`document.querySelector('dialog[open] .annual-data-pagination button:last-child').click()`)
      await delay(100)
      result.interactions.annualPageTwo = await evaluate(`document.querySelector('dialog[open] .annual-data-pagination')?.innerText`)
      await evaluate(`document.querySelector('dialog[open] .annual-data-pagination button:first-child').click()`)
      await evaluate(`(() => {let x=document.querySelector('dialog[open] input[type=search]'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(x,'Porto Alegre'); x.dispatchEvent(new Event('input',{bubbles:true}));})()`)
      await delay(100)
      result.interactions.annualSearch = await evaluate(`document.querySelector('dialog[open]')?.innerText.slice(0,900)`)
      await evaluate(`(() => {let x=document.querySelector('dialog[open] input[type=search]'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(x,'municipio inexistente xyz'); x.dispatchEvent(new Event('input',{bubbles:true}));})()`)
      await delay(100)
      result.interactions.annualEmpty = await evaluate(`document.querySelector('dialog[open]')?.innerText.includes('Nenhum município corresponde à busca.')`)
    }
    await evaluate(`document.querySelector('dialog[open] .annual-dialog-close').click()`)
    await delay(50)
  }
  result.interactions.focusAfterClose = await evaluate(`document.activeElement?.id`)
  await evaluate(`document.querySelectorAll('.education-topic').forEach(d=>{d.open=true})`)
  result.interactions.educationExpanded = await evaluate(`([...document.querySelectorAll('.education-topic')].map(d=>({summary:d.querySelector('summary')?.innerText,content:d.querySelector('.education-topic-content')?.innerText.length,open:d.open})))`)
  result.content = await evaluate(`(() => ({text:document.querySelector('main')?.innerText, links:[...document.querySelectorAll('main a')].map(a=>({text:a.innerText.trim(),href:a.getAttribute('href')}))}))()`)
  await call('Emulation.setDeviceMetricsOverride', { width: 320, height: 800, deviceScaleFactor: 1, mobile: false })
  await call('Page.navigate', { url: 'http://localhost:5173/' })
  await waitReady()
  await evaluate(`document.querySelector('.methodology-history').open=true; document.querySelector('#view-data-2026').click()`)
  for (let i=0;i<100;i++) { if (await evaluate(`!!document.querySelector('dialog[open] .annual-data-controls input')`)) break; await delay(100) }
  result.interactions.mobileDialog = await evaluate(`(() => {const d=document.querySelector('dialog[open]'); const h=d.querySelector('.annual-dialog-heading'); const b=d.querySelector('.annual-dialog-body'); return {viewport:[innerWidth,innerHeight],dialog:{width:d.getBoundingClientRect().width,height:d.getBoundingClientRect().height,scrollWidth:d.scrollWidth,clientWidth:d.clientWidth},headingHeight:h.getBoundingClientRect().height,bodyHeight:b.getBoundingClientRect().height,cards:d.querySelectorAll('.annual-data-mobile-card').length,unavailable:d.innerText.includes('Indisponível')};})()`)
  const viewportShot = await call('Page.captureScreenshot', { format:'png', clip:{x:0,y:0,width:320,height:800,scale:1} })
  await writeFile(join(outputDir,'estreito-dialogo-anual.png'),Buffer.from(viewportShot.data,'base64'))
  await call('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27})
  await call('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27})
  await delay(100)
  result.interactions.escapeClose = await evaluate(`({open:!!document.querySelector('dialog[open]'),focus:document.activeElement?.id})`)
  await writeFile(join(outputDir, 'observacoes.json'), JSON.stringify(result, null, 2), 'utf8')
  console.log(JSON.stringify({ outputDir, views: result.views, interactions: result.interactions, errors }, null, 2))
} finally {
  socket?.close()
  chrome.kill()
}
