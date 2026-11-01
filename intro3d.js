/* =====================================================================
   Entrada en primera persona: el bosque, la casa y la escena del crimen.
   Three.js r128 · todo procedural salvo las fotos de fotos/cosas/
   ===================================================================== */
(function(){
const T=THREE;
let R,S,C,reloj,linterna,focoMesa,lampCono,puerta,parpadeo=[],polvo,listo=false,corriendo=false,t0=0,alTerminar=null;
let comp=null,regaloPlano=null,regaloMat=null,manoL,manoR,linternaObj,regaloMats=[],regaloG,cintaP,autoPuerta,sirena=[],lluvia,fundeT=-1,fundeDur=1;
const ev=[];
const W=()=>innerWidth,H=()=>innerHeight;
function rnd(a,b){return a+Math.random()*(b-a)}

/* ---------- texturas en canvas ---------- */
function lienzo(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return [c,c.getContext('2d')]}
function tex(c,rep){const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=8;if(rep)t.repeat.set(rep[0],rep[1]);return t}
function grano(g,w,h,k=14){const d=g.getImageData(0,0,w,h);for(let i=0;i<d.data.length;i+=4){const v=rnd(-k,k);d.data[i]+=v;d.data[i+1]+=v;d.data[i+2]+=v}g.putImageData(d,0,0)}
function manchas(g,w,h,n,col){for(let j=0;j<n;j++){const x=rnd(0,w),y=rnd(0,h),r=rnd(10,90);const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,col(rnd(.06,.22)));gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(x-r,y-r,2*r,2*r)}}
function tablas({w=512,h=512,n=8,vertical=true,base=[60,45,34],var_=14,sucio=.5}){
  const [c,g]=lienzo(w,h);const paso=(vertical?w:h)/n;
  for(let i=0;i<n;i++){const k=rnd(-var_,var_);g.fillStyle=`rgb(${base[0]+k},${base[1]+k*.8},${base[2]+k*.6})`;
    vertical?g.fillRect(i*paso,0,paso,h):g.fillRect(0,i*paso,w,paso);
    for(let j=0;j<46;j++){g.strokeStyle=`rgba(0,0,0,${rnd(.05,.2)})`;g.lineWidth=rnd(.5,2.2);g.beginPath();
      if(vertical){const x=i*paso+rnd(2,paso-2);g.moveTo(x,0);g.bezierCurveTo(x+rnd(-6,6),h*.3,x+rnd(-6,6),h*.7,x+rnd(-4,4),h)}
      else{const y=i*paso+rnd(2,paso-2);g.moveTo(0,y);g.bezierCurveTo(w*.3,y+rnd(-5,5),w*.7,y+rnd(-5,5),w,y+rnd(-3,3))}g.stroke()}
    for(let j=0;j<2;j++){const x=vertical?i*paso+rnd(8,paso-8):rnd(0,w),y=vertical?rnd(0,h):i*paso+rnd(8,paso-8);
      g.fillStyle='rgba(20,10,4,.5)';g.beginPath();g.ellipse(x,y,rnd(3,7),rnd(6,12),vertical?0:1.57,0,7);g.fill()}
    g.fillStyle='rgba(0,0,0,.85)';vertical?g.fillRect(i*paso,0,3,h):g.fillRect(0,i*paso,w,3);
    g.fillStyle='rgba(255,255,255,.06)';vertical?g.fillRect(i*paso+3,0,1,h):g.fillRect(0,i*paso+3,w,1)}
  manchas(g,w,h,60*sucio,a=>`rgba(${rnd(0,25)},${rnd(10,25)},${rnd(0,15)},${a})`);grano(g,w,h);return c}
function suelo(){const [c,g]=lienzo(1024,1024);g.fillStyle='#17140f';g.fillRect(0,0,1024,1024);
  manchas(g,1024,1024,90,a=>`rgba(${rnd(30,50)},${rnd(35,55)},${rnd(18,30)},${a*2})`);
  for(let j=0;j<9000;j++){const x=rnd(0,1024),y=rnd(0,1024);g.strokeStyle=`rgba(${rnd(60,110)},${rnd(40,70)},${rnd(20,40)},${rnd(.3,.8)})`;g.lineWidth=rnd(.6,1.4);g.beginPath();g.moveTo(x,y);const a=rnd(0,6.28),l=rnd(4,12);g.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l);g.stroke()}
  for(let j=0;j<600;j++){g.fillStyle=`rgba(${rnd(60,100)},${rnd(30,50)},${rnd(10,25)},${rnd(.4,.8)})`;g.beginPath();g.ellipse(rnd(0,1024),rnd(0,1024),rnd(3,7),rnd(2,4),rnd(0,3),0,7);g.fill()}
  grano(g,1024,1024,18);return c}
function cielo(){const [c,g]=lienzo(64,512);const gr=g.createLinearGradient(0,0,0,512);gr.addColorStop(0,'#02030a');gr.addColorStop(.42,'#0a0f1c');gr.addColorStop(.5,'#141822');gr.addColorStop(1,'#050505');g.fillStyle=gr;g.fillRect(0,0,64,512);return new T.CanvasTexture(c)}
function brillo(color){const [c,g]=lienzo(128,128);const gr=g.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,color);gr.addColorStop(.3,color.replace(/[\d.]+\)$/,'.35)'));gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);return new T.CanvasTexture(c)}
function sangre(tipo){const [c,g]=lienzo(512,512);
  const gota=(x,y,r,a)=>{g.fillStyle=`rgba(${rnd(70,110)},${rnd(2,8)},${rnd(4,10)},${a})`;g.beginPath();g.ellipse(x,y,r,r*rnd(.7,1),rnd(0,3),0,7);g.fill()};
  if(tipo==='charco'){for(let k=0;k<26;k++)gota(256+rnd(-110,110),256+rnd(-70,70),rnd(40,110),.75);
    const gr=g.createRadialGradient(240,250,10,256,256,200);gr.addColorStop(0,'rgba(40,0,2,.55)');gr.addColorStop(1,'rgba(0,0,0,0)');g.globalCompositeOperation='source-atop';g.fillStyle=gr;g.fillRect(0,0,512,512);
    g.globalCompositeOperation='source-over';g.fillStyle='rgba(255,220,220,.12)';g.beginPath();g.ellipse(210,210,60,18,-.4,0,7);g.fill()}
  else{for(let k=0;k<6;k++)gota(256+rnd(-40,40),256+rnd(-40,40),rnd(14,30),.85);
    for(let k=0;k<160;k++){const a=rnd(0,6.28),d=rnd(30,230);gota(256+Math.cos(a)*d,256+Math.sin(a)*d,rnd(1,6)*(1-d/300),.85)}
    for(let k=0;k<9;k++){const x=256+rnd(-60,60),y=270+rnd(-10,20),l=rnd(40,200);g.strokeStyle='rgba(90,4,8,.85)';g.lineWidth=rnd(2,6);g.beginPath();g.moveTo(x,y);g.lineTo(x+rnd(-2,2),y+l);g.stroke();gota(x,y+l+3,rnd(3,5),.9)}}
  return new T.CanvasTexture(c)}
function redJohn(){const [c,g]=lienzo(1024,1024);g.lineCap='round';g.lineJoin='round';
  // tres dedos de un guante de goma: tres trazos paralelos por cada línea
  const dedos=(pts,w)=>{for(let d=-1;d<=1;d++){for(let pas=0;pas<2;pas++){g.strokeStyle=`rgba(${105+pas*30},${4+pas*5},${8+pas*4},${.75-pas*.2})`;g.lineWidth=w*(1-pas*.3);g.beginPath();
    pts.forEach(([x,y,nx,ny],i)=>{const X=x+nx*d*w*1.15+rnd(-1.2,1.2),Y=y+ny*d*w*1.15+rnd(-1.2,1.2);i?g.lineTo(X,Y):g.moveTo(X,Y)});g.stroke()}}};
  const circ=[];for(let a=-Math.PI/2;a<=Math.PI*1.5+.1;a+=.04){const r=340+rnd(-3,3);circ.push([512+Math.cos(a)*r,500+Math.sin(a)*r*1.03,Math.cos(a),Math.sin(a)])}dedos(circ,13);
  dedos([[392,360,1,0],[388,470,1,0]],12);dedos([[636,360,1,0],[640,470,1,0]],12);
  const sonr=[];for(let a=.3;a<=Math.PI-.3;a+=.04)sonr.push([512+Math.cos(a)*225,520+Math.sin(a)*170,Math.cos(a),Math.sin(a)]);dedos(sonr,12);
  // chorreones que bajan por la pared
  for(let k=0;k<26;k++){const a=rnd(0,Math.PI*2),r=rnd(0,1)<.6?340:225,x=512+Math.cos(a)*r,y=(r===340?500:520)+Math.abs(Math.sin(a))*(r===340?345:170);if(y<480)continue;
    const l=rnd(30,170);g.strokeStyle='rgba(95,4,8,.85)';g.lineWidth=rnd(3,7);g.beginPath();g.moveTo(x,y);g.bezierCurveTo(x+rnd(-2,2),y+l*.4,x+rnd(-3,3),y+l*.7,x+rnd(-2,2),y+l);g.stroke();
    g.fillStyle='rgba(90,3,6,.92)';g.beginPath();g.ellipse(x,y+l+5,rnd(4,7),rnd(6,10),0,0,7);g.fill()}
  [[392,470],[640,470]].forEach(([x,y])=>{const l=rnd(60,140);g.strokeStyle='rgba(95,4,8,.85)';g.lineWidth=6;g.beginPath();g.moveTo(x,y);g.lineTo(x+rnd(-2,2),y+l);g.stroke()});
  return new T.CanvasTexture(c)}
