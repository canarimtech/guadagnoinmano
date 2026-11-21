if (window.gimFillAfterHero) window.gimFillAfterHero();
/* ?dev=1 mostra pendências escondidas */
if (/[?&]dev=1/.test(location.search)) document.documentElement.classList.add('dev');

/* Preço num lugar só: troque aqui quando o Vini fechar o valor (câmbio Cakto). Vale para topo, oferta, CTA final e barra. */
var PREZZO = '24,90 €'; /* Cakto IT (Boss 20/11 21:17, checkout relido). Sem dólar e sem riscado. Conferir de novo antes de publicar. */
var PREZZO_MAGAZZINO = '9,90 €';
var PREZZO_LISTINO = '14,90 €';
  var PREZZO_AGENDA = '9,90 €';
(function(){
  var dev = document.documentElement.classList.contains('dev'), v = PREZZO || (dev ? '[PREZZO]' : '');
  document.querySelectorAll('[data-prezzo]').forEach(function(e){ e.textContent = v; });
  if (!v) document.querySelectorAll('[data-riga-prezzo]').forEach(function(e){ e.hidden = true; });
  var bumps = { magazzino: PREZZO_MAGAZZINO, listino: PREZZO_LISTINO, agenda: PREZZO_AGENDA };
  document.querySelectorAll('[data-prezzo-bump]').forEach(function(e){
    var k = e.getAttribute('data-prezzo-bump'), val = bumps[k] || (dev ? '['+k+']' : '');
    e.textContent = val; if (!val) e.hidden = true;
  });
})();

/* Botão de compra (componente §1 da lp-designer): repassa UTMs e ids de clique. PENDENTE CHECKOUT: link Cakto. Repassa a query inteira da página */
var CHECKOUT_URL = 'https://pay.cakto.com.br/stud2no'; /* Cakto stud2no, só localhost até o OK do Vini */
/* GARANZIA (dias) e SUPPORTO (e-mail): confirmado pelo Vini 20/11 20:47 (14 dias).
   Vazio = os trechos somem para o comprador; com ?dev=1 aparecem [GARANZIA] / [SUPPORTO]. */
var GARANZIA = '14';
var SUPPORTO = 'canarimtech@gmail.com';
(function(){
  var dev = document.documentElement.classList.contains('dev');
  var g = GARANZIA ? GARANZIA + ' giorni' : (dev ? '[GARANZIA]' : ''), m = SUPPORTO || (dev ? '[SUPPORTO]' : '');
  document.querySelectorAll('[data-g]').forEach(function(e){ e.textContent = g; });
  document.querySelectorAll('a[data-mail]').forEach(function(a){ a.textContent = m; if (SUPPORTO) a.href = 'mailto:' + SUPPORTO; });
  if (!g) document.querySelectorAll('[data-riga-garanzia]').forEach(function(e){ e.hidden = true; });
  if (!m) document.querySelectorAll('[data-riga-mail]').forEach(function(e){ e.hidden = true; });
})();
(function(){
  var INTERNI = /^(dev|prints)$/i; /* parâmetros internos da LP: nunca vão para o checkout */
  var QS_KEY = 'gim_qs';
  function guardar(){
    var q = new URLSearchParams(location.search), keep = new URLSearchParams();
    q.forEach(function(v, k){ if (!INTERNI.test(k)) keep.append(k, v); });
    if (keep.toString()) {
      try { sessionStorage.setItem(QS_KEY, keep.toString()); } catch (e) {}
    }
  }
  function misturar(alvo){
    var q = new URLSearchParams(location.search), st = '';
    try { st = sessionStorage.getItem(QS_KEY) || ''; } catch (e) {}
    new URLSearchParams(st).forEach(function(v, k){ if (!INTERNI.test(k) && !q.has(k)) q.append(k, v); });
    q.forEach(function(v, k){ if (!INTERNI.test(k) && !alvo.searchParams.has(k)) alvo.searchParams.append(k, v); });
  }
  guardar();
  function destino(base){
    var u = new URL(base, location.href);
    misturar(u); /* query da página + sessionStorage (Cakto descarta UTM/fbclid no redirect) */
    return u.toString();
  }
  document.querySelectorAll('a[data-cta]').forEach(function(a){
    var base = a.getAttribute('data-checkout') || CHECKOUT_URL;
    if (!base) return;
    a.href = destino(base); a.rel = 'noopener';
  });
})();


/* Trava dos prints do app: liberados pelo Boss em 20/11 21:09 (SHA do box = SHA do PC, nenhum prefixo antigo com português).
   8 webp em italiano, bump-listino refeito (SHA 5750c7cf, sem «finito in magazzino»). */
