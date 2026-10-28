const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
const header=document.querySelector('.site-header');
function updateHeader(){header.classList.toggle('scrolled',scrollY>40)}
addEventListener('scroll',updateHeader,{passive:true});updateHeader();
const menuButton=document.querySelector('.menu-toggle'),mobileMenu=document.querySelector('.mobile-menu');
function closeMenu(){mobileMenu.hidden=true;menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Открыть меню')}
menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')==='true';menuButton.setAttribute('aria-expanded',String(!open));mobileMenu.hidden=open;menuButton.setAttribute('aria-label',open?'Открыть меню':'Закрыть меню')});
mobileMenu.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
if(!reduceMotion.matches&&'IntersectionObserver' in window){document.body.classList.add('case-motion');const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('case-visible');observer.unobserve(e.target)}}),{threshold:.08});document.querySelectorAll('.case-reveal').forEach(el=>observer.observe(el))}
const caseForm=document.querySelector('#project-request');
caseForm.addEventListener('submit',e=>{e.preventDefault();const contact=caseForm.elements.contact;contact.setCustomValidity(contact.value.trim().length<3?'Укажите любой удобный способ связи':'');if(!caseForm.reportValidity())return;const name=caseForm.elements.name.value.trim(),task=caseForm.elements.task.value.trim();const body=`Здравствуйте, KATSA! Хочу обсудить проект.\n\nКейс: ${document.title}\nИмя: ${name||'Не указано'}\nКонтакт: ${contact.value.trim()}\n\nЗадача:\n${task||'Обсудим при знакомстве'}`;location.href='mailto:hello@katsa.ru?subject='+encodeURIComponent('Обсудить проект'+(name?' — '+name:''))+'&body='+encodeURIComponent(body)});
caseForm.elements.contact.addEventListener('input',e=>e.target.setCustomValidity(''));
(()=>{const cards=[...document.querySelectorAll('.case-decision-card')];let frame=0;function paint(){frame=0;cards.forEach((card,i)=>{const next=cards[i+1],top=parseFloat(getComputedStyle(card).top)||0;const p=reduceMotion.matches||!next?0:Math.max(0,Math.min(1,1-(next.getBoundingClientRect().top-top)/card.offsetHeight));card.style.transform=`scale(${1-p*.05})`;card.querySelector('.case-decision-shade').style.opacity=String(p*.45)})}function queue(){if(!frame)frame=requestAnimationFrame(paint)}addEventListener('scroll',queue,{passive:true});addEventListener('resize',queue);reduceMotion.addEventListener('change',queue);queue()})();
(()=>{document.querySelectorAll('.case-exact-screen-layer').forEach(layer=>{const frame=layer.parentElement;const resize=()=>layer.style.setProperty('--scene-scale',String(frame.clientWidth/Number(layer.dataset.sceneWidth)));if('ResizeObserver' in window)new ResizeObserver(resize).observe(frame);addEventListener('resize',resize);resize()})})();
(()=>{const root=document.querySelector('.prototype-slider');if(!root)return;const slides=[...root.querySelectorAll('.prototype-slide')],dots=[...root.querySelectorAll('.prototype-dot')],pause=root.querySelector('.prototype-pause');if(!pause)return;let index=0,timer,paused=reduceMotion.matches,visible=false;function show(i){index=i;slides.forEach((slide,n)=>{slide.classList.toggle('is-active',n===i);slide.setAttribute('aria-hidden',String(n!==i))});dots.forEach((dot,n)=>{dot.classList.toggle('is-active',n===i);dot.setAttribute('aria-pressed',String(n===i))})}function sync(){clearInterval(timer);pause.textContent=paused?'Воспроизвести':'Пауза';pause.setAttribute('aria-label',paused?'Включить смену прототипов':'Приостановить смену прототипов');if(!paused&&visible&&!document.hidden)timer=setInterval(()=>show((index+1)%slides.length),5000)}dots.forEach((dot,i)=>dot.addEventListener('click',()=>{show(i);sync()}));pause.addEventListener('click',()=>{paused=!paused;sync()});document.addEventListener('visibilitychange',sync);reduceMotion.addEventListener('change',()=>{paused=reduceMotion.matches;sync()});if('IntersectionObserver'in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync()},{threshold:.15}).observe(root);else visible=true;sync()})();
(()=>{document.querySelectorAll('.mockup-live-layer').forEach(layer=>{const scene=layer.parentElement;const resize=()=>layer.style.setProperty('--scene-scale',String(scene.clientWidth/1680));new ResizeObserver(resize).observe(scene);resize()})})();
window.initSunComparison=function(stage){
 if(!stage)return;
 const range=stage.querySelector('.sun-before-after-range'),video=stage.querySelector('video'),divider=stage.querySelector('.sun-before-after-divider');
 const set=value=>{const next=Math.max(0,Math.min(100,value));stage.style.setProperty('--split',next+'%');range.value=String(next)};
 // Measure the contained frame, not the taller physical MacBook display.
 const align=()=>{const w=stage.clientWidth,h=stage.clientHeight,ratio=video?.videoWidth?video.videoWidth/video.videoHeight:1920/1084;const mediaHeight=video?Math.min(h,w/ratio):h;divider.style.top=(h-mediaHeight)/2+'px';divider.style.bottom=(h-mediaHeight)/2+'px'};
 new ResizeObserver(align).observe(stage);video?.addEventListener('loadedmetadata',align);align();
 let dragging=null;
 const move=event=>{const box=stage.getBoundingClientRect();set((event.clientX-box.left)/box.width*100)};
 range.addEventListener('input',()=>set(Number(range.value)));
 range.addEventListener('pointerdown',event=>{if(!event.isPrimary)return;event.preventDefault();event.stopPropagation();dragging=event.pointerId;range.setPointerCapture(event.pointerId);move(event)});
 range.addEventListener('pointermove',event=>{if(event.pointerId===dragging){event.preventDefault();move(event)}});
 const release=event=>{if(event.pointerId!==dragging)return;dragging=null;if(range.hasPointerCapture(event.pointerId))range.releasePointerCapture(event.pointerId)};
 range.addEventListener('pointerup',release);range.addEventListener('pointercancel',release);
 range.addEventListener('click',event=>{event.preventDefault();event.stopPropagation()});
 stage.addEventListener('pointermove',event=>{if(event.pointerType==='mouse'&&dragging===null)move(event)});
};
document.querySelectorAll('.sun-before-after-stage').forEach(window.initSunComparison);
(()=>{const buttons=[...document.querySelectorAll('.case-website-pending')];if(!buttons.length)return;const dialog=document.createElement('dialog');dialog.className='case-soon-dialog';dialog.setAttribute('aria-labelledby','case-soon-title');dialog.innerHTML='<button class="case-soon-close" type="button" aria-label="Закрыть"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button><h2 id="case-soon-title">Скоро</h2>';document.body.append(dialog);buttons.forEach(button=>button.addEventListener('click',()=>dialog.showModal()));dialog.querySelector('button').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close()})})();
(()=>{document.querySelectorAll('.red-screen-layer').forEach(layer=>{const resize=()=>layer.style.setProperty('--scene-scale',String(layer.parentElement.clientWidth/2400));new ResizeObserver(resize).observe(layer.parentElement);resize()})})();

