/* THE ABANDONED HOUSE — kooperativ topishmoqlar + yashirin xonalar (Update 4, 4–5-bosqich)
   Holat (PS) faqat host tomonidan o'zgartiriladi: pzu (ishlatish) / pzs (kod yuborish) → pz (holat) / pzr (natija) / pzf (xabar). */
(function(){
const $=id=>document.getElementById(id),ST=window.STORY,H=Math.PI/2,PZ=window.PZ={off:true,near(){},tick(){}};
if(!ST)return;
/* mavjud sharqiy devor va javonni topamiz; topilmasa yashirin xonalar qo'shilmaydi (o'yin buzilmaydi) */
const ew=scene.children.find(m=>m.isMesh&&m.geometry&&m.geometry.parameters&&m.geometry.parameters.depth==16&&m.geometry.parameters.width==.3&&m.position.x==20),
 ewc=cols.find(c=>Math.abs(c.x1-19.85)<1e-6&&Math.abs(c.x2-20.15)<1e-6&&Math.abs(c.z1)<1e-6&&Math.abs(c.z2-16)<1e-6),
 sh=scene.children.find(m=>m.isMesh&&m.geometry&&m.geometry.parameters&&m.geometry.parameters.depth==3.5&&m.position.x==19.6&&m.position.z==3),
 shc=cols.find(c=>Math.abs(c.x1-19.35)<1e-6&&Math.abs(c.z1-1.25)<1e-6&&Math.abs(c.z2-4.75)<1e-6);
if(!(ew&&ewc&&sh&&shc)){console.warn("Yashirin xonalar: mos devor/javon topilmadi, o‘tkazib yuborildi");return}
PZ.off=false;cols.splice(cols.indexOf(ewc),1);scene.remove(ew);

/* ---------- geometriya: S1 yashirin ombor (x20–27), S2 pastki xona (27–35), S3 so'nggi xona (35–38) ---------- */
const stone=new THREE.MeshStandardMaterial({color:0x2a2a2e,roughness:1}),dm=new THREE.MeshStandardMaterial({color:0x3a2a1c,roughness:.9,emissive:0x0a0604});
wall(20,0,20,2.2);wall(20,3.8,20,16);wall(20,1,35,1);wall(20,5,35,5);
wall(27,1,27,2.2);wall(27,3.8,27,5);wall(35,1,35,2.2);wall(35,3.8,35,5);wall(35,2.2,38,2.2);wall(35,3.8,38,3.8);wall(38,2.2,38,3.8);
for(const x of[20,27,35])box(x,2.7,3,.3,.6,1.6,wmat(1.6),0);
const fl2=new THREE.Mesh(new THREE.PlaneGeometry(18,4),stone);fl2.rotation.x=-H;fl2.position.set(29,0,3);fl2.receiveShadow=true;scene.add(fl2);
const ce2=new THREE.Mesh(new THREE.PlaneGeometry(18,4),new THREE.MeshStandardMaterial({color:0x161618}));ce2.rotation.x=H;ce2.position.set(29,3,3);scene.add(ce2);
const l1=new THREE.PointLight(0xffa860,.5,8,1.6);l1.position.set(23.5,2.4,3);scene.add(l1);
const l2=new THREE.PointLight(0x88aaff,.4,10,1.6);l2.position.set(31,2.4,3);scene.add(l2);
function panel(x){const m=box(x,1.2,3,.14,2.4,1.6,dm);return{m,c:cols[cols.length-1],t:1.2}}
const pA=panel(27),pE=panel(35);
box(23,.35,1.5,.8,.7,.5,dm);box(25.5,.4,4.4,.8,.8,.8,mFur);                       // seyf va quti
for(const x of[29.5,31,32.5]){box(x,.3,1.7,1,.35,.7,mCloth);box(x,.5,1.55,.5,.12,.4,mDark,0)} // uchta uxlayotgan kot

/* ---------- ob'ektlar ---------- */
const LC={0:0xaa2211,1:0x33cc55,2:0xd4a017,3:0x444444},lamps={};
function mkO(id,k,i,x,y,z,nx,nz,ui,txt,done,kind){
 const g=kind=="pipe"?new THREE.CylinderGeometry(.06,.06,1.2,8):new THREE.BoxGeometry(nx?.06:.2,.3,nz?.06:.2);
 const m=new THREE.Mesh(g,dm);m.position.set(x+nx*.03,y,z+nz*.03);if(kind=="pipe")m.rotation.z=H;scene.add(m);
 const l=new THREE.Mesh(new THREE.SphereGeometry(.05,8,6),new THREE.MeshBasicMaterial({color:LC[0]}));l.position.set(x+nx*.09,y+.22,z+nz*.09);scene.add(l);lamps[id]=l;
 return{pz:1,id,k,i,ui,txt,done,x:kind=="safe"?23:x,z:kind=="safe"?1.6:z}}
const OBJ=[
 mkO("sw1","B","a",6.85,1.3,7,-1,0,0,"[E] Tugmani bosish",()=>PS.B.done),
 mkO("sw2","B","b",17.5,1.3,.15,0,1,0,"[E] Tugmani bosish",()=>PS.B.done),
 mkO("safe","C",0,23,1.0,1.8,0,1,"keypad","[E] Seyfni ochish",()=>PS.C.done,"safe"),
 mkO("door","A",0,26.6,2.0,3,-1,0,"sym","[E] Belgilar eshigi",()=>PS.A.done),
 mkO("pipe","D",0,31,1.2,4.8,0,-1,"knock","[E] Quvurga taqillatish",()=>PS.D.done,"pipe"),
 mkO("lv1","E","a",28.2,1.3,1.15,0,1,0,"[E] Richagni tortish",()=>PS.E.done),
 mkO("lv2","E","b",34.2,1.3,4.85,0,-1,0,"[E] Richagni tortish",()=>PS.E.done)];
const PS={B:{a:0,b:0,done:0},C:{done:0},A:{done:0},D:{done:0},E:{a:0,b:0,done:0}},TS={},TW={B:[7,25],E:[3,20]},KK={keypad:"C",sym:"A",knock:"D"};
let shT=3,puOn=0,puK="",ent="",grp=[],last=0,kt;
const isHost=()=>!(NET.on&&NET.role=="guest"),up=()=>!!(NET.on&&NET.up&&NET.up()),me=()=>NET.on&&NET.role=="guest"?"g":"h",W=k=>up()?TW[k][0]:TW[k][1];
PZ.near=chk=>{for(const o of OBJ)if(!o.done())chk(o,o.x,o.z,o.txt)};

/* ---------- host mantiqi ---------- */
function bc(k){if(up())NET.send({t:"pz",k,s:PS[k]});render()}
function announce(m){msg(m,5000);if(up())NET.send({t:"pzf",m})}
function tell(by,m,ok){if(by==me())fb(m,ok);else NET.send({t:"pzr",m,ok})}
function hUse(k,i,by){
 if(PS[k].done)return;
 if(k=="E"&&!PS.D.done){tell(by,"Mexanizm qulflangan. Avval devordagi sirni hal qiling.",0);return}
 PS[k][i]=1;TS[k+i]=ST.t;
 if(PS[k].a&&PS[k].b){PS[k].done=1;bc(k);announce(k=="B"?"Omborxonada javon surildi — yashirin yo‘lak ochildi!":"Pastki mexanizm ishladi — eng chuqur xona eshigi suriladi.");return}
 bc(k);tell(by,"Yondi. Ikkinchisini boshqa joyda "+W(k)+" soniya ichida bosing!",1)}
function hSub(k,v,by){
 if(PS[k].done){tell(by,"Bu allaqachon hal qilingan.",1);return}
 let ok=0,m;
 if(k=="C"){ok=v==="1987";m=ok?"Seyf ochildi! Ichida Pastki xona kaliti va eski qog‘oz bor.":"Kod noto‘g‘ri."}
 else if(k=="A"){if(!PS.C.done){tell(by,"Eshik qulflangan: kalit kerak (avval seyfni oching).",0);return}ok=v==="012";m=ok?"Belgilar yondi — eshik ochildi.":"Belgilar tartibi noto‘g‘ri."}
 else if(k=="D"){ok=v==="3,2,1";m=ok?"Devor ortidan javob keldi… mexanizm qulfi ochildi.":"Ritm noto‘g‘ri. Lentadagi taqillashni eslang."}
 else return;
 if(!ok){tell(by,m,0);return}
 PS[k].done=1;bc(k);tell(by,m,1);if(k=="C")ST.grant("d5",by)}
NET.h.pzu=d=>{if(isHost()&&PS[d.k])hUse(d.k,d.i,"g")};
NET.h.pzs=d=>{if(isHost()&&PS[d.k])hSub(d.k,String(d.v).slice(0,12),"g")};
NET.h.pz=d=>{if(!isHost()&&PS[d.k]){PS[d.k]=d.s;render()}};
NET.h.pzr=d=>fb(d.m,d.ok);NET.h.pzf=d=>msg(d.m,5000);
const o0=NET.onhi;NET.onhi=()=>{if(o0)o0();if(isHost()&&up())for(const k in PS)NET.send({t:"pz",k,s:PS[k]})};

/* ---------- ko'rinish ---------- */
function setL(id,s){lamps[id].material.color.setHex(LC[s])}
function render(){
 setL("sw1",PS.B.done?2:PS.B.a?1:0);setL("sw2",PS.B.done?2:PS.B.b?1:0);setL("safe",PS.C.done?2:0);setL("door",PS.A.done?2:PS.C.done?1:0);setL("pipe",PS.D.done?2:0);
 for(const[id,i]of[["lv1","a"],["lv2","b"]])setL(id,!PS.D.done?3:PS.E.done?2:PS.E[i]?1:0);
 shT=PS.B.done?6:3;pA.t=PS.A.done?3.7:1.2;pE.t=PS.E.done?3.7:1.2;pA.c.off=!!PS.A.done;pE.c.off=!!PS.E.done;
 if(puOn&&PS[KK[puK]].done&&!PZ.closing)closeU()}
PZ.tick=dt=>{
 for(const p of[pA,pE])p.m.position.y+=(p.t-p.m.position.y)*Math.min(1,dt*2.5);
 const z=sh.position.z+(shT-sh.position.z)*Math.min(1,dt*1.2);sh.position.z=z;shc.z1=z-1.75;shc.z2=z+1.75;
 if(shT>3&&P.x>shc.x1-.3&&P.x<shc.x2+.3&&P.z>shc.z1-.3&&P.z<shc.z2+.3)P.x=shc.x1-.35;
 if(isHost())for(const[k,i]of[["B","a"],["B","b"],["E","a"],["E","b"]])if(PS[k][i]&&!PS[k].done&&ST.t-TS[k+i]>W(k)){PS[k][i]=0;bc(k);msg("Tugma o‘chdi — vaqt tugadi. Qayta urinib ko‘ring.",3000)}}
PZ.use=o=>{if(o.ui){openU(o.ui);return}
 if(isHost())hUse(o.k,o.i,"h");else if(up())NET.send({t:"pzu",k:o.k,i:o.i});else msg("Host bilan aloqa yo‘q.")}

/* ---------- interfeys (klaviatura, sichqoncha, sensor) ---------- */
const root=document.createElement("div");
root.innerHTML='<div class="sov h" id="pu"><div class="paper pz"><h3 id="put"></h3><div class="pm" id="pum"></div><div class="pd" id="pud"></div><div class="pgrid" id="pug"></div><div class="pf" id="puf"></div><div class="pr"><button class="pb" id="pux">YOPISH [E]</button></div></div></div>';
document.body.append(...root.children);
const bt=t=>{const b=document.createElement("button");b.className="pk";b.textContent=t;return b},NM=["Oy","Tog‘","Suv"];
function disp(){$("pud").textContent=puK=="keypad"?(ent+"____").slice(0,4).split("").join(" "):puK=="sym"?(ent?ent.split("").map(i=>NM[i]).join(" → "):"—"):(grp.length?grp.join(" · "):"—")}
function submit(k,v){if(isHost())hSub(k,v,"h");else if(up())NET.send({t:"pzs",k,v});else fb("Host bilan aloqa yo‘q.",0)}
function openU(kind){puK=kind;puOn=1;ent="";grp=[];ST.ext=1;ST.lock();PZ.closing=0;const g=$("pug");g.innerHTML="";$("puf").textContent="";
 if(kind=="keypad"){$("put").textContent="SEYF";$("pum").textContent="4 xonali kodni kiriting";
  for(const v of "123456789C0✔"){const b=bt(v);b.onclick=()=>{if(v=="C")ent="";else if(v=="✔"){if(ent.length==4)submit("C",ent);return}else if(ent.length<4)ent+=v;disp()};g.appendChild(b)}}
 else if(kind=="sym"){$("put").textContent="BELGILAR ESHIGI";$("pum").textContent=PS.C.done?"To‘g‘ri tartibda 3 ta belgini bosing":"Eshik qulflangan: kalit kerak";
  for(let i=0;i<3;i++){const b=bt(NM[i]),cv=document.createElement("canvas");cv.width=cv.height=44;ST.glyph(i,cv.getContext("2d"),44);b.prepend(cv);b.onclick=()=>{if(ent.length<3)ent+=i;disp();if(ent.length==3)submit("A",ent)};g.appendChild(b)}}
 else{$("put").textContent="QUVUR";$("pum").textContent="Taqillating (guruhlar orasida to‘xtab turing)";
  const b=bt("TAQ");b.style.gridColumn="1/-1";b.onclick=()=>{const n=performance.now();if(!grp.length||n-last>900)grp.push(1);else grp[grp.length-1]++;last=n;tn(160,60,.15,.6,"triangle");disp();clearTimeout(kt);kt=setTimeout(()=>{if(grp.length)submit("D",grp.join(","));grp=[];setTimeout(disp,1200)},1800)};g.appendChild(b)}
 disp();$("pu").classList.remove("h")}
function closeU(){puOn=0;ST.ext=0;clearTimeout(kt);$("pu").classList.add("h");ST.unlock()}
function fb(m,ok){if(!puOn){msg(m,4500);return}const f=$("puf");f.textContent=m;f.style.color=ok?"#7fd37f":"#e06060";
 if(ok){chime();PZ.closing=1;setTimeout(closeU,1300)}else{thump();ent="";grp=[];disp();const b=$("pud");b.classList.remove("sh");void b.offsetWidth;b.classList.add("sh")}}
$("pux").onclick=closeU;ST.closeExt=closeU;render();
})();
