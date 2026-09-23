// Vérifie le formulaire de bout en bout : serveur Astro en développement, webhook local factice,
// validation, anti-robot, puis le panneau (mot de passe, liste, CSV).
import http from 'node:http';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';

const PORT = 4174;
let received, mailed, mailAuth;
const hits = [];
// Faux webhook sur /, faux Resend sur /emails.
const mock = http.createServer(async (req, res) => { let raw = ''; for await (const c of req) raw += c; if (req.url === '/emails') { mailed = JSON.parse(raw); mailAuth = req.headers.authorization; } else if (req.url.startsWith('/mp')) hits.push({url: req.url, body: JSON.parse(raw)}); else received = JSON.parse(raw); res.end('{}'); }).listen(4175, '127.0.0.1');
const env = {...process.env, LEAD_WEBHOOK_URL: 'http://127.0.0.1:4175', ADMIN_PASSWORD: 'test-admin', RESEND_API_KEY: 'test-resend', RESEND_API_URL: 'http://127.0.0.1:4175/emails', NOTIFY_EMAIL: '', CAL_WEBHOOK_SECRET: 'test-cal', GA_API_SECRET: 'test-ga', GA_MP_URL: 'http://127.0.0.1:4175/mp'};
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
 // Webhook Cal.com : signature, dédoublonnage, GA4 côté serveur, lignes du panneau.
 const hook = (event, payload, secret = 'test-cal') => { const raw = JSON.stringify({triggerEvent: event, createdAt: new Date().toISOString(), payload}); return fetch(base + '/api/cal-webhook', {method: 'POST', headers: {'Content-Type': 'application/json', 'X-Cal-Signature-256': createHmac('sha256', secret).update(raw).digest('hex')}, body: raw}); };
 const uid = 'test-' + Date.now();
 const booking = {uid, title: 'Appel 30 min', startTime: '2030-01-15T09:00:00Z', type: '30min', attendees: [{name: 'Rdv Test', email: 'rdv@example.com'}], responses: {name: {value: 'Rdv Test'}, email: {value: 'rdv@example.com'}}, metadata: {ga_client_id: '123456789.1700000000', ga_session_id: '1700000001', page: '/expertises/seo', emplacement: 'hero', utm_source: 'google'}};
 assert.equal((await hook('BOOKING_CREATED', booking, 'mauvais')).status, 401, 'signature invalide refusée');
 assert.equal((await fetch(base + '/api/cal-webhook', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: '{}'})).status, 401, 'signature absente refusée');
 assert.equal((await hook('PING', {})).status, 200, 'test de connexion accepté');
 assert.equal(hits.length, 0, 'rien envoyé à GA4 sans réservation');
 assert.equal((await hook('BOOKING_CREATED', booking)).status, 200, 'réservation acceptée');
 assert.equal(hits.length, 1); const hit = hits[0];
 assert.match(hit.url, /measurement_id=G-[A-Z0-9]+&api_secret=test-ga/);
 assert.equal(hit.body.client_id, booking.metadata.ga_client_id, 'client_id du visiteur repris');
 assert.equal(hit.body.events[0].name, 'book_call');
 assert.equal(hit.body.events[0].params.session_id, '1700000001');
 assert.equal(hit.body.events[0].params.emplacement, 'hero');
 assert.equal(hit.body.consent.ad_personalization, 'DENIED');
 assert.equal(JSON.stringify(hit.body).includes('rdv@example.com'), false, 'aucune donnée personnelle vers GA4');
 assert.equal((await (await hook('BOOKING_CREATED', booking)).json()).doublon, true, 'webhook rejoué');
 assert.equal(hits.length, 1, 'réservation comptée une seule fois');
 const anon = {...booking, uid: uid + '-anon', metadata: {page: '/'}};
 await hook('BOOKING_CREATED', anon);
 assert.equal(hits.length, 1, 'sans consentement : rien vers GA4');
 let calls = (await (await admin()).json()).leads.filter(l => l.type === 'rdv' && l.uid.startsWith(uid));
 const row = calls.find(l => l.uid === uid);
 assert.ok(calls.find(l => l.uid === anon.uid), 'rendez-vous sans consentement enregistré'); assert.match(calls.find(l => l.uid === anon.uid).mesure, /non envoyé/);
 assert.equal(row.statut, 'confirmé'); assert.equal(row.nom, 'Rdv Test'); assert.equal(row.rdvAt, booking.startTime); assert.equal(row.utm_source, 'google'); assert.equal(row.ga_client_id, undefined, 'identifiant GA4 non stocké');
 assert.equal((await hook('BOOKING_CANCELLED', {...booking, cancellationReason: 'Empêchement'})).status, 200);
 assert.equal(hits[1].body.events[0].name, 'cancel_call'); assert.equal(hits[1].body.client_id, booking.metadata.ga_client_id);
 await hook('BOOKING_CANCELLED', booking); assert.equal(hits.length, 2, 'annulation comptée une seule fois');
 await hook('BOOKING_CANCELLED', {...anon, uid: uid + '-anon2'}); assert.equal(hits.length, 2, 'annulation sans consentement : rien vers GA4');
 const moved = {...anon, uid: uid + '-moved', rescheduleUid: anon.uid, startTime: '2030-02-01T10:00:00Z'};
 assert.equal((await hook('BOOKING_RESCHEDULED', moved)).status, 200); assert.equal(hits.length, 2, 'report sans événement GA4');
 calls = (await (await admin()).json()).leads.filter(l => l.type === 'rdv' && l.uid.startsWith(uid));
 assert.equal(calls.find(l => l.uid === uid).statut, 'annulé');
 assert.equal(calls.some(l => l.uid === anon.uid), false, 'ancien créneau remplacé');
 assert.equal(calls.find(l => l.uid === moved.uid).reporteDe, anon.startTime);
 for (const l of calls) await admin({method: 'DELETE', query: '?id=' + encodeURIComponent(l.id)});
 console.log(JSON.stringify({formulaire: 'ok', alerte: 'ok', panneau: 'ok', rendez_vous: 'ok', demandes: body.count}));
} finally {
 child.kill(); mock.close();
 // Astro 7 peut laisser tourner le serveur en arrière-plan : on l'arrête explicitement.
 spawn('npx', ['astro', 'dev', 'stop'], {stdio: 'ignore'});
}
