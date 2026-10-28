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
e.preventDefault();de.classList.add('katsa-leaving');setTimeout(()=>{location.href=u.href},300)});})();
