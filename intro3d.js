/* =====================================================================
   Entrada en primera persona: el bosque, la casa y la escena del crimen.
   Three.js r128 · todo procedural salvo las fotos de fotos/cosas/
   ===================================================================== */
(function(){
const T=THREE;
let R,S,C,reloj,linterna,focoMesa,lampCono,puerta,parpadeo=[],polvo,listo=false,corriendo=false,t0=0,alTerminar=null;
let manoL,manoR,linternaObj,regaloMats=[];
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
function redJohn(){const [c,g]=lienzo(512,512);g.lineCap='round';g.lineJoin='round';
  const trazo=(pts,w)=>{for(let pas=0;pas<3;pas++){g.strokeStyle=`rgba(${110+pas*25},${6+pas*4},${8+pas*3},${.55+pas*.15})`;g.lineWidth=w*(1-pas*.18);g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x+rnd(-1.5,1.5),y+rnd(-1.5,1.5)):g.moveTo(x,y));g.stroke()}};
  const circ=[];for(let a=0;a<=Math.PI*2+.15;a+=.08)circ.push([256+Math.cos(a)*(170+rnd(-4,4)),250+Math.sin(a)*(175+rnd(-4,4))]);trazo(circ,20);
  trazo([[196,178],[192,236]],22);trazo([[318,178],[322,236]],22);
  const sonr=[];for(let a=.35;a<=Math.PI-.35;a+=.08)sonr.push([256+Math.cos(a)*110,262+Math.sin(a)*80]);trazo(sonr,18);
  [[100,330],[150,400],[196,240],[322,240],[300,345],[400,330],[256,425],[220,341]].forEach(([x,y])=>{const l=rnd(40,120);
    g.strokeStyle='rgba(120,8,10,.85)';g.lineWidth=rnd(4,8);g.beginPath();g.moveTo(x,y);g.lineTo(x+rnd(-2,2),y+l);g.stroke();
    g.fillStyle='rgba(110,6,8,.9)';g.beginPath();g.ellipse(x,y+l+4,rnd(4,6),rnd(6,9),0,0,7);g.fill()});
  return new T.CanvasTexture(c)}
function cinta(){const [c,g]=lienzo(1024,64);g.fillStyle='#e8c21a';g.fillRect(0,0,1024,64);g.fillStyle='#111';
  g.font='900 30px Unbounded, Inter Tight, sans-serif';g.textBaseline='middle';
  for(let x=10;x<1024;x+=340){g.fillText('NO PASAR',x,33);g.fillRect(x+180,14,130,36);g.fillStyle='#e8c21a';g.font='700 16px JetBrains Mono, monospace';g.fillText('ESCENA DEL CRIMEN',x+184,33);g.fillStyle='#111';g.font='900 30px Unbounded, Inter Tight, sans-serif'}
  grano(g,1024,64,10);return tex(c)}
function corcho(){const [c,g]=lienzo(512,384);g.fillStyle='#9a6b3e';g.fillRect(0,0,512,384);
  for(let j=0;j<5000;j++){g.fillStyle=`rgba(${rnd(60,140)},${rnd(40,90)},${rnd(20,50)},.6)`;g.fillRect(rnd(0,512),rnd(0,384),rnd(1,3),rnd(1,3))}return tex(c)}
