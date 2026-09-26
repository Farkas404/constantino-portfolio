#!/usr/bin/env python3
"""Builds dist/ (site for nginx: de at /, en at /en/) and an inline artifact page."""
import json, os, re, shutil, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))
from content import UI, PROJECTS, COLORS, DB_DEMO, IRON_DEMO
from html import escape as esc

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'src'); DIST = os.path.join(ROOT, 'dist')
CSS = open(os.path.join(SRC, 'style.css'), encoding='utf-8').read()
JS = open(os.path.join(SRC, 'app.js'), encoding='utf-8').read()
SITE = 'https://szilardfarkas.uk'

def facts_html(f): return ''.join(f'<div><span class="k">{esc(l)}</span><b>{esc(v)}</b></div>' for l, v in f)
def chips(items, cls): return f'<div class="{cls}">' + ''.join(f'<span>{esc(i)}</span>' for i in items) + '</div>'

def demo_html(kind, u, lang):
    if kind == 'iron':
        cols = u['demo_iron_cols']
        return f'''<div class="demo glass" aria-label="{esc(u['demo_iron_title'])}"><div class="dh"><span class="k">{esc(u['demo_k'])}</span><small>{esc(u['demo_iron_hint'])}</small></div><p class="dt">{esc(u['demo_iron_title'])}</p>
<div class="feed" id="feed"><div class="row head"><span>{esc(cols[0])}</span><span class="s">{esc(cols[1])}</span><span>{esc(cols[2])}</span><span class="r">{esc(cols[3])}</span></div></div>
<div class="feedstat"><span>CRITICAL <b id="fc-critical">0</b></span><span>WARNING <b id="fc-warning">0</b></span><span>PENTEST <b id="fc-pentest">0</b></span></div></div>'''
    if kind == 'db':
        rows = u['demo_db_rows']
        return f'''<div class="demo glass dbd"><div class="dh"><span class="k">{esc(u['demo_k'])}</span><small>{esc(u['demo_db_hint'])}</small></div><p class="dt">{esc(u['demo_db_title'])}</p>
<div class="top"><label for="dbrange">{esc(u['demo_db_delay'])}</label><span class="val" id="dbval">+6 min</span></div>
<input type="range" id="dbrange" min="0" max="30" value="6" step="1" aria-label="{esc(u['demo_db_delay'])}">
<div class="scale"><span>0</span><span>5</span><span>10</span><span>15</span><span>20</span><span>25</span><span>30</span></div>
<span class="pill" id="dbpill"></span><p class="msg" id="dbmsg"></p>
<table id="dbtab"><tr><td>{esc(rows[0])}</td><td></td></tr><tr><td>{esc(rows[1])}</td><td></td></tr><tr><td>{esc(rows[2])}</td><td></td></tr><tr><td>{esc(rows[3])}</td><td></td></tr></table></div>'''
    if kind == 'relais':
        bt = u['demo_relais_btn']; ger = lang == 'de'
        return f'''<div class="demo glass rel"><div class="dh"><span class="k">{esc(u['demo_k'])}</span><small>{esc(u['demo_relais_hint'])}</small></div><p class="dt">{esc(u['demo_relais_title'])}</p>
<div class="relg"><div><div class="relbtns"><button type="button" class="rb" id="rb-start" data-io="0">{esc(bt[0])}</button><button type="button" class="rb" id="rb-stop" data-io="1">{esc(bt[1])}</button><button type="button" class="rb estop" id="rb-estop" data-io="2" aria-pressed="false">{esc(bt[2])}</button></div>
<div class="ladder" id="ladder" data-de="{1 if ger else 0}" aria-label="{esc(u['demo_relais_title'])}"></div>
<div class="scopebar"><span class="k">{esc(u['demo_relais_scope'])}</span><canvas id="relscope" width="600" height="60" aria-hidden="true"></canvas></div></div>
<div class="awl"><span class="k">{esc(u['demo_relais_awl'])}</span><table id="awltab"><tr><td>U</td><td>{'E' if ger else 'I'}0.0</td><td></td></tr><tr><td>O</td><td>{'A' if ger else 'Q'}4.0</td><td></td></tr><tr><td>UN</td><td>{'E' if ger else 'I'}0.1</td><td></td></tr><tr><td>UN</td><td>{'E' if ger else 'I'}0.2</td><td></td></tr><tr><td>=</td><td>{'A' if ger else 'Q'}4.0</td><td></td></tr></table><div class="coil" id="coil"><i></i>{esc(u['demo_relais_out'])} <b id="coilv">0</b></div></div></div></div>'''
    if kind == 'tonal':
        sl = u['demo_tonal_sl']; lb = u['demo_tonal_lbl']
        return f'''<div class="demo glass ton"><div class="dh"><span class="k">{esc(u['demo_k'])}</span><small>{esc(u['demo_tonal_hint'])}</small></div><p class="dt">{esc(u['demo_tonal_title'])}</p>
<div class="tong"><div class="tonimg"><canvas id="tonc" width="334" height="476" aria-label="Shinbashi, Tokio"></canvas><img id="tonsrc" src="assets/tonal-photo.jpg" alt="" width="334" height="476" hidden decoding="async" crossorigin="anonymous"></div>
<div class="tonsc"><div><span class="k">{esc(lb[0])}</span><canvas id="tonv" width="220" height="220" aria-hidden="true"></canvas></div><div><span class="k">{esc(lb[1])}</span><canvas id="tonp" width="330" height="120" aria-hidden="true"></canvas></div></div></div>
<div class="tonsl"><label>{esc(sl[0])}<input type="range" id="t-temp" min="-100" max="100" value="0"></label><label>{esc(sl[1])}<input type="range" id="t-sat" min="0" max="200" value="100"></label><label>{esc(sl[2])}<input type="range" id="t-con" min="-100" max="100" value="0"></label></div></div>'''
    return ''

