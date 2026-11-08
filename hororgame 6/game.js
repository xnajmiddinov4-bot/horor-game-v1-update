const $=i=>document.getElementById(i),R=Math.random,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const touch=window.matchMedia?window.matchMedia("(hover: none) and (pointer: coarse)").matches:(("ontouchstart" in window)&&!/Windows|Macintosh|Linux x86/.test(navigator.userAgent));
if(touch)document.body.classList.add("t");

/* ---------- renderer ---------- */
function fatal(t){const e=new Error(t);e.handled=true;window.__fatalShown=true;if(window.showGameError)window.showGameError(t);throw e}
if(!window.THREE)fatal("Three.js yuklanmadi. Internet aloqasini tekshiring yoki lib/three.min.js faylini joylashtiring.");
let ren;
try{ren=new THREE.WebGLRenderer({antialias:true})}
catch(e1){try{ren=new THREE.WebGLRenderer({antialias:false})}
 catch(e2){fatal("Brauzeringiz WebGL ni ishga tushira olmadi. Brauzerda «Hardware acceleration» ni yoqing, grafik drayverni yangilang yoki Chrome/Edge ning yangi versiyasidan foydalaning.")}}
ren.setPixelRatio(Math.min(devicePixelRatio,2));
ren.shadowMap.enabled=true;ren.shadowMap.type=THREE.PCFSoftShadowMap;
$("g").appendChild(ren.domElement);
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x020203);
scene.fog=new THREE.FogExp2(0x030304,.085);
const cam=new THREE.PerspectiveCamera(70,1,.05,60);
cam.rotation.order="YXZ";scene.add(cam);
function rs(){ren.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()}
addEventListener("resize",rs);rs();

/* ---------- textures ---------- */
function mkTex(w,h,draw,rx,ry){const c=document.createElement("canvas");c.width=w;c.height=h;draw(c.getContext("2d"),w,h);
 const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,ry);t.anisotropy=4;return t}
const woodT=mkTex(256,256,(g,w,h)=>{for(let i=0;i<8;i++){g.fillStyle=`hsl(25,34%,${16+R()*13}%)`;g.fillRect(i*32,0,32,h);
 for(let j=0;j<45;j++){g.fillStyle=`rgba(0,0,0,${R()*.28})`;g.fillRect(i*32+R()*30,R()*h,1+R()*2,10+R()*70)}
 g.fillStyle="#0e0804";g.fillRect(i*32,0,2,h)}},5,4);
const wallT=mkTex(256,256,(g,w,h)=>{g.fillStyle="#3b3427";g.fillRect(0,0,w,h);
 for(let x=0;x<w;x+=32){g.fillStyle="rgba(0,0,0,.18)";g.fillRect(x,0,16,h)}
 for(let i=0;i<28;i++){g.fillStyle=`rgba(12,6,0,${R()*.22})`;g.beginPath();g.arc(R()*w,R()*h,5+R()*32,0,7);g.fill()}
 g.fillStyle="#1d150d";g.fillRect(0,h-40,w,40);g.fillStyle="#0b0705";g.fillRect(0,h-42,w,3)},1,1);
const furT=woodT.clone();furT.repeat.set(1,1);furT.needsUpdate=true;

/* ---------- world ---------- */
const cols=[],mFur=new THREE.MeshStandardMaterial({map:furT,roughness:.8,color:0xaa8866}),
 mCloth=new THREE.MeshStandardMaterial({color:0x3a2222,roughness:1}),
 mDark=new THREE.MeshStandardMaterial({color:0x1c1510,roughness:.9}),
 mGreen=new THREE.MeshStandardMaterial({color:0x2a3326,roughness:1});
function box(x,y,z,w,h,d,mat,col=1){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);
 m.castShadow=m.receiveShadow=true;scene.add(m);if(col)cols.push({x1:x-w/2,x2:x+w/2,z1:z-d/2,z2:z+d/2});return m}
function wmat(len){const t=wallT.clone();t.repeat.set(len/3,1);t.needsUpdate=true;return new THREE.MeshStandardMaterial({map:t,roughness:.95})}
function wall(x1,z1,x2,z2){if(z1==z2){const l=x2-x1+.3;box((x1+x2)/2,1.5,z1,l,3,.3,wmat(l))}
 else{const l=z2-z1;box(x1,1.5,(z1+z2)/2,.3,3,l,wmat(l))}}
const fl=new THREE.Mesh(new THREE.PlaneGeometry(20,16),new THREE.MeshStandardMaterial({map:woodT,roughness:.85}));
fl.rotation.x=-Math.PI/2;fl.position.set(10,0,8);fl.receiveShadow=true;scene.add(fl);
const ce=new THREE.Mesh(new THREE.PlaneGeometry(20,16),new THREE.MeshStandardMaterial({color:0x1a1612}));
ce.rotation.x=Math.PI/2;ce.position.set(10,3,8);scene.add(ce);

wall(0,0,20,0);wall(0,0,0,16);wall(20,0,20,16);
wall(0,16,9.4,16);wall(10.6,16,20,16);
wall(0,8,2.9,8);wall(4.1,8,9.4,8);wall(10.6,8,15.9,8);wall(17.1,8,20,8);
wall(7,0,7,3.4);wall(7,4.6,7,8);wall(13,0,13,8);

