/* =====================================================================
   Entrada en primera persona: la casa abandonada, por fuera y por dentro.
   Three.js r128 · todo procedural salvo las fotos de fotos/cosas/
   ===================================================================== */
(function(){
const T=THREE;
let R,S,C,reloj,linterna,focoMesa,puerta,velas=[],polvo,listo=false,corriendo=false,t0=0,alTerminar=null;
const ev=[];           // eventos de la línea de tiempo
const W=()=>innerWidth,H=()=>innerHeight;

/* ---------- texturas pintadas a mano en canvas ---------- */
function lienzo(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return [c,c.getContext('2d')]}
function rnd(a,b){return a+Math.random()*(b-a)}
function tablas({w=512,h=512,n=8,vertical=true,base=[60,45,34],var_=14,sucio=.5}){
  const [c,g]=lienzo(w,h);const paso=(vertical?w:h)/n;
  for(let i=0;i<n;i++){const k=rnd(-var_,var_);g.fillStyle=`rgb(${base[0]+k},${base[1]+k*.8},${base[2]+k*.6})`;
    vertical?g.fillRect(i*paso,0,paso,h):g.fillRect(0,i*paso,w,paso);
    // vetas
    for(let j=0;j<40;j++){g.strokeStyle=`rgba(0,0,0,${rnd(.04,.16)})`;g.lineWidth=rnd(.5,2);g.beginPath();
      if(vertical){const x=i*paso+rnd(2,paso-2);g.moveTo(x,0);g.bezierCurveTo(x+rnd(-6,6),h*.3,x+rnd(-6,6),h*.7,x+rnd(-4,4),h)}
      else{const y=i*paso+rnd(2,paso-2);g.moveTo(0,y);g.bezierCurveTo(w*.3,y+rnd(-5,5),w*.7,y+rnd(-5,5),w,y+rnd(-3,3))}g.stroke()}
    // nudos
    for(let j=0;j<2;j++){const x=vertical?i*paso+rnd(8,paso-8):rnd(0,w),y=vertical?rnd(0,h):i*paso+rnd(8,paso-8);
      g.fillStyle='rgba(20,10,4,.45)';g.beginPath();g.ellipse(x,y,rnd(3,7),rnd(6,12),vertical?0:1.57,0,7);g.fill()}
    // junta
    g.fillStyle='rgba(0,0,0,.75)';vertical?g.fillRect(i*paso,0,2,h):g.fillRect(0,i*paso,w,2)}
  // suciedad, manchas de humedad
  for(let j=0;j<60*sucio;j++){const x=rnd(0,w),y=rnd(0,h),r=rnd(10,80);const gr=g.createRadialGradient(x,y,0,x,y,r);
    gr.addColorStop(0,`rgba(${rnd(0,30)},${rnd(10,30)},${rnd(0,20)},${rnd(.08,.25)})`);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(x-r,y-r,2*r,2*r)}
  // grano
  const d=g.getImageData(0,0,w,h);for(let i=0;i<d.data.length;i+=4){const k=rnd(-14,14);d.data[i]+=k;d.data[i+1]+=k;d.data[i+2]+=k}g.putImageData(d,0,0);
  const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=4;return t}
function tierra(){const [c,g]=lienzo(512,512);g.fillStyle='#14120e';g.fillRect(0,0,512,512);
  for(let j=0;j<2600;j++){g.fillStyle=`rgba(${rnd(20,60)},${rnd(25,55)},${rnd(15,35)},${rnd(.2,.6)})`;g.fillRect(rnd(0,512),rnd(0,512),rnd(1,3),rnd(1,3))}
  for(let j=0;j<500;j++){g.strokeStyle=`rgba(${rnd(30,55)},${rnd(45,70)},${rnd(20,35)},.6)`;g.beginPath();const x=rnd(0,512),y=rnd(0,512);g.moveTo(x,y);g.lineTo(x+rnd(-3,3),y-rnd(4,10));g.stroke()}
  const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(14,14);return t}
function cielo(){const [c,g]=lienzo(64,512);const gr=g.createLinearGradient(0,0,0,512);gr.addColorStop(0,'#03040a');gr.addColorStop(.45,'#0b1020');gr.addColorStop(.52,'#161a24');gr.addColorStop(1,'#050505');g.fillStyle=gr;g.fillRect(0,0,64,512);return new T.CanvasTexture(c)}
function brillo(color,a=1){const [c,g]=lienzo(128,128);const gr=g.createRadialGradient(64,64,0,64,64,64);gr.addColorStop(0,color);gr.addColorStop(.25,color.replace(/[\d.]+\)$/,(a*.5)+')'));gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,128,128);return new T.CanvasTexture(c)}
/* la firma de Red John: carita pintada con sangre que chorrea */
function redJohn(){const [c,g]=lienzo(512,512);g.lineCap='round';g.lineJoin='round';
  const trazo=(pts,w)=>{for(let pas=0;pas<3;pas++){g.strokeStyle=`rgba(${120+pas*25},${8+pas*4},${10+pas*3},${.55+pas*.15})`;g.lineWidth=w*(1-pas*.18);g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x+rnd(-1.5,1.5),y+rnd(-1.5,1.5)):g.moveTo(x,y));g.stroke()}};
  const circ=[];for(let a=0;a<=Math.PI*2+.15;a+=.08){circ.push([256+Math.cos(a)*(170+rnd(-4,4)),250+Math.sin(a)*(175+rnd(-4,4))])}trazo(circ,20);
  trazo([[196,178],[192,236]],22);trazo([[318,178],[322,236]],22);
  const sonr=[];for(let a=.35;a<=Math.PI-.35;a+=.08)sonr.push([256+Math.cos(a)*110,262+Math.sin(a)*80]);trazo(sonr,18);
  // chorreones
  [[100,330],[150,400],[196,240],[322,240],[300,345],[400,330],[256,425],[220,341]].forEach(([x,y])=>{const l=rnd(40,120);
    g.strokeStyle='rgba(130,10,12,.85)';g.lineWidth=rnd(4,8);g.beginPath();g.moveTo(x,y);g.lineTo(x+rnd(-2,2),y+l);g.stroke();
    g.fillStyle='rgba(120,8,10,.9)';g.beginPath();g.ellipse(x,y+l+4,rnd(4,6),rnd(6,9),0,0,7);g.fill()});
  return new T.CanvasTexture(c)}
