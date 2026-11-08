/* THE ABANDONED HOUSE — Sir: hikoya, hujjatlar, kundalik (Update 4, 2–3-bosqich)
   Host hamma kashfiyotni tasdiqlaydi (cp → cd/cn), guest faqat so'rov yuboradi. game.js dan global scene,S,msg,chime,tn,nz,ren,touch ishlatiladi. */
(function(){
const $=id=>document.getElementById(id);window.NET=window.NET||{};NET.h=NET.h||{};
const ST=window.STORY={ui:false,t:0,found:{}},found=ST.found;
const T={doc:["Hujjatlar","[E] Hujjatni olish"],photo:["Suratlar","[E] Suratni olish"],audio:["Audio","[E] Lentani olish"],sym:["Belgilar","[E] Belgini ko‘rish"],puz:["Topishmoq","[E] Qog‘ozni olish"]};
const TABS=["doc","photo","audio","sym","puz","time"],H=Math.PI/2;
/* id, tur, sarlavha, sana, tartib, x,y,z, burilish, xona, matn */
const D=[
["d1","doc","Zulfiyaning kundaligi","3-sentabr, 1987",870903,1.9,.5,1.7,.3,"Yotoqxona","Biz bu uyga ko‘chib keldik. Anvar xursand: arzon, katta, jim.\n\nFaqat bitta g‘alati narsa bor — pol tagidan har kecha sekin taqillagan ovoz keladi. Anvar «quvurlar», deydi. Men ishonmayman."],
["d2","doc","Zulfiyaning kundaligi — 2","19-oktabr, 1987",871019,3.8,.52,11.6,-.4,"Zal","Malika yana «pastdagi do‘stim» haqida gapirdi. Kechalari u bilan gaplashar emish.\n\nAnvar kulib qo‘ydi. Lekin kecha uni zalda polga quloq tutib yotganini ko‘rdim. Rangi o‘chgan edi."],
["d3","doc","Anvarning tugallanmagan xati","2-noyabr, 1987",871102,10.4,.86,3.2,.5,"O‘rta xona","Akajon, men pastki xonani topdim. Devorlarda uchta belgi bor. Ular to‘g‘ri tartibda o‘qilsa, eshik ochilarmish.\n\nMen eshitaman… ular menga javob berishyapti. Zulfiya ketishni xohlayapti, lekin men hozir to‘xtay olmayman. Agar bu xatni o‘qisang —"],
["d4","doc","«Kechki shahar» gazetasi","8-noyabr, 1987",871108,14.2,.82,1.4,-.2,"Omborxona","OILA YO‘Q BO‘LDI\n\nQo‘shnilar to‘rt kundan beri Ortiqovlar oilasidan darak yo‘qligini aytdi. Uyning eshiklari ichkaridan qulflangan, hech qanday iz topilmadi.\n\nQo‘shni bola kechasi derazada «beshinchi odam»ni ko‘rganini aytmoqda."],
["f1","photo","Oilaviy surat","Yoz, 1987",870715,14,.62,11,.2,"Zal","To‘rt kishi: Anvar, Zulfiya, Jasur va Malika. Hamma kulib turibdi.\n\nOrqa fonda, derazada, ingichka qora soya turibdi — odamga o‘xshaydi. Surat orqasida qalamda: «Biz hali shu yerdamiz.»"],
["f2","photo","Malikaning rasmi","Oktabr, 1987",871028,17,1.02,6,.6,"Omborxona","Bolalarcha chizma: uy, uning ostida katta xona. Xonada to‘rtta kichik odam, ularning ustida uzun qora qo‘l.\n\nPastda xato bilan yozilgan: «Dadam ularni olib kelaman dedi.»"],
["a1","audio","Lenta №1 — Anvar","Oktabr, 1987",871024,8,.82,.6,0,"O‘rta xona","[shivir] …yana boshlandi. Uch marta… pauza… ikki marta… pauza… bir marta. Har kecha aynan shunday.\n\nBu quvur emas. Kimdir hisoblayapti. [tuk-tuk] Men javob berib ko‘raman."],
["a2","audio","Lenta №2 — Malika","5-noyabr, 1987",871105,19.6,1.42,11,.4,"Zal","[bola ovozi, past] «Dadam pastga tushdi. Opam yig‘lamoqda. U aytdi: eshik uchta belgi bilan ochiladi — avval oy, keyin tog‘, keyin suv. Lekin hech kim eshitmadi…»"],
["y1","sym","Belgi — Oy","Noma’lum",870001,.17,1.5,4.2,H,"Yotoqxona","Devorga qazib chizilgan belgi: aylana, ichida nuqta. Eski odamlar buni «oy» deb atagan."],
["y2","sym","Belgi — Tog‘","Noma’lum",870002,11.5,1.6,.17,0,"O‘rta xona","Devorga qazib chizilgan belgi: uchburchak. Eski odamlar buni «tog‘» deb atagan."],
["y3","sym","Belgi — Suv","Noma’lum",870003,.17,1.5,9.8,H,"Zal","Devorga qazib chizilgan belgi: uchta to‘lqin chizig‘i. Eski odamlar buni «suv» deb atagan."],
["d5","doc","Anvarning so‘nggi yozuvi","6-noyabr, 1987",871106,null,0,0,0,"Seyf","Pastga tushdim. Devor ortida qo‘ng‘iroqdek tovush: uch, ikki, bir. Ularni xuddi shunday javob bilan chaqirish mumkin.\n\nIkki kishi kerak: bittasi bir tomondagi richagni tortadi, ikkinchisi — narigi tomondagisini. Men yolg‘izman…"],
["d6","doc","Anvarning oxirgi sahifasi","7-noyabr, 1987",871106.5,37.2,.03,3,.4,"Pastki xona","Ular o‘lmagan. Zulfiya, Malika, Jasur — hammasi uxlayapti, xuddi shu yerda, ostimizda.\n\nMen ularni uyg‘otaman. Agar bu satrlarni o‘qiyotgan bo‘lsang, demak men qaytmadim. Meni to‘xtatma… faqat ularni ozod qil."],
["k1","puz","Yirtilgan qog‘oz (1)","Noyabr, 1987",871103,15.3,.62,1.1,.7,"Omborxona","Anvarning qo‘lyozmasi: «Seyf kodi — biz bu uyga ko‘chgan yil. Yarmi shu yerda: 19 __ . Qolgani Zulfiyada.»"],
["k2","puz","Zulfiyaning eslatmasi (2)","Noyabr, 1987",871104,4.5,.45,9.8,.3,"Zal","Seyf kodining ikkinchi yarmi: __ 87. Anvar ko‘rmasin deb yashirdim."],
["k3","puz","Uy xaritasi","Noyabr, 1987",871104.5,11.5,.03,5.6,.8,"O‘rta xona","Qo‘lda chizilgan reja. Janubdagi katta xona ostida shtrix bilan belgilangan bo‘sh joy. Yozuv: «pastki xona — kirish yashirin»."]];
const CL=D.map(r=>({id:r[0],cat:r[1],t:r[2],dt:r[3],ts:r[4],x:r[5],y:r[6],z:r[7],ry:r[8],room:r[9],txt:r[10]})),C={};CL.forEach(c=>C[c.id]=c);
const PH=[{id:"x2",ts:871107},{id:"x3",ts:871200}]; // hali ochilmaydigan sirlar (keyingi bosqichlar)
ST.CL=CL;let cnt=0,tab="doc",cur=null,dcOn=0,jrOn=0;const pend={};
const me=()=>NET.on&&NET.role=="guest"?"g":"h",who=b=>NET.on?(b=="h"?"O‘yinchi 1":"O‘yinchi 2"):"Siz",fmt=s=>Math.floor(s/60)+":"+("0"+s%60).slice(-2);

/* ---------- 3D ob'ektlar ---------- */
function glyph(n,g,s){g.clearRect(0,0,s,s);g.strokeStyle="#e8e0c8";g.lineWidth=s/14;g.lineCap="round";g.beginPath();
 if(n==0){g.moveTo(s*.84,s/2);g.arc(s/2,s/2,s*.34,0,7);g.moveTo(s*.55,s/2);g.arc(s/2,s/2,s*.05,0,7)}
 else if(n==1){g.moveTo(s/2,s*.16);g.lineTo(s*.84,s*.8);g.lineTo(s*.16,s*.8);g.closePath()}
 else for(let i=0;i<3;i++){const y=s*(.3+i*.2);g.moveTo(s*.12,y);for(let x=0;x<4;x++)g.quadraticCurveTo(s*(.12+x*.19+.095),y+(x%2?s*.07:-s*.07),s*(.12+(x+1)*.19),y)}
 g.stroke()}
const mat=(c,e)=>new THREE.MeshStandardMaterial({color:c,roughness:1,emissive:e}),
 M={doc:mat(0xd8caa0,0x4a3810),puz:mat(0xe0d2a4,0x4a3810),photo:mat(0x7a6a55,0x2a2014),audio:mat(0x222222,0x661111)},
 G={doc:new THREE.BoxGeometry(.24,.012,.32),puz:new THREE.BoxGeometry(.24,.012,.32),photo:new THREE.BoxGeometry(.2,.015,.15),audio:new THREE.BoxGeometry(.2,.05,.13)},OB=[];
for(const c of CL){let m;if(c.x==null)continue;
 if(c.cat=="sym"){const cv=document.createElement("canvas");cv.width=cv.height=128;glyph(+c.id[1]-1,cv.getContext("2d"),128);
  m=new THREE.Mesh(new THREE.PlaneGeometry(.7,.7),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(cv),transparent:true,opacity:.8,depthWrite:false}))}
 else m=new THREE.Mesh(G[c.cat],M[c.cat]);
 m.position.set(c.x,c.y,c.z);m.rotation.y=c.ry;scene.add(m);OB.push({clue:c.id,cat:c.cat,x:c.x,z:c.z,m})}
