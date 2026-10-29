const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
const projects=[
{title:'Neuromed.Ai',href:'case-neuromed.html',description:'Разработка B2B-сайта для медицинского AI-продукта',image:'portfolio-neuromed-approved.webp',width:2460,height:1200,srcset:"",bg:'#08090d',tags:['Медицина','AI-технологии'],cls:'feature-neuromed'},
{title:'Персона',href:'case-persona.html',description:'Международная сеть салонов красоты',image:'portfolio-persona-full.webp',width:1200,height:1200,srcset:"",bg:'#08090d',tags:['Красота']},
{title:'Sun Runner',href:'case-sun-runner.html',description:'Производство полезных десертов в Калифорнии',image:'portfolio-sunrunner-full.webp',width:1365,height:1365,srcset:"",bg:'#08090d',tags:['Еда']},
{title:'Центр долговых юристов',href:'case-cdu.html',description:'Юридический центр по решению долговых проблем',image:'portfolio-cdu-full.webp',width:1500,height:1500,srcset:"",bg:'#08090d',tags:['Юридические услуги']},
{title:'Sky Class',href:'case-sky-class.html',description:'Организация индивидуальных путешествий',image:'case-skyclass.webp',width:2000,height:1500,srcset:"assets/case-skyclass-640.webp 640w, assets/case-skyclass-960.webp 960w, assets/case-skyclass-1280.webp 1280w, assets/case-skyclass.webp 2000w",bg:'#08090d',tags:['Туризм']},
{title:'Магомед Сулиманов',href:'case-magomed-sulimanov.html',description:'Персональный сайт врача-онколога',image:'case-magomed.webp',width:1672,height:941,srcset:"assets/case-magomed-640.webp 640w, assets/case-magomed-960.webp 960w, assets/case-magomed-1280.webp 1280w, assets/case-magomed.webp 1672w",bg:'#08090d',tags:['Медицина']},
{title:'Level Up',href:'case-level-up.html',description:'Сеть студий маникюра в Сан-Франциско',image:'case-levelup.webp',width:1680,height:1120,srcset:"assets/case-levelup-640.webp 640w, assets/case-levelup-960.webp 960w, assets/case-levelup-1280.webp 1280w, assets/case-levelup.webp 1680w",bg:'#343434',tags:['Красота'],cls:'feature-levelup'},
{title:'Smart Digital Solutions',href:'case-smart-digital-solutions.html',description:'Digital-решения для фармбизнеса',image:'case-smartdigital.webp',width:1680,height:1260,srcset:"assets/case-smartdigital-640.webp 640w, assets/case-smartdigital-960.webp 960w, assets/case-smartdigital-1280.webp 1280w, assets/case-smartdigital.webp 1680w",bg:'#08090d',tags:['Медицина','Маркетинг']},
{title:'Медфрендс',href:'case-medfriends.html',description:'Клиника превентивной медицины',image:'portfolio-medfriends-full.webp',width:1500,height:1500,srcset:"",bg:'#08090d',tags:['Медицина']}];
const grid=document.querySelector('.project-grid');projects.forEach((p,i)=>{const card=document.createElement('article');card.className='project '+(p.cls||'');card.style.setProperty('--project-bg',p.bg);if(i>=7){card.hidden=true;card.dataset.extra='true';card.id='extra-project-'+i;}card.innerHTML=`<${p.href?'a':'button'} class="project-visual" data-project="${i}"${p.href?` href="${p.href}"`: ''} aria-label="${p.href?'Открыть кейс':'Рассмотреть проект'} ${p.title}">${p.image?`<picture style="display:contents">${i===0?'<source media="(max-width:760px)" srcset="assets/portfolio-neuromed-approved-mobile.webp">':''}<img src="assets/${p.image}" width="${p.width}" height="${p.height}" alt="${p.title}" ${p.srcset?`srcset="${p.srcset}"`:''} sizes="${i===0?'(max-width:760px) calc(100vw - 44px), (max-width:1600px) 83vw, 1360px':'(max-width:760px) calc(100vw - 44px), (max-width:1600px) 40vw, 660px'}" loading="${i===0?'eager':'lazy'}" fetchpriority="${i===0?'high':'auto'}" decoding="async"></picture>`:`<div class="levelup-cover" aria-hidden="true"><span>${p.title==='Level Up'?'Level<br>Up':p.title}<span class="levelup-arrow">↗</span></span></div>`}<span class="project-hover">Смотреть проект</span></${p.href?'a':'button'}><div class="project-meta"><div><h3>${p.title}</h3><p>${p.description}</p><div class="project-tags">${p.tags.map(t=>`<span>${t}</span>`).join('')}</div></div><span class="project-number">${String(i+1).padStart(2,'0')}</span></div>`;grid.append(card)});
const modal=document.querySelector('dialog'),dialogContent=modal.querySelector('.dialog-content');document.addEventListener('click',e=>{const b=e.target.closest('[data-project]');if(!b)return;const p=projects[Number(b.dataset.project)];if(p.href)return;dialogContent.innerHTML=`<h3>${p.title}</h3><p>${p.description}</p>`;modal.showModal()});modal.querySelector('.close').onclick=()=>modal.close();modal.addEventListener('click',e=>{if(e.target===modal)modal.close()});
const menuButton=document.querySelector('.menu-toggle'),mobileMenu=document.querySelector('.mobile-menu');menuButton.onclick=()=>{const open=menuButton.getAttribute('aria-expanded')==='true';menuButton.setAttribute('aria-expanded',String(!open));mobileMenu.hidden=open;menuButton.setAttribute('aria-label',open?'Открыть меню':'Закрыть меню')};document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',()=>{mobileMenu.hidden=true;menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Открыть меню')}));document.addEventListener('keydown',e=>{if(e.key==='Escape'){mobileMenu.hidden=true;menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Открыть меню')}});
const header=document.querySelector('.site-header');addEventListener('scroll',()=>header.classList.toggle('scrolled',scrollY>40),{passive:true});
// Reference-style sticky cards: each next card scales and shades the previous one.
const serviceSection=document.querySelector('#services'),serviceCards=[...document.querySelectorAll('.service-card')];
let serviceFrame=0,serviceMetrics=[];
function layoutServices(){serviceMetrics=serviceCards.map(c=>({top:parseFloat(getComputedStyle(c).top)||0,height:c.offsetHeight}));queueServices()}
function renderServices(){serviceFrame=0;const staticLayout=reduceMotion.matches;const positions=serviceCards.map(c=>c.getBoundingClientRect().top);
 serviceCards.forEach((c,i)=>{const entrance=staticLayout?1:Math.max(0,Math.min(1,(innerHeight-positions[i])/(innerHeight*.75)));c.style.setProperty('--service-art-progress',entrance.toFixed(4));const sx=c.querySelector('.sx');if(sx&&positions[i]<innerHeight&&positions[i]+serviceMetrics[i].height>0){const kk=!serviceCards[i+1]?0:Math.max(0,Math.min(1,1-(positions[i+1]-serviceMetrics[i].top)/serviceMetrics[i].height));let t=Math.min(1,entrance+kk*.5);if(innerWidth<=760)t=Math.min(1,entrance+kk*.3);if(staticLayout)t=.7;const sg=(a,b)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x)};sx._T=[sg(0,.5),sg(.22,.72),sg(.6,.98)];sxEase(sx)}const next=serviceCards[i+1];const k=staticLayout||!next?0:Math.max(0,Math.min(1,1-(positions[i+1]-serviceMetrics[i].top)/serviceMetrics[i].height));c.style.transform=k?`scale(${1-k*.06})`:'';c.querySelector('.service-shade').style.opacity=String(k*.55);c.inert=k>=.995;if(c.inert)c.setAttribute('aria-hidden','true');else c.removeAttribute('aria-hidden')})
}
function sxEase(sx){if(sx._raf)return;const n=['--L','--W','--S'];sx._C=sx._C||[0,0,0];const step=()=>{let go=false;sx._C=sx._C.map((v,k)=>{const d=sx._T[k]-v;if(Math.abs(d)<.0008){return sx._T[k]}go=true;return v+d*.045});sx._C.forEach((v,k)=>sx.style.setProperty(n[k],v.toFixed(4)));sx._raf=go?requestAnimationFrame(step):0};sx._raf=requestAnimationFrame(step)}
function queueServices(){if(!serviceFrame)serviceFrame=requestAnimationFrame(renderServices)}
addEventListener('scroll',queueServices,{passive:true});addEventListener('resize',layoutServices);reduceMotion.addEventListener('change',layoutServices);
if('ResizeObserver' in window)new ResizeObserver(layoutServices).observe(serviceSection);
const serviceObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('service-seen');serviceObserver.unobserve(e.target)}}),{threshold:.22});serviceCards.forEach(c=>{if(reduceMotion.matches)c.classList.add('service-seen');else serviceObserver.observe(c)});
layoutServices();
let selectedService='';
function serviceTo(step){const c=serviceCards[step];if(!c)return;const top=parseFloat(getComputedStyle(c).top)||90;scrollTo({top:scrollY+c.getBoundingClientRect().top-top,behavior:reduceMotion.matches?'auto':'smooth'})}
document.querySelectorAll('[data-service]').forEach(b=>b.onclick=()=>{selectedService=b.dataset.service;serviceTo(4)});
const serviceForm=document.querySelector('#service-request');serviceForm.addEventListener('submit',e=>{e.preventDefault();const f=e.currentTarget,contact=f.elements.contact;contact.setCustomValidity(contact.value.trim().length<3?'Укажите телефон, почту или контакт в мессенджере':'');if(!f.reportValidity())return;const tasks=[...f.querySelectorAll('input[name="task"]:checked')].map(x=>x.value),body=`Здравствуйте! Хочу обсудить задачу.\n\nКонтакт: ${contact.value.trim()}\nУслуга: ${[selectedService,...tasks].filter(Boolean).join(', ')||'Индивидуальный запрос'}`;location.href='mailto:hello@katsa.ru?subject='+encodeURIComponent('Заявка с сайта KATSA')+'&body='+encodeURIComponent(body);});serviceForm.elements.contact.addEventListener('input',e=>e.target.setCustomValidity(''));
// Floating heart: a gentle beat and pointer parallax.
const medical=document.querySelector('#medical');medical.addEventListener('pointermove',e=>{if(reduceMotion.matches||e.pointerType==='touch')return;const r=medical.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;medical.style.setProperty('--heart-x',x*22+'px');medical.style.setProperty('--heart-y',y*18+'px');medical.style.setProperty('--heart-rotate',x*4+'deg')});medical.addEventListener('pointerleave',()=>{medical.style.setProperty('--heart-x','0px');medical.style.setProperty('--heart-y','0px');medical.style.setProperty('--heart-rotate','0deg')});
const report=document.querySelector('.report-panel'),chat=document.querySelector('.chat-panel'),timeline=document.querySelector('.timeline-panel');
const calendarEvents={"3": {"title": "Созвон по проекту", "detail": "Обсуждаем текущие задачи и ваши вопросы"}, "5": {"title": "Еженедельный отчёт", "detail": "Что сделано, что в работе и что планируем дальше"}, "9": {"title": "Презентация решений", "detail": "Показываем результат этапа и собираем обратную связь"}, "12": {"title": "Еженедельный отчёт", "detail": "Что сделано, что в работе и что планируем дальше"}, "15": {"title": "Консультация", "detail": "Разбираем вопросы и согласовываем следующие шаги"}, "19": {"title": "Еженедельный отчёт", "detail": "Что сделано, что в работе и что планируем дальше"}, "25": {"title": "Дедлайн этапа", "detail": "Передаём результат текущего этапа на согласование"}};const eventDays=Object.keys(calendarEvents).map(Number);let calendarTimer=0,calendarIndex=0,reportVisible=false,chatVisible=false,chatTimer=0;
function selectDay(day){document.querySelectorAll('.calendar-day').forEach(b=>{const yes=Number(b.dataset.day)===day;b.classList.toggle('selected',yes);b.setAttribute('aria-pressed',String(yes))});const ev=calendarEvents[day];document.querySelector('.agenda-day').textContent=String(day).padStart(2,'0');document.querySelector('.agenda-title').textContent=ev?ev.title:'Нет запланированных событий';document.querySelector('.agenda-detail').textContent=ev?ev.detail:'Даты созвонов и дедлайны согласовываем с вами'}
function calendarCycle(){clearInterval(calendarTimer);if(reportVisible&&!reduceMotion.matches&&!document.hidden)calendarTimer=setInterval(()=>{calendarIndex=(calendarIndex+1)%eventDays.length;selectDay(eventDays[calendarIndex])},4200)}
document.querySelectorAll('[data-day]').forEach(b=>b.onclick=()=>{calendarIndex=eventDays.indexOf(Number(b.dataset.day));selectDay(Number(b.dataset.day));calendarCycle()});selectDay(eventDays[0]);
function replayChat(){chat.classList.remove('play-chat');requestAnimationFrame(()=>{if(chatVisible&&!document.hidden)requestAnimationFrame(()=>chat.classList.add('play-chat'))})}
function chatCycle(){clearInterval(chatTimer);if(chatVisible&&!document.hidden){if(reduceMotion.matches){chat.classList.add('play-chat');return}replayChat();chatTimer=setInterval(replayChat,10000)}}
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.target===report){reportVisible=e.isIntersecting;calendarCycle()}else if(e.target===chat){chatVisible=e.isIntersecting;chatCycle()}else if(e.isIntersecting){e.target.classList.add('reveal-stages');observer.unobserve(e.target)}}),{threshold:.2});[report,chat,timeline].forEach(e=>observer.observe(e));
document.addEventListener('visibilitychange',()=>{calendarCycle();chatCycle()});reduceMotion.addEventListener('change',()=>{calendarCycle();chatCycle()});
document.querySelectorAll('.timeline-stage').forEach((stage,index)=>{const button=stage.querySelector('.stage-title');function reveal(){stage.classList.add('is-open');button.setAttribute('aria-expanded','true')}if(index===0){reveal();return}stage.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch')reveal()});stage.addEventListener('focusin',reveal);button.addEventListener('click',reveal)});
const projectRequest=document.querySelector('#project-request');projectRequest.addEventListener('submit',e=>{e.preventDefault();if(!projectRequest.reportValidity())return;const name=projectRequest.elements.name.value.trim(),contact=projectRequest.elements.contact.value.trim(),task=projectRequest.elements.task.value.trim();if(contact.length<3)return;const body=`Здравствуйте, KATSA! Хочу обсудить проект.\n\nИмя: ${name||'Не указано'}\nКонтакт: ${contact}\n\nЗадача:\n${task||'Обсудим при знакомстве'}`;location.href='mailto:hello@katsa.ru?subject='+encodeURIComponent('Обсудить проект'+(name?' — '+name:''))+'&body='+encodeURIComponent(body)});
// GPU-rendered liquid colour field, independent of scroll reveal animations.
const ambient=document.querySelector('#ambient'),hero=document.querySelector('.hero');
const fluidVertex=`attribute vec2 a_position;void main(){gl_Position=vec4(a_position,0.0,1.0);}`;
const fluidFragment=`precision highp float;
uniform vec2 u_resolution;uniform vec2 u_pointer;uniform float u_time;
void main(){
 vec2 uv=gl_FragCoord.xy/u_resolution;
 float aspect=u_resolution.x/u_resolution.y;
 vec2 p=(uv-.5)*vec2(aspect,1.0);
 vec2 mouse=(u_pointer-.5)*vec2(aspect,1.0);
 float t=u_time;
 p+=(mouse-vec2(.2,0.0))*.24;
 vec2 q=p;
 q.x+=.20*sin(p.y*3.0+t*.37)+.10*cos(p.x*2.0-t*.29);
 q.y+=.24*sin(p.x*2.5-t*.31)+.10*cos(p.y*3.0+t*.26);
 float f=sin(q.x*3.0+q.y*.9+t*.42)
       +.64*cos(q.y*4.0-q.x*.8-t*.33)
       +.28*sin(q.x*2.0-q.y*3.0+t*.25);
 vec3 black=vec3(.002,.003,.007);
 vec3 orange=vec3(.83,.16,.035);
 vec3 warm=vec3(.63,.38,.25);
 vec3 cyan=vec3(.34,.55,.62);
 vec3 blue=vec3(.045,.11,.29);
 vec3 col=mix(black,orange,1.0-smoothstep(.0,.48,f));
 col=mix(col,warm,1.0-smoothstep(-.52,-.28,f));
 col=mix(col,cyan,1.0-smoothstep(-.77,-.49,f));
 col=mix(col,blue,1.0-smoothstep(-1.06,-.74,f));
 col=mix(col,black,1.0-smoothstep(-1.6,-1.12,f));
 gl_FragColor=vec4(col,1.0);
}`;
let fluidGL=null,fluidProgram=null,fluidUniforms=null,fluidFrame=0,fluidVisible=true,fluidLost=false,fluidPaint=0,fluidTime=0,fluidClock=0;
let fluidTarget=[.65,.5],fluidPointer=[.65,.5],fluidCssWidth=1,fluidCssHeight=1;
function initFluid(){
 try{
  fluidGL=ambient.getContext('webgl',{alpha:false,antialias:false,depth:false,stencil:false,powerPreference:'low-power'});
  if(!fluidGL)throw new Error('WebGL unavailable');
  const gl=fluidGL;
  function shader(type,source){const item=gl.createShader(type);gl.shaderSource(item,source);gl.compileShader(item);if(!gl.getShaderParameter(item,gl.COMPILE_STATUS)){gl.deleteShader(item);throw new Error('Shader compilation failed')}return item}
  const vertex=shader(gl.VERTEX_SHADER,fluidVertex),fragment=shader(gl.FRAGMENT_SHADER,fluidFragment);
  fluidProgram=gl.createProgram();gl.attachShader(fluidProgram,vertex);gl.attachShader(fluidProgram,fragment);gl.linkProgram(fluidProgram);gl.deleteShader(vertex);gl.deleteShader(fragment);
  if(!gl.getProgramParameter(fluidProgram,gl.LINK_STATUS))throw new Error('Shader link failed');
  gl.useProgram(fluidProgram);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const position=gl.getAttribLocation(fluidProgram,'a_position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
  fluidUniforms={size:gl.getUniformLocation(fluidProgram,'u_resolution'),pointer:gl.getUniformLocation(fluidProgram,'u_pointer'),time:gl.getUniformLocation(fluidProgram,'u_time')};
  hero.classList.remove('fluid-fallback');sizeFluid();return true;
 }catch(error){hero.classList.add('fluid-fallback');fluidGL=null;return false}
}
function sizeFluid(){if(!fluidGL||fluidLost)return;fluidCssWidth=hero.clientWidth;fluidCssHeight=hero.clientHeight;const limit=fluidGL.getParameter(fluidGL.MAX_TEXTURE_SIZE);const density=Math.min(devicePixelRatio||1,2,limit/fluidCssWidth,limit/fluidCssHeight);ambient.width=Math.round(fluidCssWidth*density);ambient.height=Math.round(fluidCssHeight*density);fluidGL.viewport(0,0,ambient.width,ambient.height)}
function drawFluid(now){
 fluidFrame=0;if(!fluidGL||fluidLost||!fluidVisible||document.hidden)return;
 if(!reduceMotion.matches&&now-fluidPaint<16){fluidFrame=requestAnimationFrame(drawFluid);return}
 if(fluidClock&&!reduceMotion.matches)fluidTime+=Math.min(now-fluidClock,100)*.001;
 fluidClock=now;fluidPaint=now;
 fluidPointer[0]+=(fluidTarget[0]-fluidPointer[0])*.07;fluidPointer[1]+=(fluidTarget[1]-fluidPointer[1])*.07;
 const gl=fluidGL;gl.uniform2f(fluidUniforms.size,ambient.width,ambient.height);gl.uniform2f(fluidUniforms.pointer,fluidPointer[0],fluidPointer[1]);gl.uniform1f(fluidUniforms.time,reduceMotion.matches?0:fluidTime);gl.drawArrays(gl.TRIANGLES,0,6);
 if(!reduceMotion.matches)fluidFrame=requestAnimationFrame(drawFluid);
}
function startFluid(){cancelAnimationFrame(fluidFrame);fluidFrame=0;fluidClock=0;fluidPaint=0;if(fluidGL&&!fluidLost&&fluidVisible&&!document.hidden)drawFluid(performance.now())}
hero.addEventListener('pointermove',e=>{if(reduceMotion.matches||e.pointerType==='touch')return;const r=hero.getBoundingClientRect();fluidTarget=[(e.clientX-r.left)/r.width,1-(e.clientY-r.top)/r.height]});hero.addEventListener('pointerleave',()=>{fluidTarget=[.65,.5]});
ambient.addEventListener('webglcontextlost',e=>{e.preventDefault();fluidLost=true;cancelAnimationFrame(fluidFrame);hero.classList.add('fluid-fallback')});ambient.addEventListener('webglcontextrestored',()=>{fluidLost=false;if(initFluid())startFluid()});
addEventListener('resize',()=>{sizeFluid();startFluid()});document.addEventListener('visibilitychange',startFluid);reduceMotion.addEventListener('change',startFluid);
new IntersectionObserver(entries=>{fluidVisible=entries[0].isIntersecting;startFluid()},{threshold:0}).observe(hero);if(initFluid())startFluid();

// One shared entrance rhythm: rise, fade and gently settle; each entrance plays once.
function setupEntrances(){
  if(!('IntersectionObserver' in window)||reduceMotion.matches)return;
  const targets=new Set();
  function mark(selector,delay=0,distance=52){document.querySelectorAll(selector).forEach(el=>{targets.add(el);el.classList.add('float-reveal');el.style.setProperty('--reveal-delay',delay+'ms');el.style.setProperty('--reveal-rise',distance+'px')})}
  document.querySelectorAll('.hero-line').forEach((el,i)=>{el.classList.add('float-reveal');el.style.setProperty('--reveal-delay',(220+i*180)+'ms');el.style.setProperty('--reveal-rise','65px');targets.add(el)});
  mark('.hero-directions',800,30);
  mark('.studio-intro>.section-label, .section-heading>.section-label, .service-pin>.section-label, .work-section>.section-label',0,24);
  mark('.studio-intro h2, .section-heading h2, .service-heading h2, #work-title, #contact-title',100,54);
  mark('.studio-intro p, .section-aside, .service-heading>p',260,36);
  mark('.studio-intro .glass-button',400,30);

  mark('#medical-title',180,54);mark('.medical-description',340,36);mark('.medical-actions',500,30);
  mark('.service-progress',480,20);
  mark('.report-panel',140,60);mark('.chat-panel',320,60);mark('.timeline-panel',140,60);
  mark('.ron-contact-left>.section-label',0,24);mark('.ron-contact-left>h3',140,32);mark('.contact-intro',280,36);
  mark('.direct-contact>h3',360,28);
  document.querySelectorAll('.contact-messengers>a').forEach((el,i)=>{el.classList.add('float-reveal');el.style.setProperty('--reveal-delay',(400+i*120)+'ms');targets.add(el)});
  mark('#project-request .contact-inputs',260,45);mark('#project-request>label',420,45);mark('.contact-send',580,32);mark('.footer',140,24);
  const entranceObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-revealed');entranceObserver.unobserve(entry.target)}}),{threshold:0,rootMargin:'0px 0px 160px 0px'});
  targets.forEach(el=>{entranceObserver.observe(el);el.addEventListener('transitionend',event=>{if(event.target!==el||event.propertyName!=='translate'||!el.classList.contains('is-revealed'))return;el.classList.remove('float-reveal','is-revealed');el.style.removeProperty('--reveal-delay');el.style.removeProperty('--reveal-rise');targets.delete(el)})});
  document.documentElement.classList.add('entrances-ready');
  function revealAll(){targets.forEach(el=>el.classList.add('is-revealed'));entranceObserver.disconnect();document.documentElement.classList.remove('entrances-ready')}
  reduceMotion.addEventListener('change',e=>{if(e.matches)revealAll()});
  // Keyboard navigation and anchor jumps never leave the visitor waiting for a control.
  document.addEventListener('focusin',e=>{let el=e.target;while(el){if(targets.has(el)){el.style.setProperty('--reveal-delay','0ms');el.classList.add('is-revealed');entranceObserver.unobserve(el)}el=el.parentElement}});
}
setupEntrances();

// Pause the discipline wave outside the offer and when the tab is hidden.
(()=>{let offerVisible=false;const sync=()=>hero.classList.toggle('directions-wave-active',offerVisible&&!document.hidden&&!reduceMotion.matches);const waveObserver=new IntersectionObserver(entries=>{offerVisible=entries[0].isIntersecting;sync()},{threshold:0});waveObserver.observe(hero);document.addEventListener('visibilitychange',sync);reduceMotion.addEventListener('change',sync)})();

// Fill from left to right, finishing exactly at the viewport's vertical centre.
(()=>{const phrases=document.querySelectorAll('.studio-intro h2 span,#projects .section-heading h2 span,#contact-title span');let frame=0;function paint(){frame=0;phrases.forEach(phrase=>{const r=phrase.getBoundingClientRect(),centre=r.top+r.height/2,progress=Math.max(0,Math.min(1,(innerHeight*.9-centre)/(innerHeight*.4)));phrase.style.setProperty('--design-fill',(progress*100).toFixed(2)+'%')})}function schedule(){if(!frame)frame=requestAnimationFrame(paint)}addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);document.fonts.ready.then(schedule);paint()})();

// Slow independent image drift, paused when a case is outside the viewport.
(()=>{const visuals=[...document.querySelectorAll('.project-visual')];const observer=new IntersectionObserver(entries=>entries.forEach(e=>e.target.classList.toggle('drift-visible',e.isIntersecting)),{threshold:0});visuals.forEach((el,i)=>{el.style.setProperty('--drift-duration',(18+i*2.3)+'s');el.style.setProperty('--drift-phase',(-i*3.7)+'s');observer.observe(el)});const sync=()=>document.documentElement.classList.toggle('portfolio-motion-paused',document.hidden);document.addEventListener('visibilitychange',sync);sync();const button=document.querySelector('#more-projects'),extra=[...document.querySelectorAll('[data-extra]')];button.setAttribute('aria-controls',extra.map(el=>el.id).join(' '));button.addEventListener('click',async()=>{
if(button.dataset.collapsing||button.dataset.preparing)return;
const opening=button.getAttribute('aria-expanded')!=='true',root=document.documentElement;
if(opening){button.dataset.preparing='true';button.setAttribute('aria-busy','true');button.textContent='Загружаем кейсы…';await Promise.all(extra.map(async card=>{const img=card.querySelector('img');if(!img)return;img.loading='eager';try{await img.decode()}catch{}}));delete button.dataset.preparing;button.removeAttribute('aria-busy');button.textContent='Смотреть ещё'}
const anchor=root.style.overflowAnchor,behavior=root.style.scrollBehavior;
root.style.overflowAnchor='none';root.style.scrollBehavior='auto';
const startScroll=scrollY,fromHeight=grid.getBoundingClientRect().height;
extra.forEach(el=>el.hidden=!opening);
const toHeight=grid.getBoundingClientRect().height;
const rect=button.getBoundingClientRect();
const target=opening?startScroll:Math.max(0,Math.min(root.scrollHeight-innerHeight,startScroll+rect.top+rect.height/2-innerHeight*.65));
extra.forEach(el=>{el.hidden=false;el.style.opacity=opening?'0':'1';el.inert=true;if(opening)el.classList.add('case-seen')});
grid.style.height=fromHeight+'px';grid.style.overflow='clip';scrollTo(0,startScroll);
button.dataset.collapsing='true';
const finish=()=>{extra.forEach(el=>{el.hidden=!opening;el.style.removeProperty('opacity');el.inert=false});grid.style.removeProperty('height');grid.style.removeProperty('overflow');button.setAttribute('aria-expanded',String(opening));button.textContent=opening?'Свернуть':'Смотреть ещё';if(!opening)scrollTo(0,target);delete button.dataset.collapsing;root.style.overflowAnchor=anchor;root.style.scrollBehavior=behavior};
if(reduceMotion.matches){finish();return}
const began=performance.now(),duration=850;
function step(now){const t=Math.min(1,(now-began)/duration),ease=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
grid.style.height=(fromHeight+(toHeight-fromHeight)*ease)+'px';
extra.forEach((el,i)=>{const fade=opening?Math.max(0,Math.min(1,(t-.12-i*.08)/.6)):Math.max(0,1-t/.55);el.style.opacity=String(fade)});
if(!opening)scrollTo(0,startScroll+(target-startScroll)*ease);
if(t<1)requestAnimationFrame(step);else finish()}
requestAnimationFrame(step)
})})();

// Portfolio cover reveal, independent of image drift and hover transforms.
(()=>{if(reduceMotion.matches||!('IntersectionObserver' in window))return;const cards=[...document.querySelectorAll('.project')];cards.forEach(el=>el.classList.add('case-motion'));const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting&&!e.target.hidden){e.target.classList.add('case-seen');observer.unobserve(e.target)}}),{threshold:0,rootMargin:'0px 0px 400px 0px'});cards.forEach(el=>observer.observe(el));reduceMotion.addEventListener('change',e=>{if(e.matches){cards.forEach(el=>el.classList.add('case-seen'));observer.disconnect()}})})();

