/* Shared navigation, illustrative card layout and audit delivery. */
const nav=document.querySelector('.nav');
const menu=document.querySelector('.menu-toggle');
const dropdown=document.querySelector('.dropdown-toggle');
const sectorMenu=document.querySelector('.dropdown-menu');
function closeMenus(){nav?.classList.remove('menu-open');menu?.setAttribute('aria-expanded','false');if(sectorMenu)sectorMenu.hidden=true;dropdown?.setAttribute('aria-expanded','false')}
menu?.addEventListener('click',()=>{const open=nav.classList.toggle('menu-open');menu.setAttribute('aria-expanded',String(open));});
dropdown?.addEventListener('click',()=>{sectorMenu.hidden=!sectorMenu.hidden;dropdown.setAttribute('aria-expanded',String(!sectorMenu.hidden));});
document.addEventListener('click',e=>{if(!nav?.contains(e.target))closeMenus()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){const target=!sectorMenu?.hidden?dropdown:menu;closeMenus();target?.focus()}});
document.querySelectorAll('.navigation a').forEach(a=>a.addEventListener('click',closeMenus));
const track=document.querySelector('#arcTrack');
function layout(){if(!track)return;const cards=[...track.children];if(innerWidth<=640){cards.forEach(c=>{c.style.transform='';c.style.left='';c.style.zIndex=''});return}const mid=(cards.length-1)/2,gap=Math.min(183,innerWidth/8.1);cards.forEach((c,i)=>{const o=i-mid,a=Math.abs(o);c.style.left=(o*gap-85)+'px';c.style.transform=`translate3d(0,${a*a*6}px,${-a*a*20}px) rotateY(${-o*15}deg) rotateZ(${o*1.8}deg)`;c.style.zIndex=String(10-Math.round(a));c.style.animationDelay=(a*.06)+'s'})}
layout();addEventListener('resize',layout);
const form=document.querySelector('#leadForm');
form?.addEventListener('submit',async event=>{event.preventDefault();const error=document.querySelector('#formError'),button=form.querySelector('button[type="submit"]');error.style.display='none';const data=Object.fromEntries(new FormData(form));if(!form.reportValidity())return;button.disabled=true;button.textContent='Envoi en cours…';try{if(location.protocol==='file:')throw Error('Le formulaire nécessite le serveur du site pour envoyer votre demande.');const response=await fetch('/api/lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});let result={};try{result=await response.json()}catch{}if(!response.ok||!result.ok)throw Error(result.error||'La demande n’a pas été envoyée. Réessayez dans un instant.');form.classList.add('sent');form.querySelector('.done').setAttribute('tabindex','-1');form.querySelector('.done').focus()}catch(e){error.textContent=e.message||'La demande n’a pas été envoyée. Réessayez dans un instant.';error.style.display='block'}finally{button.disabled=false;button.textContent='Recevoir mon audit offert'}});

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