def project_html(p, u, lang, i):
    c = COLORS[p['id']]
    if isinstance(p['img'], tuple):
        fr = f'<div class="phones"><div class="fr phone"><img src="assets/{p["img"][0]}" alt="{esc(p["alt"][0])}" width="700" height="1456" loading="lazy" decoding="async"></div><div class="fr phone"><img src="assets/{p["img"][1]}" alt="{esc(p["alt"][1])}" width="700" height="1456" loading="lazy" decoding="async"></div></div>'
    else:
        fr = f'<div class="fr"><picture><source type="image/webp" srcset="assets/{p["img"].replace(".jpg",".webp")}"><img src="assets/{p["img"]}" alt="{esc(p["alt"])}" width="1400" height="{IMGH.get(p["img"],800)}" loading="{"eager" if i==0 else "lazy"}" decoding="async"></picture></div>'
    demo = demo_html(p.get('demo'), u, lang)
    if demo:
        demo = re.sub(r'(<p class="dt">.*?</p>)', r'\1<button type="button" class="dtoggle" aria-expanded="false"><span class="o1">' + esc(u['demo_open']) + '</span><span class="o2">' + esc(u['demo_close']) + '</span> <span class="ar" aria-hidden="true">▾</span></button><div class="dbody">', demo, count=1, flags=re.S)
        demo = demo[:-len('</div>')] + '</div></div>'
    return f'''<section class="proj p-{p['id']}" data-acc="{c}" id="{p['id']}">
  <div class="wrap pg">
    <div class="pt">
      <div class="n rv">{esc(p['k'])}</div>
      <h3 class="rv">{p['t']}</h3>
      <p class="tl rv d1">{esc(p['tl'])}</p>
      <div class="facts glass rv d2">{facts_html(p['facts'])}</div>
      {chips(p['stack'],'stack rv d2')}
      <button class="btn open rv d3" type="button" data-open="{p['id']}">{esc(u['open_case'])} <span class="ar" aria-hidden="true">→</span></button>
    </div>
    <div class="rv d1"><div class="stage"><span class="sys"><i></i>{esc(p['sys'])}</span>
      <div class="card3d">{fr}<div class="sheen"></div><i class="corner tl"></i><i class="corner tr"></i><i class="corner bl"></i><i class="corner br"></i></div>
    </div>{demo}</div>
  </div>
</section>'''

IMGH = {'iron-1.jpg': 708, 'relais-1.jpg': 750, 'tonal-1.jpg': 883, 'sm-1.jpg': 859}

