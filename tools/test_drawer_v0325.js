const fs = require('fs');
const vm = require('vm');
const assert = require('assert');

class ClassList { constructor(){ this.s=new Set(); } add(...x){x.forEach(v=>this.s.add(v));} remove(...x){x.forEach(v=>this.s.delete(v));} contains(x){return this.s.has(x);} toggle(x,force){ if(force===undefined){ if(this.s.has(x)){this.s.delete(x);return false;} this.s.add(x);return true;} if(force)this.s.add(x); else this.s.delete(x); return !!force; } }
class El { constructor(id=''){this.id=id;this.innerHTML='';this.textContent='';this.value='';this.dataset={};this.classList=new ClassList();this.listeners={};} addEventListener(t,fn){this.listeners[t]=fn;} insertAdjacentHTML(_p,html){this.innerHTML += html;} focus(){} scrollIntoView(){} get lastElementChild(){return {scrollIntoView(){}};} }

const gamePath=process.argv[2] || 'android-exact-v0317/app/src/main/assets/game/game.js';
const source=fs.readFileSync(gamePath,'utf8');

function makeGame(){
  const ids=['scene','roomName','commandForm','commandInput','drawer','drawerTitle','drawerBody','drawerClose','parserNote'];
  const els=Object.fromEntries(ids.map(id=>[id,new El(id)]));
  const navs=['room','inventory','journal','settings'].map(p=>{const e=new El();e.dataset.panel=p;return e;});
  const document={getElementById(id){return els[id]||(els[id]=new El(id));},querySelectorAll(sel){return sel.includes('.bottom-nav')?navs:[];}};
  const store={};
  const localStorage={getItem(k){return store[k]??null;},setItem(k,v){store[k]=String(v);},removeItem(k){delete store[k];}};
  const window={WTHKSfx:{playBedroomDoorSlam(){},preload(){}}};
  const sandbox={console,document,localStorage,window,setTimeout,clearTimeout,Math,JSON}; sandbox.global=sandbox; sandbox.globalThis=sandbox;
  vm.createContext(sandbox);
  vm.runInContext(source,sandbox,{filename:gamePath});
  function command(text){
    els.commandInput.value=text;
    els.commandForm.listeners.submit({preventDefault(){}});
    const matches=[...els.scene.innerHTML.matchAll(/<p class="response">([\s\S]*?)<\/p>/g)];
    return matches.length?matches[matches.length-1][1].replace(/<[^>]+>/g,''):'';
  }
  return {command};
}

function expect(game,text,needle){
  const response=game.command(text);
  assert.ok(response.toLowerCase().includes(needle.toLowerCase()), `${text}\nExpected: ${needle}\nGot: ${response}`);
  return response;
}

// Exact misses Jen found.
{
  const g=makeGame();
  expect(g,'inspect drawer','shallow wooden drawer');
  expect(g,'pull drawer','moves perhaps an inch');
  expect(g,'shake drawer','shifts with a soft scrape');
  expect(g,'pull drawer','opens cleanly');
  expect(g,'inspect drawer','drawer is open');
}

// Close synonyms for shaking should all understand the same physical idea.
for (const cmd of ['jiggle drawer','wiggle drawer','rock drawer']) {
  const g=makeGame();
  expect(g,'pull drawer','moves perhaps an inch');
  expect(g,cmd,'catch feels less solid');
  expect(g,'pull drawer','opens cleanly');
}

// Direct careful/non-destructive techniques.
for (const cmd of [
  'lift drawer','lift front of drawer','pull drawer while lifting','angle drawer',
  'ease drawer open','work drawer open','open drawer carefully','pull drawer gently'
]) {
  const g=makeGame();
  expect(g,cmd,'without breaking');
}

// Reset-the-catch family.
for (const cmd of ['push drawer in then pull','close drawer and try again']) {
  const g=makeGame();
  expect(g,'pull drawer','moves perhaps an inch');
  expect(g,cmd,'opens normally');
}

// Existing careful tool routes remain valid and were missing from the test checklist emphasis.
for (const cmd of ['pry drawer','use coin on drawer','use pen on drawer','unblock drawer']) {
  const g=makeGame();
  expect(g,cmd,'drawer slides open');
}

// Violence still remains a valid consequence path.
{
  const g=makeGame();
  expect(g,'yank drawer','drawer comes free');
}

console.log('Master Bedroom v0.3.25 drawer parser tests PASS');
