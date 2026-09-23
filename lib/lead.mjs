import {saveLead,storeReady} from './store.mjs';
import {notifyLead} from './notify.mjs';
// Validation et envoi d'une demande d'audit. Partagé par le serveur local et la fonction Vercel.
const FIELDS=['nom','entreprise','secteur','email','site','tel','ville','agences','message','formulaire','website_check',
 'page','utm_source','utm_medium','utm_campaign','gclid','referrer','firstSeen'];
const MAX_BYTES=12000;
const MAX_FIELD=500;
const MAX_LONG={message:2000};
const MAX_SERVICES=20;
const EMAIL=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function sendLead(record){
 if(!process.env.LEAD_WEBHOOK_URL)throw new Error('NOT_CONFIGURED');
 const response=await fetch(process.env.LEAD_WEBHOOK_URL,{method:'POST',headers:{'Content-Type':'application/json',...(process.env.LEAD_WEBHOOK_TOKEN?{Authorization:`Bearer ${process.env.LEAD_WEBHOOK_TOKEN}`}:{})},body:JSON.stringify(record),signal:AbortSignal.timeout(10000)});
 if(!response.ok)throw new Error('DELIVERY_FAILED');
}

// Retourne {status, body} : jamais de faux succès, messages lisibles côté formulaire.
// services : correspondance adresse → nom des leviers autorisés (page audit offert), fournie par la route.
export async function handleLead({method,headers,readRaw,services={}}){
 const reply=(status,body)=>({status,body});
 if(method!=='POST')return reply(405,{error:'Méthode non autorisée.'});
 if(headers.origin){try{if(new URL(headers.origin).host!==headers.host)return reply(403,{error:'Origine non autorisée.'})}catch{return reply(403,{error:'Origine non autorisée.'})}}
 if(!headers['content-type']?.includes('application/json'))return reply(415,{error:'Format invalide.'});
 let raw;try{raw=await readRaw()}catch(e){return reply(e.message==='TOO_LARGE'?413:400,{error:e.message==='TOO_LARGE'?'Formulaire trop volumineux.':'Formulaire invalide.'})}
 if(Buffer.byteLength(raw)>MAX_BYTES)return reply(413,{error:'Formulaire trop volumineux.'});
 let data;try{data=JSON.parse(raw)}catch{return reply(400,{error:'Formulaire invalide.'})}
 if(!data||typeof data!=='object'||Array.isArray(data))return reply(400,{error:'Formulaire invalide.'});
 const clean={};
 for(const key of FIELDS){if(data[key]!==undefined&&typeof data[key]!=='string')return reply(400,{error:'Champs invalides.'});clean[key]=(data[key]||'').trim();if(clean[key].length>(MAX_LONG[key]||MAX_FIELD))return reply(400,{error:'Un champ est trop long.'})}
 if(clean.website_check)return reply(400,{error:'Formulaire invalide.'});delete clean.website_check;
 if(!clean.nom||!clean.entreprise||!clean.secteur||!EMAIL.test(clean.email))return reply(400,{error:'Renseignez votre nom, votre entreprise, votre secteur et un email valide.'});
 // Leviers choisis sur la page audit : liste d'adresses connues, traduites en noms lisibles.
 let levers=[];
 if(data.services!==undefined){
  if(!Array.isArray(data.services)||data.services.length>MAX_SERVICES||data.services.some(s=>typeof s!=='string'||!Object.hasOwn(services,s)))return reply(400,{error:'Leviers invalides.'});
  levers=[...new Set(data.services)];
 }
 if(clean.formulaire==='audit'&&!levers.length)return reply(400,{error:'Choisissez au moins un levier à auditer.'});
 // Une adresse saisie sans protocole (exemple.fr) est complétée en https://.
 if(clean.site&&!/^[a-z][a-z0-9+.-]*:/i.test(clean.site))clean.site='https://'+clean.site;
 if(clean.site){try{if(!['http:','https:'].includes(new URL(clean.site).protocol))throw Error()}catch{return reply(400,{error:'Indiquez une adresse de site valide, commençant par https://.'})}}
 // La demande est conservée pour le panneau, et transmise au CRM si un webhook est configuré.
 const record={...clean,...(levers.length?{services:levers.map(s=>services[s]).join(', ')}:{}),source:'shyft-site',receivedAt:new Date().toISOString()};
 const webhook=Boolean(process.env.LEAD_WEBHOOK_URL);
 if(!storeReady()&&!webhook)return reply(503,{error:'Le service de demande d’audit n’est pas encore disponible. Votre demande n’a pas été envoyée.'});
 let kept=false;
 if(storeReady()){try{await saveLead(record);kept=true}catch{}}
 if(webhook){try{await sendLead(record);kept=true}catch{}}
 if(!kept)return reply(503,{error:'L’envoi a échoué. Veuillez réessayer dans un instant.'});
 // Alerte email à l'équipe, seulement pour une demande bien enregistrée.
 await notifyLead(record);
 return reply(200,{ok:true});
}

// Lit le corps brut d'une requête Node, avec limite de taille.
export async function readStream(req){
 let raw='';for await(const chunk of req){raw+=chunk;if(Buffer.byteLength(raw)>MAX_BYTES)throw new Error('TOO_LARGE')}
 return raw;
}