ST.near=chk=>{for(const o of OB)if(!found[o.clue])chk(o,o.x,o.z,T[o.cat][1])};
ST.tick=dt=>{ST.t+=dt;const e=.8+.5*Math.sin(ST.t*2.2);for(const k in M)M[k].emissiveIntensity=e};

/* ---------- kashfiyot: host tasdiqlaydi ---------- */
ST.pick=o=>{const id=o.clue;if(found[id])return;
 if(NET.on&&NET.role=="guest"){if(!NET.up||!NET.up()){msg("Host bilan aloqa yo‘q.");return}if(pend[id])return;pend[id]=1;setTimeout(()=>delete pend[id],3000);NET.send({t:"cp",id});return}
 hostPick(id,"h")};
function hostPick(id,by){
 if(!C[id]||found[id]){if(by=="g")NET.send({t:"cn",id});else msg("Bu allaqachon topilgan — kundalikda (J).");return}
 const o=++cnt,tm=Math.floor(ST.t);apply(id,o,tm,by,false);
 if(NET.on&&NET.up&&NET.up())NET.send({t:"cd",id,o,tm,by})}
function apply(id,o,tm,by,quiet){
 if(found[id]||!C[id])return;found[id]={o,tm,by};cnt=Math.max(cnt,o);delete pend[id];
 const ob=OB.find(x=>x.clue==id);if(ob&&ob.cat!="sym")scene.remove(ob.m);
 cntUpd();chime();
 if(quiet)return;
 if(by==me())openDoc(id);else msg("Sherigingiz topdi: "+C[id].t+" — kundalikda o‘qing (J)",5000);
 if(jrOn)rJ()}
