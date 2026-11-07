// Inspeção local com Chrome instalado e protocolo DevTools; não instala dependências.
import { spawn } from 'node:child_process'
import { mkdtemp, readFile, writeFile, mkdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const outputDir = resolve('docs/redesign/entrega-2026-11-06')
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

  await Promise.all([call('Page.enable'),call('Runtime.enable')])
  await call('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false})
  const results=[]
  for(const zoom of [1,2,4]) {
    await call('Page.navigate',{url:'chrome://settings/appearance'});await delay(2000)
    const setting=await evaluate(`(() => {let found;function visit(n){if(n.nodeType===1){if(n.id==='zoomLevel')found=n;if(n.shadowRoot)visit(n.shadowRoot)};for(const c of n.children||[])visit(c)}visit(document);found.value='${zoom}';found.dispatchEvent(new Event('change',{bubbles:true,composed:true}));return {selected:found.value,options:[...found.options].filter(o=>o.selected).map(o=>o.textContent.trim())}})()`)
    await delay(500); await call('Page.navigate',{url:'http://localhost:5173/'});await delay(3000)
    const metrics=await evaluate(`(() => ({innerWidth,innerHeight,devicePixelRatio,visualScale:visualViewport.scale,clientWidth:document.documentElement.clientWidth,docWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,excedentes:[...document.querySelectorAll('body *')].filter(e=>{let r=e.getBoundingClientRect();if(r.right<=document.documentElement.clientWidth+0.5||r.width===0)return false;return !e.closest('.leaflet-container')&&!e.closest('dialog')&&!e.closest('.table-scroll')}).slice(0,25).map(e=>({tag:e.tagName,cls:String(e.className).slice(0,70),right:Math.round(e.getBoundingClientRect().right*100)/100,width:Math.round(e.getBoundingClientRect().width*100)/100})),scrollLeftMax:(()=>{window.scrollTo(9999,0);let x=window.scrollX;window.scrollTo(0,0);return x})(),map:!!document.querySelector('.map-summary'),heading:document.querySelector('h1')?.innerText,screen:{width:screen.width,height:screen.height}}))()`)
    const image=await call('Page.captureScreenshot',{format:'png'});await writeFile(join(outputDir,'zoom-'+(zoom*100)+'.png'),Buffer.from(image.data,'base64'))
    results.push({zoom,setting,metrics})
  }
  await writeFile(join(outputDir,'zoom-real.json'),JSON.stringify(results,null,2),'utf8');console.log(JSON.stringify(results,null,2))
} finally { socket?.close(); chrome.kill() }