/* doors */
const doors=[];
function door(hx,hz,w,axis,exit){const p=new THREE.Group();p.position.set(hx,0,hz);scene.add(p);
 const m=new THREE.MeshStandardMaterial({map:furT,roughness:.8,color:exit?0x775533:0x8a6a48});
 const d=axis=="x"?new THREE.Mesh(new THREE.BoxGeometry(w,2.4,.12),m):new THREE.Mesh(new THREE.BoxGeometry(.12,2.4,w),m);
 d.position.set(axis=="x"?w/2:0,1.2,axis=="x"?0:w/2);d.castShadow=d.receiveShadow=true;p.add(d);
 const kn=new THREE.Mesh(new THREE.SphereGeometry(.05,8,8),new THREE.MeshStandardMaterial({color:0xaa8833,metalness:.8,roughness:.4}));
 kn.position.set(axis=="x"?w-.15:.1,1.1,axis=="x"?.1:w-.15);p.add(kn);
 const lw=axis=="x"?w:.3,ld=axis=="x"?.3:w;
 box(axis=="x"?hx+w/2:hx,2.7,axis=="x"?hz:hz+w/2,lw,.6,ld,wmat(w),0);
 const c=axis=="x"?{x1:hx,x2:hx+w,z1:hz-.08,z2:hz+.08}:{x1:hx-.08,x2:hx+.08,z1:hz,z2:hz+w};cols.push(c);
 doors.push({p,c,open:false,exit,ang:exit?-Math.PI/2:Math.PI/2,cx:(c.x1+c.x2)/2,cz:(c.z1+c.z2)/2})}
door(2.9,8,1.2,"x");door(9.4,8,1.2,"x");door(15.9,8,1.2,"x");door(7,3.4,1.2,"z");
door(9.4,16,1.2,"x",true);const EXIT=doors[4];

/* furniture */
function table(x,z,w,d,h){box(x,h,z,w,.08,d,mFur,0);
 for(const sx of[-1,1])for(const sz of[-1,1])box(x+sx*(w/2-.08),h/2,z+sz*(d/2-.08),.08,h,.08,mFur,0);
 cols.push({x1:x-w/2,x2:x+w/2,z1:z-d/2,z2:z+d/2})}
// bedroom
box(1.3,.3,1.9,1.6,.35,2.8,mCloth);box(1.3,.75,.45,1.7,1.0,.12,mFur,0);box(1.3,.55,.8,.9,.2,.5,new THREE.MeshStandardMaterial({color:0x555044}),0);
box(2.9,.3,.7,.5,.6,.5,mFur);box(6.5,.5,5,.6,1,1.6,mFur);box(.5,1.1,6.4,.7,2.2,1.4,mFur);
// middle room
table(10,3.2,2.2,1.2,.8);box(9,.22,4.6,.45,.45,.45,mFur,0).rotation.y=.5;box(10.9,.22,1.6,.45,.45,.45,mFur,0).rotation.y=-.3;
box(11.5,1.1,6.7,1.3,2.2,.8,mFur);box(8,.4,.6,.8,.8,.8,mFur);
// storage room
box(19.6,1.1,3,.5,2.2,3.5,mFur);box(14.5,.4,1.2,.8,.8,.8,mFur);box(15.3,.3,1.1,.6,.6,.6,mFur);box(14.7,1.0,1.2,.5,.4,.5,mFur,0);
box(17,.5,6,.8,1,.8,mDark);box(15.5,.5,6.8,.5,1,.5,mDark);
// living room
box(4.5,.25,11.6,3,.5,1,mGreen);box(4.5,.75,12.0,3,.6,.25,mGreen,0);box(3.1,.45,11.6,.25,.5,1,mGreen,0);box(5.9,.45,11.6,.25,.5,1,mGreen,0);
table(4.5,9.8,1.4,.8,.4);box(.5,1,12.5,.6,2,1.6,mFur);box(19.6,.7,11,.6,1.4,2,mDark);
box(14,.3,11,.8,.6,.8,mCloth);box(15,.6,15.5,3,1.2,.6,mFur);box(10,.9,10.8,.1,0,0,mDark,0);
for(const x of[3.5,10,16.5]){const f=box(x,1.8,.18,.8,1,.05,mDark,0);f.rotation.z=(R()-.5)*.15}

/* keys */
const keys=[];
function mkKey(x,y,z){const g=new THREE.Group(),m=new THREE.MeshStandardMaterial({color:0xd4a017,metalness:.8,roughness:.3,emissive:0x664400});
 const r=new THREE.Mesh(new THREE.TorusGeometry(.05,.015,8,16),m);r.position.x=-.08;
 const s=new THREE.Mesh(new THREE.BoxGeometry(.18,.02,.02),m),t=new THREE.Mesh(new THREE.BoxGeometry(.02,.05,.02),m);t.position.set(.07,-.03,0);
 g.add(r,s,t);g.scale.setScalar(1.5);g.position.set(x,y,z);g.rotation.x=Math.PI/2;scene.add(g);keys.push({g,x,z})}
mkKey(6.5,1.05,5);mkKey(12.5,.08,7.5);mkKey(15.5,1.25,15.5);

