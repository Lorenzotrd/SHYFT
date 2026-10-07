// Constantes du site. L'identifiant GA4 vide désactive toute mesure d'audience (voir README).
export const BRAND = 'SHYFT';
export const YEAR = 2026;
export const SITE_URL = 'https://www.shyftgrowth.com';
/** Balise Google (GA4), avec Google Ads AW-18468970949 en destination liée : chargée dès l'arrivée en mode consentement
 *  avancé (signaux sans cookie tant que le visiteur n'a pas accepté). */
export const GA_ID = 'G-XC6CD5J71S';
/** Clé publique du projet PostHog (EU), mesure d'audience sans cookie. Vide : PostHog n'est jamais chargé. */
export const POSTHOG_KEY = 'phc_zBtr46Rb5u5VxA5Y3Nu7daCvvi6Spw8ENYU9CFJCCykh';
export const POSTHOG_HOST = 'https://eu.i.posthog.com';
/** Google Ads actif via la balise Google : le bandeau mentionne la publicité et l'accord accorde ad_storage et ad_user_data.
 *  La conversion « Envoi de formulaire de lead » est comptée par Google Ads au chargement de /audit-offert/merci. */
export const ADS_ENABLED = true;
/** Conversion Google Ads « SHYFT - Demande d'audit » (principale), au format « AW-123456789/AbCdEfGh ». Vide : aucun événement de conversion envoyé par le code. */
export const ADS_CONVERSION = 'AW-18468970949/j2KACMWM85MdEMXD2OZE';
/** Identifiant du pixel Meta. Vide : le pixel n'est jamais chargé. */
export const META_PIXEL_ID = '';
/** Conversion Google Ads « SHYFT - RDV réservé » (principale), comptée sur la page /rendez-vous/merci. Vide : rien n'est envoyé. */
export const ADS_CONVERSION_RDV = 'AW-18468970949/uCCTCMiM85MdEMXD2OZE';

/** Coordonnées de l'agence : données structurées, en-tête, pied de page, llms.txt.
 *  Un champ vide n'est jamais affiché ni publié (données structurées comprises). */
export const CONTACT = {
  email: 'team@shyftgrowth.com',
  /** Numéro au format international, sans espace (lien tel:) : '+33612345678'. Vide : le numéro n'apparaît nulle part. */
  phone: '',
  /** Numéro tel qu'il s'affiche : '06 12 34 56 78'. */
  phoneDisplay: '',
  /** Numéro WhatsApp au format international, chiffres seuls, sans + : '33612345678'. Vide : aucun lien WhatsApp. */
  whatsapp: '33743601993',
};

/** Lien WhatsApp avec un premier message prérempli. */
export const whatsappUrl = (message: string) => `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(message)}`;

/** Pages de l'agence sur les réseaux (LinkedIn, Instagram…), en adresses complètes. Publiées en sameAs. */
export const SOCIALS: string[] = [];

/** Zone desservie, en noms de pays anglais (schema.org). */
export const AREA_SERVED = ['France', 'Canada', 'United States'];

/** Fondateurs : page à propos et données structurées. Photos dans public/team/. */
export const FOUNDERS = [
  { id: 'lorenzo', givenName: 'Lorenzo', familyName: 'T.', linkedin: '', photo: '/team/lorenzo.jpg' },
  { id: 'quentin', givenName: 'Quentin', familyName: 'Garcia', linkedin: 'https://www.linkedin.com/in/quentin-garcia-b45271346/', photo: '/team/quentin.jpg' },
] as const;
export type Founder = (typeof FOUNDERS)[number];
export const founderName = (f: Founder) => [f.givenName, f.familyName].filter(Boolean).join(' ');

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

/** Texte courant → HTML sûr avec liens internes : [ancre](/chemin) devient un lien. Seuls les chemins du site
 *  (commençant par /) sont acceptés ; le reste du texte est échappé. Sert au maillage interne dans les paragraphes. */
export const liens = (text: string) =>
  escapeHtml(text).replace(/\[([^\]\n]+)\]\((\/[a-z0-9\-/#]*)\)/g, '<a class="lien" href="$2">$1</a>');

/** Même texte sans la syntaxe des liens ni l'italique : pour les données structurées et les métadonnées. */
export const texteSeul = (text: string) => text.replace(/\[([^\]\n]+)\]\((\/[a-z0-9\-/#]*)\)/g, '$1').replace(/\*/g, '');

/** Deux chiffres : 1 → "01". */
export const pad = (i: number) => String(i).padStart(2, '0');
