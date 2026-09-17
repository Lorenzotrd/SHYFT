from pathlib import Path
import re, json
from sector_growth import DATA, growth, channels, measure, market, journey, signature, SIGNATURE, TITLES
import expertises as XP
from expertises import EXPERTISES, BY_SLUG, GROUPS, DEMO, url as xurl

BRAND='SHYFT'
YEAR=2026
# Adresse publique du site, sans barre oblique finale, par exemple 'https://www.shyft.fr'.
# Vide : pas de canonical ni d'og:image ; le sitemap et robots.txt contiennent un texte à remplacer.
SITE_URL='https://www.shyftgrowth.com'
# Identifiant de mesure Google Analytics 4, de la forme G-XXXXXXXXXX.
# Vide : aucun script de mesure, aucun cookie, aucun bandeau de consentement.
GA_ID='G-XC6CD5J71S'
BASE=SITE_URL or 'https://VOTRE-DOMAINE'
root=Path(__file__).resolve().parent.parent
old=(root/'elan-site.original.html').read_text()
css=re.search(r'<style>(.*?)</style>',old,re.S).group(1)
(root/'assets/base.css').write_text(css)
sectors=[
 dict(slug='location-de-materiel',name='Location de matériel',icon='↗',title='Vos machines louées.<br>Pas immobilisées.',desc='Devenez le premier réflexe des artisans et particuliers qui cherchent du matériel près de chez eux.',short='Remplissez votre planning de location.',photo='equipment',pain=['Les grands réseaux passent devant vous sur Google.','Votre catalogue est en PDF et les demandes arrivent par téléphone.','Les recherches continuent après la fermeture de vos agences.'],services=['Des pages par matériel et par ville de livraison.','Des campagnes Google Ads sur votre rayon réel.','Un formulaire de demande simple, pensé pour le mobile.','Une réponse automatique et un suivi des demandes.','Des fiches Google cohérentes pour chaque agence.'],metrics=['Demandes de location qualifiées','Coût par demande','Visibilité par matériel et par ville'],pay='demande de location qualifiée',signal='Demande de location',value='Nacelle 12 m',question='Et si le matériel demandé est indisponible ?',answer='Les campagnes et formulaires se concentrent sur les familles de matériel que vous souhaitez louer. Les critères de qualification précisent comment traiter une indisponibilité.'),
 dict(slug='reseaux-de-franchise',name='Réseaux de franchise',icon='⊞',title='Vos prochaines ouvertures<br>commencent ici.',desc='Rencontrez des candidats qui ont le bon apport, la bonne zone et un vrai projet entrepreneurial.',short='Rencontrez vos futurs franchisés.',photo='franchise',pain=['Les portails partagent les mêmes candidats avec vos concurrents.','Les candidatures se perdent entre les tableaux et le CRM.','Vos campagnes attirent du volume, mais peu de profils adaptés.'],services=['Des campagnes Meta par région et par profil.','Une qualification sur l’apport, la zone et le délai.','Des candidatures centralisées dans votre CRM.','Des relances pour les candidats encore en réflexion.','Des contenus pour faire découvrir votre enseigne.'],metrics=['Candidatures qualifiées','Coût par rendez-vous','Part des profils répondant aux critères'],pay='candidat qualifié ou rendez-vous',signal='Projet de franchise',value='Profil qualifié',question='Comment définissez-vous un candidat qualifié ?',answer='Nous fixons ensemble les critères avant le lancement : apport personnel, territoire souhaité, calendrier et adéquation avec le réseau.'),
 dict(slug='renovation-artisans',name='Rénovation & artisans',icon='⌂',title='De beaux chantiers.<br>De vrais projets.',desc='Recevez des demandes de devis avec un besoin clair, un budget et une zone qui vous correspondent.',short='Trouvez les chantiers qui vous ressemblent.',photo='renovation',pain=['Vous passez trop de temps sur des demandes sans budget.','Les prospects sont déjà chez un concurrent quand vous rappelez.','Votre savoir-faire est visible sur les chantiers, moins sur Google.'],services=['Des pages par métier et commune, avec vos vrais chantiers.','Un formulaire qui précise travaux, surface, budget et délai.','Des annonces sur les prestations que vous voulez développer.','Une réponse rapide et une prise de rendez-vous simplifiée.','Une fiche Google et des avis clients entretenus.'],metrics=['Devis qualifiés reçus','Coût par devis qualifié','Rendez-vous de visite technique'],pay='demande de devis qualifiée',signal='Projet de rénovation',value='Extension 30 m²',question='Puis-je choisir les types de chantiers ?',answer='Oui. Nous définissons les prestations, la zone et les critères de projet qui vous intéressent avant de créer les campagnes.'),
 dict(slug='immobilier',name='Immobilier',icon='⌑',title='Votre prochain mandat<br>est peut-être tout près.',desc='Faites connaître votre agence aux propriétaires qui préparent une vente dans votre secteur.',short='Créez plus de contacts avec les vendeurs.',photo='property',pain=['Votre visibilité dépend surtout des portails immobiliers.','Les demandes d’estimation manquent de contexte.','Votre expertise locale est difficile à distinguer en ligne.'],services=['Des pages locales dédiées à vos quartiers.','Des campagnes orientées estimation et projet de vente.','Un formulaire qui précise le bien et le calendrier.','Un suivi des demandes jusqu’au rendez-vous.','Une fiche Google à jour et une collecte d’avis.'],metrics=['Contacts vendeurs qualifiés','Coût par contact vendeur','Rendez-vous d’estimation'],pay='contact vendeur qualifié ou rendez-vous',signal='Projet immobilier',value='Estimation de bien',question='Travaillez-vous sur une zone précise ?',answer='Oui. Les pages et les campagnes sont construites autour de vos communes et quartiers, selon les biens et mandats recherchés.'),
 dict(slug='services-a-domicile',name='Services à domicile',icon='♡',title='Plus proche des familles.<br>Plus visible localement.',desc='Reliez votre agence aux familles qui ont besoin de vous, dans les zones où vos équipes interviennent.',short='Développez votre activité de proximité.',photo='homecare',pain=['Les familles ne trouvent pas toujours votre agence locale.','Les demandes arrivent hors de votre zone d’intervention.','L’acquisition n’est pas alignée avec vos disponibilités.'],services=['Des pages par prestation et zone d’intervention.','Des campagnes adaptées à votre capacité d’accueil.','Une qualification du besoin et de la fréquence.','Une réponse initiale et des relances organisées.','Un suivi par agence, partagé avec le siège.'],metrics=['Demandes dans votre zone','Coût par contact qualifié','Rendez-vous d’évaluation'],pay='demande qualifiée ou rendez-vous',signal='Besoin à domicile',value='Intervention régulière',question='Peut-on adapter les campagnes à nos capacités ?',answer='Oui. Nous définissons les prestations et zones prioritaires avec vous et ajustons les campagnes lorsque vos disponibilités changent.'),
 dict(slug='commerces-multi-sites',name='Commerces multi-sites',icon='▦',title='Une seule marque.<br>Un cran au-dessus, à chaque adresse.',desc='Développez la visibilité locale de chaque établissement avec une stratégie cohérente à l’échelle du réseau.',short='Faites rayonner chacune de vos adresses.',photo='retail',pain=['Les fiches de vos établissements sont inégales.','Les campagnes locales sont difficiles à coordonner.','Le siège manque de visibilité sur les contacts par adresse.'],services=['Des fiches Google cohérentes et à jour.','Des pages propres à chaque établissement.','Des campagnes locales déclinées depuis votre marque.','Un parcours de contact ou de réservation simplifié.','Un suivi par point de vente et une vue réseau.'],metrics=['Contacts par établissement','Coût par contact local','Réservations ou rendez-vous'],pay='contact qualifié, avec périmètre défini par établissement',signal='Visibilité du réseau',value='Chaque adresse compte',question='Faut-il lancer tous les établissements ensemble ?',answer='Non. Le test peut commencer sur quelques adresses avant d’étendre la méthode aux autres établissements du réseau.')]