/* lights */
scene.add(new THREE.AmbientLight(0x20202c,.45));
const rl=[];for(const[x,z]of[[3.5,4],[10,4],[16.5,4],[5,12],[15,12]]){const l=new THREE.PointLight(0xff9a50,.3,8,1.6);l.position.set(x,2.6,z);l.b=.3;scene.add(l);rl.push(l)}
const sp=new THREE.SpotLight(0xfff0cc,1.8,22,.5,.5,1.3);sp.position.set(.15,-.1,0);sp.castShadow=true;sp.shadow.mapSize.set(512,512);sp.shadow.bias=-.0005;
sp.target.position.set(0,0,-1);cam.add(sp);cam.add(sp.target);

/* ghost */
const gh=new THREE.Group(),gm=new THREE.MeshStandardMaterial({color:0x060606,emissive:0x0c0000,roughness:1});
const gBody=new THREE.Mesh(new THREE.CylinderGeometry(.2,.34,1.5,10),gm);gBody.position.set(0,.8,0);gh.add(gBody);
const gHead=new THREE.Mesh(new THREE.SphereGeometry(.2,12,10),gm);gHead.position.set(0,1.75,0);gh.add(gHead);
for(const s of[-1,1]){const a=new THREE.Mesh(new THREE.CylinderGeometry(.05,.04,1.1,6),gm);a.position.set(s*.32,1.1,.05);a.rotation.z=s*.12;gh.add(a);
 const e=new THREE.Mesh(new THREE.SphereGeometry(.03,6,6),new THREE.MeshBasicMaterial({color:0xffffff}));e.position.set(s*.07,1.78,.17);gh.add(e)}
gh.scale.setScalar(1.15);gh.visible=false;scene.add(gh);
const spots=[[3,4],[10,5.5],[17,4],[4,13],[10,13],[17,12.5],[10,9.5]];

/* ---------- audio ---------- */
let AC,mg,nb;
function initA(){try{AC=new(window.AudioContext||window.webkitAudioContext)();mg=AC.createGain();mg.gain.value=.8;mg.connect(AC.destination);
 nb=AC.createBuffer(1,AC.sampleRate*2,AC.sampleRate);const d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=R()*2-1;
 [55,55.8,82.4].forEach((f,i)=>{const o=AC.createOscillator(),g=AC.createGain(),l=AC.createBiquadFilter();o.type=i==2?"sine":"sawtooth";o.frequency.value=f;
  l.type="lowpass";l.frequency.value=170;g.gain.value=.045;o.connect(l);l.connect(g);g.connect(mg);o.start()})}catch(e){AC=null}}
function out(n,p){if(p!=null&&AC.createStereoPanner){const s=AC.createStereoPanner();s.pan.value=p;n.connect(s);s.connect(mg)}else n.connect(mg)}
function nz(d,f,q,v,ty,p){if(!AC)return;const s=AC.createBufferSource(),b=AC.createBiquadFilter(),g=AC.createGain(),t=AC.currentTime;
 s.buffer=nb;s.loop=true;b.type=ty||"bandpass";b.frequency.value=f;b.Q.value=q;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+d*.3);g.gain.linearRampToValueAtTime(0,t+d);
 s.connect(b);b.connect(g);out(g,p);s.start(t);s.stop(t+d+.05);return b}
function tn(f1,f2,d,v,ty,p){if(!AC)return;const o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime;o.type=ty||"sine";
 o.frequency.setValueAtTime(f1,t);o.frequency.exponentialRampToValueAtTime(f2,t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);
 o.connect(g);out(g,p);o.start(t);o.stop(t+d+.05)}
const pan=()=>R()*2-1,
 creak=()=>{const p=pan();tn(80,210,1.1,.1,"sawtooth",p);nz(1,900,3,.08,"bandpass",p)},
 thump=()=>tn(70,25,.5,.7,"sine",pan()),
 knock=()=>{const p=pan();for(let i=0;i<3;i++)setTimeout(()=>tn(160,60,.15,.6,"triangle",p),i*260)},
 whisper=()=>{const b=nz(2.2,1800,4,.14,"bandpass",pan());if(b)b.frequency.linearRampToValueAtTime(3600,AC.currentTime+2)},
 scream=()=>{tn(500,1500,1.2,.3,"sawtooth");tn(760,2200,1.2,.14,"square")},
 chime=()=>{tn(1500,2000,.5,.18);setTimeout(()=>tn(2000,2600,.5,.14),120)},
 step=r=>nz(.09,250,1,r?.32:.2,"lowpass"),
 click=()=>tn(1800,900,.05,.1,"square");

