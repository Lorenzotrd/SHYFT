// Parcours de la page audit offert dans un vrai navigateur : sélection des leviers, validation, envoi,
// redirection vers la page merci et conversion comptée une seule fois. Le webhook est factice : rien ne part vers la vraie feuille.
// Usage : npm run test:audit (Playwright et Google Chrome requis, comme scripts/capture.cjs).
const {chromium}=require('/Users/lorenzotrichard/.cache/uv/archive-v0/S2ghcOWcglW9BUt0RjW_E/playwright/driver/package');
const http=require('http');const {spawn}=require('child_process');const assert=require('assert/strict');
const ROOT=require('path').resolve(__dirname,'..');
let received=null;
const mock=http.createServer(async(req,res)=>{let raw='';for await(const c of req)raw+=c;received=JSON.parse(raw);res.end('ok')}).listen(4185,'127.0.0.1');
const env={...process.env,LEAD_WEBHOOK_URL:'http://127.0.0.1:4185'};
const dev=spawn('npx',['astro','dev','--port','4184','--host','127.0.0.1','--ignore-lock'],{cwd:ROOT,env,stdio:'ignore'});
const base='http://127.0.0.1:4184';
(async()=>{let b;try{
 for(let i=0;i<80;i++){try{if((await fetch(base+'/robots.txt')).ok)break}catch{}await new Promise(r=>setTimeout(r,500))}
 b=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 const p=await b.newPage({viewport:{width:1280,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
 // Chaque événement de conversion est noté dans la page, pour vérifier qu'il part une fois et une seule.
 await p.addInitScript(()=>{window.__leads=[];document.addEventListener('shyft:lead',e=>window.__leads.push(e.detail))});
 await p.goto(base+'/audit-offert?utm_source=test&utm_campaign=essai',{waitUntil:'networkidle'});
 await p.evaluate(()=>document.querySelector('.consent')?.remove());
 const count=()=>p.locator('[data-count]').textContent();
 assert.equal(await count(),'1 sur 6','SEO présélectionné');
 await p.getByRole('button',{name:/Google Ads/}).click();assert.equal(await count(),'2 sur 6');
 assert.match(await p.locator('[data-summary]').textContent(),/2 leviers/);
 await p.getByRole('button',{name:'Tout auditer'}).click();assert.equal(await count(),'6 sur 6');
 assert.equal(await p.locator('[data-toggle-all]').textContent(),'Tout désélectionner');
 await p.getByRole('button',{name:'Tout désélectionner'}).click();assert.equal(await count(),'0 sur 6');
 assert.equal(await p.locator('[data-submit]').isDisabled(),true,'envoi désactivé sans levier');
 await p.getByRole('button',{name:/SEO, local et GEO/}).click();await p.getByRole('button',{name:/Data et tracking/}).click();
 await p.locator('[data-submit]').click();
 assert.equal(await p.locator('[data-error]').isVisible(),true,'erreur si formulaire vide');assert.equal(received,null,'rien envoyé');
 await p.getByLabel("Nom de l'entreprise").fill('Maigret Location');await p.getByLabel('Site internet').fill('maigret-location.fr');
 await p.getByLabel('Ville principale').fill('Tours');await p.getByLabel('Secteur').selectOption('Location de matériel');
 await p.getByLabel('Prénom et nom').fill('Test E2E');await p.getByLabel('Email professionnel').fill('test@example.com');
 await p.getByLabel(/point précis/).fill('Test automatique');
 await p.locator('[data-submit]').click();
 await p.waitForURL('**/audit-offert/merci',{timeout:10000});
 await p.waitForFunction(()=>window.__leads.length>0,null,{timeout:5000});
 const leads=await p.evaluate(()=>window.__leads);
 assert.equal(leads.length,1,'une conversion sur la page merci');assert.equal(leads[0].formulaire,'audit');assert.deepEqual(leads[0].services,['seo','data-tracking']);
 assert.match(await p.locator('main h1').textContent(),/Merci/);
 assert.equal(await p.locator('meta[name="robots"]').getAttribute('content'),'noindex, follow','page merci en noindex');
 assert.equal(received.services,'SEO, local et GEO, Data et tracking');assert.equal(received.site,'https://maigret-location.fr');
 assert.equal(received.utm_source,'test');assert.equal(received.formulaire,'audit');assert.equal(received.ville,'Tours');
  await p.reload({waitUntil:'networkidle'});await p.waitForTimeout(500);
 assert.equal((await p.evaluate(()=>window.__leads)).length,0,'pas de conversion au rechargement');
 // Clavier : un levier se sélectionne à l'espace
 await p.goto(base+'/audit-offert',{waitUntil:'networkidle'});await p.evaluate(()=>document.querySelector('.consent')?.remove());
 await p.getByRole('button',{name:/Meta Ads/}).focus();await p.keyboard.press('Space');assert.equal(await count(),'2 sur 6');
 console.log(JSON.stringify({parcours_audit:'ok',merci:'ok',recu:{services:received.services,site:received.site,utm:received.utm_source},erreurs:errs}));
}catch(e){console.error('ÉCHEC',e.message);process.exitCode=1}finally{await b?.close();dev.kill();mock.close();spawn('npx',['astro','dev','stop'],{cwd:ROOT,stdio:'ignore'})}})();