(root/'assets/sectors.json').write_text(json.dumps(sectors,ensure_ascii=False,indent=2))
# Titre de référencement, description et texte alternatif de la photo, par métier.
SEO_SECTEURS = {
 'location-de-materiel': ('Agence marketing pour loueurs de matériel', 'Remplissez votre planning de location : pages par matériel et par ville, Google Ads sur votre rayon de livraison, demandes suivies jusqu’à la réservation.', 'Ouvriers sur un chantier équipé de matériel de construction'),
 'reseaux-de-franchise': ('Recrutement de franchisés : agence digitale', 'Rencontrez des candidats qualifiés sur l’apport, la zone et le délai. Campagnes Meta et Google, candidatures centralisées et relancées jusqu’au rendez-vous.', 'Réunion d’équipe autour d’un ordinateur portable'),
 'renovation-artisans': ('Agence SEO et Google Ads pour artisans', 'Recevez des demandes de devis avec un besoin clair, un budget et une zone qui vous correspondent. Pages par métier et commune, formulaire qui qualifie.', 'Intérieur en cours de rénovation'),
 'immobilier': ('Agence marketing immobilier : plus de mandats', 'Captez les propriétaires qui préparent une vente dans votre secteur : pages de quartier, campagnes orientées estimation, suivi du contact jusqu’au mandat.', 'Séjour lumineux d’un logement'),
 'services-a-domicile': ('Acquisition pour les services à domicile', 'Des demandes locales qualifiées, dans les zones où vos équipes peuvent intervenir. Pages par prestation et commune, campagnes réglées sur vos capacités.', 'Accompagnement d’une personne à son domicile'),
 'commerces-multi-sites': ('Visibilité locale et Google Maps multi-sites', 'Faites venir du monde dans chaque établissement : fiches Google cohérentes, pages locales par adresse, suivi des contacts point de vente par point de vente.', 'Intérieur d’un commerce de centre-ville'),
}

logo='<span class="brandmark" aria-hidden="true">↗</span>shyft<span class="brand-dot">.</span>'

def nav(prefix=''):
 slinks=''.join(f'<a href="/secteurs/{s["slug"]}">{s["name"]}<span aria-hidden="true">↗</span></a>' for s in sectors)
 cols=''
 for gname,gslugs in GROUPS:
  links=''.join(f'<a href="{xurl(sl)}"><span class="mega-text"><b>{BY_SLUG[sl]["menu"]}</b><i>{BY_SLUG[sl]["hint"]}</i></span><span aria-hidden="true">↗</span></a>' for sl in gslugs)
  cols+=f'<div class="mega-col"><span class="mega-label">{gname}</span>{links}</div>'
 return f'''<nav class="nav" aria-label="Navigation principale"><a class="logo" href="/" aria-label="{BRAND}, accueil">{logo}</a><button class="menu-toggle" aria-expanded="false" aria-controls="navigation">Menu <span>☰</span></button><div class="navigation" id="navigation"><div class="dropdown"><button class="dropdown-toggle" aria-expanded="false" aria-controls="sector-menu">Nos secteurs <span aria-hidden="true">⌄</span></button><div class="dropdown-menu" id="sector-menu" hidden>{slinks}<a href="/secteurs">Tous les secteurs <span aria-hidden="true">→</span></a></div></div><div class="dropdown mega"><button class="dropdown-toggle" aria-expanded="false" aria-controls="expertise-menu">Nos expertises <span aria-hidden="true">⌄</span></button><div class="dropdown-menu mega-menu" id="expertise-menu" hidden><div class="mega-cols">{cols}</div><a class="mega-all" href="/expertises">Toutes nos expertises <span aria-hidden="true">→</span></a></div></div><a href="/#methode">Notre méthode</a></div><a class="btn btn-lime nav-cta" href="#contact">Parlons de votre projet <span class="arrow-circle">↗</span></a></nav>'''

def grid(prefix=''):
 return '<div class="sector-grid">'+''.join(f'''<a class="sector-card" href="/secteurs/{s['slug']}"><div class="sector-photo"><img src="/assets/{s['photo']}.jpg" loading="lazy" alt="{SEO_SECTEURS[s['slug']][2]}" width="800" height="600"><span class="sector-number">0{i+1}</span><span class="sector-open" aria-hidden="true">↗</span></div><div class="sector-text"><h3>{s['name']}</h3><p>{s['short']}</p></div></a>''' for i,s in enumerate(sectors))+'</div>'

