// POST /api/lead : réception d'une demande d'audit. Validation, stockage et transmission dans lib/lead.mjs.
import type { APIRoute } from 'astro';
// @ts-ignore — module JavaScript partagé avec le serveur local
import { handleLead } from '../../../lib/lead.mjs';

export const prerender = false;

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });

export const ALL: APIRoute = async ({ request }) => {
  const headers = Object.fromEntries(request.headers) as Record<string, string>;
  const { status, body } = await handleLead({ method: request.method, headers, readRaw: () => request.text() });
  return json(status, body);
};
