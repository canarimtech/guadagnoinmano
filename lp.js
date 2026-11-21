if (window.gimFillAfterHero) window.gimFillAfterHero();
/* ?dev=1 mostra pendências escondidas */
if (/[?&]dev=1/.test(location.search)) document.documentElement.classList.add('dev');

/* Preço num lugar só: troque aqui quando o Vini fechar o valor. Vale para topo, oferta, CTA final e barra. */
var PREZZO = '24,90 €'; /* Boss 20/11 21:17, checkout relido. Sem dólar e sem riscado. Conferir de novo antes de publicar. */
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

/* Botão de compra (componente §1 da lp-designer): CTAs da LP vão ao checkout front da Hotmart.
   destino() junta a query da visita (gim_qs / location.search) à query do link (checkoutMode, off),
   sem duplicar '?', sem perder checkoutMode/off e sem sobrescrever esses dois.
   Bumps, se algum botão tiver data-checkout:
   Magazzino https://pay.hotmart.com/G108598102G?off=389xc3k7
   Listino   https://pay.hotmart.com/U108598110N?off=lvn3j11u
   Agenda    https://pay.hotmart.com/S108598116N?off=44f0ycjo */
var CHECKOUT_URL = 'https://pay.hotmart.com/T108598088V?checkoutMode=10';
/* GARANZIA (dias) e SUPPORTO (e-mail): 15 dias (Hotmart).
   Vazio = os trechos somem para o comprador; com ?dev=1 aparecem [GARANZIA] / [SUPPORTO]. */
