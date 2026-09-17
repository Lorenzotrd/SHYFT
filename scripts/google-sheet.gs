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
 */

const CLE_SECRETE = 'a-remplacer-par-une-phrase-a-vous';

const COLONNES = [
  ['receivedAt', 'Reçue le'],
  ['nom', 'Nom'],
  ['entreprise', 'Entreprise'],
  ['email', 'Email'],
  ['tel', 'Téléphone'],
  ['secteur', 'Secteur'],
  ['site', 'Site'],
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
    return reponse(200, 'ok');
  } catch (erreur) {
    return reponse(500, String(erreur));
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
