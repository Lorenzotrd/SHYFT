// Serveur local : fichiers statiques et POST /api/lead (même logique que api/lead.js sur Vercel).
import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {handleLead,readStream} from './lib/lead.mjs';
const root=path.dirname(fileURLToPath(import.meta.url));
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.jpg':'image/jpeg','.svg':'image/svg+xml','.json':'application/json','.png':'image/png','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8'};
const pages=['/index.html','/mentions-legales.html','/confidentialite.html','/sitemap.xml','/robots.txt'];
http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/api/lead'){
   const {status,body}=await handleLead({method:req.method,headers:req.headers,readRaw:()=>readStream(req)});
   res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});return res.end(JSON.stringify(body));
  }
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end()}
  const normalized=path.posix.normalize(decodeURIComponent(url.pathname));
  if(!(normalized==='/'||pages.includes(normalized)||/^\/secteurs\/[a-z-]+\.html$/.test(normalized)||/^\/assets\/[a-z0-9.-]+\.(css|js|jpg|svg|png)$/.test(normalized))){res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});return res.end('Page introuvable. Retournez à l’accueil.');}
  const file=path.join(root,normalized==='/'?'index.html':normalized);const info=await stat(file);if(!info.isFile())throw Error();
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:await readFile(file));
 }catch{res.writeHead(404);res.end('Page introuvable.')}
}).listen(Number(process.env.PORT)||4173,'127.0.0.1',()=>console.log('SHYFT : http://localhost:'+(process.env.PORT||4173)));
