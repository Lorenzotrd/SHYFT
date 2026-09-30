// Langues du site : le français à la racine, l'anglais sous /en.
// Les fichiers de contenu anglais gardent les identifiants français (src/content/en/…) ;
// seules les adresses changent, via les correspondances ci-dessous.

export type Lang = 'fr' | 'en';
export const LANGS: readonly Lang[] = ['fr', 'en'];

/** Langue d'une page, d'après son adresse. */
export const langOf = (url: URL): Lang => (url.pathname === '/en' || url.pathname.startsWith('/en/') ? 'en' : 'fr');

/** Adresse anglaise d'un service, quand elle diffère de l'identifiant français. */
const SERVICE_SLUG_EN: Record<string, string> = { 'agence-ia': 'ai-automation', 'creation-site': 'website-design' };
/** Adresse anglaise d'une page légale. */
const PAGE_SLUG_EN: Record<string, string> = { 'mentions-legales': 'legal-notice', confidentialite: 'privacy-policy' };

export const serviceSlug = (id: string, lang: Lang) => (lang === 'en' ? SERVICE_SLUG_EN[id] ?? id : id);
export const pageSlug = (id: string, lang: Lang) => (lang === 'en' ? PAGE_SLUG_EN[id] ?? id : id);

const routes = (lang: Lang) => {
  const en = lang === 'en';
  const home = en ? '/en' : '/';
  return {
    home,
    /** Ancre de l'accueil : /#methode, /en#methode. */
    anchor: (id: string) => `${home}#${id}`,
    service: (id: string) => (en ? `/en/services/${serviceSlug(id, lang)}` : `/expertises/${id}`),
    audit: en ? '/en/free-audit' : '/audit-offert',
    auditMerci: en ? '/en/free-audit/thank-you' : '/audit-offert/merci',
    /** Prise de rendez-vous : page avec le calendrier Cal.com intégré (la fenêtre s'ouvre au clic si le script charge). */
    rdv: en ? '/en/book-a-call' : '/rendez-vous',
    rdvMerci: en ? '/en/booking/thank-you' : '/rendez-vous/merci',
    page: (id: string) => (en ? `/en/${pageSlug(id, lang)}` : `/${id}`),
    /** Pages sans version anglaise : null en anglais. */
    about: en ? null : '/a-propos',
    blog: en ? null : '/blog',
  };
};

export type Routes = ReturnType<typeof routes>;
export const route: Record<Lang, Routes> = { fr: routes('fr'), en: routes('en') };

/** Adresse d'une même page dans chaque langue, pour hreflang et le sélecteur de langue.
 *  Une page sans version anglaise (à propos, blog) n'a que fr : ni hreflang, et le sélecteur mène à l'accueil anglais. */
export type Paths = { fr: string; en?: string };
export const pathsFor = (pick: (r: Routes) => string): Paths => ({ fr: pick(route.fr), en: pick(route.en) });

