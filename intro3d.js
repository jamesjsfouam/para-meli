/* =====================================================================
   Entrada en primera persona: el bosque, la casa y la escena del crimen.
   Three.js r128 · todo procedural salvo las fotos de fotos/cosas/
   ===================================================================== */
(function(){
const T=THREE;
let R,S,C,reloj,linterna,focoMesa,lampCono,puerta,parpadeo=[],polvo,listo=false,corriendo=false,t0=0,alTerminar=null;
let tAcum=0,flashT=-1,flashL=null,linMesa=null,lampEsc=null,fadeObj=0,fadeVal=0,lampBulbo=null,zoomK=-1,zIni=null,zMir=null,LM=null,cargaProg=null,cargaListo=null,cargado=false,macetas=[],comp=null,manoL,manoR,linternaObj,cintaP,autoPuerta,sirena=[],lluvia;
const ev=[];
const W=()=>innerWidth,H=()=>innerHeight;
function rnd(a,b){return a+Math.random()*(b-a)}

/* ---------- texturas en canvas ---------- */
function lienzo(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return [c,c.getContext('2d')]}
function tex(c,rep){const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=MOVIL?2:8;if(rep)t.repeat.set(rep[0],rep[1]);return t}
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
  // pintada con el dedo: trazo grueso, borde más oscuro, zonas donde la sangre no alcanzó
  const trazo=(pts,w)=>{[[w*1.12,'rgba(70,2,6,.9)'],[w,'rgba(128,6,10,.95)'],[w*.55,'rgba(150,12,16,.55)']].forEach(([lw,col])=>{g.strokeStyle=col;g.lineWidth=lw;g.beginPath();pts.forEach(([x,y],k)=>{const X=x+rnd(-1.5,1.5),Y=y+rnd(-1.5,1.5);k?g.lineTo(X,Y):g.moveTo(X,Y)});g.stroke()});
    g.globalCompositeOperation='destination-out';for(let k=0;k<pts.length;k+=2){if(Math.random()<.35){const [x,y]=pts[k];g.fillStyle=`rgba(0,0,0,${rnd(.15,.5)})`;g.beginPath();g.ellipse(x+rnd(-w*.4,w*.4),y+rnd(-w*.4,w*.4),rnd(2,w*.3),rnd(1,4),rnd(0,3),0,7);g.fill()}}g.globalCompositeOperation='source-over'};
  const gota=(x,y,l)=>{g.strokeStyle='rgba(105,3,8,.92)';g.lineWidth=rnd(5,10);g.beginPath();g.moveTo(x,y);g.bezierCurveTo(x+rnd(-2,2),y+l*.35,x+rnd(-3,3),y+l*.75,x+rnd(-1,1),y+l);g.stroke();g.fillStyle='rgba(95,2,6,.95)';g.beginPath();g.ellipse(x,y+l+4,rnd(5,8),rnd(7,11),0,0,7);g.fill()};
  const circ=[];for(let a=-1.75;a<=Math.PI*1.5-.15;a+=.03){const r=330+rnd(-4,4);circ.push([512+Math.cos(a)*r,492+Math.sin(a)*r*1.04])}trazo(circ,40);
  // ojos: dos óvalos rellenos, un poco inclinados
  [[400,385,.12],[624,385,-.12]].forEach(([x,y,r])=>{g.fillStyle='rgba(128,6,10,.96)';g.beginPath();g.ellipse(x,y,30,62,r,0,7);g.fill();g.strokeStyle='rgba(70,2,6,.8)';g.lineWidth=5;g.stroke();gota(x+rnd(-6,6),y+55,rnd(110,230))});
  const sonr=[];for(let a=.22;a<=Math.PI-.22;a+=.03)sonr.push([512+Math.cos(a)*215,520+Math.sin(a)*165]);trazo(sonr,36);
  // chorreones: de la sonrisa y de la mitad de abajo del círculo
  for(let k=0;k<9;k++){const a=rnd(.3,Math.PI-.3);gota(512+Math.cos(a)*215,520+Math.sin(a)*165+12,rnd(60,260))}
  for(let k=0;k<14;k++){const a=rnd(.15,Math.PI-.15);gota(512+Math.cos(a)*330,492+Math.sin(a)*343+14,rnd(50,300))}
  for(let k=0;k<5;k++){const a=rnd(Math.PI+.3,Math.PI*2-.3);gota(512+Math.cos(a)*330,492+Math.sin(a)*343+14,rnd(40,140))}
  // salpicaduras
  for(let k=0;k<70;k++){const a=rnd(0,7),r=rnd(250,470);g.fillStyle=`rgba(110,4,8,${rnd(.4,.9)})`;g.beginPath();g.arc(512+Math.cos(a)*r,500+Math.sin(a)*r,rnd(1.5,6),0,7);g.fill()}
  const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;t.anisotropy=MOVIL?2:8;t.minFilter=T.LinearMipmapLinearFilter;t.magFilter=T.LinearFilter;t.generateMipmaps=true;t.noResize=true;return t}
function poster(fondo1,fondo2,lineas){const [c,g]=lienzo(512,720);const gr=g.createLinearGradient(0,0,512,720);gr.addColorStop(0,fondo1);gr.addColorStop(1,fondo2);g.fillStyle=gr;g.fillRect(0,0,512,720);
  for(let i=0;i<120;i++){g.fillStyle=`rgba(255,255,255,${rnd(.02,.12)})`;g.beginPath();g.arc(rnd(0,512),rnd(0,720),rnd(1,3),0,7);g.fill()}
  g.textAlign='center';lineas.forEach(([t,f,y,col])=>{g.fillStyle=col||'#fff';g.font=f;g.fillText(t,256,y)});grano(g,512,720,8);const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;return t}
function cinta(){const [c,g]=lienzo(1024,64);g.fillStyle='#f2c200';g.fillRect(0,0,1024,64);g.fillStyle='#111';
  g.font='900 30px Unbounded, Inter Tight, sans-serif';g.textBaseline='middle';
  for(let x=10;x<1024;x+=340){g.fillText('NO PASAR',x,33);g.fillRect(x+180,14,130,36);g.fillStyle='#e8c21a';g.font='700 16px JetBrains Mono, monospace';g.fillText('ESCENA DEL CRIMEN',x+184,33);g.fillStyle='#111';g.font='900 30px Unbounded, Inter Tight, sans-serif'}
  grano(g,1024,64,10);return tex(c)}
function corcho(){const [c,g]=lienzo(512,384);g.fillStyle='#9a6b3e';g.fillRect(0,0,512,384);
  for(let j=0;j<5000;j++){g.fillStyle=`rgba(${rnd(60,140)},${rnd(40,90)},${rnd(20,50)},.6)`;g.fillRect(rnd(0,512),rnd(0,384),rnd(1,3),rnd(1,3))}return tex(c)}
function etiquetaNum(n){const [c,g]=lienzo(64,64);g.fillStyle='#f0c419';g.fillRect(0,0,64,64);g.fillStyle='#111';g.font='900 40px Inter Tight, sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(n,32,35);return new T.CanvasTexture(c)}

const KD=()=>IOS?1.8:(MOVIL?2:2.6);
function nitida(t){t.encoding=T.sRGBEncoding;t.noResize=true;try{t.anisotropy=R.capabilities.getMaxAnisotropy()}catch(e){t.anisotropy=8}return t}
function expediente(){const k=KD(),[c,g]=lienzo(256*k,340*k);g.scale(k,k);g.fillStyle='#c9b48a';g.fillRect(0,0,256,340);g.fillStyle='#3a2a14';
  g.font='900 46px Inter Tight, sans-serif';g.fillText('CBI',20,70);g.font='800 15px JetBrains Mono, monospace';g.fillText('CALIFORNIA BUREAU',20,98);g.fillText('OF INVESTIGATION',20,118);
  g.fillStyle='#7a1010';g.font='900 22px Inter Tight, sans-serif';g.save();g.translate(140,250);g.rotate(-.25);g.strokeStyle='#7a1010';g.lineWidth=3;g.strokeRect(-70,-24,150,40);g.fillText('RED JOHN',-58,4);g.restore();
  g.fillStyle='#3a2a14';g.font='700 14px JetBrains Mono, monospace';g.fillText('CASO N° 0111',20,152);g.fillText('ESCENA: CASA DEL BOSQUE',20,174);g.setTransform(1,0,0,1,0,0);grano(g,c.width,c.height,5);return nitida(new T.CanvasTexture(c))}
/* ---------- materiales PBR (texturas fotográficas de Poly Haven, CC0) ---------- */
const TXC={};
function pbr(n,rep=[1,1],o={}){const tl0=new T.TextureLoader(LM||undefined),tl={load:u=>{const c=u+'|'+rep;return TXC[c]||(TXC[c]=tl0.load(u))}},k=t=>{t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(rep[0],rep[1]);t.anisotropy=MOVIL?2:8;return t};
  const map=k(tl.load('pbr/'+n+(BAJO?'_col_1k.jpg':'_col.jpg')));map.encoding=T.sRGBEncoding;
  if(BAJO)return new T.MeshStandardMaterial(Object.assign({map,roughness:.92,envMapIntensity:.18},o));
  return new T.MeshStandardMaterial(Object.assign({map,normalMap:k(tl.load('pbr/'+n+'_nor.jpg')),roughnessMap:k(tl.load('pbr/'+n+'_rough.jpg')),roughness:1,envMapIntensity:.35},o))}

/* la libreta: cuatro nombres, tres tachados en rojo */
function libretaTex(){const kl=IOS?.6:(MOVIL?.75:1),[c,g]=lienzo(Math.round(2048*kl),Math.round(1400*kl));if(kl<1)g.scale(kl,kl);
  const papel=g.createLinearGradient(0,0,2048,0);papel.addColorStop(0,'#cfc3a6');papel.addColorStop(.47,'#e6dcc3');papel.addColorStop(.5,'#b9ad92');papel.addColorStop(.53,'#e6dcc3');papel.addColorStop(1,'#d3c7aa');
  g.fillStyle=papel;g.fillRect(0,0,2048,1400);
  manchas(g,2048,1400,70,a=>`rgba(${rnd(110,150)},${rnd(80,105)},${rnd(40,60)},${a*.8})`);
  // renglones y margen
  for(let y=230;y<1360;y+=92){g.strokeStyle='rgba(70,95,140,.28)';g.lineWidth=2;g.beginPath();g.moveTo(40,y);g.lineTo(985,y);g.moveTo(1063,y);g.lineTo(2010,y);g.stroke()}
  [[150],[1170]].forEach(([x])=>{g.strokeStyle='rgba(170,40,40,.35)';g.lineWidth=2.5;g.beginPath();g.moveTo(x,0);g.lineTo(x,1400);g.stroke()});
  // sombra del lomo
  const lomo=g.createLinearGradient(924,0,1124,0);lomo.addColorStop(0,'rgba(0,0,0,0)');lomo.addColorStop(.5,'rgba(40,25,10,.45)');lomo.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=lomo;g.fillRect(924,0,200,1400);
  // aro de café
  g.strokeStyle='rgba(110,70,30,.22)';g.lineWidth=14;g.beginPath();g.arc(760,1120,150,0,Math.PI*1.7);g.stroke();g.lineWidth=4;g.strokeStyle='rgba(90,55,20,.25)';g.beginPath();g.arc(760,1120,162,.3,Math.PI*1.9);g.stroke();
  const mano=(t,x,y,px,col,rot=0)=>{g.save();g.translate(x,y);g.rotate(rot);g.fillStyle=g.strokeStyle=col;g.lineWidth=px*.035;g.lineJoin='round';g.font=`${px}px "Reenie Beanie", cursive`;g.strokeText(t,0,0);g.fillText(t,0,0);const w=g.measureText(t).width;g.restore();return w};
  const tinta='rgba(28,30,48,.92)';
  // página izquierda
  g.fillStyle='rgba(60,55,45,.75)';g.font='500 34px "JetBrains Mono", monospace';g.fillText('N° 01 · 11 · 2026',190,150);
  mano('Lista.',190,330,150,tinta,-.02);
  mano('No confíes en nadie.',195,520,96,tinta,-.015);
  mano('Él siempre sabe dónde estás.',195,700,82,'rgba(28,30,48,.85)',-.01);
  // la firma de Red John, chiquita, en la esquina
  g.save();g.translate(780,330);g.strokeStyle='rgba(150,15,20,.75)';g.lineWidth=7;g.lineCap='round';g.beginPath();g.arc(0,0,58,0,Math.PI*2);g.stroke();
  g.beginPath();g.moveTo(-20,-22);g.lineTo(-21,0);g.moveTo(20,-22);g.lineTo(21,0);g.stroke();g.beginPath();g.arc(0,8,32,.35,Math.PI-.35);g.stroke();
  g.lineWidth=4;g.beginPath();g.moveTo(-30,52);g.lineTo(-31,110);g.stroke();g.beginPath();g.arc(-31,116,6,0,7);g.fillStyle='rgba(140,10,16,.8)';g.fill();g.restore();
  // página derecha: los nombres
  const nombres=['Jose','Lauren','Jireh','James'];
  nombres.forEach((n,i)=>{const y=420+i*215,x=1230;mano((i+1)+'.',x,y,120,'rgba(28,30,48,.85)');const w=mano(n,x+110,y,165,tinta,rnd(-.03,.02));
    if(i<3){for(let k=0;k<2;k++){g.strokeStyle=k?'rgba(185,12,22,.95)':'rgba(150,8,16,.55)';g.lineWidth=k?11:20;g.lineCap='round';g.beginPath();
        const y0=y-52+k*14+rnd(-6,6);g.moveTo(x+90,y0+rnd(-8,8));for(let s2=1;s2<=6;s2++)g.lineTo(x+90+(w+60)*s2/6,y0+rnd(-14,14)-s2*3);g.stroke()}
      g.fillStyle='rgba(160,10,18,.6)';g.beginPath();g.ellipse(x+w+170,y-40,rnd(5,9),rnd(5,9),0,0,7);g.fill()}
    else{g.strokeStyle='rgba(28,30,48,.55)';g.lineWidth=4;g.beginPath();g.moveTo(x+100,y+22);g.quadraticCurveTo(x+100+w/2,y+34,x+130+w,y+18);g.stroke();
      // una gota roja, todavía fresca, junto a su nombre
      g.fillStyle='rgba(175,8,18,.95)';g.beginPath();g.ellipse(x+w+200,y-70,16,20,.3,0,7);g.fill();g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.ellipse(x+w+194,y-78,4,5,0,0,7);g.fill();
      for(let k=0;k<7;k++){g.fillStyle='rgba(165,8,18,.85)';g.beginPath();g.arc(x+w+200+rnd(-60,60),y-70+rnd(-50,50),rnd(2,6),0,7);g.fill()}}});
  g.setTransform(1,0,0,1,0,0);grano(g,c.width,c.height,5);return nitida(new T.CanvasTexture(c))}

function postit(lineas,col='#f2e27a',rot=0){const k=KD(),[c,g]=lienzo(320*k,320*k);g.scale(k,k);g.fillStyle=col;g.fillRect(0,0,320,320);
  const sh=g.createLinearGradient(0,0,0,320);sh.addColorStop(0,'rgba(0,0,0,.08)');sh.addColorStop(.15,'rgba(0,0,0,0)');sh.addColorStop(1,'rgba(0,0,0,.12)');g.fillStyle=sh;g.fillRect(0,0,320,320);
  g.save();g.translate(160,160);g.rotate(rot);g.textAlign='center';lineas.forEach(([t,px,y,c2])=>{g.fillStyle=g.strokeStyle=c2||'rgba(18,18,32,.97)';g.lineWidth=px*.045;g.lineJoin='round';g.font=`${px}px "Reenie Beanie", cursive`;g.strokeText(t,0,y);g.fillText(t,0,y)});g.restore();
  g.setTransform(1,0,0,1,0,0);grano(g,c.width,c.height,4);return nitida(new T.CanvasTexture(c))}
function mapaTex(){const k=Math.min(2,KD()),[c,g]=lienzo(700*k,500*k);g.scale(k,k);g.fillStyle='#e4dcc4';g.fillRect(0,0,700,500);manchas(g,700,500,30,a=>`rgba(140,110,60,${a})`);
  g.strokeStyle='rgba(90,120,150,.5)';g.lineWidth=2;for(let i=0;i<9;i++){g.beginPath();let x=rnd(0,700),y=rnd(0,500);g.moveTo(x,y);for(let k=0;k<6;k++){x+=rnd(-90,90);y+=rnd(-60,60);g.lineTo(x,y)}g.stroke()}
  g.fillStyle='rgba(120,160,190,.45)';g.beginPath();g.ellipse(560,300,120,80,.3,0,7);g.fill();g.beginPath();g.ellipse(430,160,60,40,0,0,7);g.fill();
  const pts=[[180,140,'Rally'],[300,330,'León'],[470,250,'UAM'],[600,120,'¿?']];
  g.strokeStyle='rgba(170,10,20,.85)';g.lineWidth=3;g.setLineDash([10,8]);g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.stroke();g.setLineDash([]);
  pts.forEach(([x,y,n])=>{g.strokeStyle='rgba(180,10,20,.9)';g.lineWidth=5;g.beginPath();g.arc(x,y,26,0,7);g.stroke();g.fillStyle='rgba(30,20,20,.9)';g.font='50px "Reenie Beanie", cursive';g.strokeStyle=g.fillStyle;g.lineWidth=2;g.strokeText(n,x+32,y-20);g.fillText(n,x+32,y-20)});
  g.setTransform(1,0,0,1,0,0);grano(g,c.width,c.height,10);return nitida(new T.CanvasTexture(c))}

/* ---------- materiales ---------- */
const M=o=>new T.MeshStandardMaterial(o);
function madera(opts,rep,rough=.9){const c=tablas(opts);const t=tex(c,rep);const b=tex(c,rep);return M({map:t,bumpMap:b,bumpScale:.02,roughness:rough})}
function sombra(o){o.traverse(m=>{if(m.isMesh){m.castShadow=true;m.receiveShadow=true}});return o}
function caja(w,h,d,mat,x,y,z,ry=0,padre=S){const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.rotation.y=ry;m.castShadow=m.receiveShadow=true;padre.add(m);return m}
function calco(textura,w,h,x,y,z,rx,ry,op=1){const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshStandardMaterial({map:textura,transparent:true,depthWrite:false,roughness:.25,metalness:.05,opacity:op,polygonOffset:true,polygonOffsetFactor:-2}));m.position.set(x,y,z);m.rotation.set(rx,ry,0);m.receiveShadow=true;S.add(m);return m}
const FOTOC={};
function texFoto(img){if(FOTOC[img])return FOTOC[img];const tx=new T.TextureLoader(LM||undefined).load(img,t=>{const im=t.image;if(MOVIL&&im&&Math.max(im.width,im.height)>(IOS?512:(BAJO?768:1024))){const f=(IOS?512:(BAJO?768:1024))/Math.max(im.width,im.height),c=document.createElement('canvas');c.width=Math.round(im.width*f);c.height=Math.round(im.height*f);c.getContext('2d').drawImage(im,0,0,c.width,c.height);t.image=c;t.needsUpdate=true}});tx.encoding=T.sRGBEncoding;return FOTOC[img]=tx}
function foto(img,w,h,x,y,z,ry,rz=0){const tx=texFoto(img);
  const g=new T.Group();const marco=new T.Mesh(new T.BoxGeometry(w+.04,h+.06,.004),M({color:'#e9e4d8',roughness:.8}));g.add(marco);
  const p=new T.Mesh(new T.PlaneGeometry(w,h),M({map:tx,roughness:.6}));p.position.set(0,.01,.003);g.add(p);
  const ch=new T.Mesh(new T.SphereGeometry(.012,8,6),M({color:'#b01020',roughness:.4}));ch.position.set(0,h/2+.01,.01);g.add(ch);
  g.position.set(x,y,z);g.rotation.set(0,ry,rz);S.add(sombra(g));return g}
function cactus(x,z,esc=1){const g=new T.Group();const verde=M({color:'#3f5a32',roughness:.85});const maceta=M({color:'#7a3f24',roughness:.95});
  macetas.push(g);
  const tm=new T.Mesh(new T.CylinderGeometry(.115,.115,.02,16),M({color:'#2a1c10'}));tm.position.y=.2;g.add(tm);
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
  const manga=new T.Mesh(new T.CylinderGeometry(.042,.05,.75,18),M({color:'#101114',roughness:1,envMapIntensity:0}));manga.rotation.x=Math.PI/2;manga.position.set(0,0,.47);g.add(manga);
  const puno=new T.Mesh(new T.TorusGeometry(.046,.01,8,20),M({color:'#24272c',roughness:1}));puno.position.z=.11;g.add(puno);
  g.userData.cierra=k=>{dedos.forEach((cad,i)=>cad.forEach((s,j)=>{s.rotation.x=-k*(j?1.25:.9)*(1-i*.04)}));pul[0].rotation.x=-k*.5;pul[1].rotation.x=-k*.7};
  g.userData.cierra(.25);sombra(g);g.traverse(m=>{if(m.isMesh)m.castShadow=false});return g}

/* ---------- zonas: lo que no puede verse desde donde está la cámara no se dibuja ni proyecta sombras ----------
   (Three ya descarta lo que queda fuera del encuadre; esto además apaga cuartos enteros detrás de las paredes) */
let zonaActual='',LIGERO=false;
// en celulares la memoria de video es poca: ninguna textura pasa de 1024 px
const MOVIL=/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)||(matchMedia('(pointer:coarse)').matches&&Math.min(screen.width,screen.height)<900);
// calidad baja solo en celular y solo si ella la eligió (botón "Bajar calidad")
// Safari (iPhone/iPad) guarda copias de cada imagen y lienzo aunque ya estén en la GPU y cierra la página mucho antes que Chrome
const IOS=/[?&]ios=1/.test(location.search)||/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const BAJO=MOVIL&&(()=>{try{return localStorage.getItem('meliLigero')!=='0'}catch(e){return true}})();
function liberaImagenes(){const ts=new Set();
  S.traverse(o=>{const ms=o.material?(Array.isArray(o.material)?o.material:[o.material]):[];ms.forEach(m=>Object.keys(m).forEach(k=>{const t=m[k];if(t&&t.isTexture&&!t.isDataTexture&&t.image&&t.image.width)ts.add(t)}))});
  const ok=new Set();ts.forEach(t=>{try{R.initTexture(t);ok.add(t)}catch(e){}});               // primero se suben todas (algunas comparten lienzo)
  ok.forEach(t=>{const im=t.image;t.image={width:im.width,height:im.height};if(im instanceof HTMLCanvasElement&&![...ok].some(u=>u.image===im)){try{im.width=im.height=0}catch(e){}}})}