function papelViejo(texto,sub){const [c,g]=lienzo(256,320);g.fillStyle='#d9ccb0';g.fillRect(0,0,256,320);
  for(let j=0;j<30;j++){const x=rnd(0,256),y=rnd(0,320),r=rnd(10,60);const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(120,90,40,.18)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(x-r,y-r,2*r,2*r)}
  g.fillStyle='#2a1d10';g.textAlign='center';g.font='700 34px JetBrains Mono, monospace';g.fillText(texto,128,150);g.font='500 16px JetBrains Mono, monospace';g.fillText(sub,128,185);
  return new T.CanvasTexture(c)}

/* ---------- piezas ---------- */
const M=(o)=>new T.MeshStandardMaterial(o);
function caja(w,h,d,mat,x,y,z,ry=0){const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.rotation.y=ry;S.add(m);return m}
function cuadro(img,w,h,x,y,z,ry,marco='#1c120a',grupo=S){const g=new T.Group();
  const mf=M({color:marco,roughness:.6,metalness:.1});
  const f=new T.Mesh(new T.BoxGeometry(w+.12,h+.12,.05),mf);g.add(f);
  const tex=new T.TextureLoader().load(img);tex.encoding=T.sRGBEncoding;
  const p=new T.Mesh(new T.PlaneGeometry(w,h),M({map:tex,roughness:.8}));p.position.z=.03;g.add(p);
  // vidrio sucio
  const v=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshStandardMaterial({color:'#8a7a60',transparent:true,opacity:.18,roughness:.3}));v.position.z=.035;g.add(v);
  g.position.set(x,y,z);g.rotation.y=ry;g.rotation.z=rnd(-.04,.04);grupo.add(g);return g}
