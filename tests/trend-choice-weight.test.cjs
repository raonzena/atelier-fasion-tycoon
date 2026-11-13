const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const source=fs.readFileSync(path.join(__dirname,'../dist/client/game.js'),'utf8');
const trends=source.slice(source.indexOf('  const trends = ['),source.indexOf('  const fashionWeekArtwork ='));
const scoring=source.slice(source.indexOf('  const trendMatchCount='),source.indexOf('  const materialMatch='));
const context={weightedStats:()=>20,state:{releases:0}};
vm.createContext(context);
vm.runInContext(trends+scoring+'\nthis.api={trends,trendMatchCount,trendWeight,collectionGoal};',context);
const {trends:seasons,trendMatchCount,trendWeight,collectionGoal}=context.api;
assert.equal(seasons.length,8);
assert.ok(seasons.every(trend=>typeof trend.material==='string'&&trend.material.length));
const trend=seasons[0];
const choices={target:'다른 고객',item:'다른 의류',style:'다른 스타일',material:'다른 소재'};
const goal=collectionGoal({});
assert.equal(trendMatchCount(choices,trend),0);
for(const [index,key] of ['target','item','style','material'].entries()){
  choices[key]=trend[key];
  const matches=trendMatchCount(choices,trend);
  assert.equal(matches,index+1);
  assert.ok(trendWeight(matches)>trendWeight(matches-1));
  assert.equal(collectionGoal({}),goal,'trend matches must not change the ability target');
}
assert.equal(trendMatchCount(choices,trend),4);
assert.deepEqual(Array.from({length:5},(_,count)=>trendWeight(count)),[0,4,9,14,18]);
assert.equal(goal,14.8);
context.state.releases=3;
assert.equal(collectionGoal({}),13);
const trial=source.slice(source.indexOf('  const collectionTrial ='),source.indexOf('  const runwayPrizes='));
context.rollStats=()=>({design:3});
context.weightedStats=stats=>stats.design;
vm.runInContext(trial+'\nthis.collectionTrial=collectionTrial;',context);
assert.equal(context.collectionTrial({},4,22,()=>.1).bonusSaved,true);
assert.equal(context.collectionTrial({},4,22,()=>.5).success,false);
assert.match(source,/const choices=\{target:null,item:null,style:null,material:null\}/);
assert.match(source,/disabled=!complete\|\|selectedCount===0/);
console.log('All four trend matches increase a percentage rescue chance without changing the ability target.');
