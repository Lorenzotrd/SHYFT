/* Panneau des demandes. Le mot de passe reste dans l'onglet et ne part que dans l'en-tête Authorization. */
const $ = s => document.querySelector(s);
const KEY = 'shyft:admin';
let leads = [];

const token = {
 get: () => { try { return sessionStorage.getItem(KEY) || ''; } catch { return ''; } },
 set: v => { try { v ? sessionStorage.setItem(KEY, v) : sessionStorage.removeItem(KEY); } catch {} },
};

async function api(path = '', options = {}) {
 return fetch('/api/admin' + path, {...options, headers: {Authorization: 'Bearer ' + token.get(), ...(options.headers || {})}});
}

const dateFormat = new Intl.DateTimeFormat('fr-FR', {day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'});
const when = iso => { const d = new Date(iso); return isNaN(d) ? '—' : dateFormat.format(d); };
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
const daysAgo = n => Date.now() - n * 86400000;

function origin(lead) {
 if (lead.utm_source) return `${lead.utm_source}${lead.utm_medium ? ' · ' + lead.utm_medium : ''}`;
 if (lead.gclid) return 'Google Ads';
 if (lead.referrer) { try { return new URL(lead.referrer).hostname.replace(/^www\./, ''); } catch { return 'Lien externe'; } }
 return 'Direct';
}

const isCall = l => l.type === 'rdv';

function stats() {
 const week = leads.filter(l => new Date(l.receivedAt) >= daysAgo(7)).length;
 const month = leads.filter(l => new Date(l.receivedAt) >= daysAgo(30)).length;
 const bySector = {};
 leads.forEach(l => { if (l.secteur) bySector[l.secteur] = (bySector[l.secteur] || 0) + 1; });
 const top = Object.entries(bySector).sort((a, b) => b[1] - a[1])[0];
 const calls = leads.filter(l => isCall(l) && l.statut !== 'annulé' && new Date(l.rdvAt) >= Date.now()).length;
 const tiles = [
  ['Total', leads.length, 'depuis le début'],
  ['30 derniers jours', month, month === 1 ? 'demande' : 'demandes'],
  ['7 derniers jours', week, week === 1 ? 'demande' : 'demandes'],
  ['Secteur principal', top ? top[0] : '—', top ? `${top[1]} sur ${leads.length}` : 'aucune donnée'],
  ['Rendez-vous à venir', calls, calls === 1 ? 'confirmé' : 'confirmés'],
 ];
 $('#stats').innerHTML = tiles.map(([label, value, note]) =>
  `<article class="admin-stat"><span>${esc(label)}</span><strong>${esc(value)}</strong><i>${esc(note)}</i></article>`).join('');
}

function fillSectors() {
 const select = $('#sector'); const current = select.value;
 const list = [...new Set(leads.map(l => l.secteur).filter(Boolean))].sort();
 select.innerHTML = '<option value="">Tous</option>' + list.map(s => `<option>${esc(s)}</option>`).join('');
 select.value = current;
}

function visible() {
 const q = $('#search').value.trim().toLowerCase();
 const sector = $('#sector').value;
 const period = Number($('#period').value);
 const type = $('#type').value;
 return leads.filter(l => {
  if (type === 'rdv' && !isCall(l)) return false;
  if (type === 'demande' && isCall(l)) return false;
  if (sector && l.secteur !== sector) return false;
  if (period && new Date(l.receivedAt) < daysAgo(period)) return false;
  if (!q) return true;
  return ['nom', 'entreprise', 'email', 'tel', 'site', 'page', 'secteur', 'services', 'ville', 'message', 'statut', 'emplacement'].some(k => String(l[k] || '').toLowerCase().includes(q));
 });
}

function render() {
 const rows = visible();
 $('#count').textContent = rows.length === leads.length
  ? `${leads.length} ligne${leads.length > 1 ? 's' : ''}`
  : `${rows.length} sur ${leads.length}`;
 $('#empty').hidden = rows.length > 0;
 $('#empty').textContent = leads.length === 0
  ? 'Aucune demande pour l’instant. Elles apparaîtront ici dès le premier envoi du formulaire.'
  : 'Aucune demande ne correspond à ce filtre.';
 $('#rows').innerHTML = rows.map(l => `
  <tr data-id="${esc(l.id)}">
   <td class="col-date">${esc(when(l.receivedAt))}</td>
   <td><b>${esc(l.nom || '—')}</b><i>${esc(l.email || '')}</i>${l.tel ? `<i>${esc(l.tel)}</i>` : ''}</td>
   ${isCall(l) ? callCells(l) : leadCells(l)}
   <td class="col-page">${esc(l.page || '—')}${l.emplacement ? `<i>${esc(l.emplacement)}</i>` : ''}</td>
   <td>${esc(origin(l))}${l.utm_campaign ? `<i>${esc(l.utm_campaign)}</i>` : ''}</td>
   <td class="col-act"><button class="admin-del" data-del="${esc(l.id)}" title="Effacer cette demande" aria-label="Effacer la demande de ${esc(l.nom || '')}">✕</button></td>
  </tr>`).join('');
}

function leadCells(l) {
 return `<td>${esc(l.entreprise || '—')}${l.site ? `<i><a href="${esc(l.site)}" target="_blank" rel="noopener noreferrer">${esc(l.site.replace(/^https?:\/\//, ''))}</a></i>` : ''}</td>
   <td>${esc(l.secteur || '—')}${l.services ? `<i>${esc(l.services)}</i>` : ''}${l.ville ? `<i>${esc(l.ville)}</i>` : ''}</td>`;
}

// Rendez-vous Cal.com : date du créneau, statut, report éventuel, mesure GA4 avec ou sans consentement.
function callCells(l) {
 return `<td><b>Rendez-vous</b><i>${esc(when(l.rdvAt))}</i>${l.reporteDe ? `<i>reporté, initialement le ${esc(when(l.reporteDe))}</i>` : ''}</td>
   <td>${esc(l.statut || 'confirmé')}${l.motif ? `<i>${esc(l.motif)}</i>` : ''}${l.mesure ? `<i>mesure ${esc(l.mesure)}</i>` : ''}</td>`;
}

// Le panneau ne s'ouvre qu'après une réponse acceptée : un mot de passe refusé
// ou un panneau non configuré ramène toujours à l'écran de connexion.
async function fetchLeads() {
 const response = await api();
 if (response.ok) return {ok: true, data: await response.json()};
 token.set('');
 const data = await response.json().catch(() => ({}));
 return {ok: false, error: data.error || (response.status === 401 ? 'Mot de passe incorrect.' : 'Le panneau est indisponible.')};
}

function fail(message) {
 leads = [];
 show(false);
 $('#loginError').hidden = false;
 $('#loginError').textContent = message;
}

function paint(data) {
 leads = data.leads || [];
 $('#mode').textContent = data.mode === 'redis' ? 'Stockage en ligne'
  : data.mode === 'local' ? 'Stockage local (développement)' : 'Aucun stockage configuré';
 fillSectors(); stats(); render();
}

async function load() {
 const result = await fetchLeads();
 if (!result.ok) return fail(result.error);
 paint(result.data);
}

function show(authenticated) {
 $('#login').hidden = authenticated;
 $('#panel').hidden = !authenticated;
 $('#logout').hidden = !authenticated;
 $('#mode').hidden = !authenticated;
}

$('#loginForm').addEventListener('submit', async event => {
 event.preventDefault();
 const button = event.target.querySelector('button');
 button.disabled = true; button.textContent = 'Vérification…';
 token.set($('#pass').value);
 const result = await fetchLeads();
 button.disabled = false; button.textContent = 'Ouvrir le panneau';
 if (!result.ok) return fail(result.error);
 $('#loginError').hidden = true; $('#pass').value = '';
 show(true); paint(result.data);
});

$('#logout').addEventListener('click', () => { token.set(''); leads = []; show(false); });
$('#refresh').addEventListener('click', load);
['#search', '#type', '#sector', '#period'].forEach(s => $(s).addEventListener('input', render));

$('#export').addEventListener('click', async event => {
 const button = event.currentTarget;
 button.disabled = true;
 const response = await api('?format=csv');
 button.disabled = false;
 if (!response.ok) return;
 const blob = await response.blob();
 const url = URL.createObjectURL(blob);
 const link = document.createElement('a');
 link.href = url;
 link.download = `shyft-demandes-${new Date().toISOString().slice(0, 10)}.csv`;
 document.body.appendChild(link); link.click(); link.remove();
 setTimeout(() => URL.revokeObjectURL(url), 1000);
});

$('#rows').addEventListener('click', async event => {
 const id = event.target.dataset?.del;
 if (!id) return;
 const lead = leads.find(l => l.id === id);
 if (!confirm(`Effacer définitivement la demande de ${lead?.nom || 'ce contact'} ?`)) return;
 const response = await api('?id=' + encodeURIComponent(id), {method: 'DELETE'});
 if (!response.ok) return;
 leads = leads.filter(l => l.id !== id);
 fillSectors(); stats(); render();
});

(async function boot() {
 show(false);
 if (!token.get()) return;
 const result = await fetchLeads();
 if (!result.ok) return fail(result.error);
 show(true); paint(result.data);
})();