function achicaTexturas(max){const vistas=new Set();S.traverse(o=>{const ms=o.material?(Array.isArray(o.material)?o.material:[o.material]):[];ms.forEach(m=>Object.keys(m).forEach(k=>{const t=m[k];if(!t||!t.isTexture||vistas.has(t))return;vistas.add(t);const im=t.image;
  if(!im||!im.width||Math.max(im.width,im.height)<=max||t.isDataTexture||t.noResize)return;const f=max/Math.max(im.width,im.height),c=document.createElement('canvas');c.width=Math.round(im.width*f);c.height=Math.round(im.height*f);
  try{c.getContext('2d').drawImage(im,0,0,c.width,c.height);t.image=c;t.needsUpdate=true}catch(e){}}))})}
// modo ligero: sin sombras, sin lluvia, sin resplandor y menos resolución
function ponLigero(on){LIGERO=!!on;if(!R)return;
  R.shadowMap.enabled=!LIGERO;S.traverse(o=>{const ms=o.material?(Array.isArray(o.material)?o.material:[o.material]):[];ms.forEach(m=>m.needsUpdate=true)});
  if(comp&&comp.passes[1])comp.passes[1].enabled=!LIGERO;prMax=Math.min(devicePixelRatio,IOS?.75:(MOVIL?(LIGERO?.9:1.15):1.25));pr=Math.min(pr,prMax);if(LIGERO)pr=prMax;aplicaPR();
  try{if(LUCES.length)compilaZonas();else R.compile(S,C)}catch(e){}}
const LUCES=[];
function zonificar(){const b=new T.Box3(),c=V(0,0,0),t=V(0,0,0),w=V(0,0,0);
  S.traverse(o=>{if(!o.isLight||o.isAmbientLight||o.isHemisphereLight||o===linterna)return;let p=o.parent,enCam=false;while(p){if(p===C)enCam=true;p=p.parent}if(enCam)return;
    o.getWorldPosition(w);o.userData.zonaL=o.isDirectionalLight?'afuera':w.y<-5?'escritorio':w.z>.35?'afuera':'adentro';LUCES.push(o)});
  S.children.forEach(o=>{if(o===C||o.isLight||o.userData.zona)return;b.setFromObject(o);if(b.isEmpty()){o.userData.zona='todo';return}
    b.getCenter(c);b.getSize(t);o.userData.zona=Math.max(t.x,t.z)>12?'todo':c.y<-5?'escritorio':c.z>.35?'afuera':c.z<-.35?'adentro':'todo'})}
function aplicaZona(z){zonaActual=z;LUCES.forEach(l=>l.visible=l.userData.zonaL===(z==='todas'?'afuera':z));
  S.children.forEach(o=>{const k=o.userData.zona;if(!k||k==='propio'||k==='todo')return;o.visible=z==='todas'?k!=='escritorio':k===z})}
const _fw=new T.Vector3();function zonas(){const p=C.position,cerrada=!puerta||Math.abs(puerta.rotation.y)<.03,fw=C.getWorldDirection(_fw),z=p.y<-5?'escritorio':(p.z>3.5||(p.z>.25&&cerrada))?'afuera':(p.z<-1.2||(p.z<-.6&&fw.z<-.55))?'adentro':'todas';if(z!==zonaActual)aplicaZona(z)}
// cada combinación de luces es un programa distinto: se compilan todas antes de entrar, así cambiar de zona no traba
function compilaZonas(){const ant=zonaActual;['escritorio','afuera','adentro'].forEach(z=>{aplicaZona(z);try{R.compile(S,C)}catch(e){}});aplicaZona(ant||'escritorio')}

/* ---------- abandono: telarañas, mugre, humedad, hojas secas, escombros, y los cuartos amueblados ---------- */
function telarana(){const [c,g]=lienzo(256,256);g.strokeStyle='rgba(230,230,235,.55)';g.lineWidth=1;const n=9;
  for(let i=0;i<n;i++){const a=i/n*Math.PI/2;g.beginPath();g.moveTo(0,0);g.lineTo(Math.cos(a)*256,Math.sin(a)*256);g.stroke()}
  for(let r=18;r<250;r+=rnd(14,22)){g.beginPath();for(let i=0;i<=n;i++){const a=i/n*Math.PI/2,rr=r+rnd(-4,4)-(i%2?6:0);i?g.lineTo(Math.cos(a)*rr,Math.sin(a)*rr):g.moveTo(Math.cos(a)*rr,Math.sin(a)*rr)}g.stroke()}
  const t=new T.CanvasTexture(c);return t}
function mugre(w,h,moho=true,hueco=null){const [c,g]=lienzo(w,h);
  for(let i=0;i<w/6;i++){const x=rnd(0,w),l=rnd(h*.15,h*.8),gr=g.createLinearGradient(0,0,0,l);gr.addColorStop(0,`rgba(10,8,5,${rnd(.25,.6)})`);gr.addColorStop(1,'rgba(10,8,5,0)');g.fillStyle=gr;g.fillRect(x,0,rnd(2,10),l)}
  if(moho)for(let i=0;i<w/3;i++){const x=rnd(0,w),y=h-rnd(0,h*.3)*Math.random(),r=rnd(6,40);const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,`rgba(${rnd(30,55)},${rnd(50,75)},${rnd(20,35)},${rnd(.3,.6)})`);gr.addColorStop(1,'rgba(40,60,30,0)');g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2)}
  for(let i=0;i<8;i++){const x=rnd(0,w),y=rnd(0,h),r=rnd(30,120);const gr=g.createRadialGradient(x,y,r*.5,x,y,r);gr.addColorStop(0,'rgba(60,40,15,0)');gr.addColorStop(.85,`rgba(55,38,15,${rnd(.15,.35)})`);gr.addColorStop(1,'rgba(55,38,15,0)');g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2)}
  if(hueco){g.clearRect(...hueco)}
  const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;return t}
function humedad(){const [c,g]=lienzo(256,256);for(let k=0;k<4;k++){const r=rnd(50,120),x=128+rnd(-30,30),y=128+rnd(-30,30);g.strokeStyle=`rgba(70,48,20,${rnd(.25,.5)})`;g.lineWidth=rnd(2,6);g.beginPath();for(let a=0;a<=6.3;a+=.15){const rr=r+rnd(-8,8);a?g.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr):g.moveTo(x+rr,y)}g.closePath();g.stroke();g.fillStyle='rgba(80,58,25,.12)';g.fill()}const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;return t}
function hojaSeca(){const [c,g]=lienzo(64,64);g.translate(32,32);g.rotate(rnd(0,3));g.fillStyle=`rgb(${rnd(70,110)},${rnd(45,70)},${rnd(20,35)})`;g.beginPath();g.ellipse(0,0,26,12,0,0,7);g.fill();g.strokeStyle='rgba(30,18,8,.7)';g.lineWidth=1.5;g.beginPath();g.moveTo(-26,0);g.lineTo(26,0);g.stroke();const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;return t}
function abandono(){const P2=Math.PI/2;
  const webM=new T.MeshBasicMaterial({map:telarana(),transparent:true,depthWrite:false,side:T.DoubleSide,opacity:.55,fog:true});
  const web=(x,y,z,ry,rz,sc=.7)=>{const m=new T.Mesh(new T.PlaneGeometry(sc,sc),webM);m.geometry.translate(sc/2,-sc/2,0);m.position.set(x,y,z);m.rotation.set(0,ry,rz);S.add(m)};
  // ----- afuera -----
  [0,1].forEach(()=>{calco(mugre(512,300,true),4.3,2.5,-2.85,1.55,.115,0,0,1);calco(mugre(512,300,true),4.3,2.5,2.85,1.55,.116,0,0,1)});
  calco(mugre(512,256,false),9.6,1.6,0,4.6,.115,0,0,.8);
  // enredaderas secas trepando por la esquina
  {const vm=M({color:'#2a2014',roughness:1});for(let k=0;k<7;k++){const pts=[];let x=rnd(-4.8,-3.6),y=.4;for(let i=0;i<9;i++){pts.push(V(x,y,.13));x+=rnd(-.25,.25);y+=rnd(.3,.55)}S.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),40,rnd(.008,.016),5),vm))}}
  // postigo colgando de una bisagra y canaleta caída
  {const pg=new T.Group();pg.position.set(3.44,2.4,.16);const p=caja(.55,1.35,.04,madera({base:[48,44,38],n:4,sucio:1},[1,1],1),-.28,-.62,0,0,pg);pg.rotation.z=.32;S.add(pg)}
  {const cn=caja(3.2,.1,.12,M({color:'#3a3a3c',roughness:.5,metalness:.6}),3.4,4.9,.32);cn.rotation.z=-.22}
  // tablas faltantes en el porche
  [[-1.3,1.6],[.9,.7],[1.5,1.8]].forEach(([x,z])=>{const h=new T.Mesh(new T.PlaneGeometry(.5,.14),new T.MeshBasicMaterial({color:'#020202'}));h.rotation.x=-P2;h.rotation.z=rnd(-.1,.1);h.position.set(x,.302,z);S.add(h)});
  // hojas secas: en el camino, el porche y adentro (entraron por la puerta)
  {const geo=new T.PlaneGeometry(.11,.11),mats=[0,1,2].map(()=>new T.MeshStandardMaterial({map:hojaSeca(),transparent:true,alphaTest:.4,roughness:1,side:T.DoubleSide}));
   mats.forEach(m=>{const n=110,im=new T.InstancedMesh(geo,m,n),d=new T.Object3D();for(let i=0;i<n;i++){const zona=Math.random();let x,y,z;
     if(zona<.55){x=rnd(-3,3);y=.012;z=rnd(2.5,12)}else if(zona<.85){x=rnd(-2,2);y=.31;z=rnd(.3,2.1)}else{x=rnd(-.8,.8);y=.31;z=rnd(-3,-.3)}
     d.position.set(x,y,z);d.rotation.set(-P2+rnd(-.2,.2),0,rnd(0,6.3));d.updateMatrix();im.setMatrixAt(i,d.matrix)}im.receiveShadow=true;S.add(im)})}
  web(-1.95,2.88,2.0,0,0,.8);web(1.95,2.88,2.0,0,P2,.8);web(-.62,2.7,.2,0,0,.45);web(.62,2.7,.2,0,P2,.45);
  // ----- adentro -----
  // telarañas en las esquinas del techo
  [[-.92,3.58,-.25,P2,0],[.92,3.58,-.25,-P2,0],[-.92,3.58,-8.0,P2,P2],[.92,3.58,-8.0,-P2,-P2],[-4.8,3.58,-.25,P2,0],[-4.8,3.58,-8.0,P2,P2],[4.8,3.58,-8.0,-P2,-P2],[4.8,3.58,-.25,-P2,0]]
    .forEach(([x,y,z,ry,rz])=>web(x,y,z,ry,rz,.9));
  // manchas de humedad en techo y paredes
  [[0,-1.8],[.2,-5.2],[-3.2,-2.4],[-2.4,-6.6],[3.4,-5.6]].forEach(([x,z])=>calco(humedad(),rnd(.8,1.4),rnd(.8,1.4),x,3.595,z,P2,0,.9));
  calco(mugre(256,512,true),.9,2.2,-.92,1.5,-4.6,0,P2,.7);calco(mugre(256,512,true),1.4,2.6,.92,1.5,-3.9,0,-P2,.6);calco(mugre(256,512,false),2.2,2.8,-4.82,1.7,-6.6,0,P2,.6);
  // papel tapiz desprendido, en tiras que se enroscan
  {const pm=new T.MeshStandardMaterial({color:'#6e5a44',roughness:.95,side:T.DoubleSide});
   [[-4.80,-3.0,P2],[-4.80,-2.6,P2],[-1.09,-5.0,-P2],[-2.0,-.18,Math.PI]].forEach(([x,z,ry])=>{const gm=new T.PlaneGeometry(.22,.9,1,10),pa=gm.attributes.position;for(let i=0;i<pa.count;i++){const y=pa.getY(i),k=Math.max(0,(-y+.1)/.55);pa.setZ(i,k*k*.18)}gm.computeVertexNormals();const m=new T.Mesh(gm,pm);m.position.set(x,2.7,z);m.rotation.y=ry;m.rotation.z=rnd(-.08,.08);S.add(m)})}
  // escombros: tablas rotas, papeles, polvo en el piso
  {const tb=madera({base:[60,48,36],n:2,sucio:1},[1,1],1);[[.6,-2.6,.4],[-.65,-6.2,-.3],[.55,-7.4,1.2],[-2.2,-1.0,.8],[3.9,-6.9,.2]].forEach(([x,z,r])=>{const b=caja(rnd(.5,.9),.03,.12,tb,x,.32,z,r);b.rotation.z=rnd(-.08,.08)});
   const pap=M({color:'#d8d0bc',roughness:.95,side:T.DoubleSide});for(let i=0;i<16;i++){const m=new T.Mesh(new T.PlaneGeometry(.21,.28),pap);m.rotation.set(-P2,0,rnd(0,6));const zona=Math.random();m.position.set(zona<.5?rnd(-.7,.7):rnd(-3.8,-1.6),.305+i*.0004,zona<.5?rnd(-7.5,-.8):rnd(-7.4,-1));S.add(m)}
   [[0,-4],[-3,-4],[3,-4]].forEach(([x,z])=>{const m=calco(mugre(256,256,false),2.6,3.6,x,.304,z,-P2,0,.55)})}
  // una silla volcada en el pasillo y un cuadro caído
  {const sm=M({color:'#3a2618',roughness:.8});const sg=new T.Group();caja(.42,.04,.42,sm,0,.45,0,0,sg);[[-.18,-.18],[.18,-.18],[-.18,.18],[.18,.18]].forEach(([x,z])=>caja(.035,.45,.035,sm,x,.225,z,0,sg));caja(.42,.5,.035,sm,0,.72,-.19,0,sg);
   sg.position.set(.6,.52,-7.3);sg.rotation.set(0,.7,P2);S.add(sombra(sg))}
  {const f=foto('fotos/patio.jpg',.3,.38,-.75,.36,-2.3,0,0);f.rotation.set(-P2+.05,0,.4)}
  // ----- cuarto del caso: estante, cortinas rotas, foco pelado colgando -----
  {const cm=M({color:'#2a0a0c',roughness:1,side:T.DoubleSide,envMapIntensity:0});[-1,1].forEach(sd=>{const gm=new T.PlaneGeometry(.55,1.9,8,1),pa=gm.attributes.position;for(let i=0;i<pa.count;i++)pa.setZ(i,Math.sin(pa.getX(i)*18)*.03);gm.computeVertexNormals();const m=new T.Mesh(gm,cm);m.position.set(-4.74,1.85,-1.8+sd*.62);m.rotation.y=P2;m.rotation.z=sd*.04;S.add(m)})}
  {caja(.006,.5,.006,M({color:'#111'}),-2.9,3.35,-4.2);const fb=new T.Mesh(new T.SphereGeometry(.04,12,10),M({color:'#998',roughness:.2,transparent:true,opacity:.7}));fb.position.set(-2.9,3.08,-4.2);S.add(fb)}
  // ----- cuarto de BTS: ropero, silla del escritorio, peluches, fotos de ella colgadas con broches -----
  {const sm=M({color:'#efe8f6',roughness:.6});const sg=new T.Group();caja(.42,.05,.42,sm,0,.48,0,0,sg);caja(.42,.45,.04,sm,0,.74,.2,0,sg);caja(.04,.46,.04,M({color:'#888',metalness:.8,roughness:.3}),0,.24,0,0,sg);
   const base=new T.Mesh(new T.CylinderGeometry(.24,.24,.03,12),M({color:'#555',metalness:.7,roughness:.4}));base.position.y=.02;sg.add(base);sg.position.set(2.75,.3,-1.05);sg.rotation.y=.25;S.add(sombra(sg))}
  const peluche=(x,y,z,col,ry)=>{const g=new T.Group(),m=M({color:col,roughness:1});const cu=new T.Mesh(new T.SphereGeometry(.09,16,12),m);cu.scale.set(1,1.1,.9);g.add(cu);const ca=new T.Mesh(new T.SphereGeometry(.07,16,12),m);ca.position.y=.13;g.add(ca);
    [-1,1].forEach(sd=>{const o=new T.Mesh(new T.SphereGeometry(.025,10,8),m);o.position.set(sd*.05,.19,0);g.add(o);const ojo=new T.Mesh(new T.SphereGeometry(.008,8,6),M({color:'#111'}));ojo.position.set(sd*.025,.14,.062);g.add(ojo);const pa=new T.Mesh(new T.SphereGeometry(.03,10,8),m);pa.position.set(sd*.06,-.08,.04);g.add(pa)});
    g.position.set(x,y,z);g.rotation.y=ry;S.add(sombra(g))};
  peluche(4.45,.95,-2.95,'#d8c2ff',-1.2);peluche(4.5,.95,-2.2,'#f4f0ea',-1.9);peluche(2.95,1.15,-.35,'#f3b9cf',3.4);
  // cordel con fotos de Meli sobre el escritorio
  {const pts=[];for(let i=0;i<=16;i++){const k=i/16;pts.push(V(1.6+k*2.3,2.35-Math.sin(k*Math.PI)*.12,-.2))}S.add(new T.Line(new T.BufferGeometry().setFromPoints(pts),new T.LineBasicMaterial({color:'#6a5a4a'})));
   [['meli-rock.jpg',1.95,.2,.32],['meli-feria.jpg',2.6,.24,.32],['meli-chiquita.jpg',3.25,.24,.32],['meli-pelirroja.jpg',3.75,.3,.22]].forEach(([f,x,w,h])=>{const y=2.35-Math.sin((x-1.6)/2.3*Math.PI)*.12-h/2-.04;foto('fotos/'+f,w,h,x,y,-.19,Math.PI,rnd(-.1,.1))})}
}

