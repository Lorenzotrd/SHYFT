// Vérifie la logique partagée via le serveur local et via la fonction Vercel, avec un webhook local.
import http from 'node:http';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
import handler from '../api/lead.js';
let received;
const mock=http.createServer(async(req,res)=>{let raw='';for await(const c of req)raw+=c;received=JSON.parse(raw);res.end('ok')}).listen(4175,'127.0.0.1');
process.env.LEAD_WEBHOOK_URL='http://127.0.0.1:4175';
const child=spawn(process.execPath,['scripts/dev-server.mjs'],{env:{...process.env,PORT:'4174'}});
try{
 await new Promise((resolve,reject)=>{child.stdout.once('data',resolve);child.once('error',reject);child.once('exit',()=>reject(Error('Server exited')))});
 const send=data=>fetch('http://127.0.0.1:4174/api/lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
 assert.equal((await send({})).status,400);
 const data={nom:'Test local',entreprise:'Test',email:'test@example.com',secteur:'Immobilier'};
 const good=await send(data);assert.equal(good.status,200);assert.equal((await good.json()).ok,true);assert.equal(received.email,data.email);
 assert.equal((await send({...data,site:'javascript:alert(1)'})).status,400);
 // Fonction Vercel appelée directement, corps pré-analysé comme le fait Vercel.
 const call=async(body,method='POST')=>{const res={headers:{},status(c){this.code=c;return this},setHeader(k,v){this.headers[k]=v},json(b){this.body=b}};await handler({method,headers:{'content-type':'application/json',host:'shyft.test'},body},res);return res};
 received=undefined;const ok=await call({...data,nom:'Test Vercel'});assert.equal(ok.code,200);assert.equal(ok.body.ok,true);assert.equal(received.nom,'Test Vercel');
 assert.equal((await call({website_check:'bot',...data})).code,400);
 assert.equal((await call(data,'GET')).code,405);
 delete process.env.LEAD_WEBHOOK_URL;const off=await call(data);assert.equal(off.code,503);assert.match(off.body.error,/pas encore disponible/);
 console.log('API : serveur local et fonction Vercel vérifiés, données invalides refusées, livraison confirmée par webhook local, absence de configuration signalée sans faux succès.');
}finally{child.kill();mock.close()}
