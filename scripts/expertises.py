# Contenus des sept expertises. Un seul endroit à modifier pour ajouter ou faire évoluer une page.
# Aucun chiffre présenté ici n'est un résultat client : les interfaces portent la mention « Démonstration ».
from html import escape

GROUPS = [
 ('Acquisition & visibilité', ['seo', 'geo', 'google-ads', 'meta-ads']),
 ('IA & automatisation', ['agence-ia']),
 ('Conversion & mesure', ['landing-pages-cro', 'data-tracking']),
]

# Les cinq temps de la chaîne d'acquisition, repris de l'accueil.
SYSTEM = [
 ('Être trouvé', 'Exister au moment où la recherche a lieu.', ['seo', 'geo']),
 ('Générer', 'Aller chercher la demande qui ne vient pas seule.', ['google-ads', 'meta-ads']),
 ('Convertir', 'Transformer une visite en demande exploitable.', ['landing-pages-cro']),
 ('Automatiser', 'Répondre vite, suivre, relancer, sans y penser.', ['agence-ia']),
 ('Mesurer', 'Savoir ce qui apporte des clients, et ce qui n’en apporte pas.', ['data-tracking']),
]

# Expertises particulièrement pertinentes par secteur. Une indication, pas une règle.
SECTOR_EXPERTISES = {
 'location-de-materiel': ['seo', 'google-ads', 'landing-pages-cro', 'data-tracking'],
 'reseaux-de-franchise': ['meta-ads', 'seo', 'geo', 'agence-ia', 'data-tracking'],
 'renovation-artisans': ['seo', 'google-ads', 'landing-pages-cro', 'agence-ia'],
 'immobilier': ['seo', 'google-ads', 'meta-ads', 'agence-ia'],
 'services-a-domicile': ['seo', 'google-ads', 'meta-ads', 'agence-ia'],
 'commerces-multi-sites': ['seo', 'meta-ads', 'data-tracking'],
}

