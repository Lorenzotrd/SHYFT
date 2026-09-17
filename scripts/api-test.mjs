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
 // Sans webhook mais avec le stockage local, la demande est conservée : succès légitime.
 delete process.env.LEAD_WEBHOOK_URL;
 const stocke=await call({...data,nom:'Stockage seul'});assert.equal(stocke.code,200);
 // Ni stockage ni webhook : refus explicite, jamais de faux succès.
 process.env.VERCEL='1';
 const off=await call(data);assert.equal(off.code,503);assert.match(off.body.error,/pas encore disponible/);
 delete process.env.VERCEL;
 console.log('API : serveur local et fonction Vercel vérifiés, données invalides refusées, livraison confirmée par webhook local, absence de configuration signalée sans faux succès.');
}finally{child.kill();mock.close()}

// --- Panneau des demandes : stockage, protection, export CSV, suppression ---
{
 const {saveLead, listLeads, deleteLead, storeMode} = await import('../lib/store.mjs');
 const {checkPassword, toCsv} = await import('../lib/admin.mjs');
 const adminHandler = (await import('../api/admin.js')).default;
 const {rm} = await import('node:fs/promises');
 await rm(new URL('../.leads.json', import.meta.url), {force: true});

 assert.equal(storeMode(), 'local', 'le pilote local doit être actif hors Vercel');
 const lead = await saveLead({nom: 'Contrôle', entreprise: 'Test', email: 'a@b.fr', secteur: 'Immobilier',
  page: '/expertises/seo', utm_source: 'google', receivedAt: new Date().toISOString()});
 assert.ok(lead.id, 'un identifiant est attribué');
 assert.equal((await listLeads()).length, 1);

 process.env.ADMIN_PASSWORD = 'mot-de-passe-de-test';
 assert.equal(checkPassword('mauvais'), false);
 assert.equal(checkPassword(''), false);
 assert.equal(checkPassword('mot-de-passe-de-test'), true);

 const appel = async (method, url, auth) => {
  const res = {headers: {}, status(c) {this.code = c; return this}, setHeader(k, v) {this.headers[k] = v},
   json(b) {this.body = b}, send(b) {this.body = b}};
  await adminHandler({method, url, headers: auth ? {authorization: 'Bearer ' + auth} : {}}, res);
  return res;
 };
 assert.equal((await appel('GET', '/api/admin')).code, 401, 'refus sans mot de passe');
 assert.equal((await appel('GET', '/api/admin', 'mauvais')).code, 401, 'refus avec un mauvais mot de passe');
 const ok = await appel('GET', '/api/admin', 'mot-de-passe-de-test');
 assert.equal(ok.code, 200);
 assert.equal(ok.body.count, 1);
 assert.equal((await appel('POST', '/api/admin', 'mot-de-passe-de-test')).code, 405);

 const csv = await appel('GET', '/api/admin?format=csv', 'mot-de-passe-de-test');
 assert.match(csv.headers['Content-Type'], /text\/csv/);
 assert.match(csv.headers['Content-Disposition'], /attachment; filename="shyft-demandes-/);
 assert.ok(csv.body.startsWith('﻿'), 'le CSV commence par la marque d’ordre pour Excel');
 assert.match(csv.body, /"Contrôle"/);

 // Une cellule commençant par un signe égal ne doit pas devenir une formule dans un tableur.
 assert.match(toCsv([{nom: '=1+1', entreprise: 'a"b'}]), /"'=1\+1"/);
 assert.match(toCsv([{nom: '=1+1', entreprise: 'a"b'}]), /"a""b"/);

 assert.equal((await appel('DELETE', '/api/admin?id=' + lead.id, 'mot-de-passe-de-test')).body.ok, true);
 assert.equal((await listLeads()).length, 0);
 assert.equal(await deleteLead('inconnu'), false);

 delete process.env.ADMIN_PASSWORD;
 assert.equal((await appel('GET', '/api/admin', 'peu importe')).code, 503, 'panneau non configuré');
 await rm(new URL('../.leads.json', import.meta.url), {force: true});
 console.log('Panneau : stockage, mot de passe, export CSV protégé contre l’injection de formules et suppression vérifiés.');
}

// --- Limitation des tentatives sur le panneau ---
{
 const {attemptState, noteFailure, noteSuccess, clientKey} = await import('../lib/admin.mjs');
 const ip = '203.0.113.7';
 assert.equal(clientKey({'x-forwarded-for': '203.0.113.7, 10.0.0.1'}), ip, 'la première adresse est retenue');
 assert.equal(attemptState(ip).wait, 0, 'aucune pénalité au départ');
 for (let i = 0; i < 5; i++) noteFailure(ip);
 assert.ok(attemptState(ip).wait > 0, 'le délai grandit après plusieurs échecs');
 for (let i = 0; i < 20; i++) noteFailure(ip);
 assert.equal(attemptState(ip).locked, true, 'blocage au-delà du seuil');
 noteSuccess(ip);
 assert.equal(attemptState(ip).locked, false, 'un succès remet le compteur à zéro');
 console.log('Panneau : délai progressif après échec et blocage temporaire vérifiés.');
}