/* ---------- state & input ---------- */
const S={on:false,pause:false,keys:0,run:false,fl:true,yaw:0,pitch:0},P={x:3,z:13},joy={x:0,f:0},k={};
let bob=0,lastS=0,gT=22,gV=0,flk=0,bad=0,mt,hadPointerLock=false;
// multiplayer yordamchilari: MP da host — yagona haqiqat manbai (netsync.js)
const MPon=()=>!!(window.NET&&NET.on),MPg=()=>MPon()&&NET.role=="guest",myId=()=>MPg()?"g":"h";
function msg(t,ms=3500){const m=$("ms");m.textContent=t;m.style.opacity=1;clearTimeout(mt);mt=setTimeout(()=>m.style.opacity=0,ms)}
function begin(){
 if(S.on)return;
 initA();
 $("menu").classList.add("h");
 S.on=true;S.pause=false;
 msg("O‘yin boshlandi. WASD bilan yuring, sichqoncha bilan qarang. F — fonar.",5000);
 if(!touch && ren.domElement.requestPointerLock){
   try { const result=ren.domElement.requestPointerLock(); if(result&&result.catch)result.catch(()=>msg("Sichqoncha boshqaruvi uchun o‘yin maydonini bosing. Hozircha klaviatura bilan yurishingiz mumkin.",6000)); }
   catch(e){msg("Sichqoncha boshqaruvi bloklandi. O‘yin maydonini bosing.",5000)}
 }
 setTimeout(scare,9000);
}
$("go").onclick=begin;
function pause(v){if(!S.on)return;S.pause=v;if(MPon()&&window.NW)NW.paused(v);$("pause").classList.toggle("h",!v);if(AC)v?AC.suspend():AC.resume();if(v&&document.exitPointerLock)document.exitPointerLock()}
$("res").onclick=()=>{pause(false);if(!touch){try{const r=ren.domElement.requestPointerLock();if(r&&r.catch)r.catch(()=>{})}catch(e){}}};
document.addEventListener("pointerlockchange",()=>{
 if(document.pointerLockElement){hadPointerLock=true;return;}
 // Do not pause on the first failed/blocked pointer-lock request.
 if(hadPointerLock&&S.on&&!S.pause&&!touch&&!(window.STORY&&STORY.ui))pause(true);
});
ren.domElement.addEventListener("click",()=>{
 if(S.on&&!S.pause&&!touch&&!document.pointerLockElement&&ren.domElement.requestPointerLock){
  try{const result=ren.domElement.requestPointerLock();if(result&&result.catch)result.catch(()=>{});}catch(e){}
 }
});
document.addEventListener("visibilitychange",()=>{if(document.hidden&&S.on&&!S.pause)pause(true)});
document.addEventListener("mousemove",e=>{if(S.on&&!S.pause&&document.pointerLockElement){S.yaw-=e.movementX*.0022;S.pitch=clamp(S.pitch-e.movementY*.0022,-1.4,1.4)}});
addEventListener("keydown",e=>{k[e.code]=1;if(!S.on||e.repeat)return;if(e.code=="KeyE")act();if(e.code=="KeyF")flash();if(e.code=="KeyP")pause(!S.pause)});
addEventListener("keyup",e=>delete k[e.code]);
function flash(){if(!S.on||S.pause)return;S.fl=!S.fl;sp.visible=S.fl;click()}
// touch
let jid=null,jo,lid=null,lp;
addEventListener("touchstart",e=>{if(!S.on||S.pause||(window.STORY&&STORY.ui))return;for(const t of e.changedTouches){if(t.target.closest&&t.target.closest("button"))continue;
 if(t.clientX<innerWidth/2&&jid==null){jid=t.identifier;jo={x:t.clientX,y:t.clientY};const b=$("jb");b.style.display="block";b.style.left=jo.x+"px";b.style.top=jo.y+"px"}
 else if(lid==null){lid=t.identifier;lp={x:t.clientX,y:t.clientY}}}},{passive:false});
addEventListener("touchmove",e=>{if(window.STORY&&STORY.ui)return;e.preventDefault();for(const t of e.changedTouches){
 if(t.identifier==jid){const dx=clamp((t.clientX-jo.x)/45,-1,1),dy=clamp((t.clientY-jo.y)/45,-1,1);joy.x=dx;joy.f=-dy;$("jk").style.transform=`translate(${dx*30}px,${dy*30}px)`}
 else if(t.identifier==lid){S.yaw-=(t.clientX-lp.x)*.005;S.pitch=clamp(S.pitch-(t.clientY-lp.y)*.005,-1.4,1.4);lp={x:t.clientX,y:t.clientY}}}},{passive:false});
function tend(e){for(const t of e.changedTouches){if(t.identifier==jid){jid=null;joy.x=joy.f=0;$("jb").style.display="none";$("jk").style.transform=""}if(t.identifier==lid)lid=null}}
addEventListener("touchend",tend);addEventListener("touchcancel",tend);
$("te").onclick=act;$("tf").onclick=flash;$("tp").onclick=()=>pause(true);
$("tr").onclick=()=>{S.run=!S.run;$("tr").style.background=S.run?"rgba(120,20,20,.8)":""};

/* ---------- interaction ---------- */
function near(){let b=null,bd=9;const fx=-Math.sin(S.yaw),fz=-Math.cos(S.yaw);
 const chk=(o,x,z,txt)=>{const dx=x-P.x,dz=z-P.z,d=Math.hypot(dx,dz);if(d<2.2&&d<bd&&(d<.8||(dx*fx+dz*fz)/d>.5)){bd=d;b={o,txt}}};
 for(const q of keys)if(!q.got)chk(q,q.x,q.z,"[E] Kalitni olish");if(window.STORY)STORY.near(chk);if(window.PZ)PZ.near(chk);
 for(const d of doors)chk(d,d.cx,d.cz,d.exit?"[E] Chiqish eshigi":d.open?"[E] Eshikni yopish":"[E] Eshikni ochish");
 return b}
