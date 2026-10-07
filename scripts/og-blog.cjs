// Images de partage (og:image) des articles du blog : 1200 × 630, fond noir SHYFT, titre, auteur, et la photo
// d'en-tête de l'article si elle existe. Écrit public/assets/blog/<article>-og.jpg pour chaque article publié.
//   npm run og            tous les articles
//   npm run og -- <slug>  un seul article
// Le titre vient de « ogTitre » dans l'en-tête de l'article (les *mots* entre astérisques passent en jaune),
// sinon du titre. Nécessite Chromium pour Playwright : npx playwright install chromium (une seule fois).
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const BLOG = path.join(ROOT, 'src/content/blog');
const AUTEURS = { lorenzo: 'Lorenzo Trichard', quentin: 'Quentin Garcia' };

const dataUrl = (file, type) => `data:${type};base64,${fs.readFileSync(path.join(PUBLIC, file)).toString('base64')}`;
const escape = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const champ = (fm, nom) => (fm.match(new RegExp(`^${nom}:\\s*"?(.*?)"?\\s*$`, 'm')) || [])[1];

function articles(filtre) {
  return fs.readdirSync(BLOG).filter((f) => /\.mdx?$/.test(f)).map((f) => {
    const fm = fs.readFileSync(path.join(BLOG, f), 'utf8').split('---')[1] || '';
    return {
      slug: f.replace(/\.mdx?$/, ''),
      titre: champ(fm, 'ogTitre') || champ(fm, 'title'),
      auteur: AUTEURS[champ(fm, 'author')] || 'SHYFT',
      image: (fm.match(/^\s+src:\s*(\S+)/m) || [])[1],
      brouillon: champ(fm, 'draft') === 'true',
    };
  }).filter((a) => !a.brouillon && (!filtre || a.slug === filtre));
}

const html = (a) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:IS;src:url(${dataUrl('assets/fonts/InstrumentSans-latin.woff2', 'font/woff2')})}
@font-face{font-family:IS;src:url(${dataUrl('assets/fonts/InstrumentSans-latin-ext.woff2', 'font/woff2')});unicode-range:U+0100-024F}
@font-face{font-family:ISe;font-style:italic;src:url(${dataUrl('assets/fonts/InstrumentSerif-italic-latin.woff2', 'font/woff2')})}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#0e0e0c;color:#fff;font-family:IS;display:flex;overflow:hidden;position:relative}
.txt{flex:1;display:flex;flex-direction:column;padding:56px 0 52px 64px;position:relative;z-index:1}
.top{display:flex;align-items:center;gap:16px}
.logo{font-size:40px;font-weight:700;letter-spacing:-.04em}.logo b{color:#f9c940}
.pill{padding:7px 16px;border-radius:999px;border:1.5px solid #3a3934;color:#d8d6ce;font-size:20px;font-weight:600}
h1{margin-top:auto;font-size:${a.image ? 54 : 64}px;line-height:1.02;font-weight:600;letter-spacing:-.04em;max-width:${a.image ? 640 : 900}px}
h1 em{font-family:ISe;font-weight:400;color:#f9c940;letter-spacing:-.01em}
.by{margin-top:34px;display:flex;align-items:center;gap:14px;font-size:22px;color:#a9a69b}
.by i{width:10px;height:10px;border-radius:50%;background:#f9c940}
.by strong{color:#fff;font-weight:600}
.pic{position:relative;width:440px;margin:28px 28px 28px 0}
.pic div{position:absolute;inset:0;border-radius:28px;background:#f9c940;transform:rotate(3deg)}
.pic img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border-radius:28px}
.deco{position:absolute;right:-60px;top:-60px;width:420px;height:420px;border-radius:50%;background:#f9c940}
.fleche{position:absolute;right:70px;top:70px}
</style></head><body>
<div class="txt"><div class="top"><span class="logo">shyft<b>.</b></span><span class="pill">Blog</span></div>
<h1>${escape(a.titre).replace(/\*([^*]+)\*/g, '<em>$1</em>')}</h1>
<p class="by"><i></i><span>Par <strong>${escape(a.auteur)}</strong> · shyftgrowth.com</span></p></div>
${a.image
    ? `<div class="pic"><div></div><img src="${dataUrl(a.image.replace(/^\//, ''), 'image/webp')}"></div>`
    : '<div class="deco"></div><svg class="fleche" width="150" height="150" viewBox="0 0 64 64"><path d="M14 50 50 14M17 14h33v33" fill="none" stroke="#0e0e0c" stroke-width="7"/></svg>'}
</body></html>`;

(async () => {
  const liste = articles(process.argv[2]);
  if (!liste.length) throw new Error('aucun article trouvé');
  const navigateur = await chromium.launch();
  const page = await navigateur.newPage({ viewport: { width: 1200, height: 630 } });
  for (const a of liste) {
    await page.setContent(html(a), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const sortie = path.join(PUBLIC, 'assets/blog', `${a.slug}-og.jpg`);
    await page.screenshot({ path: sortie, type: 'jpeg', quality: 85 });
    process.stdout.write(`${path.relative(ROOT, sortie)}\n`);
  }
  await navigateur.close();
})().catch((erreur) => {
  process.stderr.write(`Images de partage : ${erreur.message}\n`);
  process.exit(1);
});