function etiquetaNum(n){const [c,g]=lienzo(64,64);g.fillStyle='#f0c419';g.fillRect(0,0,64,64);g.fillStyle='#111';g.font='900 40px Inter Tight, sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(n,32,35);return new T.CanvasTexture(c)}

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

  // ----- la casa -----
  const mF=madera({base:[58,52,46],n:10,var_:16,sucio:.9},[2.2,1.3]);
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
  caja(4.6,.1,2.4,techoM,0,2.95,1.1);[-1.95,1.95].forEach(x=>caja(.14,2.65,.14,marcoM,x,1.62,2.05));
  // barandas rotas
  [-1,1].forEach(s=>{caja(1.4,.06,.06,marcoM,s*1.25,1.0,2.08,0);for(let i=0;i<5;i++){const b=caja(.04,.7,.04,marcoM,s*(.65+i*.28),.65,2.08);if(i===2&&s>0)b.rotation.z=.5}});
  // cinta policial en el porche, una rota
  const ct=cinta();
  const c1=new T.Mesh(new T.PlaneGeometry(4.2,.09),M({map:ct,side:T.DoubleSide,roughness:.5}));c1.position.set(0,1.25,2.12);c1.rotation.z=.06;S.add(c1);
  const c2=new T.Mesh(new T.PlaneGeometry(1.6,.09),M({map:ct,side:T.DoubleSide,roughness:.5}));c2.position.set(-1.25,1.0,2.12);c2.rotation.z=-.7;S.add(c2);
  // ventanas tapiadas
  const vidrio=M({color:'#06080c',roughness:.15,metalness:.7});const tabla=madera({base:[70,60,48],n:1,var_:6},[1,1],1);
  [[-2.8,1.7],[2.8,1.7],[-2.4,4],[2.4,4]].forEach(([x,y],i)=>{caja(1.2,1.4,.05,vidrio,x,y,z0+.1);caja(1.32,.1,.08,marcoM,x,y+.74,z0+.12);caja(1.32,.1,.08,marcoM,x,y-.74,z0+.12);
    const b1=caja(1.6,.16,.04,tabla,x,y,z0+.16);b1.rotation.z=.6+rnd(-.1,.1);const b2=caja(1.6,.16,.04,tabla,x,y+rnd(-.2,.2),z0+.17);b2.rotation.z=-.5+rnd(-.1,.1);
    if(i===3){const l=new T.PointLight('#ff4a2a',.0,5,2);l.position.set(x,y,-.6);S.add(l);parpadeo.push([l,.7]);const gl=new T.Mesh(new T.PlaneGeometry(1.1,1.3),new T.MeshBasicMaterial({color:'#ff5a30',transparent:true,opacity:.2}));gl.position.set(x,y,z0+.11);S.add(gl);parpadeo.push([gl,.2])}});
  calco(redJohn(),1.1,1.1,1.5,1.6,z0+.1,0,0,.9);
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
  // Red John en sangre, pared izquierda
  calco(redJohn(),2.3,2.3,-4.83,2.05,-4.3,0,Math.PI/2);
  calco(sangre('salpicadura'),1.6,1.6,-4.82,1.2,-6.4,0,Math.PI/2,.9);
  calco(sangre('salpicadura'),1.2,1.2,4.82,1.1,-1.8,0,-Math.PI/2,.8);
  // el cuerpo bajo la sábana y el charco
  calco(sangre('charco'),2.2,1.6,-2.4,.31,-5.3,-Math.PI/2,0,.95);
  const sab=M({color:'#cfcac0',roughness:1});const cuerpo=new T.Group();
  const tor=new T.Mesh(new T.SphereGeometry(1,22,14),sab);tor.scale.set(.32,.16,.62);tor.position.set(0,.14,0);cuerpo.add(tor);
  const cab=new T.Mesh(new T.SphereGeometry(.15,16,12),sab);cab.scale.y=.8;cab.position.set(0,.12,-.75);cuerpo.add(cab);
  const pies=new T.Mesh(new T.SphereGeometry(1,14,10),sab);pies.scale.set(.25,.11,.32);pies.position.set(0,.09,.75);cuerpo.add(pies);
  const borde=new T.Mesh(new T.CylinderGeometry(.6,.68,.04,30),sab);borde.scale.z=1.7;borde.position.y=.02;cuerpo.add(borde);
  const manchaS=new T.Mesh(new T.PlaneGeometry(.5,.4),new T.MeshStandardMaterial({map:sangre('charco'),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}));manchaS.rotation.x=-Math.PI/2;manchaS.position.set(.05,.31,-.15);cuerpo.add(manchaS);
  cuerpo.position.set(-2.4,.3,-5.2);cuerpo.rotation.y=.4;S.add(sombra(cuerpo));
  // marcadores de evidencia
  [[-1.5,-4.4],[-2.9,-6.3],[-1.2,-6.0],[-3.4,-4.0],[-.9,-3.4]].forEach(([x,z],i)=>{const g=new T.Group();const m=new T.Mesh(new T.CylinderGeometry(.0001,.07,.12,3),M({map:etiquetaNum(i+1),color:'#f0c419',roughness:.5}));m.position.y=.06;g.add(m);g.position.set(x,.3,z);g.rotation.y=rnd(0,3);S.add(sombra(g))});
  // silla volcada
  const silla=new T.Group();const sm=M({color:'#2a1a0e',roughness:.8});
  caja(.45,.04,.45,sm,0,.45,0,0,silla);[[-.2,-.2],[.2,-.2],[-.2,.2],[.2,.2]].forEach(([x,z])=>caja(.04,.45,.04,sm,x,.22,z,0,silla));caja(.45,.5,.04,sm,0,.72,-.2,0,silla);
  silla.position.set(-1.0,.52,-6.6);silla.rotation.set(1.45,.6,0);S.add(silla);
  // vidrios rotos
  const vid=M({color:'#cfe3ff',roughness:.05,metalness:.3,transparent:true,opacity:.5});for(let i=0;i<14;i++){const s=new T.Mesh(new T.CircleGeometry(rnd(.02,.06),3),vid);s.rotation.set(-Math.PI/2,0,rnd(0,6));s.position.set(-1.3+rnd(-.4,.4),.305,-6.3+rnd(-.4,.4));S.add(s)}
  // cinta adentro, rodeando el cuerpo
  [[-1.2,-3.6,-4.9,1.4],[-1.0,-6.7,-5.0,-1.2]].forEach(([x,z,_,ry])=>{const ci=new T.Mesh(new T.PlaneGeometry(2.6,.07),M({map:ct,side:T.DoubleSide,roughness:.5}));ci.position.set(x,.95,z);ci.rotation.y=ry;S.add(ci)});
  // tablero de investigación (corcho, fotos de lo que le gusta, hilo rojo)
  const tablero=new T.Mesh(new T.BoxGeometry(2.6,1.5,.04),M({map:corcho(),roughness:1}));tablero.position.set(4.83,2.0,-4.1);tablero.rotation.y=-Math.PI/2;tablero.receiveShadow=true;S.add(tablero);
  const fotos=[['cerati.jpg',.36,.46,-2.95,2.35],['bts.jpg',.5,.34,-3.75,2.4],['alvaro.jpg',.34,.44,-4.55,2.3],['cactus.jpg',.38,.3,-5.1,1.7],['psi.png',.3,.3,-4.2,1.65],['mentalista.jpg',.44,.32,-3.3,1.62]];
  const pinPos=[];fotos.forEach(([f,w,h,z,y])=>{foto('fotos/cosas/'+f,w,h,4.8,y,z,-Math.PI/2,rnd(-.08,.08));pinPos.push(V(4.79,y+h/2+.01,z))});
  const hiloM=new T.LineBasicMaterial({color:'#c01020'});[[0,4],[4,1],[1,5],[5,2],[2,3],[3,4],[0,5]].forEach(([a,b])=>S.add(new T.Line(new T.BufferGeometry().setFromPoints([pinPos[a],pinPos[b]]),hiloM)));
  // estante con libros y cactus
  const est=new T.Group();const mad=M({color:'#2a1a0e',roughness:.8});
  [0,.45,.9,1.35].forEach(y=>caja(1.3,.04,.32,mad,0,y,0,0,est));[-.65,.65].forEach(x=>caja(.04,1.4,.32,mad,x,.68,0,0,est));
  const colores=['#5a1e1e','#2c3a4a','#4a3a20','#203a2c','#3a2a3a','#6a5030','#1e2a3a'];
  [.02,.47].forEach(y=>{let x=-.6;while(x<.55){const w=rnd(.04,.08),h=rnd(.26,.38);const lb=caja(w,h,.22,M({color:colores[Math.floor(rnd(0,colores.length))],roughness:.75}),x+w/2,y+h/2+.02,0,0,est);lb.rotation.z=rnd(-.05,.05);x+=w+.005}});
  for(let i=0;i<5;i++){const lb=caja(.24,.04,.17,M({color:colores[i],roughness:.75}),-.3+i*.14,.95+i*.0,0,0,est);lb.rotation.y=rnd(-.3,.3);lb.position.y=.94+i*.0}
  est.position.set(2.8,.3,-7.85);S.add(est);
  // libros tirados en el piso
  for(let i=0;i<4;i++){const lb=caja(.24,.04,.17,M({color:colores[i+2],roughness:.75}),2.2+rnd(-.5,.5),.32,-6.9+rnd(-.4,.4));lb.rotation.y=rnd(0,3)}
  cactus(3.6,-7.4,1);cactus(-4.2,-7.5,.85);cactus(4.2,-.9,1.1);

  // ----- la mesa y el regalo -----
  const mesa=new T.Group();const nogal=M({color:'#3a2414',roughness:.5});
  const tope=new T.Mesh(new T.CylinderGeometry(.62,.62,.05,48),nogal);tope.position.y=.78;mesa.add(tope);
  const pie=new T.Mesh(new T.LatheGeometry([new T.Vector2(.3,0),new T.Vector2(.28,.04),new T.Vector2(.08,.08),new T.Vector2(.05,.3),new T.Vector2(.07,.5),new T.Vector2(.05,.74),new T.Vector2(.12,.76)],24),nogal);mesa.add(pie);
  mesa.position.set(0,.3,-4.6);S.add(sombra(mesa));
  const rojo=M({color:'#2a0306',roughness:.42}),gris=M({color:'#26262a',roughness:.3,metalness:.25});regaloMats=[rojo,gris];
  const regalo=new T.Group();caja(.42,.34,.42,rojo,0,.17,0,0,regalo);caja(.46,.09,.46,rojo,0,.38,0,0,regalo);
  [[.07,.44,.432],[.432,.44,.07]].forEach(([a,b,c])=>caja(a,b,c,gris,0,.215,0,0,regalo));
  [-1,1].forEach(s=>{const l=new T.Mesh(new T.TorusGeometry(.07,.025,12,28),gris);l.position.set(s*.07,.47,0);l.rotation.set(0,s*.5,s*.6);l.scale.set(1,.8,.6);l.castShadow=true;regalo.add(l)});
  caja(.11,.09,.03,laton,0,.15,.225,0,regalo);const arco=new T.Mesh(new T.TorusGeometry(.035,.009,8,20,Math.PI),laton);arco.position.set(0,.195,.225);regalo.add(arco);
  regalo.position.set(0,1.11,-4.6);regalo.rotation.y=-.35;S.add(regalo);
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
  reloj=new T.Clock();
  addEventListener('resize',()=>{R.setSize(W(),H());C.aspect=W()/H();C.fov=W()<H()?76:60;C.updateProjectionMatrix()});
  listo=true;
}

