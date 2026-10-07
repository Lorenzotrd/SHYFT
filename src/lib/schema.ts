// Données structurées communes (schema.org). Le nœud ProfessionalService est ajouté à toutes les pages
// par le gabarit Site.astro ; les pages y renvoient par son @id (provider, publisher).
import { SITE_URL, CONTACT, SOCIALS, AREA_SERVED, FOUNDERS, founderName, texteSeul, type Founder } from './site';
import { route, type Lang } from './i18n';
import type { Service } from './content';

export const ORG_ID = `${SITE_URL}/#organisation`;
export const personId = (f: Founder) => `${SITE_URL}/a-propos#${f.id}`;

type Json = string | number | boolean | null | undefined | Json[] | { [key: string]: Json };

/** Retire récursivement les chaînes vides, null, undefined, tableaux et objets vides : aucun champ vide publié. */
export function clean<T extends Json>(value: T): T {
  if (Array.isArray(value)) return value.map(clean).filter((v) => !isEmpty(v)) as T;
  if (value && typeof value === 'object') {
    const entries = Object.entries(value).map(([k, v]) => [k, clean(v)] as const).filter(([, v]) => !isEmpty(v));
    return Object.fromEntries(entries) as T;
  }
  return value;
}
const isEmpty = (v: Json) =>
  v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0) || (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0);

export const areaServed = () => AREA_SERVED.map((name) => ({ '@type': 'Country', name }));

export const person = (f: Founder, lang: Lang) => ({
  '@type': 'Person', '@id': personId(f), name: founderName(f), givenName: f.givenName, familyName: f.familyName,
  jobTitle: lang === 'en' ? 'Co-founder' : 'Cofondateur', image: `${SITE_URL}${f.photo}`,
  worksFor: { '@id': ORG_ID }, sameAs: f.linkedin ? [f.linkedin] : [],
});

/** L'agence, sur toutes les pages : coordonnées, zone desservie, fondateurs, réseaux et catalogue des services. */
export function organisation(lang: Lang, services: Service[]) {
  const r = route[lang];
  return {
    '@context': 'https://schema.org', '@type': 'ProfessionalService', '@id': ORG_ID,
    name: 'SHYFT Growth', alternateName: 'SHYFT', url: `${SITE_URL}/`,
    logo: `${SITE_URL}/assets/icon-512.png`, image: `${SITE_URL}/assets/og.png?v=2`,
    description: lang === 'en'
      ? 'Growth marketing agency: SEO, Google Ads, Meta Ads, websites, conversion tracking and AI automation.'
      : 'Agence d’acquisition pour PME et négoces BTP : SEO, Google Ads, Meta Ads, sites internet, tracking des conversions et automatisation IA.',
    email: CONTACT.email, telephone: CONTACT.phone,
    areaServed: areaServed(), knowsLanguage: ['fr', 'en'],
    founder: FOUNDERS.map((f) => person(f, lang)),
    sameAs: SOCIALS,
    hasOfferCatalog: {
      '@type': 'OfferCatalog', name: 'Services',
      itemListElement: services.map((s) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: s.data.nom, description: texteSeul(s.data.carte.texte), url: `${SITE_URL}${r.service(s.id)}` },
      })),
    },
  };
}
