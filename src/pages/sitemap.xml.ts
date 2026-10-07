// Plan du site : les pages indexables, dans l'ordre de navigation, en français puis en anglais.
// Articles du blog : publiés seulement (les brouillons ne sont ni construits ni listés).
// Hors sitemap : pages légales, pages merci et 404 (toutes en noindex).
// Les versions dans l'autre langue (hreflang) sont annoncées dans l'en-tête de chaque page, pas ici.
import type { APIRoute } from 'astro';
import { SITE_URL } from '../lib/site';
import { services, publishedPosts } from '../lib/content';
import { LANGS, route } from '../lib/i18n';

export const GET: APIRoute = async () => {
  const [x, postsFr, postsEn] = await Promise.all([services('fr'), publishedPosts('fr'), publishedPosts('en')]);
  const posts = { fr: postsFr, en: postsEn };
  const urls = LANGS.flatMap((lang) => {
    const r = route[lang];
    return [r.home, ...x.map((s) => r.service(s.id)), r.audit, r.rdv, r.about, r.blog, ...posts[lang].map((p) => `${r.blog}/${p.id}`)].filter((u): u is string => Boolean(u));
  });
  const body = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + urls.map((u) => `  <url><loc>${SITE_URL}${u}</loc></url>\n`).join('') + '</urlset>\n';
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
