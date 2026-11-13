const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const source=fs.readFileSync(path.join(__dirname,'../dist/client/game.js'),'utf8');
const trends=source.slice(source.indexOf('  const trends = ['),source.indexOf('  const fashionWeekArtwork ='));
const scoring=source.slice(source.indexOf('  const trendMatchCount='),source.indexOf('  const materialMatch='));
const context={weightedStats:()=>20,researchDiscount:()=>0};
vm.createContext(context);
vm.runInContext(trends+scoring+'\nthis.api={trends,trendMatchCount,trendWeight,collectionGoal};',context);
const {trends:seasons,trendMatchCount,trendWeight,collectionGoal}=context.api;
assert.equal(seasons.length,8);
assert.ok(seasons.every(trend=>typeof trend.material==='string'&&trend.material.length));
const trend=seasons[0];
const choices={target:'다른 고객',item:'다른 의류',style:'다른 스타일',material:'다른 소재'};
let previous=collectionGoal({},0,false,choices);
assert.equal(trendMatchCount(choices,trend),0);
for(const [index,key] of ['target','item','style','material'].entries()){
  choices[key]=trend[key];
  const matches=trendMatchCount(choices,trend);
  const goal=collectionGoal({},matches,false,choices);
  assert.equal(matches,index+1);
  assert.ok(trendWeight(matches)>trendWeight(matches-1));
  assert.ok(goal<previous,`${matches} matching categories must lower the goal`);
  previous=goal;
}
assert.equal(trendMatchCount(choices,trend),4);
assert.match(source,/const choices=\{target:null,item:null,style:null,material:null\}/);
assert.match(source,/disabled=!complete\|\|selectedCount===0/);
console.log('All four trend categories are selected manually and progressively improve the production goal.');
