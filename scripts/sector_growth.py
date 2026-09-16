from html import escape

DATA = {
'location-de-materiel': dict(leads=40,rate=25,value=450,client='locations conclues',unit='Montant moyen d’une location HT (€)',result='CA potentiel des locations',intro='Nous générons des demandes de location qualifiées et optimisons leur conversion en réservations pour développer votre chiffre d’affaires.',seo='Pages par matériel et ville : mini-pelle, nacelle, échafaudage. Une réponse précise aux recherches dans votre zone de livraison.',ads='Campagnes sur les locations recherchées, ciblées sur votre rayon de livraison et les matériels disponibles.',google='Fiches de vos agences : catégories, matériels, horaires, photos et collecte d’avis après location. Faciliter l’appel et la demande locale.',conversion='Formulaire avec matériel, dates et lieu de livraison. Suivi des appels, réponse rapide et relances jusqu’à la réservation.',follow='Demandes reçues → demandes qualifiées → locations conclues → CA de location.',note='Montant total des locations conclues à partir de ce groupe de prospects, sans supposer de location récurrente.'),
'reseaux-de-franchise': dict(leads=20,rate=5,value=20000,client='signatures de franchise',unit='Droit d’entrée moyen HT (€)',result='Droits d’entrée potentiels',intro='Nous générons des candidatures qualifiées et structurons leur suivi jusqu’à la signature pour développer votre réseau et ses revenus.',seo='Pages sur votre concept, l’investissement et les territoires : attirer des candidats qui cherchent une franchise dans votre secteur.',ads='Campagnes Google Ads sur les intentions de création et de franchise, complétées par Meta Ads pour faire découvrir votre enseigne.',google='Optimisation des fiches des établissements pour soutenir leur acquisition locale. Un levier distinct du recrutement de franchisés.',conversion='Qualification sur apport, zone et délai. Candidatures dans le CRM, dédoublonnage et relances jusqu’au rendez-vous développeur.',follow='Candidatures → profils qualifiés → rendez-vous → signatures de franchise.',note='Simulation des seuls droits d’entrée à la signature. Elle exclut les redevances futures et le CA des franchisés ; le recrutement peut prendre plusieurs mois.'),
'renovation-artisans': dict(leads=30,rate=20,value=8000,client='chantiers signés',unit='Montant moyen d’un chantier HT (€)',result='CA potentiel des chantiers',intro='Nous générons des demandes de devis qualifiées et améliorons leur suivi pour vous aider à signer davantage de chantiers et développer votre chiffre d’affaires.',seo='Pages par métier et commune, illustrées par vos réalisations : être trouvé sur les travaux que vous souhaitez réaliser.',ads='Campagnes Google Ads sur vos prestations prioritaires, avec ciblage géographique et suivi des demandes de devis.',google='Services, zone d’intervention, photos de vrais chantiers et avis clients : donner des raisons de choisir votre entreprise.',conversion='Qualification du type de travaux, de la surface, du budget et du délai. Prise de rendez-vous et relance des devis non signés.',follow='Demandes de devis → projets qualifiés → visites techniques → chantiers signés.',note='Valeur des chantiers signés issus de ces prospects, avant coûts et selon leur calendrier de réalisation. Ce n’est pas un encaissement immédiat.'),
'immobilier': dict(leads=20,rate=10,value=6000,client='ventes finalisées',unit='Honoraires moyens par vente HT (€)',result='Honoraires potentiels',intro='Nous générons des contacts vendeurs qualifiés et optimisons le parcours jusqu’au mandat, puis le suivi des ventes qui créent votre chiffre d’affaires.',seo='Pages de quartiers et contenus pour les propriétaires vendeurs : faire connaître votre expertise locale au moment du projet.',ads='Campagnes Google Ads orientées estimation et vente, sur les communes et types de biens que vous recherchez.',google='Fiche de l’agence, services, photos, horaires et avis : faciliter la découverte locale et la prise de contact.',conversion='Formulaire sur le bien et le calendrier. Suivi du contact, rendez-vous d’estimation, mandat et issue de la vente dans le CRM.',follow='Contacts vendeurs → estimations → mandats → ventes finalisées.',note='Le taux porte ici sur les ventes effectivement finalisées, pas les mandats. Seuls les honoraires sont comptés, jamais le prix du bien ; le cycle peut durer plusieurs mois.'),
'services-a-domicile': dict(leads=30,rate=30,value=300,client='nouveaux clients',unit='CA moyen du premier mois par client HT (€)',result='CA potentiel du premier mois',intro='Nous générons des demandes locales qualifiées et facilitons leur conversion en clients pour développer votre activité selon les capacités de vos équipes.',seo='Pages par service et commune d’intervention pour répondre aux besoins concrets des familles proches de vos agences.',ads='Campagnes Google Ads sur les prestations et zones où vous pouvez accueillir de nouveaux clients.',google='Fiches des agences : prestations, horaires, photos et avis. Faciliter les appels des familles dans votre secteur.',conversion='Qualification du besoin, de la fréquence et de l’adresse. Rappel, rendez-vous d’évaluation et suivi jusqu’au démarrage du service.',follow='Demandes locales → besoins qualifiés → évaluations → nouveaux clients actifs.',note='CA du premier mois de service des nouveaux clients. Aucune durée de fidélité ni reconduction future n’est supposée.'),
'commerces-multi-sites': dict(leads=100,rate=20,value=120,client='clients ayant acheté',unit='Panier moyen du premier achat HT (€)',result='CA potentiel des premiers achats',intro='Nous générons des contacts locaux et optimisons leur conversion en clients, avec un suivi du chiffre d’affaires établissement par établissement.',seo='Une page utile par établissement : offre, informations locales et parcours de contact propres à chaque adresse.',ads='Campagnes Google Ads par zone de chalandise, avec budgets et suivi séparés pour identifier les points de vente qui performent.',google='Optimisation des fiches du réseau : catégories, horaires, photos, services et réponses aux avis, avec une cohérence de marque.',conversion='Réservation ou demande simplifiée, réponse locale et rapprochement avec les achats lorsque vos outils le permettent.',follow='Contacts locaux → réservations ou visites → achats confirmés → CA par établissement.',note='CA des premiers achats attribués aux contacts, sur le périmètre choisi. Les achats répétés et les visiteurs non identifiés sont exclus.')
}

