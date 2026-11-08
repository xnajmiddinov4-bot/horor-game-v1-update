/* THE ABANDONED HOUSE — multiplayer (Update 3, Step 1: lobby + movement/flashlight sync)
   PeerJS (WebRTC) orqali 2 o'yinchi. game.js dan global P, S, k, scene, begin, msg ishlatiladi. */
(function(){
const $=id=>document.getElementById(id),PRE="abh-",AL="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
// TURN (ixtiyoriy): quyidagi ro'yxatga {urls:"turn:HOST:3478",username:"...",credential:"..."} qo'shing. Ochiq kalit kodga yozilmaydi.
const ICE=[{urls:"stun:stun.l.google.com:19302"},{urls:"stun:stun1.l.google.com:19302"},{urls:"stun:global.stun.twilio.com:3478"}];
const SRC=["lib/peerjs.min.js","https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js","https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js"];
const N=window.NET=Object.assign(window.NET||{},{on:false,role:null,code:"",tick});N.h=N.h||{};
let peer,conn,role,code="",started=false,lastRx=0,lastTx=0,sent={x:0,z:0,y:0,f:1,m:0},prev={x:0,z:0,t:0},jt,rtm,rt=0,rname="Sherik";

/* ---------- remote player model ---------- */
const R={g:null,x:5,z:13,y:0,tx:5,tz:13,ty:0,fl:1,m:0,ph:0,legs:[],spot:null,beam:null,label:null};
function mkRemote(name){
 if(R.g){scene.remove(R.g)}
 const g=new THREE.Group(),cl=new THREE.MeshStandardMaterial({color:0x2d4a63,roughness:.9}),sk=new THREE.MeshStandardMaterial({color:0xc9a98a,roughness:.9});
 const b=new THREE.Mesh(new THREE.CylinderGeometry(.2,.25,.8,8),cl);b.position.y=1.15;g.add(b);
 const h=new THREE.Mesh(new THREE.SphereGeometry(.13,10,8),sk);h.position.y=1.7;g.add(h);
 R.legs=[];for(const s of[-1,1]){const l=new THREE.Group();l.position.set(s*.1,.75,0);const m=new THREE.Mesh(new THREE.CylinderGeometry(.07,.06,.75,6),cl);m.position.y=-.37;l.add(m);g.add(l);R.legs.push(l)}
 const a=new THREE.Mesh(new THREE.BoxGeometry(.07,.07,.4),sk);a.position.set(.27,1.25,-.22);g.add(a);
 const fl=new THREE.Mesh(new THREE.CylinderGeometry(.04,.05,.18,6),new THREE.MeshBasicMaterial({color:0xddd0a0}));fl.rotation.x=Math.PI/2;fl.position.set(.27,1.25,-.45);g.add(fl);
 const sp=new THREE.SpotLight(0xfff0cc,1.4,18,.5,.5,1.3);sp.position.set(.27,1.25,-.45);sp.target.position.set(.27,1,-7);g.add(sp,sp.target);R.spot=sp;
 const c=document.createElement("canvas");c.width=256;c.height=64;const x=c.getContext("2d");x.font="bold 34px Georgia";x.textAlign="center";x.fillStyle="#e8dcc8";x.strokeStyle="#000";x.lineWidth=5;x.strokeText(name,128,44);x.fillText(name,128,44);
 const lb=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),fog:false,transparent:true}));lb.scale.set(1.2,.3,1);lb.position.y=2.05;g.add(lb);
 g.position.set(R.x,0,R.z);g.visible=started;scene.add(g);R.g=g}
function updRemote(dt){
 if(!R.g)return;const k1=Math.min(1,dt*10);
 R.x+=(R.tx-R.x)*k1;R.z+=(R.tz-R.z)*k1;let d=R.ty-R.y;d=Math.atan2(Math.sin(d),Math.cos(d));R.y+=d*k1;
 R.g.position.set(R.x,0,R.z);R.g.rotation.y=R.y;R.spot.visible=!!R.fl;R.g.visible=started&&!R.hide&&!!(conn&&conn.open);
 R.ph+=dt*(R.m==2?11:R.m?7.5:0);const s=R.m?Math.sin(R.ph)*(R.m==2?.7:.45):0;R.legs[0].rotation.x=s;R.legs[1].rotation.x=-s}

