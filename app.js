import {createExplorer} from './explorer.js';

const $=s=>document.querySelector(s);
const data=await fetch('/data.json').then(r=>{if(!r.ok)throw new Error('Product data could not load');return r.json()});
document.querySelectorAll('.view-icon i').forEach((dot,index)=>dot.style.setProperty('--dot',index));
const state={view:'experience',color:null,types:new Set(),min:6,max:29,focused:null};
const collectionUrl=name=>'/collections/'+name+'/';
const explorer=createExplorer($('#explorer'),{desktop:data.desktop,mobile:data.mobile,onSelect:item=>location.assign(collectionUrl(item.data.collectionSlug)),onHover:(item,position)=>{
 const tip=$('.product-tooltip');
 if(!item||state.focused||innerWidth<=1024){tip.hidden=true;return;}
 tip.querySelector('span').textContent=item.data.collection;
 tip.style.left=Math.min(innerWidth-160,position.x+12)+'px';tip.style.top=Math.min(innerHeight-30,position.y+20)+'px';tip.hidden=false;
}});

function matching(item){const p=item.data;return(!state.color||p.color===state.color)&&(!state.types.size||state.types.has(p.type))&&Number(p.size)>=state.min&&Number(p.size)<=state.max;}
function applyFilters(){
 explorer.filter(matching);
 for(const card of document.querySelectorAll('.collection-card')){
  let count=0;
  for(const link of card.querySelectorAll('.card-product')){const item=productFor(link.querySelector('img').getAttribute('src'),card.dataset.collection);link.hidden=!item||!matching(item);if(!link.hidden)count++;}
  card.hidden=count===0;
 }
 $('.reset-filters').hidden=!(state.color||state.types.size||state.min!==6||state.max!==29);
 $('.min-value').textContent=`⌀ ${state.min} cm`;$('.max-value').textContent=`⌀ ${state.max} cm`;
 for(const b of document.querySelectorAll('.color-options [data-color]'))b.setAttribute('aria-pressed',String(b.dataset.color===state.color));
 for(const b of document.querySelectorAll('.type-options [data-type]'))b.setAttribute('aria-pressed',String(state.types.has(b.dataset.type)));
}
function resetFilters(){state.color=null;state.types.clear();state.min=6;state.max=29;$('#min-size').value='6';$('#max-size').value='29';applyFilters();}
function toggleFilters(open){$('.filters').hidden=!open;$('.filter-toggle').hidden=open;$('.filter-toggle').setAttribute('aria-expanded',String(open));if(open)toggleMenu(false);}
function toggleMenu(open){$('.menu-links').hidden=!open;$('.menu-toggle').setAttribute('aria-expanded',String(open));if(open)toggleFilters(false);}
$('.menu-toggle').addEventListener('click',()=>toggleMenu($('.menu-links').hidden));
$('.filter-toggle').addEventListener('click',()=>toggleFilters(true));
$('.close-filters').addEventListener('click',()=>toggleFilters(false));
$('.reset-filters').addEventListener('click',resetFilters);
for(const b of document.querySelectorAll('.category-toggle'))b.addEventListener('click',()=>{
 const open=b.getAttribute('aria-expanded')!=='true';
 for(const other of document.querySelectorAll('.category-toggle')){other.setAttribute('aria-expanded','false');other.nextElementSibling.hidden=true;}
 b.setAttribute('aria-expanded',String(open));b.nextElementSibling.hidden=!open;
});
const colors={Pink:'#ffcece',Creme:'#f3e0cf',Earth:'#635858',Grey:'#9fa0a2',White:'#f5f6ee',Green:'#506157',Blue:'#4a699f'};
for(const [color,hex]of Object.entries(colors)){
 const b=document.createElement('button');b.dataset.color=color;b.setAttribute('aria-label',color);b.setAttribute('aria-pressed','false');b.style.backgroundColor=hex;b.addEventListener('click',()=>{state.color=state.color===color?null:color;applyFilters()});$('.color-options').append(b);
}
for(const type of ['Deep Plate','Saucer','Cup','Bowl','Plate']){
 const b=document.createElement('button');b.dataset.type=type;b.textContent=type;b.setAttribute('aria-pressed','false');b.addEventListener('click',()=>{state.types.has(type)?state.types.delete(type):state.types.add(type);applyFilters()});$('.type-options').append(b);
}
$('#min-size').addEventListener('input',e=>{state.min=Math.min(Number(e.target.value),state.max);e.target.value=state.min;applyFilters()});
$('#max-size').addEventListener('input',e=>{state.max=Math.max(Number(e.target.value),state.min);e.target.value=state.max;applyFilters()});
$('.zoom-in').addEventListener('click',()=>explorer.zoom(1));$('.zoom-out').addEventListener('click',()=>explorer.zoom(-1));

