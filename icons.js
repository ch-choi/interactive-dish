const paths = {
 reset: '<path d="M4 9a8 8 0 1 1 0 6M4 3v6h6"/>',
 expand: '<path d="M9 4H4v5m11-5h5v5M4 15v5h5m11-5v5h-5"/>',
 menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
 close: '<path d="m6 6 12 12M18 6 6 18"/>',
 left: '<path d="M20 12H4m6-6-6 6 6 6"/>',
 right: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
 plus: '<path d="M4 12h16M12 4v16"/>',
 minus: '<path d="M4 12h16"/>',
 filter: '<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="8" cy="6" r="2"/><circle cx="16" cy="12" r="2"/><circle cx="10" cy="18" r="2"/>',
 grid: '<rect x="4" y="4" width="6" height="6"/><rect x="14" y="4" width="6" height="6"/><rect x="4" y="14" width="6" height="6"/><rect x="14" y="14" width="6" height="6"/>'
};
function icon(name) {
 const span=document.createElement('span');span.className=`ui-icon ui-icon-${name}`;span.setAttribute('aria-hidden','true');
 span.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${paths[name]}</svg>`;
 return span;
}
for(const selector of ['.menu-icon','.menu-button_icon','.ac-menu-icon'])for(const slot of document.querySelectorAll(selector)){
 slot.replaceChildren(icon('menu'),icon('close'));slot.classList.add('ui-menu-slot');
}
for(const slot of document.querySelectorAll('.filter-icon'))slot.replaceChildren(icon('filter'));
for(const [selector,name] of [
 ['.close-icon,.ac-dialog-close,[data-lightbox="close"]','close'],
 ['.w-slider-arrow-left,[data-slide-prev],[data-lightbox="prev"]','left'],
 ['.w-slider-arrow-right,[data-slide-next],[data-lightbox="next"]','right'],
 ['.ac-newsletter button','right'],['.zoom-in','plus'],['.zoom-out','minus']
])for(const control of document.querySelectorAll(selector)){
 const label=control.getAttribute('aria-label')||control.textContent.trim();
 if(label)control.setAttribute('aria-label',label);
 control.replaceChildren(icon(name));control.classList.add('ui-icon-control');
}
for(const image of document.querySelectorAll('.reset-filters img'))image.replaceWith(icon('reset'));
for(const image of document.querySelectorAll('.card-hint img'))image.replaceWith(icon('expand'));
for(const image of document.querySelectorAll('.card-explore img,.focus-cta img'))image.replaceWith(icon('right'));
for(const slot of document.querySelectorAll('.ac-arrow-link span,.ac-submit span,.ac-contact-card b[aria-hidden]'))slot.replaceChildren(icon('right'));

window.PalmerIcon=icon;
