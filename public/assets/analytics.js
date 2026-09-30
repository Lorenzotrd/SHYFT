/* Consentement et événements de mesure. Toute la mesure passe par Google Tag Manager (GA4, Google Ads, Meta
   y sont configurés) : ce script ne charge aucun outil lui-même.
   - Google Consent Mode v2 : tout est refusé par défaut dans le <head> (Site.astro), avant GTM. Ce script
     affiche le bandeau, mémorise le choix et envoie la mise à jour (gtag('consent', 'update')), puis
     l'événement dataLayer « consent_update » pour les balises qui n'utilisent pas le mode consentement (Meta).
   - Événements poussés dans le dataLayer, quel que soit le choix (GTM décide selon le consentement) :
     clic_telephone, clic_email, clic_prise_rdv, soumission_formulaire_audit, rdv_confirme. */
(function () {
 const data = (document.currentScript && document.currentScript.dataset) || {};
 const GA = data.ga || '';
 const KEY = 'shyft:consent';

 window.dataLayer = window.dataLayer || [];
 function gtag() { window.dataLayer.push(arguments); }
 window.gtag = window.gtag || gtag;
 const push = (event, params) => window.dataLayer.push(Object.assign({ event }, params || {}));

 const choice = {
  get() { try { return localStorage.getItem(KEY); } catch { return null; } },
  set(v) { try { localStorage.setItem(KEY, v); } catch {} },
 };

 // Accord : mesure d'audience et publicitaire. Refus : tout reste refusé.
 function consentFor(value) {
  return {
   analytics_storage: value, ad_storage: value, ad_user_data: value, ad_personalization: value,
   functionality_storage: value, personalization_storage: value,
  };
 }

 let banner = null;
 function hide() { if (banner) { banner.remove(); banner = null; } }

 // Textes du bandeau, dans la langue de la page (<html lang>).
 const TEXTS = {
  fr: {
   title: 'Mesure d’audience et publicité',
   text: 'On utilise Google Analytics pour savoir quelles pages répondent à vos questions, et des outils publicitaires (Google Ads, Meta) pour savoir quelles publicités amènent des demandes. Le site fonctionne exactement pareil si vous refusez. ',
   short: 'Google Analytics, Google Ads et Meta nous disent ce qui amène des demandes. Le site marche pareil si vous refusez. ',
   more: 'En savoir plus', privacy: '/confidentialite', deny: 'Refuser', accept: 'Accepter',
  },
  en: {
   title: 'Analytics and advertising',
   text: 'We use Google Analytics to see which pages answer your questions, and ad tools (Google Ads, Meta) to see which ads bring in requests. The site works exactly the same if you decline. ',
   short: 'Google Analytics, Google Ads and Meta tell us what brings in requests. The site works the same if you decline. ',
   more: 'Learn more', privacy: '/en/privacy-policy', deny: 'Decline', accept: 'Accept',
  },
 };

 function show() {
  if (banner) return;
  const t = TEXTS[document.documentElement.lang === 'en' ? 'en' : 'fr'];
  banner = document.createElement('div');
  banner.className = 'consent';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-labelledby', 'consentTitle');
  banner.innerHTML =
   '<div class="consent-text"><b id="consentTitle">' + t.title + '</b>' +
   '<p><span class="consent-long">' + t.text + '</span><span class="consent-short">' + t.short + '</span>' +
   '<a href="' + t.privacy + '">' + t.more + '</a></p></div>' +
   '<div class="consent-actions">' +
   '<button type="button" class="btn btn-ghost" data-consent="denied">' + t.deny + '</button>' +
   '<button type="button" class="btn btn-lime" data-consent="granted">' + t.accept + '</button></div>';
  document.body.appendChild(banner);
  banner.querySelector('[data-consent="granted"]').focus();
 }

 function decide(value) {
  choice.set(value);
  gtag('consent', 'update', consentFor(value));
  push('consent_update', { consent_analytics: value, consent_ads: value });
  hide();
 }

 // Choix déjà fait : la mise à jour du consentement est déjà partie dans le <head>, on le signale aux balises.
 const current = choice.get();
 if (current === 'granted' || current === 'denied') push('consent_update', { consent_analytics: current, consent_ads: current });
 else show();

 document.addEventListener('click', event => {
  const target = event.target;
  if (!target || !target.closest) return;
  const button = target.closest('[data-consent]');
  if (button) return decide(button.dataset.consent);
  const reopen = target.closest('[data-cookies]');
  if (reopen) { event.preventDefault(); show(); return; }
  // Clics sur le téléphone et l'email, où qu'ils soient (en-tête, pied de page, contenus).
  const link = target.closest('a[href^="tel:"], a[href^="mailto:"]');
  if (!link) return;
  const tel = link.getAttribute('href').startsWith('tel:');
  push(tel ? 'clic_telephone' : 'clic_email', { emplacement: link.dataset.emplacement || 'lien', page_origine: location.pathname });
 });

 // Clic sur une prise de rendez-vous (booking.js), avant l'ouverture de la fenêtre Cal.com.
 document.addEventListener('shyft:booking', event => {
  const d = event.detail || {};
  push('clic_prise_rdv', { emplacement: d.emplacement || 'lien', page_origine: d.page || location.pathname });
 });

 // Demande d'audit envoyée : signalée une seule fois par la page merci (note laissée par le formulaire).
 document.addEventListener('shyft:lead', event => {
  const d = event.detail || {};
  if (d.formulaire !== 'audit') return;
  const services = d.services || [];
  push('soumission_formulaire_audit', { secteur: d.secteur || '', leviers: services.length, services: services.join(',') });
 });

 // Rendez-vous confirmé dans Cal.com (bookingSuccessfulV2) : signalé une seule fois par la page merci du rendez-vous.
 document.addEventListener('shyft:rdv', event => {
  const d = event.detail || {};
  push('rdv_confirme', { emplacement: d.emplacement || 'lien', page_origine: d.page || '' });
 });

 // Identifiants GA4 du visiteur (cookies posés par GA4 via GTM), pour rattacher la réservation Cal.com à sa visite
 // côté serveur (book_call). Uniquement après accord : sans accord, ces cookies n'existent pas et rien n'est lu.
 function cookie(name) {
  const hit = document.cookie.split('; ').find(c => c.startsWith(name + '='));
  return hit ? decodeURIComponent(hit.slice(name.length + 1)) : '';
 }
 window.shyftAnalytics = {
  ids() {
   if (choice.get() !== 'granted') return Promise.resolve(null);
   const ga = cookie('_ga').split('.');
   const client_id = ga.length >= 4 ? ga.slice(-2).join('.') : '';
   if (!client_id) return Promise.resolve(null);
   const session = GA ? cookie('_ga_' + GA.replace(/^G-/, '')) : '';
   const match = session.match(/^GS2\.\d\.s(\d+)/) || session.match(/^GS1\.\d\.(\d+)\./);
   return Promise.resolve({ client_id, session_id: match ? match[1] : '', ads: true });
  },
 };
})();
