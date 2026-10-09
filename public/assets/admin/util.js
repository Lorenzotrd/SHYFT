/* Outils partagés du panneau : sélection, échappement, dates, provenance, étapes du suivi. */
export const $ = s => document.querySelector(s);
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));

const DAY = 86400000;
export const daysAgo = n => Date.now() - n * DAY;
const full = new Intl.DateTimeFormat('fr-FR', {day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'});
const day = new Intl.DateTimeFormat('fr-FR', {day: 'numeric', month: 'short'});
const short = new Intl.DateTimeFormat('fr-FR', {weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'});
const valid = iso => { const d = new Date(iso); return isNaN(d) ? null : d; };
export const when = iso => { const d = valid(iso); return d ? full.format(d) : '—'; };
export const whenShort = iso => { const d = valid(iso); return d ? short.format(d) : '—'; };

// « il y a 3 j », « il y a 2 h » : lisible d'un coup d'œil sur une carte.
export function ago(iso) {
 const d = valid(iso);
 if (!d) return '—';
 const minutes = Math.round((Date.now() - d) / 60000);
 if (minutes < 1) return 'à l’instant';
 if (minutes < 60) return `il y a ${minutes} min`;
 const hours = Math.round(minutes / 60);
 if (hours < 24) return `il y a ${hours} h`;
 const days = Math.round(hours / 24);
 return days < 31 ? `il y a ${days} j` : day.format(d);
}

export const isCall = l => l.type === 'rdv';
// Les leviers sont joints par « , » et un nom peut lui-même en contenir une (« SEO, local et GEO ») :
// on ne coupe que devant une majuscule, début de chaque nom de levier.
export const services = l => String(l.services || '').split(/,\s*(?=[A-ZÀ-Ý])/).map(s => s.trim()).filter(Boolean);

export function origin(lead) {
 if (lead.utm_source) return `${lead.utm_source}${lead.utm_medium ? ' · ' + lead.utm_medium : ''}`;
 if (lead.gclid) return 'Google Ads';
 if (lead.referrer) { try { return new URL(lead.referrer).hostname.replace(/^www\./, ''); } catch { return 'Lien externe'; } }
 return 'Direct';
}

// Mêmes valeurs que STAGES dans lib/admin.mjs.
export const STAGES = [
 {id: 'nouveau', label: 'Nouveau', hint: 'À traiter'},
 {id: 'contacte', label: 'Contacté', hint: 'Premier échange fait'},
 {id: 'rdv', label: 'Rendez-vous', hint: 'Appel planifié'},
 {id: 'proposition', label: 'Proposition', hint: 'Devis envoyé'},
 {id: 'gagne', label: 'Gagné', hint: 'Client signé'},
 {id: 'perdu', label: 'Perdu', hint: 'Sans suite'},
];
export const stageOf = l => l.etape || (isCall(l) ? 'rdv' : 'nouveau');
export const stageLabel = id => STAGES.find(s => s.id === id)?.label || id;

// Compte par clé, trié du plus fréquent au moins fréquent.
export function countBy(list, key) {
 const counts = new Map();
 list.forEach(item => [].concat(key(item)).filter(Boolean).forEach(k => counts.set(k, (counts.get(k) || 0) + 1)));
 return [...counts].sort((a, b) => b[1] - a[1]);
}

export function toast(message) {
 const box = $('#toast');
 box.textContent = message;
 box.hidden = false;
 clearTimeout(toast.timer);
 toast.timer = setTimeout(() => { box.hidden = true; }, 2600);
}