function inDoor(c,x,z){return x>c.x1-.6&&x<c.x2+.6&&z>c.z1-.6&&z<c.z2+.6}
function keyTaken(q,by){// by: MP da kalitni olgan o'yinchi ("h"/"g"); yakka o'yinda undefined
 if(q.got)return;q.got=1;scene.remove(q.g);S.keys++;$("kn").textContent=S.keys;chime();
 const mine=!by||by==myId();if(!MPg())noise(mine?P.x:q.x,mine?P.z:q.z,14);
 if(S.keys==3){msg("Uchala kalit topildi! Chiqish eshigi endi ochiladi.",5000);$("ob").textContent="Maqsad: asosiy eshikka boring va chiqing"}
 else msg((mine?"Kalit topildi (":"Sherigingiz kalit topdi (")+S.keys+"/3)")}
function doorSet(d,open,by){d.open=open;d.c.off=open;creak();const m=!by||by==myId();if(!MPg())noise(m?P.x:d.cx,m?P.z:d.cz,12);if(d.exit&&open)msg("Eshik ochildi — chiqing!")}
function monDoorSnd(dr){const d=Math.hypot(M.x-P.x,M.z-P.z),vol=Math.pow(clamp(1-d/16,0,1),1.3),dd=Math.hypot(dr.cx-P.x,dr.cz-P.z);tn(80,210,1.1,.1+.25*vol,"sawtooth",mPan(dr.cx-P.x,dr.cz-P.z,dd))}
function act(){if(!S.on||S.pause)return;const n=near();if(!n)return;const o=n.o;if(o.clue){STORY.pick(o);return}if(o.pz){PZ.use(o);return}
 if(MPon()&&window.NW){NW.use(o);return}
 if(o.g){keyTaken(o);return}
 if(o.exit&&S.keys<3){msg("Eshik qulflangan. 3 ta kalit kerak ("+S.keys+"/3)");thump();noise(P.x,P.z,12);return}
 const c=o.c;if(o.open&&inDoor(c,P.x,P.z)){msg("Eshik yo‘lida turibsiz");return}
 doorSet(o,!o.open)}

/* ---------- MONSTER AI ---------- */
// Maxluq: patrul qiladi, shovqinni eshitadi, ko'rsa quvadi, yo'qotsa qidiradi. Hech qachon bir joyda turib qolmaydi.
const mdoor=new Set(doors.filter(d=>!d.exit).map(d=>d.c)),MR=.25;
function mHit(x,z,r){for(const c of cols){if(mdoor.has(c))continue;if(x>c.x1-r&&x<c.x2+r&&z>c.z1-r&&z<c.z2+r)return true}return false}
function mFree(ax,az,bx,bz,r){const n=Math.ceil(Math.hypot(bx-ax,bz-az)/.2);for(let i=0;i<=n;i++){const t=n?i/n:0;if(mHit(ax+(bx-ax)*t,az+(bz-az)*t,r))return false}return true}
function sight(ax,az,bx,bz){const n=Math.ceil(Math.hypot(bx-ax,bz-az)/.1);for(let i=1;i<n;i++){const t=i/n,x=ax+(bx-ax)*t,z=az+(bz-az)*t;
 for(const c of cols)if(!c.off&&x>c.x1&&x<c.x2&&z>c.z1&&z<c.z2)return false}return true}
const NODES=[[4,5],[3.5,7.3],[3.5,8.8],[5.8,3.5],[7,3.8],[8,4.5],[9.8,5.5],[10,7.3],[10,8.8],[15.2,4],[16.5,7.3],[16.5,8.8],[16.2,5],
 [2,10],[7.5,10],[12,9.5],[12,12.5],[7.5,13.5],[2.5,14.5],[10,14],[17,12.5],[17.5,9.5],[14,13.5],[18.5,14.5],[10,15.3],[7.5,15],[10,9.8]];
const adj=NODES.map(()=>[]);
for(let i=0;i<NODES.length;i++)for(let j=i+1;j<NODES.length;j++){const a=NODES[i],b=NODES[j],d=Math.hypot(a[0]-b[0],a[1]-b[1]);
 if(d<10&&mFree(a[0],a[1],b[0],b[1],MR)){adj[i].push([j,d]);adj[j].push([i,d])}}
function nearNode(x,z){let b=-1,bd=1e9,fb=0,fd=1e9;NODES.forEach((n,i)=>{const d=Math.hypot(n[0]-x,n[1]-z);if(d<fd){fd=d;fb=i}if(d<bd&&mFree(x,z,n[0],n[1],MR)){bd=d;b=i}});return b>=0?b:fb}
function route(sx,sz,gx,gz,node){const a=nearNode(sx,sz),b=nearNode(gx,gz),dist=NODES.map(()=>1e9),prev=NODES.map(()=>-1),done=[];dist[a]=0;
 for(;;){let u=-1,m=1e9;for(let i=0;i<dist.length;i++)if(!done[i]&&dist[i]<m){m=dist[i];u=i}if(u<0||u==b)break;done[u]=1;
  for(const[v,w]of adj[u])if(dist[u]+w<dist[v]){dist[v]=dist[u]+w;prev[v]=u}}
 if(dist[b]>=1e9)return[[gx,gz]];
 const p=[];for(let u=b;u>=0;u=prev[u])p.unshift(NODES[u]);if(!node)p.push([gx,gz]);
 while(p.length>1&&mFree(sx,sz,p[1][0],p[1][1],MR))p.shift();return p}

