(()=>{
 if(!document.body.classList.contains('case-page'))return;
 const icon=paths=>`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths}</svg>`;
 const icons={expand:icon('<path d="M8 16 19 5M13 5h6v6M16 8 5 19M5 13v6h6"/>'),less:icon('<path d="M5 12h14"/>'),more:icon('<path d="M5 12h14M12 5v14"/>'),close:icon('<path d="m6 6 12 12M18 6 6 18"/>')};
 const mobile=matchMedia('(max-width:760px)');
 const dialog=document.createElement('dialog');dialog.className='media-viewer';dialog.setAttribute('aria-label','Просмотр изображения');dialog.tabIndex=-1;dialog.autofocus=true;
 dialog.innerHTML='<div class="media-viewer-bar"><div class="media-viewer-tools"><button type="button" data-less aria-label="Уменьшить">−</button><span class="media-viewer-scale">100%</span><button type="button" data-more aria-label="Увеличить">+</button></div><button type="button" data-close aria-label="Закрыть просмотр">×</button></div><div class="media-viewer-scroll"><div class="media-viewer-stage"><div class="media-viewer-content"></div></div></div><p class="media-viewer-hint">Увеличивайте двумя пальцами или кнопками + и −</p>';
 document.body.append(dialog);
 dialog.querySelector('[data-less]').innerHTML=icons.less;dialog.querySelector('[data-more]').innerHTML=icons.more;dialog.querySelector('[data-close]').innerHTML=icons.close;
 const scroll=dialog.querySelector('.media-viewer-scroll'),stage=dialog.querySelector('.media-viewer-stage'),content=dialog.querySelector('.media-viewer-content'),scale=dialog.querySelector('.media-viewer-scale');
 let zoom=1,fit=0,ratio=1,previousOverflow='',returnFocus=null;
 function resizeLayers(){content.querySelectorAll('.mockup-live-layer').forEach(x=>x.style.setProperty('--scene-scale',x.parentElement.clientWidth/1680));content.querySelectorAll('.red-screen-layer').forEach(x=>x.style.setProperty('--scene-scale',x.parentElement.clientWidth/2400))}
 function apply(value){zoom=Math.max(1,Math.min(5,value));const w=fit*zoom;content.style.width=w+'px';stage.style.width=Math.max(scroll.clientWidth,w+24)+'px';scale.textContent=Math.round(zoom*100)+'%';resizeLayers()}
 function open(source){
  if(!mobile.matches)return;
  returnFocus=document.activeElement;const scene=source.matches('img,video')?source:source.querySelector('.sun-macbook-stage,.mockup-scene,.hero-mockup-scene,.product-mockup-scene,.red-mockup-scene')||source.querySelector('.prototype-slide.is-active')||source.querySelector('video')||source.querySelector('img');if(!scene)return;
  const clone=scene.cloneNode(true);clone.removeAttribute('id');clone.querySelectorAll('[id]').forEach(x=>x.removeAttribute('id'));clone.querySelectorAll('.media-open').forEach(x=>x.remove());
  if(clone.matches('img')){clone.removeAttribute('style');clone.removeAttribute('class');clone.removeAttribute('srcset');clone.loading='eager';ratio=(scene.naturalWidth||scene.width)/(scene.naturalHeight||scene.height)}else if(clone.matches('video'))ratio=(scene.videoWidth||8)/(scene.videoHeight||5);else{const r=scene.getBoundingClientRect();ratio=r.width/r.height}
  content.replaceChildren(clone);previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';dialog.showModal();dialog.focus({preventScroll:true});fit=Math.min(scroll.clientWidth-24,(scroll.clientHeight-24)*ratio);apply(1);scroll.scrollTo(0,0);
  const comparison=clone.querySelector('.sun-before-after-stage');if(comparison)window.initSunComparison?.(comparison);
  const videos=clone.matches('video')?[clone]:clone.querySelectorAll('video');videos.forEach(v=>{v.muted=true;v.playsInline=true;v.play().catch(()=>{})});
 }
 function close(){dialog.close()}
 dialog.addEventListener('close',()=>{content.querySelectorAll('video').forEach(v=>v.pause());content.replaceChildren();document.body.style.overflow=previousOverflow;returnFocus?.focus({preventScroll:true})});
 dialog.querySelector('[data-close]').onclick=close;dialog.querySelector('[data-more]').onclick=()=>apply(zoom+.75);dialog.querySelector('[data-less]').onclick=()=>apply(zoom-.75);
 let pinch=0,startZoom=1;const distance=t=>Math.hypot(t[0].clientX-t[1].clientX,t[0].clientY-t[1].clientY);
 scroll.addEventListener('touchstart',e=>{if(e.touches.length===2){pinch=distance(e.touches);startZoom=zoom}},{passive:true});
 scroll.addEventListener('touchmove',e=>{if(e.touches.length===2&&pinch){e.preventDefault();apply(startZoom*distance(e.touches)/pinch)}},{passive:false});
 scroll.addEventListener('touchend',()=>pinch=0,{passive:true});
 mobile.addEventListener('change',()=>{if(!mobile.matches&&dialog.open)close();if(mobile.matches)document.querySelectorAll('.editorial-shot>.case-visual,.editorial-film,.prototype-slider,.sun-before-after').forEach(attach)});
 addEventListener('resize',()=>{if(dialog.open){fit=Math.min(scroll.clientWidth-24,(scroll.clientHeight-24)*ratio);apply(zoom)}});
 function attach(el){if(!mobile.matches)return;if(!el.querySelector('img,video')||el.dataset.zoomReady)return;el.dataset.zoomReady='true';if(getComputedStyle(el).position==='static')el.style.position='relative';const button=document.createElement('button');button.type='button';button.className='media-open';button.setAttribute('aria-label','Рассмотреть на весь экран');button.innerHTML=icons.expand;
  el.append(button);
  button.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();open(el)});
  if(!el.matches('a,button'))el.addEventListener('click',e=>{if(mobile.matches&&!e.target.closest('button,a,input'))open(el)});
 }
 document.querySelectorAll('.editorial-shot>.case-visual,.editorial-film,.prototype-slider,.sun-before-after').forEach(attach);
})();