NET.h.cp=d=>{if(NET.role=="host")hostPick(d.id,"g")};
NET.h.cd=d=>{if(NET.role=="guest")apply(d.id,d.o,d.tm,d.by,false)};
NET.h.cn=d=>{delete pend[d.id];msg("Sherigingiz buni allaqachon topgan — kundalikda o‘qing (J).",4000)};
NET.h.cs=d=>{if(NET.role!="guest")return;for(const r of d.f)apply(r[0],r[1],r[2],r[3],true);cnt=Math.max(cnt,d.n);if(jrOn)rJ()};
NET.onhi=()=>{if(NET.role=="host"&&NET.up&&NET.up())NET.send({t:"cs",n:cnt,f:Object.keys(found).map(i=>[i,found[i].o,found[i].tm,found[i].by])})};

/* ---------- interfeys ---------- */
const root=document.createElement("div");
root.innerHTML='<div class="sov h" id="dc"><div class="paper" id="dcb"><h3 id="dct"></h3><div class="pm" id="dcm"></div><canvas id="dcg" width="120" height="120"></canvas><div class="pt" id="dcx"></div><div class="pr"><button class="pb" id="dcp">▶ ESHITISH</button><button class="pb" id="dcc">YOPISH [E]</button></div></div></div><div class="sov h" id="jr"><div class="jbox"><div class="jt" id="jt"></div><div class="jl" id="jl"></div><button class="pb" id="jx">YOPISH [J]</button></div></div>';
document.body.append(...root.children);
const jc=document.createElement("div");jc.id="jc";document.body.appendChild(jc);
const tj=document.createElement("button");tj.className="tb";tj.id="tj";tj.textContent="📖";if($("bp"))$("bp").prepend(tj);
function cntUpd(){jc.textContent="📖 "+Object.keys(found).length+"/"+CL.length+(touch?"":" · J")}cntUpd();
function ui(){ST.ui=!!(dcOn||jrOn||ST.ext)}ST.lock=lock;ST.unlock=unlock;ST.glyph=glyph;ST.grant=(id,by)=>{if(NET.role!="guest")hostPick(id,by)};
function lock(){ui();if(document.pointerLockElement)document.exitPointerLock()}
function unlock(){ui();if(!ST.ui&&!touch&&S.on){try{const r=ren.domElement.requestPointerLock();if(r&&r.catch)r.catch(()=>{})}catch(e){}}}
function tape(id){cur=id;if(id=="a1")[0,350,700,1600,1950,2900].forEach(t=>setTimeout(()=>tn(160,60,.15,.6,"triangle"),t));else nz(2.6,1500,3,.14,"bandpass");nz(.5,3500,.5,.06,"highpass")}
function openDoc(id){const c=C[id],f=found[id];cur=id;dcOn=1;
 $("dct").textContent=c.t;$("dcm").textContent=c.dt+" · №"+f.o+" · "+fmt(f.tm)+" · "+who(f.by);$("dcx").textContent=c.txt;
 const cv=$("dcg");cv.style.display=c.cat=="sym"?"block":"none";if(c.cat=="sym")glyph(+id[1]-1,cv.getContext("2d"),120);
 $("dcp").style.display=c.cat=="audio"?"inline-block":"none";$("dcb").className="paper"+(id=="d4"?" np":c.cat=="photo"?" ph":"");
 $("dc").classList.remove("h");lock();if(c.cat=="audio")tape(id)}