var PRINTS_OK = true;
(function(){
  var q = new URLSearchParams(location.search), ver = PRINTS_OK || (q.get('dev') === '1' && q.get('prints') === '1');
  var prints = [].slice.call(document.querySelectorAll('img[data-print]'));
  function assignPrint(i){
    var src = i.getAttribute('data-print');
    if (!src || i.getAttribute('src') === src) return;
    i.src = src;
  }
  function makeIo(root, margin){
    if (!('IntersectionObserver' in window)) return null;
    return new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if (!en.isIntersecting) return;
        assignPrint(en.target);
        en.target._gimIo && en.target._gimIo.unobserve(en.target);
      });
    }, { root: root || null, rootMargin: margin || '120px 0px' });
  }
  var ioPrints = makeIo(null, '120px 0px');
  var ioStory = {};
  window.gimObservePrint = function(img){
    if (!img || !ver) return;
    img.decoding = 'async';
    var first = img.closest('.st-parte.on');
    if (first && !first.previousElementSibling) {
      if (window.gimHeroReady) assignPrint(img);
      else document.addEventListener('gim-hero-ready', function(){ assignPrint(img); }, { once: true });
      return;
    }
    var palco = img.closest('.st-palco');
    if (palco) {
      if (!ioStory.current || ioStory.root !== palco) { ioStory.current = makeIo(palco, '0px 40px'); ioStory.root = palco; }
      img._gimIo = ioStory.current;
      if (ioStory.current) { ioStory.current.observe(img); return; }
    }
    if (ioPrints) { img._gimIo = ioPrints; ioPrints.observe(img); }
    else { img.loading = 'lazy'; assignPrint(img); }
  };
  prints.forEach(function(i){
    if (!ver) { var t = i.closest('.tela'); if (t) t.classList.add('vuoto'); i.style.display = 'none'; return; }
    window.gimObservePrint(i);
  });
})();

/* Slots de print: se o arquivo do Construtor ainda não existe, mostra o slot (nunca UI redesenhada) */
document.querySelectorAll('.tela').forEach(function(t){
  var img = t.querySelector('img'); if (!img) return;
  function vazio(){ t.classList.add('vuoto'); img.style.display = 'none'; }
  img.addEventListener('error', vazio);
  if (img.complete && img.getAttribute('src') && img.naturalWidth === 0) vazio();
});

/* Story e trilho: esteira contínua em loop (regra fixa, Vini 21:05).
   Anda sozinha, devagar, sem pulo. Sem setas; só bolinhas. Pausa no hover/toque.
   Respeita prefers-reduced-motion. Swipe manual continua. */
