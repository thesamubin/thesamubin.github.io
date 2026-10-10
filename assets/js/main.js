document.addEventListener('DOMContentLoaded', () => {
  // Mobile Menu Logic
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const navOverlay = document.querySelector('.nav-overlay');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('nav-open');
      navLinks.classList.toggle('nav-open');
      if (navOverlay) navOverlay.classList.toggle('nav-open');
      
      // Accessibility
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', !isExpanded);
    });
  }

  if (navOverlay) {
    navOverlay.addEventListener('click', () => {
      menuToggle.classList.remove('nav-open');
      navLinks.classList.remove('nav-open');
      navOverlay.classList.remove('nav-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  }

  // Lenis Smooth Scroll Initialization
  if (typeof Lenis !== 'undefined') {
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1.2 });

