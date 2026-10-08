const page = document.querySelector('.ac-page');
if (!page) throw new Error('About/Contact page root is missing');

for (const toggle of document.querySelectorAll('.ac-menu-toggle')) {
  toggle.setAttribute('aria-label', 'Menu');
  const menu = document.getElementById(toggle.getAttribute('aria-controls'));
  const setOpen = open => {
    toggle.setAttribute('aria-expanded', String(open));
    menu.hidden = !open;
  };
  toggle.addEventListener('click', () => setOpen(menu.hidden));
  document.addEventListener('pointerdown', event => { if (!toggle.parentElement.contains(event.target)) setOpen(false); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') setOpen(false);
  });
}

for (const form of document.querySelectorAll('[data-local-form]')) {
  form.addEventListener('submit', event => {
    event.preventDefault();
    const status = form.querySelector('[data-form-status]');
    if (status) status.textContent = 'This is a demonstration. No subscription or email was sent.';
    form.reset();
  });
}

const dialog = document.querySelector('.ac-contact-dialog');
const openContact = document.querySelector('[data-open-contact]');
const closeContact = document.querySelector('[data-close-contact]');
if (dialog && openContact && closeContact) {
  openContact.addEventListener('click', () => dialog.showModal());
  closeContact.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.querySelector('[data-contact-form]')?.addEventListener('submit', event => {
    event.preventDefault();
    const status = dialog.querySelector('[data-form-status]');
    if (status) status.textContent = 'This is a demonstration. Your message was not sent.';
    event.currentTarget.reset();
  });
}

const supportButton = document.querySelector('[data-support]');
supportButton?.addEventListener('click', () => {
  const status = document.querySelector('[data-support-status]');
  if (status) status.textContent = 'Support is available through the local demo form.';
  openContact?.focus();
});

const slider = document.querySelector('[data-slider]');
if (slider) {
  const slides = [...slider.querySelectorAll('.ac-slide')];
  const dots = [...slider.querySelectorAll('[data-slide-to]')];
  let current = 0;
  let timer;
  const show = next => {
    current = (next + slides.length) % slides.length;
    slides.forEach((slide, index) => slide.classList.toggle('is-active', index === current));
    dots.forEach((dot, index) => dot.classList.toggle('is-active', index === current));
  };
  const restart = () => {
    clearInterval(timer);
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches && !slider.matches(":hover, :focus-within")) timer = setInterval(() => show(current + 1), 5000);
  };
  slider.querySelector('[data-slide-prev]')?.addEventListener('click', () => { show(current - 1); restart(); });
  slider.querySelector('[data-slide-next]')?.addEventListener('click', () => { show(current + 1); restart(); });
  dots.forEach(dot => dot.addEventListener('click', () => { show(Number(dot.dataset.slideTo)); restart(); }));
  slider.addEventListener("mouseenter", () => clearInterval(timer));
  slider.addEventListener("focusin", () => clearInterval(timer));
  slider.addEventListener("mouseleave", restart);
  slider.addEventListener("focusout", restart);
  restart();
}

console.assert(document.querySelector('main'), 'About/Contact page main content is missing');