function poster(fondo1,fondo2,lineas){const [c,g]=lienzo(512,720);const gr=g.createLinearGradient(0,0,512,720);gr.addColorStop(0,fondo1);gr.addColorStop(1,fondo2);g.fillStyle=gr;g.fillRect(0,0,512,720);
  for(let i=0;i<120;i++){g.fillStyle=`rgba(255,255,255,${rnd(.02,.12)})`;g.beginPath();g.arc(rnd(0,512),rnd(0,720),rnd(1,3),0,7);g.fill()}
  g.textAlign='center';lineas.forEach(([t,f,y,col])=>{g.fillStyle=col||'#fff';g.font=f;g.fillText(t,256,y)});grano(g,512,720,8);const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;return t}
function tablero2(){const [c,g]=lienzo(512,256);g.fillStyle='#0a0a0c';g.fillRect(0,0,512,256);
  [[150,128,'#ffb347'],[362,128,'#e8f0ff']].forEach(([x,y,col])=>{g.strokeStyle=col;g.globalAlpha=.85;g.lineWidth=3;g.beginPath();g.arc(x,y,92,Math.PI*.75,Math.PI*2.25);g.stroke();
    for(let i=0;i<=10;i++){const a=Math.PI*.75+i*Math.PI*1.5/10;g.beginPath();g.moveTo(x+Math.cos(a)*80,y+Math.sin(a)*80);g.lineTo(x+Math.cos(a)*92,y+Math.sin(a)*92);g.stroke()}
    g.lineWidth=4;g.strokeStyle='#ff3b2f';g.beginPath();g.moveTo(x,y);const a=Math.PI*(.95+rnd(0,.3));g.lineTo(x+Math.cos(a)*70,y+Math.sin(a)*70);g.stroke()});
  g.globalAlpha=1;g.fillStyle='#8fd0ff';g.font='700 18px JetBrains Mono, monospace';g.textAlign='center';g.fillText('CBI 154.8',256,236);return new T.CanvasTexture(c)}
function cinta(){const [c,g]=lienzo(1024,64);g.fillStyle='#e8c21a';g.fillRect(0,0,1024,64);g.fillStyle='#111';
  g.font='900 30px Unbounded, Inter Tight, sans-serif';g.textBaseline='middle';
  for(let x=10;x<1024;x+=340){g.fillText('NO PASAR',x,33);g.fillRect(x+180,14,130,36);g.fillStyle='#e8c21a';g.font='700 16px JetBrains Mono, monospace';g.fillText('ESCENA DEL CRIMEN',x+184,33);g.fillStyle='#111';g.font='900 30px Unbounded, Inter Tight, sans-serif'}
  grano(g,1024,64,10);return tex(c)}
function corcho(){const [c,g]=lienzo(512,384);g.fillStyle='#9a6b3e';g.fillRect(0,0,512,384);
  for(let j=0;j<5000;j++){g.fillStyle=`rgba(${rnd(60,140)},${rnd(40,90)},${rnd(20,50)},.6)`;g.fillRect(rnd(0,512),rnd(0,384),rnd(1,3),rnd(1,3))}return tex(c)}
function etiquetaNum(n){const [c,g]=lienzo(64,64);g.fillStyle='#f0c419';g.fillRect(0,0,64,64);g.fillStyle='#111';g.font='900 40px Inter Tight, sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(n,32,35);return new T.CanvasTexture(c)}

function expediente(){const [c,g]=lienzo(256,340);g.fillStyle='#c9b48a';g.fillRect(0,0,256,340);g.fillStyle='#3a2a14';
  g.font='900 46px Inter Tight, sans-serif';g.fillText('CBI',20,70);g.font='700 13px JetBrains Mono, monospace';g.fillText('CALIFORNIA BUREAU',20,96);g.fillText('OF INVESTIGATION',20,114);
  g.fillStyle='#7a1010';g.font='900 22px Inter Tight, sans-serif';g.save();g.translate(140,250);g.rotate(-.25);g.strokeStyle='#7a1010';g.lineWidth=3;g.strokeRect(-70,-24,150,40);g.fillText('RED JOHN',-58,4);g.restore();
  g.fillStyle='#3a2a14';g.font='500 12px JetBrains Mono, monospace';g.fillText('CASO N° 0111',20,150);g.fillText('ESCENA: CASA DEL BOSQUE',20,168);grano(g,256,340,10);return new T.CanvasTexture(c)}
function gotas(){const [c,g]=lienzo(512,512);for(let i=0;i<420;i++){const x=rnd(0,512),y=rnd(0,512),r=rnd(1,5);g.fillStyle=`rgba(200,215,235,${rnd(.15,.45)})`;g.beginPath();g.ellipse(x,y,r,r*rnd(1,1.6),0,0,7);g.fill();g.fillStyle='rgba(255,255,255,.5)';g.fillRect(x-r*.3,y-r*.4,1,1)}
  for(let i=0;i<30;i++){const x=rnd(0,512),y=rnd(0,400);g.strokeStyle='rgba(200,215,235,.25)';g.lineWidth=rnd(1.5,3);g.beginPath();g.moveTo(x,y);g.lineTo(x+rnd(-3,3),y+rnd(30,110));g.stroke()}return tex(c)}

/* ---------- materiales ---------- */
const M=o=>new T.MeshStandardMaterial(o);
function madera(opts,rep,rough=.9){const c=tablas(opts);const t=tex(c,rep);const b=tex(c,rep);return M({map:t,bumpMap:b,bumpScale:.02,roughness:rough})}
function sombra(o){o.traverse(m=>{if(m.isMesh){m.castShadow=true;m.receiveShadow=true}});return o}
function caja(w,h,d,mat,x,y,z,ry=0,padre=S){const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.rotation.y=ry;m.castShadow=m.receiveShadow=true;padre.add(m);return m}
function calco(textura,w,h,x,y,z,rx,ry,op=1){const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshStandardMaterial({map:textura,transparent:true,depthWrite:false,roughness:.25,metalness:.05,opacity:op,polygonOffset:true,polygonOffsetFactor:-2}));m.position.set(x,y,z);m.rotation.set(rx,ry,0);m.receiveShadow=true;S.add(m);return m}
function foto(img,w,h,x,y,z,ry,rz=0){const tx=new T.TextureLoader().load(img);tx.encoding=T.sRGBEncoding;
  const g=new T.Group();const marco=new T.Mesh(new T.BoxGeometry(w+.04,h+.06,.004),M({color:'#e9e4d8',roughness:.8}));g.add(marco);
  const p=new T.Mesh(new T.PlaneGeometry(w,h),M({map:tx,roughness:.6}));p.position.set(0,.01,.003);g.add(p);
  const ch=new T.Mesh(new T.SphereGeometry(.012,8,6),M({color:'#b01020',roughness:.4}));ch.position.set(0,h/2+.01,.01);g.add(ch);
  g.position.set(x,y,z);g.rotation.set(0,ry,rz);S.add(sombra(g));return g}
function cactus(x,z,esc=1){const g=new T.Group();const verde=M({color:'#3f5a32',roughness:.85});const maceta=M({color:'#7a3f24',roughness:.95});
  const m=new T.Mesh(new T.CylinderGeometry(.16,.12,.24,16),maceta);m.position.y=.12;g.add(m);
  const tm=new T.Mesh(new T.CylinderGeometry(.15,.15,.02,16),M({color:'#2a1c10'}));tm.position.y=.235;g.add(tm);
  const pts=[];for(let i=0;i<=10;i++){const y=i/10;pts.push(new T.Vector2(.085*(1-Math.pow(y,6)*.6)+(i%2)*.0,y*.55))}
  const cu=new T.Mesh(new T.LatheGeometry(pts,16),verde);cu.position.y=.24;g.add(cu);
  [[-1,.45,.18],[1,.55,.14]].forEach(([s,y,l])=>{const b=new T.Mesh(new T.CylinderGeometry(.045,.05,.14,10),verde);b.rotation.z=s*1.57;b.position.set(s*.13,y,0);g.add(b);
    const u=new T.Mesh(new T.CylinderGeometry(.042,.045,l,10),verde);u.position.set(s*.2,y+l/2,0);g.add(u);const c2=new T.Mesh(new T.SphereGeometry(.042,10,8),verde);c2.position.set(s*.2,y+l,0);g.add(c2)});
  g.position.set(x,.3,z);g.scale.setScalar(esc);S.add(sombra(g));return g}

