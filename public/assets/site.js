/* Shared navigation, illustrative card layout and audit delivery. */
const nav=document.querySelector('.nav');
const menu=document.querySelector('.menu-toggle');
const dropdowns=[...document.querySelectorAll('.dropdown')].map(d=>({toggle:d.querySelector('.dropdown-toggle'),panel:d.querySelector('.dropdown-menu')})).filter(d=>d.toggle&&d.panel);
function closePanels(){dropdowns.forEach(d=>{d.panel.hidden=true;d.toggle.setAttribute('aria-expanded','false')})}
function closeMenus(){nav?.classList.remove('menu-open');menu?.setAttribute('aria-expanded','false');closePanels()}
menu?.addEventListener('click',()=>{const open=nav.classList.toggle('menu-open');menu.setAttribute('aria-expanded',String(open));if(!open)closePanels()});
dropdowns.forEach(d=>d.toggle.addEventListener('click',()=>{const opening=d.panel.hidden;closePanels();if(opening){d.panel.hidden=false;d.toggle.setAttribute('aria-expanded','true')}}));
document.addEventListener('click',e=>{if(!nav?.contains(e.target))closeMenus()});
document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;const open=dropdowns.find(d=>!d.panel.hidden);const target=open?open.toggle:menu;closeMenus();target?.focus()});
document.querySelectorAll('.navigation a').forEach(a=>a.addEventListener('click',closeMenus));
const track=document.querySelector('#arcTrack');
function layout(){if(!track)return;const cards=[...track.children];if(innerWidth<=640){cards.forEach(c=>{c.style.transform='';c.style.left='';c.style.zIndex=''});return}const mid=(cards.length-1)/2,gap=Math.min(183,innerWidth/8.1);cards.forEach((c,i)=>{const o=i-mid,a=Math.abs(o);c.style.left=(o*gap-85)+'px';c.style.transform=`translate3d(0,${a*a*6}px,${-a*a*20}px) rotateY(${-o*15}deg) rotateZ(${o*1.8}deg)`;c.style.zIndex=String(10-Math.round(a));c.style.animationDelay=(a*.06)+'s'})}
layout();addEventListener('resize',layout);
// Contexte de la demande : page d'origine, campagne et provenance, conservés le temps de la visite.
const KEEP=['utm_source','utm_medium','utm_campaign','gclid'];
function memory(key,value){try{if(value!==undefined)sessionStorage.setItem(key,value);return sessionStorage.getItem(key)||''}catch{return value||''}}
(function context(){
 const form=document.querySelector('#leadForm');if(!form)return;
 const params=new URLSearchParams(location.search);
 KEEP.forEach(k=>{const v=params.get(k);if(v)memory(k,v.slice(0,200))});
 let first='';
 try{first=localStorage.getItem('shyft:first')||'';if(!first){first=new Date().toISOString();localStorage.setItem('shyft:first',first)}}catch{first=new Date().toISOString()}
 const ref=document.referrer&&!document.referrer.includes(location.host)?document.referrer.slice(0,300):'';
 const values={page:location.pathname,referrer:ref,firstSeen:first};
 KEEP.forEach(k=>values[k]=memory(k));
 Object.entries(values).forEach(([name,value])=>{const input=form.querySelector(`input[name="${name}"]`);if(input)input.value=value});
})();
const form=document.querySelector('#leadForm');
form?.addEventListener('submit',async event=>{event.preventDefault();const error=document.querySelector('#formError'),button=form.querySelector('button[type="submit"]');error.style.display='none';const data=Object.fromEntries(new FormData(form));if(!form.reportValidity())return;button.disabled=true;button.textContent='Envoi en cours…';try{if(location.protocol==='file:')throw Error('Le formulaire nécessite le serveur du site pour envoyer votre demande.');const response=await fetch('/api/lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});let result={};try{result=await response.json()}catch{}if(!response.ok||!result.ok)throw Error(result.error||'La demande n’a pas été envoyée. Réessayez dans un instant.');form.classList.add('sent');form.querySelector('.done').setAttribute('tabindex','-1');form.querySelector('.done').focus();document.dispatchEvent(new CustomEvent('shyft:lead',{detail:{secteur:data.secteur||''}}))}catch(e){error.textContent=e.message||'La demande n’a pas été envoyée. Réessayez dans un instant.';error.style.display='block'}finally{button.disabled=false;button.textContent='Recevoir mon audit offert'}});

// A transparent calculation, never a promised or observed business result.
document.querySelectorAll('[data-growth]').forEach(calculator=>{
 const inputs=Object.fromEntries([...calculator.querySelectorAll('[data-input]')].map(el=>[el.dataset.input,el]));
 const outputs=Object.fromEntries([...calculator.querySelectorAll('[data-output]')].map(el=>[el.dataset.output,el]));
 const format=new Intl.NumberFormat('fr-FR',{maximumFractionDigits:2});
 function update(){
  const invalid=Object.values(inputs).some(input=>!input.validity.valid||input.value.trim()==='');
  calculator.querySelector('.growth-error').hidden=!invalid;
  calculator.querySelector('.growth-results').toggleAttribute('data-invalid',invalid);
  if(invalid){Object.values(outputs).forEach(el=>el.textContent='—');return;}
  const leads=Number(inputs.leads.value),rate=Number(inputs.rate.value),value=Number(inputs.value.value),clients=leads*rate/100;
  outputs.leads.textContent=format.format(leads);outputs.clients.textContent=format.format(clients);
  outputs.revenue.textContent=format.format(clients*value);
  outputs.formula.textContent=`${format.format(leads)} prospects × ${format.format(rate)} % × ${format.format(value)} €`;
 }
 Object.values(inputs).forEach(input=>input.addEventListener('input',update));update();
});