def number(n):
 return f'{n:,.0f}'.replace(',', ' ')

def growth(s):
 d=DATA[s['slug']]
 clients=d['leads']*d['rate']/100
 revenue=clients*d['value']
 return f'''<section class="block growth-section" id="potentiel"><div class="wrap"><div class="section-top"><div><div class="kicker">Des prospects. Des clients. Du chiffre d’affaires.</div><h2 class="title">{TITLES[s["slug"]]["growth"]}</h2></div><p class="sub">Rendez votre acquisition concrète. <br>Ajustez les hypothèses avec vos propres chiffres.</p></div><div class="growth-calculator" data-growth><div class="growth-inputs"><span class="simulation-label">Simulation illustrative · pas un résultat client</span><h3>Partons de votre activité.</h3><label for="growth-leads">Nombre de prospects qualifiés<input id="growth-leads" data-input="leads" type="number" min="0" max="100000" step="1" value="{d['leads']}" required></label><label for="growth-rate">Taux de transformation en {d['client']} (%)<input id="growth-rate" data-input="rate" type="number" min="0" max="100" step="0.1" value="{d['rate']}" required></label><label for="growth-value">{d['unit']}<input id="growth-value" data-input="value" type="number" min="0" max="10000000" step="1" value="{d['value']}" required></label><p class="growth-hint">Valeurs de démonstration librement choisies, sans référence à une moyenne du marché. Utilisez un même groupe de prospects suivi jusqu’à l’issue commerciale.</p></div><div class="growth-results" aria-live="polite" aria-atomic="true"><div class="growth-funnel"><div><span>01 · Acquisition</span><strong data-output="leads">{d['leads']}</strong><p>prospects qualifiés</p></div><span class="funnel-arrow" aria-hidden="true">→</span><div><span>02 · Conversion</span><strong data-output="clients">{number(clients)}</strong><p>{d['client']}</p></div></div><div class="growth-revenue"><span>03 · {d['result']}</span><strong><span data-output="revenue">{number(revenue)}</span> <small>€ HT</small></strong><p data-output="formula">{d['leads']} prospects × {d['rate']} % × {number(d['value'])} €</p></div><p class="growth-note">{d['note']} Le CA n’est pas une marge : budgets publicitaires, honoraires et coûts d’exploitation ne sont pas déduits. Aucune performance n’est garantie.</p><p class="growth-error" role="status" hidden>Complétez les trois valeurs : nombres positifs ou nuls, taux compris entre 0 et 100 %.</p></div></div><div class="growth-next"><span>On valide les hypothèses et les objectifs pendant votre audit.</span><a class="text-link" href="#contact">Recevoir mon audit offert ↗</a></div></div></section>'''

