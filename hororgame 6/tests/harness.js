/* Headless test harness (Node vm): THREE/DOM stub + virtual clock + fake PeerJS. Haqiqiy brauzer/WebGL EMAS — faqat o'yin mantiqini tekshiradi. */
const vm=require('vm'),fs=require('fs'),path=require('path');
let NOW=0,QID=0,Q=[],ERR=[];const worlds=[];
const schedule=(fn,ms,w,rep)=>{const e={t:NOW+ms,fn,id:++QID,rep,ms,w};Q.push(e);return e.id};
const mulberry=a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
class V{constructor(x=0,y=0,z=0){this.x=x;this.y=y;this.z=z}set(x,y,z){this.x=x;this.y=y;this.z=z;return this}setScalar(s){this.x=this.y=this.z=s;return this}}
class O3{constructor(){this.position=new V();this.rotation=new V();this.scale=new V(1,1,1);this.children=[];this.visible=true}
 add(...a){this.children.push(...a);return this}remove(...a){for(const c of a){const i=this.children.indexOf(c);if(i>=0)this.children.splice(i,1)}return this}
 traverse(f){f(this);this.children.forEach(c=>c.traverse&&c.traverse(f))}}
class Geo{constructor(p){this.parameters=p}}
class Tex{constructor(){this.repeat=new V()}clone(){return new Tex()}}
class Mat{constructor(o){Object.assign(this,o||{});this.color={v:(o||{}).color,setHex(h){this.v=h}}}}
const mk=(n,f)=>({[n]:class extends Geo{constructor(...a){super(f(...a))}}})[n];
const THREE={Group:O3,Scene:class extends O3{},Object3D:O3,
 Mesh:class extends O3{constructor(g,m){super();this.isMesh=true;this.geometry=g;this.material=m}},
 BoxGeometry:mk('B',(w,h,d)=>({width:w,height:h,depth:d})),PlaneGeometry:mk('P',(w,h)=>({width:w,height:h})),CylinderGeometry:mk('C',()=>({})),SphereGeometry:mk('S',()=>({})),TorusGeometry:mk('T',()=>({})),
 MeshStandardMaterial:Mat,MeshBasicMaterial:Mat,SpriteMaterial:Mat,Sprite:class extends O3{},CanvasTexture:Tex,
 Color:class{},FogExp2:class{},AmbientLight:class extends O3{},PointLight:class extends O3{constructor(c,i){super();this.intensity=i}},
 SpotLight:class extends O3{constructor(c,i){super();this.intensity=i;this.target=new O3();this.shadow={mapSize:new V()}}},
 PerspectiveCamera:class extends O3{updateProjectionMatrix(){}},Clock:class{getDelta(){return .016}},
 WebGLRenderer:class{constructor(){this.shadowMap={};this.domElement=mkEl('canvas')}setPixelRatio(){}setSize(){}render(){}},
 PCFSoftShadowMap:1,RepeatWrapping:1};
const g2=new Proxy({},{get:(t,k)=>k in t?t[k]:()=>{},set:(t,k,v)=>{t[k]=v;return true}});
function mkEl(id){const cl=new Set(),l={};return{id,style:{},children:[],textContent:'',value:'',disabled:false,
 classList:{add:c=>cl.add(c),remove:c=>cl.delete(c),contains:c=>cl.has(c),toggle(c,f){(f===undefined?!cl.has(c):f)?cl.add(c):cl.delete(c)}},
 addEventListener(t,f){(l[t]=l[t]||[]).push(f)},appendChild(c){return c},append(){},prepend(){},remove(){},getContext:()=>g2,requestPointerLock(){},closest:()=>null,setAttribute(){},
 get offsetWidth(){return 0},set className(v){cl.clear();String(v).split(' ').forEach(c=>c&&cl.add(c))},get className(){return[...cl].join(' ')},width:0,height:0,innerHTML:'',children:[]}}