EXPERTISES = [
dict(
 slug='seo', name='Référencement naturel (SEO)', menu='Référencement naturel (SEO)', hint='Google, Maps & visibilité locale',
 card='Capter les recherches qui deviennent des demandes, sur Google et sur Maps.', tag='Être trouvé', visual='serp', size='large',
 eyebrow='Référencement naturel',
 h1='Soyez là quand<br>vos clients cherchent.',
 lead='On ne travaille pas le référencement pour faire du trafic. On le travaille pour capter les recherches qui peuvent devenir des demandes commerciales, dans votre zone comme au national.',
 cta='Analyser ma visibilité',
 title='Agence SEO et référencement local',
 desc='SHYFT construit le référencement naturel des PME : pages services, pages locales, fiche Google et Maps. Objectif : des recherches qui deviennent des demandes.',
 problem_title='Du trafic, peut-être. Des demandes, non.',
 problem=[
  'Vous sortez sur votre nom, pas sur ce que les gens tapent vraiment.',
  'Les annuaires et les grands réseaux occupent la première page à votre place.',
  'Vos fiches Google sont incomplètes, ou différentes d’une agence à l’autre.',
  'Personne ne sait quelles pages amènent des contacts.',
 ],
 approach=[
  ('On part des recherches à intention commerciale', 'Un mot-clé qui attire des curieux ne vaut pas un mot-clé qui amène un devis. On sépare les deux avant d’écrire une ligne.'),
  ('On construit les pages qui manquent', 'Une page par prestation, par métier et par ville d’intervention. C’est ce qui permet de répondre précisément à une recherche précise.'),
  ('On traite le local avec la même exigence', 'Fiche Google, Maps, avis, cohérence des coordonnées : pour une entreprise avec des adresses, c’est souvent ce qui rapporte le plus vite.'),
  ('On juge en demandes, pas en positions', 'Les positions sont un moyen de vérifier qu’on avance. Le résultat, ce sont les demandes hors marque.'),
 ],
 build=[
  ('Technique', ['Audit technique et corrections prioritaires', 'Architecture du site et maillage interne', 'Vitesse d’affichage et confort mobile', 'Données structurées', 'Search Console et suivi de l’indexation']),
  ('Contenu', ['Recherche de mots-clés à intention commerciale', 'Pages prestations et pages métiers', 'Contenus de fond et réponses aux questions réelles', 'Optimisation des pages existantes', 'Netlinking mesuré, sans achat de masse']),
  ('Local', ['Google Business Profile : catégories, services, photos, horaires', 'Google Maps et recherches « près de moi »', 'Pages locales par ville et par zone', 'Collecte et réponse aux avis', 'Cohérence du nom, de l’adresse et du téléphone', 'Multi-établissements : une fiche et une page par adresse']),
  ('Pilotage', ['Analyse concurrentielle', 'Suivi des positions utiles', 'Trafic hors marque', 'Demandes attribuées au référencement']),
 ],
 aside_title='National ou local, l’objectif reste le même.',
 aside='Être présent quand votre client cherche. Sur une requête nationale, ça se joue sur la profondeur du contenu et l’autorité du site. Sur une requête locale, ça se joue sur la fiche Google, les avis et une page qui parle vraiment de la ville. On travaille les deux, avec la même méthode.',
 flow=['Recherche Google', 'Résultat ou fiche', 'Site ou Google Maps', 'Demande', 'Client'],
 measure=[
  ('Positions sur les requêtes qui comptent', 'Search Console, sur les mots-clés à intention commerciale, pas sur votre marque.'),
  ('Trafic hors marque', 'Les visites de gens qui ne vous connaissaient pas encore.'),
  ('Visibilité locale', 'Vues de la fiche, appels, demandes d’itinéraire, établissement par établissement.'),
  ('Demandes attribuées au référencement', 'Formulaires et appels rattachés à leur source dans votre CRM.'),
 ],
 faq=[
  ('Combien de temps avant les premiers résultats ?', 'Le référencement n’est pas un canal immédiat. Les premières remontées se voient généralement en quelques mois, plus vite en local qu’au national. C’est pour cela qu’on le combine souvent avec Google Ads, qui donne des demandes tout de suite.'),
  ('Faut-il refaire notre site ?', 'Rarement. On part du site existant, on corrige ce qui bloque et on ajoute les pages qui manquent. Une refonte n’a de sens que si la structure actuelle empêche tout progrès.'),
  ('Le SEO local, c’est une prestation séparée ?', 'Non. Fiche Google, Maps et pages locales font partie du référencement. Les séparer n’a aucun sens : c’est le même travail de fond, sur deux surfaces différentes.'),
  ('Vous garantissez la première position ?', 'Non, et personne ne peut le faire. On s’engage sur le travail, la méthode et la transparence des chiffres, pas sur un classement que Google seul décide.'),
 ],
),
dict(
 slug='geo', name='GEO — Référencement IA', menu='GEO — Référencement IA', hint='Être cité dans les réponses IA',
 card='Exister dans les réponses de ChatGPT, Gemini, Perplexity et Google IA.', tag='Être trouvé', visual='ai', size='small',
 eyebrow='GEO · Référencement IA',
 h1='Soyez visible là où<br>on pose désormais<br>les questions.',
 lead='Une partie de vos futurs clients demande à une IA avant de chercher sur Google. On travaille pour que votre entreprise fasse partie des réponses, et que ce qui est dit sur vous soit exact.',
 cta='Voir comment les IA parlent de mon entreprise',
 title='Agence GEO et référencement IA',
 desc='SHYFT travaille la visibilité des PME dans ChatGPT, Gemini, Perplexity et les réponses IA de Google : contenu structuré, autorité, sources et suivi.',
 problem_title='Une réponse remplace dix résultats.',
 problem=[
  'Quand l’IA répond, il n’y a plus de première page. Il y a une réponse, et deux ou trois marques citées.',
  'Les assistants citent ce qu’ils trouvent ailleurs : annuaires, comparateurs, articles. Rarement une PME qui n’a rien publié.',
  'Personne chez vous ne sait ce que ChatGPT répond sur votre métier dans votre ville.',
  'Une page écrite pour Google n’est pas toujours lisible par une machine.',
 ],
 approach=[
  ('On rend votre entreprise compréhensible par une machine', 'Qui vous êtes, ce que vous faites, où vous intervenez, pour qui, à quelles conditions. Écrit clairement, structuré, et identique partout où vous apparaissez.'),
  ('On publie les formats que les assistants vont chercher', 'Réponses à des questions réelles, comparatifs, explications de prix et de délais. Ce sont ces contenus-là qui se retrouvent cités.'),
  ('On consolide ce que les autres disent de vous', 'Une IA se fie aux sources externes : annuaires du secteur, presse locale, fédérations, avis. On met de l’ordre dans ces traces.'),
  ('On teste, et on note ce qui change', 'On interroge régulièrement les principaux assistants sur vos questions métier. C’est artisanal, et c’est la seule mesure honnête aujourd’hui.'),
 ],
 build=[
  ('Base', ['Structure et clarté des pages', 'Données structurées et entités', 'Informations d’entreprise cohérentes sur tout le web', 'Page de présentation factuelle et vérifiable']),
  ('Contenus', ['Questions réelles et réponses complètes', 'Comparatifs et guides de décision', 'Explications de prix, de délais et de garanties', 'FAQ exploitables par les moteurs de réponse']),
  ('Autorité', ['Présence sur les sources pertinentes de votre secteur', 'Mentions et citations externes', 'Avis et preuves publiques', 'Cohérence de l’information d’un site à l’autre']),
  ('Suivi', ['Relevé régulier sur ChatGPT, Gemini, Perplexity et les réponses IA de Google', 'Liste des marques citées sur vos questions', 'Écarts entre ce que dit l’IA et la réalité de votre offre']),
 ],
 aside_title='Le référencement et le GEO travaillent ensemble.',
 aside='Le référencement vise les moteurs de recherche, le GEO vise les moteurs de réponse. Les surfaces sont différentes, la base est commune : un contenu clair, une structure lisible, de l’autorité et de la pertinence. Travailler l’un sans l’autre revient à laisser la moitié du chemin à un concurrent.',
 flow=['Question posée à une IA', 'Sources consultées', 'Réponse construite', 'Marques citées', 'Visite et demande'],
 measure=[
  ('Présence dans les réponses', 'Relevé manuel sur une liste de questions définie avec vous.'),
  ('Exactitude de ce qui est dit', 'Ce que l’assistant affirme sur vos prestations, vos zones et vos conditions.'),
  ('Sources qui vous amènent', 'Les pages et les sites cités quand votre nom apparaît.'),
  ('Visites depuis les assistants', 'Le trafic référent identifiable dans Analytics.'),
 ],
 faq=[
  ('Vous pouvez me mettre premier sur ChatGPT ?', 'Non. Il n’y a ni classement à acheter, ni position à garantir dans une réponse IA. Ce qu’on peut faire, c’est réunir les conditions pour être une source crédible et vérifiable sur votre métier. Toute agence qui vous promet une citation garantie vous raconte une histoire.'),
  ('En quoi est-ce différent du référencement classique ?', 'La base est commune : du contenu clair, structuré et crédible. Ce qui change, c’est le format des contenus et le poids de ce que les autres sites disent de vous.'),
  ('Comment mesurer quelque chose d’aussi flou ?', 'Par un relevé. On définit ensemble les questions que vos clients posent, on interroge les principaux assistants à intervalle régulier, on note ce qui apparaît et ce qui change. Il n’existe pas aujourd’hui d’outil de mesure fiable et exhaustif, et on ne fait pas semblant du contraire.'),
  ('Est-ce que ça vaut le coup maintenant ?', 'Pour la plupart des métiers, l’essentiel des demandes vient encore de Google. Le GEO est un investissement d’avance, pas un remplacement. On le dimensionne comme tel, à côté des canaux qui produisent aujourd’hui.'),
 ],
),
dict(
 slug='google-ads', name='Google Ads', menu='Google Ads', hint='Capter une intention, tout de suite',
 card='Être présent sur les recherches qui ont une intention d’achat, dès le premier jour.', tag='Générer', visual='ads', size='large',
 eyebrow='Publicité Google',
 h1='Soyez là au moment<br>exact où l’on<br>vous cherche.',
 lead='On n’achète pas des clics. On transforme une intention commerciale en demande qualifiée, et on suit ce que cette demande devient jusqu’à la signature.',
 cta='Analyser mes campagnes',
 title='Agence Google Ads pour PME et réseaux',
 desc='Campagnes Google Ads sur les recherches à intention commerciale : ciblage local, suivi des appels et des demandes. Votre compte et votre budget restent à vous.',
 problem_title='Le budget part. Les demandes, moins.',
 problem=[
  'Les campagnes tournent en automatique, sans personne pour surveiller où va l’argent.',
  'Vous payez des clics sur des recherches qui ne vous concernent pas.',
  'Les annonces envoient sur la page d’accueil, pas sur une réponse.',
  'Personne ne sait quelle campagne a amené le dernier client signé.',
 ],
 approach=[
  ('On part de ce que vous voulez vendre', 'Les prestations rentables, les zones que vous couvrez vraiment, les périodes où vous avez de la capacité. Pas de tout le catalogue à la fois.'),
  ('On protège le budget avant de le dépenser', 'Mots-clés négatifs, exclusions géographiques, plages horaires. Ce qu’on ne dépense pas mal, on le dépense bien.'),
  ('On relie l’annonce à une page qui répond', 'Une campagne ne vaut que par la page qui la reçoit et par le formulaire qui la termine.'),
  ('On installe la mesure avant le premier euro', 'Conversions, formulaires et appels suivis dès le départ. Sinon, optimiser revient à deviner.'),
 ],
 build=[
  ('Structure', ['Campagnes Search sur vos prestations prioritaires', 'Performance Max quand le volume le justifie', 'Campagnes locales autour de vos adresses', 'Ciblage géographique sur votre zone réelle']),
  ('Contenu', ['Recherche de mots-clés et d’intentions', 'Mots-clés négatifs, revus chaque mois', 'Annonces et variantes comparées', 'Extensions : appel, lieu, prestations, promotions']),
  ('Conversion', ['Landing pages dédiées quand c’est utile', 'Suivi des conversions et des formulaires', 'Suivi des appels téléphoniques', 'Remarketing sur les visiteurs non convertis']),
  ('Pilotage', ['Enchères ajustées selon la valeur des demandes', 'Analyse des termes de recherche réels', 'Arbitrage entre campagnes et entre zones', 'Tableau de bord partagé']),
 ],
 aside_title='Votre compte, votre budget, vos données.',
 aside='Les campagnes sont créées sur votre propre compte Google Ads. Le budget publicitaire est débité chez vous, jamais chez nous. Vous voyez chaque dépense en direct, et si la collaboration s’arrête, l’historique et les campagnes restent à vous.',
 flow=['Recherche', 'Annonce', 'Landing page', 'Demande', 'Client'],
 measure=[
  ('Coût par clic et part d’impressions', 'Pour savoir si vous êtes visible, et à quel prix, sur vos requêtes.'),
  ('Taux de conversion par campagne', 'Ce que devient le clic une fois sur la page.'),
  ('Coût par demande', 'L’indicateur qui décide d’augmenter ou de couper un budget.'),
  ('Demandes qualifiées et coût par client', 'Avec vos données commerciales, quand le suivi jusqu’à la signature est en place.'),
 ],
 faq=[
  ('Quel budget faut-il prévoir ?', 'Ça dépend de votre métier, de votre zone et du coût des clics dans votre secteur. On l’estime pendant l’audit, à partir des volumes réels de votre marché, et on commence sur un périmètre réduit pour vérifier avant d’augmenter.'),
  ('Qui possède le compte publicitaire ?', 'Vous. On travaille sur votre compte, avec un accès délégué. Le budget reste sur votre moyen de paiement et vous gardez tout si on s’arrête.'),
  ('Vous garantissez un retour sur investissement ?', 'Non. On s’engage sur la méthode, la transparence des chiffres et un test court avant d’engager plus. Un coût par demande se constate, il ne se promet pas à l’avance.'),
  ('Search ou Performance Max ?', 'Search d’abord, presque toujours : c’est là que se trouve l’intention et c’est ce qu’on contrôle le mieux. Performance Max se justifie quand le volume est suffisant et que le suivi des conversions est fiable.'),
 ],
),
dict(
 slug='meta-ads', name='Meta Ads', menu='Meta Ads', hint='Créer la demande sur Facebook & Instagram',
 card='Aller chercher des clients qui ne vous cherchaient pas encore.', tag='Générer', visual='creative', size='small',
 eyebrow='Publicité Facebook & Instagram',
 h1='Créez la demande<br>avant qu’elle existe.',
 lead='Sur Google, on capte une recherche. Sur Facebook et Instagram, on s’adresse à des gens qui ne vous cherchaient pas encore, mais qui correspondent exactement à votre client.',
 cta='Analyser mon acquisition',
 title='Agence Meta Ads : Facebook et Instagram',
 desc='Campagnes Facebook et Instagram : audiences, créations comparées, formulaires qualifiés et relances. Pour créer de la demande là où la recherche ne suffit pas.',
 problem_title='Personne ne cherche ce que vous vendez. Pas encore.',
 problem=[
  'Votre métier ne génère pas assez de recherches pour remplir un planning.',
  'Vous recrutez des franchisés ou des candidats que Google ne peut pas vous amener.',
  'Vos publicités touchent beaucoup de monde, mais les contacts ne sont pas sérieux.',
  'Les formulaires remplissent un tableau que personne ne rappelle.',
 ],
 approach=[
  ('On choisit qui doit voir', 'Zone, profil, moment. Un loueur de matériel et un réseau de franchise ne s’adressent pas aux mêmes personnes, et pas au même moment.'),
  ('La création fait le travail', 'Sur Meta, c’est le visuel et les premiers mots qui décident. On en produit plusieurs, on les compare, on garde ce qui fonctionne.'),
  ('On qualifie avant de déranger vos équipes', 'Un formulaire trop simple remplit un tableau. Quelques bonnes questions filtrent, et ce qui reste vaut le temps d’un appel.'),
  ('On relance', 'Un contact Meta n’est presque jamais prêt tout de suite. La relance fait souvent plus de rendez-vous que la campagne elle-même.'),
 ],
 build=[
  ('Stratégie', ['Objectif défini avec vous : demandes, candidatures, rendez-vous', 'Audiences par zone, profil et centres d’intérêt', 'Audiences similaires à vos meilleurs clients', 'Budget réparti entre découverte et relance']),
  ('Créations', ['Visuels et vidéos courtes adaptés au fil', 'Plusieurs angles testés en parallèle', 'Accroches réécrites selon les résultats', 'Déclinaisons par région ou par établissement']),
  ('Capture', ['Formulaires Meta avec questions de qualification', 'Landing pages quand la page vaut mieux que le formulaire natif', 'Envoi direct des contacts dans votre CRM', 'Détection des doublons']),
  ('Suite', ['Réponse immédiate par email ou SMS', 'Séquences de relance sur plusieurs semaines', 'Retargeting des visiteurs non convertis', 'Réactivation des contacts anciens']),
 ],
 aside_title='Google capte. Meta provoque.',
 aside='Les deux canaux ne font pas le même travail. Google Ads répond à une demande qui existe déjà et qui est limitée par le nombre de recherches. Meta Ads va créer de l’intérêt chez des gens qui ne vous cherchaient pas, ce qui ouvre un volume plus large mais des contacts plus froids. C’est pour ça qu’ils se complètent, et que la qualification compte encore plus sur Meta.',
 flow=['Création', 'Audience', 'Contact', 'Qualification', 'Rendez-vous'],
 measure=[
  ('Coût par contact', 'Par campagne, par audience et par création.'),
  ('Taux de qualification', 'La part des contacts qui correspondent vraiment à vos critères.'),
  ('Rendez-vous obtenus', 'Ce qui compte réellement pour vos équipes.'),
  ('Coût par client', 'Quand le suivi jusqu’à la signature est en place dans votre CRM.'),
 ],
 faq=[
  ('Meta, ça marche pour du B2B ?', 'Pour beaucoup de métiers locaux, oui : un dirigeant de PME, un artisan ou un candidat à la franchise sont aussi sur Facebook et Instagram. Ce qui change, c’est le message et la qualification, pas le canal.'),
  ('Les contacts Meta sont-ils de mauvaise qualité ?', 'Ils sont plus froids que ceux de Google, c’est normal : la personne ne cherchait rien. La qualité vient des questions de qualification, de la rapidité de réponse et de la relance.'),
  ('Faut-il produire des vidéos ?', 'Souvent, oui, mais pas des films. Des séquences courtes tournées sur vos chantiers, dans vos agences ou avec vos équipes fonctionnent généralement mieux qu’une production léchée.'),
  ('Qui possède le compte publicitaire ?', 'Vous, comme pour Google Ads. Le budget reste chez vous et les audiences construites vous appartiennent.'),
 ],
),
dict(
 slug='agence-ia', name='Agence IA', menu='Agence IA', hint='Agents, automatisations & CRM',
 card='Répondre plus vite, qualifier, relancer et relier vos outils, sans y penser.', tag='Automatiser', visual='workflow', size='dark',
 eyebrow='Agence IA & automatisation',
 h1='Automatisez ce qui<br>ralentit votre croissance.',
 lead='L’intelligence artificielle n’est pas une stratégie. On l’utilise là où elle fait gagner du temps, améliore le suivi ou augmente la conversion. Partout ailleurs, une automatisation classique suffit et coûte moins cher.',
 cta='Identifier ce que je peux automatiser',
 title='Agence IA et automatisation pour PME',
 desc='IA et automatisation pour PME : qualification des demandes, routage vers le CRM, relances email et SMS, connexion entre vos outils. Sans changer vos logiciels.',
 problem_title='Les demandes arrivent. C’est après que ça coince.',
 problem=[
  'Une demande reçue le soir est traitée le surlendemain, quand le prospect a déjà appelé ailleurs.',
  'Les informations vivent dans les emails, le CRM et un tableau partagé qui n’est plus à jour.',
  'Personne ne relance les devis restés sans réponse.',
  'Vos commerciaux passent du temps sur des demandes qui n’aboutiront jamais.',
 ],
 approach=[
  ('On regarde d’abord où part le temps', 'Avant d’automatiser quoi que ce soit, on suit une demande de bout en bout et on note chaque endroit où elle attend.'),
  ('L’IA quand elle apporte vraiment quelque chose', 'Comprendre un message écrit à la main, résumer un historique, classer, proposer une première réponse : ce sont des tâches où elle est réellement utile.'),
  ('L’automatisation classique quand elle suffit', 'Une règle simple est plus fiable, moins chère et plus facile à corriger qu’un modèle. On ne met pas d’IA là où une condition suffit.'),
  ('Un humain garde la main', 'Vous définissez ce qui part tout seul et ce qui passe par une validation. Rien ne s’envoie à un client sans que la règle ait été écrite avec vous.'),
 ],
 build=[
  ('Qualification et routage', ['Lecture et résumé des demandes entrantes', 'Qualification selon vos critères écrits', 'Attribution au bon commercial ou à la bonne agence', 'Détection et fusion des doublons']),
  ('Suivi et relance', ['Réponse immédiate par email ou SMS', 'Séquences de relance pour les devis sans réponse', 'Rappels de rendez-vous', 'Réactivation des contacts anciens']),
  ('Vos outils, reliés', ['CRM au centre, alimenté par toutes les sources', 'Formulaires du site et formulaires publicitaires', 'Agenda et prise de rendez-vous en ligne', 'Connexions par API ou webhook entre vos logiciels']),
  ('Assistants internes', ['Aide à la rédaction des réponses types et des devis', 'Résumé d’un historique client avant un appel', 'Classement automatique des emails entrants', 'Extraction d’informations depuis un document']),
 ],
 aside_title='L’IA quand elle apporte quelque chose. L’automatisation classique quand elle suffit.',
 aside='C’est la règle qui nous évite de vous vendre de la technologie inutile. Trier des demandes selon trois critères chiffrés ne demande aucune IA : une règle le fait mieux, pour zéro euro par mois. Comprendre un message écrit en langage libre, résumer dix échanges ou rédiger un premier brouillon, c’est là que le modèle gagne son coût. On choisit au cas par cas, et on vous dit lequel des deux on utilise.',
 flow=['Nouvelle demande', 'Qualification', 'CRM et commercial assigné', 'Réponse immédiate', 'Relance', 'Rendez-vous'],
 flow2=['Email entrant', 'Analyse du contenu', 'Classement', 'Action déclenchée', 'Validation humaine si nécessaire'],
 measure=[
  ('Délai de première réponse', 'Le plus souvent, l’indicateur qui change le plus de choses.'),
  ('Part des demandes qualifiées automatiquement', 'Ce que vos équipes n’ont plus à trier à la main.'),
  ('Relances envoyées et réponses obtenues', 'Ce que produit le suivi, au-delà de la campagne.'),
  ('Rendez-vous pris', 'Le résultat visible pour vos commerciaux.'),
 ],
 faq=[
  ('Faut-il changer de CRM ?', 'Non. On part de vos outils. Si votre CRM tient la route, on le garde et on le relie au reste. On n’en propose un autre que s’il devient le point de blocage, et on vous le dit clairement.'),
  ('Est-ce que mes données servent à entraîner une IA ?', 'On utilise des services professionnels dont les conditions excluent l’entraînement sur les données clients, et on ne leur transmet que ce qui est nécessaire au traitement. Les services retenus et ce qui leur est envoyé sont écrits noir sur blanc avant le lancement.'),
  ('Et si l’automatisation se trompe ?', 'C’est prévu. Chaque règle a une sortie de secours : au moindre doute, la demande part vers un humain plutôt que vers une réponse automatique. On commence toujours avec une validation avant envoi, puis on relâche ce qui s’est montré fiable.'),
  ('Est-ce que ça remplace quelqu’un ?', 'Pas dans les PME qu’on accompagne. Ça enlève les tâches qui font perdre du temps aux équipes en place : ressaisie, tri, relances oubliées. Le temps récupéré va aux appels et aux rendez-vous.'),
 ],
),
dict(
 slug='landing-pages-cro', name='Landing Pages & CRO', menu='Landing Pages & CRO', hint='Convertir le trafic que vous avez déjà',
 card='Transformer plus de visiteurs en demandes, sans acheter plus de trafic.', tag='Convertir', visual='funnel', size='small',
 eyebrow='Conversion',
 h1='Transformez plus de<br>visiteurs en demandes.',
 lead='Avant d’acheter plus de trafic, il vaut souvent mieux mieux convertir celui que vous avez déjà. C’est plus rapide, et ça rend toutes les campagnes plus rentables.',
 cta='Analyser mon parcours de conversion',
 title='Landing pages et optimisation de la conversion',
 desc='Des pages et des formulaires qui transforment les visiteurs en demandes qualifiées : une page par intention, un parcours mobile simple, des tests A/B.',
 problem_title='Le trafic est là. Les demandes, non.',
 problem=[
  'Votre page d’accueil parle de vous, pas du besoin de celui qui arrive.',
  'Le formulaire demande dix informations pour un premier contact.',
  'Sur mobile, il faut zoomer pour lire et viser pour cliquer.',
  'Toutes les publicités envoient au même endroit, quelle que soit la recherche.',
 ],
 approach=[
  ('Une page par intention', 'Quelqu’un qui cherche une nacelle à Poitiers ne doit pas atterrir sur un catalogue général. La page doit répondre à la recherche qui l’a amené.'),
  ('On enlève avant d’ajouter', 'La plupart des pages convertissent mieux une fois débarrassées de ce qui distrait : menus surchargés, blocs décoratifs, deuxième bouton qui part ailleurs.'),
  ('Le formulaire qualifie sans décourager', 'Assez de questions pour trier, assez peu pour être rempli. Quand il en faut plusieurs, on découpe en étapes.'),
  ('On teste seulement quand le volume le permet', 'En dessous d’un certain nombre de visites, un test A/B ne prouve rien. On le dit plutôt que d’habiller une intuition en science.'),
 ],
 build=[
  ('Pages', ['Landing pages par prestation, par ville ou par campagne', 'Reprise des pages existantes qui reçoivent déjà du trafic', 'Structure lisible en dix secondes', 'Cohérence entre l’annonce et la page']),
  ('Contenu', ['Accroches qui reprennent les mots du visiteur', 'Preuves concrètes : réalisations, zones, délais, garanties', 'Objections traitées avant le formulaire', 'Appel à l’action clair et unique']),
  ('Formulaire', ['Champs réduits au nécessaire', 'Formulaires en plusieurs étapes quand la qualification l’exige', 'Prise de rendez-vous directe quand c’est pertinent', 'Messages d’erreur et confirmations compréhensibles']),
  ('Technique', ['Vitesse d’affichage', 'Parcours mobile testé sur vrai téléphone', 'Suivi des clics et des abandons', 'Tests A/B quand le trafic le justifie']),
 ],
 aside_title='Plus de trafic n’est pas toujours la première réponse.',
 aside='Doubler le budget publicitaire double le coût. Améliorer la conversion d’une page améliore le rendement de toutes les sources qui pointent dessus, référencement compris, sans dépenser un euro de plus en diffusion. C’est souvent par là qu’on commence, parce que c’est ce qui produit un effet le plus vite.',
 flow=['Visiteurs', 'Interactions', 'Demandes', 'Demandes qualifiées'],
 measure=[
  ('Taux de conversion par page', 'Page par page, pas une moyenne de site qui ne veut rien dire.'),
  ('Taux de complétion du formulaire', 'Où les gens abandonnent, et à quel champ.'),
  ('Part des demandes qualifiées', 'Convertir plus ne sert à rien si la qualité s’effondre.'),
  ('Vitesse et confort mobile', 'La première cause de départ avant même la lecture.'),
 ],
 faq=[
  ('Faut-il refaire tout le site ?', 'Non. On commence par les pages qui reçoivent déjà du trafic et par celles qui reçoivent les campagnes. Une refonte complète est un autre sujet, plus long et plus cher, qui n’est pas toujours nécessaire.'),
  ('Combien de trafic faut-il pour un test A/B ?', 'Il faut assez de conversions pour que la différence ne soit pas du hasard, ce que beaucoup de PME n’atteignent pas sur une seule page. En dessous, on s’appuie sur l’analyse du parcours, les enregistrements de comportement et les bonnes pratiques, et on le dit.'),
  ('Vous garantissez une hausse de conversion ?', 'Non, et méfiez-vous des agences qui annoncent un pourcentage avant d’avoir vu votre page. On corrige des problèmes identifiés et on mesure ce que ça change, sans promettre de chiffre à l’avance.'),
  ('Les pages vous appartiennent ?', 'Non, elles sont à vous. Elles vivent sur votre site ou sur votre hébergement, et vous les gardez si la collaboration s’arrête.'),
 ],
),
dict(
 slug='data-tracking', name='Data & Tracking', menu='Data & Tracking', hint='Mesurer du clic jusqu’au client',
 card='Savoir enfin ce qui apporte des clients, et ce qui ne fait que coûter.', tag='Mesurer', visual='dash', size='large',
 eyebrow='Données et pilotage',
 h1='On ne pilote pas<br>ce qu’on ne mesure pas.',
 lead='Qu’est-ce qui vous apporte réellement des clients ? Tant que la réponse n’est pas chiffrée, chaque décision de budget est un pari. Et comme on est payés au résultat, on a besoin des mêmes chiffres que vous.',
 cta='Vérifier mon tracking',
 title='Data, tracking et attribution pour PME',
 desc='La mesure installée dans vos comptes : GA4, Tag Manager, suivi des formulaires et des appels, attribution des demandes, tableau de bord du clic jusqu’au client.',
 problem_title='Des chiffres partout, aucune réponse.',
 problem=[
  'Analytics compte des visites, votre CRM compte des clients, personne ne relie les deux.',
  'Les appels, qui sont souvent la moitié des demandes, ne sont comptés nulle part.',
  'Les demandes arrivent sans source : impossible de savoir qui les a amenées.',
  'Le budget se répartit à l’intuition, ou pire, sur ce dont on se souvient.',
 ],
 approach=[
  ('On installe dans vos comptes', 'Analytics, Tag Manager, Search Console : à votre nom, chez vous. Si on arrête demain, l’historique et les accès restent à vous.'),
  ('On compte ce qui compte', 'Un formulaire envoyé, un appel passé, un rendez-vous pris. Les visites sont un indicateur intermédiaire, pas un résultat.'),
  ('On fait voyager la source jusqu’au client', 'La provenance est attachée à la demande, entre dans le CRM avec elle, et reste visible jusqu’à la signature.'),
  ('Un seul tableau, tenu à jour', 'Canaux, demandes, coût et clients au même endroit. Vous n’avez pas à ouvrir quatre outils pour vous faire une idée.'),
 ],
 build=[
  ('Installation', ['Google Analytics 4 configuré pour votre activité', 'Google Tag Manager', 'Search Console et liaison avec Analytics', 'Bandeau de consentement conforme']),
  ('Ce qu’on suit', ['Envois de formulaires', 'Appels téléphoniques, avec suivi du numéro affiché', 'Clics importants : itinéraire, téléchargement, prise de rendez-vous', 'Étiquettes de campagne sur tous les liens payants']),
  ('Attribution', ['Source rattachée à chaque demande', 'Transmission de la source au CRM', 'Suivi de la demande jusqu’au client', 'Rapprochement du chiffre d’affaires quand vos outils le permettent']),
  ('Restitution', ['Tableau de bord partagé, à jour', 'Vue par canal, par campagne et par établissement', 'Point mensuel sur les arbitrages', 'Export de vos données quand vous le souhaitez']),
 ],
 aside_title='La mesure sert d’abord à couper.',
 aside='Un tableau de bord n’est pas un objet de décoration. Il sert à voir quel canal coûte trop cher pour ce qu’il rapporte, et à déplacer ce budget ailleurs. C’est pour ça qu’on l’installe avant de lancer les campagnes, et pas trois mois après quand il faut justifier une dépense.',
 flow=['Source', 'Visite', 'Demande', 'Demande qualifiée', 'Client', 'Chiffre d’affaires'],
 measure=[
  ('Demandes par canal', 'Référencement, Google Ads, Meta Ads, fiche Google, direct.'),
  ('Coût par demande', 'Par canal et par campagne, budget publicitaire inclus.'),
  ('Taux de qualification', 'La part des demandes qui méritent le temps d’un commercial.'),
  ('Clients et chiffre d’affaires attribués', 'Quand vos outils permettent de relier la demande à la signature.'),
 ],
 faq=[
  ('Et le RGPD dans tout ça ?', 'La mesure d’audience impose un bandeau de consentement dès qu’elle dépose des cookies. On met en place ce qui est nécessaire, et quand c’est possible on propose une solution de mesure sans cookies, qui évite le bandeau tout en donnant les chiffres utiles.'),
  ('On a déjà Google Analytics.', 'Presque toutes les entreprises l’ont. La question n’est pas de l’avoir, c’est de savoir s’il compte les demandes et les appels, et si la source arrive jusqu’au CRM. Dans la plupart des audits qu’on fait, la réponse est non.'),
  ('Le suivi des appels, comment ça marche ?', 'Un numéro de redirection s’affiche selon la provenance du visiteur. L’appel arrive normalement chez vous, et on sait d’où il vient. Rien n’est enregistré sans que vous l’ayez décidé et annoncé.'),
  ('Qui possède les données ?', 'Vous. Les comptes sont créés au nom de votre entreprise et nous y avons un accès délégué, que vous pouvez retirer à tout moment.'),
 ],
),
]