/* ---------- recorrido ---------- */
const V=(x,y,z)=>new T.Vector3(x,y,z);
const RUTA=[
  [0,   V(0,1.62,11),   V(0,1.9,0),    0],
  [6.0, V(.15,1.9,.8),V(.3,1.3,0),  1],
  [10.0,V(.15,1.9,.8),V(.3,1.3,0),  0],
  [10.8,V(.05,1.9,.7), V(-1.6,.6,-3), 0],
  [13.4,V(-.1,1.9,-1.2), V(-2.4,.5,-4.6),1],
  [15.0,V(-.3,1.9,-1.6), V(-4.8,2.0,-4.3),0],
  [16.6,V(-.3,1.9,-1.6), V(-2.4,.3,-5.2),0],
  [18.3,V(-.1,1.9,-1.8), V(4.8,2.0,-3.6),0],
  [19.8,V(-.1,1.9,-1.8), V(4.8,1.9,-4.6),0],
  [21.0,V(0,1.9,-1.8),   V(2.8,1.0,-7.8),0],
  [22.2,V(0,1.88,-1.8),  V(0,1.3,-4.6), 0],
  [23.6,V(0,1.88,-1.8),  V(0,1.35,-4.6),0],
  [26.4,V(0,1.7,-3.45),  V(0,1.3,-4.6), 1],
  [28.4,V(0,1.7,-3.45),  V(0,1.3,-4.6), 0],
];
const FIN=28.4;
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
  const tr=.002+.004*amp;
  C.position.set(p.x+bobX+rnd(-tr,tr),p.y-bobY+rnd(-tr,tr)*.6,p.z);
  C.lookAt(l.x+rnd(-.006,.006),l.y+rnd(-.006,.006),l.z);
  C.rotateZ(Math.sin(fase*.5)*.014*amp+Math.sin(t*1.3)*.004);
  // manos: siguen el paso
  manoL.position.y=-.15-bobY*.4+Math.sin(t*2.1)*.003;linternaObj.position.y=-.135-bobY*.4+Math.sin(t*2.1)*.003;
  const cab=linternaObj.localToWorld(V(0,0,-.13));linterna.position.copy(cab);
  const dir=new T.Vector3();C.getWorldDirection(dir);
  linterna.target.position.lerp(C.position.clone().add(dir.multiplyScalar(6)),Math.min(1,dt*5));
}

