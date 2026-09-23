// Événements GA4 envoyés depuis le serveur (Measurement Protocol). Sans GA_API_SECRET, rien n'est envoyé.
// Avec consentement : le client_id du navigateur, transmis par la prise de rendez-vous, rattache l'événement à la visite.
// Sans consentement : identifiant aléatoire à usage unique, jamais stocké ni réutilisé, aucune donnée personnelle.
import {randomInt} from 'node:crypto';

const ENDPOINT = 'https://www.google-analytics.com/mp/collect';
const CLIENT_ID = /^\d{1,20}\.\d{1,20}$/;
const SESSION_ID = /^\d{1,20}$/;

export const gaReady = () => Boolean(process.env.GA_API_SECRET);
export const validClientId = value => typeof value === 'string' && CLIENT_ID.test(value);

// Même forme que l'identifiant posé par gtag.js, sans lien avec aucun visiteur.
const oneTimeClientId = () => `${randomInt(1e9, 2e9)}.${Math.floor(Date.now() / 1000)}`;

export function buildMeasurement({name, params = {}, clientId, sessionId, adsConsent = false}) {
 const consented = validClientId(clientId);
 const eventParams = {...params, consentement: consented ? 'oui' : 'non'};
 if (consented && typeof sessionId === 'string' && SESSION_ID.test(sessionId)) {
  // session_id et engagement_time_msec rattachent l'événement à la session, donc à sa source.
  eventParams.session_id = sessionId;
  eventParams.engagement_time_msec = 1;
 }
 const granted = consented && adsConsent ? 'GRANTED' : 'DENIED';
 return {
  client_id: consented ? clientId : oneTimeClientId(),
  consent: {ad_user_data: granted, ad_personalization: 'DENIED'},
  events: [{name, params: eventParams}],
 };
}

// Un envoi qui échoue ne bloque jamais le traitement : l'erreur reste dans les journaux Vercel.
export async function sendMeasurement(measurementId, event) {
 if (!gaReady() || !measurementId) return false;
 const url = `${process.env.GA_MP_URL || ENDPOINT}?measurement_id=${encodeURIComponent(measurementId)}&api_secret=${encodeURIComponent(process.env.GA_API_SECRET)}`;
 try {
  const response = await fetch(url, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(buildMeasurement(event)), signal: AbortSignal.timeout(6000)});
  if (!response.ok) { console.error('GA4 Measurement Protocol :', response.status); return false; }
  return true;
 } catch (error) {
  console.error('GA4 Measurement Protocol injoignable :', error.message);
  return false;
 }
}
