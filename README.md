# SHYFT

## Positionnement

SHYFT construit le canal commercial digital des PME bien implantées sur le terrain : identifier les demandes de leur marché, les capter, les convertir et mesurer le chiffre d’affaires qu’elles rapportent. Sur le site, la même idée est dite avec les mots des clients : « les demandes qui vous manquent en ligne ». Méthode en trois temps : Identifier (audit offert et plan chiffré), Construire (test de 60 jours), Développer (pilotage au résultat).

Site de l’agence SHYFT : SEO, Google Ads, Meta Ads, IA et mesure pour les PME et réseaux français. HTML léger sans framework : bleu ciel, photographies de nuages, accent citron, cartes en arc, six pages métier, section Mesure & suivi, pages légales et formulaire connecté à une API.

## Voir le site

```sh
npm run dev
```

Ouvrir http://localhost:4173. `index.html` est la page d’accueil pour l’hébergement ; garder les dossiers `assets` et `secteurs` ainsi que les pages légales à côté. L’envoi du formulaire nécessite le serveur.

## Pages

Adresses sans extension, servies par `cleanUrls` sur Vercel et par le serveur local.

| Adresse | Contenu |
| --- | --- |
| `/` | Accueil : hero, secteurs, expertises en bento, audit, mesure & suivi, méthode, FAQ, formulaire |
| `/expertises` | Les cinq temps du système, les sept expertises, les six secteurs |
| `/expertises/seo` | Référencement naturel, SEO local, Google Business Profile et Maps |
| `/expertises/geo` | Référencement dans les moteurs de réponse : ChatGPT, Gemini, Perplexity, Google IA |
| `/expertises/google-ads` | Campagnes Search, locales et Performance Max |
| `/expertises/meta-ads` | Facebook et Instagram : audiences, créations, qualification |
| `/expertises/agence-ia` | Agents, automatisations, CRM, relances |
| `/expertises/landing-pages-cro` | Landing pages, formulaires, optimisation de la conversion |
| `/expertises/data-tracking` | GA4, Tag Manager, suivi des appels, attribution, tableau de bord |
| `/secteurs` et `/secteurs/<métier>` | Les six pages métier |
| `/mentions-legales`, `/confidentialite` | Pages légales |

Chaque page expertise suit la même ossature sans être un clone : problème, approche, interface de démonstration propre au sujet, ce qu’on met en place, point de vigilance, parcours, indicateurs, maillage vers les autres expertises, secteurs concernés, FAQ, formulaire. L’interface change à chaque fois : page de résultats Google pour le SEO, conversation pour le GEO, annonce et termes exclus pour Google Ads, créations comparées pour Meta, chaînes d’automatisation pour l’IA, entonnoir pour la conversion, tableau de bord pour la data.

## Modifier les contenus

- `scripts/expertises.py` : les sept expertises, leurs textes, leurs interfaces de démonstration, le maillage entre elles et la correspondance avec les secteurs (`SECTOR_EXPERTISES`). Ajouter une expertise revient à ajouter une entrée dans `EXPERTISES`, une ligne dans `GROUPS`, une dans `DEMO` et une dans `COMPLEMENTS`.
- `scripts/sector_growth.py` : contenus des six pages métier et hypothèses des simulateurs.
- `scripts/redesign.py` : assemblage des pages, navigation, pied de page, sitemap.

## Mesure & suivi

La section présente ce que SHYFT installe chez ses clients : Search Console, Google Analytics, tableau de bord partagé, CRM et emailing. Le tableau de bord affiché sur l’accueil est une illustration avec des données fictives, étiquetée comme telle. Chaque page métier reprend trois indicateurs propres au secteur et la source de chaque chiffre (`scripts/sector_growth.py`, dictionnaire `MEASURE`). Le site lui-même n’embarque aucun outil de mesure d’audience.

## Déployer sur Vercel

Importer le dépôt GitHub dans Vercel. Le fichier `vercel.json` impose le preset « Other » : pas de build, les pages HTML sont servies telles quelles et `api/lead.js` devient automatiquement la fonction `POST /api/lead`. Le serveur local est rangé dans `scripts/dev-server.mjs` et il n’y a pas de script `start`, sinon Vercel déploie le serveur Node comme application et ne trouve plus les pages. `.vercelignore` écarte les captures, les scripts et l’original. Ajouter la variable d’environnement `LEAD_WEBHOOK_URL` (et `LEAD_WEBHOOK_TOKEN` si l’outil l’exige) dans les réglages du projet, puis redéployer. Sans cette variable, le site s’affiche mais le formulaire répond « service pas encore disponible », sans faux succès. Le fichier `scripts/dev-server.mjs` ne sert qu’en local.

