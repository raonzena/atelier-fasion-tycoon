const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const source=fs.readFileSync(path.join(__dirname,'../dist/client/game.js'),'utf8');
const html=fs.readFileSync(path.join(__dirname,'../dist/client/index.html'),'utf8');
assert.match(html,/id="onboardingLayer" hidden/);
assert.match(source,/setTimeout\(\(\)=>\{resetStartScroll\(\);showOnboarding\(\);\},550\)/);
const start=source.indexOf('  const onboardingSteps=');
const end=source.indexOf('  toggle.onclick=',start);
assert(start>0&&end>start);

const positions={gameMenu:{left:18,top:70,width:204,height:350,bottom:420},officeInfoButton:{left:290,top:135,width:24,height:24,bottom:159},trend:{left:270,top:265,width:100,height:30,bottom:295},launchButton:{left:280,top:700,width:72,height:72,bottom:772}};
const nodes=new Map();
const get=id=>{
  if(!nodes.has(id))nodes.set(id,{style:{},hidden:true,textContent:'',offsetWidth:320,offsetHeight:175,
    getBoundingClientRect:()=>positions[id],addEventListener(){},focus(){}});
  return nodes.get(id);
};
const state={companyName:'새 회사',onboardingSeen:false};
const menus=[];let saved=0;
const context={state,$:get,setMenu:value=>menus.push(value),toggle:{focus(){}},save:()=>saved++,requestAnimationFrame:callback=>callback(),window:{innerWidth:390,innerHeight:844,addEventListener(){}}};
vm.createContext(context);
vm.runInContext(source.slice(start,end)+'\nthis.showOnboarding=showOnboarding;',context);
context.showOnboarding();
assert.equal(get('onboardingLayer').hidden,false);
assert.equal(get('onboardingTitle').textContent,'게임 메뉴');
assert.equal(menus.at(-1),true);
assert.match(get('onboardingDescription').textContent,/햄버거|☰/);
for(const title of ['오피스 확장','이번 시즌 트렌드','새 컬렉션 제작']){
  get('onboardingNext').onclick();
  assert.equal(get('onboardingTitle').textContent,title);
  assert.equal(menus.at(-1),false);
}
assert.match(get('onboardingDescription').textContent,/새 컬렉션/);
get('onboardingNext').onclick();
assert.equal(state.onboardingSeen,true);
assert.equal(get('onboardingLayer').hidden,true);
assert.equal(saved,1);
context.showOnboarding();
assert.equal(get('onboardingLayer').hidden,true);
console.log('First-play walkthrough highlights four controls and persists completion once.');