// model
const mon=new THREE.Group(),mm=new THREE.MeshStandardMaterial({color:0x0b0908,emissive:0x120303,roughness:1}),
 mEye=new THREE.MeshBasicMaterial({color:0xff1a1a}),monArms=[],monLegs=[];
const mTor=new THREE.Mesh(new THREE.CylinderGeometry(.2,.3,1.1,8),mm);mTor.position.set(0,1.45,0);mTor.rotation.x=.3;mon.add(mTor);
const mHd=new THREE.Mesh(new THREE.SphereGeometry(.17,10,8),mm);mHd.scale.set(.8,1.25,.9);mHd.position.set(0,2.05,.28);mon.add(mHd);
for(const s of[-1,1]){const e=new THREE.Mesh(new THREE.SphereGeometry(.028,6,6),mEye);e.position.set(s*.07,2.1,.42);mon.add(e);
 const a=new THREE.Group();a.position.set(s*.34,1.8,.12);const am=new THREE.Mesh(new THREE.CylinderGeometry(.045,.03,1.5,6),mm);am.position.y=-.75;a.add(am);mon.add(a);monArms.push(a);
 const l=new THREE.Group();l.position.set(s*.13,.95,0);const lm=new THREE.Mesh(new THREE.CylinderGeometry(.08,.05,.95,6),mm);lm.position.y=-.45;l.add(lm);mon.add(l);monLegs.push(l)}
const mGlow=new THREE.PointLight(0xff2010,.5,5,2);mGlow.position.set(0,2,.4);mon.add(mGlow);
mon.traverse(o=>{if(o.isMesh)o.castShadow=true});mon.visible=false;scene.add(mon);
const dg=document.createElement("div");dg.style.cssText="position:fixed;inset:0;z-index:3;pointer-events:none;opacity:0;background:radial-gradient(ellipse at center,transparent 35%,rgba(140,0,0,.7))";document.body.appendChild(dg);

const M={on:false,st:"patrol",t:18,x:0,z:0,ang:0,path:[],tx:0,tz:0,lx:0,lz:0,lost:0,pause:0,rp:0,ft:0,gr:0,hb:0,dgr:0,tm:0,cx:0,cz:0,ck:0,tg:"h",sv:0,sx:0,sz:0,sa:0,got:0};
function mPan(dx,dz,d){return d>.01?clamp((dx*Math.cos(S.yaw)-dz*Math.sin(S.yaw))/d,-1,1):0}
let MT=P;// maxluq e'tibor qaratgan oxirgi nishon (yakka o'yinda — o'yinchi)
function targets(){// maxluq hujum qila oladigan o'yinchilar (MP: tirik, pauzada emas, ulangan)
 if(!MPon())return[{id:"h",x:P.x,z:P.z,fl:S.fl,ok:1}];
 return window.NW?NW.targets():[]}
function aim(){const ts=targets();if(ts.length<2)return ts[0]||{id:"",x:M.x,z:M.z,fl:0,ok:0};
 let b=null,bd=1e9,bs=false;for(const t of ts){const dd=Math.hypot(t.x-M.x,t.z-M.z),s=dd<(t.fl?14:6)&&sight(M.x,M.z,t.x,t.z);if(!b||(s&&!bs)||(s==bs&&dd<bd)){b=t;bd=dd;bs=s}}return b}
function spawnM(){const ts=targets(),c=NODES.filter(n=>ts.every(t=>Math.hypot(n[0]-t.x,n[1]-t.z)>12)),n=(c.length?c:NODES)[Math.floor(R()*(c.length||NODES.length))];
 M.x=n[0];M.z=n[1];M.on=true;M.st="patrol";M.pause=1;mon.visible=true;msg("Uyda nimadir harakatlanmoqda…",4000);creak();if(MPon()&&window.NW)NW.ev("spawn")}
function noise(x,z,r){if(MPg()){if(window.NW)NW.noise(x,z,r);return}if(!M.on||M.st=="chase"||(S.pause&&!MPon()))return;
 if(Math.hypot(x-M.x,z-M.z)<r){M.st="investigate";M.tx=x;M.tz=z;M.path=route(M.x,M.z,x,z);M.pause=0}}
function pickGoal(){// yarmi vaqt o'yinchi tomon "pusadi", yarmi vaqt uyni aylanadi
 const near=nearNode(M.x,M.z);let g;
 if(R()<.5){g=nearNode(MT.x+(R()-.5)*6,MT.z+(R()-.5)*6)}else{do{g=Math.floor(R()*NODES.length)}while(Math.hypot(NODES[g][0]-M.x,NODES[g][1]-M.z)<5)}
 if(g==near)g=(g+1+Math.floor(R()*(NODES.length-1)))%NODES.length;
 M.path=route(M.x,M.z,NODES[g][0],NODES[g][1],true)}
function mStep(x,z,sp,dt){const dx=x-M.x,dz=z-M.z,d=Math.hypot(dx,dz);if(d<.12)return true;const s=Math.min(d,sp*dt),mx=dx/d*s,mz=dz/d*s;
 if(!mHit(M.x+mx,M.z,MR))M.x+=mx;if(!mHit(M.x,M.z+mz,MR))M.z+=mz;
 let da=Math.atan2(dx,dz)-M.ang;da=Math.atan2(Math.sin(da),Math.cos(da));M.ang+=da*Math.min(1,dt*8);return d<.3}
