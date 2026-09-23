// Interface d'édition des contenus, à l'adresse /keystatic.
// En développement, les fichiers sont modifiés sur disque ; en ligne, chaque enregistrement
// devient un commit sur le dépôt GitHub, que Vercel redéploie.
import { config, fields, collection, singleton } from '@keystatic/core';

const BR = 'Un retour à la ligne dans ce champ devient un passage à la ligne à l’écran.';

const text = (label: string, description?: string) => fields.text({ label, description });
const lines = (label: string) => fields.text({ label, multiline: true, description: BR });
const paragraph = (label: string, description?: string) => fields.text({ label, multiline: true, description });
const list = (label: string, itemLabel = 'Élément') =>
  fields.array(fields.text({ label: itemLabel }), { label, itemLabel: (p) => p.value || itemLabel });

const faqItem = fields.object({ question: text('Question'), answer: paragraph('Réponse') });
const faqList = (label: string) => fields.array(faqItem, { label, itemLabel: (p) => p.fields.question.value });
const state = (label = 'Couleur de l’étiquette') =>
  fields.select({ label, options: [{ label: 'Vert', value: 'ok' }, { label: 'Orange', value: 'warn' }, { label: 'Rouge', value: 'bad' }], defaultValue: 'ok' });
const expertiseRef = (label = 'Expertise') => fields.relationship({ label, collection: 'expertises', validation: { isRequired: true } });
const sectorRef = (label = 'Secteur') => fields.relationship({ label, collection: 'secteurs', validation: { isRequired: true } });
const expertiseRefs = (label: string) => fields.array(expertiseRef(), { label, itemLabel: (p) => p.value ?? '' });

const title = (label: string) => fields.text({ label, multiline: true, description: 'Un mot entre astérisques, *comme ceci*, s’affiche en serif italique. ' + BR });
const titled = () => fields.object({ titre: text('Titre'), texte: paragraph('Texte') });
const champ = (label: string) => fields.object({ label: text('Libellé'), placeholder: text('Exemple dans le champ') }, { label });
const tone = () => fields.select({ label: 'Couleur', defaultValue: 'clair', options: [{ label: 'Blanche', value: 'clair' }, { label: 'Noire', value: 'sombre' }, { label: 'Jaune', value: 'accent' }] });

const sectionHead = {
  kicker: text('Surtitre'),
  title: lines('Titre'),
  sub: lines('Texte d’accompagnement'),
};

