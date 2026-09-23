// Collections de contenu : chaque fichier YAML de src/content est validé ici avant le build.
// Keystatic écrit ces mêmes fichiers ; le schéma des deux côtés doit rester aligné.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const lines = z.string(); // texte pouvant contenir des retours à la ligne, rendus en <br>
const faq = z.object({ question: z.string(), answer: z.string() });

const secteurs = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/secteurs' }),
  schema: z.object({
    name: z.string(),
    order: z.number(),
    short: z.string(),
    photo: z.string(),
    alt: z.string(),
    seoTitle: z.string(),
    seoDescription: z.string(),
    hero: z.object({ title: lines, lead: z.string(), signal: z.string(), value: z.string() }),
    who: z.string(),
    pain: z.array(z.string()),
    searches: z.array(z.object({ query: z.string(), meaning: z.string(), channel: z.string() })),
    follow: z.string(),
    journey: z.array(z.object({ title: z.string(), text: z.string(), role: z.string() })),
    levers: z.object({ seo: z.string(), ads: z.string(), google: z.string(), conversion: z.string() }),
    examples: z.object({
      seoPages: z.array(z.string()),
      adsKeywords: z.array(z.object({ keyword: z.string(), decision: z.string(), state: z.enum(['ok', 'warn', 'bad']) })),
      google: z.object({ name: z.string(), rating: z.string(), hours: z.string(), actions: z.array(z.string()) }),
      form: z.array(z.object({ question: z.string(), answer: z.string() })),
    }),
    measure: z.array(z.object({ name: z.string(), how: z.string() })),
    pay: z.string(),
    growth: z.object({
      leads: z.number(), rate: z.number(), value: z.number(),
      client: z.string(), unit: z.string(), result: z.string(), note: z.string(),
    }),
    titles: z.object({ journey: lines, levers: lines, measure: lines, growth: lines, faq: lines }),
    signature: z.object({ after: z.enum(['market', 'journey', 'levers']), kicker: z.string(), title: lines, lead: z.string() }),
    faq,
  }),
});

const expertises = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/expertises' }),
  schema: z.object({
    name: z.string(),
    order: z.number(),
    menu: z.string(),
    hint: z.string(),
    card: z.string(),
    tag: z.string(),
    visual: z.enum(['serp', 'ai', 'ads', 'creative', 'workflow', 'funnel', 'dash']),
    size: z.enum(['large', 'small', 'dark']),
    seoTitle: z.string(),
    seoDescription: z.string(),
    hero: z.object({ eyebrow: z.string(), title: lines, lead: z.string(), cta: z.string() }),
    problemTitle: lines,
    problem: z.array(z.string()),
    approach: z.array(z.object({ title: z.string(), text: z.string() })),
    demo: z.object({ title: z.string(), line: z.string() }),
    build: z.array(z.object({ name: z.string(), items: z.array(z.string()) })),
    asideTitle: lines,
    aside: z.string(),
    flow: z.array(z.string()),
    measure: z.array(z.object({ title: z.string(), text: z.string() })),
    complements: z.array(z.object({ expertise: z.string(), why: z.string() })),
    faq: z.array(faq),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(), eyebrow: z.string(), h1: z.string(), lead: z.string(),
    seoTitle: z.string(), seoDescription: z.string(), body: z.string(),
  }),
});

// Réglages du site : un fichier par sujet, chacun sa propre collection à entrée unique.
const single = <S extends z.ZodType>(file: string, schema: S) =>
  defineCollection({ loader: glob({ pattern: `${file}.yaml`, base: './src/content/site' }), schema });


// Accueil refait : chaque bloc de la maquette, dans l'ordre de la page.
const tone = z.enum(['clair', 'sombre', 'accent']);
const pair = z.object({ label: z.string(), valeur: z.string() });
const titled = z.object({ titre: z.string(), texte: z.string() });

