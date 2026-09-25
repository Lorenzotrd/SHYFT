/* Prise de rendez-vous dans la fenêtre officielle de Cal.com, chargée au premier clic seulement.
   Chaque lien vers cal.com/shyftgrowth garde son adresse : si le script de Cal.com ne charge pas
   (bloqueur, réseau), le visiteur suit le lien normal, avec les mêmes informations de provenance.
   Transmis à Cal.com en métadonnées de la réservation : page d'origine, emplacement du bouton, UTM,
   et l'identifiant GA4 du visiteur seulement s'il a accepté la mesure d'audience.
   La réservation elle-même est comptée côté serveur (webhook), jamais ici : le navigateur ne signale
   que l'ouverture de la fenêtre, puis emmène la page sur /rendez-vous/merci une fois la réservation acceptée. */
(function () {
 const PREFIX = 'https://cal.com/shyftgrowth/';
 const ORIGIN = 'https://app.cal.com';
 const EMBED = ORIGIN + '/embed/embed.js';
 const NS = 'shyft';
 const LOAD_TIMEOUT = 6000;
 const IDS_TIMEOUT = 800;
 const STORED = ['utm_source', 'utm_medium', 'utm_campaign', 'gclid', 'referrer'];
 // Page de remerciement, sur l'origine du site (https://www.shyftgrowth.com/rendez-vous/merci en production),
 // pour que la note de conversion laissée dans sessionStorage y soit lisible. Version anglaise depuis les pages /en.
 const THANKS = document.documentElement.lang === 'en' ? '/en/booking/thank-you' : '/rendez-vous/merci';
 let loading = null;
 let fallback = '';
 let redirecting = false;

 // Chargeur officiel de Cal.com (extrait du générateur d'intégration), sans modification.
 function installCal() {
  (function (C, A, L) { let p = function (a, ar) { a.q.push(ar); }; let d = C.document; C.Cal = C.Cal || function () { let cal = C.Cal; let ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement('script')).src = A; cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; if (typeof namespace === 'string') { cal.ns[namespace] = cal.ns[namespace] || api; p(cal.ns[namespace], ar); p(cal, ['initNamespace', namespace]); } else p(cal, ar); return; } p(cal, ar); }; })(window, EMBED, 'init');
 }

 function loadCal() {
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
   installCal();
   window.Cal('init', NS, {origin: ORIGIN});
   // Lien introuvable ou erreur de Cal.com dans la fenêtre : on bascule sur la page de réservation.
   window.Cal.ns[NS]('on', {action: 'linkFailed', callback: () => { if (fallback) location.href = fallback; }});
   // Réservation réussie dans la fenêtre : Cal.com reste sur son écran de confirmation, on emmène toute la page
   // sur /rendez-vous/merci. Seulement pour une réservation acceptée : ni demande en attente de validation,
   // ni paiement à faire, ni réservation de test (dryRun, événement distinct qu'on n'écoute pas).
   window.Cal.ns[NS]('on', {action: 'bookingSuccessfulV2', callback: event => {
    const booking = (event && event.detail && event.detail.data) || {};
    if (!confirmed(booking) || redirecting) return;
    redirecting = true;
    location.assign(THANKS);
   }});
   window.Cal.ns[NS]('ui', {theme: 'light', layout: 'month_view', hideEventTypeDetails: false, cssVarsPerTheme: {light: {'cal-brand': '#0e0e0c'}}});
   const script = document.querySelector('script[src="' + EMBED + '"]');
   const timer = setTimeout(() => reject(new Error('délai dépassé')), LOAD_TIMEOUT);
   if (!script) { clearTimeout(timer); reject(new Error('script absent')); return; }
   script.addEventListener('load', () => { clearTimeout(timer); resolve(); });
   script.addEventListener('error', () => { clearTimeout(timer); reject(new Error('script bloqué')); });
  });
  // Un échec n'est pas définitif : le clic suivant retentera le chargement.
  loading.catch(() => { loading = null; });
  return loading;
 }

 // Note lue par /rendez-vous/merci : la conversion publicitaire n'y est comptée que si la réservation vient du site.
 function remember(link) {
  try { sessionStorage.setItem('shyft:booking', JSON.stringify({emplacement: link.dataset.emplacement || 'lien', page: location.pathname})); } catch {}
 }

 function confirmed(booking) {
  return typeof booking.uid === 'string' && booking.uid !== ''
   && String(booking.status || '').toUpperCase() === 'ACCEPTED'
   && !booking.paymentRequired;
 }

 function stored(key) { try { return sessionStorage.getItem(key) || ''; } catch { return ''; } }

 // Identifiants GA4, fournis par analytics.js uniquement après accord. Sinon : rien.
 function analyticsIds() {
  const api = window.shyftAnalytics;
  if (!api || typeof api.ids !== 'function') return Promise.resolve(null);
  return Promise.race([api.ids(), new Promise(r => setTimeout(() => r(null), IDS_TIMEOUT))]).catch(() => null);
 }

 async function metadata(link) {
  const meta = {page: location.pathname, emplacement: link.dataset.emplacement || 'lien'};
  STORED.forEach(key => { const v = stored(key); if (v) meta[key] = v; });
  const ids = await analyticsIds();
  if (ids && ids.client_id) {
   meta.ga_client_id = ids.client_id;
   if (ids.session_id) meta.ga_session_id = ids.session_id;
   if (ids.ads) meta.ga_ads = '1';
  }
  const config = {};
  Object.keys(meta).forEach(key => { config['metadata[' + key + ']'] = String(meta[key]).slice(0, 300); });
  return config;
 }

 function fallbackUrl(href, config) {
  const url = new URL(href);
  Object.keys(config).forEach(key => url.searchParams.set(key, config[key]));
  return url.toString();
 }

 document.addEventListener('click', async event => {
  const link = event.target.closest && event.target.closest('a[href^="' + PREFIX + '"]');
  if (!link || event.defaultPrevented) return;
  // Nouvel onglet, clic du milieu : comportement normal du navigateur.
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  remember(link);
  const href = link.href;
  const calLink = new URL(href).pathname.replace(/^\//, '');
  const config = await metadata(link);
  fallback = fallbackUrl(href, config);
  try {
   await loadCal();
  } catch {
   location.href = fallback;
   return;
  }
  window.Cal.ns[NS]('modal', {calLink, config: {layout: 'month_view', ...config}});
  document.dispatchEvent(new CustomEvent('shyft:booking', {detail: {emplacement: link.dataset.emplacement || 'lien', page: location.pathname}}));
 });
})();