def footer(prefix=''):
 cookies='<a href="#" data-cookies>Gérer les cookies</a>' if GA_ID else ''
 xl=''.join(f'<a href="{xurl(e["slug"])}">{e["name"]}</a>' for e in EXPERTISES)
 return f'''<footer class="site-footer"><div class="wrap footer-top"><div><a class="logo" href="/" aria-label="{BRAND}, accueil">{logo}</a><p>Votre savoir-faire mérite<br>d’être trouvé.</p></div><div><span class="footer-label">Nos expertises</span>{xl}</div><div><span class="footer-label">Explorer</span><a href="/secteurs">Nos secteurs</a><a href="/expertises">Toutes nos expertises</a><a href="/#methode">Notre méthode</a></div><div><span class="footer-label">Votre prochain pas</span><a href="#contact">Recevoir mon audit offert ↗</a><p>Pour les PME bien implantées<br>sur le terrain.</p></div></div><div class="wrap footer-bottom"><span>© {YEAR} {BRAND}. On avance ensemble.</span><span class="footer-legal"><a href="/mentions-legales">Mentions légales</a><a href="/confidentialite">Confidentialité</a>{{COOKIES}}</span><span>Stratégie · Acquisition · Mesure</span></div></footer>'''.replace('{COOKIES}',cookies)

# Formulaire : repris de l'original, secteur présélectionné sur les pages métier, lien vers la confidentialité.
form=re.search(r'<div class="hero-shell" id="contact">.*?</div>\s*</div>\s*\n\s*<footer>',old,re.S).group(0).rsplit('<footer>',1)[0]
form=form.replace('Voyons ce que Google, Meta et les IA disent de votre entreprise.','Et si on passait<br>à la vitesse supérieure&nbsp;?').replace('Laissez vos coordonnées : on prépare votre audit et on vous le présente en visio.','Tout commence par un regard neuf. Parlez-nous de votre entreprise, on identifie vos prochaines opportunités.')
form=form.replace('novalidate','').replace('<label>Prénom et nom','<div class="form-heading full"><span class="kicker">Faisons connaissance</span><h3>Votre audit commence ici.</h3></div><label>Prénom et nom')
form=form.replace('<p class="legal full">Vos informations servent uniquement à préparer votre audit et à vous recontacter.</p>','<input type="hidden" name="page"><input type="hidden" name="utm_source"><input type="hidden" name="utm_medium"><input type="hidden" name="utm_campaign"><input type="hidden" name="gclid"><input type="hidden" name="referrer"><input type="hidden" name="firstSeen"><label class="honeypot" aria-hidden="true">Ne pas remplir<input name="website_check" tabindex="-1" autocomplete="off"></label><p class="legal full">Vos informations servent uniquement à préparer votre audit et à vous recontacter. <a href="/confidentialite">Politique de confidentialité</a>.</p>')
form=re.sub(r'<select name="secteur" required>.*?</select>','{SELECT}',form,flags=re.S)
assert '{SELECT}' in form

def options(selected=None):
 names=[s['name'] for s in sectors]+['Autre']
 first='' if selected else '<option value="">Choisir</option>'
 return '<select name="secteur" required>'+first+''.join(f'<option{" selected" if n==selected else ""}>{n}</option>' for n in names)+'</select>'

def contact(prefix='',selected=None):
 return form.replace('{SELECT}',options(selected))

def ld(items):
 return '<script type="application/ld+json">'+json.dumps(items,ensure_ascii=False)+'</script>'

def analytics():
 return f'<script src="/assets/analytics.js" data-ga="{GA_ID}" defer></script>' if GA_ID else ''

def page(title,description,body,prefix='',path=''):
 # Sur mobile, certains <br> sont masqués : un espace avant chaque <br> évite les mots collés.
 body=re.sub(r'(?<=\S)<br>',' <br>',body)
 extra=f'<link rel="canonical" href="{SITE_URL}/{path}"><meta property="og:url" content="{SITE_URL}/{path}"><meta property="og:image" content="{SITE_URL}/assets/og.png">' if SITE_URL else ''
 return f'<!doctype html><html lang="fr" data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{title}</title><meta name="description" content="{description}"><meta property="og:title" content="{title}"><meta property="og:description" content="{description}"><meta property="og:type" content="website"><meta property="og:site_name" content="{BRAND}"><meta property="og:locale" content="fr_FR"><meta name="twitter:card" content="summary_large_image">{extra}<meta name="theme-color" content="#067bb1"><link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet"><link rel="stylesheet" href="/assets/base.css"><link rel="stylesheet" href="/assets/design.css"></head><body><a class="skip-link" href="#main">Aller au contenu</a>{body}<script src="/assets/site.js" defer></script>'+analytics()+'</body></html>'

STEPS='''<div class="steps three">
      <div class="step"><div class="n">Étape 1 · Audit offert et plan chiffré</div><h3>Identifier</h3><p>On analyse votre visibilité, on vous présente les constats avec les chiffres de votre marché, et on estime ensemble ce que valent les demandes pour vous.</p></div>
      <div class="step"><div class="n">Étape 2 · Test de 60 jours</div><h3>Construire</h3><p>On lance sur un périmètre réduit, quelques services ou quelques villes, pour mesurer vite ce qui fonctionne.</p></div>
      <div class="step"><div class="n">Étape 3 · Pilotage au résultat</div><h3>Développer</h3><p>On garde ce qui marche, on coupe le reste, et on étend aux autres zones ou métiers.</p></div>
    </div>

    '''