function cactus(x,z,esc=1){const g=new T.Group();const verde=M({color:'#3f5a32',roughness:.9});const maceta=M({color:'#7a3f24',roughness:.95});
  const m=new T.Mesh(new T.CylinderGeometry(.16,.12,.24,14),maceta);m.position.y=.12;g.add(m);
  const tierraM=new T.Mesh(new T.CylinderGeometry(.15,.15,.02,14),M({color:'#2a1c10'}));tierraM.position.y=.235;g.add(tierraM);
  const cuerpo=new T.Mesh(new T.CylinderGeometry(.08,.09,.5,10),verde);cuerpo.position.y=.48;g.add(cuerpo);
  const tapa=new T.Mesh(new T.SphereGeometry(.08,10,8),verde);tapa.position.y=.73;g.add(tapa);
  [[-1,.45,.18],[1,.55,.14]].forEach(([s,y,l])=>{const b=new T.Mesh(new T.CylinderGeometry(.045,.05,.14,8),verde);b.rotation.z=s*1.57;b.position.set(s*.13,y,0);g.add(b);
    const u=new T.Mesh(new T.CylinderGeometry(.045,.045,l,8),verde);u.position.set(s*.2,y+l/2,0);g.add(u);const c2=new T.Mesh(new T.SphereGeometry(.045,8,6),verde);c2.position.set(s*.2,y+l,0);g.add(c2)});
  g.position.set(x,.3,z);g.scale.setScalar(esc);S.add(g);return g}
function arbolMuerto(x,z,h){const g=new T.Group();const mat=M({color:'#0d0c0b',roughness:1});
  function rama(len,rad,prof){const m=new T.Mesh(new T.CylinderGeometry(rad*.6,rad,len,5),mat);m.position.y=len/2;const n=new T.Group();n.add(m);
    if(prof>0)for(let i=0;i<3;i++){const h2=rama(len*rnd(.5,.7),rad*.6,prof-1);h2.position.y=len*rnd(.5,.95);h2.rotation.z=rnd(-.9,.9);h2.rotation.y=rnd(0,6.28);n.add(h2)}return n}
  g.add(rama(h,.18,3));g.position.set(x,0,z);S.add(g)}

