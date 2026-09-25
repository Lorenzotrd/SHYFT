// Image de partage 1200 × 630 avec la charte du site (gris, noir, jaune). Lancer avec : node scripts/og.cjs
const {chromium}=require('/Users/lorenzotrichard/.cache/uv/archive-v0/S2ghcOWcglW9BUt0RjW_E/playwright/driver/package');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {pathToFileURL}=require('node:url');

const fonts=pathToFileURL(path.resolve(__dirname,'../public/assets/fonts')).href;
const out=path.resolve(__dirname,'../public/assets/og.png');
const html=`<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:"Instrument Sans";src:url(${fonts}/InstrumentSans-latin.woff2) format("woff2");font-weight:400 700}
@font-face{font-family:"Instrument Serif";font-style:italic;src:url(${fonts}/InstrumentSerif-italic-latin.woff2) format("woff2")}
*{box-sizing:border-box}
body{margin:0;width:1200px;height:630px;background:#e9e9e9;font-family:"Instrument Sans",sans-serif;color:#0e0e0c}
.frame{position:absolute;inset:24px;border-radius:32px;background:#f3f3f3;padding:60px 72px;overflow:hidden}
.top{display:flex;align-items:center;justify-content:space-between}
.logo{font-size:44px;font-weight:700;letter-spacing:-.04em;line-height:1}
.logo span{color:#f9c940}
.badge{display:flex;align-items:center;gap:12px;padding:12px 22px;border-radius:999px;background:#0e0e0c;color:#fff;font-size:22px;font-weight:500}
.badge i{width:10px;height:10px;border-radius:50%;background:#f9c940}
h1{margin:74px 0 0;font-size:96px;line-height:1;letter-spacing:-.045em;font-weight:500}
h1 em{font-family:"Instrument Serif",serif;font-style:italic;font-weight:400;letter-spacing:-.02em}
.chips{display:flex;gap:12px;margin-top:52px}
.chips span{padding:11px 20px;border-radius:999px;background:#fff;border:1px solid #e0e0e0;font-size:22px;color:#383838}
.mark{position:absolute;right:72px;bottom:60px;width:112px;height:112px;border-radius:32px;background:#f9c940;display:grid;place-items:center}
</style></head><body><div class="frame">
<div class="top"><div class="logo">shyft<span>.</span></div><div class="badge"><i></i>Audit offert en 24 h</div></div>
<h1>Votre prochain client<br>vous cherche <em>déjà</em></h1>
<div class="chips"><span>SEO</span><span>Google Ads</span><span>Meta Ads</span><span>Google Maps</span><span>IA</span></div>
<div class="mark"><svg width="64" height="64" viewBox="0 0 64 64"><path d="M18 46 46 18M19 18h27v27" fill="none" stroke="#0e0e0c" stroke-width="7"/></svg></div>
</div></body></html>`;

(async()=>{
  const file=path.join(os.tmpdir(),'shyft-og.html');
  fs.writeFileSync(file,html);
  const b=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
  const p=await b.newPage({viewport:{width:1200,height:630},deviceScaleFactor:1});
  await p.goto(pathToFileURL(file).href,{waitUntil:'networkidle'});
  await p.evaluate(()=>document.fonts.ready);
  await p.screenshot({path:out});
  await b.close();
  console.log('public/assets/og.png généré, 1200 × 630');
})().catch(e=>{console.error(e);process.exit(1)});