# ---------- Accueil ----------
body=old.split('<body>',1)[1].split('<script>',1)[0]
body=re.sub(r'<nav class="nav".*?</nav>',nav(),body,flags=re.S)
body=body.replace('<main>','<main id="main">')
body=body.replace('<div class="hero-copy">','<div class="hero-copy"><div class="hero-eyebrow"><span></span> Audit offert · Paiement au résultat</div>',1)
body=body.replace('Vos clients vous cherchent.<span class="l2">On vous rend impossible&nbsp;à&nbsp;rater.</span>','Votre prochain client<br><span class="l2">vous cherche déjà.</span>')
body=body.replace('Élan génère des demandes qualifiées pour les PME et les réseaux français : location de matériel, franchises, rénovation. Référencement, Google, Meta et IA, pilotés ensemble et payés au résultat.','SHYFT apporte aux PME bien implantées sur le terrain les demandes qui leur manquent en ligne. On repère celles de votre marché, on les capte, on mesure ce qu’elles rapportent.')
body=body.replace('<a class="btn btn-glass" href="#secteurs">Voir ce qu\'on fait pour vous</a>','<a class="btn btn-glass" href="#methode">Voir notre méthode</a>')
body=body.replace('Aperçu des signaux suivis pour chaque client, dans un tableau partagé','<span class="caption-dot"></span> Vos objectifs. Notre point de départ.')
body=body.replace('tableau de bord Élan','tableau de bord '+BRAND).replace('Pourquoi Élan','Pourquoi '+BRAND)
body=body.replace('<div class="v">680 / mois</div>','<div class="v">Être trouvé, ici.</div>')
body=body.replace('<div class="v">4,6 <span class="stars" aria-hidden="true">★★★★★</span></div>','<div class="v">Votre présence locale</div>').replace('94 avis','Horaires · Photos · Avis').replace('Appels ce mois','Le bon contact').replace('+ 31','Au bon endroit')
body=body.replace('Une équipe d\'acquisition pour les entreprises qui n\'en ont pas','Vous avez le savoir-faire.<br>On lui donne <span class="inline-spark">↗</span> de la visibilité.')
body=body.replace('Beaucoup de PME et de réseaux ont un bon produit, un site, parfois une agence. Ce qui manque, c\'est quelqu\'un qui relie tout jusqu\'à la demande reçue.','Une équipe à vos côtés pour transformer les recherches en rencontres,<br>et les premiers contacts en nouvelles opportunités.')
bento='''<div class="bento"><div class="tile skyt"><span class="tile-eyebrow">Une ambition commune</span><span class="giant-arrow" aria-hidden="true">↗</span><div class="inner"><div class="big">Votre croissance.</div><p>Votre métier, votre territoire, vos objectifs. C’est de là que tout part.</p></div></div><div class="tile grey"><span class="tile-eyebrow">Pour commencer</span><div class="stat">60<span> jours</span></div><h3>On teste. On mesure.<br>On avance.</h3><p>Un périmètre réduit pour identifier ce qui fonctionne avant d’aller plus loin.</p><a class="text-link" href="#methode">Comprendre la méthode ↗</a></div><div class="tile limet"><span class="tile-eyebrow">Nos intérêts sont alignés</span><div class="stat">Au résultat<span>↗</span></div><p>Des demandes, des rendez-vous, des candidats. Des critères définis ensemble.</p></div><div class="tile darkt"><span>Vos outils. Vos comptes.<br>Vous gardez la main.</span><span class="ownership-icon" aria-hidden="true">◎</span></div></div>'''
body=re.sub(r'<div class="bento">.*?\n    </div>\n  </div>\n</section>',bento+'\n</div>\n</section>',body,count=1,flags=re.S)
sectorsection='''<section class="block" id="secteurs"><div class="wrap"><div class="section-top"><div><div class="kicker">À chaque métier, sa vitesse</div><h2 class="title">Votre secteur.<br>Vos vrais enjeux.</h2></div><p class="sub">On ne remplit pas un planning de location<br>comme on recrute un franchisé.<br>Découvrez une approche pensée pour vous.</p></div>'''+grid()+'''<div class="sector-tail"><span>Votre métier n’est pas dans la liste ? Parlons-en.</span><a class="text-link" href="#contact">Échanger sur mon projet ↗</a></div></div></section>'''
body=re.sub(r'<section class="block" id="secteurs".*?</section>',sectorsection,body,flags=re.S)
expert=('<section class="block expertise-section" id="expertises"><div class="wrap"><div class="section-top">'
 '<div><div class="kicker">Nos expertises</div><h2 class="title">Le digital ne manque pas d’outils.<br>Il manque d’une stratégie commune.</h2></div>'
 '<p class="sub">De la première recherche au client signé, on connecte les bons leviers<br>autour d’un seul objectif : une acquisition mesurable.</p></div>'
 +XP.cards()+
 '<div class="sector-tail"><span>Sept expertises, une seule chaîne : être trouvé, générer, convertir, automatiser, mesurer.</span>'
 '<a class="text-link" href="/expertises">Découvrir toutes nos expertises ↗</a></div></div></section>')