def page(lang, inline=False, artifact=False):
    u = UI[lang]; projects = PROJECTS[lang]
    other_href = ('en/index.html' if lang == 'de' else 'https://claude.ai/artifact/YKDFrxizW79KVToLZci3fw') if artifact else u['other_href']
    data = {'ui': {k: u[k] for k in ('term', 'term_m', 'pal', 'pal_none', 'pal_sec', 'pal_case', 'pal_ext', 'demo_open', 'demo_close')},
            'projects': {p['id']: dict({k: p[k] for k in ('k', 'tt', 'gallery', 'stats', 'dec')}, ovd=p['ds'] + ' ' + p['ovd']) for p in projects},
            'colors': COLORS, 'db': DB_DEMO[lang], 'iron': IRON_DEMO[lang], 'base': ('' if lang=='de' else '../')}
    data_json = json.dumps(data, ensure_ascii=False).replace('</', '<\\/')
    head_assets = (f'<style>{CSS}</style>' if inline else '<link rel="stylesheet" href="css/style.css">')
    script = (f'<script>{JS}</script>' if inline else '<script src="js/app.js" defer></script>')
    canonical = SITE + ('/' if lang == 'de' else '/en/')
    og_img = SITE + '/assets/og.png'
    head = f'''<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{esc(u['title'])}</title>
<meta name="description" content="{esc(u['desc'])}">
<meta name="theme-color" content="#0c0d10">
<meta name="color-scheme" content="dark">
<link rel="canonical" href="{canonical}">
<link rel="alternate" hreflang="de" href="{SITE}/"><link rel="alternate" hreflang="en" href="{SITE}/en/"><link rel="alternate" hreflang="x-default" href="{SITE}/">
<meta property="og:type" content="website"><meta property="og:title" content="{esc(u['title'])}"><meta property="og:description" content="{esc(u['desc'])}"><meta property="og:url" content="{canonical}"><meta property="og:image" content="{og_img}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:locale" content="{'de_DE' if lang=='de' else 'en_GB'}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="assets/farkas-logo.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="assets/apple-touch-icon.png">
<link rel="preload" as="image" href="assets/portrait.webp" type="image/webp">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap">
{head_assets}
<script type="application/ld+json">{json.dumps({"@context":"https://schema.org","@type":"Person","name":"Constantino Carneiro-Fernández","jobTitle":"UX / Fullstack Developer","url":SITE,"email":"mailto:ccf.szilard@gmail.com","address":{"@type":"PostalAddress","addressLocality":"Regensburg","addressCountry":"DE"},"sameAs":["https://github.com/Farkas404","https://www.linkedin.com/in/constantino-c-2957731a2"]},ensure_ascii=False)}</script>'''
    hfacts = ''.join(f'<li><b>{esc(n)}</b>{esc(t)}</li>' for n, t in u['facts'])
    method = ''.join(f'<div class="m glass rv d{i}"><div class="num">{n}</div><h3>{esc(h)}</h3><p>{esc(p)}</p><div class="ex"><b>{esc(bl)}</b> {esc(ex)}</div></div>' for i, (n, h, p, bl, ex) in enumerate(u['method']))
    tline = ''.join(f'<li><span>{y}</span><div><b>{t}</b><br>{d}</div></li>' for y, t, d in u['timeline'])
    projs = '\n'.join(project_html(p, u, lang, i) for i, p in enumerate(projects))
    body = f'''<canvas id="net" aria-hidden="true"></canvas>
<div class="grid" aria-hidden="true"></div>
<div class="grain" aria-hidden="true"></div>
<div class="glow" id="glow" aria-hidden="true"></div>
<a class="sr" href="#work">Skip to content</a>
<header class="nav">
  <a class="brand" href="#top"><img src="assets/farkas-logo.svg" alt="" width="30" height="30"><span><b>constantino</b>@farkas ~ %</span></a>
  <div class="navr">
    <button class="chip" id="palbtn" type="button"><span class="dsk">{esc(u['jump'])}</span><span class="mob">{esc(u['jump_m'])}</span> <kbd>⌘K</kbd></button>
    <a class="chip" href="#contact">{esc(u['sayhi'])}</a>
    <a class="chip lang" href="{other_href}" lang="{u['other']}" hreflang="{u['other']}">{u['other_label']}</a>
  </div>
</header>
<main id="top">
<section class="hero wrap" data-acc="#3fbfa6">
  <div class="hero-grid">
    <div>
      <div class="term glass rv in"><div class="term-bar"><i></i><i></i><i></i><span>{esc(u['term_title'])}</span></div><div class="term-body" id="term"></div></div>
      <h1 class="rv in">{u['h1']}</h1>
      <p class="lead rv in d1">{esc(u['lead'])}</p>
      <ul class="hfacts rv in d1">{hfacts}</ul>
      <div class="cta rv in d2"><a class="btn pri" href="#work">{esc(u['cta1'])} <span class="mono" aria-hidden="true">↓</span></a><a class="btn" href="#about">{esc(u['cta2'])}</a></div>
      <div class="scrollhint rv in d3">{esc(u['scroll'])}</div>
    </div>
    <div class="portrait glass rv in d1" id="portrait"><picture><source type="image/webp" srcset="assets/portrait.webp"><img id="pimg" src="assets/portrait.jpg" alt="Constantino Carneiro-Fernández" width="640" height="862" fetchpriority="high" crossorigin="anonymous"></picture><canvas id="pcv" aria-hidden="true"></canvas><div class="tag"><span>● {esc(u['avail'])}</span><span>{esc(u['loc'])}</span></div></div>
  </div>
</section>
<div class="wrap sh" id="work"><div><span class="k">{u['work_k']}</span><h2>{esc(u['work_h'])}</h2></div><span class="k">{u['work_s']}</span></div>
<div id="projects">
{projs}
</div>
<section class="method wrap" id="method" data-acc="#3fbfa6">
  <div class="sh"><div><span class="k">{esc(u['method_k'])}</span><h2>{esc(u['method_h'])}</h2></div></div>
  <p class="quote rv">{u['quote']}</p>
  <div class="mg">{method}</div>
</section>
<section class="about wrap" id="about" data-acc="#3fbfa6">
  <div class="sh"><div><span class="k">{esc(u['about_k'])}</span><h2>{esc(u['about_h'])}</h2></div></div>
  <div class="ag">
    <div class="rv"><p>{u['about_p1']}</p><p>{u['about_p2']}</p><p>{esc(u['about_p3'])}</p>{chips(u['tools'],'tools')}{chips(u['langs'],'tools')}</div>
    <ul class="tline rv d1">{tline}</ul>
  </div>
</section>
<section class="contact wrap" id="contact" data-acc="#3fbfa6">
  <div class="cbox glass rv">
    <div><span class="k">{esc(u['contact_k'])}</span><h2>{esc(u['contact_h'])}</h2>
      <div class="mail"><span id="mailtxt">ccf.szilard@gmail.com</span><button type="button" id="copymail">{esc(u['copy'])}</button></div></div>
    <div class="links"><a class="btn" href="https://github.com/Farkas404" target="_blank" rel="noopener noreferrer">GitHub ↗</a><a class="btn" href="https://www.linkedin.com/in/constantino-c-2957731a2" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a></div>
  </div>
</section>
<footer class="wrap"><span>© 2026 Constantino Carneiro-Fernández</span><span>{esc(u['footer_loc'])}</span></footer>
</main>
<div class="ov" id="ov" role="dialog" aria-modal="true" aria-labelledby="ovt">
  <div class="in glass">
    <div class="top"><div><span class="k" id="ovk"></span><h3 id="ovt"></h3><p class="ds" id="ovd"></p></div><button class="x" type="button" id="ovx" aria-label="{esc(u['ov_close'])}">×</button></div>
    <div class="big"><img id="ovimg" src="" alt="" width="1400" height="788"></div>
    <div class="cap" id="ovcap"></div><div class="th" id="ovth"></div><div class="stats" id="ovst"></div><div class="dec" id="ovdec"></div>
  </div>
</div>
<div class="pal" id="pal"><div class="box glass"><input id="palq" type="text" placeholder="{esc(u['pal_ph'])}" autocomplete="off" aria-label="{esc(u['jump'])}"><ul id="pall"></ul></div></div>
<div class="toast glass" id="toast">{esc(u['copied'])}</div>
<nav class="dots" aria-label="Projekte"><a href="#irongrid" data-d="irongrid"><span class="sr">IronGrid</span></a><a href="#relais" data-d="relais"><span class="sr">RELAIS</span></a><a href="#tonal" data-d="tonal"><span class="sr">TONAL</span></a><a href="#securitymonitor" data-d="securitymonitor"><span class="sr">Security Monitor</span></a><a href="#dbnavigator" data-d="dbnavigator"><span class="sr">DB Navigator</span></a></nav>
<div class="hud" aria-hidden="true"><span>SYS <b id="hudt">--:--:--</b></span><span>49.01°N 12.10°E</span><span>NODES <b id="hudn">0</b></span><span>LINK <b>OK</b></span></div>
<script id="site-data" type="application/json">{data_json}</script>
{script}'''
    if artifact and lang == 'de':
        head = re.sub(r'<meta charset="utf-8">\n<meta name="viewport"[^>]*>\n', '', head)
        return head + '\n' + body  # skeleton-less for the Artifact tool
    return f'<!doctype html>\n<html lang="{lang}">\n<head>\n{head}\n</head>\n<body>\n{body}\n</body>\n</html>\n'

