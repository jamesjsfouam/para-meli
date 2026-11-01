/* =====================================================================
   Entrada en primera persona: el bosque, la casa y la escena del crimen.
   Three.js r128 · todo procedural salvo las fotos de fotos/cosas/
   ===================================================================== */
(function(){
const T=THREE;
let R,S,C,reloj,linterna,focoMesa,lampCono,puerta,parpadeo=[],polvo,listo=false,corriendo=false,t0=0,alTerminar=null;
let flashT=-1,flashL=null,linMesa=null,lampEsc=null,bajaAuto=0,fadeObj=0,fadeVal=0,lampBulbo=null,lampVol=null,zoomK=-1,zIni=null,zMir=null,libreta=null,LM=null,cargaProg=null,cargaListo=null,cargado=false,macetas=[],comp=null,regaloPlano=null,regaloMat=null,manoL,manoR,linternaObj,regaloMats=[],regaloG,cintaP,autoPuerta,sirena=[],lluvia,fundeT=-1,fundeDur=1;
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

/* ---------- materiales PBR (texturas fotográficas de Poly Haven, CC0) ---------- */
const TXC={};
function pbr(n,rep=[1,1],o={}){const tl=new T.TextureLoader(LM||undefined),k=t=>{t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(rep[0],rep[1]);t.anisotropy=8;return t};
  const map=k(tl.load('pbr/'+n+'_col.jpg'));map.encoding=T.sRGBEncoding;
  return new T.MeshStandardMaterial(Object.assign({map,normalMap:k(tl.load('pbr/'+n+'_nor.jpg')),roughnessMap:k(tl.load('pbr/'+n+'_rough.jpg')),roughness:1,envMapIntensity:.35},o))}

/* la libreta: cuatro nombres, tres tachados en rojo */
function libretaTex(){const [c,g]=lienzo(2048,1400);
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
  const mano=(t,x,y,px,col,rot=0)=>{g.save();g.translate(x,y);g.rotate(rot);g.fillStyle=col;g.font=`${px}px "Reenie Beanie", cursive`;g.fillText(t,0,0);const w=g.measureText(t).width;g.restore();return w};
  const tinta='rgba(28,30,48,.92)';
  // página izquierda
  g.fillStyle='rgba(60,55,45,.75)';g.font='500 34px "JetBrains Mono", monospace';g.fillText('N° 01 · 11 · 2026',190,150);
  mano('Lista.',190,330,150,tinta,-.02);
  mano('No confíes en nadie.',195,520,92,'rgba(28,30,48,.8)',-.015);
  mano('Él siempre sabe dónde estás.',195,700,74,'rgba(28,30,48,.62)',-.01);
  // la firma de Red John, chiquita, en la esquina
  g.save();g.translate(780,330);g.strokeStyle='rgba(150,15,20,.75)';g.lineWidth=7;g.lineCap='round';g.beginPath();g.arc(0,0,58,0,Math.PI*2);g.stroke();
  g.beginPath();g.moveTo(-20,-22);g.lineTo(-21,0);g.moveTo(20,-22);g.lineTo(21,0);g.stroke();g.beginPath();g.arc(0,8,32,.35,Math.PI-.35);g.stroke();
  g.lineWidth=4;g.beginPath();g.moveTo(-30,52);g.lineTo(-31,110);g.stroke();g.beginPath();g.arc(-31,116,6,0,7);g.fillStyle='rgba(140,10,16,.8)';g.fill();g.restore();
  // página derecha: los nombres
  const nombres=['Jose','Lauren','Jireh','James'];
  nombres.forEach((n,i)=>{const y=420+i*215,x=1230;mano((i+1)+'.',x,y,120,'rgba(28,30,48,.7)');const w=mano(n,x+110,y,165,tinta,rnd(-.03,.02));
    if(i<3){for(let k=0;k<2;k++){g.strokeStyle=k?'rgba(185,12,22,.95)':'rgba(150,8,16,.55)';g.lineWidth=k?11:20;g.lineCap='round';g.beginPath();
        const y0=y-52+k*14+rnd(-6,6);g.moveTo(x+90,y0+rnd(-8,8));for(let s2=1;s2<=6;s2++)g.lineTo(x+90+(w+60)*s2/6,y0+rnd(-14,14)-s2*3);g.stroke()}
      g.fillStyle='rgba(160,10,18,.6)';g.beginPath();g.ellipse(x+w+170,y-40,rnd(5,9),rnd(5,9),0,0,7);g.fill()}
    else{g.strokeStyle='rgba(28,30,48,.55)';g.lineWidth=4;g.beginPath();g.moveTo(x+100,y+22);g.quadraticCurveTo(x+100+w/2,y+34,x+130+w,y+18);g.stroke();
      // una gota roja, todavía fresca, junto a su nombre
      g.fillStyle='rgba(175,8,18,.95)';g.beginPath();g.ellipse(x+w+200,y-70,16,20,.3,0,7);g.fill();g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.ellipse(x+w+194,y-78,4,5,0,0,7);g.fill();
      for(let k=0;k<7;k++){g.fillStyle='rgba(165,8,18,.85)';g.beginPath();g.arc(x+w+200+rnd(-60,60),y-70+rnd(-50,50),rnd(2,6),0,7);g.fill()}}});
  grano(g,2048,1400,10);const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;t.anisotropy=8;return t}

function postit(lineas,col='#f2e27a',rot=0){const [c,g]=lienzo(320,320);g.fillStyle=col;g.fillRect(0,0,320,320);
  const sh=g.createLinearGradient(0,0,0,320);sh.addColorStop(0,'rgba(0,0,0,.08)');sh.addColorStop(.15,'rgba(0,0,0,0)');sh.addColorStop(1,'rgba(0,0,0,.12)');g.fillStyle=sh;g.fillRect(0,0,320,320);
  g.save();g.translate(160,160);g.rotate(rot);g.textAlign='center';lineas.forEach(([t,px,y,c2])=>{g.fillStyle=c2||'rgba(25,25,40,.92)';g.font=`${px}px "Reenie Beanie", cursive`;g.fillText(t,0,y)});g.restore();
  grano(g,320,320,8);const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;return t}
function mapaTex(){const [c,g]=lienzo(700,500);g.fillStyle='#e4dcc4';g.fillRect(0,0,700,500);manchas(g,700,500,30,a=>`rgba(140,110,60,${a})`);
  g.strokeStyle='rgba(90,120,150,.5)';g.lineWidth=2;for(let i=0;i<9;i++){g.beginPath();let x=rnd(0,700),y=rnd(0,500);g.moveTo(x,y);for(let k=0;k<6;k++){x+=rnd(-90,90);y+=rnd(-60,60);g.lineTo(x,y)}g.stroke()}
  g.fillStyle='rgba(120,160,190,.45)';g.beginPath();g.ellipse(560,300,120,80,.3,0,7);g.fill();g.beginPath();g.ellipse(430,160,60,40,0,0,7);g.fill();
  const pts=[[180,140,'Rally'],[300,330,'León'],[470,250,'UAM'],[600,120,'¿?']];
  g.strokeStyle='rgba(170,10,20,.85)';g.lineWidth=3;g.setLineDash([10,8]);g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.stroke();g.setLineDash([]);
  pts.forEach(([x,y,n])=>{g.strokeStyle='rgba(180,10,20,.9)';g.lineWidth=5;g.beginPath();g.arc(x,y,26,0,7);g.stroke();g.fillStyle='rgba(30,20,20,.9)';g.font='44px "Reenie Beanie", cursive';g.fillText(n,x+32,y-20)});
  grano(g,700,500,10);const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;return t}

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
  const manga=new T.Mesh(new T.CylinderGeometry(.05,.058,.4,18),M({color:'#1a1c20',roughness:.95}));manga.rotation.x=Math.PI/2;manga.position.set(0,0,.3);g.add(manga);
  const puno=new T.Mesh(new T.TorusGeometry(.046,.01,8,20),M({color:'#24272c',roughness:1}));puno.position.z=.11;g.add(puno);
  g.userData.cierra=k=>{dedos.forEach((cad,i)=>cad.forEach((s,j)=>{s.rotation.x=-k*(j?1.25:.9)*(1-i*.04)}));pul[0].rotation.x=-k*.5;pul[1].rotation.x=-k*.7};
  g.userData.cierra(.25);sombra(g);g.traverse(m=>{if(m.isMesh)m.castShadow=false});return g}

/* ---------- la escena ---------- */
function construir(cv){
  LM=new T.LoadingManager(()=>{cargado=true;cargaListo&&cargaListo()},(u,l,t)=>{cargaProg&&cargaProg(l/t)});
  R=new T.WebGLRenderer({canvas:cv,antialias:true,powerPreference:'high-performance'});
  R.setPixelRatio(Math.min(devicePixelRatio,1.6));R.setSize(W(),H());R.outputEncoding=T.sRGBEncoding;
  R.toneMapping=T.ACESFilmicToneMapping;R.toneMappingExposure=1.25;R.shadowMap.enabled=true;R.shadowMap.type=T.PCFSoftShadowMap;R.physicallyCorrectLights=false;
  S=new T.Scene();S.fog=new T.FogExp2('#0a0e13',.065);
  C=new T.PerspectiveCamera(W()<H()?76:60,W()/H(),.02,90);C.position.set(0,1.62,11);S.add(C);
  const cieloM=new T.Mesh(new T.SphereGeometry(70,24,16),new T.MeshBasicMaterial({map:cielo(),side:T.BackSide,fog:false}));S.add(cieloM);
  const luna=new T.Sprite(new T.SpriteMaterial({map:brillo('rgba(205,215,240,1)'),fog:false,depthWrite:false}));luna.position.set(-16,20,-34);luna.scale.set(12,12,1);S.add(luna);
  const lunaL=new T.DirectionalLight('#8796c4',.55);lunaL.position.set(-9,16,9);lunaL.castShadow=true;lunaL.shadow.mapSize.set(2048,2048);
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
  const n=150,conoG=(()=>{const g=new T.ConeGeometry(1,1,16,3,true);const pa=g.attributes.position;for(let i=0;i<pa.count;i++){const x=pa.getX(i),z=pa.getZ(i),y=pa.getY(i);if(y<.45){const f=1+Math.sin(Math.atan2(z,x)*7)*.18+(Math.random()-.5)*.12;pa.setX(i,x*f);pa.setZ(i,z*f);pa.setY(i,y-Math.random()*.08)}}g.computeVertexNormals();return g})(),troncoG=new T.CylinderGeometry(.1,.18,1,7);
  const agujaM=M({color:'#0d1710',roughness:1,side:T.DoubleSide,envMapIntensity:.1}),cortezaM=pbr('pine_bark',[1,3]);
  const conos=new T.InstancedMesh(conoG,agujaM,n*7),troncos=new T.InstancedMesh(troncoG,cortezaM,n);conos.castShadow=troncos.castShadow=true;conos.receiveShadow=true;
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
  const bR=caja(.16,.06,.1,new T.MeshBasicMaterial({color:'#ff1a1a'}),-.22,1.6,.05,0,auto),bA=caja(.16,.06,.1,new T.MeshBasicMaterial({color:'#2a5bff'}),.22,1.6,.05,0,auto);
  const lR=new T.PointLight('#ff2020',0,14,1.6);lR.position.set(-.4,1.75,0);auto.add(lR);const lA=new T.PointLight('#2a5bff',0,14,1.6);lA.position.set(.4,1.75,0);auto.add(lA);sirena=[lR,lA,bR,bA];
  [-.68,.68].forEach((x,i)=>{const f=new T.SpotLight('#e8eeff',3.6,32,.32,.45,1.1);f.position.set(x,.68,-2.3);f.castShadow=i===0;f.shadow.mapSize.set(1024,1024);auto.add(f);const tg=new T.Object3D();tg.position.set(x*.6,.3,-16);auto.add(tg);f.target=tg;
    const gl=new T.Sprite(new T.SpriteMaterial({map:brillo('rgba(235,240,255,1)'),depthWrite:false,fog:false}));gl.position.set(x,.68,-2.36);gl.scale.set(.7,.45,1);auto.add(gl);
    const cono=new T.Mesh(new T.ConeGeometry(2.6,13,24,1,true),new T.MeshBasicMaterial({color:'#cfd8ff',transparent:true,opacity:.03,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide}));cono.rotation.x=Math.PI/2;cono.position.set(x*.8,.5,-8.8);auto.add(cono)});
  if(T.OBJLoader){new T.OBJLoader(LM).load('pbr/mondeo/mondeo.obj',obj=>{
    const tl=new T.TextureLoader(LM),k=n=>{const t=tl.load('pbr/mondeo/'+n);t.anisotropy=8;return t};
    const dif=k('dif.jpg');dif.encoding=T.sRGBEncoding;
    const mat=new T.MeshPhysicalMaterial({map:dif,normalMap:k('nor.jpg'),roughnessMap:k('rough.jpg'),metalnessMap:k('metal.jpg'),alphaMap:k('alpha.jpg'),alphaTest:.4,
      roughness:1,metalness:1,clearcoat:.6,clearcoatRoughness:.2,envMapIntensity:.6});
    obj.traverse(m=>{if(m.isMesh){m.material=mat;m.castShadow=m.receiveShadow=true}});
    obj.scale.setScalar(.0235);obj.rotation.y=Math.PI;obj.position.y=25.7*.0235;auto.add(obj)})}
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
   lib.rotation.set(-Math.PI/2,0,.06);lib.position.set(0,.045,0);E.add(lib);libreta=lib;
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
   {const [c,g]=lienzo(512,640);g.fillStyle='#e9e3d3';g.fillRect(0,0,512,640);manchas(g,512,640,20,a=>`rgba(120,100,60,${a})`);g.fillStyle='#1a1a1a';g.font='700 26px Georgia, serif';g.textAlign='center';g.fillText('DIARIO DE LA NOCHE',256,48);
    g.fillRect(30,62,452,3);g.font='900 58px Georgia, serif';g.fillText('¿DÓNDE ESTÁ',256,140);g.fillText('JAMES?',256,205);g.font='italic 22px Georgia, serif';g.fillText('Lo vieron por última vez en un rally',256,245);
    g.textAlign='left';for(let col=0;col<2;col++)for(let i=0;i<14;i++){g.fillStyle='rgba(30,30,30,.55)';g.fillRect(36+col*230,280+i*24,rnd(150,205),9)}grano(g,512,640,10);
    const t=new T.CanvasTexture(c);t.encoding=T.sRGBEncoding;plano(t,.17,.21,-.47,.33,.25,.037)}
   [[['¿Dónde estuvo','46','-20'],['James?','64','40']],[['Rally Nacional','40','-30'],['→ ¿con quién?','40','25']],[['León, 18 feb','42','-25'],['¿por qué volvió?','36','30']],
    [['visto por última','36','-30'],['vez: UAM 7 p.m.','36','20']],[['07·10·2025','44','-20'],['todo empezó aquí','38','30']]].forEach((ls,i)=>{
     const pos=[[-.37,.02,.2],[.31,.2,-.15],[-.34,-.19,-.25],[.13,.31,.1],[.2,-.37,.06]][i];
     plano(postit(ls.map(([t,px,y])=>[t,+px*1.5,+y*1.5]),['#f2e27a','#f4b6c2','#f2e27a','#b8e0d2','#f4d58a'][i],rnd(-.06,.06)),.1,.1,pos[0],pos[1],pos[2],.04+i*.0004)});
   // polaroids de los lugares (fotos reales de la línea de tiempo)
   [['fotos/linea-rally.webp',-.36,-.05,.4],['fotos/linea-rally-uam.webp',.17,.3,-.3],['fotos/linea-perritos-2.jpg',.42,.2,.2]].forEach(([f,x,z,ry])=>{
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
   lampEsc=new T.SpotLight('#ffd6a0',1.7,3,.6,.8,2);lampEsc.position.set(-.38,.62,-.18);lampEsc.target=lib;lampEsc.castShadow=true;lampEsc.shadow.mapSize.set(1024,1024);lampEsc.shadow.bias=-.0004;E.add(lampEsc);
   const amb=new T.PointLight('#5a4030',.25,2.5,2);amb.position.set(.4,.6,.5);E.add(amb)}

  // ----- lluvia -----
  {const n=2600,pos=new Float32Array(n*6);for(let i=0;i<n;i++){const x=rnd(-14,14),y=rnd(0,9),z=rnd(-6,22);pos.set([x,y,z,x+.02,y-.32,z],i*6)}
   const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));
   lluvia=new T.LineSegments(g,new T.LineBasicMaterial({color:'#9fb0c8',transparent:true,opacity:.32,depthWrite:false}));S.add(lluvia)}

  // ----- la casa -----
  const mF=pbr('weathered_planks',[3,2.2]);
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
  const farol=new T.PointLight('#ffb070',.6,6,2);farol.position.set(.9,2.6,.6);farol.castShadow=true;farol.shadow.mapSize.set(512,512);S.add(farol);parpadeo.push([farol,.7]);
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
  {const pg=new T.Group();pg.position.set(-1.0,.3,-4.0);caja(.05,2.2,.98,pbr('weathered_planks',[1,1]),-.0,1.1,.49,0,pg);pg.rotation.y=-1.3;S.add(pg)}
  [.62,-.62].forEach(a=>{const c=new T.Mesh(new T.PlaneGeometry(1.5,.075),M({map:ct,side:T.DoubleSide,roughness:.5}));c.position.set(-1.1,1.55,-3.5);c.rotation.set(0,P2,a);S.add(c)});
  // zócalos en todo el perímetro
  const zoc=M({color:'#1a100a',roughness:.8});
  [[-2.93,-8.06,3.8,0],[2.93,-8.06,3.8,0],[0,-8.06,1.87,0]].forEach(([x,z,w])=>caja(w,.16,.03,zoc,x,.38,z));
  [[-4.82,-4.1],[4.82,-4.1]].forEach(([x,z])=>caja(.03,.16,7.9,zoc,x,.38,z));
  [[-1.07,-1.56,2.88],[-1.07,-6.05,4.1],[-.93,-1.56,2.88],[-.93,-6.05,4.1],[.93,-2.36,4.48],[.93,-6.85,2.5],[1.07,-2.36,4.48],[1.07,-6.85,2.5]].forEach(([x,z,w])=>caja(.03,.16,w,zoc,x,.38,z));
  // fotos de ella colgadas, torcidas, a lo largo del pasillo
  [['selfie.jpg',-.92,-1.5,P2],['osito.jpg',-.92,-5.4,P2],['lentes.jpg',-.92,-6.7,P2],['sillon.jpg',.92,-1.8,-P2],['patio.jpg',.92,-3.3,-P2],['linea-perritos-1.jpg',.92,-6.6,-P2]]
    .forEach(([f,x,z,ry])=>foto('fotos/'+f,.32,.4,x,1.85+rnd(-.1,.1),z,ry,rnd(-.12,.12)));
  // un foco pelado y apagado en el techo del pasillo
  {caja(.006,.4,.006,M({color:'#111'}),0,3.4,-2.2);const fb=new T.Mesh(new T.SphereGeometry(.04,12,10),M({color:'#bba',roughness:.2,transparent:true,opacity:.6}));fb.position.set(0,3.18,-2.2);S.add(fb)}
  // al estilo Red John: cuarto ordenado, la víctima en la cama, la carita pintada con su sangre sobre la cabecera
  calco(redJohn(),1.7,1.7,-4.83,2.4,-4.6,0,Math.PI/2);
  const cama=new T.Group();const mCama=M({color:'#2a1a10',roughness:.6}),colchon=M({color:'#d8d2c6',roughness:.95}),sab=pbr('rough_linen',[2,2],{color:'#e9e4da'});



  caja(1.92,.2,.9,colchon,-3.8,.68,-4.6,0,cama);
  [-4.8,-4.4].forEach(z=>{const a=new T.Mesh(new T.SphereGeometry(1,18,12),colchon);a.scale.set(.15,.06,.19);a.position.set(-4.5,.84,z);cama.add(a)});
  // la sábana sobre el cuerpo
  const tor=new T.Mesh(new T.SphereGeometry(1,24,16),sab);tor.scale.set(.48,.12,.2);tor.position.set(-3.85,.85,-4.6);cama.add(tor);
  const cab=new T.Mesh(new T.SphereGeometry(.13,18,14),sab);cab.position.set(-4.42,.92,-4.6);cab.scale.y=.75;cama.add(cab);
  const pier=new T.Mesh(new T.SphereGeometry(1,18,12),sab);pier.scale.set(.48,.09,.17);pier.position.set(-3.1,.83,-4.6);cama.add(pier);
  caja(1.96,.03,.96,sab,-3.78,.795,-4.6,0,cama);
  [-1,1].forEach(sd=>{const d=caja(1.9,.3,.02,sab,-3.78,.65,-4.6+sd*.49,0,cama);d.rotation.x=sd*.06});
  S.add(sombra(cama));
  calco(sangre('charco'),.9,.6,-3.85,1.0,-4.62,-Math.PI/2,0,.95);
  calco(sangre('charco'),.5,.4,-3.55,.82,-4.35,-Math.PI/2,0,.85);
  calco(sangre('salpicadura'),.45,.45,-3.5,.66,-4.1,0,0,.9);                     // chorrea por el costado de la sábana
  // mesita de noche con lámpara tenue

  const luzN=new T.PointLight('#ffb070',.5,3.2,2);luzN.position.set(-4.5,1.25,-5.95);luzN.castShadow=true;luzN.shadow.mapSize.set(512,512);S.add(luzN);parpadeo.push([luzN,.5]);
  // marcadores de evidencia junto a la cama
  [[-2.5,-4.0],[-2.45,-5.2],[-3.2,-3.6],[-3.4,-5.6],[-2.2,-4.6]].forEach(([x,z],i)=>{const g=new T.Group();const m=new T.Mesh(new T.CylinderGeometry(.0001,.07,.12,3),M({map:etiquetaNum(i+1),color:'#f0c419',roughness:.5}));m.position.y=.06;g.add(m);g.position.set(x,.3,z);g.rotation.y=rnd(0,3);S.add(sombra(g))});
  // cinta alrededor de la cama, entre dos parantes, sin cruzar el paso
  [[-1.95,-3.4],[-1.95,-5.9]].forEach(([x,z])=>caja(.05,1.0,.05,M({color:'#c9a400',roughness:.6}),x,.8,z));
  {const ci=new T.Mesh(new T.PlaneGeometry(2.5,.07),M({map:ct,side:T.DoubleSide,roughness:.5}));ci.position.set(-1.95,1.18,-4.65);ci.rotation.y=Math.PI/2;S.add(ci)}
  // alfombra vieja bajo la cama
  {const a=new T.Mesh(new T.PlaneGeometry(2.6,2.0),pbr('dirty_carpet',[1.3,1],{color:'#8a6a5a'}));a.rotation.x=-P2;a.position.set(-3.35,.306,-4.6);a.receiveShadow=true;S.add(a)}
  // ventana tapiada en la pared de afuera: la luna se cuela entre las tablas
  {caja(.05,1.2,1.0,M({color:'#05070a',roughness:.1,metalness:.6}),-4.82,1.9,-1.8);caja(.08,.08,1.12,marcoP,-4.8,2.52,-1.8);caja(.08,.08,1.12,marcoP,-4.8,1.28,-1.8);
   [[.5],[-.45]].forEach(([a])=>{const t=caja(.04,.14,1.3,pbr('weathered_planks',[1,1]),-4.78,1.9+rnd(-.1,.1),-1.8);t.rotation.x=a});
   const lun=new T.SpotLight('#9fb4ff',1.4,8,.42,.7,1.5);lun.position.set(-5.6,2.6,-1.8);const tg=new T.Object3D();tg.position.set(-3.2,.3,-2.6);S.add(tg);lun.target=tg;lun.castShadow=true;lun.shadow.mapSize.set(1024,1024);S.add(lun)}
  // luces de trabajo forense en trípode, frías, apuntando a la cama
  const tripode=(x,z,mira)=>{const g=new T.Group();const metal=M({color:'#2a2c30',roughness:.4,metalness:.8});
    for(let i=0;i<3;i++){const a=i*Math.PI*2/3;const p=new T.Mesh(new T.CylinderGeometry(.012,.012,1.05,8),metal);p.position.set(Math.cos(a)*.22,.48,Math.sin(a)*.22);p.rotation.set(Math.sin(a)*.42,0,-Math.cos(a)*.42);g.add(p)}
    const poste=new T.Mesh(new T.CylinderGeometry(.015,.015,.9,8),metal);poste.position.y=1.3;g.add(poste);
    const cab=new T.Group();cab.position.y=1.78;g.add(cab);const caja2=new T.Mesh(new T.BoxGeometry(.3,.22,.12),M({color:'#c9a400',roughness:.5}));cab.add(caja2);
    const cara=new T.Mesh(new T.PlaneGeometry(.26,.18),new T.MeshBasicMaterial({color:'#f4f8ff'}));cara.position.z=.061;cab.add(cara);
    const gl=new T.Sprite(new T.SpriteMaterial({map:brillo('rgba(230,240,255,1)'),depthWrite:false,blending:T.AdditiveBlending}));gl.position.z=.1;gl.scale.set(.7,.6,1);cab.add(gl);
    g.position.set(x,.3,z);S.add(sombra(g));cab.lookAt(mira);
    const sl=new T.SpotLight('#eaf2ff',2.0,9,.5,.55,1.6);sl.position.set(x,2.08,z);const tg=new T.Object3D();tg.position.copy(mira);S.add(tg);sl.target=tg;sl.castShadow=true;sl.shadow.mapSize.set(1024,1024);S.add(sl)};
  tripode(-2.0,-6.9,V(-4.6,1.6,-4.6));tripode(-1.6,-1.6,V(-4.0,.9,-4.6));
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
  // cama con edredón lila, cojines, alfombra peluda rosa, escritorio con la laptop encendida y luces de hada
  {const ed=pbr('rough_linen',[2,2],{color:'#b79ce6'});caja(1.9,.2,.9,M({color:'#e8e2f2',roughness:.95}),3.95,.68,-2.6);
   const edr=caja(1.6,.07,.96,ed,3.75,.8,-2.6);edr.rotation.z=.02;[-1,1].forEach(sd=>caja(1.6,.3,.02,ed,3.75,.65,-2.6+sd*.49));
   const pz=new T.Mesh(new T.SphereGeometry(1,16,12),M({color:'#d9c4ff',roughness:.9}));pz.scale.set(.16,.07,.3);pz.position.set(4.55,.86,-2.6);S.add(pz)}
  {const [c,g]=lienzo(512,512);g.fillStyle='#e7a3c4';g.fillRect(0,0,512,512);for(let i=0;i<9000;i++){g.strokeStyle=`rgba(${rnd(220,255)},${rnd(150,190)},${rnd(190,220)},.5)`;g.beginPath();const x=rnd(0,512),y=rnd(0,512);g.moveTo(x,y);g.lineTo(x+rnd(-4,4),y+rnd(-4,4));g.stroke()}
   const a=new T.Mesh(new T.CircleGeometry(.85,48),M({map:new T.CanvasTexture(c),roughness:1}));a.rotation.x=-P2;a.position.set(2.9,.306,-4.0);a.receiveShadow=true;S.add(a)}
  {const mad2=pbr('wood_floor_worn',[1,.5],{color:'#e8dccb'});caja(1.2,.04,.55,mad2,2.7,1.06,-.5);[[-.55,-.22],[.55,-.22],[-.55,.22],[.55,.22]].forEach(([x,z])=>caja(.04,.74,.04,mad2,2.7+x,.68,-.5+z));
   const pant=new T.PointLight('#b9a2ff',.6,2.5,2);pant.position.set(2.7,1.35,-.75);S.add(pant);parpadeo.push([pant,.6])}
  {const pts=[];for(let i=0;i<=24;i++){const k=i/24;pts.push(V(1.25+k*3.45,2.95-Math.sin(k*Math.PI)*.35,-8.03))}
   S.add(new T.Line(new T.BufferGeometry().setFromPoints(pts),new T.LineBasicMaterial({color:'#222'})));
   const bm=new T.MeshBasicMaterial({color:'#ffe0a8'});pts.forEach((p2,i)=>{if(i%2)return;const b=new T.Mesh(new T.SphereGeometry(.018,8,6),bm);b.position.copy(p2).add(V(0,-.03,.01));S.add(b)});
   [[2.1],[3.9]].forEach(([x])=>{const l=new T.PointLight('#ffd49a',.35,2.5,2);l.position.set(x,2.7,-7.8);S.add(l)})}
  // estante con libros y cactus
  const est=new T.Group();const mad=M({color:'#2a1a0e',roughness:.8});
  [0,.45,.9,1.35].forEach(y=>caja(1.3,.04,.32,mad,0,y,0,0,est));[-.65,.65].forEach(x=>caja(.04,1.4,.32,mad,x,.68,0,0,est));
  const colores=['#5a1e1e','#2c3a4a','#4a3a20','#203a2c','#3a2a3a','#6a5030','#1e2a3a'];
  [.02,.47].forEach(y=>{let x=-.6;while(x<.55){const w=rnd(.04,.08),h=rnd(.26,.38);const lb=caja(w,h,.22,M({color:colores[Math.floor(rnd(0,colores.length))],roughness:.75}),x+w/2,y+h/2+.02,0,0,est);lb.rotation.z=rnd(-.05,.05);x+=w+.005}});
  for(let i=0;i<5;i++){const lb=caja(.24,.04,.17,M({color:colores[i],roughness:.75}),-.3+i*.14,.95+i*.0,0,0,est);lb.rotation.y=rnd(-.3,.3);lb.position.y=.94+i*.0}
  est.visible=false;
  cactus(3.6,-7.4,1);cactus(-4.2,-7.5,.85);cactus(4.2,-.9,1.1);

  // ----- la mesa y el regalo -----
  const mesa=new T.Group();const nogal=M({color:'#3a2414',roughness:.5});
  const tope=new T.Mesh(new T.CylinderGeometry(.62,.62,.05,48),nogal);tope.position.y=.78;mesa.add(tope);
  const pie=new T.Mesh(new T.LatheGeometry([new T.Vector2(.3,0),new T.Vector2(.28,.04),new T.Vector2(.08,.08),new T.Vector2(.05,.3),new T.Vector2(.07,.5),new T.Vector2(.05,.74),new T.Vector2(.12,.76)],24),nogal);mesa.add(pie);

  const regalo=new T.Object3D();regalo.position.set(0,1.25,-7.0);S.add(regalo);
  focoMesa=new T.SpotLight('#ffe2b8',0,7,.52,.85,2);focoMesa.position.set(0,2.25,-7.05);focoMesa.target=regalo;focoMesa.castShadow=true;focoMesa.shadow.mapSize.set(1024,1024);focoMesa.shadow.bias=-.0004;S.add(focoMesa);


  lampCono=new T.Mesh(new T.ConeGeometry(.78,1.25,48,1,true),new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide,
    uniforms:{uOp:{value:0}},
    vertexShader:'varying float vH;varying vec3 vN;varying vec3 vP;void main(){vH=(position.y+.625)/1.25;vec4 mv=modelViewMatrix*vec4(position,1.);vP=mv.xyz;vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*mv;}',
    fragmentShader:'uniform float uOp;varying float vH;varying vec3 vN;varying vec3 vP;void main(){float f=abs(dot(normalize(vN),normalize(-vP)));float a=uOp*pow(f,2.2)*pow(vH,1.6)*.55;gl_FragColor=vec4(vec3(1.,.86,.66)*a,a);}'}));
  lampCono.position.set(0,1.66,-7.05);S.add(lampCono);
  lampBulbo=new T.Mesh(new T.SphereGeometry(.045,16,12),new T.MeshBasicMaterial({color:'#fff1d6'}));lampBulbo.position.set(0,2.33,-7.05);S.add(lampBulbo);
  const rebote=new T.PointLight('#ffcf98',0,3.5,2);rebote.position.set(0,2.2,-7.05);S.add(rebote);lampBulbo.userData.rebote=rebote;

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
    comp=new T.EffectComposer(R);comp.addPass(new T.RenderPass(S,C));comp.addPass(new T.UnrealBloomPass(new T.Vector2(W(),H()),.65,.5,.9));
    comp.addPass(new T.ShaderPass({uniforms:{tDiffuse:{value:null},uT:{value:0},uF:{value:0}},
      vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader:`uniform sampler2D tDiffuse;uniform float uT;uniform float uF;varying vec2 vUv;
        float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233))+uT)*43758.5453);}
        vec3 srgb(vec3 c){return mix(c*12.92,1.055*pow(c,vec3(1./2.4))-.055,step(.0031308,c));}
        void main(){vec3 c=texture2D(tDiffuse,vUv).rgb;c=srgb(max(c,0.));float d=distance(vUv,vec2(.5));c*=smoothstep(.85,.32,d);c+=(h(vUv*800.)-.5)*.045;c*=1.-uF;gl_FragColor=vec4(c,1.);}`}));
    comp.passes[2].renderToScreen=true;R.outputEncoding=T.LinearEncoding}catch(e){console.warn(e);comp=null;R.outputEncoding=T.sRGBEncoding}}
  // modelos fotográficos de Poly Haven (CC0)
  if(T.GLTFLoader){const gl=new T.GLTFLoader(LM);
    const mod=(n,f)=>gl.load('pbr/m/'+n+'/'+n+'.gltf',g=>{const o=g.scene;o.traverse(m=>{if(m.isMesh){m.castShadow=m.receiveShadow=true;if(m.material)m.material.envMapIntensity=.35}});f(o)});
    const P2=Math.PI/2;const pon=(o,x,y,z,ry=0,e=1)=>{o.position.set(x,y,z);o.rotation.y=ry;o.scale.setScalar(e);S.add(o);return o};
    mod('round_wooden_table_01',o=>pon(o,0,.3,-7.0,0,.75));
    mod('hanging_industrial_lamp',o=>pon(o,0,3.6,-7.05,0,1));
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
    mod('alarm_clock_01',o=>pon(o,40.47,-19.97+.07,39.98,-.5,1));
    mod('desk_lamp_arm_01',o=>pon(o,39.45,-19.97+.09,39.68,.9,1));
    mod('vintage_flashlight',o=>{const a=o.clone();a.scale.setScalar(.75);a.rotation.y=P2;linMesa.add(a);linMesa.children.forEach(c=>{if(c!==a)c.visible=false});
      const b=o.clone();b.scale.setScalar(.5);b.rotation.y=Math.PI;b.position.set(0,-.03,.02);linternaObj.add(b);linternaObj.children.forEach(c=>{if(c!==b)c.visible=false})});
    mod('planter_pot_clay',o=>{macetas.forEach(g=>{const c=o.clone();c.scale.setScalar(1.15);g.add(c)})});
    mod('dead_tree_trunk',o=>pon(o,-3.2,0,7.5,.6,1.2));
    mod('tree_stump_01',o=>pon(o,3.4,0,8.8,0,1));
    mod('rock_moss_set_01',o=>pon(o,-7.2,0,2.5,1,1));
    mod('fern_02',o=>{[[-1.4,4.5],[1.6,5.8],[-2.6,2.6],[2.7,2.9],[-.9,9],[6,4],[-6,6]].forEach(([x,z],i)=>{const c=o.clone();pon(c,x,0,z,i*1.3,rnd(.8,1.3))})});
  }
  if(T.RGBELoader){new T.RGBELoader(LM).setDataType(T.UnsignedByteType).load('pbr/noche.hdr',h=>{const pm=new T.PMREMGenerator(R);S.environment=pm.fromEquirectangular(h).texture;
    const cubo=new T.WebGLCubeRenderTarget(1024).fromEquirectangularTexture(R,h);S.background=cubo.texture;cieloM.visible=false;h.dispose();pm.dispose()})}
  reloj=new T.Clock();
  addEventListener('resize',()=>{R.setSize(W(),H());if(comp)comp.setSize(W(),H());C.aspect=W()/H();C.fov=W()<H()?76:60;C.updateProjectionMatrix()});
  listo=true;
}