BY_SLUG = {e['slug']: e for e in EXPERTISES}

# Maillage : « cette expertise fonctionne encore mieux avec ».
COMPLEMENTS = {
 'seo': [('geo', 'La même base de contenu sert les moteurs de recherche et les moteurs de réponse.'), ('google-ads', 'Les demandes tout de suite pendant que le référencement s’installe.'), ('landing-pages-cro', 'Le trafic gagné ne vaut que par la page qui le reçoit.'), ('data-tracking', 'Pour savoir quelles pages amènent des demandes, pas seulement des visites.')],
 'geo': [('seo', 'Le socle : structure, autorité et contenu. Sans lui, rien à citer.'), ('data-tracking', 'Pour repérer les visites qui viennent des assistants.')],
 'google-ads': [('landing-pages-cro', 'Le budget publicitaire se gagne ou se perd sur la page d’arrivée.'), ('data-tracking', 'Sans suivi des conversions, optimiser revient à deviner.'), ('agence-ia', 'Une demande payée doit être rappelée en minutes, pas en jours.')],
 'meta-ads': [('landing-pages-cro', 'Un contact froid a besoin d’une page qui explique avant de demander.'), ('agence-ia', 'La relance fait souvent plus de rendez-vous que la campagne.'), ('data-tracking', 'Pour distinguer un contact d’un client.')],
 'agence-ia': [('google-ads', 'Répondre vite à une demande payée change son rendement.'), ('meta-ads', 'Qualifier et relancer les contacts issus des formulaires.'), ('landing-pages-cro', 'Le formulaire est le point de départ de toute automatisation.'), ('data-tracking', 'Automatiser sans mesurer revient à accélérer à l’aveugle.')],
 'landing-pages-cro': [('google-ads', 'Chaque campagne mérite sa page, pas la page d’accueil.'), ('meta-ads', 'Un visiteur qui ne cherchait rien a besoin d’être convaincu.'), ('data-tracking', 'On n’améliore une conversion que si on la mesure correctement.')],
 'data-tracking': [('seo', 'Pour attribuer les demandes aux pages qui les produisent.'), ('google-ads', 'Pour piloter les enchères sur des demandes, pas sur des clics.'), ('landing-pages-cro', 'Les chiffres désignent la page à corriger en premier.')],
}