def build():
    if os.path.exists(DIST): shutil.rmtree(DIST)
    os.makedirs(os.path.join(DIST, 'en')); os.makedirs(os.path.join(DIST, 'css')); os.makedirs(os.path.join(DIST, 'js'))
    shutil.copytree(os.path.join(ROOT, 'assets'), os.path.join(DIST, 'assets'))
    open(os.path.join(DIST, 'css', 'style.css'), 'w', encoding='utf-8').write(CSS)
    open(os.path.join(DIST, 'js', 'app.js'), 'w', encoding='utf-8').write(JS)
    open(os.path.join(DIST, 'index.html'), 'w', encoding='utf-8').write(page('de'))
    # en page lives in /en/, so asset paths need ../ ; simplest: rewrite relative refs
    en = page('en').replace('href="assets/', 'href="../assets/').replace('src="assets/', 'src="../assets/').replace('srcset="assets/', 'srcset="../assets/').replace('href="css/', 'href="../css/').replace('src="js/', 'src="../js/')
    open(os.path.join(DIST, 'en', 'index.html'), 'w', encoding='utf-8').write(en)
    # 404 + robots + sitemap
    open(os.path.join(DIST, '404.html'), 'w', encoding='utf-8').write(f'''<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>404 — Constantino Carneiro-Fernández</title><style>{CSS}</style></head><body><div class="grid"></div><main style="min-height:100svh;display:grid;place-items:center;padding:24px"><div class="term glass" style="width:min(100%,560px)"><div class="term-bar"><i></i><i></i><i></i><span>zsh — farkas-garage</span></div><div class="term-body"><span class="p">constantino@farkas</span> <span class="c">~ %</span> <span class="c">cat {{path}}</span><span class="o">cat: no such file or directory (404)</span><span class="p">constantino@farkas</span> <span class="c">~ %</span> <a class="c" href="/">cd ~</a><span class="cur"></span></div></div></main></body></html>''')
    open(os.path.join(DIST, 'robots.txt'), 'w').write(f'User-agent: *\nAllow: /\nSitemap: {SITE}/sitemap.xml\n')
    open(os.path.join(DIST, 'sitemap.xml'), 'w').write(f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n<url><loc>{SITE}/</loc><xhtml:link rel="alternate" hreflang="de" href="{SITE}/"/><xhtml:link rel="alternate" hreflang="en" href="{SITE}/en/"/></url>\n<url><loc>{SITE}/en/</loc><xhtml:link rel="alternate" hreflang="de" href="{SITE}/"/><xhtml:link rel="alternate" hreflang="en" href="{SITE}/en/"/></url>\n</urlset>\n')
    # artifact variant (inline, DE main + EN as extra file)
    art = os.path.join(ROOT, 'artifact'); os.makedirs(os.path.join(art, 'en'), exist_ok=True)
    open(os.path.join(art, 'farkas-garage.html'), 'w', encoding='utf-8').write(page('de', inline=True, artifact=True))
    open(os.path.join(art, 'en', 'index.html'), 'w', encoding='utf-8').write(page('en', inline=True, artifact=True).replace('href="assets/', 'href="../assets/').replace('src="assets/', 'src="../assets/').replace('srcset="assets/', 'srcset="../assets/'))
    print('built', DIST)

if __name__ == '__main__':
    build()
