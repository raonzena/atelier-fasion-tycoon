const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const source=fs.readFileSync(path.join(__dirname,'../dist/client/game.js'),'utf8');
const names=source.slice(source.indexOf('  const workerName ='),source.indexOf('  const hiringCost ='));
const company={staff:{yuna:{level:3,xp:1}},hired:['yuna']};
const context={state:company};vm.createContext(context);
vm.runInContext(names+'\nthis.names={workerName,renameWorker,escapeHtml};',context);
const worker={id:'yuna',name:'유나'};
assert.equal(context.names.workerName(worker),'유나');
assert.equal(context.names.renameWorker('yuna','  새 이름  '),true);
assert.equal(context.names.workerName(worker),'새 이름');
assert.equal(company.staff.yuna.level,3);
assert.equal(context.names.renameWorker('yuna','  '),false);
assert.equal(context.names.renameWorker('yuna','123456789012345678901'),false);
assert.equal(context.names.renameWorker('minho','다른 이름'),false);
assert.equal(context.names.escapeHtml('<script>'), '&lt;script&gt;');

const reward=source.slice(source.indexOf('  const sewingCompletionReward='),source.indexOf('  const showSewingGame='));
const nodes=new Map();let saves=0,renders=0,modal='';
const game={state:{assets:180},SEWING_MAX_LEVEL:10,sewingTarget:level=>60+(level-1)*3,
  roundMoney:value=>value,save:()=>saves++,render:()=>renders++,showModal:html=>{modal=html;},
  $:id=>{if(!nodes.has(id))nodes.set(id,{});return nodes.get(id);},closeModal:()=>{}};
vm.createContext(game);
vm.runInContext(reward+'\nthis.reward={sewingCompletionReward,showSewingResult};',game);
assert.equal(game.reward.sewingCompletionReward(()=>0),10);
assert.equal(game.reward.sewingCompletionReward(()=>.999999),20);
game.reward.showSewingResult(10,86);
assert.equal(game.state.assets,180);
assert.equal(saves,0);
game.reward.showSewingResult(9,100);
assert.equal(game.state.assets,180);
game.reward.showSewingResult(10,87);
assert.ok(game.state.assets>=190&&game.state.assets<=200);
assert.equal(saves,1);
assert.equal(renders,1);
assert.match(modal,/완주 보상/);
console.log('Names persist on each company staff record; the final sewing level grants one 10–20M reward.');