# ---------- Adresses ----------
def url(slug=None):
 return '/expertises' if slug is None else f'/expertises/{slug}'

def sector_url(slug=None):
 return '/secteurs' if slug is None else f'/secteurs/{slug}'


# ---------- Visuels signature : une interface différente par expertise ----------
def _mock(title, label, inner, cls=''):
 return f'<figure class="mock {cls}"><figcaption class="mock-head"><b>{title}</b><span>{label}</span></figcaption>{inner}</figure>'

def _serp():
 return _mock('Recherche Google', 'Démonstration',
  '<div class="serp-bar"><span aria-hidden="true">⌕</span>location nacelle 12 m poitiers</div>'
  '<div class="serp-pack"><span class="serp-label">Fiches Google et Maps</span>'
  '<div class="serp-place is-you"><div><b>Votre agence</b><i>4,7 ★ · Ouvert · Livraison 24 h</i></div><span class="tag ok">Vous</span></div>'
  '<div class="serp-place"><div><b>Grand réseau national</b><i>4,1 ★ · Ouvert · 6 km</i></div></div></div>'
  '<div class="serp-result is-you"><span class="serp-url">votre-site.fr › location › nacelle › poitiers</span>'
  '<b>Location de nacelle 12 m à Poitiers · Livraison sous 24 h</b>'
  '<p>Hauteur de travail, tarifs à la journée et au week-end, livraison sur chantier. Demande en ligne en deux minutes.</p></div>'
  '<div class="serp-result"><span class="serp-url">annuaire-location.fr › poitiers</span>'
  '<b>Les loueurs de matériel à Poitiers</b><p>Comparatif des loueurs du département.</p></div>')