/* ---------- la escena ---------- */
function construir(cv){
  R=new T.WebGLRenderer({canvas:cv,antialias:true,powerPreference:'high-performance'});
  R.setPixelRatio(Math.min(devicePixelRatio,1.75));R.setSize(W(),H());R.outputEncoding=T.sRGBEncoding;
  R.toneMapping=T.ACESFilmicToneMapping;R.toneMappingExposure=1.15;R.shadowMap.enabled=true;R.shadowMap.type=T.PCFSoftShadowMap;
  S=new T.Scene();S.fog=new T.FogExp2('#0a0c12',.075);
  C=new T.PerspectiveCamera(W()<H()?78:62,W()/H(),.05,80);C.position.set(0,1.6,10);
  const fondo=new T.Mesh(new T.SphereGeometry(60,24,16),new T.MeshBasicMaterial({map:cielo(),side:T.BackSide,fog:false}));S.add(fondo);
  // luna
  const luna=new T.Sprite(new T.SpriteMaterial({map:brillo('rgba(200,210,235,1)'),fog:false,depthWrite:false}));luna.position.set(-14,16,-30);luna.scale.set(14,14,1);S.add(luna);
  const lunaL=new T.DirectionalLight('#7f8fb8',.35);lunaL.position.set(-10,14,12);S.add(lunaL);
  S.add(new T.AmbientLight('#20242e',.55));

  // terreno y camino
  const suelo=new T.Mesh(new T.PlaneGeometry(80,80),M({map:tierra(),roughness:1}));suelo.rotation.x=-Math.PI/2;suelo.receiveShadow=true;S.add(suelo);
  const piedraM=M({color:'#3a3632',roughness:1});
  for(let z=3;z<11;z+=.65){const p=new T.Mesh(new T.CylinderGeometry(rnd(.22,.32),rnd(.25,.34),.06,7),piedraM);p.position.set(rnd(-.25,.25),.03,z);p.rotation.y=rnd(0,3);S.add(p)}
  [[-7,-6,6],[8,-4,7],[-11,4,5],[12,6,6.5],[-5,14,4]].forEach(a=>arbolMuerto(...a));

  // ----- la casa: fachada con hueco de puerta -----
  const fach=tablas({base:[58,52,46],n:10,var_:16,sucio:.9});fach.repeat.set(2.2,1.3);
  const mF=M({map:fach,roughness:.95});
  const z0=0,ancho=10,alto=5.6,gro=.18;
  caja(ancho/2-.6,alto,gro,mF,-(ancho/4+.3),alto/2,z0);caja(ancho/2-.6,alto,gro,mF,(ancho/4+.3),alto/2,z0);
  caja(1.2,alto-2.4,gro,mF,0,2.4+(alto-2.4)/2,z0);
  // techo a dos aguas
  const techoM=M({map:tablas({base:[30,28,27],n:14,vertical:false,sucio:1}),roughness:1});
  const t1=caja(6.2,.12,4.5,techoM,-2.6,alto+1.1,-1.5);t1.rotation.z=.42;const t2=caja(6.2,.12,4.5,techoM,2.6,alto+1.1,-1.5);t2.rotation.z=-.42;
  const fr=new T.Shape();fr.moveTo(-5,0);fr.lineTo(5,0);fr.lineTo(0,2.3);fr.lineTo(-5,0);const fg=new T.Mesh(new T.ShapeGeometry(fr),mF);fg.position.set(0,alto,z0+.09);S.add(fg);
  // marco de la puerta
  const marcoM=M({color:'#2a2018',roughness:.9});
  caja(.12,2.4,.3,marcoM,-.56,1.5,z0);caja(.12,2.4,.3,marcoM,.56,1.5,z0);caja(1.24,.14,.3,marcoM,0,2.72,z0);
  // la hoja (gira desde la bisagra izquierda, hacia adentro)
  puerta=new T.Group();puerta.position.set(-.5,.3,z0);S.add(puerta);
  const hojaM=M({map:tablas({base:[52,34,22],n:5,var_:10,sucio:.6}),roughness:.85});
  const hoja=new T.Mesh(new T.BoxGeometry(1,2.38,.06),hojaM);hoja.position.set(.5,1.19,0);hoja.castShadow=true;puerta.add(hoja);
  [[.5,1.7],[.5,.65]].forEach(([x,y])=>{const pnl=new T.Mesh(new T.BoxGeometry(.7,.75,.02),M({color:'#2b1b10',roughness:.9}));pnl.position.set(x,y,.04);puerta.add(pnl)});
  const laton=M({color:'#b08a45',roughness:.35,metalness:.85});
  const pomo=new T.Mesh(new T.SphereGeometry(.045,16,12),laton);pomo.position.set(.88,1.05,.08);puerta.add(pomo);
  const roseta=new T.Mesh(new T.CylinderGeometry(.04,.04,.02,16),laton);roseta.rotation.x=1.57;roseta.position.set(.88,1.05,.04);puerta.add(roseta);
  const placa=new T.Mesh(new T.PlaneGeometry(.34,.08),M({map:papelViejo('M.E.L.I.',''),roughness:.5,metalness:.2,color:'#e0c070'}));placa.position.set(.5,1.42,.035);puerta.add(placa);
  puerta.userData.pomo=pomo;
  // nota de Substack clavada en la puerta
  const nota=new T.Mesh(new T.PlaneGeometry(.22,.28),M({map:new T.TextureLoader().load('fotos/cosas/substack.png'),roughness:.9,color:'#e8d8c0'}));nota.position.set(.3,1.95,.04);nota.rotation.z=.08;puerta.add(nota);
  // porche
  const porM=M({map:tablas({base:[48,40,32],n:12,vertical:false,sucio:.8}),roughness:.95});
  caja(4.2,.3,2.2,porM,0,.15,1.1);caja(1.6,.15,.4,porM,0,.075,2.4);
  caja(4.6,.1,2.4,techoM,0,2.95,1.1);[-1.95,1.95].forEach(x=>caja(.14,2.65,.14,marcoM,x,1.62,2.05));
  // ventanas tapiadas
  const vidrio=M({color:'#06080c',roughness:.2,metalness:.6});
  const tabla=M({map:tablas({base:[70,60,48],n:1,var_:6}),roughness:1});
  [[-2.8,1.7],[2.8,1.7],[-2.4,4],[2.4,4]].forEach(([x,y],i)=>{caja(1.2,1.4,.05,vidrio,x,y,z0+.1);caja(1.32,.1,.08,marcoM,x,y+.74,z0+.12);caja(1.32,.1,.08,marcoM,x,y-.74,z0+.12);
    const b1=caja(1.6,.16,.04,tabla,x,y,z0+.16);b1.rotation.z=.6+rnd(-.1,.1);const b2=caja(1.6,.16,.04,tabla,x,y+rnd(-.2,.2),z0+.17);b2.rotation.z=-.5+rnd(-.1,.1);
    if(i===3){const luz=new T.PointLight('#ffb060',.0,6,2);luz.position.set(x,y,-.6);S.add(luz);velas.push(luz);const g=new T.Mesh(new T.PlaneGeometry(1.1,1.3),new T.MeshBasicMaterial({color:'#ff9a40',transparent:true,opacity:.25}));g.position.set(x,y,z0+.11);S.add(g);velas.push(g)}});
  // Red John también afuera, pintado junto a la puerta
  const rjMat=new T.MeshBasicMaterial({map:redJohn(),transparent:true,depthWrite:false,opacity:.85});
  const rj1=new T.Mesh(new T.PlaneGeometry(1.1,1.1),rjMat);rj1.position.set(1.5,1.6,z0+.1);S.add(rj1);
  // cactus en el porche
  cactus(-1.5,1.6,1.1);cactus(1.55,1.7,.9);cactus(-2.6,3.2,1.4);
  // farol del porche, casi muerto
  const farol=new T.PointLight('#ffb070',.6,5,2);farol.position.set(.9,2.6,.6);S.add(farol);velas.push(farol);
  const bombilla=new T.Sprite(new T.SpriteMaterial({map:brillo('rgba(255,190,110,1)'),depthWrite:false}));bombilla.position.copy(farol.position);bombilla.scale.set(.5,.5,1);S.add(bombilla);velas.push(bombilla);

  // ----- interior -----
  const paredM=M({map:(()=>{const t=tablas({base:[40,28,22],n:10,var_:8,sucio:1.2});t.repeat.set(2.5,1);return t})(),roughness:.95});
  const pisoM=M({map:(()=>{const t=tablas({base:[44,30,20],n:8,vertical:true,var_:10,sucio:1});t.repeat.set(3,3);return t})(),roughness:.9});
  const piso=new T.Mesh(new T.PlaneGeometry(8,8),pisoM);piso.rotation.x=-Math.PI/2;piso.position.set(0,.301,-4.1);piso.receiveShadow=true;S.add(piso);
  const techoI=new T.Mesh(new T.PlaneGeometry(8,8),M({color:'#0d0907',roughness:1}));techoI.rotation.x=Math.PI/2;techoI.position.set(0,3.6,-4.1);S.add(techoI);
  const pared=(w,x,z,ry)=>{const m=new T.Mesh(new T.PlaneGeometry(w,3.3),paredM);m.position.set(x,1.95,z);m.rotation.y=ry;m.receiveShadow=true;S.add(m)};
  pared(8,0,-8.1,0);pared(8,-4,-4.1,Math.PI/2);pared(8,4,-4.1,-Math.PI/2);
  const interiorFrente=(w,x)=>{const m=new T.Mesh(new T.PlaneGeometry(w,3.3),paredM);m.position.set(x,1.95,-.12);m.rotation.y=Math.PI;S.add(m)};interiorFrente(3.45,-2.28);interiorFrente(3.45,2.28);
  // zócalo
  const zoc=M({color:'#1a100a',roughness:.8});caja(8,.18,.04,zoc,0,.39,-8.07);caja(.04,.18,8,zoc,-3.97,.39,-4.1);caja(.04,.18,8,zoc,3.97,.39,-4.1);
  // pared izquierda: Red John en grande y la foto de El Mentalista
  const rj2=new T.Mesh(new T.PlaneGeometry(2.2,2.2),new T.MeshStandardMaterial({map:redJohn(),transparent:true,depthWrite:false,roughness:.6}));rj2.position.set(-3.95,2.05,-4.4);rj2.rotation.y=Math.PI/2;S.add(rj2);
  cuadro('fotos/cosas/mentalista.jpg',.7,.5,-3.96,1.9,-6.6,Math.PI/2);
  cuadro('fotos/cosas/substack.png',.45,.45,-3.96,1.75,-1.6,Math.PI/2,'#3a2614');
  // pared derecha: Cerati, BTS, Álvaro Díaz
  cuadro('fotos/cosas/cerati.jpg',.75,.95,3.96,2.05,-2.2,-Math.PI/2);
  cuadro('fotos/cosas/bts.jpg',1.0,.66,3.96,2.15,-4.1,-Math.PI/2);
  cuadro('fotos/cosas/alvaro.jpg',.7,.9,3.96,1.95,-6.0,-Math.PI/2);
  // estante con libros de psicología
  const est=new T.Group();const madera=M({color:'#2a1a0e',roughness:.85});
  [0,.45,.9,1.35].forEach(y=>{const b=new T.Mesh(new T.BoxGeometry(1.3,.04,.32),madera);b.position.y=y;est.add(b)});
  [-.65,.65].forEach(x=>{const l=new T.Mesh(new T.BoxGeometry(.04,1.4,.32),madera);l.position.set(x,.68,0);est.add(l)});
  const colores=['#5a1e1e','#2c3a4a','#4a3a20','#203a2c','#3a2a3a','#6a5030','#1e2a3a'];
  [.02,.47,.92].forEach(y=>{let x=-.6;while(x<.55){const w=rnd(.04,.08),h=rnd(.26,.38);const lb=new T.Mesh(new T.BoxGeometry(w,h,.22),M({color:colores[Math.floor(rnd(0,colores.length))],roughness:.8}));lb.position.set(x+w/2,y+h/2+.02,0);lb.rotation.z=rnd(-.05,.05);est.add(lb);x+=w+.005}});
  est.position.set(2.6,.3,-7.85);S.add(est);
  cuadro('fotos/cosas/psi.png',.5,.5,2.6,2.35,-8.05,0,'#2a1a0e');
  // mueble tapado con sábana, cactus adentro
  const sab=M({color:'#8f8a80',roughness:1});
  const sillon=new T.Mesh(new T.SphereGeometry(.7,16,12,0,Math.PI*2,0,Math.PI/2),sab);sillon.scale.set(1.2,1.1,.9);sillon.position.set(-2.8,.3,-7.1);S.add(sillon);
  cactus(-3.5,-1.0,1.2);cactus(3.4,-7.5,1);cactus(-3.4,-7.6,.8);

  // ----- la mesa y el regalo -----
  const mesa=new T.Group();const nogal=M({color:'#3a2414',roughness:.55});
  const tope=new T.Mesh(new T.CylinderGeometry(.62,.62,.05,40),nogal);tope.position.y=.78;tope.receiveShadow=true;tope.castShadow=true;mesa.add(tope);
  const pie=new T.Mesh(new T.CylinderGeometry(.05,.09,.75,16),nogal);pie.position.y=.39;mesa.add(pie);
  const base=new T.Mesh(new T.CylinderGeometry(.28,.3,.04,24),nogal);base.position.y=.02;mesa.add(base);
  mesa.position.set(0,.3,-5);S.add(mesa);
  const rojo=M({color:'#2a0306',roughness:.45});const gris=M({color:'#26262a',roughness:.35,metalness:.2});regaloMats=[rojo,gris];
  const regalo=new T.Group();const cuerpo=new T.Mesh(new T.BoxGeometry(.42,.34,.42),rojo);cuerpo.position.y=.17;cuerpo.castShadow=true;regalo.add(cuerpo);
  const tapa=new T.Mesh(new T.BoxGeometry(.46,.09,.46),rojo);tapa.position.y=.38;tapa.castShadow=true;regalo.add(tapa);
  [[.07,.44,.432],[.432,.44,.07]].forEach(([a,b,c])=>{const r=new T.Mesh(new T.BoxGeometry(a,b,c),gris);r.position.y=.215;regalo.add(r)});
  [-1,1].forEach(s=>{const l=new T.Mesh(new T.TorusGeometry(.07,.025,10,24),gris);l.position.set(s*.07,.47,0);l.rotation.set(0,s*.5,s*.6);l.scale.set(1,.8,.6);regalo.add(l)});
  const can=new T.Mesh(new T.BoxGeometry(.11,.09,.03),laton);can.position.set(0,.15,.225);regalo.add(can);
  const arco=new T.Mesh(new T.TorusGeometry(.035,.009,8,20,Math.PI),laton);arco.position.set(0,.195,.225);regalo.add(arco);
  regalo.position.set(0,1.1,-5);regalo.rotation.y=-.35;S.add(regalo);
  focoMesa=new T.SpotLight('#ffe2b8',0,7,.36,.55,1.2);focoMesa.position.set(0,3.55,-4.8);focoMesa.target=regalo;focoMesa.castShadow=true;focoMesa.shadow.mapSize.set(1024,1024);S.add(focoMesa);
  const lampara=new T.Mesh(new T.ConeGeometry(.2,.18,20,1,true),M({color:'#111',side:T.DoubleSide,roughness:.6}));lampara.position.set(0,3.5,-4.8);S.add(lampara);
  const cable=new T.Mesh(new T.CylinderGeometry(.006,.006,.12),M({color:'#111'}));cable.position.set(0,3.6,-4.8);S.add(cable);
  focoMesa.userData.cono=lampara;

  // polvo flotando
  const n=500,pos=new Float32Array(n*3);for(let i=0;i<n;i++){pos[i*3]=rnd(-3.8,3.8);pos[i*3+1]=rnd(.4,3.4);pos[i*3+2]=rnd(-8,-.3)}
  const pg=new T.BufferGeometry();pg.setAttribute('position',new T.BufferAttribute(pos,3));
  polvo=new T.Points(pg,new T.PointsMaterial({color:'#e8d6b0',size:.012,transparent:true,opacity:.55,depthWrite:false}));S.add(polvo);

  // linterna en la mano
  linterna=new T.SpotLight('#ffe9c8',2.6,14,.42,.45,1.3);linterna.castShadow=false;S.add(linterna);S.add(linterna.target);
  reloj=new T.Clock();
  addEventListener('resize',()=>{R.setSize(W(),H());C.aspect=W()/H();C.fov=W()<H()?78:62;C.updateProjectionMatrix()});
  listo=true;
}

