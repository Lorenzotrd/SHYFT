# SHYFT

## Positionnement

SHYFT construit le canal commercial digital des PME bien implantées sur le terrain : identifier les demandes de leur marché, les capter, les convertir et mesurer le chiffre d’affaires qu’elles rapportent. Sur le site, la même idée est dite avec les mots des clients : « les demandes qui vous manquent en ligne ». Méthode en trois temps : Identifier (audit offert et plan chiffré), Construire (test de 60 jours), Développer (pilotage au résultat).

Site de l’agence SHYFT : SEO, Google Ads, Meta Ads, IA et mesure pour les PME et réseaux français. HTML léger sans framework : bleu ciel, photographies de nuages, accent citron, cartes en arc, six pages métier, section Mesure & suivi, pages légales et formulaire connecté à une API.

## Voir le site

```sh
npm start
```

Ouvrir http://localhost:4173. `index.html` est la page d’accueil pour l’hébergement ; garder les dossiers `assets` et `secteurs` ainsi que les pages légales à côté. L’envoi du formulaire nécessite le serveur.

## Pages

Accueil (pourquoi, secteurs, constat et cinq étapes, audit, mesure & suivi, méthode, équipe, FAQ, formulaire), index des secteurs, six pages métier (marché vu par les futurs clients, parcours d’une demande, quatre leviers, mesure & suivi, simulateur, FAQ), mentions légales et politique de confidentialité. Les exemples de recherches des pages métier sont des requêtes types sans volume, définis dans `scripts/sector_growth.py` (`SEARCHES`, `JOURNEY`).

## Mesure & suivi

La section présente ce que SHYFT installe chez ses clients : Search Console, Google Analytics, tableau de bord partagé, CRM et emailing. Le tableau de bord affiché sur l’accueil est une illustration avec des données fictives, étiquetée comme telle. Chaque page métier reprend trois indicateurs propres au secteur et la source de chaque chiffre (`scripts/sector_growth.py`, dictionnaire `MEASURE`). Le site lui-même n’embarque aucun outil de mesure d’audience.

## Envoyer les audits

Le serveur Node (18 ou supérieur) valide les données et utilise la fonction isolée `sendLead()` dans `server.mjs`. Configurer `LEAD_WEBHOOK_URL` avec le webhook du CRM ou de l’outil email ; `LEAD_WEBHOOK_TOKEN` est facultatif. Ces secrets restent côté serveur. Sans configuration, l’API retourne une erreur explicite et n’affiche jamais de faux succès. Aucune demande n’est enregistrée localement.

## Avant la mise en ligne

- Renseigner `SITE_URL` dans `scripts/redesign.py` puis régénérer : canonical, `og:image`, `sitemap.xml` et `robots.txt` utilisent cette adresse.
- Compléter les passages surlignés des pages `mentions-legales.html` et `confidentialite.html` (identité de l’entreprise, hébergeur, prestataires, durée de conservation, email de contact).
- Compléter le rôle de Quentin dans la section équipe.
- Mettre en place une protection contre les abus adaptée à l’hébergement (limitation de débit sur `/api/lead`).

## Organisation

- `assets/base.css` : styles hérités du fichier original.
- `assets/design.css` : direction graphique, responsive, section Mesure et pages légales.
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
npm start &
node scripts/og.cjs
```

Les cartes du premier écran et le tableau de bord sont des illustrations, pas des résultats clients. Aucun témoignage, logo client ou chiffre de marché non vérifié n’est utilisé. Les photographies viennent d’Unsplash et ne représentent ni l’équipe ni des clients. Identifiants : ciel `photo-1501630834273-4b5604d2ee31`, location `photo-1504307651254-35680f356dfd`, franchise `photo-1521737711867-e3b97375f902`, rénovation `photo-1503387762-592deb58ef4e`, immobilier `photo-1600585154340-be6161a56a0c`, domicile `photo-1573497620053-ea5300f94f21`, commerces `photo-1441986300917-64674bd600d8`.

## Contrôles effectués

`scripts/verify.cjs` : navigation déroulante, accueil, six pages métier, index et pages légales, section Mesure (cinq outils sur l’accueil, trois indicateurs par métier), absence de doublon dans le choix du secteur, navigation sans chevauchement à 1100 et 1200 pixels, absence de débordement horizontal mobile, erreur d’envoi sans connecteur, aucune erreur JavaScript. `scripts/growth-test.cjs` vérifie les simulateurs. `scripts/api-test.mjs` vérifie l’API avec un webhook local. Ces scripts utilisent le Playwright et Chrome locaux de l’environnement de travail ; adapter leur chemin pour une autre machine.

## Acquisition et simulations par secteur

Les chiffres initiaux des simulateurs sont des exemples arbitraires explicitement étiquetés, pas des résultats clients ni des moyennes de marché. Le calcul est : prospects qualifiés × taux de transformation × valeur HT. Les valeurs peuvent être modifiées directement sur chaque page ; elles ne sont ni enregistrées ni envoyées.
