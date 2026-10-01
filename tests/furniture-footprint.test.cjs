const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const source=fs.readFileSync(path.join(__dirname,'../dist/client/game.js'),'utf8');
const geometry=source.slice(source.indexOf('  const definition ='),source.indexOf('  const upgradePrice ='));
const bonus=source.slice(source.indexOf('  const furnitureBonuses ='),source.indexOf('  const collectionGoal ='));
assert(geometry.includes('const canPlace')&&bonus.includes('const rollStats'));
const items=[
  {id:'longRack',type:'furniture',spanX:3,bonus:{efficiency:2}},
  {id:'computerDesk',type:'furniture',spanX:2,bonus:{design:2,trend:1}},
  {id:'mannequin',type:'furniture',bonus:{sewing:2}},
  {id:'largePhoto',type:'furniture',spanX:2,bonus:{design:1,trend:2}},
  {id:'breakroom',type:'furniture',spanX:2,bonus:{efficiency:2}},
  {id:'yuna',type:'worker'}
];
const state={officeLevel:1,hired:['yuna'],ownedFurniture:[
  {id:'longRack-1',kind:'longRack'},
  {id:'computerDesk-2',kind:'computerDesk'},
  {id:'mannequin-3',kind:'mannequin'},
  {id:'largePhoto-4',kind:'largePhoto'},
  {id:'breakroom-5',kind:'breakroom'}
],placed:[{id:'longRack-1',x:0,y:0}]};
const context={state,items,furniture:items.filter(i=>i.type==='furniture'),workers:items.filter(i=>i.type==='worker'),bounds:[[0,2,0,2]],gridSize:()=>3,statLabels:[['design','디자인'],['sewing','봉제'],['trend','트렌드 감각'],['efficiency','생산 효율']],hiredWorkers:()=>items.filter(i=>i.type==='worker'),baseStats:()=>({design:5,sewing:5,trend:5,efficiency:5}),employeeStats:()=>({design:5,sewing:5,trend:5,efficiency:5})};
vm.createContext(context);
vm.runInContext(geometry+bonus+'\nthis.api={occupied,canPlace,furnitureBonuses,teamStats,rollStats};',context);
const {occupied,canPlace,furnitureBonuses,teamStats,rollStats}=context.api;
assert.equal(occupied(1,0),true);
assert.equal(occupied(2,0),true);
assert.equal(occupied(0,0),true);
assert.equal(canPlace('mannequin-3',2,0),false);
assert.equal(canPlace('computerDesk-2',2,1),false); // Both cells must fit.
assert.equal(canPlace('largePhoto-4',2,2),false);
assert.equal(canPlace('breakroom-5',2,2),false);
assert.equal(canPlace('longRack-1',1,1),false); // Three cells must fit.
assert.equal(canPlace('computerDesk-2',0,1),true);
assert.equal(canPlace('longRack-1',0,0),true); // A piece may stay in its own footprint.
assert.equal(furnitureBonuses().efficiency,2);
assert.equal(furnitureBonuses().design,0); // Unplaced furniture has no bonus.
state.placed.push({id:'computerDesk-2',x:0,y:1},{id:'mannequin-3',x:2,y:2});
assert.equal(teamStats({yuna:true}).design,7);
assert.equal(teamStats({yuna:true}).sewing,7);
assert.equal(teamStats({yuna:true}).trend,6);
assert.equal(teamStats({yuna:true}).efficiency,7);
assert.equal(teamStats({}).efficiency,0);
assert.equal(rollStats({yuna:true},()=>1).efficiency,7);
state.placed.push({id:'breakroom-5',x:0,y:2});
assert.equal(teamStats({yuna:true}).efficiency,9);
const seasonSource=source.match(/  const fashionWeekArtwork = .*;/)?.[0];
assert(seasonSource);
vm.runInContext(seasonSource+'\nthis.artwork=fashionWeekArtwork;',context);
for(const [season,file] of [['봄','fashion-week.webp'],['여름','fashion-week-summer.webp'],['가을','fashion-week-autumn.webp'],['겨울','fashion-week-winter.webp']]){
  assert.equal(context.artwork(season),file);
  assert(fs.existsSync(path.join(__dirname,'../dist/client/assets',file)));
}
console.log('Two and three cell furniture, placed bonuses, and seasonal runway artwork passed.');