/* ---------- recorrido ---------- */
const V=(x,y,z)=>new T.Vector3(x,y,z);
const RUTA=[
  [0,   V(40.01,-19.4,40.26), V(40.01,-19.96,39.98), 0],   // el escritorio (pantalla de carga)
  [1.3, V(40.01,-19.4,40.26), V(40.0,-19.96,40.02),  0],   // la mano toma la linterna
  [2.3, V(40.06,-19.72,40.1), V(40.07,-19.96,39.985),0],   // se acerca a la lista mientras se oscurece
  [2.6, V(-1.3,1.6,11.2),  V(-.2,1.7,0),    0],   // afuera, el auto queda atrás: mirando la casa
  [3.7, V(-1.3,1.62,11.1), V(0,1.75,0),     0],
  [9.2, V(0,1.62,3.05),    V(.1,1.25,2.1),  1],   // hasta la cinta
  [10.0,V(0,1.62,3.05),    V(.1,1.3,2.1),   0],
  [11.3,V(.05,1.15,1.7),   V(.2,1.25,0),    1],   // por debajo de la cinta
  [12.4,V(.15,1.9,.8),     V(.3,1.3,0),     1],   // frente a la puerta
  [16.4,V(.15,1.9,.8),     V(.3,1.3,0),     0],
  [17.2,V(.05,1.9,.55),    V(0,1.6,-6),     0],   // el pasillo
  [19.6,V(0,1.9,-2.7),     V(0,1.55,-6),    1],
  [20.8,V(-.75,1.9,-3.5),  V(-4.8,2.35,-4.6),1],  // se asoma al cuarto del caso: la carita
  [22.4,V(-.8,1.9,-3.5),   V(-3.8,.9,-4.6), 0],   // la cama
  [24.0,V(-.8,1.9,-3.5),   V(-2.6,1.95,-.2),0],   // el tablero
  [25.2,V(-.8,1.9,-3.5),   V(-2.9,1.75,-.2),0],
  [25.9,V(-.5,1.9,-3.7),   V(-.2,1.6,-7.5), 0],   // vuelve la vista al pasillo
  [26.9,V(.15,1.9,-5.1),   V(4.8,2.1,-5.1), 1],   // el cuarto de BTS
  [28.4,V(.2,1.9,-5.1),    V(2.8,1.5,-7.7), 0],
  [29.6,V(0,1.9,-5.0),     V(0,1.3,-7.0),   0],   // al fondo del pasillo: el regalo
  [31.0,V(0,1.9,-5.0),     V(0,1.35,-7.0),  0],
  [33.6,V(0,1.72,-6.0),    V(0,1.25,-7.0),  1],
  [34.6,V(0,1.72,-6.0),    V(0,1.25,-7.0),  0],
];
const FIN=38.0;
const suave=x=>x*x*(3-2*x);
let fase=0;
const cr=(p0,p1,p2,p3,u)=>{const u2=u*u,u3=u2*u;return V(
  .5*((2*p1.x)+(-p0.x+p2.x)*u+(2*p0.x-5*p1.x+4*p2.x-p3.x)*u2+(-p0.x+3*p1.x-3*p2.x+p3.x)*u3),
  .5*((2*p1.y)+(-p0.y+p2.y)*u+(2*p0.y-5*p1.y+4*p2.y-p3.y)*u2+(-p0.y+3*p1.y-3*p2.y+p3.y)*u3),
  .5*((2*p1.z)+(-p0.z+p2.z)*u+(2*p0.z-5*p1.z+4*p2.z-p3.z)*u2+(-p0.z+3*p1.z-3*p2.z+p3.z)*u3))};
