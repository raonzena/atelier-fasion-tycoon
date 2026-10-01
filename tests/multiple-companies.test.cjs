const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../dist/client/game.js'), 'utf8');
const start = source.indexOf('  const initial =');
const end = source.indexOf('  try { state=hydratePortfolio', start);
assert(start > 0 && end > start);
const context = {OFFICE_MAX:12, COMPANY_MAX:12, companyXpRequired:level=>2*4**(level-1), workers:[], furniture:[], gridSizes:[3,4,4,5,5,6,6,7,7,8,8,8]};
vm.createContext(context);
vm.runInContext(source.slice(start,end)+'\nthis.api={hydratePortfolio,startNewCompany,switchToCompany};',context);
const {hydratePortfolio,startNewCompany,switchToCompany}=context.api;

const oldSave={companyName:'기존 회사',calendarStartMonth:1,companyXpVersion:1,companyLevel:3,companyXp:6,officeLevel:2,assets:345,customers:78,releases:7,monthsElapsed:7,placed:[],hired:[],layoutVersion:5,localSave:true};
let active=hydratePortfolio(oldSave);
assert.equal(active.companyName,'기존 회사');
assert.equal(active.companyLevel,3);
assert.equal(active.assets,345);
assert.equal(active.otherCompanies.length,0);
const firstId=active.companyId;

active=startNewCompany(active,'새 회사');
const secondId=active.companyId;
assert.notEqual(secondId,firstId);
assert.equal(active.assets,180);
assert.equal(active.customers,0);
assert.equal(active.releases,0);
assert.equal(active.localSave,true);
assert.equal(active.otherCompanies[0].state.companyName,'기존 회사');
active.assets=222;
active.otherCompanies[0].state.assets=345;

active=switchToCompany(active,active.otherCompanies[0]);
assert.equal(active.companyId,firstId);
assert.equal(active.assets,345);
assert.equal(active.companyXp,6);
assert.equal(active.otherCompanies.length,1);
assert.equal(active.otherCompanies[0].id,secondId);
assert.equal(active.otherCompanies[0].state.assets,222);

active=hydratePortfolio(JSON.parse(JSON.stringify(active)));
active=switchToCompany(active,active.otherCompanies[0]);
assert.equal(active.companyId,secondId);
assert.equal(active.assets,222);
assert.equal(active.otherCompanies.length,1);
assert.equal(active.otherCompanies[0].state.otherCompanies,undefined);
console.log('Existing company and additional company retain independent progress across switches and reloads.');