var GARANZIA = '15';
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
    misturar(u); /* query da página + sessionStorage; não sobrescreve checkoutMode/off do link */
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
    var parte = img.closest('.st-parte');
    if (parte && !parte.classList.contains('on')) return; /* o story carrega o atual e o próximo */
    if (parte && parte.classList.contains('on')) {
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

/* Story do topo: troca no lugar (exceção, Vini 01:54/01:55), igual à Lucro na Mão.
   Come funziona / [data-trilho]: esteira contínua em loop (regra fixa, Vini 21:05 e 01:55).
   Sem setas; só bolinhas. Pausa no hover/toque. Respeita prefers-reduced-motion. */
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
    function recmedir(){ medida(); wrap(); marca(); }
    function tick(now){
      var dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (setW <= 0) medida();
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
    addEventListener('resize', recmedir);
    if ('IntersectionObserver' in window) new IntersectionObserver(function(e){ vis = e[0].isIntersecting; }).observe(t);
    if (typeof ResizeObserver === 'function') new ResizeObserver(function(){ recmedir(); }).observe(t);
    t.querySelectorAll('img').forEach(function(img){
      if (!img.complete) img.addEventListener('load', recmedir);
    });
    function cssPronto(link){
      if (!link) return true;
      if (link.media === 'print') return false;
      try { return !!(link.sheet && link.sheet.cssRules); } catch (e) { return true; }
    }
    (function esperarCss(){
      var links = [].filter.call(document.querySelectorAll('link[rel="stylesheet"]'), function(l){
        return (l.getAttribute('href') || '').indexOf('lp-below') !== -1;
      });
      var link = links[0];
      if (cssPronto(link)) { recmedir(); return; }
      if (link) link.addEventListener('load', function(){ recmedir(); }, { once: true });
      var n = 0, id = setInterval(function(){
        if (cssPronto(link) || ++n > 40) { clearInterval(id); recmedir(); }
      }, 50);
    })();
    addEventListener('load', recmedir);
    medida(); marca();
    if (!reduz) requestAnimationFrame(tick);
    return { ir: ir, medida: medida };
  }

  /* Story do hero: troca de tela no lugar, igual à Lucro na Mão
     (lucronamao.online: intervalo data-dur 3000 ms nas fotos;
      transition opacity .5s ease, transform .55s cubic-bezier(.2,.7,.2,1)).
     Um print inteiro por vez, loop infinito, só bolinhas. Sem esteira lateral. */
  (function(){
    var s = document.querySelector('[data-story]'); if (!s) return;
    var partes = [].slice.call(s.querySelectorAll('.st-parte'));
    var rot = s.querySelector('.st-rot'), pts = s.querySelector('[data-st-pontos]');
    var tela = s.querySelector('.st-btn') || s.querySelector('.st-palco');
    var n = partes.length; if (!n) return;
    if (pts) {
      for (var i = 0; i < n; i++) {
        var d = document.createElement('i'); d.setAttribute('aria-hidden','true');
        (function(j){ d.addEventListener('click', function(){ mostrar(j); }); })(i);
        pts.appendChild(d);
      }
    }
    function carregar(p, depois){
      if (!p) return;
      var img = p.querySelector('img[data-print]');
      if (!img) return;
      var src = img.getAttribute('data-print');
      function ready(){ if (depois) depois(); }
      if (!src) return ready();
      if (img.getAttribute('src') === src) {
        if (img.complete) ready();
        else img.addEventListener('load', ready, { once: true });
        return;
      }
      function go(){
        if (img.getAttribute('src') === src) return ready();
        img.addEventListener('load', ready, { once: true });
        img.src = src;
      }
      if (window.gimHeroReady) go();
      else document.addEventListener('gim-hero-ready', go, { once: true });
    }
    var atual = 0, gasto = 0, ultimo = 0, segurando = false, fora = false, escondida = false;
    if (reduz) {
      s.classList.add('parado');
      partes.forEach(function(p, k){ p.classList.toggle('on', k === 0); p.classList.remove('foi'); });
      carregar(partes[0]);
      if (rot) rot.textContent = partes[0].dataset.rot || '';
      if (pts) [].forEach.call(pts.querySelectorAll('i'), function(p, j){ p.classList.toggle('on', j === 0); });
      return;
    }
    function mostrar(i){
      var antes = atual;
      i = ((i % n) + n) % n;
      partes.forEach(function(p, k){
        p.classList.toggle('on', k === i);
        p.classList.toggle('foi', k === antes && k !== i);
      });
      atual = i; gasto = 0;
      if (rot) rot.textContent = partes[i].dataset.rot || '';
      if (pts) [].forEach.call(pts.querySelectorAll('i'), function(p, j){ p.classList.toggle('on', j === i); });
      carregar(partes[i], function(){ carregar(partes[(i + 1) % n]); });
    }
    function proximo(){ mostrar(atual + 1); }
    function anterior(){ mostrar(atual - 1); }
    function parado(){ return segurando || fora || escondida; }
    function quadro(t){
      requestAnimationFrame(quadro);
      var dt = ultimo ? Math.min(t - ultimo, 100) : 0; ultimo = t;
      if (parado()) return;
      gasto += dt;
      var fr = gasto / (+partes[atual].dataset.dur || 3200);
      if (fr >= 1) { proximo(); }
    }
    var timer = 0, apertou = false;
    if (tela) {
      tela.addEventListener('pointerdown', function(e){
        if (e.button > 0) return; apertou = true;
        timer = setTimeout(function(){ segurando = true; }, 200);
      });
      function soltar(avanca){
        clearTimeout(timer);
        if (!apertou) return; apertou = false;
        if (segurando) { segurando = false; }
        else if (avanca) proximo();
      }
      tela.addEventListener('pointerup', function(){ soltar(true); });
      tela.addEventListener('pointercancel', function(){ soltar(false); });
      tela.addEventListener('pointerleave', function(){ soltar(false); });
      tela.addEventListener('keydown', function(e){
        if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); proximo(); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); anterior(); }
      });
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function(es){ fora = !es[0].isIntersecting; }, { threshold: 0.2 }).observe(s);
    }
    document.addEventListener('visibilitychange', function(){ escondida = document.hidden; });
    mostrar(0);
    requestAnimationFrame(quadro);
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
