/* Indicateurs du bandeau et graphiques. Les indicateurs portent sur toutes les lignes, les graphiques sur la sélection filtrée. */
import {$, esc, daysAgo, whenShort, isCall, services, origin, STAGES, stageOf, countBy} from './util.js';

const DAY = 86400000;
const plural = (n, one, many) => `${n} ${n > 1 ? many : one}`;

export function renderKpis(leads) {
 const demandes = leads.filter(l => !isCall(l));
 const inRange = (from, to) => leads.filter(l => { const t = new Date(l.receivedAt); return t >= from && t < to; }).length;
 const month = inRange(daysAgo(30), Date.now() + DAY);
 const before = inRange(daysAgo(60), daysAgo(30));
 const delta = month - before;
 const week = demandes.filter(l => new Date(l.receivedAt) >= daysAgo(7)).length;
 const upcoming = leads.filter(l => isCall(l) && l.statut !== 'annulé' && new Date(l.rdvAt) >= Date.now())
  .sort((a, b) => new Date(a.rdvAt) - new Date(b.rdvAt));
 const todo = demandes.filter(l => stageOf(l) === 'nouveau').length;
 const won = demandes.filter(l => stageOf(l) === 'gagne').length;
 const open = demandes.filter(l => !['gagne', 'perdu'].includes(stageOf(l))).length;
 const rate = demandes.length ? Math.round((won / demandes.length) * 100) : 0;

 const tiles = [
  {label: 'Demandes d’audit', value: demandes.length, note: week ? `dont ${week} cette semaine` : 'aucune cette semaine'},
  {label: '30 derniers jours', value: month, note: `${delta > 0 ? '+' : ''}${delta} vs 30 j précédents`, trend: delta > 0 ? 'up' : delta < 0 ? 'down' : ''},
  {label: 'Rendez-vous à venir', value: upcoming.length, note: upcoming[0] ? `prochain ${whenShort(upcoming[0].rdvAt)}` : 'aucun de prévu'},
  {label: 'Taux de transformation', value: `${rate} %`, note: `${plural(won, 'gagné', 'gagnés')} · ${open} en cours`},
  {label: 'À traiter', value: todo, note: todo ? 'demandes sans réponse' : 'tout est à jour', hot: true},
 ];
 $('#stats').innerHTML = tiles.map(t => `
  <${t.hot ? 'button type="button" data-goto="nouveau"' : 'article'} class="adm-kpi${t.hot ? ' adm-kpi-hot' : ''}">
   <span>${esc(t.label)}</span><strong>${esc(t.value)}</strong>
   <i class="${t.trend ? 'trend-' + t.trend : ''}">${esc(t.note)}</i>
  </${t.hot ? 'button' : 'article'}>`).join('');
}

// Une barre par jour jusqu'à 45 jours, par semaine au-delà.
function buckets(list, period) {
 const first = list.reduce((min, l) => { const t = Date.parse(l.receivedAt); return isNaN(t) ? min : Math.min(min, t); }, Date.now());
 const span = period || Math.max(30, Math.ceil((Date.now() - first) / DAY) + 1);
 const step = span > 45 ? 7 : 1;
 const count = Math.ceil(span / step);
 const end = new Date(); end.setHours(23, 59, 59, 999);
 return Array.from({length: count}, (_, i) => {
  const to = end - (count - 1 - i) * step * DAY;
  const from = to - step * DAY;
  const inside = list.filter(l => { const t = new Date(l.receivedAt); return t > from && t <= to; });
  return {from: new Date(from + 1), step, demandes: inside.filter(l => !isCall(l)).length, rdv: inside.filter(isCall).length};
 });
}

const dayLabel = new Intl.DateTimeFormat('fr-FR', {day: 'numeric', month: 'short'});

function renderActivity(list, period) {
 const data = buckets(list, period);
 const max = Math.max(1, ...data.map(d => d.demandes + d.rdv));
 const every = Math.ceil(data.length / 8);
 $('#activityNote').textContent = data[0]?.step === 7 ? 'par semaine' : 'par jour';
 $('#activity').innerHTML = `
  <div class="adm-legend"><span class="k-demande">Demandes</span><span class="k-rdv">Rendez-vous</span></div>
  <div class="adm-bars" style="--n:${data.length}">
   ${data.map((d, i) => {
    const total = d.demandes + d.rdv;
    const label = `${d.step === 7 ? 'Semaine du ' : ''}${dayLabel.format(d.from)} : ${d.demandes} demande${d.demandes > 1 ? 's' : ''}, ${d.rdv} rendez-vous`;
    return `<div class="adm-bar" title="${esc(label)}" aria-label="${esc(label)}">
     <div class="adm-bar-stack" style="height:${(total / max) * 100}%">
      ${d.rdv ? `<span class="seg-rdv" style="flex:${d.rdv}"></span>` : ''}${d.demandes ? `<span class="seg-demande" style="flex:${d.demandes}"></span>` : ''}
     </div>
     <small>${i % every === 0 ? esc(dayLabel.format(d.from)) : ''}</small>
    </div>`;
   }).join('')}
  </div>`;
}

// Barres horizontales : les plus fréquents, le reste regroupé.
function ranking(target, rows, empty, limit = 6) {
 const box = $(target);
 if (!rows.length) { box.innerHTML = `<p class="adm-none">${esc(empty)}</p>`; return; }
 const top = rows.slice(0, limit);
 const rest = rows.slice(limit).reduce((sum, [, n]) => sum + n, 0);
 const shown = rest ? [...top, ['Autres', rest]] : top;
 const max = Math.max(...shown.map(([, n]) => n));
 box.innerHTML = `<ul class="adm-rank">${shown.map(([label, n]) => `
  <li><div><span>${esc(label)}</span><b>${n}</b></div><i style="width:${(n / max) * 100}%"></i></li>`).join('')}</ul>`;
}

function renderFunnel(list) {
 const counts = Object.fromEntries(countBy(list, stageOf));
 const max = Math.max(1, ...STAGES.map(s => counts[s.id] || 0));
 $('#funnel').innerHTML = `<ul class="adm-funnel">${STAGES.map(s => `
  <li class="st-${s.id}"><button type="button" data-goto="${s.id}"><span>${esc(s.label)}</span><b>${counts[s.id] || 0}</b></button>
  <i style="width:${((counts[s.id] || 0) / max) * 100}%"></i></li>`).join('')}</ul>`;
}

export function renderCharts(list, period) {
 renderActivity(list, period);
 renderFunnel(list);
 ranking('#channels', countBy(list, origin), 'Aucune provenance pour cette sélection.');
 ranking('#sectors', countBy(list.filter(l => !isCall(l)), l => l.secteur), 'Aucun secteur pour cette sélection.');
 ranking('#levers', countBy(list, services), 'Aucun levier demandé pour cette sélection.');
 ranking('#pages', countBy(list, l => l.page), 'Aucune page d’origine pour cette sélection.', 5);
}
