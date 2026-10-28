/* Reference-matched particle portrait: local displacement + damped spring return. */
(()=>{
 if(!document.documentElement.classList.contains('med-dark-offer'))return;
 const hero=document.querySelector('.med-hero'),field=hero?.querySelector('.med-rib-field');let canvas=field?.querySelector('canvas');if(!canvas)return;
 document.documentElement.classList.add('med-body-offer');
 const reduced=matchMedia('(prefers-reduced-motion:reduce)'),image=new Image();image.src='assets/medicine-particle-body.webp';
 let points=[],position,colour,size,gl,program,buffer,draw,w=1,h=1,scale=1,ox=0,oy=0,dpr=1,time=0,last=0,frame=0,visible=true,ready=false;
 let mx=-1e6,my=-1e6,pointerInside=false,moveX=0,moveY=0,lastPointer=0,oldMx=0,oldMy=0,mob=false,posed=null,touchUntil=0,cbuf=null;
 // Mobile pose: arms lowered along the body and slightly shortened, so the torso and heart can be shown larger.
 function pose(m){if(posed===m)return;posed=m;for(const p of points){let x=p.bx,y=p.by,fade=1;if(m){const left=x<836,sx=left?622:1050,sy=395,edge=left?(652-x)/55:(x-1020)/55,k=Math.max(0,Math.min(1,edge)),wgt=k*k*(3-2*k);if(wgt>0){const a=(left?-1:1)*.62*wgt,dx=x-sx,dy=y-sy,c=Math.cos(a),s=Math.sin(a);x=sx+dx*c-dy*s;y=sy+dx*s+dy*c}fade=1-smooth(760,900,y)}p.hx=x;p.hy=y;p.x=x;p.y=y;p.vx=p.vy=0;p.pa=p.alpha*fade;p.hw=m?(1-smooth(215,300,p.by))*(1-smooth(110,150,Math.abs(p.bx-846))):0}if(colour){for(let i=0;i<points.length;i++)colour[i*4+3]=points[i].pa;if(gl&&cbuf){gl.bindBuffer(gl.ARRAY_BUFFER,cbuf);gl.bufferData(gl.ARRAY_BUFFER,colour,gl.STATIC_DRAW)}}}

 const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t)};
 function initialise(){
  if(ready)return;
  const sample=document.createElement('canvas');sample.width=image.width;sample.height=image.height;const c=sample.getContext('2d',{willReadFrequently:true});c.drawImage(image,0,0);const pixels=c.getImageData(0,0,image.width,image.height).data;
  const step=4.3;
  // Spatially even, slightly jittered samples avoid visible rows of points.
  for(let py=2;py<image.height;py+=step)for(let px=2;px<image.width;px+=step){
   const ix=Math.min(image.width-1,Math.floor(px+Math.sin(px*17.13+py*8.31)*1.45)),iy=Math.min(image.height-1,Math.floor(py+Math.cos(px*7.3-py*11.6)*1.45)),k=(iy*image.width+ix)*4;
   const r=pixels[k],g=pixels[k+1],b=pixels[k+2],light=Math.max(r,g,b);if(light<28||light-Math.min(r,g,b)<12)continue;
   const nx=ix/image.width,ny=iy/image.height;
   // The lower abdomen dissolves above the groin; hands remain intact at the sides.
   const central=1-smooth(.15,.24,Math.abs(nx-.5)),fade=1-central*smooth(.77,.88,ny);
   if(fade<.03)continue;
   points.push({bx:ix,by:iy,hx:ix,hy:iy,x:ix,y:iy,vx:0,vy:0,vz:0,lift:0,carry:0,heart:r>b*1.4?1-smooth(.65,1.2,Math.hypot((ix-906)/64,(iy-474)/77)):0,r:r/255,g:g/255,b:b/255,alpha:fade,z:(light/255)*12,seed:Math.sin(ix*12.1+iy*3.7)*.5+.5,s:step*(.82+light/255*.58)});
  }
  position=new Float32Array(points.length*3);colour=new Float32Array(points.length*4);size=new Float32Array(points.length);
  for(let i=0;i<points.length;i++){const p=points[i];colour.set([p.r,p.g,p.b,p.alpha],i*4);size[i]=p.s}
  gl=canvas.getContext('webgl',{alpha:true,antialias:false,depth:false,powerPreference:'low-power'});
  if(gl)try{setupGL()}catch{draw=null}
  if(!draw)setupCanvas();ready=true;resize();field.classList.add('body-ready');start();
 }
 function setupGL(){
  const vert=`attribute vec3 position;attribute vec4 colour;attribute float size;uniform vec2 viewport,offset;uniform float scale,density;varying vec4 col;void main(){float depth=1.+position.z*.0015;vec2 p=(position.xy-vec2(${image.width*.5},${image.height*.5}))*depth*scale+vec2(${image.width*.5},${image.height*.5})*scale+offset;gl_Position=vec4(p.x/viewport.x*2.-1.,1.-p.y/viewport.y*2.,0.,1.);gl_PointSize=size*scale*density*depth;col=colour;}`;
  const frag=`precision mediump float;varying vec4 col;void main(){vec2 p=gl_PointCoord*2.-1.;float r=dot(p,p);if(r>1.)discard;float z=sqrt(1.-r);float shade=.58+.42*max(0.,dot(vec3(p,z),normalize(vec3(-.45,-.6,1.))));float spec=pow(max(0.,dot(vec3(p,z),normalize(vec3(-.35,-.45,1.)))),18.);gl_FragColor=vec4(col.rgb*shade+col.rgb*spec*.12,col.a*(1.-smoothstep(.75,1.,r)));}`;
  function shader(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error('shader');return s}
  program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vert));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,frag));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('link');gl.useProgram(program);
  function attribute(name,data,n,usage){const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,data,usage);const a=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,n,gl.FLOAT,false,0,0);return b}
  buffer=attribute('position',position,3,gl.DYNAMIC_DRAW);cbuf=attribute('colour',colour,4,gl.STATIC_DRAW);attribute('size',size,1,gl.STATIC_DRAW);
  const viewport=gl.getUniformLocation(program,'viewport'),offset=gl.getUniformLocation(program,'offset'),zoom=gl.getUniformLocation(program,'scale'),density=gl.getUniformLocation(program,'density');
  gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.clearColor(0,0,0,0);
  draw=()=>{gl.viewport(0,0,canvas.width,canvas.height);gl.clear(gl.COLOR_BUFFER_BIT);gl.uniform2f(viewport,w,h);gl.uniform2f(offset,ox,oy);gl.uniform1f(zoom,scale);gl.uniform1f(density,dpr);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferSubData(gl.ARRAY_BUFFER,0,position);gl.drawArrays(gl.POINTS,0,points.length)};canvas.dataset.renderer='particle-webgl';
 }
 function setupCanvas(){
  const replacement=document.createElement('canvas');replacement.className=canvas.className;replacement.setAttribute('aria-hidden','true');canvas.replaceWith(replacement);canvas=replacement;const c=canvas.getContext('2d');if(!c)return;
  // Cache shaded beads once, then draw only sprites during interaction.
  const atlas=document.createElement('canvas'),colours=new Map();let total=0;
  for(const p of points){const key=((Math.round(p.r*15)*16+Math.round(p.g*15))*16+Math.round(p.b*15));if(!colours.has(key))colours.set(key,total++);p.sprite=colours.get(key)}
  atlas.width=512;atlas.height=Math.ceil(total/32)*16;const a=atlas.getContext('2d');
  for(const [key,index] of colours){const r=(key>>8)*17,g=((key>>4)&15)*17,b=(key&15)*17,sx=index%32*16,sy=Math.floor(index/32)*16;const gradient=a.createRadialGradient(sx+5,sy+4,0,sx+8,sy+8,7.5);gradient.addColorStop(0,`rgb(${Math.min(255,r*1.08)},${Math.min(255,g*1.08)},${Math.min(255,b*1.08)})`);gradient.addColorStop(.45,`rgb(${r},${g},${b})`);gradient.addColorStop(1,`rgb(${r*.48},${g*.48},${b*.48})`);a.fillStyle=gradient;a.beginPath();a.arc(sx+8,sy+8,7.5,0,Math.PI*2);a.fill()}
  draw=()=>{c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,w,h);for(let i=0;i<points.length;i++){const p=points[i],depth=1+position[i*3+2]*.0015,s=p.s*scale*depth,px=((position[i*3]-image.width*.5)*depth+image.width*.5)*scale+ox-s*.5,py=((position[i*3+1]-image.height*.5)*depth+image.height*.5)*scale+oy-s*.5;if(px< -s||px>w||py< -s||py>h)continue;c.globalAlpha=p.pa??p.alpha;c.drawImage(atlas,p.sprite%32*16,Math.floor(p.sprite/32)*16,16,16,px,py,s,s)}c.globalAlpha=1};canvas.dataset.renderer='particle-canvas2d';
 }
 function resize(){if(!ready)return;const r=field.getBoundingClientRect();w=r.width;h=r.height;dpr=Math.min(devicePixelRatio||1,2,Math.sqrt(2100000/(w*h)));canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);mob=w<761;pose(mob);oy=mob?0:95;scale=mob?Math.min(w*.98/760,h/860):Math.min(w*.99/image.width,(h-oy)/image.height);ox=(w-image.width*scale)/2;paint(0);draw()}
 function paint(dt){
  const radius=(mob?150:195)/scale,push=(mob?.6:.7)/scale,alive=!reduced.matches;
  // Touch screens: a short automatic sweep across the chest about a second after the body appears, then every 11 s.
  if(mob&&alive&&dt&&performance.now()>touchUntil){const demo=(time-1.1)%11,active=time>1.1&&demo<2.3;
   if(active){const t=demo/2.3,e=t*t*(3-2*t),nx=image.width*(.3+.42*e),ny=image.height*(.4+Math.sin(t*Math.PI)*.07);moveX=Math.max(-24/scale,Math.min(24/scale,(nx-oldMx)*.45));moveY=Math.max(-24/scale,Math.min(24/scale,(ny-oldMy)*.45));mx=oldMx=nx;my=oldMy=ny;lastPointer=performance.now();pointerInside=true}else pointerInside=false}
  const phase=time%1.02;
  const pulse=alive?(Math.exp(-Math.pow((phase-.13)/.060,2))+.58*Math.exp(-Math.pow((phase-.31)/.075,2)))*(mob?.13:.105):0;
  const ls=Math.sin(time*Math.PI*2/8.5),yaw=mob&&alive?.78*Math.sign(ls)*Math.pow(Math.abs(ls),.45):0,yc=Math.cos(yaw),ys=Math.sin(yaw);
  for(let i=0;i<points.length;i++){
   const p=points[i],u=(p.hx-image.width*.5)/image.width,v=p.hy/image.height;
   // Continuous low-frequency 3D flow through the whole figure, not just a bobbing image.
   const drift=alive?Math.sin(time*.52+v*5.5)*12+Math.sin(time*.31+u*5+v*2)*6:0;
   const float=alive?(p.seed>.965?15:3.5):0;
   let turn=0,turnZ=0;if(p.hw>0&&yaw){const dx=p.hx-846,n=Math.max(-1,Math.min(1,dx/100)),z=Math.sqrt(1-n*n)*105;turn=(dx*yc+z*ys-dx)*p.hw;turnZ=(z*yc-dx*ys-z)*p.hw*.4}
   const homeX=p.hx+turn+drift+Math.cos(time*.63+p.seed*18)*float;
   const homeY=p.hy+(alive?Math.sin(time*.40+u*4.2)*5+Math.cos(time*.69+v*4+p.seed*7)*float*.7:0);
   const homeZ=(alive?Math.sin(time*.43+u*5+v*3)*10+Math.cos(time*.57+p.seed*14)*float:0)+turnZ;
   if(dt){
    p.carry=Math.max(0,p.carry-dt*.006);
    const spring=p.carry>.05?.0028:.010;
    p.vx+=(homeX-p.x)*spring*dt;p.vy+=(homeY-p.y)*spring*dt;
    if(pointerInside&&alive){
     const dx=p.x-mx,dy=p.y-my,d=Math.hypot(dx,dy);
     if(d<radius&&d>.05){
      const f=Math.pow(1-d/radius,1.35),nx=dx/d,ny=dy/d;
      // A broad, irregular current: the moving pointer tears the silhouette into
      // a rotating wake; a resting pointer does not excavate a circular hole.
      const speed=Math.min(1,Math.hypot(moveX,moveY)*scale/9);
      const activity=Math.max(0,1-(performance.now()-lastPointer)/950);
      const curl=(.8+Math.sin(time*1.5+p.seed*6)*.45)/scale;
      const outward=push*(.18+speed*2.4)*activity;
      const fluid=(.35+activity*.65)*(mob?.9:1),drag=mob?.26:.30;
      p.vx+=(nx*outward-ny*curl*fluid+moveX*drag)*f*dt;
      p.vy+=(ny*outward+nx*curl*fluid+moveY*drag)*f*dt;
      p.lift+=(52/scale*f-p.lift)*.06*dt;
      if(f>.12&&activity>.1)p.carry=Math.min(1,p.carry+.09*f*dt);
      if(p.carry>.12&&p.seed>.53){
       const angle=time*(.7+p.seed*.8)+p.seed*24;
       const r=(65+p.seed*135)/scale;
       const targetX=mx+Math.cos(angle)*r,targetY=my+Math.sin(angle)*r*.73;
       p.vx+=(targetX-p.x)*.004*p.carry*f*dt;
       p.vy+=(targetY-p.y)*.004*p.carry*f*dt;
      }
     }
    }
    p.lift*=Math.pow(.97,dt);
    const damping=Math.pow(p.carry>.1?.95:.90,dt);p.vx*=damping;p.vy*=damping;
    p.x+=p.vx*dt;p.y+=p.vy*dt;
   }else{p.x=homeX;p.y=homeY;p.lift=0}
   const beat=pulse*p.heart;
   position[i*3]=p.x+(p.hx-906)*beat;
   position[i*3+1]=p.y+(p.hy-474)*beat;
   position[i*3+2]=homeZ+p.lift+beat*65;
  }
  moveX*=.93;moveY*=.93;
 }
 function tick(now){frame=0;if(!ready||!visible||document.hidden)return;if(now-last>=32){const dt=Math.min(2,(now-last)/16.667||2);last=now;time+=dt/60;paint(dt);draw()}if(!reduced.matches)frame=requestAnimationFrame(tick)}
 function start(){if(ready&&visible&&!document.hidden&&!frame&&!reduced.matches)frame=requestAnimationFrame(tick)}
 hero.addEventListener('pointermove',e=>{if(!ready||e.pointerType==='touch'||reduced.matches)return;const r=field.getBoundingClientRect();pointerInside=e.clientY>=r.top&&e.clientY<=r.bottom;const nextX=(e.clientX-r.left-ox)/scale,nextY=(e.clientY-r.top-oy)/scale,now=performance.now();if(lastPointer&&now-lastPointer<160){moveX=Math.max(-24/scale,Math.min(24/scale,(nextX-oldMx)*.45));moveY=Math.max(-24/scale,Math.min(24/scale,(nextY-oldMy)*.45))}mx=oldMx=nextX;my=oldMy=nextY;lastPointer=now;start()},{passive:true});hero.addEventListener('pointerleave',()=>{pointerInside=false});
 const touch=e=>{const t=e.touches&&e.touches[0];if(!ready||!t||reduced.matches)return;const r=field.getBoundingClientRect();if(t.clientY<r.top||t.clientY>r.bottom){pointerInside=false;return}const nx=(t.clientX-r.left-ox)/scale,ny=(t.clientY-r.top-oy)/scale,now=performance.now();if(e.type==='touchmove'&&now-lastPointer<160){moveX=Math.max(-24/scale,Math.min(24/scale,(nx-oldMx)*.45));moveY=Math.max(-24/scale,Math.min(24/scale,(ny-oldMy)*.45))}mx=oldMx=nx;my=oldMy=ny;lastPointer=now;touchUntil=now+1500;pointerInside=true;start()};
 hero.addEventListener('touchstart',touch,{passive:true});hero.addEventListener('touchmove',touch,{passive:true});hero.addEventListener('touchend',()=>{pointerInside=false},{passive:true});

 new ResizeObserver(resize).observe(field);new IntersectionObserver(e=>{visible=e[0].isIntersecting;if(visible)start();else{cancelAnimationFrame(frame);frame=0;pointerInside=false}}).observe(hero);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0}else start()});reduced.addEventListener('change',()=>{cancelAnimationFrame(frame);frame=0;pointerInside=false;if(ready){paint(0);draw()}start()});
 image.onload=initialise;if(image.complete&&image.naturalWidth)initialise();
})();