function closeD(){dcOn=0;$("dc").classList.add("h");unlock()}
function rJ(){const tb=$("jt");tb.innerHTML="";
 for(const k of TABS){const b=document.createElement("button"),n=k=="time"?0:CL.filter(c=>c.cat==k);
  b.textContent=k=="time"?"Xronologiya":T[k][0]+" "+n.filter(c=>found[c.id]).length+"/"+n.length;b.className=k==tab?"on":"";b.onclick=()=>{tab=k;rJ()};tb.appendChild(b)}
 const L=$("jl");L.innerHTML="";
 for(const c of tab=="time"?[...CL,...PH].sort((a,b)=>a.ts-b.ts):CL.filter(c=>c.cat==tab)){
  const f=found[c.id],b=document.createElement("button");b.className="je"+(f?"":" lk");
  if(f){b.textContent="№"+f.o+"  "+c.t+" — "+c.dt+" · "+fmt(f.tm);b.onclick=()=>openDoc(c.id);
   if(c.cat=="sym"){const cv=document.createElement("canvas");cv.width=cv.height=36;glyph(+c.id[1]-1,cv.getContext("2d"),36);b.prepend(cv)}}
  else b.textContent="🔒 ???  "+(c.room?"("+c.room+"da izlang)":"(sir hali ochilmagan)");
  L.appendChild(b)}}
function openJ(){if(S.pause)return;jrOn=1;rJ();$("jr").classList.remove("h");lock()}
function closeJ(){jrOn=0;$("jr").classList.add("h");unlock()}
$("dcc").onclick=closeD;$("jx").onclick=closeJ;$("dcp").onclick=()=>tape(cur);tj.onclick=()=>jrOn?closeJ():openJ();
addEventListener("keydown",e=>{if(!S.on)return;
 if(e.code=="KeyJ"&&!e.repeat){e.preventDefault();e.stopImmediatePropagation();dcOn?closeD():jrOn?closeJ():openJ();return}
 if(!ST.ui)return;
 if(["KeyE","Enter","Space","Escape"].includes(e.code)){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)dcOn?closeD():jrOn?closeJ():ST.closeExt&&ST.closeExt()}
 else if(["KeyF","KeyP"].includes(e.code))e.stopImmediatePropagation()},true);
})();