function setView(view){
 closeFocus();toggleMenu(false);toggleFilters(false);state.view=view;
 document.body.className=view;
 $('#collections').hidden=view!=='grid';$('#explorer').hidden=view==='grid';explorer.setActive(view!=='grid');
 $('.view-current').textContent=view==='grid'?'grid view':'experience view';$('.view-next').textContent=view==='grid'?'experience view':'grid view';$('.view-button').setAttribute('aria-label',view==='grid'?'grid view':'experience view');
 $('.product-tooltip').hidden=true;window.scrollTo({top:0,behavior:'instant'});
 applyFilters();
 const el=view==='grid'?$('#collections'):$('#explorer');
 if(!matchMedia('(prefers-reduced-motion: reduce)').matches)el.animate([{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:800,easing:'cubic-bezier(.22,1,.36,1)'});
}
$('.view-button').addEventListener('click',()=>setView(state.view==='grid'?'experience':'grid'));
$('.menu-links a.current').addEventListener('click',e=>{e.preventDefault();setView('experience');explorer.reset()});
$('.logo').addEventListener('click',e=>{e.preventDefault();setView('experience');explorer.reset()});

function imageNode(src,alt){const img=document.createElement('img');img.src=src;img.alt=alt;img.draggable=false;return img;}
function productFor(src,name){return data.desktop.find(p=>p.src===src&&(!name||p.data.collection===name))||data.desktop.find(p=>p.src===src);}
for(const collection of data.collections){
 const card=document.createElement('article');card.className='collection-card';card.dataset.collection=collection.name;
 const surface=document.createElement('div');surface.className='card-surface';
 const products=document.createElement('div');products.className='card-products';products.tabIndex=0;products.setAttribute('aria-label',`${collection.name} products`);
 const first=productFor(collection.images[0],collection.name);
 const href=collectionUrl(first?.data.collectionSlug||collection.name.toLowerCase().replaceAll(' ','-'));
 for(const src of collection.images){
  const p=productFor(src,collection.name);const button=document.createElement('a');button.className='card-product';button.draggable=false;button.href=href;button.setAttribute('aria-label',p?.data.name||collection.name);button.append(imageNode(src,p?.data.name||collection.name));products.append(button);
 }
 const link=document.createElement('a');link.className='card-explore';link.href=href;link.setAttribute('aria-label',`Explore ${collection.name}`);const label=document.createElement('span');label.textContent='explore';link.append(label,window.PalmerIcon('right'));
 const hint=document.createElement('div');hint.className='card-hint';hint.append(window.PalmerIcon('expand'));const hintText=document.createElement('span');hintText.textContent='Drag for more';hint.append(hintText);
 const info=document.createElement('div');info.className='card-info';const name=document.createElement('span');name.textContent=collection.name;const count=document.createElement('span');count.textContent=`${collection.count} Products`;info.append(name,count);
 surface.append(products,link,hint);card.append(surface,info);$('.collection-grid').append(card);
 let start=null,moved=false;
 products.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0)return;e.preventDefault();start={x:e.clientX,scroll:products.scrollLeft};moved=false;products.style.scrollSnapType='none'});
 products.addEventListener('pointermove',e=>{if(!start)return;const dx=e.clientX-start.x;if(Math.abs(dx)>5){moved=true;products.setPointerCapture(e.pointerId);products.scrollLeft=start.scroll-dx;}});
 const finish=()=>{if(!start)return;start=null;products.style.scrollSnapType='x mandatory';if(moved)products.scrollTo({left:Math.round(products.scrollLeft/products.clientWidth)*products.clientWidth,behavior:'smooth'});};
 products.addEventListener('pointerup',finish);products.addEventListener('pointercancel',finish);products.addEventListener('pointerleave',e=>{if(!products.hasPointerCapture(e.pointerId))finish()});
 products.addEventListener('click',e=>{if(moved){e.preventDefault();e.stopPropagation();moved=false;}});
 products.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();products.scrollBy({left:products.clientWidth*(e.key==='ArrowRight'?1:-1),behavior:'smooth'});}});
}