/* ---------- la escena ---------- */
function construir(cv){
  let listoAvisado=false;
  const avisaListo=()=>{if(listoAvisado)return;listoAvisado=true;cargado=true;if(LIGERO)ponLigero(true);cargaListo&&cargaListo()};
  let preparado=false;
  // se prepara en pasos cortos (con respiros entre uno y otro) para que la página no se congele
  const prepara=()=>{if(preparado)return;preparado=true;cargaProg&&cargaProg(-1);
    const pasos=[()=>{if(MOVIL)achicaTexturas(IOS?512:(BAJO?768:1024))},()=>zonificar(),
      ...(MOVIL?[]:['escritorio','afuera','adentro'].map(z=>()=>{aplicaZona(z);R.compile(S,C)})),
      ()=>aplicaZona('escritorio'),()=>{if(IOS)liberaImagenes()},()=>{if(!MOVIL)calentar()},()=>avisaListo()];
    const sigue=()=>{const f=pasos.shift();if(!f)return;try{f()}catch(e){console.warn(e)}setTimeout(sigue,30)};setTimeout(sigue,30)};
  LM=new T.LoadingManager(()=>prepara(),(u,l,t)=>{if(!preparado)cargaProg&&cargaProg(l/t)});
  setTimeout(prepara,40000);   // si algún archivo nunca responde, igual se sigue
  R=new T.WebGLRenderer({canvas:cv,antialias:false,powerPreference:'high-performance'});
  prMax=Math.min(devicePixelRatio,IOS?.75:(MOVIL?(LIGERO?.9:1.15):1.25));pr=prMax;R.setPixelRatio(pr);R.setSize(W(),H());R.outputEncoding=T.sRGBEncoding;
  R.toneMapping=T.ACESFilmicToneMapping;R.toneMappingExposure=1.25;R.shadowMap.enabled=true;R.shadowMap.autoUpdate=false;R.shadowMap.type=T.PCFShadowMap;R.physicallyCorrectLights=false;
  S=new T.Scene();S.fog=new T.FogExp2('#0a0e13',.065);
  C=new T.PerspectiveCamera(W()<H()?76:60,W()/H(),.02,90);C.position.set(0,1.62,11);S.add(C);
  const cieloM=new T.Mesh(new T.SphereGeometry(70,24,16),new T.MeshBasicMaterial({map:cielo(),side:T.BackSide,fog:false}));S.add(cieloM);
  const luna=new T.Sprite(new T.SpriteMaterial({map:brillo('rgba(205,215,240,1)'),fog:false,depthWrite:false}));luna.position.set(-16,20,-34);luna.scale.set(12,12,1);S.add(luna);
  const lunaL=new T.DirectionalLight('#8796c4',.55);lunaL.position.set(-9,16,9);lunaL.castShadow=false;
  Object.assign(lunaL.shadow.camera,{left:-16,right:16,top:16,bottom:-16,near:1,far:50});lunaL.shadow.bias=-.0006;S.add(lunaL);
  S.add(new T.HemisphereLight('#2a3348','#0b0805',.45));

  // ----- bosque -----
  const sueloM=pbr('forest_leaves_02',[30,30],{envMapIntensity:.15});
  const piso=new T.Mesh(new T.PlaneGeometry(90,90,60,60),sueloM);
  const pa=piso.geometry.attributes.position;for(let i=0;i<pa.count;i++){const x=pa.getX(i),y=pa.getY(i);const d=Math.hypot(x,y+2);if(d>9)pa.setZ(i,Math.sin(x*.35)*Math.cos(y*.3)*.35*Math.min(1,(d-9)/6))}piso.geometry.computeVertexNormals();
  piso.rotation.x=-Math.PI/2;piso.receiveShadow=true;S.add(piso);
  const piedraM=M({color:'#4a4640',roughness:.95});
  for(let z=3;z<12;z+=.62){const p=new T.Mesh(new T.DodecahedronGeometry(rnd(.22,.3),0),piedraM);p.scale.y=.18;p.position.set(rnd(-.22,.22),.02,z);p.rotation.y=rnd(0,3);p.receiveShadow=p.castShadow=true;S.add(p)}
  // pinos (instanciados) y algunos troncos secos
  const n=90,conoG=(()=>{const g=new T.ConeGeometry(1,1,10,2,true);const pa=g.attributes.position;for(let i=0;i<pa.count;i++){const x=pa.getX(i),z=pa.getZ(i),y=pa.getY(i);if(y<.45){const f=1+Math.sin(Math.atan2(z,x)*7)*.18+(Math.random()-.5)*.12;pa.setX(i,x*f);pa.setZ(i,z*f);pa.setY(i,y-Math.random()*.08)}}g.computeVertexNormals();return g})(),troncoG=new T.CylinderGeometry(.1,.18,1,7);
  const agujaM=M({color:'#0d1710',roughness:1,side:T.DoubleSide,envMapIntensity:.1}),cortezaM=pbr('pine_bark',[1,3]);
  const conos=new T.InstancedMesh(conoG,agujaM,n*7),troncos=new T.InstancedMesh(troncoG,cortezaM,n);conos.castShadow=troncos.castShadow=false;conos.userData.zona=troncos.userData.zona='afuera';conos.receiveShadow=true;
  const o=new T.Object3D();let ci=0,ti=0;
  for(let i=0;i<n;i++){let x,z;do{x=rnd(-36,36);z=rnd(-34,30)}while((Math.abs(x)<7.5&&z>-10&&z<14)||(Math.abs(x)<2.5&&z>-12&&z<30)||(x>-7&&x<4&&z>9&&z<21));
    const h=rnd(5,11),w=h*rnd(.26,.34);
    o.position.set(x,h*.12,z);o.scale.set(1,h*.25,1);o.rotation.set(0,0,0);o.updateMatrix();troncos.setMatrixAt(ti++,o.matrix);
    for(let k=0;k<7;k++){const s=w*(1-k*.13)*rnd(.9,1.1);o.position.set(x+rnd(-.08,.08),h*(.22+k*.11),z+rnd(-.08,.08));o.scale.set(s,h*.24,s*rnd(.85,1.1));o.rotation.set(rnd(-.04,.04),rnd(0,6.3),rnd(-.04,.04));o.updateMatrix();conos.setMatrixAt(ci++,o.matrix)}}
  conos.count=ci;troncos.count=ti;S.add(conos);S.add(troncos);
  function arbolSeco(x,z,h){const g=new T.Group();function rama(len,rad,prof){const m=new T.Mesh(new T.CylinderGeometry(rad*.6,rad,len,6),cortezaM);m.position.y=len/2;const nd=new T.Group();nd.add(m);
      if(prof>0)for(let i=0;i<3;i++){const h2=rama(len*rnd(.5,.7),rad*.6,prof-1);h2.position.y=len*rnd(.5,.95);h2.rotation.z=rnd(-.9,.9);h2.rotation.y=rnd(0,6.28);nd.add(h2)}return nd}
    g.add(rama(h,.2,3));g.position.set(x,0,z);S.add(sombra(g))}
  [[-6.5,8,5],[6.8,9,5.5],[-8.5,1,6]].forEach(a=>arbolSeco(...a));
  // niebla baja en capas
  const nieblaT=brillo('rgba(120,130,150,1)');for(let i=0;i<14;i++){const sp=new T.Sprite(new T.SpriteMaterial({map:nieblaT,transparent:true,opacity:.07,depthWrite:false}));sp.position.set(rnd(-14,14),rnd(.3,1.2),rnd(-6,14));sp.scale.set(rnd(8,14),rnd(2,3.5),1);S.add(sp)}

  // ----- el auto del CBI: el Mondeo (modelo real), faros y barra de luces -----
  const auto=new T.Group();autoPuerta=new T.Group();auto.add(autoPuerta);
  const brS=c=>{const sp=new T.Sprite(new T.SpriteMaterial({map:brillo('rgba(255,255,255,1)'),color:c,depthWrite:false,blending:T.AdditiveBlending,transparent:true}));sp.scale.set(.9,.6,1);return sp};const bR=brS('#ff1a1a'),bA=brS('#2a5bff');bR.position.set(-.22,1.45,.05);bA.position.set(.22,1.45,.05);auto.add(bR,bA);
  const lR=new T.PointLight('#ff2020',0,14,1.6);lR.position.set(0,1.75,0);auto.add(lR);const lA={intensity:0,color:new T.Color()};sirena=[lR,lA,bR,bA];
  [-.68,.68].forEach((x,i)=>{  const f=i===0?new T.SpotLight('#e8eeff',5.5,32,.42,.45,1.1):new T.Object3D();if(i===0){f.castShadow=!BAJO;f.shadow.mapSize.set(256,256)}f.position.set(x,.68,-2.3);auto.add(f);const tg=new T.Object3D();tg.position.set(x*.6,.3,-16);auto.add(tg);f.target=tg;
    const gl=new T.Sprite(new T.SpriteMaterial({map:brillo('rgba(235,240,255,1)'),depthWrite:false,fog:false}));gl.position.set(x,.68,-2.36);gl.scale.set(.7,.45,1);auto.add(gl);
    const cono=new T.Mesh(new T.ConeGeometry(2.6,13,24,1,true),new T.MeshBasicMaterial({color:'#cfd8ff',transparent:true,opacity:.03,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide}));cono.rotation.x=Math.PI/2;cono.position.set(x*.8,.5,-8.8);auto.add(cono)});
  // (el modelo del auto se quitó para aliviar la carga: quedan sus luces en la oscuridad)
  auto.position.set(0,0,14.4);S.add(auto);

  // ----- la pantalla de carga: la libreta sobre un escritorio, bajo una lámpara -----
  {const E=new T.Group();E.position.set(40,-20,40);S.add(E);
   const mesaE=new T.Mesh(new T.BoxGeometry(2.4,.06,1.6),pbr('wood_floor_worn',[1.5,1],{color:'#8a6a50'}));mesaE.receiveShadow=true;E.add(mesaE);
   const lib=new T.Group();const pg=new T.PlaneGeometry(.34,.232,40,6);const pa=pg.attributes.position;
   for(let i=0;i<pa.count;i++){const x=pa.getX(i),ax=Math.abs(x)/.17;pa.setZ(i,(Math.pow(ax,.6)*.018)-(ax<.08?.004:0)+Math.sin(ax*3)*.002)}pg.computeVertexNormals();
   const hojas=new T.Mesh(pg,new T.MeshStandardMaterial({map:libretaTex(),roughness:.92,side:T.DoubleSide}));hojas.castShadow=true;lib.add(hojas);
   const tapa=new T.Mesh(new T.BoxGeometry(.355,.245,.008),pbr('fabric_leather_02',[1,1],{color:'#2a1810'}));tapa.position.z=-.006;lib.add(tapa);
   const banda=new T.Mesh(new T.BoxGeometry(.006,.25,.004),M({color:'#5a0a0e',roughness:.6}));banda.position.set(.16,0,.004);lib.add(banda);
   const cinta=new T.Mesh(new T.PlaneGeometry(.008,.07),M({color:'#2a0306',roughness:.8,side:T.DoubleSide}));cinta.position.set(-.004,-.145,.003);cinta.rotation.z=.1;lib.add(cinta);
   lib.rotation.set(-Math.PI/2,0,.06);lib.position.set(0,.045,0);E.add(lib);
   // marcador rojo destapado, la tapa a un lado, y una foto boca abajo
   const marc=new T.Group();const cu=new T.Mesh(new T.CylinderGeometry(.009,.009,.13,16),M({color:'#2e0205',roughness:.6}));cu.rotation.z=Math.PI/2;marc.add(cu);
   const pu=new T.Mesh(new T.ConeGeometry(.009,.02,12),M({color:'#5a0508',roughness:.5}));pu.rotation.z=-Math.PI/2;pu.position.x=.075;marc.add(pu);marc.position.set(.24,.04,.05);marc.rotation.y=.6;E.add(sombra(marc));
   const tap=new T.Mesh(new T.CylinderGeometry(.011,.011,.04,16),M({color:'#2e0205',roughness:.6}));tap.rotation.z=Math.PI/2;tap.position.set(.3,.042,.14);tap.rotation.y=-.4;E.add(tap);
   const fot=new T.Mesh(new T.BoxGeometry(.1,.002,.12),M({color:'#efe9dc',roughness:.8}));fot.position.set(-.27,.033,.09);fot.rotation.y=.35;E.add(sombra(fot));
   // la investigación: notas, fotos, mapa, expediente, café y la linterna
   const plano=(tex,w,h,x,z,ry,y=.034)=>{const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshStandardMaterial({map:tex,roughness:.85}));m.rotation.set(-Math.PI/2,0,ry);m.position.set(x,y,z);m.receiveShadow=true;E.add(m);return m};
   plano(mapaTex(),.42,.3,-.05,-.3,.08,.032);
   const exp=plano(expediente(),.24,.32,.36,-.12,-.25,.036);
   [[['no contesta','40','-25'],['los mensajes','40','28']],[['Testigo:','40','-25'],['Meli','58','35']],[['¿Substack?','44','-20'],['revisar','36','30']],
    [['siempre llega','38','-25'],['tarde. ¿por qué?','34','25']],[['¿canción','42','-25'],['favorita?','42','30']],[['NO es','46','-20'],['coincidencia','40','35']]].forEach((ls,i)=>{
     const pos=[[.46,.1,.3],[-.46,-.05,-.2],[-.27,-.43,.15],[.45,.34,-.1],[-.12,.38,.2],[.46,-.33,.05]][i];
     plano(postit(ls.map(([t,px,y])=>[t,+px*1.5,+y*1.5,i===5?'rgba(170,10,20,.95)':undefined]),['#f4b6c2','#b8e0d2','#f2e27a','#f4d58a','#c9b8f0','#f2e27a'][i],rnd(-.06,.06)),.1,.1,pos[0],pos[1],pos[2],.042+i*.0004)});
   {const k=KD(),[c,g]=lienzo(512*k,640*k);g.scale(k,k);g.fillStyle='#e9e3d3';g.fillRect(0,0,512,640);manchas(g,512,640,20,a=>`rgba(120,100,60,${a})`);g.fillStyle='#1a1a1a';g.font='700 26px Georgia, serif';g.textAlign='center';g.fillText('DIARIO DE LA NOCHE',256,48);
    g.fillRect(30,62,452,3);g.font='900 58px Georgia, serif';g.fillText('¿DÓNDE ESTÁ',256,140);g.fillText('JAMES?',256,205);g.font='italic 22px Georgia, serif';g.fillText('Lo vieron por última vez en un rally',256,245);
    g.textAlign='left';for(let col=0;col<2;col++)for(let i=0;i<14;i++){g.fillStyle='rgba(30,30,30,.55)';g.fillRect(36+col*230,280+i*24,rnd(150,205),9)}g.setTransform(1,0,0,1,0,0);grano(g,c.width,c.height,10);
    const t=nitida(new T.CanvasTexture(c));plano(t,.17,.21,-.47,.33,.25,.037)}
   [[['¿Dónde está','46','-20'],['James?','64','40']],[['Rally Nacional','40','-30'],['→ ¿con quién?','40','25']],[['León, 18 feb','42','-25'],['¿por qué volvió?','36','30']],
    [['visto por última','36','-30'],['vez: UAM 7 p.m.','36','20']],[['07·10·2025','44','-20'],['todo empezó aquí','38','30']]].forEach((ls,i)=>{
     const pos=[[-.37,.02,.2],[.31,.2,-.15],[-.34,-.19,-.25],[.13,.31,.1],[.2,-.37,.06]][i];
     plano(postit(ls.map(([t,px,y])=>[t,+px*1.5,+y*1.5]),['#f2e27a','#f4b6c2','#f2e27a','#b8e0d2','#f4d58a'][i],rnd(-.06,.06)),.1,.1,pos[0],pos[1],pos[2],.04+i*.0004)});
   // polaroids de los lugares (fotos reales de la línea de tiempo)
   [['fotos/linea-rally.webp',-.36,-.05,.4],['fotos/linea-rally-uam.webp',.17,.3,-.3],['fotos/meli-chiquita.jpg',.42,.2,.2]].forEach(([f,x,z,ry])=>{
     const g=new T.Group();const marco=new T.Mesh(new T.BoxGeometry(.09,.002,.108),M({color:'#efe9dc',roughness:.8}));g.add(marco);
     const tx=new T.TextureLoader(LM).load(f);tx.encoding=T.sRGBEncoding;const ft=new T.Mesh(new T.PlaneGeometry(.078,.078),M({map:tx,roughness:.6}));ft.rotation.x=-Math.PI/2;ft.position.set(0,.0015,-.008);g.add(ft);
     g.position.set(x,.033,z);g.rotation.y=ry;E.add(sombra(g))});
   // taza de café frío
   {const taza=new T.Mesh(new T.LatheGeometry([[0,0],[.035,0],[.04,.005],[.042,.09],[.045,.092]].map(([r,y])=>new T.Vector2(r,y)),28),M({color:'#e8e2d6',roughness:.35,side:T.DoubleSide}));taza.position.set(-.38,.03,.26);E.add(sombra(taza));
    const cafe=new T.Mesh(new T.CircleGeometry(.039,24),M({color:'#2a160a',roughness:.1}));cafe.rotation.x=-Math.PI/2;cafe.position.set(-.38,.11,.26);E.add(cafe);
    const asa=new T.Mesh(new T.TorusGeometry(.025,.006,8,16,Math.PI*1.2),M({color:'#e8e2d6',roughness:.35}));asa.position.set(-.34,.07,.26);asa.rotation.z=-Math.PI/2-.6;E.add(asa)}
   // la linterna, sobre la mesa, esperando
   linMesa=new T.Group();{const n=M({color:'#121212',roughness:.35,metalness:.7});const b=new T.Mesh(new T.CylinderGeometry(.017,.017,.16,18),n);b.rotation.x=Math.PI/2;linMesa.add(b);
    const h=new T.Mesh(new T.CylinderGeometry(.026,.018,.05,20),n);h.rotation.x=Math.PI/2;h.position.z=-.1;linMesa.add(h)}
   linMesa.position.set(-.24,.055,.25);linMesa.rotation.y=1.25;E.add(sombra(linMesa));
   // la lámpara de escritorio (fuera de cuadro): luz cálida y cerrada
   lampEsc=new T.SpotLight('#ffd6a0',1.7,3,.6,.8,2);lampEsc.position.set(-.38,.62,-.18);lampEsc.target=lib;lampEsc.castShadow=true;lampEsc.shadow.mapSize.set(512,512);lampEsc.shadow.bias=-.0004;E.add(lampEsc);
   }

  // ----- lluvia -----
  {const n=IOS?350:(MOVIL?650:1400),pos=new Float32Array(n*6);for(let i=0;i<n;i++){const x=rnd(-14,14),y=rnd(0,9),z=rnd(-6,22);pos.set([x,y,z,x+.02,y-.32,z],i*6)}
   const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));
   lluvia=new T.LineSegments(g,new T.LineBasicMaterial({color:'#9fb0c8',transparent:true,opacity:.32,depthWrite:false}));lluvia.userData.zona='propio';S.add(lluvia)}

  // ----- la casa -----
  const mF=pbr('weathered_planks',[3,2.2],{color:'#6f675c'});
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
  const porM=pbr('brown_planks_03',[2,1]);
  caja(4.2,.3,2.2,porM,0,.15,1.1);caja(1.6,.15,.4,porM,0,.075,2.4);
  caja(4.6,.1,2.4,techoM,0,2.95,1.1);
  // barandas rotas
  [-1,1].forEach(s=>{caja(1.4,.06,.06,marcoM,s*1.25,1.0,2.08,0);for(let i=0;i<5;i++){const b=caja(.04,.7,.04,marcoM,s*(.65+i*.28),.65,2.08);if(i===2&&s>0)b.rotation.z=.5}});
  // cinta policial en el porche (se levanta para pasar por debajo)
  const ct=cinta();ct.encoding=T.sRGBEncoding;const cintaM=new T.MeshLambertMaterial({map:ct,color:'#d6b43a',side:T.DoubleSide});
  cintaP=new T.Group();cintaP.position.set(0,1.18,2.1);S.add(cintaP);
  const c1=new T.Mesh(new T.PlaneGeometry(3.9,.09,24,1),cintaM);cintaP.add(c1);
  {const pa=c1.geometry.attributes.position;for(let i=0;i<pa.count;i++){const x=pa.getX(i);pa.setY(i,pa.getY(i)-.12*(1-Math.pow(x/1.95,2)))}}
  // ventanas tapiadas
  const vidrio=M({color:'#06080c',roughness:.15,metalness:.7});const tabla=madera({base:[70,60,48],n:1,var_:6},[1,1],1);
  [[-2.8,1.7],[2.8,1.7],[-2.4,4],[2.4,4]].forEach(([x,y],i)=>{caja(1.2,1.4,.05,vidrio,x,y,z0+.1);caja(1.32,.1,.08,marcoM,x,y+.74,z0+.12);caja(1.32,.1,.08,marcoM,x,y-.74,z0+.12);
    const b1=caja(1.6,.16,.04,tabla,x,y,z0+.16);b1.rotation.z=.6+rnd(-.1,.1);const b2=caja(1.6,.16,.04,tabla,x,y+rnd(-.2,.2),z0+.17);b2.rotation.z=-.5+rnd(-.1,.1);
    if(i===3){const gl=new T.Mesh(new T.PlaneGeometry(1.1,1.3),new T.MeshBasicMaterial({color:'#ff5a30',transparent:true,opacity:.2}));gl.position.set(x,y,z0+.11);S.add(gl);parpadeo.push([gl,.2])}});
  calco(redJohn(),1.1,1.1,1.5,1.6,z0+.1,0,0,.9);
  // estructura: cimiento de piedra, esquineros, aleros, chimenea, ventana redonda, bajante
  const piedra=(()=>{const [c,g]=lienzo(512,256);g.fillStyle='#2a2826';g.fillRect(0,0,512,256);for(let y=0;y<256;y+=32)for(let x=-(y/32%2)*30;x<512;x+=60){g.fillStyle=`rgb(${rnd(60,90)},${rnd(58,84)},${rnd(52,74)})`;g.fillRect(x+3,y+3,54,26)}grano(g,512,256,18);return tex(c,[6,1])})();
  const pM=pbr('castle_brick_07',[5,.4]);
  caja(10.3,.5,.3,pM,0,.25,z0+.06);caja(.3,.5,8.6,pM,-5.05,.25,-4.2);caja(.3,.5,8.6,pM,5.05,.25,-4.2);
  const trim=M({color:'#6e6a62',roughness:.85});
  [-5.02,5.02].forEach(x=>caja(.2,5.2,.22,trim,x,3.0,z0+.08));
  [-1,1].forEach(sd=>{const f=caja(5.9,.26,.08,trim,sd*2.55,alto+1.0,z0+.18);f.rotation.z=-sd*.42});
  caja(10.3,.16,.5,trim,0,alto+.02,z0+.15);
  const chim=pbr('castle_brick_07',[.6,2]);caja(.8,3.2,.8,chim,3.3,alto+1.1,-4.5);caja(.95,.15,.95,M({color:'#1a1918',roughness:1}),3.3,alto+2.75,-4.5);
  const ojo=new T.Mesh(new T.CircleGeometry(.42,32),new T.MeshBasicMaterial({color:'#ffb060',transparent:true,opacity:.35}));ojo.position.set(0,alto+1.0,z0+.12);S.add(ojo);parpadeo.push([ojo,.35]);
  const aro=new T.Mesh(new T.TorusGeometry(.45,.05,10,32),trim);aro.position.set(0,alto+1.0,z0+.14);S.add(aro);
  caja(.1,alto,.1,M({color:'#3a3a3c',roughness:.5,metalness:.6}),4.85,alto/2,z0+.25);
  // marco de la puerta y escalones con contrahuella
  caja(1.5,.12,.34,trim,0,2.82,z0+.12);[-.68,.68].forEach(x=>caja(.14,2.5,.3,trim,x,1.55,z0+.12));
  caja(1.8,.04,.42,M({color:'#3a2c20',roughness:.9}),0,.17,2.42);
  // columnas torneadas del porche
  [-1.95,1.95].forEach(x=>{const col=new T.Mesh(new T.LatheGeometry([new T.Vector2(.11,0),new T.Vector2(.11,.1),new T.Vector2(.07,.18),new T.Vector2(.075,1.1),new T.Vector2(.09,1.3),new T.Vector2(.07,1.5),new T.Vector2(.075,2.4),new T.Vector2(.11,2.5),new T.Vector2(.11,2.62)],18),trim);col.position.set(x,.3,2.05);col.castShadow=true;S.add(col)});
  cactus(-1.5,1.6,1.1);cactus(1.55,1.7,.9);
  const farol=new T.Object3D();farol.position.set(.9,2.6,.6);
  const bomb=new T.Sprite(new T.SpriteMaterial({map:brillo('rgba(255,190,110,1)'),depthWrite:false}));bomb.position.copy(farol.position);bomb.scale.set(.45,.45,1);S.add(bomb);parpadeo.push([bomb,.8]);

  // ----- adentro: la escena del crimen -----
  const paredM=M({color:'#2a2420',roughness:.9});
  const pisoM=pbr('old_wooden_floor_01',[5,5]);
  const pisoI=new T.Mesh(new T.PlaneGeometry(8,8),pisoM);pisoI.rotation.x=-Math.PI/2;pisoI.position.set(0,.302,-4.1);pisoI.receiveShadow=true;S.add(pisoI);
  const techoI=new T.Mesh(new T.PlaneGeometry(8,8),M({color:'#1a1714',roughness:1}));techoI.rotation.x=Math.PI/2;techoI.position.set(0,3.6,-4.1);S.add(techoI);
  // muro: plano con la textura escalada por metro (una sola textura 4K compartida)
  const muro=(mat,x,z,w,ry,tile=2,h=3.3,y=1.95)=>{const g=new T.PlaneGeometry(w,h);const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*w/tile+x*.37,uv.getY(i)*h/tile);
    const m=new T.Mesh(g,mat);m.position.set(x,y,z);m.rotation.y=ry;m.receiveShadow=true;S.add(m);return m};
  const papel=pbr('decrepit_wallpaper',[1,1],{envMapIntensity:.2}),yeso=pbr('worn_plaster_wall',[1,1],{color:'#a8a196',envMapIntensity:.2}),lila=pbr('painted_plaster_wall',[1,1],{color:'#c4b2ea',envMapIntensity:.2});
  const P2=Math.PI/2;
  // cuarto del caso: papel tapiz viejo
  muro(papel,-4.835,-4.1,7.96,P2,1.4);muro(papel,-2.93,-8.08,3.8,0,1.4);muro(papel,-2.93,-.15,3.8,Math.PI,1.4);
  muro(papel,-1.066,-1.56,2.88,-P2,1.4);muro(papel,-1.066,-6.05,4.1,-P2,1.4);muro(papel,-1.066,-3.5,1.0,-P2,1.4,1.0,3.1);
  // pasillo: yeso gastado
  muro(yeso,-.934,-1.56,2.88,P2);muro(yeso,-.934,-6.05,4.1,P2);muro(yeso,-.934,-3.5,1.0,P2,2,1.0,3.1);
  muro(yeso,.934,-2.36,4.48,-P2);muro(yeso,.934,-6.85,2.5,-P2);muro(yeso,.934,-5.1,1.0,-P2,2,1.0,3.1);
  muro(yeso,0,-8.08,1.87,0);muro(yeso,-.75,-.15,.5,Math.PI);muro(yeso,.75,-.15,.5,Math.PI);muro(yeso,0,-.15,1.0,Math.PI,2,.88,3.16);
  // cuarto de BTS: yeso pintado lila
  muro(lila,4.835,-4.1,7.96,-P2);muro(lila,2.93,-8.08,3.8,0);muro(lila,2.93,-.15,3.8,Math.PI);
  muro(lila,1.066,-2.36,4.48,P2);muro(lila,1.066,-6.85,2.5,P2);muro(lila,1.066,-5.1,1.0,P2,2,1.0,3.1);
  // tabiques (estructura) y marcos de las puertas
  const tab=(x,z0,z1)=>caja(.12,3.3,Math.abs(z1-z0),paredM,x,1.95,(z0+z1)/2);
  tab(-1,-.12,-3.0);tab(-1,-4.0,-8.1);caja(.12,1.0,1.0,paredM,-1,3.1,-3.5);
  tab(1,-.12,-4.6);tab(1,-5.6,-8.1);caja(.12,1.0,1.0,paredM,1,3.1,-5.1);
  const marcoP=M({color:'#3a2618',roughness:.7});
  [[-1,-3.5],[1,-5.1]].forEach(([x,z])=>{caja(.18,2.3,.08,marcoP,x,1.45,z-.52);caja(.18,2.3,.08,marcoP,x,1.45,z+.52);caja(.18,.1,1.12,marcoP,x,2.62,z)});
  // la puerta del cuarto del caso, entreabierta, y la cinta en X cruzando el marco
  // zócalos en todo el perímetro
  const zoc=M({color:'#1a100a',roughness:.8});
  [[-2.93,-8.06,3.8,0],[2.93,-8.06,3.8,0],[0,-8.06,1.87,0]].forEach(([x,z,w])=>caja(w,.16,.03,zoc,x,.38,z));
  [[-4.82,-4.1],[4.82,-4.1]].forEach(([x,z])=>caja(.03,.16,7.9,zoc,x,.38,z));
  [[-1.07,-1.56,2.88],[-1.07,-6.05,4.1],[-.93,-1.56,2.88],[-.93,-6.05,4.1],[.93,-2.36,4.48],[.93,-6.85,2.5],[1.07,-2.36,4.48],[1.07,-6.85,2.5]].forEach(([x,z,w])=>caja(.03,.16,w,zoc,x,.38,z));
  // fotos de ella colgadas, torcidas, a lo largo del pasillo
  [['meli-movida.jpg',-.92,-1.5,P2,.42,.32],['osito.jpg',-.92,-5.4,P2,.32,.4],['meli-lentes-verde.jpg',-.92,-6.7,P2,.42,.32],['sillon.jpg',.92,-1.8,-P2,.32,.4],['meli-dorado.jpg',.92,-3.3,-P2,.42,.32],['patio.jpg',.92,-6.6,-P2,.32,.4]]
    .forEach(([f,x,z,ry,w,h])=>foto('fotos/'+f,w,h,x,1.85+rnd(-.1,.1),z,ry,rnd(-.12,.12)));
  // un foco pelado y apagado en el techo del pasillo
  {caja(.006,.4,.006,M({color:'#111'}),0,3.4,-2.2);const fb=new T.Mesh(new T.SphereGeometry(.04,12,10),M({color:'#bba',roughness:.2,transparent:true,opacity:.6}));fb.position.set(0,3.18,-2.2);S.add(fb)}
  // al estilo Red John: cuarto ordenado, la víctima en la cama, la carita pintada con su sangre sobre la cabecera
  calco(redJohn(),1.7,1.7,-4.83,2.4,-4.6,0,Math.PI/2);
  const cama=new T.Group();const mCama=M({color:'#2a1a10',roughness:.6}),colchon=M({color:'#d8d2c6',roughness:.95}),sab=pbr('rough_linen',[2,2],{color:'#e9e4da'});



  caja(1.92,.2,.9,colchon,-3.8,.68,-4.6,0,cama);
  [-4.8,-4.4].forEach(z=>{const a=new T.Mesh(new T.SphereGeometry(1,18,12),colchon);a.scale.set(.15,.06,.19);a.position.set(-4.5,.84,z);cama.add(a)});
  // la sábana sobre el cuerpo: una malla que se apoya en una silueta (cabeza en la almohada, pecho, cadera, piernas, pies)
  {const parte=[[-4.40,.935,-4.6,.10,.085,.10],[-4.22,.84,-4.6,.05,.07,.05],[-3.95,.80,-4.6,.26,.19,.135],[-3.62,.79,-4.6,.17,.175,.105],
     [-3.18,.78,-4.51,.36,.075,.075],[-3.18,.78,-4.69,.36,.075,.075],[-2.93,.80,-4.52,.04,.05,.10],[-2.93,.80,-4.69,.04,.05,.10],
     [-3.80,.80,-4.37,.30,.05,.055],[-3.80,.80,-4.83,.30,.05,.055],[-4.5,.80,-4.6,.14,.36,.06]];
   const alto=(x,z)=>{let h=.795;for(const [cx,cy,cz,rx,rz,ry] of parte){const q=1-((x-cx)/rx)**2-((z-cz)/rz)**2;if(q>0)h=Math.max(h,cy+ry*Math.sqrt(q))}return h};
   const X0=-4.64,X1=-2.84,Z0=-5.05,Z1=-4.15,NX=110,NZ=64,cae=.22;
   const gm=new T.PlaneGeometry(1,1,NX,NZ),pa=gm.attributes.position,uv=gm.attributes.uv;const H=[];
   for(let iz=0;iz<=NZ;iz++)for(let ix=0;ix<=NX;ix++){const x=X0-.02+(X1-X0+cae+.02)*ix/NX,z=Z0-cae+(Z1-Z0+2*cae)*iz/NZ;H.push([x,z,alto(Math.min(X1,x),Math.min(Z1,Math.max(Z0,z)))])}
   // la tela no se pega: se suaviza como si colgara de los puntos altos
   for(let pas=0;pas<3;pas++){const H2=H.map(v=>v.slice());for(let iz=1;iz<NZ;iz++)for(let ix=1;ix<NX;ix++){const k=iz*(NX+1)+ix;let m=0;[[0,0,4],[1,0,1],[-1,0,1],[0,1,1],[0,-1,1]].forEach(([a,b,w])=>m+=H[k+a+b*(NX+1)][2]*w);H2[k][2]=Math.max(H[k][2]-.004,m/8)}for(let k=0;k<H.length;k++)H[k][2]=H2[k][2]}
   for(let k=0;k<H.length;k++){let [x,z,y]=H[k];const ix=k%(NX+1),iz=Math.floor(k/(NX+1));
     // pliegues finos
     y+=Math.sin(x*38+z*9)*.003+Math.sin(z*55-x*7)*.002;
     // lo que pasa del borde del colchón cae por los costados y los pies
     const dz=Math.max(0,Z0-z,z-Z1),dx=Math.max(0,x-X1);const d=Math.max(dz,dx);
     if(d>0){y=.795-d*1.35+Math.sin((dz?x:z)*24)*.012;if(dz)z=z<Z0?Z0-.012-d*.06:Z1+.012+d*.06;if(dx)x=X1+.012+d*.06}
     pa.setXYZ(k,x,y+.004,z);uv.setXY(k,ix/NX,1-iz/NZ)}
   gm.computeVertexNormals();
   // la tela, con la sangre que la empapa a la altura del pecho
   const [sc,sg]=lienzo(1024,640);sg.fillStyle='#c9c1b2';sg.fillRect(0,0,1024,640);grano(sg,1024,640,10);for(let k=0;k<40;k++){sg.fillStyle=`rgba(90,75,55,${rnd(.03,.08)})`;sg.beginPath();sg.arc(rnd(0,1024),rnd(0,640),rnd(20,90),0,7);sg.fill()}
   const mancha=(x,y,r,a)=>{for(let k=0;k<26;k++){const rr=r*rnd(.3,1),xx=x+rnd(-r,r)*.7,yy=y+rnd(-r,r)*.5;const gr=sg.createRadialGradient(xx,yy,0,xx,yy,rr);gr.addColorStop(0,`rgba(62,3,6,${a})`);gr.addColorStop(.7,`rgba(84,8,10,${a*.55})`);gr.addColorStop(1,'rgba(90,20,15,0)');sg.fillStyle=gr;sg.beginPath();sg.arc(xx,yy,rr,0,7);sg.fill()}};
   mancha(330,300,120,.55);mancha(400,350,70,.6);mancha(250,250,50,.35);mancha(330,560,60,.5);mancha(430,600,40,.55);
   const st=new T.CanvasTexture(sc);st.encoding=T.sRGBEncoding;st.anisotropy=8;
   const telaM=new T.MeshStandardMaterial({map:st,roughness:.97,side:T.DoubleSide,envMapIntensity:.25});
   const tela=new T.Mesh(gm,telaM);tela.castShadow=tela.receiveShadow=true;cama.add(tela);
   // una mano que asoma por el costado y cuelga de la cama
   const mano=crearMano(1);mano.traverse(m=>{if(m.isMesh&&m.material&&m.material.color&&m.material.color.getHex()<0x303030)m.visible=false});
   const pal=piel();pal.color.set('#9c8a80');mano.traverse(m=>{if(m.isMesh&&m.visible)m.material=pal});
   const ante=new T.Mesh(new T.CylinderGeometry(.03,.034,.3,14),pal);ante.rotation.x=Math.PI/2;ante.position.z=.22;mano.add(ante);
   mano.position.set(-3.82,.6,-4.06);mano.rotation.set(-Math.PI/2+.25,0,.2);mano.scale.setScalar(1.1);mano.userData.cierra(.45);cama.add(mano);
   calco(sangre('charco'),.5,.4,-3.85,.305,-3.92,-Math.PI/2,0,.95)}
  S.add(sombra(cama));
  // mesita de noche con lámpara tenue

  const luzN=new T.PointLight('#ffb070',.5,3.2,2);luzN.position.set(-4.5,1.25,-5.95);S.add(luzN);parpadeo.push([luzN,.5]);
  // marcadores de evidencia junto a la cama
  [[-2.5,-4.0],[-2.45,-5.2],[-3.2,-3.6],[-3.4,-5.6],[-2.2,-4.6]].forEach(([x,z],i)=>{const g=new T.Group();const m=new T.Mesh(new T.CylinderGeometry(.0001,.07,.12,3),M({map:etiquetaNum(i+1),color:'#f0c419',roughness:.5}));m.position.y=.06;g.add(m);g.position.set(x,.3,z);g.rotation.y=rnd(0,3);S.add(sombra(g))});
  // cinta alrededor de la cama, entre dos parantes, sin cruzar el paso
  [[-1.95,-3.4],[-1.95,-5.9]].forEach(([x,z])=>caja(.05,1.0,.05,M({color:'#c9a400',roughness:.6}),x,.8,z));
  {const ci=new T.Mesh(new T.PlaneGeometry(2.5,.07),cintaM);ci.position.set(-1.95,1.18,-4.65);ci.rotation.y=Math.PI/2;S.add(ci)}
  // alfombra vieja bajo la cama
  {const a=new T.Mesh(new T.PlaneGeometry(2.6,2.0),pbr('dirty_carpet',[1.3,1],{color:'#8a6a5a'}));a.rotation.x=-P2;a.position.set(-3.35,.306,-4.6);a.receiveShadow=true;S.add(a)}
  // ventana tapiada en la pared de afuera: la luna se cuela entre las tablas
  {caja(.05,1.2,1.0,M({color:'#05070a',roughness:.1,metalness:.6}),-4.82,1.9,-1.8);caja(.08,.08,1.12,marcoP,-4.8,2.52,-1.8);caja(.08,.08,1.12,marcoP,-4.8,1.28,-1.8);
   [[.5],[-.45]].forEach(([a])=>{const t=caja(.04,.14,1.3,pbr('weathered_planks',[1,1]),-4.78,1.9+rnd(-.1,.1),-1.8);t.rotation.x=a});
   const lun=new T.SpotLight('#9fb4ff',1.4,8,.42,.7,1.5);lun.position.set(-5.6,2.6,-1.8);const tg=new T.Object3D();tg.position.set(-3.2,.3,-2.6);S.add(tg);lun.target=tg;S.add(lun)}
  // luces de trabajo forense en trípode, frías, apuntando a la cama
  const tripode=(x,z,mira,sombraT=false)=>{const g=new T.Group();const metal=M({color:'#2a2c30',roughness:.4,metalness:.8});
    for(let i=0;i<3;i++){const a=i*Math.PI*2/3;const p=new T.Mesh(new T.CylinderGeometry(.012,.012,1.05,8),metal);p.position.set(Math.cos(a)*.22,.48,Math.sin(a)*.22);p.rotation.set(Math.sin(a)*.42,0,-Math.cos(a)*.42);g.add(p)}
    const poste=new T.Mesh(new T.CylinderGeometry(.015,.015,.9,8),metal);poste.position.y=1.3;g.add(poste);
    const cab=new T.Group();cab.position.y=1.78;g.add(cab);const caja2=new T.Mesh(new T.BoxGeometry(.3,.22,.12),M({color:'#c9a400',roughness:.5}));cab.add(caja2);
    const cara=new T.Mesh(new T.PlaneGeometry(.26,.18),new T.MeshBasicMaterial({color:'#f4f8ff'}));cara.position.z=.061;cab.add(cara);
    const gl=new T.Sprite(new T.SpriteMaterial({map:brillo('rgba(230,240,255,1)'),depthWrite:false,blending:T.AdditiveBlending}));gl.position.z=.1;gl.scale.set(.7,.6,1);cab.add(gl);
    g.position.set(x,.3,z);S.add(sombra(g));cab.lookAt(mira);
    if(!sombraT)return;const sl=new T.SpotLight('#eaf2ff',2.6,10,.6,.55,1.6);sl.position.set(x,2.08,z);const tg=new T.Object3D();tg.position.copy(mira);S.add(tg);sl.target=tg;S.add(sl)};
  tripode(-2.0,-6.9,V(-4.6,1.6,-4.6),true);tripode(-1.6,-1.6,V(-4.0,.9,-4.6));
  // bolsas de evidencia y un maletín forense
  [[-2.3,-6.2],[-2.6,-6.35]].forEach(([x,z])=>{const b=caja(.18,.01,.24,new T.MeshStandardMaterial({color:'#e8eef4',roughness:.15,transparent:true,opacity:.55}),x,.31,z);b.rotation.y=rnd(0,1)});
  {const m=caja(.45,.14,.3,M({color:'#1a1a1c',roughness:.4,metalness:.3}),-1.5,.37,-7.4);caja(.46,.02,.02,M({color:'#c0c4c8',metalness:1,roughness:.2}),-1.5,.44,-7.25)}
  // flash del fotógrafo forense
  flashL=new T.PointLight('#ffffff',0,10,1.5);flashL.position.set(-2.2,2.0,-3.0);S.add(flashL);
  // tablero de investigación (corcho, fotos de lo que le gusta, hilo rojo)
  const tablero=new T.Mesh(new T.BoxGeometry(2.6,1.5,.04),M({map:corcho(),roughness:1}));tablero.position.set(-2.6,2.0,-.18);tablero.rotation.y=Math.PI;tablero.receiveShadow=true;S.add(tablero);
  const fotos=[['cerati.jpg',.36,.46,-2.95,2.35],['bts.jpg',.5,.34,-3.75,2.4],['alvaro.jpg',.34,.44,-4.55,2.3],['cactus.jpg',.38,.3,-5.1,1.7],['psi.png',.3,.3,-4.2,1.65],['mentalista.jpg',.44,.32,-3.3,1.62]];
  const pinPos=[];fotos.forEach(([f,w,h,z,y])=>{const x=-2.6+(z+4.1);foto('fotos/cosas/'+f,w,h,x,y,-.21,Math.PI,rnd(-.08,.08));pinPos.push(V(x,y+h/2+.01,-.22))});
  const hiloM=new T.LineBasicMaterial({color:'#c01020'});[[0,4],[4,1],[1,5],[5,2],[2,3],[3,4],[0,5]].forEach(([a,b])=>S.add(new T.Line(new T.BufferGeometry().setFromPoints([pinPos[a],pinPos[b]]),hiloM)));
  // ----- del otro lado: el rincón de BTS -----
  const morado=new T.MeshBasicMaterial({color:'#a970ff'});caja(.03,.03,7.6,morado,4.8,3.48,-4.1);
  {const l=new T.PointLight('#8a4dff',1.3,7,1.6);l.position.set(3.0,3.1,-4.2);S.add(l)}
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
   g.position.set(2.35,1.67,-7.8);S.add(g)}
  ['#5b2a9a','#d8b4ff','#1e1030','#9b5cff'].forEach((col,i)=>{const a=caja(.22,.22,.012,M({color:col,roughness:.4}),2.75+i*.13,1.78,-7.82+i*.01);a.rotation.y=rnd(-.1,.1)});
  // cama con edredón lila, cojines, alfombra peluda rosa, escritorio con la laptop encendida y luces de hada
  {const ed=pbr('rough_linen',[2,2],{color:'#b79ce6'});caja(1.9,.2,.9,M({color:'#e8e2f2',roughness:.95}),3.95,.68,-2.6);
   const edr=caja(1.6,.07,.96,ed,3.75,.8,-2.6);edr.rotation.z=.02;[-1,1].forEach(sd=>caja(1.6,.3,.02,ed,3.75,.65,-2.6+sd*.49));
   const pz=new T.Mesh(new T.SphereGeometry(1,16,12),M({color:'#d9c4ff',roughness:.9}));pz.scale.set(.16,.07,.3);pz.position.set(4.55,.86,-2.6);S.add(pz)}
  {const [c,g]=lienzo(512,512);g.fillStyle='#e7a3c4';g.fillRect(0,0,512,512);for(let i=0;i<9000;i++){g.strokeStyle=`rgba(${rnd(220,255)},${rnd(150,190)},${rnd(190,220)},.5)`;g.beginPath();const x=rnd(0,512),y=rnd(0,512);g.moveTo(x,y);g.lineTo(x+rnd(-4,4),y+rnd(-4,4));g.stroke()}
   const a=new T.Mesh(new T.CircleGeometry(.85,48),M({map:new T.CanvasTexture(c),roughness:1}));a.rotation.x=-P2;a.position.set(2.9,.306,-4.0);a.receiveShadow=true;S.add(a)}
  {const mad2=pbr('wood_floor_worn',[1,.5],{color:'#e8dccb'});caja(1.2,.04,.55,mad2,2.7,1.06,-.5);[[-.55,-.22],[.55,-.22],[-.55,.22],[.55,.22]].forEach(([x,z])=>caja(.04,.74,.04,mad2,2.7+x,.68,-.5+z));
   }
  {const pts=[];for(let i=0;i<=24;i++){const k=i/24;pts.push(V(1.25+k*3.45,2.95-Math.sin(k*Math.PI)*.35,-8.03))}
   S.add(new T.Line(new T.BufferGeometry().setFromPoints(pts),new T.LineBasicMaterial({color:'#222'})));
   const bm=new T.MeshBasicMaterial({color:'#ffe0a8'});pts.forEach((p2,i)=>{if(i%2)return;const b=new T.Mesh(new T.SphereGeometry(.018,8,6),bm);b.position.copy(p2).add(V(0,-.03,.01));S.add(b)});
   }
  // estante con libros y cactus
  const est=new T.Group();const mad=M({color:'#2a1a0e',roughness:.8});
  [0,.45,.9,1.35].forEach(y=>caja(1.3,.04,.32,mad,0,y,0,0,est));[-.65,.65].forEach(x=>caja(.04,1.4,.32,mad,x,.68,0,0,est));
  const colores=['#5a1e1e','#2c3a4a','#4a3a20','#203a2c','#3a2a3a','#6a5030','#1e2a3a'];
  [.02,.47].forEach(y=>{let x=-.6;while(x<.55){const w=rnd(.04,.08),h=rnd(.26,.38);const lb=caja(w,h,.22,M({color:colores[Math.floor(rnd(0,colores.length))],roughness:.75}),x+w/2,y+h/2+.02,0,0,est);lb.rotation.z=rnd(-.05,.05);x+=w+.005}});
  for(let i=0;i<5;i++){const lb=caja(.24,.04,.17,M({color:colores[i],roughness:.75}),-.3+i*.14,.95+i*.0,0,0,est);lb.rotation.y=rnd(-.3,.3);lb.position.y=.94+i*.0}
  est.visible=false;
  cactus(3.6,-7.4,1);cactus(-4.2,-7.5,.85);cactus(4.2,-.9,1.1);

  abandono();
  // ----- la mesa y el regalo -----
  const mesa=new T.Group();const nogal=M({color:'#3a2414',roughness:.5});
  const tope=new T.Mesh(new T.CylinderGeometry(.62,.62,.05,48),nogal);tope.position.y=.78;mesa.add(tope);
  const pie=new T.Mesh(new T.LatheGeometry([new T.Vector2(.3,0),new T.Vector2(.28,.04),new T.Vector2(.08,.08),new T.Vector2(.05,.3),new T.Vector2(.07,.5),new T.Vector2(.05,.74),new T.Vector2(.12,.76)],24),nogal);mesa.add(pie);

  if(BAJO){const madT=pbr('wood_floor_worn',[1,1],{color:'#7a4a2a',roughness:.6});tope.material=madT;tope.position.y=.73;pie.scale.y=.73/.78;pie.material=new T.MeshStandardMaterial({color:'#3a2414',roughness:.55});
    mesa.position.set(0,.3,-7.0);S.add(sombra(mesa))}
  const regalo=new T.Object3D();regalo.position.set(0,1.25,-7.0);S.add(regalo);
  focoMesa=new T.SpotLight('#ffd9a8',0,7,.7,.75,2);focoMesa.position.set(-.18,2.08,-6.95);focoMesa.target=regalo;focoMesa.castShadow=true;focoMesa.shadow.mapSize.set(512,512);focoMesa.shadow.bias=-.0004;S.add(focoMesa);


  crearRegalo3D();
  lampCono={material:{uniforms:{uOp:{value:0}}}};
  lampBulbo=new T.Mesh(new T.SphereGeometry(.04,16,12),new T.MeshBasicMaterial({color:'#fff1d6'}));lampBulbo.scale.y=1.3;lampBulbo.position.set(-.18,2.12,-6.95);S.add(lampBulbo);
  caja(.006,1.42,.006,M({color:'#111',roughness:.6}),-.18,2.88,-6.95);{const sk=new T.Mesh(new T.CylinderGeometry(.018,.022,.05,12),M({color:'#222',metalness:.6,roughness:.4}));sk.position.set(-.18,2.19,-6.95);S.add(sk)}
  {const h=new T.Sprite(new T.SpriteMaterial({map:brillo('rgba(255,215,160,1)'),depthWrite:false,blending:T.AdditiveBlending,transparent:true}));h.scale.set(.5,.5,1);lampBulbo.add(h);lampBulbo.userData.halo=h}
  const rebote={intensity:0};lampBulbo.userData.rebote=rebote;

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

  linterna=new T.SpotLight('#fff0d8',3.2,16,.38,.5,1.4);linterna.castShadow=true;linterna.shadow.mapSize.set(256,256);linterna.shadow.bias=-.0005;linterna.shadow.camera.near=.1;
  S.add(linterna);S.add(linterna.target);
  if(!BAJO&&T.EffectComposer&&T.UnrealBloomPass&&T.ShaderPass){try{
    comp=new T.EffectComposer(R);comp.addPass(new T.RenderPass(S,C));comp.addPass(new T.UnrealBloomPass(new T.Vector2(W()/2,H()/2),.55,.45,.9));if(comp.setPixelRatio)comp.setPixelRatio(pr);
    comp.addPass(new T.ShaderPass({uniforms:{tDiffuse:{value:null},uT:{value:0},uF:{value:0}},
      vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader:`uniform sampler2D tDiffuse;uniform float uT;uniform float uF;varying vec2 vUv;
        float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233))+uT)*43758.5453);}
        vec3 srgb(vec3 c){return mix(c*12.92,1.055*pow(c,vec3(1./2.4))-.055,step(.0031308,c));}
        void main(){vec3 c=texture2D(tDiffuse,vUv).rgb;c=srgb(max(c,0.));float d=distance(vUv,vec2(.5));c*=smoothstep(.85,.32,d);c+=(h(vUv*800.)-.5)*.045;c*=1.-uF;gl_FragColor=vec4(c,1.);}`}));
    comp.passes[2].renderToScreen=true;R.outputEncoding=T.LinearEncoding}catch(e){console.warn(e);comp=null;R.outputEncoding=T.sRGBEncoding}}
  // modelos fotográficos de Poly Haven (CC0)
  {if(T.GLTFLoader&&!BAJO){const gl=new T.GLTFLoader(LM);
    const MC={},mod=(n,f)=>{if(MC[n]){MC[n].push(f);return}MC[n]=[f];gl.load('pbr/m/'+n+'/'+n+'.gltf',g=>{const o=g.scene;o.traverse(m=>{if(m.isMesh){m.castShadow=m.receiveShadow=true;if(m.material)m.material.envMapIntensity=.35}});MC[n].forEach((cb,i)=>cb(i?o.clone():o))})};
    const P2=Math.PI/2;const pon=(o,x,y,z,ry=0,e=1)=>{o.position.set(x,y,z);o.rotation.y=ry;o.scale.setScalar(e);S.add(o);return o};
    mod('round_wooden_table_01',o=>pon(o,0,.3,-7.0,0,.75));
    
    mod('old_bed_frame',o=>pon(o,-3.82,.3,-4.6,Math.PI/2,1.05));
    mod('painted_wooden_nightstand',o=>pon(o,-4.45,.3,-5.95,Math.PI/2,1));
    mod('vintage_oil_lamp',o=>pon(o,-4.45,.92,-5.95,0,.42));
    mod('wooden_bookshelf_worn',o=>pon(o,2.8,.3,-7.78,0,1));
    mod('Rockingchair_01',o=>pon(o,-3.7,.3,-1.0,2.4,1));
    mod('vintage_cabinet_01',o=>pon(o,-3.3,.3+.34*.85,-7.72,0,.85));
    mod('ornate_mirror_01',o=>pon(o,-1.6,1.95,-8.05,0,1));
    mod('old_bed_frame',o=>pon(o,3.82,.3,-2.6,-Math.PI/2,1.05));
    mod('throw_pillows_01',o=>pon(o,4.5,.95,-2.35,-P2+.2,1));
    mod('classic_laptop',o=>pon(o,2.7,1.08,-.55,Math.PI,.8));
    mod('standing_picture_frame_01',o=>pon(o,3.15,1.08,-.45,Math.PI+.3,1));
    mod('potted_plant_02',o=>pon(o,4.3,.3,-7.5,0,1.1));
    mod('vintage_cabinet_01',o=>pon(o,4.5,.3+.34*.85,-5.25,-P2,.85));mod('wooden_bookshelf_worn',o=>pon(o,-4.55,.3,-3.0,P2,1));mod('desk_lamp_arm_01',o=>pon(o,2.3,1.08,-.55,2.6,1));mod('Rockingchair_01',o=>pon(o,4.1,.3,-6.6,-2.3,1));
    mod('alarm_clock_01',o=>pon(o,40.47,-19.97+.07,39.98,-.5,1));
    mod('desk_lamp_arm_01',o=>pon(o,39.45,-19.97+.09,39.68,.9,1));
    mod('vintage_flashlight',o=>{const a=o.clone();a.scale.setScalar(.75);a.rotation.y=P2;linMesa.add(a);linMesa.children.forEach(c=>{if(c!==a)c.visible=false});
      const b=o.clone();b.scale.setScalar(.5);b.rotation.y=Math.PI;b.position.set(0,-.03,.02);linternaObj.add(b);linternaObj.children.forEach(c=>{if(c!==b)c.visible=false})});
    mod('planter_pot_clay',o=>{macetas.forEach(g=>{const c=o.clone();c.scale.setScalar(1.15);g.add(c)})});
    mod('dead_tree_trunk',o=>pon(o,-3.2,0,7.5,.6,1.2));
    mod('tree_stump_01',o=>pon(o,3.4,0,8.8,0,1));
    mod('rock_moss_set_01',o=>pon(o,-7.2,0,2.5,1,1));
    mod('fern_02',o=>{[[-1.4,4.5],[1.6,5.8],[-2.6,2.6],[2.7,2.9],[-.9,9],[6,4],[-6,6]].forEach(([x,z],i)=>{const c=o.clone();pon(c,x,0,z,i*1.3,rnd(.8,1.3))})});
  }}
  if(T.RGBELoader&&!BAJO){new T.RGBELoader(LM).setDataType(T.UnsignedByteType).load('pbr/noche.hdr',h=>{const pm=new T.PMREMGenerator(R);S.environment=pm.fromEquirectangular(h).texture;
    const cubo=new T.WebGLCubeRenderTarget(1024).fromEquirectangularTexture(R,h);S.background=cubo.texture;cieloM.visible=false;h.dispose();pm.dispose()})}
  reloj=new T.Clock();
  addEventListener('resize',()=>{aplicaPR();C.aspect=W()/H();C.fov=W()<H()?76:60;C.updateProjectionMatrix()});
  listo=true;
}

