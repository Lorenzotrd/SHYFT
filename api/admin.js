// Panneau d'administration : liste des demandes, export CSV, suppression. Protégé par ADMIN_PASSWORD.
import {listLeads, deleteLead, storeMode} from '../lib/store.mjs';
import {adminReady, checkPassword, bearer, toCsv, clientKey, attemptState, noteFailure, noteSuccess} from '../lib/admin.mjs';

export default async function handler(req, res) {
 res.setHeader('Cache-Control', 'no-store');
 res.setHeader('X-Robots-Tag', 'noindex, nofollow');
 if (!adminReady()) return res.status(503).json({error: 'Panneau non configuré. Ajoutez la variable d’environnement ADMIN_PASSWORD dans les réglages du projet, puis redéployez.'});
 const key = clientKey(req.headers);
 const state = attemptState(key);
 if (state.locked) return res.status(429).json({error: 'Trop de tentatives. Réessayez dans quelques minutes.'});
 if (!checkPassword(bearer(req.headers))) {
  noteFailure(key);
  await new Promise(r => setTimeout(r, 400 + state.wait)); // Le délai grandit à chaque échec.
  return res.status(401).json({error: 'Mot de passe incorrect.'});
 }
 noteSuccess(key);
 try {
  if (req.method === 'GET') {
   const leads = await listLeads();
   const url = new URL(req.url, 'http://localhost');
   if (url.searchParams.get('format') === 'csv') {
    const day = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="shyft-demandes-${day}.csv"`);
    return res.status(200).send(toCsv(leads));
   }
   return res.status(200).json({ok: true, mode: storeMode(), count: leads.length, leads});
  }
  if (req.method === 'DELETE') {
   const url = new URL(req.url, 'http://localhost');
   const id = url.searchParams.get('id');
   if (!id) return res.status(400).json({error: 'Identifiant manquant.'});
   return res.status(200).json({ok: await deleteLead(id)});
  }
  return res.status(405).json({error: 'Méthode non autorisée.'});
 } catch {
  return res.status(503).json({error: 'Le stockage est momentanément indisponible.'});
 }
}