## Envoyer les audits

La validation et l’envoi sont dans `lib/lead.mjs`, partagé par le serveur local (`scripts/dev-server.mjs`, Node 18 ou supérieur) et la fonction Vercel (`api/lead.js`). Configurer `LEAD_WEBHOOK_URL` avec le webhook du CRM ou de l’outil email ; `LEAD_WEBHOOK_TOKEN` est facultatif. Ces secrets restent côté serveur. Sans configuration, l’API retourne une erreur explicite et n’affiche jamais de faux succès. Aucune demande n’est enregistrée localement.

## Avant la mise en ligne

- Renseigner `SITE_URL` dans `scripts/redesign.py` puis régénérer : canonical, `og:image`, `sitemap.xml` et `robots.txt` utilisent cette adresse.
- Compléter les passages surlignés des pages `mentions-legales.html` et `confidentialite.html` (identité de l’entreprise, hébergeur, prestataires, durée de conservation, email de contact).
- Mettre en place une protection contre les abus adaptée à l’hébergement (limitation de débit sur `/api/lead`).

## Organisation

- `assets/base.css` : styles hérités du fichier original.
- `assets/design.css` : direction graphique, responsive, section Mesure et pages légales.
- `lib/lead.mjs` : validation et envoi des demandes ; `api/lead.js` : fonction Vercel ; `scripts/dev-server.mjs` : serveur local.
- `assets/site.js` : menus, cartes, formulaire et simulateurs.
- `assets/sectors.json` : contenus structurés des métiers.
- `assets/og.png` : image de partage 1200 × 630, générée par `scripts/og.cjs`.
- `scripts/redesign.py` : génération de toutes les pages depuis la version originale et les contenus intégrés au script. Modifier les contenus dans ce script avant de régénérer.
- `scripts/sector_growth.py` : contenus SEO, Google Ads, fiches Google, conversion, hypothèses des simulateurs et indicateurs de mesure par secteur.
- `elan-site.original.html` : sauvegarde intacte du site d’origine, dont le script extrait la structure.
- `qa` : captures de contrôle à 1440 et 390 pixels.

## Régénérer

```sh
python3 scripts/redesign.py
npm run dev &
node scripts/og.cjs
```

Les cartes du premier écran et le tableau de bord sont des illustrations, pas des résultats clients. Aucun témoignage, logo client ou chiffre de marché non vérifié n’est utilisé. Les photographies viennent d’Unsplash et ne représentent ni l’équipe ni des clients. Identifiants : ciel `photo-1501630834273-4b5604d2ee31`, location `photo-1504307651254-35680f356dfd`, franchise `photo-1521737711867-e3b97375f902`, rénovation `photo-1503387762-592deb58ef4e`, immobilier `photo-1600585154340-be6161a56a0c`, domicile `photo-1573497620053-ea5300f94f21`, commerces `photo-1441986300917-64674bd600d8`.

## Contrôles effectués

`npm test` vérifie l’API. `node scripts/verify.cjs` contrôle 17 pages : ouverture et exclusivité des deux menus déroulants, fermeture par Échap, sept expertises dans le mega-menu, titre et meta description uniques par page, fil d’Ariane, interface de démonstration, maillage, FAQ et données structurées complètes (`Service`, `FAQPage`, `BreadcrumbList`), absence de lien en `.html`, navigation sans chevauchement à 1100 et 1200 pixels, absence de débordement horizontal à 390 pixels sur cinq pages, refus du formulaire sans connecteur et absence d’erreur JavaScript. `scripts/growth-test.cjs` vérifie les six simulateurs. Ces scripts utilisent le Playwright et le Chrome locaux ; adapter leur chemin sur une autre machine.

## À faire avant la mise en ligne

- Renseigner `SITE_URL` dans `scripts/redesign.py`, puis régénérer : canonical, `og:image`, sitemap et données structurées en dépendent.
- Compléter les passages surlignés des pages légales.
- Ajouter `LEAD_WEBHOOK_URL` dans les variables d’environnement Vercel.
- Page « À propos » : prévue plus tard, volontairement absente de la navigation.
- Aucun cas client, logo, témoignage ni résultat n’est affiché. Les interfaces qui portent des chiffres sont marquées « Démonstration » ou « Données de démonstration ».

## Acquisition et simulations par secteur

Les chiffres initiaux des simulateurs sont des exemples arbitraires explicitement étiquetés, pas des résultats clients ni des moyennes de marché. Le calcul est : prospects qualifiés × taux de transformation × valeur HT. Les valeurs peuvent être modifiées directement sur chaque page ; elles ne sont ni enregistrées ni envoyées.
