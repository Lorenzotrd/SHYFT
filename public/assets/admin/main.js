/* Panneau des demandes. Le mot de passe reste dans l'onglet et ne part que dans l'en-tête Authorization. */
import {$, esc, daysAgo, isCall, stageOf, toast} from './util.js';
import {renderKpis, renderCharts} from './insights.js';
import {renderBoard, renderList, initBoard} from './board.js';
import {openBrief, closeBrief, briefId, initBrief} from './brief.js';

const KEY = 'shyft:admin';
const VIEW_KEY = 'shyft:admin-view';
let leads = [];

const store = (area, key) => ({
 get: () => { try { return area().getItem(key) || ''; } catch { return ''; } },
 set: v => { try { v ? area().setItem(key, v) : area().removeItem(key); } catch {} },
});
const token = store(() => sessionStorage, KEY);
const viewPref = store(() => localStorage, VIEW_KEY);

async function api(path = '', options = {}) {
 return fetch('/api/admin' + path, {...options, headers: {Authorization: 'Bearer ' + token.get(), ...(options.headers || {})}});
}

function fillSectors() {
 const select = $('#sector'); const current = select.value;
 const list = [...new Set(leads.map(l => l.secteur).filter(Boolean))].sort();
 select.innerHTML = '<option value="">Tous</option>' + list.map(s => `<option>${esc(s)}</option>`).join('');
 select.value = list.includes(current) ? current : '';
}

const SEARCHED = ['nom', 'entreprise', 'email', 'tel', 'site', 'page', 'secteur', 'services', 'ville', 'message', 'statut', 'emplacement', 'note', 'utm_campaign'];

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
  return !q || SEARCHED.some(k => String(l[k] || '').toLowerCase().includes(q));
 });
}

function render() {
 const rows = visible();
 $('#count').textContent = rows.length === leads.length
  ? `${leads.length} ligne${leads.length > 1 ? 's' : ''}`
  : `${rows.length} sur ${leads.length}`;
 renderKpis(leads);
 renderCharts(rows, Number($('#period').value));
 renderBoard(rows);
 renderList(rows);
 const listView = $('#viewList').getAttribute('aria-selected') === 'true';
 $('#empty').hidden = !listView || rows.length > 0;
 $('#empty').textContent = leads.length === 0
  ? 'Aucune demande pour l’instant. Elles apparaîtront ici dès le premier envoi du formulaire.'
  : 'Aucune demande ne correspond à ce filtre.';
}

function setView(view) {
 const list = view === 'list';
 $('#viewBoard').setAttribute('aria-selected', String(!list));
 $('#viewList').setAttribute('aria-selected', String(list));
 $('#board').hidden = list;
 $('#boardHint').hidden = list;
 $('#list').hidden = !list;
 viewPref.set(view);
 render();
}

// Remplace une ligne sans toucher au tableau d'origine.
const replaceLead = lead => { leads = leads.map(l => (l.id === lead.id ? lead : l)); };

async function save(id, patch) {
 const response = await api('?id=' + encodeURIComponent(id), {method: 'PATCH', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(patch)});
 const data = await response.json().catch(() => ({}));
 if (!response.ok) { toast(data.error || 'Enregistrement impossible.'); return null; }
 replaceLead(data.lead);
 render();
 return data.lead;
}

async function remove(id) {
 const response = await api('?id=' + encodeURIComponent(id), {method: 'DELETE'});
 if (!response.ok) { toast('Suppression impossible.'); return false; }
 leads = leads.filter(l => l.id !== id);
 fillSectors(); render();
 return true;
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

const clock = new Intl.DateTimeFormat('fr-FR', {hour: '2-digit', minute: '2-digit'});

function paint(data) {
 leads = data.leads || [];
 $('#mode').textContent = data.mode === 'redis' ? 'Stockage en ligne'
  : data.mode === 'local' ? 'Stockage local (développement)' : 'Aucun stockage configuré';
 $('#updated').textContent = `Demandes et rendez-vous · à jour à ${clock.format(new Date())}`;
 fillSectors(); render();
 const fromHash = decodeURIComponent(location.hash.slice(1));
 const open = briefId() || fromHash;
 if (open) { const lead = leads.find(l => l.id === open); lead ? openBrief(lead) : closeBrief(); }
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
 if (!authenticated) closeBrief();
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
$('#refresh').addEventListener('click', async event => {
 event.currentTarget.disabled = true;
 await load();
 event.currentTarget.disabled = false;
 toast('Données actualisées.');
});
['#search', '#type', '#sector', '#period'].forEach(s => $(s).addEventListener('input', render));
document.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => setView(b.dataset.view)));

// « À traiter » et le graphique du suivi mènent à la colonne correspondante.
$('#panel').addEventListener('click', event => {
 const stage = event.target.closest('[data-goto]')?.dataset.goto;
 if (!stage) return;
 setView('board');
 const col = document.querySelector(`.adm-col[data-stage="${stage}"]`);
 col?.scrollIntoView({behavior: 'smooth', block: 'center', inline: 'center'});
 col?.classList.add('is-flash');
 setTimeout(() => col?.classList.remove('is-flash'), 1200);
});

$('#export').addEventListener('click', async event => {
 const button = event.currentTarget;
 button.disabled = true;
 const response = await api('?format=csv');
 button.disabled = false;
 if (!response.ok) return toast('Export impossible.');
 const blob = await response.blob();
 const url = URL.createObjectURL(blob);
 const link = document.createElement('a');
 link.href = url;
 link.download = `shyft-demandes-${new Date().toISOString().slice(0, 10)}.csv`;
 document.body.appendChild(link); link.click(); link.remove();
 setTimeout(() => URL.revokeObjectURL(url), 1000);
});

const find = id => leads.find(l => l.id === id);
initBoard({
 open: id => openBrief(find(id)),
 move: (id, stage) => { const lead = find(id); if (lead && stage !== stageOf(lead)) save(id, {etape: stage}); },
});
initBrief({
 save, remove, find,
 related: lead => (lead.email ? leads.filter(l => l.id !== lead.id && l.email && l.email.toLowerCase() === lead.email.toLowerCase()) : []),
});

(async function boot() {
 show(false);
 if (viewPref.get() === 'list') setView('list');
 if (!token.get()) return;
 const result = await fetchLeads();
 if (!result.ok) return fail(result.error);
 show(true); paint(result.data);
})();
