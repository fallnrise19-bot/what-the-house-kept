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
assert.strictEqual(els.roomName.textContent,'Ensuite Bathroom');

expect('interrogate toilet','Where were you on the night in question');
expect('talk to toilet','Still not talking');
expect('question toilet','right to remain silent');

expect('name plunger','No.');
expect('give the plunger a name','Bernard');
expect('look at plunger','Bernard is still a plunger');
expect('dance with plunger','both suffered enough');

expect('use shower curtain as cape','losing an argument with vinyl');
expect('bath mat hat','standards');
expect('use hair dryer as microphone','No requests');

expect('mirror mirror on the wall','Useful as ever');
expect('talk to mirror','already established');

expect('use stool as throne','My kingdom');
expect('make toilet paper crown','Strong reign');
expect('wrap self in toilet paper','mummy costume');
expect('brush teeth with toilet brush','reconsider your priorities');
expect('draw mustache with toothpaste','Distinguished');
expect('make potion','Potion complete');
expect('nap in bathtub','Luxurious');
expect('hide from responsibilities','completely solved');
expect('make bathroom office','Corporate would hate it');
expect('eat toothpaste','Mint is not a food group');

// Existing safety priority must still beat ordinary/silly handling.
expect('mix bleach with cleaner','refuses immediately');
expect('put hair dryer in sink','not putting an electrical appliance');

// Existing normal parser families still work.
expect('open cabinet','two plausible cabinets');
expect('open medicine cabinet','cartoon animals');
expect('look at compact mirror','folding compact mirror');
expect('look step stool','blue rubber feet');
expect('turn on faucet','pipes complain');
expect('flush toilet','flushes');
expect('open shower curtain','pulls the curtain aside');
expect('look bathtub','shallow and old-fashioned');
expect('open window','unlatches the small frosted window');

command('go back to bedroom');
assert.strictEqual(els.roomName.textContent,'Master Bedroom');
console.log('Ensuite v0.3.23 absurd-interaction tests PASS');
