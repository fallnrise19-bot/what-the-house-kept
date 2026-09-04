const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

class ClassList { constructor(){ this.s=new Set(); } add(...x){x.forEach(v=>this.s.add(v));} remove(...x){x.forEach(v=>this.s.delete(v));} contains(x){return this.s.has(x);} toggle(x,force){ if(force===undefined){ if(this.s.has(x)){this.s.delete(x);return false;} this.s.add(x);return true;} if(force)this.s.add(x); else this.s.delete(x); return !!force; } }
class El { constructor(id=''){this.id=id;this.innerHTML='';this.textContent='';this.value='';this.dataset={};this.classList=new ClassList();this.listeners={};} addEventListener(t,fn){this.listeners[t]=fn;} insertAdjacentHTML(_p,html){this.innerHTML += html;} focus(){} scrollIntoView(){} get lastElementChild(){return {scrollIntoView(){}};} }

const gamePath=process.argv[2] || 'android-exact-v0317/app/src/main/assets/game/game.js';
const gameSource=fs.readFileSync(gamePath,'utf8');

function boot(){
  const ids=['scene','roomName','commandForm','commandInput','drawer','drawerTitle','drawerBody','drawerClose','parserNote'];
  const els=Object.fromEntries(ids.map(id=>[id,new El(id)]));
  const navs=['room','inventory','journal','settings'].map(p=>{const e=new El();e.dataset.panel=p;return e;});
  const document={getElementById(id){return els[id]||(els[id]=new El(id));},querySelectorAll(sel){return sel.includes('.bottom-nav')?navs:[];}};
  const store={};
  const localStorage={getItem(k){return store[k]??null;},setItem(k,v){store[k]=String(v);},removeItem(k){delete store[k];}};
  const window={WTHKSfx:{playBedroomDoorSlam(){},preload(){}}};
  const sandbox={console,document,localStorage,window,setTimeout,clearTimeout,Math,JSON}; sandbox.global=sandbox; sandbox.globalThis=sandbox;
  vm.createContext(sandbox);
  vm.runInContext(gameSource,sandbox,{filename:gamePath});
  function command(text){
    els.commandInput.value=text;
    els.commandForm.listeners.submit({preventDefault(){}});
    const matches=[...els.scene.innerHTML.matchAll(/<p class="response">([\s\S]*?)<\/p>/g)];
    const response=matches.length?matches[matches.length-1][1].replace(/<[^>]+>/g,''):'';
    return {room:els.roomName.textContent,response};
  }
  return {els,command};
}
function expect(ctx,text,needle){const r=ctx.command(text);assert.ok(r.response.toLowerCase().includes(needle.toLowerCase()),`${text}\nExpected: ${needle}\nGot: ${r.response}`);return r;}

let c=boot();
expect(c,'look at bathroom door','slightly swollen');
let r=expect(c,'go bathroom','half an inch');
assert.strictEqual(r.room,'Master Bedroom');
r=expect(c,'push door','pops free');
assert.strictEqual(r.room,'Ensuite Bathroom');
c.command('go back to bedroom');
r=c.command('go bathroom');
assert.strictEqual(r.room,'Ensuite Bathroom','Once freed, the ensuite door must stay freed.');

c=boot();
r=expect(c,'go bathroom','half an inch');
assert.strictEqual(r.room,'Master Bedroom');
r=expect(c,'kick door','Good. Mature.');
assert.strictEqual(r.room,'Ensuite Bathroom');

c=boot();
r=expect(c,'unlock bathroom door','not locked');
assert.strictEqual(r.room,'Master Bedroom');
r=expect(c,'jiggle door','pops free');
assert.strictEqual(r.room,'Ensuite Bathroom');

c=boot();
r=expect(c,'kick bathroom door','Good. Mature.');
assert.strictEqual(r.room,'Ensuite Bathroom','An explicit kick of the ensuite door may solve the nuisance immediately.');

c=boot();
r=expect(c,'open door','hallway');
assert.strictEqual(r.room,'Master Bedroom','Generic OPEN DOOR must remain the bedroom/hall door, not the ensuite.');

console.log('Ensuite v0.3.24 sticky-door tests PASS');
