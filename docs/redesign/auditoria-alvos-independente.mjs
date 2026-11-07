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


  const results = []
  const inspect = `(() => {
    const dialog=document.querySelector('dialog[open]');
    const list=[...document.querySelectorAll('a[href],button,select,input:not([type=hidden]),summary,[role=button]')].filter(e=>{
      if(dialog&&!dialog.contains(e))return false; if([...e.closest('details:not([open])')?.children||[]].some(x=>x!==e&&x.tagName!=='SUMMARY'&&x.contains(e)))return false;
      let r=e.getBoundingClientRect(),s=getComputedStyle(e); if(!r.width||!r.height||s.display==='none'||s.visibility==='hidden'||s.pointerEvents==='none'||e.disabled)return false;
      for(let a=e.parentElement;a&&a!==document.body;a=a.parentElement){if(dialog&&a===dialog.parentElement)break;let c=getComputedStyle(a),q=a.getBoundingClientRect();if(/hidden|clip|scroll|auto/.test(c.overflowX)&& (r.right<=q.left||r.left>=q.right))return false;if(/hidden|clip|scroll|auto/.test(c.overflowY)&&(r.bottom<=q.top||r.top>=q.bottom))return false;}
      return true;
    }).map(e=>{let target=e.matches('input')&&e.labels?.length?e.labels[0]:e;let r=target.getBoundingClientRect();return {tag:e.tagName,selector:e.tagName.toLowerCase()+(e.id?'#'+e.id:'')+(e.classList.length?'.'+[...e.classList].join('.') : ''),text:(e.innerText||e.getAttribute('aria-label')||e.value||'').trim().slice(0,100),parent:e.parentElement?.tagName,marker:e.classList.contains('leaflet-marker-icon'),rect:{x:r.x,y:r.y,w:r.width,h:r.height},cx:r.x+r.width/2,cy:r.y+r.height/2,small:r.width<24||r.height<24};});
    const small=list.filter(a=>a.small&&!a.marker).map(a=>{a.conflicts=list.filter(b=>b!==a&&!b.marker).map(b=>{let d=Math.hypot(a.cx-b.cx,a.cy-b.cy);let dx=Math.max(b.rect.x-a.cx,0,a.cx-b.rect.x-b.rect.w),dy=Math.max(b.rect.y-a.cy,0,a.cy-b.rect.y-b.rect.h);return {selector:b.selector,text:b.text,distanceCenters:+d.toFixed(2),circleIntersectsTarget:Math.hypot(dx,dy)<12-0.01,circleIntersectsCircle:b.small&&d<24-0.01}}).filter(x=>x.circleIntersectsTarget||x.circleIntersectsCircle);return a});
    return {targets:list.length,markers:list.filter(x=>x.marker).length,small};
  })()`
  for (const [name,width] of [['desktop',1280],['mobile',375]]) {
    await call('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false})
    await call('Page.navigate',{url:'http://localhost:5173/'})
    await delay(3500)
    results.push({name,state:'initial',data:await evaluate(inspect),support:await evaluate(`(() => {let a=document.querySelector('.support-phone-long'),b=a.parentElement.querySelector('.support-source'),box=e=>{let r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}};return {phone:box(a),source:box(b),article:box(a.parentElement),documentWidth:document.documentElement.scrollWidth,viewport:innerWidth}})()`)})
    await evaluate(`document.querySelectorAll('details').forEach(e=>e.open=true)`)
    await delay(300)
    results.push({name,state:'expanded',data:await evaluate(inspect)})
    await evaluate(`document.querySelector('#view-data-2026').click()`)
    await delay(700)
    results.push({name,state:'dialog',data:await evaluate(inspect)})
  }
  await writeFile(resolve('docs/redesign/auditoria-alvos-independente.json'),JSON.stringify(results,null,2),'utf8')
  for(const r of results) console.log(JSON.stringify({viewport:r.name,state:r.state,targets:r.data.targets,markers:r.data.markers,small:r.data.small.length,conflicts:r.data.small.filter(x=>x.conflicts.length)}))
} finally { socket?.close(); chrome.kill() }