const accueil = single('accueil', z.object({
  seoTitle: z.string(),
  seoDescription: z.string(),
  hero: z.object({
    badge: z.string(), badgeTexte: z.string(), titre: lines, texte: z.string(),
    cta: z.string(), ctaSecondaire: z.string(), legende: z.string(),
  }),
  eventail: z.array(z.object({
    type: z.enum(['barres', 'lignes', 'checklist', 'grille', 'sources']),
    ton: tone, mobile: z.boolean(), pastille: z.boolean(),
    surtitre: z.string(), titre: z.string(), pied: z.string(), valeurs: z.string(),
    lignes: z.array(pair),
  })),
  pourquoi: z.object({ titre: lines, texte: z.string(), items: z.array(titled) }),
  services: z.object({ titre: lines, texte: z.string() }),
  methode: z.object({ titre: lines, etapes: z.array(titled) }),
  resultats: z.object({
    titre: lines, texte: z.string(),
    grande: z.object({ surtitre: z.string(), chiffre: z.string(), legende: z.string(), lignes: z.array(pair), cta: z.string() }),
    cartes: z.array(z.object({ surtitre: z.string(), lien: z.string(), service: z.string(), chiffre: z.string(), legende: z.string(), texte: z.string() })),
    note: z.string(),
  }),
  audit: z.object({
    surtitre: z.string(), titre: lines, points: z.array(z.string()), cta: z.string(),
    syntheseTitre: z.string(), syntheseEtiquette: z.string(),
    lignes: z.array(z.object({ sujet: z.string(), constat: z.string(), etiquette: z.string(), etat: z.enum(['ok', 'warn', 'bad']) })),
  }),
  faq: z.object({ surtitre: z.string(), titre: lines, texte: z.string(), cta: z.string(), questions: z.array(faq) }),
}));

// Réglages communs aux pages refaites : navigation, rendez-vous, pied de page.
const site = single('site', z.object({
  calUrl: z.url(),
  nav: z.object({ services: z.string(), methode: z.string(), resultats: z.string(), cta: z.string() }),
  footer: z.object({ accroche: lines, cta: z.string(), editeur: z.string() }),
}));

const rendezVous = single('rendez-vous', z.object({
  pastille: z.string(), titre: lines, texte: z.string(), cta: z.string(), ctaSecondaire: z.string(),
  garanties: z.array(z.string()),
}));

// Bloc facultatif Keystatic (case à cocher) : { discriminant: false } ou { discriminant: true, value: {...} }.
const optional = <S extends z.ZodType>(schema: S) => z.union([
  z.object({ discriminant: z.literal(false), value: z.any().optional() }),
  z.object({ discriminant: z.literal(true), value: schema }),
]);

// Les six services : une fiche par page, le nom du fichier est l'adresse (/expertises/<fichier>).
const services = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/services' }),
  schema: z.object({
    nom: z.string(),
    nomCourt: z.string(),
    ordre: z.number(),
    seoTitle: z.string(),
    seoDescription: z.string(),
    carte: z.object({ texte: z.string(), texteCourt: z.string(), icone: z.enum(['repere', 'cible', 'megaphone', 'robot', 'site', 'graphique']), ton: tone }),
    audit: z.object({ tag: z.string(), description: z.string() }),
    hero: z.object({ titre: lines, texte: z.string() }),
    suivi: z.array(z.string()),
    problemes: z.array(titled),
    miseEnPlace: z.array(titled),
    couverture: optional(z.object({
      titre: lines, texte: z.string(),
      cartes: z.array(z.object({ badge: z.string(), titre: z.string(), texte: z.string(), points: z.array(z.string()) })),
    })),
    etapes: z.array(titled),
    chiffres: z.object({
      titre: lines, lien: z.string(), lienVers: z.enum(['rendez-vous', 'resultats']),
      cartes: z.array(z.object({
        surtitre: z.string(), chiffre: z.string(), unite: z.string(), legende: z.string(), texte: z.string(),
        exempleFictif: z.boolean(), duree: z.string(),
      })),
      note: z.string(),
    }),
    geogrid: optional(z.object({
      surtitre: z.string(), titre: lines, points: z.array(z.string()),
      motCle: z.string(), zone: z.string(),
      concurrents: z.array(z.object({ nom: z.string(), position: z.string() })),
      positions: z.array(z.string()),
    })),
    faq: z.array(faq),
  }),
});

