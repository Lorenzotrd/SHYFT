"""Compare page à page le HTML de référence (site actuel) et le HTML produit par Astro.

Usage : python3 scripts/diff-html.py <dossier référence> <dossier dist> [page ...]

Les deux arbres sont ramenés à une même forme canonique avant comparaison : attributs triés,
espaces réduits, entités décodées, commentaires ignorés, JSON-LD comparé comme objet.
Ce qui reste différent est réellement différent à l'écran ou pour les moteurs.
"""
import sys, json, difflib
from pathlib import Path
from html.parser import HTMLParser

BLOCK = {
 'html','head','body','div','section','header','footer','nav','main','ul','ol','li','h1','h2','h3','h4','h5','h6',
 'p','form','figure','figcaption','table','thead','tbody','tr','td','th','details','summary','article','aside',
 'script','style','link','meta','title','select','option','hr','template','noscript',
 # <br> n'est pas un bloc : l'espace qui le précède compte, car certains <br> sont masqués sur mobile.
}
VOID = {'br','hr','img','input','link','meta','path','circle','rect','source'}

PAGES = [
 ('index.html','index.html'),
 ('expertises/index.html','expertises/index.html'),
 ('secteurs/index.html','secteurs/index.html'),
 ('admin.html','admin/index.html'),
 ('mentions-legales.html','mentions-legales/index.html'),
 ('confidentialite.html','confidentialite/index.html'),
] + [(f'expertises/{s}.html', f'expertises/{s}/index.html') for s in ['seo','geo','google-ads','meta-ads','agence-ia','landing-pages-cro','data-tracking']] \
  + [(f'secteurs/{s}.html', f'secteurs/{s}/index.html') for s in ['location-de-materiel','reseaux-de-franchise','renovation-artisans','immobilier','services-a-domicile','commerces-multi-sites']]


class Canon(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.tokens = []   # (kind, value, is_block)
        self.in_jsonld = False
        self.in_raw = None

    def handle_starttag(self, tag, attrs):
        a = sorted((k, ' '.join((v or '').split()) if k == 'class' else (v or '')) for k, v in attrs)
        self.tokens.append(('start', f'<{tag} ' + ' '.join(f'{k}="{v}"' for k, v in a) + '>', tag in BLOCK))
        if tag == 'script' and dict(attrs).get('type') == 'application/ld+json':
            self.in_jsonld = True
        if tag in VOID:
            self.tokens.append(('end', f'</{tag}>', tag in BLOCK))

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID:
            self.tokens.append(('end', f'</{tag}>', tag in BLOCK))

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        self.tokens.append(('end', f'</{tag}>', tag in BLOCK))
        self.in_jsonld = False

    def handle_data(self, data):
        if self.in_jsonld:
            try:
                data = json.dumps(json.loads(data), ensure_ascii=False, sort_keys=True)
            except Exception:
                pass
            self.tokens.append(('text', data, False))
            return
        self.tokens.append(('text', data, False))

    def handle_comment(self, data):
        pass

    def handle_decl(self, decl):
        self.tokens.append(('decl', decl.lower(), True))


def canon(html):
    p = Canon(); p.feed(html); p.close()
    # Textes contigus fusionnés (un commentaire ignoré peut en séparer deux).
    toks = []
    for tok in p.tokens:
        if tok[0] == 'text' and toks and toks[-1][0] == 'text':
            toks[-1] = ('text', toks[-1][1] + tok[1], False)
        else:
            toks.append(tok)
    out = []
    for i, (kind, val, blk) in enumerate(toks):
        if kind != 'text':
            out.append(val); continue
        prev_blk = i == 0 or toks[i-1][2]
        next_blk = i == len(toks)-1 or toks[i+1][2]
        # Espaces réduits ; les espaces en bordure d'un élément de bloc n'ont pas d'effet visuel.
        t = ' '.join(val.split())
        if val and val[0].isspace() and not prev_blk and t:
            t = ' ' + t
        if val and val[-1].isspace() and not next_blk and t:
            t = t + ' '
        if not t:
            if prev_blk or next_blk:
                continue
            t = ' '
        out.append(t)
    return out


def main():
    ref, dist = Path(sys.argv[1]), Path(sys.argv[2])
    only = set(sys.argv[3:])
    total = 0
    for r, d in PAGES:
        if only and r not in only and d not in only:
            continue
        rp, dp = ref / r, dist / d
        if not dp.exists():
            print(f'✗ {d} : absent du build'); total += 1; continue
        a, b = canon(rp.read_text()), canon(dp.read_text())
        if a == b:
            print(f'✓ {r}'); continue
        total += 1
        diff = list(difflib.unified_diff(a, b, 'référence', 'astro', n=1, lineterm=''))
        changes = [l for l in diff if l[:1] in '+-' and not l.startswith(('+++', '---'))]
        print(f'✗ {r} : {len(changes)} lignes différentes')
        for line in diff[2:42]:
            print('   ', line[:220])
        if len(diff) > 42:
            print(f'    … ({len(diff)-42} lignes de plus)')
    for extra in ['sitemap.xml', 'robots.txt']:
        if only and extra not in only:
            continue
        rp, dp = ref / extra, dist / extra
        if not dp.exists():
            print(f'✗ {extra} : absent du build'); total += 1; continue
        if rp.read_text().split() == dp.read_text().split():
            print(f'✓ {extra}')
        else:
            total += 1; print(f'✗ {extra} : différent')
            for line in difflib.unified_diff(rp.read_text().splitlines(), dp.read_text().splitlines(), lineterm='', n=0):
                print('   ', line[:200])
    print(f'\n{"Aucune différence" if total == 0 else str(total) + " fichier(s) différent(s)"}')
    sys.exit(1 if total else 0)


if __name__ == '__main__':
    main()
