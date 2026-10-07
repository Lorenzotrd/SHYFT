/* Mesure d'audience Google Analytics 4, et conversions publicitaires si elles sont configurées.
   Mode consentement avancé : la balise Google se charge dès l'arrivée, avec un consentement refusé par défaut.
   Tant que le visiteur n'a pas accepté, Google ne reçoit que des signaux sans cookie ni identifiant, qui lui servent
   à estimer les visites et les conversions. Meta n'a pas de mode consentement : son pixel n'est chargé qu'après accord.
   data-ads (conversion Google Ads « AW-…/… ») et data-meta (pixel Meta) restent vides tant qu'ils ne sont pas
   renseignés dans src/lib/site.ts : rien ne part alors vers ces régies. */
(function () {
 const data = (document.currentScript && document.currentScript.dataset) || {};
 const ID = data.ga || '';
 if (!ID) return;
 const ADS = data.ads || '';
 const ADS_RDV = data.adsRdv || '';
 const META = data.meta || '';
 // data-ads-enabled : Google Ads reçoit les données par la balise Google (destination liée à GA4), sans libellé à câbler.
 const ADS_ENABLED = data.adsEnabled === 'true';
 const ADVERTISING = Boolean(ADS_ENABLED || ADS || ADS_RDV || META);
 const KEY = 'shyft:consent';

 window.dataLayer = window.dataLayer || [];
 function gtag() { window.dataLayer.push(arguments); }
 window.gtag = gtag;
 gtag('consent', 'default', {
  ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
  analytics_storage: 'denied', wait_for_update: 500,
 });
 // Sans accord publicitaire, les identifiants de clic ne sont pas transmis à Google Ads.
 gtag('set', 'ads_data_redaction', true);

 const choice = {
  get() { try { return localStorage.getItem(KEY); } catch { return null; } },
  set(v) { try { localStorage.setItem(KEY, v); } catch {} },
 };

 // Événements du site : envoyés à Google (sans cookie tant qu'il n'y a pas d'accord) et à PostHog (toujours sans cookie).
 function emit(name, params) {
  gtag('event', name, params);
  if (window.posthog) window.posthog.capture(name, params);
 }

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

 // Textes du bandeau, dans la langue de la page (<html lang>) : une phrase, le détail est sur la page confidentialité.
 const TOOLS = ADVERTISING ? (META ? 'les outils Google et Meta' : 'les outils Google') : 'Google Analytics';
 const TOOLS_EN = ADVERTISING ? (META ? 'Google and Meta tools' : 'Google tools') : 'Google Analytics';
 const TEXTS = {
  fr: {
   label: 'Cookies', text: '🍪 On mesure ce qui marche sur le site avec ' + TOOLS + '. ',
   more: 'En savoir plus', privacy: '/confidentialite', deny: 'Refuser', accept: 'Accepter',
  },
  en: {
   label: 'Cookies', text: '🍪 We measure what works on this site with ' + TOOLS_EN + '. ',
   more: 'Learn more', privacy: '/en/privacy-policy', deny: 'Decline', accept: 'Accept',
  },
 };

 function show() {
  if (banner) return;
  const t = TEXTS[document.documentElement.lang === 'en' ? 'en' : 'fr'];
  banner = document.createElement('div');
  banner.className = 'consent';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', t.label);
  banner.innerHTML =
   '<p class="consent-text">' + t.text + '<a href="' + t.privacy + '">' + t.more + '</a></p>' +
   '<div class="consent-actions">' +
   '<button type="button" class="btn btn-ghost" data-consent="denied">' + t.deny + '</button>' +
   '<button type="button" class="btn btn-lime" data-consent="granted">' + t.accept + '</button></div>';
  document.body.appendChild(banner);
 }

 function decide(value) {
  choice.set(value);
  gtag('consent', 'update', consentFor(value));
  if (value === 'granted' && META) { loadMeta(); pendingMeta.splice(0).forEach(send => send()); }
  else pendingMeta.length = 0;
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
  // Clics sur le téléphone et l'email (en-tête, pied de page, page rendez-vous). Sans accord, signal sans cookie.
  const contact = event.target.closest('a[href^="tel:"], a[href^="mailto:"]');
  if (contact) {
   const tel = contact.getAttribute('href').startsWith('tel:');
   emit(tel ? 'clic_telephone' : 'clic_email', { emplacement: contact.dataset.emplacement || 'lien', page_origine: location.pathname });
  }
  // Clics vers WhatsApp (bouton flottant, pied de page, page rendez-vous). Sans accord, signal sans cookie.
  const whatsapp = event.target.closest('a[href^="https://wa.me/"]');
  if (whatsapp) {
   emit('clic_whatsapp', { emplacement: whatsapp.dataset.emplacement || 'lien', page_origine: location.pathname });
  }
 });

 // Ouverture de la fenêtre de rendez-vous (booking.js). La réservation, elle, est comptée par le serveur (book_call).
 document.addEventListener('shyft:booking', event => {
  const detail = event.detail || {};
  emit('open_booking', { emplacement: detail.emplacement || '', page_origine: detail.page || location.pathname });
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

 // Événements Meta en attente de la réponse au bandeau : envoyés si le visiteur accepte, abandonnés s'il refuse.
 const pendingMeta = [];
 function sendMeta(send) {
  if (!META) return;
  const state = choice.get();
  if (state === 'granted') send();
  else if (state !== 'denied') pendingMeta.push(send);
 }

 loadGoogle();
 const current = choice.get();
 if (current === 'granted') { gtag('consent', 'update', consentFor('granted')); if (META) loadMeta(); }
 else if (current !== 'denied') show();

 // Une demande envoyée : c'est la conversion qui compte. Pour l'audit, elle est signalée par la page merci.
 // Google la reçoit toujours (sans cookie tant qu'il n'y a pas d'accord) ; Meta seulement après accord.
 function track(detail) {
  detail = detail || {};
  emit('generate_lead', { secteur: detail.secteur || '', page: location.pathname });
  if (detail.formulaire !== 'audit') return;
  const levers = detail.services || [];
  emit('demande_audit', { leviers: levers.length, services: levers.join(',') });
  if (ADS) gtag('event', 'conversion', { send_to: ADS });
  sendMeta(() => window.fbq && window.fbq('track', 'Lead', { content_name: 'audit-offert' }));
 }
 document.addEventListener('shyft:lead', event => track(event.detail));
 // Rendez-vous réservé : page /rendez-vous/merci. Pas d'événement GA4 ici (book_call part du serveur),
 // seulement les conversions publicitaires configurées. Même règle que pour les demandes.
 function trackRdv() {
  if (ADS_RDV) gtag('event', 'conversion', { send_to: ADS_RDV });
  sendMeta(() => window.fbq && window.fbq('track', 'Schedule'));
 }
 document.addEventListener('shyft:rdv', () => trackRdv());
})();
