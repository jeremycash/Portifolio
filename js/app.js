/* ADCRUIZ portfolio: reads content/site.json + content/projects.json (edited via /admin) */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function path(p) { return (p || '').replace(/^\/+/, ''); }
  function digits(s) { return String(s || '').replace(/\D/g, ''); }
  function waLink(site, msg) {
    var d = digits(site.contact && site.contact.whatsapp);
    return d ? 'https://wa.me/' + d + '?text=' + encodeURIComponent(msg) : '#contact';
  }
  function mailLink(site, subject, body) {
    var m = site.contact && site.contact.email;
    return m ? 'mailto:' + m + '?subject=' + encodeURIComponent(subject) + (body ? '&body=' + encodeURIComponent(body) : '') : '#contact';
  }
  function video(url) {
    url = url || '';
    var m = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/);
    if (m) return { kind: 'youtube', embed: 'https://www.youtube-nocookie.com/embed/' + m[1] + '?autoplay=1&rel=0', thumb: 'https://i.ytimg.com/vi/' + m[1] + '/hqdefault.jpg' };
    m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (m) return { kind: 'vimeo', embed: 'https://player.vimeo.com/video/' + m[1] + '?autoplay=1', thumb: '' };
    return { kind: 'external', url: url, thumb: '' };
  }

  var state = { site: {}, items: [], cur: 0 };

  Promise.all([
    fetch('content/site.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }),
    fetch('content/projects.json', { cache: 'no-cache' }).then(function (r) { return r.json(); })
  ]).then(function (res) {
    state.site = res[0] || {};
    state.cats = (res[1] && res[1].categories) || [];
    boot();
  }).catch(function (e) {
    console.error(e);
    document.body.insertAdjacentHTML('afterbegin',
      '<p style="position:relative;z-index:9;padding:90px 24px;color:#ddd;max-width:640px;margin:auto">' +
      'Could not load the content files. If you opened index.html by double-clicking, run a local server instead ' +
      '(see SETUP.md), or view the live site.</p>');
  });

  function boot() {
    renderSite(state.site);
    renderProjects(state.cats, state.site);
    renderFolder(state.cats);
    initReveal();
    initNav();
    initFolder();
    initLightbox();
    initFx();
  }

  /* ---------- site content ---------- */
  function renderSite(s) {
    var c = s.contact || {};
    document.title = (s.brand || 'Portfolio') + ' | ' + ((s.roles || [])[1] || 'Designer');
    $('#brand').textContent = s.brand || '';
    $('#ownerName').textContent = (s.ownerName || '').toUpperCase();
    $('#year').textContent = s.year || new Date().getFullYear();
    $('#roles').textContent = (s.roles || []).join('  |  ');
    $('#heroEyebrow').textContent = s.heroEyebrow || (s.roles || []).join(' · ');
    $('#heroHeadline').textContent = s.heroHeadline || '';
    $('#heroSub').textContent = s.heroSub || '';

    var quoteMsg = s.quoteMessage || 'Hi, I saw your portfolio and I would like to discuss a project.';
    var wa = waLink(s, quoteMsg);
    ['heroQuote', 'projQuote', 'contactWA', 'waFloat'].forEach(function (id) { $('#' + id).href = wa; });
    $('#contactMail').href = mailLink(s, 'Project enquiry', 'Hi ' + (s.ownerName || '') + ',\n\nI would like to discuss a project.\n');

    /* stats */
    var total = 0; state.cats.forEach(function (k) { total += (k.items || []).length; });
    var stats = $('#stats');
    (s.stats || []).forEach(function (st) {
      var li = el('li');
      var b = el('b'); b.dataset.to = st.value === 'auto' ? total : st.value; b.dataset.suffix = st.suffix || '';
      b.textContent = '0' + (st.suffix || '');
      li.appendChild(b); li.appendChild(el('span', '', st.label || ''));
      stats.appendChild(li);
    });

    /* marquee */
    var words = (s.marquee && s.marquee.length ? s.marquee : (s.services || []).map(function (x) { return x.title; }));
    var track = $('#marquee');
    for (var i = 0; i < 2; i++) words.forEach(function (w) { track.appendChild(el('span', '', w)); });

    /* about */
    var at = $('#aboutText');
    String(s.aboutText || '').split(/\n\s*\n/).forEach(function (p) { if (p.trim()) at.appendChild(el('p', '', p.trim())); });
    $('#toolsNote').textContent = s.toolsNote || '';
    var C = 2 * Math.PI * 36;
    (s.tools || []).forEach(function (t, i) {
      var d = el('div', 'tool reveal'); d.style.setProperty('--d', (i * 0.08) + 's');
      var lvl = Math.max(0, Math.min(100, Number(t.level == null ? 85 : t.level)));
      d.innerHTML = '<div class="ring" style="--c:' + C.toFixed(1) + ';--o:' + (C * (1 - lvl / 100)).toFixed(1) + '">' +
        '<svg viewBox="0 0 84 84"><circle class="bg" cx="42" cy="42" r="36"/><circle class="fg" cx="42" cy="42" r="36"/></svg>' +
        '<b></b></div><span></span>';
      $('b', d).textContent = t.abbr || (t.name || '?').slice(0, 2);
      $('span', d).textContent = t.name || '';
      $('#tools').appendChild(d);
    });

    /* why me */
    (s.why || []).forEach(function (w, i) {
      var d = el('div', 'why-item reveal'); d.style.setProperty('--d', (i * 0.1) + 's');
      d.appendChild(el('h3', '', w.title)); d.appendChild(el('p', '', w.text));
      $('#whyList').appendChild(d);
    });

    /* services with per-service quote links */
    (s.services || []).forEach(function (v, i) {
      var d = el('article', 'svc reveal'); d.style.setProperty('--d', (i * 0.07) + 's');
      d.appendChild(el('span', 'n', '0' + (i + 1)));
      d.appendChild(el('h4', '', v.title)); d.appendChild(el('p', '', v.text));
      var a = el('a', '', 'Get a quote for this →'); a.target = '_blank'; a.rel = 'noopener';
      a.href = waLink(s, 'Hi, I would like a quote for: ' + v.title);
      d.appendChild(a); $('#services').appendChild(d);
    });

    /* process */
    (s.process || []).forEach(function (p, i) {
      var li = el('li', 'reveal'); li.style.setProperty('--d', (i * 0.1) + 's');
      li.appendChild(el('h4', '', p.title)); li.appendChild(el('p', '', p.text));
      $('#process').appendChild(li);
    });

    /* testimonials (hidden until you add some) */
    var tl = (s.testimonials || []).filter(function (t) { return t && t.quote; });
    if (tl.length) {
      $('#testiWrap').hidden = false;
      tl.forEach(function (t, i) {
        var f = el('blockquote', 't-card reveal'); f.style.setProperty('--d', (i * 0.1) + 's');
        f.appendChild(el('p', '', '“' + t.quote + '”'));
        var ft = el('footer'); var b = el('b', '', t.name || ''); ft.appendChild(b);
        if (t.role) ft.appendChild(document.createTextNode(' · ' + t.role));
        f.appendChild(ft); $('#testi').appendChild(f);
      });
    }

    /* contact */
    var ch = $('#contactHeadline'); ch.textContent = '';
    String(c.headline || "Let's Build\nSomething.").split('\n').forEach(function (line, i) {
      if (i) ch.appendChild(document.createElement('br')); ch.appendChild(document.createTextNode(line));
    });
    $('#contactText').textContent = c.text || '';
    var list = $('#contactList');
    var SVG_MAIL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>';
    var SVG_WA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 12a8 8 0 1 1-3.5-6.600L20 4l-1 4a8 8 0 0 1 1 4Z"/><path d="M9 9c0 3 3 6 6 6l1-2-2-1-1 1c-1-.5-2-1.500-2.500-2.500l1-1-1-2Z" fill="currentColor"/></svg>';
    var SVG_IG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.500" cy="6.500" r="1" fill="currentColor"/></svg>';
    function row(icon, text, href) {
      var li = el('li'); var a = el('a'); a.href = href; if (/^http/.test(href)) { a.target = '_blank'; a.rel = 'noopener'; }
      var ic = el('span', 'ic'); ic.innerHTML = icon; a.appendChild(ic); a.appendChild(el('span', '', text)); li.appendChild(a); list.appendChild(li);
    }
    if (c.email) row(SVG_MAIL, c.email, 'mailto:' + c.email);
    if (c.whatsapp) row(SVG_WA, c.whatsapp, waLink(s, quoteMsg));
    if (c.instagram) row(SVG_IG, c.instagram.replace(/^@/, ''), 'https://instagram.com/' + c.instagram.replace(/^@/, ''));
    if (c.behance) row('Bē', c.behance, /^http/.test(c.behance) ? c.behance : 'https://' + c.behance);
    var pr = $('#portrait'); pr.src = path(s.portrait) || 'images/uploads/portrait.svg';
    $('#footText').textContent = s.footer || ('© ' + new Date().getFullYear() + ' ' + (s.brand || ''));
  }

  /* ---------- projects ---------- */
  function renderProjects(cats, s) {
    var chips = $('#chips'), host = $('#categories');
    function mkChip(label, key, on) {
      var b = el('button', 'chip' + (on ? ' on' : ''), label); b.type = 'button'; b.dataset.k = key; b.setAttribute('role', 'tab');
      chips.appendChild(b);
    }
    mkChip('All', 'all', true);
    cats.forEach(function (cat, ci) {
      mkChip(cat.title, String(ci), false);
      var sec = el('section', 'cat reveal'); sec.dataset.k = String(ci);
      sec.appendChild(el('h3', '', cat.title));
      var frame = el('div', 'cat-frame'); var grid = el('div', 'grid ' + ({ square: 'sq', landscape: 'land' }[cat.aspect] || 'por'));
      if (cat.fit === 'contain') grid.style.setProperty('--fit', 'contain');
      (cat.items || []).forEach(function (it) {
        var idx = state.items.length;
        var isVid = it.type === 'video' || (!it.image && it.video);
        var v = isVid ? video(it.video) : null;
        var thumb = path(it.image) || (v && v.thumb) || '';
        state.items.push({ vid: isVid, v: v, src: path(it.image), cap: it.caption || '', cat: cat.title, thumb: thumb });
        var t = el('button', 'tile' + (isVid && !thumb ? ' vid-noimg' : '')); t.type = 'button'; t.dataset.i = idx;
        t.setAttribute('aria-label', (it.caption || cat.title) + (isVid ? ' (video)' : ''));
        if (thumb) { var im = el('img'); im.loading = 'lazy'; im.decoding = 'async'; im.alt = it.caption || cat.title; im.src = thumb; t.appendChild(im); }
        if (isVid) { var pl = el('span', 'play'); pl.innerHTML = '<i>▶</i>'; t.appendChild(pl); }
        if (it.caption) t.appendChild(el('span', 'cap', it.caption));
        grid.appendChild(t);
      });
      frame.appendChild(grid); sec.appendChild(frame);
      if (cat.tagValue) {
        var meta = el('div', 'cat-meta'); var w = el('div');
        w.appendChild(el('small', '', cat.tagLabel || 'Client')); w.appendChild(el('span', '', cat.tagValue));
        meta.appendChild(w); sec.appendChild(meta);
      }
      host.appendChild(sec);
    });
    chips.addEventListener('click', function (e) {
      var b = e.target.closest('.chip'); if (!b) return;
      $$('.chip', chips).forEach(function (c) { c.classList.toggle('on', c === b); });
      $$('.cat', host).forEach(function (c) {
        var show = b.dataset.k === 'all' || c.dataset.k === b.dataset.k;
        c.hidden = !show; if (show) requestAnimationFrame(function () { c.classList.add('in'); });
      });
    });
  }

  /* ---------- folder ---------- */
  function renderFolder(cats) {
    var host = $('#folderCards'), n = 0, rots = [-6, 0, 6];
    for (var i = 0; i < cats.length && n < 3; i++) {
      var first = (cats[i].items || []).filter(function (x) { return x.image; })[0];
      if (!first) continue;
      var d = el('div', 'fc'); d.style.setProperty('--r', rots[n] + 'deg');
      var im = el('img'); im.src = path(first.image); im.alt = ''; im.decoding = 'async'; d.appendChild(im);
      host.appendChild(d); n++;
    }
    $$('.folder-title span').forEach(function (s, i) { s.style.setProperty('--i', i); });
  }
  function initFolder() {
    var f = $('#folder'), stage = $('#folderStage');
    function open(v) { f.classList.toggle('open', v); }
    setTimeout(function () { open(true); }, 1500);
    setTimeout(function () { if (!f.matches(':hover')) open(false); }, 4600);
    f.addEventListener('click', function () { open(!f.classList.contains('open')); });
    f.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(!f.classList.contains('open')); } });
    if (fine && !reduce) {
      f.addEventListener('mouseenter', function () { open(true); });
      stage.addEventListener('mouseleave', function () { f.style.setProperty('--rx', '0deg'); f.style.setProperty('--ry', '0deg'); open(false); });
      stage.addEventListener('mousemove', function (e) {
        var r = stage.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        f.style.setProperty('--ry', (x * 14).toFixed(2) + 'deg');
        f.style.setProperty('--rx', (-y * 10).toFixed(2) + 'deg');
        f.style.setProperty('--gx', (x * 100 + 50).toFixed(0) + '%');
      });
    }
  }

  /* ---------- reveal, counters, rings ---------- */
  function initReveal() {
    var sw = $('.swirl');
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) {
        if (!e.isIntersecting) return;
        var t = e.target; t.classList.add('in'); io.unobserve(t);
        if (t.id === 'stats' || t.classList.contains('stats')) count(t);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    $$('.reveal').forEach(function (n, i) {
      if (!n.style.getPropertyValue('--d') && n.closest('.hero-copy')) n.style.setProperty('--d', (i * 0.08) + 's');
      io.observe(n);
    });
    if (sw) io.observe(sw);
  }
  function count(root) {
    $$('b[data-to]', root).forEach(function (b) {
      var to = Number(b.dataset.to) || 0, suf = b.dataset.suffix || '';
      if (reduce) { b.textContent = to + suf; return; }
      var t0 = performance.now(), dur = 1400;
      (function tick(t) {
        var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        b.textContent = Math.round(to * e) + suf;
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    });
  }

  /* ---------- nav + scroll progress ---------- */
  function initNav() {
    var links = $$('.nav a');
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) {
        if (e.isIntersecting) links.forEach(function (l) { l.classList.toggle('active', l.dataset.s === e.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['home', 'about', 'why', 'projects', 'contact'].forEach(function (id) { var n = document.getElementById(id); if (n) io.observe(n); });
    var bar = $('.progress span');
    window.addEventListener('scroll', function () {
      var h = document.documentElement; var p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
      bar.style.width = (p * 100).toFixed(1) + '%';
    }, { passive: true });
  }

  /* ---------- cursor glow + magnetic buttons ---------- */
  function initFx() {
    if (!fine || reduce) return;
    var sp = $('.spotlight');
    window.addEventListener('pointermove', function (e) {
      sp.style.setProperty('--mx', e.clientX + 'px'); sp.style.setProperty('--my', e.clientY + 'px');
    }, { passive: true });
    $$('.magnetic').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * .18).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * .25).toFixed(1) + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  }

  /* ---------- lightbox (images + YouTube/Vimeo embeds) ---------- */
  function initLightbox() {
    var lb = $('#lightbox'), stage = $('#lbStage'), cap = $('#lbCap'), q = $('#lbQuote');
    var lastFocus = null, sx = 0;
    function show(i) {
      var n = state.items.length; if (!n) return;
      state.cur = (i + n) % n; var it = state.items[state.cur];
      if (it.vid && it.v.kind === 'external') { window.open(it.v.url, '_blank', 'noopener'); return; }
      stage.innerHTML = '';
      if (it.vid) {
        var f = document.createElement('iframe'); f.src = it.v.embed; f.allow = 'autoplay; fullscreen; picture-in-picture'; f.allowFullscreen = true; f.title = it.cap || 'Video';
        stage.appendChild(f);
      } else {
        var im = document.createElement('img'); im.src = it.src || it.thumb; im.alt = it.cap || it.cat; stage.appendChild(im);
      }
      cap.textContent = (it.cat ? it.cat + (it.cap ? ' — ' : '') : '') + it.cap;
      q.href = waLink(state.site, 'Hi, I saw your ' + it.cat + ' work' + (it.cap ? ' (' + it.cap + ')' : '') + ' and I would like something like this.');
    }
    function open(i) {
      lastFocus = document.activeElement; show(i);
      var it = state.items[state.cur]; if (it && it.vid && it.v.kind === 'external') return;
      lb.hidden = false; document.body.style.overflow = 'hidden'; $('.lb-close', lb).focus();
    }
    function close() { lb.hidden = true; stage.innerHTML = ''; document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); }
    document.addEventListener('click', function (e) {
      var t = e.target.closest('.tile'); if (t) open(Number(t.dataset.i));
    });
    $('.lb-close', lb).addEventListener('click', close);
    $('.lb-prev', lb).addEventListener('click', function () { show(state.cur - 1); });
    $('.lb-next', lb).addEventListener('click', function () { show(state.cur + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target === stage) close(); });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(state.cur - 1);
      if (e.key === 'ArrowRight') show(state.cur + 1);
    });
    lb.addEventListener('touchstart', function (e) { sx = e.changedTouches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) show(state.cur + (dx < 0 ? 1 : -1));
    }, { passive: true });
  }
})();
