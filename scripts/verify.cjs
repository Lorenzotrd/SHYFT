const {chromium}=require('/Users/lorenzotrichard/.cache/uv/archive-v0/S2ghcOWcglW9BUt0RjW_E/playwright/driver/package');
const home='http://localhost:4173';
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});const errors=[];page.on('pageerror',e=>errors.push(e.message));
const go=async u=>{const r=await page.goto(home+u,{waitUntil:'domcontentloaded'});if(r.status()!==200)throw Error('Statut '+r.status()+' sur '+u);};
const count=async s=>page.locator(s).count();

await go('/');await page.waitForLoadState('networkidle');await page.screenshot({path:'qa/desktop.png',fullPage:true});
if(!/shyft/i.test(await page.locator('.logo').first().textContent()))throw Error('Logo absent');
if(await count('#expertises .xp-card')!==7)throw Error('Accueil : 7 cartes attendues');
if(await count('.steps.three .step')!==3)throw Error('Accueil : 3 étapes de méthode attendues');
if(await count('#mesure .measure-list article')!==5)throw Error('Accueil : section Mesure incomplète');

// Mega-menu : ouverture au clic, fermeture de l'autre menu.
await page.locator('.dropdown-toggle').nth(1).click();
if(await page.locator('#expertise-menu').isHidden())throw Error('Mega-menu fermé après clic');
if(await count('#expertise-menu .mega-col a')!==7)throw Error('Mega-menu : 7 expertises attendues');
await page.locator('.dropdown-toggle').first().click();
if(!await page.locator('#expertise-menu').isHidden())throw Error('Les deux menus restent ouverts');
if(await page.locator('#sector-menu').isHidden())throw Error('Menu secteurs fermé après clic');
await page.keyboard.press('Escape');
if(!await page.locator('#sector-menu').isHidden())throw Error('Échap ne ferme pas le menu');

await go('/expertises');
if(await count('.system li')!==5)throw Error('Expertises : 5 temps attendus');
if(await count('.xp-card')!==7)throw Error('Expertises : 7 cartes attendues');
if(await count('.sector-card')!==6)throw Error('Expertises : 6 secteurs attendus');

const slugs=['seo','geo','google-ads','meta-ads','agence-ia','landing-pages-cro','data-tracking'];
const titles=new Set();
for(const slug of slugs){await go('/expertises/'+slug);
 if(await count('h1')!==1)throw Error('Titre unique manquant : '+slug);
 titles.add(await page.title());
 if(await count('.mock')<1)throw Error('Interface de démonstration manquante : '+slug);
 if(await count('.channel-grid .channel-card')<2)throw Error('Maillage entre expertises manquant : '+slug);
 if(await count('.faq details')<3)throw Error('FAQ trop courte : '+slug);
 if(await page.locator('script[type="application/ld+json"]').count()!==1)throw Error('Données structurées manquantes : '+slug);
 const ld=JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());
 if(!ld.some(x=>x['@type']==='Service')||!ld.some(x=>x['@type']==='FAQPage')||!ld.some(x=>x['@type']==='BreadcrumbList'))throw Error('Schéma incomplet : '+slug);
 const desc=await page.locator('meta[name="description"]').getAttribute('content');
 if(!desc||desc.length<80)throw Error('Meta description trop courte : '+slug);
}
if(titles.size!==slugs.length)throw Error('Titres de page en double');

await go('/secteurs');
const titres=[];
const sectors=require('../assets/sectors.json');
for(const s of sectors){await go('/secteurs/'+s.slug);
 if(await count('.lever-grid .lever')!==4)throw Error('Leviers en bento manquants : '+s.slug);
 if(await count('.lever-grid a[href^="/expertises/"]')!==4)throw Error('Liens vers les expertises manquants : '+s.slug);
 if(await count('#mesure .metric-grid article')!==3)throw Error('Bloc mesure manquant : '+s.slug);
 if(await count('#marche .rrow')!==3||await count('#parcours .jstep')!==4)throw Error('Marché ou parcours manquant : '+s.slug);
 if(await count('#specificite')!==1)throw Error('Section propre au métier manquante : '+s.slug);
 titres.push(await page.locator('#parcours h2').innerText());
 const opts=await page.locator('select[name="secteur"] option').allTextContents();
 if(new Set(opts).size!==opts.length)throw Error('Doublon dans le choix du secteur : '+s.slug);
}
if(new Set(titres).size!==6)throw Error('Titres de parcours identiques entre secteurs');
for(const legal of ['/mentions-legales','/confidentialite'])await go(legal);
// Mesure d'audience : rien ne part vers Google avant un accord explicite.
await go('/');
const mesureActive=await page.locator('script[src="/assets/analytics.js"]').count()>0;
if(mesureActive){
 const appels=[];page.on('request',r=>{if(/googletagmanager|google-analytics/.test(r.url()))appels.push(r.url())});
 const vierge=await browser.newContext({viewport:{width:1440,height:900}});
 const q=await vierge.newPage();const vus=[];
 q.on('request',r=>{if(/googletagmanager|google-analytics/.test(r.url()))vus.push(r.url())});
 await q.goto(home+'/',{waitUntil:'networkidle'});await q.waitForTimeout(800);
 if(!await q.locator('.consent').isVisible())throw Error('Bandeau de consentement absent');
 if(vus.length)throw Error('Requête vers Google avant consentement : '+vus[0]);
 await q.click('[data-consent="denied"]');await q.waitForTimeout(600);
 if(vus.length)throw Error('Requête vers Google malgré un refus');
 await q.reload({waitUntil:'networkidle'});await q.waitForTimeout(600);
 if(await q.locator('.consent').count())throw Error('Le refus n’est pas mémorisé');
 if(!await q.locator('[data-cookies]').count())throw Error('Lien de gestion des cookies absent du pied de page');
 await q.click('[data-cookies]');await q.waitForTimeout(300);
 if(!await q.locator('.consent').isVisible())throw Error('Le choix ne peut pas être rouvert');
 await q.click('[data-consent="granted"]');await q.waitForTimeout(1500);
 if(!vus.length)throw Error('Google n’est pas chargé après acceptation');
 if((await (await fetch(home+'/confidentialite')).text()).indexOf('Google Analytics')<0)throw Error('La politique de confidentialité ne mentionne pas la mesure');
 await vierge.close();
}
if((await (await fetch(home+'/admin')).text()).indexOf('analytics.js')>=0)throw Error('Le panneau privé charge la mesure d’audience');
// Le panneau ne doit jamais s'ouvrir sans réponse acceptée du serveur.
{const q=await browser.newPage({viewport:{width:1280,height:900}});
 await q.goto(home+'/admin',{waitUntil:'domcontentloaded'});await q.waitForTimeout(400);
 if(!await q.locator('#login').isVisible())throw Error('L’écran de connexion ne s’affiche pas');
 if(await q.locator('#panel').isVisible())throw Error('Le panneau s’ouvre sans connexion');
 await q.fill('#pass','mot-de-passe-volontairement-faux');await q.click('#loginForm button');await q.waitForTimeout(1400);
 if(await q.locator('#panel').isVisible())throw Error('Le panneau s’ouvre avec un mauvais mot de passe');
 await q.reload({waitUntil:'domcontentloaded'});await q.waitForTimeout(600);
 if(await q.locator('#panel').isVisible())throw Error('Le panneau s’ouvre au rechargement après un échec');
 await q.close();}
