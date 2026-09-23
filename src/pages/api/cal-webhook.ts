// POST /api/cal-webhook : réservations Cal.com (créées, annulées, reportées). Traitement dans lib/cal.mjs.
import type { APIRoute } from 'astro';
// @ts-ignore — module JavaScript partagé avec le serveur local
import { handleCalWebhook } from '../../../lib/cal.mjs';
import { GA_ID } from '../../lib/site';

export const prerender = false;

export const ALL: APIRoute = async ({ request }) => {
  const headers = Object.fromEntries(request.headers) as Record<string, string>;
  const { status, body } = await handleCalWebhook({ method: request.method, headers, readRaw: () => request.text(), measurementId: GA_ID });
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
};