/* ---------- precalentar la escena completa en un buffer oculto ---------- */
function calentar(){
  // compila todos los materiales y sube todas las texturas a la GPU de una vez, para que nada se trabe al entrar a un cuarto
  try{R.compile(S,C)}catch(e){}
  if(R.initTexture){const vistas=new Set();S.traverse(o=>{const ms=o.material?(Array.isArray(o.material)?o.material:[o.material]):[];ms.forEach(m=>['map','normalMap','roughnessMap','metalnessMap','emissiveMap','alphaMap','bumpMap','aoMap'].forEach(k=>{const t=m[k];if(t&&!vistas.has(t)&&t.image){vistas.add(t);try{R.initTexture(t)}catch(e){}}}))})}const rt=new T.WebGLRenderTarget(256,160);const vistas=MOVIL?[
  [[-1.3,1.6,11.2],[0,1.7,0]],[[.15,1.9,.8],[.3,1.3,0]],[[0,1.9,-.5],[0,1.6,-6]]]:[
  [[-1.3,1.6,11.2],[0,1.7,0]],[[.15,1.9,.8],[.3,1.3,0]],[[0,1.9,-.5],[0,1.6,-6]],
  [[-.8,1.9,-3.5],[-4,1.2,-4.6]],[[.2,1.9,-5.1],[4,1.6,-4]]];
  const p0=C.position.clone(),q0=C.quaternion.clone();focoMesa.intensity=.01;flashL.intensity=.01;
  vistas.slice(0,1).forEach(([a,b])=>{C.position.set(...a);C.lookAt(...b);C.updateMatrixWorld();R.setRenderTarget(rt);R.render(S,C)});
  R.setRenderTarget(null);rt.dispose();C.position.copy(p0);C.quaternion.copy(q0);focoMesa.intensity=0;flashL.intensity=0}