/* ---------- manos 3D ---------- */
const piel=()=>M({color:'#b8846a',roughness:.62,metalness:0});
function crearMano(lado=1){
  const g=new T.Group(),mat=piel(),dedos=[];
  const palma=new T.Mesh(new T.SphereGeometry(1,20,14),mat);palma.scale.set(.042,.017,.05);g.add(palma);
  const dorso=new T.Mesh(new T.SphereGeometry(1,16,10),mat);dorso.scale.set(.04,.012,.04);dorso.position.set(0,.008,.012);g.add(dorso);
  const seg=(r,l)=>{const p=new T.Group();const cil=new T.Mesh(new T.CylinderGeometry(r*.92,r,l,12),mat);cil.rotation.x=-Math.PI/2;cil.position.z=-l/2;p.add(cil);const n=new T.Mesh(new T.SphereGeometry(r,12,10),mat);p.add(n);const pu=new T.Mesh(new T.SphereGeometry(r*.92,12,10),mat);pu.position.z=-l;p.add(pu);return p};
  [[-.03,.022,.0085],[-.01,.026,.009],[.01,.025,.0088],[.03,.02,.0078]].forEach(([x,l,r])=>{let padre=g;const cad=[];let z=-.045;
    for(let k=0;k<3;k++){const s=seg(r*(1-k*.08),l*(1-k*.22));s.position.set(k?0:x*lado,k?0:0,k?-l*(1-(k-1)*.22):z);padre.add(s);cad.push(s);padre=s}
    dedos.push(cad)});
  // pulgar
  const pul=[];let pp=g;[[.016,.0105],[.015,.0098]].forEach(([l,r],k)=>{const s=seg(r,l);if(!k){s.position.set(.038*lado,-.006,-.012);s.rotation.y=.9*lado}else s.position.z=-.016;pp.add(s);pul.push(s);pp=s});
  const munieca=new T.Mesh(new T.CylinderGeometry(.026,.03,.09,16),mat);munieca.rotation.x=Math.PI/2;munieca.position.set(0,0,.075);munieca.scale.x=1.25;g.add(munieca);
  const manga=new T.Mesh(new T.CylinderGeometry(.05,.058,.4,18),M({color:'#1a1c20',roughness:.95}));manga.rotation.x=Math.PI/2;manga.position.set(0,0,.3);g.add(manga);
  const puno=new T.Mesh(new T.TorusGeometry(.046,.01,8,20),M({color:'#24272c',roughness:1}));puno.position.z=.11;g.add(puno);
  g.userData.cierra=k=>{dedos.forEach((cad,i)=>cad.forEach((s,j)=>{s.rotation.x=-k*(j?1.25:.9)*(1-i*.04)}));pul[0].rotation.x=-k*.5;pul[1].rotation.x=-k*.7};
  g.userData.cierra(.25);sombra(g);g.traverse(m=>{if(m.isMesh)m.castShadow=false});return g}