/* ---------- network ---------- */
function send(o){if(conn&&conn.open){try{conn.send(o);lastTx=performance.now()}catch(e){}}}
function onData(d){
 if(!d)return;lastRx=performance.now();if(N.h[d.t]){N.h[d.t](d);return}
 if(d.t=="p"){R.tx=d.x;R.tz=d.z;R.ty=d.y;R.fl=d.f;R.m=d.m}
 else if(d.t=="hi"){rname=String(d.n||"Sherik").slice(0,16);mkRemote(rname);R.x=R.tx;R.z=R.tz;stat();if(N.onhi)N.onhi()}
 else if(d.t=="s"&&role=="guest")go();
 else if(d.t=="full"){fail("Xona to‘lgan: faqat 2 o‘yinchi qo‘llab-quvvatlanadi.")}
}
function setup(c){
 conn=c;
 c.on("open",()=>{clearTimeout(jt);rt=0;lastRx=performance.now();send({t:"hi",n:role=="host"?"O‘yinchi 1":"O‘yinchi 2"});if(started)msg("Sherik qayta ulandi.",3000);stat()});
 c.on("data",onData);c.on("close",()=>lost(c));c.on("error",()=>{})}
function lost(c){
 if(c!==conn)return;conn=null;if(R.g)R.g.visible=false;if(N.onlost)N.onlost();stat();
 if(started){msg("Sherik bilan aloqa uzildi…",5000);if(role=="guest")retry()}
 else if(role=="guest")fail("Xona bilan aloqa uzildi. Qayta urinib ko‘ring.")}
function retry(){
 if(rtm)return;if(rt>=5){msg("Ulanish tiklanmadi. Sahifani yangilab, kodni qayta kiriting.",8000);return}
 rt++;rtm=setTimeout(()=>{rtm=0;if(conn&&conn.open)return;try{if(peer.disconnected)peer.reconnect()}catch(e){}connectHost()},2500)}
function errText(e){const t=e&&e.type;
 if(t=="peer-unavailable")return"Bunday xona topilmadi. Kodni tekshiring (host xonani ochiq qoldirishi kerak).";
 if(["network","server-error","socket-error","socket-closed"].includes(t))return"Signal serveriga ulanib bo‘lmadi. Internetni tekshirib, qayta urinib ko‘ring.";
 if(t=="webrtc")return"To‘g‘ridan-to‘g‘ri ulanish o‘rnatilmadi. Tarmoq (NAT) cheklovi bo‘lishi mumkin — boshqa Wi-Fi yoki mobil internet bilan urinib ko‘ring.";
 return"Ulanish xatosi"+(t?" ("+t+")":"")+"."}
function fail(t){setS(t,1);if(started)msg(t,6000);if(!started&&role=="guest")show("g")}
function loadPeer(cb,i=0){
 if(window.Peer)return cb();
 if(i>=SRC.length){fail("PeerJS kutubxonasi yuklanmadi. Internetni tekshiring yoki lib/peerjs.min.js faylini joylang.");return}
 const s=document.createElement("script");s.onload=()=>window.Peer?cb():loadPeer(cb,i+1);s.onerror=()=>loadPeer(cb,i+1);s.src=SRC[i];document.head.appendChild(s)}
function killPeer(){clearTimeout(jt);clearTimeout(rtm);rtm=0;if(peer){const p=peer;peer=null;try{p.destroy()}catch(e){}}conn=null}
function gen(){let s="";for(let i=0;i<6;i++)s+=AL[Math.floor(Math.random()*AL.length)];return s}
function openHost(n){
 if(n>5){fail("Xona yaratib bo‘lmadi. Qayta urinib ko‘ring.");return}
 killPeer();code=gen();const p=peer=new Peer(PRE+code,{config:{iceServers:ICE}});
 p.on("open",()=>{if(p!==peer)return;N.code=code;$("mpc").textContent=code;setS("Xona tayyor. Kodni ikkinchi o‘yinchiga yuboring.")});
 p.on("connection",c=>{if(p!==peer)return;
  if(conn&&conn.open){c.on("open",()=>{c.send({t:"full"});setTimeout(()=>c.close(),400)});return}
  setup(c)});
 p.on("disconnected",()=>{if(p===peer){try{p.reconnect()}catch(e){}}});
 p.on("error",e=>{if(p!==peer)return;if(e.type=="unavailable-id")openHost(n+1);else fail(errText(e))})}
function connectHost(){
 if(!peer)return;const c=peer.connect(PRE+code,{reliable:true});setup(c);clearTimeout(jt);
 jt=setTimeout(()=>{if(conn===c&&!c.open){fail("Ulanish vaqti tugadi. Kod to‘g‘riligini va host xonada ekanini tekshiring.");if(started)retry()}},12000)}
