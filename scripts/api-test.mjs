// Vérifie le formulaire de bout en bout : serveur Astro en développement, webhook local factice,
// validation, anti-robot, puis le panneau (mot de passe, liste, CSV).
import http from 'node:http';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';

const PORT = 4174;
let received, mailed, mailAuth;
// Faux webhook sur /, faux Resend sur /emails.
const mock = http.createServer(async (req, res) => { let raw = ''; for await (const c of req) raw += c; if (req.url === '/emails') { mailed = JSON.parse(raw); mailAuth = req.headers.authorization; } else received = JSON.parse(raw); res.end('{}'); }).listen(4175, '127.0.0.1');
const env = {...process.env, LEAD_WEBHOOK_URL: 'http://127.0.0.1:4175', ADMIN_PASSWORD: 'test-admin', RESEND_API_KEY: 'test-resend', RESEND_API_URL: 'http://127.0.0.1:4175/emails', NOTIFY_EMAIL: ''};
const child = spawn('npx', ['astro', 'dev', '--port', String(PORT), '--host', '127.0.0.1', '--ignore-lock'], {env, stdio: ['ignore', 'pipe', 'pipe']});
const base = `http://127.0.0.1:${PORT}`;
const ready = async () => { for (let i = 0; i < 60; i++) { try { if ((await fetch(base + '/robots.txt')).ok) return; } catch {} await new Promise(r => setTimeout(r, 500)); } throw Error('Serveur Astro injoignable'); };
try {
 await ready();
 const send = data => fetch(base + '/api/lead', {method: 'POST', headers: {'Content-Type': 'application/json', Origin: base}, body: JSON.stringify(data)});
 assert.equal((await send({})).status, 400, 'formulaire vide refusé');
 const data = {nom: 'Test local', entreprise: 'Test', email: 'test@example.com', secteur: 'Immobilier'};
 const good = await send(data); if (good.status !== 200) console.error('Réponse inattendue :', good.status, await good.text()); assert.equal(good.status, 200); assert.equal((await good.json()).ok, true); assert.equal(received.email, data.email);
 assert.equal((await send({...data, site: 'javascript:alert(1)'})).status, 400, 'adresse de site invalide refusée');
 assert.equal((await send({website_check: 'bot', ...data})).status, 400, 'robot refusé');
 const audit = {...data, formulaire: 'audit', ville: 'Tours', agences: '2', message: 'Test', services: ['seo', 'google-ads']};
 const okAudit = await send({...audit, site: 'exemple.fr'}); assert.equal(okAudit.status, 200, 'demande d’audit acceptée');
 assert.equal(received.services, 'SEO, local et GEO, Google Ads', 'leviers traduits en noms');
 assert.equal(received.site, 'https://exemple.fr', 'adresse complétée en https');
 assert.equal(mailAuth, 'Bearer test-resend', 'alerte envoyée avec la clé Resend');
 assert.deepEqual(mailed.to, ['team@shyftgrowth.com'], 'alerte envoyée à l’équipe');
 assert.equal(mailed.reply_to, data.email, 'répondre écrit au prospect');
 assert.match(mailed.subject, /Nouvelle demande d’audit · Test/);
 assert.match(mailed.text, /Leviers à auditer : SEO, local et GEO, Google Ads/);
 const injected = await send({...audit, entreprise: '<b>x</b>'}); assert.equal(injected.status, 200); assert.doesNotMatch(mailed.html, /<b>x<\/b>/, 'HTML échappé dans l’alerte');
 assert.equal((await send({...audit, services: []})).status, 400, 'audit sans levier refusé');
 assert.equal((await send({...audit, services: ['inconnu']})).status, 400, 'levier inconnu refusé');
 assert.equal((await send({...audit, services: 'seo'})).status, 400, 'leviers hors liste refusés');
 assert.equal((await fetch(base + '/api/lead')).status, 405, 'GET refusé');
 assert.equal((await fetch(base + '/api/lead', {method: 'POST', headers: {'Content-Type': 'application/json', Origin: 'https://ailleurs.example'}, body: '{}'})).status, 403, 'origine étrangère refusée');
 // Panneau : l'en-tête Origin est exigé par la protection CSRF d'Astro sur DELETE, comme le fait un navigateur.
 const admin = (opts = {}) => fetch(base + '/api/admin' + (opts.query || ''), {method: opts.method || 'GET', headers: {Authorization: 'Bearer ' + (opts.pass ?? 'test-admin'), Origin: base}});
 assert.equal((await admin({pass: 'faux'})).status, 401, 'mauvais mot de passe');
 const list = await admin(); if (list.status !== 200) console.error('Panneau, réponse inattendue :', list.status, (await list.clone().text()).slice(0, 300)); assert.equal(list.status, 200); const body = await list.json(); assert.equal(body.ok, true); assert.ok(body.count >= 1, 'au moins une demande stockée');
 const csv = await admin({query: '?format=csv'}); assert.equal(csv.status, 200); assert.match(csv.headers.get('content-type'), /text\/csv/); assert.match(await csv.text(), /Test local/);
 const del = await admin({method: 'DELETE', query: '?id=' + body.leads[0].id}); assert.equal(del.status, 200);
 console.log(JSON.stringify({formulaire: 'ok', alerte: 'ok', panneau: 'ok', demandes: body.count}));
} finally {
 child.kill(); mock.close();
 // Astro 7 peut laisser tourner le serveur en arrière-plan : on l'arrête explicitement.
 spawn('npx', ['astro', 'dev', 'stop'], {stdio: 'ignore'});
}