/* ---------- la escena ---------- */
function construir(cv){
  R=new T.WebGLRenderer({canvas:cv,antialias:true,powerPreference:'high-performance'});
  R.setPixelRatio(Math.min(devicePixelRatio,1.6));R.setSize(W(),H());R.outputEncoding=T.sRGBEncoding;
  R.toneMapping=T.ACESFilmicToneMapping;R.toneMappingExposure=1.25;R.shadowMap.enabled=true;R.shadowMap.type=T.PCFSoftShadowMap;R.physicallyCorrectLights=false;
  S=new T.Scene();S.fog=new T.FogExp2('#0b1016',.055);
  C=new T.PerspectiveCamera(W()<H()?76:60,W()/H(),.02,90);C.position.set(0,1.62,11);S.add(C);
  S.add(new T.Mesh(new T.SphereGeometry(70,24,16),new T.MeshBasicMaterial({map:cielo(),side:T.BackSide,fog:false})));
  const luna=new T.Sprite(new T.SpriteMaterial({map:brillo('rgba(205,215,240,1)'),fog:false,depthWrite:false}));luna.position.set(-16,20,-34);luna.scale.set(12,12,1);S.add(luna);
  const lunaL=new T.DirectionalLight('#8796c4',.55);lunaL.position.set(-9,16,9);lunaL.castShadow=true;lunaL.shadow.mapSize.set(2048,2048);
  Object.assign(lunaL.shadow.camera,{left:-16,right:16,top:16,bottom:-16,near:1,far:50});lunaL.shadow.bias=-.0006;S.add(lunaL);
  S.add(new T.HemisphereLight('#2a3348','#0b0805',.45));

  // ----- bosque -----
  const st=tex(suelo(),[22,22]);const sb=tex(suelo(),[22,22]);
  const piso=new T.Mesh(new T.PlaneGeometry(90,90,60,60),M({map:st,bumpMap:sb,bumpScale:.05,roughness:1}));
  const pa=piso.geometry.attributes.position;for(let i=0;i<pa.count;i++){const x=pa.getX(i),y=pa.getY(i);const d=Math.hypot(x,y+2);if(d>9)pa.setZ(i,Math.sin(x*.35)*Math.cos(y*.3)*.35*Math.min(1,(d-9)/6))}piso.geometry.computeVertexNormals();
  piso.rotation.x=-Math.PI/2;piso.receiveShadow=true;S.add(piso);
  const piedraM=M({color:'#4a4640',roughness:.95});
  for(let z=3;z<12;z+=.62){const p=new T.Mesh(new T.DodecahedronGeometry(rnd(.22,.3),0),piedraM);p.scale.y=.18;p.position.set(rnd(-.22,.22),.02,z);p.rotation.y=rnd(0,3);p.receiveShadow=p.castShadow=true;S.add(p)}
  // pinos (instanciados) y algunos troncos secos
  const n=150,conoG=new T.ConeGeometry(1,1,9),troncoG=new T.CylinderGeometry(.1,.18,1,7);
  const agujaM=M({color:'#16231a',roughness:.95,flatShading:true}),cortezaM=M({color:'#20160f',roughness:1});
  const conos=new T.InstancedMesh(conoG,agujaM,n*4),troncos=new T.InstancedMesh(troncoG,cortezaM,n);conos.castShadow=troncos.castShadow=true;conos.receiveShadow=true;
  const o=new T.Object3D();let ci=0,ti=0;
  for(let i=0;i<n;i++){let x,z;do{x=rnd(-36,36);z=rnd(-34,30)}while((Math.abs(x)<7.5&&z>-10&&z<14)||(Math.abs(x)<2.5&&z>-12&&z<30));
    const h=rnd(5,11),w=h*rnd(.26,.34);
    o.position.set(x,h*.12,z);o.scale.set(1,h*.25,1);o.rotation.set(0,0,0);o.updateMatrix();troncos.setMatrixAt(ti++,o.matrix);
    for(let k=0;k<4;k++){const s=w*(1-k*.2);o.position.set(x,h*(.3+k*.17),z);o.scale.set(s,h*.36,s);o.rotation.y=rnd(0,3);o.updateMatrix();conos.setMatrixAt(ci++,o.matrix)}}
  conos.count=ci;troncos.count=ti;S.add(conos);S.add(troncos);
  function arbolSeco(x,z,h){const g=new T.Group();function rama(len,rad,prof){const m=new T.Mesh(new T.CylinderGeometry(rad*.6,rad,len,6),cortezaM);m.position.y=len/2;const nd=new T.Group();nd.add(m);
      if(prof>0)for(let i=0;i<3;i++){const h2=rama(len*rnd(.5,.7),rad*.6,prof-1);h2.position.y=len*rnd(.5,.95);h2.rotation.z=rnd(-.9,.9);h2.rotation.y=rnd(0,6.28);nd.add(h2)}return nd}
    g.add(rama(h,.2,3));g.position.set(x,0,z);S.add(sombra(g))}
  [[-6.5,8,5],[6.8,9,5.5],[-8.5,1,6]].forEach(a=>arbolSeco(...a));
  // niebla baja en capas
  const nieblaT=brillo('rgba(120,130,150,1)');for(let i=0;i<14;i++){const sp=new T.Sprite(new T.SpriteMaterial({map:nieblaT,transparent:true,opacity:.07,depthWrite:false}));sp.position.set(rnd(-14,14),rnd(.3,1.2),rnd(-6,14));sp.scale.set(rnd(8,14),rnd(2,3.5),1);S.add(sp)}

  // ----- el auto del CBI: SUV negra con carrocería redondeada -----
  const auto=new T.Group();
  const pintura=new T.MeshPhysicalMaterial({color:'#07080a',roughness:.25,metalness:.6,clearcoat:1,clearcoatRoughness:.15});
  const plastico=M({color:'#0a0a0b',roughness:.85}),tapiz=M({color:'#141416',roughness:.95}),cromo=M({color:'#c8ccd2',roughness:.15,metalness:1});
  const negroV=new T.MeshStandardMaterial({color:'#020304',roughness:.08,metalness:.8,transparent:true,opacity:.78,side:T.DoubleSide,depthWrite:false});
  // carrocería por perfil extruido con bisel
  const perfil=new T.Shape();[[-2.45,.42],[-2.52,.62],[-2.48,.9],[-2.3,1.0],[-1.35,1.08],[-.62,1.8],[1.95,1.87],[2.4,1.78],[2.5,1.2],[2.5,.45],[2.3,.38],[-2.3,.38]].forEach(([u,v],i)=>i?perfil.lineTo(u,v):perfil.moveTo(u,v));
  const cuerpoG=new T.ExtrudeGeometry(perfil,{depth:1.84,bevelEnabled:true,bevelThickness:.07,bevelSize:.07,bevelSegments:4,curveSegments:8});cuerpoG.rotateY(-Math.PI/2);cuerpoG.translate(.92,0,0);
  const carro=new T.Mesh(cuerpoG,pintura);carro.castShadow=true;auto.add(carro);
  // ventanas oscuras, parabrisas con lluvia
  [-1,1].forEach(sd=>{const v=new T.Mesh(new T.PlaneGeometry(2.4,.58),negroV);v.position.set(sd*1.0,1.47,.68);v.rotation.y=sd*Math.PI/2;auto.add(v)});
  const para=new T.Mesh(new T.PlaneGeometry(1.86,1.02),new T.MeshStandardMaterial({map:gotas(),color:'#c0ccd8',transparent:true,opacity:.5,roughness:.02,metalness:.3,depthWrite:false,side:T.DoubleSide}));para.position.set(0,1.45,-.99);para.rotation.x=-.78;auto.add(para);
  // ruedas
  [[-.86,-1.55],[.86,-1.55],[-.86,1.62],[.86,1.62]].forEach(([x,z])=>{const g=new T.Group();const llanta=new T.Mesh(new T.CylinderGeometry(.42,.42,.3,28),M({color:'#0d0d0d',roughness:.95}));llanta.rotation.z=Math.PI/2;g.add(llanta);
    const rin=new T.Mesh(new T.CylinderGeometry(.25,.25,.31,20),cromo);rin.rotation.z=Math.PI/2;g.add(rin);for(let i=0;i<6;i++){const ra=caja(.32,.04,.04,M({color:'#2a2c30',roughness:.4,metalness:.8}),0,0,0,0,g);ra.rotation.x=i*Math.PI/3;ra.scale.x=.98}
    g.position.set(x,.42,z);auto.add(g)});
  // parrilla, faros y calaveras
  caja(1.5,.32,.04,M({color:'#0b0b0c',roughness:.4,metalness:.6}),0,.72,-2.56,0,auto);for(let i=0;i<4;i++)caja(1.46,.02,.05,cromo,0,.6+i*.08,-2.57,0,auto);
  [-.7,.7].forEach(x=>{caja(.36,.16,.05,new T.MeshBasicMaterial({color:'#f2f6ff'}),x,.84,-2.53,0,auto);caja(.2,.32,.05,new T.MeshBasicMaterial({color:'#b00010'}),x*1.25,1.15,2.55,0,auto)});
  caja(2.0,.16,.18,M({color:'#111',roughness:.6}),0,.45,-2.55,0,auto);caja(2.0,.16,.18,M({color:'#111',roughness:.6}),0,.45,2.55,0,auto);
  // ----- adentro del auto -----
  const tab=new T.Shape();[[-1.32,.95],[-1.32,1.1],[-1.05,1.2],[-.78,1.16],[-.72,1.02],[-.72,.95]].forEach(([u,v],i)=>i?tab.lineTo(u,v):tab.moveTo(u,v));
  const tabG=new T.ExtrudeGeometry(tab,{depth:1.82,bevelEnabled:true,bevelThickness:.02,bevelSize:.02,bevelSegments:2});tabG.rotateY(-Math.PI/2);tabG.translate(.91,0,0);
  auto.add(new T.Mesh(tabG,plastico));
  const cuadro=new T.Mesh(new T.PlaneGeometry(.36,.18),new T.MeshBasicMaterial({map:tablero2(),transparent:true,opacity:.9}));cuadro.position.set(-.4,1.13,-.8);cuadro.rotation.x=-.35;auto.add(cuadro);
  const luzTab=new T.PointLight('#ffb070',.35,1.2,2);luzTab.position.set(-.4,1.15,-.7);auto.add(luzTab);
  // volante con rayos
  const vol=new T.Group();vol.add(new T.Mesh(new T.TorusGeometry(.18,.022,12,40),plastico));const cubo=new T.Mesh(new T.CylinderGeometry(.06,.07,.05,20),plastico);cubo.rotation.x=Math.PI/2;vol.add(cubo);
  [0,2.2,-2.2].forEach(a=>{const r=caja(.17,.035,.02,plastico,0,0,0,0,vol);r.rotation.z=a+Math.PI/2;r.position.set(Math.cos(a-Math.PI/2)*.09,Math.sin(a-Math.PI/2)*.09,0)});
  vol.position.set(-.4,1.02,-.6);vol.rotation.x=-.42;auto.add(vol);
  caja(.06,.06,.32,plastico,-.4,.98,-.78,0,auto).rotation.x=-.42;
  // espejo, viseras, techo, parantes
  caja(.24,.07,.02,plastico,0,1.7,-.66,0,auto);caja(.6,.02,.22,tapiz,-.42,1.76,-.48,0,auto);caja(.6,.02,.22,tapiz,.42,1.76,-.48,0,auto);
  const techoA=new T.Mesh(new T.PlaneGeometry(1.84,2.6),tapiz);techoA.rotation.x=Math.PI/2;techoA.position.set(0,1.8,.68);auto.add(techoA);
  [-1,1].forEach(sd=>{const pa=caja(.08,1.0,.08,plastico,sd*.9,1.45,-.98,0,auto);pa.rotation.x=-.78;caja(.1,.7,.12,plastico,sd*.93,1.45,.62,0,auto)});
  // asientos
  [-.45,.45].forEach(x=>{caja(.55,.16,.55,tapiz,x,.92,.35,0,auto);const r=caja(.52,.68,.13,tapiz,x,1.32,.66,0,auto);r.rotation.x=.12;caja(.28,.18,.1,tapiz,x,1.76,.72,0,auto)});
  caja(.22,.2,.6,plastico,0,.95,.0,0,auto);
  const exp=new T.Mesh(new T.PlaneGeometry(.26,.34),M({map:expediente(),roughness:.9}));exp.rotation.set(-Math.PI/2,0,.3);exp.position.set(.45,1.01,.3);auto.add(exp);
  // panel interior derecho
  caja(.05,.62,2.4,tapiz,.9,.85,.7,0,auto);
  // puerta del conductor
  autoPuerta=new T.Group();autoPuerta.position.set(-1.0,0,-.62);auto.add(autoPuerta);
  caja(.08,.72,1.18,pintura,-.03,.82,.58,0,autoPuerta);caja(.05,.66,1.1,tapiz,.04,.84,.58,0,autoPuerta);caja(.06,.05,.4,cromo,.07,1.0,.75,0,autoPuerta);
  caja(.06,.06,1.18,pintura,0,1.78,.58,0,autoPuerta);caja(.06,.6,.06,pintura,0,1.48,1.15,0,autoPuerta);
  const vp=new T.Mesh(new T.PlaneGeometry(1.1,.58),negroV);vp.rotation.y=Math.PI/2;vp.position.set(0,1.47,.58);autoPuerta.add(vp);
  // baliza portátil en el tablero
  const bR=caja(.1,.06,.08,new T.MeshBasicMaterial({color:'#ff1a1a'}),.22,1.22,-1.05,0,auto),bA=caja(.1,.06,.08,new T.MeshBasicMaterial({color:'#2a5bff'}),.33,1.22,-1.05,0,auto);
  const lR=new T.PointLight('#ff2020',0,14,1.6);lR.position.set(-.5,1.0,-2.9);auto.add(lR);const lA=new T.PointLight('#2a5bff',0,14,1.6);lA.position.set(.5,1.0,-2.9);auto.add(lA);sirena=[lR,lA,bR,bA];
  // faros con conos de luz en la niebla
  [-.7,.7].forEach((x,i)=>{const f=new T.SpotLight('#e8eeff',3.6,32,.32,.45,1.1);f.position.set(x,.84,-2.6);f.castShadow=i===0;f.shadow.mapSize.set(1024,1024);auto.add(f);const tg=new T.Object3D();tg.position.set(x*.6,.4,-16);auto.add(tg);f.target=tg;
    const gl=new T.Sprite(new T.SpriteMaterial({map:brillo('rgba(235,240,255,1)'),depthWrite:false,fog:false}));gl.position.set(x,.84,-2.62);gl.scale.set(.8,.55,1);auto.add(gl);
    const cono=new T.Mesh(new T.ConeGeometry(2.6,13,24,1,true),new T.MeshBasicMaterial({color:'#cfd8ff',transparent:true,opacity:.03,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide}));cono.rotation.x=Math.PI/2;cono.position.set(x*.8,.7,-9.1);auto.add(cono)});
  auto.position.set(0,0,14.4);auto.traverse(m=>{if(m.isMesh&&!m.material.transparent){m.castShadow=true;m.receiveShadow=true}});S.add(auto);

  // ----- lluvia -----
  {const n=2600,pos=new Float32Array(n*6);for(let i=0;i<n;i++){const x=rnd(-14,14),y=rnd(0,9),z=rnd(-6,22);pos.set([x,y,z,x+.02,y-.32,z],i*6)}
   const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));
   lluvia=new T.LineSegments(g,new T.LineBasicMaterial({color:'#9fb0c8',transparent:true,opacity:.32,depthWrite:false}));S.add(lluvia)}

  // ----- la casa -----
  const mF=madera({base:[62,58,52],n:26,vertical:false,var_:10,sucio:.9},[1.6,1.6]);
  const z0=0,ancho=10,alto=5.6,gro=.18;
  caja(ancho/2-.6,alto,gro,mF,-(ancho/4+.3),alto/2,z0);caja(ancho/2-.6,alto,gro,mF,(ancho/4+.3),alto/2,z0);caja(1.2,alto-2.72,gro,mF,0,2.72+(alto-2.72)/2,z0);
  // costados y fondo de la casa (para que proyecte sombra)
  caja(gro,alto,8.4,mF,-5,alto/2,-4.2);caja(gro,alto,8.4,mF,5,alto/2,-4.2);caja(ancho,alto,gro,mF,0,alto/2,-8.4);
  const techoM=madera({base:[32,30,29],n:14,vertical:false,sucio:1},[3,1]);
  const t1=caja(5.9,.14,9.2,techoM,-2.55,alto+1.12,-4.2);t1.rotation.z=.42;const t2=caja(5.9,.14,9.2,techoM,2.55,alto+1.12,-4.2);t2.rotation.z=-.42;
  const fr=new T.Shape();fr.moveTo(-5,0);fr.lineTo(5,0);fr.lineTo(0,2.3);fr.lineTo(-5,0);const fg=new T.Mesh(new T.ShapeGeometry(fr),mF);fg.position.set(0,alto,z0+.09);S.add(fg);
  const marcoM=M({color:'#2a2018',roughness:.85});
  caja(.12,2.42,.3,marcoM,-.56,1.51,z0);caja(.12,2.42,.3,marcoM,.56,1.51,z0);caja(1.24,.14,.3,marcoM,0,2.72,z0);
  puerta=new T.Group();puerta.position.set(-.5,.3,z0);S.add(puerta);
  const hojaM=madera({base:[52,34,22],n:5,var_:10,sucio:.6},[1,1],.8);
  caja(1,2.38,.06,hojaM,.5,1.19,0,0,puerta);
  [[.5,1.7],[.5,.65]].forEach(([x,y])=>caja(.7,.75,.02,M({color:'#2b1b10',roughness:.85}),x,y,.04,0,puerta));
  const laton=M({color:'#b08a45',roughness:.3,metalness:.9});
  const pomo=new T.Mesh(new T.SphereGeometry(.045,20,14),laton);pomo.position.set(.88,1.05,.085);pomo.castShadow=true;puerta.add(pomo);
  const roseta=new T.Mesh(new T.CylinderGeometry(.045,.045,.02,20),laton);roseta.rotation.x=1.57;roseta.position.set(.88,1.05,.04);puerta.add(roseta);
  puerta.userData.pomo=pomo;
  const nota=new T.Mesh(new T.PlaneGeometry(.22,.28),M({map:new T.TextureLoader().load('fotos/cosas/substack.png'),roughness:.9,color:'#d8c8b0'}));nota.position.set(.3,1.95,.04);nota.rotation.z=.08;puerta.add(nota);
  const porM=madera({base:[48,40,32],n:12,vertical:false,sucio:.8},[1,1]);
  caja(4.2,.3,2.2,porM,0,.15,1.1);caja(1.6,.15,.4,porM,0,.075,2.4);
  caja(4.6,.1,2.4,techoM,0,2.95,1.1);
  // barandas rotas
  [-1,1].forEach(s=>{caja(1.4,.06,.06,marcoM,s*1.25,1.0,2.08,0);for(let i=0;i<5;i++){const b=caja(.04,.7,.04,marcoM,s*(.65+i*.28),.65,2.08);if(i===2&&s>0)b.rotation.z=.5}});
  // cinta policial en el porche (se levanta para pasar por debajo)
  const ct=cinta();
  cintaP=new T.Group();cintaP.position.set(0,1.18,2.1);S.add(cintaP);
  const c1=new T.Mesh(new T.PlaneGeometry(3.9,.09,24,1),M({map:ct,side:T.DoubleSide,roughness:.5}));cintaP.add(c1);
  {const pa=c1.geometry.attributes.position;for(let i=0;i<pa.count;i++){const x=pa.getX(i);pa.setY(i,pa.getY(i)-.12*(1-Math.pow(x/1.95,2)))}}
  // ventanas tapiadas
  const vidrio=M({color:'#06080c',roughness:.15,metalness:.7});const tabla=madera({base:[70,60,48],n:1,var_:6},[1,1],1);
  [[-2.8,1.7],[2.8,1.7],[-2.4,4],[2.4,4]].forEach(([x,y],i)=>{caja(1.2,1.4,.05,vidrio,x,y,z0+.1);caja(1.32,.1,.08,marcoM,x,y+.74,z0+.12);caja(1.32,.1,.08,marcoM,x,y-.74,z0+.12);
    const b1=caja(1.6,.16,.04,tabla,x,y,z0+.16);b1.rotation.z=.6+rnd(-.1,.1);const b2=caja(1.6,.16,.04,tabla,x,y+rnd(-.2,.2),z0+.17);b2.rotation.z=-.5+rnd(-.1,.1);
    if(i===3){const l=new T.PointLight('#ff4a2a',.0,5,2);l.position.set(x,y,-.6);S.add(l);parpadeo.push([l,.7]);const gl=new T.Mesh(new T.PlaneGeometry(1.1,1.3),new T.MeshBasicMaterial({color:'#ff5a30',transparent:true,opacity:.2}));gl.position.set(x,y,z0+.11);S.add(gl);parpadeo.push([gl,.2])}});
  calco(redJohn(),1.1,1.1,1.5,1.6,z0+.1,0,0,.9);
  // estructura: cimiento de piedra, esquineros, aleros, chimenea, ventana redonda, bajante
  const piedra=(()=>{const [c,g]=lienzo(512,256);g.fillStyle='#2a2826';g.fillRect(0,0,512,256);for(let y=0;y<256;y+=32)for(let x=-(y/32%2)*30;x<512;x+=60){g.fillStyle=`rgb(${rnd(60,90)},${rnd(58,84)},${rnd(52,74)})`;g.fillRect(x+3,y+3,54,26)}grano(g,512,256,18);return tex(c,[6,1])})();
  const pM=M({map:piedra,bumpMap:piedra,bumpScale:.03,roughness:1});
  caja(10.3,.5,.3,pM,0,.25,z0+.06);caja(.3,.5,8.6,pM,-5.05,.25,-4.2);caja(.3,.5,8.6,pM,5.05,.25,-4.2);
  const trim=M({color:'#6e6a62',roughness:.85});
  [-5.02,5.02].forEach(x=>caja(.2,5.2,.22,trim,x,3.0,z0+.08));
  [-1,1].forEach(sd=>{const f=caja(5.9,.26,.08,trim,sd*2.55,alto+1.0,z0+.18);f.rotation.z=-sd*.42});
  caja(10.3,.16,.5,trim,0,alto+.02,z0+.15);
  const chim=M({map:piedra,roughness:1});caja(.8,3.2,.8,chim,3.3,alto+1.1,-4.5);caja(.95,.15,.95,M({color:'#1a1918',roughness:1}),3.3,alto+2.75,-4.5);
  const ojo=new T.Mesh(new T.CircleGeometry(.42,32),new T.MeshBasicMaterial({color:'#ffb060',transparent:true,opacity:.35}));ojo.position.set(0,alto+1.0,z0+.12);S.add(ojo);parpadeo.push([ojo,.35]);
  const aro=new T.Mesh(new T.TorusGeometry(.45,.05,10,32),trim);aro.position.set(0,alto+1.0,z0+.14);S.add(aro);
  caja(.1,alto,.1,M({color:'#3a3a3c',roughness:.5,metalness:.6}),4.85,alto/2,z0+.25);
  // marco de la puerta y escalones con contrahuella
  caja(1.5,.12,.34,trim,0,2.82,z0+.12);[-.68,.68].forEach(x=>caja(.14,2.5,.3,trim,x,1.55,z0+.12));
  caja(1.8,.04,.42,M({color:'#3a2c20',roughness:.9}),0,.17,2.42);
  // columnas torneadas del porche
  [-1.95,1.95].forEach(x=>{const col=new T.Mesh(new T.LatheGeometry([new T.Vector2(.11,0),new T.Vector2(.11,.1),new T.Vector2(.07,.18),new T.Vector2(.075,1.1),new T.Vector2(.09,1.3),new T.Vector2(.07,1.5),new T.Vector2(.075,2.4),new T.Vector2(.11,2.5),new T.Vector2(.11,2.62)],18),trim);col.position.set(x,.3,2.05);col.castShadow=true;S.add(col)});
  cactus(-1.5,1.6,1.1);cactus(1.55,1.7,.9);
  const farol=new T.PointLight('#ffb070',.6,6,2);farol.position.set(.9,2.6,.6);farol.castShadow=true;farol.shadow.mapSize.set(512,512);S.add(farol);parpadeo.push([farol,.7]);
  const bomb=new T.Sprite(new T.SpriteMaterial({map:brillo('rgba(255,190,110,1)'),depthWrite:false}));bomb.position.copy(farol.position);bomb.scale.set(.45,.45,1);S.add(bomb);parpadeo.push([bomb,.8]);

  // ----- adentro: la escena del crimen -----
  const paredM=madera({base:[40,30,24],n:10,var_:8,sucio:1.3},[2.5,1]);
  const pisoM=madera({base:[46,32,22],n:8,var_:10,sucio:1},[3,3],.7);
  const pisoI=new T.Mesh(new T.PlaneGeometry(8,8),pisoM);pisoI.rotation.x=-Math.PI/2;pisoI.position.set(0,.302,-4.1);pisoI.receiveShadow=true;S.add(pisoI);
  const techoI=new T.Mesh(new T.PlaneGeometry(8,8),M({color:'#0d0907',roughness:1}));techoI.rotation.x=Math.PI/2;techoI.position.set(0,3.6,-4.1);S.add(techoI);
  const pared=(w,x,z,ry)=>{const m=new T.Mesh(new T.PlaneGeometry(w,3.3),paredM);m.position.set(x,1.95,z);m.rotation.y=ry;m.receiveShadow=true;S.add(m)};
  pared(8,0,-8.1,0);pared(8,-4.85,-4.1,Math.PI/2);pared(8,4.85,-4.1,-Math.PI/2);
  const pf=(w,x)=>{const m=new T.Mesh(new T.PlaneGeometry(w,3.3),paredM);m.position.set(x,1.95,-.12);m.rotation.y=Math.PI;m.receiveShadow=true;S.add(m)};pf(4.3,-2.7);pf(4.3,2.7);
  const zoc=M({color:'#1a100a',roughness:.8});caja(9.7,.18,.04,zoc,0,.39,-8.07);caja(.04,.18,8,zoc,-4.82,.39,-4.1);caja(.04,.18,8,zoc,4.82,.39,-4.1);
  // al estilo Red John: cuarto ordenado, la víctima en la cama, la carita pintada con su sangre sobre la cabecera
  calco(redJohn(),1.7,1.7,-4.83,2.4,-4.6,0,Math.PI/2);
  const cama=new T.Group();const mCama=M({color:'#2a1a10',roughness:.6}),colchon=M({color:'#d8d2c6',roughness:.95}),sab=M({color:'#e6e1d6',roughness:1});
  caja(.08,1.15,1.6,mCama,-4.76,.88,-4.6,0,cama);           // cabecera
  caja(2.1,.28,1.55,mCama,-3.75,.44,-4.6,0,cama);           // base
  caja(.06,.6,1.55,mCama,-2.72,.6,-4.6,0,cama);             // pie de cama
  caja(2.0,.2,1.45,colchon,-3.78,.68,-4.6,0,cama);
  [-4.95,-4.25].forEach(z=>{const a=new T.Mesh(new T.SphereGeometry(1,18,12),colchon);a.scale.set(.18,.07,.3);a.position.set(-4.48,.86,z);cama.add(a)});
  // la sábana sobre el cuerpo
  const tor=new T.Mesh(new T.SphereGeometry(1,24,16),sab);tor.scale.set(.5,.13,.24);tor.position.set(-3.85,.86,-4.62);cama.add(tor);
  const cab=new T.Mesh(new T.SphereGeometry(.13,18,14),sab);cab.position.set(-4.42,.92,-4.6);cab.scale.y=.75;cama.add(cab);
  const pier=new T.Mesh(new T.SphereGeometry(1,18,12),sab);pier.scale.set(.5,.1,.2);pier.position.set(-3.1,.83,-4.6);cama.add(pier);
  caja(2.02,.04,1.58,sab,-3.75,.795,-4.6,0,cama);
  [-1,1].forEach(sd=>{const d=caja(1.9,.34,.02,sab,-3.75,.62,-4.6+sd*.8,0,cama);d.rotation.x=sd*.08});
  S.add(sombra(cama));
  calco(sangre('charco'),.9,.6,-3.85,1.0,-4.62,-Math.PI/2,0,.95);
  calco(sangre('charco'),.6,.45,-3.55,.82,-4.15,-Math.PI/2,0,.85);
  calco(sangre('salpicadura'),.5,.5,-3.5,.62,-3.79,0,0,.9);                     // chorrea por el costado de la sábana
  // mesita de noche con lámpara tenue
  caja(.45,.55,.4,mCama,-4.5,.58,-5.9);const lam=new T.Mesh(new T.CylinderGeometry(.08,.12,.18,16,1,true),M({color:'#d8c8a8',side:T.DoubleSide,emissive:'#6a4020',emissiveIntensity:.6}));lam.position.set(-4.5,1.08,-5.9);S.add(lam);
  const luzN=new T.PointLight('#ffb070',.5,3.2,2);luzN.position.set(-4.5,1.12,-5.9);luzN.castShadow=true;luzN.shadow.mapSize.set(512,512);S.add(luzN);parpadeo.push([luzN,.5]);
  // marcadores de evidencia junto a la cama
  [[-2.5,-4.0],[-2.45,-5.2],[-3.2,-3.6],[-3.4,-5.6],[-2.2,-4.6]].forEach(([x,z],i)=>{const g=new T.Group();const m=new T.Mesh(new T.CylinderGeometry(.0001,.07,.12,3),M({map:etiquetaNum(i+1),color:'#f0c419',roughness:.5}));m.position.y=.06;g.add(m);g.position.set(x,.3,z);g.rotation.y=rnd(0,3);S.add(sombra(g))});
  // cinta alrededor de la cama, entre dos parantes, sin cruzar el paso
  [[-1.95,-3.4],[-1.95,-5.9]].forEach(([x,z])=>caja(.05,1.0,.05,M({color:'#c9a400',roughness:.6}),x,.8,z));
  {const ci=new T.Mesh(new T.PlaneGeometry(2.5,.07),M({map:ct,side:T.DoubleSide,roughness:.5}));ci.position.set(-1.95,1.18,-4.65);ci.rotation.y=Math.PI/2;S.add(ci)}
  // tablero de investigación (corcho, fotos de lo que le gusta, hilo rojo)
  const tablero=new T.Mesh(new T.BoxGeometry(2.6,1.5,.04),M({map:corcho(),roughness:1}));tablero.position.set(4.83,2.0,-4.1);tablero.rotation.y=-Math.PI/2;tablero.receiveShadow=true;S.add(tablero);
  const fotos=[['cerati.jpg',.36,.46,-2.95,2.35],['bts.jpg',.5,.34,-3.75,2.4],['alvaro.jpg',.34,.44,-4.55,2.3],['cactus.jpg',.38,.3,-5.1,1.7],['psi.png',.3,.3,-4.2,1.65],['mentalista.jpg',.44,.32,-3.3,1.62]];
  const pinPos=[];fotos.forEach(([f,w,h,z,y])=>{foto('fotos/cosas/'+f,w,h,4.8,y,z,-Math.PI/2,rnd(-.08,.08));pinPos.push(V(4.79,y+h/2+.01,z))});
  const hiloM=new T.LineBasicMaterial({color:'#c01020'});[[0,4],[4,1],[1,5],[5,2],[2,3],[3,4],[0,5]].forEach(([a,b])=>S.add(new T.Line(new T.BufferGeometry().setFromPoints([pinPos[a],pinPos[b]]),hiloM)));
  // ----- del otro lado: el rincón de BTS -----
  const morado=new T.MeshBasicMaterial({color:'#a970ff'});caja(.03,.03,7.6,morado,4.8,3.48,-4.1);
  [[-1.8],[-4.1],[-6.4]].forEach(([z])=>{const l=new T.PointLight('#8a4dff',.55,4.5,2);l.position.set(4.3,3.2,z);S.add(l)});
  const pared3=(t,w,h,z,y)=>{const m=new T.Mesh(new T.PlaneGeometry(w,h),M({map:t,roughness:.7}));m.position.set(4.82,y,z);m.rotation.y=-Math.PI/2;m.receiveShadow=true;S.add(m);return m};
  pared3(poster('#2a0f4a','#7a3fd0',[['BTS','900 190px Inter Tight, sans-serif',330],['방탄소년단','700 46px sans-serif',420,'#e9dcff'],['ARMY','800 54px Inter Tight, sans-serif',620,'#ffd8f4']]),.62,.86,-1.25,2.05);
  pared3(poster('#140a24','#4a1d7a',[['보라해','900 110px sans-serif',300,'#cfa8ff'],['💜','400 150px sans-serif',520],['BORAHAE','700 40px JetBrains Mono, monospace',640,'#e9dcff']]),.56,.78,-7.25,2.1);
  pared3(poster('#5a2b9a','#c39bff',[['ARMY','900 150px Inter Tight, sans-serif',300],['FOREVER','700 60px Inter Tight, sans-serif',390,'#2a0f4a'],['7','900 220px Inter Tight, sans-serif',650,'#2a0f4a']]),.5,.7,-6.25,1.3);
  foto('fotos/cosas/bts.jpg',1.0,.66,4.8,2.6,-6.3,-Math.PI/2,.02);
  foto('fotos/cosas/bts.jpg',.42,.28,4.8,1.15,-1.25,-Math.PI/2,-.06);
  // banderín sobre el tablero
  {const [c,g]=lienzo(1024,128);const gr=g.createLinearGradient(0,0,1024,0);gr.addColorStop(0,'#3a137a');gr.addColorStop(1,'#a970ff');g.fillStyle=gr;g.fillRect(0,0,1024,128);g.fillStyle='#fff';g.font='900 64px Inter Tight, sans-serif';g.textAlign='center';g.fillText('BTS  ·  ARMY  ·  보라해',512,86);
   const b=new T.Mesh(new T.PlaneGeometry(2.4,.3),M({map:new T.CanvasTexture(c),roughness:.8,side:T.DoubleSide}));b.position.set(4.8,3.0,-4.1);b.rotation.y=-Math.PI/2;S.add(b)}
  // ARMY Bomb encendido y álbumes en el estante
  {const g=new T.Group();const mango=new T.Mesh(new T.CylinderGeometry(.025,.03,.2,16),M({color:'#111',roughness:.4}));mango.position.y=.1;g.add(mango);
   const bola=new T.Mesh(new T.SphereGeometry(.085,24,18),new T.MeshBasicMaterial({color:'#f2e6ff'}));bola.position.y=.29;g.add(bola);
   const halo=new T.Sprite(new T.SpriteMaterial({map:brillo('rgba(190,140,255,1)'),depthWrite:false,blending:T.AdditiveBlending}));halo.position.y=.29;halo.scale.set(.6,.6,1);g.add(halo);
   const lb=new T.PointLight('#c79bff',.7,3,2);lb.position.y=.3;g.add(lb);g.position.set(2.35,1.67,-7.8);S.add(g)}
  ['#5b2a9a','#d8b4ff','#1e1030','#9b5cff'].forEach((col,i)=>{const a=caja(.22,.22,.012,M({color:col,roughness:.4}),2.75+i*.13,1.78,-7.82+i*.01);a.rotation.y=rnd(-.1,.1)});
  // estante con libros y cactus
  const est=new T.Group();const mad=M({color:'#2a1a0e',roughness:.8});
  [0,.45,.9,1.35].forEach(y=>caja(1.3,.04,.32,mad,0,y,0,0,est));[-.65,.65].forEach(x=>caja(.04,1.4,.32,mad,x,.68,0,0,est));
  const colores=['#5a1e1e','#2c3a4a','#4a3a20','#203a2c','#3a2a3a','#6a5030','#1e2a3a'];
  [.02,.47].forEach(y=>{let x=-.6;while(x<.55){const w=rnd(.04,.08),h=rnd(.26,.38);const lb=caja(w,h,.22,M({color:colores[Math.floor(rnd(0,colores.length))],roughness:.75}),x+w/2,y+h/2+.02,0,0,est);lb.rotation.z=rnd(-.05,.05);x+=w+.005}});
  for(let i=0;i<5;i++){const lb=caja(.24,.04,.17,M({color:colores[i],roughness:.75}),-.3+i*.14,.95+i*.0,0,0,est);lb.rotation.y=rnd(-.3,.3);lb.position.y=.94+i*.0}
  est.position.set(2.8,.3,-7.85);S.add(est);
  cactus(3.6,-7.4,1);cactus(-4.2,-7.5,.85);cactus(4.2,-.9,1.1);

  // ----- la mesa y el regalo -----
  const mesa=new T.Group();const nogal=M({color:'#3a2414',roughness:.5});
  const tope=new T.Mesh(new T.CylinderGeometry(.62,.62,.05,48),nogal);tope.position.y=.78;mesa.add(tope);
  const pie=new T.Mesh(new T.LatheGeometry([new T.Vector2(.3,0),new T.Vector2(.28,.04),new T.Vector2(.08,.08),new T.Vector2(.05,.3),new T.Vector2(.07,.5),new T.Vector2(.05,.74),new T.Vector2(.12,.76)],24),nogal);mesa.add(pie);
  mesa.position.set(0,.3,-4.6);S.add(sombra(mesa));
  const regalo=new T.Object3D();regalo.position.set(0,1.25,-4.6);S.add(regalo);
  focoMesa=new T.SpotLight('#ffe2b8',0,7,.42,.5,1.3);focoMesa.position.set(0,3.5,-4.5);focoMesa.target=regalo;focoMesa.castShadow=true;focoMesa.shadow.mapSize.set(1024,1024);focoMesa.shadow.bias=-.0004;S.add(focoMesa);
  const pantalla=new T.Mesh(new T.ConeGeometry(.2,.18,24,1,true),M({color:'#111',side:T.DoubleSide,roughness:.5,metalness:.4}));pantalla.position.set(0,3.46,-4.5);S.add(pantalla);
  caja(.01,.14,.01,M({color:'#111'}),0,3.6,-4.5);
  lampCono=new T.Mesh(new T.ConeGeometry(1.2,3.1,32,1,true),new T.MeshBasicMaterial({color:'#ffd9a0',transparent:true,opacity:0,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending,fog:false}));lampCono.position.set(0,1.92,-4.55);S.add(lampCono);

  // polvo
  const np=600,pos=new Float32Array(np*3);for(let i=0;i<np;i++){pos[i*3]=rnd(-4.6,4.6);pos[i*3+1]=rnd(.4,3.4);pos[i*3+2]=rnd(-8,-.3)}
  const pg=new T.BufferGeometry();pg.setAttribute('position',new T.BufferAttribute(pos,3));
  polvo=new T.Points(pg,new T.PointsMaterial({color:'#e8d6b0',size:.01,transparent:true,opacity:.6,depthWrite:false}));S.add(polvo);

  // ----- manos y linterna (pegadas a la cámara) -----
  manoL=crearMano(-1);C.add(manoL);manoL.position.set(-.13,-.15,-.3);manoL.rotation.set(.15,.12,1.35);manoL.userData.cierra(1);
  linternaObj=new T.Group();const negro=M({color:'#121212',roughness:.35,metalness:.7});
  const cuerpoL=new T.Mesh(new T.CylinderGeometry(.017,.017,.16,18),negro);cuerpoL.rotation.x=Math.PI/2;linternaObj.add(cuerpoL);
  const cabeza=new T.Mesh(new T.CylinderGeometry(.026,.018,.05,20),negro);cabeza.rotation.x=Math.PI/2;cabeza.position.z=-.1;linternaObj.add(cabeza);
  const lente=new T.Mesh(new T.CircleGeometry(.023,20),new T.MeshBasicMaterial({color:'#fff6e0'}));lente.position.z=-.126;linternaObj.add(lente);
  linternaObj.position.set(-.12,-.135,-.33);linternaObj.rotation.set(.08,.1,0);C.add(linternaObj);
  manoR=crearMano(1);manoR.scale.setScalar(1.3);S.add(manoR);manoR.visible=false;

  linterna=new T.SpotLight('#fff0d8',3.2,16,.38,.5,1.4);linterna.castShadow=true;linterna.shadow.mapSize.set(1024,1024);linterna.shadow.bias=-.0005;linterna.shadow.camera.near=.1;
  S.add(linterna);S.add(linterna.target);
  if(T.EffectComposer&&T.UnrealBloomPass&&T.ShaderPass){try{
    comp=new T.EffectComposer(R);comp.addPass(new T.RenderPass(S,C));comp.addPass(new T.UnrealBloomPass(new T.Vector2(W(),H()),.7,.55,.8));
    comp.addPass(new T.ShaderPass({uniforms:{tDiffuse:{value:null},uT:{value:0}},
      vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader:`uniform sampler2D tDiffuse;uniform float uT;varying vec2 vUv;
        float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233))+uT)*43758.5453);}
        vec3 srgb(vec3 c){return mix(c*12.92,1.055*pow(c,vec3(1./2.4))-.055,step(.0031308,c));}
        void main(){vec3 c=texture2D(tDiffuse,vUv).rgb;c=srgb(max(c,0.));float d=distance(vUv,vec2(.5));c*=smoothstep(.85,.32,d);c+=(h(vUv*800.)-.5)*.045;gl_FragColor=vec4(c,1.);}`}));
    comp.passes[2].renderToScreen=true;R.outputEncoding=T.LinearEncoding}catch(e){console.warn(e);comp=null;R.outputEncoding=T.sRGBEncoding}}
  reloj=new T.Clock();
  addEventListener('resize',()=>{R.setSize(W(),H());if(comp)comp.setSize(W(),H());C.aspect=W()/H();C.fov=W()<H()?76:60;C.updateProjectionMatrix()});
  listo=true;
}

