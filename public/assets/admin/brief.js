/* Brief d'une demande : tout ce que le prospect a envoyé, sa provenance, le suivi (étape, note) et l'historique du contact. */
import {$, esc, when, isCall, services, origin, STAGES, stageOf, stageLabel, toast} from './util.js';

let current = null;
let returnFocus = null;
let handlers = {};

const safeUrl = url => { try { return ['http:', 'https:'].includes(new URL(url).protocol) ? url : ''; } catch { return ''; } };
const phone = tel => String(tel || '').replace(/[^\d+]/g, '');

// Lignes « libellé : valeur », seulement celles qui ont une valeur.
function rows(pairs) {
 const filled = pairs.filter(([, value]) => value);
 return filled.length ? `<dl class="adm-dl">${filled.map(([label, value]) => `<div><dt>${esc(label)}</dt><dd>${value}</dd></div>`).join('')}</dl>` : '';
}

function needs(l) {
 if (isCall(l)) {
  return rows([
   ['Créneau', esc(when(l.rdvAt))], ['Statut', esc(l.statut || 'confirmé')], ['Objet', esc(l.titre)],
   ['Reporté', l.reporteDe ? `initialement le ${esc(when(l.reporteDe))}` : ''], ['Annulé le', l.annuleLe ? esc(when(l.annuleLe)) : ''],
   ['Motif', esc(l.motif)], ['Mesure', esc(l.mesure)],
  ]);
 }
 const levers = services(l);
 return rows([
  ['Secteur', esc(l.secteur)], ['Ville', esc(l.ville)], ['Agences', esc(l.agences)],
  ['Leviers', levers.length ? `<div class="adm-chips">${levers.map(s => `<span>${esc(s)}</span>`).join('')}</div>` : ''],
 ]) + (l.message ? `<blockquote class="adm-quote">${esc(l.message)}</blockquote>` : '');
}

function provenance(l) {
 return rows([
  ['Canal', esc(origin(l))], ['Page', l.page ? `<code>${esc(l.page)}</code>` : ''], ['Bouton', esc(l.emplacement)],
  ['Campagne', esc(l.utm_campaign)], ['Support', esc(l.utm_medium)], ['Google Ads', l.gclid ? 'clic identifié (gclid)' : ''],
  ['Provenance', esc(l.referrer)], ['Première visite', l.firstSeen ? esc(when(l.firstSeen)) : ''],
  ['Langue', l.langue === 'en' ? 'anglais' : l.langue ? 'français' : ''],
 ]) || '<p class="adm-none">Aucune information de provenance.</p>';
}

function contactHistory(related) {
 if (!related.length) return '';
 return `<section class="adm-brief-sec"><h3>Ce contact a aussi</h3><ul class="adm-history">${related.map(r => `
  <li><button type="button" data-open="${esc(r.id)}"><b>${isCall(r) ? `Rendez-vous ${esc(when(r.rdvAt))}` : `Demande · ${esc(r.entreprise || r.secteur || '')}`}</b>
  <span>reçue le ${esc(when(r.receivedAt))} · ${esc(stageLabel(stageOf(r)))}</span></button></li>`).join('')}</ul></section>`;
}

function render(l, related) {
 const call = isCall(l);
 const site = safeUrl(l.site);
 const stage = stageOf(l);
 return `
  <header class="adm-brief-head">
   <div><span class="pill ${call ? 'pill-rdv' : 'pill-audit'}">${call ? 'Rendez-vous' : l.formulaire === 'audit' ? 'Demande d’audit' : 'Demande'}</span>
   <time>reçue le ${esc(when(l.receivedAt))}</time></div>
   <button type="button" class="adm-close" data-close aria-label="Fermer le brief">✕</button>
  </header>
  <h2 id="briefName">${esc(l.nom || 'Sans nom')}</h2>
  <p class="adm-brief-sub">${esc([l.entreprise, l.email, l.tel].filter(Boolean).join(' · '))}</p>
  <div class="adm-brief-actions">
   ${l.email ? `<a class="btn btn-lime" href="mailto:${esc(l.email)}?subject=${encodeURIComponent(l.langue === 'en' ? 'Your SHYFT Growth audit' : 'Votre audit SHYFT Growth')}">Écrire</a>` : ''}
   ${phone(l.tel) ? `<a class="btn btn-ghost" href="tel:${esc(phone(l.tel))}">Appeler</a>` : ''}
   ${site ? `<a class="btn btn-ghost" href="${esc(site)}" target="_blank" rel="noopener noreferrer">Voir le site ↗</a>` : ''}
   <button type="button" class="btn btn-ghost" data-copy>Copier le brief</button>
  </div>

  <section class="adm-brief-sec"><h3>Suivi</h3>
   <div class="adm-stages" role="radiogroup" aria-label="Étape du suivi">${STAGES.map(s => `
    <button type="button" role="radio" aria-checked="${s.id === stage}" class="st-${s.id}" data-stage="${s.id}">${esc(s.label)}</button>`).join('')}</div>
   <label class="adm-note-field">Note interne<textarea id="briefNote" rows="4" maxlength="2000" placeholder="Prochaine étape, budget évoqué, interlocuteur…">${esc(l.note || '')}</textarea></label>
   <div class="adm-note-bar"><span>${l.suiviLe ? `Mis à jour le ${esc(when(l.suiviLe))}` : 'Pas encore de suivi'}</span><button type="button" class="btn btn-ghost" data-save-note>Enregistrer la note</button></div>
  </section>

  <section class="adm-brief-sec"><h3>${call ? 'Le rendez-vous' : 'Le brief'}</h3>${needs(l) || '<p class="adm-none">Le formulaire ne contenait pas de détail.</p>'}</section>
  <section class="adm-brief-sec"><h3>D’où vient la demande</h3>${provenance(l)}</section>
  ${contactHistory(related)}
  <footer class="adm-brief-foot"><button type="button" class="adm-danger" data-delete>Effacer définitivement cette demande</button></footer>`;
}