// Re-evaluate the cover below the stationary pointer during scrolling.
(()=>{const fine=matchMedia('(hover:hover) and (pointer:fine)');if(!fine.matches)return;const cursor=document.createElement('div');cursor.className='project-cursor';cursor.setAttribute('aria-hidden','true');cursor.innerHTML='Смотреть<br>проект';document.body.append(cursor);document.documentElement.classList.add('project-cursor-ready');let frame=0,x=-1,y=-1,inside=false;
const hide=()=>{inside=false;cursor.classList.remove('visible')};
const paint=()=>{frame=0;cursor.style.transform=`translate3d(${x-59}px,${y-59}px,0)`;const hit=inside&&fine.matches&&!document.hidden&&document.elementFromPoint(x,y);cursor.classList.toggle('visible',!!(hit&&hit.closest('.project-visual')))};
const schedule=()=>{if(!frame)frame=requestAnimationFrame(paint)};
document.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;x=e.clientX;y=e.clientY;inside=true;schedule()},{passive:true});
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);
document.documentElement.addEventListener('pointerleave',hide);addEventListener('blur',hide);document.addEventListener('visibilitychange',()=>{if(document.hidden)hide();else schedule()});document.addEventListener('click',schedule);
fine.addEventListener('change',()=>{document.documentElement.classList.toggle('project-cursor-ready',fine.matches);schedule()})})();


