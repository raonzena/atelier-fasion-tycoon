const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const game=fs.readFileSync(path.join(__dirname,'../game.js'),'utf8');
const cloud=fs.readFileSync(path.join(__dirname,'../cloud-save.js'),'utf8');
assert.match(html, /id="startLayer" hidden/);
assert.match(html, /id="initialLoading"[^>]*aria-busy="true"/);
assert.match(cloud, /onAuthStateChanged\(auth,async user=>/);
assert.match(cloud, /bridge\.finishStartup\(true\);\s*const selection=await bridge\.chooseSave\(\)/);

const start=game.indexOf('  let startupRevealed=false;');
const end=game.indexOf('  window.atelierGameBridge=',start);
assert(start>0&&end>start);
function boot(companyName,linked){
  const elements={
    startLayer:{hidden:true},startTitle:{textContent:''},startDescription:{textContent:''},startSignIn:{hidden:false},
    initialLoading:{hidden:false,attributes:{},classList:{classes:new Set(),add(value){this.classes.add(value);}},setAttribute(key,value){this.attributes[key]=value;}}
  };
  const timers=[];
  let scrolls=0;
  const context={
    $:id=>elements[id],state:{companyName},window:{atelierCloud:{isSignedIn:()=>linked},scrollTo:()=>scrolls++},
    setTimeout:callback=>timers.push(callback)
  };
  vm.createContext(context);
  vm.runInContext(game.slice(start,end)+'\nthis.finishStartup=finishStartup;',context);
  return {elements,timers,get scrolls(){return scrolls;},finish:context.finishStartup};
}

const guest=boot('',false);
assert.equal(guest.elements.startLayer.hidden,true); // No start card before auth resolves.
guest.finish();
assert.equal(guest.elements.startLayer.hidden,false);
assert.equal(guest.elements.startSignIn.hidden,false);
assert.equal(guest.elements.initialLoading.hidden,false); // Fade completes before removal.
guest.timers.forEach(timer=>timer());
assert.equal(guest.elements.initialLoading.hidden,true);
assert.equal(guest.scrolls,1);

const saved=boot('고양이 회사',true);
saved.finish();
assert.equal(saved.elements.startLayer.hidden,true);

const newAccount=boot('',true);
newAccount.finish();
assert.equal(newAccount.elements.startLayer.hidden,false);
assert.equal(newAccount.elements.startSignIn.hidden,true);
assert.match(newAccount.elements.startDescription.textContent,/계정에 저장/);

const conflict=boot('',true);
conflict.finish(true);
assert.equal(conflict.elements.startLayer.hidden,true); // Save choice appears without a start card underneath.
conflict.finish();
assert.equal(conflict.elements.startLayer.hidden,false);
console.log('Startup loading waits for auth, then reveals the correct account or guest screen.');
