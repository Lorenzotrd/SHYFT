/* Mesure d'audience Google Analytics 4, et conversions publicitaires si elles sont configurées.
   Aucune requête vers Google ou Meta n'est faite avant un accord explicite : les scripts ne sont chargés qu'après.
   Le mode consentement est refusé par défaut, conformément à ce qu'impose l'Espace économique européen.
   data-ads (conversion Google Ads « AW-…/… ») et data-meta (pixel Meta) restent vides tant qu'ils ne sont pas
   renseignés dans src/lib/site.ts : rien ne part alors vers ces régies. */
(function () {
 const data = (document.currentScript && document.currentScript.dataset) || {};
 const ID = data.ga || '';
 if (!ID) return;
 const ADS = data.ads || '';
 const ADS_RDV = data.adsRdv || '';
 const META = data.meta || '';
 const ADVERTISING = Boolean(ADS || ADS_RDV || META);
 const KEY = 'shyft:consent';

 window.dataLayer = window.dataLayer || [];
 function gtag() { window.dataLayer.push(arguments); }
 window.gtag = gtag;
 gtag('consent', 'default', {
  ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
  analytics_storage: 'denied', wait_for_update: 500,
 });

 const choice = {
  get() { try { return localStorage.getItem(KEY); } catch { return null; } },
  set(v) { try { localStorage.setItem(KEY, v); } catch {} },
 };

 let loaded = false;
 function loadGoogle() {
  if (loaded) return;
  loaded = true;
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(ID);
  document.head.appendChild(script);
  gtag('js', new Date());
  gtag('config', ID, {anonymize_ip: true});
  const account = (ADS || ADS_RDV).split('/')[0];
  if (account) gtag('config', account);
  if (META) loadMeta();
 }

 // Pixel Meta, chargé seulement après accord et seulement si un identifiant est renseigné.
 function loadMeta() {
  if (window.fbq) return;
  const fbq = function () { fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments); };
  fbq.queue = []; fbq.loaded = true; fbq.version = '2.0'; fbq.push = fbq;
  window.fbq = fbq; window._fbq = fbq;
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/fr_FR/fbevents.js';
  document.head.appendChild(script);
  fbq('init', META);
  fbq('track', 'PageView');
 }

 let banner = null;
 function hide() { if (banner) { banner.remove(); banner = null; } }

 // Textes du bandeau, dans la langue de la page (<html lang>).
 const TEXTS = {
  fr: {
   title: 'Mesure d’audience',
   ads: 'On utilise Google Analytics pour savoir quelles pages répondent à vos questions, et des outils de mesure publicitaire (Google Ads, Meta) pour savoir quelles publicités amènent des demandes. ',
   noAds: 'On utilise Google Analytics pour savoir quelles pages répondent à vos questions. Rien de plus, aucune publicité ciblée. ',
   same: 'Le site fonctionne exactement pareil si vous refusez. ',
   more: 'En savoir plus', privacy: '/confidentialite', deny: 'Refuser', accept: 'Accepter',
  },
  en: {
   title: 'Analytics',
   ads: 'We use Google Analytics to see which pages answer your questions, and ad measurement tools (Google Ads, Meta) to see which ads bring in requests. ',
   noAds: 'We use Google Analytics to see which pages answer your questions. Nothing more, no targeted ads. ',
   same: 'The site works exactly the same if you decline. ',
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
   '<p>' + (ADVERTISING ? t.ads : t.noAds) + t.same +
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
  if (value === 'granted') { loadGoogle(); pending.splice(0).forEach(track); pendingRdv.splice(0).forEach(trackRdv); }
  else { pending.length = 0; pendingRdv.length = 0; }
  hide();
 }

 // Accord : mesure d'audience, et mesure publicitaire seulement si une régie est configurée. Jamais de personnalisation.
 function consentFor(value) {
  const update = {analytics_storage: value};
  if (ADVERTISING) { update.ad_storage = value; update.ad_user_data = value; }
  return update;
 }

 document.addEventListener('click', event => {
  const button = event.target.closest('[data-consent]');
  if (button) return decide(button.dataset.consent);
  const reopen = event.target.closest('[data-cookies]');
  if (reopen) { event.preventDefault(); show(); return; }
 });

 // Ouverture de la fenêtre de rendez-vous (booking.js). La réservation, elle, est comptée par le serveur (book_call).
 document.addEventListener('shyft:booking', event => {
  if (choice.get() !== 'granted') return;
  const detail = event.detail || {};
  gtag('event', 'open_booking', { emplacement: detail.emplacement || '', page_origine: detail.page || location.pathname });
 });

 // Identifiants GA4 du visiteur, pour rattacher la réservation à sa visite. Uniquement après accord.
 function readField(field) {
  return new Promise(resolve => gtag('get', ID, field, value => resolve(value ? String(value) : '')));
 }
 window.shyftAnalytics = {
  ids() {
   if (choice.get() !== 'granted' || !loaded) return Promise.resolve(null);
   return Promise.all([readField('client_id'), readField('session_id')])
    .then(([client_id, session_id]) => (client_id ? { client_id, session_id, ads: ADVERTISING } : null));
  },
 };

 const pending = [];
 const pendingRdv = [];
 const current = choice.get();
 if (current === 'granted') { gtag('consent', 'update', consentFor('granted')); loadGoogle(); }
 else if (current !== 'denied') show();

 // Une demande envoyée : c'est la conversion qui compte. Pour l'audit, elle est signalée par la page merci.
 // Sans réponse au bandeau, elle attend la décision ; en cas de refus, elle est abandonnée.
 function track(detail) {
  detail = detail || {};
  gtag('event', 'generate_lead', { secteur: detail.secteur || '', page: location.pathname });
  if (detail.formulaire !== 'audit') return;
  const levers = detail.services || [];
  gtag('event', 'demande_audit', { leviers: levers.length, services: levers.join(',') });
  if (ADS) gtag('event', 'conversion', { send_to: ADS });
  if (META && window.fbq) window.fbq('track', 'Lead', { content_name: 'audit-offert' });
 }
 document.addEventListener('shyft:lead', event => {
  const state = choice.get();
  if (state === 'granted') track(event.detail);
  else if (state !== 'denied') pending.push(event.detail);
 });
 // Rendez-vous réservé : page /rendez-vous/merci. Pas d'événement GA4 ici (book_call part du serveur),
 // seulement les conversions publicitaires configurées. Même règle de consentement que pour les demandes.
 function trackRdv() {
  if (ADS_RDV) gtag('event', 'conversion', { send_to: ADS_RDV });
  if (META && window.fbq) window.fbq('track', 'Schedule');
 }
 document.addEventListener('shyft:rdv', event => {
  const state = choice.get();
  if (state === 'granted') trackRdv(event.detail);
  else if (state !== 'denied') pendingRdv.push(event.detail);
 });
})();