function stinger(){const d=Math.hypot(P.x-M.x,P.z-M.z),pan=mPan(P.x-M.x,P.z-M.z,d);tn(140,50,1.4,.45,"sawtooth",pan);nz(1.2,500,1,.35,"bandpass",pan);
 $("fl").classList.remove("on");void $("fl").offsetWidth;$("fl").classList.add("on");msg("U sizni ko‘rdi! Yuguring!",2500)}
function seen(T){if(!MPon()||T.id==myId())stinger();else msg("Maxluq sherigingizni quvlayapti!",3000);if(MPon()&&window.NW)NW.ev("seen",T.id)}
function gotcha(T){if(!MPon()||!window.NW){caught();return}NW.caught(T.id)}
// model, tovush va ekran qizarishi — har doim LOKAL o'yinchiga nisbatan (host ham, guest ham)
function monFx(dt,sp){
 const dx=P.x-M.x,dz=P.z-M.z,d=Math.hypot(dx,dz),pan=mPan(dx,dz,d),vol=Math.pow(clamp(1-d/16,0,1),1.3),fx=S.on||!MPon();
 M.tm+=dt*(sp?sp*2.6:1);mon.position.set(M.x,0,M.z);mon.rotation.y=M.ang;
 const sw=sp?Math.sin(M.tm)*.6:0;monLegs[0].rotation.x=sw;monLegs[1].rotation.x=-sw;monArms[0].rotation.x=-sw*.5;monArms[1].rotation.x=sw*.5;
 mTor.rotation.x=.3+(M.st=="chase"?.25:0);
 mGlow.intensity=.4+Math.sin(M.tm*.7)*.15;
 if(!fx)return;
 if(sp>0){M.ft-=dt;if(M.ft<=0){M.ft=M.st=="chase"?.28:.55;nz(.14,130,1,.1+vol*1.2,"lowpass",pan);tn(60,28,.2,vol*.6,"sine",pan)}}
 M.gr-=dt;if(M.gr<=0&&d<14){M.gr=M.st=="chase"?2.2:6+R()*5;tn(95,50,1.2,vol*.35,"sawtooth",pan)}
 M.hb-=dt;if(d<10&&M.hb<=0){M.hb=.35+d*.06;const v=.15+(1-d/10)*.5;tn(60,35,.15,v);setTimeout(()=>tn(55,32,.15,v*.7),170)}
 M.dgr+=((d<9?(1-d/9):0)+(M.st=="chase"&&(!MPon()||M.tg==myId())?.3:0)-M.dgr)*Math.min(1,dt*3);dg.style.opacity=clamp(M.dgr,0,1)}
// guest: maxluqni host yuborgan holat bo'yicha ko'rsatadi (AI yo'q)
function monGuest(dt){mon.visible=!!(M.on&&M.got);if(!M.on||!M.got)return;const k1=Math.min(1,dt*12);
 if(Math.hypot(M.sx-M.x,M.sz-M.z)>4){M.x=M.sx;M.z=M.sz}
 M.x+=(M.sx-M.x)*k1;M.z+=(M.sz-M.z)*k1;let da=M.sa-M.ang;da=Math.atan2(Math.sin(da),Math.cos(da));M.ang+=da*k1;monFx(dt,M.sv||0)}
function monster(dt){
 if(!M.on){M.t-=dt;if(M.t<=0)spawnM();return}
 const T=aim(),dx=T.x-M.x,dz=T.z-M.z,d=Math.hypot(dx,dz);if(T.ok)MT=T;M.tg=T.id;
 const see=!!T.ok&&d<(T.fl?14:6)&&sight(M.x,M.z,T.x,T.z);
 if(see){if(M.st!="chase"){M.st="chase";M.rp=0;seen(T)}
  M.lx=T.x;M.lz=T.z;M.lost=0}
 else if(M.st=="chase"){M.lost+=dt;if(M.lost>2.5){M.st="investigate";M.path=route(M.x,M.z,M.lx,M.lz);M.pause=0}}
 let sp=M.st=="chase"?3+.25*S.keys:M.st=="investigate"?1.9:1.3;
 // harakat
 if(M.pause>0){M.pause-=dt;M.ang+=Math.sin(M.tm*1.3)*dt*.8;sp=0}
 else if(M.st=="chase"){
  if(see){mStep(T.x,T.z,sp,dt)}
  else{M.rp-=dt;if(M.rp<=0||!M.path.length){M.rp=.4;M.path=route(M.x,M.z,M.lx,M.lz)}
   if(M.path.length&&mStep(M.path[0][0],M.path[0][1],sp,dt))M.path.shift()}}
 else{
  if(!M.path.length){if(M.st=="investigate"){M.st="patrol";M.pause=2+R()*2}else{pickGoal();M.pause=R()<.5?0:1+R()*2.5}}
  else if(mStep(M.path[0][0],M.path[0][1],sp,dt))M.path.shift()}
 // qotib qolishni oldini olish
 M.ck+=dt;if(M.ck>.6){if(sp>0&&Math.hypot(M.x-M.cx,M.z-M.cz)<sp*.6*.25){M.path=[];if(M.st=="chase")M.rp=0}M.cx=M.x;M.cz=M.z;M.ck=0}
 // eshiklarni ochadi
 for(const dr of doors)if(!dr.exit&&!dr.open&&Math.hypot(dr.cx-M.x,dr.cz-M.z)<1.2){dr.open=true;dr.c.off=true;monDoorSnd(dr);if(MPon()&&window.NW)NW.door(dr)}
 M.sv=sp;monFx(dt,sp);
 // ushlandi
 if(T.ok&&d<.85&&(see||d<.5))gotcha(T)}
