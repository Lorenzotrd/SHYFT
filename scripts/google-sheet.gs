/**
 * SHYFT — Réception des demandes d'audit dans une feuille Google Sheets.
 *
 * Installation :
 *   1. Ouvrir une feuille Google vierge.
 *   2. Menu Extensions puis Apps Script. Effacer le contenu, coller ce fichier.
 *   3. Remplacer CLE_SECRETE ci-dessous par une phrase de votre choix.
 *   4. Déployer, Nouveau déploiement, type Application Web.
 *        Exécuter en tant que : moi
 *        Qui a accès : tout le monde
 *   5. Copier l'adresse fournie et y ajouter ?k=VOTRE_CLE_SECRETE à la fin.
 *   6. Coller le tout dans Vercel, variable LEAD_WEBHOOK_URL, puis redéployer.
 *
 * Notification par email (une par demande, tant que les audits sont traités à la main) :
 *   envoyée à EMAIL_EQUIPE ci-dessous. Pour changer d'adresse sans toucher au code :
 *   Paramètres du projet (roue dentée) puis Propriétés du script, ajouter
 *   NOTIFY_EMAIL = l'adresse qui reçoit les alertes (plusieurs adresses : séparées par des virgules).
 *   Au premier envoi, Google demande d'autoriser l'envoi d'emails : accepter.
 *   Après toute modification de ce fichier : Déployer, Gérer les déploiements, nouvelle version.
 */

const CLE_SECRETE = 'a-remplacer-par-une-phrase-a-vous';
const EMAIL_EQUIPE = 'team@shyftgrowth.com';

const COLONNES = [
  ['receivedAt', 'Reçue le'],
  ['nom', 'Nom'],
  ['entreprise', 'Entreprise'],
  ['email', 'Email'],
  ['tel', 'Téléphone'],
  ['secteur', 'Secteur'],
  ['site', 'Site'],
  ['ville', 'Ville'],
  ['agences', 'Agences ou points de vente'],
  ['services', 'Leviers à auditer'],
  ['message', 'Message'],
  ['page', 'Page d’origine'],
  ['utm_source', 'Source'],
  ['utm_medium', 'Support'],
  ['utm_campaign', 'Campagne'],
  ['gclid', 'Identifiant Google Ads'],
  ['referrer', 'Provenance'],
  ['firstSeen', 'Première visite'],
];

function doPost(e) {
  try {
    if (!e || !e.parameter || e.parameter.k !== CLE_SECRETE) return reponse(403, 'Clé invalide');
    if (!e.postData || !e.postData.contents) return reponse(400, 'Corps vide');

    const demande = JSON.parse(e.postData.contents);
    const feuille = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    // Première utilisation : on pose la ligne d'en-têtes.
    if (feuille.getLastRow() === 0) {
      feuille.appendRow(COLONNES.map(function (c) { return c[1]; }));
      feuille.getRange(1, 1, 1, COLONNES.length).setFontWeight('bold');
      feuille.setFrozenRows(1);
    }

    feuille.appendRow(COLONNES.map(function (c) { return cellule(demande[c[0]]); }));
    notifier(demande);
    return reponse(200, 'ok');
  } catch (erreur) {
    return reponse(500, String(erreur));
  }
}

/**
 * Alerte immédiate par email. Une alerte qui échoue ne fait pas perdre la demande :
 * elle est déjà dans la feuille, et l'erreur reste visible dans les journaux d'exécution.
 */
function notifier(demande) {
  const destinataires = PropertiesService.getScriptProperties().getProperty('NOTIFY_EMAIL') || EMAIL_EQUIPE;
  if (!destinataires) {
    console.warn('NOTIFY_EMAIL absent : demande enregistrée sans notification.');
    return;
  }
  try {
    const lignes = COLONNES
      .map(function (c) { return demande[c[0]] ? c[1] + ' : ' + demande[c[0]] : null; })
      .filter(function (l) { return l; });
    MailApp.sendEmail({
      to: destinataires,
      replyTo: demande.email || undefined,
      subject: 'Nouvelle demande d’audit · ' + (demande.entreprise || 'sans nom'),
      body: 'Une demande vient d’arriver sur le site. À traiter sous 24 h.\n\n' + lignes.join('\n'),
    });
  } catch (erreur) {
    console.error('Notification non envoyée : ' + erreur);
  }
}

function doGet() {
  return reponse(200, 'Point de réception SHYFT actif.');
}

/** Une cellule qui commence par = + - @ serait interprétée comme une formule. */
function cellule(valeur) {
  const texte = valeur === undefined || valeur === null ? '' : String(valeur);
  return /^[=+\-@]/.test(texte) ? "'" + texte : texte;
}

function reponse(code, message) {
  return ContentService
    .createTextOutput(JSON.stringify({ code: code, message: message }))
    .setMimeType(ContentService.MimeType.JSON);
}