body=body.replace('<!-- ================= AUDIT ================= -->',expert+'<!-- ================= AUDIT ================= -->')
body=body.replace('Aucune annonce, alors que les clics coûtent moins de 1 $','Une opportunité de visibilité à étudier dans votre zone').replace('Exemple anonymisé','Exemple illustratif')
# Audit : la mesure devient un point contrôlé.
body=body.replace('<li>Ce que ChatGPT, Gemini et Google IA répondent sur votre métier</li>','<li>Ce que ChatGPT, Gemini et Google IA répondent sur votre métier</li>\n        <li>Votre suivi : Analytics, Search Console et comptage des demandes</li>')
body=body.replace('<div class="rrow"><div><div class="t">Avis clients</div>','<div class="rrow"><div><div class="t">Mesure</div><div class="d">Aucun suivi des demandes par source</div></div><span class="tag bad">À installer</span></div>\n      <div class="rrow"><div><div class="t">Avis clients</div>')
# Mesure & suivi : ce qu'on installe chez les clients.
tools=[('Google Search Console','Ce que les gens tapent pour vous trouver, vos positions et les pages qui sortent.'),('Google Analytics','D’où viennent vos visiteurs et ce qu’ils font : formulaires envoyés, appels, pages vues.'),('Tableau de bord partagé','Demandes, coût par demande et rendez-vous réunis dans un seul tableau, mis à jour en continu.'),('CRM','Chaque demande centralisée avec sa source et son statut, jusqu’à la signature.'),('Emailing','Des relances automatiques pour les contacts qui ne sont pas encore prêts.')]
mesure='''<!-- ================= MESURE ================= -->
<section class="block measure-section" id="mesure"><div class="wrap"><div class="section-top"><div><div class="kicker">Mesure &amp; suivi</div><h2 class="title">Ce qu’on installe<br>pour tout mesurer.</h2></div><p class="sub">Payés au résultat, on a besoin de chiffres justes.<br>Chaque demande est comptée, chaque euro est suivi.</p></div><div class="measure-grid"><div class="report measure-board" aria-label="Exemple de tableau de bord partagé"><div class="report-head"><b>Tableau de bord partagé</b><span>Illustration, données fictives</span></div><div class="rrow"><div><div class="t">Demandes qualifiées</div><div class="d">Ce mois, toutes sources confondues</div></div><b class="measure-value">42</b></div><div class="rrow"><div><div class="t">Coût par demande</div><div class="d">Google Ads et Meta Ads</div></div><b class="measure-value">38 €</b></div><div class="rrow"><div><div class="t">Sources</div><div class="d">Google 61 % · Meta 24 % · Direct 15 %</div></div><span class="tag ok">Analytics</span></div><div class="rrow"><div><div class="t">Rendez-vous pris</div><div class="d">Suivis dans votre CRM</div></div><b class="measure-value">11</b></div><div class="rrow"><div><div class="t">Relances envoyées</div><div class="d">Séquence email automatique</div></div><b class="measure-value">27</b></div></div><div class="measure-list">'''
mesure+=''.join(f'<article><span class="expert-number">0{i+1}</span><div><h3>{n}</h3><p>{d}</p></div></article>' for i,(n,d) in enumerate(tools))
mesure+='''</div></div><div class="sector-tail"><span>Tout est installé dans vos comptes Google, votre CRM et votre outil email. Si on arrête, vous gardez tout.</span><a class="text-link" href="/expertises/data-tracking">Voir l’expertise Data &amp; Tracking ↗</a></div></div></section>

'''
body=body.replace('<!-- ================= METHOD ================= -->',mesure+'<!-- ================= METHOD ================= -->')
body=body.replace('<details><summary>Avec quelles entreprises travaillez vous ?','<details><summary>Comment suit-on les résultats ?</summary><p>Search Console, Google Analytics et votre CRM sont installés dans vos comptes. Un tableau de bord partagé compte chaque demande, sa source et son coût. Vous y accédez à tout moment.</p></details>\n      <details><summary>Avec quelles entreprises travaillez vous ?')
body,n=re.subn(r'<div class="steps">.*?</div>\s*\n\s*<div class="pay">',lambda m: STEPS+'<div class="pay">',body,count=1,flags=re.S)
assert n==1, 'steps'
body,n=re.subn(r'<!-- =+ TEAM =+ -->.*?</section>\n','',body,count=1,flags=re.S)
assert n==1, 'team'
body=body.replace('<section class="block" id="faq" style="padding-top:20px">','<section class="block" id="faq">',1)
body=body[:body.index('<!-- ================= FINAL CTA ================= -->')]+contact()+footer()
for marker in ('id="mesure"','Comment suit-on les résultats','À installer','/confidentialite','xp-card','/expertises'):
 assert marker in body, marker
organisation={'@context':'https://schema.org','@type':'ProfessionalService','name':BRAND,
 '@id':(SITE_URL+'/#organisation') if SITE_URL else BRAND,
 'description':'Agence d’acquisition digitale pour les PME et réseaux bien implantés sur le terrain : référencement, Google Ads, Meta Ads, intelligence artificielle et mesure.',
 'areaServed':{'@type':'Country','name':'France'},
 'knowsAbout':['Référencement naturel','Référencement local','Google Ads','Meta Ads','Automatisation et intelligence artificielle','Optimisation de la conversion','Mesure et attribution'],
 'hasOfferCatalog':{'@type':'OfferCatalog','name':'Nos expertises','itemListElement':[
  {'@type':'Offer','itemOffered':{'@type':'Service','name':e['name'],
   **({'url':f'{SITE_URL}/expertises/{e["slug"]}'} if SITE_URL else {})}} for e in EXPERTISES]}}
if SITE_URL:
 organisation['url']=SITE_URL+'/'
 organisation['logo']=SITE_URL+'/assets/og.png'
site={'@context':'https://schema.org','@type':'WebSite','name':BRAND,'inLanguage':'fr-FR',
 **({'url':SITE_URL+'/'} if SITE_URL else {})}
(root/'index.html').write_text(page(BRAND+' · Votre prochain client vous cherche déjà.','SHYFT apporte aux PME bien implantées sur le terrain les demandes qui leur manquent en ligne : SEO, Google Ads, Meta Ads, IA et mesure. Audit offert.',body+ld([organisation,site]),'',''))

# ---------- Pages métier ----------
(root/'secteurs').mkdir(exist_ok=True)
for s in sectors:
 p='../'
 s={**s, 'desc': DATA[s['slug']]['intro']}
 hero=f'''<div class="hero-shell"><header class="hero sector-hero">{nav(p)}<div class="sector-hero-grid"><div><div class="hero-eyebrow">{s['name']}</div><h1>{s['title']}</h1><p class="lead">{s['desc']}</p><a class="btn btn-lime" href="#contact">Recevoir mon audit offert <span class="arrow-circle">↗</span></a></div><div class="sector-cover"><img src="/assets/{s['photo']}.jpg" alt="{SEO_SECTEURS[s['slug']][2]}" width="800" height="600"><div class="floating-signal"><span class="pulse"></span>{s['signal']}<strong>{s['value']}</strong><small>Exemple de parcours</small></div></div></div></header></div>'''
 parts=[('market',market(s)),('journey',journey(s)),('levers',channels(s)),('measure',measure(s)),('growth',growth(s))]
 after=SIGNATURE[s['slug']]['after']
 main='<main id="main">'
 for key,html in parts:
  main+=html
  if key==after: main+=signature(s)
 faqs=[(s['question'],s['answer']),('Faut-il refaire notre site ?','Pas nécessairement. Nous partons de votre site et de vos outils actuels. Des pages ou formulaires ciblés peuvent compléter ce qui existe.'),('Que contient l’audit offert ?',f'Un état des lieux de votre visibilité, de vos parcours de contact et de vos opportunités pour votre activité : {s["name"].lower()}. Les recommandations sont adaptées à votre zone.'),('Comment suit-on les résultats ?','Search Console, Google Analytics et votre CRM sont installés dans vos comptes. Un tableau de bord partagé compte chaque demande, sa source et son coût.'),('Qui définit ce qui est qualifié ?','Vous et nous, avant le test. Les critères sont écrits et partagés pour suivre les demandes avec la même définition.')]
 main+='<section class="block" style="padding-top:0"><div class="wrap"><div class="kicker">Vos questions</div><h2 class="title">Avant de se lancer.</h2><div class="faq">'+''.join(f'<details><summary>{q}</summary><p>{a}</p></details>' for q,a in faqs)+'</div></div></section></main>'
 schema={'@context':'https://schema.org','@type':'FAQPage','mainEntity':[{'@type':'Question','name':q,'acceptedAnswer':{'@type':'Answer','text':a}} for q,a in faqs]}
 seo_titre,seo_desc,_alt=SEO_SECTEURS[s['slug']]
 chemin=f'secteurs/{s["slug"]}'
 service={'@context':'https://schema.org','@type':'Service','name':f'Acquisition digitale · {s["name"]}',
  'serviceType':seo_titre,'description':seo_desc,'provider':{'@type':'Organization','name':BRAND},
  'areaServed':{'@type':'Country','name':'France'}}
 fil={'@context':'https://schema.org','@type':'BreadcrumbList','itemListElement':[
  {'@type':'ListItem','position':1,'name':'Accueil'},
  {'@type':'ListItem','position':2,'name':'Secteurs'},
  {'@type':'ListItem','position':3,'name':s['name']}]}
 if SITE_URL:
  service['url']=f'{SITE_URL}/{chemin}'
  for i,item in enumerate(fil['itemListElement']):
   item['item']=f'{SITE_URL}/'+['','secteurs',chemin][i]
 (root/'secteurs'/f'{s["slug"]}.html').write_text(page(seo_titre+' · '+BRAND,seo_desc,
  hero+main+contact(p,s['name'])+footer(p)+ld([service,fil,schema]),p,chemin))
