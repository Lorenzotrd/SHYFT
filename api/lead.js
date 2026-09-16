// Fonction Vercel : POST /api/lead. Configurer LEAD_WEBHOOK_URL (et LEAD_WEBHOOK_TOKEN si besoin) dans le projet Vercel.
import {handleLead,readStream} from '../lib/lead.mjs';

function readRaw(req){
 // Vercel pré-analyse le corps JSON ; sinon on lit le flux.
 if(typeof req.body==='string')return async()=>req.body;
 if(req.body&&typeof req.body==='object')return async()=>JSON.stringify(req.body);
 return ()=>readStream(req);
}

export default async function handler(req,res){
 const {status,body}=await handleLead({method:req.method,headers:req.headers,readRaw:readRaw(req)});
 res.setHeader('Cache-Control','no-store');
 res.status(status).json(body);
}