(function(){
  var reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SPEED = 42; /* px/s, esteira lenta */

  function esteiraScroll(t, pts, nOrig){
    var paused = reduz, hover = false, drag = false, vis = true, setW = 0, last = performance.now();
    function medida(){ setW = (t.children[nOrig] ? t.children[nOrig].offsetLeft - t.children[0].offsetLeft : 0); }
    function wrap(){
      if (setW <= 0) return;
      if (t.scrollLeft >= setW - 0.5) t.scrollLeft -= setW;
      else if (t.scrollLeft < 0) t.scrollLeft += setW;
    }
    function passo(){ return setW > 0 ? setW / nOrig : 1; }
    function indice(){ var p = passo(); return ((Math.round(t.scrollLeft / p) % nOrig) + nOrig) % nOrig; }
    function marca(){ var k = indice(); [].forEach.call(pts.querySelectorAll('i'), function(p, j){ p.classList.toggle('on', j === k); }); }
    function ir(j){
      medida();
      var p = passo(), cur = t.scrollLeft, base = cur >= setW ? setW : 0;
      t.scrollTo({ left: base + j * p, behavior: reduz ? 'auto' : 'smooth' });
    }
    function tick(now){
      var dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (!paused && !hover && !drag && vis && setW > 0) { t.scrollLeft += SPEED * dt; wrap(); }
      marca();
      if (!reduz) requestAnimationFrame(tick);
    }
    t.addEventListener('pointerenter', function(){ hover = true; });
    t.addEventListener('pointerleave', function(){ hover = false; });
    t.addEventListener('pointerdown', function(){ drag = true; });
    addEventListener('pointerup', function(){ if (!drag) return; drag = false; wrap(); });
    t.addEventListener('scroll', function(){ wrap(); marca(); }, { passive: true });
    t.addEventListener('keydown', function(e){
      if (e.key === 'ArrowRight') { e.preventDefault(); ir((indice() + 1) % nOrig); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); ir((indice() + nOrig - 1) % nOrig); }
    });
    addEventListener('resize', function(){ medida(); wrap(); marca(); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function(e){ vis = e[0].isIntersecting; }).observe(t);
    medida(); marca();
    if (!reduz) requestAnimationFrame(tick);
    return { ir: ir, medida: medida };
  }

  /* Story do hero: filmstrip contínuo dentro do mockup, bolinhas fora */
  (function(){
    var s = document.querySelector('[data-story]'); if (!s) return;
    var trilha = s.querySelector('.st-trilha'), rot = s.querySelector('.st-rot'), pts = s.querySelector('[data-st-pontos]');
    if (!trilha) return;
    var partes = [].slice.call(trilha.querySelectorAll('.st-parte'));
    var n = partes.length; if (!n) return;
    partes.forEach(function(p){ trilha.appendChild(p.cloneNode(true)); });
    trilha.querySelectorAll('img[data-print]').forEach(function(img){
      if (window.gimObservePrint) window.gimObservePrint(img);
    });
    if (pts) {
      for (var i = 0; i < n; i++) { var d = document.createElement('i'); d.setAttribute('aria-hidden','true'); pts.appendChild(d); }
    }
    var pos = 0, setW = 0, hover = false, drag = false, vis = true, last = performance.now(), x0 = 0, p0 = 0;
    function w(){ return s.querySelector('.st-palco').clientWidth || 0; }
    function medida(){ setW = w() * n; }
    function wrap(){ if (setW <= 0) return; if (pos >= setW) pos -= setW; if (pos < 0) pos += setW; }
    function aplica(){ trilha.style.transform = 'translateX(' + (-pos) + 'px)'; }
    function indice(){ var L = w(); return L ? ((Math.round(pos / L) % n) + n) % n : 0; }
    function marca(){
      var k = indice();
      if (rot) rot.textContent = partes[k].dataset.rot || '';
      if (pts) [].forEach.call(pts.querySelectorAll('i'), function(p, j){ p.classList.toggle('on', j === k); });
    }
    function ir(j){ medida(); pos = j * w(); wrap(); aplica(); marca(); }
    if (pts) [].forEach.call(pts.querySelectorAll('i'), function(p, j){ p.addEventListener('click', function(){ ir(j); }); });
    var btn = s.querySelector('.st-btn');
    function alvo(){ return btn || s; }
    alvo().addEventListener('pointerdown', function(e){
      drag = true; hover = true; x0 = e.clientX; p0 = pos;
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
    });
    alvo().addEventListener('pointermove', function(e){
      if (!drag) return;
      pos = p0 - (e.clientX - x0); wrap(); aplica(); marca();
    });
    function solta(){ if (!drag) return; drag = false; hover = false; wrap(); aplica(); }
    alvo().addEventListener('pointerup', solta);
    alvo().addEventListener('pointercancel', solta);
    s.addEventListener('pointerenter', function(){ hover = true; });
    s.addEventListener('pointerleave', function(){ if (!drag) hover = false; });
    if ('IntersectionObserver' in window) new IntersectionObserver(function(e){ vis = e[0].isIntersecting; }).observe(s);
    addEventListener('resize', function(){ var k = indice(); medida(); ir(k); });
    function tick(now){
      var dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (!reduz && !hover && !drag && vis && setW > 0) { pos += SPEED * dt; wrap(); aplica(); marca(); }
      if (!reduz) requestAnimationFrame(tick);
    }
    medida(); aplica(); marca();
    if (reduz) s.classList.add('parado');
    else requestAnimationFrame(tick);
  })();

  /* Trilho das funcionalidades: clones + scroll contínuo, só bolinhas */
  document.querySelectorAll('[data-trilho]').forEach(function(t){
    var pts = t.nextElementSibling, cards = [].slice.call(t.children);
    if (!pts || !pts.hasAttribute('data-pontos') || !cards.length) return;
    var n = cards.length;
    var api;
    for (var i = 0; i < n; i++) {
      var d = document.createElement('i'); d.setAttribute('aria-hidden','true');
      (function(j){ d.addEventListener('click', function(){ api.ir(j); }); })(i);
      pts.appendChild(d);
    }
    cards.forEach(function(c){ t.appendChild(c.cloneNode(true)); });
    t.querySelectorAll('img[data-print]').forEach(function(img){
      if (window.gimObservePrint) window.gimObservePrint(img);
    });
    api = esteiraScroll(t, pts, n);
    var x0 = 0, s0 = 0, mov = false;
    t.addEventListener('pointerdown', function(e){
      if (e.pointerType !== 'mouse') return;
      x0 = e.clientX; s0 = t.scrollLeft; mov = true;
    });
    addEventListener('pointermove', function(e){ if (mov) t.scrollLeft = s0 - (e.clientX - x0); });
    addEventListener('pointerup', function(){ mov = false; });
  });
})();

/* entrada suave */
(function(){
  var els = document.querySelectorAll('.rivela');
  if (!('IntersectionObserver' in window)) { els.forEach(function(e){ e.classList.add('visto'); }); return; }
  var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting) { e.target.classList.add('visto'); io.unobserve(e.target); } }); }, {rootMargin:'0px 0px -8% 0px'});
  els.forEach(function(e){ io.observe(e); });
})();

/* barra fixa: aparece depois do hero, some sobre a oferta */
(function(){
  var b = document.getElementById('barra'), hero = document.querySelector('.hero'), of = document.getElementById('comprar'), fim = document.querySelector('.fine');
  var depoisHero = false, sobreOferta = false, sobreFim = false;
  function upd(){ b.classList.toggle('on', depoisHero && !sobreOferta && !sobreFim); }
  if (!('IntersectionObserver' in window)) return;
  new IntersectionObserver(function(e){ depoisHero = !e[0].isIntersecting; upd(); }).observe(hero);
  new IntersectionObserver(function(e){ sobreOferta = e[0].isIntersecting; upd(); }).observe(of);
  new IntersectionObserver(function(e){ sobreFim = e[0].isIntersecting; upd(); }).observe(fim);
})();
