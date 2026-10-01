const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '../game.js'), 'utf8');
const start = source.indexOf('  const levelChange =');
const end = source.indexOf('  const animateLevelChanges =', start);
assert(start > 0 && end > start);
const context = {celebration:()=>'<div class="celebration"></div>'};
vm.createContext(context);
vm.runInContext(source.slice(start,end)+'\nthis.api={levelChange,levelUpPanel};',context);
const {levelChange,levelUpPanel}=context.api;
const staff=levelChange('고용 가능 직원',4,6,'명');
assert.match(staff,/data-level-from="4" data-level-to="6"/);
assert.match(staff,/\+2명/);
const rate=levelChange('시즌 이자율',8,7.5,'%','%p',1);
assert.match(rate,/8\.0%/);
assert.match(rate,/-0\.5%p/);
const panel=levelUpPanel('오피스 LV.4 달성!',[staff,rate],'새 작업실');
assert.match(panel,/celebration/);
assert.match(panel,/고용 가능 직원/);
assert.match(panel,/새 작업실/);

const widthMatch=source.match(/const officeArtworkWidth=level=>([^;]+);/);
assert(widthMatch);
const officeArtworkWidth=vm.runInNewContext('level=>'+widthMatch[1], {OFFICE_MAX:12});
assert.equal(officeArtworkWidth(1),58);
assert.equal(officeArtworkWidth(12),100);
for(const level of [1,4,8,10,12]){
  const width=officeArtworkWidth(level);
  assert(Math.abs(width*(700/width)/100-7)<1e-9);
  assert(Math.abs(width*(840/width)/100-8.4)<1e-9);
}
console.log('Level-up change labels, confetti panel, and room/sprite scaling passed.');
