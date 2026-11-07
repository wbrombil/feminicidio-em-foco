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

  await Promise.all([call('Page.enable'), call('Runtime.enable')])
  await call('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false})
  await call('Page.navigate',{url:'http://localhost:5173/'})
  await delay(3000)
  const data=await evaluate(`(() => {
    const visible=e=>{let r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none'};
    const box=e=>{let r=e.getBoundingClientRect();return {x:Math.round(r.x*10)/10,y:Math.round(r.y*10)/10,w:Math.round(r.width*10)/10,h:Math.round(r.height*10)/10}};
    let all=[...document.querySelectorAll('button,select,input[type=checkbox],summary,a,[role=button],.leaflet-marker-icon')].filter(visible);
    return all.filter(e=>{let r=e.getBoundingClientRect();return r.width<24||r.height<24}).map(e=>{let r=e.getBoundingClientRect(),labels=[...(e.labels||[])];let nearest=all.filter(x=>x!==e&&!x.contains(e)&&!e.contains(x)).map(x=>{let t=x.getBoundingClientRect();return {tag:x.tagName,txt:(x.innerText||x.getAttribute('aria-label')||'').trim().slice(0,70),distance:Math.round(Math.hypot(Math.max(t.left-r.right,r.left-t.right,0),Math.max(t.top-r.bottom,r.top-t.bottom,0))*10)/10}}).sort((a,b)=>a.distance-b.distance).slice(0,2);return {tag:e.tagName,html:e.outerHTML.slice(0,350),parent:e.parentElement.outerHTML.slice(0,400),rect:box(e),labels:labels.map(l=>({text:l.innerText,rect:box(l)})),nearest}})
  })()`)
  await writeFile(join(outputDir,'alvos-detalhados.json'),JSON.stringify(data,null,2),'utf8')
  console.log(JSON.stringify(data,null,2))
} finally { socket?.close(); chrome.kill() }