// Reveal the complete mockup, including projected video, as one composition.
(()=>{
 if(reduceMotion.matches||!('IntersectionObserver'in window))return;
 const surfaces=[...document.querySelectorAll('main figure.case-visual,main figure.editorial-film,main .prototype-slides,main .case-cover,main .case-media')].filter(el=>el.querySelector('img,video')&&!el.closest('#contact')&&!el.parentElement.closest('figure'));
 surfaces.forEach(el=>el.classList.add('case-media-enter'));
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(!entry.isIntersecting)return;
  const el=entry.target;observer.unobserve(el);
  // Start after decoding, so a slow image cannot miss its entrance.
  const images=[...el.querySelectorAll('img:not(.prototype-slide),img.prototype-slide.is-active')];
  const ready=images.map(img=>{img.loading='eager';return img.decode?.().catch(()=>{})});
  Promise.race([Promise.all(ready),new Promise(r=>setTimeout(r,1000))]).then(()=>requestAnimationFrame(()=>requestAnimationFrame(()=>el.classList.add('case-media-seen'))));
 }),{threshold:0,rootMargin:matchMedia('(max-width:760px)').matches?'0px 0px 150px 0px':'0px 0px 400px 0px'});
 surfaces.forEach(el=>observer.observe(el));
 reduceMotion.addEventListener('change',event=>{if(event.matches){surfaces.forEach(el=>el.classList.add('case-media-seen'));observer.disconnect()}});
 addEventListener('pageshow',event=>{if(event.persisted)surfaces.forEach(el=>{if(el.getBoundingClientRect().top<innerHeight)el.classList.add('case-media-seen')})});
})();
