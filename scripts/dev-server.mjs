// Serveur local uniquement (npm run dev) : fichiers statiques et POST /api/lead, même logique que api/lead.js sur Vercel.
// Volontairement hors de la racine : un server.mjs à la racine est déployé par Vercel comme application Node.
import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {handleLead,readStream} from '../lib/lead.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.jpg':'image/jpeg','.svg':'image/svg+xml','.json':'application/json','.png':'image/png','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8'};
const ASSET=/^\/assets\/[a-z0-9.-]+\.(css|js|jpg|svg|png)$/;
const FILE=/^\/(sitemap\.xml|robots\.txt)$/;
const PAGE=/^\/(?:[a-z0-9-]+(?:\/[a-z0-9-]+)?)?$/;
// Adresses sans extension : /expertises/seo sert expertises/seo.html, comme cleanUrls sur Vercel.
async function resolve(n){
 if(ASSET.test(n)||FILE.test(n))return path.join(root,n);
 if(!PAGE.test(n))return null;
 const base=n==='/'?'/index':n.replace(/\/$/,'');
 for(const candidate of [base+'.html',base+'/index.html']){
  const file=path.join(root,candidate);
  try{if((await stat(file)).isFile())return file}catch{}
 }
 return null;
}
http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/api/lead'){
   const {status,body}=await handleLead({method:req.method,headers:req.headers,readRaw:()=>readStream(req)});
   res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});return res.end(JSON.stringify(body));
  }
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end()}
  const normalized=path.posix.normalize(decodeURIComponent(url.pathname));
  const file=await resolve(normalized);
  if(!file){res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});return res.end('Page introuvable. Retournez à l’accueil.')}
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff'});
  res.end(req.method==='HEAD'?undefined:await readFile(file));
 }catch{res.writeHead(404);res.end('Page introuvable.')}
}).listen(Number(process.env.PORT)||4173,'127.0.0.1',()=>console.log('SHYFT : http://localhost:'+(process.env.PORT||4173)));