/* ---------- recorrido ---------- */
const V=(x,y,z)=>new T.Vector3(x,y,z);
const RUTA=[
  [0,   V(-.4,1.38,14.75), V(-.2,1.55,0),   0],   // en el asiento del auto
  [2.8, V(-.4,1.38,14.75), V(0,1.45,0),     0],
  [3.8, V(-.5,1.32,14.6), V(-6,1.3,13.6), 0],   // mira a su puerta
  [5.4, V(-1.6,1.62,13.4),V(-4,1.6,9),    1],   // se baja
  [6.6, V(-1.4,1.62,12.9),V(0,1.8,0),     0],   // mira la casa
  [12.4,V(0,1.62,3.05),   V(.1,1.25,2.1), 1],   // camina hasta la cinta
  [13.2,V(0,1.62,3.05),   V(.1,1.3,2.1),  0],
  [14.5,V(.05,1.15,1.7),  V(.2,1.25,0),   1],   // se agacha y pasa por debajo
  [15.6,V(.15,1.9,.8),    V(.3,1.3,0),    1],   // se levanta frente a la puerta
  [19.6,V(.15,1.9,.8),    V(.3,1.3,0),    0],
  [20.4,V(.05,1.9,.7),    V(-1.6,.7,-3),  0],
  [23.0,V(-.1,1.9,-1.2),  V(-2.6,.9,-4.6),1],
  [24.6,V(-.3,1.9,-1.6),  V(-4.8,2.3,-4.6),0],  // la carita
  [26.2,V(-.3,1.9,-1.6),  V(-3.8,.9,-4.6),0],   // la cama
  [27.9,V(-.1,1.9,-1.8),  V(4.8,2.0,-3.6),0],   // el tablero
  [29.4,V(-.1,1.9,-1.8),  V(4.8,1.9,-4.6),0],
  [30.6,V(0,1.9,-1.8),    V(2.8,1.0,-7.8),0],
  [31.8,V(0,1.88,-1.8),   V(0,1.3,-4.6),  0],
  [33.2,V(0,1.88,-1.8),   V(0,1.35,-4.6), 0],
  [36.2,V(0,1.74,-3.35),  V(0,1.25,-4.6), 1],
  [37.2,V(0,1.74,-3.35),  V(0,1.25,-4.6), 0],
];
const FIN=37.2;
const suave=x=>x*x*(3-2*x);
let fase=0;
function camara(t,dt){
  let i=0;while(i<RUTA.length-2&&t>RUTA[i+1][0])i++;
  const [ta,pa,la]=RUTA[i],[tb,pb,lb,camina]=RUTA[i+1];
  const k=suave(Math.min(1,Math.max(0,(t-ta)/(tb-ta))));
  const p=pa.clone().lerp(pb,k),l=la.clone().lerp(lb,k);
  const andando=camina&&k>.02&&k<.97;
  if(andando){fase+=dt*Math.PI*2*1.6;const sn=Math.sin(fase);if(sn<-.97&&!camara.pisado){camara.pisado=true;pisada()}if(sn>0)camara.pisado=false}
  const amp=andando?1:.22;
  const bobY=Math.abs(Math.sin(fase))*.05*amp,bobX=Math.sin(fase*.5)*.035*amp;
  const quieto=t>=FIN-.6;const tr=quieto?0:.002+.004*amp;
  C.position.set(p.x+bobX+rnd(-tr,tr),p.y-bobY+rnd(-tr,tr)*.6,p.z);
  C.lookAt(l.x+(quieto?0:rnd(-.006,.006)),l.y+(quieto?0:rnd(-.006,.006)),l.z);
  if(!quieto)C.rotateZ(Math.sin(fase*.5)*.014*amp+Math.sin(t*1.3)*.004);
  // manos: siguen el paso
  const baja=Math.max(0,Math.min(1,(t-(FIN-1.4))/1.2))*.3;manoL.position.y=-.15-bobY*.4+Math.sin(t*2.1)*.003*(quieto?0:1)-baja;linternaObj.position.y=-.135-bobY*.4+Math.sin(t*2.1)*.003*(quieto?0:1)-baja;
  const cab=linternaObj.localToWorld(V(0,0,-.13));linterna.position.copy(cab);
  const dir=new T.Vector3();C.getWorldDirection(dir);
  linterna.target.position.lerp(C.position.clone().add(dir.multiplyScalar(6)),Math.min(1,dt*5));
}

