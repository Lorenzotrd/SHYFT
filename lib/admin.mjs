// Accès au panneau : mot de passe comparé à temps constant, export CSV protégé contre l'injection de formules.
import {timingSafeEqual, createHash} from 'node:crypto';

export function adminReady() { return Boolean(process.env.ADMIN_PASSWORD); }

export function checkPassword(given) {
 const expected = process.env.ADMIN_PASSWORD;
 if (!expected || typeof given !== 'string' || !given) return false;
 // Le hachage égalise les longueurs avant la comparaison à temps constant.
 const a = createHash('sha256').update(given).digest();
 const b = createHash('sha256').update(expected).digest();
 return timingSafeEqual(a, b);
}

export function bearer(headers) {
 const raw = headers?.authorization || headers?.Authorization || '';
 return raw.startsWith('Bearer ') ? raw.slice(7) : '';
}

export const COLUMNS = [
 ['receivedAt', 'Reçue le'], ['nom', 'Nom'], ['entreprise', 'Entreprise'], ['email', 'Email'],
 ['tel', 'Téléphone'], ['secteur', 'Secteur'], ['site', 'Site'], ['page', 'Page d’origine'],
 ['utm_source', 'Source'], ['utm_medium', 'Support'], ['utm_campaign', 'Campagne'],
 ['gclid', 'Identifiant Google Ads'], ['referrer', 'Provenance'], ['firstSeen', 'Première visite'], ['id', 'Identifiant'],
];

// Une cellule qui commence par = + - @ serait interprétée comme une formule par un tableur.
function cell(value) {
 const text = String(value ?? '');
 const safe = /^[=+\-@\t\r]/.test(text) ? "'" + text : text;
 return '"' + safe.replace(/"/g, '""') + '"';
}

export function toCsv(leads) {
 const head = COLUMNS.map(([, label]) => cell(label)).join(';');
 const rows = leads.map(l => COLUMNS.map(([key]) => cell(l[key])).join(';'));
 return '﻿' + [head, ...rows].join('\r\n') + '\r\n';
}