# Mesure & suivi : trois indicateurs par secteur et la source de chaque chiffre.
MEASURE = {
'location-de-materiel': [('Demandes de location qualifiées','Comptées dans votre CRM, avec la source de chaque demande.'),('Coût par demande','Google Ads et Analytics, par matériel et par campagne.'),('Visibilité par matériel et par ville','Search Console : requêtes, positions et pages qui sortent.')],
'reseaux-de-franchise': [('Candidatures qualifiées','Dans votre CRM, avec apport, zone et délai renseignés.'),('Coût par rendez-vous','Meta Ads, Google Ads et Analytics, par région et par campagne.'),('Part des profils répondant aux critères','Tableau de bord partagé, mis à jour à chaque qualification.')],
'renovation-artisans': [('Devis qualifiés reçus','Dans votre CRM, avec type de travaux, budget et délai.'),('Coût par devis qualifié','Google Ads et Analytics, par prestation et par commune.'),('Rendez-vous de visite technique','Tableau de bord partagé, du devis au chantier signé.')],
'immobilier': [('Contacts vendeurs qualifiés','Dans votre CRM, avec le bien et le calendrier du projet.'),('Coût par contact vendeur','Google Ads et Analytics, par commune et par campagne.'),('Rendez-vous d’estimation','Tableau de bord partagé, de l’estimation au mandat.')],
'services-a-domicile': [('Demandes dans votre zone','Dans votre CRM, avec le besoin, la fréquence et l’adresse.'),('Coût par contact qualifié','Google Ads et Analytics, par prestation et par agence.'),('Rendez-vous d’évaluation','Tableau de bord par agence, avec une vue pour le siège.')],
'commerces-multi-sites': [('Contacts par établissement','Dans votre CRM, rattachés à chaque adresse.'),('Coût par contact local','Google Ads et Analytics, par zone de chalandise.'),('Réservations ou rendez-vous','Tableau de bord par point de vente, avec une vue réseau.')]
}
TOOLS = ['Search Console','Google Analytics','Tableau de bord partagé','CRM','Emailing']

def measure(s):
 cards=''.join(f'<article><span>◎</span><h3>{m}</h3><p>{how}</p></article>' for m,how in MEASURE[s['slug']])
 tools=''.join(f'<li>{t}</li>' for t in TOOLS)
 return f'<section class="block" id="mesure"><div class="wrap"><div class="section-top"><div><div class="kicker">Mesure &amp; suivi</div><h2 class="title">{TITLES[s["slug"]]["measure"]}</h2></div><p class="sub">Trois indicateurs suivis avec vos outils,<br>du premier contact au chiffre d’affaires.</p></div><div class="metric-grid">{cards}</div><div class="measure-stack"><span class="kicker">Installé dans vos comptes</span><ul>{tools}</ul><p>Vous gardez tout, même si on arrête.</p></div><div class="sector-pay"><div><div class="kicker">Un modèle aligné</div><h2>Une rémunération par<br>{s["pay"]}.</h2></div><p>On fixe ensemble les critères et les conditions avant le lancement. Le budget publicitaire reste sur votre compte. On commence par un test de 60 jours sur un périmètre réduit.</p></div></div></section>'