const ruido1=t=>Math.sin(t*1.31)*.5+Math.sin(t*2.73+1.3)*.3+Math.sin(t*.71+2.1)*.2;
let mirada=null,paso=0;
function camara(t,dt){
  if(zoomK>=0){if(!zIni){zIni=C.position.clone();zMir=mirada.clone()}
    const k=suave(Math.min(1,zoomK)),pz=zIni.clone().lerp(V(0,1.42,-6.28),k),lz=zMir.clone().lerp(V(0,1.27,-7.0),k);
    const b=Math.sin(k*Math.PI*2)*.02*(1-k);C.position.set(pz.x+b*.6,pz.y-Math.abs(b),pz.z);C.lookAt(lz);return}
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
   linternaObj.rotation.y=.1+sx*1.5;manoL.rotation.z=1.35+sx*.8}
  const enMesa=t<2.55;manoL.visible=linternaObj.visible=!enMesa&&!fin2;linterna.intensity=enMesa?0:(apagonT<0?3.2:linterna.intensity);
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
  e(.25,()=>{manoA='lint';manoEst='sube'});
  e(1.0,()=>{manoEst='agarra';sonar('pestillo')});
  e(1.35,()=>manoEst='levanta');
  e(1.7,()=>fadeObj=1);
  e(2.55,()=>{fadeObj=0;lampEsc.intensity=0;manoEst='fuera';linMesa.visible=false;sonar('hoja')});
  e(.06,()=>sonar('escena','escritorio'));e(2.6,()=>sonar('escena','afuera'));
  e(2.9,()=>sonar('portazo'));e(3.4,()=>sonar('radio'));
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
  e(22.6,()=>{flashT=0;sonar('flash')});
  e(26.6,()=>sonar('escena','bts'));
  e(29.7,()=>{focoT=0;sonar('descubre');sonar('escena','regalo')});
  e(34.8,()=>{apagonT=0;sonar('apagon');sonar('escena','nada')});
  e(37.6,()=>sonar('alivio'));
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
function cuadroLoop(){
  if(!listo)return;requestAnimationFrame(cuadroLoop);
  const dt=Math.min(reloj.getDelta(),.05);
  const t=corriendo?(window.Intro3D._fijo!=null?window.Intro3D._fijo:(performance.now()-t0)/1000):0;
  camara(Math.min(t,FIN),corriendo?dt:0);
  if(corriendo)ev.forEach(x=>{if(!x.hecho&&t>=x.t){x.hecho=true;x.f()}});
  puerta.rotation.y+=(puertaObj-puerta.rotation.y)*Math.min(1,dt*puertaVel*2.2);
  pintaManoR(dt);
  autoPuerta.rotation.y+=(autoObj-autoPuerta.rotation.y)*Math.min(1,dt*(autoObj?1.8:5));
  {const ph=Math.floor(performance.now()/140)%4,on=C.position.y<-5?0:C.position.z>.3?1.4:.35;sirena[0].intensity=(ph===0||ph===2?2.6:0)*on;sirena[1].intensity=(ph===1||ph===3?2.6:0)*on;sirena[2].material.color.set(ph%2?'#300':'#ff1a1a');sirena[3].material.color.set(ph%2?'#2a5bff':'#012')}
  cintaP.position.y+=((cintaObj?1.62:1.18)-cintaP.position.y)*Math.min(1,dt*4);cintaP.rotation.x+=((cintaObj?-.5:0)-cintaP.rotation.x)*Math.min(1,dt*4);
  {lluvia.visible=C.position.z>-.2;const a=lluvia.geometry.attributes.position,arr=a.array,cz=C.position.z;for(let i=0;i<arr.length;i+=6){arr[i+1]-=dt*9;arr[i+4]-=dt*9;if(arr[i+4]<0){const y=rnd(7,9);arr[i+1]=y;arr[i+4]=y-.32;const z=cz+rnd(-8,14);arr[i+2]=z;arr[i+5]=z}}a.needsUpdate=true}
  if(apagonT>=0){apagonT+=dt;const seq=[[0,1],[.12,.15],[.22,1],[.42,.05],[.52,.7],[.68,0],[2.3,.5],[2.38,0],[2.52,1]];let v=1;for(const [tt,vv] of seq)if(apagonT>=tt)v=vv;
    focoMesa.intensity=v*3;lampCono.material.uniforms.uOp.value=v;linterna.intensity=apagonT<.68?3.2*v:0;if(apagonT>.8){if(zoomK<0){zoomK=0;manoL.visible=linternaObj.visible=false}zoomK=Math.min(1,(apagonT-.8)/1.3);if(zoomK>.3&&!camara.p1){camara.p1=1;pisada()}if(zoomK>.75&&!camara.p2){camara.p2=1;pisada()}}}
  if(flashT>=0){flashT+=dt;flashL.intensity=flashT<.08?9:flashT<.16?0:flashT<.24?6:0;if(flashT>.3){flashT=-1;flashL.intensity=0}}
  if(lampBulbo){const vv=focoMesa.intensity/3;lampBulbo.material.color.setScalar(.15+.85*vv);lampBulbo.userData.rebote.intensity=vv*.5}
  if(regaloMat){const luz=focoT<0?.04:Math.max(.04,focoMesa.intensity/3)*1.05;regaloMat.color.setScalar(luz)}
  if(fundeT>=0&&regaloMat){fundeT+=dt;regaloMat.opacity=Math.max(0,1-fundeT/fundeDur);if(regaloMat.opacity<=0){regaloPlano.visible=false;fundeT=-1}}
  parpadeo.forEach(([v,b],i)=>{const f=.78+Math.sin(performance.now()*.011+i*2)*.12+rnd(-.12,.12);if(v.isLight)v.intensity=b*f;else if(v.material)v.material.opacity=b*f});
  if(focoT>=0){focoT+=dt;const seq=[[0,1],[.12,0],[.2,1],[.32,.1],[.42,1],[.55,.3],[.65,1]];let v=1;for(const [tt,vv] of seq)if(focoT>=tt)v=vv;focoMesa.intensity=v*3;lampCono.material.uniforms.uOp.value=v}
  polvo.rotation.y+=dt*.008;
  if(comp){fadeVal+=(fadeObj-fadeVal)*Math.min(1,dt*7);comp.passes[2].uniforms.uT.value=performance.now()%1000;comp.passes[2].uniforms.uF.value=fadeVal;comp.render()}else R.render(S,C);
  if(corriendo&&t>=FIN&&alTerminar){const f=alTerminar;alTerminar=null;f()}
}