listing='<div class="hero-shell"><header class="hero listing-hero">'+nav('../')+'<div class="hero-copy"><div class="hero-eyebrow">Nos secteurs</div><h1>Chaque métier a ses défis.<br><span class="l2">Trouvons le bon rythme.</span></h1><p class="lead">Une approche d’acquisition qui part de votre réalité.</p></div></header></div><main id="main"><section class="block"><div class="wrap">'+grid('../')+'</div></section></main>'+contact('../')+footer('../')
(root/'secteurs/index.html').write_text(page('Nos six secteurs d’expertise · '+BRAND,'Location, franchise, rénovation, immobilier, services à domicile et commerces multi-sites : découvrez nos approches.',listing,'../','secteurs'))


# ---------- Pages expertises ----------
(root/'expertises').mkdir(exist_ok=True)
sector_names={s['slug']:s['name'] for s in sectors}

for e in EXPERTISES:
 dtitle,dline=DEMO[e['slug']]
 path=f'expertises/{e["slug"]}'
 hero=('<div class="hero-shell"><header class="hero xp-hero">'+nav()+
   '<div class="hero-copy xp-hero-copy">'+
   f'<div class="hero-eyebrow">{e["eyebrow"]}</div><h1>{e["h1"]}</h1><p class="lead">{e["lead"]}</p>'
   f'<div class="hero-cta"><a class="btn btn-lime" href="#contact">{e["cta"]} <span class="arrow-circle">↗</span></a>'
   '<a class="btn btn-glass" href="/#methode">Voir notre méthode</a></div></div></header></div>')
 m='<main id="main">'
 m+=('<section class="block"><div class="wrap"><div class="section-top"><div><div class="kicker">Le problème</div>'
     f'<h2 class="title">{e["problem_title"]}</h2></div><p class="sub">Ce qu’on retrouve le plus souvent au début d’un audit.</p></div>'
     +XP.problem_grid(e)+'</div></section>')
 m+=('<section class="block expertise-section"><div class="wrap"><div class="kicker">Notre approche</div>'
     '<h2 class="title">Comment on s’y prend.</h2>'+XP.approach_cards(e)+'</div></section>')
 m+=(f'<section class="block"><div class="wrap"><div class="section-top"><div><div class="kicker">En pratique</div>'
     f'<h2 class="title">{dtitle}</h2></div><p class="sub">{dline}</p></div>'+XP.visual(e)+'</div></section>')
 m+=('<section class="block" style="padding-top:0"><div class="wrap"><div class="kicker">Ce qu’on met en place</div>'
     '<h2 class="title">Le détail du travail.</h2>'+XP.build_grid(e)+'</div></section>')
 m+=(f'<section class="block" style="padding-top:0"><div class="wrap"><div class="sector-pay xp-aside">'
     f'<div><div class="kicker">À retenir</div><h2>{e["aside_title"]}</h2></div><p>{e["aside"]}</p></div></div></section>')
 if e['visual']!='workflow':
  m+=('<section class="block"><div class="wrap"><div class="kicker">Le parcours</div>'
      '<h2 class="title">Du premier signal<br>au client.</h2>'+XP.flow(e['flow'])+'</div></section>')
 m+=('<section class="block"><div class="wrap"><div class="section-top"><div><div class="kicker">Ce qu’on mesure</div>'
     '<h2 class="title">Les chiffres<br>qu’on regarde.</h2></div><p class="sub">Installés dans vos comptes, réunis dans un tableau partagé.</p></div>'
     +XP.measure_steps(e)+'</div></section>')
 m+=XP.complements(e['slug'])
 m+=XP.sectors_for(e['slug'],sector_names)
 m+=('<section class="block" style="padding-top:0"><div class="wrap"><div class="kicker">Vos questions</div>'
     f'<h2 class="title">{TITLES[s["slug"]]["faq"]}</h2><div class="faq">'+
     ''.join(f'<details><summary>{q}</summary><p>{a}</p></details>' for q,a in e['faq'])+'</div></div></section></main>')
 service={'@context':'https://schema.org','@type':'Service','name':e['name'],'serviceType':e['title'],
          'description':e['desc'],'provider':{'@type':'Organization','name':BRAND},
          'areaServed':{'@type':'Country','name':'France'}}
 crumb={'@context':'https://schema.org','@type':'BreadcrumbList','itemListElement':[
   {'@type':'ListItem','position':1,'name':'Accueil'},
   {'@type':'ListItem','position':2,'name':'Expertises'},
   {'@type':'ListItem','position':3,'name':e['name']}]}
 faq={'@context':'https://schema.org','@type':'FAQPage','mainEntity':[
   {'@type':'Question','name':q,'acceptedAnswer':{'@type':'Answer','text':a}} for q,a in e['faq']]}
 if SITE_URL:
  service['url']=f'{SITE_URL}/{path}'
  for i,item in enumerate(crumb['itemListElement']):
   item['item']=f'{SITE_URL}/'+['','expertises',path][i]
 (root/'expertises'/f'{e["slug"]}.html').write_text(
   page(e['title']+' · '+BRAND, e['desc'], hero+m+contact()+footer()+ld([service,crumb,faq]), '', path))