# Ouverture des pages métier : le marché vu par les futurs clients, puis le parcours d'une demande.
WHO = {'location-de-materiel':'Vos futurs clients','reseaux-de-franchise':'Vos futurs franchisés','renovation-artisans':'Vos futurs clients','immobilier':'Vos futurs vendeurs','services-a-domicile':'Les familles','commerces-multi-sites':'Vos futurs clients'}
# Exemples de recherches (sans volume) : requête, ce qu'elle révèle, canal où elle apparaît.
SEARCHES = {
'location-de-materiel': [('location nacelle 12 m + votre ville','Un artisan, un chantier la semaine prochaine.','Google'),('louer une mini-pelle le week-end','Un particulier qui compare les prix et les horaires.','Google'),('loueur de matériel ouvert le samedi','Une recherche sur la carte, depuis un téléphone.','Fiche Google')],
'reseaux-de-franchise': [('ouvrir une franchise + votre secteur','Un porteur de projet qui compare les enseignes.','Google'),('devenir franchisé avec 100 000 € d’apport','Un candidat qui vérifie s’il entre dans vos critères.','Google'),('témoignage de franchisé + votre enseigne','Un profil qui hésite encore et cherche des preuves.','Meta')],
'renovation-artisans': [('rénovation salle de bain + votre ville','Un projet précis, souvent avec un budget en tête.','Google'),('prix extension maison 30 m²','Un propriétaire qui se renseigne avant de demander un devis.','Google'),('artisan rénovation près de moi, avis','Une comparaison sur la carte et sur les avis clients.','Fiche Google')],
'immobilier': [('estimation appartement + votre quartier','Un propriétaire qui prépare une vente.','Google'),('combien vaut ma maison à + votre ville','Une première recherche, avant de contacter une agence.','Google'),('agence immobilière + votre commune, avis','Le choix entre trois agences, sur la carte.','Fiche Google')],
'services-a-domicile': [('aide à domicile + votre ville','Une famille qui cherche une agence proche, vite.','Google'),('ménage à domicile tarif horaire','Un besoin régulier, une comparaison des prix.','Google'),('agence de services à domicile près de moi','Une recherche sur la carte, souvent le soir.','Fiche Google')],
'commerces-multi-sites': [('votre enseigne + votre ville','Un client qui cherche l’adresse la plus proche.','Fiche Google'),('votre enseigne horaires, réserver','Une visite ou une réservation dans l’heure.','Fiche Google'),('meilleur + votre catégorie + votre quartier','Un nouveau client qui ne vous connaît pas encore.','Google')]
}
# Parcours d'une demande : étape, ce qui se passe, qui s'en charge.
JOURNEY = {
'location-de-materiel': [('La recherche','Un artisan tape le matériel et sa ville. Il tombe sur votre page, pas sur celle d’un grand réseau.','SHYFT'),('La demande','Matériel, dates, lieu de livraison : un formulaire simple, ou un appel vers votre agence.','SHYFT'),('La réponse','Disponibilité et devis en quelques minutes, relance si pas de retour. Rien ne reste sans réponse.','SHYFT + vous'),('La location','Votre équipe conclut. La demande est comptée, rattachée à sa source et suivie dans le tableau de bord.','Votre équipe')],
'reseaux-de-franchise': [('La découverte','Un porteur de projet découvre votre enseigne sur Google ou Meta, dans sa région.','SHYFT'),('La candidature','Apport, zone, délai : un formulaire qui qualifie avant de prendre du temps à votre développeur.','SHYFT'),('La qualification','Les profils hors critères sont écartés, les candidats en réflexion sont relancés.','SHYFT + vous'),('Le rendez-vous','Votre développeur reçoit un candidat qualifié, dans le CRM, avec son historique.','Votre équipe')],
'renovation-artisans': [('La recherche','Un propriétaire cherche un artisan pour un projet précis, dans sa commune. Il voit vos réalisations.','SHYFT'),('La demande de devis','Travaux, surface, budget, délai : le formulaire fait le tri avant votre premier appel.','SHYFT'),('La réponse','Un rappel rapide et une visite technique proposée avant que le concurrent ne rappelle.','SHYFT + vous'),('Le chantier','Votre équipe signe. Le devis est suivi jusqu’au chantier, avec sa source et sa valeur.','Votre équipe')],
'immobilier': [('La recherche','Un propriétaire prépare une vente et cherche une estimation dans son quartier.','SHYFT'),('La demande d’estimation','Le bien, le calendrier, les coordonnées : un formulaire qui donne du contexte à votre appel.','SHYFT'),('Le rendez-vous','Prise de rendez-vous d’estimation, relance des propriétaires pas encore décidés.','SHYFT + vous'),('Le mandat','Votre négociateur signe. Le contact est suivi jusqu’à la vente, avec sa source et ses honoraires.','Votre équipe')],
'services-a-domicile': [('La recherche','Une famille cherche une agence proche pour un besoin précis. Elle trouve la vôtre, pas une plateforme.','SHYFT'),('La demande','Besoin, fréquence, adresse : une demande dans votre zone d’intervention, pas ailleurs.','SHYFT'),('L’évaluation','Rappel rapide, rendez-vous d’évaluation, relance organisée si la famille hésite.','SHYFT + vous'),('Le démarrage','Votre agence démarre le service. Chaque nouveau client est compté, par agence et pour le siège.','Votre équipe')],
'commerces-multi-sites': [('La recherche','Un client cherche votre enseigne, ou votre catégorie, près de chez lui. Il tombe sur la bonne adresse.','SHYFT'),('Le contact','Réservation, demande ou itinéraire : un parcours simple depuis la fiche ou la page de l’établissement.','SHYFT'),('La réponse locale','L’établissement répond, l’équipe locale est prévenue, les avis sont suivis.','SHYFT + vous'),('L’achat','Le client vient. Contacts et achats sont rapprochés par point de vente, avec une vue réseau.','Votre équipe')]
}

def market(s):
 rows=''.join(f'<div class="rrow"><div><div class="t">« {q} »</div><div class="d">{why}</div></div><span class="tag info">{channel}</span></div>' for q,why,channel in SEARCHES[s['slug']])
 pains=''.join(f'<li>{p}</li>' for p in s['pain'])
 return f'<section class="block" id="marche"><div class="wrap audit"><div><div class="kicker">Votre marché</div><h2 class="title">{WHO[s["slug"]]}<br>cherchent déjà.</h2><p class="sub">Des exemples de recherches dans votre métier. Et ce qui se passe aujourd’hui quand elles arrivent :</p><ul class="plain">{pains}</ul><a class="btn btn-lime" href="#contact">Recevoir mon audit offert</a></div><div class="report" aria-label="Exemples de recherches de vos futurs clients"><div class="report-head"><b>Ce qu’ils tapent</b><span>Exemples, sans volume</span></div>{rows}</div></div></section>'

# Les quatre leviers d'un secteur : bento asymétrique, chaque carte renvoie vers l'expertise correspondante.
# (nom, sous-titre, clé du texte dans DATA, expertise liée, visuel, trois éléments concrets)
LEVERS = [
 ('SEO & référencement naturel','Capter une recherche utile','seo','seo','serp',
  ['Pages par prestation et par ville','Contenu qui répond aux recherches réelles','Suivi des positions et du trafic hors marque']),
 ('Google Ads','Générer des prospects ciblés','ads','google-ads','ads',
  ['Mots-clés à intention commerciale','Exclusions et ciblage sur votre zone','Suivi des conversions et des appels']),
 ('Fiche Google et Maps','Convertir la proximité en contacts','google','seo','map',
  ['Catégories, services, photos, horaires','Avis collectés et traités','Une fiche à jour par établissement']),
 ('Optimisation de l’acquisition','Transformer les prospects en clients','conversion','landing-pages-cro','flow',
  ['Un formulaire qui qualifie sans décourager','Réponse rapide et relances automatiques','Suivi de la demande jusqu’à la signature']),
]
SPANS = ['wide','narrow','narrow','wide']