def _ai():
 return _mock('Assistant conversationnel', 'Démonstration',
  '<div class="ai-turn ai-q"><span>Question</span><p>Quelle entreprise peut rénover une salle de bain à Tours, pour un budget autour de 12 000 € ?</p></div>'
  '<div class="ai-turn ai-a"><span>Réponse</span><p>Plusieurs entreprises interviennent sur ce type de projet à Tours. <mark>Votre entreprise</mark> est citée pour les rénovations complètes, avec des délais annoncés et des chantiers publiés dans cette gamme de budget.</p></div>'
  '<div class="ai-src"><span>Sources citées</span><i>votre-site.fr</i><i>fédération professionnelle</i><i>fiche Google</i></div>')

def _ads():
 rows=[('location nacelle 12 m poitiers','Commerciale','ok','Enchère haute'),
       ('prix location nacelle','Comparaison','warn','Enchère basse'),
       ('nacelle occasion à vendre','Hors sujet','bad','Exclue'),
       ('formation permis nacelle','Hors sujet','bad','Exclue')]
 body=''.join(f'<tr><td>{q}</td><td>{i}</td><td><span class="tag {c}">{d}</span></td></tr>' for q,i,c,d in rows)
 return _mock('Annonce et termes de recherche', 'Démonstration',
  '<div class="ad"><span class="ad-tag">Annonce</span><span class="serp-url">votre-site.fr/location-nacelle</span>'
  '<b>Nacelle 12 m en location · Livraison sous 24 h à Poitiers</b>'
  '<p>Devis en deux minutes. Matériel vérifié, livraison sur chantier, assistance au téléphone.</p>'
  '<div class="ad-links"><span>Tarifs ↗</span><span>Livraison ↗</span><span>Nos agences ↗</span></div></div>'
  '<div class="table-scroll"><table class="data-table"><thead><tr><th>Ce qui est tapé</th><th>Intention</th><th>Décision</th></tr></thead>'
  f'<tbody>{body}</tbody></table></div>')

