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

const section = { kicker: z.string(), title: lines, sub: lines };

const accueil = single('accueil', z.object({
  seoTitle: z.string(),
  seoDescription: z.string(),
  hero: z.object({ eyebrow: z.string(), title: z.string(), title2: z.string(), lead: z.string(), ctaMethod: z.string(), ctaAudit: z.string(), caption: z.string() }),
  why: z.object({
    ...section,
    tiles: z.object({
      sky: z.object({ eyebrow: z.string(), big: z.string(), text: z.string() }),
      grey: z.object({ eyebrow: z.string(), stat: z.string(), statUnit: z.string(), title: lines, text: z.string(), link: z.string() }),
      lime: z.object({ eyebrow: z.string(), stat: z.string(), text: z.string() }),
      dark: z.object({ text: lines }),
    }),
  }),
  sectors: z.object({ ...section, tail: z.string(), tailLink: z.string() }),
  expertises: z.object({ ...section, tail: z.string(), tailLink: z.string() }),
  audit: z.object({
    kicker: z.string(), title: z.string(), items: z.array(z.string()), cta: z.string(),
    reportTitle: z.string(), reportLabel: z.string(),
    rows: z.array(z.object({ label: z.string(), detail: z.string(), tag: z.string(), state: z.enum(['ok', 'warn', 'bad']) })),
  }),
  measure: z.object({ ...section, boardTitle: z.string(), boardLabel: z.string(), tail: z.string(), tailLink: z.string() }),
  method: z.object({
    kicker: z.string(), title: z.string(), payTitle: z.string(), payText: z.string(),
    paySide: z.array(z.object({ title: z.string(), text: z.string() })),
  }),
  faq: z.object({ kicker: z.string(), title: z.string(), items: z.array(faq) }),
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

export const collections = { secteurs, expertises, pages, accueil, navigation, leviers, methode, mesure, formulaire, piedDePage, listes };