def _mini(kind):
 """Petite interface décorative, dans la palette du site."""
 if kind=='serp':
  return ('<div class="mini mini-serp" aria-hidden="true"><span class="mini-bar">métier + ville</span>'
          '<div class="mini-row is-you"><i style="width:72%"></i><i style="width:45%"></i></div>'
          '<div class="mini-row"><i style="width:58%"></i><i style="width:36%"></i></div>'
          '<div class="mini-row"><i style="width:64%"></i></div></div>')
 if kind=='ads':
  return ('<div class="mini mini-ads" aria-hidden="true"><span class="mini-tag">Annonce</span>'
          '<div class="mini-row"><i style="width:80%"></i><i style="width:52%"></i></div>'
          '<div class="mini-bars"><b style="--h:34%"></b><b style="--h:52%"></b><b style="--h:44%"></b>'
          '<b style="--h:70%"></b><b style="--h:88%"></b></div></div>')
 if kind=='map':
  return ('<div class="mini mini-map" aria-hidden="true"><span class="pin" style="left:22%;top:30%"></span>'
          '<span class="pin is-you" style="left:54%;top:52%"></span><span class="pin" style="left:76%;top:26%"></span>'
          '<span class="pin" style="left:38%;top:74%"></span></div>')
 return ('<div class="mini mini-flow" aria-hidden="true"><span>Demande</span><em>→</em>'
         '<span>Qualifiée</span><em>→</em><span class="is-you">Client</span></div>')

def _demo(kind, ex):
 """Panneau d'exemples concrets : du texte réel, pas une maquette grise."""
 if kind=='seo':
  items=''.join(f'<li>{u}</li>' for u in ex['seo'])
  return f'<span class="demo-label">Les pages qu’on construit sur votre site</span><ul class="demo-pages">{items}</ul>'
 if kind=='ads':
  items=''.join(f'<li><span>{k}</span><em class="tag {c}">{d}</em></li>' for k,d,c in ex['ads'])
  return f'<span class="demo-label">Ce qu’on cible, ce qu’on exclut</span><ul class="demo-kw">{items}</ul>'
 if kind=='google':
  name,rating,hours,actions=ex['google']
  acts=''.join(f'<span>{a}</span>' for a in actions)
  return ('<span class="demo-label">Votre fiche, tenue à jour</span>'
          f'<div class="demo-gbp"><b>{name}</b><i>{rating}</i><i>{hours}</i>'
          f'<div class="gbp-actions">{acts}</div></div>')
 items=''.join(f'<li><span>{q}</span><b>{a}</b></li>' for q,a in ex['conversion'])
 return ('<span class="demo-label">Ce que le formulaire demande</span>'
         f'<ul class="demo-form">{items}<li class="demo-result"><span>Résultat</span>'
         '<b>Une demande qualifiée</b></li></ul>')

def channels(s):
 d=DATA[s['slug']]; ex=EXAMPLES[s['slug']]
 cards=''
 for i,(name,subtitle,key,expertise,kind,_items) in enumerate(LEVERS):
  cards+=(f'<article class="lever"><span class="lever-n">0{i+1}</span>'
          f'<h3>{name}</h3><h4>{subtitle}</h4><p>{d[key]}</p>'
          f'<div class="lever-demo">{_demo(key,ex)}</div>'
          f'<a class="text-link" href="/expertises/{expertise}">Voir notre expertise ↗</a></article>')
 return ('<section class="block expertise-section"><div class="wrap"><div class="section-top">'
         '<div><div class="kicker">Comment on génère vos opportunités</div>'
         f'<h2 class="title">{TITLES[s["slug"]]["levers"]}</h2></div>'
         '<p class="sub">On relie votre visibilité, les demandes reçues et leur transformation commerciale. '
         'Chaque levier répond à une étape précise.</p></div>'
         f'<div class="lever-grid">{cards}</div></div></section>')

def journey(s):
 steps=''.join(
  f'<li class="jstep"><span class="jbadge">Étape {i+1}</span><b>{title}</b><p>{text}</p><em>{role}</em></li>'
  for i,(title,text,role) in enumerate(JOURNEY[s['slug']]))
 return ('<section class="block" id="parcours"><div class="wrap"><div class="section-top">'
         '<div><div class="kicker">Votre parcours d’acquisition</div>'
         f'<h2 class="title">{TITLES[s["slug"]]["journey"]}</h2></div>'
         f'<p class="sub">{DATA[s["slug"]]["follow"]}</p></div>'
         f'<ol class="journey">{steps}</ol></div></section>')