function join(){
 const v=($("mpi").value||"").toUpperCase().replace(/[^A-Z0-9]/g,"");
 if(!/^[A-HJ-NP-Z2-9]{6}$/.test(v)){setS("Xona kodi 6 ta harf/raqamdan iborat bo‘lishi kerak.",1);return}
 code=v;role=N.role="guest";setS("Ulanmoqda…");
 loadPeer(()=>{killPeer();const p=peer=new Peer({config:{iceServers:ICE}});
  p.on("open",()=>{if(p===peer)connectHost()});
  p.on("disconnected",()=>{if(p===peer){try{p.reconnect()}catch(e){}}});
  p.on("error",e=>{if(p!==peer)return;fail(errText(e));if(started)retry()})})}

/* ---------- start ---------- */
function go(){
 if(started)return;started=true;N.on=true;
 if(role=="host"){P.x=3;P.z=13}else{P.x=5;P.z=13.5}
 if(R.g)R.g.visible=true;$("mp").classList.add("h");begin();
 msg("Ikkala o‘yinchi bir uyda. Maxluq, kalitlar va eshiklar umumiy — birga qoling.",6000)}
N.send=send;N.up=()=>!!(conn&&conn.open);
// netsync.js uchun: sherikning (yangilangan) joyi va ko'rinishi
N.remote=()=>conn&&conn.open&&R.g?{x:R.tx,z:R.tz,fl:!!R.fl}:null;N.setHidden=v=>{R.hide=!!v};N.remoteVisible=()=>!!(R.g&&R.g.visible);
function tick(dt){
 updRemote(dt);if(!conn||!conn.open)return;
 const now=performance.now();if(now-prev.t<83)return;
 const sp=Math.hypot(P.x-prev.x,P.z-prev.z)/Math.max(.001,(now-prev.t)/1000);prev.x=P.x;prev.z=P.z;prev.t=now;
 const m=sp>3.4?2:sp>.4?1:0,f=S.fl?1:0,x=+P.x.toFixed(2),z=+P.z.toFixed(2),y=+S.yaw.toFixed(2);
 if(Math.abs(x-sent.x)>.01||Math.abs(z-sent.z)>.01||Math.abs(y-sent.y)>.01||f!=sent.f||m!=sent.m||now-lastTx>1000){
  sent={x,z,y,f,m};send({t:"p",x,z,y,f,m})}}
setInterval(()=>{if(conn&&conn.open&&performance.now()-lastTx>1800)send({t:"h"});
 if(started&&conn&&performance.now()-lastRx>9000){const c=conn;try{c.close()}catch(e){}lost(c)}},1000);

/* ---------- lobby UI ---------- */
function show(v){for(const[id,n]of[["mpm","m"],["mph","h"],["mpg","g"]])$(id).classList.toggle("hid",n!=v)}
function setS(t,bad){const e=$("mps");e.textContent=t;e.style.color=bad?"#d05050":""}
function stat(){
 const up=conn&&conn.open;$("mpl").textContent=role=="host"?"1) Siz (host) ✔   2) "+(up?rname+" ✔ ulandi":"kutilmoqda…"):"1) "+(up?rname+" (host) ✔":"host…")+"   2) Siz ✔";
 $("mpst").disabled=!(role=="host"&&up);
 if(up&&role=="guest")setS("Ulandi. Host o‘yinni boshlashini kuting…");
 if(up&&role=="host")setS("Sherik ulandi. O‘yinni boshlashingiz mumkin.")}
$("mpb").onclick=()=>{$("menu").classList.add("h");$("mp").classList.remove("h");show("m");setS("")};
$("mpcr").onclick=()=>{role=N.role="host";show("h");$("mpc").textContent="······";setS("Signal serveriga ulanmoqda…");stat();loadPeer(()=>openHost(0))};
$("mpjo").onclick=()=>{show("g");setS("");$("mpl").textContent=""};
$("mpgo").onclick=join;
$("mpcp").onclick=()=>{const t=N.code;if(!t)return;
 (navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(()=>setS("Kod nusxalandi: "+t),()=>setS("Kodni qo‘lda ko‘chiring: "+t))};
$("mpst").onclick=()=>{if(role=="host"&&conn&&conn.open){send({t:"s"});go()}};
$("mpbk").onclick=()=>{killPeer();started=false;N.on=false;role=N.role=null;$("mpl").textContent="";$("mp").classList.add("h");$("menu").classList.remove("h")};
})();
