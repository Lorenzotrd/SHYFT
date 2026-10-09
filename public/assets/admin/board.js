/* Suivi : colonnes par étape (glisser-déposer) et liste détaillée. Un clic ouvre le brief. */
import {$, esc, ago, when, whenShort, isCall, services, origin, STAGES, stageOf, stageLabel} from './util.js';

function chips(l) {
 const list = services(l);
 const shown = list.slice(0, 2).map(s => `<span>${esc(s)}</span>`).join('');
 return shown + (list.length > 2 ? `<span>+${list.length - 2}</span>` : '');
}

function card(l) {
 const call = isCall(l);
 const cancelled = call && l.statut === 'annulé';
 return `<article class="adm-card${cancelled ? ' is-cancelled' : ''}" draggable="true" tabindex="0" data-id="${esc(l.id)}" aria-label="Ouvrir le brief de ${esc(l.nom || 'ce contact')}">
  <div class="adm-card-top"><span class="pill ${call ? 'pill-rdv' : 'pill-audit'}">${call ? 'Rendez-vous' : l.formulaire === 'audit' ? 'Audit' : 'Demande'}</span><time datetime="${esc(l.receivedAt)}">${esc(ago(l.receivedAt))}</time></div>
  <b>${esc(l.nom || '—')}</b>
  <span class="adm-card-sub">${call ? `${cancelled ? 'Annulé · ' : ''}${esc(whenShort(l.rdvAt))}` : esc(l.entreprise || l.email || '')}</span>
  ${!call && l.secteur ? `<span class="adm-card-sector">${esc(l.secteur)}</span>` : ''}
  ${services(l).length ? `<div class="adm-chips">${chips(l)}</div>` : ''}
  <footer><span>${esc(origin(l))}</span>${l.note ? '<span class="adm-has-note" title="Note interne">Note</span>' : ''}</footer>
 </article>`;
}

export function renderBoard(list) {
 $('#board').innerHTML = STAGES.map(stage => {
  const items = list.filter(l => stageOf(l) === stage.id);
  return `<section class="adm-col st-${stage.id}" data-stage="${stage.id}" aria-label="${esc(stage.label)}">
   <header><span class="adm-dot"></span><h3>${esc(stage.label)}</h3><b>${items.length}</b></header>
   <p>${esc(stage.hint)}</p>
   <div class="adm-col-body">${items.map(card).join('') || '<div class="adm-col-empty">Déposez une carte ici</div>'}</div>
  </section>`;
 }).join('');
}

function cells(l) {
 if (isCall(l)) {
  return `<td><b>Rendez-vous</b><i>${esc(when(l.rdvAt))}</i>${l.reporteDe ? `<i>reporté, initialement le ${esc(when(l.reporteDe))}</i>` : ''}</td>
   <td>${esc(l.statut || 'confirmé')}${l.motif ? `<i>${esc(l.motif)}</i>` : ''}</td>`;
 }
 return `<td><b>${esc(l.entreprise || '—')}</b>${l.site ? `<i>${esc(l.site.replace(/^https?:\/\//, ''))}</i>` : ''}</td>
   <td>${esc(l.secteur || '—')}${l.services ? `<i>${esc(l.services)}</i>` : ''}</td>`;
}

export function renderList(list) {
 $('#rows').innerHTML = list.map(l => `
  <tr tabindex="0" data-id="${esc(l.id)}">
   <td class="col-date">${esc(when(l.receivedAt))}</td>
   <td><b>${esc(l.nom || '—')}</b><i>${esc(l.email || '')}</i>${l.tel ? `<i>${esc(l.tel)}</i>` : ''}</td>
   ${cells(l)}
   <td><span class="stage-pill st-${stageOf(l)}">${esc(stageLabel(stageOf(l)))}</span></td>
   <td>${esc(origin(l))}${l.page ? `<i class="col-page">${esc(l.page)}</i>` : ''}</td>
  </tr>`).join('');
}

// Écouteurs posés une fois : ouverture du brief, glisser-déposer entre colonnes.
export function initBoard({open, move}) {
 const openFrom = event => { const id = event.target.closest('[data-id]')?.dataset.id; if (id) open(id); };
 ['#board', '#rows'].forEach(sel => {
  $(sel).addEventListener('click', openFrom);
  $(sel).addEventListener('keydown', event => { if (event.key === 'Enter' && event.target.matches('[data-id]')) openFrom(event); });
 });

 const board = $('#board');
 board.addEventListener('dragstart', event => {
  const item = event.target.closest('.adm-card');
  if (!item) return;
  event.dataTransfer.setData('text/plain', item.dataset.id);
  event.dataTransfer.effectAllowed = 'move';
  requestAnimationFrame(() => item.classList.add('is-dragging'));
 });
 board.addEventListener('dragend', event => event.target.closest('.adm-card')?.classList.remove('is-dragging'));
 board.addEventListener('dragover', event => {
  const col = event.target.closest('.adm-col');
  if (!col) return;
  event.preventDefault();
  board.querySelectorAll('.is-over').forEach(c => c !== col && c.classList.remove('is-over'));
  col.classList.add('is-over');
 });
 board.addEventListener('dragleave', event => {
  const col = event.target.closest('.adm-col');
  if (col && !col.contains(event.relatedTarget)) col.classList.remove('is-over');
 });
 board.addEventListener('drop', event => {
  const col = event.target.closest('.adm-col');
  if (!col) return;
  event.preventDefault();
  col.classList.remove('is-over');
  const id = event.dataTransfer.getData('text/plain');
  if (id) move(id, col.dataset.stage);
 });
}
