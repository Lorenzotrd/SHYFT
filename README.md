# SHYFT

## Positionnement

SHYFT construit le canal commercial digital des PME bien implantées sur le terrain : identifier les demandes de leur marché, les capter, les convertir et mesurer le chiffre d'affaires qu'elles rapportent. Sur le site, la même idée est dite avec les mots des clients : « les demandes qui vous manquent en ligne ». Méthode en trois temps : Identifier (audit offert et plan chiffré), Construire (test de 60 jours), Développer (pilotage au résultat).

Site de l'agence : SEO, Google Ads, Meta Ads, IA et mesure pour les PME et réseaux français. Bleu ciel, photographies de nuages, accent citron, cartes en arc, six pages métier, sept pages expertise, section Mesure & suivi, pages légales et formulaire connecté à une API.

## Refonte en cours (branche `redesign`)

Nouvelle direction : fond gris, noir profond, jaune `#F9C940`, Instrument Sans et un mot en Instrument Serif italique dans chaque grand titre (noté `*mot*` dans le contenu). Maquettes de référence : `shyft-design-maquettes.zip`.

- Gabarit `src/layouts/Site.astro` et tokens `src/styles/tokens.css` pour les pages refaites ; les pages pas encore migrées gardent `Base.astro` et l'ancien CSS.
- Composants communs dans `src/components/shyft` (Nav, Footer, Bouton, Faq, Frise, RendezVous, Icon), sections de l'accueil dans `src/components/home`.
- Contenus : `site/accueil.yaml`, `site/site.yaml` (lien Cal.com, menu, pied de page), `site/rendez-vous.yaml`, collection `services/*.yaml` (une fiche par page, le nom du fichier est l'adresse `/expertises/<fichier>`).
- Secteurs : en ligne, en `noindex`, hors du sitemap et hors du menu des pages refaites.
- Mesure : événement `clic_rendez_vous` sur tout lien Cal.com (avec son emplacement), en plus de `generate_lead`, toujours après consentement.
- Chaque demande déclenche un email immédiat, envoyé par le script Google Sheets (`scripts/google-sheet.gs`, propriété `NOTIFY_EMAIL`).

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
| `/` | Accueil : hero, secteurs, expertises en bento, audit, mesure & suivi, méthode, FAQ, formulaire | `src/pages/index.astro`, contenu `site/accueil.yaml` |
| `/expertises` | Les cinq temps du système, les sept expertises, les six secteurs | `src/pages/expertises/index.astro`, contenu `site/listes.yaml` |
| `/expertises/<slug>` | Une page par expertise : problème, approche, interface de démonstration, détail, parcours, mesure, FAQ | `src/pages/expertises/[slug].astro`, contenu `expertises/<slug>.yaml` |
| `/secteurs` | Les six pages métier | `src/pages/secteurs/index.astro` |
| `/secteurs/<slug>` | Marché, parcours, quatre leviers, mesure, simulateur, section propre au métier, FAQ | `src/pages/secteurs/[slug].astro`, contenu `secteurs/<slug>.yaml` |
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

Vercel importe le dépôt GitHub et détecte Astro (`vercel.json`). Les pages sont servies en statique ; `/api/lead`, `/api/admin` et les routes de Keystatic tournent en fonctions. Variables d'environnement : `LEAD_WEBHOOK_URL`, `ADMIN_PASSWORD`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`, et pour Keystatic en ligne `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET` (créées par l'assistant de Keystatic à la première visite de `/keystatic` en production).

## Contrôles

- `npm test` : formulaire et panneau de bout en bout, sur un serveur de développement.
- `node scripts/verify.cjs` : les dix-huit pages, la navigation, le consentement, le parcours du formulaire, sans lien `.html` ni débordement mobile (serveur `npm run dev` lancé, `ADMIN_PASSWORD` défini pour vérifier l'enregistrement).
- `node scripts/growth-test.cjs` : le simulateur des six pages métier.
- `python3 scripts/diff-html.py <référence> dist/client` : comparaison structurelle page à page avec un ancien build.