# ---------- Titres propres à chaque métier ----------
TITLES = {
'location-de-materiel': dict(journey='Du clic<br>à la location.', levers='Quatre leviers.<br>Un objectif : votre planning rempli.',
 measure='Ce qu’on suit,<br>de la demande à la location.', growth='Ce que de nouvelles locations<br>peuvent changer.', faq='Avant de se lancer.'),
'reseaux-de-franchise': dict(journey='Du clic<br>au franchisé signé.', levers='Quatre leviers.<br>Un objectif : vos prochaines ouvertures.',
 measure='Ce qu’on suit,<br>de la candidature à la signature.', growth='Ce que de nouvelles ouvertures<br>peuvent changer.', faq='Avant d’ouvrir.'),
'renovation-artisans': dict(journey='Du clic<br>au chantier signé.', levers='Quatre leviers.<br>Un objectif : vos prochains chantiers.',
 measure='Ce qu’on suit,<br>du devis au chantier.', growth='Ce que de nouveaux chantiers<br>peuvent changer.', faq='Avant le premier chantier.'),
'immobilier': dict(journey='Du clic<br>au mandat.', levers='Quatre leviers.<br>Un objectif : vos prochains mandats.',
 measure='Ce qu’on suit,<br>du contact à la vente.', growth='Ce que de nouveaux mandats<br>peuvent changer.', faq='Avant le premier mandat.'),
'services-a-domicile': dict(journey='Du clic<br>au premier rendez-vous.', levers='Quatre leviers.<br>Un objectif : vos prochaines familles.',
 measure='Ce qu’on suit,<br>de la demande au démarrage.', growth='Ce que de nouveaux clients<br>peuvent changer.', faq='Avant la première intervention.'),
'commerces-multi-sites': dict(journey='Du clic<br>à la visite en magasin.', levers='Quatre leviers.<br>Un objectif : du monde à chaque adresse.',
 measure='Ce qu’on suit,<br>adresse par adresse.', growth='Ce que du trafic en plus<br>peut changer.', faq='Avant d’étendre au réseau.'),
}

# ---------- La section que ce métier est le seul à avoir ----------
def _sig_location():
 rows=[('Nacelle 12 m',[1,1,0]),('Mini-pelle 1,5 t',[1,0,1]),('Échafaudage roulant',[1,1,1]),('Compacteur',[0,1,0])]
 body=''
 for name,cells in rows:
  tds=''.join(f'<td><span class="cell {"on" if c else "off"}">{"Page en ligne" if c else "À créer"}</span></td>' for c in cells)
  body+=f'<tr><td>{name}</td>{tds}</tr>'
 return ('<figure class="mock"><figcaption class="mock-head"><b>Une page par croisement</b><span>Démonstration</span></figcaption>'
  '<div class="table-scroll"><table class="data-table grid-table"><thead><tr><th>Matériel</th><th>Tours</th><th>Poitiers</th><th>Angers</th></tr></thead>'
  f'<tbody>{body}</tbody></table></div>'
  '<p class="mock-note">Chaque case est une page qui répond à une recherche précise. C’est long à construire, et c’est exactement ce que les grands réseaux ont fait avant vous.</p></figure>')

def _sig_franchise():
 left=''.join(f'<li>{x}</li>' for x in ['Campagnes Meta et Google sur les intentions de création','Qualification sur l’apport, la zone et le délai','Candidatures centralisées, relancées jusqu’au rendez-vous'])
 right=''.join(f'<li>{x}</li>' for x in ['Fiche Google tenue à jour pour chaque établissement','Pages locales déclinées depuis la marque','Demandes remontées au franchisé, vue consolidée au siège'])
 return ('<div class="split">'
  f'<div class="split-col"><span class="split-label">01 · Recruter</span><b>Des candidats franchisés</b>'
  f'<p>Un candidat cherche un projet d’entreprise, pas un produit. Le cycle dure des mois et se joue sur la qualification.</p><ul>{left}</ul>'
  '<em>Piloté avec le siège</em></div>'
  '<div class="split-mid" aria-hidden="true"><span>et</span></div>'
  f'<div class="split-col alt"><span class="split-label">02 · Remplir</span><b>Les points de vente</b>'
  f'<p>Un client cherche une adresse près de chez lui. Le cycle dure quelques minutes et se joue sur la visibilité locale.</p><ul>{right}</ul>'
  '<em>Piloté avec chaque franchisé</em></div></div>')

def _sig_renovation():
 items=[(1,'Rénovation complète','Le cœur de votre savoir-faire'),(1,'Budget à partir de 8 000 €','En dessous, le devis coûte plus qu’il ne rapporte'),
        (1,'30 km autour de votre atelier','Au-delà, les trajets mangent la marge'),(0,'Dépannage en urgence','Casse le planning des chantiers en cours'),
        (0,'Projets sans budget arrêté','Beaucoup de devis, peu de signatures')]
 body=''.join(f'<li class="{"yes" if ok else "no"}"><span class="crit-mark" aria-hidden="true">{"✓" if ok else "✕"}</span>'
              f'<div><b>{name}</b><i>{why}</i></div><span class="tag {"ok" if ok else "bad"}">{"Ciblé" if ok else "Écarté"}</span></li>'
              for ok,name,why in items)
 return ('<figure class="mock"><figcaption class="mock-head"><b>Vos critères de chantier</b><span>Exemple à définir ensemble</span></figcaption>'
  f'<ul class="criteria">{body}</ul>'
  '<p class="mock-note">Ces critères pilotent les mots-clés, les zones et les questions du formulaire. Ce qu’on écarte compte autant que ce qu’on cible.</p></figure>')

