// Yakka o'yin: ESKI (backup) va YANGI kodda maxluq/o'yinchi harakati bir xil bo'lishi kerak (bir xil seed).
const H=require('./harness'),path=require('path'),fs=require('fs');
const NEWD=path.join(__dirname,'..'),OLDD=process.argv[2]||path.join(__dirname,'old');
if(!fs.existsSync(path.join(OLDD,'game.js'))){console.log('Eski (BACKUP) kod topilmadi: '+OLDD+'\nBACKUP-v5-before-update-phase1.zip ni extract qilib, ichidagi THE-ABANDONED-HOUSE papkasi yo‘lini bering: node parity.js <yo‘l>');process.exit(2)}
function run(dir,files,seed){const w=H.makeWorld('p-'+dir,dir,files,seed,null);w.ev('begin()');const tr=[];
 w.ev('k.KeyW=1');
 for(let i=0;i<2400;i++){ // 2400*0.25s = 600s o'yin vaqti
  const t=i*.25;w.ev(`S.yaw=Math.sin(${t}*.7)*3;S.fl=${Math.floor(t/20)%3?'true':'false'};sp.visible=S.fl;`);
  if(i%8==0)w.ev('(function(){const d=Math.hypot(P.x-M.x,P.z-M.z);if(M.on&&d<7){let c=NODES.filter(n=>Math.hypot(n[0]-M.x,n[1]-M.z)>11);if(!c.length)c=NODES;const n=c[(Math.floor(S.yaw*1000)&255)%c.length];P.x=n[0];P.z=n[1]}})()');
  if(i%12==0)w.ev('(function(){const n=near();if(n&&n.o&&(n.o.g||n.o.c))act()})()');
  H.advance(250);
  if(i%4==0)tr.push(w.ev('[+M.x.toFixed(3),+M.z.toFixed(3),M.st,+P.x.toFixed(3),+P.z.toFixed(3),S.on,S.keys,doors.map(d=>d.open?1:0).join("")].join()'));
  if(!w.ev('S.on'))break}
 return{tr,err:H.errors().slice()}}
let fail=0;for(const seed of[7,11,23,42]){
H.clearErrors();const a=run(OLDD,['game.js','story.js','puzzles.js','multiplayer.js'],seed);H.clearErrors();
const b=run(NEWD,['game.js','story.js','puzzles.js','multiplayer.js','netsync.js'],seed);
let diff=-1;for(let i=0;i<Math.max(a.tr.length,b.tr.length);i++)if(a.tr[i]!==b.tr[i]){diff=i;break}
console.log('seed',seed,'old samples:',a.tr.length,'new samples:',b.tr.length,'old errors:',a.err.length,'new errors:',b.err.length);
console.log('last old:',a.tr[a.tr.length-1]);console.log('last new:',b.tr[b.tr.length-1]);
if(diff>=0)fail++;console.log(diff<0?'  PARITY PASS':'  PARITY FAIL at sample '+diff+'\n old '+a.tr[diff]+'\n new '+b.tr[diff])}
console.log(fail?'JAMI: FAIL':'JAMI: PASS');
