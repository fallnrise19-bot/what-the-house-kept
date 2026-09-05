const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

class ClassList { constructor(){ this.s=new Set(); } add(...x){x.forEach(v=>this.s.add(v));} remove(...x){x.forEach(v=>this.s.delete(v));} contains(x){return this.s.has(x);} toggle(x,force){ if(force===undefined){ if(this.s.has(x)){this.s.delete(x);return false;} this.s.add(x);return true;} if(force)this.s.add(x); else this.s.delete(x); return !!force; } }
class El { constructor(id=''){this.id=id;this.innerHTML='';this.textContent='';this.value='';this.dataset={};this.classList=new ClassList();this.listeners={};} addEventListener(t,fn){this.listeners[t]=fn;} insertAdjacentHTML(_p,html){this.innerHTML += html;} focus(){} scrollIntoView(){} get lastElementChild(){return {scrollIntoView(){}};} }
const ids=['scene','roomName','commandForm','commandInput','drawer','drawerTitle','drawerBody','drawerClose','parserNote','resetGame'];
const els=Object.fromEntries(ids.map(id=>[id,new El(id)]));
const navs=['room','inventory','journal','settings'].map(p=>{const e=new El();e.dataset.panel=p;return e;});
const document={getElementById(id){return els[id]||(els[id]=new El(id));},querySelectorAll(sel){return sel.includes('.bottom-nav')?navs:[];}};
const store={};
const localStorage={getItem(k){return store[k]??null;},setItem(k,v){store[k]=String(v);},removeItem(k){delete store[k];}};
const window={WTHKSfx:{playBedroomDoorSlam(){},preload(){}}};
const sandbox={console,document,localStorage,window,setTimeout,clearTimeout,Math,JSON,confirm(){return true;}}; sandbox.global=sandbox; sandbox.globalThis=sandbox;
vm.createContext(sandbox);
const gamePath=process.argv[2] || 'android-exact-v0317/app/src/main/assets/game/game.js';
vm.runInContext(fs.readFileSync(gamePath,'utf8'),sandbox,{filename:gamePath});

function command(text){
  els.commandInput.value=text;
  els.commandForm.listeners.submit({preventDefault(){}});
  const matches=[...els.scene.innerHTML.matchAll(/<p class="response">([\s\S]*?)<\/p>/g)];
  const response=matches.length?matches[matches.length-1][1].replace(/<[^>]+>/g,''):'';
  return {room:els.roomName.textContent,response,html:els.scene.innerHTML};
}
function expect(text,needle){const r=command(text); assert.ok(r.response.toLowerCase().includes(needle.toLowerCase()), `${text}\nExpected: ${needle}\nGot: ${r.response}`); return r;}

let r=command('go bathroom');
if (r.room !== 'Ensuite Bathroom') r=command('push door');
assert.strictEqual(r.room,'Ensuite Bathroom');
const transitionPos=r.html.indexOf('Apparently home maintenance has begun.');
const descriptionPos=r.html.lastIndexOf('The ensuite is a cramped eight-by-ten room directly off the master bedroom.');
assert.ok(transitionPos >= 0 && descriptionPos > transitionPos, 'The first sticky-door entry must show the bathroom description after the transition response.');

expect('look brush','Which brush');
expect('clean brush','Which brush');
expect("look at Jennifer's hairbrush",'brown strands');
expect('check hair brush','brown strands');
expect('grab Jennifer brush',"takes Jennifer's hairbrush");
expect('clean hair brush','works the strands');
expect('look hairbrush','bristles are clear');
expect('smell hair brush','old shampoo');
expect('use hair brush','catches a snag');
expect('put hair brush back',"puts Jennifer's hairbrush back");
expect('take hair brush',"takes Jennifer's hairbrush");
expect('discard hair brush','small bathroom bin');
expect('look hairbrush','no longer here');

expect('look tooth brush','Two old toothbrushes');
expect('grab tooth brush','takes his old blue toothbrush');
expect('look toothbrush','Thomas has his old blue toothbrush');
expect('put tooth brush back','puts his blue toothbrush back');
expect('brush teeth','over a year');
expect('brush my teeth','over a year');

expect('drink mouthwash','Rinse and spit');
expect('use mouthwash','buy new mouthwash');

expect('open medicine cabinet','cartoon animals');
expect('take cartoon bandage','takes the small bandage');
expect('search medicine cabinet','no longer tucked');
expect('look bandage box','gone now');

expect('drink cleaner','not getting defeated');
expect('mix cleaners','One disaster at a time');
expect('mix bleach with cleaner','refuses immediately');

console.log('Ensuite v0.3.27 correction tests PASS');
