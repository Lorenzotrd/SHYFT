// Plan du site : les dix-huit pages publiques, dans l'ordre de navigation.
import type { APIRoute } from 'astro';
import { SITE_URL } from '../lib/site';
import { sectors, expertises } from '../lib/content';

export const GET: APIRoute = async () => {
  const [s, x] = await Promise.all([sectors(), expertises()]);
  const urls = ['', 'expertises', ...x.map((e) => `expertises/${e.id}`), 'secteurs', ...s.map((e) => `secteurs/${e.id}`), 'mentions-legales', 'confidentialite'];
  const body = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + urls.map((u) => `  <url><loc>${SITE_URL}/${u}</loc></url>\n`).join('') + '</urlset>\n';
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
