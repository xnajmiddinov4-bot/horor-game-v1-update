/* THE ABANDONED HOUSE — multiplayer dunyo sinxronizatsiyasi (Update 5, 1-bosqich)
   HOST — yagona haqiqat manbai: maxluq AI, kalitlar, eshiklar, o'yinchilar holati (tirik / ushlangan / qutulgan).
   GUEST faqat so'rov yuboradi (kr, dr, nz, esc) va host yuborgan holatni ko'rsatadi (kg, dd, m, me, ps, cg, end, ws, dm).
   game.js dan global P, S, M, keys, doors, EXIT, msg, keyTaken, doorSet, monster, monGuest, animWorld ... ishlatiladi. */
(function(){
const $=id=>document.getElementById(id),N=window.NET;if(!N||!N.send)return;
const W=window.NW={},IDS=["h","g"],host=()=>N.on&&N.role=="host",guest=()=>N.on&&N.role=="guest",me=()=>guest()?"g":"h",mate=()=>guest()?"h":"g";
const up=()=>!!(N.up&&N.up()),send=o=>{if(up())N.send(o)},okI=(i,n)=>Number.isInteger(i)&&i>=0&&i<n,ST_OK={patrol:1,investigate:1,chase:1};
let st={h:"play",g:"play"},rp=false,res="",pend={},snT=0,escT=0;

/* ---------- holat va ko'rinish ---------- */
W.targets=()=>{const a=[],r=N.remote&&N.remote();
 if(st[me()]=="play"&&S.on&&!S.pause)a.push({id:me(),x:P.x,z:P.z,fl:S.fl,ok:1});
 if(r&&st[mate()]=="play"&&!rp)a.push({id:mate(),x:r.x,z:r.z,fl:r.fl,ok:1});return a};
W.paused=v=>send({t:"pa",v:v?1:0});N.h.pa=d=>{rp=!!d.v};
const hide=()=>{if(N.setHidden)N.setHidden(st[mate()]!="play")};
W.ui=()=>{// o'lgan / qutulgan o'yinchi uchun matnlar
 const my=st[me()],mt=st[mate()],off=up()?"":" (Sherik bilan aloqa uzildi.)";
 if(my=="dead"){$("deadt").textContent=!res?"Sherigingiz hali tirik — u qutulishi mumkin. Natijani kuting…"+off:mt=="esc"?"Siz ushlandingiz, lekin sherigingiz qutuldi.":"Ikkalangiz ham maxluqqa yem bo‘ldingiz.";$("deadb").textContent="BOSH MENYU"}
 if(my=="esc"){$("wint").textContent=!res?"Siz qutuldingiz. Sherigingiz hali uyda — natijani kuting…"+off:mt=="esc"?"Ikkalangiz ham tirik qutuldingiz!":"Siz qutuldingiz, lekin sherigingiz maxluqqa yem bo‘ldi.";$("winb").textContent="BOSH MENYU"}};
N.onlost=()=>{rp=false;hide();W.ui()};

/* ---------- kalitlar va eshiklar ---------- */
W.use=o=>{
 if(o.g){const i=keys.indexOf(o);if(i<0)return;
  if(host())hostKey(i,"h");else if(up()){if(pend["k"+i])return;pend["k"+i]=1;setTimeout(()=>delete pend["k"+i],2500);send({t:"kr",i})}else msg("Host bilan aloqa yo‘q.");return}
 const i=doors.indexOf(o);if(i<0)return;
 if(host())hostDoor(i,"h");else if(up()){if(pend["d"+i])return;pend["d"+i]=1;setTimeout(()=>delete pend["d"+i],600);send({t:"dr",i,x:+P.x.toFixed(2),z:+P.z.toFixed(2)})}else msg("Host bilan aloqa yo‘q.")};
function hostKey(i,by){const q=keys[i];if(!q||q.got)return;keyTaken(q,by);send({t:"kg",i,by})}
function hostDoor(i,by,px,pz){const o=doors[i];if(!o)return;const mine=by==me(),tell=(m,th)=>{if(mine){msg(m);if(th)thump()}else send({t:"dm",m,th:th?1:0})};
 if(o.exit&&S.keys<3){tell("Eshik qulflangan. 3 ta kalit kerak ("+S.keys+"/3)",1);noise(mine?P.x:o.cx,mine?P.z:o.cz,12);return}
 if(o.open){const r=N.remote(),ps=[];if(st[me()]=="play")ps.push([P.x,P.z]);if(st[mate()]=="play"){if(by=="g"&&isFinite(px)&&isFinite(pz))ps.push([px,pz]);else if(r)ps.push([r.x,r.z])}
  if(ps.some(p=>inDoor(o.c,p[0],p[1]))){tell("Eshik yo‘lida kimdir turibdi");return}}
 const open=!o.open;doorSet(o,open,by);send({t:"dd",i,o:open?1:0,by})}
W.door=dr=>send({t:"dd",i:doors.indexOf(dr),o:1,by:"m"});// maxluq ochgan eshik
N.h.kr=d=>{if(host()&&okI(d.i,keys.length))hostKey(d.i,"g")};
N.h.kg=d=>{if(!guest()||!okI(d.i,keys.length))return;delete pend["k"+d.i];keyTaken(keys[d.i],d.by==me()?me():mate())};
N.h.dr=d=>{if(host()&&okI(d.i,doors.length))hostDoor(d.i,"g",+d.x,+d.z)};
N.h.dd=d=>{if(!guest()||!okI(d.i,doors.length))return;const o=doors[d.i];delete pend["d"+d.i];
 if(d.by=="m"){o.open=!!d.o;o.c.off=!!d.o;monDoorSnd(o)}else if(!!d.o!=o.open)doorSet(o,!!d.o,d.by==me()?me():mate())};
N.h.dm=d=>{for(const k in pend)if(k[0]=="d")delete pend[k];msg(String(d.m).slice(0,80));if(d.th)thump()};

/* ---------- shovqin guest → host ---------- */
W.noise=(x,z,r)=>send({t:"nz",x:+x.toFixed(1),z:+z.toFixed(1),r});
N.h.nz=d=>{if(!host())return;const x=+d.x,z=+d.z,r=Math.min(14,+d.r);if(isFinite(x)&&isFinite(z)&&isFinite(r)&&r>0)noise(x,z,r)};

/* ---------- maxluq: host → guest ---------- */
W.ev=(e,w)=>send({t:"me",e,w});
N.h.me=d=>{if(!guest())return;
 if(d.e=="spawn"){M.on=true;msg("Uyda nimadir harakatlanmoqda…",4000);creak()}
 else if(d.e=="seen"){if(d.w==me())stinger();else msg("Maxluq sherigingizni quvlayapti!",3000)}};
N.h.m=d=>{if(!guest())return;const x=+d.x,z=+d.z,a=+d.a;if(!isFinite(x)||!isFinite(z)||!isFinite(a))return;
 M.on=!!d.on;M.sx=x;M.sz=z;M.sa=a;M.sv=+d.v||0;M.tg=d.tg=="g"?"g":"h";if(ST_OK[d.s])M.st=d.s;
 if(!M.got){M.got=1;M.x=x;M.z=z;M.ang=a}};
W.world=dt=>{N.tick(dt);
 if(host()){monster(dt);snT-=dt;if(snT<=0&&M.on){snT=.08;send({t:"m",on:1,x:+M.x.toFixed(2),z:+M.z.toFixed(2),a:+M.ang.toFixed(2),s:M.st,v:+(M.sv||0).toFixed(2),tg:M.tg})}}
 else monGuest(dt)};
W.idle=dt=>{animWorld(dt);if(window.STORY)STORY.tick(dt);if(window.PZ)PZ.tick(dt);W.world(dt)};

/* ---------- mag'lubiyat / qutulish (host hal qiladi) ---------- */
W.caught=id=>{if(!host()||st[id]!="play")return;st[id]="dead";M.st="patrol";M.path=[];M.pause=3;M.lost=0;
 send({t:"ps",id,s:"dead"});if(id==me())caught();else send({t:"cg",x:M.x,z:M.z});hide();evaluate()};
N.h.cg=d=>{if(!guest())return;if(isFinite(+d.x)&&isFinite(+d.z)){M.x=+d.x;M.z=+d.z}caught()};
W.escape=()=>{if(st[me()]!="play")return;
 if(host()){st.h="esc";send({t:"ps",id:"h",s:"esc"});W.ui();win();hide();evaluate()}
 else{const t=performance.now();if(t-escT<1000)return;escT=t;send({t:"esc"})}};
N.h.esc=d=>{if(!host()||st.g!="play")return;const r=N.remote();if(!EXIT.open||!r||r.z<15.5)return;st.g="esc";send({t:"ps",id:"g",s:"esc"});hide();evaluate()};
N.h.ps=d=>{if(!guest()||!IDS.includes(d.id)||!["play","dead","esc"].includes(d.s))return;st[d.id]=d.s;hide();
 if(d.id==me()&&d.s=="esc"){W.ui();win()}else W.ui()};
function evaluate(){if(res)return;if(IDS.some(i=>st[i]=="play"&&(i==me()||up())))return;
 res=IDS.some(i=>st[i]=="esc")?"win":"lose";send({t:"end",r:res});W.ui()}
N.h.end=d=>{if(!guest())return;res=d.r=="win"?"win":"lose";W.ui()};

/* ---------- ulanish tiklanganda to'liq holat ---------- */
const snap=()=>({t:"ws",k:keys.map(q=>q.got?1:0),d:doors.map(o=>o.open?1:0),n:S.keys,st,res,m:M.on?{x:M.x,z:M.z,a:M.ang,s:M.st}:0});
N.h.ws=d=>{if(!guest()||!Array.isArray(d.k)||!Array.isArray(d.d))return;
 d.k.forEach((g,i)=>{if(g&&keys[i]&&!keys[i].got){keys[i].got=1;scene.remove(keys[i].g)}});
 d.d.forEach((g,i)=>{const o=doors[i];if(o){o.open=!!g;o.c.off=!!g}});
 S.keys=+d.n||0;$("kn").textContent=S.keys;if(d.st&&IDS.every(i=>["play","dead","esc"].includes(d.st[i])))st=d.st;res=d.res||"";
 if(d.m&&isFinite(+d.m.x)&&isFinite(+d.m.z)){M.on=true;M.sx=M.x=+d.m.x;M.sz=M.z=+d.m.z;M.sa=M.ang=+d.m.a||0;if(ST_OK[d.m.s])M.st=d.m.s;M.got=1}
 hide();W.ui()};
const o0=N.onhi;N.onhi=()=>{if(o0)o0();if(host()&&up())send(snap());hide()};

/* ---------- brauzer fonga o'tganda host dunyosi to'xtab qolmasin ---------- */
let lh=0;setInterval(()=>{if(!N.on||!document.hidden){lh=0;return}const now=performance.now();let el=lh?Math.min((now-lh)/1000,10):1;lh=now;for(;el>0;el-=.05)W.idle(Math.min(.05,el))},500);
})();
