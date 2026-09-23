// Webhook Cal.com : réservations créées, annulées, reportées. Signature HMAC-SHA256 (hex) du corps brut,
// en-tête X-Cal-Signature-256, secret CAL_WEBHOOK_SECRET. Chaque réservation est enregistrée pour /admin
// et comptée une seule fois dans GA4 (book_call), quel que soit le nombre de livraisons du webhook.
// GA4 ne reçoit rien pour un visiteur qui n'a pas accepté la mesure d'audience : le rendez-vous reste dans /admin.
import {createHmac, timingSafeEqual} from 'node:crypto';
import {getLead, insertLeadOnce, putLead, deleteLead, storeReady} from './store.mjs';
import {sendMeasurement, validClientId} from './ga.mjs';

const MAX_BYTES = 200000;
const MAX_FIELD = 300;
const MAX_PARAM = 100; // limite GA4 pour la valeur d'un paramètre
const SOURCE_KEYS = ['page', 'emplacement', 'utm_source', 'utm_medium', 'utm_campaign', 'gclid', 'referrer'];

const text = (value, max = MAX_FIELD) => (typeof value === 'string' ? value.trim().slice(0, max) : '');
const idFor = uid => `cal-${uid}`;

export function signatureValid(raw, given, secret) {
 if (!secret || typeof given !== 'string' || !/^[0-9a-f]{64}$/i.test(given)) return false;
 const expected = createHmac('sha256', secret).update(raw).digest();
 return timingSafeEqual(expected, Buffer.from(given, 'hex'));
}

function fullName(value) {
 if (typeof value === 'string') return value;
 if (value && typeof value === 'object') return [value.firstName, value.lastName].filter(v => typeof v === 'string').join(' ');
 return '';
}

// Ligne affichée dans /admin : contact, date du rendez-vous, source. Aucun identifiant GA4 n'y est conservé.
export function bookingRecord(payload, now) {
 const attendee = (Array.isArray(payload.attendees) && payload.attendees[0]) || {};
 const responses = payload.responses || {};
 const meta = payload.metadata || {};
 const record = {
  id: idFor(payload.uid), type: 'rdv', uid: payload.uid, statut: 'confirmé',
  nom: text(fullName(responses.name?.value) || attendee.name),
  email: text(responses.email?.value || attendee.email),
  rdvAt: text(payload.startTime, 40), titre: text(payload.title),
  receivedAt: now, formulaire: 'rendez-vous',
  mesure: validClientId(meta.ga_client_id) ? 'GA4, avec consentement' : 'sans consentement, non envoyé à GA4',
 };
 for (const key of SOURCE_KEYS) { const v = text(meta[key]); if (v) record[key] = v; }
 return record;
}

function gaEvent(name, payload, record) {
 const meta = payload.metadata || {};
 const params = {
  emplacement: record.emplacement || '', page_origine: record.page || '',
  source: record.utm_source || '', campagne: record.utm_campaign || '', type_rdv: text(payload.type || payload.eventTypeSlug, MAX_PARAM),
 };
 for (const key of Object.keys(params)) params[key] = String(params[key]).slice(0, MAX_PARAM);
 return {name, params, clientId: meta.ga_client_id, sessionId: meta.ga_session_id, adsConsent: meta.ga_ads === '1'};
}

async function created(payload, now, measurementId) {
 const record = bookingRecord(payload, now);
 if (!(await insertLeadOnce(record))) return {ok: true, doublon: true};
 await sendMeasurement(measurementId, gaEvent('book_call', payload, record));
 return {ok: true};
}

async function cancelled(payload, now, measurementId) {
 const existing = await getLead(idFor(payload.uid));
 if (existing?.statut === 'annulé') return {ok: true, doublon: true};
 const record = {...(existing || bookingRecord(payload, now)), statut: 'annulé', annuleLe: now};
 const reason = text(payload.cancellationReason);
 if (reason) record.motif = reason;
 await putLead(record);
 await sendMeasurement(measurementId, gaEvent('cancel_call', payload, record));
 return {ok: true};
}

// Un report n'est ni une nouvelle réservation ni une annulation : la ligne suit le rendez-vous, sans événement GA4.
async function rescheduled(payload, now) {
 const previousUid = text(payload.rescheduleUid, 100);
 const previous = previousUid ? await getLead(idFor(previousUid)) : null;
 const record = {
  ...(previous || bookingRecord(payload, now)), id: idFor(payload.uid), uid: payload.uid,
  statut: 'confirmé', rdvAt: text(payload.startTime, 40), reporteLe: now,
  reporteDe: previous?.rdvAt || text(payload.rescheduleStartTime, 40),
 };
 await putLead(record);
 if (previous && previous.id !== record.id) await deleteLead(previous.id);
 return {ok: true};
}

const HANDLERS = {BOOKING_CREATED: created, BOOKING_CANCELLED: cancelled, BOOKING_RESCHEDULED: rescheduled};

export async function handleCalWebhook({method, headers, readRaw, measurementId}) {
 const reply = (status, body) => ({status, body});
 if (method !== 'POST') return reply(405, {error: 'Méthode non autorisée.'});
 const secret = process.env.CAL_WEBHOOK_SECRET;
 if (!secret) return reply(503, {error: 'CAL_WEBHOOK_SECRET manquant.'});
 let raw;
 try { raw = await readRaw(); } catch { return reply(400, {error: 'Corps illisible.'}); }
 if (Buffer.byteLength(raw) > MAX_BYTES) return reply(413, {error: 'Corps trop volumineux.'});
 if (!signatureValid(raw, headers['x-cal-signature-256'], secret)) return reply(401, {error: 'Signature invalide.'});
 let data;
 try { data = JSON.parse(raw); } catch { return reply(400, {error: 'JSON invalide.'}); }
 const handler = HANDLERS[data?.triggerEvent];
 // Test de connexion de Cal.com et événements non suivis : accusés sans traitement.
 if (!handler) return reply(200, {ok: true, ignore: String(data?.triggerEvent || '')});
 const payload = data.payload || {};
 if (typeof payload.uid !== 'string' || !payload.uid || payload.uid.length > 100) return reply(400, {error: 'Réservation sans identifiant.'});
 if (!storeReady()) return reply(503, {error: 'Stockage non configuré.'});
 try {
  return reply(200, await handler(payload, new Date().toISOString(), measurementId));
 } catch (error) {
  console.error('Webhook Cal.com :', error.message);
  return reply(500, {error: 'Traitement impossible.'});
 }
}
