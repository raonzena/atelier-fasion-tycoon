const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../game.js'), 'utf8');
const start = source.indexOf('  const initial =');
const end = source.indexOf('  try { state=hydrate', start);
assert(start > 0 && end > start);
const context = {OFFICE_MAX:12, COMPANY_MAX:12, workers:[], furniture:[], gridSizes:[3,4,4,5,5,6,6,7,7,8,8,8]};
vm.createContext(context);
vm.runInContext(source.slice(start,end)+'\nthis.api={hydrate};',context);

const old=context.api.hydrate({layoutVersion:3,officeLevel:10,companyLevel:10,releases:4,placed:[],hired:[]});
assert.equal(old.monthsElapsed,12); // Four old seasonal releases still show spring in Year 2.
assert.equal(old.companyLevel,3);
assert.equal(old.officeLevel,10);

const current=context.api.hydrate({layoutVersion:3,officeLevel:12,companyLevel:12,releases:22,monthsElapsed:22,placed:[],hired:[]});
assert.equal(current.monthsElapsed,22);
assert.equal(current.companyLevel,12);
assert.equal(current.officeLevel,12);
console.log('Existing seasonal saves retain their date and new level-12 saves load.');