/* ---------- sonido ---------- */
let pisada=()=>{},sonar=()=>{};

/* ---------- línea de tiempo ---------- */
let puertaObj=0,puertaVel=1,manoEst='fuera',manoK=0,giro=0,focoT=-1,manoA='pomo',autoObj=0,cintaObj=0;
function linea(){
  ev.length=0;const e=(t,f)=>ev.push({t,f,hecho:false});
  e(.05,()=>{sonar('lluvia',1);sonar('respira')});
  e(.9,()=>sonar('radio'));e(2.2,()=>sonar('radio'));
  e(3.0,()=>{autoObj=-1.15;sonar('auto')});
  e(6.2,()=>{autoObj=0;sonar('portazo')});
  e(12.6,()=>{manoA='cinta';manoEst='sube'});
  e(13.1,()=>{manoEst='agarra';cintaObj=1});
  e(14.6,()=>{cintaObj=0;manoEst='baja'});
  e(15.9,()=>{manoA='pomo';manoEst='sube'});
  e(17.1,()=>{manoEst='agarra';sonar('pestillo')});
  e(17.6,()=>{puertaObj=.4;puertaVel=1.2;sonar('rechina',.5)});
  e(19.0,()=>{puertaObj=1.75;puertaVel=1;sonar('rechina',1)});
  e(19.2,()=>manoEst='baja');
  e(20.5,()=>sonar('lluvia',.35));
  e(24.7,()=>sonar('susto',.5));
  e(31.9,()=>{focoT=0;sonar('descubre')});
  e(36.6,()=>sonar('alivio'));
}
function pintaManoR(dt){
  const obj=manoEst==='sube'||manoEst==='agarra'?1:0;
  manoK+=(obj-manoK)*Math.min(1,dt*(manoEst==='baja'?4:2.2));
  manoR.visible=manoK>.01;if(!manoR.visible)return;
  const pomo=manoA==='pomo'?puerta.userData.pomo.getWorldPosition(V(0,0,0)):cintaP.localToWorld(V(.12,-.1,0));
  const reposo=C.localToWorld(V(.32,-.38,-.2));
  const meta=pomo.clone().add(manoA==='pomo'?V(.075,-.03,.075):V(.05,-.04,.06));
  manoR.position.copy(reposo.lerp(meta,suave(manoK)));
  manoR.quaternion.copy(C.quaternion);
  const g=manoEst==='agarra'?1:manoEst==='baja'?giro:0;giro+=(g-giro)*Math.min(1,dt*6);
  manoR.rotateY(.55);manoR.rotateX(.45);manoR.rotateZ(-1.35-giro*.6);
  manoR.userData.cierra(.25+(manoEst==='agarra'?.75:0)*Math.min(1,manoK));
  if(manoA==='pomo'&&manoEst==='agarra'&&puertaObj>0)manoR.position.add(V(-.18*Math.min(1,puerta.rotation.y/.4),0,-.05*Math.min(1,puerta.rotation.y/.4)));
}

