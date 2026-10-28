(()=>{const menu=document.querySelector('#mobile-menu'),toggle=document.querySelector('.menu-toggle');if(!menu||!toggle)return;document.addEventListener('pointerdown',event=>{if(menu.hidden||menu.contains(event.target)||toggle.contains(event.target))return;menu.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Открыть меню')},{capture:true});})();
// Load upcoming media ahead of the viewport; decode only visible video streams.
(()=>{
 const style=document.createElement('style');style.textContent='video::-webkit-media-controls,video::-webkit-media-controls-start-playback-button{display:none!important;-webkit-appearance:none}';document.head.append(style);
 const configured=new WeakSet(),prepared=new WeakSet(),near=new Set(),visible=new Set();
 const scenes='.mockup-scene,.hero-mockup-scene,.product-mockup-scene,.red-mockup-scene,.sun-macbook-device';
 const isVisible=v=>{const r=v.getBoundingClientRect();return r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth};
 const mob=matchMedia('(max-width:760px)').matches;
 const pageLoaded=new Promise(r=>document.readyState==='complete'?r():addEventListener('load',r,{once:true}));
 const startLoad=v=>{v.querySelectorAll('source[data-src]').forEach(s=>{s.src=s.dataset.src});v.preload=mob?'metadata':'auto';v.load()};
 // На телефоне видео начинает грузиться только после загрузки страницы и картинок, и только когда оказывается на экране
 const load=v=>{if(v.dataset.mediaLoaded)return;v.dataset.mediaLoaded='true';if(mob)pageLoaded.then(()=>setTimeout(()=>startLoad(v),500));else startLoad(v)};
 const play=v=>{if(!v.isConnected||document.hidden||!isVisible(v))return;load(v);v.muted=true;v.play().catch(()=>{})};
 const preloadObserver='IntersectionObserver'in window?new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){near.add(e.target);load(e.target)}else near.delete(e.target)}),{rootMargin:mob?'0px 0px':'600px 0px'}):null;
 const playbackObserver='IntersectionObserver'in window?new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){visible.add(e.target);play(e.target)}else{visible.delete(e.target);e.target.pause()}}),{threshold:0}):null;
 function frameReady(v){
  const reveal=()=>v.classList.add('media-frame-ready');
  if(v.requestVideoFrameCallback)v.requestVideoFrameCallback(reveal);else if(v.readyState>=2)reveal();
 }
 function setupVideo(v){
  if(configured.has(v))return;configured.add(v);v.classList.remove('media-frame-ready');
  v.controls=false;v.autoplay=false;v.loop=true;v.defaultMuted=true;v.muted=true;v.playsInline=true;
  for(const a of ['muted','loop','playsinline','webkit-playsinline','disablepictureinpicture','disableremoteplayback'])v.setAttribute(a,'');
  v.removeAttribute('controls');v.setAttribute('controlslist','nodownload noplaybackrate noremoteplayback');
  v.addEventListener('loadeddata',()=>{frameReady(v);play(v)});v.addEventListener('playing',()=>frameReady(v));
  v.addEventListener('ended',()=>{v.currentTime=0;play(v)});
  preloadObserver?.observe(v);playbackObserver?.observe(v);
  if(isVisible(v))play(v);else if(!preloadObserver)load(v);
 }
 const decode=img=>{img.loading='eager';return img.decode().catch(()=>{})};
 async function prepareScene(scene){
  if(prepared.has(scene))return;prepared.add(scene);scene.classList.add('media-composite');scene.classList.remove('is-ready');
  const images=[...scene.querySelectorAll('img')];
  // Video posters supply a complete static screen before the first decoded frame.
  const posters=[...scene.querySelectorAll('video[poster]')].map(v=>{const i=new Image();i.src=v.poster;return decode(i)});
  await Promise.race([Promise.all([...images.map(decode),...posters]),new Promise(r=>setTimeout(r,1200))]);
  // Scale projected layers before revealing the composed image.
  scene.querySelectorAll('.mockup-live-layer,.red-screen-layer,.case-exact-screen-layer').forEach(layer=>layer.style.setProperty('--scene-scale',String(scene.clientWidth/Number(layer.dataset.sceneWidth||(layer.classList.contains('red-screen-layer')?2400:1680)))));
  scene.classList.add('is-ready');
  scene.querySelectorAll('video').forEach(v=>{if(v.poster){v.classList.add('media-frame-ready')}if(v.readyState>=2)frameReady(v)});
 }
 const sceneObserver='IntersectionObserver'in window?new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){prepareScene(e.target);sceneObserver.unobserve(e.target)}}),{rootMargin:matchMedia('(max-width:760px)').matches?'350px 0px':'1000px 0px'}):null;
 function scan(root){
  const list=selector=>[...(root.matches?.(selector)?[root]:[]),...(root.querySelectorAll?.(selector)||[])];
  list('video').forEach(setupVideo);
  list(scenes).forEach(scene=>{if(!prepared.has(scene)){if(sceneObserver)sceneObserver.observe(scene);else prepareScene(scene)}});
  root.querySelectorAll?.('.film-control,.mockup-pause,.hero-mockup-pause').forEach(b=>b.remove());
 }
 scan(document);
 new MutationObserver(records=>records.forEach(r=>r.addedNodes.forEach(n=>{if(n.nodeType===1)scan(n)}))).observe(document.body,{childList:true,subtree:true});
 function resume(){document.querySelectorAll('video').forEach(v=>{if(document.hidden||!isVisible(v))v.pause();else play(v)})}
 addEventListener('pageshow',resume);document.addEventListener('visibilitychange',resume);
 document.addEventListener('touchstart',resume,{passive:true});document.addEventListener('pointerdown',resume,{passive:true});
})();
