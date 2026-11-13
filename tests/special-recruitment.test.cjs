const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../dist/client/game.js'),'utf8');
for(const sprite of ['ruby','flora','star','elli','theo']){
  assert.match(source,new RegExp("sprite:'cat-special-"+sprite+"'"));
  assert(fs.statSync(path.join(__dirname,'../dist/client/assets/cat-special-'+sprite+'.webp')).size>1000);
}
const start=source.indexOf('  const SPECIAL_APPEAR_CHANCE=');
const end=source.indexOf('  const showPager =',start);
assert(start>0&&end>start);
const workers=[{id:'regular'},{id:'specialRuby',special:true},{id:'specialStar',special:true}];
const state={hired:[]};
const context={workers,state};
vm.createContext(context);
vm.runInContext(source.slice(start,end)+'\nthis.drawSpecialCandidate=drawSpecialCandidate;',context);
assert.equal(context.drawSpecialCandidate(()=>.03),null);
let rolls=[.01,.8];
assert.equal(context.drawSpecialCandidate(()=>rolls.shift()).id,'specialStar');
state.hired=['specialStar'];
rolls=[.01,.8];
assert.equal(context.drawSpecialCandidate(()=>rolls.shift()).id,'specialRuby');
state.hired=['specialStar','specialRuby'];
assert.equal(context.drawSpecialCandidate(()=>0),null);
assert.match(source,/if\(newVisit\)featuredSpecial=drawSpecialCandidate\(\)/);
assert.match(source,/if\(featuredSpecial\)roster\.unshift\(featuredSpecial\)/);
assert.match(source,/showHire\(0,true\)/);
console.log('Special staff appear at 3% per recruitment visit, choose among unhired candidates, and lead page one.');
