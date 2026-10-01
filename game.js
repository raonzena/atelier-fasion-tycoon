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
    {id:'longRack',name:'긴 의류 행거',sprite:'prop-long-rack',level:1,type:'furniture',spanX:3,bonus:{efficiency:2}},
    {id:'computerDesk',name:'컴퓨터 책상',sprite:'prop-computer-desk',level:2,type:'furniture',spanX:2,bonus:{design:2,trend:1}},
    {id:'mannequin',name:'마네킹',sprite:'prop-mannequin',level:1,type:'furniture',bonus:{sewing:2}},
    {id:'breakroom',name:'탕비실',sprite:'prop-breakroom',level:2,type:'furniture',spanX:2,bonus:{efficiency:2}},
    {id:'fridge',name:'냉장고',sprite:'prop-fridge',level:2,type:'furniture',bonus:{efficiency:1}},
    {id:'largePhoto',name:'확장 촬영 공간',sprite:'prop-large-photo',level:4,type:'furniture',spanX:2,bonus:{design:1,trend:2}},
    {id:'fabricSamples',name:'원단 샘플 수납장',sprite:'prop-fabric-samples',level:3,type:'furniture',bonus:{design:1,sewing:1}},
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
  const furnitureTilt = {designDesk:14,sewingDesk:17,rack:22,photo:15,moodboard:15,lounge:15,longRack:22,computerDesk:18,mannequin:0,breakroom:13,fridge:18,largePhoto:16,fabricSamples:20};
  const skeletonImage = img => {
    img.setAttribute('data-skeleton','');
    const finish = () => img.classList.add('image-ready');
    img.addEventListener('load',finish,{once:true});
    img.addEventListener('error',finish,{once:true});
    return img;
  };
  const warmArtwork = () => {
    if (typeof Image === 'undefined') return;
    const paths = ['office-mid.webp','office-high.webp','cats-disappointed.webp','production-studio.webp','fashion-week.webp','fashion-week-summer.webp','fashion-week-autumn.webp','fashion-week-winter.webp'];
    for (const name of paths) { const preview = new Image(); preview.src = './assets/' + name; }
  };
  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('load', () => {
      if ('requestIdleCallback' in window) window.requestIdleCallback(warmArtwork, {timeout:5000});
      else setTimeout(warmArtwork, 1200);
    }, {once:true});
  }
  // Each larger office layout adds staff capacity on top of its level.
  const OFFICE_MAX=12,COMPANY_MAX=12;
  const employeeCap = Array.from({length:OFFICE_MAX},(_,index)=>{
    const level=index+1;
    return level+(level>=8?3:level>=4?2:1);
  });
  const furnitureCap = [2,3,4,5,6,7,8,9,10,11,12,13];
  const furniturePrice = {designDesk:18,sewingDesk:22,rack:16,photo:30,moodboard:26,lounge:36,longRack:28,computerDesk:42,mannequin:24,breakroom:32,fridge:20,largePhoto:62,fabricSamples:38};
  const offices = ['낡은 원룸 사무실','정돈된 작업실','첫 번째 스튜디오','창가 작업실','성장하는 아틀리에','넓어진 디자인실','브랜드 본사','도심 패션 스튜디오','프리미엄 오피스','글로벌 패션 하우스','국제 컬렉션 스튜디오','월드 아틀리에'];
  const gridSizes=[3,4,4,5,5,6,6,7,7,8,8,8];
  const bounds=gridSizes.map(n=>[0,n-1,0,n-1]);
  const gridSize=()=>gridSizes[state.officeLevel-1];
  const officeArtworkWidth=level=>58+(level-1)*42/(OFFICE_MAX-1);
  // The painted room is slightly asymmetric: the left and right floor edges
  // have different slopes. Keep drawing and pointer hit-testing on one basis.
  const FLOOR_ORIGIN={left:54,top:28};
  const FLOOR_RIGHT={left:38,top:29};
  const FLOOR_LEFT={left:-44,top:29.5};
  const FLOOR_CONTACT_TOP=2;
  const floorPoint=(u,v)=>({
    left:FLOOR_ORIGIN.left+FLOOR_RIGHT.left*u+FLOOR_LEFT.left*v,
    top:FLOOR_ORIGIN.top+FLOOR_RIGHT.top*u+FLOOR_LEFT.top*v
  });
  const footprintCenter = (x,y,span=1) => {
    const n=gridSize(),u=(x+span/2)/n,v=(y+.5)/n;
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
  const fashionWeekArtwork = season => 'fashion-week'+({여름:'-summer',가을:'-autumn',겨울:'-winter'}[season]||'')+'.webp';
  const baseCategories = ['티셔츠','셔츠','바지','원피스','아우터'];
  const styles = ['미니멀','스트리트','클래식','러블리','아웃도어'];
  const targets = ['20대 직장인','10대 학생','아웃도어 고객'];
  const initial = () => ({
    layoutVersion:5,companyName:'',officeLevel:1,companyLevel:1,assets:180,customers:0,releases:0,monthsElapsed:0,localSave:false,
    research:0,unlocks:[],researchTasks:[],staff:{},hired:[],ownedFurniture:[],history:[],placed:[],loan:{principal:0,interestDue:0}
  });
  let state = initial();
  const hydrate = saved => {
    if(saved && saved.officeLevel >= 1 && saved.officeLevel <= OFFICE_MAX && Array.isArray(saved.placed)) {
      const loaded = {...initial(),...saved,localSave:true};
      // Before the calendar change, every release advanced one full season.
      loaded.monthsElapsed=Number.isInteger(saved.monthsElapsed)&&saved.monthsElapsed>=0?saved.monthsElapsed:saved.releases*3;
      loaded.companyLevel=Math.min(COMPANY_MAX,1+Math.floor(loaded.releases/2));
      loaded.staff = saved.staff || {};
      loaded.unlocks = Array.isArray(saved.unlocks) ? saved.unlocks : [];
      loaded.researchTasks = Array.isArray(saved.researchTasks) ? saved.researchTasks.filter(task=>
        task&&typeof task.id==='string'&&Number.isInteger(task.finishMonth)&&task.finishMonth>loaded.monthsElapsed&&!loaded.unlocks.includes(task.id)
      ) : [];
      loaded.history = Array.isArray(saved.history) ? saved.history : [];
      loaded.hired = Array.isArray(saved.hired) ? saved.hired : workers.filter(w => saved.placed.some(p => p.id===w.id)).map(w => w.id);
      loaded.ownedFurniture = Array.isArray(saved.ownedFurniture) ? saved.ownedFurniture : saved.placed.filter(p => furniture.some(f => f.id===p.id)).map(p => ({id:p.id,kind:p.id}));
      loaded.loan = {
        principal:Number.isFinite(saved.loan?.principal)?Math.max(0,saved.loan.principal):0,
        interestDue:Number.isFinite(saved.loan?.interestDue)?Math.max(0,saved.loan.interestDue):0
      };
      for(const id of loaded.hired) loaded.staff[id] = loaded.staff[id] || {level:1,xp:0};
      if(saved.layoutVersion!==3&&saved.layoutVersion!==4&&saved.layoutVersion!==5){
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
      }
      if(saved.layoutVersion!==5){
        const n=gridSizes[loaded.officeLevel-1],remapped=[];
        const width=id=>{
          const kind=loaded.ownedFurniture.find(o=>o.id===id)?.kind||id;
          return furniture.find(f=>f.id===kind)?.spanX||1;
        };
        const fits=(id,x,y)=>x>=0&&y>=0&&x+width(id)<=n&&y<n&&remapped.every(p=>y!==p.y||x+width(id)<=p.x||p.x+width(p.id)<=x);
        for(const piece of loaded.placed){
          let {x,y}=piece;
          if(!fits(piece.id,x,y)){
            const free=Array.from({length:n*n},(_,i)=>({x:i%n,y:Math.floor(i/n)})).find(cell=>fits(piece.id,cell.x,cell.y));
            if(!free)continue;
            ({x,y}=free);
          }
          remapped.push({...piece,x,y});
        }
        loaded.placed=remapped;
        loaded.layoutVersion=5;
      }
      return loaded;
    }
    return initial();
  };
  try { state=hydrate(JSON.parse(localStorage.getItem('atelier-device-save') || 'null')); } catch {}
  let editMode = false, selected = null, toastTimer, layoutSnapshot=null, isProducing=false,dragTargetTiles=[],eventVenueActive=false,eventVenueSeason=null;
  const currentMonth=()=>((2+state.monthsElapsed)%12)+1;
  const calendarYear=()=>1+Math.floor((2+state.monthsElapsed)/12);
  const currentTrend=()=>trends[(Math.floor(state.monthsElapsed/3)%4)+4*(Math.floor(state.monthsElapsed/12)%2)];
  const isFashionWeekMonth=()=>((state.monthsElapsed+1)%4===0);
  const MAX_PRODUCTION_STAFF=4,MAX_YEARLY_PRODUCTIONS=5;
  const participationCount=(id,year=calendarYear())=>{
    const member=state.staff[id];
    return member?.productionYear===year?Math.min(MAX_YEARLY_PRODUCTIONS,Math.max(0,member.productionCount||0)):0;
  };
  const remainingParticipations=id=>MAX_YEARLY_PRODUCTIONS-participationCount(id);
  const officeRequiredReleases=level=>level*2;
  const definition = id => items.find(i => i.id === id) || furniture.find(i => state.ownedFurniture.some(o => o.id === id && o.kind === i.id));
  const itemName = id => {const d=definition(id);return d ? d.name : '알 수 없는 물건';};
  const hiredWorkers = () => workers.filter(w => state.hired.includes(w.id));
  const hiringCost = w => w.cost/2;
  const monthlyPayroll = () => roundMoney(hiredWorkers().reduce((total,w)=>total+hiringCost(w),0));
  const ownedItems = () => state.ownedFurniture.map(o => ({...definition(o.id),id:o.id})).concat(hiredWorkers());
  const placed = id => state.placed.find(i => i.id === id);
  const has = key => state.unlocks.includes(key);
  const isUnlocked = (x,y) => {
    const b = bounds[state.officeLevel-1];
    return x >= b[0] && x <= b[1] && y >= b[2] && y <= b[3];
  };
  const footprint = id => definition(id)?.spanX||1;
  const cellsFor = (id,x,y) => Array.from({length:footprint(id)},(_,offset)=>({x:x+offset,y}));
  const occupied = (x,y,except,placements=state.placed) => placements.some(p => p.id !== except && cellsFor(p.id,p.x,p.y).some(cell=>cell.x===x&&cell.y===y));
  const canPlace = (id,x,y,placements=state.placed,n=gridSize()) => cellsFor(id,x,y).every(cell=>cell.x>=0&&cell.x<n&&cell.y>=0&&cell.y<n&&!occupied(cell.x,cell.y,id,placements));
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
    for(const tile of dragTargetTiles)tile.classList.remove('drag-target','drag-invalid');
    dragTargetTiles=[];
  };
  const move = (id,x,y) => {
    if(!cellsFor(id,x,y).every(cell=>isUnlocked(cell.x,cell.y))){toast('가구가 차지하는 모든 칸이 필요해요. 오피스를 확장하거나 다른 칸에 놓아주세요.');return false;}
    if(!canPlace(id,x,y)){toast('가구가 차지할 칸에 다른 가구나 직원이 있어요.');return false;}
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
      button.className='piece '+d.type+(editMode&&selected===p.id?' selected':'');
      button.setAttribute('aria-label',d.name+' · '+(p.x+1)+'열 '+(p.y+1)+'행. '+(editMode?'끌거나 선택 후 빈 칸을 터치해 이동':'선택해 정보 보기'));
      if(d.spanX>1)button.classList.add('wide-furniture');
      if(d.type==='furniture'){
        button.classList.add('kind-'+d.id);
        button.style.setProperty('--furniture-tilt',(furnitureTilt[d.id]||0)+'deg');
        if(d.id==='longRack')button.style.setProperty('--rack-width',(FLOOR_RIGHT.left*d.spanX/gridSize()/1.2)+'%');
      }
      const center=footprintCenter(p.x,p.y,d.spanX||1);
      button.style.left=center.left+'%';
      // Artwork contact points read a little high against the painted diamonds.
      button.style.top=(center.top+FLOOR_CONTACT_TOP)+'%';
      button.style.zIndex=5+p.x+p.y;
      const img=skeletonImage(document.createElement('img'));img.src='./assets/'+d.sprite+'.webp';img.alt='';img.draggable=false;
      const label=document.createElement('span');label.className='piece-label';label.textContent=d.name;
      button.append(img,label);
      let dragStart=null, dragged=false;
      button.addEventListener('pointerdown',event=>{
        if(!editMode)return;
        dragStart={x:event.clientX,y:event.clientY,cell:positionFromPointer(event),origin:{x:p.x,y:p.y}};
        button.setPointerCapture(event.pointerId);
      });
      button.addEventListener('pointermove',event=>{
        if(!dragStart)return;
        const dx=event.clientX-dragStart.x,dy=event.clientY-dragStart.y;
        if(Math.hypot(dx,dy)>5){
          button.style.transform='translate(-50%,-50%) translate('+dx+'px,'+dy+'px)';
          const cell=positionFromPointer(event),pos={x:dragStart.origin.x+cell.x-dragStart.cell.x,y:dragStart.origin.y+cell.y-dragStart.cell.y};
          clearDragTarget();
          dragTargetTiles=cellsFor(p.id,pos.x,pos.y).map(cell=>tileByCell.get(cell.x+','+cell.y)).filter(Boolean);
          const valid=canPlace(p.id,pos.x,pos.y);
          for(const tile of dragTargetTiles){
            tile.classList.add('drag-target');tile.classList.toggle('drag-invalid',!valid);
          }
        }
      });
      button.addEventListener('pointercancel',()=>{dragStart=null;button.style.transform='';clearDragTarget();});
      button.addEventListener('pointerup',event=>{
        if(!dragStart)return;
        const distance=Math.hypot(event.clientX-dragStart.x,event.clientY-dragStart.y);
        const cell=positionFromPointer(event),pos={x:dragStart.origin.x+cell.x-dragStart.cell.x,y:dragStart.origin.y+cell.y-dragStart.cell.y};
        dragStart=null;button.style.transform='';clearDragTarget();
        if(distance>9){
          dragged=true;move(p.id,pos.x,pos.y);
          setTimeout(()=>{dragged=false;},100);
        }
      });
      button.addEventListener('click',()=>{
        if(dragged)return;
        if(editMode){selected=p.id;renderFloor();renderInventory();setHint(d.name+' 선택됨 · 원하는 빈 칸을 터치하거나 끌어서 옮기세요');}
        else if(d.type==='worker')showWorkerProfile(d.id);else setHint(d.name+' · '+furnitureDescription(d)+' · 배치 수정을 눌러 옮길 수 있어요.');
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
      const badge=document.createElement('small');badge.textContent=(d.spanX>1?'가로 '+d.spanX+'칸 · ':'')+(placed(d.id)?'배치됨':'미배치');button.append(badge);
      button.addEventListener('click',()=>{
        selected=d.id;renderInventory();renderFloor();
        setHint(placed(d.id)?d.name+'을 끌거나 빈 칸을 터치해 이동하세요':d.name+'을 놓을 빈 칸을 터치하세요');
      });
      $('inventoryItems').append(button);
    });
    if(!ownedItems().length)$('inventoryItems').textContent='직원을 고용하거나 가구를 구매하면 이곳에서 배치할 수 있어요.';
  };
  const render = () => {
    $('companyLevel').textContent=state.companyLevel>=COMPANY_MAX?'Max':state.companyLevel;
    $('assetValue').textContent='₩'+money(state.assets)+'M';
    $('customerValue').textContent=state.customers.toLocaleString()+'명';
    $('officeTitle').textContent=offices[state.officeLevel-1];
    $('officeLevel').textContent='오피스 LV. '+state.officeLevel+' / '+OFFICE_MAX;
    $('nextPayroll').textContent='₩'+money(monthlyPayroll())+'M';
    const debt=loanBalance();
    $('officeLoan').hidden=debt===0;
    if(debt){
      $('officeLoanBalance').textContent='₩'+money(debt)+'M';
      $('officeLoanRate').textContent=(loanRate(state.companyLevel)*100).toFixed(1)+'%';
    }
    $('year').textContent=calendarYear();
    $('month').textContent=currentMonth();
    const trend=currentTrend();
    $('season').textContent=trend.season;
    $('trend').textContent='트렌드 · '+trend.style+' '+trend.item;
    $('eventNotice').hidden=!isFashionWeekMonth();
    const worldWidth=officeArtworkWidth(state.officeLevel);
    $('roomWorld').style.width=worldWidth+'%';
    // The painted office expands, but sprites and their hit targets keep the same screen size.
    $('roomWorld').style.setProperty('--piece-size',700/worldWidth+'%');
    $('roomWorld').style.setProperty('--piece-size-mobile',840/worldWidth+'%');
    const backdrop=$('roomBackdrop');
    const artwork=eventVenueActive?fashionWeekArtwork(eventVenueSeason||trend.season):(state.officeLevel<4?'office-pastel':state.officeLevel<8?'office-mid':'office-high')+'.webp';
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
    $('scene').classList.toggle('fashion-week-mode',eventVenueActive);
    $('scene').setAttribute('aria-label',eventVenueActive?'패션위크 런웨이 행사장':'배치 가능한 회사 사무실');
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
  let pendingLevelUp=null;
  let returningToOffice=false;
  const returnToOffice = async () => {
    if(returningToOffice)return;
    returningToOffice=true;
    const layer=$('officeReturnLayer');
    layer.hidden=false;
    requestAnimationFrame(()=>layer.classList.add('visible'));
    await new Promise(resolve=>setTimeout(resolve,180));
    $('modalLayer').hidden=true;$('modalContent').replaceChildren();
    const artwork=(state.officeLevel<4?'office-pastel':state.officeLevel<8?'office-mid':'office-high')+'.webp';
    const image=new Image();
    image.src='./assets/'+artwork;
    const ready=typeof image.decode==='function'?image.decode().catch(()=>{}):new Promise(resolve=>{
      image.onload=image.onerror=resolve;
      if(image.complete)resolve();
    });
    await Promise.all([
      new Promise(resolve=>setTimeout(resolve,500)),
      Promise.race([ready,new Promise(resolve=>setTimeout(resolve,1600))])
    ]);
    eventVenueActive=false;eventVenueSeason=null;render();
    requestAnimationFrame(()=>layer.classList.remove('visible'));
    setTimeout(()=>{layer.hidden=true;returningToOffice=false;},300);
  };
  const closeModal = () => {
    if(isProducing||returningToOffice)return;
    if(accountChoiceResolve){accountChoiceResolve(null);accountChoiceResolve=null;}
    if(pendingLevelUp){
      const details=pendingLevelUp;
      pendingLevelUp=null;
      showModal('<span class="modal-kicker">LEVEL UP</span><h2 id="modalTitle" tabindex="-1">새로운 레벨업 정보</h2>'+details+'<button class="modal-primary" id="levelUpDone" type="button">사무실로 돌아가기</button>');
      animateLevelChanges();
      $('levelUpDone').onclick=closeModal;
      $('modalTitle').focus();
      return;
    }
    if(eventVenueActive){void returnToOffice();return;}
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
    $('modalLayer').hidden=false;
    $('modalLayer').querySelector('.modal-card').scrollTop=0;
    $('modalClose').hidden=isProducing;if(!isProducing)$('modalClose').focus();
  };
  const showSaveInfo = () => {
    if(window.atelierCloud?.isSignedIn()){showAccount();return;}
    showModal('<span class="modal-kicker">PLAY DATA</span><h2 id="modalTitle">진행 내용 저장</h2><p>계정으로 로그인하면 다른 기기에서도 이어할 수 있어요. 게스트 플레이는 아래에서 이 브라우저에 저장할 수 있습니다.</p><button class="modal-primary" id="openAccount" type="button">로그인 · 회원가입</button><button class="account-secondary" id="enableSave" type="button">'+(state.localSave?'지금 이 기기에 저장':'이 기기에 저장 시작')+'</button>');
    $('openAccount').onclick=()=>showAccount();
    $('enableSave').onclick=()=>{state.localSave=true;save();render();closeModal();toast('이 기기의 브라우저에 진행 내용이 저장됩니다.');};
  };
  const showAccount = async (mode='login') => {
    const cloud=window.atelierCloud;
    if(cloud?.ready)try{await cloud.ready();}catch{}
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
    showModal('<span class="modal-kicker">ATELIER ACCOUNT</span><h2 id="modalTitle">'+(signup?'회원가입':'로그인')+'</h2><p>계정에 진행 내용을 저장하고 다른 기기에서 이어하세요.</p><div class="account-tabs"><button type="button" id="loginTab" class="'+(signup?'':'active')+'">로그인</button><button type="button" id="signupTab" class="'+(signup?'active':'')+'">회원가입</button></div><form id="accountForm" class="account-form"><label for="accountEmailInput">이메일</label><input id="accountEmailInput" type="email" autocomplete="email" required><label for="accountPassword">비밀번호</label><input id="accountPassword" type="password" minlength="6" autocomplete="'+(signup?'new-password':'current-password')+'" required><p class="account-error" id="accountError" role="alert"></p><button class="modal-primary" type="submit">'+(signup?'이메일로 가입':'이메일로 로그인')+'</button></form>'+(cloud.isGoogleEnabled()?'<button class="account-google" id="googleSignIn" type="button">Google 계정으로 계속하기</button>':'')+(signup?'':'<button class="account-link" id="resetPassword" type="button">비밀번호 재설정</button>'));
    $('loginTab').onclick=()=>showAccount('login');$('signupTab').onclick=()=>showAccount('signup');
    const report=error=>{$('accountError').textContent=cloud.errorMessage(error);$('accountForm').querySelector('button[type="submit"]').disabled=false;if($('googleSignIn'))$('googleSignIn').disabled=false;};
    $('accountForm').onsubmit=async event=>{
      event.preventDefault();const button=event.currentTarget.querySelector('button[type="submit"]');button.disabled=true;$('accountError').textContent='';
      try{await (signup?cloud.signUp:cloud.signIn)($('accountEmailInput').value.trim(),$('accountPassword').value);}catch(error){report(error);}
    };
    if($('googleSignIn'))$('googleSignIn').onclick=async()=>{$('googleSignIn').disabled=true;$('accountError').textContent='';try{await cloud.signInGoogle();}catch(error){report(error);}};
    if(!signup)$('resetPassword').onclick=async()=>{
      const email=$('accountEmailInput').value.trim();if(!email){$('accountError').textContent='이메일을 먼저 입력해 주세요.';return;}
      try{await cloud.resetPassword(email);$('accountError').textContent='재설정 메일을 보냈어요. 메일함을 확인해 주세요.';}catch(error){report(error);}
    };
  };
  let startupRevealed=false;
  const finishStartup = (holdStart=false) => {
    if(!holdStart){
      const linked=Boolean(window.atelierCloud?.isSignedIn());
      $('startLayer').hidden=Boolean(state.companyName);
      $('startTitle').textContent=linked?'회사 이름을 정해 주세요':'나만의 패션 회사를 시작해요';
      $('startDescription').textContent=linked?'고객 0명, 빈 사무실에서 시작하고 진행 내용은 계정에 저장됩니다.':'고객 0명, 빈 사무실에서 시작합니다. 게스트 플레이는 화면을 나가면 초기화돼요.';
      $('startSignIn').hidden=linked;
    }
    if(startupRevealed)return;
    startupRevealed=true;
    const loading=$('initialLoading');
    loading.setAttribute('aria-busy','false');
    loading.classList.add('finished');
    setTimeout(()=>{loading.hidden=true;},240);
    if(typeof window.scrollTo==='function')window.scrollTo(0,0);
  };
  window.atelierGameBridge={
    finishStartup,
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
    showModal('<span class="modal-kicker">ATELIER FINANCE</span><h2 id="modalTitle">대출 관리</h2><p>회사 LV.'+state.companyLevel+' · 컬렉션을 출시할 때마다 남은 원금에 월 이자가 붙습니다. 미납 이자에는 이자가 붙지 않아요.</p><div class="loan-summary"><div><span>원금 한도</span><strong>₩'+money(limit)+'M</strong></div><div><span>현재 월 이자율</span><strong>'+ (loanRate(state.companyLevel)*100).toFixed(1)+'%</strong></div><div><span>남은 원금</span><strong>₩'+money(state.loan.principal)+'M</strong></div><div><span>미납 이자</span><strong>₩'+money(state.loan.interestDue)+'M</strong></div><div><span>총 상환액</span><strong>₩'+money(balance)+'M</strong></div><div><span>추가 대출 가능</span><strong>₩'+money(available)+'M</strong></div></div><p class="loan-note">회사 레벨마다 한도 +₩40M, 월 이자율 −0.5%p · 중간 상환은 이자부터 차감됩니다. 다음 출시에는 현재 회사 레벨의 이자율이 적용돼요.</p><form id="borrowForm" class="loan-form"><label for="borrowAmount">대출 금액 (₩M)</label><div><input id="borrowAmount" type="number" min="1" max="'+available+'" step="1" inputmode="numeric" required placeholder="1 ~ '+available+'" '+(available?'':'disabled')+'><button type="submit" '+(available?'':'disabled')+'>대출하기</button></div></form><form id="repayForm" class="loan-form"><label for="repayAmount">중간 상환 금액 (₩M)</label><div><input id="repayAmount" type="number" min="0.1" max="'+repayMax+'" step="0.1" inputmode="decimal" required placeholder="최대 '+money(repayMax)+'" '+(repayMax>=.1?'':'disabled')+'><button type="submit" '+(repayMax>=.1?'':'disabled')+'>일부 상환</button></div></form><button id="repayAll" class="loan-repay-all" type="button" '+(balance>0&&state.assets>=balance?'':'disabled')+'>전액 상환 · ₩'+money(balance)+'M</button>');
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
  const unlockedOptions=category=>researchProjects[category].filter(project=>has(project.id)).flatMap(project=>project.options||[]);
  const availableItems = () => baseCategories.concat(has('hoodie')?['후드티']:[],has('bag')?['가방']:[],unlockedOptions('의류'));
  const availableMaterials = () => ['면'].concat(unlockedOptions('소재'));
  const availableStyles = () => styles.concat(unlockedOptions('스타일'));
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
  const furnitureDescription = item => (item.spanX>1?'가로 '+item.spanX+'칸':'1칸')+' · '+(item.bonus?'배치 시 '+statLabels.filter(([key])=>item.bonus[key]).map(([key,label])=>label+' +'+item.bonus[key]).join(' · '):'배치 보너스 없음');
  const staffStatGrid = w => {
    const base=baseStats(w),bonus=levelBonus(w);
    const current=employeeStats(w);
    return '<div class="staff-stat-grid">'+statLabels.map(([key,label])=>'<div><span>'+label+'</span><strong>'+current[key]+'</strong><small>기본 '+base[key]+(bonus?' +'+statGrowth(base[key])*bonus:'')+'</small></div>').join('')+'</div>';
  };
  const statWeights = {design:.3,sewing:.3,trend:.2,efficiency:.2};
  const weightedStats = stats => statLabels.reduce((sum,[key])=>sum+stats[key]*statWeights[key],0);
  const furnitureBonuses = () => {
    const bonuses=Object.fromEntries(statLabels.map(([key])=>[key,0]));
    for(const piece of state.placed){
      const owned=state.ownedFurniture.find(item=>item.id===piece.id);
      const item=owned&&furniture.find(f=>f.id===owned.kind);
      if(item?.bonus)for(const [key,value] of Object.entries(item.bonus))bonuses[key]+=value;
    }
    return bonuses;
  };
  const teamStats = (assigned,base=false) => {
    const totals=Object.fromEntries(statLabels.map(([key])=>[key,0]));
    let participants=0;
    for(const w of hiredWorkers()) if(assigned[w.id]){
      participants++;
      const stats=base?baseStats(w):employeeStats(w);
      for(const [key] of statLabels) totals[key]+=stats[key];
    }
    if(participants){const bonuses=furnitureBonuses();for(const [key] of statLabels)totals[key]+=bonuses[key];}
    return totals;
  };
  const rollStats = (assigned,random=Math.random) => {
    const rolls=Object.fromEntries(statLabels.map(([key])=>[key,0]));
    let participants=0;
    for(const w of hiredWorkers()) if(assigned[w.id]){
      participants++;
      const stats=employeeStats(w);
      for(const [key] of statLabels) rolls[key]+=Math.round(stats[key]*(0.2+random()*0.8));
    }
    if(participants){const bonuses=furnitureBonuses();for(const [key] of statLabels)rolls[key]+=bonuses[key];}
    return rolls;
  };
  const researchDiscount=choices=>Number(unlockedOptions('의류').includes(choices.item))+
    Number(unlockedOptions('스타일').includes(choices.style))+
    Number(has('patternResearch')&&['셔츠','바지'].includes(choices.item))+
    Number(has('silhouetteResearch')&&['원피스','아우터'].includes(choices.item))+
    Number(has('trendResearch')&&choices.style===currentTrend().style)+
    Number(has('styleResearch')&&choices.style!==currentTrend().style)+
    Number(has('customerResearch')&&choices.target===currentTrend().target)+
    Number(has('audienceResearch')&&choices.target!==currentTrend().target);
  const collectionGoal = (totals,matches,material,choices) => Math.max(1,Math.ceil(weightedStats(totals)*.45+3.5-matches*.65-(material?1:0)-researchDiscount(choices)));
  const materialMatch=(choices,trend)=>
    choices.material==='리넨'&&trend.season==='여름'||
    choices.material==='재생 원단'&&choices.style==='아웃도어'||
    ['울','아크릴','울+아크릴'].includes(choices.material)&&trend.season==='겨울'||
    ['레이온','모달','리오셀'].includes(choices.material)&&trend.season==='여름'||
    choices.material==='실크'&&['블라우스','원피스'].includes(choices.item)||
    ['폴리에스터','나일론'].includes(choices.material)&&choices.item==='운동복'||
    choices.material==='면+폴리에스터'&&['셔츠','바지'].includes(choices.item);
  const collectionTrial = (assigned,goal,random=Math.random) => {
    const rolls=rollStats(assigned,random),score=weightedStats(rolls);
    return {rolls,score,goal,success:score>=goal};
  };
  const runwayPrizes={1:3000,2:1000,3:500};
  const rivalBrands=['달빛 테일러','코튼 클럽','루미에르 스튜디오','멜로우 라인','버터플라이 라벨'];
  const judgeFashionWeek = (rolls,random=Math.random) => {
    // Three strong rivals establish meaningful minimum scores for the podium.
    const scores=[30+random()*12,22+random()*10,14+random()*10,12+random()*11,8+random()*11];
    const names=[...rivalBrands];
    for(let i=names.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[names[i],names[j]]=[names[j],names[i]];}
    const competitors=scores.map((score,i)=>({name:names[i],score:Number(score.toFixed(1)),player:false}));
    const playerScore=Number(weightedStats(rolls).toFixed(1));
    const podium=[...competitors,{name:state.companyName||'우리 회사',score:playerScore,player:true}].sort((a,b)=>b.score-a.score).slice(0,3);
    const rank=podium.findIndex(entry=>entry.player)+1;
    return {score:playerScore,podium,rank,prize:runwayPrizes[rank]||0};
  };
  const successChance = (choices,assigned) => {
    const trend=currentTrend();
    const matches=Number(choices.target===trend.target)+Number(choices.item===trend.item)+Number(choices.style===trend.style);
    const material=materialMatch(choices,trend);
    const totals=teamStats(assigned),goal=collectionGoal(teamStats(assigned,true),matches,material,choices);
    if(!Object.values(assigned).some(Boolean))return [0,matches,totals,goal];
    // Use a fixed sequence so the preview stays stable while the actual trial remains random.
    let seed=123456789,wins=0;
    const sample=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
    for(let i=0;i<384;i++)if(collectionTrial(assigned,goal,sample).success)wins++;
    return [Math.round(wins/384*100),matches,totals,goal];
  };
  const showLaunch = (mode=null) => {
    if(!state.hired.length){toast('먼저 직원을 고용하세요.');return;}
    if(state.assets<38){toast('제작비 ₩38M이 필요해요.');return;}
    if(isFashionWeekMonth()&&mode===null){
      showModal('<span class="modal-kicker">FASHION WEEK · '+calendarYear()+'년 '+currentMonth()+'월</span><h2 id="modalTitle">이달은 패션위크!</h2><div class="fashion-week-preview"><img data-skeleton src="./assets/'+fashionWeekArtwork(currentTrend().season)+'" alt="고양이 모델과 관객들이 모인 패션위크 런웨이"></div><p>참가하면 디자인·봉제·트렌드 감각·생산 효율의 실제 제작 점수로 다른 브랜드와 순위를 겨룹니다. 1위 ₩3,000M · 2위 ₩1,000M · 3위 ₩500M.</p><p class="runway-rule">입상하려면 네 능력의 가중 합계가 최소 14점이어야 해요. 참가하지 않아도 이번 달 컬렉션을 평소처럼 제작할 수 있어요.</p><button class="modal-primary" id="joinFashionWeek" type="button">패션위크 참가하기</button><button class="account-secondary" id="skipFashionWeek" type="button">일반 컬렉션 제작</button>');
      $('joinFashionWeek').onclick=()=>showLaunch('fashionWeek');
      $('skipFashionWeek').onclick=()=>showLaunch('regular');
      return;
    }
    const fashionWeek=mode==='fashionWeek'&&isFashionWeekMonth();
    eventVenueActive=fashionWeek;
    eventVenueSeason=fashionWeek?currentTrend().season:null;
    if(fashionWeek)render();
    const trend=currentTrend();
    const choices={target:trend.target,item:baseCategories.includes(trend.item)?trend.item:'티셔츠',style:trend.style,material:'면'};
    const eligible=hiredWorkers().filter(w=>participationCount(w.id)<MAX_YEARLY_PRODUCTIONS);
    const assigned=Object.fromEntries(hiredWorkers().map(w=>[w.id,eligible.slice(0,MAX_PRODUCTION_STAFF).includes(w)]));
    showModal('<span class="modal-kicker">'+(fashionWeek?'FASHION WEEK RUNWAY':'NEW COLLECTION')+' · '+trend.season+' '+currentMonth()+'월</span><h2 id="modalTitle">'+(fashionWeek?'패션위크 컬렉션 기획':'다음 컬렉션 기획')+'</h2>'+(fashionWeek?'<div class="fashion-week-preview compact"><img data-skeleton src="./assets/'+fashionWeekArtwork(trend.season)+'" alt="패션위크 런웨이 행사장"></div>':'')+'<p>제작비 ₩38M · 이번 시즌의 시장 흐름과 팀 능력치를 고려하세요.</p><div id="choices"></div><div class="choice-group"><strong>제작에 배정할 직원 · 최대 4명</strong><p>직원마다 게임 내 1년에 최대 5번 참여할 수 있어요. 새해가 되면 횟수가 초기화됩니다.</p><div id="staffChoices" class="staff-choices"></div></div><div class="selected-stats"><strong>선택한 직원의 능력치 합계 · 배치 가구 보너스 포함</strong><div id="selectedStats" class="selected-stat-grid" aria-live="polite"></div></div><div id="chancePreview" class="chance-preview"></div><button class="modal-primary" id="confirmLaunch" type="button">'+(fashionWeek?'제작하고 런웨이 참가':'제작하고 출시하기')+'</button>');
    const update=()=>{
      const result=successChance(choices,assigned);
      const selectedCount=Object.values(assigned).filter(Boolean).length;
      $('selectedStats').innerHTML=statLabels.map(([key,label])=>'<div><span>'+label+'</span><strong>'+result[2][key]+'</strong></div>').join('');
      $('chancePreview').textContent=(selectedCount?'예상 성공률 '+result[0]+'% · 합산 목표 '+result[3]+' · 트렌드 일치 '+result[1]+'/3':'참여할 직원을 선택해 주세요.')+' · 참여 직원 '+selectedCount+'/'+MAX_PRODUCTION_STAFF+'명'+(fashionWeek?' · 런웨이 입상 최소 14점':'');
      $('confirmLaunch').disabled=selectedCount===0;
    };
    [['target','고객',targets],['item','의류',availableItems()],['style','스타일',availableStyles()],['material','소재',availableMaterials()]].forEach(groupData=>{
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
      const remaining=remainingParticipations(w.id),exhausted=remaining===0;
      const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.checked=assigned[w.id];checkbox.disabled=exhausted;
      checkbox.onchange=()=>{
        if(checkbox.checked&&Object.values(assigned).filter(Boolean).length>=MAX_PRODUCTION_STAFF){checkbox.checked=false;toast('제작에는 최대 4명까지 참여할 수 있어요.');return;}
        assigned[w.id]=checkbox.checked;update();
      };
      const img=skeletonImage(document.createElement('img'));img.src='./assets/'+w.sprite+'.webp';img.alt='';
      const text=document.createElement('span');text.textContent=w.name+' · '+w.role+' · LV.'+state.staff[w.id].level;
      const stats=document.createElement('small');stats.className='staff-choice-stats';stats.textContent=statSummary(w);
      const usage=document.createElement('small');usage.className='staff-usage';usage.textContent='남은 참여 횟수 '+remaining+'회'+(exhausted?' · 선택 불가':'');
      if(exhausted)label.classList.add('is-exhausted');
      label.append(checkbox,img,text,stats,usage);$('staffChoices').append(label);
    });
    update();$('confirmLaunch').onclick=()=>beginProduction(choices,assigned,fashionWeek);
  };
  const productionMessages = [
    '열심히 제작 중이에요',
    '새 컬렉션을 완성하고 있어요',
    '디자인을 다듬고 있어요',
    '한 땀씩 만들어 가고 있어요',
    '마지막 디테일을 살펴봐요',
    '패션 아이디어가 옷이 되고 있어요'
  ];
  const beginProduction = (choices,assigned,fashionWeek=false) => {
    if(isProducing)return;
    const selected=hiredWorkers().filter(w=>assigned[w.id]);
    if(!selected.length){toast('참여 가능한 직원을 한 명 이상 배정해 주세요.');return;}
    if(selected.length>MAX_PRODUCTION_STAFF||selected.some(w=>participationCount(w.id)>=MAX_YEARLY_PRODUCTIONS)){
      toast('직원은 최대 4명, 1년에 각 5회까지 참여할 수 있어요.');return;
    }
    const [chance,,totals,goal]=successChance(choices,assigned);
    const outcome=collectionTrial(assigned,goal);
    const target=outcome.success?100:Math.min(chance,99);
    let messageIndex=Math.floor(Math.random()*productionMessages.length);
    isProducing=true;
    showModal('<span class="modal-kicker">'+(fashionWeek?'FASHION WEEK · RUNWAY':'COLLECTION IN PROGRESS')+'</span><h2 id="modalTitle" tabindex="-1">'+productionMessages[messageIndex]+'</h2><div class="production-stage" role="status" aria-label="예상 성공률 '+chance+'퍼센트로 컬렉션 제작 중"><div class="production-percent" id="productionPercent" aria-hidden="true">0%</div><div class="production-track" aria-hidden="true"><span id="productionFill"></span></div><p>제작 진행도 · 예상 성공률 '+chance+'% · 합산 목표 '+goal+'</p><div class="production-stats">'+statLabels.map(([key,label])=>'<div><span>'+label+'</span><strong id="production-'+key+'">0 / '+totals[key]+'</strong><div class="production-stat-track"><i id="production-fill-'+key+'"></i></div></div>').join('')+'</div><div class="production-studio '+(fashionWeek?'runway-production':'')+'" role="img" aria-label="'+(fashionWeek?'고양이 모델이 참가한 패션위크 런웨이':'고양이들이 패션 사무실에서 디자인하고 재봉하고 의상을 정리하는 장면')+'"><img data-skeleton src="./assets/'+(fashionWeek?fashionWeekArtwork(currentTrend().season):'production-studio.webp')+'" alt="" decoding="async"></div></div>');
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
    setTimeout(()=>{if(messageTimer)clearInterval(messageTimer);isProducing=false;launch(choices,assigned,outcome,fashionWeek);},reduced?250:2250);
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
  const launch = (choices,assigned,outcome,fashionWeek=false) => {
    const selected=hiredWorkers().filter(w=>assigned[w.id]);
    if(!selected.length||selected.length>MAX_PRODUCTION_STAFF||selected.some(w=>participationCount(w.id)>=MAX_YEARLY_PRODUCTIONS))return;
    const previous={assets:state.assets,customers:state.customers,research:state.research};
    const trend=currentTrend(),releaseMonth=currentMonth(),releaseYear=calendarYear();
    const [chance,matches]=successChance(choices,assigned);
    const runway=fashionWeek?judgeFashionWeek(outcome.rolls):null;
    const success=outcome.success;
    const score=Math.max(20,Math.min(100,Math.round(65+(outcome.score/outcome.goal-1)*60+(success?8:-8))));
    const revenue=Math.round(score*(success?1.8:1.12)+state.companyLevel*4);
    const gained=Math.round((score-48)*3.7);
    const points=success?3:2;
    const salaryPaid=monthlyPayroll();
    state.assets=roundMoney(state.assets+revenue-38-salaryPaid+(runway?.prize||0));
    state.customers=Math.max(0,state.customers+gained);
    state.research+=points;
    const chargedInterest=accrueLoanInterest();
    const xpChanges=[];
    for(const w of hiredWorkers()) if(assigned[w.id]){
      const member=state.staff[w.id],before=member.level;
      const beforeStats=employeeStats(w);
      member.productionCount=participationCount(w.id,releaseYear)+1;
      member.productionYear=releaseYear;
      if(member.level<10){
        member.xp++;
        if(member.xp>=member.level*2){member.xp=0;member.level++;}
      }
      xpChanges.push({name:w.name,level:member.level,xp:member.xp,leveled:member.level>before,beforeStats,afterStats:employeeStats(w)});
    }
    const beforeCompanyLevel=state.companyLevel;
    state.releases++;
    state.monthsElapsed++;
    const completedResearch=finishResearch();
    state.companyLevel=Math.min(COMPANY_MAX,1+Math.floor(state.releases/2));
    const discoveries=[];
    if(state.releases===2&&!has('hoodie')){state.unlocks.push('hoodie');discoveries.push('후드티');}
    if(state.releases===5&&!has('bag')){state.unlocks.push('bag');discoveries.push('가방');}
    const reason=matches>=2?'시즌 취향과 고객 수요를 잘 맞췄습니다.':matches===1?'일부 시장 수요와 맞았지만 조합을 더 다듬을 수 있습니다.':'이번 시즌의 인기 상품·스타일·고객과 거리가 있었습니다.';
    const review=score>=75?'“다음 컬렉션도 기대돼요!”':score>=55?'“디자인은 좋지만 조금 더 고민해 볼게요.”':'“이번 시즌에는 다른 스타일을 찾고 있었어요.”';
    state.history.unshift({name:choices.style+' '+choices.item,season:trend.season,month:releaseMonth,year:releaseYear,score,revenue,salaryPaid,review,fashionWeek:Boolean(runway),fashionWeekRank:runway?.rank||0,prize:runway?.prize||0});
    state.history=state.history.slice(0,8);save();render();
    $('scene').classList.remove('season-turn');void $('scene').offsetWidth;$('scene').classList.add('season-turn');
    const xpReport='<div class="experience-report"><strong>참여 직원 경험치</strong>'+xpChanges.map(w=>'<div><span>'+w.name+'</span><span>'+(w.level===10&&!w.leveled?'최대 레벨':'+1 XP')+'</span></div>').join('')+'</div>';
    const salaryReport='<div class="report-line">이번 달 직원 월급 <strong>−₩'+money(salaryPaid)+'M · '+state.hired.length+'명</strong></div>';
    const loanReport=chargedInterest?'<div class="report-line">이번 달 대출 이자 <strong>+₩'+money(chargedInterest)+'M · 총 상환액 ₩'+money(loanBalance())+'M</strong></div>':'';
    const companyLevelUp=state.companyLevel>beforeCompanyLevel?levelUpPanel('회사 LV.'+state.companyLevel+' 달성!',[
      levelChange('대출 원금 한도',loanLimit(beforeCompanyLevel),loanLimit(state.companyLevel),'M','M'),
      levelChange('월 이자율',loanRate(beforeCompanyLevel)*100,loanRate(state.companyLevel)*100,'%','%p',1)
    ],'새로운 금융 혜택이 열렸어요'):'';
    const leveledStaff=xpChanges.filter(w=>w.leveled);
    const staffLevelUp=leveledStaff.length?levelUpPanel('직원 '+leveledStaff.length+'명 레벨업!',leveledStaff.flatMap(w=>[
      '<div class="level-employee-name">'+w.name+' · LV.'+w.level+'</div>',
      ...statLabels.map(([key,label])=>levelChange(label,w.beforeStats[key],w.afterStats[key]))
    ]),'제작 경험으로 능력치가 올랐어요'):'';
    pendingLevelUp=companyLevelUp+staffLevelUp||null;
    const runwayReport=runway?'<section class="runway-report"><div class="fashion-week-preview compact"><img data-skeleton src="./assets/'+fashionWeekArtwork(trend.season)+'" alt="패션위크 런웨이"></div><h3>'+(runway.rank?runway.rank+'위 입상!':'이번 패션위크는 입상하지 못했어요')+'</h3><p>네 능력 가중 합계 '+runway.score.toFixed(1)+'점 · 최소 입상 기준 14점</p><div class="runway-stat-grid">'+statLabels.map(([key,label])=>'<span>'+label+' <strong>'+outcome.rolls[key]+'</strong></span>').join('')+'</div><ol class="runway-podium">'+runway.podium.map((entry,index)=>'<li class="'+(entry.player?'our-brand':'')+'"><span>'+ (index+1)+'위 · '+entry.name+'</span><strong>'+entry.score.toFixed(1)+'점</strong></li>').join('')+'</ol><p class="runway-prize">'+(runway.prize?'패션위크 상금 +₩'+money(runway.prize)+'M':'상금 없음 · 다음 패션위크에 다시 도전해 보세요')+'</p></section>':'';
    const resultHero='<div class="result-hero '+(success?'result-success':'result-failure')+'">'+(success?celebration()+'<div class="result-mark" aria-hidden="true">✦</div><strong>컬렉션 성공!</strong>':'<img data-skeleton class="sad-team" src="./assets/cats-disappointed.webp" alt="디자인·재봉·촬영을 맡은 고양이 직원들이 실망한 표정으로 앉아 있는 모습"><strong>이번 결과는 아쉬워요</strong>')+'</div>';
    showModal('<span class="modal-kicker">'+(fashionWeek?'FASHION WEEK RESULT':'COLLECTION RELEASED')+' · '+trend.season+' '+releaseMonth+'월</span><h2 id="modalTitle">'+choices.style+' '+choices.item+' 출시</h2>'+resultHero+runwayReport+'<div class="report-score">'+score+'</div><p>'+reason+' '+(success?'제작과 판매가 순조로웠습니다.':'제작 결과가 기대치에 미치지 못했습니다.')+'</p><blockquote class="customer-review">'+review+'</blockquote><div class="report-line">예상 성공률 / 결과 <strong>'+chance+'% / '+(success?'성공':'아쉬움')+'</strong></div><div class="report-line">능력 합산 / 성공 목표 <strong>'+outcome.score.toFixed(1)+' / '+outcome.goal+'</strong></div><div class="result-stat-summary">'+statLabels.map(([key,label])=>'<span>'+label+' <strong>'+outcome.rolls[key]+'</strong></span>').join('')+'</div><div class="report-line">매출 / 제작비 <strong>₩'+revenue+'M / ₩38M</strong></div>'+salaryReport+loanReport+'<div class="change-grid">'+changeCard('자산',state.assets-previous.assets,previous.assets,'M')+changeCard('고객',state.customers-previous.customers,previous.customers,'명')+changeCard('연구 포인트',state.research-previous.research,previous.research,'P')+'</div>'+xpReport+(discoveries.length?'<p class="discovery">새 의류 발견: '+discoveries.join(', ')+'</p>':'')+(completedResearch.length?'<p class="discovery">연구 완료: '+completedResearch.join(', ')+'</p>':'')+'<p>다음 달은 '+calendarYear()+'년 '+currentMonth()+'월 · '+currentTrend().season+'입니다.</p><button class="modal-primary" id="reportDone" type="button">사무실로 돌아가기</button>');
    $('reportDone').onclick=closeModal;
  };
  const showStaff = (role='디자인') => {
    const roles=['디자인','생산','마케팅'];
    if(!roles.includes(role))role=roles[0];
    showModal('<span class="modal-kicker">MY TEAM</span><h2 id="modalTitle">직원</h2><p>직원별 능력치와 남은 참여 횟수를 확인하세요. 한 해에 직원당 최대 5회 참여할 수 있습니다.</p><div class="section-tabs" id="staffTabs" role="tablist" aria-label="직군"></div><div id="staffRows" class="staff-roster" role="tabpanel"></div>');
    roles.forEach(name=>{
      const button=document.createElement('button');button.type='button';button.textContent=name;button.setAttribute('role','tab');
      button.setAttribute('aria-selected',String(name===role));button.className=name===role?'active':'';
      button.onclick=()=>showStaff(name);$('staffTabs').append(button);
    });
    const members=hiredWorkers().filter(w=>w.role===role);
    if(!members.length){$('staffRows').textContent='고용한 '+role+' 직원이 없습니다. 직원 고용 메뉴에서 채용해 보세요.';return;}
    members.forEach(w=>{
      const row=document.createElement('button');row.type='button';row.className='staff-roster-card';
      const img=skeletonImage(document.createElement('img'));img.src='./assets/'+w.sprite+'.webp';img.alt='';
      const detail=document.createElement('span');
      detail.innerHTML='<strong>'+w.name+' · LV.'+state.staff[w.id].level+'</strong><small>'+statSummary(w)+'</small><small>남은 참여 횟수 '+remainingParticipations(w.id)+'회</small>';
      row.append(img,detail);row.onclick=()=>showWorkerProfile(w.id,role);$('staffRows').append(row);
    });
  };
  const researchProjects={
    '소재':[
      {id:'linen',name:'리넨 소재',cost:4,group:'천연섬유',options:['리넨'],detail:'통풍이 좋은 마 소재 · 여름 제작 목표 −1'},
      {id:'woolResearch',name:'울 소재',cost:6,group:'천연섬유',options:['울'],detail:'보온성이 좋은 소재 · 겨울 제작 목표 −1'},
      {id:'silkResearch',name:'실크 소재',cost:7,group:'천연섬유',options:['실크'],detail:'광택이 있는 소재 · 블라우스·원피스 제작 목표 −1'},
      {id:'regeneratedResearch',name:'재생섬유',cost:8,group:'재생섬유',options:['레이온','모달','리오셀'],detail:'레이온·모달·리오셀 · 여름 제작 목표 −1'},
      {id:'syntheticResearch',name:'합성섬유',cost:8,group:'합성섬유',options:['폴리에스터','나일론','아크릴'],detail:'폴리에스터·나일론은 운동복, 아크릴은 겨울 제작 목표 −1'},
      {id:'blendResearch',name:'혼방섬유',cost:9,group:'혼방섬유',options:['면+폴리에스터','울+아크릴'],detail:'면+폴리에스터는 셔츠·바지, 울+아크릴은 겨울 제작 목표 −1'},
      {id:'recycled',name:'재생 원단',cost:6,group:'기타 소재',options:['재생 원단'],detail:'기존 재활용 원단 · 아웃도어 제작 목표 −1'}
    ],
    '의류':[
      {id:'patternResearch',name:'기본 패턴 연구',cost:5,group:'연구 효과',detail:'셔츠·바지 제작 목표 −1'},
      {id:'silhouetteResearch',name:'실루엣 연구',cost:7,group:'연구 효과',detail:'원피스·아우터 제작 목표 −1'},
      {id:'topsResearch',name:'다양한 상의',cost:7,group:'상의',options:['블라우스','니트','민소매'],detail:'블라우스·니트·민소매 선택 가능 · 해당 의류 제작 목표 −1'},
      {id:'skirtResearch',name:'치마 패턴',cost:5,group:'하의',options:['치마'],detail:'치마 선택 가능 · 해당 의류 제작 목표 −1'},
      {id:'outerwearResearch',name:'아우터 확장',cost:8,group:'아우터',options:['재킷','코트','패딩'],detail:'재킷·코트·패딩 선택 가능 · 해당 의류 제작 목표 −1'},
      {id:'lifestyleResearch',name:'생활복',cost:7,group:'기타 의류',options:['잠옷','운동복'],detail:'잠옷·운동복 선택 가능 · 해당 의류 제작 목표 −1'}
    ],
    '스타일':[
      {id:'trendResearch',name:'트렌드 분석',cost:5,group:'연구 효과',detail:'이번 시즌 유행 스타일 제작 목표 −1'},
      {id:'styleResearch',name:'스타일 응용',cost:7,group:'연구 효과',detail:'유행과 다른 스타일 제작 목표 −1'},
      {id:'everydayStyle',name:'일상 스타일',cost:6,group:'일상',options:['캐주얼','놈코어'],detail:'캐주얼·놈코어 선택 가능 · 해당 스타일 제작 목표 −1'},
      {id:'formalStyle',name:'격식 있는 스타일',cost:7,group:'격식',options:['포멀','프레피'],detail:'포멀·프레피 선택 가능 · 해당 스타일 제작 목표 −1'},
      {id:'heritageStyle',name:'빈티지·실용 스타일',cost:8,group:'개성',options:['아메카지','밀리터리'],detail:'아메카지·밀리터리 선택 가능 · 해당 스타일 제작 목표 −1'},
      {id:'expressiveStyle',name:'감성 스타일',cost:9,group:'개성',options:['히피','발레코어'],detail:'히피·발레코어 선택 가능 · 해당 스타일 제작 목표 −1'}
    ],
    '고객':[
      {id:'customerResearch',name:'고객 조사',cost:5,group:'고객 분석',detail:'이번 시즌 주요 고객층 제작 목표 −1'},
      {id:'audienceResearch',name:'신규 고객 탐색',cost:7,group:'고객 분석',detail:'주요 고객층 이외 대상 제작 목표 −1'}
    ]
  };
  const researchDuration=project=>project.cost-2;
  const startResearch=project=>{
    if(has(project.id)||state.researchTasks.some(task=>task.id===project.id)||state.research<project.cost)return false;
    state.research-=project.cost;
    state.researchTasks.push({id:project.id,finishMonth:state.monthsElapsed+researchDuration(project)});
    return true;
  };
  const finishResearch=()=>{
    const done=state.researchTasks.filter(task=>task.finishMonth<=state.monthsElapsed);
    state.researchTasks=state.researchTasks.filter(task=>task.finishMonth>state.monthsElapsed);
    const names=[];
    for(const task of done){
      if(has(task.id))continue;
      const project=Object.values(researchProjects).flat().find(item=>item.id===task.id);
      if(!project)continue;
      state.unlocks.push(task.id);names.push(project.name);
    }
    return names;
  };
  const showResearch = (category='소재') => {
    if(!researchProjects[category])category='소재';
    showModal('<span class="modal-kicker">DISCOVERY</span><h2 id="modalTitle">연구</h2><p>연구 포인트 '+state.research+'P · 연구는 컬렉션을 출시할 때마다 한 달씩 진행됩니다. 완료한 연구부터 제작에 적용돼요.</p><div class="section-tabs" id="researchTabs" role="tablist" aria-label="연구 분야"></div><div id="researchRows" role="tabpanel"></div>');
    Object.keys(researchProjects).forEach(name=>{
      const button=document.createElement('button');button.type='button';button.textContent=name;button.setAttribute('role','tab');
      button.setAttribute('aria-selected',String(name===category));button.className=name===category?'active':'';
      button.onclick=()=>showResearch(name);$('researchTabs').append(button);
    });
    let currentGroup=null;
    researchProjects[category].forEach(project=>{
      if(project.group!==currentGroup){
        currentGroup=project.group;
        const heading=document.createElement('h3');heading.className='research-group-heading';heading.textContent=currentGroup;
        $('researchRows').append(heading);
      }
      const row=document.createElement('div');row.className='research-row';
      const body=document.createElement('div');body.innerHTML='<strong>'+project.name+'</strong><small>'+project.detail+' · '+researchDuration(project)+'개월 소요</small>';
      const button=document.createElement('button');button.type='button';
      const task=state.researchTasks.find(entry=>entry.id===project.id);
      button.textContent=has(project.id)?'연구 완료':task?'남은 '+(task.finishMonth-state.monthsElapsed)+'개월':project.cost+'P 연구 시작';
      button.disabled=has(project.id)||Boolean(task)||state.research<project.cost;
      button.onclick=()=>{if(!startResearch(project))return;save();showResearch(category);toast(project.name+' 연구를 시작했어요.');};
      row.append(body,button);$('researchRows').append(row);
    });
  };
  const showCollections = () => {
    showModal('<span class="modal-kicker">COLLECTION ARCHIVE</span><h2 id="modalTitle">컬렉션</h2><p>최근 출시한 컬렉션 '+state.history.length+'개를 확인할 수 있어요.</p><div id="historyRows"></div>');
    if(!state.history.length)$('historyRows').textContent='아직 출시한 컬렉션이 없습니다.';
    state.history.forEach(h=>{
      const row=document.createElement('div');row.className='collection-row';
      const heading=document.createElement('div');heading.className='collection-row-heading';
      const title=document.createElement('span');title.textContent=(h.year&&h.month?h.year+'년 '+h.month+'월 · ':'')+h.season+' · '+h.name;
      heading.append(title);
      if(h.fashionWeek){
        const badge=document.createElement('small');badge.textContent='패션위크 '+(h.fashionWeekRank?h.fashionWeekRank+'위':'미입상');
        heading.append(badge);
      }
      const result=document.createElement('div');result.className='collection-row-result';
      const score=document.createElement('strong');score.textContent=h.score+'점 · ₩'+h.revenue+'M';result.append(score);
      if(h.prize){const prize=document.createElement('span');prize.textContent='상금 +₩'+h.prize+'M';result.append(prize);}
      row.append(heading,result);$('historyRows').append(row);
    });
  };
  const firstFreeCell = id => {
    const b=bounds[state.officeLevel-1];
    for(let y=b[2];y<=b[3];y++)for(let x=b[0];x<=b[1];x++)if(canPlace(id,x,y))return {x,y};
    return null;
  };
  const showFireConfirm = id => {
    const w=workers.find(member=>member.id===id);
    if(!w||!state.hired.includes(id))return;
    if(editMode){toast('배치 수정을 마친 뒤 직원을 해고할 수 있어요.');return;}
    showModal('<span class="modal-kicker">STAFF MANAGEMENT</span><h2 id="modalTitle">'+w.name+'을 해고할까요?</h2><p>해고하면 사무실 배치와 다음 달 월급에서 제외됩니다. 고용비는 환불되지 않으며, 다시 고용하면 레벨과 올해 참여 기록은 이어집니다.</p><div class="report-line">줄어드는 월급 <strong>₩'+money(hiringCost(w))+'M</strong></div><button class="modal-primary fire-confirm" id="confirmFire" type="button">해고하기</button><button class="account-secondary" id="cancelFire" type="button">취소</button>');
    $('confirmFire').onclick=()=>{
      state.hired=state.hired.filter(workerId=>workerId!==id);
      state.placed=state.placed.filter(piece=>piece.id!==id);
      save();render();showStaff(w.role);toast(w.name+' 해고 완료');
    };
    $('cancelFire').onclick=()=>showWorkerProfile(id,w.role);
  };
  const showWorkerProfile = (id,returnRole=null) => {
    const w=definition(id),member=state.staff[id];
    if(!w||!member)return;
    showModal('<span class="modal-kicker">STAFF PROFILE</span><h2 id="modalTitle">'+w.name+'</h2><div class="profile-portrait"><img data-skeleton src="./assets/'+w.sprite+'.webp" alt=""></div><div class="report-line">직군 <strong>'+w.role+'</strong></div><div class="report-line">레벨 <strong>LV.'+member.level+' / 10</strong></div><h3 class="stats-heading">직원 능력치</h3>'+staffStatGrid(w)+'<div class="report-line">경험치 <strong>'+member.xp+' / '+(member.level*2)+'</strong></div><div class="report-line">남은 참여 횟수 <strong>'+remainingParticipations(id)+'회</strong></div><div class="report-line">월급 <strong>₩'+money(hiringCost(w))+'M</strong></div><p>제작에 참여하면 경험을 얻고, 새해에는 참여 가능 횟수가 초기화됩니다.</p>'+(returnRole?'<button class="account-secondary" id="backToStaff" type="button">직원 목록으로</button>':'')+'<button class="account-secondary fire-action" id="fireWorker" type="button">직원 해고</button>');
    if(returnRole)$('backToStaff').onclick=()=>showStaff(returnRole);
    $('fireWorker').onclick=()=>showFireConfirm(id);
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
    showModal('<span class="modal-kicker">STAFF RECRUITMENT</span><h2 id="modalTitle">직원 고용</h2><p>오피스 LV.'+state.officeLevel+' · 고용 '+state.hired.length+'/'+employeeCap[state.officeLevel-1]+'명. 고용비를 내고 채용하면 매달 같은 금액의 월급이 지급됩니다. 컬렉션 제작비는 별도로 ₩38M이 필요해요.</p><div id="shopRows"></div><nav class="shop-pagination" id="shopPagination" aria-label="직원 목록 페이지"></nav>');
    roster.slice(page*pageSize,(page+1)*pageSize).forEach(w=>{
      const row=document.createElement('div');row.className='shop-row';
      const img=skeletonImage(document.createElement('img'));img.src='./assets/'+w.sprite+'.webp';img.alt='';img.loading='eager';img.decoding='async';img.width=72;img.height=72;
      const body=document.createElement('div');body.className='shop-description';
      const heading=document.createElement('strong');heading.textContent=w.name+' · '+w.role;
      const detail=document.createElement('small');detail.textContent=statSummary(w);
      const unlock=document.createElement('small');unlock.textContent='오피스 LV.'+w.level+'부터';
      const salary=document.createElement('small');salary.textContent='고용비 ₩'+money(hiringCost(w))+'M · 월급 ₩'+money(hiringCost(w))+'M';
      body.append(heading,detail,unlock,salary);
      const button=document.createElement('button');button.type='button';
      const price=hiringCost(w);
      const owned=state.hired.includes(w.id),locked=state.officeLevel<w.level,full=state.hired.length>=employeeCap[state.officeLevel-1],affordable=state.assets>=price;
      button.textContent=owned?'고용됨':locked?'잠김':full?'정원 마감':!affordable?'자산 부족':'₩'+money(price)+'M 고용';
      button.disabled=owned||locked||full||!affordable;
      if(locked)addLockIcon(button,w.level);
      button.onclick=()=>{
        state.assets=roundMoney(state.assets-price);state.hired.push(w.id);state.staff[w.id]=state.staff[w.id]||{level:1,xp:0};
        const cell=firstFreeCell(w.id);if(cell)state.placed.push({id:w.id,...cell});
        save();render();showHire(page);toast(w.name+' 고용 완료!');
      };
      row.append(img,body,button);$('shopRows').append(row);
    });
    showPager(page,roster.length,showHire);
  };
  const showFurniture = (page=0) => {
    const catalog=furniture.slice().sort((a,b)=>a.level-b.level);
    page=Math.max(0,Math.min(page,Math.ceil(catalog.length/pageSize)-1));
    showModal('<span class="modal-kicker">FURNITURE SHOP</span><h2 id="modalTitle">가구 구매</h2><p>오피스 LV.'+state.officeLevel+' · 보유 가구 '+state.ownedFurniture.length+'/'+furnitureCap[state.officeLevel-1]+'개. 구매한 가구는 배치 수정에서 옮길 수 있어요. 컬렉션 제작비는 별도로 ₩38M이 필요해요.</p><div id="shopRows"></div><nav class="shop-pagination" id="shopPagination" aria-label="가구 목록 페이지"></nav>');
    catalog.slice(page*pageSize,(page+1)*pageSize).forEach(f=>{
      const row=document.createElement('div');row.className='shop-row';
      const img=skeletonImage(document.createElement('img'));img.src='./assets/'+f.sprite+'.webp';img.alt='';img.loading='eager';img.decoding='async';img.width=72;img.height=72;
      const body=document.createElement('div');body.className='shop-description';
      const heading=document.createElement('strong');heading.textContent=f.name;
      const detail=document.createElement('small');detail.textContent='오피스 LV.'+f.level+'부터 · '+furnitureDescription(f);
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
        const cell=firstFreeCell(id);if(cell)state.placed.push({id,...cell});
        save();render();showFurniture(page);toast(f.name+(cell?' 구매·배치 완료!':' 구매 완료! 배치 수정에서 자리를 만들어 주세요.'));
      };
      row.append(img,body,button);$('shopRows').append(row);
    });
    showPager(page,catalog.length,showFurniture);
  };
  const menu = $('gameMenu'),toggle = $('menuToggle');
  const setMenu = open => {menu.hidden=!open;toggle.setAttribute('aria-expanded',String(open));};
  toggle.onclick=()=>setMenu(menu.hidden);
  document.addEventListener('click',event=>{if(!menu.contains(event.target)&&event.target!==toggle)setMenu(false);});
  $('menuHire').onclick=()=>{setMenu(false);showHire(0);};
  $('menuFurniture').onclick=()=>{setMenu(false);showFurniture(0);};
  $('menuLoan').onclick=()=>{setMenu(false);showLoan();};
  $('officeRepayButton').onclick=()=>showLoan(true);
  $('menuAccount').onclick=()=>{setMenu(false);showSaveInfo();};
  $('menuCollection').onclick=()=>{setMenu(false);showCollections();};
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
  $('startLayer').hidden=true;
  const showUpgrade = () => {
    if(state.officeLevel>=OFFICE_MAX){toast('오피스 최고 레벨에 도달했어요.');return;}
    const price=upgradePrice(state.officeLevel);
    if(state.releases<officeRequiredReleases(state.officeLevel)){toast('컬렉션 '+officeRequiredReleases(state.officeLevel)+'회 출시 후 확장할 수 있어요.');return;}
    if(state.assets-price<38){toast('확장 후 제작비 ₩38M을 남겨두어야 해요.');return;}
    const next=state.officeLevel+1;
    showModal('<span class="modal-kicker">OFFICE UPGRADE</span><h2 id="modalTitle">'+offices[next-1]+'로 확장</h2><p>비용 ₩'+price+'M을 투자하면 오피스 레벨 '+next+'가 됩니다. 배치 가능한 칸이 늘어나고 새로운 가구가 열릴 수 있어요. 기존 배치는 그대로 유지됩니다.</p><button class="modal-primary" id="confirmUpgrade" type="button">₩'+price+'M 투자하기</button>');
    $('confirmUpgrade').onclick=()=>{
      const beforeLevel=state.officeLevel,oldN=gridSize();state.assets-=price;state.officeLevel=next;
      const newN=gridSize(),remapped=[];
      for(const piece of state.placed){
        let x=Math.min(newN-footprint(piece.id),Math.floor((piece.x+.5)*newN/oldN));
        let y=Math.min(newN-1,Math.floor((piece.y+.5)*newN/oldN));
        if(!canPlace(piece.id,x,y,remapped,newN)){
          const free=Array.from({length:newN*newN},(_,i)=>({x:i%newN,y:Math.floor(i/newN)})).find(cell=>canPlace(piece.id,cell.x,cell.y,remapped,newN));
          if(!free)continue;
          x=free.x;y=free.y;
        }
        remapped.push({...piece,x,y});
      }
      state.placed=remapped;
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
    const level=state.officeLevel,top=level===OFFICE_MAX;
    showModal('<span class="modal-kicker">MY ATELIER · YEAR '+calendarYear()+' · '+currentMonth()+'월</span><h2 id="modalTitle">'+offices[level-1]+'</h2><p>오피스 LV. '+level+' / '+OFFICE_MAX+'</p><div class="office-detail-grid"><div><span>직원 수용</span><strong>'+state.hired.length+' / '+employeeCap[level-1]+'명</strong></div><div><span>가구 배치</span><strong>'+state.ownedFurniture.length+' / '+furnitureCap[level-1]+'개</strong></div><div><span>컬렉션 출시</span><strong>'+state.releases+'회</strong></div><div><span>확장 경험</span><strong>'+(top?'Max':state.releases+' / '+officeRequiredReleases(level)+'회')+'</strong></div><div><span>연구 포인트</span><strong>'+state.research+'P</strong></div></div><p class="office-upgrade-note">'+(top?'최고 레벨의 오피스입니다.':'다음 확장: ₩'+upgradePrice(level)+'M · 컬렉션 '+officeRequiredReleases(level)+'회 출시 필요 · 확장 후 제작비 ₩38M 유지')+'</p>'+(top?'':'<button class="modal-primary" id="upgradeButton" type="button">오피스 확장하기</button>'));
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
  $('staffButton').onclick=()=>{setMenu(false);showStaff();};
  $('researchButton').onclick=()=>{setMenu(false);showResearch();};
  $('launchButton').onclick=()=>editMode?saveLayout():showLaunch();
  $('modalClose').onclick=closeModal;
  $('modalLayer').addEventListener('click',event=>{if(event.target===$('modalLayer'))closeModal();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!$('modalLayer').hidden)closeModal();});
  render();
})();
