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
    {id:'yuna',name:'유나',sprite:'cat-0',level:1,type:'worker',role:'디자인',cost:24},
    {id:'minho',name:'민호',sprite:'cat-1',level:1,type:'worker',role:'생산',cost:26},
    {id:'seoyeon',name:'서연',sprite:'cat-2',level:1,type:'worker',role:'마케팅',cost:28},
    {id:'nabi',name:'나비',sprite:'cat-0',level:2,type:'worker',role:'디자인',cost:30},
    {id:'duri',name:'두리',sprite:'cat-1',level:3,type:'worker',role:'생산',cost:32},
    {id:'momo',name:'모모',sprite:'cat-2',level:4,type:'worker',role:'마케팅',cost:34},
    {id:'bomi',name:'보미',sprite:'cat-0',level:5,type:'worker',role:'디자인',cost:36},
    {id:'toto',name:'토토',sprite:'cat-1',level:6,type:'worker',role:'생산',cost:38},
    {id:'hari',name:'하리',sprite:'cat-2',level:7,type:'worker',role:'마케팅',cost:40},
    {id:'lulu',name:'루루',sprite:'cat-0',level:8,type:'worker',role:'디자인',cost:42},
    {id:'raon',name:'라온',sprite:'cat-design-black',level:2,type:'worker',role:'디자인',cost:30},
    {id:'dot',name:'도트',sprite:'cat-design-spotted',level:3,type:'worker',role:'디자인',cost:34},
    {id:'berry',name:'베리',sprite:'cat-design-blue',level:9,type:'worker',role:'디자인',cost:58},
    {id:'tani',name:'탄이',sprite:'cat-production-tuxedo',level:2,type:'worker',role:'생산',cost:31},
    {id:'somi',name:'소미',sprite:'cat-production-siamese',level:4,type:'worker',role:'생산',cost:35},
    {id:'coco',name:'코코',sprite:'cat-production-calico',level:10,type:'worker',role:'생산',cost:64},
    {id:'bambi',name:'밤비',sprite:'cat-marketing-black',level:2,type:'worker',role:'마케팅',cost:30},
    {id:'euni',name:'은이',sprite:'cat-marketing-tabby',level:4,type:'worker',role:'마케팅',cost:36},
    {id:'gureum',name:'구름',sprite:'cat-marketing-ginger',level:6,type:'worker',role:'마케팅',cost:42}
  ];
  const workers = items.filter(i => i.type === 'worker');
  const furniture = items.filter(i => i.type === 'furniture');
  const skeletonImage = img => {
    img.setAttribute('data-skeleton','');
    const finish = () => img.classList.add('image-ready');
    img.addEventListener('load',finish,{once:true});
    img.addEventListener('error',finish,{once:true});
    return img;
  };
  const warmArtwork = () => {
    if (typeof Image === 'undefined') return;
    const paths = ['office-mid.webp','office-high.webp','cats-disappointed.webp','production-studio.webp'];
    for (const name of paths) { const preview = new Image(); preview.src = './assets/' + name; }
  };
  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('load', () => {
      if ('requestIdleCallback' in window) window.requestIdleCallback(warmArtwork, {timeout:5000});
      else setTimeout(warmArtwork, 1200);
    }, {once:true});
  }
  // Each larger office layout adds staff capacity on top of its level.
  const employeeCap = Array.from({length:10},(_,index)=>{
    const level=index+1;
    return level+(level>=8?3:level>=4?2:1);
  });
  const furnitureCap = [2,3,4,5,6,7,8,9,10,11];
  const furniturePrice = {designDesk:18,sewingDesk:22,rack:16,photo:30,moodboard:26,lounge:36};
  const offices = ['낡은 원룸 사무실','정돈된 작업실','첫 번째 스튜디오','창가 작업실','성장하는 아틀리에','넓어진 디자인실','브랜드 본사','도심 패션 스튜디오','프리미엄 오피스','글로벌 패션 하우스'];
  const gridSizes=[3,4,4,5,5,6,6,7,7,8];
  const bounds=gridSizes.map(n=>[0,n-1,0,n-1]);
  const gridSize=()=>gridSizes[state.officeLevel-1];
  const officeArtworkWidth=level=>58+(level-1)*42/9;
  // The painted room is slightly asymmetric: the left and right floor edges
  // have different slopes. Keep drawing and pointer hit-testing on one basis.
  const FLOOR_ORIGIN={left:54,top:28};
  const FLOOR_RIGHT={left:38,top:29};
  const FLOOR_LEFT={left:-44,top:29.5};
  const floorPoint=(u,v)=>({
    left:FLOOR_ORIGIN.left+FLOOR_RIGHT.left*u+FLOOR_LEFT.left*v,
    top:FLOOR_ORIGIN.top+FLOOR_RIGHT.top*u+FLOOR_LEFT.top*v
  });
  const cellCenter = (x,y) => {
    const n=gridSize(),u=(x+.5)/n,v=(y+.5)/n;
    return floorPoint(u,v);
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
    research:0,unlocks:[],staff:{},hired:[],ownedFurniture:[],history:[],placed:[],loan:{principal:0,interestDue:0}
  });
  let state = initial();
  const hydrate = saved => {
    if(saved && saved.officeLevel >= 1 && saved.officeLevel <= 10 && Array.isArray(saved.placed)) {
      const loaded = {...initial(),...saved,localSave:true};
      loaded.staff = saved.staff || {};
      loaded.unlocks = Array.isArray(saved.unlocks) ? saved.unlocks : [];
      loaded.history = Array.isArray(saved.history) ? saved.history : [];
      loaded.hired = Array.isArray(saved.hired) ? saved.hired : workers.filter(w => saved.placed.some(p => p.id===w.id)).map(w => w.id);
      loaded.ownedFurniture = Array.isArray(saved.ownedFurniture) ? saved.ownedFurniture : saved.placed.filter(p => furniture.some(f => f.id===p.id)).map(p => ({id:p.id,kind:p.id}));
      loaded.loan = {
        principal:Number.isFinite(saved.loan?.principal)?Math.max(0,saved.loan.principal):0,
        interestDue:Number.isFinite(saved.loan?.interestDue)?Math.max(0,saved.loan.interestDue):0
      };
      for(const id of loaded.hired) loaded.staff[id] = loaded.staff[id] || {level:1,xp:0};
      if(saved.layoutVersion!==3){
        const n=gridSizes[loaded.officeLevel-1],oldWidth=saved.layoutVersion===2?8:10,oldHeight=saved.layoutVersion===2?8:7;
        const used=new Set();
        loaded.placed=loaded.placed.map(p=>{
          let x=Math.min(n-1,Math.floor((p.x+.5)/oldWidth*n));
          let y=Math.min(n-1,Math.floor((p.y+.5)/oldHeight*n));
          if(used.has(x+','+y)){
            const free=Array.from({length:n*n},(_,i)=>({x:i%n,y:Math.floor(i/n)})).find(cell=>!used.has(cell.x+','+cell.y));
            if(free){x=free.x;y=free.y;}
          }
          used.add(x+','+y);return {...p,x,y};
        });
        loaded.layoutVersion=3;
      }
      return loaded;
    }
    return initial();
  };
  try { state=hydrate(JSON.parse(localStorage.getItem('atelier-device-save') || 'null')); } catch {}
  let editMode = false, selected = null, toastTimer, layoutSnapshot=null, isProducing=false,dragTargetTile=null;
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
  const save = () => {
    if(window.atelierCloud?.isSignedIn()) window.atelierCloud.queueSave(state);
    else if(state.localSave) localStorage.setItem('atelier-device-save',JSON.stringify(state));
  };
  const roundMoney = value => Math.round((value+Number.EPSILON)*10)/10;
  const money = value => roundMoney(value).toLocaleString('ko-KR',{maximumFractionDigits:1});
  const loanLimit = level => 60+(level-1)*40;
  const loanRate = level => .08-(level-1)*.005;
  const loanBalance = () => roundMoney(state.loan.principal+state.loan.interestDue);
  const availableLoan = () => Math.max(0,Math.floor(roundMoney(loanLimit(state.companyLevel)-state.loan.principal)));
  const borrowLoan = amount => {
    if(!Number.isInteger(amount)||amount<1||amount>availableLoan())return false;
    state.loan.principal=roundMoney(state.loan.principal+amount);
    state.assets=roundMoney(state.assets+amount);
    return true;
  };
  const repayLoan = amount => {
    if(!Number.isFinite(amount)||amount<.1||Math.abs(roundMoney(amount)-amount)>1e-9||amount>loanBalance()||amount>state.assets)return false;
    const interestPaid=Math.min(amount,state.loan.interestDue);
    state.loan.interestDue=roundMoney(state.loan.interestDue-interestPaid);
    state.loan.principal=roundMoney(Math.max(0,state.loan.principal-(amount-interestPaid)));
    state.assets=roundMoney(state.assets-amount);
    return true;
  };
  const accrueLoanInterest = () => {
    if(!state.loan.principal)return 0;
    const interest=roundMoney(state.loan.principal*loanRate(state.companyLevel));
    state.loan.interestDue=roundMoney(state.loan.interestDue+interest);
    return interest;
  };
  const toast = message => {
    $('toast').textContent=message; $('toast').classList.add('show');
    clearTimeout(toastTimer); toastTimer=setTimeout(() => $('toast').classList.remove('show'),2800);
  };
  const setHint = message => { $('placementHint').textContent=message; };
  const positionFromPointer = event => {
    const r=$('floor').getBoundingClientRect();
    const dx=(event.clientX-r.left)/r.width*100-FLOOR_ORIGIN.left;
    const dy=(event.clientY-r.top)/r.height*100-FLOOR_ORIGIN.top;
    const det=FLOOR_RIGHT.left*FLOOR_LEFT.top-FLOOR_LEFT.left*FLOOR_RIGHT.top;
    const u=(dx*FLOOR_LEFT.top-FLOOR_LEFT.left*dy)/det;
    const v=(FLOOR_RIGHT.left*dy-FLOOR_RIGHT.top*dx)/det;
    return {x:Math.floor(u*gridSize()),y:Math.floor(v*gridSize())};
  };
  const clearDragTarget=()=>{
    if(dragTargetTile)dragTargetTile.classList.remove('drag-target','drag-invalid');
    dragTargetTile=null;
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
    const floor=$('floor'),tileByCell=new Map();
    clearDragTarget();floor.replaceChildren();
    for(let y=0;y<gridSize();y++) for(let x=0;x<gridSize();x++){
      const tile=document.createElement('button');tile.type='button';
      tile.className='tile '+(isUnlocked(x,y)?'available':'locked');
      tile.setAttribute('role','gridcell');
      tile.setAttribute('aria-label',(x+1)+'열 '+(y+1)+'행 '+(isUnlocked(x,y)?'배치 가능':'잠김'));
      const n=gridSize(),top=floorPoint(x/n,y/n),right=floorPoint((x+1)/n,y/n);
      const bottom=floorPoint((x+1)/n,(y+1)/n),left=floorPoint(x/n,(y+1)/n);
      tile.style.left=left.left+'%';
      tile.style.top=top.top+'%';
      tile.style.width=(right.left-left.left)+'%';
      tile.style.height=(bottom.top-top.top)+'%';
      tile.addEventListener('click',()=>{
        if(!editMode){setHint('왼쪽 메뉴의 배치 수정을 눌러 사무실을 꾸며보세요.');return;}
        if(!selected){toast('먼저 아래에서 가구나 직원을 선택하세요.');return;}
        move(selected,x,y);
      });
      tileByCell.set(x+','+y,tile);floor.append(tile);
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
      const img=skeletonImage(document.createElement('img'));img.src='./assets/'+d.sprite+'.webp';img.alt='';img.draggable=false;
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
        if(Math.hypot(dx,dy)>5){
          button.style.transform='translate(-50%,-50%) translate('+dx+'px,'+dy+'px)';
          const cell=positionFromPointer(event),target=tileByCell.get(cell.x+','+cell.y);
          if(target!==dragTargetTile){clearDragTarget();dragTargetTile=target||null;}
          if(dragTargetTile){
            dragTargetTile.classList.add('drag-target');
            dragTargetTile.classList.toggle('drag-invalid',!isUnlocked(cell.x,cell.y)||occupied(cell.x,cell.y,p.id));
          }
        }
      });
      button.addEventListener('pointercancel',()=>{dragStart=null;button.style.transform='';clearDragTarget();});
      button.addEventListener('pointerup',event=>{
        if(!dragStart)return;
        const distance=Math.hypot(event.clientX-dragStart.x,event.clientY-dragStart.y);
        dragStart=null;button.style.transform='';clearDragTarget();
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
      const img=skeletonImage(document.createElement('img'));img.src='./assets/'+d.sprite+'.webp';img.alt='';
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
    $('assetValue').textContent='₩'+money(state.assets)+'M';
    $('customerValue').textContent=state.customers.toLocaleString()+'명';
    $('officeTitle').textContent=offices[state.officeLevel-1];
    $('officeLevel').textContent='오피스 LV. '+state.officeLevel+' / 10';
    const debt=loanBalance();
    $('officeLoan').hidden=debt===0;
    if(debt){
      $('officeLoanBalance').textContent='₩'+money(debt)+'M';
      $('officeLoanRate').textContent=(loanRate(state.companyLevel)*100).toFixed(1)+'%';
    }
    $('year').textContent=1+Math.floor(state.releases/4);
    const trend=trends[state.releases%trends.length];
    $('season').textContent=trend.season;
    $('trend').textContent='트렌드 · '+trend.style+' '+trend.item;
    const worldWidth=officeArtworkWidth(state.officeLevel);
    $('roomWorld').style.width=worldWidth+'%';
    // The painted office expands, but sprites and their hit targets keep the same screen size.
    $('roomWorld').style.setProperty('--piece-size',700/worldWidth+'%');
    $('roomWorld').style.setProperty('--piece-size-mobile',840/worldWidth+'%');
    const backdrop=$('roomBackdrop');
    const artwork=(state.officeLevel<4?'office-pastel':state.officeLevel<8?'office-mid':'office-high')+'.webp';
    if(backdrop.dataset.artwork!==artwork){
      backdrop.dataset.artwork=artwork;
      backdrop.classList.add('image-loading');
      backdrop.style.backgroundImage="url('./assets/"+artwork+"')";
      if(typeof Image!=='undefined'){
        const loader=new Image();
        loader.onload=loader.onerror=()=>{if(backdrop.dataset.artwork===artwork)backdrop.classList.remove('image-loading');};
        loader.src='./assets/'+artwork;
        if(loader.complete&&loader.naturalWidth>0)backdrop.classList.remove('image-loading');
      } else backdrop.classList.remove('image-loading');
    }
    backdrop.style.filter='saturate('+(1+state.officeLevel*.014)+') brightness('+(1+state.officeLevel*.006)+')';
    $('companyNameBrand').textContent=state.companyName||'ATELIER';
    $('scene').classList.toggle('editing',editMode);
    $('inventory').hidden=!editMode;
    $('editButton').classList.toggle('active',editMode);
    $('editButton').textContent=editMode?'배치 취소':'배치 수정';
    $('launchButton').classList.toggle('layout-mode',editMode);
    $('launchButton').setAttribute('aria-label',editMode?'배치 저장':'새 컬렉션 만들기');
    $('actionIcon').src=editMode?'./assets/check-light.svg':'./assets/paw-light.svg';
    $('launchButton').querySelector('small').textContent=editMode?'배치 저장':'새 컬렉션';
    const cloud=window.atelierCloud?.status();
    $('guestBanner').innerHTML=cloud?.user?'계정에 저장 중 · <span id="saveStatus"></span> <button type="button" id="saveInfo">계정 보기</button>':state.localSave?'이 기기 저장 사용 중 · 다른 기기와 동기화되지 않습니다. <button type="button" id="saveInfo">로그인 · 저장 방식</button>':'게스트 플레이 중 · 화면을 나가면 진행 내용이 사라집니다. <button type="button" id="saveInfo">로그인 · 저장 방식</button>';
    if(cloud?.user)$('saveStatus').textContent=cloud.label;
    $('saveInfo').addEventListener('click',showSaveInfo);
    renderFloor();if(editMode)renderInventory();
  };
  let accountChoiceResolve=null;
  const closeModal = () => {
    if(isProducing)return;
    if(accountChoiceResolve){accountChoiceResolve(null);accountChoiceResolve=null;}
    $('modalLayer').hidden=true;$('modalContent').replaceChildren();
  };
  const showModal = html => {
    $('modalContent').innerHTML=html;
    $('modalContent').querySelectorAll('img[data-skeleton]').forEach(img=>{
      const finish=()=>img.classList.add('image-ready');
      img.addEventListener('load',finish,{once:true});
      img.addEventListener('error',finish,{once:true});
      if(img.complete)finish();
    });
    $('modalLayer').hidden=false;$('modalClose').hidden=isProducing;if(!isProducing)$('modalClose').focus();
  };
  const showSaveInfo = () => {
    if(window.atelierCloud?.isSignedIn()){showAccount();return;}
    showModal('<span class="modal-kicker">PLAY DATA</span><h2 id="modalTitle">진행 내용 저장</h2><p>계정으로 로그인하면 다른 기기에서도 이어할 수 있어요. 게스트 플레이는 아래에서 이 브라우저에 저장할 수 있습니다.</p><button class="modal-primary" id="openAccount" type="button">로그인 · 회원가입</button><button class="account-secondary" id="enableSave" type="button">'+(state.localSave?'지금 이 기기에 저장':'이 기기에 저장 시작')+'</button>');
    $('openAccount').onclick=()=>showAccount();
    $('enableSave').onclick=()=>{state.localSave=true;save();render();closeModal();toast('이 기기의 브라우저에 진행 내용이 저장됩니다.');};
  };
  const showAccount = (mode='login') => {
    const cloud=window.atelierCloud;
    if(!cloud?.isConfigured()){
      showModal('<span class="modal-kicker">ATELIER ACCOUNT</span><h2 id="modalTitle">계정 저장 준비 중</h2><p>Firebase 프로젝트 연결을 마치면 로그인과 기기 간 저장을 사용할 수 있어요. 지금은 기기 저장을 사용할 수 있습니다.</p><button class="modal-primary" id="localInstead" type="button">기기 저장하기</button>');
      $('localInstead').onclick=()=>{state.localSave=true;save();render();closeModal();toast('이 기기에 저장했어요.');};
      return;
    }
    if(cloud.isSignedIn()){
      const info=cloud.status();
      showModal('<span class="modal-kicker">ATELIER ACCOUNT</span><h2 id="modalTitle">내 계정</h2><p class="account-email" id="accountEmail"></p><p id="accountSaveState"></p><button class="modal-primary" id="saveNow" type="button">지금 저장하기</button><button class="account-secondary" id="signOut" type="button">로그아웃</button>');
      $('accountEmail').textContent=info.label;
      $('accountSaveState').textContent=info.sync;
      $('saveNow').onclick=async()=>{try{await cloud.saveNow(state);$('accountSaveState').textContent='계정에 저장됐어요.';toast('계정에 저장했어요.');}catch(error){$('accountSaveState').textContent=cloud.errorMessage(error);}};
      $('signOut').onclick=async()=>{try{await cloud.signOut();closeModal();toast('로그아웃했어요.');}catch(error){$('accountSaveState').textContent=cloud.errorMessage(error);}};
      return;
    }
    const signup=mode==='signup';
    showModal('<span class="modal-kicker">ATELIER ACCOUNT</span><h2 id="modalTitle">'+(signup?'회원가입':'로그인')+'</h2><p>계정에 진행 내용을 저장하고 다른 기기에서 이어하세요.</p><div class="account-tabs"><button type="button" id="loginTab" class="'+(signup?'':'active')+'">로그인</button><button type="button" id="signupTab" class="'+(signup?'active':'')+'">회원가입</button></div><form id="accountForm" class="account-form"><label for="accountEmailInput">이메일</label><input id="accountEmailInput" type="email" autocomplete="email" required><label for="accountPassword">비밀번호</label><input id="accountPassword" type="password" minlength="6" autocomplete="'+(signup?'new-password':'current-password')+'" required><p class="account-error" id="accountError" role="alert"></p><button class="modal-primary" type="submit">'+(signup?'이메일로 가입':'이메일로 로그인')+'</button></form><button class="account-google" id="googleSignIn" type="button">Google 계정으로 계속하기</button>'+(signup?'':'<button class="account-link" id="resetPassword" type="button">비밀번호 재설정</button>'));
    $('loginTab').onclick=()=>showAccount('login');$('signupTab').onclick=()=>showAccount('signup');
    const report=error=>{$('accountError').textContent=cloud.errorMessage(error);$('accountForm').querySelector('button[type="submit"]').disabled=false;$('googleSignIn').disabled=false;};
    $('accountForm').onsubmit=async event=>{
      event.preventDefault();const button=event.currentTarget.querySelector('button[type="submit"]');button.disabled=true;$('accountError').textContent='';
      try{await (signup?cloud.signUp:cloud.signIn)($('accountEmailInput').value.trim(),$('accountPassword').value);}catch(error){report(error);}
    };
    $('googleSignIn').onclick=async()=>{$('googleSignIn').disabled=true;$('accountError').textContent='';try{await cloud.signInGoogle();}catch(error){report(error);}};
    if(!signup)$('resetPassword').onclick=async()=>{
      const email=$('accountEmailInput').value.trim();if(!email){$('accountError').textContent='이메일을 먼저 입력해 주세요.';return;}
      try{await cloud.resetPassword(email);$('accountError').textContent='재설정 메일을 보냈어요. 메일함을 확인해 주세요.';}catch(error){report(error);}
    };
  };
  window.atelierGameBridge={
    snapshot:()=>JSON.parse(JSON.stringify(state)),
    hasProgress:()=>Boolean(state.companyName),
    applyCloud:saved=>{state=hydrate(saved);editMode=false;selected=null;layoutSnapshot=null;$('startLayer').hidden=Boolean(state.companyName);closeModal();render();},
    restoreGuest:()=>{try{state=hydrate(JSON.parse(localStorage.getItem('atelier-device-save')||'null'));}catch{state=initial();}editMode=false;selected=null;layoutSnapshot=null;$('startLayer').hidden=Boolean(state.companyName);render();},
    refresh:()=>render(),
    toast,
    chooseSave:()=>new Promise(resolve=>{
      if($('modalContent').querySelector('.account-form'))closeModal();
      showModal('<span class="modal-kicker">SAVE DATA</span><h2 id="modalTitle">이어할 진행 내용 선택</h2><p>이 기기의 진행 내용과 계정에 저장된 진행 내용이 달라요. 선택하지 않은 내용은 계정에 덮어쓰지 않습니다.</p><button class="modal-primary" id="useCloud" type="button">계정 저장 내용 불러오기</button><button class="account-secondary" id="useDevice" type="button">이 기기 내용으로 계정 저장</button>');
      accountChoiceResolve=resolve;
      $('useCloud').onclick=()=>{accountChoiceResolve=null;resolve('cloud');closeModal();};
      $('useDevice').onclick=()=>{accountChoiceResolve=null;resolve('device');closeModal();};
    })
  };
  const showLoan = (focusRepayment=false) => {
    const limit=loanLimit(state.companyLevel),available=availableLoan(),balance=loanBalance();
    const repayMax=roundMoney(Math.min(state.assets,balance));
    showModal('<span class="modal-kicker">ATELIER FINANCE</span><h2 id="modalTitle">대출 관리</h2><p>회사 LV.'+state.companyLevel+' · 컬렉션을 출시할 때마다 남은 원금에 시즌 이자가 붙습니다. 미납 이자에는 이자가 붙지 않아요.</p><div class="loan-summary"><div><span>원금 한도</span><strong>₩'+money(limit)+'M</strong></div><div><span>현재 이자율</span><strong>'+ (loanRate(state.companyLevel)*100).toFixed(1)+'%</strong></div><div><span>남은 원금</span><strong>₩'+money(state.loan.principal)+'M</strong></div><div><span>미납 이자</span><strong>₩'+money(state.loan.interestDue)+'M</strong></div><div><span>총 상환액</span><strong>₩'+money(balance)+'M</strong></div><div><span>추가 대출 가능</span><strong>₩'+money(available)+'M</strong></div></div><p class="loan-note">회사 레벨마다 한도 +₩40M, 이자율 −0.5%p · 중간 상환은 이자부터 차감됩니다. 다음 출시에는 현재 회사 레벨의 이자율이 적용돼요.</p><form id="borrowForm" class="loan-form"><label for="borrowAmount">대출 금액 (₩M)</label><div><input id="borrowAmount" type="number" min="1" max="'+available+'" step="1" inputmode="numeric" required placeholder="1 ~ '+available+'" '+(available?'':'disabled')+'><button type="submit" '+(available?'':'disabled')+'>대출하기</button></div></form><form id="repayForm" class="loan-form"><label for="repayAmount">중간 상환 금액 (₩M)</label><div><input id="repayAmount" type="number" min="0.1" max="'+repayMax+'" step="0.1" inputmode="decimal" required placeholder="최대 '+money(repayMax)+'" '+(repayMax>=.1?'':'disabled')+'><button type="submit" '+(repayMax>=.1?'':'disabled')+'>일부 상환</button></div></form><button id="repayAll" class="loan-repay-all" type="button" '+(balance>0&&state.assets>=balance?'':'disabled')+'>전액 상환 · ₩'+money(balance)+'M</button>');
    $('borrowForm').onsubmit=event=>{
      event.preventDefault();const amount=Number($('borrowAmount').value);
      if(!borrowLoan(amount)){toast('대출 가능 금액을 확인해 주세요.');return;}
      save();render();showLoan();toast('₩'+money(amount)+'M 대출 완료');
    };
    $('repayForm').onsubmit=event=>{
      event.preventDefault();const amount=Number($('repayAmount').value);
      if(!repayLoan(amount)){toast('상환액과 현재 자산을 확인해 주세요.');return;}
      save();render();showLoan();toast('₩'+money(amount)+'M 상환 완료');
    };
    $('repayAll').onclick=()=>{
      const amount=loanBalance();
      if(!repayLoan(amount)){toast('상환 가능한 자산이 부족해요.');return;}
      save();render();showLoan();toast('대출 전액 상환 완료!');
    };
    if(focusRepayment){
      $('repayForm').scrollIntoView({block:'center'});
      if(!$('repayAmount').disabled)$('repayAmount').focus();
    }
  };
  const availableItems = () => baseCategories.concat(has('hoodie')?['후드티']:[],has('bag')?['가방']:[]);
  const availableMaterials = () => ['면'].concat(has('linen')?['리넨']:[],has('recycled')?['재생 원단']:[]);
  const levelBonus = w => Math.max(0,(state.staff[w.id]?.level||1)-1);
  const statLabels = [['design','디자인'],['sewing','봉제'],['trend','트렌드 감각'],['efficiency','생산 효율']];
  const roleStats = {
    '디자인':{design:2,sewing:-2,trend:0,efficiency:-1},
    '생산':{design:-2,sewing:2,trend:-2,efficiency:1},
    '마케팅':{design:0,sewing:-3,trend:2,efficiency:-1}
  };
  // Recruitment tiers rise at every office level; role offsets keep each specialty distinct.
  const baseStats = w => Object.fromEntries(statLabels.map(([key])=>[key,Math.max(1,5+w.level+roleStats[w.role][key])]));
  const statGrowth = base => Math.max(1,Math.round(base/8));
  const employeeStats = w => {
    const base=baseStats(w),bonus=levelBonus(w);
    return Object.fromEntries(statLabels.map(([key])=>[key,base[key]+statGrowth(base[key])*bonus]));
  };
  const statSummary = w => {
    const stats=employeeStats(w);
    return statLabels.map(([key,label])=>label+' '+stats[key]).join(' · ');
  };
  const staffStatGrid = w => {
    const base=baseStats(w),bonus=levelBonus(w);
    const current=employeeStats(w);
    return '<div class="staff-stat-grid">'+statLabels.map(([key,label])=>'<div><span>'+label+'</span><strong>'+current[key]+'</strong><small>기본 '+base[key]+(bonus?' +'+statGrowth(base[key])*bonus:'')+'</small></div>').join('')+'</div>';
  };
  const statWeights = {design:.3,sewing:.3,trend:.2,efficiency:.2};
  const weightedStats = stats => statLabels.reduce((sum,[key])=>sum+stats[key]*statWeights[key],0);
  const teamStats = (assigned,base=false) => {
    const totals=Object.fromEntries(statLabels.map(([key])=>[key,0]));
    for(const w of hiredWorkers()) if(assigned[w.id]){
      const stats=base?baseStats(w):employeeStats(w);
      for(const [key] of statLabels) totals[key]+=stats[key];
    }
    return totals;
  };
  const rollStats = (assigned,random=Math.random) => {
    const rolls=Object.fromEntries(statLabels.map(([key])=>[key,0]));
    for(const w of hiredWorkers()) if(assigned[w.id]){
      const stats=employeeStats(w);
      for(const [key] of statLabels) rolls[key]+=Math.round(stats[key]*(0.2+random()*0.8));
    }
    return rolls;
  };
  const collectionGoal = (totals,matches,material) => Math.max(1,Math.ceil(weightedStats(totals)*.45+3.5-matches*.65-(material?1:0)));
  const collectionTrial = (assigned,goal,random=Math.random) => {
    const rolls=rollStats(assigned,random),score=weightedStats(rolls);
    return {rolls,score,goal,success:score>=goal};
  };
  const successChance = (choices,assigned) => {
    const trend=trends[state.releases%trends.length];
    const matches=Number(choices.target===trend.target)+Number(choices.item===trend.item)+Number(choices.style===trend.style);
    const material=choices.material==='리넨'&&trend.season==='여름'||choices.material==='재생 원단'&&choices.style==='아웃도어';
    const totals=teamStats(assigned),goal=collectionGoal(teamStats(assigned,true),matches,material);
    if(!Object.values(assigned).some(Boolean))return [0,matches,totals,goal];
    // Use a fixed sequence so the preview stays stable while the actual trial remains random.
    let seed=123456789,wins=0;
    const sample=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
    for(let i=0;i<384;i++)if(collectionTrial(assigned,goal,sample).success)wins++;
    return [Math.round(wins/384*100),matches,totals,goal];
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
      $('chancePreview').textContent='예상 성공률 '+result[0]+'% · 합산 목표 '+result[3]+' · 트렌드 일치 '+result[1]+'/3 · 참여 직원 '+Object.values(assigned).filter(Boolean).length+'명';
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
      const img=skeletonImage(document.createElement('img'));img.src='./assets/'+w.sprite+'.webp';img.alt='';
      const text=document.createElement('span');text.textContent=w.name+' · '+w.role+' · LV.'+state.staff[w.id].level;
      const stats=document.createElement('small');stats.className='staff-choice-stats';stats.textContent=statSummary(w);
      label.append(checkbox,img,text,stats);$('staffChoices').append(label);
    });
    update();$('confirmLaunch').onclick=()=>beginProduction(choices,assigned);
  };
  const productionMessages = [
    '열심히 제작 중이에요',
    '새 컬렉션을 완성하고 있어요',
    '디자인을 다듬고 있어요',
    '한 땀씩 만들어 가고 있어요',
    '마지막 디테일을 살펴봐요',
    '패션 아이디어가 옷이 되고 있어요'
  ];
  const beginProduction = (choices,assigned) => {
    if(isProducing)return;
    if(!Object.values(assigned).some(Boolean)){toast('직원을 한 명 이상 배정해 주세요.');return;}
    const [chance,,totals,goal]=successChance(choices,assigned);
    const outcome=collectionTrial(assigned,goal);
    const target=outcome.success?100:Math.min(chance,99);
    let messageIndex=Math.floor(Math.random()*productionMessages.length);
    isProducing=true;
    showModal('<span class="modal-kicker">COLLECTION IN PROGRESS</span><h2 id="modalTitle" tabindex="-1">'+productionMessages[messageIndex]+'</h2><div class="production-stage" role="status" aria-label="예상 성공률 '+chance+'퍼센트로 컬렉션 제작 중"><div class="production-percent" id="productionPercent" aria-hidden="true">0%</div><div class="production-track" aria-hidden="true"><span id="productionFill"></span></div><p>제작 진행도 · 예상 성공률 '+chance+'% · 합산 목표 '+goal+'</p><div class="production-stats">'+statLabels.map(([key,label])=>'<div><span>'+label+'</span><strong id="production-'+key+'">0 / '+totals[key]+'</strong><div class="production-stat-track"><i id="production-fill-'+key+'"></i></div></div>').join('')+'</div><div class="production-studio" role="img" aria-label="고양이들이 패션 사무실에서 디자인하고 재봉하고 의상을 정리하는 장면"><img data-skeleton src="./assets/production-studio.webp" alt="" decoding="async"></div></div>');
    $('modalTitle').focus();
    const renderProgress=progress=>{
      const eased=1-Math.pow(1-progress,3);
      $('productionPercent').textContent=Math.round(target*eased)+'%';$('productionFill').style.width=target*eased+'%';
      for(const [key] of statLabels){
        $('production-'+key).textContent=Math.round(outcome.rolls[key]*eased)+' / '+totals[key];
        $('production-fill-'+key).style.width=(totals[key]?outcome.rolls[key]/totals[key]*eased*100:0)+'%';
      }
    };
    const reduced=typeof window!=='undefined'&&window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const messageTimer=reduced?null:setInterval(()=>{
      messageIndex=(messageIndex+1+Math.floor(Math.random()*(productionMessages.length-1)))%productionMessages.length;
      $('modalTitle').textContent=productionMessages[messageIndex];
    },700);
    if(reduced)renderProgress(1);
    else {
      const start=performance.now(),duration=1600;
      const tick=now=>{
        if(!isProducing)return;
        const progress=Math.min(1,(now-start)/duration);renderProgress(progress);
        if(progress<1)requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
    setTimeout(()=>{if(messageTimer)clearInterval(messageTimer);isProducing=false;launch(choices,assigned,outcome);},reduced?250:2250);
  };
  const changeCard = (label,delta,previous,unit) => {
    if(label==='자산')delta=roundMoney(delta);
    const direction=delta>0?'up':delta<0?'down':'flat';
    const sign=delta>0?'+':'';
    const amount=(label==='자산'?'₩':'')+sign+(label==='자산'?money(delta):delta)+unit;
    const rate=previous===0?(delta===0?'변화 없음':'첫 변동'):(sign+(delta/previous*100).toFixed(1)+'%');
    const arrow=direction==='up'?'↑':direction==='down'?'↓':'→';
    return '<div class="change-card '+direction+'" aria-label="'+label+' '+amount+', '+rate+'"><span>'+label+'</span><strong><em aria-hidden="true">'+arrow+'</em>'+amount+'</strong><small>'+rate+'</small></div>';
  };
  const celebration = () => '<div class="celebration" aria-hidden="true">'+[
    [-112,-64],[-85,-109],[-34,-116],[21,-108],[81,-103],[116,-58],
    [106,29],[69,83],[14,105],[-48,94],[-101,51],[-122,-8]
  ].map(([x,y],i)=>'<i style="--x:'+x+'px;--y:'+y+'px;--hue:'+[344,35,49,178][i%4]+'"></i>').join('')+'</div>';
  const levelChange = (label,before,after,unit='',deltaUnit=unit,decimals=0) => {
    const format=value=>decimals?value.toFixed(decimals):String(value);
    const delta=Number((after-before).toFixed(decimals));
    return '<div class="level-change"><span>'+label+'</span><div><small>'+format(before)+unit+'</small><em aria-hidden="true">→</em><strong data-level-from="'+before+'" data-level-to="'+after+'" data-level-unit="'+unit+'" data-level-decimals="'+decimals+'">'+format(before)+unit+'</strong><b class="'+(delta<0?'decrease':'increase')+'">'+(delta>0?'+':'')+format(delta)+deltaUnit+'</b></div></div>';
  };
  const levelUpPanel = (title,changes,subtitle) => '<section class="level-up-panel"><div class="level-up-head">'+celebration()+'<span class="level-up-star" aria-hidden="true">✦</span><strong>'+title+'</strong><small>'+subtitle+'</small></div><div class="level-changes">'+changes.join('')+'</div></section>';
  const animateLevelChanges = () => {
    const counters=[...$('modalContent').querySelectorAll('[data-level-from]')];
    const update=progress=>counters.forEach(node=>{
      const from=Number(node.dataset.levelFrom),to=Number(node.dataset.levelTo),decimals=Number(node.dataset.levelDecimals);
      const value=from+(to-from)*progress;
      node.textContent=(decimals?value.toFixed(decimals):Math.round(value))+node.dataset.levelUnit;
    });
    const reduced=typeof window!=='undefined'&&window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reduced){update(1);return;}
    const start=performance.now();
    const tick=now=>{
      if(!counters[0]?.isConnected)return;
      const progress=Math.min(1,(now-start)/750);
      update(1-Math.pow(1-progress,3));
      if(progress<1)requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const launch = (choices,assigned,outcome) => {
    if(!Object.values(assigned).some(Boolean)){toast('직원을 한 명 이상 배정해 주세요.');return;}
    const previous={assets:state.assets,customers:state.customers,research:state.research};
    const trend=trends[state.releases%trends.length];
    const [chance,matches]=successChance(choices,assigned);
    const success=outcome.success;
    const score=Math.max(20,Math.min(100,Math.round(65+(outcome.score/outcome.goal-1)*60+(success?8:-8))));
    const revenue=Math.round(score*(success?1.8:1.12)+state.companyLevel*4);
    const gained=Math.round((score-48)*3.7);
    const points=success?3:2;
    state.assets=roundMoney(state.assets+revenue-38);
    state.customers=Math.max(0,state.customers+gained);
    state.research+=points;
    const chargedInterest=accrueLoanInterest();
    const xpChanges=[];
    for(const w of hiredWorkers()) if(assigned[w.id]){
      const member=state.staff[w.id],before=member.level;
      const beforeStats=employeeStats(w);
      if(member.level<10){
        member.xp++;
        if(member.xp>=member.level*2){member.xp=0;member.level++;}
      }
      xpChanges.push({name:w.name,level:member.level,xp:member.xp,leveled:member.level>before,beforeStats,afterStats:employeeStats(w)});
    }
    const beforeCompanyLevel=state.companyLevel;
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
    const xpReport='<div class="experience-report"><strong>참여 직원 경험치</strong>'+xpChanges.map(w=>'<div><span>'+w.name+'</span><span>'+(w.leveled?'+1 XP · LV.'+w.level+' 달성! · 기본값에 비례해 능력 상승':w.level===10?'최대 레벨':'+1 XP · '+w.xp+'/'+(w.level*2))+'</span></div>').join('')+'</div>';
    const loanReport=chargedInterest?'<div class="report-line">이번 시즌 대출 이자 <strong>+₩'+money(chargedInterest)+'M · 총 상환액 ₩'+money(loanBalance())+'M</strong></div>':'';
    const companyLevelUp=state.companyLevel>beforeCompanyLevel?levelUpPanel('회사 LV.'+state.companyLevel+' 달성!',[
      levelChange('대출 원금 한도',loanLimit(beforeCompanyLevel),loanLimit(state.companyLevel),'M','M'),
      levelChange('시즌 이자율',loanRate(beforeCompanyLevel)*100,loanRate(state.companyLevel)*100,'%','%p',1)
    ],'새로운 금융 혜택이 열렸어요'):'';
    const leveledStaff=xpChanges.filter(w=>w.leveled);
    const staffLevelUp=leveledStaff.length?levelUpPanel('직원 '+leveledStaff.length+'명 레벨업!',leveledStaff.flatMap(w=>[
      '<div class="level-employee-name">'+w.name+' · LV.'+w.level+'</div>',
      ...statLabels.map(([key,label])=>levelChange(label,w.beforeStats[key],w.afterStats[key]))
    ]),'제작 경험으로 능력치가 올랐어요'):'';
    showModal('<span class="modal-kicker">COLLECTION RELEASED · '+trend.season+'</span><h2 id="modalTitle">'+choices.style+' '+choices.item+' 출시</h2><div class="result-hero '+(success?'result-success':'result-failure')+'">'+(success?celebration()+'<div class="result-mark" aria-hidden="true">✦</div><strong>컬렉션 성공!</strong>':'<img data-skeleton class="sad-team" src="./assets/cats-disappointed.webp" alt="디자인·재봉·촬영을 맡은 고양이 직원들이 실망한 표정으로 앉아 있는 모습"><strong>이번 결과는 아쉬워요</strong>')+'</div><div class="report-score">'+score+'</div><p>'+reason+' '+(success?'제작과 판매가 순조로웠습니다.':'제작 결과가 기대치에 미치지 못했습니다.')+'</p><blockquote class="customer-review">'+review+'</blockquote><div class="report-line">예상 성공률 / 결과 <strong>'+chance+'% / '+(success?'성공':'아쉬움')+'</strong></div><div class="report-line">능력 합산 / 성공 목표 <strong>'+outcome.score.toFixed(1)+' / '+outcome.goal+'</strong></div><div class="result-stat-summary">'+statLabels.map(([key,label])=>'<span>'+label+' <strong>'+outcome.rolls[key]+'</strong></span>').join('')+'</div><div class="report-line">매출 / 제작비 <strong>₩'+revenue+'M / ₩38M</strong></div>'+loanReport+'<div class="change-grid">'+changeCard('자산',state.assets-previous.assets,previous.assets,'M')+changeCard('고객',state.customers-previous.customers,previous.customers,'명')+changeCard('연구 포인트',state.research-previous.research,previous.research,'P')+'</div>'+xpReport+(discoveries.length?'<p class="discovery">새 의류 발견: '+discoveries.join(', ')+'</p>':'')+'<p>다음 시즌은 '+trends[state.releases%trends.length].season+'입니다.</p><button class="modal-primary" id="reportDone" type="button">사무실로 돌아가기</button>');
    if(companyLevelUp)$('modalContent').querySelector('.result-hero').insertAdjacentHTML('afterend',companyLevelUp);
    if(staffLevelUp)$('modalContent').querySelector(companyLevelUp?'.level-up-panel':'.result-hero').insertAdjacentHTML('afterend',staffLevelUp);
    if(companyLevelUp||staffLevelUp)animateLevelChanges();
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
      const s=state.staff[w.id];strong.textContent='LV.'+s.level+' · '+statSummary(w)+' · 경험 '+s.xp+'/'+(s.level*2);
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
    showModal('<span class="modal-kicker">STAFF PROFILE</span><h2 id="modalTitle">'+w.name+'</h2><div class="profile-portrait"><img data-skeleton src="./assets/'+w.sprite+'.webp" alt=""></div><div class="report-line">직군 <strong>'+w.role+'</strong></div><div class="report-line">레벨 <strong>LV.'+member.level+' / 10</strong></div><h3 class="stats-heading">직원 능력치</h3>'+staffStatGrid(w)+'<div class="report-line">경험치 <strong>'+member.xp+' / '+(member.level*2)+'</strong></div><p>기본값 8은 레벨마다 +1, 16은 +2처럼 항목별 기본값에 비례해 성장합니다. 제작 시 네 능력을 각각 굴려 합산 결과로 성공을 판단합니다.</p>');
  };
  const pageSize=5;
  const showPager = (page,count,onPage) => {
    const total=Math.ceil(count/pageSize),nav=$('shopPagination');
    nav.replaceChildren();
    const add=(label,target,disabled,active=false)=>{
      const button=document.createElement('button');button.type='button';button.textContent=label;
      button.disabled=disabled;button.className=active?'active':'';
      button.setAttribute('aria-label',typeof target==='number'&&label===String(target+1)?(target+1)+'페이지':label);
      if(active)button.setAttribute('aria-current','page');
      button.onclick=()=>onPage(target);nav.append(button);
    };
    add('이전',page-1,page===0);
    for(let i=0;i<total;i++)add(String(i+1),i,false,i===page);
    add('다음',page+1,page===total-1);
  };
  const addLockIcon = (button,level) => {
    const icon=document.createElement('img');icon.src='./assets/lock.svg';icon.alt='';icon.setAttribute('aria-hidden','true');
    button.classList.add('is-locked');button.setAttribute('aria-label','오피스 LV.'+level+'부터 해금');button.append(icon);
  };
  const showHire = (page=0) => {
    const roster=workers.slice().sort((a,b)=>a.level-b.level);
    page=Math.max(0,Math.min(page,Math.ceil(roster.length/pageSize)-1));
    showModal('<span class="modal-kicker">STAFF RECRUITMENT</span><h2 id="modalTitle">직원 고용</h2><p>오피스 LV.'+state.officeLevel+' · 고용 '+state.hired.length+'/'+employeeCap[state.officeLevel-1]+'명. 채용한 고양이는 사무실에 배치되고 제작에 참여할 수 있어요. 컬렉션 제작비는 별도로 ₩38M이 필요해요.</p><div id="shopRows"></div><nav class="shop-pagination" id="shopPagination" aria-label="직원 목록 페이지"></nav>');
    roster.slice(page*pageSize,(page+1)*pageSize).forEach(w=>{
      const row=document.createElement('div');row.className='shop-row';
      const img=skeletonImage(document.createElement('img'));img.src='./assets/'+w.sprite+'.webp';img.alt='';img.loading='eager';img.decoding='async';img.width=72;img.height=72;
      const body=document.createElement('div');body.className='shop-description';
      const heading=document.createElement('strong');heading.textContent=w.name+' · '+w.role;
      const detail=document.createElement('small');detail.textContent=statSummary(w);
      const unlock=document.createElement('small');unlock.textContent='오피스 LV.'+w.level+'부터';
      body.append(heading,detail,unlock);
      const button=document.createElement('button');button.type='button';
      const owned=state.hired.includes(w.id),locked=state.officeLevel<w.level,full=state.hired.length>=employeeCap[state.officeLevel-1],affordable=state.assets>=w.cost;
      button.textContent=owned?'고용됨':locked?'잠김':full?'정원 마감':!affordable?'자산 부족':'₩'+w.cost+'M 고용';
      button.disabled=owned||locked||full||!affordable;
      if(locked)addLockIcon(button,w.level);
      button.onclick=()=>{
        state.assets-=w.cost;state.hired.push(w.id);state.staff[w.id]={level:1,xp:0};
        const cell=firstFreeCell();if(cell)state.placed.push({id:w.id,...cell});
        save();render();showHire(page);toast(w.name+' 고용 완료!');
      };
      row.append(img,body,button);$('shopRows').append(row);
    });
    showPager(page,roster.length,showHire);
  };
  const showFurniture = (page=0) => {
    page=Math.max(0,Math.min(page,Math.ceil(furniture.length/pageSize)-1));
    showModal('<span class="modal-kicker">FURNITURE SHOP</span><h2 id="modalTitle">가구 구매</h2><p>오피스 LV.'+state.officeLevel+' · 보유 가구 '+state.ownedFurniture.length+'/'+furnitureCap[state.officeLevel-1]+'개. 구매한 가구는 배치 수정에서 옮길 수 있어요. 컬렉션 제작비는 별도로 ₩38M이 필요해요.</p><div id="shopRows"></div><nav class="shop-pagination" id="shopPagination" aria-label="가구 목록 페이지"></nav>');
    furniture.slice(page*pageSize,(page+1)*pageSize).forEach(f=>{
      const row=document.createElement('div');row.className='shop-row';
      const img=skeletonImage(document.createElement('img'));img.src='./assets/'+f.sprite+'.webp';img.alt='';img.loading='eager';img.decoding='async';img.width=72;img.height=72;
      const body=document.createElement('div');body.className='shop-description';
      const heading=document.createElement('strong');heading.textContent=f.name;
      const detail=document.createElement('small');detail.textContent='오피스 LV.'+f.level+'부터 · 배치 보너스 없음';
      body.append(heading,detail);
      const button=document.createElement('button');button.type='button';
      const locked=state.officeLevel<f.level,full=state.ownedFurniture.length>=furnitureCap[state.officeLevel-1];
      const price=furniturePrice[f.id];
      const affordable=state.assets>=price;
      button.textContent=locked?'잠김':full?'배치 한도':!affordable?'자산 부족':'₩'+price+'M 구매';
      button.disabled=locked||full||!affordable;
      if(locked)addLockIcon(button,f.level);
      button.onclick=()=>{
        const id=f.id+'-'+(state.ownedFurniture.length+1);
        state.assets-=price;state.ownedFurniture.push({id,kind:f.id});
        const cell=firstFreeCell();if(cell)state.placed.push({id,...cell});
        save();render();showFurniture(page);toast(f.name+' 구매 완료!');
      };
      row.append(img,body,button);$('shopRows').append(row);
    });
    showPager(page,furniture.length,showFurniture);
  };
  const menu = $('gameMenu'),toggle = $('menuToggle');
  const setMenu = open => {menu.hidden=!open;toggle.setAttribute('aria-expanded',String(open));};
  toggle.onclick=()=>setMenu(menu.hidden);
  toggle.addEventListener('mouseenter',()=>setMenu(true));
  menu.addEventListener('mouseleave',()=>setMenu(false));
  document.addEventListener('click',event=>{if(!menu.contains(event.target)&&event.target!==toggle)setMenu(false);});
  $('menuHire').onclick=()=>{setMenu(false);showHire(0);};
  $('menuFurniture').onclick=()=>{setMenu(false);showFurniture(0);};
  $('menuLoan').onclick=()=>{setMenu(false);showLoan();};
  $('officeRepayButton').onclick=()=>showLoan(true);
  $('menuAccount').onclick=()=>{setMenu(false);showAccount();};
  $('menuSave').onclick=()=>{setMenu(false);showSaveInfo();};
  $('startSignIn').onclick=()=>showAccount();
  $('startForm').addEventListener('submit',event=>{
    event.preventDefault();
    const name=$('companyNameInput').value.trim();
    if(!name)return;
    if(document.activeElement && document.activeElement.blur)document.activeElement.blur();
    state.companyName=name.slice(0,20);$('startLayer').hidden=true;save();render();
    const resetStartScroll=()=>{if(typeof window.scrollTo==='function')window.scrollTo(0,0);};
    resetStartScroll();
    setTimeout(resetStartScroll,550);
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
      const beforeLevel=state.officeLevel,oldN=gridSize();state.assets-=price;state.officeLevel=next;
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
      save();render();
      const changes=[
        levelChange('고용 가능 직원',employeeCap[beforeLevel-1],employeeCap[next-1],'명'),
        levelChange('배치 가능 가구',furnitureCap[beforeLevel-1],furnitureCap[next-1],'개')
      ];
      if(newN!==oldN)changes.push(levelChange('사무실 배치 칸',oldN*oldN,newN*newN,'칸'));
      if(next===4||next===8)changes.push('<div class="level-change level-art-change"><span>사무실 이미지</span><strong>새 사무실 배경 등장 ✨</strong></div>');
      showModal('<span class="modal-kicker">OFFICE LEVEL UP</span><h2 id="modalTitle">사무실 확장 완료!</h2>'+levelUpPanel('오피스 LV.'+next+' 달성!',changes,offices[next-1])+'<button class="modal-primary" id="levelUpDone" type="button">사무실로 돌아가기</button>');
      animateLevelChanges();$('levelUpDone').onclick=closeModal;
    };
  };
  const showOfficeInfo = () => {
    const level=state.officeLevel,top=level===10;
    showModal('<span class="modal-kicker">MY ATELIER · YEAR '+(1+Math.floor(state.releases/4))+'</span><h2 id="modalTitle">'+offices[level-1]+'</h2><p>오피스 LV. '+level+' / 10</p><div class="office-detail-grid"><div><span>직원 수용</span><strong>'+state.hired.length+' / '+employeeCap[level-1]+'명</strong></div><div><span>가구 배치</span><strong>'+state.ownedFurniture.length+' / '+furnitureCap[level-1]+'개</strong></div><div><span>컬렉션 출시</span><strong>'+state.releases+'회</strong></div><div><span>연구 포인트</span><strong>'+state.research+'P</strong></div></div><p class="office-upgrade-note">'+(top?'최고 레벨의 오피스입니다.':'다음 확장: ₩'+upgradePrice(level)+'M · 컬렉션 '+level+'회 출시 필요 · 확장 후 제작비 ₩38M 유지')+'</p>'+(top?'':'<button class="modal-primary" id="upgradeButton" type="button">오피스 확장하기</button>'));
    if(!top)$('upgradeButton').onclick=showUpgrade;
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
    setHint('배치를 저장했어요.');toast(window.atelierCloud?.isSignedIn()?'배치를 계정에 저장하고 있어요.':state.localSave?'배치를 이 기기에 저장했어요.':'이번 플레이의 배치를 적용했어요.');
  };
  $('editButton').onclick=()=>{
    setMenu(false);
    if(editMode){cancelLayout();return;}
    layoutSnapshot=state.placed.map(p=>({...p}));editMode=true;selected=null;render();
    setHint('가구나 직원을 끌어 옮긴 뒤 오른쪽 아래에서 배치를 저장하세요.');
  };
  $('doneButton').onclick=cancelLayout;
  $('officeInfoButton').onclick=showOfficeInfo;
  $('researchButton').onclick=()=>{setMenu(false);showResearch();};
  $('launchButton').onclick=()=>editMode?saveLayout():showLaunch();
  $('modalClose').onclick=closeModal;
  $('modalLayer').addEventListener('click',event=>{if(event.target===$('modalLayer'))closeModal();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!$('modalLayer').hidden)closeModal();});
  render();
})();
