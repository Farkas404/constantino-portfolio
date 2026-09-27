/* Farkas Garage — no dependencies. Data comes from the inert JSON block #site-data. */
(function () {
  'use strict';
  var D = JSON.parse(document.getElementById('site-data').textContent);
  var P = D.projects, COL = D.colors, UI = D.ui;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  /* ---------- terminal typing ---------- */
  (function () {
    var box = $('#term'); if (!box) return;
    var lines = (matchMedia('(max-width:600px)').matches && UI.term_m) ? UI.term_m : UI.term, html = '', i = 0;
    function prompt() { return '<span class="p">constantino@farkas</span> <span class="c">~ %</span> '; }
    function render(extra) { box.innerHTML = html + prompt() + extra + '<span class="cur"></span>'; }
    function step() {
      if (i >= lines.length) { render(''); return; }
      var t = lines[i][0], s = lines[i][1]; i++;
      if (t === 'out') { html += '<span class="o">' + s + '</span>'; render(''); setTimeout(step, 260); return; }
      var j = 0;
      (function typed() {
        render('<span class="c">' + s.slice(0, j) + '</span>');
        if (j++ < s.length) setTimeout(typed, 38 + Math.random() * 50);
        else { html += prompt() + '<span class="c">' + s + '</span>\n'; setTimeout(step, 320); }
      })();
    }
    if (reduce) { lines.forEach(function (l) { html += l[0] === 'out' ? '<span class="o">' + l[1] + '</span>' : prompt() + '<span class="c">' + l[1] + '</span>\n'; }); render(''); }
    else setTimeout(step, 500);
  })();


  /* ---------- cyber intro: portrait scan / HUD / glitch (canvas, no video) ---------- */
  (function () {
    var box = $('#portrait'), img = $('#pimg'), cv = $('#pcv'); if (!box || !img || !cv) return;
    var x = cv.getContext('2d'), dpr = Math.min(devicePixelRatio || 1, 2), W, H, ready = false, t0 = 0, raf = 0, idleT = 0, nextGlitch = 0;
    var LM = { le: [.38, .41], re: [.60, .41], nose: [.49, .52], mouth: [.49, .59], chin: [.49, .70], lt: [.27, .36], rt: [.72, .36], crown: [.49, .10] };
    var HUD = ['NEURAL LINK · ESTABLISHED', 'SYNC 98.4 %', 'ID  CCF · 1985 · BOCAS DEL TORO', 'LOC 49.01°N 12.10°E', 'STACK  HTML CSS JS · PHP SYMFONY · ANGULAR', 'MODE  UX / FULLSTACK'];
    var src = document.createElement('canvas'), sx = src.getContext('2d'), dr = {};
    function size() {
      var r = box.getBoundingClientRect(); W = cv.width = Math.round(r.width * dpr); H = cv.height = Math.round(r.height * dpr);
      var iw = img.naturalWidth, ih = img.naturalHeight, s = Math.max(W / iw, H / ih), dw = iw * s, dh = ih * s;
      dr = { x: (W - dw) / 2, y: (H - dh) / 2, w: dw, h: dh };
      src.width = W; src.height = H; sx.filter = 'grayscale(1) contrast(1.06)'; sx.drawImage(img, dr.x, dr.y, dr.w, dr.h); sx.filter = 'none';
    }
    function P(k) { return [dr.x + LM[k][0] * dr.w, dr.y + LM[k][1] * dr.h]; }
    function ease(v) { return v < 0 ? 0 : v > 1 ? 1 : v * v * (3 - 2 * v); }
    var acc = function () { return getComputedStyle(root).getPropertyValue('--acc').trim() || '#3fbfa6'; };
    function mono(px) { x.font = (px * dpr) + 'px "IBM Plex Mono", ui-monospace, monospace'; }
    function glitchFrame(strength) {
      // horizontal slices + rgb split
      var n = 3 + Math.floor(strength * 5), i;
      for (i = 0; i < n; i++) { var sy = Math.random() * H, sh = (4 + Math.random() * 26) * dpr, off = (Math.random() - .5) * 60 * dpr * strength; x.drawImage(src, 0, sy, W, sh, off, sy, W, sh); }
      x.globalCompositeOperation = 'screen'; x.globalAlpha = .35 * strength;
      x.drawImage(src, 6 * dpr * strength, 0); x.drawImage(src, -6 * dpr * strength, 0);
      x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
    }
    function draw(ts) {
      if (!ready) return;
      if (!t0) t0 = ts; var t = ts - t0, col = acc();
      x.clearRect(0, 0, W, H);
      // phase A: scan reveal 0..1800
      var scan = ease(t / 1800), sy = scan * H;
      x.fillStyle = '#0a0b0e'; x.fillRect(0, 0, W, H);
      // wireframe grid under unrevealed area
      x.strokeStyle = 'rgba(255,255,255,.05)'; x.lineWidth = dpr; var g = 28 * dpr, gx;
      for (gx = 0; gx < W; gx += g) { x.beginPath(); x.moveTo(gx, 0); x.lineTo(gx, H); x.stroke(); }
      for (gx = 0; gx < H; gx += g) { x.beginPath(); x.moveTo(0, gx); x.lineTo(W, gx); x.stroke(); }
      // revealed image
      x.drawImage(src, 0, 0, W, sy, 0, 0, W, sy);
      // scanline glow
      if (scan < 1) { var grd = x.createLinearGradient(0, sy - 40 * dpr, 0, sy + 4 * dpr); grd.addColorStop(0, 'rgba(0,0,0,0)'); grd.addColorStop(1, col); x.fillStyle = grd; x.globalAlpha = .55; x.fillRect(0, sy - 40 * dpr, W, 44 * dpr); x.globalAlpha = 1; x.fillStyle = col; x.fillRect(0, sy, W, 2 * dpr); }
      // tint + scanlines
      x.globalCompositeOperation = 'multiply'; x.fillStyle = 'rgba(205,236,228,.92)'; x.fillRect(0, 0, W, sy); x.globalCompositeOperation = 'source-over';
      x.fillStyle = 'rgba(0,0,0,.18)'; for (gx = 0; gx < sy; gx += 3 * dpr) x.fillRect(0, gx, W, dpr);
      // face bracket box
      var bb = ease((t - 900) / 700); if (bb > 0) { var bx = dr.x + .22 * dr.w, by = dr.y + .06 * dr.h, bw = .56 * dr.w, bh = .68 * dr.h, L = 16 * dpr * bb; x.globalAlpha = bb; x.lineWidth = 1.5 * dpr;
        [[bx, by, 1, 1], [bx + bw, by, -1, 1], [bx, by + bh, 1, -1], [bx + bw, by + bh, -1, -1]].forEach(function (c) { x.beginPath(); x.moveTo(c[0], c[1] + c[3] * L); x.lineTo(c[0], c[1]); x.lineTo(c[0] + c[2] * L, c[1]); x.stroke(); }); x.globalAlpha = 1; }
      // phase C: HUD text typing (t>1500), left column
      mono(10); x.textBaseline = 'top';
      (W / dpr < 520 ? HUD.slice(0, 3) : HUD).forEach(function (line, i) { var st = 1500 + i * 260, n = Math.floor((t - st) / 18); if (n <= 0) return; var txt = line.slice(0, n), ty = 14 * dpr + i * 15 * dpr, tx = 14 * dpr;
        x.fillStyle = 'rgba(12,13,16,.6)'; x.fillRect(tx - 4 * dpr, ty - 2 * dpr, x.measureText(txt).width + 8 * dpr, 14 * dpr); x.fillStyle = i === 0 ? col : 'rgba(236,236,236,.85)'; x.fillText(txt, tx, ty); });
      // phase D: neural traces from crown/temples (t>2600)
      var tr = ease((t - 2600) / 900); if (tr > 0) { x.lineWidth = dpr; [['crown', -30, -90], ['lt', -70, -40], ['rt', 70, -40]].forEach(function (d, i) { var p = P(d[0]), ex = p[0] + d[1] * dpr * 1.6, ey = p[1] + d[2] * dpr * 1.6, mx = ex, my = p[1];
          x.strokeStyle = col; x.globalAlpha = .7 * tr; x.beginPath(); x.moveTo(p[0], p[1]); x.lineTo(mx, my); x.lineTo(ex, ey); x.stroke();
          var ph = ((ts / 900) + i * .33) % 1, px = ph < .5 ? p[0] + (mx - p[0]) * ph * 2 : mx + (ex - mx) * (ph - .5) * 2, py = ph < .5 ? p[1] : my + (ey - my) * (ph - .5) * 2;
          x.fillStyle = col; x.beginPath(); x.arc(px, py, 2.5 * dpr, 0, 6.283); x.fill(); x.globalAlpha = 1; }); }
      // glitch bursts at 2100, 2400, 3300 (+ idle every ~7s)
      var gs = 0; [2100, 2450, 3300].forEach(function (g0) { if (t > g0 && t < g0 + 140) gs = Math.max(gs, 1 - (t - g0) / 140); });
      if (t > 4500) { if (!nextGlitch) nextGlitch = ts + 6000 + Math.random() * 3000; if (ts > nextGlitch) { idleT = ts; nextGlitch = ts + 6000 + Math.random() * 4000; } if (ts - idleT < 120) gs = Math.max(gs, .5 * (1 - (ts - idleT) / 120)); }
      if (gs > 0) glitchFrame(gs);
      // vignette
      var vg = x.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, H * .8); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.45)'); x.fillStyle = vg; x.fillRect(0, 0, W, H);
      raf = requestAnimationFrame(draw);
    }
    function start() { if (ready) return; size(); ready = true; box.classList.add('live');
      if (reduce) { t0 = -1e9; draw(1e9 + 5000); cancelAnimationFrame(raf); return; }
      raf = requestAnimationFrame(draw); }
    if (img.complete && img.naturalWidth) start(); else img.addEventListener('load', start);
    img.addEventListener('error', function () { box.classList.remove('live'); });
    addEventListener('resize', function () { if (ready) size(); });
    document.addEventListener('visibilitychange', function () { if (!ready || reduce) return; if (document.hidden) cancelAnimationFrame(raf); else raf = requestAnimationFrame(draw); });
  })();

  /* ---------- network canvas ---------- */
  var setNetColor = function () {};
  (function () {
    var c = $('#net'); if (!c) return;
    var x = c.getContext('2d'), dpr = Math.min(devicePixelRatio || 1, 2);
    var W, H, N = [], acc = [63, 191, 166], tgt = acc.slice(), t = 0, mx = -1e3, my = -1e3, running = false, raf = 0;
    function size() {
      W = c.width = innerWidth * dpr; H = c.height = innerHeight * dpr; c.style.width = innerWidth + 'px'; c.style.height = innerHeight + 'px';
      var n = Math.min(90, Math.floor(innerWidth * innerHeight / 14000)); N = [];
      for (var i = 0; i < n; i++) N.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .25 * dpr, vy: (Math.random() - .5) * .25 * dpr, r: (Math.random() * 1.4 + .8) * dpr, a: Math.random() * 6.28 });
      var hn = $('#hudn'); if (hn) hn.textContent = N.length;
    }
    size(); addEventListener('resize', size);
    addEventListener('pointermove', function (e) { mx = e.clientX * dpr; my = e.clientY * dpr; }, { passive: true });
    setNetColor = function (hex) { tgt = [1, 3, 5].map(function (i) { return parseInt(hex.slice(i, i + 2), 16); }); };
    function draw() {
      t += .006; for (var k = 0; k < 3; k++) acc[k] += (tgt[k] - acc[k]) * .03;
      var r = acc[0] | 0, g = acc[1] | 0, b = acc[2] | 0, link = 150 * dpr, i, j, p;
      x.clearRect(0, 0, W, H);
      for (i = 0; i < N.length; i++) { p = N[i]; p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1;
        var dx = p.x - mx, dy = p.y - my, d = Math.hypot(dx, dy); if (d < 220 * dpr && d > 0) { p.x += dx / d * .6; p.y += dy / d * .6; } }
      x.lineWidth = dpr * .7;
      for (i = 0; i < N.length; i++) for (j = i + 1; j < N.length; j++) { var a = N[i], q = N[j], dd = Math.hypot(a.x - q.x, a.y - q.y);
        if (dd < link) { x.strokeStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + ((1 - dd / link) * .22) + ')'; x.beginPath(); x.moveTo(a.x, a.y); x.lineTo(q.x, q.y); x.stroke(); } }
      for (i = 0; i < N.length; i++) { p = N[i]; var pulse = .55 + .45 * Math.sin(t * 3 + p.a); x.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + (.35 + .5 * pulse) + ')'; x.beginPath(); x.arc(p.x, p.y, p.r * (1 + pulse * .4), 0, 6.28); x.fill(); }
      if (N.length) { var ki = Math.floor(t * 2) % N.length, ph = (t * 2) % 1, qq = N[ki];
        x.strokeStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + ((1 - ph) * .6) + ')'; x.lineWidth = dpr; x.beginPath(); x.arc(qq.x, qq.y, ph * 40 * dpr, 0, 6.28); x.stroke(); }
      if (running && !reduce) raf = requestAnimationFrame(draw);
    }
    function start() { if (running) return; running = true; draw(); }
    function stop() { running = false; cancelAnimationFrame(raf); }
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
    start();
  })();

  /* ---------- reveal + accent follow ---------- */
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -10% 0px', threshold: .08 });
  $$('.rv:not(.in)').forEach(function (n) { io.observe(n); });
  setTimeout(function () { $$('.rv:not(.in)').forEach(function (n) { if (n.getBoundingClientRect().top < innerHeight * 1.2) n.classList.add('in'); }); }, 1500);
  var glow = $('#glow'), root = document.documentElement;
  var io2 = new IntersectionObserver(function (es) { es.forEach(function (e) { if (!e.isIntersecting) return; var a = e.target.getAttribute('data-acc') || '#3fbfa6';
    glow.style.background = a; setNetColor(a); root.style.setProperty('--acc', a);
    root.style.setProperty('--acc-r', [1, 3, 5].map(function (i) { return parseInt(a.slice(i, i + 2), 16); }).join(',')); }); }, { threshold: .45 });
  $$('[data-acc]').forEach(function (s) { io2.observe(s); });

  /* ---------- 3D tilt ---------- */
  if (matchMedia('(hover:hover)').matches && !reduce) {
    $$('.stage').forEach(function (st) { var card = $('.card3d', st), sheen = $('.sheen', st);
      st.addEventListener('pointermove', function (e) { var r = st.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
        card.style.transform = 'rotateY(' + (px * 14) + 'deg) rotateX(' + (-py * 10) + 'deg) translateZ(10px)';
        if (sheen) sheen.style.background = 'linear-gradient(' + (115 + px * 40) + 'deg,transparent 40%,rgba(255,255,255,.14) ' + (50 + px * 10) + '%,transparent 60%)'; });
      st.addEventListener('pointerleave', function () { card.style.transform = ''; }); });
  }

  /* ---------- live demo: IronGrid alert feed ---------- */
  (function () {
    var feed = $('#feed'); if (!feed) return;
    var events = D.iron, i = 0, counts = { critical: 0, warning: 0, pentest: 0 }, timer;
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function push() {
      var ev = events[i++ % events.length], d = new Date();
      var row = el('div', 'row');
      row.appendChild(el('span', 't', pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds())));
      row.appendChild(el('span', 's', ev[0]));
      row.appendChild(el('span', 'e', ev[1]));
      row.appendChild(el('span', 'sev ' + ev[2], ev[2]));
      var head = $('.head', feed); feed.insertBefore(row, head.nextSibling);
      while (feed.children.length > 7) feed.removeChild(feed.lastChild);
      if (counts[ev[2]] != null) { counts[ev[2]]++; var c = $('#fc-' + ev[2]); if (c) c.textContent = counts[ev[2]]; }
    }
    function run() { push(); timer = setTimeout(run, reduce ? 4000 : 1800 + Math.random() * 1800); }
    var seen = false;
    new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting && !seen) { seen = true; push(); push(); push(); run(); } if (!e.isIntersecting && seen) { clearTimeout(timer); seen = false; } }); }, { threshold: .2 }).observe(feed);
  })();

  /* ---------- live demo: DB what-if slider ---------- */
  (function () {
    var r = $('#dbrange'); if (!r) return;
    var T = D.db, val = $('#dbval'), pill = $('#dbpill'), msg = $('#dbmsg'), tds = $$('#dbtab td:last-child');
    var cols = ['#1e9e57', '#e39b00', '#e39b00', '#ec0016', '#14171c'];
    function upd() {
      var m = +r.value, s = m < 4 ? 0 : m < 12 ? 1 : m < 15 ? 2 : m < 25 ? 3 : 4, u = Math.max(0, 20 - m);
      val.textContent = '+' + m + ' ' + T.unit;
      pill.textContent = ''; pill.appendChild(el('i')); pill.appendChild(document.createTextNode(T.states[s][0]));
      pill.style.color = s === 4 ? '#fff' : cols[s]; pill.style.borderColor = cols[s]; pill.style.background = s === 4 ? cols[s] : 'transparent';
      msg.textContent = T.states[s][1];
      tds[0].textContent = T.conn[s].replace('{u}', u); tds[1].textContent = T.arr[s]; tds[2].textContent = T.rights[s]; tds[3].textContent = T.states[s][0];
      r.setAttribute('aria-valuetext', '+' + m + ' ' + T.unit + ', ' + T.states[s][0]);
    }
    r.addEventListener('input', upd); upd();
  })();


  /* ---------- live demo: RELAIS latching circuit ---------- */
  (function () {
    var lad = $('#ladder'); if (!lad) return;
    var de = lad.getAttribute('data-de') === '1', I = de ? 'E' : 'I', Q = de ? 'A' : 'Q';
    var NS = 'http://www.w3.org/2000/svg';
    function sv(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); (parent || svg).appendChild(e); return e; }
    var svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 420 120'); svg.setAttribute('role', 'img'); lad.appendChild(svg);
    // rails
    sv('path', { d: 'M12 10 V110', 'class': 'w' }); sv('path', { d: 'M408 10 V110', 'class': 'w' });
    // wires: main rung y=40, seal-in branch y=85 from x=40..130
    var wires = [
      sv('path', { d: 'M12 40 H60', 'class': 'w', id: 'w0' }),            // rail -> start
      sv('path', { d: 'M100 40 H160', 'class': 'w', id: 'w1' }),          // start -> stop
      sv('path', { d: 'M200 40 H260', 'class': 'w', id: 'w2' }),          // stop -> estop
      sv('path', { d: 'M300 40 H340', 'class': 'w', id: 'w3' }),          // estop -> coil
      sv('path', { d: 'M380 40 H408', 'class': 'w', id: 'w4' }),          // coil -> rail
      sv('path', { d: 'M40 40 V85 H60', 'class': 'w', id: 'w5' }),        // branch down
      sv('path', { d: 'M100 85 H130 V40', 'class': 'w', id: 'w6' })       // branch up
    ];
    function contact(x, y, nc, id) { var g = sv('g', { id: id }); sv('path', { d: 'M' + x + ' ' + y + ' H' + (x + 12) + ' M' + (x + 28) + ' ' + y + ' H' + (x + 40), 'class': 'w' }, g);
      sv('path', { d: 'M' + (x + 12) + ' ' + (y - 9) + ' V' + (y + 9) + ' M' + (x + 28) + ' ' + (y - 9) + ' V' + (y + 9), 'class': 'w', 'data-c': 1 }, g);
      if (nc) sv('path', { d: 'M' + (x + 10) + ' ' + (y + 9) + ' L' + (x + 30) + ' ' + (y - 9), 'class': 'w', 'data-c': 1 }, g); return g; }
    var cStart = contact(60, 40, false, 'c0'), cStop = contact(160, 40, true, 'c1'), cEstop = contact(260, 40, true, 'c2'), cSeal = contact(60, 85, false, 'c3');
    var coilEl = sv('path', { d: 'M340 40 H352 M368 40 H380 M354 31 A11 11 0 0 0 354 49 M366 31 A11 11 0 0 1 366 49', 'class': 'cl', id: 'coil-el' });
    var labels = [[80, 22, I + '0.0'], [180, 22, I + '0.1'], [280, 22, I + '0.2'], [360, 22, Q + '4.0'], [80, 106, Q + '4.0'], [70, 62, de ? 'Selbsthaltung' : 'seal-in']];
    labels.forEach(function (l) { var t = sv('text', { x: l[0], y: l[1], 'text-anchor': 'middle', 'class': l[1] === 22 ? 'lbl' : '' }); t.textContent = l[2]; });
    var st = [false, false, false], motor = false, hist = [], scope = $('#relscope'), sx = scope.getContext('2d');
    var awl = $$('#awltab td:last-child'), coil = $('#coil'), coilv = $('#coilv');
    function cls(el, on) { el.classList.toggle('hot', on); }
    function eval_() {
      var start = st[0], stop = st[1], estop = st[2];
      var vke1 = start, vke2 = start || motor, vke3 = vke2 && !stop, vke4 = vke3 && !estop; motor = vke4;
      [vke1, vke2, vke3, vke4, motor].forEach(function (v, i) { awl[i].textContent = v ? '1' : '0'; awl[i].classList.toggle('one', v); });
      cls(wires[0], true); cls(wires[1], vke2); cls(wires[2], vke3); cls(wires[3], vke4); cls(wires[4], vke4);
      cls(wires[5], true); cls(wires[6], motor && !start ? true : motor);
      $$('[data-c]', cStart).forEach(function (e) { cls(e, start); }); $$('[data-c]', cSeal).forEach(function (e) { cls(e, motor); });
      $$('[data-c]', cStop).forEach(function (e) { cls(e, !stop); }); $$('[data-c]', cEstop).forEach(function (e) { cls(e, !estop); });
      cls(coilEl, motor); coil.classList.toggle('on', motor); coilv.textContent = motor ? '1' : '0';
    }
    function drawScope() {
      var w = scope.width, h = scope.height; sx.clearRect(0, 0, w, h);
      sx.strokeStyle = 'rgba(255,255,255,.06)'; sx.lineWidth = 1; for (var gx = 0; gx < w; gx += 50) { sx.beginPath(); sx.moveTo(gx, 0); sx.lineTo(gx, h); sx.stroke(); }
      sx.strokeStyle = '#4bc98a'; sx.lineWidth = 2; sx.beginPath();
      var n = hist.length, step = w / 150;
      for (var i = 0; i < n; i++) { var x = w - (n - i) * step, y = hist[i] ? 14 : h - 14; if (i === 0) sx.moveTo(x, y); else { sx.lineTo(x, hist[i - 1] ? 14 : h - 14); sx.lineTo(x, y); } }
      sx.stroke();
    }
    function tick() { hist.push(motor); if (hist.length > 150) hist.shift(); drawScope(); }
    var timer = null;
    new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting && !timer) timer = setInterval(tick, 80); else if (!e.isIntersecting && timer) { clearInterval(timer); timer = null; } }); }, { threshold: .1 }).observe(lad);
    function press(i, on) { st[i] = on; eval_(); }
    ['#rb-start', '#rb-stop'].forEach(function (sel, i) { var b = $(sel);
      b.addEventListener('pointerdown', function (e) { e.preventDefault(); b.classList.add('on'); press(i, true); });
      var up = function () { b.classList.remove('on'); press(i, false); }; b.addEventListener('pointerup', up); b.addEventListener('pointerleave', up); b.addEventListener('pointercancel', up);
      b.addEventListener('keydown', function (e) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); b.classList.add('on'); press(i, true); } });
      b.addEventListener('keyup', function (e) { if (e.key === ' ' || e.key === 'Enter') up(); }); });
    var es = $('#rb-estop'); es.addEventListener('click', function () { st[2] = !st[2]; es.classList.toggle('on', st[2]); es.setAttribute('aria-pressed', st[2]); eval_(); });
    eval_(); drawScope();
  })();

  /* ---------- live demo: TONAL scopes ---------- */
  (function () {
    var img = $('#tonsrc'), out = $('#tonc'); if (!img || !out) return;
    var vec = $('#tonv'), par = $('#tonp'), ox = out.getContext('2d'), vx = vec.getContext('2d'), px = par.getContext('2d');
    var W = 167, H = 238, work = document.createElement('canvas'); work.width = W; work.height = H; var wx = work.getContext('2d', { willReadFrequently: true });
    var src = null, raf = 0;
    function load() { try { wx.drawImage(img, 0, 0, W, H); src = wx.getImageData(0, 0, W, H); } catch (e) { src = null; } schedule(); }
    if (img.complete && img.naturalWidth) load(); else img.addEventListener('load', load);
    var sl = { temp: $('#t-temp'), sat: $('#t-sat'), con: $('#t-con') };
    Object.keys(sl).forEach(function (k) { sl[k].addEventListener('input', schedule); });
    function schedule() { if (!raf) raf = requestAnimationFrame(render); }
    function render() {
      raf = 0; if (!src) return;
      var temp = +sl.temp.value / 100, sat = +sl.sat.value / 100, con = 1 + (+sl.con.value / 100) * .8;
      var d = new Uint8ClampedArray(src.data), n = d.length, i, r, g, b, y;
      var vw = vec.width, vh = vec.height, cx = vw / 2, cy = vh / 2, R = vw * .46;
      var vacc = new Float32Array(vw * vh), pw = par.width, ph = par.height, third = pw / 3, pacc = new Float32Array(pw * ph);
      for (i = 0; i < n; i += 4) {
        r = d[i]; g = d[i + 1]; b = d[i + 2];
        r = (r - 128) * con + 128; g = (g - 128) * con + 128; b = (b - 128) * con + 128;
        r += temp * 28; b -= temp * 28;
        y = .2126 * r + .7152 * g + .0722 * b;
        r = y + (r - y) * sat; g = y + (g - y) * sat; b = y + (b - y) * sat;
        r = r < 0 ? 0 : r > 255 ? 255 : r; g = g < 0 ? 0 : g > 255 ? 255 : g; b = b < 0 ? 0 : b > 255 ? 255 : b;
        d[i] = r; d[i + 1] = g; d[i + 2] = b;
        // vectorscope: Cb/Cr
        var cb = -.1146 * r - .3854 * g + .5 * b, cr = .5 * r - .4542 * g - .0458 * b;
        var vxp = (cx + cb / 128 * R) | 0, vyp = (cy - cr / 128 * R) | 0; if (vxp >= 0 && vxp < vw && vyp >= 0 && vyp < vh) vacc[vyp * vw + vxp] += 1;
        // parade: x position by column within each third, y by channel value
        var col = ((i >> 2) % W) / W;
        var xr = (col * third) | 0, xg = (third + col * third) | 0, xb = (2 * third + col * third) | 0;
        pacc[((ph - 1 - (r / 255 * (ph - 1))) | 0) * pw + xr] += 1; pacc[((ph - 1 - (g / 255 * (ph - 1))) | 0) * pw + xg] += 1; pacc[((ph - 1 - (b / 255 * (ph - 1))) | 0) * pw + xb] += 1;
      }
      wx.putImageData(new ImageData(d, W, H), 0, 0); ox.imageSmoothingEnabled = true; ox.drawImage(work, 0, 0, out.width, out.height);
      // vectorscope draw
      vx.fillStyle = '#0a0b0e'; vx.fillRect(0, 0, vw, vh);
      vx.strokeStyle = 'rgba(255,255,255,.12)'; vx.lineWidth = 1; vx.beginPath(); vx.arc(cx, cy, R, 0, 6.283); vx.stroke(); vx.beginPath(); vx.arc(cx, cy, R * .5, 0, 6.283); vx.stroke();
      vx.beginPath(); vx.moveTo(cx - R, cy); vx.lineTo(cx + R, cy); vx.moveTo(cx, cy - R); vx.lineTo(cx, cy + R); vx.stroke();
      var targets = [['R', 255, 0, 0], ['Mg', 255, 0, 255], ['B', 0, 0, 255], ['Cy', 0, 255, 255], ['G', 0, 255, 0], ['Yl', 255, 255, 0]];
      vx.font = '9px IBM Plex Mono, monospace'; vx.fillStyle = 'rgba(255,255,255,.45)'; vx.textAlign = 'center';
      targets.forEach(function (t) { var cb = (-.1146 * t[1] - .3854 * t[2] + .5 * t[3]) * .75, cr = (.5 * t[1] - .4542 * t[2] - .0458 * t[3]) * .75; var tx = cx + cb / 128 * R, ty = cy - cr / 128 * R; vx.strokeRect(tx - 4, ty - 4, 8, 8); vx.fillText(t[0], tx, ty - 7); });
      // skin tone line (~123°)
      vx.strokeStyle = 'rgba(255,255,255,.18)'; vx.beginPath(); vx.moveTo(cx, cy); vx.lineTo(cx + Math.cos(-2.146) * R, cy + Math.sin(-2.146) * R); vx.stroke();
      var vimg = vx.getImageData(0, 0, vw, vh), vd = vimg.data, k, a;
      for (k = 0; k < vacc.length; k++) { if (!vacc[k]) continue; a = Math.min(1, vacc[k] / 6); var o = k * 4; vd[o] = vd[o] + (140 - vd[o]) * a; vd[o + 1] = vd[o + 1] + (235 - vd[o + 1]) * a; vd[o + 2] = vd[o + 2] + (200 - vd[o + 2]) * a; }
      vx.putImageData(vimg, 0, 0);
      // parade draw
      px.fillStyle = '#0a0b0e'; px.fillRect(0, 0, pw, ph);
      px.strokeStyle = 'rgba(255,255,255,.08)'; for (var gy = 0; gy <= 4; gy++) { px.beginPath(); px.moveTo(0, gy * ph / 4 + .5); px.lineTo(pw, gy * ph / 4 + .5); px.stroke(); }
      var pimg = px.getImageData(0, 0, pw, ph), pd = pimg.data, cols = [[255, 90, 90], [90, 230, 120], [90, 150, 255]];
      for (k = 0; k < pacc.length; k++) { if (!pacc[k]) continue; a = Math.min(1, pacc[k] / 4); var c = cols[Math.min(2, ((k % pw) / third) | 0)], o2 = k * 4; pd[o2] = pd[o2] + (c[0] - pd[o2]) * a; pd[o2 + 1] = pd[o2 + 1] + (c[1] - pd[o2 + 1]) * a; pd[o2 + 2] = pd[o2 + 2] + (c[2] - pd[o2 + 2]) * a; }
      px.putImageData(pimg, 0, 0);
      px.fillStyle = 'rgba(255,255,255,.4)'; px.font = '9px IBM Plex Mono, monospace'; px.textAlign = 'left'; px.fillText('R', 4, 10); px.fillText('G', third + 4, 10); px.fillText('B', 2 * third + 4, 10);
    }
  })();

  /* ---------- live demo: KFIT session mode (heart rate, zones, calories) ---------- */
  (function () {
    var root = $('#kf'); if (!root) return;
    var cv = $('#kfc'), ctx = cv.getContext('2d'), go = $('#kfgo'), rng = $('#kfrange');
    var hrEl = $('#kfhr'), zEl = $('#kfz'), znEl = $('#kfzn'), kEl = $('#kfkcal'), tEl = $('#kftime'), phEl = $('#kfph'), setEl = $('#kfset'), rpeEl = $('#kfrpe');
    var bars = $$('#kfbars i'), phase = $('#kfphase');
    var T = { work: root.dataset.work, rest: root.dataset.rest, start: root.dataset.start, pause: root.dataset.pause, done: root.dataset.done, again: root.dataset.again };
    // demo persona: 30 y, 62 kg, female -> HRmax 190. Keytel et al. 2005 (kJ/min) -> kcal
    var AGE = 30, KG = 62, HRMAX = 190, WORK = 30, REST = 15, SETS = 4;
    var ZC = ['#7d8590', '#38bdf8', '#35d07f', '#f4b740', '#ff5470'], PINK = '#ff2fa6', PURP = '#8b5cf6';
    var hr = 72, kcal = 0, tz = [0, 0, 0, 0, 0], hist = [], running = false, done = false, t = 0, last = 0, raf = 0;
    function zone(h) { var p = h / HRMAX; return p < .6 ? 0 : p < .7 ? 1 : p < .8 ? 2 : p < .9 ? 3 : 4; }
    function kcalPerMin(h) { var kj = -20.4022 + 0.4472 * h - 0.1263 * KG + 0.074 * AGE; return Math.max(0, kj / 4.184); }
    function target() { if (done) return 72; var rpe = +rng.value; return inWork() ? 108 + (rpe - 5) * 13.4 : 104; }
    function cyc() { return WORK + REST; }
    function setIdx() { return Math.min(SETS - 1, Math.floor(t / cyc())); }
    function inWork() { return (t % cyc()) < WORK; }
    function fmt(s) { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
    function draw() {
      var W = cv.width, H = cv.height; ctx.clearRect(0, 0, W, H);
      // zone bands
      for (var z = 0; z < 5; z++) { var lo = [0, .6, .7, .8, .9][z], hi = [.6, .7, .8, .9, 1.02][z]; ctx.fillStyle = ZC[z]; ctx.globalAlpha = .07; ctx.fillRect(0, H - hi * H, W, (hi - lo) * H); }
      ctx.globalAlpha = 1;
      // work/rest shading in the past 90 s
      var N = 360, dt = .25; // 90 s at 4 Hz
      for (var i = 0; i < hist.length; i++) { var x = W - (hist.length - i) * (W / N); if (hist[i][1]) { ctx.fillStyle = 'rgba(255,47,166,.06)'; ctx.fillRect(x, 0, W / N + 1, H); } }
      // trace
      ctx.beginPath(); ctx.lineWidth = 2; ctx.strokeStyle = PINK; ctx.lineJoin = 'round';
      for (var j = 0; j < hist.length; j++) { var xx = W - (hist.length - j) * (W / N), yy = H - (hist[j][0] / HRMAX) * H; j ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }
      ctx.stroke();
      if (hist.length) { var lp = hist[hist.length - 1]; ctx.fillStyle = PINK; ctx.beginPath(); ctx.arc(W - (W / N), H - (lp[0] / HRMAX) * H, 3.5, 0, 6.283); ctx.fill(); }
    }
    function paint() {
      var z = zone(hr), w = inWork() && !done;
      hrEl.textContent = Math.round(hr); zEl.textContent = 'Z' + (z + 1); zEl.style.color = ZC[z];
      znEl.textContent = Math.round(hr / HRMAX * 100) + '% max'; kEl.textContent = kcal < 10 ? kcal.toFixed(1) : Math.round(kcal);
      var tot = tz.reduce(function (a, b) { return a + b; }, 0) || 1;
      bars.forEach(function (b, i) { b.style.width = (tz[i] / tot * 100) + '%'; b.style.background = ZC[i]; });
      if (done) { phEl.textContent = T.done; tEl.textContent = fmt(0); phase.className = 'kft done'; go.textContent = T.again; go.setAttribute('aria-pressed', 'false'); }
      else { phEl.textContent = w ? T.work : T.rest; tEl.textContent = fmt(w ? WORK - (t % cyc()) : cyc() - (t % cyc())); setEl.textContent = setIdx() + 1; phase.className = 'kft ' + (w ? 'work' : 'rest'); go.textContent = running ? T.pause : T.start; go.setAttribute('aria-pressed', running ? 'true' : 'false'); }
      rpeEl.textContent = 'RPE ' + rng.value;
      draw();
    }
    function tick(now) {
      if (!running) return;
      var dt = Math.min(.5, (now - last) / 1000) || 0; last = now;
      // heart rate follows the target with inertia: rises faster than it recovers
      var tg = target(), tau = tg > hr ? 18 : 32;
      hr += (tg - hr) * (1 - Math.exp(-dt / tau)) + (Math.random() - .5) * 1.2;
      hr = Math.max(60, Math.min(HRMAX, hr));
      kcal += kcalPerMin(hr) * dt / 60; tz[zone(hr)] += dt;
      t += dt;
      hist.push([hr, inWork() ? 1 : 0]); if (hist.length > 360) hist.shift();
      if (t >= cyc() * SETS) { done = true; running = false; }
      paint(); if (running) raf = requestAnimationFrame(tick);
    }
    function start() { running = true; last = performance.now(); raf = requestAnimationFrame(tick); paint(); }
    function stop() { running = false; cancelAnimationFrame(raf); paint(); }
    go.addEventListener('click', function () {
      if (done) { done = false; t = 0; kcal = 0; hr = 72; tz = [0, 0, 0, 0, 0]; hist = []; start(); return; }
      running ? stop() : start();
    });
    rng.addEventListener('input', paint);
    document.addEventListener('visibilitychange', function () { if (document.hidden && running) stop(); });
    // seed the trace with a flat resting line so the canvas is not empty before start
    for (var s = 0; s < 120; s++) hist.push([72 + (Math.random() - .5), 0]);
    paint();
  })();

  /* ---------- mobile: demo toggles + dots nav ---------- */
  $$('.dtoggle').forEach(function (b) { b.addEventListener('click', function () { var d = b.closest('.demo'), open = d.classList.toggle('open'); b.setAttribute('aria-expanded', open); if (open) setTimeout(function () { d.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' }); }, 60); }); });
  var dots = $('.dots');
  if (dots) { var links = $$('a', dots);
    $$('.proj').forEach(function (s) { new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) links.forEach(function (a) { a.classList.toggle('on', a.getAttribute('data-d') === s.id); }); }); }, { threshold: .35 }).observe(s); });
    new IntersectionObserver(function (es) { es.forEach(function (e) { dots.classList.toggle('show', e.isIntersecting); }); }, { threshold: 0 }).observe($('#projects'));
    links.forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); var s = document.getElementById(a.getAttribute('data-d')); if (s) s.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); }); });
  }

  /* ---------- overlay ---------- */
  var ov = $('#ov'), cur = null, idx = 0, lastFocus = null;
  function openCase(id) {
    var p = P[id]; if (!p) return; cur = id; idx = 0; lastFocus = document.activeElement;
    ov.style.setProperty('--pc', COL[id]);
    $('#ovk').textContent = p.k; $('#ovt').textContent = p.tt; $('#ovd').textContent = p.ovd;
    var st = $('#ovst'); st.textContent = ''; p.stats.forEach(function (s) { var d = el('div'); d.appendChild(el('b', null, s[0])); d.appendChild(el('span', null, s[1])); st.appendChild(d); });
    var dc = $('#ovdec'); dc.textContent = ''; p.dec.forEach(function (s) { var d = el('div'); d.appendChild(el('h4', null, s[0])); d.appendChild(el('p', null, s[1])); dc.appendChild(d); });
    var th = $('#ovth'); th.textContent = ''; p.gallery.forEach(function (g, i) { var b = el('button'); b.type = 'button'; b.setAttribute('data-i', i); b.setAttribute('aria-label', (i + 1) + '/' + p.gallery.length); var im = el('img'); im.alt = ''; im.loading = 'lazy'; im.src = D.base + 'assets/' + g[0]; b.appendChild(im); th.appendChild(b); });
    show(0); ov.classList.add('on'); document.body.style.overflow = 'hidden'; $('#ovx').focus();
  }
  function show(i) { var p = P[cur]; idx = (i + p.gallery.length) % p.gallery.length; var im = $('#ovimg'); im.src = D.base + 'assets/' + p.gallery[idx][0]; im.alt = p.gallery[idx][1]; $('#ovcap').textContent = p.gallery[idx][1];
    $$('#ovth button').forEach(function (b, j) { b.classList.toggle('on', j === idx); }); }
  function closeCase() { if (!ov.classList.contains('on')) return; ov.classList.remove('on'); document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); }
  $$('[data-open]').forEach(function (b) { b.addEventListener('click', function () { openCase(b.getAttribute('data-open')); }); });
  $('#ovx').addEventListener('click', closeCase);
  ov.addEventListener('click', function (e) { if (e.target === ov) closeCase(); });
  $('#ovth').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) show(+b.getAttribute('data-i')); });
  $('#ovimg').addEventListener('click', function () { show(idx + 1); });
  var sx = 0, sy = 0;
  ov.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  ov.addEventListener('touchend', function (e) { var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) show(idx + (dx < 0 ? 1 : -1)); });
  if (location.hash && P[location.hash.slice(1)]) setTimeout(function () { openCase(location.hash.slice(1)); }, 600);

  /* ---------- CV overlay ---------- */
  var cvov = $('#cvov'), cvLast = null;
  function openCV() { if (!cvov) return; cvLast = document.activeElement; cvov.classList.add('on'); document.body.style.overflow = 'hidden'; cvov.scrollTop = 0; $('#cvx').focus(); }
  function closeCV() { if (!cvov || !cvov.classList.contains('on')) return; cvov.classList.remove('on'); document.body.style.overflow = ''; if (cvLast) cvLast.focus(); }
  $$('[data-cv]').forEach(function (b) { b.addEventListener('click', openCV); });
  if (cvov) { $('#cvx').addEventListener('click', closeCV); cvov.addEventListener('click', function (e) { if (e.target === cvov) closeCV(); }); }

  /* ---------- command palette ---------- */
  var items = UI.pal.slice(0, 1);
  Object.keys(P).forEach(function (id) { items.push([P[id].tt, id]); });
  items = items.concat(UI.pal.slice(1), [['GitHub ↗', 'https://github.com/Farkas404'], ['LinkedIn ↗', 'https://www.linkedin.com/in/constantino-c-2957731a2']]);
  var pal = $('#pal'), pq = $('#palq'), pl = $('#pall'), sel = 0, filtered = [];
  function render() {
    var q = pq.value.toLowerCase(); filtered = items.filter(function (it) { return it[0].toLowerCase().indexOf(q) > -1; });
    sel = Math.min(sel, Math.max(0, filtered.length - 1)); pl.textContent = '';
    if (!filtered.length) { var li0 = el('li'); li0.appendChild(el('span', null, UI.pal_none)); pl.appendChild(li0); return; }
    filtered.forEach(function (it, i) { var li = el('li', i === sel ? 'on' : ''); li.setAttribute('data-h', it[1]);
      if (COL[it[1]]) { var dot = el('i'); dot.style.background = COL[it[1]]; li.appendChild(dot); }
      li.appendChild(document.createTextNode(it[0]));
      li.appendChild(el('span', null, it[1].indexOf('http') === 0 ? UI.pal_ext : it[1].charAt(0) === '#' ? UI.pal_sec : UI.pal_case)); pl.appendChild(li); });
  }
  function go(h) { closePal(); if (!h) return;
    if (h.indexOf('http') === 0) { var a = el('a'); a.href = h; a.target = '_blank'; a.rel = 'noopener noreferrer'; document.body.appendChild(a); a.click(); a.remove(); }
    else if (h.charAt(0) === '#') { var s = $(h); if (s) s.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); }
    else { var sec = document.getElementById(h); if (sec) sec.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); setTimeout(function () { openCase(h); }, 500); } }
  function openPal() { pal.classList.add('on'); pq.value = ''; sel = 0; render(); setTimeout(function () { pq.focus(); }, 30); }
  function closePal() { pal.classList.remove('on'); }
  $('#palbtn').addEventListener('click', openPal);
  pal.addEventListener('click', function (e) { if (e.target === pal) closePal(); var li = e.target.closest('li[data-h]'); if (li) go(li.getAttribute('data-h')); });
  pq.addEventListener('input', function () { sel = 0; render(); });
  addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); pal.classList.contains('on') ? closePal() : openPal(); return; }
    if (e.key === 'Escape') { closePal(); closeCase(); closeCV(); return; }
    if (pal.classList.contains('on')) { var n = filtered.length; if (!n) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); sel = (sel + 1) % n; render(); } else if (e.key === 'ArrowUp') { e.preventDefault(); sel = (sel - 1 + n) % n; render(); } else if (e.key === 'Enter') go(filtered[sel][1]); return; }
    if (cvov && cvov.classList.contains('on') && e.key === 'Tab') { var cf = $$('button, [href], input, [tabindex]:not([tabindex="-1"])', cvov).filter(function (n) { return n.offsetParent !== null; }); if (cf.length) { var c0 = cf[0], c1 = cf[cf.length - 1]; if (e.shiftKey && document.activeElement === c0) { e.preventDefault(); c1.focus(); } else if (!e.shiftKey && document.activeElement === c1) { e.preventDefault(); c0.focus(); } } return; }
    if (ov.classList.contains('on')) { if (e.key === 'ArrowRight') show(idx + 1); if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'Tab') { var f = $$('button, [href], input, [tabindex]:not([tabindex="-1"])', ov).filter(function (n) { return n.offsetParent !== null; }); if (!f.length) return;
        var first = f[0], last = f[f.length - 1]; if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); } } }
  });

  /* ---------- hud clock ---------- */
  var hudt = $('#hudt');
  if (hudt) setInterval(function () { hudt.textContent = new Date().toLocaleTimeString('de-DE', { hour12: false }); }, 1000);

  /* ---------- copy mail ---------- */
  $('#copymail').addEventListener('click', function () {
    var t = $('#mailtxt').textContent, toast = $('#toast');
    function ok() { toast.classList.add('on'); setTimeout(function () { toast.classList.remove('on'); }, 1600); }
    function fallback() { var r = document.createRange(); r.selectNodeContents($('#mailtxt')); var s = getSelection(); s.removeAllRanges(); s.addRange(r); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(ok).catch(fallback); else fallback();
  });
})();