// Texte brut à coller dans un email, un CRM ou une note. Une ligne n'apparaît que si la valeur existe.
function plain(l) {
 const line = (value, text) => (value ? text : null);
 return [
  `${isCall(l) ? 'Rendez-vous' : 'Demande'} · ${l.nom || ''}${l.entreprise ? ' · ' + l.entreprise : ''}`,
  `Reçue le ${when(l.receivedAt)}`, '',
  line(l.email, `Email : ${l.email}`), line(l.tel, `Téléphone : ${l.tel}`), line(l.site, `Site : ${l.site}`),
  line(l.secteur, `Secteur : ${l.secteur}`), line(l.ville, `Ville : ${l.ville}`), line(l.agences, `Agences : ${l.agences}`),
  line(l.services, `Leviers : ${l.services}`), line(isCall(l), `Créneau : ${when(l.rdvAt)} (${l.statut || 'confirmé'})`),
  line(l.message, `\nMessage :\n${l.message}\n`),
  `Canal : ${origin(l)}`, line(l.page, `Page : ${l.page}`), line(l.utm_campaign, `Campagne : ${l.utm_campaign}`),
  `Étape : ${stageLabel(stageOf(l))}`, line(l.note, `Note : ${l.note}`),
 ].filter(text => text !== null).join('\n');
}

export function openBrief(lead) {
 if (!lead) return;
 if (!current) returnFocus = document.activeElement;
 current = lead;
 $('#briefBody').innerHTML = render(lead, handlers.related(lead));
 $('#brief').hidden = false;
 $('#scrim').hidden = false;
 document.body.classList.add('adm-locked');
 $('#brief').scrollTop = 0;
 $('#brief [data-close]').focus();
 history.replaceState(null, '', '#' + encodeURIComponent(lead.id));
}

export function closeBrief() {
 if (!current) return;
 current = null;
 $('#brief').hidden = true;
 $('#scrim').hidden = true;
 document.body.classList.remove('adm-locked');
 history.replaceState(null, '', location.pathname);
 returnFocus?.focus?.();
}

export const briefId = () => current?.id || null;

async function copy(text) {
 try { await navigator.clipboard.writeText(text); toast('Brief copié.'); }
 catch { toast('Copie impossible dans ce navigateur.'); }
}

export function initBrief(options) {
 handlers = options;
 $('#scrim').addEventListener('click', closeBrief);
 document.addEventListener('keydown', event => { if (event.key === 'Escape') closeBrief(); });
 $('#brief').addEventListener('click', async event => {
  const target = event.target.closest('button');
  if (!target || !current) return;
  if (target.hasAttribute('data-close')) return closeBrief();
  if (target.hasAttribute('data-copy')) return copy(plain(current));
  if (target.dataset.open) return openBrief(handlers.find(target.dataset.open));
  if (target.dataset.stage) {
   if (target.dataset.stage === stageOf(current)) return;
   const lead = await handlers.save(current.id, {etape: target.dataset.stage});
   if (lead) openBrief(lead);
   return;
  }
  if (target.hasAttribute('data-save-note')) {
   target.disabled = true;
   const lead = await handlers.save(current.id, {note: $('#briefNote').value});
   target.disabled = false;
   if (lead) { openBrief(lead); toast('Note enregistrée.'); }
   return;
  }
  if (target.hasAttribute('data-delete')) {
   if (!confirm(`Effacer définitivement la demande de ${current.nom || 'ce contact'} ?`)) return;
   if (await handlers.remove(current.id)) { closeBrief(); toast('Demande effacée.'); }
  }
 });
}
