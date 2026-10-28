// All closing sections use the homepage's scroll-fill timing.
(()=>{const phrases=document.querySelectorAll('#contact-title span,.med-task-heading .med-task-fill');if(!phrases.length)return;let frame=0;function paint(){frame=0;phrases.forEach(phrase=>{const r=phrase.getBoundingClientRect(),centre=r.top+r.height/2,p=Math.max(0,Math.min(1,(innerHeight*.9-centre)/(innerHeight*.4)));phrase.style.setProperty('--design-fill',(p*100).toFixed(2)+'%')})}function schedule(){if(!frame)frame=requestAnimationFrame(paint)}addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);document.fonts.ready.then(schedule);paint()})();

;(()=>{const de=document.documentElement;addEventListener('pageshow',e=>{de.classList.remove('katsa-leaving')});
if(matchMedia('(prefers-reduced-motion:reduce)').matches)return;
document.addEventListener('click',e=>{if(e.defaultPrevented||e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
const a=e.target.closest&&e.target.closest('a[href]');if(!a||(a.target&&a.target!=='_self')||a.hasAttribute('download'))return;
let u;try{u=new URL(a.href,location.href)}catch(_){return}
if(u.origin!==location.origin||!/^https?:$/.test(u.protocol))return;
if(u.pathname===location.pathname&&u.search===location.search)return;
if(/\.(pdf|zip|png|jpe?g|webp|mp4|webm|svg)$/i.test(u.pathname))return;
const isHome=/(^|\/)(index\.html)?$/.test(u.pathname);
if(isHome&&u.hash.length>1&&u.hash!=='#top'&&!/(^|\/)(index\.html)?$/.test(location.pathname)){try{sessionStorage.setItem('katsa-go',u.hash.slice(1))}catch(_){}u.hash=''}
e.preventDefault();de.classList.add('katsa-leaving');setTimeout(()=>{location.href=u.href},160)});})();

// Мягкий переход к нужному блоку главной после перехода с другой страницы
;(()=>{let id=null;try{id=sessionStorage.getItem('katsa-go');sessionStorage.removeItem('katsa-go')}catch(_){}
if(!id||!/(^|\/)(index\.html)?$/.test(location.pathname))return;
const el=document.getElementById(id);if(!el)return;
if('scrollRestoration'in history)history.scrollRestoration='manual';
let stop=false;const cancel=()=>{stop=true};['wheel','touchstart','keydown','mousedown'].forEach(t=>addEventListener(t,cancel,{passive:true,once:true}));
const run=()=>{if(stop)return;const y0=scrollY,top=()=>el.getBoundingClientRect().top+scrollY-70;const dist=Math.abs(top()-y0);const dur=Math.min(2200,Math.max(1300,900+dist*.22));const t0=performance.now();
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const step=now=>{if(stop)return;const p=Math.min(1,(now-t0)/dur);scrollTo({top:y0+(top()-y0)*ease(p),behavior:'instant'});if(p<1)requestAnimationFrame(step);else{try{history.replaceState(null,'','#'+id)}catch(_){}}};requestAnimationFrame(step)};
if(document.readyState==='complete')setTimeout(run,500);else addEventListener('load',()=>setTimeout(run,500),{once:true});})();

/* Медицина: цифра «6» отсчитывается от 0 при появлении блока */
(()=>{const s=document.querySelector('.med-experience strong');if(!s||!s.firstChild||s.firstChild.nodeType!==3||matchMedia('(prefers-reduced-motion:reduce)').matches)return;const n=s.firstChild,end=parseInt(n.textContent,10);if(!end)return;n.textContent='0 ';let done=false;new IntersectionObserver((es,o)=>{if(done||!es[0].isIntersecting)return;done=true;o.disconnect();const t0=performance.now(),d=1200;(function step(t){const k=Math.min(1,(t-t0)/d),e=1-Math.pow(1-k,3);n.textContent=Math.round(end*e)+' ';if(k<1)requestAnimationFrame(step)})(t0)},{threshold:.6}).observe(s)})();

/* Медицина: «экспертиза» — барабан из букв, как выбор времени на iPhone */
(()=>{const h=document.querySelector('.med-experience .med-expertise-card:last-child h2');if(!h||matchMedia('(prefers-reduced-motion:reduce)').matches)return;const n=[...h.childNodes].find(x=>x.nodeType===3&&/экспертиза/i.test(x.textContent));if(!n)return;const word=n.textContent.trim(),abc='абвгдежзиклмнопрстуфхцчшэюя',wrap=document.createElement('span');wrap.className='med-reel';wrap.setAttribute('aria-hidden','true');h.setAttribute('aria-label',h.textContent.replace(/\s+/g,' ').trim());[...word].forEach((ch,i)=>{const col=document.createElement('i'),strip=document.createElement('b'),rows=7+i;let html='';for(let k=0;k<rows;k++)html+='<u>'+(k===rows-1?ch:abc[Math.floor(Math.random()*abc.length)])+'</u>';strip.innerHTML=html;strip.style.setProperty('--end',-(rows-1)*1.1+'em');strip.style.setProperty('--d',(i*.07)+'s');col.appendChild(strip);wrap.appendChild(col)});n.replaceWith(wrap);[...wrap.children].forEach((col,i)=>{const m=document.createElement('span');m.style.cssText='position:absolute;visibility:hidden;white-space:pre';m.textContent=word[i];wrap.appendChild(m);col.style.width=m.getBoundingClientRect().width+'px';m.remove()});let done=false;new IntersectionObserver((es,o)=>{if(done||!es[0].isIntersecting)return;done=true;o.disconnect();setTimeout(()=>wrap.classList.add('go'),250)},(innerWidth<761?{threshold:0,rootMargin:'0px 0px -4% 0px'}:{threshold:.9})).observe(h)})();

/* Медицина: круг «Смотреть проект» у курсора и дрейф картинок — как на главной */
(()=>{const items=[...document.querySelectorAll('.med-project-image')];if(!items.length)return;const io=new IntersectionObserver(es=>es.forEach(e=>e.target.classList.toggle('drift-visible',e.isIntersecting)),{threshold:0});items.forEach((el,i)=>{el.style.setProperty('--drift-duration',(18+i*2.3)+'s');el.style.setProperty('--drift-phase',(-i*3.7)+'s');io.observe(el)});
const fine=matchMedia('(hover:hover) and (pointer:fine)');if(!fine.matches)return;const cursor=document.createElement('div');cursor.className='project-cursor';cursor.setAttribute('aria-hidden','true');cursor.innerHTML='Смотреть<br>проект';document.body.append(cursor);document.documentElement.classList.add('project-cursor-ready');let frame=0,x=-1,y=-1,inside=false;
const hide=()=>{inside=false;cursor.classList.remove('visible')};
const paint=()=>{frame=0;cursor.style.transform=`translate3d(${x-59}px,${y-59}px,0)`;const hit=inside&&!document.hidden&&document.elementFromPoint(x,y);cursor.classList.toggle('visible',!!(hit&&hit.closest('.med-project-image')))};
const schedule=()=>{if(!frame)frame=requestAnimationFrame(paint)};
document.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;x=e.clientX;y=e.clientY;inside=true;schedule()},{passive:true});
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);document.documentElement.addEventListener('pointerleave',hide);addEventListener('blur',hide);document.addEventListener('visibilitychange',()=>{if(document.hidden)hide();else schedule()});})();

