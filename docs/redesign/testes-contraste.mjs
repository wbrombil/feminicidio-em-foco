// Amostragem de texto renderizado via Chrome local; não instala dependências.
import { spawn } from 'node:child_process'
import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'

const profile = await mkdtemp(join(tmpdir(), 'femfoco-contraste-'))
const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', ['--headless=new', '--disable-gpu', '--no-first-run', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { windowsHide:true, stdio:'ignore' })
let socket
try {
  let port
  for (let i=0;i<100;i++) { try { port=(await readFile(join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0]; break } catch { await delay(200) } }
  if (!port) throw Error(`Chrome não iniciou: ${chrome.exitCode}`)
  const page=await (await fetch(`http://127.0.0.1:${port}/json/new?http://localhost:5173/`,{method:'PUT'})).json()
  socket=new WebSocket(page.webSocketDebuggerUrl)
  await new Promise((ok,fail)=>{socket.addEventListener('open',ok,{once:true});socket.addEventListener('error',fail,{once:true})})
  let id=0; const pending=new Map()
  socket.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);if(m.error)p.reject(Error(m.error.message));else p.resolve(m.result)}})
  const call=(method,params={})=>new Promise((ok,fail)=>{const n=++id;pending.set(n,{resolve:ok,reject:fail});socket.send(JSON.stringify({id:n,method,params}))})
  const evaluate=async expression=>{const r=await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.text);return r.result.value}
  await call('Page.enable');await call('Runtime.enable')
  const inspect=`(() => {
    const parse=c=>{const m=c.match(/[\\d.]+/g);return m&&m.length>=3?m.map(Number):null};
    const blend=(f,b)=>{let a=f[3]??1;return [0,1,2].map(i=>f[i]*a+b[i]*(1-a)).concat(1)};
    const lum=c=>{const v=c.slice(0,3).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4});return .2126*v[0]+.7152*v[1]+.0722*v[2]};
    const ratio=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
    const visible=e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return r.width>0&&r.height>0&&s.visibility==='visible'&&s.display!=='none'};
    const path=e=>{let parts=[];while(e&&e.tagName!=='BODY'&&parts.length<5){parts.unshift(e.tagName.toLowerCase()+(e.id?'#'+e.id:'')+(typeof e.className==='string'&&e.className.trim()?'.'+e.className.trim().split(/\\s+/).slice(0,2).join('.') : ''));e=e.parentElement}return parts.join(' > ')};
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n, out=[];
    while(n=walker.nextNode()){let t=n.textContent.trim(),e=n.parentElement;if(!t||!e||!visible(e)||['SCRIPT','STYLE','OPTION'].includes(e.tagName))continue;let s=getComputedStyle(e),fg=parse(s.color);if(!fg)continue;let layers=[],uncertain=[],p=e;
      while(p){let x=getComputedStyle(p),c=parse(x.backgroundColor);if(c&&c[3]!==0)layers.push({color:c,source:path(p)||'body'});if(x.backgroundImage!=='none')uncertain.push('imagem ou gradiente em '+(path(p)||'body'));if(Number(x.opacity)<1)uncertain.push('opacity '+x.opacity+' em '+(path(p)||'body'));p=p.parentElement}
      let bg=[255,255,255,1];for(let i=layers.length-1;i>=0;i--)bg=blend(layers[i].color,bg);let actual=blend(fg,bg),size=parseFloat(s.fontSize),weight=parseInt(s.fontWeight),large=size>=24||(size>=18.6667&&weight>=700),r=ratio(actual,bg),control=e.closest('a,button,summary,label,select,[role=button]');
      out.push({texto:t.slice(0,130),elemento:path(e),controle:control?path(control):null,cor:s.color,fundo:bg.slice(0,3).map(Math.round),camadas:layers.map(x=>x.source),tamanho:size,peso:weight,razao:Math.round(r*1000)/1000,limite:large?3:4.5,abaixo:r<(large?3:4.5),incertezas:uncertain})
    }return out
  })()`
  const results={url:'http://localhost:5173/',metodo:'Nós de texto visíveis no layout completo; cores CSS compostas sobre ancestrais e branco. Imagens, gradientes, elementos sobrepostos, opacidade de grupo, foco, hover e controles nativos exigem revisão manual. Texto desabilitado pode estar isento. Não avalia contraste não textual nem comprova WCAG.',estados:{}}
  for(const [name,width] of [['desktop',1280],['celular',375]]){
    await call('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false})
    await call('Page.navigate',{url:results.url});await delay(3000)
    results.estados[name+'-padrao']=await evaluate(inspect)
    await evaluate(`document.querySelectorAll('details').forEach(e=>e.open=true)`);await delay(400)
    results.estados[name+'-expandido']=await evaluate(inspect)
    await evaluate(`document.querySelector('#view-data-2026')?.click()`);await delay(600)
    results.estados[name+'-dialogo']=await evaluate(inspect)
  }
  await writeFile(resolve('docs/redesign/entrega-2026-11-06/contraste-detalhado.json'),JSON.stringify(results,null,2),'utf8')
  for(const [state,items] of Object.entries(results.estados)){console.log(state, 'textos',items.length,'abaixo',items.filter(x=>x.abaixo).length,'incertos',items.filter(x=>x.incertezas.length).length);console.log(JSON.stringify(items.filter(x=>x.abaixo).slice(0,25),null,2))}
} finally {socket?.close();chrome.kill()}