/* ---------- recorrido ---------- */
const V=(x,y,z)=>new T.Vector3(x,y,z);
const RUTA=[
  [0,   V(40.01,-19.4,40.26), V(40.01,-19.96,39.98), 0],   // el escritorio (pantalla de carga)
  [1.3, V(40.01,-19.4,40.26), V(40.0,-19.96,40.02),  0],   // la mano toma la linterna
  [2.3, V(40.06,-19.72,40.1), V(40.07,-19.96,39.985),0],   // se acerca a la lista mientras se oscurece
  [2.6, V(-1.25,1.6,13.2), V(-.2,1.7,0),    0],   // afuera, al lado del auto (recién bajados): mirando la casa
  [3.7, V(-1.3,1.62,12.2), V(0,1.75,0),     1],
  [9.2, V(0,1.62,3.05),    V(.1,1.25,2.1),  1],   // hasta la cinta
  [10.0,V(0,1.62,3.05),    V(.1,1.3,2.1),   0],
  [11.3,V(.05,1.15,1.7),   V(.2,1.25,0),    1],   // por debajo de la cinta
  [12.4,V(.15,1.9,.8),     V(.3,1.3,0),     1],   // frente a la puerta
  [16.4,V(.15,1.9,.8),     V(.3,1.3,0),     0],
  [17.2,V(.05,1.9,.55),    V(0,1.6,-6),     0],   // el pasillo
  [19.6,V(0,1.9,-2.7),     V(0,1.55,-6),    1],
  [20.8,V(-.75,1.9,-3.5),  V(-4.8,2.35,-4.6),1],  // se asoma al cuarto del caso: la carita
  [22.8,V(-1.45,1.9,-3.7), V(-4.8,2.4,-4.6), 1],   // entra despacio, sin dejar de mirarla
  [24.4,V(-1.7,1.88,-3.75),V(-3.6,.95,-4.6), 0],   // baja la vista: la cama
  [26.0,V(-1.8,1.7,-4.2),  V(-4.35,.95,-4.6),0],   // se inclina sobre la cinta: la cabeza bajo la sábana
  [27.4,V(-1.78,1.72,-4.3),V(-3.85,.45,-4.1),0],   // la mano que cuelga y el charco
  [28.8,V(-1.75,1.8,-4.3), V(-2.6,.32,-4.8), 0],   // los marcadores de evidencia
  [30.2,V(-1.6,1.9,-3.1),  V(-2.4,1.95,-.2), 0],   // se da vuelta: el tablero
  [31.6,V(-1.6,1.9,-3.1),  V(-3.6,1.85,-.2), 0],   // recorre las fotos y el hilo rojo
  [32.8,V(-1.6,1.9,-3.2),  V(-4.8,1.9,-1.8), 0],   // la ventana tapiada
  [34.0,V(-.5,1.9,-3.7),   V(-.2,1.6,-7.5),  1],   // vuelve al pasillo
  [35.0,V(.15,1.9,-5.1),   V(4.8,2.1,-5.1),  1],   // el cuarto de BTS
  [36.6,V(1.55,1.85,-5.0), V(4.8,2.0,-6.6),  1],   // entra: los pósters y el ropero
  [38.0,V(1.6,1.8,-4.6),   V(4.1,.95,-2.6),  0],   // la cama con los peluches
  [39.4,V(1.7,1.85,-3.6),  V(2.7,1.95,-.2),  0],   // el escritorio y las fotos de ella en el cordel
  [40.8,V(1.6,1.85,-3.8),  V(2.8,1.5,-7.7),  0],   // el estante con los álbumes
  [42.0,V(.2,1.9,-5.1),    V(0,1.4,-7.0),    1],   // sale al pasillo
  [43.0,V(0,1.9,-5.0),     V(0,1.3,-7.0),    0],   // al fondo del pasillo: el regalo
  [44.4,V(0,1.9,-5.0),     V(0,1.35,-7.0),   0],
  [47.0,V(0,1.72,-6.0),    V(0,1.25,-7.0),   1],
  [48.0,V(0,1.72,-6.0),    V(0,1.25,-7.0),   0],
];
const FIN=51.4;
const suave=x=>x*x*(3-2*x);
let fase=0;
const cr=(p0,p1,p2,p3,u)=>{const u2=u*u,u3=u2*u;return V(
  .5*((2*p1.x)+(-p0.x+p2.x)*u+(2*p0.x-5*p1.x+4*p2.x-p3.x)*u2+(-p0.x+3*p1.x-3*p2.x+p3.x)*u3),
  .5*((2*p1.y)+(-p0.y+p2.y)*u+(2*p0.y-5*p1.y+4*p2.y-p3.y)*u2+(-p0.y+3*p1.y-3*p2.y+p3.y)*u3),
  .5*((2*p1.z)+(-p0.z+p2.z)*u+(2*p0.z-5*p1.z+4*p2.z-p3.z)*u2+(-p0.z+3*p1.z-3*p2.z+p3.z)*u3))};
