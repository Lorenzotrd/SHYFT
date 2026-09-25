// Alerte email à chaque demande, envoyée par Resend. Sans RESEND_API_KEY, rien n'est envoyé.
// Variables : RESEND_API_KEY (obligatoire), NOTIFY_EMAIL (destinataires séparés par des virgules),
// MAIL_FROM (expéditeur, sur un domaine vérifié dans Resend).
const DEFAULT_TO = 'team@shyftgrowth.com';
const DEFAULT_FROM = 'shyft <demandes@shyftgrowth.com>';
const API = 'https://api.resend.com/emails';

const LIGNES = [
 ['entreprise', 'Entreprise'], ['nom', 'Nom'], ['email', 'Email'], ['tel', 'Téléphone'],
 ['secteur', 'Secteur'], ['site', 'Site'], ['ville', 'Ville'], ['agences', 'Agences ou points de vente'],
 ['services', 'Leviers à auditer'], ['message', 'Message'], ['langue', 'Langue'], ['page', 'Page'],
 ['utm_source', 'Source'], ['utm_medium', 'Support'], ['utm_campaign', 'Campagne'], ['gclid', 'gclid'],
 ['referrer', 'Provenance'], ['receivedAt', 'Reçue le'],
];

const escape = value => String(value).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[c]);

export const notifyReady = () => Boolean(process.env.RESEND_API_KEY);

export function buildEmail(record) {
 const rows = LIGNES.filter(([key]) => record[key]).map(([key, label]) => [label, record[key]]);
 const titre = record.formulaire === 'audit' ? 'Nouvelle demande d’audit' : 'Nouvelle demande';
 // Demande venue du site anglais : signalée dans l'objet, pour répondre en anglais.
 const subject = `${record.langue === 'en' ? '[EN] ' : ''}${titre} · ${record.entreprise || 'sans nom'}`.replace(/[\r\n]+/g, ' ').slice(0, 200);
 const text = `${titre}, à traiter sous 24 h.\n\n${rows.map(([l, v]) => `${l} : ${v}`).join('\n')}\n\nRépondre à cet email écrit directement au prospect.`;
 const html = `<div style="font-family:Arial,sans-serif;font-size:15px;color:#0e0e0c"><p><b>${escape(titre)}</b>, à traiter sous 24 h.</p>`
  + `<table cellpadding="6" style="border-collapse:collapse">${rows.map(([l, v]) => `<tr><td style="color:#696969;vertical-align:top">${escape(l)}</td><td style="white-space:pre-wrap">${escape(v)}</td></tr>`).join('')}</table>`
  + `<p style="color:#696969">Répondre à cet email écrit directement au prospect.</p></div>`;
 return {subject, text, html};
}

// Une alerte qui échoue ne fait jamais échouer la demande : elle est déjà stockée. L'erreur reste dans les journaux Vercel.
export async function notifyLead(record) {
 if (!notifyReady()) return false;
 const to = (process.env.NOTIFY_EMAIL || DEFAULT_TO).split(',').map(s => s.trim()).filter(Boolean);
 const {subject, text, html} = buildEmail(record);
 try {
  const response = await fetch(process.env.RESEND_API_URL || API, {
   method: 'POST',
   headers: {Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json'},
   body: JSON.stringify({from: process.env.MAIL_FROM || DEFAULT_FROM, to, subject, text, html, ...(record.email ? {reply_to: record.email} : {})}),
   signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) { console.error('Alerte email refusée par Resend :', response.status, (await response.text()).slice(0, 300)); return false; }
  return true;
 } catch (error) {
  console.error('Alerte email non envoyée :', error.message);
  return false;
 }
}
