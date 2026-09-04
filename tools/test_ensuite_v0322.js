const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

class ClassList { constructor(){ this.s=new Set(); } add(...x){x.forEach(v=>this.s.add(v));} remove(...x){x.forEach(v=>this.s.delete(v));} contains(x){return this.s.has(x);} toggle(x,force){ if(force===undefined){ if(this.s.has(x)){this.s.delete(x);return false;} this.s.add(x);return true;} if(force)this.s.add(x); else this.s.delete(x); return !!force; } }
class El { constructor(id=''){this.id=id;this.innerHTML='';this.textContent='';this.value='';this.dataset={};this.classList=new ClassList();this.listeners={};} addEventListener(t,fn){this.listeners[t]=fn;} insertAdjacentHTML(_p,html){this.innerHTML += html;} focus(){} scrollIntoView(){} get lastElementChild(){return {scrollIntoView(){}};} }
const ids=['scene','roomName','commandForm','commandInput','drawer','drawerTitle','drawerBody','drawerClose','parserNote'];
const els=Object.fromEntries(ids.map(id=>[id,new El(id)]));
const navs=['room','inventory','journal','settings'].map(p=>{const e=new El();e.dataset.panel=p;return e;});
const document={getElementById(id){return els[id]||(els[id]=new El(id));},querySelectorAll(sel){return sel.includes('.bottom-nav')?navs:[];}};
const store={};
const localStorage={getItem(k){return store[k]??null;},setItem(k,v){store[k]=String(v);},removeItem(k){delete store[k];}};
const window={WTHKSfx:{playBedroomDoorSlam(){},preload(){}}};
const sandbox={console,document,localStorage,window,setTimeout,clearTimeout,Math,JSON}; sandbox.global=sandbox; sandbox.globalThis=sandbox;
vm.createContext(sandbox);
const gamePath=process.argv[2] || 'android-exact-v0317/app/src/main/assets/game/game.js';
vm.runInContext(fs.readFileSync(gamePath,'utf8'),sandbox,{filename:gamePath});

function command(text){
  els.commandInput.value=text;
  els.commandForm.listeners.submit({preventDefault(){}});
  const matches=[...els.scene.innerHTML.matchAll(/<p class="response">([\s\S]*?)<\/p>/g)];
  const response=matches.length?matches[matches.length-1][1].replace(/<[^>]+>/g,''):'';
  return {room:els.roomName.textContent,response};
}
function expect(text,needle){const r=command(text); assert.ok(r.response.toLowerCase().includes(needle.toLowerCase()), `${text}\nExpected: ${needle}\nGot: ${r.response}`); return r;}

command('go bathroom');
if (els.roomName.textContent !== 'Ensuite Bathroom') command('push door');
assert.strictEqual(els.roomName.textContent,'Ensuite Bathroom');
expect('look','eight-by-ten');
expect('open cabinet','two plausible cabinets');
expect('open medicine cabinet','cartoon animals');
expect('close medicine cabinet','closes the medicine cabinet');
expect('open cupboard under the sink','step stool');
expect('close cupboard under sink','swollen cupboard door shut');
expect('look at compact mirror','folding compact mirror');
expect('pick up compact mirror','takes the small compact mirror');
expect('look at bathroom mirror','bathroom mirror');
expect('look brush','Which brush');
expect("grab Jennifer's brush","takes Jennifer's hairbrush");
expect('clean hairbrush','works the strands');
expect('look hairbrush','bristles are clear');
expect('put hairbrush back','puts Jennifer');
expect('discard hairbrush','small bathroom bin');
expect('look hairbrush','no longer here');
expect('look step stool','blue rubber feet');
expect('drag stool','pulls the small plastic stool');
expect('check behind stool','Crayon');
expect('step onto stool','nine inches');
expect('look star sticker','faded yellow star');
expect('turn on faucet','pipes complain');
expect('stop water','shuts off the faucet');
expect('fill basin','sink is full');
expect('empty sink','circles the drain');
expect('open toilet','lifts the toilet lid');
expect('close toilet lid','lowers the toilet lid');
expect('flush toilet','flushes');
expect('open shower curtain','pulls the curtain aside');
expect('look behind shower curtain','tub is empty');
expect('close shower curtain','curtain closed');
expect('start shower','pipes knock loudly');
expect('stop shower','shuts off the shower');
expect('look bathtub','shallow and old-fashioned');
expect('look rubber mat','textured rubber mat');
expect('open window','unlatches the small frosted window');
expect('shout out window','dog begins barking');
expect('shut window','closes and latches');
expect('look screwdriver','vent covers');
expect('use screwdriver on vent','needs something suitable');
expect('grab screwdriver','takes the small screwdriver');
expect('use screwdriver on vent','removes the two small screws');
expect('reach into vent','dust, cool metal');
expect('look safety pins','ordinary safety pins');
expect('take safety pin','takes one of the safety pins');
expect('look toiletries','ordinary toiletries');
expect('look painkillers','over-the-counter painkillers');
expect('look cotton swabs','half-empty box');
expect('look mouthwash','third full');
expect('pour water on floor','floor is now wet');
expect('use hair dryer on wet floor','warm air across the wet tile');
expect('mix bleach with cleaner','refuses immediately');
expect('put hair dryer in sink','not putting an electrical appliance');
command('go back to bedroom');
assert.strictEqual(els.roomName.textContent,'Master Bedroom');
console.log('Ensuite v0.3.22 parser tests PASS');
