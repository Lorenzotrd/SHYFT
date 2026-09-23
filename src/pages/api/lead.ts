// POST /api/lead : réception d'une demande d'audit. Validation, stockage et transmission dans lib/lead.mjs.
import type { APIRoute } from 'astro';
// @ts-ignore — module JavaScript partagé avec le serveur local
import { handleLead } from '../../../lib/lead.mjs';
import { services as allServices } from '../../lib/content';

export const prerender = false;

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });

export const ALL: APIRoute = async ({ request }) => {
  const headers = Object.fromEntries(request.headers) as Record<string, string>;
  // Leviers acceptés : les six fiches de la collection « services », adresse → nom affiché dans la feuille et l'email.
  const services = Object.fromEntries((await allServices()).map((s) => [s.id, s.data.nom]));
  const { status, body } = await handleLead({ method: request.method, headers, readRaw: () => request.text(), services });
  return json(status, body);
};
