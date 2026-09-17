// Stockage des demandes. Deux pilotes : Upstash Redis en ligne, fichier local en développement.
// Aucune dépendance : tout passe par fetch et le système de fichiers.
import {readFile, writeFile, mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const KEY = 'shyft:leads';
const LOCAL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '.leads.json');

function redisConfig() {
 const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
 const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
 return url && token ? {url, token} : null;
}

async function redis(command) {
 const {url, token} = redisConfig();
 const response = await fetch(url, {
  method: 'POST',
  headers: {Authorization: `Bearer ${token}`, 'Content-Type': 'application/json'},
  body: JSON.stringify(command),
  signal: AbortSignal.timeout(8000),
 });
 if (!response.ok) throw new Error('STORE_FAILED');
 const {result, error} = await response.json();
 if (error) throw new Error('STORE_FAILED');
 return result;
}

async function localRead() {
 try { return JSON.parse(await readFile(LOCAL, 'utf8')); } catch { return {}; }
}
async function localWrite(all) {
 await mkdir(path.dirname(LOCAL), {recursive: true});
 await writeFile(LOCAL, JSON.stringify(all, null, 1));
}

// En ligne sans Redis configuré, on ne prétend pas stocker.
export function storeMode() {
 if (redisConfig()) return 'redis';
 return process.env.VERCEL ? 'none' : 'local';
}
export const storeReady = () => storeMode() !== 'none';

export function newId() {
 return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

export async function saveLead(lead) {
 const record = {id: newId(), ...lead};
 if (storeMode() === 'redis') await redis(['HSET', KEY, record.id, JSON.stringify(record)]);
 else { const all = await localRead(); all[record.id] = record; await localWrite(all); }
 return record;
}

export async function listLeads() {
 let records;
 if (storeMode() === 'redis') {
  const flat = await redis(['HGETALL', KEY]) || [];
  records = [];
  for (let i = 1; i < flat.length; i += 2) { try { records.push(JSON.parse(flat[i])); } catch {} }
 } else {
  records = Object.values(await localRead());
 }
 return records.sort((a, b) => String(b.receivedAt || '').localeCompare(String(a.receivedAt || '')));
}

export async function deleteLead(id) {
 if (storeMode() === 'redis') return (await redis(['HDEL', KEY, id])) > 0;
 const all = await localRead();
 if (!all[id]) return false;
 delete all[id]; await localWrite(all); return true;
}
