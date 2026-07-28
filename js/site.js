/* King of Floors - site behaviour. Vanilla JS, no dependencies beyond Lucide icons. */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function icons() { if (window.lucide) window.lucide.createIcons(); }

  function preventOrphans() {
    var nbsp = String.fromCharCode(160);
    var selector = [
      'h1', 'h2', 'h3', 'h4',
      'p', '.lead', '.btn', '.badge', '.eyebrow',
      '.svc__more', '.tile__title', '.tile__meta',
      '.acc__btn', '.chip', '.form-done h3', '.dform-done h3'
    ].join(',');

    document.querySelectorAll(selector).forEach(function (el) {
      if (el.closest('input,select,textarea,option,script,style')) return;

      var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      var node, last = null;
      while ((node = walker.nextNode())) {
        if (/\S/.test(node.nodeValue)) last = node;
      }
      if (!last || last.nodeValue.indexOf(nbsp) !== -1) return;

      last.nodeValue = last.nodeValue.replace(/(\S+)\s+(\S+)(\s*)$/, '$1' + nbsp + '$2$3');
    });
  }

  /* ---------- scroll reveals (staggered) ---------- */
  function reveals() {
    document.querySelectorAll('[data-reveal]').forEach(function (g) {
      Array.prototype.forEach.call(g.children, function (c) { c.classList.add('fade'); });
    });

    var items = [].slice.call(document.querySelectorAll('.fade'));
    if (reduce || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('in'); });
      return;
    }

    items.forEach(function (el) {
      var sibs = [].slice.call(el.parentElement.children).filter(function (n) {
        return n.classList.contains('fade');
      });
      el.style.transitionDelay = (Math.min(sibs.indexOf(el), 7) * 70) + 'ms';
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- condensed sticky header (homepage only) ---------- */
  function stickyHeader() {
    var bar = document.getElementById('stickyHeader');
    if (!bar) return;
    function onScroll() { bar.classList.toggle('is-on', window.scrollY > 520); }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function servicesDropdown() {
    var menus = [].slice.call(document.querySelectorAll('[data-services-menu]'));
    if (!menus.length) return;

    function closeAll(except) {
      menus.forEach(function (menu) {
        if (menu === except) return;
        menu.classList.remove('is-open');
        var trigger = menu.querySelector('.nav__trigger');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
      });
    }

    menus.forEach(function (menu) {
      var trigger = menu.querySelector('.nav__trigger');
      if (!trigger) return;

      trigger.addEventListener('click', function (event) {
        event.preventDefault();
        var open = menu.classList.toggle('is-open');
        trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
        closeAll(menu);
      });

      menu.addEventListener('keydown', function (event) {
        if (event.key !== 'Escape') return;
        menu.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
        trigger.focus();
      });
    });

    document.addEventListener('click', function (event) {
      if (event.target.closest('[data-services-menu]')) return;
      closeAll();
    });
  }

  function mobileMenu() {
    var headers = [].slice.call(document.querySelectorAll('.hdr-float__pill, .hdr-page__inner, .hdr-stick__inner'));
    if (!headers.length) return;

    var serviceLinks = [
      ['LVP flooring', '#services'],
      ['Laminate flooring', '#services'],
      ['Engineered wood', '#services'],
      ['Hardwood nail-down', '#services'],
      ['Sanding & refinishing', '#services'],
      ['Glue-down & floating', '#services'],
      ['Staircase remodeling', '#services'],
      ['Baseboard installation', '#services'],
      ['3D acoustic panels', '#services'],
      ['Basement flooring', '#services']
    ];
    var navLinks = [
      ['Portfolio', '#portfolio'],
      ['About', '#about'],
      ['Reviews', '#reviews'],
      ['FAQ', '#faq']
    ];

    function closeAll(except) {
      document.querySelectorAll('[data-mobile-menu]').forEach(function (panel) {
        var wrap = panel.closest('.mobile-nav');
        if (wrap === except) return;
        wrap.classList.remove('is-open');
        panel.hidden = true;
        var btn = wrap.querySelector('.mobile-nav__toggle');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
    }

    headers.forEach(function (header, index) {
      if (header.querySelector('.mobile-nav')) return;

      var wrap = document.createElement('div');
      wrap.className = 'mobile-nav';

      var button = document.createElement('button');
      button.className = 'mobile-nav__toggle';
      button.type = 'button';
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-controls', 'mobile-menu-' + index);
      button.setAttribute('aria-label', 'Open menu');
      button.innerHTML = '<i data-lucide="menu"></i>';

      var panel = document.createElement('div');
      panel.className = 'mobile-nav__panel';
      panel.id = 'mobile-menu-' + index;
      panel.setAttribute('data-mobile-menu', '');
      panel.hidden = true;

      var main = navLinks.map(function (link) {
        return '<a href="' + link[1] + '">' + link[0] + '</a>';
      }).join('');
      var services = serviceLinks.map(function (link) {
        return '<a href="' + link[1] + '">' + link[0] + '</a>';
      }).join('');

      panel.innerHTML =
        '<div class="mobile-nav__section"><span>Main menu</span>' + main + '</div>' +
        '<div class="mobile-nav__section"><span>Services</span>' + services + '</div>' +
        '<a class="btn btn--primary mobile-nav__cta" href="#estimate">Free estimate</a>';

      wrap.appendChild(button);
      wrap.appendChild(panel);
      header.appendChild(wrap);

      button.addEventListener('click', function (event) {
        event.preventDefault();
        var open = !wrap.classList.contains('is-open');
        closeAll(wrap);
        wrap.classList.toggle('is-open', open);
        panel.hidden = !open;
        button.setAttribute('aria-expanded', open ? 'true' : 'false');
      });

      panel.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          wrap.classList.remove('is-open');
          panel.hidden = true;
          button.setAttribute('aria-expanded', 'false');
        });
      });

      wrap.addEventListener('keydown', function (event) {
        if (event.key !== 'Escape') return;
        wrap.classList.remove('is-open');
        panel.hidden = true;
        button.setAttribute('aria-expanded', 'false');
        button.focus();
      });
    });

    document.addEventListener('click', function (event) {
      if (event.target.closest('.mobile-nav')) return;
      closeAll();
    });

    icons();
  }

  /* ---------- FAQ accordion (one open at a time) ---------- */
  function accordion() {
    document.querySelectorAll('.acc__btn').forEach(function (btn) {
      var item = btn.closest('.acc');
      var panel = item.querySelector('.acc__panel');
      btn.setAttribute('aria-expanded', item.classList.contains('is-open') ? 'true' : 'false');
      if (panel) panel.setAttribute('aria-hidden', item.classList.contains('is-open') ? 'false' : 'true');

      btn.addEventListener('click', function () {
        var open = item.classList.contains('is-open');
        item.parentElement.querySelectorAll('.acc').forEach(function (o) {
          o.classList.remove('is-open');
          var b = o.querySelector('.acc__btn'), p = o.querySelector('.acc__panel');
          if (b) b.setAttribute('aria-expanded', 'false');
          if (p) p.setAttribute('aria-hidden', 'true');
        });
        if (!open) {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
          if (panel) panel.setAttribute('aria-hidden', 'false');
        }
      });
    });
  }

  /* ---------- estimate form ---------- */
  function forms() {
    document.querySelectorAll('[data-estimate-form]').forEach(function (form) {
      // clear the error state as soon as the field is corrected
      form.querySelectorAll('.field, .dfield').forEach(function (f) {
        f.addEventListener('input', function () { f.classList.remove('has-error'); });
        f.addEventListener('change', function () { f.classList.remove('has-error'); });
      });

      form.addEventListener('submit', function (e) {
        e.preventDefault();

        var bad = null;
        form.querySelectorAll('[required]').forEach(function (f) {
          var empty = !f.value.trim();
          f.classList.toggle('has-error', empty);
          if (empty && !bad) bad = f;
        });

        if (bad) { bad.focus(); return; }

        var done = form.parentElement.querySelector('.form-done, .dform-done');
        if (done) { form.hidden = true; done.hidden = false; icons(); }
        var foot = form.parentElement.querySelector('.est__foot');
        if (foot) foot.hidden = true;
      });
    });
  }

  /* ---------- LVP colour picker (service page) ---------- */
  function swatchPicker() {
    var group = document.querySelector('[data-swatches]');
    if (!group) return;
    var preview = document.querySelector('[data-swatch-preview]');
    var name = document.querySelector('[data-swatch-name]');
    var desc = document.querySelector('[data-swatch-desc]');

    group.querySelectorAll('[data-tone]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        group.querySelectorAll('[data-tone]').forEach(function (b) { b.classList.remove('is-on'); });
        btn.classList.add('is-on');
        if (preview) preview.className = 'tone t-' + btn.dataset.tone + ' swatch-preview__img';
        if (name) name.textContent = btn.dataset.name;
        if (desc) desc.textContent = btn.dataset.desc;
      });
    });
  }

  /* ---------- portfolio filters ---------- */
  function filters() {
    var bar = document.querySelector('[data-filters]');
    if (!bar) return;
    var tiles = [].slice.call(document.querySelectorAll('[data-cat]'));

    bar.querySelectorAll('[data-filter]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        bar.querySelectorAll('[data-filter]').forEach(function (b) { b.classList.remove('is-on'); });
        btn.classList.add('is-on');
        var f = btn.dataset.filter;
        tiles.forEach(function (t) {
          t.hidden = !(f === 'all' || t.dataset.cat === f);
        });
      });
    });
  }

  /* ---------- before / after gallery sliders ---------- */
  function beforeAfter() {
    document.querySelectorAll('[data-bfaf-slider]').forEach(function (slider) {
      var wrapper = slider.closest('.bfaf-wrapper');
      if (!wrapper) return;

      function sync() {
        wrapper.style.setProperty('--pos', slider.value + '%');
      }

      sync();
      slider.addEventListener('input', sync);
    });
  }

  function init() {
    icons();
    preventOrphans();
    servicesDropdown();
    mobileMenu();
    reveals();
    stickyHeader();
    accordion();
    forms();
    swatchPicker();
    filters();
    beforeAfter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
