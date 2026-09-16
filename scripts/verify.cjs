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
await page.locator('[name="nom"]').fill('Test');await page.locator('[name="entreprise"]').fill('Test');await page.locator('[name="email"]').fill('test@example.com');
await page.locator('button[type="submit"]').click();await page.locator('#formError').waitFor({state:'visible'});
if(await page.locator('.done').isVisible())throw Error('Faux succès du formulaire');
if(errors.length)throw Error('Erreurs JavaScript : '+errors.join(' | '));
console.log(JSON.stringify({pages:17,expertises:slugs.length,erreurs:errors.length,formulaire:'refus correct sans connecteur'}));
await browser.close()})().catch(e=>{console.error(e);process.exit(1)});
