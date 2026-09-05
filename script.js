(function () {
  'use strict';

  /* ---------- Navbar scroll state ---------- */
  var navbar = document.getElementById('navbar');

  function updateNavbarState() {
    if (!navbar) return;
    if (window.scrollY > 8) {
      navbar.classList.add('is-scrolled');
    } else {
      navbar.classList.remove('is-scrolled');
    }
  }
  updateNavbarState();
  window.addEventListener('scroll', updateNavbarState, { passive: true });

  /* ---------- Mobile menu toggle ---------- */
  var menuToggle = document.getElementById('menuToggle');
  var mobileMenu = document.getElementById('mobileMenu');

  function closeMobileMenu() {
    if (!mobileMenu || !menuToggle) return;
    mobileMenu.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open menu');
  }

  function openMobileMenu() {
    if (!mobileMenu || !menuToggle) return;
    mobileMenu.classList.add('is-open');
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'Close menu');
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function () {
      var isOpen = mobileMenu.classList.contains('is-open');
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    var mobileLinks = mobileMenu.querySelectorAll('a');
    for (var i = 0; i < mobileLinks.length; i++) {
      mobileLinks[i].addEventListener('click', closeMobileMenu);
    }
  }

  /* Close mobile menu on Escape */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeMobileMenu();
    }
  });

  /* ---------- FAQ accordion ---------- */
  var accordion = document.getElementById('accordion');

  if (accordion) {
    var triggers = accordion.querySelectorAll('.accordion-trigger');

    function closeAllExcept(current) {
      for (var i = 0; i < triggers.length; i++) {
        if (triggers[i] !== current) {
          setTriggerState(triggers[i], false);
        }
      }
    }

    function setTriggerState(trigger, expand) {
      var panelId = trigger.getAttribute('aria-controls');
      var panel = document.getElementById(panelId);
      trigger.setAttribute('aria-expanded', expand ? 'true' : 'false');
      if (!panel) return;
      if (expand) {
        panel.style.maxHeight = panel.scrollHeight + 'px';
      } else {
        panel.style.maxHeight = '0px';
      }
    }

    for (var t = 0; t < triggers.length; t++) {
      triggers[t].addEventListener('click', function () {
        var expanded = this.getAttribute('aria-expanded') === 'true';
        /* Allow only one (or a few) open at a time: close others when opening */
        if (!expanded) {
          closeAllExcept(this);
        }
        setTriggerState(this, !expanded);
      });
    }
  }

  /* ---------- Smooth scroll for in-page links (fallback / offset) ---------- */
  var navHeight = 76;

  document.addEventListener('click', function (e) {
    var link = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!link) return;
    var hash = link.getAttribute('href');
    if (!hash || hash === '#' || hash.length < 2) return;
    var target = document.querySelector(hash);
    if (!target) return;

    e.preventDefault();
    var top = target.getBoundingClientRect().top + window.pageYOffset - (navHeight - 4);
    window.scrollTo({ top: top, behavior: 'smooth' });

    if (history.pushState) {
      history.pushState(null, '', hash);
    }
  });

  /* ---------- Active navigation state (filename-based, multi-page) ---------- */
  /* Each page already marks its own nav link with is-active in the HTML.
     This just keeps things correct if a page is renamed, linked to with a
     different relative path, or opened as a folder index. */
  (function markActiveNav() {
    var path = window.location.pathname.split('/').pop() || 'index.html';
    var navAnchors = document.querySelectorAll('.nav-link, .mobile-nav-link');

    navAnchors.forEach(function (anchor) {
      var href = (anchor.getAttribute('href') || '').split('/').pop();
      if (href === path) {
        anchor.classList.add('is-active');
        anchor.setAttribute('aria-current', 'page');
      } else {
        anchor.classList.remove('is-active');
        anchor.removeAttribute('aria-current');
      }
    });
  })();

  /* ---------- Scroll reveal animations ---------- */
  var revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && revealEls.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );

    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* ---------- Photo fallback (graceful degradation for hotlinked images) ---------- */
  var THEME_ICONS = {
    school: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 10 12 4l8 6"/><path d="M6 10v9h12v-9"/><path d="M10 19v-5h4v5"/></svg>',
    restaurant: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 3v7a2 2 0 0 0 2 2v9"/><path d="M10 3v9"/><path d="M14 3v6a2 2 0 0 0 4 0V3"/><path d="M16 12v9"/></svg>',
    hotel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="4" y="4" width="16" height="16" rx="1.5"/><path d="M4 10h16"/><path d="M9 10v10"/></svg>',
    clinic: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 21s-7-4.6-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.4-9.5 9-9.5 9Z"/><path d="M12 8v6M9 11h6"/></svg>',
    salon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 8a6 6 0 0 1 12 0c0 4-3 5-3 8H9c0-3-3-4-3-8Z"/><path d="M10 21h4"/></svg>',
    local: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 9 5.5 4h13L20 9"/><path d="M4 9h16v10H4V9Z"/><path d="M9 13v6M15 13v6"/></svg>'
  };

  var photoImages = document.querySelectorAll('.photo-frame img[data-fallback-theme]');

  photoImages.forEach(function (img) {
    img.addEventListener('error', function () {
      var frame = img.closest('.photo-frame');
      if (!frame) return;
      var theme = img.getAttribute('data-fallback-theme') || 'local';
      var label = img.getAttribute('data-fallback-label') || '';
      frame.classList.add('has-fallback', 'theme-' + theme);

      var fallback = document.createElement('div');
      fallback.className = 'photo-frame-fallback';
      fallback.innerHTML =
        '<span class="photo-frame-fallback-icon" aria-hidden="true">' + (THEME_ICONS[theme] || '') + '</span>' +
        '<span>' + label + '</span>';
      frame.appendChild(fallback);
    });
  });

  /* ---------- Contact form handling ---------- */
  var contactForm = document.getElementById('contactForm');
  var formStatus = document.getElementById('formStatus');
  var whatsappSubmitBtn = document.getElementById('whatsappSubmitBtn');
  var WHATSAPP_NUMBER = '919336059300';
  var CONTACT_EMAIL = 'hello.velnio@gmail.com';

  function getFormValues() {
    return {
      name: (document.getElementById('name') || {}).value || '',
      business: (document.getElementById('business') || {}).value || '',
      phone: (document.getElementById('phone') || {}).value || '',
      email: (document.getElementById('email') || {}).value || '',
      businessType: (document.getElementById('businessType') || {}).value || '',
      package: (document.getElementById('package') || {}).value || '',
      message: (document.getElementById('message') || {}).value || ''
    };
  }

  function buildInquiryBody(values) {
    return [
      'Hello VELNIO,',
      'I would like to discuss a website.',
      'Name:',
      values.name,
      'Business Name:',
      values.business,
      'Phone:',
      values.phone,
      'Email:',
      values.email,
      'Business Type:',
      values.businessType,
      'Package:',
      values.package,
      'Message:',
      values.message
    ].join('\n');
  }

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }

      var values = getFormValues();
      var subject = encodeURIComponent('New Website Inquiry \u2014 VELNIO');
      var body = encodeURIComponent(buildInquiryBody(values));
      var mailtoUrl = 'mailto:' + CONTACT_EMAIL + '?subject=' + subject + '&body=' + body;

      if (formStatus) {
        formStatus.textContent = 'Opening your email app with the inquiry ready to send\u2026';
      }

      window.location.href = mailtoUrl;
    });
  }

  if (whatsappSubmitBtn) {
    whatsappSubmitBtn.addEventListener('click', function () {
      if (contactForm && !contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }

      var values = getFormValues();

      var lines = [
        'Hello VELNIO,',
        '',
        'I would like to discuss a website.',
        '',
        'Name: ' + values.name,
        'Business: ' + values.business,
        'Phone: ' + values.phone,
        'Email: ' + values.email,
        'Business Type: ' + values.businessType,
        'Package: ' + values.package,
        'Message: ' + values.message
      ];

      var text = encodeURIComponent(lines.join('\n'));
      var url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + text;
      window.open(url, '_blank', 'noopener,noreferrer');
    });
  }

  /* ---------- Portfolio demo project buttons ---------- */
  var demoButtons = document.querySelectorAll('[data-demo-project]');
  var toast = document.getElementById('projectToast');
  var toastTimer = null;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    if (toastTimer) {
      clearTimeout(toastTimer);
    }
    toastTimer = setTimeout(function () {
      toast.classList.remove('is-visible');
    }, 3200);
  }

  demoButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      showToast('This is a concept project created to demonstrate our design style — not a live website.');
    });
  });

})();