function makeWorld(name,dir,files,seed,net){
 const els={},w={name,els,raf:null};
 const doc={getElementById:id=>els[id]||(els[id]=mkEl(id)),createElement:t=>mkEl(t),body:mkEl('body'),head:mkEl('head'),addEventListener(){},hidden:false,pointerLockElement:null,exitPointerLock(){}};
 const sb={console,Math:Object.create(Math),JSON,Object,Array,Number,String,Set,Map,Promise,isFinite,parseInt,Error,
  document:doc,navigator:{userAgent:'node'},performance:{now:()=>NOW},matchMedia:()=>({matches:false}),devicePixelRatio:1,innerWidth:1280,innerHeight:720,location:{reload(){}},THREE,
  setTimeout:(f,ms)=>schedule(f,ms||0,w),setInterval:(f,ms)=>schedule(f,ms,w,1),clearTimeout:id=>{Q=Q.filter(e=>e.id!=id)},clearInterval:id=>{Q=Q.filter(e=>e.id!=id)},
  requestAnimationFrame:f=>{w.raf=f},addEventListener(){}};
 sb.Math.random=mulberry(seed);sb.window=sb;sb.globalThis=sb;
 if(net)sb.Peer=net.mkPeer(w);
 w.ctx=vm.createContext(sb);w.dir=dir;
 for(const f of files){try{vm.runInContext(fs.readFileSync(path.join(dir,f),'utf8'),w.ctx,{filename:f})}catch(e){ERR.push(name+' load '+f+': '+e.stack.split('\n').slice(0,3).join(' | '))}}
 w.el=id=>doc.getElementById(id);w.ev=c=>vm.runInContext(c,w.ctx);w.click=id=>{const e=els[id];e.onclick&&e.onclick()};w.shown=id=>!doc.getElementById(id).classList.contains('h');
 const html=fs.readFileSync(path.join(dir,'index.html'),'utf8');for(const m of html.matchAll(/id="([^"]+)"/g)){const e=doc.getElementById(m[1]);const t=html.slice(Math.max(0,m.index-120),m.index).match(/class="([^"]*)"[^<]*$/);if(t)t[1].split(' ').forEach(c=>c&&e.classList.add(c))}
 worlds.push(w);return w}
function advance(ms){const end=NOW+ms;while(NOW<end){NOW+=16;
 for(;;){Q.sort((a,b)=>a.t-b.t||a.id-b.id);const e=Q[0];if(!e||e.t>NOW)break;if(e.rep){e.t+=Math.max(1,e.ms)}else Q.shift();try{e.fn()}catch(x){ERR.push((e.w?e.w.name:'?')+' timer: '+x.stack.split('\n').slice(0,3).join(' | '))}}
 for(const w of worlds){const f=w.raf;if(f){w.raf=null;try{f()}catch(x){ERR.push(w.name+' frame: '+x.stack.split('\n').slice(0,3).join(' | '))}}}}}
function makeNet(){const net={peers:{},LAT:30};
 class Conn{constructor(){this.open=false;this.h={}}on(e,f){this.h[e]=f}emit(e,...a){this.h[e]&&this.h[e](...a)}
  send(o){const s=JSON.stringify(o),oth=this.other;schedule(()=>{if(oth.open)oth.emit('data',JSON.parse(s))},net.LAT)}
  close(){if(!this.open)return;this.open=false;this.other.open=false;const o=this.other;schedule(()=>{this.emit('close');o.emit('close')},5)}}
 net.mkPeer=w=>class Peer{constructor(id,o){if(id&&typeof id=='object'){o=id;id=null}this.id=id||'g'+Math.floor(Math.random()*1e9);this.h={};net.peers[this.id]=this;schedule(()=>this.h.open&&this.h.open(this.id),5)}
  on(e,f){this.h[e]=f}emit(e,...a){this.h[e]&&this.h[e](...a)}
  connect(id){const t=net.peers[id],a=new Conn(),b=new Conn();a.other=b;b.other=a;if(!t){schedule(()=>this.emit('error',{type:'peer-unavailable'}),5);return a}
   schedule(()=>{t.emit('connection',b);a.open=b.open=true;a.emit('open');b.emit('open')},10);net.last={a,b};return a}
  destroy(){delete net.peers[this.id]}reconnect(){}};
 return net}
module.exports={reset:()=>{Q=[];worlds.length=0;ERR.length=0},makeWorld,advance,makeNet,errors:()=>ERR,clearErrors:()=>{ERR.length=0},now:()=>NOW};
