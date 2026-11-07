// Compara builds locais reproduzíveis sem alterar o dist ou instalar pacotes.
import { cp, mkdtemp, mkdir, readFile, writeFile, symlink, readdir, stat } from 'node:fs/promises'
import { spawn, execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { resolve, join, extname } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'

const root=process.cwd(), work=await mkdtemp(join(tmpdir(),'femfoco-comparacao-'))
const original=join(work,'original'), before=join(work,'build-antes'), after=join(work,'build-depois')
await mkdir(original,{recursive:true})
for(const item of ['src','public','package.json','package-lock.json','index.html','vite.config.ts','tsconfig.json','tsconfig.app.json','tsconfig.node.json']) await cp(join(root,item),join(original,item),{recursive:true})
for(const name of ['App.tsx','App.css']) await cp(join(root,'docs/redesign/baseline-2026-11-06',`${name}.original.txt`),join(original,'src',name))
for(const name of ['src/index.css','src/components/map/MapExplorer.css','src/components/news/LatestCaseNews.tsx']) await writeFile(join(original,name),execFileSync('git',['show',`HEAD:${name}`],{cwd:root}))
await symlink(join(root,'node_modules'),join(original,'node_modules'),'junction')
const manifest=JSON.parse(await readFile(join(root,'docs/redesign/baseline-2026-11-06/manifest.json'),'utf8'))
const mismatches=[]
for(const item of manifest.files){const hash=createHash('sha256').update(await readFile(join(original,item.path))).digest('hex').toUpperCase();if(hash!==item.sha256)mismatches.push(item.path)}
if(mismatches.length) throw Error(`Baseline divergente: ${mismatches.join(', ')}`)
const vite=join(root,'node_modules/vite/bin/vite.js')
for(const [source,out] of [[original,before],[root,after]]) execFileSync(process.execPath,[vite,'build',source,'--outDir',out],{cwd:root,stdio:'pipe'})
const files=async (dir,base=dir)=>{let result=[];for(const entry of await readdir(dir,{withFileTypes:true})){const path=join(dir,entry.name);if(entry.isDirectory())result.push(...await files(path,base));else result.push({file:path.substring(base.length+1),bytes:(await stat(path)).size})}return result}
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.geojson':'application/geo+json','.svg':'image/svg+xml','.png':'image/png'}
const serve=async dir=>{const server=createServer(async(req,res)=>{try{const path=new URL(req.url,'http://localhost').pathname;const file=resolve(dir,'.'+decodeURIComponent(path==='/'?'/index.html':path));if(!file.startsWith(resolve(dir)+String.fromCharCode(92))){res.writeHead(403).end();return}const data=await readFile(file);res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data)}catch{res.writeHead(404).end()}});await new Promise(ok=>server.listen(0,'127.0.0.1',ok));return server}
const servers=[await serve(before),await serve(after)], profile=await mkdtemp(join(tmpdir(),'femfoco-perf-chrome-'))
const chrome=spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--disable-background-networking','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'],{windowsHide:true,stdio:'ignore'})
let socket
try{
 let port;for(let i=0;i<100;i++){try{port=(await readFile(join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0];break}catch{await delay(200)}}if(!port)throw Error('Chrome não iniciou')
 const tab=await(await fetch(`http://127.0.0.1:${port}/json/new?about:blank`,{method:'PUT'})).json();socket=new WebSocket(tab.webSocketDebuggerUrl);await new Promise((ok,fail)=>{socket.addEventListener('open',ok,{once:true});socket.addEventListener('error',fail,{once:true})})
 let id=0;const pending=new Map();socket.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);if(m.error)p.reject(Error(m.error.message));else p.resolve(m.result)}})
 const call=(method,params={})=>new Promise((ok,fail)=>{const n=++id;pending.set(n,{resolve:ok,reject:fail});socket.send(JSON.stringify({id:n,method,params}))})
 const evaluate=async expression=>{const r=await call('Runtime.evaluate',{expression,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.text);return r.result.value}
 await Promise.all([call('Page.enable'),call('Runtime.enable'),call('Network.enable')]);await call('Network.setCacheDisabled',{cacheDisabled:true});await call('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false})
 const samples={antes:[],depois:[]}
 for(let i=0;i<15;i++) for(const [index,name] of (i%2?[[1,'depois'],[0,'antes']]:[[0,'antes'],[1,'depois']])){
  const url=`http://127.0.0.1:${servers[index].address().port}/`;await call('Page.navigate',{url})
  let done=false;for(let j=0;j<200;j++){done=await evaluate(`location.href===${JSON.stringify(url)} && document.readyState==='complete' && !!document.querySelector('.map-summary')`);if(done)break;await delay(50)}if(!done)throw Error(`Mapa indisponível ${name}`)
  samples[name].push(await evaluate(`(()=>{const n=performance.getEntriesByType('navigation')[0];return {domContentLoaded:Math.round(n.domContentLoadedEventEnd),load:Math.round(n.loadEventEnd),mapaDisponivel:Math.round(performance.now()),recursos:performance.getEntriesByType('resource').length}})()`))
 }
 const result={baselineManifestFiles:manifest.files.length,baselineMismatches:mismatches,ambiente:'Chrome headless, 1440x900, servidor HTTP local, cache desativado, quinze rodadas alternadas, sem controle de CPU/rede; tempo de mapa inclui intervalo de sondagem',samples,builds:{antes:await files(before),depois:await files(after)},limites:'Medição local exploratória; não representa dispositivos reais nem prova ausência de regressão.'}
 await writeFile(join(root,'docs/redesign/entrega-2026-11-06/desempenho.json'),JSON.stringify(result,null,2),'utf8');console.log(JSON.stringify({work,ambiente:result.ambiente,samples,files:{antes:result.builds.antes.filter(x=>/index-.*\.(css|js)$/.test(x.file)),depois:result.builds.depois.filter(x=>/index-.*\.(css|js)$/.test(x.file))}},null,2))
}finally{socket?.close();chrome.kill();for(const server of servers)server.close()}
