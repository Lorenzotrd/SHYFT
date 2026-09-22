// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';

// Site statique : les 18 pages sont générées au build. Seules les routes de Keystatic
// (/keystatic, /api/keystatic) et les deux fonctions du formulaire (/api/lead, /api/admin)
// tournent à la demande, d'où l'adaptateur.
export default defineConfig({
  site: 'https://www.shyftgrowth.com',
  output: 'static',
  adapter: vercel(),
  trailingSlash: 'never',
  // Le HTML n'est pas compressé : les espaces entre éléments en ligne sont significatifs
  // et les gabarits sont écrits sans espace superflu.
  compressHTML: false,
  integrations: [react(), keystatic()],
});
