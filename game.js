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
    {id:'yuna',name:'유나 · 디자인',sprite:'cat-0',level:1,type:'worker',role:'디자인'},
    {id:'minho',name:'민호 · 생산',sprite:'cat-1',level:1,type:'worker',role:'생산'},
    {id:'seoyeon',name:'서연 · 마케팅',sprite:'cat-2',level:1,type:'worker',role:'마케팅'}
  ];
  const workers = items.filter(i => i.type === 'worker');
  const offices = ['낡은 원룸 사무실','정돈된 작업실','첫 번째 스튜디오','창가 작업실','성장하는 아틀리에','넓어진 디자인실','브랜드 본사','도심 패션 스튜디오','프리미엄 오피스','글로벌 패션 하우스'];
  const bounds = [[2,6,4,6],[2,7,4,6],[2,7,3,6],[1,7,3,6],[1,7,2,6],[1,8,2,6],[1,8,1,6],[0,8,1,6],[0,9,1,6],[0,9,0,6]];
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
    officeLevel:1,companyLevel:1,assets:120,customers:320,releases:0,localSave:false,
    research:0,unlocks:[],staff:{yuna:{level:1,xp:0},minho:{level:1,xp:0},seoyeon:{level:1,xp:0}},history:[],
    placed:[{id:'designDesk',x:3,y:4},{id:'sewingDesk',x:5,y:4},{id:'rack',x:6,y:5},
      {id:'yuna',x:3,y:5},{id:'minho',x:5,y:5},{id:'seoyeon',x:4,y:6}]
  });
  let state = initial();
  try {
    const saved = JSON.parse(localStorage.getItem('atelier-device-save') || 'null');
    if(saved && saved.officeLevel >= 1 && saved.officeLevel <= 10 && Array.isArray(saved.placed)) {
      state = {...initial(),...saved,localSave:true};
      state.staff = {...initial().staff,...saved.staff};
      state.unlocks = Array.isArray(saved.unlocks) ? saved.unlocks : [];
      state.history = Array.isArray(saved.history) ? saved.history : [];
    }
  } catch {}
  let editMode = false, selected = null, toastTimer;
  const definition = id => items.find(i => i.id === id);
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
    return {x:Math.floor((event.clientX-r.left)/r.width*10),y:Math.floor((event.clientY-r.top)/r.height*7)};
  };
  const move = (id,x,y) => {
    if(!isUnlocked(x,y)){toast('잠긴 공간이에요. 오피스를 확장하면 열립니다.');return false;}
    if(occupied(x,y,id)){toast('이미 다른 가구나 직원이 있어요.');return false;}
    const target=placed(id);
    if(target){target.x=x;target.y=y;} else state.placed.push({id,x,y});
    selected=id;render();save();
    setHint(definition(id).name+' 배치 완료 · 다시 선택해 옮길 수 있어요');
    return true;
  };
  const renderFloor = () => {
    const floor=$('floor');floor.replaceChildren();
    for(let y=0;y<7;y++) for(let x=0;x<10;x++){
      const tile=document.createElement('button');tile.type='button';
      tile.className='tile '+(isUnlocked(x,y)?'available':'locked');
      tile.setAttribute('role','gridcell');
      tile.setAttribute('aria-label',(x+1)+'열 '+(y+1)+'행 '+(isUnlocked(x,y)?'배치 가능':'잠김'));
      tile.addEventListener('click',()=>{
        if(!editMode){setHint('배치 수정 버튼을 누르면 사무실을 꾸밀 수 있어요.');return;}
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
      button.style.left=((p.x+.5)*10)+'%';
      button.style.top=(((p.y+.5)/7)*100)+'%';
      const img=document.createElement('img');img.src='./assets/'+d.sprite+'.webp';img.alt='';img.draggable=false;
      const label=document.createElement('span');label.className='piece-label';label.textContent=d.name;
      button.append(img,label);
      let dragStart=null, dragged=false;
      button.addEventListener('pointerdown',event=>{
        if(!editMode)return;
        dragStart={x:event.clientX,y:event.clientY};
        button.setPointerCapture(event.pointerId);
      });
      button.addEventListener('pointerup',event=>{
        if(!dragStart)return;
        const distance=Math.hypot(event.clientX-dragStart.x,event.clientY-dragStart.y);
        dragStart=null;
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
        else setHint(d.type==='worker'?d.name+' · 컬렉션 제작 창에서 작업에 배정할 수 있어요.':d.name+' · 배치 수정을 눌러 옮길 수 있어요.');
      });
      floor.append(button);
    });
  };
  const renderInventory = () => {
    $('inventoryItems').replaceChildren();
    items.forEach(d=>{
      const locked=state.officeLevel<d.level;
      const button=document.createElement('button');button.type='button';
      button.className='inventory-item'+(locked?' locked':'')+(selected===d.id?' selected':'');
      button.setAttribute('aria-label',locked?d.name+' 오피스 레벨 '+d.level+'에 해금':d.name+' '+(placed(d.id)?'배치됨, 이동 선택':'배치하기'));
      button.disabled=locked;
      const img=document.createElement('img');img.src='./assets/'+d.sprite+'.webp';img.alt='';
      const name=document.createElement('span');name.textContent=d.name;button.append(img,name);
      if(locked||placed(d.id)){const badge=document.createElement('small');badge.textContent=locked?'LV.'+d.level:'배치됨';button.append(badge);}
      button.addEventListener('click',()=>{
        selected=d.id;renderInventory();renderFloor();
        setHint(placed(d.id)?d.name+'을 끌거나 빈 칸을 터치해 이동하세요':d.name+'을 놓을 빈 칸을 터치하세요');
      });
      $('inventoryItems').append(button);
    });
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
    $('roomBackdrop').style.backgroundImage="url('./assets/"+(state.officeLevel<4?'office-pastel':state.officeLevel<8?'office-mid':'office-high')+".webp')";
    $('roomBackdrop').style.filter='saturate('+(1+state.officeLevel*.014)+') brightness('+(1+state.officeLevel*.006)+')';
    $('progressTitle').textContent=state.officeLevel===10?'최고의 패션 하우스':offices[state.officeLevel-1]+'에서 다음 단계로';
    $('progressText').textContent=state.officeLevel===10?'오피스는 최고 레벨입니다. 컬렉션을 계속 성장시켜 보세요.':'새 배치 공간이 열립니다 · '+state.releases+'회 컬렉션 출시';
    $('upgradeLabel').textContent=state.officeLevel===10?'최고 레벨':'오피스 확장';
    $('upgradeCost').textContent=state.officeLevel===10?'LV. 10 / 10':'₩'+upgradePrice(state.officeLevel)+'M · 출시 '+state.officeLevel+'회 필요';
    $('upgradeButton').disabled=state.officeLevel===10;
    $('scene').classList.toggle('editing',editMode);
    $('inventory').hidden=!editMode;
    $('editButton').classList.toggle('active',editMode);
    $('editButton').querySelector('span:last-child').textContent=editMode?'배치 완료':'배치 수정';
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
    const skill=workers.filter(w=>assigned[w.id]).reduce((sum,w)=>sum+state.staff[w.id].level*4,0);
    const material=choices.material==='리넨'&&trend.season==='여름'||choices.material==='재생 원단'&&choices.style==='아웃도어'?6:0;
    return [Math.max(10,Math.min(95,35+matches*11+skill+material)),matches];
  };
  const showLaunch = () => {
    if(state.assets<38){toast('제작비 ₩38M이 필요해요.');return;}
    const trend=trends[state.releases%trends.length];
    const choices={target:trend.target,item:baseCategories.includes(trend.item)?trend.item:'티셔츠',style:trend.style,material:'면'};
    const assigned={yuna:true,minho:true,seoyeon:true};
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
    workers.forEach(w=>{
      const label=document.createElement('label');label.className='staff-choice';
      const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.checked=true;
      checkbox.onchange=()=>{assigned[w.id]=checkbox.checked;update();};
      const img=document.createElement('img');img.src='./assets/'+w.sprite+'.webp';img.alt='';
      const text=document.createElement('span');text.textContent=w.name+' · LV.'+state.staff[w.id].level;
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
    for(const w of workers) if(assigned[w.id]){
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
    workers.forEach(w=>{
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
  const showUpgrade = () => {
    if(state.officeLevel>=10){toast('오피스 최고 레벨에 도달했어요.');return;}
    const price=upgradePrice(state.officeLevel);
    if(state.releases<state.officeLevel){toast('컬렉션 '+state.officeLevel+'회 출시 후 확장할 수 있어요.');return;}
    if(state.assets<price){toast('오피스 확장에 ₩'+price+'M이 필요해요.');return;}
    const next=state.officeLevel+1;
    showModal('<span class="modal-kicker">OFFICE UPGRADE</span><h2 id="modalTitle">'+offices[next-1]+'로 확장</h2><p>비용 ₩'+price+'M을 투자하면 오피스 레벨 '+next+'가 됩니다. 배치 가능한 칸이 늘어나고 새로운 가구가 열릴 수 있어요. 기존 배치는 그대로 유지됩니다.</p><button class="modal-primary" id="confirmUpgrade" type="button">₩'+price+'M 투자하기</button>');
    $('confirmUpgrade').onclick=()=>{state.assets-=price;state.officeLevel=next;save();render();closeModal();toast(offices[next-1]+' 확장 완료!');};
  };
  $('editButton').onclick=()=>{editMode=!editMode;selected=null;render();setHint(editMode?'아래에서 가구나 직원을 선택해 배치하세요':'가구와 직원을 터치해 살펴보세요');};
  $('doneButton').onclick=()=>$('editButton').click();
  $('upgradeButton').onclick=showUpgrade;
  $('researchButton').onclick=showResearch;
  $('launchButton').onclick=showLaunch;
  $('saveButton').onclick=showSaveInfo;
  $('modalClose').onclick=closeModal;
  $('modalLayer').addEventListener('click',event=>{if(event.target===$('modalLayer'))closeModal();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!$('modalLayer').hidden)closeModal();});
  render();
})();