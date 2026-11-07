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
  const wait = async (expr) => { for(let i=0;i<100;i++){if(await evaluate(expr))return; await delay(200)} throw Error('Tempo esgotado: '+expr) }
  const change = async (sel,value) => { await evaluate(`(()=>{const s=document.querySelectorAll('.map-controls select')[${sel}];s.value=${JSON.stringify(value)};s.dispatchEvent(new Event('change',{bubbles:true}))})()`); await delay(200) }
  const result={url:'http://localhost:5173/',mapa:[],filtros:[],diretorio:[],anuais:[],erros:errors}
  await call('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false})
  await call('Page.navigate',{url:result.url}); await wait("document.querySelectorAll('.map-controls select')[2]?.options.length>100 && document.querySelectorAll('.network-filters input').length===2")
  const years=await evaluate("[...document.querySelectorAll('.map-controls select')[0].options].map(o=>o.value)")
  for(const year of years){await change(0,year);await wait("!document.querySelectorAll('.map-controls select')[1].disabled");const months=await evaluate("[...document.querySelectorAll('.map-controls select')[1].options].map(o=>({value:o.value,text:o.textContent}))");for(const month of months){await change(1,month.value);result.mapa.push({year,month,summary:await evaluate("document.querySelector('.map-summary')?.innerText")})}}
  await change(0,'2026');await wait("!document.querySelectorAll('.map-controls select')[1].disabled");await change(1,'')
  const options=await evaluate("[...document.querySelectorAll('.map-controls select')[2].options].filter(o=>o.value).map(o=>({value:o.value,text:o.textContent}))");let found={};
  for(const option of options){await change(2,option.value);let info=await evaluate("({count:document.querySelector('.municipality-count')?.innerText,panel:document.querySelector('.municipality-panel')?.innerText})");let k=info.count==='0'?'zero':info.count==='—'?'indisponivel':'positivo';if(!found[k]){await evaluate("document.querySelector('.case-news summary')?.click()");await delay(100);found[k]={option,...info,news:await evaluate("document.querySelector('.case-news')?.innerText")}}if(found.zero&&found.positivo)break}result.municipios=found
  await change(2,'');await evaluate("document.querySelector('.network-directory:not(.case-news) summary').click()")
  for(const states of [[true,true],[false,true],[true,false],[false,false]]){for(let i=0;i<2;i++){await evaluate(`(()=>{let e=document.querySelectorAll('.network-filters input')[${i}];if(e.checked!==${states[i]})e.click()})()`);await delay(100)}result.filtros.push({states,items:await evaluate("[...document.querySelectorAll('.network-directory:not(.case-news) li')].map(e=>e.innerText)")})}
  await evaluate("document.querySelectorAll('.network-filters input').forEach(e=>{if(!e.checked)e.click()})");await delay(200)
  for(const term of ['Coordenadas não confirmadas','Endereço público não informado']){const picked=await evaluate(`(()=>{let b=[...document.querySelectorAll('.network-directory:not(.case-news) button')].find(e=>e.innerText.includes(${JSON.stringify(term)}));if(!b)return null;let text=b.innerText;b.click();return text})()`);await delay(200);result.diretorio.push({term,picked,panel:await evaluate("document.querySelector('.municipality-panel')?.innerText")});await evaluate("document.querySelector('.clear-selection')?.click()") ; await change(2,'')}
  for(const view of [{name:'desktop',width:1280},{name:'mobile',width:375}]){await call('Emulation.setDeviceMetricsOverride',{width:view.width,height:850,deviceScaleFactor:1,mobile:false});await evaluate("document.querySelector('.methodology-history').open=true;document.querySelector('#view-data-2026').click()");await wait("!!document.querySelector('dialog[open] .annual-data-table tbody tr')");const snap=()=>evaluate("(()=>{let d=document.querySelector('dialog[open]');return {pagination:d.querySelector('.annual-data-pagination')?.innerText,rows:[...d.querySelectorAll('tbody tr')].slice(0,2).map(e=>e.innerText),mobileVisible:getComputedStyle(d.querySelector('.annual-data-mobile-list')).display,tableVisible:getComputedStyle(d.querySelector('.annual-data-table-scroll')).display,info:d.querySelector('.annual-data-controls p')?.innerText}})()");await evaluate("(()=>{let e=document.querySelector('dialog[open] input[type=search]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,'');e.dispatchEvent(new Event('input',{bubbles:true}))})()");await delay(150);let a={view:view.name,first:await snap()};await evaluate("document.querySelector('dialog[open] .annual-data-pagination button:last-child').click()");await delay(150);a.next=await snap();for(const value of ['Porto Alegre','zzz inexistente']){await evaluate(`(()=>{let e=document.querySelector('dialog[open] input[type=search]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,${JSON.stringify(value)});e.dispatchEvent(new Event('input',{bubbles:true}))})()`);await delay(150);a[value]=await snap()}result.anuais.push(a);await evaluate("document.querySelector('dialog[open] .annual-dialog-close').click()")}
  await writeFile(join(outputDir,'matriz-dados-2026-11-07.json'),JSON.stringify(result,null,2),'utf8');console.log(JSON.stringify({years,mapa:result.mapa.length,municipios:result.municipios,filtros:result.filtros.map(x=>({states:x.states,count:x.items.length})),diretorio:result.diretorio.map(x=>({term:x.term,picked:x.picked})),anuais:result.anuais,erros:errors},null,2))
} finally {socket?.close();chrome.kill()}
