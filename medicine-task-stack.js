(()=>{'use strict';
 const section=document.querySelector('.med-task-flow');if(!section)return;
 const cards=[...section.querySelectorAll('.med-stack-card')], canvas=section.querySelector('canvas'),ctx=canvas.getContext('2d',{alpha:true});
 const panes=cards.map(card=>{const face=card.firstElementChild,shade=document.createElement('div');shade.className='med-card-shade';shade.setAttribute('aria-hidden','true');face.appendChild(shade);const layer=document.createElement('canvas');layer.className='med-glass-wave';layer.setAttribute('aria-hidden','true');face.prepend(layer);return {face,layer,context:layer.getContext('2d')};});
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let w=0,h=0,dpr=1,active=false,last=0,time=0,raf=0,age=0;
 const bluePalette=[[72, 206, 252], [24, 122, 180], [54, 183, 244], [56, 190, 234], [67, 205, 252], [37, 104, 141], [27, 113, 143], [111, 203, 227], [84, 210, 250], [39, 169, 221], [68, 116, 141], [23, 120, 183], [3, 129, 194], [32, 120, 177], [0, 94, 153], [17, 87, 159], [16, 85, 112], [2, 121, 186], [22, 147, 205], [104, 221, 254], [53, 172, 221], [3, 88, 125], [7, 155, 214], [37, 75, 119], [70, 138, 167], [45, 122, 162], [33, 98, 146], [0, 74, 131], [81, 221, 255], [67, 208, 252], [163, 253, 255], [31, 143, 194], [22, 148, 203], [0, 73, 129], [82, 126, 146], [14, 104, 165], [0, 105, 168], [54, 119, 167], [111, 161, 208], [16, 120, 167], [0, 121, 184], [0, 62, 115], [37, 148, 193], [86, 209, 252], [92, 203, 245], [64, 156, 202], [7, 86, 132], [150, 215, 234], [112, 217, 252], [11, 84, 123], [0, 96, 150], [100, 205, 247], [37, 126, 196], [22, 86, 125], [7, 84, 129], [114, 240, 255], [46, 152, 212], [110, 243, 255], [87, 211, 247], [87, 196, 241], [61, 93, 116], [28, 94, 138], [22, 191, 244], [23, 151, 194], [64, 124, 165], [16, 133, 180], [46, 133, 174], [82, 211, 240], [2, 127, 199], [1, 90, 156], [8, 115, 174], [49, 158, 214], [0, 59, 112], [46, 189, 236], [24, 127, 181], [117, 225, 250], [9, 116, 174], [19, 118, 171], [2, 66, 124], [151, 255, 255], [23, 136, 182], [89, 201, 254], [0, 106, 162], [42, 140, 180], [67, 184, 234], [100, 213, 247], [96, 222, 255], [33, 194, 240], [66, 175, 232], [2, 71, 122], [106, 204, 233], [55, 168, 230], [103, 235, 255], [28, 108, 145], [32, 93, 120], [21, 99, 139]], warmPalette=[[215, 104, 34], [218, 68, 28], [169, 101, 67], [158, 47, 18], [174, 130, 111], [156, 87, 51], [189, 86, 32], [201, 72, 13], [147, 54, 12], [184, 98, 56], [239, 93, 26], [175, 61, 22], [215, 77, 1], [197, 100, 51], [159, 60, 11], [197, 86, 41], [212, 135, 65], [211, 64, 45], [205, 98, 27], [151, 126, 96], [152, 67, 45], [207, 123, 69], [167, 82, 45], [153, 55, 9]];

 const mouse={x:-9999,y:-9999,on:false,vx:0,vy:0,last:0},particles=[];
 const atlas=document.createElement('canvas');atlas.width=512;atlas.height=256;const ac=atlas.getContext('2d');
 const colours=[...bluePalette,...warmPalette];
 colours.forEach(([red,green,blue],i)=>{const x=i%16*32,y=Math.floor(i/16)*32;const g=ac.createRadialGradient(x+11,y+10,0,x+16,y+16,15);g.addColorStop(0,`rgb(${Math.min(255,red*1.08)},${Math.min(255,green*1.08)},${Math.min(255,blue*1.08)})`);g.addColorStop(.45,`rgb(${red},${green},${blue})`);g.addColorStop(1,`rgb(${red*.48},${green*.48},${blue*.48})`);ac.fillStyle=g;ac.beginPath();ac.arc(x+16,y+16,15,0,Math.PI*2);ac.fill()});
 function resize(){w=innerWidth;h=innerHeight;dpr=Math.min(devicePixelRatio||1,1.6);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);particles.length=0;const count=w<600?3200:10000;for(let i=0;i<count;i++){const warm=Math.random()<.035;particles.push({u:Math.random(),band:Math.random()*2-1,thickness:(Math.random()+Math.random()+Math.random()-1.5),seed:Math.random(),colour:warm?bluePalette.length+Math.floor(Math.random()*warmPalette.length):Math.floor(Math.random()*bluePalette.length),dx:0,dy:0,vx:0,vy:0,carry:0});}}
 function move(e){if(e.pointerType==='touch')return;const r=canvas.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,now=performance.now();if(now-mouse.last<160){mouse.vx=Math.max(-24,Math.min(24,(x-mouse.x)*.45));mouse.vy=Math.max(-24,Math.min(24,(y-mouse.y)*.45));}mouse.x=x;mouse.y=y;mouse.on=true;mouse.last=now;}
 section.addEventListener('pointermove',move,{passive:true});section.addEventListener('pointerleave',()=>mouse.on=false);
 const smoothstep=t=>t*t*(3-2*t);
 let stackFrame=0;
 function stack(){stackFrame=0;
  // Read the whole stack before writing any transforms: no read/write layout churn.
  const metrics=cards.map(card=>({top:card.getBoundingClientRect().top,pin:parseFloat(getComputedStyle(card).top)||100}));
  cards.forEach((card,i)=>{const {top,pin}=metrics[i],face=card.firstElementChild;
   // Same behaviour as the home page stack: the card stays natively sticky; the next card
   // slides over it while it eases back in scale and is dimmed. No displacement near the pin.
   const next=metrics[i+1],k=next?Math.max(0,Math.min(1,1-(next.top-pin)/Math.max(1,card.offsetHeight))):0;
   const raw=Math.max(0,Math.min(1,(h*.90-top)/Math.max(1,h*.90-pin)));
   face.style.setProperty('--glass-progress',smoothstep(raw).toFixed(4));
   face.style.transform=k?`scale(${(1-k*.06).toFixed(4)})`:'';
   const shade=card._shade||(card._shade=face.querySelector('.med-card-shade'));if(shade)shade.style.opacity=(k*.55).toFixed(3);
  });
 }
 function scheduleStack(){if(!stackFrame&&!reduced)stackFrame=requestAnimationFrame(stack);}
 window.addEventListener('scroll',scheduleStack,{passive:true});window.addEventListener('resize',scheduleStack,{passive:true});

 function draw(now){raf=0;if(!active||reduced)return;const elapsed=Math.max(0,(now-last)/1000)||.016,dt=Math.min(elapsed,.04);last=now;time+=dt;age+=Math.min(elapsed,.5);ctx.clearRect(0,0,w,h);const step=dt*60,ordered=[];
 // One broad folded sheet, with a dense crest and a softly dispersing edge.
 // Spheres travel through the sheet from left to right rather than orbiting in cords.
 for(const p of particles){p.u=(p.u+dt*.060)%1;
 const u=p.u,v=p.band,phase=u*6.283-time*.18;
 const centre=h*(.55-.145*Math.sin(phase));
 const width=h*(.16+.040*Math.sin(phase+.65));
 const fold=Math.sin(v*2.1+phase*.58+time*.13);
 const edge=Math.pow(Math.abs(v),5);
 const scatter=p.seed>.86?edge*(.35+p.seed)*h*.09:0;
 const x=-w*.10+u*w*1.20+v*Math.cos(phase*.6)*w*.028;
 const y=centre+v*width+fold*h*.053+p.thickness*(9+edge*25)+Math.sin(p.seed*70+u*7+time*.45)*scatter;
 const depth=Math.cos(v*1.7+phase*.55);
 ordered.push({p,x,y,z:depth,r:(1.65+p.seed*1.20)*(1+depth*.12),edge});}
 ordered.sort((a,b)=>a.z-b.z);
 for(const {p,x,y,z,r,edge} of ordered){
 p.carry=Math.max(0,p.carry-step*.006);const spring=p.carry>.05?.0028:.010;
 p.vx+=-p.dx*spring*step;p.vy+=-p.dy*spring*step;
 if(mouse.on){const dx=x+p.dx-mouse.x,dy=y+p.dy-mouse.y,d=Math.hypot(dx,dy),radius=195;
 if(d<radius&&d>.05){const f=Math.pow(1-d/radius,1.35),nx=dx/d,ny=dy/d;
 const speed=Math.min(1,Math.hypot(mouse.vx,mouse.vy)/9),activity=Math.max(0,1-(now-mouse.last)/950);
 const curl=.8+Math.sin(time*1.5+p.seed*6)*.45,outward=.7*(.18+speed*2.4)*activity,fluid=.35+activity*.65;
 p.vx+=(nx*outward-ny*curl*fluid+mouse.vx*.30)*f*step;p.vy+=(ny*outward+nx*curl*fluid+mouse.vy*.30)*f*step;
 if(f>.12&&activity>.1)p.carry=Math.min(1,p.carry+.09*f*step);
 if(p.carry>.12&&p.seed>.53){const a=time*(.7+p.seed*.8)+p.seed*24,orbit=65+p.seed*135;
 p.vx+=(mouse.x+Math.cos(a)*orbit-x-p.dx)*.004*p.carry*f*step;p.vy+=(mouse.y+Math.sin(a)*orbit*.73-y-p.dy)*.004*p.carry*f*step;}}}
 const damping=Math.pow(p.carry>.1?.95:.90,step);p.vx*=damping;p.vy*=damping;p.dx+=p.vx*step;p.dy+=p.vy*step;
 const px=x+p.dx,py=y+p.dy;const reveal=Math.max(0,Math.min(1,(age*.65-p.u)*8));
 ctx.globalAlpha=(.82+(z+1)*.08)*(1-edge*.55)*Math.min(1,p.u*18,(1-p.u)*18)*reveal;
 const size=r*2;ctx.drawImage(atlas,p.colour%16*32,Math.floor(p.colour/16)*32,32,32,px-r,py-r,size,size);}
 ctx.globalAlpha=1;
 // Sample the same live wave directly for each pane. Stacked panes cannot
 // successively darken or isolate its moving colour from the foreground pane.
 const field=canvas.getBoundingClientRect();
 for(const pane of panes){const rect=pane.face.getBoundingClientRect();if(rect.bottom<0||rect.top>h)continue;
 const pw=Math.round(pane.face.clientWidth*.5),ph=Math.round(pane.face.clientHeight*.5);if(pane.layer.width!==pw||pane.layer.height!==ph){pane.layer.width=pw;pane.layer.height=ph;}
 const pc=pane.context;pc.clearRect(0,0,pw,ph);pc.drawImage(canvas,(field.left-rect.left)*pw/rect.width,(field.top-rect.top)*ph/rect.height,field.width*pw/rect.width,field.height*ph/rect.height);}
 mouse.vx*=Math.pow(.93,step);mouse.vy*=Math.pow(.93,step);raf=requestAnimationFrame(draw);}
 resize();scheduleStack();window.addEventListener('resize',resize,{passive:true});new IntersectionObserver(entries=>{active=entries[0].isIntersecting&&!document.hidden;if(active&&!raf){last=performance.now();scheduleStack();raf=requestAnimationFrame(draw)}},{rootMargin:'0px'}).observe(section);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){active=false;if(raf)cancelAnimationFrame(raf);raf=0;}else{const r=section.getBoundingClientRect();active=r.bottom>0&&r.top<h;if(active&&!raf){last=performance.now();raf=requestAnimationFrame(draw);}}});
})();
