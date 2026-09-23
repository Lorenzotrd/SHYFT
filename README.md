# SHYFT

## Positionnement

SHYFT construit le canal commercial digital des PME bien implantées sur le terrain : identifier les demandes de leur marché, les capter, les convertir et mesurer le chiffre d'affaires qu'elles rapportent. Sur le site, la même idée est dite avec les mots des clients : « les demandes qui vous manquent en ligne ». Méthode en trois temps : Identifier (audit offert et plan chiffré), Construire (test de 60 jours), Développer (pilotage au résultat).

Site de l'agence : SEO, Google Ads, Meta Ads, IA et mesure pour les PME et réseaux français. Bleu ciel, photographies de nuages, accent citron, cartes en arc, six pages métier, sept pages expertise, section Mesure & suivi, pages légales et formulaire connecté à une API.

## Direction « shyft » (branche `redesign`)

Fond gris, noir profond, jaune `#F9C940`, Instrument Sans et un mot en Instrument Serif italique dans chaque grand titre (noté `*mot*` dans le contenu). Maquettes de référence : `shyft-design-maquettes.zip`.

- Gabarit `src/layouts/Site.astro` et tokens `src/styles/tokens.css`. Seules les pages secteurs (en `noindex`) et le panneau `/admin` gardent l'ancien gabarit `Base.astro` et l'ancien CSS.
- Composants communs dans `src/components/shyft`, sections de l'accueil dans `src/components/home`, blocs des pages services dans `src/components/service`, demande d'audit dans `src/components/audit`.
- Contenus (Keystatic) : `site/accueil.yaml`, `site/site.yaml` (lien Cal.com, menu, pied de page), `site/rendez-vous.yaml`, `site/service-commun.yaml`, `site/audit-offert.yaml`, et la collection `services/*.yaml` : une fiche par page service, le nom du fichier est l'adresse `/expertises/<fichier>`. Les blocs « couverture » et « GeoGrid » s'activent par une case à cocher ; la GeoGrid est calculée à partir d'un tableau de positions 7 × 7.
- Redirections 301 dans `vercel.json` : `/expertises` vers `/#services`, `/expertises/geo` vers `/expertises/seo`, `/expertises/landing-pages-cro` vers `/expertises/creation-site`.
- Mesure : `generate_lead` et `demande_audit` sur la page merci, une seule fois par demande (ni rechargement ni visite directe), `clic_rendez_vous` sur tout lien Cal.com (avec son emplacement), toujours après consentement. Une conversion arrivée avant la réponse au bandeau attend la décision. Conversion Google Ads et pixel Meta prêts : renseigner `ADS_CONVERSION` et `META_PIXEL_ID` dans `src/lib/site.ts` (vides, rien n'est envoyé ; renseignés, le bandeau mentionne la mesure publicitaire, et la politique de confidentialité doit être mise à jour).
- Chaque demande déclenche un email immédiat, envoyé par le script Google Sheets (`scripts/google-sheet.gs`, propriété `NOTIFY_EMAIL`).
- Tests : `npm test` (API et panneau), `npm run test:audit` (parcours de la page audit dans Chrome).

## Technique

[Astro](https://astro.build) 7, sans framework CSS : les feuilles `public/assets/base.css` et `design.css` sont écrites à la main. Les contenus sont des fichiers YAML dans `src/content`, modifiables dans le navigateur avec [Keystatic](https://keystatic.com) à l'adresse `/keystatic`. Node 22 ou plus récent (`.nvmrc`).

```sh
npm install
npm run dev        # http://127.0.0.1:4321, Keystatic sur /keystatic
npm run build      # site statique dans dist/, prêt pour Vercel
npm test           # formulaire et panneau, de bout en bout
```

## Pages

Adresses sans extension ni barre oblique finale.

| Adresse | Contenu | Source |
| --- | --- | --- |
| `/` | Accueil : en-tête, éventail de cartes, pourquoi nous, six leviers, méthode, résultats, audit, rendez-vous, FAQ | `src/pages/index.astro`, contenu `site/accueil.yaml` |
| `/expertises/<slug>` | Les six pages services : `seo`, `google-ads`, `meta-ads`, `agence-ia`, `creation-site`, `data-tracking` | `src/pages/expertises/[slug].astro`, contenu `services/<slug>.yaml` |
| `/audit-offert` | Demande d'audit : leviers à auditer, entreprise | `src/pages/audit-offert.astro`, contenu `site/audit-offert.yaml` |
| `/audit-offert/merci` | Remerciement après une demande réussie (noindex, hors sitemap) ; la conversion y est comptée | `src/pages/audit-offert/merci.astro`, contenu `site/merci.yaml` |
| `/secteurs`, `/secteurs/<slug>` | Pages métier, en ligne mais en `noindex`, hors sitemap et hors menu | `src/pages/secteurs/` |
| `/mentions-legales`, `/confidentialite` | Pages légales | `src/pages/[page].astro`, contenu `pages/<slug>.yaml` |
| `/admin` | Panneau privé des demandes, exclu des robots | `src/pages/admin.astro` |

## Modifier les contenus

Deux façons, pour le même résultat : un commit sur le dépôt, que Vercel redéploie.

- **Dans le navigateur** : `/keystatic` (en local avec `npm run dev`, ou en ligne une fois l'app GitHub configurée, voir plus bas). Chaque secteur, chaque expertise et chaque bloc de l'accueil a son formulaire, en français. Un retour à la ligne dans un titre devient un passage à la ligne à l'écran.
- **Dans les fichiers** : `src/content/secteurs/*.yaml`, `src/content/expertises/*.yaml`, `src/content/site/*.yaml` (accueil, listes, méthode, mesure, formulaire, pied de page, navigation, leviers), `src/content/pages/*.yaml` (pages légales, corps en HTML).

Le schéma des fichiers est vérifié au build (`src/content.config.ts`) : une faute de structure fait échouer le déploiement au lieu de casser une page. Le même schéma est décrit pour Keystatic dans `keystatic.config.ts` ; les deux doivent évoluer ensemble.

Les interfaces de démonstration (page de résultats Google, conversation IA, tableau de bord…) et les visuels propres à chaque métier sont dans `src/components` : ce sont des illustrations à données fictives, étiquetées « Démonstration ». Aucun chiffre de performance, aucun logo client, tant qu'il n'y a rien de publiable.

## Structure d'une page métier

Colonne vertébrale commune : marché du visiteur, parcours d'une demande en quatre étapes, quatre leviers avec un exemple concret chacun, mesure, simulateur, FAQ, formulaire. Chaque métier a en plus une section qui lui est propre, placée après le marché, le parcours ou les leviers selon le champ `signature.after` du contenu, et dont le visuel vit dans `src/components/secteur/signatures`.

## Mesure d'audience

Google Analytics 4 est intégré. L'identifiant est la constante `GA_ID` de `src/lib/site.ts` ; vide, aucun script de mesure n'est chargé, aucun cookie n'est déposé, aucun bandeau n'apparaît. Une fois activé, rien n'est transmis à Google avant un accord explicite : consentement refusé par défaut, script téléchargé après acceptation seulement, refus mémorisé. Le lien « Gérer les cookies » du pied de page permet de revenir sur son choix. Le panneau `/admin` ne charge jamais la mesure.

Les polices Geist et Geist Mono sont hébergées sur le site (`public/assets/fonts`) : aucune requête vers un tiers.

## Formulaire et panneau des demandes

`POST /api/lead` valide la demande (`lib/lead.mjs`), l'enregistre et la transmet au webhook `LEAD_WEBHOOK_URL` (feuille Google Sheets, voir `scripts/google-sheet.gs`). Sans cette variable ni stockage, le formulaire répond « service pas encore disponible », sans faux succès.

`/admin` affiche les demandes reçues, permet de filtrer, d'exporter en CSV et d'effacer ligne par ligne. Variables d'environnement à créer dans Vercel : `ADMIN_PASSWORD`, et pour le stockage `KV_REST_API_URL` + `KV_REST_API_TOKEN` (Upstash Redis). En local, les demandes vont dans `.leads.json`.

## Déployer

Vercel importe le dépôt GitHub et détecte Astro (`vercel.json`). Les pages sont servies en statique ; `/api/lead`, `/api/admin` et les routes de Keystatic tournent en fonctions. Variables d'environnement : `RESEND_API_KEY` (alerte email à chaque demande, voir `lib/notify.mjs` ; destinataire `NOTIFY_EMAIL`, par défaut team@shyftgrowth.com ; expéditeur `MAIL_FROM`, par défaut demandes@shyftgrowth.com), `LEAD_WEBHOOK_URL`, `ADMIN_PASSWORD`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`, et pour Keystatic en ligne `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET` (créées par l'assistant de Keystatic à la première visite de `/keystatic` en production).

## Contrôles

- `npm test` : formulaire et panneau de bout en bout, sur un serveur de développement.
- `node scripts/verify.cjs` : les dix-huit pages, la navigation, le consentement, le parcours du formulaire, sans lien `.html` ni débordement mobile (serveur `npm run dev` lancé, `ADMIN_PASSWORD` défini pour vérifier l'enregistrement).
- `node scripts/growth-test.cjs` : le simulateur des six pages métier.
- `python3 scripts/diff-html.py <référence> dist/client` : comparaison structurelle page à page avec un ancien build.
