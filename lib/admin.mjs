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
 ['type', 'Type'], ['receivedAt', 'Reçue le'], ['rdvAt', 'Date du rendez-vous'], ['statut', 'Statut'], ['nom', 'Nom'], ['entreprise', 'Entreprise'], ['email', 'Email'],
 ['tel', 'Téléphone'], ['secteur', 'Secteur'], ['site', 'Site'], ['ville', 'Ville'], ['agences', 'Agences'],
 ['services', 'Leviers à auditer'], ['message', 'Message'], ['page', 'Page d’origine'], ['emplacement', 'Bouton'],
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
 const rows = leads.map(l => COLUMNS.map(([key]) => cell(key === 'type' ? (l.type === 'rdv' ? 'Rendez-vous' : 'Demande') : l[key])).join(';'));
 return '﻿' + [head, ...rows].join('\r\n') + '\r\n';
}

// Limitation des tentatives. La mémoire d'une fonction serverless est propre à chaque instance
// et se vide au redémarrage : cela renchérit une attaque par essais successifs sans la rendre impossible.
const attempts = new Map();
const WINDOW = 15 * 60 * 1000;
const FREE = 4;        // tentatives sans pénalité
const LOCK = 20;       // au-delà, refus sec pendant la fenêtre

export function clientKey(headers = {}) {
 const forwarded = headers['x-forwarded-for'] || headers['X-Forwarded-For'] || '';
 return String(forwarded).split(',')[0].trim() || headers['x-real-ip'] || 'inconnu';
}

export function attemptState(key) {
 const now = Date.now();
 const entry = attempts.get(key);
 if (!entry || now - entry.first > WINDOW) return {count: 0, locked: false, wait: 0};
 const over = Math.max(0, entry.count - FREE);
 return {count: entry.count, locked: entry.count >= LOCK, wait: Math.min(8000, over * over * 250)};
}

export function noteFailure(key) {
 const now = Date.now();
 const entry = attempts.get(key);
 if (!entry || now - entry.first > WINDOW) attempts.set(key, {first: now, count: 1});
 else entry.count += 1;
 if (attempts.size > 500) for (const [k, v] of attempts) if (now - v.first > WINDOW) attempts.delete(k);
}

export function noteSuccess(key) { attempts.delete(key); }