window.Intro3D={
  preparar(cv,prog,listo){cargaProg=prog;cargaListo=listo;construir(cv);camara(0,0);reloj.getDelta();cuadroLoop();if(!T.GLTFLoader)setTimeout(()=>{cargado=true;listo&&listo()},50)},
  get cargado(){return cargado},
  rectRegalo(){if(!regaloPlano)return{x:0,y:0,w:0,h:0};let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;const w=regaloPlano.userData.w/2,h=regaloPlano.userData.h/2;
    [[-w,-h],[w,-h],[-w,h],[w,h]].forEach(([x,y])=>{const p=regaloPlano.localToWorld(V(x,y,0)).project(C);const sx=(p.x*.5+.5)*W(),sy=(-p.y*.5+.5)*H();x0=Math.min(x0,sx);x1=Math.max(x1,sx);y0=Math.min(y0,sy);y1=Math.max(y1,sy)});return{x:x0,y:y0,w:x1-x0,h:y1-y0}},
  fundeRegalo(ms){fundeDur=ms/1000;fundeT=0;manoL.visible=linternaObj.visible=false},
  // el regalo dibujado (capturado del SVG de la página) como una tarjeta en la mesa
  ponRegalo(canvas){const t=new T.CanvasTexture(canvas);t.encoding=T.sRGBEncoding;t.anisotropy=8;
    regaloMat=new T.MeshBasicMaterial({map:t,transparent:true,toneMapped:false,fog:false,depthWrite:false});const w=.5,h=w*380/340;
    regaloPlano=new T.Mesh(new T.PlaneGeometry(w,h),regaloMat);regaloPlano.userData={w,h};
    regaloPlano.position.set(0,1.05+(350-190)/380*h,-7.0);regaloPlano.lookAt(V(0,1.42,-6.28));regaloPlano.renderOrder=5;S.add(regaloPlano);
    const sh=new T.Mesh(new T.CircleGeometry(.3,32),new T.MeshBasicMaterial({color:'#000',transparent:true,opacity:.55,depthWrite:false}));sh.rotation.x=-Math.PI/2;sh.scale.y=.45;sh.scale.x=.78;sh.position.set(.02,1.053,-6.98);S.add(sh)},
  correr(api,fin){pisada=api.paso||pisada;sonar=api.sonar||sonar;linea();alTerminar=fin;t0=performance.now();corriendo=true},
  parar(){listo=false;try{R.dispose()}catch(e){}},
  get FIN(){return FIN}
};
})();