xhero=('<div class="hero-shell"><header class="hero listing-hero">'+nav()+
 '<div class="hero-copy"><div class="hero-eyebrow">Nos expertises</div>'
 '<h1>Être trouvé. Convaincre.<br><span class="l2">Convertir. Mesurer.</span></h1>'
 '<p class="lead">SEO, publicité, IA, automatisation et données : SHYFT réunit les expertises nécessaires pour construire une acquisition cohérente et mesurable.</p>'
 '<div class="hero-cta"><a class="btn btn-glass" href="/#methode">Découvrir notre méthode</a>'
 '<a class="btn btn-lime" href="#contact">Recevoir mon audit offert <span class="arrow-circle">↗</span></a></div>'
 '</div></header></div>')
xmain=('<main id="main">'
 '<section class="block"><div class="wrap"><div class="section-top"><div><div class="kicker">Le système</div>'
 '<h2 class="title">Cinq temps.<br>Sept expertises.</h2></div>'
 '<p class="sub">Chaque expertise répond à un moment précis du parcours. Prises séparément, elles produisent des chiffres. Reliées, elles produisent des clients.</p></div>'
 +XP.system()+'</div></section>'
 '<section class="block expertise-section"><div class="wrap"><div class="kicker">Le détail</div>'
 '<h2 class="title">Nos sept expertises.</h2>'
 '<p class="sub">On ne les active pas toutes en même temps. L’audit dit par où commencer, et le test de 60 jours le vérifie.</p>'
 +XP.cards()+'</div></section>'
 '<section class="block"><div class="wrap"><div class="section-top"><div><div class="kicker">Par métier</div>'
 '<h2 class="title">Et pour<br>votre secteur ?</h2></div>'
 '<p class="sub">Chaque métier n’a pas besoin des mêmes leviers, ni dans le même ordre.</p></div>'
 +grid()+'</div></section></main>')
(root/'expertises/index.html').write_text(page(
 'Nos expertises : SEO, GEO, Ads, IA et data · '+BRAND,
 'SEO, GEO, Google Ads, Meta Ads, agence IA, landing pages et data : les sept expertises que SHYFT relie pour construire une acquisition mesurable.',
 xhero+xmain+contact()+footer(),'','expertises'))

# ---------- Pages légales : les passages surlignés sont à compléter avant la mise en ligne ----------
def simple(eyebrow,h1,lead,content):
 return f'<div class="hero-shell"><header class="hero listing-hero legal-hero">{nav()}<div class="hero-copy"><div class="hero-eyebrow">{eyebrow}</div><h1>{h1}</h1><p class="lead">{lead}</p></div></header></div><main id="main"><section class="block"><div class="wrap"><div class="legal-text">{content}</div></div></section></main>'+contact()+footer()
mentions=f'''<h2>Éditeur du site</h2><p>{BRAND}, <mark>À compléter : forme juridique, capital social, adresse du siège, numéro SIREN ou RCS, numéro de TVA</mark>.</p><p>Directeur de la publication : <mark>À compléter</mark>. Contact : <mark>À compléter : adresse email</mark>.</p><h2>Hébergement</h2><p><mark>À compléter : nom de l’hébergeur, adresse et téléphone</mark>.</p><h2>Propriété intellectuelle</h2><p>Les textes, la marque {BRAND} et la mise en page de ce site appartiennent à {BRAND}. Toute reproduction sans autorisation écrite est interdite.</p><h2>Crédits</h2><p>Les photographies d’illustration proviennent d’Unsplash et ne représentent ni l’équipe ni des clients. Les chiffres affichés dans les illustrations et les simulateurs sont fictifs. Polices Geist et Geist Mono, chargées depuis Google Fonts.</p><h2>Données personnelles</h2><p>Le traitement des informations du formulaire est décrit dans la <a href="/confidentialite">politique de confidentialité</a>.</p>'''
cookies_off='<h2>Cookies et mesure d’audience</h2><p>Ce site n’utilise aucun cookie de mesure d’audience ni de publicité. Les polices sont chargées depuis Google Fonts : votre adresse IP est transmise à Google lors du chargement de la page.</p>'
cookies_on=('<h2>Cookies et mesure d’audience</h2>'
 '<p>Ce site utilise Google Analytics pour mesurer son audience : pages consultées, provenance des visites et demandes envoyées. '
 'Aucune publicité ciblée n’est activée, aucune donnée n’est revendue.</p>'
 '<p>Rien n’est déposé ni transmis à Google avant votre accord. Au premier passage, un bandeau vous laisse accepter ou refuser. '
 'Si vous refusez, le script de mesure n’est pas chargé du tout et le site fonctionne à l’identique. '
 'Vous pouvez revenir sur votre choix à tout moment avec le lien <a href="#" data-cookies>Gérer les cookies</a>, en bas de chaque page.</p>'
 '<p>La mesure d’audience est assurée par Google Ireland Limited. Votre adresse IP est anonymisée. '
 'Les polices sont chargées depuis Google Fonts : votre adresse IP est transmise à Google lors du chargement de la page, sans cookie.</p>')
