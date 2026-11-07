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

  const key = async (name, code, vk) => {
    await call('Input.dispatchKeyEvent', { type:'keyDown', key:name, code, windowsVirtualKeyCode:vk, nativeVirtualKeyCode:vk, ...(name === 'Enter' ? {text:'\r', unmodifiedText:'\r'} : {}) })
    await call('Input.dispatchKeyEvent', { type:'keyUp', key:name, code, windowsVirtualKeyCode:vk, nativeVirtualKeyCode:vk })
    await delay(100)
  }
  const ready = async () => { for (let i=0;i<100;i++) { if (await evaluate("document.readyState==='complete' && !!document.querySelector('.map-summary')")) return; await delay(200) } throw Error('Página não carregou') }
  const state = async () => evaluate(`(() => { let e=document.activeElement, s=getComputedStyle(e); return {tag:e.tagName,id:e.id,text:(e.innerText||e.getAttribute('aria-label')||'').trim().slice(0,100),outline:s.outline,boxShadow:s.boxShadow,focusVisible:e.matches(':focus-visible'),childOutline:e.querySelector('.network-marker-shape') ? getComputedStyle(e.querySelector('.network-marker-shape')).outline : null} })()`)
  const result = { url:'http://localhost:5173/', perfil:'Chrome headless isolado', observacao:'Amostra técnica; não estabelece conformidade WCAG completa. Cores são estimativas das cores CSS opacas; imagens, sobreposições, antialiasing e transparências podem alterar o resultado.', teclado:{}, reflow:{}, contraste:[], alvos:[], erros:errors }
  await call('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false})
  await call('Page.navigate',{url:result.url}); await ready(); await delay(300)
  result.teclado.primeirasTabs=[]
  for(let i=0;i<15;i++){await key('Tab','Tab',9); result.teclado.primeirasTabs.push(await state())}
  result.teclado.percursoAteRodape=[]
  for(let i=0;i<180;i++) {
    await key('Tab','Tab',9)
    const current=await state()
    result.teclado.percursoAteRodape.push(current)
    if(current.text.toLowerCase()==='github') break
  }
  result.teclado.chegouAoRodape=result.teclado.percursoAteRodape.some(item=>item.text.toLowerCase()==='github')
  await evaluate(`document.querySelector('.map-controls select').focus()`)
  result.teclado.anoAntes=await evaluate(`document.activeElement.value`)
  await key('ArrowDown','ArrowDown',40)
  result.teclado.anoDepois=await evaluate(`document.activeElement.value`)
  await evaluate(`document.querySelector('.network-filters input').focus()`)
  result.teclado.filtroAntes=await evaluate(`document.activeElement.checked`)
  await key(' ','Space',32)
  result.teclado.filtroDepois=await evaluate(`document.activeElement.checked`)
  await evaluate(`document.querySelector('.education-topic summary').focus()`)
  result.teclado.detalheAntes=await evaluate(`document.activeElement.parentElement.open`)
  await key('Enter','Enter',13)
  result.teclado.detalheDepois=await evaluate(`document.activeElement.parentElement.open`)
  await evaluate(`document.querySelector('.methodology-history').open=true; document.querySelector('#view-data-2026').focus()`)
  await key('Enter','Enter',13)
  await delay(500)
  result.teclado.dialogoAberto=await evaluate(`!!document.querySelector('dialog[open]')`)
  result.teclado.focoDialogo=await state()
  await key('Escape','Escape',27)
  result.teclado.dialogoAposEscape=await evaluate(`({aberto:!!document.querySelector('dialog[open]'),foco:document.activeElement.id})`)
  for (const [nome, width] of [['320px',320],['zoom200_equivalente_largura',640],['zoom400_equivalente_largura',320]]) {
    await call('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false}); await delay(200)
    result.reflow[nome]=await evaluate(`(() => ({viewport:innerWidth,larguraDocumento:document.documentElement.scrollWidth,elementosExcedentes:[...document.querySelectorAll('body *')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.left < -1 || r.right > innerWidth+1)&&getComputedStyle(e).position!=='fixed'}).slice(0,20).map(e=>({tag:e.tagName,classe:String(e.className).slice(0,100),largura:Math.round(e.getBoundingClientRect().width)}))}))()`)
  }
  await call('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false}); await delay(200)
  result.contraste=await evaluate(`(() => {
    const selectors=['body','.intro h1','.statement p','.map-summary','.map-controls label','.map-controls select','.network-filters label','.education-topic summary','.site-footer','button','a'];
    const parse=c=>{let x=c.match(/[0-9.]+/g)?.map(Number);return x&&x.length>=3?x:null};
    const lum=a=>{let v=a.slice(0,3).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4});return .2126*v[0]+.7152*v[1]+.0722*v[2]};
    return selectors.map(sel=>{let e=document.querySelector(sel);if(!e)return {selector:sel,ausente:true};let s=getComputedStyle(e), bg=e;while(bg && (parse(getComputedStyle(bg).backgroundColor)?.[3]??1)===0) bg=bg.parentElement;let bc=bg?getComputedStyle(bg).backgroundColor:'rgb(255,255,255)', f=parse(s.color),b=parse(bc),ratio=f&&b?(Math.max(lum(f),lum(b))+.05)/(Math.min(lum(f),lum(b))+.05):null;return {selector:sel,texto:(e.innerText||e.value||'').trim().slice(0,80),cor:s.color,fundo:bc,origemFundo:bg?.tagName+'.'+bg?.className,tamanho:s.fontSize,peso:s.fontWeight,razao:ratio&&Math.round(ratio*100)/100}})
  })()`)
  result.alvos=await evaluate(`([...document.querySelectorAll('button,select,input[type=checkbox],summary,a')].filter(e=>{let r=e.getBoundingClientRect();return r.width>0&&r.height>0}).map(e=>{let r=e.getBoundingClientRect();return {tag:e.tagName,texto:(e.innerText||e.getAttribute('aria-label')||e.id||'').trim().slice(0,60),largura:Math.round(r.width),altura:Math.round(r.height)}}).filter(x=>x.largura<24||x.altura<24).slice(0,40))`)
  await call('Accessibility.enable')
  const tree = await call('Accessibility.getFullAXTree')
  result.arvoreAcessibilidade = { observation:'Árvore AX do Chrome; não substitui leitor de tela.', namedNodes: tree.nodes.filter(n => !n.ignored && n.name?.value && ['navigation','main','heading','button','combobox','checkbox'].includes(n.role?.value)).map(n => ({role:n.role.value,name:n.name.value})), ignoredCount:tree.nodes.filter(n=>n.ignored).length }
  await writeFile(join(outputDir,'testes-acessibilidade.json'),JSON.stringify(result,null,2),'utf8')
  console.log(JSON.stringify(result,null,2))
} finally { socket?.close(); chrome.kill() }


