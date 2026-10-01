const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../dist/client/game.js'), 'utf8');
const start = source.indexOf('  const initial =');
const end = source.indexOf('  try { state=hydrate', start);
assert(start > 0 && end > start);
const context = {OFFICE_MAX:12, COMPANY_MAX:12, workers:[], furniture:[{id:'breakroom',spanX:2},{id:'longRack',spanX:3},{id:'fridge'}], gridSizes:[3,4,4,5,5,6,6,7,7,8,8,8]};
vm.createContext(context);
vm.runInContext(source.slice(start,end)+'\nthis.api={hydrate};',context);

const old=context.api.hydrate({layoutVersion:3,officeLevel:10,companyLevel:10,releases:4,placed:[],hired:[]});
assert.equal(old.monthsElapsed,14); // Old March-start date remains March in Year 2.
assert.equal(old.companyLevel,3);
assert.equal(old.officeLevel,10);

const current=context.api.hydrate({layoutVersion:3,officeLevel:12,companyLevel:12,releases:22,monthsElapsed:22,placed:[],hired:[]});
assert.equal(current.monthsElapsed,24);
assert.equal(current.companyLevel,12);
assert.equal(current.officeLevel,12);
const researching=context.api.hydrate({layoutVersion:5,officeLevel:1,releases:1,monthsElapsed:1,placed:[],hired:[],researchTasks:[{id:'linen',finishMonth:2}]});
assert.equal(researching.researchTasks.length,1);
assert.equal(researching.monthsElapsed,3);
assert.equal(researching.researchTasks[0].finishMonth,4);
const january=context.api.hydrate({calendarStartMonth:1,layoutVersion:5,officeLevel:1,releases:1,monthsElapsed:1,placed:[],hired:[],researchTasks:[{id:'linen',finishMonth:2}]});
assert.equal(january.monthsElapsed,1);
assert.equal(january.researchTasks[0].finishMonth,2);
const widened=context.api.hydrate({layoutVersion:3,officeLevel:2,releases:0,placed:[
  {id:'breakroom-1',x:1,y:1},{id:'fridge-2',x:2,y:1}
],ownedFurniture:[{id:'breakroom-1',kind:'breakroom'},{id:'fridge-2',kind:'fridge'}],hired:[]});
assert.equal(widened.layoutVersion,5);
assert.equal(widened.placed.length,2);
assert.equal(widened.placed[0].x,1);
assert.notEqual(widened.placed[1].x+','+widened.placed[1].y,'2,1'); // Move the neighbor of a newly widened breakroom.
const longer=context.api.hydrate({layoutVersion:4,officeLevel:2,releases:0,placed:[
  {id:'longRack-1',x:1,y:1},{id:'fridge-2',x:3,y:1}
],ownedFurniture:[{id:'longRack-1',kind:'longRack'},{id:'fridge-2',kind:'fridge'}],hired:[]});
assert.equal(longer.layoutVersion,5);
assert.equal(longer.placed[0].x,1);
assert.notEqual(longer.placed[1].x+','+longer.placed[1].y,'3,1');
console.log('Existing saves retain their date and widen furniture without overlap.');
