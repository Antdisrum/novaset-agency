(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Navbar scroll state ---------- */
  var navbar = document.getElementById('navbar');
  var onScroll = function () {
    if (window.scrollY > 20) {
      navbar.classList.add('is-scrolled');
    } else {
      navbar.classList.remove('is-scrolled');
    }
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = document.getElementById('navToggle');
  var mobileNav = document.getElementById('mobileNav');

  function closeMobileNav() {
    navToggle.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Abrir menú');
    mobileNav.classList.remove('is-open');
  }

  navToggle.addEventListener('click', function () {
    var isOpen = mobileNav.classList.toggle('is-open');
    navToggle.classList.toggle('is-open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
  });

  mobileNav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMobileNav);
  });

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll('[data-reveal]');

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) { yearEl.textContent = new Date().getFullYear(); }

  /* ---------- Scroll-spy: highlight current section in nav ---------- */
  var navLinks = document.querySelectorAll('.navbar__nav a[href^="#"]');
  if (navLinks.length && 'IntersectionObserver' in window) {
    var linkByHash = {};
    navLinks.forEach(function (link) { linkByHash[link.getAttribute('href')] = link; });

    var spySections = [];
    navLinks.forEach(function (link) {
      var section = document.querySelector(link.getAttribute('href'));
      if (section) { spySections.push(section); }
    });

    var spyObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var hash = '#' + entry.target.id;
          var link = linkByHash[hash];
          if (!link) { return; }
          if (entry.isIntersecting) {
            navLinks.forEach(function (l) { l.classList.remove('is-active'); });
            link.classList.add('is-active');
          }
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    spySections.forEach(function (section) { spyObserver.observe(section); });
  }

  /* ---------- Hero: subtle live-system feel (tilt + parallax) ---------- */
  if (!prefersReducedMotion) {
    var systemGraphic = document.getElementById('systemGraphic');
    var heroEl = document.getElementById('hero');
    var heroGlows = document.querySelectorAll('.hero__glow');
    var pointerFine = window.matchMedia && window.matchMedia('(pointer: fine)').matches;

    if (systemGraphic && heroEl && pointerFine) {
      heroEl.addEventListener('mousemove', function (e) {
        var rect = heroEl.getBoundingClientRect();
        var relX = (e.clientX - rect.left) / rect.width - 0.5;
        var relY = (e.clientY - rect.top) / rect.height - 0.5;
        systemGraphic.style.transform = 'rotateY(' + (relX * 6) + 'deg) rotateX(' + (relY * -6) + 'deg)';
      });
      heroEl.addEventListener('mouseleave', function () {
        systemGraphic.style.transform = 'rotateY(0deg) rotateX(0deg)';
      });
    }

    if (heroGlows.length) {
      var ticking = false;
      window.addEventListener('scroll', function () {
        if (ticking) { return; }
        ticking = true;
        window.requestAnimationFrame(function () {
          var offset = window.scrollY * 0.12;
          heroGlows.forEach(function (glow, idx) {
            var dir = idx % 2 === 0 ? 1 : -1;
            glow.style.transform = 'translateY(' + (offset * dir) + 'px)';
          });
          ticking = false;
        });
      }, { passive: true });
    }
  }

  /* ---------- Close mobile nav on resize to desktop ---------- */
  window.addEventListener('resize', function () {
    if (window.innerWidth > 860) { closeMobileNav(); }
  });

  /* ---------- Proyectos: carruseles de casos de estudio ---------- */
  document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
    var track = carousel.querySelector('[data-carousel-track]');
    var prevBtn = carousel.querySelector('[data-carousel-prev]');
    var nextBtn = carousel.querySelector('[data-carousel-next]');
    if (!track) { return; }

    function slideStep() {
      var slide = track.querySelector('img');
      if (!slide) { return 150; }
      var style = window.getComputedStyle(track);
      var gap = parseFloat(style.columnGap || style.gap || '10');
      return slide.getBoundingClientRect().width + gap;
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        track.scrollBy({ left: -slideStep() * 2, behavior: 'smooth' });
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        track.scrollBy({ left: slideStep() * 2, behavior: 'smooth' });
      });
    }
  });

  /* ---------- Proyectos: pausar video al salir de vista ---------- */
  var projectVideos = document.querySelectorAll('.project-piece video');
  if (projectVideos.length && 'IntersectionObserver' in window) {
    var projectVideoObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting && !entry.target.paused) {
            entry.target.pause();
          }
        });
      },
      { threshold: 0.15 }
    );
    projectVideos.forEach(function (v) { projectVideoObserver.observe(v); });
  }
})();

/* ---------- Proyectos: lightbox de imágenes de carrusel ---------- */
(function () {
  'use strict';

  var lightbox = document.getElementById('lightbox');
  if (!lightbox) { return; }

  var imgEl = document.getElementById('lightboxImg');
  var countEl = document.getElementById('lightboxCount');
  var closeBtn = document.getElementById('lightboxClose');
  var prevBtn = document.getElementById('lightboxPrev');
  var nextBtn = document.getElementById('lightboxNext');

  var currentGroup = [];
  var currentIndex = 0;
  var lastFocused = null;

  function show(index) {
    if (!currentGroup.length) { return; }
    currentIndex = (index + currentGroup.length) % currentGroup.length;
    var sourceImg = currentGroup[currentIndex];
    imgEl.classList.remove('is-loaded');
    imgEl.src = sourceImg.currentSrc || sourceImg.src;
    imgEl.alt = sourceImg.alt || '';
    countEl.textContent = (currentIndex + 1) + ' / ' + currentGroup.length;
    if (imgEl.complete) { imgEl.classList.add('is-loaded'); }
  }

  imgEl.addEventListener('load', function () { imgEl.classList.add('is-loaded'); });

  function open(group, index, trigger) {
    currentGroup = group;
    lastFocused = trigger || document.activeElement;
    show(index);
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('lightbox-open');
    closeBtn.focus();
  }

  function close() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('lightbox-open');
    imgEl.removeAttribute('src');
    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus({ preventScroll: true });
    }
  }

  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', function () { show(currentIndex - 1); });
  nextBtn.addEventListener('click', function () { show(currentIndex + 1); });

  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) { close(); }
  });

  document.addEventListener('keydown', function (e) {
    if (!lightbox.classList.contains('is-open')) { return; }
    if (e.key === 'Escape') { close(); }
    if (e.key === 'ArrowLeft') { show(currentIndex - 1); }
    if (e.key === 'ArrowRight') { show(currentIndex + 1); }
  });

  document.querySelectorAll('[data-carousel-track]').forEach(function (track) {
    var images = Array.prototype.slice.call(track.querySelectorAll('img'));
    images.forEach(function (img, idx) {
      img.setAttribute('tabindex', '0');
      img.setAttribute('role', 'button');
      img.setAttribute('aria-label', (img.getAttribute('alt') || 'Imagen') + ' — ampliar');
      img.addEventListener('click', function () { open(images, idx, img); });
      img.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open(images, idx, img);
        }
      });
    });
  });
})();
