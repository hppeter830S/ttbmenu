# Builds data.js from your old files (run once). Prices FBU -> BIF.
import json, re
from bs4 import BeautifulSoup
U = '/mnt/user-data/uploads/'
soup = lambda f: BeautifulSoup(open(U+f, encoding='utf-8'), 'html.parser')
def names(el):  # {fr,en,ki,sw} if translated, else plain text
    sp = {l: el.select_one('.t-'+l) for l in ('fr','en','ki','sw')}
    if any(sp.values()):
        d = {l: (s.get_text(' ', strip=True) if s else '') for l, s in sp.items()}
        return {l: v or d['fr'] or d['en'] for l, v in d.items()}
    return re.sub(r'\s+', ' ', el.get_text(' ', strip=True))
m, cats = soup('menu.html'), []
for c in m.select('.mcat'):
    h3, grid = c.find('h3'), c.find_next_sibling('div', class_='qr-cards')
    if not grid: continue
    emoji = (h3.contents[0].strip() if h3.contents and isinstance(h3.contents[0], str) else '🍽️').split(' ')[0]
    t = h3.__copy__(); [x.extract() for x in t.find_all(string=False) if False]
    name = names(h3)
    if isinstance(name, str): name = re.sub(r'^\S+\s', '', name)
    items = [{'n': names(i.select_one('.fn')), 'p': i.select_one('.pt').get_text(strip=True).replace('FBU', 'BIF')}
             for i in grid.select('.qr-card') if i.select_one('.fn') and i.select_one('.pt')]
    img = grid.select_one('img')
    cats.append({'id': c['id'], 'g': 'drinks' if c.find_parent(class_='panel-drinks') else 'food',
                 'e': emoji, 'n': name, 'img': img['src'] if img else '', 'items': items})
svc = {}
for lang, f in [('en','index.html'),('fr','francais.html'),('ki','kirundi.html'),('sw','swahili.html')]:
    for k, s in enumerate(soup(f).select('.service-card')):
        e = svc.setdefault(k, {'e': s.select_one('.service-icon').get_text(strip=True), 'n': {}, 'd': {}})
        e['n'][lang], e['d'][lang] = s.find('h3').get_text(strip=True), s.find('p').get_text(strip=True)
gal = [{'img': a.find('img')['src'], 't': a.find('h4').get_text(strip=True), 'd': a.find('p').get_text(strip=True)}
       for a in soup('gallery.html').select('a.gallery-card')]
js = '// AUTO-GENERATED from your old pages. Edit freely: prices (p), names (n), image paths (img).\n'
for k, v in (('MENU', cats), ('SERVICES', list(svc.values())), ('GALLERY', gal)):
    js += f'const {k} = {json.dumps(v, ensure_ascii=False, indent=1)};\n'
open('data.js', 'w', encoding='utf-8').write(js)
print(len(cats), 'categories,', sum(len(c['items']) for c in cats), 'items,', len(svc), 'services,', len(gal), 'gallery')