def _sig_immobilier():
 steps=[('Jour 0','Contact vendeur','Une demande d’estimation arrive avec le bien et le calendrier.'),
        ('Jour 3','Rendez-vous','Votre négociateur se déplace, l’estimation est remise.'),
        ('Semaine 2','Mandat','Le propriétaire signe, ou repousse. Les indécis sont relancés.'),
        ('Mois 3','Compromis','Un acheteur se positionne. Le contact devient une transaction.'),
        ('Mois 5','Vente','Les honoraires tombent. La demande d’origine est enfin mesurable.')]
 body=''.join(f'<li><span class="tl-when">{w}</span><b>{t}</b><p>{d}</p></li>' for w,t,d in steps)
 return (f'<ol class="timeline">{body}</ol>'
  '<p class="mock-note tl-note">Durées indicatives, variables selon le bien et le marché. L’enjeu n’est pas la vitesse, c’est de garder la source du contact attachée au dossier pendant tout ce temps.</p>')

def _sig_domicile():
 rows=[('Agence de Tours',88,'Presque pleine','warn','Campagne ralentie'),
       ('Agence de Blois',100,'Complète','bad','Campagne en pause'),
       ('Agence d’Amboise',42,'De la place','ok','Campagne renforcée')]
 body=''.join(f'<div class="cap-row"><b>{n}</b><div class="cap-bar"><i style="--f:{f}%"></i></div>'
              f'<span class="cap-state">{s}</span><span class="tag {c}">{a}</span></div>' for n,f,s,c,a in rows)
 return ('<figure class="mock"><figcaption class="mock-head"><b>Capacité et campagnes</b><span>Démonstration</span></figcaption>'
  f'<div class="capacity">{body}</div>'
  '<p class="mock-note">Une campagne qui tourne alors que l’agence est pleine coûte de l’argent et déçoit des familles. Le budget suit vos disponibilités, agence par agence.</p></figure>')

def _sig_commerces():
 rows=[('Tours centre','41','12','7'),('Blois','28','9','5'),('Amboise','17','4','2')]
 body=''.join(f'<tr><td>{a}</td><td>{c}</td><td>{r}</td><td><b>{v}</b></td></tr>' for a,c,r,v in rows)
 return ('<div class="views">'
  '<figure class="mock"><figcaption class="mock-head"><b>Vue du siège</b><span>Démonstration</span></figcaption>'
  '<div class="table-scroll"><table class="data-table"><thead><tr><th>Établissement</th><th>Contacts</th><th>Réservations</th><th>Achats</th></tr></thead>'
  f'<tbody>{body}</tbody></table></div></figure>'
  '<figure class="mock"><figcaption class="mock-head"><b>Vue d’une adresse</b><span>Démonstration</span></figcaption>'
  '<div class="addr"><span class="addr-label">Tours centre</span><b>Votre enseigne · Tours</b>'
  '<div class="addr-line"><span>Fiche Google</span><i>À jour · 4,6 ★</i></div>'
  '<div class="addr-line"><span>Page locale</span><i>En ligne</i></div>'
  '<div class="addr-line"><span>Contacts ce mois</span><i>41</i></div>'
  '<div class="addr-line"><span>Campagne locale</span><i>Active</i></div></div></figure></div>')

SIGNATURE = {
'location-de-materiel': dict(after='levers', kicker='Votre catalogue', title='Une page par matériel.<br>Une page par ville.',
 lead='Un artisan ne cherche pas « location de matériel ». Il cherche une machine précise, dans une ville précise, pour des dates précises.', html=_sig_location),
'reseaux-de-franchise': dict(after='market', kicker='La particularité franchise', title='Deux acquisitions.<br>Pas une.',
 lead='Un réseau doit recruter des franchisés et faire venir des clients dans leurs points de vente. Deux métiers, deux cycles, deux budgets.', html=_sig_franchise),
'renovation-artisans': dict(after='market', kicker='Le tri en amont', title='Les chantiers que vous voulez.<br>Pas tous les chantiers.',
 lead='Le meilleur moyen d’arrêter de perdre du temps sur des demandes sans suite, c’est de décider à l’avance lesquelles vous intéressent.', html=_sig_renovation),
'immobilier': dict(after='journey', kicker='Le temps long', title='Un contact aujourd’hui.<br>Une vente dans cinq mois.',
 lead='Votre métier a le cycle le plus long des six que nous accompagnons. C’est ce qui rend la mesure indispensable, et souvent absente.', html=_sig_immobilier),
'services-a-domicile': dict(after='levers', kicker='Votre contrainte réelle', title='L’acquisition suit<br>vos capacités.',
 lead='Vous ne cherchez pas le maximum de demandes. Vous cherchez le bon nombre, dans les zones où vos équipes peuvent intervenir.', html=_sig_domicile),
'commerces-multi-sites': dict(after='journey', kicker='Deux points de vue', title='Le siège voit le réseau.<br>Chaque adresse voit la sienne.',
 lead='Un directeur d’établissement et un directeur marketing ne regardent pas les mêmes chiffres. Le même suivi doit répondre aux deux.', html=_sig_commerces),
}

