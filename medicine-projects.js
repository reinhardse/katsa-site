// Same viewport-centre timing as the orange phrase on the home page.
(()=>{const phrase=document.querySelector('.med-projects-fill');if(!phrase)return;const reduced=matchMedia('(prefers-reduced-motion:reduce)');let frame=0;
function paint(){frame=0;const r=phrase.getBoundingClientRect(),centre=r.top+r.height/2,progress=reduced.matches?1:Math.max(0,Math.min(1,(innerHeight*.9-centre)/(innerHeight*.4)));phrase.style.setProperty('--project-fill',(progress*100).toFixed(2)+'%')}
function queue(){if(!frame)frame=requestAnimationFrame(paint)}addEventListener('scroll',queue,{passive:true});addEventListener('resize',queue);reduced.addEventListener('change',queue);document.fonts.ready.then(queue);paint()})();