def _creative():
 cards=[('c1','Version A','« Vous cherchez à ouvrir votre propre agence ? »','Témoignage de franchisé · format vertical'),
        ('c2','Version B','« 150 000 € d’apport. Une zone. Un projet. »','Texte sur fond · format carré'),
        ('c3','Version C','« Une journée dans l’une de nos agences »','Vidéo tournée sur place · format vertical')]
 inner=''.join(f'<div class="creative {c}"><span>{v}</span><b>{t}</b><i>{d}</i></div>' for c,v,t,d in cards)
 return _mock('Créations comparées', 'Démonstration',
  f'<div class="creatives">{inner}</div>'
  '<div class="aud"><div><span>Audience</span><b>Rayon de 40 km · 30 à 55 ans · intérêt entrepreneuriat</b></div>'
  '<div><span>Qualification demandée</span><b>Apport · zone souhaitée · délai de lancement</b></div></div>')

def _chain(title, steps):
 items=''.join(f'<li><span class="chain-n">0{i+1}</span><div><b>{t}</b><i>{d}</i></div><em>{by}</em></li>' for i,(t,d,by) in enumerate(steps))
 return _mock(title, 'Démonstration', f'<ol class="chain">{items}</ol>')

def _workflow():
 a=_chain('Exemple 1 · une demande entrante', [
  ('Nouvelle demande','Formulaire du site, formulaire publicitaire ou appel manqué.','Automatique'),
  ('Qualification','Besoin, zone et budget lus et comparés à vos critères écrits.','IA'),
  ('CRM','Fiche créée, doublon fusionné, commercial ou agence assignée.','Automatique'),
  ('Réponse immédiate','Accusé de réception par email ou SMS, avec le délai de rappel.','Automatique'),
  ('Relance','Deux relances espacées si la demande reste sans réponse.','Automatique'),
  ('Rendez-vous','Créneau proposé depuis votre agenda.','Votre équipe')])
 b=_chain('Exemple 2 · un email entrant', [
  ('Email reçu','Boîte commerciale ou adresse de contact.','Automatique'),
  ('Analyse','Demande, réclamation, facture ou démarchage.','IA'),
  ('Classement','Rangé, étiqueté, rattaché au bon dossier client.','Automatique'),
  ('Action','Réponse type proposée, ou tâche créée pour la bonne personne.','IA'),
  ('Validation','Rien ne part au client sans relecture tant que la règle est jeune.','Votre équipe')])
 return f'<div class="chains">{a}{b}</div>'

