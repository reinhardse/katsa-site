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
