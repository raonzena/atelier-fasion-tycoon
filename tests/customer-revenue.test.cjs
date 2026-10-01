const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const source=fs.readFileSync(path.join(__dirname,'../dist/client/game.js'),'utf8');
const match=source.match(/  const customerRevenueBonus=customers=>[^;]+;/);
assert(match);
const context={};
vm.createContext(context);
vm.runInContext(match[0]+'\nthis.bonus=customerRevenueBonus;',context);
assert.equal(context.bonus(0),0);
assert.equal(context.bonus(100),50);
assert.equal(context.bonus(200),100);
assert.equal(context.bonus(-10),0);
assert.match(source,/const customerBonus=customerRevenueBonus\(state\.customers\);[\s\S]*?state\.customers=Math\.max\(0,state\.customers\+gained\)/);
console.log('Existing customers add half their count to revenue; new customers count from the next launch.');