/* ---------- bucle ---------- */
function cuadroLoop(){
  if(!listo)return;requestAnimationFrame(cuadroLoop);
  const dt=Math.min(reloj.getDelta(),.05);
  const t=corriendo?(window.Intro3D._fijo!=null?window.Intro3D._fijo:(performance.now()-t0)/1000):0;
  camara(Math.min(t,FIN),corriendo?dt:0);
  if(corriendo)ev.forEach(x=>{if(!x.hecho&&t>=x.t){x.hecho=true;x.f()}});
  puerta.rotation.y+=(puertaObj-puerta.rotation.y)*Math.min(1,dt*puertaVel*2.2);
  pintaManoR(dt);
  autoPuerta.rotation.y+=(autoObj-autoPuerta.rotation.y)*Math.min(1,dt*(autoObj?1.8:5));
  {const ph=Math.floor(performance.now()/140)%4,on=C.position.z>13.3?0:C.position.z>.3?1.4:.35;sirena[0].intensity=(ph===0||ph===2?2.6:0)*on;sirena[1].intensity=(ph===1||ph===3?2.6:0)*on;sirena[2].material.color.set(ph%2?'#300':'#ff1a1a');sirena[3].material.color.set(ph%2?'#2a5bff':'#012')}
  cintaP.position.y+=((cintaObj?1.62:1.18)-cintaP.position.y)*Math.min(1,dt*4);cintaP.rotation.x+=((cintaObj?-.5:0)-cintaP.rotation.x)*Math.min(1,dt*4);
  {lluvia.visible=C.position.z>-.2;const a=lluvia.geometry.attributes.position,arr=a.array,cz=C.position.z;for(let i=0;i<arr.length;i+=6){arr[i+1]-=dt*9;arr[i+4]-=dt*9;if(arr[i+4]<0){const y=rnd(7,9);arr[i+1]=y;arr[i+4]=y-.32;const z=cz+rnd(-8,14);arr[i+2]=z;arr[i+5]=z}}a.needsUpdate=true}
  if(regaloMat){const luz=focoT<0?.05:Math.max(.05,focoMesa.intensity/3)*.97;regaloMat.color.setScalar(luz)}
  if(fundeT>=0&&regaloMat){fundeT+=dt;regaloMat.opacity=Math.max(0,1-fundeT/fundeDur);if(regaloMat.opacity<=0){regaloPlano.visible=false;fundeT=-1}}
  parpadeo.forEach(([v,b],i)=>{const f=.78+Math.sin(performance.now()*.011+i*2)*.12+rnd(-.12,.12);if(v.isLight)v.intensity=b*f;else if(v.material)v.material.opacity=b*f});
  if(focoT>=0){focoT+=dt;const seq=[[0,1],[.12,0],[.2,1],[.32,.1],[.42,1],[.55,.3],[.65,1]];let v=1;for(const [tt,vv] of seq)if(focoT>=tt)v=vv;focoMesa.intensity=v*3;lampCono.material.opacity=v*.05}
  polvo.rotation.y+=dt*.008;
  if(comp){comp.passes[2].uniforms.uT.value=performance.now()%1000;comp.render()}else R.render(S,C);
  if(corriendo&&t>=FIN&&alTerminar){const f=alTerminar;alTerminar=null;f()}
}

