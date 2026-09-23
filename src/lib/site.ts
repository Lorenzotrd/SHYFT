// Constantes du site. L'identifiant GA4 vide désactive toute mesure d'audience (voir README).
export const BRAND = 'SHYFT';
export const YEAR = 2026;
export const SITE_URL = 'https://www.shyftgrowth.com';
export const GA_ID = 'G-XC6CD5J71S';
/** Conversion Google Ads de la demande d'audit, au format « AW-123456789/AbCdEfGh ». Vide : rien n'est envoyé à Google Ads. */
export const ADS_CONVERSION = '';
/** Identifiant du pixel Meta. Vide : le pixel n'est jamais chargé. */
export const META_PIXEL_ID = '';
/** Conversion Google Ads de la prise de rendez-vous, comptée sur la page /rendez-vous/merci. Vide : rien n'est envoyé. */
export const ADS_CONVERSION_RDV = '';

/** Retours à la ligne du contenu → <br>, avec une espace devant pour que les mots ne se collent pas sur mobile. */
export const br = (text: string) => text.replace(/\s*\n/g, ' <br>');

/** Numéro à deux chiffres : 01, 02… */
export const nn = (i: number) => `0${i + 1}`;

/** Entier avec espace fine comme séparateur de milliers : 20000 → "20 000". */
export const number = (n: number) => Math.round(n).toLocaleString('fr-FR').replace(/ | /g, ' ');

/** Adresse de prise de rendez-vous, par défaut si le contenu n'en fournit pas. */
export const CAL_URL = 'https://cal.com/shyftgrowth/30min';

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Espaces insécables de la typographie française : avant ? ! : ; » et après «, pour qu'un signe ne passe jamais seul à la ligne. */
export const nbsp = (text: string) => text.replace(/ ([?!:;»])/g, '\u00a0$1').replace(/« /g, '«\u00a0');

/** Texte éditorial → HTML sûr : *mot* devient le mot en serif italique, un retour à la ligne devient <br>. */
export const rich = (text: string) =>
  nbsp(escapeHtml(text)).replace(/\*([^*\n]+)\*/g, '<em class="serif">$1</em>').replace(/\s*\n/g, ' <br>');

/** Étiquette courte → HTML sûr : *mot* devient le mot en couleur d'accent. */
export const highlight = (text: string) =>
  escapeHtml(text).replace(/\*([^*\n]+)\*/g, '<span class="hl">$1</span>');

/** Deux chiffres : 1 → "01". */
export const pad = (i: number) => String(i).padStart(2, '0');