/* Медицина, оффер: «Цифровые» — сначала символы (# @ $ %), барабан крутится и останавливается на слове, которое становится оранжевым */
(()=>{const h=document.querySelector('.med-hero h1');if(!h||matchMedia('(prefers-reduced-motion:reduce)').matches)return;const n=[...h.querySelectorAll('span')].map(s=>[...s.childNodes].find(x=>x.nodeType===3&&/Цифровые/.test(x.textContent))).find(Boolean);if(!n)return;const word='Цифровые',sym='#@$%&*§¤<>/{}+=?!01~^',wrap=document.createElement('span');wrap.className='med-reel med-reel-hero';wrap.setAttribute('aria-hidden','true');h.setAttribute('aria-label',h.textContent.replace(/\s+/g,' ').trim());
[...word].forEach((ch,i)=>{const col=document.createElement('i'),strip=document.createElement('b'),rows=9+i*2;let html='';for(let k=0;k<rows;k++)html+='<u>'+(k===rows-1?ch:sym[Math.floor(Math.random()*sym.length)])+'</u>';strip.innerHTML=html;strip.style.setProperty('--end',-(rows-1)*1.1+'em');strip.style.setProperty('--d',(i*.09)+'s');col.appendChild(strip);wrap.appendChild(col)});
n.textContent=n.textContent.replace('Цифровые','');n.parentNode.insertBefore(wrap,n);
[...wrap.children].forEach((col,i)=>{const m=document.createElement('span');m.style.cssText='position:absolute;visibility:hidden;white-space:pre';m.textContent=word[i];wrap.appendChild(m);col.style.width=m.getBoundingClientRect().width+'px';m.remove()});
setTimeout(()=>wrap.classList.add('go'),500)})();