window.Intro3D={
  preparar(cv){construir(cv);camara(0,0);reloj.getDelta();cuadroLoop()},
  rectRegalo(){if(!regaloPlano)return{x:0,y:0,w:0,h:0};let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;const w=regaloPlano.userData.w/2,h=regaloPlano.userData.h/2;
    [[-w,-h],[w,-h],[-w,h],[w,h]].forEach(([x,y])=>{const p=regaloPlano.localToWorld(V(x,y,0)).project(C);const sx=(p.x*.5+.5)*W(),sy=(-p.y*.5+.5)*H();x0=Math.min(x0,sx);x1=Math.max(x1,sx);y0=Math.min(y0,sy);y1=Math.max(y1,sy)});return{x:x0,y:y0,w:x1-x0,h:y1-y0}},
  fundeRegalo(ms){fundeDur=ms/1000;fundeT=0;manoL.visible=linternaObj.visible=false},
  // el regalo dibujado (capturado del SVG de la página) como una tarjeta en la mesa
  ponRegalo(canvas){const t=new T.CanvasTexture(canvas);t.encoding=T.sRGBEncoding;t.anisotropy=8;
    regaloMat=new T.MeshBasicMaterial({map:t,transparent:true,toneMapped:false,fog:false,depthWrite:false});const w=.66,h=w*380/340;
    regaloPlano=new T.Mesh(new T.PlaneGeometry(w,h),regaloMat);regaloPlano.userData={w,h};
    regaloPlano.position.set(0,1.105+(350-190)/380*h,-4.6);regaloPlano.lookAt(V(0,1.74,-3.35));regaloPlano.renderOrder=5;S.add(regaloPlano);
    const sh=new T.Mesh(new T.CircleGeometry(.3,32),new T.MeshBasicMaterial({color:'#000',transparent:true,opacity:.55,depthWrite:false}));sh.rotation.x=-Math.PI/2;sh.scale.y=.45;sh.position.set(.03,1.107,-4.58);S.add(sh)},
  correr(api,fin){pisada=api.paso||pisada;sonar=api.sonar||sonar;linea();alTerminar=fin;t0=performance.now();corriendo=true},
  parar(){listo=false;try{R.dispose()}catch(e){}},
  get FIN(){return FIN}
};
})();
