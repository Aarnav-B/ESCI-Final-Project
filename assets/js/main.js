const header = document.getElementById('site-header');
const progressFill = document.getElementById('progress-fill');
const revealItems = document.querySelectorAll('.reveal');
const observedSections = document.querySelectorAll('.observe-section[id], .observe-section[data-section]');
const navLinks = document.querySelectorAll('.site-nav a[href^="#"]');
const dotLinks = document.querySelectorAll('.dot-nav__dot');

function updateProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  if (progressFill) {
    progressFill.style.width = `${Math.min(Math.max(progress, 0), 100)}%`;
  }
}

function updateHeaderState() {
  if (!header) return;
  if (window.scrollY > 24) {
    header.classList.add('is-scrolled');
  } else {
    header.classList.remove('is-scrolled');
  }
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal--visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12,
    rootMargin: '0px 0px -8% 0px',
  }
);

revealItems.forEach((item) => revealObserver.observe(item));

function clearActiveNav() {
  navLinks.forEach((link) => link.removeAttribute('aria-current'));
  dotLinks.forEach((dot) => dot.classList.remove('is-active'));
}

const sectionObserver = new IntersectionObserver(
  (entries) => {
    const visibleEntries = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

    if (!visibleEntries.length) return;

    const active = visibleEntries[0].target;
    const id = active.getAttribute('id');
    if (!id) return;

    clearActiveNav();

    navLinks.forEach((link) => {
      if (link.getAttribute('href') === `#${id}`) {
        link.setAttribute('aria-current', 'true');
      }
    });

    dotLinks.forEach((dot) => {
      if (dot.dataset.sectionLink === id) {
        dot.classList.add('is-active');
      }
    });
  },
  {
    threshold: [0.2, 0.4, 0.6],
    rootMargin: '-20% 0px -45% 0px',
  }
);

observedSections.forEach((section) => {
  if (section.id) {
    sectionObserver.observe(section);
  }
});

window.addEventListener('scroll', () => {
  updateHeaderState();
  updateProgress();
}, { passive: true });

updateHeaderState();
updateProgress();

const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightbox-image');
const lightboxClose = document.getElementById('lightbox-close');
const lightboxTriggers = document.querySelectorAll('[data-lightbox]');

function closeLightbox() {
  if (!lightbox || !lightboxImage) return;
  lightbox.classList.remove('is-open');
  lightbox.setAttribute('aria-hidden', 'true');
  lightboxImage.src = '';
  lightboxImage.alt = '';
  document.body.style.overflow = '';
}

function openLightbox(source) {
  if (!lightbox || !lightboxImage || !source) return;
  lightboxImage.src = source.currentSrc || source.src;
  lightboxImage.alt = source.alt || '';
  lightbox.classList.add('is-open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

lightboxTriggers.forEach((trigger) => {
  trigger.addEventListener('click', () => openLightbox(trigger));
});

if (lightboxClose) {
  lightboxClose.addEventListener('click', closeLightbox);
}

if (lightbox) {
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });
}

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeLightbox();
  }
});
