// Panneau d'administration : liste des demandes, export CSV, suppression. Protégé par ADMIN_PASSWORD.
import {listLeads, deleteLead, storeMode} from '../lib/store.mjs';
import {adminReady, checkPassword, bearer, toCsv} from '../lib/admin.mjs';

export default async function handler(req, res) {
 res.setHeader('Cache-Control', 'no-store');
 res.setHeader('X-Robots-Tag', 'noindex, nofollow');
 if (!adminReady()) return res.status(503).json({error: 'Le panneau n’est pas encore configuré : il manque la variable ADMIN_PASSWORD.'});
 if (!checkPassword(bearer(req.headers))) {
  await new Promise(r => setTimeout(r, 400)); // Ralentit les tentatives répétées.
  return res.status(401).json({error: 'Mot de passe incorrect.'});
 }
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
