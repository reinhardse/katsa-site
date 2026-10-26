/* Interactive, illuminated lamellae. Entirely local, no textures or external runtime. */
(()=>{
 const hero=document.querySelector('.med-hero'),canvas=hero?.querySelector('.med-rib-canvas');if(!canvas)return;
 const dark=document.documentElement.classList.contains('med-dark-offer');if(dark)return;
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 let width=1,height=1,ratio=1,frame=0,active=true,last=0,clock=0,x=0,y=0,tx=0,ty=0;
 const gl=canvas.getContext('webgl',{alpha:false,antialias:false,powerPreference:'low-power',preserveDrawingBuffer:false});
 let program,loc,draw;
 const vert='attribute vec2 position;void main(){gl_Position=vec4(position,0.,1.);}';
 let frag=`precision highp float;
 uniform vec2 resolution;uniform vec2 pointer;uniform float time;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 void main(){
  vec2 p=(gl_FragCoord.xy-.5*resolution)/resolution.y;
  float u=dot(p,vec2(.755,.656));float v=dot(p,vec2(-.656,.755));
  float bend=.022*sin(v*3.0+time*.17)+pointer.x*.04*v+pointer.y*.015*sin(v*4.);
  float q=(u+bend)/.155;
  float id=floor(q);float f=fract(q);
  float ridge=pow(max(.0001,sin(f*3.14159265)),.68);
  float dz=.68*3.14159*cos(f*3.14159)*pow(max(.03,sin(f*3.14159)),-.32)*.24;
  vec3 normal=normalize(vec3(-dz,.08*cos(v*3.+time*.17),1.));
  vec2 lightUV=vec2(pointer.x*.9,pointer.y*.65);
  vec3 light=normalize(vec3(lightUV-vec2(u,v),1.1));
  float diffuse=max(0.,dot(normal,light));
  float spec=pow(max(0.,dot(normal,normalize(light+vec3(0.,0.,1.)))),36.);
  float softSpot=exp(-1.8*length(vec2(u,v)-lightUV));
  float lengthFade=exp(-pow(abs(v+.10*sin(u*2.)),4.)*3.4);
  float sideFade=1.-smoothstep(.45,.85,abs(u-.02));
  float envelope=lengthFade*sideFade;
  vec3 pink=vec3(.847,.42,.65),violet=vec3(.58,.51,.85),blue=vec3(.48,.69,.83);
  float hue=.5+.5*sin(u*2.1+v*.7+time*.07);
  vec3 tint=mix(pink,violet,hue);tint=mix(tint,blue,smoothstep(.2,.8,u)*.35);
  float shade=.90+.10*ridge;
  vec3 material=vec3(shade)-((vec3(1.)-tint)*(.25+.48*softSpot)*(.44+.56*diffuse));
  material+=vec3(spec*.17);
  // Rounded shoulders shade the grooves while the broad face carries moving light.
  material-=vec3(.08,.065,.085)*pow(1.-ridge,3.);
  float grain=(hash(gl_FragCoord.xy)-.5)*.009;
  vec3 color=mix(vec3(1.),material,envelope*.88)+grain*envelope;
  gl_FragColor=vec4(clamp(color,0.,1.),1.);
 }`;
 if(dark){frag=frag.replace('float bend=.022*sin(v*3.0+time*.17)+pointer.x*.04*v+pointer.y*.015*sin(v*4.);',`float breath=sin(time*.48);
  float pull=exp(-pow((v-pointer.y*.55)*1.8,2.));
  float bend=(.105+.025*breath)*sin(v*3.6+time*.28)+.035*sin(v*6.2-time*.23)+pointer.x*.18*pull+pointer.y*.05*sin(v*3.1);
  float bendSlope=(.105+.025*breath)*3.6*cos(v*3.6+time*.28)+.217*cos(v*6.2-time*.23)-pointer.x*.18*pull*6.48*(v-pointer.y*.55)+pointer.y*.155*cos(v*3.1);`)
  .replace('float q=(u+bend)/.155;','float q=(u+bend)/.112;')
  .replace('vec3 normal=normalize(vec3(-dz,.08*cos(v*3.+time*.17),1.));','vec3 normal=normalize(vec3(-dz,-dz*bendSlope,1.));');
 frag=frag.replace('vec3 color=mix(vec3(1.),material,envelope*.88)+grain*envelope;',`vec3 backdrop=vec3(.03137,.03529,.05098);
  // Main-page colours, reflected by the rib surface rather than a flat overlay.
  vec3 orange=vec3(.83,.16,.035),warm=vec3(.63,.38,.25);
  vec3 cyan=vec3(.34,.55,.62),deepBlue=vec3(.045,.11,.29);
  float warmFocus=exp(-pow((u+.30+pointer.x*.10)*2.1,2.));
  vec3 brand=mix(mix(deepBlue,cyan,.72),mix(orange,warm,.18),warmFocus);
  vec3 smoked=backdrop+brand*(.16+.32*diffuse+.22*softSpot)*(.40+.60*ridge);
  smoked+=mix(brand,vec3(.75,.82,.89),.28)*spec*.24;
  float textQuiet=1.-.32*exp(-pow(p.x*1.5,2.)-pow(p.y*2.8,2.));
  float topQuiet=1.-smoothstep(.32,.58,p.y)*.65;
  vec3 color=mix(backdrop,smoked,envelope*.92*textQuiet*topQuiet);`)}
 function compile(type,src){const shader=gl.createShader(type);gl.shaderSource(shader,src);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error('Shader compilation');return shader}
 if(gl){try{
  program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,vert));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,frag));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Shader linking');gl.useProgram(program);
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const pos=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
  loc={resolution:gl.getUniformLocation(program,'resolution'),pointer:gl.getUniformLocation(program,'pointer'),time:gl.getUniformLocation(program,'time')};
  draw=()=>{gl.viewport(0,0,canvas.width,canvas.height);gl.uniform2f(loc.resolution,canvas.width,canvas.height);gl.uniform2f(loc.pointer,x,y);gl.uniform1f(loc.time,clock);gl.drawArrays(gl.TRIANGLES,0,6)};canvas.dataset.renderer='webgl';
 }catch{canvas.dataset.renderer='fallback'}}
 // A lightweight broad-rib fallback for devices which disable WebGL.
 if(!draw){
  const fallback=document.createElement('canvas');fallback.className=canvas.className;canvas.replaceWith(fallback);const ctx=fallback.getContext('2d');if(!ctx)return;canvas.dataset.renderer='fallback';fallback.dataset.renderer='canvas2d';
  draw=()=>{
   if(fallback.width!==canvas.width||fallback.height!==canvas.height){fallback.width=canvas.width;fallback.height=canvas.height}
   ctx.setTransform(ratio,0,0,ratio,0,0);ctx.fillStyle=dark?'#08090d':'#fff';ctx.fillRect(0,0,width,height);ctx.save();ctx.translate(width*.5,height*.5);ctx.rotate(-.715);const step=height*(dark?.112:.155);
   for(let i=dark?-12:-6;i<=(dark?12:6);i++){
    const left=i*step+(dark?0:Math.sin(clock*.17+i*.4)*9+x*12);const top=-height;
    const deform=py=>{const v=py/height;return height*((.105+.025*Math.sin(clock*.48))*Math.sin(v*3.6+clock*.28)+.035*Math.sin(v*6.2-clock*.23)+x*.18*Math.exp(-Math.pow((v+y*.55)*1.8,2))+y*.05*Math.sin(v*3.1))};
    const g=ctx.createLinearGradient(left-(dark?height*.07:0),0,left+step+(dark?height*.07:0),0);g.addColorStop(0,dark?'#111a24':'#ece5f1');g.addColorStop(Math.max(.08,.18+x*.08),dark?'#36596b':'#b49bce');g.addColorStop(Math.min(.75,.55+x*.12),dark?'#263749':'#e7d4e9');g.addColorStop(.85,dark?'#5c8798':'#f9eff5');g.addColorStop(1,dark?'#17232e':'#c6b0d3');
    ctx.fillStyle=g;ctx.beginPath();
    if(dark){ctx.moveTo(left+deform(top),top);for(let py=top+height/48;py<=height+1;py+=height/48)ctx.lineTo(left+deform(py),py);for(let py=height;py>=top-1;py-=height/48)ctx.lineTo(left+step+deform(py)+.7,py)}
    else{ctx.moveTo(left,top);ctx.bezierCurveTo(left+20+x*20,-height*.3,left-15,y*45,left,height);ctx.lineTo(left+step,height);ctx.bezierCurveTo(left+step-15,y*45,left+step+20+x*20,-height*.3,left+step,top)}ctx.closePath();ctx.fill();ctx.save();ctx.clip();
    if(dark){const stops=[[0,17,26,36],[.18,54,89,107],[.55,38,55,73],[.85,92,135,152],[1,23,35,46]];const strips=32;ctx.lineWidth=step/strips+1.2;ctx.lineCap='butt';for(let k=0;k<strips;k++){const f=(k+.5)/strips;let j=1;while(f>stops[j][0]&&j<stops.length-1)j++;const a=stops[j-1],b=stops[j],t=(f-a[0])/(b[0]-a[0]);ctx.strokeStyle=`rgb(${Math.round(a[1]+(b[1]-a[1])*t)},${Math.round(a[2]+(b[2]-a[2])*t)},${Math.round(a[3]+(b[3]-a[3])*t)})`;ctx.beginPath();ctx.moveTo(left+f*step+deform(top),top);for(let py=top+height/48;py<=height+1;py+=height/48)ctx.lineTo(left+f*step+deform(py),py);ctx.stroke()}}
    const lx=x*width*.45,ly=-y*height*.45;const lightX=lx*Math.cos(.715)-ly*Math.sin(.715),lightY=lx*Math.sin(.715)+ly*Math.cos(.715);const spot=ctx.createRadialGradient(lightX,lightY,0,lightX,lightY,height*.8);spot.addColorStop(0,dark?'#578c9e45':'#d77aab65');spot.addColorStop(.45,dark?'#0b1c4a25':'#aaa1e94a');spot.addColorStop(1,'#aaa1e900');ctx.fillStyle=spot;ctx.fillRect(-width*2,-height*2,width*4,height*4);
    if(dark){const warmX=-width*.22+x*width*.12+Math.sin(clock*.12)*width*.025,warmY=height*.06-y*height*.10;const amber=ctx.createRadialGradient(warmX,warmY,0,warmX,warmY,height*.78);amber.addColorStop(0,'#d42909e0');amber.addColorStop(.32,'#d45e2bb0');amber.addColorStop(.7,'#a1614050');amber.addColorStop(1,'#d4290900');ctx.globalCompositeOperation='screen';ctx.fillStyle=amber;ctx.fillRect(-width*2,-height*2,width*4,height*4)}ctx.restore();
   }ctx.restore();
   const fade=ctx.createRadialGradient(width*.5+x*40,height*.48-y*40,height*.10,width*.5,height*.48,Math.max(width,height)*.65);fade.addColorStop(0,dark?'#08090db0':'#ffffff3d');fade.addColorStop(.48,dark?'#08090d40':'#ffffff80');fade.addColorStop(1,dark?'#08090d':'#fff');ctx.fillStyle=fade;ctx.fillRect(0,0,width,height);
   if(dark){const top=ctx.createLinearGradient(0,0,0,height*.24);top.addColorStop(0,'#08090dc0');top.addColorStop(1,'#08090d00');ctx.fillStyle=top;ctx.fillRect(0,0,width,height*.24)}
  };
 }
 function resize(){const rect=hero.getBoundingClientRect();width=rect.width;height=rect.height;ratio=Math.min(devicePixelRatio||1,2,Math.sqrt(2200000/(width*height)));canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);if(reduced.matches)draw()}
 function tick(now){frame=0;if(!active||document.hidden)return;if(now-last>=32){const dt=Math.min(.05,(now-last)/1000||.032);last=now;clock+=reduced.matches?0:dt;x+=(tx-x)*.075;y+=(ty-y)*.075;hero.style.setProperty('--rib-pointer-x',x.toFixed(3));hero.style.setProperty('--rib-pointer-y',y.toFixed(3));draw()}if(!reduced.matches)frame=requestAnimationFrame(tick)}
 function start(){if(active&&!document.hidden&&!frame)frame=requestAnimationFrame(tick)}
 hero.addEventListener('pointermove',e=>{if(e.pointerType==='touch'||reduced.matches)return;const r=hero.getBoundingClientRect();tx=(e.clientX-r.left)/r.width*2-1;ty=1-(e.clientY-r.top)/r.height*2;start()},{passive:true});hero.addEventListener('pointerleave',()=>{tx=ty=0});
 new ResizeObserver(resize).observe(hero);new IntersectionObserver(es=>{active=es[0].isIntersecting;if(active)start();else{cancelAnimationFrame(frame);frame=0}},{threshold:0}).observe(hero);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0}else start()});reduced.addEventListener('change',()=>{cancelAnimationFrame(frame);frame=0;start()});
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(frame);frame=0});canvas.addEventListener('webglcontextrestored',()=>{canvas.hidden=true;hero.classList.add('ribs-unavailable')});
 resize();start();
})();
