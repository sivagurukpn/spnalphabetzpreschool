/* SPN Alphabetz - production-ready vanilla JS
   Features:
   - Active nav highlighting based on current page
   - Mobile menu toggle
   - Reusable slider (hero + testimonials)
   - Accordion
   - Scroll-to-top
   - Tiny toast helper
*/

(function () {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function getCurrentPath() {
    const p = (location.pathname || '').split('/').pop();
    return p || 'index.html';
  }

  function setActiveNav() {
    const current = getCurrentPath();
    const links = $$('a[data-nav]');

    links.forEach((a) => {
      const href = a.getAttribute('href') || '';
      const isActive = href === current;
      if (isActive) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  function mobileMenu() {
    const btn = $('[data-mobile-toggle]');
    const panel = $('[data-mobile-panel]');
    if (!btn || !panel) return;
    const mobileMq = window.matchMedia('(max-width: 1080px)');

    const setOpen = (open) => {
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      panel.hidden = !open;
    };

    setOpen(false);

    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      setOpen(open);
    });

    // Close on navigation.
    $$('a[data-nav]', panel).forEach((a) => {
      a.addEventListener('click', () => setOpen(false));
    });

    // Close on Esc.
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setOpen(false);
    });

    const syncOnResize = () => {
      if (!mobileMq.matches) setOpen(false);
    };

    if (mobileMq.addEventListener) mobileMq.addEventListener('change', syncOnResize);
    else mobileMq.addListener(syncOnResize);
  }

  function createSlider(root) {
    const el = typeof root === 'string' ? $(root) : root;
    if (!el) return null;

    const slides = $$('[data-slide]', el);
    const dots = $$('[data-dot]', el);
    const prev = $('[data-prev]', el);
    const next = $('[data-next]', el);
    const slidesHost = $('.slides', el);
    const autoHeight = el.hasAttribute('data-auto-height');
    const autoplayMs = Number(el.getAttribute('data-autoplay') || '0');

    if (!slides.length) return null;

    let index = Math.max(0, slides.findIndex((s) => s.classList.contains('is-active')));
    let timer = null;

    const syncHeight = () => {
      if (!autoHeight || !slidesHost) return;
      const activeSlide = slides[index];
      if (!activeSlide) return;
      const content = activeSlide.firstElementChild || activeSlide;
      const contentHeight = content.getBoundingClientRect().height;
      const hostStyles = window.getComputedStyle(slidesHost);
      const paddingTop = parseFloat(hostStyles.paddingTop) || 0;
      const paddingBottom = parseFloat(hostStyles.paddingBottom) || 0;
      slidesHost.style.height = `${Math.ceil(contentHeight + paddingTop + paddingBottom)}px`;
    };

    const render = () => {
      slides.forEach((s, i) => s.classList.toggle('is-active', i === index));
      dots.forEach((d, i) => d.setAttribute('aria-current', String(i === index)));
      window.requestAnimationFrame(syncHeight);
    };

    const go = (i) => {
      index = (i + slides.length) % slides.length;
      render();
    };

    const start = () => {
      stop();
      if (!autoplayMs) return;
      timer = window.setInterval(() => go(index + 1), autoplayMs);
    };

    const stop = () => {
      if (timer) window.clearInterval(timer);
      timer = null;
    };

    prev?.addEventListener('click', () => {
      go(index - 1);
      start();
    });

    next?.addEventListener('click', () => {
      go(index + 1);
      start();
    });

    dots.forEach((d, i) => {
      d.addEventListener('click', () => {
        go(i);
        start();
      });
    });

    el.addEventListener('mouseenter', stop);
    el.addEventListener('mouseleave', start);

    // Reduced motion: disable autoplay.
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReduced) start();

    render();

    if (autoHeight) {
      window.addEventListener('resize', syncHeight);
      window.setTimeout(syncHeight, 0);
    }

    return { go, start, stop };
  }

  function setupTestimonialsSlider(root) {
    const el = typeof root === 'string' ? $(root) : root;
    if (!el) return;

    const slidesHost = $('.slides', el);
    if (!slidesHost) return;

    const cards = $$('.t-card', slidesHost).map((card) => card.cloneNode(true));
    if (!cards.length) return;

    slidesHost.innerHTML = '';

    for (let i = 0; i < cards.length; i += 2) {
      const slide = document.createElement('article');
      slide.className = i === 0 ? 'slide is-active' : 'slide';
      slide.setAttribute('data-slide', '');

      const pair = document.createElement('div');
      pair.className = 'testimonial-grid';
      pair.appendChild(cards[i]);
      if (cards[i + 1]) pair.appendChild(cards[i + 1]);

      slide.appendChild(pair);
      slidesHost.appendChild(slide);
    }

    const dotsHost = $('.dots', el);
    if (dotsHost) {
      dotsHost.innerHTML = '';
      const totalSlides = Math.ceil(cards.length / 2);
      for (let i = 0; i < totalSlides; i += 1) {
        const dot = document.createElement('button');
        dot.className = 'dot-btn';
        dot.type = 'button';
        dot.setAttribute('data-dot', '');
        dot.setAttribute('aria-label', `Show testimonial group ${i + 1}`);
        dotsHost.appendChild(dot);
      }
    }

    const totalSlides = Math.ceil(cards.length / 2);
    const prev = $('[data-prev]', el);
    const next = $('[data-next]', el);
    if (totalSlides <= 1) {
      if (prev) prev.disabled = true;
      if (next) next.disabled = true;
    } else {
      if (prev) prev.disabled = false;
      if (next) next.disabled = false;
    }

    createSlider(el);
  }

  function accordion() {
    $$('[data-accordion]').forEach((acc) => {
      $$('[data-acc-item]', acc).forEach((item) => {
        const btn = $('[data-acc-btn]', item);
        if (!btn) return;

        btn.addEventListener('click', () => {
          const open = !item.classList.contains('is-open');
          // close others
          $$('[data-acc-item]', acc).forEach((x) => x.classList.remove('is-open'));
          if (open) item.classList.add('is-open');
        });
      });
    });
  }

  function scrollTop() {
    const btn = $('[data-scroll-top]');
    if (!btn) return;

    const onScroll = () => {
      btn.classList.toggle('show', window.scrollY > 600);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  function toast() {
    const el = $('[data-toast]');
    if (!el) return { show: () => {} };

    let hideTimer = null;
    const show = (title, desc, ms = 2400) => {
      const t = $('[data-toast-title]', el);
      const d = $('[data-toast-desc]', el);
      if (t) t.textContent = title || 'Done';
      if (d) d.textContent = desc || '';
      el.classList.add('show');
      if (hideTimer) window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => el.classList.remove('show'), ms);
    };

    return { show };
  }

  function admissionsForm() {
    const form = $('[data-admissions-form]');
    if (!form) return;

    const t = toast();

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const parentName = String(fd.get('name') || '').trim();
      const studentName = String(fd.get('student') || '').trim();
      const email = String(fd.get('email') || '').trim();
      const phone = String(fd.get('phone') || '').trim();

      if (!parentName || !studentName || !email || !phone) {
        t.show('Missing info', 'Please fill in parent name, student name, email, and phone.');
        return;
      }

      // Production: wire this to your backend endpoint.
      t.show('Inquiry received', "Thanks! We'll contact you soon. (Demo only — connect to your API when ready.)");
      form.reset();
    });
  }

  function isGalleryImage(path) {
    return /\.(avif|webp|png|jpe?g|gif|svg)$/i.test(path || '');
  }

  function normalizeGallerySource(entry) {
    if (typeof entry !== 'string') return null;

    let value = entry.trim();
    if (!value) return null;

    value = value.split('#')[0].split('?')[0];
    if (!isGalleryImage(value)) return null;

    if (/^https?:\/\//i.test(value) || value.startsWith('/') || value.startsWith('assets/')) {
      return value;
    }

    if (value.startsWith('./')) value = value.slice(2);
    if (value.startsWith('Gallery/')) value = value.slice('Gallery/'.length);

    return `assets/img/Gallery/${value}`;
  }

  function getGalleryFromWindow() {
    const data = window.__GALLERY_IMAGES;
    if (!Array.isArray(data)) return [];
    return data.map(normalizeGallerySource).filter(Boolean);
  }

  async function getGalleryFromManifest() {
    try {
      const res = await fetch('assets/img/Gallery/index.json', { cache: 'no-store' });
      if (!res.ok) return [];

      const text = await res.text();
      const data = JSON.parse(text.replace(/^\uFEFF/, ''));
      const entries = Array.isArray(data) ? data : Array.isArray(data?.images) ? data.images : [];
      return entries.map(normalizeGallerySource).filter(Boolean);
    } catch (_err) {
      return [];
    }
  }

  async function getGalleryFromDirectory() {
    try {
      const res = await fetch('assets/img/Gallery/', { cache: 'no-store' });
      if (!res.ok) return [];

      const html = await res.text();
      if (!/<a\s/i.test(html)) return [];

      const doc = new DOMParser().parseFromString(html, 'text/html');
      const hrefs = $$('a[href]', doc).map((a) => a.getAttribute('href') || '');

      const names = hrefs
        .map((href) => href.split('#')[0].split('?')[0].replace(/^\.\//, ''))
        .filter((href) => href && href !== '../' && !href.endsWith('/'));

      return names.map(normalizeGallerySource).filter(Boolean);
    } catch (_err) {
      return [];
    }
  }

  function dedupeSortPaths(paths) {
    const unique = new Set();
    paths.forEach((p) => unique.add(p));
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }

  function buildGalleryAlt(src, index) {
    const filename = decodeURIComponent((src.split('/').pop() || '').split('.')[0] || `Image ${index + 1}`);
    const cleaned = filename.replace(/[-_]+/g, ' ').trim();
    return cleaned ? `Gallery image: ${cleaned}` : `Gallery image ${index + 1}`;
  }

  async function galleryCarousel() {
    const root = $('[data-gallery-carousel]');
    if (!root) return;

    const slidesHost = $('[data-gallery-slides]', root);
    const dotsHost = $('[data-gallery-dots]', root);
    const prev = $('[data-prev]', root);
    const next = $('[data-next]', root);
    if (!slidesHost || !dotsHost) return;

    const fromWindow = getGalleryFromWindow();
    const fromManifest = await getGalleryFromManifest();
    const fromDirectory = await getGalleryFromDirectory();
    const images = dedupeSortPaths([...fromWindow, ...fromManifest, ...fromDirectory]);

    if (!images.length) {
      dotsHost.innerHTML = '';
      if (prev) prev.disabled = true;
      if (next) next.disabled = true;
      return;
    }

    slidesHost.innerHTML = '';
    dotsHost.innerHTML = '';

    images.forEach((src, index) => {
      const slide = document.createElement('article');
      slide.className = index === 0 ? 'slide is-active' : 'slide';
      slide.setAttribute('data-slide', '');

      const media = document.createElement('div');
      media.className = 'media';

      const img = document.createElement('img');
      img.src = src;
      img.alt = buildGalleryAlt(src, index);
      img.loading = 'lazy';
      media.appendChild(img);

      const overlay = document.createElement('div');
      overlay.className = 'overlay';

      const caption = document.createElement('div');
      caption.className = 'caption';

      const title = document.createElement('div');
      title.className = 'title';
      title.textContent = `Gallery ${index + 1}`;

      const text = document.createElement('div');
      text.className = 'text';
      text.textContent = `${index + 1} of ${images.length}`;

      caption.appendChild(title);
      caption.appendChild(text);

      slide.appendChild(media);
      slide.appendChild(overlay);
      slide.appendChild(caption);
      slidesHost.appendChild(slide);

      const dot = document.createElement('button');
      dot.className = 'dot-btn';
      dot.type = 'button';
      dot.setAttribute('data-dot', '');
      dot.setAttribute('aria-label', `Show gallery image ${index + 1}`);
      dotsHost.appendChild(dot);
    });

    if (images.length <= 1) {
      if (prev) prev.disabled = true;
      if (next) next.disabled = true;
    }

    createSlider(root);
  }

  document.addEventListener('DOMContentLoaded', () => {
    setActiveNav();
    mobileMenu();
    createSlider('[data-hero-slider]');
    $$('[data-testimonials-slider]').forEach((slider) => setupTestimonialsSlider(slider));
    accordion();
    scrollTop();
    admissionsForm();
    galleryCarousel();

    const y = document.querySelector('[data-year]');
    if (y) y.textContent = String(new Date().getFullYear());
  });
})();