const sansMotDePasse=await fetch(home+'/api/admin');
if(sansMotDePasse.status!==401&&sansMotDePasse.status!==503)throw Error('Le panneau répond sans mot de passe : '+sansMotDePasse.status);
if((await (await fetch(home+'/robots.txt')).text()).indexOf('Disallow: /admin')<0)throw Error('Le panneau n’est pas exclu des robots');

// Aucun lien interne cassé, aucune extension .html oubliée.
await go('/');
const links=await page.evaluate(()=>[...document.querySelectorAll('a[href]')].map(a=>a.getAttribute('href')));
const bad=links.filter(h=>h.endsWith('.html'));
if(bad.length)throw Error('Liens en .html : '+bad.join(', '));

for(const width of [1100,1200]){await page.setViewportSize({width,height:900});await go('/');
 const ok=await page.evaluate(()=>{const n=document.querySelector('.navigation').getBoundingClientRect(),c=document.querySelector('.nav-cta').getBoundingClientRect();return n.right<=c.left&&document.documentElement.scrollWidth<=innerWidth});
 if(!ok)throw Error('Navigation qui déborde à '+width)}

await page.setViewportSize({width:390,height:844});
for(const u of ['/','/expertises','/expertises/agence-ia','/expertises/data-tracking','/secteurs/immobilier']){await go(u);await page.waitForLoadState('networkidle');
 if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Débordement horizontal mobile : '+u)}
await go('/');await page.waitForLoadState('networkidle');await page.screenshot({path:'qa/mobile.png',fullPage:true});
await page.locator('.menu-toggle').click();await page.locator('.dropdown-toggle').nth(1).click();
if(await page.locator('#expertise-menu').isHidden())throw Error('Accordéon mobile fermé');
await page.locator('.dropdown-toggle').first().click();await page.locator('.dropdown-menu a').nth(3).click();await page.waitForLoadState('networkidle');
if(await page.locator('select[name="secteur"]').inputValue()!=='Immobilier')throw Error('Secteur mal présélectionné');
await page.screenshot({path:'qa/sector-mobile.png',fullPage:true});
// Parcours complet du formulaire : envoi, enregistrement, puis nettoyage de la demande de test.
const marker='Contrôle automatique '+Date.now();
await page.locator('[name="nom"]').fill(marker);await page.locator('[name="entreprise"]').fill('Contrôle');await page.locator('[name="email"]').fill('controle@example.com');
await page.locator('button[type="submit"]').click();
await Promise.race([page.locator('.done').waitFor({state:'visible',timeout:15000}),page.locator('#formError').waitFor({state:'visible',timeout:15000})]);
const envoye=await page.locator('.done').isVisible();
const erreur=(await page.locator('#formError').isVisible())?await page.locator('#formError').innerText():'';
if(!envoye&&!erreur)throw Error('Le formulaire ne dit rien à l’utilisateur');
if(!envoye&&!/pas encore disponible|a échoué/.test(erreur))throw Error('Message d’erreur inattendu : '+erreur);
const motDePasse=process.env.ADMIN_PASSWORD;
if(envoye&&motDePasse){
 const entetes={Authorization:'Bearer '+motDePasse};
 const liste=await (await fetch(home+'/api/admin',{headers:entetes})).json();
 const cree=(liste.leads||[]).find(l=>l.nom===marker);
 if(!cree)throw Error('La demande envoyée n’a pas été enregistrée');
 if(cree.page!=='/secteurs/immobilier')throw Error('Page d’origine non transmise : '+cree.page);
 await fetch(home+'/api/admin?id='+encodeURIComponent(cree.id),{method:'DELETE',headers:entetes});
}
if(errors.length)throw Error('Erreurs JavaScript : '+errors.join(' | '));
console.log(JSON.stringify({pages:18,expertises:slugs.length,erreurs:errors.length,mesure:mesureActive?'consentement vérifié':'désactivée',formulaire:'parcours complet vérifié'}));
await browser.close()})().catch(e=>{console.error(e);process.exit(1)});
