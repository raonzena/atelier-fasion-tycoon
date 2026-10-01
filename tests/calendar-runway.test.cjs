const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../dist/client/game.js'), 'utf8');
const trendStart = source.indexOf('  const trends = [');
const trendEnd = source.indexOf('  const baseCategories', trendStart);
const calendarStart = source.indexOf('  const currentMonth=');
const calendarEnd = source.indexOf('  const definition =', calendarStart);
const judgeStart = source.indexOf('  const runwayPrizes=');
const judgeEnd = source.indexOf('  const successChance =', judgeStart);
assert(trendStart > 0 && calendarStart > 0 && judgeStart > 0);

const context = {
  state: {monthsElapsed:0},
  weightedStats: stats => stats.design*.3 + stats.sewing*.3 + stats.trend*.2 + stats.efficiency*.2
};
vm.createContext(context);
vm.runInContext(source.slice(trendStart,trendEnd)+source.slice(calendarStart,calendarEnd)+source.slice(judgeStart,judgeEnd)+
  '\nthis.api={currentMonth,calendarYear,currentTrend,isFashionWeekMonth,officeRequiredReleases,judgeFashionWeek};',context);
const api=context.api;
for(const [elapsed,month,year,season,event] of [
  [0,3,1,'봄',true],[1,4,1,'봄',false],[2,5,1,'봄',false],
  [3,6,1,'여름',true],[4,7,1,'여름',false],[5,8,1,'여름',false],
  [6,9,1,'가을',true],[7,10,1,'가을',false],[8,11,1,'가을',false],
  [9,12,1,'겨울',true],[10,1,2,'겨울',false],[11,2,2,'겨울',false],
  [12,3,2,'봄',true]
]) {
  context.state.monthsElapsed=elapsed;
  assert.equal(api.currentMonth(),month);
  assert.equal(api.calendarYear(),year);
  assert.equal(api.currentTrend().season,season);
  assert.equal(api.isFashionWeekMonth(),event);
}
assert.equal(api.officeRequiredReleases(1),2);
assert.equal(api.officeRequiredReleases(11),22);

const score = value => ({design:value,sewing:value,trend:value,efficiency:value});
assert.equal(api.judgeFashionWeek(score(40),()=>0).prize,3000);
assert.equal(api.judgeFashionWeek(score(24),()=>0).prize,1000);
assert.equal(api.judgeFashionWeek(score(16),()=>0).prize,500);
const unranked=api.judgeFashionWeek(score(10),()=>0);
assert.equal(unranked.prize,0);
assert.equal(unranked.rank,0);
assert.equal(unranked.podium.length,3);
assert.equal(api.judgeFashionWeek({design:10,sewing:0,trend:0,efficiency:0},()=>0).score,3);
assert.equal(api.judgeFashionWeek({design:0,sewing:0,trend:10,efficiency:0},()=>0).score,2);
console.log('Monthly calendar, office requirements, and four-stat runway podium passed.');