let restoreFocus=null,focusObserver=null;
function openFocus(item){
 if(state.focused){closeFocus();return;}
 restoreFocus=document.activeElement;state.focused=item;explorer.setActive(false);toggleMenu(false);toggleFilters(false);$('.product-tooltip').hidden=true;
 const focus=$('#focus');focus.hidden=false;document.body.classList.add('focus-open');focus.querySelector('h2').textContent=item.data.collection;
 $('#explorer').style.transform='translateX(60vw)';
 const collection=data.collections.find(c=>c.name===item.data.collection);
 const all=data.desktop.filter(p=>p.data.collection===item.data.collection);
 const ordered=[item,...all.filter(p=>p.src!==item.src)];
 const carousel=$('.focus-products');carousel.replaceChildren();$('.focus-thumbnails').replaceChildren();carousel.scrollTop=0;
 $('.focus-cta a').href=collectionUrl(item.data.collectionSlug);
 const update=p=>{$('.product-description').textContent=`${p.data.type} ⌀ ${p.data.size}`;for(const b of document.querySelectorAll('.focus-thumbnails button'))b.classList.toggle('selected',b.dataset.src===p.src);};
 update(item);
 focusObserver?.disconnect();focusObserver=new IntersectionObserver(entries=>{const best=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(best)update(ordered[Number(best.target.dataset.index)]);},{root:carousel,threshold:[.5,.75]});
 ordered.forEach((p,i)=>{
  const section=document.createElement('div');section.className='focus-product';section.dataset.index=i;section.append(imageNode(p.src,p.data.name));carousel.append(section);focusObserver.observe(section);
  const thumb=document.createElement('button');thumb.setAttribute('aria-label',`View ${p.data.name}`);thumb.dataset.src=p.src;thumb.classList.toggle('selected',i===0);thumb.append(imageNode(p.src,''));thumb.addEventListener('click',()=>{carousel.scrollTo({top:section.offsetTop,behavior:'smooth'});update(p);});$('.focus-thumbnails').append(thumb);
 });
 $('.close-focus').focus({preventScroll:true});
}
function closeFocus(){
 if(!state.focused)return;state.focused=null;$('#focus').hidden=true;document.body.classList.remove('focus-open');$('#explorer').style.transform='';focusObserver?.disconnect();explorer.setActive(state.view==='experience');restoreFocus?.focus({preventScroll:true});
}
$('.close-focus').addEventListener('click',closeFocus);
document.addEventListener('pointerdown',e=>{if(state.focused&&!$('#focus').contains(e.target)&&e.clientX>innerWidth*.6)closeFocus()});
document.addEventListener('keydown',e=>{
 if(e.key==='Escape'){closeFocus();toggleMenu(false);toggleFilters(false);}
 if(e.key==='Tab'&&state.focused){const nodes=[...$('#focus').querySelectorAll('button,a,[tabindex]')].filter(n=>n.offsetParent!==null);const first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}
});
window.addEventListener('resize',()=>{explorer.resize();if(state.focused)closeFocus()});
window.initCookieNotice?.({logo:'/assets/logo.png'});
document.documentElement.dataset.ready='true';
