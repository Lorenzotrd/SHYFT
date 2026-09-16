import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.jpg':'image/jpeg','.svg':'image/svg+xml','.json':'application/json','.png':'image/png','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8'};
async function sendLead(data){
  if(!process.env.LEAD_WEBHOOK_URL)throw new Error('NOT_CONFIGURED');
  const response=await fetch(process.env.LEAD_WEBHOOK_URL,{method:'POST',headers:{'Content-Type':'application/json',...(process.env.LEAD_WEBHOOK_TOKEN?{Authorization:`Bearer ${process.env.LEAD_WEBHOOK_TOKEN}`}:{})},body:JSON.stringify({...data,source:'shyft-site',receivedAt:new Date().toISOString()}),signal:AbortSignal.timeout(10000)});
  if(!response.ok)throw new Error('DELIVERY_FAILED');
}
http.createServer(async(req,res)=>{
 const json=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data))};
 try{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/api/lead'){
   if(req.method!=='POST')return json(405,{error:'Méthode non autorisée.'});
   if(req.headers.origin&&new URL(req.headers.origin).host!==req.headers.host)return json(403,{error:'Origine non autorisée.'});
   if(!req.headers['content-type']?.includes('application/json'))return json(415,{error:'Format invalide.'});
   let raw='';for await(const chunk of req){raw+=chunk;if(Buffer.byteLength(raw)>12000)return json(413,{error:'Formulaire trop volumineux.'})}
   let data;try{data=JSON.parse(raw)}catch{return json(400,{error:'Formulaire invalide.'})}
   if(!data||typeof data!=='object'||Array.isArray(data))return json(400,{error:'Formulaire invalide.'});
   const clean={};for(const key of ['nom','entreprise','secteur','email','site','tel','website_check']){if(data[key]!==undefined&&typeof data[key]!=='string')return json(400,{error:'Champs invalides.'});clean[key]=(data[key]||'').trim();if(clean[key].length>500)return json(400,{error:'Un champ est trop long.'})}
   if(clean.website_check)return json(400,{error:'Formulaire invalide.'});delete clean.website_check;
   if(!clean.nom||!clean.entreprise||!clean.secteur||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email))return json(400,{error:'Renseignez votre nom, votre entreprise, votre secteur et un email valide.'});
   if(clean.site){try{if(!['http:','https:'].includes(new URL(clean.site).protocol))throw Error()}catch{return json(400,{error:'Indiquez une adresse de site valide, commençant par https://.'})}}
   try{await sendLead(clean);return json(200,{ok:true})}catch(e){return json(503,{error:e.message==='NOT_CONFIGURED'?'Le service de demande d’audit n’est pas encore disponible. Votre demande n’a pas été envoyée.':'L’envoi a échoué. Veuillez réessayer dans un instant.'})}
  }
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end()}
  const decoded=decodeURIComponent(url.pathname);const normalized=path.posix.normalize(decoded);
  if(!(normalized==='/'||['/index.html','/mentions-legales.html','/confidentialite.html','/sitemap.xml','/robots.txt'].includes(normalized)||/^\/secteurs\/[a-z-]+\.html$/.test(normalized)||/^\/assets\/[a-z0-9.-]+\.(css|js|jpg|svg|png)$/.test(normalized))){res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});return res.end('Page introuvable. Retournez à l’accueil.');}
  let file=path.join(root,normalized==='/'?'index.html':normalized);const info=await stat(file);if(!info.isFile())throw Error();res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:await readFile(file));
 }catch{res.writeHead(404);res.end('Page introuvable.')}
}).listen(Number(process.env.PORT)||4173,'127.0.0.1',()=>console.log('SHYFT : http://localhost:'+(process.env.PORT||4173)));
