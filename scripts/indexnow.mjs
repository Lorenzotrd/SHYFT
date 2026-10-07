// Signale les pages du sitemap à Bing (et aux autres moteurs IndexNow : Yandex, Seznam, Naver).
// Bing alimente aussi la recherche de ChatGPT et de Copilot. À lancer après une mise en ligne :
//   node scripts/indexnow.mjs              toutes les pages du sitemap en ligne
//   node scripts/indexnow.mjs /blog /a-propos   seulement ces pages
// La clé est publique : le fichier public/<clé>.txt prouve aux moteurs que le site nous appartient.
import { SITE_URL } from '../src/lib/site.ts';

const KEY = '31ea89354c781b5bf72dad9cefd04ac9';
const ENDPOINT = 'https://api.indexnow.org/indexnow';
const host = new URL(SITE_URL).host;

async function sitemapUrls() {
  const response = await fetch(`${SITE_URL}/sitemap.xml`);
  if (!response.ok) throw new Error(`sitemap.xml inaccessible (${response.status})`);
  const xml = await response.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim());
}

async function main() {
  const paths = process.argv.slice(2);
  const urlList = paths.length ? paths.map((path) => new URL(path, SITE_URL).href) : await sitemapUrls();
  if (!urlList.length) throw new Error('aucune page à signaler');

  const keyCheck = await fetch(`${SITE_URL}/${KEY}.txt`);
  if (!keyCheck.ok || (await keyCheck.text()).trim() !== KEY) {
    throw new Error(`le fichier de clé ${SITE_URL}/${KEY}.txt n'est pas en ligne : publier le site d'abord`);
  }

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host, key: KEY, keyLocation: `${SITE_URL}/${KEY}.txt`, urlList }),
  });
  // 200 : reçu ; 202 : reçu, clé en cours de vérification. Le reste est une erreur.
  if (response.status !== 200 && response.status !== 202) {
    throw new Error(`IndexNow a refusé l'envoi (${response.status}) : ${await response.text()}`);
  }
  process.stdout.write(`${urlList.length} pages signalées à IndexNow (${response.status}).\n`);
}

main().catch((error) => {
  process.stderr.write(`IndexNow : ${error.message}\n`);
  process.exit(1);
});
