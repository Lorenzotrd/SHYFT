/* Mesure d'audience Google Analytics 4.
   Aucune requête vers Google n'est faite avant un accord explicite : le script n'est chargé qu'après.
   Le mode consentement est refusé par défaut, conformément à ce qu'impose l'Espace économique européen. */
(function () {
 const ID = (document.currentScript && document.currentScript.dataset.ga) || '';
 if (!ID) return;
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
 }

 let banner = null;
 function hide() { if (banner) { banner.remove(); banner = null; } }

 function show() {
  if (banner) return;
  banner = document.createElement('div');
  banner.className = 'consent';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-labelledby', 'consentTitle');
  banner.innerHTML =
   '<div class="consent-text"><b id="consentTitle">Mesure d’audience</b>' +
   '<p>On utilise Google Analytics pour savoir quelles pages répondent à vos questions. ' +
   'Rien de plus, aucune publicité ciblée. Le site fonctionne exactement pareil si vous refusez. ' +
   '<a href="/confidentialite">En savoir plus</a></p></div>' +
   '<div class="consent-actions">' +
   '<button type="button" class="btn btn-ghost" data-consent="denied">Refuser</button>' +
   '<button type="button" class="btn btn-lime" data-consent="granted">Accepter</button></div>';
  document.body.appendChild(banner);
  banner.querySelector('[data-consent="granted"]').focus();
 }

 function decide(value) {
  choice.set(value);
  gtag('consent', 'update', {analytics_storage: value});
  if (value === 'granted') loadGoogle();
  hide();
 }

 document.addEventListener('click', event => {
  const button = event.target.closest('[data-consent]');
  if (button) return decide(button.dataset.consent);
  const reopen = event.target.closest('[data-cookies]');
  if (reopen) { event.preventDefault(); show(); }
 });

 const current = choice.get();
 if (current === 'granted') { gtag('consent', 'update', {analytics_storage: 'granted'}); loadGoogle(); }
 else if (current !== 'denied') show();

 // Le formulaire signale une demande envoyée : c'est la conversion qui compte.
 document.addEventListener('shyft:lead', event => {
  if (choice.get() !== 'granted') return;
  gtag('event', 'generate_lead', {
   secteur: (event.detail && event.detail.secteur) || '',
   page: location.pathname,
  });
 });
})();
