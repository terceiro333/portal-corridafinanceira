(() => {
  'use strict';

  const filters = Array.from(document.querySelectorAll('[data-filter]'));
  const cards = Array.from(document.querySelectorAll('.version-card'));
  const count = document.getElementById('catalogCount');
  const menuButton = document.getElementById('menuToggle');
  const menu = document.getElementById('mainNav');
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  const year = document.getElementById('currentYear');
  const header = document.querySelector('.site-header');
  const compareRange = document.getElementById('compareRange');
  const compareViewport = document.getElementById('compareViewport');
  const comparePosition = document.getElementById('comparePosition');
  const compareReset = document.getElementById('compareReset');

  if (year) year.textContent = String(new Date().getFullYear());

  function setComparison(value) {
    if (!compareRange || !compareViewport) return;
    const percentV1 = Math.max(0, Math.min(100, Number(value)));
    const percentV2 = 100 - percentV1;
    compareRange.value = String(percentV1);
    compareViewport.style.setProperty('--split', `${percentV1}%`);
    compareRange.setAttribute('aria-valuetext', `${percentV1} por cento da imagem V1 e ${percentV2} por cento da imagem V2`);
    if (comparePosition) comparePosition.textContent = `${percentV1}% V1 · ${percentV2}% V2`;
  }

  if (compareRange && compareViewport) {
    compareRange.addEventListener('input', () => setComparison(compareRange.value));
    let comparingByPointer = false;
    const moveDivider = (event) => {
      const rect = compareViewport.getBoundingClientRect();
      if (rect.width > 0) setComparison(Math.round((event.clientX - rect.left) / rect.width * 100));
    };
    compareViewport.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      comparingByPointer = true;
      compareViewport.setPointerCapture(event.pointerId);
      moveDivider(event);
    });
    compareViewport.addEventListener('pointermove', (event) => {
      if (comparingByPointer) moveDivider(event);
    });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((type) => {
      compareViewport.addEventListener(type, () => { comparingByPointer = false; });
    });
    if (compareReset) compareReset.addEventListener('click', () => setComparison(50));
    setComparison(compareRange.value);
  }

  function setFilter(group) {
    let visibleCount = 0;
    cards.forEach((card) => {
      const visible = group === 'todos' || card.dataset.group === group;
      card.hidden = !visible;
      if (visible) visibleCount++;
    });
    filters.forEach((button) => {
      const selected = button.dataset.filter === group;
      button.classList.toggle('is-active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    if (count) count.textContent = `EXIBINDO ${String(visibleCount).padStart(2, '0')} ${visibleCount === 1 ? 'VERSÃO' : 'VERSÕES'}`;
  }

  filters.forEach((button) => button.addEventListener('click', () => setFilter(button.dataset.filter)));

  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    menuButton.classList.toggle('is-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  }

  if (menu && menuButton) {
    menuButton.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
    document.querySelectorAll('#mainNav a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') setMenu(false);
    });
    document.addEventListener('click', (event) => {
      if (!menu.contains(event.target) && !menuButton.contains(event.target)) setMenu(false);
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 780) setMenu(false);
    });
  }

  function updateHeader() {
    header.classList.toggle('has-scrolled', window.scrollY > 20);
  }
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  if ('IntersectionObserver' in window) {
    const sections = ['inicio', 'catalogo', 'comparar', 'como-jogar'].map((id) => document.getElementById(id)).filter(Boolean);
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => link.classList.toggle('active', link.dataset.section === entry.target.id));
      });
    }, { rootMargin: '-25% 0px -60% 0px' });
    sections.forEach((section) => observer.observe(section));
  }
})();