export default config({
  storage: import.meta.env.PROD
    ? { kind: 'github', repo: { owner: 'Lorenzotrd', name: 'SHYFT' } }
    : { kind: 'local' },
  locale: 'fr-FR',
  ui: {
    brand: { name: 'SHYFT' },
    navigation: {
      Pages: ['accueil', 'services', 'listes', 'secteurs', 'expertises', 'pages'],
      'Blocs communs': ['site', 'rendezVous', 'serviceCommun', 'auditOffert', 'merci', 'rdvMerci', 'methode', 'mesure', 'formulaire', 'piedDePage', 'navigation', 'leviers'],
    },
  },

  collections: {
    services: collection({
      label: 'Services',
      slugField: 'nom',
      path: 'src/content/services/*',
      format: { data: 'yaml' },
      columns: ['nom'],
      schema: {
        nom: fields.slug({ name: { label: 'Nom' }, slug: { label: 'Adresse', description: 'Ne pas modifier : c’est l’adresse de la page (/expertises/…).' } }),
        nomCourt: text('Nom court', 'Pied de page sur téléphone : « SEO », « IA »…'),
        ordre: fields.integer({ label: 'Ordre d’affichage', defaultValue: 1 }),
        groupeMenu: fields.select({ label: 'Groupe de menu', description: 'Colonne du menu déroulant Services.', defaultValue: 'Acquisition et visibilité', options: [
          { label: 'Acquisition et visibilité', value: 'Acquisition et visibilité' }, { label: 'Conversion et mesure', value: 'Conversion et mesure' }, { label: 'IA et automatisation', value: 'IA et automatisation' },
        ] }),
        phraseMenu: text('Phrase menu', 'Sous le nom du service, dans le menu déroulant.'),
        seoTitle: text('Titre pour Google'),
        seoDescription: paragraph('Description pour Google'),
        carte: fields.object({
          texte: paragraph('Texte de la carte'),
          texteCourt: paragraph('Texte de la carte sur téléphone'),
          icone: fields.select({ label: 'Pictogramme', defaultValue: 'repere', options: [
            { label: 'Repère de carte', value: 'repere' }, { label: 'Cible', value: 'cible' }, { label: 'Mégaphone', value: 'megaphone' },
            { label: 'Robot', value: 'robot' }, { label: 'Fenêtre de site', value: 'site' }, { label: 'Graphique', value: 'graphique' },
          ] }),
          ton: tone(),
        }, { label: 'Carte sur l’accueil' }),
        audit: fields.object({ tag: text('Étiquette'), description: paragraph('Ce qu’on regarde') }, { label: 'Carte sur la page audit offert' }),
        hero: fields.object({ titre: title('Titre'), texte: paragraph('Texte') }, { label: 'En-tête' }),
        suivi: list('Ce qu’on suit chaque mois', 'Indicateur'),
        problemes: fields.array(titled(), { label: 'Vous vous reconnaissez ? (trois problèmes)', itemLabel: (p) => p.fields.titre.value }),
        miseEnPlace: fields.array(titled(), { label: 'Ce qu’on met en place', itemLabel: (p) => p.fields.titre.value }),
        couverture: fields.conditional(fields.checkbox({ label: 'Afficher le bloc « couvrir toute la recherche »' }), {
          true: fields.object({
            titre: title('Titre'), texte: paragraph('Texte'),
            cartes: fields.array(fields.object({ badge: text('Pastille'), titre: text('Titre'), texte: paragraph('Texte'), points: list('Points', 'Point') }), { label: 'Cartes', itemLabel: (p) => p.fields.titre.value }),
          }),
          false: fields.empty(),
        }),
        etapes: fields.array(titled(), { label: 'Comment ça se passe', itemLabel: (p) => p.fields.titre.value }),
        chiffres: fields.object({
          titre: title('Titre'), lien: text('Lien à droite du titre'),
          lienVers: fields.select({ label: 'Le lien mène à', defaultValue: 'rendez-vous', options: [{ label: 'La prise de rendez-vous', value: 'rendez-vous' }, { label: 'Les résultats de l’accueil', value: 'resultats' }] }),
          cartes: fields.array(fields.object({
            surtitre: text('Surtitre'), chiffre: text('Chiffre'), unite: text('Unité en petit (facultatif)'), legende: text('Légende'), texte: paragraph('Texte'),
            exempleFictif: fields.checkbox({ label: 'Étiquette « Exemple fictif »' }), duree: text('Durée (facultatif)', 'Exemple : « En 3 mois ».'),
          }), { label: 'Trois cartes', itemLabel: (p) => `${p.fields.chiffre.value} · ${p.fields.surtitre.value}` }),
          note: paragraph('Note sous les cartes (facultatif)'),
        }, { label: 'Chiffres' }),
        geogrid: fields.conditional(fields.checkbox({ label: 'Afficher la GeoGrid' }), {
          true: fields.object({
            surtitre: text('Surtitre'), titre: title('Titre'), points: list('Points', 'Point'),
            motCle: text('Mot clé affiché'), zone: text('Zone', 'Le nombre de points est calculé à partir de la grille.'),
            concurrents: fields.array(fields.object({ nom: text('Nom'), position: text('Position moyenne') }), { label: 'Concurrents', itemLabel: (p) => p.fields.nom.value }),
            positions: list('Positions (une ligne de 7 nombres par rangée, séparés par des virgules)', 'Rangée'),
          }),
          false: fields.empty(),
        }),
        faq: faqList('Questions'),
      },
    }),
    secteurs: collection({
      label: 'Secteurs',
      slugField: 'name',
      path: 'src/content/secteurs/*',
      format: { data: 'yaml' },
      schema: {
        name: fields.slug({ name: { label: 'Nom du secteur' } }),
        order: fields.integer({ label: 'Ordre d’affichage', defaultValue: 1 }),
        short: text('Accroche de la carte', 'Une phrase, sous le nom, sur l’accueil et la page des secteurs.'),
        photo: fields.select({
          label: 'Photo',
          options: [
            { label: 'Chantier et matériel', value: 'equipment' }, { label: 'Réunion d’équipe', value: 'franchise' },
            { label: 'Intérieur en rénovation', value: 'renovation' }, { label: 'Séjour lumineux', value: 'property' },
            { label: 'Accompagnement à domicile', value: 'homecare' }, { label: 'Commerce de centre-ville', value: 'retail' },
          ],
          defaultValue: 'equipment',
        }),
        alt: text('Description de la photo', 'Texte lu par les lecteurs d’écran et les moteurs.'),
        seoTitle: text('Titre pour Google', 'Affiché dans l’onglet et les résultats de recherche. 50 à 60 caractères.'),
        seoDescription: paragraph('Description pour Google', '140 à 160 caractères.'),
        hero: fields.object({
          title: lines('Titre principal'),
          lead: paragraph('Texte d’introduction'),
          signal: text('Étiquette de l’encart flottant', 'Par exemple « Demande de location ».'),
          value: text('Valeur de l’encart flottant', 'Par exemple « Nacelle 12 m ».'),
        }, { label: 'En-tête de page' }),
        who: text('Qui cherche', 'Complète la phrase « … cherchent déjà. »'),
        pain: list('Ce qui se passe aujourd’hui', 'Constat'),
        searches: fields.array(fields.object({
          query: text('Recherche tapée'), meaning: text('Ce qu’elle révèle'), channel: text('Canal', 'Google, Fiche Google, Meta…'),
        }), { label: 'Exemples de recherches', itemLabel: (p) => p.fields.query.value }),
        follow: text('Chaîne de suivi', 'Par exemple « Demandes → qualifiées → locations ».'),
        journey: fields.array(fields.object({
          title: text('Étape'), text: paragraph('Ce qui se passe'), role: text('Qui s’en charge'),
        }), { label: 'Parcours d’une demande', itemLabel: (p) => p.fields.title.value }),
        levers: fields.object({
          seo: paragraph('SEO'), ads: paragraph('Google Ads'), google: paragraph('Fiche Google'), conversion: paragraph('Conversion'),
        }, { label: 'Texte des quatre leviers' }),
        examples: fields.object({
          seoPages: list('Pages construites (SEO)', 'Adresse'),
          adsKeywords: fields.array(fields.object({ keyword: text('Mot-clé'), decision: text('Décision'), state: state() }),
            { label: 'Mots-clés ciblés et exclus (Google Ads)', itemLabel: (p) => p.fields.keyword.value }),
          google: fields.object({ name: text('Nom de la fiche'), rating: text('Note et avis'), hours: text('Horaires'), actions: list('Boutons', 'Bouton') }, { label: 'Fiche Google' }),
          form: fields.array(fields.object({ question: text('Question'), answer: text('Réponse') }),
            { label: 'Questions du formulaire (Conversion)', itemLabel: (p) => p.fields.question.value }),
        }, { label: 'Exemples concrets des leviers' }),
        measure: fields.array(fields.object({ name: text('Indicateur'), how: text('Source du chiffre') }),
          { label: 'Trois indicateurs suivis', itemLabel: (p) => p.fields.name.value }),
        pay: text('Unité de rémunération', 'Complète « Une rémunération par … ».'),
        growth: fields.object({
          leads: fields.integer({ label: 'Prospects qualifiés (valeur de départ)' }),
          rate: fields.number({ label: 'Taux de transformation (%)' }),
          value: fields.integer({ label: 'Valeur moyenne (€ HT)' }),
          client: text('Nom des clients obtenus', 'Par exemple « locations conclues ».'),
          unit: text('Libellé de la valeur moyenne'),
          result: text('Libellé du résultat'),
          note: paragraph('Note sous le simulateur'),
        }, { label: 'Simulateur' }),
        titles: fields.object({
          journey: lines('Parcours'), levers: lines('Leviers'), measure: lines('Mesure'), growth: lines('Simulateur'), faq: lines('Questions'),
        }, { label: 'Titres des sections' }),
        signature: fields.object({
          after: fields.select({ label: 'Placée après', options: [{ label: 'Le marché', value: 'market' }, { label: 'Le parcours', value: 'journey' }, { label: 'Les leviers', value: 'levers' }], defaultValue: 'levers' }),
          kicker: text('Surtitre'), title: lines('Titre'), lead: paragraph('Texte d’accompagnement'),
        }, { label: 'Section propre au métier', description: 'Le visuel de cette section est fixé dans le code ; seuls les textes se modifient ici.' }),
        faq: fields.object({ question: text('Question'), answer: paragraph('Réponse') }, { label: 'Question propre au métier', description: 'Première question de la FAQ ; les quatre suivantes sont communes à tous les secteurs.' }),
      },
    }),

    expertises: collection({
      label: 'Expertises',
      slugField: 'name',
      path: 'src/content/expertises/*',
      format: { data: 'yaml' },
      schema: {
        name: fields.slug({ name: { label: 'Nom de l’expertise' } }),
        order: fields.integer({ label: 'Ordre d’affichage', defaultValue: 1 }),
        menu: text('Libellé dans le menu'),
        hint: text('Sous-titre dans le menu'),
        card: text('Accroche de la carte'),
        tag: fields.select({ label: 'Temps de la chaîne', options: ['Être trouvé', 'Générer', 'Convertir', 'Automatiser', 'Mesurer'].map((v) => ({ label: v, value: v })), defaultValue: 'Être trouvé' }),
        visual: fields.select({ label: 'Interface de démonstration', options: [
          { label: 'Page de résultats Google', value: 'serp' }, { label: 'Conversation avec une IA', value: 'ai' },
          { label: 'Annonce et termes exclus', value: 'ads' }, { label: 'Créations comparées', value: 'creative' },
          { label: 'Chaînes d’automatisation', value: 'workflow' }, { label: 'Entonnoir', value: 'funnel' }, { label: 'Tableau de bord', value: 'dash' },
        ], defaultValue: 'serp' }),
        size: fields.select({ label: 'Format de la carte', options: [{ label: 'Large', value: 'large' }, { label: 'Petite', value: 'small' }, { label: 'Sombre', value: 'dark' }], defaultValue: 'small' }),
        seoTitle: text('Titre pour Google'),
        seoDescription: paragraph('Description pour Google'),
        hero: fields.object({ eyebrow: text('Surtitre'), title: lines('Titre principal'), lead: paragraph('Texte d’introduction'), cta: text('Bouton principal') }, { label: 'En-tête de page' }),
        problemTitle: lines('Titre de la section « Le problème »'),
        problem: list('Constats', 'Constat'),
        approach: fields.array(fields.object({ title: text('Titre'), text: paragraph('Texte') }), { label: 'Notre approche', itemLabel: (p) => p.fields.title.value }),
        demo: fields.object({ title: text('Titre'), line: paragraph('Phrase d’introduction') }, { label: 'Section « En pratique »' }),
        build: fields.array(fields.object({ name: text('Colonne'), items: list('Éléments') }), { label: 'Ce qu’on met en place', itemLabel: (p) => p.fields.name.value }),
        asideTitle: lines('Titre de l’encadré « À retenir »'),
        aside: paragraph('Texte de l’encadré'),
        flow: list('Étapes du parcours', 'Étape'),
        measure: fields.array(fields.object({ title: text('Indicateur'), text: paragraph('Explication') }), { label: 'Ce qu’on mesure', itemLabel: (p) => p.fields.title.value }),
        complements: fields.array(fields.object({ expertise: expertiseRef(), why: text('Pourquoi') }), { label: 'Fonctionne mieux avec', itemLabel: (p) => p.fields.expertise.value ?? '' }),
        faq: faqList('Questions fréquentes'),
      },
    }),

    pages: collection({
      label: 'Pages légales',
      slugField: 'title',
      path: 'src/content/pages/*',
      format: { data: 'yaml' },
      schema: {
        title: fields.slug({ name: { label: 'Nom de la page' } }),
        eyebrow: text('Surtitre'),
        h1: text('Titre principal'),
        lead: text('Texte d’introduction'),
        seoTitle: text('Titre pour Google'),
        seoDescription: paragraph('Description pour Google'),
        body: fields.text({ label: 'Contenu (HTML)', multiline: true, description: 'Balises <h2>, <p>, <ul>, <li>, <a>, <mark>. Les passages entre <mark> sont à compléter avant publication.' }),
      },
    }),
  },

  singletons: {
    accueil: singleton({
      label: 'Accueil',
      path: 'src/content/site/accueil',
      format: { data: 'yaml' },
      schema: {
        seoTitle: text('Titre pour Google'),
        seoDescription: paragraph('Description pour Google'),
        hero: fields.object({
          badge: text('Pastille noire'), badgeTexte: text('Texte de la pastille'),
          titre: title('Titre'), texte: paragraph('Texte d’introduction'),
          cta: text('Bouton principal (audit)'), ctaSecondaire: text('Bouton secondaire (rendez-vous)'),
          legende: text('Légende sous les cartes (téléphone)'),
        }, { label: 'En-tête' }),
        eventail: fields.array(fields.object({
          type: fields.select({ label: 'Type de carte', defaultValue: 'lignes', options: [
            { label: 'Barres (hauteurs dans « Valeurs »)', value: 'barres' },
            { label: 'Lignes libellé / valeur', value: 'lignes' },
            { label: 'Liste cochée (valeur « ok » ou « attente »)', value: 'checklist' },
            { label: 'Grille de positions (25 lettres dans « Valeurs »)', value: 'grille' },
            { label: 'Barres par source (valeur en %)', value: 'sources' },
          ] }),
          ton: tone(),
          mobile: fields.checkbox({ label: 'Affichée sur téléphone', description: 'Trois cartes au maximum.' }),
          pastille: fields.checkbox({ label: 'Point vert devant le surtitre' }),
          surtitre: text('Surtitre'), titre: text('Titre'), pied: text('Ligne du bas (facultatif)'),
          valeurs: text('Valeurs', 'Barres : hauteurs en % séparées par des virgules. Grille : 25 lettres v, o, r ou n (vert, orange, rouge, noir).'),
          lignes: fields.array(fields.object({ label: text('Libellé'), valeur: text('Valeur') }), { label: 'Lignes', itemLabel: (p) => p.fields.label.value }),
        }), { label: 'Éventail de cartes sous l’en-tête', description: 'Sept cartes sur ordinateur, dans l’ordre de gauche à droite.', itemLabel: (p) => p.fields.titre.value }),
        pourquoi: fields.object({
          titre: title('Titre'), texte: paragraph('Texte'),
          items: fields.array(titled(), { label: 'Quatre arguments', itemLabel: (p) => p.fields.titre.value }),
        }, { label: 'Pourquoi nous choisir' }),
        services: fields.object({ titre: title('Titre'), texte: paragraph('Texte') }, { label: 'Services', description: 'Les six cartes viennent de la collection Services.' }),
        methode: fields.object({
          titre: title('Titre'),
          etapes: fields.array(titled(), { label: 'Étapes', itemLabel: (p) => p.fields.titre.value }),
        }, { label: 'Méthode' }),
        resultats: fields.object({
          titre: title('Titre'), texte: paragraph('Texte'),
          grande: fields.object({
            surtitre: text('Surtitre'), chiffre: text('Chiffre'), legende: text('Légende'),
            lignes: fields.array(fields.object({ label: text('Libellé'), valeur: text('Valeur') }), { label: 'Lignes', itemLabel: (p) => p.fields.label.value }),
            cta: text('Bouton (rendez-vous)'),
          }, { label: 'Grande carte' }),
          cartes: fields.array(fields.object({
            surtitre: text('Surtitre'), lien: text('Libellé du lien'),
            service: fields.relationship({ label: 'Service lié', collection: 'services', validation: { isRequired: true } }),
            chiffre: text('Chiffre'), legende: text('Légende'), texte: paragraph('Texte'),
          }), { label: 'Quatre cartes', itemLabel: (p) => `${p.fields.chiffre.value} · ${p.fields.surtitre.value}` }),
          note: text('Note sous les cartes'),
        }, { label: 'Résultats' }),
        audit: fields.object({
          surtitre: text('Surtitre'), titre: title('Titre'), points: list('Ce qu’on regarde', 'Point'), cta: text('Bouton'),
          syntheseTitre: text('Titre de la synthèse'), syntheseEtiquette: text('Étiquette de la synthèse'),
          lignes: fields.array(fields.object({ sujet: text('Sujet'), constat: text('Constat'), etiquette: text('Étiquette'), etat: state() }), { label: 'Lignes de la synthèse', itemLabel: (p) => p.fields.sujet.value }),
        }, { label: 'Audit offert' }),
        faq: fields.object({ surtitre: text('Surtitre'), titre: title('Titre'), texte: paragraph('Texte'), cta: text('Bouton'), questions: faqList('Questions') }, { label: 'Questions fréquentes' }),
      },
    }),

    site: singleton({
      label: 'Réglages du site',
      path: 'src/content/site/site',
      format: { data: 'yaml' },
      schema: {
        calUrl: fields.url({ label: 'Lien de prise de rendez-vous', validation: { isRequired: true } }),
        nav: fields.object({
          services: text('Menu : Services'), methode: text('Menu : Méthode'), resultats: text('Menu : Résultats'), audit: text('Menu : Audit', 'Un mot entre astérisques passe en jaune : Audit *offert*'),
          cta: text('Bouton à droite (rendez-vous)'),
          menu: fields.object({
            auditTitre: text('Carte jaune : titre'), auditTexte: text('Carte jaune : texte'),
            rdvTitre: text('Carte noire : titre'), rdvTexte: text('Carte noire : texte'),
          }, { label: 'Cartes en bas du menu Services' }),
        }, { label: 'Navigation' }),
        footer: fields.object({ accroche: title('Accroche'), cta: text('Bouton'), editeur: text('Éditeur du site') }, { label: 'Pied de page' }),
      },
    }),

    rendezVous: singleton({
      label: 'Bloc rendez-vous',
      path: 'src/content/site/rendez-vous',
      format: { data: 'yaml' },
      schema: {
        pastille: text('Pastille'), titre: title('Titre'), texte: paragraph('Texte'),
        cta: text('Bouton principal (rendez-vous)'), ctaSecondaire: text('Bouton secondaire (audit)'),
        garanties: list('Garanties', 'Garantie'),
      },
    }),

    serviceCommun: singleton({
      label: 'Pages services : libellés communs',
      path: 'src/content/site/service-commun',
      format: { data: 'yaml' },
      schema: {
        filAccueil: text('Fil d’Ariane : accueil'), filServices: text('Fil d’Ariane : services'),
        ctaRdv: text('Bouton rendez-vous'), ctaAudit: text('Bouton audit'),
        suiviSurtitre: text('Carte de suivi : surtitre'), suiviTitre: title('Carte de suivi : titre'),
        problemesTitre: title('Titre des problèmes'), problemeEtiquette: text('Pastille des problèmes'),
        miseEnPlaceTitre: title('Titre « ce qu’on met en place »'), miseEnPlaceTexte: paragraph('Texte « ce qu’on met en place »'),
        friseTitre: title('Titre des étapes'), faqTitre: title('Titre des questions'), faqTexte: paragraph('Texte des questions'),
        autresLeviers: text('Titre « autres leviers »'), exempleFictif: text('Étiquette « exemple fictif »'),
      },
    }),

    auditOffert: singleton({
      label: 'Page audit offert',
      path: 'src/content/site/audit-offert',
      format: { data: 'yaml' },
      schema: {
        seoTitle: text('Titre pour Google'), seoDescription: paragraph('Description pour Google'),
        fil: text('Fil d’Ariane'), titre: title('Titre'), texte: paragraph('Texte'), garanties: list('Garanties', 'Garantie'),
        recevez: fields.object({ surtitre: text('Surtitre'), points: list('Ce que vous recevez', 'Point') }, { label: 'Carte « ce que vous recevez »' }),
        etape1: fields.object({
          surtitre: text('Surtitre'), titre: title('Titre'), toutAuditer: text('Bouton « tout sélectionner »'), toutDeselectionner: text('Bouton « tout désélectionner »'),
          compteur: text('Compteur', '{n} et {total} sont remplacés par les nombres.'),
        }, { label: 'Étape 1 : les leviers', description: 'Les cartes viennent de la collection Services.' }),
        etape2: fields.object({ surtitre: text('Surtitre'), titre: title('Titre') }, { label: 'Étape 2 : l’entreprise' }),
        champs: fields.object({
          entreprise: champ('Entreprise'), site: champ('Site'), ville: champ('Ville'), secteur: champ('Secteur'), nom: champ('Nom'),
          email: champ('Email'), tel: champ('Téléphone'), agences: champ('Agences'), message: champ('Message'),
          facultatif: text('Mention « facultatif »'),
        }, { label: 'Champs du formulaire' }),
        secteurs: list('Secteurs proposés', 'Secteur'),
        envoi: fields.object({
          aucun: text('Aucun levier choisi'), un: text('Un levier choisi'), plusieurs: text('Plusieurs leviers', '{n} est remplacé par le nombre.'),
          mention: paragraph('Mention sur les données'), bouton: text('Bouton d’envoi'), erreur: paragraph('Message d’erreur de saisie'),
        }, { label: 'Barre d’envoi' }),
      },
    }),

    merci: singleton({
      label: 'Page merci (après une demande d’audit)',
      path: 'src/content/site/merci',
      format: { data: 'yaml' },
      schema: {
        seoTitle: text('Titre de l’onglet'), seoDescription: paragraph('Description', 'Page non indexée par Google.'),
        titre: title('Titre'), texte: paragraph('Texte'),
        suiteTitre: text('Titre de la frise'),
        etapes: fields.array(fields.object({
          titre: text('Étape'), texte: paragraph('Précision'), statut: text('Pastille (« À l’instant », « Sous 24 h »…)'),
          etat: fields.select({ label: 'État', defaultValue: 'a-venir', options: [{ label: 'Fait (coche jaune)', value: 'fait' }, { label: 'En cours (cercle pointillé)', value: 'en-cours' }, { label: 'À venir (numéro gris)', value: 'a-venir' }] }),
        }), { label: 'La suite', itemLabel: (p) => p.fields.titre.value }),
        attente: fields.object({ surtitre: text('Surtitre'), titre: title('Titre'), texte: paragraph('Texte'), cta: text('Bouton (rendez-vous)') }, { label: 'Carte « pas envie d’attendre »' }),
        email: fields.object({ titre: text('Titre'), texte: paragraph('Texte', '{adresse} est remplacé par l’adresse, en gras.'), adresse: text('Adresse d’envoi') }, { label: 'Carte « pour ne pas le rater »' }),
        leviersTitre: text('Titre des leviers'),
      },
    }),

    rdvMerci: singleton({
      label: 'Page merci (après une prise de rendez-vous)',
      path: 'src/content/site/rendez-vous-merci',
      format: { data: 'yaml' },
      schema: {
        seoTitle: text('Titre de l’onglet'), seoDescription: paragraph('Description', 'Page non indexée par Google.'),
        titre: title('Titre'), texte: paragraph('Texte'),
        appelTitre: text('Titre de la liste'),
        points: fields.array(fields.object({ titre: text('Point'), texte: paragraph('Précision') }), { label: 'Ce qu’on regarde pendant l’appel', itemLabel: (p) => p.fields.titre.value }),
        audit: fields.object({ surtitre: text('Surtitre'), titre: title('Titre'), texte: paragraph('Texte'), cta: text('Bouton (audit offert)') }, { label: 'Carte audit offert' }),
        email: fields.object({ titre: text('Titre'), texte: paragraph('Texte', '{adresse} est remplacé par l’adresse, en gras.'), adresse: text('Adresse de contact') }, { label: 'Carte confirmation' }),
        leviersTitre: text('Titre des leviers'),
      },
    }),

    listes: singleton({
      label: 'Pages de liste',
      path: 'src/content/site/listes',
      format: { data: 'yaml' },
      schema: {
        secteurs: fields.object({
          seoTitle: text('Titre pour Google'), seoDescription: paragraph('Description pour Google'),
          eyebrow: text('Surtitre'), title: text('Titre, première ligne'), title2: text('Titre, seconde ligne'), lead: text('Texte d’introduction'),
        }, { label: 'Page « Nos secteurs »' }),
        expertises: fields.object({
          seoTitle: text('Titre pour Google'), seoDescription: paragraph('Description pour Google'),
          eyebrow: text('Surtitre'), title: text('Titre, première ligne'), title2: text('Titre, seconde ligne'), lead: paragraph('Texte d’introduction'),
          ctaMethod: text('Bouton « méthode »'), ctaAudit: text('Bouton « audit »'),
          systemKicker: text('Surtitre « système »'), systemTitle: lines('Titre « système »'), systemSub: paragraph('Texte « système »'),
          detailKicker: text('Surtitre « détail »'), detailTitle: text('Titre « détail »'), detailSub: paragraph('Texte « détail »'),
          sectorsKicker: text('Surtitre « secteurs »'), sectorsTitle: lines('Titre « secteurs »'), sectorsSub: text('Texte « secteurs »'),
        }, { label: 'Page « Nos expertises »' }),
      },
    }),

    methode: singleton({
      label: 'Méthode',
      path: 'src/content/site/methode',
      format: { data: 'yaml' },
      schema: {
        steps: fields.array(fields.object({ label: text('Étiquette'), title: text('Titre'), text: paragraph('Texte') }), { label: 'Les trois étapes', itemLabel: (p) => p.fields.title.value }),
      },
    }),

    mesure: singleton({
      label: 'Mesure & suivi',
      path: 'src/content/site/mesure',
      format: { data: 'yaml' },
      schema: {
        tools: fields.array(fields.object({ name: text('Nom complet'), short: text('Nom court', 'Utilisé dans la liste des pages métier.'), text: paragraph('Description') }), { label: 'Outils installés', itemLabel: (p) => p.fields.name.value }),
        dashboard: fields.array(fields.object({ label: text('Indicateur'), detail: text('Précision'), value: text('Valeur', 'Laisser vide si une étiquette est utilisée.'), tag: text('Étiquette verte', 'Laisser vide si une valeur est utilisée.') }), { label: 'Tableau de bord d’illustration', itemLabel: (p) => p.fields.label.value }),
      },
    }),

    formulaire: singleton({
      label: 'Formulaire d’audit',
      path: 'src/content/site/formulaire',
      format: { data: 'yaml' },
      schema: {
        title: lines('Titre'), text: paragraph('Texte'), kicker: text('Surtitre du formulaire'), heading: text('Titre du formulaire'),
        legal: text('Mention légale', 'Le lien vers la politique de confidentialité est ajouté automatiquement.'),
        button: text('Bouton'), error: text('Message d’erreur'), doneTitle: text('Titre après envoi'), doneText: text('Texte après envoi'),
      },
    }),

    piedDePage: singleton({
      label: 'Pied de page',
      path: 'src/content/site/pied-de-page',
      format: { data: 'yaml' },
      schema: {
        tagline: lines('Phrase sous le logo'), nextStep: text('Lien « prochain pas »'), audience: lines('Phrase sous le lien'),
        copyright: text('Après « © année SHYFT. »'), signature: text('Signature à droite'),
      },
    }),

    navigation: singleton({
      label: 'Navigation et liens',
      path: 'src/content/site/navigation',
      format: { data: 'yaml' },
      schema: {
        groups: fields.array(fields.object({ name: text('Nom du groupe'), expertises: expertiseRefs('Expertises') }), { label: 'Groupes du menu « Nos expertises »', itemLabel: (p) => p.fields.name.value }),
        system: fields.array(fields.object({ stage: text('Temps'), line: text('Phrase'), expertises: expertiseRefs('Expertises') }), { label: 'Les cinq temps du système', itemLabel: (p) => p.fields.stage.value }),
        sectorExpertises: fields.array(fields.object({ sector: sectorRef(), expertises: expertiseRefs('Expertises pertinentes') }), { label: 'Expertises pertinentes par secteur', itemLabel: (p) => p.fields.sector.value ?? '' }),
      },
    }),

    leviers: singleton({
      label: 'Leviers des pages métier',
      path: 'src/content/site/leviers',
      format: { data: 'yaml' },
      schema: {
        levers: fields.array(fields.object({
          name: text('Nom'), subtitle: text('Sous-titre'),
          key: fields.select({ label: 'Texte utilisé', options: [{ label: 'SEO', value: 'seo' }, { label: 'Google Ads', value: 'ads' }, { label: 'Fiche Google', value: 'google' }, { label: 'Conversion', value: 'conversion' }], defaultValue: 'seo' }),
          expertise: expertiseRef('Expertise liée'),
          kind: fields.select({ label: 'Exemple affiché', options: [{ label: 'Pages construites', value: 'serp' }, { label: 'Mots-clés', value: 'ads' }, { label: 'Fiche Google', value: 'map' }, { label: 'Formulaire', value: 'flow' }], defaultValue: 'serp' }),
        }), { label: 'Les quatre leviers', itemLabel: (p) => p.fields.name.value }),
      },
    }),
  },
});
