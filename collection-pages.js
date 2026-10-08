const menu = document.querySelector('.menu');
const menuButton = menu?.querySelector('.menu-button');
if (menuButton) {
  menuButton.setAttribute('role', 'button');
  menuButton.tabIndex = 0;
  menuButton.setAttribute('aria-label', 'Menu');
  menuButton.setAttribute('aria-expanded', 'false');
  const toggle = () => {
    const open = menu.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(open));
  };
  menuButton.addEventListener('click', toggle);
  menuButton.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); toggle(); }
  });
}

for (const slider of document.querySelectorAll('.w-slider')) {
  const mask = slider.querySelector('.w-slider-mask');
  const photos = [...document.querySelectorAll('#MultiImageCollectionWrapper .w-dyn-repeater-item')];
  if (photos.length) {
    mask.replaceChildren(...photos.map(photo => {
      const slide = document.createElement('div'); slide.className = 'slider-images-slide w-slide';
      slide.style.backgroundImage = photo.style.backgroundImage;
      return slide;
    }));
  }
  const slides = [...mask.querySelectorAll('.w-slide')].filter(slide => !slide.classList.contains('w-condition-invisible') && (slide.querySelector('img[src]') || slide.style.backgroundImage));
  let index = 0;
  slides.forEach(slide => { slide.style.display = 'block'; });
  const show = next => {
    index = (next + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.style.transform = `translateX(${-index * 100}%)`;
      slide.setAttribute('aria-hidden', String(i !== index));
    });
  };
  if (!slides.length) continue;
  for (const [selector, direction, label] of [['.w-slider-arrow-left', -1, 'Previous photo'], ['.w-slider-arrow-right', 1, 'Next photo']]) {
    const control = slider.querySelector(selector);
    if (!control) continue;
    control.setAttribute('role', 'button'); control.tabIndex = 0; control.setAttribute('aria-label', label);
    control.addEventListener('click', () => show(index + direction));
    control.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); show(index + direction); }
    });
  }
  let start;
  mask.addEventListener('pointerdown', event => { start = event.clientX; });
  mask.addEventListener('pointerup', event => {
    if (start != null && Math.abs(event.clientX - start) > 40) show(index + (event.clientX < start ? 1 : -1));
    start = null;
  });
  mask.addEventListener('pointercancel', () => { start = null; });
  show(0);
}

const wrapper = document.querySelector('.horizontal-scroll_section-height');
const track = document.querySelector('.horizontal-scroll_track');
function layout() {
  if (!wrapper || !track) return;
  const desktop = innerWidth > 991;
  wrapper.style.height = desktop ? `${innerHeight + Math.max(0, track.scrollWidth - innerWidth)}px` : 'auto';
  if (!desktop) track.style.transform = '';
  scrollTrack();
}
function scrollTrack() {
  if (!wrapper || !track || innerWidth <= 991) return;
  const distance = Math.min(Math.max(0, -wrapper.getBoundingClientRect().top), Math.max(0, track.scrollWidth - innerWidth));
  track.style.transform = `translate3d(${-distance}px,0,0)`;
}
addEventListener('scroll', scrollTrack, { passive: true });
addEventListener('resize', layout);
addEventListener('load', layout);
layout();

const lightbox = document.querySelector('[data-lightbox="wrapper"]');
const items = [...document.querySelectorAll('[data-lightbox="item"]')];
const triggers = [...document.querySelectorAll('[data-lightbox="trigger"]')];
let selected = 0;
let restoreFocus;
if (lightbox) {
  lightbox.querySelectorAll('img').forEach(image => { image.draggable = false; });
  lightbox.hidden = true;
  lightbox.setAttribute('aria-label', 'Collection product photos');
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  const show = next => {
    selected = (next + items.length) % items.length;
    items.forEach((item, i) => { item.hidden = i !== selected; });
    const count = lightbox.querySelector('.lightbox-nav p');
    if (count) count.textContent = `${selected + 1} / ${items.length}`;
  };
  const close = () => {
    lightbox.hidden = true; lightbox.classList.remove('is-open'); document.body.classList.remove('product-open'); restoreFocus?.focus();
  };
  triggers.forEach((button, index) => {
    button.setAttribute('aria-label', `View ${items[index]?.querySelector('img')?.alt || 'product'}`);
    button.addEventListener('click', () => {
      restoreFocus = button; show(index); lightbox.hidden = false; lightbox.classList.add('is-open'); document.body.classList.add('product-open');
      lightbox.querySelector('[data-lightbox="close"]').focus();
    });
  });
  lightbox.querySelector('[data-lightbox="close"]').addEventListener('click', close);
  lightbox.querySelector('[data-lightbox="prev"]').addEventListener('click', () => show(selected - 1));
  lightbox.querySelector('[data-lightbox="next"]').addEventListener('click', () => show(selected + 1));
  let touchStart;
  lightbox.addEventListener('pointerdown', event => { touchStart = event.clientX; });
  lightbox.addEventListener('pointerup', event => {
    if (touchStart != null && Math.abs(event.clientX - touchStart) > 50) show(selected + (event.clientX < touchStart ? 1 : -1));
    touchStart = null;
  });
  lightbox.addEventListener('pointercancel', () => { touchStart = null; });
  document.addEventListener('keydown', event => {
    if (lightbox.hidden) return;
    if (event.key === 'Escape') close();
    if (event.key === 'ArrowLeft') show(selected - 1);
    if (event.key === 'ArrowRight') show(selected + 1);
    if (event.key === 'Tab') {
      const buttons = [...lightbox.querySelectorAll('button')];
      const first = buttons[0], last = buttons.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
}
for (const count of document.querySelectorAll('[fs-countitems-element="value"]')) count.textContent = String(triggers.length);

for (const form of document.querySelectorAll('form')) {
  const input = form.querySelector('input');
  if (input) { input.type = 'email'; input.required = true; input.setAttribute('aria-label', 'Email address'); }
  const submit = event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    let status = form.querySelector('[role="status"]');
    if (!status) { status = document.createElement('p'); status.setAttribute('role', 'status'); form.append(status); }
    status.textContent = 'This is a demonstration. Your email has not been sent or subscribed.';
  };
  form.addEventListener('submit', submit);
  form.querySelectorAll('a').forEach(link => link.addEventListener('click', submit));
}
