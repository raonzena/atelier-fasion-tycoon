const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const source=fs.readFileSync(path.join(__dirname,'../dist/client/game.js'),'utf8');
const start=source.indexOf('  const SEWING_MAX_LEVEL=');
const end=source.indexOf('  const showSewingResult=',start);
assert(start>0&&end>start);
const context={};vm.createContext(context);
vm.runInContext(source.slice(start,end)+'\nthis.api={sewingTarget,sewingGuide,sewingMatch};',context);
const {sewingTarget,sewingGuide,sewingMatch}=context.api;

assert.equal(sewingTarget(1),60);
assert.equal(sewingTarget(10),87);
for(let level=1;level<=10;level++){
  const guide=sewingGuide(level);
  assert.equal(sewingMatch(guide,guide),100);
  assert.ok(sewingTarget(level)>sewingTarget(level-1)||level===1);
  assert.ok(guide.every(p=>p.y>0&&p.y<320));
}
const straight=sewingGuide(1);
assert.equal(sewingMatch(straight,[]),0);
assert.equal(sewingMatch(straight,[straight[0],straight[1]]),0);
assert.ok(sewingMatch(straight,straight.map(p=>({x:p.x,y:p.y+45})))<sewingTarget(1));
assert.ok(sewingMatch(straight,straight.slice(0,30))<sewingTarget(1));
assert.ok(sewingMatch(straight,straight.map(p=>({x:p.x,y:p.y+5})))>=sewingTarget(10));
console.log('Ten sewing levels tighten passing scores; full, short, and offset strokes are evaluated.');
