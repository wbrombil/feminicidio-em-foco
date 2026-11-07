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


  await call('Fetch.enable',{patterns:[{urlPattern:'*',requestStage:'Request'}]})
  socket.addEventListener('message', e=>{const m=JSON.parse(e.data);if(m.method==='Fetch.requestPaused'){const u=m.params.request.url;const local=u.startsWith('http://localhost:5173/');call(local?'Fetch.continueRequest':'Fetch.failRequest',local?{requestId:m.params.requestId}:{requestId:m.params.requestId,errorReason:'BlockedByClient'}).catch(()=>{})}})
  await call('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false})
  await call('Page.navigate',{url:'http://localhost:5173/'})
  for(let i=0;i<150;i++){if(await evaluate("document.querySelectorAll('.network-marker-icon').length===82"))break;await delay(200)}
  const snapshot=()=>evaluate(`(()=>({markers:[...document.querySelectorAll('.network-marker-icon')].map(e=>({name:e.getAttribute('aria-label'),role:e.getAttribute('role'),tabindex:e.getAttribute('tabindex'),pressed:e.getAttribute('aria-pressed'),category:e.querySelector('.network-marker-crm')?'crm':e.querySelector('.network-marker-police')?'police-specialized':'unknown',position:e.style.transform})),directory:[...document.querySelectorAll('details.network-directory:not(.case-news) li button')].map(e=>({name:e.querySelector('strong')?.textContent,detail:e.querySelector('span')?.textContent})),filters:[...document.querySelectorAll('.network-filters input')].map(e=>e.checked)}))()`)
  const base=await snapshot()
  const source=JSON.parse(await readFile('src/data/rede-protecao/services.json','utf8'))
  const enrichment=JSON.parse(await readFile('src/data/rede-protecao/contact-enrichments.json','utf8'))
  const records=source.services.map(s=>{let a=enrichment.records.find(x=>x.id===s.id);let coords=a&&Object.hasOwn(a.fields,'coordinates')?a.fields.coordinates:s.coordinates;return {...s,coords}})
  const expected=records.filter(s=>s.coords).map(s=>({name:`${s.category==='crm'?'Centro de Referência da Mulher':'Atendimento policial especializado'}: ${s.name??s.officialType}, ${s.municipality}`,category:s.category,coords:s.coords,id:s.id,directoryName:s.name??`${s.officialType} — ${s.municipality}`,municipality:s.municipality}))
  const missing=expected.filter(s=>!base.markers.some(m=>m.name===s.name&&m.category===s.category))
  const directoryMissing=expected.filter(s=>!base.directory.some(d=>d.name===s.directoryName&&d.detail.startsWith(`${s.municipality} ·`)))
  const duplicateLabels=base.markers.map(x=>x.name).filter((x,i,a)=>a.indexOf(x)!==i)
  const result={url:'http://localhost:5173/',time:new Date().toISOString(),externalRequests:'Bloqueadas via CDP Fetch',baseline:{markers:base.markers.length,directory:base.directory.length,expected:expected.length,filters:base.filters,missing,directoryMissing,duplicateLabels,invalid:base.markers.filter(x=>!x.name||x.role!=='button'||x.tabindex!=='0'||x.pressed!=='false'||x.category==='unknown'||!x.position),coordinatesInvalid:expected.filter(x=>!Array.isArray(x.coords)||x.coords.length!==2||!x.coords.every(Number.isFinite)),records:expected,rendered:base.markers},keyTests:[],filters:[],errors}
  const key=async(name,code,vk)=>{await call('Input.dispatchKeyEvent',{type:'keyDown',key:name,code,windowsVirtualKeyCode:vk,nativeVirtualKeyCode:vk,...(name==='Enter'?{text:'\r',unmodifiedText:'\r'}:{})});await call('Input.dispatchKeyEvent',{type:'keyUp',key:name,code,windowsVirtualKeyCode:vk,nativeVirtualKeyCode:vk});await delay(400)}
  for(const [idx,k,code,vk] of [[0,'Enter','Enter',13],[40,' ','Space',32],[81,'Enter','Enter',13]]){
    await evaluate(`document.querySelectorAll('.network-marker-icon')[${idx}].focus()`)
    const before=await evaluate(`(()=>{let e=document.activeElement;return {label:e.getAttribute('aria-label'),focused:e.matches(':focus'),visible:e.matches(':focus-visible'),outline:getComputedStyle(e.querySelector('.network-marker-shape')).outline}})()`)
    await key(k,code,vk)
    const after=await evaluate(`(()=>({selected:document.querySelector('.network-marker-icon[aria-pressed="true"]')?.getAttribute('aria-label'),panel:document.querySelector('.municipality-panel h3')?.textContent,selectedDirectory:document.querySelector('details.network-directory:not(.case-news) button.is-selected strong')?.textContent}))()`)
    result.keyTests.push({index:idx,key:code,before,after})
    await evaluate(`document.querySelector('.clear-selection')?.click()`);await delay(200)
    await evaluate(`document.querySelector('.clear-selection')?.click()`);await delay(400)
  }
  result.directorySelection=[]
  for (const service of expected) {
    const chosen=await evaluate(`(()=>{const all=[...document.querySelectorAll('details.network-directory:not(.case-news) li button')];const button=all.find(e=>e.querySelector('strong')?.textContent===${JSON.stringify(service.directoryName)}&&e.querySelector('span')?.textContent.startsWith(${JSON.stringify(service.municipality)}));if(!button)return false;button.click();return true})()`)
    await delay(60)
    const selected=await evaluate(`(()=>({panel:document.querySelector('.municipality-panel h3')?.textContent,directory:document.querySelector('details.network-directory:not(.case-news) button.is-selected strong')?.textContent,marker:document.querySelector('.network-marker-icon[aria-pressed="true"]')?.getAttribute('aria-label')}))()`)
    result.directorySelection.push({id:service.id,chosen,ok:chosen&&selected.panel===service.directoryName&&selected.directory===service.directoryName&&selected.marker===service.name,selected})
    await evaluate(`document.querySelector('.clear-selection')?.click()`);await delay(60)
    await evaluate(`document.querySelector('.clear-selection')?.click()`);await delay(60)
  }
  for(const checks of [[true,true],[true,false],[false,true],[false,false]]){
    await evaluate(`(()=>{let inputs=[...document.querySelectorAll('.network-filters input')];${JSON.stringify(checks)}.forEach((v,i)=>{if(inputs[i].checked!==v)inputs[i].click()})})()`);await delay(250)
    const state=await snapshot();result.filters.push({checks,markers:state.markers.length,directory:state.directory.length,categories:[...new Set(state.markers.map(x=>x.category))]})
  }
  await writeFile(join(outputDir,'marcadores-cobertura.json'),JSON.stringify(result,null,2),'utf8')
  console.log(JSON.stringify({markers:base.markers.length,directory:base.directory.length,expected:expected.length,missing:missing.length,directoryMissing:directoryMissing.length,duplicateLabels,invalid:result.baseline.invalid,keys:result.keyTests,directorySelectionFailures:result.directorySelection.filter(x=>!x.ok),filters:result.filters,errors},null,2))
} finally { if(socket)socket.close();chrome.kill() }

