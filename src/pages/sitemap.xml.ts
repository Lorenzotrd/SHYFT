// Plan du site : les pages indexables, dans l'ordre de navigation, en français puis en anglais.
// Chaque adresse annonce sa version dans l'autre langue (hreflang), comme l'en-tête des pages.
import type { APIRoute } from 'astro';
import { SITE_URL } from '../lib/site';
import { services, legalPages } from '../lib/content';
import { LANGS, ui, pathsFor, type Paths } from '../lib/i18n';

export const GET: APIRoute = async () => {
  const [x, legal] = await Promise.all([services('fr'), legalPages('fr')]);
  const pages: Paths[] = [
    pathsFor((r) => r.home),
    ...x.map((s) => pathsFor((r) => r.service(s.id))),
    pathsFor((r) => r.audit),
    ...legal.map((p) => pathsFor((r) => r.page(p.id))),
  ];
  const links = (paths: Paths) =>
    LANGS.map((l) => `    <xhtml:link rel="alternate" hreflang="${ui[l].htmlLang}" href="${SITE_URL}${paths[l]}"/>\n`).join('')
    + `    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}${paths.fr}"/>\n`;
  const urls = LANGS.flatMap((lang) => pages.map((paths) => `  <url>\n    <loc>${SITE_URL}${paths[lang]}</loc>\n${links(paths)}  </url>\n`));
  const body = '<?xml version="1.0" encoding="UTF-8"?>\n'
    + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
    + urls.join('') + '</urlset>\n';
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