const ruido1=t=>Math.sin(t*1.31)*.5+Math.sin(t*2.73+1.3)*.3+Math.sin(t*.71+2.1)*.2;
let mirada=null,paso=0;
const sat=x=>Math.max(0,Math.min(1,x));
function camara(t,dt){
  if(zoomK>=0){if(!zIni){zIni=C.position.clone();zMir=mirada.clone()}
    const k=suave(Math.min(1,zoomK)),asp=W()/H(),fA=MOVIL?Math.min(1.2,Math.max(1,.62/asp)):Math.min(1.55,Math.max(1,.8/asp)),lzT=V(-.045-.05*(fA-1),1.165,-7.0),pzT=lzT.clone().add(V(.01,.085+.03*(fA-1),.57).multiplyScalar(fA)),pz=zIni.clone().lerp(pzT,k),lz=zMir.clone().lerp(lzT,k);
    const b=Math.sin(k*Math.PI*2)*.02*(1-k);const ab=R3&&R3.ab>0?R3.ab:0,atras=Math.sin(Math.min(1,ab/2.2)*Math.PI)*.06,em=suave(Math.min(1,Math.max(0,ab-1.9)/1.8))*.06,sube=suave(Math.min(1,Math.max(0,ab-2.2)/1.6));C.position.set(pz.x+b*.6+.02*Math.min(1,ab/2),pz.y-Math.abs(b)+atras*.5+em*.5,pz.z+atras-em);C.position.y+=sube*.08;C.position.z+=sube*.12;const mira0=V(lz.x+.02*Math.min(1,ab/2),lz.y+em*.9+atras*.3+sube*.3,lz.z);
    if(R3&&ab>6.0){const tp=R3.carta.getWorldPosition(V(0,0,0)),vis=2*Math.tan(C.fov*Math.PI/360),d=Math.max(.29/(.78*vis),CW_/(.88*vis*C.aspect)),ka=suave(Math.min(1,Math.max(0,ab-6.0)/1.8)),kf=suave(Math.min(1,Math.max(0,ab-9.0)/1.2));
      const dd=d*(1-kf*.86),man=.004*(1-kf);C.position.lerp(tp.clone().add(V(Math.sin(ab*.8)*man,.004+Math.sin(ab*1.1)*man,dd)),ka);C.lookAt(mira0.lerp(tp,ka));C.rotateZ(-.03*kf);return}
    C.lookAt(mira0);return}
  let i=0;while(i<RUTA.length-2&&t>RUTA[i+1][0])i++;
  const g=k=>RUTA[Math.max(0,Math.min(RUTA.length-1,k))];
  const [ta,pa]=g(i),[tb,pb,,camina]=g(i+1);
  let u=Math.min(1,Math.max(0,(t-ta)/(tb-ta)));
  const quieto=pa.equals(pb);
  // los tramos quietos usan suavizado; los de caminar avanzan parejo, sin frenar en cada punto
  const uu=quieto?suave(u):u*.75+suave(u)*.25;
  const p=quieto?pa.clone():(t<2.55?pa.clone().lerp(pb,uu):cr(g(i-1)[1],pa,pb,g(i+2)[1],uu));
  const l=t<2.55?g(i)[2].clone().lerp(g(i+1)[2],suave(u)):cr(g(i-1)[2],g(i)[2],g(i+1)[2],g(i+2)[2],suave(u));
  // la mirada gira con inercia, como una cabeza
  if(!mirada||dt===0||(t>=2.5&&!camara.salto)){mirada=l.clone();if(t>=2.5)camara.salto=true}else mirada.lerp(l,1-Math.exp(-dt*3.2));
  const andando=camina&&u>.01&&u<.99&&!quieto;
  const ritmo=andando?1:0;paso+=(ritmo-paso)*Math.min(1,dt*3);
  if(andando){fase+=dt*Math.PI*2*1.75;const sn=Math.sin(fase);if(sn<-.97&&!camara.pisado){camara.pisado=true;pisada()}if(sn>0)camara.pisado=false}
  // paso: dos bajadas por zancada, balanceo lateral una vez; respiración cuando está quieto
  const resp=Math.sin(t*1.7)*.006,fin=t>=FIN-.6,fin2=zoomK>=0;
  const bobY=(Math.cos(fase*2)*.5+.5)*.032*paso,bobX=Math.sin(fase)*.022*paso;
  const n=fin?0:1;
  C.position.set(p.x+bobX+ruido1(t*.9)*.006*n,p.y-bobY+resp*n,p.z+ruido1(t*.7+5)*.004*n);
  C.lookAt(mirada.x+ruido1(t*1.1+2)*.018*n,mirada.y+ruido1(t*.9+7)*.012*n+bobY*.25,mirada.z);
  if(!fin)C.rotateZ(Math.sin(fase)*.009*paso+ruido1(t*.5+3)*.006);
  const baja=Math.max(0,Math.min(1,(t-(FIN-1.4))/1.2))*.3;
  const mY=-bobY*.35+Math.sin(t*2.1)*.003*n-baja;manoL.position.y=-.15+mY;linternaObj.position.y=-.135+mY;
  {const d2=new T.Vector3();C.getWorldDirection(d2);const yaw=Math.atan2(d2.x,d2.z),pit=Math.asin(Math.max(-1,Math.min(1,d2.y)));
   let dy=yaw-(camara.yaw??yaw);if(dy>Math.PI)dy-=Math.PI*2;if(dy<-Math.PI)dy+=Math.PI*2;const dp=pit-(camara.pit??pit);camara.yaw=yaw;camara.pit=pit;
   camara.sx=(camara.sx||0)*Math.exp(-dt*5)+(dt>0?-dy*1.6:0);camara.sy=(camara.sy||0)*Math.exp(-dt*5)+(dt>0?-dp*1.2:0);
   const sx=Math.max(-.08,Math.min(.08,camara.sx)),sy=Math.max(-.06,Math.min(.06,camara.sy));
   manoL.position.x=-.13+sx+bobX*.3;linternaObj.position.x=-.12+sx+bobX*.3;manoL.position.y+=sy;linternaObj.position.y+=sy;
   linternaObj.rotation.y=.1+sx*1.5;manoL.rotation.z=1.35+sx*.8;linternaObj.rotation.x=.08;linternaObj.rotation.z=0;linternaObj.scale.setScalar(1);manoL.position.z=-.3;linternaObj.position.z=-.33;manoL.rotation.x=.15;manoL.rotation.y=.12}
  if(t>=3.3&&t<4.1){const k=suave(sat((t-3.3)/.8));manoL.position.y-=(1-k)*.32;linternaObj.position.y-=(1-k)*.32;manoL.position.x-=(1-k)*.06;linternaObj.position.x-=(1-k)*.06}
  const enMesa=t<3.3;manoL.visible=linternaObj.visible=!enMesa&&!fin2;linterna.intensity=t<3.75?0:(apagonT<0?3.2:linterna.intensity);
  const cab=linternaObj.localToWorld(V(0,0,-.13));linterna.position.copy(cab);
  const dir=new T.Vector3();C.getWorldDirection(dir);
  linterna.target.position.lerp(C.position.clone().add(dir.multiplyScalar(6)),dt>0?Math.min(1,dt*4):1);
}

/* ---------- sonido ---------- */
let pisada=()=>{},sonar=()=>{};

/* ---------- línea de tiempo ---------- */
let apagonT=-1,zoomCam=false,puertaObj=0,puertaVel=1,manoEst='fuera',manoK=0,giro=0,focoT=-1,manoA='pomo',autoObj=0,cintaObj=0;
function linea(){
  ev.length=0;const e=(t,f)=>ev.push({t,f,hecho:false});
  e(.05,()=>{sonar('lluvia',1);sonar('respira')});
  e(1.95,()=>fadeObj=1);
  e(2.55,()=>{fadeObj=0;lampEsc.intensity=0;sonar('hoja')});
  e(.06,()=>sonar('escena','escritorio'));e(2.6,()=>sonar('escena','afuera'));
  e(2.9,()=>{sonar('portazo');sonar('sirena',1)});e(3.75,()=>sonar('pestillo'));e(9.0,()=>sonar('sirena',0));e(3.4,()=>sonar('radio'));
  e(9.4,()=>{manoA='cinta';manoEst='sube'});
  e(9.9,()=>{manoEst='agarra';cintaObj=1});
  e(11.4,()=>{cintaObj=0;manoEst='baja'});
  e(12.7,()=>{manoA='pomo';manoEst='sube'});
  e(13.9,()=>{manoEst='agarra';sonar('pestillo')});
  e(14.4,()=>{puertaObj=.4;puertaVel=1.2;sonar('rechina',.5)});
  e(15.8,()=>{puertaObj=1.75;puertaVel=1;sonar('rechina',1)});
  e(16.0,()=>manoEst='baja');
  e(17.3,()=>{sonar('lluvia',.35);sonar('escena','pasillo')});
  e(20.9,()=>{sonar('susto',.5);sonar('escena','caso')});
  e(22.6,()=>{flashT=0;sonar('flash')});e(26.4,()=>{flashT=0;sonar('flash')});
  e(34.4,()=>sonar('escena','bts'));
  e(43.1,()=>{focoT=0;sonar('descubre');sonar('escena','regalo')});
  e(48.2,()=>{apagonT=0;sonar('apagon');sonar('escena','nada')});
  e(51.0,()=>sonar('alivio'));
}
function pintaManoR(dt){
  const obj=manoEst==='sube'||manoEst==='agarra'||manoEst==='levanta'?1:0;
  manoK+=(obj-manoK)*Math.min(1,dt*(manoEst==='baja'?4:2.2));
  manoR.visible=manoK>.01;if(!manoR.visible)return;
  const pomo=manoA==='lint'?linMesa.getWorldPosition(V(0,0,0)):manoA==='pomo'?puerta.userData.pomo.getWorldPosition(V(0,0,0)):cintaP.localToWorld(V(.12,-.1,0));
  const reposo=C.localToWorld(V(.32,-.38,-.2));
  let meta=pomo.clone().add(manoA==='pomo'?V(.075,-.03,.075):manoA==='lint'?V(.03,.05,.05):V(.05,-.04,.06));
  if(manoA==='lint'&&manoEst==='levanta')meta=C.localToWorld(V(-.02,-.1,-.3));
  manoR.position.copy(reposo.lerp(meta,suave(manoK)));
  manoR.quaternion.copy(C.quaternion);
  const g=manoEst==='agarra'?1:manoEst==='baja'?giro:0;giro+=(g-giro)*Math.min(1,dt*6);
  manoR.rotateY(.55);manoR.rotateX(.45);manoR.rotateZ(-1.35-giro*.6);
  manoR.userData.cierra(.25+(manoEst==='agarra'?.75:0)*Math.min(1,manoK));
  if(manoA==='lint'&&(manoEst==='agarra'||manoEst==='levanta')){const d=manoR.localToWorld(V(0,-.025,-.06));linMesa.parent.worldToLocal(d);linMesa.position.lerp(d,manoEst==='levanta'?1:Math.min(1,dt*8));linMesa.rotation.y+=(0-linMesa.rotation.y)*Math.min(1,dt*5)}
  if(manoA==='pomo'&&manoEst==='agarra'&&puertaObj>0)manoR.position.add(V(-.18*Math.min(1,puerta.rotation.y/.4),0,-.05*Math.min(1,puerta.rotation.y/.4)));
}

/* ---------- bucle ---------- */
let pendiente=0,apagV=1,parpT=0,parpF=1,parpN=1,impar=false,pr=1,prMax=1,dynT=0,dynN=0,dynBien=0,cuadros=0;
const SIR=['#2a5bff','#ff2020','#300','#ff1a1a','#012'].map(c=>new T.Color(c));let sirPh=-1,firmaAnt=NaN,sombraPend=true;
function firmaSombra(){const p=C.position,q=C.quaternion;let f=p.x+p.y*3.1+p.z*7.3+q.x*11.7+q.y*13.9+q.z*17.3+q.w*5.9+puerta.rotation.y*19.1+autoPuerta.rotation.y*23.3+cintaP.position.y*29.9+cintaP.rotation.x*31.7;
  if(R3){R3.ruedas.forEach((r,i)=>f+=r.ang*(37.1+i));if(R3.tapa)f+=R3.tapa.position.y*41.3+R3.tapa.rotation.x*43.7+R3.tapa.rotation.z*47.9}return f}
function aplicaPR(){R.setPixelRatio(pr);R.setSize(W(),H());if(comp){if(comp.setPixelRatio)comp.setPixelRatio(pr);comp.setSize(W(),H())}}
function cuadroLoop(){
  if(!listo)return;requestAnimationFrame(cuadroLoop);
  const crudo=reloj.getDelta()+pendiente,dt=Math.min(crudo,.05);pendiente=0;cuadros++;
  // resolución dinámica: mantiene margen para que la cámara y la interacción no se traben
  if(MOVIL&&R3&&R3.ab<0&&zoomK>=1&&document.visibilityState==='visible'&&(impar=!impar)){pendiente=crudo;return}
  if(document.visibilityState==='visible'){dynT+=crudo;dynN++;if(dynT>1.2){const fps=dynN/dynT;dynT=0;dynN=0;
    // en el escritorio (antes de entrar) la escena está quieta: se prioriza que las notas se lean, no los cuadros por segundo
    const piso=corriendo?.5:Math.min(prMax,.9);
    if(fps<54&&pr>piso){pr=Math.max(piso,+(pr-.15).toFixed(2));dynBien=0;aplicaPR()}else if(fps<34&&pr<=.5&&comp&&comp.passes[1].enabled){comp.passes[1].enabled=false}else if(fps>58&&pr<prMax){if(++dynBien>2){pr=Math.min(prMax,+(pr+.1).toFixed(2));dynBien=0;aplicaPR()}}else dynBien=0}}
  if(corriendo)tAcum+=dt;const t=corriendo?tAcum:0;
  camara(Math.min(t,FIN),corriendo?dt:0);
  if(corriendo)ev.forEach(x=>{if(!x.hecho&&t>=x.t){x.hecho=true;x.f()}});
  puerta.rotation.y+=(puertaObj-puerta.rotation.y)*Math.min(1,dt*puertaVel*2.2);
  pintaManoR(dt);regalo3DFrame(dt);
  autoPuerta.rotation.y+=(autoObj-autoPuerta.rotation.y)*Math.min(1,dt*(autoObj?1.8:5));
  {const ph=Math.floor(performance.now()/280)%4,on=C.position.y<-5?0:C.position.z>.3?1.4:.35;sirena[0].intensity=2.4*on;sirena[1].intensity=(ph===1||ph===3?2.6:0)*on;if(ph!==sirPh){sirPh=ph;sirena[0].color.copy(ph%2?SIR[0]:SIR[1]);sirena[2].material.color.copy(ph%2?SIR[2]:SIR[3]);sirena[3].material.color.copy(ph%2?SIR[0]:SIR[4])}}
  cintaP.position.y+=((cintaObj?1.62:1.18)-cintaP.position.y)*Math.min(1,dt*4);cintaP.rotation.x+=((cintaObj?-.5:0)-cintaP.rotation.x)*Math.min(1,dt*4);
  {lluvia.visible=!LIGERO&&zonaActual!=='adentro'&&C.position.z>-.2;if(lluvia.visible){const a=lluvia.geometry.attributes.position,arr=a.array,cz=C.position.z;for(let i=0;i<arr.length;i+=6){arr[i+1]-=dt*9;arr[i+4]-=dt*9;if(arr[i+4]<0){const y=rnd(7,9);arr[i+1]=y;arr[i+4]=y-.32;const z=cz+rnd(-8,14);arr[i+2]=z;arr[i+5]=z}}a.needsUpdate=true}}
  if(apagonT>=0){apagonT+=dt;const seq=[[0,1],[.12,.15],[.22,1],[.42,.05],[.52,.7],[.68,0],[2.3,.5],[2.38,0],[2.52,1]];let v=1;for(const [tt,vv] of seq)if(apagonT>=tt)v=vv;
    apagV=v;linterna.intensity=apagonT<.68?3.2*v:0;if(apagonT>.8){if(zoomK<0){zoomK=0;manoL.visible=linternaObj.visible=false}zoomK=Math.min(1,(apagonT-.8)/1.3);if(zoomK>.3&&!camara.p1){camara.p1=1;pisada()}if(zoomK>.75&&!camara.p2){camara.p2=1;pisada()}}}
  if(flashT>=0){flashT+=dt;flashL.intensity=flashT<.08?9:flashT<.16?0:flashT<.24?6:0;if(flashT>.3){flashT=-1;flashL.intensity=0}}

  parpadeo.forEach(([v,b],i)=>{const f=.78+Math.sin(performance.now()*.011+i*2)*.12+rnd(-.12,.12);if(v.isLight)v.intensity=b*f;else if(v.material)v.material.opacity=b*f});
  {let v=0;if(focoT>=0){focoT+=dt;const seq=[[0,1],[.12,0],[.2,1],[.32,.1],[.42,1],[.55,.3],[.65,1]];v=1;for(const [tt,vv] of seq)if(focoT>=tt)v=vv}
   // parpadeo de misterio: casi siempre estable, cada tanto un bajón corto
   if(parpT>0){parpT-=dt;parpF+=(parpN-parpF)*Math.min(1,dt*30)}else{parpF+=(1-rnd(0,.06)-parpF)*Math.min(1,dt*20);if(Math.random()<dt*.45){parpT=rnd(.05,.3);parpN=rnd(.1,.55)}}
   const vv=v*apagV*parpF;focoMesa.intensity=vv*2.4;if(lampBulbo){lampBulbo.material.color.setScalar(.12+.88*vv);lampBulbo.userData.halo.material.opacity=vv;lampBulbo.userData.rebote.intensity=vv*.5}}
  polvo.rotation.y+=dt*.008;
  if(cargado)zonas();
  {const f=firmaSombra();if(Math.abs(f-firmaAnt)>1e-6||(R3&&R3.ab>=0)||(corriendo&&linterna.intensity>0))sombraPend=true;firmaAnt=f;
   if(!cargado||(sombraPend&&cuadros%2===0)||cuadros%90===0){R.shadowMap.needsUpdate=true;sombraPend=false}}
  if(comp){fadeVal+=(fadeObj-fadeVal)*Math.min(1,dt*(fadeObj?9:6));comp.passes[2].uniforms.uT.value=performance.now()%1000;comp.passes[2].uniforms.uF.value=fadeVal;comp.render()}else R.render(S,C);
  if(corriendo&&t>=FIN&&alTerminar){const f=alTerminar;alTerminar=null;f()}
}

/* =====================================================================
   El regalo en 3D: caja con papel y listón de satín, moño, etiqueta kraft
   y un candado de latón con cuatro ruedas de letras que giran de verdad.
   Se integra a intro3d.js (usa T, S, C, W, H, V, lienzo, grano, sombra).
   ===================================================================== */
const CW_=.2;let R3=null;const reducido3D=matchMedia('(prefers-reduced-motion: reduce)').matches;   // estado del regalo 3D
function normalDe(c,fuerza=2){const w=c.width,h=c.height,g=c.getContext('2d'),src=g.getImageData(0,0,w,h).data;const [nc,ng]=lienzo(w,h);const out=ng.createImageData(w,h),o=out.data;
  const L=(x,y)=>src[(((y+h)%h)*w+((x+w)%w))*4]/255;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const dx=(L(x+1,y)-L(x-1,y))*fuerza,dy=(L(x,y+1)-L(x,y-1))*fuerza,i=(y*w+x)*4,l=Math.hypot(dx,dy,1);o[i]=(-dx/l*.5+.5)*255;o[i+1]=(dy/l*.5+.5)*255;o[i+2]=(1/l*.5+.5)*255;o[i+3]=255}
  ng.putImageData(out,0,0);const t=new T.CanvasTexture(nc);t.wrapS=t.wrapT=T.RepeatWrapping;return t}
