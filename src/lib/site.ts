// Constantes du site. L'identifiant GA4 vide désactive toute mesure d'audience (voir README).
export const BRAND = 'SHYFT';
export const YEAR = 2026;
export const SITE_URL = 'https://www.shyftgrowth.com';
export const GA_ID = 'G-XC6CD5J71S';

/** Retours à la ligne du contenu → <br>, avec une espace devant pour que les mots ne se collent pas sur mobile. */
export const br = (text: string) => text.replace(/\s*\n/g, ' <br>');

/** Numéro à deux chiffres : 01, 02… */
export const nn = (i: number) => `0${i + 1}`;

/** Entier avec espace fine comme séparateur de milliers : 20000 → "20 000". */
export const number = (n: number) => Math.round(n).toLocaleString('fr-FR').replace(/ | /g, ' ');
