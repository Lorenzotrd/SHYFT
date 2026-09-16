import http from 'node:http';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
let received;
const mock=http.createServer(async(req,res)=>{let raw='';for await(const c of req)raw+=c;received=JSON.parse(raw);res.end('ok')}).listen(4175,'127.0.0.1');
const child=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:'4174',LEAD_WEBHOOK_URL:'http://127.0.0.1:4175'}});
try{await new Promise((resolve,reject)=>{child.stdout.once('data',resolve);child.once('error',reject);child.once('exit',()=>reject(Error('Server exited')))});const send=data=>fetch('http://127.0.0.1:4174/api/lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});assert.equal((await send({})).status,400);const data={nom:'Test local',entreprise:'Test',email:'test@example.com',secteur:'Immobilier'};const good=await send(data);assert.equal(good.status,200);assert.equal((await good.json()).ok,true);assert.equal(received.email,data.email);assert.equal((await send({...data,site:'javascript:alert(1)'})).status,400);console.log('API : données invalides refusées, livraison test confirmée par webhook local, URL invalide refusée.')}finally{child.kill();mock.close()}
