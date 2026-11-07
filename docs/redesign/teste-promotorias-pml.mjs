import { spawn } from 'node:child_process'
import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'

const profile = await mkdtemp(join(tmpdir(), 'femfoco-rede-'))
const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', ['--headless=new', '--disable-gpu', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' })
let socket
try {
  let port
  for (let i = 0; i < 100; i++) { try { port = (await readFile(join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]; break } catch { await delay(200) } }
  if (!port) throw Error('Chrome indisponível')
  const page = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json()
  socket = new WebSocket(page.webSocketDebuggerUrl)
  await new Promise((ok, fail) => { socket.addEventListener('open', ok, { once: true }); socket.addEventListener('error', fail, { once: true }) })
  let id = 0
  const pending = new Map(), errors = []
  socket.addEventListener('message', event => { const m = JSON.parse(event.data); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); if (m.error) p.reject(Error(m.error.message)); else p.resolve(m.result) } if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.text) })
  const call = (method, params = {}) => new Promise((resolve, reject) => { const n = ++id; pending.set(n, { resolve, reject }); socket.send(JSON.stringify({ id: n, method, params })) })
  const evaluate = async expression => { const r = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw Error(r.exceptionDetails.text); return r.result.value }
  await Promise.all([call('Page.enable'), call('Runtime.enable')])
  const result = { views: [], combinations: [], selections: [], errors }
  for (const width of [1440, 390, 320]) {
    await call('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false })
    await call('Page.navigate', { url: 'http://localhost:5173/' })
    for (let i = 0; i < 150; i++) { if (await evaluate("document.querySelectorAll('.network-marker-icon').length === 366")) break; await delay(200) }
    const view = await evaluate(`(()=>({width:${width},scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth,markers:document.querySelectorAll('.network-marker-icon').length,directory:document.querySelectorAll('details.network-directory:not(.case-news) li button').length,filters:[...document.querySelectorAll('.network-filters label')].map(x=>x.innerText)}))()`)
    result.views.push(view)
    const screenshot = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width, height: Math.min(await evaluate('document.documentElement.scrollHeight'), 16000), scale: 1 } })
    await writeFile(`docs/redesign/promotorias-pml-${width}.png`, Buffer.from(screenshot.data, 'base64'))
  }
  for (let mask = 0; mask < 128; mask++) {
    await evaluate(`(()=>{const c=[...document.querySelectorAll('.network-filters input')];c.forEach((e,i)=>{if(e.checked!==Boolean(${mask}&(1<<i)))e.click()})})()`)
    await delay(80)
    result.combinations.push(await evaluate(`({mask:${mask},markers:document.querySelectorAll('.network-marker-icon').length,directory:document.querySelectorAll('details.network-directory:not(.case-news) li button').length})`))
  }
  await evaluate("document.querySelectorAll('.network-filters input').forEach(e=>{if(!e.checked)e.click()})")
  for (const type of ['Sala das Margaridas', 'Sala Lilás', 'Patrulha Maria da Penha', 'Juizado de Violência Doméstica', 'Promotoria MPRS', 'Posto Médico-Legal']) {
    const selected = await evaluate(`(()=>{const b=[...document.querySelectorAll('details.network-directory:not(.case-news) li button')].find(x=>x.textContent.includes(${JSON.stringify(type)}));if(!b)return null;const name=b.querySelector('strong').textContent;b.click();return name})()`)
    await delay(100)
    result.selections.push({ type, selected, panel: await evaluate("document.querySelector('.municipality-panel h3')?.textContent"), pressed: await evaluate("document.querySelectorAll('.network-marker-icon[aria-pressed=true]').length"), pmlGuidance: type === 'Posto Médico-Legal' ? await evaluate("document.querySelector('.selected-service-details')?.textContent.includes('O encaminhamento deve ser feito pela autoridade policial')") : null })
    await evaluate("document.querySelector('.clear-selection')?.click()")
    await delay(100)
    await evaluate("document.querySelector('.clear-selection')?.click()")
    await delay(100)
  }
  await evaluate("document.querySelector('.network-list-jump').focus()")
  await call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13, text: '\r', unmodifiedText: '\r' })
  await call('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13 })
  await delay(200)
  result.jump = await evaluate("({hash:location.hash, focused:document.activeElement?.id})")
  result.justiceFocus = await evaluate("(()=>{const m=document.querySelector('.network-marker-icon:has(.network-marker-justica)');m.focus();return {focused:document.activeElement===m,outline:getComputedStyle(m).outlineStyle,width:getComputedStyle(m).outlineWidth}})()")
  const counts = [54, 30, 105, 119, 14, 12, 34]
  const markerCounts = [53, 29, 105, 119, 14, 12, 34]
  result.success = result.views.every(v=>v.markers===366 && v.directory===368 && v.scrollWidth===v.clientWidth) && result.combinations.every(v=>v.directory===counts.reduce((n,c,i)=>n+((v.mask&(1<<i))?c:0),0) && v.markers===markerCounts.reduce((n,c,i)=>n+((v.mask&(1<<i))?c:0),0)) && result.selections.every(v=>v.selected && v.selected===v.panel && v.pressed===1 && (v.type !== 'Posto Médico-Legal' || v.pmlGuidance)) && result.jump.focused==='lista-servicos' && result.justiceFocus.focused && result.justiceFocus.outline==='solid' && errors.length===0
  await writeFile('docs/redesign/teste-promotorias-pml.json', JSON.stringify(result, null, 2))
  console.log(JSON.stringify(result, null, 2))
  if (!result.success) process.exitCode = 1
} finally { socket?.close(); chrome.kill() }