/* ---------- recorrido de la cámara ---------- */
const V=(x,y,z)=>new T.Vector3(x,y,z);
// t (s), posición, a dónde mira, ¿camina?
const RUTA=[
  [0,   V(0,1.62,10),  V(0,1.9,0),   0],
  [5.4, V(.08,1.92,1.75),V(.3,1.25,0),1],
  [9.6, V(.08,1.92,1.75),V(.3,1.25,0),0],
  [10.4,V(.05,1.92,1.5), V(-1.6,.8,-3), 0],
  [13.0,V(-.1,1.9,-1.4), V(-2.4,1.0,-3.6), 1],
  [14.6,V(-.25,1.9,-1.7),V(-4,2.0,-4.3),0],
  [16.2,V(-.25,1.9,-1.7),V(-4,1.95,-4.6),0],
  [17.9,V(-.1,1.9,-1.8), V(4,2.0,-3.0),0],
  [19.3,V(-.1,1.9,-1.8), V(4,1.9,-5.6),0],
  [20.3,V(0,1.9,-1.8),   V(2.6,1.2,-7.8),0],
  [21.5,V(0,1.88,-1.8),  V(0,1.35,-5),0],
  [23.0,V(0,1.88,-1.8),  V(0,1.4,-5),0],
  [26.2,V(0,1.72,-3.85), V(0,1.36,-5),1],
];
const FIN=26.2;
const suave=x=>x*x*(3-2*x);
let fase=0;
function camara(t,dt){
  let i=0;while(i<RUTA.length-2&&t>RUTA[i+1][0])i++;
  const [ta,pa,la]=RUTA[i],[tb,pb,lb,camina]=RUTA[i+1];
  const k=suave(Math.min(1,Math.max(0,(t-ta)/(tb-ta))));
  const p=pa.clone().lerp(pb,k),l=la.clone().lerp(lb,k);
  // escalones del porche
  if(p.z<2.6&&p.z>2.1)p.y-=(.3)*(1-(2.6-p.z)/.5)*0;
  const andando=camina&&k<.97;
  if(andando){fase+=dt*Math.PI*2*1.7;if(Math.sin(fase)<-.98&&!camara.pisado){camara.pisado=true;pisada()}if(Math.sin(fase)>0)camara.pisado=false}
  const amp=andando?1:.25;
  const bobY=Math.abs(Math.sin(fase))*.045*amp,bobX=Math.sin(fase*.5)*.03*amp;
  // mano nerviosa: temblor fino siempre
  const tr=.004+(.006*amp);
  C.position.set(p.x+bobX+rnd(-tr,tr),p.y-bobY+rnd(-tr,tr)*.6,p.z);
  C.lookAt(l.x+rnd(-.01,.01),l.y+rnd(-.01,.01),l.z);
  C.rotateZ(Math.sin(fase*.5)*.012*amp+Math.sin(t*1.3)*.004);
  // la linterna va un poco atrasada respecto a la mirada
  const dir=new T.Vector3();C.getWorldDirection(dir);
  linterna.position.copy(C.position).add(V(.18,-.22,0));
  const obj=C.position.clone().add(dir.multiplyScalar(6));
  linterna.target.position.lerp(obj,Math.min(1,dt*6));
}

