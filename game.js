(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const items = [
    {id:'designDesk',name:'디자인 책상',sprite:'prop-0',level:1,type:'furniture'},
    {id:'sewingDesk',name:'재봉 작업대',sprite:'prop-1',level:1,type:'furniture'},
    {id:'rack',name:'의류 행거',sprite:'prop-2',level:1,type:'furniture'},
    {id:'photo',name:'촬영 공간',sprite:'prop-3',level:3,type:'furniture'},
    {id:'moodboard',name:'트렌드 보드',sprite:'prop-4',level:5,type:'furniture'},
    {id:'lounge',name:'라운지',sprite:'prop-5',level:7,type:'furniture'},
    {id:'yuna',name:'유나',sprite:'cat-0',level:1,type:'worker',role:'디자인',skill:8,cost:24},
    {id:'minho',name:'민호',sprite:'cat-1',level:1,type:'worker',role:'생산',skill:7,cost:26},
    {id:'seoyeon',name:'서연',sprite:'cat-2',level:1,type:'worker',role:'마케팅',skill:7,cost:28},
    {id:'nabi',name:'나비',sprite:'cat-0',level:2,type:'worker',role:'디자인',skill:6,cost:30},
    {id:'duri',name:'두리',sprite:'cat-1',level:3,type:'worker',role:'생산',skill:8,cost:32},
    {id:'momo',name:'모모',sprite:'cat-2',level:4,type:'worker',role:'마케팅',skill:8,cost:34},
    {id:'bomi',name:'보미',sprite:'cat-0',level:5,type:'worker',role:'디자인',skill:9,cost:36},
    {id:'toto',name:'토토',sprite:'cat-1',level:6,type:'worker',role:'생산',skill:9,cost:38},
    {id:'hari',name:'하리',sprite:'cat-2',level:7,type:'worker',role:'마케팅',skill:9,cost:40},
    {id:'lulu',name:'루루',sprite:'cat-0',level:8,type:'worker',role:'디자인',skill:10,cost:42}
  ];
  const workers = items.filter(i => i.type === 'worker');
  const furniture = items.filter(i => i.type === 'furniture');
  const employeeCap = [1,2,3,4,5,6,7,8,9,10];
  const furnitureCap = [2,3,4,5,6,7,8,9,10,11];
  const furniturePrice = {designDesk:18,sewingDesk:22,rack:16,photo:30,moodboard:26,lounge:36};
  const offices = ['낡은 원룸 사무실','정돈된 작업실','첫 번째 스튜디오','창가 작업실','성장하는 아틀리에','넓어진 디자인실','브랜드 본사','도심 패션 스튜디오','프리미엄 오피스','글로벌 패션 하우스'];
  const gridSizes=[3,4,4,5,5,6,6,7,7,8];
  const bounds=gridSizes.map(n=>[0,n-1,0,n-1]);
  const gridSize=()=>gridSizes[state.officeLevel-1];
  const FLOOR_X=43, FLOOR_Y=31, FLOOR_TOP=32;
  const cellCenter = (x,y) => {
    const n=gridSize(),u=(x+.5)/n,v=(y+.5)/n;
    return {left:50+FLOOR_X*(u-v),top:FLOOR_TOP+FLOOR_Y*(u+v)};
  };
  const trends = [
    {season:'봄',item:'셔츠',style:'미니멀',target:'20대 직장인'},
    {season:'여름',item:'티셔츠',style:'스트리트',target:'10대 학생'},
    {season:'가을',item:'바지',style:'클래식',target:'20대 직장인'},
    {season:'겨울',item:'아우터',style:'아웃도어',target:'아웃도어 고객'},
    {season:'봄',item:'원피스',style:'러블리',target:'10대 학생'},
    {season:'여름',item:'티셔츠',style:'미니멀',target:'20대 직장인'},
    {season:'가을',item:'셔츠',style:'클래식',target:'20대 직장인'},
    {season:'겨울',item:'아우터',style:'스트리트',target:'10대 학생'}
  ];
  const baseCategories = ['티셔츠','셔츠','바지','원피스','아우터'];
  const styles = ['미니멀','스트리트','클래식','러블리','아웃도어'];
  const targets = ['20대 직장인','10대 학생','아웃도어 고객'];
  const initial = () => ({
    layoutVersion:3,companyName:'',officeLevel:1,companyLevel:1,assets:180,customers:0,releases:0,localSave:false,
    research:0,unlocks:[],staff:{},hired:[],ownedFurniture:[],history:[],placed:[]
  });
  let state = initial();
  try {
    const saved = JSON.parse(localStorage.getItem('atelier-device-save') || 'null');
    if(saved && saved.officeLevel >= 1 && saved.officeLevel <= 10 && Array.isArray(saved.placed)) {
      state = {...initial(),...saved,localSave:true};
      state.staff = saved.staff || {};
      state.unlocks = Array.isArray(saved.unlocks) ? saved.unlocks : [];
      state.history = Array.isArray(saved.history) ? saved.history : [];
      state.hired = Array.isArray(saved.hired) ? saved.hired : workers.filter(w => saved.placed.some(p => p.id===w.id)).map(w => w.id);
      state.ownedFurniture = Array.isArray(saved.ownedFurniture) ? saved.ownedFurniture : saved.placed.filter(p => furniture.some(f => f.id===p.id)).map(p => ({id:p.id,kind:p.id}));
      for(const id of state.hired) state.staff[id] = state.staff[id] || {level:1,xp:0};
      if(saved.layoutVersion!==3){
        const n=gridSizes[state.officeLevel-1],oldWidth=saved.layoutVersion===2?8:10,oldHeight=saved.layoutVersion===2?8:7;
        const used=new Set();
        state.placed=state.placed.map(p=>{
          let x=Math.min(n-1,Math.floor((p.x+.5)/oldWidth*n));
          let y=Math.min(n-1,Math.floor((p.y+.5)/oldHeight*n));
          if(used.has(x+','+y)){
            const free=Array.from({length:n*n},(_,i)=>({x:i%n,y:Math.floor(i/n)})).find(cell=>!used.has(cell.x+','+cell.y));
            if(free){x=free.x;y=free.y;}
          }
          used.add(x+','+y);return {...p,x,y};
        });
        state.layoutVersion=3;
      }
    }
  } catch {}
  let editMode = false, selected = null, toastTimer, layoutSnapshot=null;
  const definition = id => items.find(i => i.id === id) || furniture.find(i => state.ownedFurniture.some(o => o.id === id && o.kind === i.id));
  const itemName = id => {const d=definition(id);return d ? d.name : '알 수 없는 물건';};
  const hiredWorkers = () => workers.filter(w => state.hired.includes(w.id));
  const ownedItems = () => state.ownedFurniture.map(o => ({...definition(o.id),id:o.id})).concat(hiredWorkers());
  const placed = id => state.placed.find(i => i.id === id);
  const has = key => state.unlocks.includes(key);
  const isUnlocked = (x,y) => {
    const b = bounds[state.officeLevel-1];
    return x >= b[0] && x <= b[1] && y >= b[2] && y <= b[3];
  };
  const occupied = (x,y,except) => state.placed.some(p => p.id !== except && p.x === x && p.y === y);
  const upgradePrice = level => 95 + (level-1)*45;
  const save = () => { if(state.localSave) localStorage.setItem('atelier-device-save',JSON.stringify(state)); };
  const toast = message => {
    $('toast').textContent=message; $('toast').classList.add('show');
    clearTimeout(toastTimer); toastTimer=setTimeout(() => $('toast').classList.remove('show'),2800);
  };
  const setHint = message => { $('placementHint').textContent=message; };
  const positionFromPointer = event => {
    const r=$('floor').getBoundingClientRect();
    const dx=(event.clientX-r.left)/r.width-.5;
    const dy=(event.clientY-r.top)/r.height-FLOOR_TOP/100;
    const difference=dx/(FLOOR_X/100),sum=dy/(FLOOR_Y/100);
    return {x:Math.floor((sum+difference)*gridSize()/2),y:Math.floor((sum-difference)*gridSize()/2)};
  };
  const move = (id,x,y) => {
    if(!isUnlocked(x,y)){toast('잠긴 공간이에요. 오피스를 확장하면 열립니다.');return false;}
    if(occupied(x,y,id)){toast('이미 다른 가구나 직원이 있어요.');return false;}
    const target=placed(id);
    if(target){target.x=x;target.y=y;} else state.placed.push({id,x,y});
    selected=id;render();if(!editMode)save();
    setHint(itemName(id)+' 배치 완료 · 다시 선택해 옮길 수 있어요');
    return true;
  };
  const renderFloor = () => {
    const floor=$('floor');floor.replaceChildren();
    for(let y=0;y<gridSize();y++) for(let x=0;x<gridSize();x++){
      const tile=document.createElement('button');tile.type='button';
      tile.className='tile '+(isUnlocked(x,y)?'available':'locked');
      tile.setAttribute('role','gridcell');
      tile.setAttribute('aria-label',(x+1)+'열 '+(y+1)+'행 '+(isUnlocked(x,y)?'배치 가능':'잠김'));
      const center=cellCenter(x,y);
      tile.style.left=(center.left-FLOOR_X/gridSize())+'%';
      tile.style.top=(center.top-FLOOR_Y/gridSize())+'%';
      tile.style.width=(FLOOR_X*2/gridSize())+'%';
      tile.style.height=(FLOOR_Y*2/gridSize())+'%';
      tile.addEventListener('click',()=>{
        if(!editMode){setHint('왼쪽 메뉴의 배치 수정을 눌러 사무실을 꾸며보세요.');return;}
        if(!selected){toast('먼저 아래에서 가구나 직원을 선택하세요.');return;}
        move(selected,x,y);
      });
      floor.append(tile);
    }
    state.placed.forEach(p=>{
      const d=definition(p.id);if(!d)return;
      const button=document.createElement('button');button.type='button';
      button.className='piece '+d.type+(selected===p.id?' selected':'');
      button.setAttribute('aria-label',d.name+' · '+(p.x+1)+'열 '+(p.y+1)+'행. '+(editMode?'끌거나 선택 후 빈 칸을 터치해 이동':'선택해 정보 보기'));
      const center=cellCenter(p.x,p.y);
      button.style.left=center.left+'%';
      button.style.top=center.top+'%';
      button.style.zIndex=5+p.x+p.y;
      const img=document.createElement('img');img.src='./assets/'+d.sprite+'.webp';img.alt='';img.draggable=false;
      const label=document.createElement('span');label.className='piece-label';label.textContent=d.name;
      button.append(img,label);
      let dragStart=null, dragged=false;
      button.addEventListener('pointerdown',event=>{
        if(!editMode)return;
        dragStart={x:event.clientX,y:event.clientY};
        button.setPointerCapture(event.pointerId);
      });
      button.addEventListener('pointermove',event=>{
        if(!dragStart)return;
        const dx=event.clientX-dragStart.x,dy=event.clientY-dragStart.y;
        if(Math.hypot(dx,dy)>5)button.style.transform='translate(-50%,-50%) translate('+dx+'px,'+dy+'px)';
      });
      button.addEventListener('pointercancel',()=>{dragStart=null;button.style.transform='';});
      button.addEventListener('pointerup',event=>{
        if(!dragStart)return;
        const distance=Math.hypot(event.clientX-dragStart.x,event.clientY-dragStart.y);
        dragStart=null;button.style.transform='';
        if(distance>9){
          const pos=positionFromPointer(event);
          dragged=true;move(p.id,pos.x,pos.y);
          setTimeout(()=>{dragged=false;},100);
        }
      });
      button.addEventListener('click',()=>{
        if(dragged)return;
        selected=p.id;
        if(editMode){renderFloor();renderInventory();setHint(d.name+' 선택됨 · 원하는 빈 칸을 터치하거나 끌어서 옮기세요');}
        else if(d.type==='worker')showWorkerProfile(d.id);else setHint(d.name+' · 배치 수정을 눌러 옮길 수 있어요.');
      });
      floor.append(button);
    });
  };
  const renderInventory = () => {
    $('inventoryItems').replaceChildren();
    ownedItems().forEach(d=>{
      const button=document.createElement('button');button.type='button';
      button.className='inventory-item'+(selected===d.id?' selected':'');
      button.setAttribute('aria-label',d.name+' '+(placed(d.id)?'배치됨, 이동 선택':'배치하기'));
      const img=document.createElement('img');img.src='./assets/'+d.sprite+'.webp';img.alt='';
      const name=document.createElement('span');name.textContent=d.name;button.append(img,name);
      if(placed(d.id)){const badge=document.createElement('small');badge.textContent='배치됨';button.append(badge);}
      button.addEventListener('click',()=>{
        selected=d.id;renderInventory();renderFloor();
        setHint(placed(d.id)?d.name+'을 끌거나 빈 칸을 터치해 이동하세요':d.name+'을 놓을 빈 칸을 터치하세요');
      });
      $('inventoryItems').append(button);
    });
    if(!ownedItems().length)$('inventoryItems').textContent='직원을 고용하거나 가구를 구매하면 이곳에서 배치할 수 있어요.';
  };
  const render = () => {
    $('companyLevel').textContent=state.companyLevel;
    $('assetValue').textContent='₩'+Math.round(state.assets).toLocaleString()+'M';
    $('customerValue').textContent=state.customers.toLocaleString()+'명';
    $('officeTitle').textContent=offices[state.officeLevel-1];
    $('officeLevel').textContent='오피스 LV. '+state.officeLevel+' / 10';
    $('year').textContent=1+Math.floor(state.releases/4);
    const trend=trends[state.releases%trends.length];
    $('season').textContent=trend.season;
    $('trend').textContent='트렌드 · '+trend.style+' '+trend.item;
    $('roomWorld').style.width=(70+(state.officeLevel-1)*30/9)+'%';
    $('roomBackdrop').style.backgroundImage="url('./assets/"+(state.officeLevel<4?'office-pastel':state.officeLevel<8?'office-mid':'office-high')+".webp')";
    $('roomBackdrop').style.filter='saturate('+(1+state.officeLevel*.014)+') brightness('+(1+state.officeLevel*.006)+')';
    $('companyNameBrand').textContent=state.companyName||'ATELIER';
    $('capacityText').textContent='직원 '+state.hired.length+'/'+employeeCap[state.officeLevel-1]+' · 가구 '+state.ownedFurniture.length+'/'+furnitureCap[state.officeLevel-1];
    $('progressText').textContent=state.releases+'회 컬렉션 출시 · 연구 '+state.research+'P';
    $('upgradeCost').textContent=state.officeLevel===10?'최고 레벨':'₩'+upgradePrice(state.officeLevel)+'M · 출시 '+state.officeLevel+'회 필요';
    $('upgradeButton').disabled=state.officeLevel===10;
    $('scene').classList.toggle('editing',editMode);
    $('inventory').hidden=!editMode;
    $('editButton').classList.toggle('active',editMode);
    $('editButton').textContent=editMode?'배치 취소':'배치 수정';
    $('launchButton').classList.toggle('layout-mode',editMode);
    $('launchButton').setAttribute('aria-label',editMode?'배치 저장':'새 컬렉션 만들기');
    $('launchButton').querySelector('span').textContent=editMode?'✓':'🐾';
    $('launchButton').querySelector('small').textContent=editMode?'배치 저장':'새 컬렉션';
    $('guestBanner').innerHTML=state.localSave?'이 기기 저장 사용 중 · 다른 기기와 동기화되지 않습니다. <button type="button" id="saveInfo">저장 방식 보기</button>':'게스트 플레이 중 · 화면을 나가면 진행 내용이 사라집니다. <button type="button" id="saveInfo">저장 방식 보기</button>';
    $('saveInfo').addEventListener('click',showSaveInfo);
    $('saveButton').textContent=state.localSave?'이 기기에 저장 중':'저장 안내';
    renderFloor();if(editMode)renderInventory();
  };
  const closeModal = () => {$('modalLayer').hidden=true;$('modalContent').replaceChildren();};
  const showModal = html => {$('modalContent').innerHTML=html;$('modalLayer').hidden=false;$('modalClose').focus();};
  const showSaveInfo = () => {
    showModal('<span class="modal-kicker">PLAY DATA</span><h2 id="modalTitle">진행 내용 저장</h2><p>게스트 플레이는 새로고침하거나 앱을 닫으면 초기화됩니다. 아래 버튼으로 이 기기에만 저장할 수 있어요. 계정 로그인과 기기 간 동기화는 아직 구현되지 않았습니다.</p><button class="modal-primary" id="enableSave" type="button">'+(state.localSave?'지금 이 기기에 저장':'이 기기에 저장 시작')+'</button>');
    $('enableSave').onclick=()=>{state.localSave=true;save();render();closeModal();toast('이 기기의 브라우저에 진행 내용이 저장됩니다.');};
  };
  const availableItems = () => baseCategories.concat(has('hoodie')?['후드티']:[],has('bag')?['가방']:[]);
  const availableMaterials = () => ['면'].concat(has('linen')?['리넨']:[],has('recycled')?['재생 원단']:[]);
  const successChance = (choices,assigned) => {
    const trend=trends[state.releases%trends.length];
    const matches=Number(choices.target===trend.target)+Number(choices.item===trend.item)+Number(choices.style===trend.style);
    const skill=hiredWorkers().filter(w=>assigned[w.id]).reduce((sum,w)=>sum+state.staff[w.id].level*2+Math.round(w.skill/2),0);
    const material=choices.material==='리넨'&&trend.season==='여름'||choices.material==='재생 원단'&&choices.style==='아웃도어'?6:0;
    return [Math.max(10,Math.min(95,32+matches*10+skill+material)),matches];
  };
  const showLaunch = () => {
    if(!state.hired.length){toast('먼저 직원을 고용하세요.');return;}
    if(state.assets<38){toast('제작비 ₩38M이 필요해요.');return;}
    const trend=trends[state.releases%trends.length];
    const choices={target:trend.target,item:baseCategories.includes(trend.item)?trend.item:'티셔츠',style:trend.style,material:'면'};
    const assigned=Object.fromEntries(hiredWorkers().map(w=>[w.id,true]));
    showModal('<span class="modal-kicker">NEW COLLECTION · '+trend.season+'</span><h2 id="modalTitle">다음 컬렉션 기획</h2><p>제작비 ₩38M · 이번 시즌의 시장 흐름과 팀 능력치를 고려하세요.</p><div id="choices"></div><div class="choice-group"><strong>제작에 배정할 직원</strong><div id="staffChoices" class="staff-choices"></div></div><div id="chancePreview" class="chance-preview"></div><button class="modal-primary" id="confirmLaunch" type="button">제작하고 출시하기</button>');
    const update=()=>{
      const result=successChance(choices,assigned);
      $('chancePreview').textContent='예상 성공률 '+result[0]+'% · 트렌드 일치 '+result[1]+'/3 · 참여 직원 '+Object.values(assigned).filter(Boolean).length+'명';
    };
    [['target','고객',targets],['item','의류',availableItems()],['style','스타일',styles],['material','소재',availableMaterials()]].forEach(groupData=>{
      const [key,label,values]=groupData;
      const group=document.createElement('div');group.className='choice-group';
      const heading=document.createElement('strong');heading.textContent=label;
      const row=document.createElement('div');row.className='choice-row';group.append(heading,row);
      values.forEach(value=>{
        const button=document.createElement('button');button.type='button';button.textContent=value;
        button.className=value===choices[key]?'selected':'';
        button.onclick=()=>{choices[key]=value;row.querySelectorAll('button').forEach(b=>b.classList.toggle('selected',b===button));update();};
        row.append(button);
      });$('choices').append(group);
    });
    hiredWorkers().forEach(w=>{
      const label=document.createElement('label');label.className='staff-choice';
      const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.checked=true;
      checkbox.onchange=()=>{assigned[w.id]=checkbox.checked;update();};
      const img=document.createElement('img');img.src='./assets/'+w.sprite+'.webp';img.alt='';
      const text=document.createElement('span');text.textContent=w.name+' · '+w.role+' '+w.skill+' · LV.'+state.staff[w.id].level;
      label.append(checkbox,img,text);$('staffChoices').append(label);
    });
    update();$('confirmLaunch').onclick=()=>launch(choices,assigned);
  };
  const launch = (choices,assigned) => {
    if(!Object.values(assigned).some(Boolean)){toast('직원을 한 명 이상 배정해 주세요.');return;}
    const trend=trends[state.releases%trends.length];
    const [chance,matches]=successChance(choices,assigned);
    const success=Math.random()*100<chance;
    const score=Math.max(20,Math.min(100,chance+(success?Math.floor(Math.random()*15):-(15+Math.floor(Math.random()*18)))));
    const revenue=Math.round(score*(success?1.8:1.12)+state.companyLevel*4);
    const gained=Math.round((score-48)*3.7);
    const points=success?3:2;
    state.assets+=revenue-38;
    state.customers=Math.max(0,state.customers+gained);
    state.research+=points;
    for(const w of hiredWorkers()) if(assigned[w.id]){
      const member=state.staff[w.id];member.xp++;
      if(member.xp>=member.level*2 && member.level<10){member.xp=0;member.level++;}
    }
    state.releases++;
    state.companyLevel=Math.min(10,1+Math.floor(state.releases/2));
    const discoveries=[];
    if(state.releases===2&&!has('hoodie')){state.unlocks.push('hoodie');discoveries.push('후드티');}
    if(state.releases===5&&!has('bag')){state.unlocks.push('bag');discoveries.push('가방');}
    const reason=matches>=2?'시즌 취향과 고객 수요를 잘 맞췄습니다.':matches===1?'일부 시장 수요와 맞았지만 조합을 더 다듬을 수 있습니다.':'이번 시즌의 인기 상품·스타일·고객과 거리가 있었습니다.';
    const review=score>=75?'“다음 컬렉션도 기대돼요!”':score>=55?'“디자인은 좋지만 조금 더 고민해 볼게요.”':'“이번 시즌에는 다른 스타일을 찾고 있었어요.”';
    state.history.unshift({name:choices.style+' '+choices.item,season:trend.season,score,revenue,review});
    state.history=state.history.slice(0,8);save();render();
    $('scene').classList.remove('season-turn');void $('scene').offsetWidth;$('scene').classList.add('season-turn');
    showModal('<span class="modal-kicker">COLLECTION RELEASED · '+trend.season+'</span><h2 id="modalTitle">'+choices.style+' '+choices.item+' 출시</h2><div class="report-score">'+score+'</div><p>'+reason+' '+(success?'제작과 판매가 순조로웠습니다.':'제작 결과가 기대치에 미치지 못했습니다.')+'</p><blockquote class="customer-review">'+review+'</blockquote><div class="report-line">성공 확률 / 결과 <strong>'+chance+'% / '+(success?'성공':'아쉬움')+'</strong></div><div class="report-line">매출 / 제작비 <strong>₩'+revenue+'M / ₩38M</strong></div><div class="report-line">고객 변화 <strong>'+(gained>=0?'+':'')+gained+'명</strong></div><div class="report-line">연구 포인트 <strong>+'+points+'P</strong></div>'+(discoveries.length?'<p class="discovery">새 의류 발견: '+discoveries.join(', ')+'</p>':'')+'<p>다음 시즌은 '+trends[state.releases%trends.length].season+'입니다.</p><button class="modal-primary" id="reportDone" type="button">사무실로 돌아가기</button>');
    $('reportDone').onclick=closeModal;
  };
  const showResearch = () => {
    const projects=[
      {id:'linen',name:'리넨 소재',cost:4,detail:'여름 컬렉션 성공률 +6%'},
      {id:'recycled',name:'재생 원단',cost:6,detail:'아웃도어 스타일 성공률 +6%'}
    ];
    showModal('<span class="modal-kicker">TEAM & DISCOVERY</span><h2 id="modalTitle">팀과 연구</h2><p>컬렉션 제작에 참여한 직원은 경험을 얻고 레벨이 오릅니다. 현재 연구 포인트 '+state.research+'P.</p><div id="teamRows"></div><h3>소재 연구</h3><div id="researchRows"></div><h3>최근 컬렉션</h3><div id="historyRows"></div>');
    hiredWorkers().forEach(w=>{
      const row=document.createElement('div');row.className='report-line';
      row.textContent=w.name;
      const strong=document.createElement('strong');
      const s=state.staff[w.id];strong.textContent='LV.'+s.level+' · 경험 '+s.xp+'/'+(s.level*2);
      row.append(strong);$('teamRows').append(row);
    });
    projects.forEach(project=>{
      const row=document.createElement('div');row.className='research-row';
      const body=document.createElement('div');body.innerHTML='<strong>'+project.name+'</strong><small>'+project.detail+'</small>';
      const button=document.createElement('button');button.type='button';
      button.textContent=has(project.id)?'연구 완료':project.cost+'P 연구';
      button.disabled=has(project.id)||state.research<project.cost;
      button.onclick=()=>{state.research-=project.cost;state.unlocks.push(project.id);save();showResearch();toast(project.name+' 해금!');};
      row.append(body,button);$('researchRows').append(row);
    });
    if(!state.history.length)$('historyRows').textContent='아직 출시한 컬렉션이 없습니다.';
    state.history.forEach(h=>{
      const row=document.createElement('div');row.className='report-line';
      row.textContent=h.season+' · '+h.name;
      const strong=document.createElement('strong');strong.textContent=h.score+'점 · ₩'+h.revenue+'M';
      row.append(strong);$('historyRows').append(row);
    });
  };
  const firstFreeCell = () => {
    const b=bounds[state.officeLevel-1];
    for(let y=b[2];y<=b[3];y++)for(let x=b[0];x<=b[1];x++)if(!occupied(x,y))return {x,y};
    return null;
  };
  const showWorkerProfile = id => {
    const w=definition(id),member=state.staff[id];
    if(!w||!member)return;
    showModal('<span class="modal-kicker">STAFF PROFILE</span><h2 id="modalTitle">'+w.name+'</h2><div class="profile-portrait"><img src="./assets/'+w.sprite+'.webp" alt=""></div><div class="report-line">직군 <strong>'+w.role+'</strong></div><div class="report-line">레벨 <strong>LV.'+member.level+' / 10</strong></div><div class="report-line">기본 능력치 <strong>'+w.skill+'</strong></div><div class="report-line">경험치 <strong>'+member.xp+' / '+(member.level*2)+'</strong></div><p>컬렉션 제작에 배정하면 경험치를 얻고 성공률에 기여합니다.</p>');
  };
  const showHire = () => {
    showModal('<span class="modal-kicker">STAFF RECRUITMENT</span><h2 id="modalTitle">직원 고용</h2><p>오피스 LV.'+state.officeLevel+' · 고용 '+state.hired.length+'/'+employeeCap[state.officeLevel-1]+'명. 채용한 고양이는 사무실에 배치되고 제작에 참여할 수 있어요.</p><div id="shopRows"></div>');
    workers.forEach(w=>{
      const row=document.createElement('div');row.className='shop-row';
      const img=document.createElement('img');img.src='./assets/'+w.sprite+'.webp';img.alt='';
      const body=document.createElement('div');body.className='shop-description';
      const heading=document.createElement('strong');heading.textContent=w.name+' · '+w.role;
      const detail=document.createElement('small');detail.textContent='능력 '+w.skill+' · 오피스 LV.'+w.level+'부터';
      body.append(heading,detail);
      const button=document.createElement('button');button.type='button';
      const owned=state.hired.includes(w.id),locked=state.officeLevel<w.level,full=state.hired.length>=employeeCap[state.officeLevel-1];
      button.textContent=owned?'고용됨':locked?'잠김':full?'정원 마감':'₩'+w.cost+'M 고용';
      button.disabled=owned||locked||full||state.assets-w.cost<38;
      button.onclick=()=>{
        state.assets-=w.cost;state.hired.push(w.id);state.staff[w.id]={level:1,xp:0};
        const cell=firstFreeCell();if(cell)state.placed.push({id:w.id,...cell});
        save();render();showHire();toast(w.name+' 고용 완료!');
      };
      row.append(img,body,button);$('shopRows').append(row);
    });
  };
  const showFurniture = () => {
    showModal('<span class="modal-kicker">FURNITURE SHOP</span><h2 id="modalTitle">가구 구매</h2><p>오피스 LV.'+state.officeLevel+' · 보유 가구 '+state.ownedFurniture.length+'/'+furnitureCap[state.officeLevel-1]+'개. 구매한 가구는 배치 수정에서 옮길 수 있어요.</p><div id="shopRows"></div>');
    furniture.forEach(f=>{
      const row=document.createElement('div');row.className='shop-row';
      const img=document.createElement('img');img.src='./assets/'+f.sprite+'.webp';img.alt='';
      const body=document.createElement('div');body.className='shop-description';
      const heading=document.createElement('strong');heading.textContent=f.name;
      const detail=document.createElement('small');detail.textContent='오피스 LV.'+f.level+'부터 · 배치 보너스 없음';
      body.append(heading,detail);
      const button=document.createElement('button');button.type='button';
      const locked=state.officeLevel<f.level,full=state.ownedFurniture.length>=furnitureCap[state.officeLevel-1];
      const price=furniturePrice[f.id];
      button.textContent=locked?'잠김':full?'배치 한도':'₩'+price+'M 구매';
      button.disabled=locked||full||state.assets-price<38;
      button.onclick=()=>{
        const id=f.id+'-'+(state.ownedFurniture.length+1);
        state.assets-=price;state.ownedFurniture.push({id,kind:f.id});
        const cell=firstFreeCell();if(cell)state.placed.push({id,...cell});
        save();render();showFurniture();toast(f.name+' 구매 완료!');
      };
      row.append(img,body,button);$('shopRows').append(row);
    });
  };
  const menu = $('gameMenu'),toggle = $('menuToggle');
  const setMenu = open => {menu.hidden=!open;toggle.setAttribute('aria-expanded',String(open));};
  toggle.onclick=()=>setMenu(true);
  toggle.addEventListener('mouseenter',()=>setMenu(true));
  menu.addEventListener('mouseleave',()=>setMenu(false));
  document.addEventListener('click',event=>{if(!menu.contains(event.target)&&event.target!==toggle)setMenu(false);});
  $('menuHire').onclick=()=>{setMenu(false);showHire();};
  $('menuFurniture').onclick=()=>{setMenu(false);showFurniture();};
  $('menuSave').onclick=()=>{setMenu(false);showSaveInfo();};
  $('startForm').addEventListener('submit',event=>{
    event.preventDefault();
    const name=$('companyNameInput').value.trim();
    if(!name)return;
    state.companyName=name.slice(0,20);$('startLayer').hidden=true;save();render();
    toast(state.companyName+' 설립 완료! 직원 고용부터 시작해 보세요.');
  });
  $('startLayer').hidden=Boolean(state.companyName);
  const showUpgrade = () => {
    if(state.officeLevel>=10){toast('오피스 최고 레벨에 도달했어요.');return;}
    const price=upgradePrice(state.officeLevel);
    if(state.releases<state.officeLevel){toast('컬렉션 '+state.officeLevel+'회 출시 후 확장할 수 있어요.');return;}
    if(state.assets-price<38){toast('확장 후 제작비 ₩38M을 남겨두어야 해요.');return;}
    const next=state.officeLevel+1;
    showModal('<span class="modal-kicker">OFFICE UPGRADE</span><h2 id="modalTitle">'+offices[next-1]+'로 확장</h2><p>비용 ₩'+price+'M을 투자하면 오피스 레벨 '+next+'가 됩니다. 배치 가능한 칸이 늘어나고 새로운 가구가 열릴 수 있어요. 기존 배치는 그대로 유지됩니다.</p><button class="modal-primary" id="confirmUpgrade" type="button">₩'+price+'M 투자하기</button>');
    $('confirmUpgrade').onclick=()=>{
      const oldN=gridSize();state.assets-=price;state.officeLevel=next;
      const newN=gridSize(),used=new Set();
      state.placed=state.placed.map(p=>{
        let x=Math.min(newN-1,Math.floor((p.x+.5)*newN/oldN));
        let y=Math.min(newN-1,Math.floor((p.y+.5)*newN/oldN));
        if(used.has(x+','+y)){
          const free=Array.from({length:newN*newN},(_,i)=>({x:i%newN,y:Math.floor(i/newN)})).find(c=>!used.has(c.x+','+c.y));
          if(free){x=free.x;y=free.y;}
        }
        used.add(x+','+y);return {...p,x,y};
      });
      save();render();closeModal();toast(offices[next-1]+' 확장 완료!');
    };
  };
  const cancelLayout=()=>{
    if(!editMode)return;
    state.placed=layoutSnapshot.map(p=>({...p}));
    editMode=false;layoutSnapshot=null;selected=null;render();
    setHint('배치 변경을 취소했어요.');toast('저장 전 배치로 돌아왔어요.');
  };
  const saveLayout=()=>{
    if(!editMode)return;
    editMode=false;layoutSnapshot=null;selected=null;save();render();
    setHint('배치를 저장했어요.');toast(state.localSave?'배치를 이 기기에 저장했어요.':'이번 플레이의 배치를 적용했어요.');
  };
  $('editButton').onclick=()=>{
    setMenu(false);
    if(editMode){cancelLayout();return;}
    layoutSnapshot=state.placed.map(p=>({...p}));editMode=true;selected=null;render();
    setHint('가구나 직원을 끌어 옮긴 뒤 오른쪽 아래에서 배치를 저장하세요.');
  };
  $('doneButton').onclick=cancelLayout;
  $('upgradeButton').onclick=showUpgrade;
  $('researchButton').onclick=()=>{setMenu(false);showResearch();};
  $('launchButton').onclick=()=>editMode?saveLayout():showLaunch();
  $('saveButton').onclick=showSaveInfo;
  $('modalClose').onclick=closeModal;
  $('modalLayer').addEventListener('click',event=>{if(event.target===$('modalLayer'))closeModal();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!$('modalLayer').hidden)closeModal();});
  render();
})();