confidentialite=f'''<h2>Responsable du traitement</h2><p>{BRAND}, <mark>À compléter : identité complète et adresse email de contact</mark>.</p><h2>Données collectées</h2><p>Le formulaire d’audit recueille : prénom et nom, entreprise, site internet, secteur, téléphone et email professionnel. Nous enregistrons également la page depuis laquelle la demande a été envoyée, les paramètres de campagne éventuellement présents dans l’adresse et le site qui vous a orienté vers le nôtre. Ces informations nous servent à savoir quels contenus répondent à vos questions. Aucun profilage publicitaire n’est réalisé.</p><h2>Où elles sont conservées</h2><p>Les demandes sont enregistrées dans un espace privé, accessible uniquement par l’équipe {BRAND} après authentification, et transmises à notre outil de suivi des demandes, <mark>À compléter : nom du CRM ou de l’outil email</mark>. Elles ne sont ni revendues, ni partagées avec des tiers à des fins commerciales.</p><h2>Pourquoi ces données</h2><ul><li>Préparer l’audit offert que vous demandez et vous recontacter pour le présenter (mesures précontractuelles prises à votre demande).</li><li>Poursuivre l’échange commercial si vous le souhaitez (intérêt légitime).</li></ul><p>Aucune prospection sans lien avec votre demande, aucune revente de données.</p><h2>Destinataires</h2><p>L’équipe {BRAND} et les prestataires techniques qui hébergent nos outils : <mark>À compléter : liste des prestataires et localisation des données</mark>.</p><h2>Durée de conservation</h2><p><mark>À compléter, par exemple : trois ans après le dernier contact</mark>. Passé ce délai, ou à votre demande, la fiche est effacée définitivement de notre espace de suivi.</p><h2>Vos droits</h2><p>Vous pouvez accéder à vos données, les rectifier, demander leur effacement, limiter ou refuser leur traitement et demander leur portabilité. Écrivez à <mark>À compléter : adresse email</mark>. Vous pouvez aussi adresser une réclamation à la CNIL (<a href="https://www.cnil.fr" rel="noopener">cnil.fr</a>).</p>{{COOKIES_SECTION}}<h2>Sécurité</h2><p>Les données du formulaire sont vérifiées côté serveur, protégées par un champ anti-robot et transmises de façon chiffrée lorsque le site est servi en HTTPS.</p><p>Dernière mise à jour : 17 septembre 2026.</p>'''
(root/'mentions-legales.html').write_text(page('Mentions légales · '+BRAND,'Informations légales sur l’éditeur et l’hébergeur du site '+BRAND+'.',simple('Informations légales','Mentions légales.','Qui édite ce site et comment nous contacter.',mentions),'','mentions-legales'))
(root/'confidentialite.html').write_text(page('Politique de confidentialité · '+BRAND,'Comment '+BRAND+' utilise les informations du formulaire d’audit et quels sont vos droits.',simple('Vos données','Politique de confidentialité.','Ce qu’on fait de vos informations, et ce qu’on ne fait pas.',confidentialite.replace('{COOKIES_SECTION}',cookies_on if GA_ID else cookies_off)),'','confidentialite'))


# ---------- Panneau des demandes ----------
admin_body = '''<div class="admin">
<header class="admin-top"><a class="logo" href="/" aria-label="SHYFT, accueil">{LOGO}</a>
<div class="admin-top-right"><span class="admin-mode" id="mode" hidden></span>
<button class="btn btn-ghost" id="logout" hidden>Se déconnecter</button></div></header>
<main id="main">
<section class="admin-login" id="login">
 <div class="admin-card">
  <span class="kicker">Accès réservé</span><h1>Demandes reçues.</h1>
  <p>Ce panneau affiche les demandes d’audit envoyées depuis le site.</p>
  <form id="loginForm"><label>Mot de passe<input type="password" id="pass" autocomplete="current-password" required></label>
  <button class="btn btn-lime" type="submit">Ouvrir le panneau</button></form>
  <p class="admin-error" id="loginError" role="alert" hidden></p>
 </div>
</section>
<section class="admin-panel" id="panel" hidden>
 <div class="admin-head"><div><div class="kicker">Demandes d’audit</div><h1>Vos demandes.</h1></div>
  <div class="admin-actions"><button class="btn btn-ghost" id="refresh">Actualiser</button>
  <button class="btn btn-lime" id="export">Exporter en CSV</button></div></div>
 <div class="admin-stats" id="stats"></div>
 <div class="admin-filters"><label class="admin-search">Rechercher<input type="search" id="search" placeholder="Nom, entreprise, email, page…"></label>
  <label>Secteur<select id="sector"><option value="">Tous</option></select></label>
  <label>Période<select id="period"><option value="">Depuis le début</option><option value="7">7 derniers jours</option><option value="30">30 derniers jours</option><option value="90">90 derniers jours</option></select></label>
  <span class="admin-count" id="count"></span></div>
 <div class="table-scroll"><table class="data-table admin-table"><thead><tr>
  <th>Reçue le</th><th>Contact</th><th>Entreprise</th><th>Secteur</th><th>Page d’origine</th><th>Source</th><th></th>
 </tr></thead><tbody id="rows"></tbody></table></div>
 <p class="admin-empty" id="empty" hidden></p>
 <p class="admin-note">Les demandes sont conservées pour votre suivi commercial. Pensez à les effacer quand elles n’ont plus d’utilité : c’est une obligation, et le panneau le permet ligne par ligne.</p>
</section>
</main></div>'''.replace('{LOGO}', logo)
(root/'admin.html').write_text(page('Demandes · '+BRAND,'Panneau privé de suivi des demandes d’audit.',admin_body,'','admin')
 .replace('<head>','<head><meta name="robots" content="noindex, nofollow">')
 .replace('<script src="/assets/site.js" defer></script>','<script src="/assets/admin.js" defer></script>')
 .replace(analytics(),''))  # Le panneau privé ne charge aucune mesure d'audience.

# ---------- Sitemap, robots, favicon ----------
urls=['','expertises']+[f'expertises/{e["slug"]}' for e in EXPERTISES]+['secteurs']+[f'secteurs/{s["slug"]}' for s in sectors]+['mentions-legales','confidentialite']
(root/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+''.join(f'  <url><loc>{BASE}/{u}</loc></url>\n' for u in urls)+'</urlset>\n')
(root/'robots.txt').write_text(f'User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nSitemap: {BASE}/sitemap.xml\n')
(root/'assets/favicon.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="18" fill="#d9ff5b"/><path d="M18 46 46 18M19 18h27v27" fill="none" stroke="#152319" stroke-width="7"/></svg>')
(root/'elan-site.html').unlink(missing_ok=True)
print('Généré : accueil, 6 pages métier, index secteurs, 2 pages légales, sitemap.xml, robots.txt')
