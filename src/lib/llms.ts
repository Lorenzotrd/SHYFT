// Textes pour les moteurs IA (llms.txt, llms-full.txt), construits au build à partir des mêmes contenus que les pages.
import { SITE_URL, CONTACT, FOUNDERS, founderName, texteSeul } from './site';
import { services, single, type Service } from './content';
import { route, type Lang } from './i18n';

/** Texte brut : sans *italique*, sans syntaxe de lien, retours à la ligne aplatis. */
export const plain = (text: string) => texteSeul(text).replace(/\s*\n\s*/g, ' ').trim();

const url = (path: string) => `${SITE_URL}${path}`;

export async function llmsIndex(): Promise<string> {
  const [fr, en, site] = await Promise.all([services('fr'), services('en'), single('site', 'fr')]);
  const rf = route.fr;
  const contact = [
    `- Email : ${CONTACT.email}`,
    CONTACT.phone && `- Téléphone : ${CONTACT.phoneDisplay || CONTACT.phone}`,
    `- Audit offert (gratuit, réponse en 24 h) : ${url(rf.audit)}`,
    `- Prendre rendez-vous (30 minutes en visio) : ${site.calUrl}`,
  ].filter(Boolean);
  return [
    '# SHYFT Growth',
    '',
    '> SHYFT est une agence d’acquisition pour PME : référencement (SEO, SEO local, GEO), Google Ads, Meta Ads, création de site, tracking des conversions et automatisation IA.',
    '',
    'SHYFT installe et pilote le canal commercial digital des PME bien implantées sur le terrain : capter les demandes de leur marché, les convertir et mesurer le chiffre d’affaires qu’elles rapportent.',
    'Méthode en trois temps : un audit offert et un plan chiffré, un test sur 60 jours, puis un pilotage mensuel au résultat, avec un seul interlocuteur.',
    `Agence fondée par ${FOUNDERS.map(founderName).join(' et ')}, au service de clients en France, au Canada et aux États-Unis. Les comptes publicitaires, fiches Google et sites restent la propriété du client.`,
    '',
    '## Services',
    '',
    ...fr.map((s) => `- [${s.data.hero.h1}](${url(rf.service(s.id))}) : ${plain(s.data.carte.texte)}`),
    '',
    '## Pour qui',
    '',
    '- PME françaises bien implantées localement qui veulent plus de demandes (appels, devis, rendez-vous) et savoir d’où elles viennent.',
    '- Négoces et distributeurs BTP, loueurs de matériel, réseaux multi-agences et franchises.',
    '- Entreprises au Canada et aux États-Unis, accompagnées en anglais.',
    '',
    '## Contact',
    '',
    ...contact,
    '',
    '## English',
    '',
    `- [Home](${url(route.en.home)})`,
    ...en.map((s) => `- [${s.data.hero.h1}](${url(route.en.service(s.id))}) : ${plain(s.data.carte.texte)}`),
    `- [Free audit](${url(route.en.audit)})`,
    '',
    '## Optional',
    '',
    `- [Contenu complet des pages services](${url('/llms-full.txt')})`,
    '',
  ].join('\n');
}

const labels = {
  fr: { promise: 'Promesse', problems: 'Problèmes fréquents', setup: 'Ce qu’on met en place', steps: 'Déroulé', tracked: 'Suivi chaque mois', faq: 'Questions fréquentes' },
  en: { promise: 'Promise', problems: 'Common problems', setup: 'What we set up', steps: 'Process', tracked: 'Tracked every month', faq: 'FAQ' },
};

function servicePage(s: Service, lang: Lang): string {
  const d = s.data;
  const l = labels[lang];
  const items = (list: { titre: string; texte: string }[]) => list.map((x) => `- ${plain(x.titre)} : ${plain(x.texte)}`);
  return [
    `## ${d.hero.h1}`,
    '',
    `URL : ${url(route[lang].service(s.id))}`,
    '',
    `${l.promise} : ${plain(d.hero.titre)}. ${plain(d.hero.texte)}`,
    '',
    `### ${plain(d.problemesTitre)}`, '', ...items(d.problemes), '',
    `### ${plain(d.miseEnPlaceTitre)}`, '', ...items(d.miseEnPlace), '',
    `### ${l.steps}`, '', ...d.etapes.map((e, i) => `${i + 1}. ${plain(e.titre)} : ${plain(e.texte)}`), '',
    `### ${l.tracked}`, '', ...d.suivi.map((x) => `- ${plain(x)}`), '',
    `### ${l.faq}`, '', ...d.faq.flatMap((f) => [`**${f.question}**`, f.answer, '']),
  ].join('\n');
}

export async function llmsFull(): Promise<string> {
  const [fr, en, home] = await Promise.all([services('fr'), services('en'), single('accueil', 'fr')]);
  return [
    '# SHYFT Growth : contenu des pages services',
    '',
    `> ${plain(home.hero.h1)}. ${plain(home.hero.texte)}`,
    '',
    `Index : ${url('/llms.txt')}. Contact : ${CONTACT.email}. Audit offert : ${url(route.fr.audit)}.`,
    '',
    ...fr.map((s) => servicePage(s, 'fr')),
    '# English version',
    '',
    ...en.map((s) => servicePage(s, 'en')),
  ].join('\n');
}