// Reserve the heart's original space independently of the labels' new 18px text.
(()=>{const section=document.querySelector('#medical'),orbit=section.querySelector('.medical-orbit'),labels=[...section.querySelectorAll('.medical-tags li')],context=document.createElement('canvas').getContext('2d');let frame=0;
function restoreSize(){frame=0;if(innerWidth<=760){section.style.removeProperty('--heart-fixed-width');section.style.removeProperty('--heart-reference-column');return}const compact=innerWidth<=1050,labelStyle=getComputedStyle(labels[0]),dotStyle=getComputedStyle(labels[0],'::before');context.font=`${labelStyle.fontWeight} ${compact?13:15}px ${labelStyle.fontFamily}`;const textWidth=Math.max(...labels.map(label=>context.measureText(label.textContent.trim()).width));const box=textWidth+parseFloat(labelStyle.paddingLeft)+parseFloat(labelStyle.paddingRight)+parseFloat(labelStyle.borderLeftWidth)+parseFloat(labelStyle.borderRightWidth)+parseFloat(labelStyle.columnGap)+parseFloat(dotStyle.width);const column=Math.max(0,orbit.clientWidth-parseFloat(getComputedStyle(orbit).columnGap)-box);section.style.setProperty('--heart-reference-column',column+'px');section.style.setProperty('--heart-fixed-width',(column*(compact?1.25:1.17))+'px')}
function queue(){if(!frame)frame=requestAnimationFrame(restoreSize)}
if('ResizeObserver' in window)new ResizeObserver(queue).observe(orbit);addEventListener('resize',queue);if(document.fonts)document.fonts.ready.then(queue);queue()})();
// Compact chronology is a readable vertical sequence, with no hidden descriptions.
(()=>{const stages=[...document.querySelectorAll('.timeline-stage')],hint=document.querySelector('.timeline-header>span');const sync=()=>{if(innerWidth<=1100){stages.forEach(stage=>{stage.classList.add('is-open');stage.querySelector('.stage-title').setAttribute('aria-expanded','true')});if(hint)hint.textContent='От первого знакомства до запуска'}else if(hint)hint.textContent='Наведите на этап, чтобы увидеть описание'};addEventListener('resize',sync);sync()})();
