// Plan du site : les pages indexables, dans l'ordre de navigation, en français puis en anglais.
// Les versions dans l'autre langue (hreflang) sont annoncées dans l'en-tête de chaque page, pas ici.
import type { APIRoute } from 'astro';
import { SITE_URL } from '../lib/site';
import { services, legalPages } from '../lib/content';
import { LANGS, route } from '../lib/i18n';

export const GET: APIRoute = async () => {
  const [x, legal] = await Promise.all([services('fr'), legalPages('fr')]);
  const urls = LANGS.flatMap((lang) => {
    const r = route[lang];
    return [r.home, ...x.map((s) => r.service(s.id)), r.audit, ...legal.map((p) => r.page(p.id))];
  });
  const body = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + urls.map((u) => `  <url><loc>${SITE_URL}${u}</loc></url>\n`).join('') + '</urlset>\n';
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