let _laton=null;const laton0=()=>_laton||(_laton=new T.MeshStandardMaterial({color:'#c9a050',metalness:.9,roughness:.35}));
function crearRegalo3D(){
  const ABC='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const G=new T.Group();G.position.set(0,1.055,-7.0);G.rotation.y=-.05;S.add(G);
  const RB=T.RoundedBoxGeometry||null;
  const cajaR=(w,h,d,r)=>RB?new RB(w,h,d,6,r):new T.BoxGeometry(w,h,d,8,8,8);
  // papel de regalo: rojo profundo con relieve fino y un monograma apenas marcado
  const [pc,pg]=lienzo(1024,1024);pg.fillStyle='#a8101e';pg.fillRect(0,0,1024,1024);
  for(let i=0;i<14000;i++){pg.fillStyle=`rgba(${Math.random()<.5?0:255},0,0,${Math.random()*.05})`;pg.fillRect(Math.random()*1024,Math.random()*1024,2,2)}
  pg.font='600 30px "JetBrains Mono", monospace';pg.fillStyle='rgba(60,0,8,.22)';for(let y=40;y<1024;y+=96)for(let x=(y/96%2)*80;x<1024;x+=160)pg.fillText('M·E·L·I',x,y);
  const pt=new T.CanvasTexture(pc);pt.encoding=T.sRGBEncoding;pt.anisotropy=8;
  // relieve del papel: fibras finas y pliegues suaves de haber envuelto la caja
  const [hc,hg]=lienzo(512,512);hg.fillStyle='#808080';hg.fillRect(0,0,512,512);
  for(let i=0;i<26000;i++){hg.fillStyle=`rgba(${Math.random()<.5?0:255},${Math.random()<.5?0:255},${Math.random()<.5?0:255},${Math.random()*.08})`;hg.fillRect(Math.random()*512,Math.random()*512,1+Math.random()*2,1)}
  hg.filter='blur(6px)';for(let i=0;i<14;i++){hg.strokeStyle=`rgba(${Math.random()<.5?40:220},${Math.random()<.5?40:220},${Math.random()<.5?40:220},.35)`;hg.lineWidth=2+Math.random()*5;hg.beginPath();const x=Math.random()*512,y=Math.random()*512;hg.moveTo(x,y);hg.lineTo(x+(Math.random()-.5)*400,y+(Math.random()-.5)*400);hg.stroke()}hg.filter='none';
  hg.font='600 15px "JetBrains Mono", monospace';hg.fillStyle='rgba(235,235,235,.75)';for(let y=20;y<512;y+=48)for(let x=(y/48%2)*40;x<512;x+=80)hg.fillText('M·E·L·I',x,y);
  hg.filter='blur(3px)';hg.strokeStyle='rgba(30,30,30,.5)';hg.lineWidth=4;[[0,6,512,10],[0,505,512,500],[7,0,4,512],[506,0,509,512]].forEach(([a,b,c,d])=>{hg.beginPath();hg.moveTo(a,b);hg.lineTo(c,d);hg.stroke()});hg.filter='none';
  const pn=normalDe(hc,4);pn.repeat.set(1,1);
  const papel=new T.MeshPhysicalMaterial({map:pt,normalMap:pn,normalScale:new T.Vector2(1.6,1.6),roughness:.62,metalness:0,clearcoat:.08,clearcoatRoughness:.6,envMapIntensity:.25});
  // trama del satén: hilos finos a lo largo de la cinta
  const [sc2,sg]=lienzo(256,256);sg.fillStyle='#808080';sg.fillRect(0,0,256,256);for(let y=0;y<256;y+=2){sg.fillStyle=`rgba(${y%4?255:0},${y%4?255:0},${y%4?255:0},.35)`;sg.fillRect(0,y,256,1)}
  for(let i=0;i<3000;i++){sg.fillStyle=`rgba(255,255,255,${Math.random()*.15})`;sg.fillRect(Math.random()*256,Math.random()*256,3,1)}
  const sn=normalDe(sc2,2.5);sn.repeat.set(6,6);
  const satin=new T.MeshPhysicalMaterial({color:'#a3a3ac',normalMap:sn,normalScale:new T.Vector2(.65,.65),roughness:.3,metalness:.12,clearcoat:.55,clearcoatRoughness:.18,envMapIntensity:.6});
  if('sheen' in satin)try{satin.sheen=new T.Color('#ffffff')}catch(e){}
  const W=.34,Hh=.25,D=.34,LH=.07,LW=.365;
  // sombreado de contacto pintado en los vértices: más oscuro abajo y en las aristas, como una caja real
  const ao=(geo,h,min)=>{const pa=geo.attributes.position,col=new Float32Array(pa.count*3);for(let i=0;i<pa.count;i++){const k=Math.min(1,Math.max(0,(pa.getY(i)+h/2)/h));const v=min+(1-min)*Math.pow(k,.7);col.set([v,v,v],i*3)}geo.setAttribute('color',new T.BufferAttribute(col,3));return geo};
  const papelAO=papel.clone();papelAO.vertexColors=true;
  const cuerpo=new T.Mesh(ao(cajaR(W,Hh,D,.018),Hh,.3),papelAO);cuerpo.position.y=Hh/2;G.add(cuerpo);
  // el hueco de la caja (se ve cuando sale la tapa) y su luz cálida
  const hueco=new T.Mesh(new T.PlaneGeometry(W-.03,D-.03),new T.MeshStandardMaterial({color:'#1a0204',emissive:'#ff9a40',emissiveIntensity:0,roughness:1}));hueco.rotation.x=-Math.PI/2;hueco.position.y=Hh+.0015;G.add(hueco);
  const luzDentro=new T.PointLight('#ffb060',0,1.6,2);luzDentro.position.y=Hh+.06;G.add(luzDentro);
  // listón alrededor del cuerpo
  const bandas=new T.Group();G.add(bandas);
  const b1=new T.Mesh(new T.BoxGeometry(W+.006,.034,D+.006),satin);b1.position.y=Hh*.5;bandas.add(b1);
  const b2=new T.Mesh(new T.BoxGeometry(.044,Hh+.004,D+.007),satin);b2.position.y=Hh/2;bandas.add(b2);
  // la tapa, con su banda, el moño y la etiqueta
  const tapa=new T.Group();tapa.position.y=Hh+LH/2-.012;G.add(tapa);
  tapa.add(new T.Mesh(ao(cajaR(LW,LH,LW,.02),LH,.62),papelAO));
  const b3=new T.Mesh(new T.BoxGeometry(.046,LH+.006,LW+.007),satin);tapa.add(b3);
  const b4=new T.Mesh(new T.BoxGeometry(LW+.007,LH+.006,.046),satin);tapa.add(b4);
  const lazo=(sx)=>{const pts=[[0,0,0],[.03*sx,.03,-.012],[.085*sx,.05,-.006],[.115*sx,.03,.004],[.1*sx,.008,.012],[.05*sx,.004,.006],[0,0,0]].map(([x,y,z])=>V(x,y,z));
    const tb=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts,true,'centripetal'),48,.013,10,true),satin);tb.scale.set(1,1,.55);return tb};
  const mono=new T.Group();mono.position.y=LH/2+.004;tapa.add(mono);
  mono.add(lazo(1),lazo(-1));const l3=lazo(1);l3.rotation.y=1.9;l3.scale.multiplyScalar(.85);mono.add(l3);const l4=lazo(-1);l4.rotation.y=-1.9;l4.scale.multiplyScalar(.85);mono.add(l4);
  const nudo=new T.Mesh(new T.SphereGeometry(.024,20,14),satin);nudo.scale.set(1,.7,1);nudo.position.y=.008;mono.add(nudo);
  [[.6,1],[-.5,-1]].forEach(([a,sx])=>{const pts=[[0,0,0],[.03*sx,-.004,.05],[.05*sx,-.03,.13],[.06*sx,-.075,.19]].map(([x,y,z])=>V(x,y,z));
    const c=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),24,.009,8,false),satin);c.scale.set(1.4,1,1);c.rotation.y=a*.4;mono.add(c)});
  // etiqueta kraft colgada del nudo
  const [tc,tg]=lienzo(256,360);tg.fillStyle='#d8c095';tg.fillRect(0,0,256,360);for(let i=0;i<2500;i++){tg.fillStyle=`rgba(90,60,20,${Math.random()*.12})`;tg.fillRect(Math.random()*256,Math.random()*360,2,2)}
  tg.beginPath();tg.arc(128,40,14,0,7);tg.fillStyle='#6b5530';tg.fill();tg.textAlign='center';tg.fillStyle='#3c2f1c';tg.font='500 28px "JetBrains Mono", monospace';tg.fillText('PARA',128,140);
  tg.fillStyle='#8e0c16';tg.font='700 40px "JetBrains Mono", monospace';tg.fillText('M.E.L.I.',128,200);tg.fillStyle='#5b4c37';tg.font='26px "Reenie Beanie", cursive';tg.fillText('como te tengo',128,262);tg.fillText('en WhatsApp',128,296);
  const tt=new T.CanvasTexture(tc);tt.encoding=T.sRGBEncoding;
  const [tc2,tg2]=lienzo(256,360);tg2.drawImage(tc,0,0);tg2.fillStyle='#d8c095';tg2.fillRect(0,100,256,260);tg2.textAlign='center';tg2.fillStyle='#8e0c16';tg2.font='700 30px "JetBrains Mono", monospace';tg2.fillText('PISTA',128,140);
  tg2.fillStyle='#2a2014';tg2.font='600 30px "JetBrains Mono", monospace';['Método de','Estimación','Lineal','Insesgado'].forEach((l,i)=>tg2.fillText(l,128,192+i*42));
  const tt2=new T.CanvasTexture(tc2);tt2.encoding=T.sRGBEncoding;
  // relieve del kraft: fibras y el borde prensado
  const [kc,kg]=lienzo(256,360);kg.fillStyle='#808080';kg.fillRect(0,0,256,360);for(let i=0;i<5000;i++){kg.fillStyle=`rgba(${Math.random()<.5?0:255},${Math.random()<.5?0:255},${Math.random()<.5?0:255},${Math.random()*.25})`;kg.fillRect(Math.random()*256,Math.random()*360,1+Math.random()*4,1)}
  kg.strokeStyle='rgba(20,20,20,.6)';kg.lineWidth=5;kg.strokeRect(10,10,236,340);const kn=normalDe(kc,3);
  const kSide=new T.MeshStandardMaterial({color:'#b89a68',roughness:.95});
  const etiqueta=new T.Group();
  const caraF=new T.Mesh(new T.BoxGeometry(.06,.085,.0016),[kSide,kSide,kSide,kSide,new T.MeshStandardMaterial({map:tt,normalMap:kn,normalScale:new T.Vector2(.6,.6),roughness:.9}),new T.MeshStandardMaterial({map:tt2,normalMap:kn,normalScale:new T.Vector2(.6,.6),roughness:.9})]);etiqueta.add(caraF);
  const ojal=new T.Mesh(new T.TorusGeometry(.0042,.0012,8,20),laton0());ojal.position.set(0,.085*(.5-40/360),.0009);etiqueta.add(ojal);const ojal2=ojal.clone();ojal2.position.z=-.0009;etiqueta.add(ojal2);
  const et=new T.Group();et.position.set(-.218,-.004,LW/2+.045);et.add(etiqueta);etiqueta.position.y=-.064;etiqueta.scale.setScalar(1.95);et.rotation.set(.04,.06,.05);tapa.add(et);
  {const pts=[V(0,LH/2+.01,0),V(-.08,LH/2+.014,.09),V(-.175,LH/2+.002,LW/2+.012),V(-.205,LH/2-.012,LW/2+.035),V(-.218,-.004,LW/2+.045)];const h=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),20,.0012,5,false),new T.MeshStandardMaterial({color:'#e8dcc0',roughness:.9}));tapa.add(h)}
  // candado de latón con cuatro ruedas
  // latón: rayones, pátina oscura en los bordes y "CBI" grabado
  const [lc,lg]=lienzo(512,512);lg.fillStyle='#808080';lg.fillRect(0,0,512,512);
  for(let i=0;i<260;i++){lg.strokeStyle=`rgba(${Math.random()<.5?30:230},${Math.random()<.5?30:230},${Math.random()<.5?30:230},${.2+Math.random()*.4})`;lg.lineWidth=.6+Math.random()*1.2;lg.beginPath();const x=Math.random()*512,y=Math.random()*512,a=Math.random()*6.28,l=10+Math.random()*80;lg.moveTo(x,y);lg.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l);lg.stroke()}
  lg.fillStyle='#202020';lg.font='900 70px Georgia, serif';lg.textAlign='center';lg.fillText('CBI',256,440);
  const ln=normalDe(lc,2.2);
  const [rc2,rg2]=lienzo(256,256);const gr2=rg2.createRadialGradient(128,128,40,128,128,180);gr2.addColorStop(0,'#5a5a5a');gr2.addColorStop(1,'#b0b0b0');rg2.fillStyle=gr2;rg2.fillRect(0,0,256,256);for(let i=0;i<800;i++){rg2.fillStyle=`rgba(255,255,255,${Math.random()*.2})`;rg2.fillRect(Math.random()*256,Math.random()*256,2,2)}
  const lr=new T.CanvasTexture(rc2);
  const [pc3,pg3]=lienzo(256,256);const gr3=pg3.createRadialGradient(128,128,60,128,128,180);gr3.addColorStop(0,'#e8c07a');gr3.addColorStop(1,'#8a6a32');pg3.fillStyle=gr3;pg3.fillRect(0,0,256,256);const lmap=new T.CanvasTexture(pc3);lmap.encoding=T.sRGBEncoding;
  const laton=new T.MeshPhysicalMaterial({map:lmap,normalMap:ln,normalScale:new T.Vector2(1,1),roughnessMap:lr,roughness:.85,metalness:.9,clearcoat:.35,clearcoatRoughness:.3,envMapIntensity:2.2,emissive:'#3a2808',emissiveIntensity:.1});
  const cand=new T.Group();cand.position.set(0,Hh*.42,D/2+.036);cand.scale.setScalar(1.8);cand.rotation.x=-.12;G.add(cand);
  cand.add(new T.Mesh(cajaR(.096,.078,.03,.009),laton));
  const arco=new T.Group();arco.position.y=.039;cand.add(arco);
  const tor=new T.Mesh(new T.TorusGeometry(.027,.0058,12,32,Math.PI),laton);tor.position.y=.04;arco.add(tor);
  [-.027,.027].forEach(x=>{const c=new T.Mesh(new T.CylinderGeometry(.0058,.0058,.04,12),laton);c.position.set(x,.02,0);arco.add(c)});
  const ven=new T.Mesh(new T.BoxGeometry(.078,.05,.008),new T.MeshStandardMaterial({color:'#120c06',roughness:.6}));ven.position.set(0,-.004,.013);cand.add(ven);
  // ruedas: una franja con las 26 letras alrededor del cilindro
  const [rc,rg]=lienzo(26*64,64);const grad=rg.createLinearGradient(0,0,0,64);grad.addColorStop(0,'#d9d2c2');grad.addColorStop(.5,'#f4efe2');grad.addColorStop(1,'#d9d2c2');rg.fillStyle=grad;rg.fillRect(0,0,26*64,64);
  rg.fillStyle='#120e09';rg.font='800 54px "JetBrains Mono", monospace';rg.textAlign='center';rg.textBaseline='middle';
  for(let i=0;i<26;i++){rg.save();rg.translate(i*64+32,32);rg.rotate(-Math.PI/2);rg.fillText(ABC[i],0,2);rg.restore();rg.fillStyle='rgba(0,0,0,.25)';rg.fillRect(i*64,0,1,64);rg.fillStyle='#1b1712'}
  const [vc,vg]=lienzo(96,26*96);const gv=vg.createLinearGradient(0,0,96,0);gv.addColorStop(0,'#cfc6b2');gv.addColorStop(.5,'#e4dccb');gv.addColorStop(1,'#cfc6b2');vg.fillStyle=gv;vg.fillRect(0,0,96,26*96);
  vg.fillStyle='#120e09';vg.font='800 70px "JetBrains Mono", monospace';vg.textAlign='center';vg.textBaseline='middle';for(let i=0;i<26;i++){vg.fillText(ABC[i],48,i*96+50);vg.fillStyle='rgba(0,0,0,.18)';vg.fillRect(0,i*96,96,2);vg.fillStyle='#120e09'}
  const ruedas=[],leds=[];
  for(let i=0;i<4;i++){const g=new T.Group();g.position.set(-.0255+i*.017,-.004,.014);cand.add(g);
    const tx=new T.CanvasTexture(vc);tx.encoding=T.sRGBEncoding;tx.wrapT=T.RepeatWrapping;tx.repeat.set(1,3/26);tx.anisotropy=8;
    // franja doblada en arco (un tambor visto de frente): las letras de arriba y abajo se curvan y se oscurecen
    const RT=.026,geo=new T.PlaneGeometry(.0145,.042,1,24),pa=geo.attributes.position;for(let j=0;j<pa.count;j++){const a=pa.getY(j)/RT;pa.setY(j,RT*Math.sin(a));pa.setZ(j,RT*Math.cos(a)-RT)}geo.computeVertexNormals();
    const mt=new T.MeshStandardMaterial({map:tx,roughness:.85,metalness:0,envMapIntensity:.2,emissive:'#ffffff',emissiveMap:tx,emissiveIntensity:0});
    const ca=new T.Mesh(geo,mt);ca.position.set(-.0255+i*.017,-.004,.0285);cand.add(ca);
    ruedas.push({g,ang:0,obj:0,vel:0,tx,mt});
    const led=new T.Mesh(new T.SphereGeometry(.0026,10,8),new T.MeshStandardMaterial({color:'#3a0a0a',emissive:'#ff2020',emissiveIntensity:0}));led.position.set(-.0255+i*.017,.026,.016);cand.add(led);leds.push(led)}
  // sombra de la ventana sobre los tambores y la marca roja de la fila que cuenta
  {const [oc,og]=lienzo(64,256);const go=og.createLinearGradient(0,0,0,256);go.addColorStop(0,'rgba(0,0,0,.92)');go.addColorStop(.3,'rgba(0,0,0,.35)');go.addColorStop(.4,'rgba(0,0,0,0)');go.addColorStop(.6,'rgba(0,0,0,0)');go.addColorStop(.7,'rgba(0,0,0,.35)');go.addColorStop(1,'rgba(0,0,0,.92)');og.fillStyle=go;og.fillRect(0,0,64,256);
   const ov=new T.Mesh(new T.PlaneGeometry(.07,.042),new T.MeshBasicMaterial({map:new T.CanvasTexture(oc),transparent:true,depthWrite:false}));ov.position.set(0,-.004,.0292);cand.add(ov);
   [-1,1].forEach(sg=>{const m=new T.Mesh(new T.BoxGeometry(.074,.0018,.003),laton);m.position.set(0,-.004+sg*.0078,.0295);cand.add(m)})}
  // la carta: un tríptico de papel doblado, cerrado con un sello de cera; adentro, el mensaje
  const CW=.2,CP=.09;   // ancho y alto de cada tercio
  const [ic,ig]=lienzo(1024,1382);{const gr=ig.createLinearGradient(0,0,0,1382);gr.addColorStop(0,'#f8f2e6');gr.addColorStop(1,'#efe6d4');ig.fillStyle=gr;ig.fillRect(0,0,1024,1382);
    for(let k=0;k<9000;k++){ig.fillStyle=`rgba(120,95,60,${Math.random()*.05})`;ig.fillRect(Math.random()*1024,Math.random()*1382,1+Math.random()*3,1)}
    [461,921].forEach(y=>{const s=ig.createLinearGradient(0,y-18,0,y+18);s.addColorStop(0,'rgba(0,0,0,0)');s.addColorStop(.5,'rgba(90,70,40,.16)');s.addColorStop(1,'rgba(0,0,0,0)');ig.fillStyle=s;ig.fillRect(0,y-18,1024,36)});
    ig.textAlign='center';ig.textBaseline='middle';
    ig.fillStyle='#8a7a66';ig.font='500 44px "JetBrains Mono", monospace';ig.fillText('N° 01 · 11 · 2026',512,300);
    ig.strokeStyle='#c8b49a';ig.lineWidth=3;ig.beginPath();ig.moveTo(380,370);ig.lineTo(644,370);ig.stroke();
    ig.fillStyle='#1a1715';ig.font='900 96px Unbounded, sans-serif';ig.fillText('FELIZ CUMPLE,',512,610);
    ig.save();ig.translate(512,760);ig.rotate(-.04);ig.fillStyle='#0e0e0e';ig.fillRect(-196,-74,404,160);ig.fillStyle='#c1121f';ig.fillRect(-204,-82,404,160);ig.fillStyle='#f2ece1';ig.font='900 124px Unbounded, sans-serif';ig.fillText('MELI',-2,4);ig.restore();
    ig.fillStyle='#c1121f';ig.font='400 140px "Reenie Beanie", cursive';ig.fillText('— James',512,1100);
    ig.font='70px serif';ig.fillText('♥',760,1180)}
  const iTex=new T.CanvasTexture(ic);iTex.encoding=T.sRGBEncoding;iTex.anisotropy=MOVIL?2:8;
  const [oc,og]=lienzo(256,256);og.fillStyle='#efe6d4';og.fillRect(0,0,256,256);for(let k=0;k<1800;k++){og.fillStyle=`rgba(120,95,60,${Math.random()*.06})`;og.fillRect(Math.random()*256,Math.random()*256,2,1)}
  const papelFuera=new T.MeshStandardMaterial({map:new T.CanvasTexture(oc),roughness:.95,emissive:'#efe6d4',emissiveIntensity:.25});
  const iMat=new T.MeshStandardMaterial({map:iTex,roughness:.9,emissive:'#ffffff',emissiveMap:iTex,emissiveIntensity:.42});
  // la carta abierta: una hoja con un leve arco de papel
  const hojaG=new T.PlaneGeometry(.2,.27,12,16);{const pa=hojaG.attributes.position;for(let k=0;k<pa.count;k++){const x=pa.getX(k),y=pa.getY(k);pa.setZ(k,-Math.pow(x/.1,2)*.004+Math.sin(y*30)*.0006)}hojaG.computeVertexNormals()}
  const carta=new T.Group();carta.visible=false;G.add(carta);
  const hojaF=new T.Mesh(hojaG,iMat);carta.add(hojaF);const hojaA=new T.Mesh(hojaG,papelFuera);hojaA.rotation.y=Math.PI;hojaA.position.z=-.0004;carta.add(hojaA);
  // el sobre: papel crema, solapa en triángulo y el sello de cera con la M en relieve
  const sobre=new T.Group();sobre.position.set(0,Hh-.1,0);sobre.visible=false;G.add(sobre);
  const sobreM=new T.MeshStandardMaterial({map:new T.CanvasTexture(oc),color:'#f3e3c6',roughness:.9,emissive:'#efe0c4',emissiveIntensity:.18});
  const cuerpoS=new T.Mesh(new T.BoxGeometry(.23,.17,.004),sobreM);sobre.add(cuerpoS);
  {const lad=new T.Shape();lad.moveTo(-.115,-.085);lad.lineTo(0,.0);lad.lineTo(.115,-.085);lad.lineTo(-.115,-.085);const f=new T.Mesh(new T.ShapeGeometry(lad),new T.MeshStandardMaterial({color:'#e9d6b4',roughness:.9,emissive:'#e9d6b4',emissiveIntensity:.12}));f.position.z=.0022;sobre.add(f)}
  const solapa=new T.Group();solapa.position.set(0,.085,.0026);sobre.add(solapa);
  {const tri=new T.Shape();tri.moveTo(-.115,0);tri.lineTo(.115,0);tri.lineTo(0,-.1);tri.lineTo(-.115,0);const f=new T.Mesh(new T.ShapeGeometry(tri),new T.MeshStandardMaterial({color:'#efdcbc',roughness:.9,side:T.DoubleSide,emissive:'#efdcbc',emissiveIntensity:.14}));solapa.add(f)}
  const [sc0,sg0]=lienzo(256,256);{const g2=sg0.createRadialGradient(100,90,10,128,128,128);g2.addColorStop(0,'#e2323f');g2.addColorStop(.6,'#a10d18');g2.addColorStop(1,'#6a0810');sg0.fillStyle=g2;sg0.fillRect(0,0,256,256);
    sg0.fillStyle='rgba(60,0,6,.55)';sg0.font='900 120px Unbounded, sans-serif';sg0.textAlign='center';sg0.textBaseline='middle';sg0.fillText('M',132,138);sg0.fillStyle='#f7c9c9';sg0.fillText('M',128,134)}
  const selloTex=new T.CanvasTexture(sc0);selloTex.encoding=T.sRGBEncoding;selloTex.center.set(.5,.5);selloTex.rotation=-Math.PI/2;
  const cera=new T.MeshPhysicalMaterial({color:'#a10d18',roughness:.35,clearcoat:.6,clearcoatRoughness:.3});
  const sello=new T.Mesh(new T.CylinderGeometry(.019,.021,.005,28),[cera,new T.MeshPhysicalMaterial({map:selloTex,roughness:.35,clearcoat:.6}),cera]);
  sello.rotation.x=Math.PI/2;sello.position.set(0,-.085,.003);solapa.add(sello);
  const frags=[];for(let k=0;k<12;k++){const f=new T.Mesh(new T.BoxGeometry(.006,.005,.003),cera);f.visible=false;sobre.add(f);frags.push({m:f,v:V(0,0,0)})}
  // estela de chispas doradas que deja la carta al girar
  const NCH=140,chPos=new Float32Array(NCH*3),chCol=new Float32Array(NCH*3),chVida=new Float32Array(NCH);
  const chG=new T.BufferGeometry();chG.setAttribute('position',new T.BufferAttribute(chPos,3));chG.setAttribute('color',new T.BufferAttribute(chCol,3));
  const chispas=new T.Points(chG,new T.PointsMaterial({size:.022,map:brillo('rgba(255,226,160,1)'),vertexColors:true,transparent:true,depthWrite:false,blending:T.AdditiveBlending}));chispas.userData={vida:chVida,i:0};chispas.frustumCulled=false;G.add(chispas)
  G.traverse(m=>{if(m.isMesh){m.castShadow=true;m.receiveShadow=true}});hueco.castShadow=false;
  // polvo dorado que sube con la luz al abrir
  const np=60,pp=new Float32Array(np*3);for(let i=0;i<np;i++){pp[i*3]=(Math.random()-.5)*.26;pp[i*3+1]=Hh+Math.random()*.4;pp[i*3+2]=(Math.random()-.5)*.26}
  const pgeo=new T.BufferGeometry();pgeo.setAttribute('position',new T.BufferAttribute(pp,3));const motas=new T.Points(pgeo,new T.PointsMaterial({color:'#ffd9a0',size:.006,transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending}));G.add(motas);
  const halo=new T.Sprite(new T.SpriteMaterial({map:brillo('rgba(255,214,150,1)'),transparent:true,depthWrite:false,blending:T.AdditiveBlending,opacity:0}));halo.scale.set(.5,.5,1);G.add(halo);
  const hojaZ0=Float32Array.from({length:hojaG.attributes.position.count},(_,k)=>hojaG.attributes.position.getZ(k));
  R3={hojaG,hojaZ0,iMat,halo,prevC:null,velC:V(0,0,0),G,tapa,bandas,cand,arco,ruedas,leds,hueco,luzDentro,carta,sobre,solapa,sello,frags,chispas,mono,motas,etiqueta,giroE:0,objE:0,ab:-1,Hh,LH,D};
}
function regalo3DFrame(dt){if(!R3)return;
  {const h=Math.min(dt,.05)/3;R3.ruedas.forEach(r=>{for(let q=0;q<3;q++){r.vel+=((r.obj-r.ang)*700-r.vel*34)*h;r.ang+=r.vel*h}r.g.rotation.x=r.ang;const v=-r.ang*26/(Math.PI*2);r.tx.offset.y=1-(v+2)/26;r.mt.emissiveIntensity=.07+(R3.ab>=0?.4*Math.max(0,Math.sin(Math.min(1,R3.ab/.6)*Math.PI)):0)})}
  // la etiqueta se mece apenas
  R3.giroE+=(R3.objE-R3.giroE)*Math.min(1,dt*6);R3.etiqueta.rotation.y=R3.giroE+Math.sin(performance.now()*.0013)*.06;
  if(R3.ab>=0){R3.ab+=dt;const a=R3.ab,s2=x=>x*x*(3-2*x),c01=x=>Math.max(0,Math.min(1,x));
    const rebote=(k,n=2)=>{const b=Math.abs(Math.cos(k*Math.PI*(n+.5)))*(1-k)*(1-k);return 1-b};      // caída con rebotes
    // 0–.3: el arco salta con un resorte
    const kp=c01(a/.3);R3.arco.position.y=.039+.014*(1-Math.cos(kp*Math.PI*2.5)*Math.exp(-kp*4));
    // .3–1.2: el candado resbala por el listón, cae y rebota en la mesa
    const k=c01((a-.35)/.9),y0=R3.Hh*.42,yF=.032;R3.cand.position.y=y0+(yF-y0)*rebote(k);R3.cand.position.z=R3.D/2+.036+.05*s2(k);R3.cand.position.x=.2*s2(k);
    R3.cand.rotation.x=-.12+1.17*s2(c01(k*1.3));R3.cand.rotation.z=-.45*s2(k);R3.cand.rotation.y=-.35*s2(k);
    // .5–1.3: el moño se desata y el listón cae flojo
    const km=c01((a-.5)/.8);R3.mono.rotation.y=-.35*s2(km);R3.mono.rotation.z=.12*s2(km);R3.mono.scale.set(1+.06*s2(km),1-.18*s2(km),1+.06*s2(km));
    // el listón se afloja y cae con peso: el de la cintura baja hasta la mesa y queda arrugado alrededor de la caja; el vertical se desploma y asoma adelante y atrás
    {const kb=c01((a-.7)/.65),g=kb*kb,reb=kb>=1?0:Math.abs(Math.sin(kb*Math.PI*2.2))*(1-kb)*.008;const [b1,b2]=R3.bandas.children;
     b1.position.y=R3.Hh*.5+(.008-R3.Hh*.5)*g+reb;b1.scale.set(1+.07*g,1-.72*g,1+.07*g);b1.rotation.y=.05*g;
     b2.position.y=R3.Hh/2+(.005-R3.Hh/2)*g;b2.scale.set(1+.15*g,1-.96*g,1+.32*g);b2.rotation.y=.12*g}
    // 1.1–1.6: la tapa sube; 1.6–2.5: se inclina, se desliza y cae a un lado con un rebote
    const yT=R3.Hh+R3.LH/2-.012,ku=s2(c01((a-1.1)/.5)),kf=c01((a-1.6)/.9);
    R3.tapa.position.y=yT+.13*ku-(yT+.13-(R3.LH/2+.002))*(kf*kf)+.025*Math.sin(kf*Math.PI)*(kf>.85?0:1);
    R3.tapa.position.x=-.44*s2(kf);R3.tapa.position.z=.05*kf;R3.tapa.rotation.z=.6*Math.sin(kf*Math.PI*.9)*(1-kf*.6)+.08*kf;R3.tapa.rotation.y=.55*kf+.04*Math.sin(ku*Math.PI*3);
    // 1.5–: luz desde adentro y polvo dorado que sube
    const kl=c01((a-1.5)/.7);R3.hueco.material.emissiveIntensity=kl*1.3;R3.luzDentro.intensity=kl*2.0;
    R3.motas.material.opacity=kl*.9;{const ar=R3.motas.geometry.attributes.position;for(let i=0;i<ar.count;i++){let y=ar.getY(i)+dt*.08;if(y>R3.Hh+.45)y=R3.Hh;ar.setY(i,y)}ar.needsUpdate=true}
    // 2.0–3.1: la carta sube despacio, se mece y gira hacia ti
    // 1.9–2.9: el sobre sube de la caja; 5.2–6.4: vuelve a bajar
    const sb=R3.sobre,kS=c01((a-1.9)/1.0),kV=c01((a-5.2)/1.2);sb.visible=a>1.8&&kV<1;
    sb.position.set(0,R3.Hh-.1+.3*s2(kS)-.34*s2(kV),0);sb.lookAt(C.position);sb.rotateZ(.035*Math.sin(a*2.1));sb.rotateX(-.28*s2(c01((a-3.6)/.8))*(1-kV));
    // 2.9–3.25: el sello se tensa y se parte; 3.15–3.65: se abre la solapa
    const kse=c01((a-2.9)/.35);R3.sello.scale.setScalar(kse<.6?1+.2*Math.sin(kse/.6*Math.PI):Math.max(.001,1-(kse-.6)/.4));R3.sello.visible=kse<1;
    if(a>=3.1&&!R3.partido){R3.partido=true;R3.frags.forEach(f=>{f.m.visible=true;f.m.position.set(rnd(-.012,.012),rnd(-.02,0),.006);f.v.set(rnd(-.22,.22),rnd(-.05,.25),rnd(.05,.2))})}
    if(R3.partido)R3.frags.forEach(f=>{if(!f.m.visible)return;f.v.y-=dt*1.1;f.m.position.addScaledVector(f.v,dt);f.m.rotation.x+=dt*9;f.m.rotation.y+=dt*7;if(f.m.position.y<-.45)f.m.visible=false});
    R3.solapa.rotation.x=-2.75*s2(c01((a-3.15)/.5));
    // 3.6–4.6: la carta sale del sobre; 4.6–6.6: sube girando como por magia; después flota frente a vos
    // 3.6–4.6: la carta sale del sobre; 4.6–6.9: sube en espiral, girando como si flotara; 6.9: llega frente a vos con un rebote suave
    const kc=c01((a-3.6)/1.0),kM=c01((a-4.6)/2.3),eM=kM<.5?2*kM*kM:1-Math.pow(-2*kM+2,2)/2,kL=c01((a-6.9)/1.0),car=R3.carta;car.visible=a>3.55&&!R3.cartaFuera;
    const yS=R3.Hh-.1+.3;let px,py,pz;
    if(kM<=0){px=0;py=yS+.2*(1-Math.pow(1-kc,3));pz=0}
    else{const rad=.12*Math.sin(kM*Math.PI)*(1-.25*kM),ang=eM*Math.PI*4;px=Math.sin(ang)*rad;pz=(Math.cos(ang)-1)*rad*.55+.03*eM;py=yS+.2+.15*eM+.03*Math.sin(kM*Math.PI)}
    py+=.018*Math.sin(kL*Math.PI)*(1-kL)+(a>6.9?.005*Math.sin(a*1.4)*kL:0);px+=a>6.9?.003*Math.sin(a*.9)*kL:0;
    car.position.set(px,py,pz);
    // velocidad (para la inercia del papel)
    if(R3.prevC&&dt>0){const v=car.position.clone().sub(R3.prevC).divideScalar(dt);R3.velC.lerp(v,Math.min(1,dt*8))}R3.prevC=car.position.clone();
    const vel=R3.velC,rap=Math.min(1,vel.length()*5);
    car.scale.set(1,.5+.5*s2(c01((kc-.45)/.55)),1);
    car.lookAt(C.position);
    if(kM>0)car.rotateY(eM*Math.PI*4);
    car.rotateZ(Math.max(-.45,Math.min(.45,-vel.x*2.2))+.03*Math.sin(a*2)*(1-kL));      // se inclina hacia donde va, como un papel en el aire
    car.rotateX(Math.max(-.35,Math.min(.35,vel.y*1.4))*(1-kL));
    // el papel se flexiona con el aire: más curva cuanto más rápido va, y un aleteo suave
    {const pa=R3.hojaG.attributes.position,z0=R3.hojaZ0,fl=.004+.012*rap;
     for(let k=0;k<pa.count;k++){const x=pa.getX(k),y=pa.getY(k);pa.setZ(k,z0[k]-Math.pow(x/.1,2)*.006*rap+Math.sin(y*20+a*13+x*8)*fl*(1-kL*.85)+(y/.135)*(y/.135)*.01*rap)}
     pa.needsUpdate=true;R3.hojaG.computeVertexNormals()}
    // halo cálido: aparece con la magia, acompaña a la carta y se apaga al llegar
    R3.halo.position.set(px,py,pz-.03);const hOp=.55*Math.sin(Math.min(1,kM*1.15)*Math.PI)+.25*kL;R3.halo.material.opacity=Math.max(0,hOp);R3.halo.scale.setScalar(.42+.12*Math.sin(a*3)+.15*kM);
    // al final el papel brilla y se funde con la página
    R3.iMat.emissiveIntensity=.42+.9*s2(c01((a-9.0)/1.1));
    // estela de chispas
    {const ch=R3.chispas,u=ch.userData,pa=ch.geometry.attributes.position,co=ch.geometry.attributes.color;
     if(a>3.4&&a<7.4)for(let n=0;n<3;n++){const k=u.i++%u.vida.length;u.vida[k]=1;pa.setXYZ(k,car.position.x+rnd(-.1,.1),car.position.y+rnd(-.13,.13),car.position.z+rnd(-.03,.03))}
     for(let k=0;k<u.vida.length;k++){if(u.vida[k]<=0)continue;u.vida[k]-=dt*.55;pa.setY(k,pa.getY(k)+dt*.03);const v=Math.max(0,u.vida[k]);co.setXYZ(k,v,v*.82,v*.45)}
     pa.needsUpdate=co.needsUpdate=true}}
}
const R3api={
  get tiene3D(){return !!R3},
  ruedas(arr){if(!R3)return;arr.forEach((v,i)=>{const r=R3.ruedas[i];const obj=-v*Math.PI*2/26;let d=obj-r.obj;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;r.obj+=d})},
  fija(i){if(!R3)return;R3.leds[i].material.emissiveIntensity=2.2},
  rectCandado(){if(!R3)return null;const b=new T.Box3().setFromObject(R3.cand);let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
    [b.min.x,b.max.x].forEach(x=>[b.min.y,b.max.y].forEach(y=>[b.min.z,b.max.z].forEach(z=>{const p=V(x,y,z).project(C);const sx=(p.x*.5+.5)*W(),sy=(-p.y*.5+.5)*H();x0=Math.min(x0,sx);x1=Math.max(x1,sx);y0=Math.min(y0,sy);y1=Math.max(y1,sy)})));return{x:x0,y:y0,w:x1-x0,h:y1-y0}},
  get cuadros(){return cuadros},
  rectRuedas(){if(!R3)return null;let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;C.updateProjectionMatrix();S.updateMatrixWorld(true);R3.G.updateMatrixWorld(true);[[-.039,-.027],[.039,-.027],[-.039,.019],[.039,.019]].forEach(([x,y])=>{const p=R3.cand.localToWorld(V(x,y,.03)).project(C);const sx=(p.x*.5+.5)*W(),sy=(-p.y*.5+.5)*H();x0=Math.min(x0,sx);x1=Math.max(x1,sx);y0=Math.min(y0,sy);y1=Math.max(y1,sy)});return{x:x0,y:y0,w:x1-x0,h:y1-y0}},
  abrirRegalo(){return new Promise(ok=>{if(!R3)return ok();R3.ab=0;setTimeout(ok,reducido3D?7000:9400)})},
  voltea(){if(R3)R3.objE=R3.objE?0:Math.PI},
  rectEtiqueta(){if(!R3)return null;const b=new T.Box3().setFromObject(R3.etiqueta);let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;[b.min.x,b.max.x].forEach(x=>[b.min.y,b.max.y].forEach(y=>[b.min.z,b.max.z].forEach(z=>{const p=V(x,y,z).project(C);const sx=(p.x*.5+.5)*W(),sy=(-p.y*.5+.5)*H();x0=Math.min(x0,sx);x1=Math.max(x1,sx);y0=Math.min(y0,sy);y1=Math.max(y1,sy)})));return{x:x0,y:y0,w:x1-x0,h:y1-y0}},
  ocultaCarta(){if(R3)R3.cartaFuera=true},
  rectCarta(){if(!R3)return null;const c=R3.carta;let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;[[-.1,-.0625],[.1,-.0625],[-.1,.0625],[.1,.0625]].forEach(([x,y])=>{const p=c.localToWorld(V(x,y,0)).project(C);const sx=(p.x*.5+.5)*W(),sy=(-p.y*.5+.5)*H();x0=Math.min(x0,sx);x1=Math.max(x1,sx);y0=Math.min(y0,sy);y1=Math.max(y1,sy)});return{left:x0,top:y0,width:x1-x0,height:y1-y0}}
};