def signature(s):
 d=SIGNATURE[s['slug']]
 return ('<section class="block sig-section" id="specificite"><div class="wrap"><div class="section-top">'
         f'<div><div class="kicker">{d["kicker"]}</div><h2 class="title">{d["title"]}</h2></div>'
         f'<p class="sub">{d["lead"]}</p></div>{d["html"]()}</div></section>')


# ---------- Exemples concrets affichés dans chaque carte de levier ----------
# Du texte réel plutôt qu'une maquette grise : ce qu'on construit vraiment, secteur par secteur.
EXAMPLES = {
'location-de-materiel': dict(
 seo=['/location-nacelle-12m/poitiers','/mini-pelle-1-5t/tours','/echafaudage-roulant/angers'],
 ads=[('location nacelle poitiers','Ciblé','ok'),('prix location nacelle','Enchère basse','warn'),('nacelle occasion à vendre','Exclu','bad')],
 google=('Votre agence · Poitiers','4,7 ★ · 128 avis','Ouvert · ferme à 18 h',['Itinéraire','Appeler','Demander un devis']),
 conversion=[('Quel matériel ?','Nacelle 12 m'),('Quelles dates ?','du 12 au 15 mars'),('Livraison où ?','Chantier, Poitiers')]),
'reseaux-de-franchise': dict(
 seo=['/devenir-franchise','/investissement-et-apport','/nos-territoires-disponibles'],
 ads=[('ouvrir une franchise restauration','Ciblé','ok'),('franchise sans apport','Enchère basse','warn'),('emploi en franchise','Exclu','bad')],
 google=('Votre enseigne · Tours','4,5 ★ · 96 avis','Ouvert · ferme à 22 h',['Itinéraire','Réserver','Voir la carte']),
 conversion=[('Apport disponible ?','150 000 €'),('Quelle zone ?','Lyon et périphérie'),('Sous quel délai ?','moins de 6 mois')]),
'renovation-artisans': dict(
 seo=['/renovation-salle-de-bain/tours','/extension-maison/amboise','/renovation-complete/blois'],
 ads=[('rénovation salle de bain tours','Ciblé','ok'),('prix extension maison','Enchère basse','warn'),('emploi maçon','Exclu','bad')],
 google=('Votre entreprise · Tours','4,8 ★ · 64 avis','Ouvert · ferme à 18 h',['Itinéraire','Appeler','Demander un devis']),
 conversion=[('Quels travaux ?','Extension 30 m²'),('Quel budget ?','autour de 60 000 €'),('Pour quand ?','printemps prochain')]),
'immobilier': dict(
 seo=['/estimation/tours-centre','/vendre-son-bien/amboise','/prix-au-m2/blois'],
 ads=[('estimation appartement tours','Ciblé','ok'),('prix m2 tours','Enchère basse','warn'),('location appartement tours','Exclu','bad')],
 google=('Votre agence · Tours','4,6 ★ · 212 avis','Ouvert · ferme à 19 h',['Itinéraire','Appeler','Estimer mon bien']),
 conversion=[('Quel bien ?','Appartement, 78 m²'),('Où ?','Tours centre'),('Projet de vente ?','dans les 3 mois')]),
'services-a-domicile': dict(
 seo=['/aide-a-domicile/tours','/menage-repassage/blois','/garde-d-enfants/amboise'],
 ads=[('aide à domicile tours','Ciblé','ok'),('tarif horaire ménage','Enchère basse','warn'),('emploi aide à domicile','Exclu','bad')],
 google=('Votre agence · Tours','4,7 ★ · 87 avis','Ouvert · ferme à 18 h',['Itinéraire','Appeler','Être rappelé']),
 conversion=[('Quel besoin ?','Aide au quotidien'),('Quelle fréquence ?','3 fois par semaine'),('Quelle commune ?','Saint-Avertin')]),
'commerces-multi-sites': dict(
 seo=['/magasins/tours-centre','/magasins/blois','/nos-adresses'],
 ads=[('votre enseigne tours','Ciblé','ok'),('horaires votre enseigne','Enchère basse','warn'),('recrutement votre enseigne','Exclu','bad')],
 google=('Votre enseigne · Tours centre','4,6 ★ · 143 avis','Ouvert · ferme à 20 h',['Itinéraire','Réserver','Voir les horaires']),
 conversion=[('Quelle adresse ?','Tours centre'),('Pour quand ?','samedi 14 h'),('Combien de personnes ?','4 personnes')]),
}