def _funnel():
 steps=[('Visiteurs','1 000','100'),('Interactions','620','62'),('Demandes','240','24'),('Demandes qualifiées','110','11')]
 inner=''.join(f'<div class="fstep" style="--w:{w}%"><b>{t}</b><span>{v}</span></div>' for t,v,w in steps)
 return _mock('Parcours de conversion', 'Données de démonstration',
  f'<div class="funnel">{inner}</div>'
  '<p class="mock-note">Chiffres d’illustration, choisis pour montrer comment se lit un parcours. Ce ne sont ni des moyennes de marché, ni un résultat client.</p>')

def _dash():
 rows=[('Google Ads','68','41','38 €','9'),('Référencement','52','35','—','8'),
       ('Meta Ads','44','18','26 €','3'),('Fiche Google','37','29','—','7')]
 body=''.join(f'<tr><td>{c}</td><td>{d}</td><td>{q}</td><td>{p}</td><td><b>{k}</b></td></tr>' for c,d,q,p,k in rows)
 return _mock('Tableau de bord partagé', 'Données de démonstration',
  '<div class="table-scroll"><table class="data-table"><thead><tr><th>Canal</th><th>Demandes</th><th>Qualifiées</th><th>Coût / demande</th><th>Clients</th></tr></thead>'
  f'<tbody>{body}</tbody></table></div>'
  '<p class="mock-note">Chiffres d’illustration. Le coût par demande n’est renseigné que pour les canaux payants ; le référencement et la fiche Google n’ont pas de coût par clic.</p>')