/** Libellés fixes du code (hors contenu Keystatic). */
export const ui = {
  fr: {
    htmlLang: 'fr', ogLocale: 'fr_FR', inLanguage: 'fr-FR',
    skip: 'Aller au contenu',
    ogAlt: 'SHYFT Growth, agence digitale pour PME : SEO, Google Ads, Meta Ads, Google Maps et IA',
    nav: {
      home: 'shyft, accueil', about: 'À propos', call: 'Appeler le', main: 'Navigation principale', open: 'Ouvrir le menu', close: 'Fermer le menu',
      switchLabel: 'Read this page in English', switchText: 'EN',
      groupes: { 'Acquisition et visibilité': 'Acquisition et visibilité', 'Conversion et mesure': 'Conversion et mesure', 'IA et automatisation': 'IA et automatisation' },
    },
    footer: {
      services: 'Services', agence: 'Agence', about: 'À propos', blog: 'Blog', audit: 'Audit offert', rdv: 'Prendre rendez-vous',
      legal: 'Mentions légales', privacy: 'Confidentialité', cookies: 'Gérer les cookies',
    },
    crumbs: 'Fil d’Ariane',
    rdvPage: {
      seoTitle: 'Prendre rendez-vous avec SHYFT | 30 minutes en visio',
      seoDescription: 'Réservez un appel de 30 minutes en visio avec un expert SHYFT : SEO, Google Ads, Meta Ads, site, tracking ou IA. Gratuit et sans engagement.',
      h1: 'Prendre rendez-vous avec un expert acquisition',
      calendar: 'Calendrier de réservation',
      fallback: 'Le calendrier ne s’affiche pas ?', fallbackLink: 'Réserver directement sur Cal.com',
      phone: 'Ou appelez-nous', email: 'Ou écrivez-nous',
    },
    eventail: 'Exemples de demandes et de suivis, données d’illustration',
    geo: {
      keyword: 'Mot clé', zone: 'Zone', points: 'points', average: 'Position moyenne', top3: 'Zone en top 3',
      rivals: 'Face aux concurrents', you: 'Votre entreprise', beyond: 'Au delà', mid: '4 à 10',
      decimal: ',', percent: (n: number) => `${n} %`,
      map: (avg: string, top: string, n: number) => `Carte d'exemple : position moyenne ${avg}, ${top} de la zone en top 3 sur ${n} points.`,
    },
    form: {
      honeypot: 'Ne pas remplir', privacy: 'Politique de confidentialité', sending: 'Envoi en cours…',
      failed: 'La demande n’a pas été envoyée. Réessayez dans un instant.',
      noscript: 'Le formulaire a besoin de JavaScript. Vous pouvez aussi', noscriptLink: 'prendre rendez-vous',
    },
  },
  en: {
    htmlLang: 'en', ogLocale: 'en_US', inLanguage: 'en-US',
    skip: 'Skip to content',
    ogAlt: 'SHYFT Growth, digital agency for small businesses: SEO, Google Ads, Meta Ads, Google Maps and AI',
    nav: {
      home: 'shyft, home', about: 'About', call: 'Call', main: 'Main navigation', open: 'Open menu', close: 'Close menu',
      switchLabel: 'Lire cette page en français', switchText: 'FR',
      groupes: { 'Acquisition et visibilité': 'Acquisition & visibility', 'Conversion et mesure': 'Conversion & tracking', 'IA et automatisation': 'AI & automation' },
    },
    footer: {
      services: 'Services', agence: 'Agency', about: 'About', blog: 'Blog', audit: 'Free audit', rdv: 'Book a call',
      legal: 'Legal notice', privacy: 'Privacy', cookies: 'Cookie settings',
    },
    crumbs: 'Breadcrumb',
    rdvPage: {
      seoTitle: 'Book a call with SHYFT | 30-minute video call',
      seoDescription: 'Book a free 30-minute video call with a SHYFT expert: SEO, Google Ads, Meta Ads, websites, tracking or AI. No commitment.',
      h1: 'Book a call with a customer acquisition expert',
      calendar: 'Booking calendar',
      fallback: 'Calendar not showing?', fallbackLink: 'Book directly on Cal.com',
      phone: 'Or call us', email: 'Or email us',
    },
    eventail: 'Sample leads and reports, illustrative data',
    geo: {
      keyword: 'Keyword', zone: 'Area', points: 'points', average: 'Average rank', top3: 'Area in the top 3',
      rivals: 'Vs. competitors', you: 'Your business', beyond: 'Beyond', mid: '4 to 10',
      decimal: '.', percent: (n: number) => `${n}%`,
      map: (avg: string, top: string, n: number) => `Sample map: average rank ${avg}, ${top} of the area in the top 3 across ${n} points.`,
    },
    form: {
      honeypot: 'Leave empty', privacy: 'Privacy policy', sending: 'Sending…',
      failed: 'Your request was not sent. Please try again in a moment.',
      noscript: 'This form needs JavaScript. You can also', noscriptLink: 'book a call',
    },
  },
} as const;
