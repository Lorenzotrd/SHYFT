// Plan du site : les pages indexables, dans l'ordre de navigation. Les secteurs, en noindex, n'y figurent pas.
import type { APIRoute } from 'astro';
import { SITE_URL } from '../lib/site';
import { services } from '../lib/content';

export const GET: APIRoute = async () => {
  const x = await services();
  const urls = ['', ...x.map((s) => `expertises/${s.id}`), 'audit-offert', 'mentions-legales', 'confidentialite'];
  const body = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + urls.map((u) => `  <url><loc>${SITE_URL}/${u}</loc></url>\n`).join('') + '</urlset>\n';
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