VISUALS = {'serp': _serp, 'ai': _ai, 'ads': _ads, 'creative': _creative, 'workflow': _workflow, 'funnel': _funnel, 'dash': _dash}

def visual(e):
 return VISUALS[e['visual']]()


# ---------- Blocs partagés ----------
def flow(steps, title='Le parcours'):
 items=''.join(f'<li><span>0{i+1}</span><b>{s}</b></li>' for i,s in enumerate(steps))
 return f'<ol class="flow" aria-label="{title}">{items}</ol>'

def cards(slugs=None, current=None):
 """Bento des expertises : trois formats de tuile pour éviter sept cartes identiques."""
 items=[BY_SLUG[s] for s in slugs] if slugs else [e for e in EXPERTISES if e['slug']!=current]
 out=''
 for e in items:
  out+=(f'<a class="xp-card xp-{e["size"]}" href="{url(e["slug"])}">'
        f'<span class="xp-tag">{e["tag"]}</span>'
        f'<h3>{e["name"]}</h3><p>{e["card"]}</p>'
        f'<span class="xp-go" aria-hidden="true">↗</span></a>')
 return f'<div class="xp-grid">{out}</div>'

def system():
 """Les cinq temps de la chaîne d'acquisition, reliés aux expertises."""
 out=''
 for i,(stage,line,slugs) in enumerate(SYSTEM):
  chips=''.join(f'<a href="{url(s)}">{BY_SLUG[s]["name"]} <span aria-hidden="true">↗</span></a>' for s in slugs)
  out+=(f'<li><span class="sys-n">0{i+1}</span><div class="sys-body"><h3>{stage}</h3><p>{line}</p>'
        f'<div class="sys-chips">{chips}</div></div></li>')
 return f'<ol class="system">{out}</ol>'

def complements(slug):
 rows=''.join(
  f'<a class="channel-card" href="{url(s)}"><span class="channel-number">{BY_SLUG[s]["tag"]} ↗</span>'
  f'<h3>{BY_SLUG[s]["name"]}</h3><p>{why}</p></a>' for s,why in COMPLEMENTS[slug])
 return ('<section class="block expertise-section"><div class="wrap"><div class="kicker">Ça marche mieux ensemble</div>'
         '<h2 class="title">Cette expertise fonctionne<br>encore mieux avec.</h2>'
         '<p class="sub">Aucun levier ne travaille seul. Voici ceux qui changent le plus les résultats de celui-ci.</p>'
         f'<div class="channel-grid">{rows}</div></div></section>')

def sectors_for(slug, sector_names):
 """Secteurs où cette expertise est particulièrement pertinente."""
 slugs=[s for s,x in SECTOR_EXPERTISES.items() if slug in x]
 if not slugs: return ''
 chips=''.join(f'<a class="xp-chip" href="{sector_url(s)}">{sector_names[s]} <span aria-hidden="true">↗</span></a>' for s in slugs)
 return ('<section class="block" style="padding-top:0"><div class="wrap"><div class="section-top">'
         '<div><div class="kicker">Où c’est particulièrement utile</div>'
         '<h2 class="title">Les secteurs<br>concernés.</h2></div>'
         '<p class="sub">Une indication, pas une règle. Le bon assemblage se décide pendant l’audit, à partir de votre marché.</p></div>'
         f'<div class="xp-chips">{chips}</div></div></section>')


# Titre et phrase d'introduction du visuel signature de chaque page.
DEMO = {
 'seo': ('Ce que voit votre futur client.', 'Une recherche, une page de résultats, une fiche Google. Tout se joue sur cet écran, et c’est cet écran-là qu’on travaille.'),
 'geo': ('Ce que répond un assistant.', 'La question est posée en langage courant, la réponse cite quelques sources. Notre travail consiste à faire partie de ces sources, avec des informations exactes.'),
 'google-ads': ('L’annonce, et ce qu’on refuse de payer.', 'Une annonce qui répond exactement à la recherche, et une liste de termes exclus. La deuxième partie compte autant que la première.'),
 'meta-ads': ('Plusieurs créations, une seule gagne.', 'On ne devine pas ce qui va fonctionner. On diffuse plusieurs angles en parallèle et on garde celui qui produit des contacts qualifiés.'),
 'agence-ia': ('Deux automatisations, de bout en bout.', 'Chaque étape est écrite avec vous. Vous décidez de ce qui part tout seul, et de ce qui passe par un humain.'),
 'landing-pages-cro': ('Où se perdent les visiteurs.', 'Le parcours se lit d’une traite. Chaque marche perdue coûte des demandes, et se corrige page par page.'),
 'data-tracking': ('Un seul tableau pour décider.', 'Les canaux, les demandes, le coût et les clients au même endroit. C’est ce tableau qui dit où mettre l’euro suivant.'),
}

def build_grid(e):
 cols=''.join(
  f'<div class="build-col"><span class="build-label">{name}</span><ul>'+''.join(f'<li>{i}</li>' for i in items)+'</ul></div>'
  for name,items in e['build'])
 return f'<div class="build-grid">{cols}</div>'

def measure_steps(e):
 return '<div class="steps">'+''.join(
  f'<div class="step"><div class="n">0{i+1}</div><h3>{t}</h3><p>{d}</p></div>'
  for i,(t,d) in enumerate(e['measure']))+'</div>'

def approach_cards(e):
 return '<div class="channel-grid">'+''.join(
  f'<article class="channel-card"><span class="channel-number">0{i+1}</span><h3>{t}</h3><p>{d}</p></article>'
  for i,(t,d) in enumerate(e['approach']))+'</div>'

def problem_grid(e):
 return '<div class="pain-grid four">'+''.join(
  f'<article><span>0{i+1}</span><h3>{p}</h3></article>' for i,p in enumerate(e['problem']))+'</div>'