/* ---------- sonido ---------- */
let pisada=()=>{},sonar=()=>{};
function sonidos(api){pisada=api.paso||pisada;sonar=api.sonar||sonar}

/* ---------- línea de tiempo ---------- */
function linea(){
  ev.length=0;const e=(t,f)=>ev.push({t,f,hecho:false});
  e(.1,()=>sonar('respira'));
  e(5.6,()=>mano('sube'));
  e(6.9,()=>{mano('gira');sonar('pestillo')});
  e(7.5,()=>{abrePuerta(.42,1.3);sonar('rechina',.5)});
  e(8.9,()=>{abrePuerta(1.75,1.0);sonar('rechina',1)});
  e(9.1,()=>mano('baja'));
  e(14.7,()=>sonar('susto',.5));
  e(21.6,()=>{prendeFoco();sonar('descubre')});
  e(25.4,()=>sonar('alivio'));
}
let puertaObj=0,puertaVel=1;
function abrePuerta(a,v){puertaObj=a;puertaVel=v}
let focoT=-1,regaloMats=[];
function prendeFoco(){focoT=0;regaloMats[0].color.set('#b3121f');regaloMats[1].color.set('#a0a0a8')}

/* ---------- la mano (foto real recortada) ---------- */
let manoEl=null,manoEstado='fuera',manoK=0;
function mano(est){manoEstado=est}
function pintaMano(dt){
  if(!manoEl)return;
  const obj=manoEstado==='fuera'?0:manoEstado==='baja'?0:1;
  manoK+=(obj-manoK)*Math.min(1,dt*(manoEstado==='baja'?5:2.6));
  const p=puerta.userData.pomo.getWorldPosition(new T.Vector3()).project(C);
  const x=(p.x*.5+.5)*W(),y=(-p.y*.5+.5)*H();
  const fuera=1-manoK,giro=manoEstado==='gira'||manoEstado==='baja'&&manoK>.5?-14:0;
  const ox=manoEl.offsetWidth*.49,oy=manoEl.offsetHeight*.31;
  manoEl.style.transform=`translate(${x-ox+fuera*W()*.35}px,${y-oy+fuera*H()*.55}px) rotate(${giro+fuera*12}deg)`;
  manoEl.style.opacity=manoK>.02?1:0;
}