/* ---------- sonido ---------- */
let pisada=()=>{},sonar=()=>{};

/* ---------- línea de tiempo ---------- */
let puertaObj=0,puertaVel=1,manoEst='fuera',manoK=0,giro=0,focoT=-1,apagonT=-1;
function linea(){
  ev.length=0;const e=(t,f)=>ev.push({t,f,hecho:false});
  e(.1,()=>sonar('respira'));
  e(6.2,()=>manoEst='sube');
  e(7.5,()=>{manoEst='agarra';sonar('pestillo')});
  e(8.0,()=>{puertaObj=.4;puertaVel=1.2;sonar('rechina',.5)});
  e(9.4,()=>{puertaObj=1.75;puertaVel=1;sonar('rechina',1)});
  e(9.6,()=>manoEst='baja');
  e(15.0,()=>sonar('susto',.5));
  e(22.3,()=>{focoT=0;regaloMats[0].color.set('#7e0812');regaloMats[1].color.set('#a0a0a8');sonar('descubre')});
  e(26.8,()=>{apagonT=0;sonar('alivio')});
}
function pintaManoR(dt){
  const obj=manoEst==='sube'||manoEst==='agarra'?1:0;
  manoK+=(obj-manoK)*Math.min(1,dt*(manoEst==='baja'?4:2.2));
  manoR.visible=manoK>.01;if(!manoR.visible)return;
  const pomo=puerta.userData.pomo.getWorldPosition(V(0,0,0));
  const reposo=C.localToWorld(V(.32,-.38,-.2));
  const meta=pomo.clone().add(V(.075,-.03,.075));
  manoR.position.copy(reposo.lerp(meta,suave(manoK)));
  manoR.quaternion.copy(C.quaternion);
  const g=manoEst==='agarra'?1:manoEst==='baja'?giro:0;giro+=(g-giro)*Math.min(1,dt*6);
  manoR.rotateY(.55);manoR.rotateX(.45);manoR.rotateZ(-1.35-giro*.6);
  manoR.userData.cierra(.25+(manoEst==='agarra'?.75:0)*Math.min(1,manoK));
  if(manoEst==='agarra'&&puertaObj>0)manoR.position.add(V(-.18*Math.min(1,puerta.rotation.y/.4),0,-.05*Math.min(1,puerta.rotation.y/.4)));
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
  parpadeo.forEach(([v,b],i)=>{const f=.78+Math.sin(performance.now()*.011+i*2)*.12+rnd(-.12,.12);if(v.isLight)v.intensity=b*f;else if(v.material)v.material.opacity=b*f});
  if(focoT>=0){focoT+=dt;const seq=[[0,1],[.12,0],[.2,1],[.32,.1],[.42,1],[.55,.3],[.65,1]];let v=1;for(const [tt,vv] of seq)if(focoT>=tt)v=vv;focoMesa.intensity=v*4.5;lampCono.material.opacity=v*.05}
  if(apagonT>=0){apagonT+=dt;const seq=[[0,1],[.15,.2],[.3,1],[.5,.05],[.62,.8],[.9,0]];let v=1;for(const [tt,vv] of seq)if(apagonT>=tt)v=vv;focoMesa.intensity=v*4.5;lampCono.material.opacity=v*.05;linterna.intensity=apagonT>.9?0:3.2*v}
  polvo.rotation.y+=dt*.008;
  R.render(S,C);
  if(corriendo&&t>=FIN&&alTerminar){const f=alTerminar;alTerminar=null;f()}
}

window.Intro3D={
  preparar(cv){construir(cv);camara(0,0);reloj.getDelta();cuadroLoop()},
  correr(api,fin){pisada=api.paso||pisada;sonar=api.sonar||sonar;linea();alTerminar=fin;t0=performance.now();corriendo=true},
  parar(){listo=false;try{R.dispose()}catch(e){}},
  get FIN(){return FIN}
};
})();
