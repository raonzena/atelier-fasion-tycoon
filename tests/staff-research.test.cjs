const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source=fs.readFileSync(path.join(__dirname,'../dist/client/game.js'),'utf8');
const calendar=source.slice(source.indexOf('  const currentMonth='),source.indexOf('  const definition ='));
const research=source.slice(source.indexOf('  const researchDiscount='),source.indexOf('  const collectionTrial ='));
const unlocks=new Set();
const context={
  state:{monthsElapsed:0,staff:{yuna:{productionYear:1,productionCount:5}}},
  trends:Array.from({length:8},()=>({season:'봄',style:'미니멀',item:'셔츠',target:'20대 직장인'})),
  has:key=>unlocks.has(key),
  unlockedOptions:()=>[],
  weightedStats:()=>20
};
vm.createContext(context);
vm.runInContext(calendar+research+'\nthis.api={calendarYear,participationCount,remainingParticipations,researchDiscount,collectionGoal};',context);

assert.equal(context.api.participationCount('yuna'),5);
assert.equal(context.api.remainingParticipations('yuna'),0);
assert.equal(context.api.participationCount('newStaff'),0);
context.state.monthsElapsed=12; // January of the next game year.
assert.equal(context.api.calendarYear(),2);
assert.equal(context.api.participationCount('yuna'),0);
assert.equal(context.api.remainingParticipations('yuna'),5);
context.state.monthsElapsed=0;
const choices={item:'셔츠',style:'미니멀',target:'20대 직장인'};
const base=context.api.collectionGoal({},0,false,choices);
unlocks.add('patternResearch');
unlocks.add('trendResearch');
unlocks.add('customerResearch');
assert.equal(context.api.collectionGoal({},0,false,choices),base-3);
assert.equal(context.api.researchDiscount({...choices,item:'아우터',style:'클래식',target:'10대 학생'}),0);

assert.match(source,/selected\.length>MAX_PRODUCTION_STAFF\|\|selected\.some\(w=>participationCount\(w\.id\)>=MAX_YEARLY_PRODUCTIONS\)/);
assert.match(source,/member\.productionCount=participationCount\(w\.id,releaseYear\)\+1/);
assert.match(source,/checkbox\.disabled=exhausted/);
console.log('Yearly participation resets, research changes collection goals, and production enforces staffing limits.');
