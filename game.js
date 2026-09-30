(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const items = [
    {id:'designDesk',name:'디자인 책상',sprite:0,level:1,type:'furniture'},
    {id:'sewingDesk',name:'재봉 작업대',sprite:1,level:1,type:'furniture'},
    {id:'rack',name:'의류 행거',sprite:2,level:1,type:'furniture'},
    {id:'photo',name:'촬영 공간',sprite:3,level:3,type:'furniture'},
    {id:'moodboard',name:'트렌드 보드',sprite:4,level:5,type:'furniture'},
    {id:'lounge',name:'라운지',sprite:5,level:7,type:'furniture'},
    {id:'yuna',name:'유나 · 디자인',sprite:6,level:1,type:'worker',station:'designDesk'},
    {id:'minho',name:'민호 · 생산',sprite:7,level:1,type:'worker',station:'sewingDesk'},
    {id:'seoyeon',name:'서연 · 마케팅',sprite:8,level:1,type:'worker',station:'photo'}
  ];
  const offices = [
    '낡은 원룸 사무실','정돈된 작업실','첫 번째 스튜디오','창가 작업실','성장하는 아틀리에',
    '넓어진 디자인실','브랜드 본사','도심 패션 스튜디오','프리미엄 오피스','글로벌 패션 하우스'
  ];
  const bounds = [
    [2,6,4,6],[2,7,4,6],[2,7,3,6],[1,7,3,6],[1,7,2,6],
    [1,8,2,6],[1,8,1,6],[0,8,1,6],[0,9,1,6],[0,9,0,6]
  ];
  const trends = [
    {season:'봄',item:'셔츠',style:'미니멀',target:'20대 직장인'},
    {season:'여름',item:'티셔츠',style:'스트리트',target:'10대 학생'},
    {season:'가을',item:'데님',style:'Y2K',target:'20대 직장인'},
    {season:'겨울',item:'셔츠',style:'미니멀',target:'20대 직장인'}
  ];
  const initial = () => ({
    officeLevel:1,companyLevel:1,assets:120,customers:320,releases:0,localSave:false,
    placed:[
      {id:'designDesk',x:3,y:4},{id:'sewingDesk',x:5,y:4},{id:'rack',x:6,y:5},
      {id:'yuna',x:3,y:5},{id:'minho',x:5,y:5},{id:'seoyeon',x:4,y:6}
    ]
  });
  let state = initial();
  try {
    const saved = JSON.parse(localStorage.getItem('atelier-device-save') || 'null');
    if(saved && saved.officeLevel >= 1 && saved.officeLevel <= 10 && Array.isArray(saved.placed)) {
      state = {...initial(),...saved,localSave:true};
    }
  } catch {}
  let editMode = false, selected = null, toastTimer;
  const definition = id => items.find(item => item.id === id);
  const placed = id => state.placed.find(item => item.id === id);
  const isUnlocked = (x,y) => {
    const [minX,maxX,minY,maxY] = bounds[state.officeLevel-1];
    return x>=minX && x<=maxX && y>=minY && y<=maxY;
  };
  const occupied = (x,y,exceptId) => state.placed.some(p => p.id!==exceptId && p.x===x && p.y===y);
  const upgradePrice = level => 95 + (level-1)*45;
  const save = () => {
    if(state.localSave) localStorage.setItem('atelier-device-save',JSON.stringify(state));
  };
  const toast = message => {
    $('toast').textContent=message;
    $('toast').classList.add('show');
    clearTimeout(toastTimer);
    toastTimer=setTimeout(()=>$('toast').classList.remove('show'),2600);
  };
  const setHint = message => {$('placementHint').textContent=message};
  const positionFromPointer = event => {
    const r=$('floor').getBoundingClientRect();
    return {x:Math.floor((event.clientX-r.left)/r.width*10),y:Math.floor((event.clientY-r.top)/r.height*7)};
  };
  const move = (id,x,y) => {
    if(!isUnlocked(x,y)){toast('잠긴 공간이에요. 오피스를 확장하면 열립니다.');return false}
    if(occupied(x,y,id)){toast('이미 다른 가구나 직원이 있어요.');return false}
    const target=placed(id);
    if(target){target.x=x;target.y=y}
    else state.placed.push({id,x,y});
    selected=id;
    render();
    save();
    setHint(`${definition(id).name} 배치 완료 · 다시 선택해 옮길 수 있어요`);
    return true;
  };
  const renderFloor = () => {
    const floor=$('floor');
    floor.replaceChildren();
    for(let y=0;y<7;y++) for(let x=0;x<10;x++){
      const tile=document.createElement('button');
      tile.type='button';
      tile.className='tile '+(isUnlocked(x,y)?'available':'locked');
      tile.setAttribute('role','gridcell');
      tile.setAttribute('aria-label',`${x+1}열 ${y+1}행 ${isUnlocked(x,y)?'배치 가능':'잠김'}`);
      tile.addEventListener('click',()=>{
        if(!editMode){setHint('배치 수정 버튼을 누르면 사무실을 꾸밀 수 있어요.');return}
        if(!selected){toast('먼저 아래에서 가구나 직원을 선택하세요.');return}
        move(selected,x,y);
      });
      floor.append(tile);
    }
    state.placed.forEach(p=>{
      const d=definition(p.id);
      if(!d)return;
      const button=document.createElement('button');
      button.type='button';
      button.className='piece '+d.type+(selected===p.id?' selected':'');
      button.setAttribute('aria-label',`${d.name} · ${p.x+1}열 ${p.y+1}행. ${editMode?'드래그하거나 선택 후 빈 칸을 터치해 이동':'선택해 정보 보기'}`);
      button.style.left=`${(p.x+.5)*10}%`;
      button.style.top=`${((p.y+.52)/7)*100}%`;
      button.innerHTML=`<img src="./assets/sprite-${d.sprite}.webp" alt="" draggable="false"><span class="piece-label">${d.name}</span>`;
      let dragStart=null;
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
          move(p.id,pos.x,pos.y);
          button.dataset.dragged='yes';
          setTimeout(()=>{button.dataset.dragged=''},50);
        }
      });
      button.addEventListener('click',()=>{
        if(button.dataset.dragged==='yes')return;
        selected=p.id;
        if(editMode){renderFloor();renderInventory();setHint(`${d.name} 선택됨 · 원하는 빈 칸을 터치하거나 끌어서 옮기세요`)}
        else setHint(d.type==='worker'?`${d.name} · 가까운 작업대에 배치하면 제작 보너스가 생깁니다.`:`${d.name} · 배치 수정을 눌러 옮길 수 있어요.`);
      });
      floor.append(button);
    });
  };
  const renderInventory = () => {
    $('inventoryItems').replaceChildren();
    items.forEach(d=>{
      const locked=state.officeLevel<d.level;
      const button=document.createElement('button');
      button.type='button';
      button.className='inventory-item'+(locked?' locked':'')+(selected===d.id?' selected':'');
      button.setAttribute('aria-label',locked?`${d.name} 오피스 레벨 ${d.level}에 해금`:`${d.name} ${placed(d.id)?'배치됨, 이동 선택':'배치하기'}`);
      button.disabled=locked;
      button.innerHTML=`<img src="./assets/sprite-${d.sprite}.webp" alt=""><span>${d.name}</span>${locked?`<small>LV.${d.level}</small>`:placed(d.id)?'<small>배치됨</small>':''}`;
      button.addEventListener('click',()=>{
        selected=d.id;
        renderInventory();
        renderFloor();
        setHint(placed(d.id)?`${d.name}을 끌거나 빈 칸을 터치해 이동하세요`:`${d.name}을 놓을 빈 칸을 터치하세요`);
      });
      $('inventoryItems').append(button);
    });
  };
  const render = () => {
    $('companyLevel').textContent=state.companyLevel;
    $('assetValue').textContent=`₩${Math.round(state.assets).toLocaleString()}M`;
    $('customerValue').textContent=`${state.customers.toLocaleString()}명`;
    $('officeTitle').textContent=offices[state.officeLevel-1];
    $('officeLevel').textContent=`오피스 LV. ${state.officeLevel} / 10`;
    $('year').textContent=1+Math.floor(state.releases/4);
    const trend=trends[state.releases%4];
    $('season').textContent=trend.season;
    $('trend').textContent=`트렌드 · ${trend.style} ${trend.item}`;
    $('roomBackdrop').style.backgroundImage=`url('./assets/office-${state.officeLevel<4?'01':state.officeLevel<8?'05':'10'}.webp')`;
    $('roomBackdrop').style.filter=`saturate(${.88+state.officeLevel*.025}) brightness(${.96+state.officeLevel*.009})`;
    $('progressTitle').textContent=state.officeLevel===10?'최고의 패션 하우스':`${offices[state.officeLevel-1]}에서 다음 단계로`;
    $('progressText').textContent=state.officeLevel===10?'오피스는 최고 레벨입니다. 컬렉션을 계속 성장시켜 보세요.':`새 배치 공간이 열립니다 · ${state.releases}회 컬렉션 출시`;
    $('upgradeLabel').textContent=state.officeLevel===10?'최고 레벨':'오피스 확장';
    $('upgradeCost').textContent=state.officeLevel===10?'LV. 10 / 10':`₩${upgradePrice(state.officeLevel)}M · 출시 ${state.officeLevel}회 필요`;
    $('upgradeButton').disabled=state.officeLevel===10;
    $('scene').classList.toggle('editing',editMode);
    $('inventory').hidden=!editMode;
    $('editButton').classList.toggle('active',editMode);
    $('editButton').querySelector('span:last-child').textContent=editMode?'배치 완료':'배치 수정';
    $('guestBanner').innerHTML=state.localSave?'이 기기 저장 사용 중 · 다른 기기와 동기화되지 않습니다. <button type="button" id="saveInfo">저장 방식 보기</button>':'게스트 플레이 중 · 화면을 나가면 진행 내용이 사라집니다. <button type="button" id="saveInfo">저장 방식 보기</button>';
    $('saveInfo').addEventListener('click',showSaveInfo);
    $('saveButton').textContent=state.localSave?'이 기기에 저장 중':'저장 안내';
    renderFloor();
    if(editMode)renderInventory();
  };
  const closeModal = () => {$('modalLayer').hidden=true;$('modalContent').replaceChildren()};
  const showModal = html => {$('modalContent').innerHTML=html;$('modalLayer').hidden=false;$('modalClose').focus()};
  const showSaveInfo = () => {
    showModal(`<span class="modal-kicker">PLAY DATA</span><h2 id="modalTitle">진행 내용 저장</h2><p>게스트 플레이는 새로고침하거나 앱을 닫으면 초기화됩니다. 아래 버튼으로 이 기기에만 저장할 수 있어요. 계정 로그인과 기기 간 동기화는 아직 구현되지 않았습니다.</p><button class="modal-primary" id="enableSave" type="button">${state.localSave?'지금 이 기기에 저장':'이 기기에 저장 시작'}</button>`);
    $('enableSave').onclick=()=>{
      state.localSave=true;
      save();
      render();
      closeModal();
      toast('이 기기의 브라우저에 진행 내용이 저장됩니다.');
    };
  };
  const workerBonus = () => {
    let bonus=0;
    for(const d of items.filter(item=>item.type==='worker')){
      const worker=placed(d.id),station=placed(d.station);
      if(worker&&station&&Math.abs(worker.x-station.x)+Math.abs(worker.y-station.y)<=2)bonus+=5;
    }
    if(placed('moodboard'))bonus+=3;
    if(placed('lounge'))bonus+=2;
    return bonus;
  };
  const showLaunch = () => {
    if(state.assets<38){toast('제작비 ₩38M이 필요해요.');return}
    const choices={target:'20대 직장인',item:'셔츠',style:'미니멀'};
    showModal(`<span class="modal-kicker">NEW COLLECTION · ${trends[state.releases%4].season.toUpperCase()}</span><h2 id="modalTitle">다음 컬렉션을 기획하세요</h2><p>선택과 직원 배치가 출시 결과에 반영됩니다. 제작비 ₩38M.</p><div id="choices"></div><button class="modal-primary" id="confirmLaunch" type="button">제작하고 출시하기</button>`);
    const groups=[
      ['target','누구에게 팔까요?',['20대 직장인','10대 학생','아웃도어 고객']],
      ['item','무엇을 만들까요?',['셔츠','티셔츠','데님']],
      ['style','어떤 스타일인가요?',['미니멀','스트리트','Y2K']]
    ];
    const holder=$('choices');
    groups.forEach(([key,label,values])=>{
      const group=document.createElement('div');
      group.className='choice-group';
      group.innerHTML=`<strong>${label}</strong><div class="choice-row"></div>`;
      values.forEach(value=>{
        const button=document.createElement('button');
        button.type='button';
        button.textContent=value;
        button.className=value===choices[key]?'selected':'';
        button.onclick=()=>{
          choices[key]=value;
          group.querySelectorAll('button').forEach(b=>b.classList.toggle('selected',b===button));
        };
        group.querySelector('.choice-row').append(button);
      });
      holder.append(group);
    });
    $('confirmLaunch').onclick=()=>launch(choices);
  };
  const launch = choices => {
    const trend=trends[state.releases%4];
    const matches=Number(choices.target===trend.target)+Number(choices.item===trend.item)+Number(choices.style===trend.style);
    const bonus=workerBonus();
    const score=Math.min(100,46+matches*11+bonus+Math.floor(Math.random()*7));
    const revenue=Math.round(score*1.72+state.companyLevel*4);
    const cost=38;
    const gained=Math.max(20,Math.round((score-35)*4.4));
    state.assets+=revenue-cost;
    state.customers+=gained;
    state.releases++;
    state.companyLevel=Math.min(10,1+Math.floor(state.releases/2));
    save();
    render();
    showModal(`<span class="modal-kicker">COLLECTION RELEASED</span><h2 id="modalTitle">${choices.style} ${choices.item} 출시!</h2><div class="report-score">${score}</div><p>${matches>=2?'시즌의 흐름을 잘 읽었어요.':'색다른 시도였어요. 다음 시즌의 수요도 살펴보세요.'} 작업대 근처 직원 배치 보너스 +${bonus}점.</p><div class="report-line">매출 <strong>+₩${revenue}M</strong></div><div class="report-line">제작비 <strong>−₩${cost}M</strong></div><div class="report-line">새 고객 <strong>+${gained}명</strong></div><button class="modal-primary" id="reportDone" type="button">사무실로 돌아가기</button>`);
    $('reportDone').onclick=closeModal;
  };
  const showUpgrade = () => {
    if(state.officeLevel>=10){toast('오피스 최고 레벨에 도달했어요.');return}
    const price=upgradePrice(state.officeLevel);
    if(state.releases<state.officeLevel){toast(`컬렉션 ${state.officeLevel}회 출시 후 확장할 수 있어요.`);return}
    if(state.assets<price){toast(`오피스 확장에 ₩${price}M이 필요해요.`);return}
    const next=state.officeLevel+1;
    showModal(`<span class="modal-kicker">OFFICE UPGRADE</span><h2 id="modalTitle">${offices[next-1]}로 확장</h2><p>비용 ₩${price}M을 투자하면 오피스 레벨 ${next}가 됩니다. 배치 가능한 칸이 늘어나고 새로운 가구가 열릴 수 있어요. 기존 배치는 그대로 유지됩니다.</p><button class="modal-primary" id="confirmUpgrade" type="button">₩${price}M 투자하기</button>`);
    $('confirmUpgrade').onclick=()=>{
      state.assets-=price;
      state.officeLevel=next;
      save();
      render();
      closeModal();
      toast(`${offices[next-1]} 확장 완료! 새 공간을 꾸며보세요.`);
    };
  };
  $('editButton').onclick=()=>{
    editMode=!editMode;
    selected=null;
    render();
    setHint(editMode?'아래에서 가구나 직원을 선택해 배치하세요':'가구와 직원을 터치해 살펴보세요');
  };
  $('doneButton').onclick=()=>$('editButton').click();
  $('upgradeButton').onclick=showUpgrade;
  $('launchButton').onclick=showLaunch;
  $('saveButton').onclick=showSaveInfo;
  $('modalClose').onclick=closeModal;
  $('modalLayer').addEventListener('click',event=>{if(event.target===$('modalLayer'))closeModal()});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!$('modalLayer').hidden)closeModal()});
  render();
})();
