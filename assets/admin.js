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

function stats() {
 const week = leads.filter(l => new Date(l.receivedAt) >= daysAgo(7)).length;
 const month = leads.filter(l => new Date(l.receivedAt) >= daysAgo(30)).length;
 const bySector = {};
 leads.forEach(l => { if (l.secteur) bySector[l.secteur] = (bySector[l.secteur] || 0) + 1; });
 const top = Object.entries(bySector).sort((a, b) => b[1] - a[1])[0];
 const tiles = [
  ['Total', leads.length, 'depuis le début'],
  ['30 derniers jours', month, month === 1 ? 'demande' : 'demandes'],
  ['7 derniers jours', week, week === 1 ? 'demande' : 'demandes'],
  ['Secteur principal', top ? top[0] : '—', top ? `${top[1]} sur ${leads.length}` : 'aucune donnée'],
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
 return leads.filter(l => {
  if (sector && l.secteur !== sector) return false;
  if (period && new Date(l.receivedAt) < daysAgo(period)) return false;
  if (!q) return true;
  return ['nom', 'entreprise', 'email', 'tel', 'site', 'page', 'secteur'].some(k => String(l[k] || '').toLowerCase().includes(q));
 });
}

function render() {
 const rows = visible();
 $('#count').textContent = rows.length === leads.length
  ? `${leads.length} demande${leads.length > 1 ? 's' : ''}`
  : `${rows.length} sur ${leads.length}`;
 $('#empty').hidden = rows.length > 0;
 $('#empty').textContent = leads.length === 0
  ? 'Aucune demande pour l’instant. Elles apparaîtront ici dès le premier envoi du formulaire.'
  : 'Aucune demande ne correspond à ce filtre.';
 $('#rows').innerHTML = rows.map(l => `
  <tr data-id="${esc(l.id)}">
   <td class="col-date">${esc(when(l.receivedAt))}</td>
   <td><b>${esc(l.nom || '—')}</b><i>${esc(l.email || '')}</i>${l.tel ? `<i>${esc(l.tel)}</i>` : ''}</td>
   <td>${esc(l.entreprise || '—')}${l.site ? `<i><a href="${esc(l.site)}" target="_blank" rel="noopener noreferrer">${esc(l.site.replace(/^https?:\/\//, ''))}</a></i>` : ''}</td>
   <td>${esc(l.secteur || '—')}</td>
   <td class="col-page">${esc(l.page || '—')}</td>
   <td>${esc(origin(l))}${l.utm_campaign ? `<i>${esc(l.utm_campaign)}</i>` : ''}</td>
   <td class="col-act"><button class="admin-del" data-del="${esc(l.id)}" title="Effacer cette demande" aria-label="Effacer la demande de ${esc(l.nom || '')}">✕</button></td>
  </tr>`).join('');
}

async function load() {
 const response = await api();
 if (response.status === 401) { token.set(''); show(false); $('#loginError').hidden = false; $('#loginError').textContent = 'Session expirée. Entrez à nouveau le mot de passe.'; return; }
 const data = await response.json().catch(() => ({}));
 if (!response.ok) { $('#empty').hidden = false; $('#empty').textContent = data.error || 'Le panneau est indisponible.'; return; }
 leads = data.leads || [];
 $('#mode').hidden = false;
 $('#mode').textContent = data.mode === 'redis' ? 'Stockage en ligne' : data.mode === 'local' ? 'Stockage local (développement)' : 'Aucun stockage configuré';
 fillSectors(); stats(); render();
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
 const response = await api();
 button.disabled = false; button.textContent = 'Ouvrir le panneau';
 if (response.status === 401) {
  token.set(''); $('#loginError').hidden = false; $('#loginError').textContent = 'Mot de passe incorrect.'; return;
 }
 if (!response.ok) {
  const data = await response.json().catch(() => ({}));
  $('#loginError').hidden = false; $('#loginError').textContent = data.error || 'Le panneau est indisponible.'; return;
 }
 $('#loginError').hidden = true; $('#pass').value = '';
 show(true); await load();
});

$('#logout').addEventListener('click', () => { token.set(''); leads = []; show(false); });
$('#refresh').addEventListener('click', load);
['#search', '#sector', '#period'].forEach(s => $(s).addEventListener('input', render));

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

if (token.get()) { show(true); load(); } else { show(false); }
