// GET /api/admin : liste des demandes (JSON ou CSV) ; DELETE /api/admin?id= : suppression. Protégé par ADMIN_PASSWORD.
import type { APIRoute } from 'astro';
// @ts-ignore — modules JavaScript partagés avec le serveur local
import { listLeads, deleteLead, storeMode } from '../../../lib/store.mjs';
// @ts-ignore
import { adminReady, checkPassword, bearer, toCsv, clientKey, attemptState, noteFailure, noteSuccess } from '../../../lib/admin.mjs';

export const prerender = false;

const base = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' };
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...base, 'Content-Type': 'application/json; charset=utf-8' } });

export const ALL: APIRoute = async ({ request, url }) => {
  if (!adminReady()) return json(503, { error: 'Panneau non configuré. Ajoutez la variable d’environnement ADMIN_PASSWORD dans les réglages du projet, puis redéployez.' });
  const headers = Object.fromEntries(request.headers) as Record<string, string>;
  const key = clientKey(headers);
  const state = attemptState(key);
  if (state.locked) return json(429, { error: 'Trop de tentatives. Réessayez dans quelques minutes.' });
  if (!checkPassword(bearer(headers))) {
    noteFailure(key);
    await new Promise((r) => setTimeout(r, 400 + state.wait)); // Le délai grandit à chaque échec.
    return json(401, { error: 'Mot de passe incorrect.' });
  }
  noteSuccess(key);
  try {
    if (request.method === 'GET') {
      const leads = await listLeads();
      if (url.searchParams.get('format') === 'csv') {
        const day = new Date().toISOString().slice(0, 10);
        return new Response(toCsv(leads), { status: 200, headers: { ...base, 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="shyft-demandes-${day}.csv"` } });
      }
      return json(200, { ok: true, mode: storeMode(), count: leads.length, leads });
    }
    if (request.method === 'DELETE') {
      const id = url.searchParams.get('id');
      if (!id) return json(400, { error: 'Identifiant manquant.' });
      return json(200, { ok: await deleteLead(id) });
    }
    return json(405, { error: 'Méthode non autorisée.' });
  } catch {
    return json(503, { error: 'Le stockage est momentanément indisponible.' });
  }
};