// Libellés identiques sur les six pages services.
const serviceCommun = single('service-commun', z.object({
  filAccueil: z.string(), filServices: z.string(), ctaRdv: z.string(), ctaAudit: z.string(),
  suiviSurtitre: z.string(), suiviTitre: lines,
  problemesTitre: lines, problemeEtiquette: z.string(),
  miseEnPlaceTitre: lines, miseEnPlaceTexte: z.string(),
  friseTitre: lines, faqTitre: lines, faqTexte: z.string(),
  autresLeviers: z.string(), exempleFictif: z.string(),
}));

// Page de demande d'audit offert.
const champ = z.object({ label: z.string(), placeholder: z.string() });
const auditOffert = single('audit-offert', z.object({
  seoTitle: z.string(), seoDescription: z.string(),
  fil: z.string(), titre: lines, texte: z.string(), garanties: z.array(z.string()),
  recevez: z.object({ surtitre: z.string(), points: z.array(z.string()) }),
  etape1: z.object({ surtitre: z.string(), titre: lines, toutAuditer: z.string(), toutDeselectionner: z.string(), compteur: z.string() }),
  etape2: z.object({ surtitre: z.string(), titre: lines }),
  champs: z.object({
    entreprise: champ, site: champ, ville: champ, secteur: champ, nom: champ, email: champ, tel: champ, agences: champ, message: champ,
    facultatif: z.string(),
  }),
  secteurs: z.array(z.string()),
  envoi: z.object({ aucun: z.string(), un: z.string(), plusieurs: z.string(), mention: z.string(), bouton: z.string(), erreur: z.string() }),
  confirmation: z.object({ titre: lines, texte: z.string(), modifier: z.string() }),
}));

const navigation = single('navigation', z.object({
  groups: z.array(z.object({ name: z.string(), expertises: z.array(z.string()) })),
  system: z.array(z.object({ stage: z.string(), line: z.string(), expertises: z.array(z.string()) })),
  sectorExpertises: z.array(z.object({ sector: z.string(), expertises: z.array(z.string()) })),
}));

const leviers = single('leviers', z.object({
  levers: z.array(z.object({
    name: z.string(), subtitle: z.string(),
    key: z.enum(['seo', 'ads', 'google', 'conversion']), expertise: z.string(), kind: z.enum(['serp', 'ads', 'map', 'flow']),
  })),
}));

const methode = single('methode', z.object({
  steps: z.array(z.object({ label: z.string(), title: z.string(), text: z.string() })),
}));

const mesure = single('mesure', z.object({
  tools: z.array(z.object({ name: z.string(), short: z.string(), text: z.string() })),
  dashboard: z.array(z.object({ label: z.string(), detail: z.string(), value: z.string().optional(), tag: z.string().optional() })),
}));

const formulaire = single('formulaire', z.object({
  title: lines, text: z.string(), kicker: z.string(), heading: z.string(), legal: z.string(),
  button: z.string(), error: z.string(), doneTitle: z.string(), doneText: z.string(),
}));

const piedDePage = single('pied-de-page', z.object({
  tagline: lines, nextStep: z.string(), audience: lines, copyright: z.string(), signature: z.string(),
}));

const listes = single('listes', z.object({
  secteurs: z.object({ seoTitle: z.string(), seoDescription: z.string(), eyebrow: z.string(), title: z.string(), title2: z.string(), lead: z.string() }),
  expertises: z.object({
    seoTitle: z.string(), seoDescription: z.string(), eyebrow: z.string(), title: z.string(), title2: z.string(), lead: z.string(),
    ctaMethod: z.string(), ctaAudit: z.string(),
    systemKicker: z.string(), systemTitle: lines, systemSub: z.string(),
    detailKicker: z.string(), detailTitle: z.string(), detailSub: z.string(),
    sectorsKicker: z.string(), sectorsTitle: lines, sectorsSub: z.string(),
  }),
}));

export const collections = { secteurs, expertises, services, pages, accueil, site, rendezVous, serviceCommun, auditOffert, navigation, leviers, methode, mesure, formulaire, piedDePage, listes };