function caught(){S.on=false;mon.position.set(M.x,0,M.z);cam.rotation.y=Math.atan2(-(M.x-P.x),-(M.z-P.z));S.yaw=cam.rotation.y;
 scream();tn(100,40,1.2,.6,"sawtooth");dg.style.opacity=1;$("pr").textContent="";if(document.exitPointerLock)document.exitPointerLock();
 setTimeout(()=>{if(MPon()&&window.NW)NW.ui();$("dead").classList.remove("h")},900)}

/* ---------- loop ---------- */
function hit(x,z){const r=.28;for(const c of cols){if(c.off)continue;if(x>c.x1-r&&x<c.x2+r&&z>c.z1-r&&z<c.z2+r)return true}return false}
function tryMove(dx,dz){if(!hit(P.x+dx,P.z+dz)){P.x+=dx;P.z+=dz}}
function scare(){if(S.on&&!S.pause){const r=R();if(r<.3)creak();else if(r<.55)whisper();else if(r<.8)thump();else knock()}setTimeout(scare,7000+R()*12000)}
function animWorld(dt){for(const d of doors)d.p.rotation.y+=((d.open?d.ang:0)-d.p.rotation.y)*Math.min(1,dt*5);for(const q of keys)if(!q.got)q.g.rotation.z+=dt*1.6}
function upd(dt){
 let f=(k.KeyW|0)-(k.KeyS|0)+(k.ArrowUp|0)-(k.ArrowDown|0)+joy.f,r=(k.KeyD|0)-(k.KeyA|0)+(k.ArrowRight|0)-(k.ArrowLeft|0)+joy.x;
 if(window.STORY&&STORY.ui){f=0;r=0}const l=Math.hypot(f,r);if(l>1){f/=l;r/=l}
 const run=S.run||k.ShiftLeft||k.ShiftRight,spd=run?4.4:2.3,sy=Math.sin(S.yaw),cy=Math.cos(S.yaw);
 tryMove((-sy*f+cy*r)*spd*dt,0);tryMove(0,(-cy*f-sy*r)*spd*dt);
 const mv=l>.05;
 if(mv){bob+=dt*(run?11:7.5);const s=Math.sin(bob);if(s<-.95&&!lastS){step(run);noise(P.x,P.z,run?11:3.5);lastS=1}if(s>0)lastS=0}
 cam.position.set(P.x,1.6+(mv?Math.sin(bob)*.035:0),P.z);cam.rotation.set(S.pitch,S.yaw,0);
 animWorld(dt);
 const n=near();$("pr").textContent=n?n.txt:"";
 // lights
 if(flk<=0&&R()<.003)flk=.35;flk-=dt;bad-=dt;
 for(const q of rl)q.intensity=q.b*(flk>0?R()*.4:1);
 sp.intensity=bad>0?(R()<.5?0:2):1.8*(flk>0&&R()<.15?.3:1);
 // ghost
 gT-=dt;
 if(!gV&&gT<=0){const c=spots.filter(s=>{const d=Math.hypot(s[0]-P.x,s[1]-P.z);return d>7&&d<17}),s=c.length?c[Math.floor(R()*c.length)]:spots[0];
  gh.position.set(s[0],0,s[1]);gh.visible=true;gV=6;gT=22+R()*22;whisper()}
 if(gV){gV-=dt;const dx=P.x-gh.position.x,dz=P.z-gh.position.z,d=Math.hypot(dx,dz);gh.rotation.y=Math.atan2(dx,dz);
  gh.position.x+=dx/d*.6*dt;gh.position.z+=dz/d*.6*dt;
  if(d<3.5){scream();$("fl").classList.remove("on");void $("fl").offsetWidth;$("fl").classList.add("on");bad=1.6;gV=0;gT=16;gh.visible=false}
  else if(gV<=0)gh.visible=false}
 if(window.STORY)STORY.tick(dt);if(window.PZ)PZ.tick(dt);if(MPon())(window.NW?NW.world(dt):NET.tick(dt));else monster(dt);if(S.on&&EXIT.open&&P.z>16.7){if(MPon()&&window.NW)NW.escape();else win()}}
function win(){S.on=false;$("win").classList.remove("h");$("pr").textContent="";if(document.exitPointerLock)document.exitPointerLock();chime()}
const clk=new THREE.Clock();
(function loop(){requestAnimationFrame(loop);const dt=Math.min(clk.getDelta(),.05);if(S.on&&!S.pause)upd(dt);
 else{if(!S.on&&!S.pause){cam.position.set(P.x,1.6,P.z);cam.rotation.set(0,S.yaw,0)}if(MPon()&&window.NW)NW.idle(dt)}// MP: pauza/o'lim/qutulishda ham dunyo to'xtamaydi
 ren.render(scene,cam)})();

/* ---------- ready ---------- */
window.__gameReady=true;
if($("st"))$("st").textContent="";
if(window.__pendingStart){window.__pendingStart=false;begin()}