/* ---------- bucle ---------- */
function cuadroLoop(){
  if(!listo)return;requestAnimationFrame(cuadroLoop);
  const dt=Math.min(reloj.getDelta(),.05);
  const t=corriendo?(performance.now()-t0)/1000:0;
  camara(Math.min(t,FIN),corriendo?dt:dt*.0);
  if(corriendo){ev.forEach(x=>{if(!x.hecho&&t>=x.t){x.hecho=true;x.f()}})}
  // puerta
  puerta.rotation.y+=((puertaObj)-puerta.rotation.y)*Math.min(1,dt*puertaVel*2.2);
  // velas y farol parpadeando
  velas.forEach((v,i)=>{const f=.75+Math.sin(performance.now()*.011+i)*.12+rnd(-.12,.12);if(v.isLight)v.intensity=(i===0?.9:.6)*f;else if(v.material)v.material.opacity=(v.isSprite?.8:.25)*f});
  // foco de la mesa: parpadea al prenderse
  if(focoT>=0){focoT+=dt;const seq=[[0,1],[.12,0],[.2,1],[.32,.1],[.42,1],[.55,.3],[.65,1]];let v=1;for(const [tt,vv] of seq)if(focoT>=tt)v=vv;focoMesa.intensity=v*6}
  polvo.rotation.y+=dt*.01;polvo.position.y=Math.sin(performance.now()*.0003)*.05;
  if(manoEl)pintaMano(dt);
  R.render(S,C);
  if(corriendo&&t>=FIN&&alTerminar){const f=alTerminar;alTerminar=null;f()}
}

window.Intro3D={
  preparar(cv,manoImg){construir(cv);manoEl=manoImg;camara(0,0);reloj.getDelta();cuadroLoop()},
  correr(api,fin){sonidos(api);linea();alTerminar=fin;t0=performance.now();corriendo=true},
  parar(){listo=false;try{R.dispose()}catch(e){}},
  get FIN(){return FIN}
};
})();