window.Intro3D={
  preparar(cv,prog,listo){cv.addEventListener('webglcontextlost',e=>{e.preventDefault();dispatchEvent(new Event('intro3d-perdido'))},{once:true});cargaProg=prog;cargaListo=listo;construir(cv);camara(0,0);reloj.getDelta();cuadroLoop();if(!T.GLTFLoader)setTimeout(()=>{cargado=true;listo&&listo()},50)},
  get movil(){return MOVIL},get ios(){return IOS},get bajo(){return BAJO},get cargado(){return cargado},get ligero(){return LIGERO},ligero_(on){ponLigero(on)},get cuadros(){return cuadros},
  get tiene3D(){return R3api.tiene3D},ruedas:R3api.ruedas,rectRuedas:R3api.rectRuedas,fija:R3api.fija,rectCandado:R3api.rectCandado,abrirRegalo:R3api.abrirRegalo,rectCarta:R3api.rectCarta,ocultaCarta:R3api.ocultaCarta,voltea:R3api.voltea,rectEtiqueta:R3api.rectEtiqueta,
  saltar(){if(!corriendo||apagonT>=0)return false;const meta=44.4;sonar('sirena',0);sonar('descubre');ev.forEach(x=>{if(x.t<meta)x.hecho=true});tAcum=meta;focoT=0;manoEst='fuera';cintaObj=0;puertaObj=1.75;fadeObj=0;mirada=null;camara.salto=true;sonar('lluvia',.35);sonar('escena','regalo');sonar('rechina',1);return true},
  correr(api,fin){pisada=api.paso||pisada;sonar=api.sonar||sonar;linea();alTerminar=fin;t0=performance.now();tAcum=0;corriendo=true},
  parar(){listo=false;try{S.traverse(o=>{if(o.geometry)o.geometry.dispose();const ms=o.material?(Array.isArray(o.material)?o.material:[o.material]):[];ms.forEach(m=>{Object.keys(m).forEach(k=>{if(m[k]&&m[k].isTexture)m[k].dispose()});m.dispose()})});if(comp)comp.passes.forEach(p=>p.dispose&&p.dispose());R.dispose();R.forceContextLoss()}catch(e){}},
  get FIN(){return FIN}
};
})();
