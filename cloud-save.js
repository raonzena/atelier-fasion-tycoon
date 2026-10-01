const config = window.ATELIER_FIREBASE_CONFIG;
const configured = Boolean(config?.apiKey && config?.authDomain && config?.projectId && config?.appId);
const bridge = window.atelierGameBridge;
let auth, db, authApi, firestoreApi;
let activeUser = null;
let sync = '동기화 대기 중';
let latest = null;
let timer = null;
let writing = Promise.resolve();
let connectionError = null;
const pendingKey = uid => `atelier-pending-${uid}`;
const adoptedKey = uid => `atelier-cloud-adopted-${uid}`;
const clone = state => JSON.parse(JSON.stringify(state));
const comparable = state => JSON.stringify({...state,localSave:false});
const feedback = () => bridge.refresh();
const errorMessage = error => ({
  'auth/invalid-email':'이메일 형식을 확인해 주세요.',
  'auth/email-already-in-use':'이미 가입된 이메일이에요. 로그인해 주세요.',
  'auth/weak-password':'비밀번호를 6자 이상 입력해 주세요.',
  'auth/invalid-credential':'이메일 또는 비밀번호를 확인해 주세요.',
  'auth/too-many-requests':'시도가 많아요. 잠시 뒤 다시 해주세요.',
  'auth/popup-closed-by-user':'Google 로그인 창이 닫혔어요.',
  'auth/popup-blocked':'팝업을 허용한 뒤 다시 시도해 주세요.',
  'auth/unauthorized-domain':'이 사이트 주소를 Firebase 승인된 도메인에 추가해 주세요.',
  'permission-denied':'저장 권한을 확인해 주세요. Firestore 보안 규칙이 필요합니다.',
  'unavailable':'연결이 불안정해요. 기기에 임시 보관하고 다시 시도할게요.'
})[error?.code] || error?.message || '문제가 생겼어요. 잠시 뒤 다시 시도해 주세요.';
const ensureReady = async () => { await ready;if(connectionError)throw connectionError; };

const persist = (uid, snapshot) => {
  writing = writing.catch(() => {}).then(async () => {
    await firestoreApi.setDoc(firestoreApi.doc(db,'saves',uid),{
      version:1,state:snapshot,updatedAt:firestoreApi.serverTimestamp()
    });
    const pending = localStorage.getItem(pendingKey(uid));
    if(pending && comparable(JSON.parse(pending))===comparable(snapshot))localStorage.removeItem(pendingKey(uid));
    sync='저장 완료';feedback();
  }).catch(error => {sync='저장 대기 중 · 연결 확인';feedback();throw error;});
  return writing;
};
const flush = () => {
  if(timer){clearTimeout(timer);timer=null;}
  if(!activeUser || !latest)return writing;
  const snapshot=latest,uid=activeUser.uid;latest=null;
  return persist(uid,snapshot);
};
const queueSave = state => {
  if(!activeUser)return;
  const snapshot=clone(state);
  latest=snapshot;
  localStorage.setItem(pendingKey(activeUser.uid),JSON.stringify(snapshot));
  sync='저장 중';feedback();
  clearTimeout(timer);
  timer=setTimeout(()=>{flush().catch(error=>bridge.toast(errorMessage(error)));},450);
};

window.atelierCloud = {
  isConfigured:()=>configured,
  isSignedIn:()=>Boolean(activeUser),
  status:()=>({user:activeUser,label:activeUser?.email || activeUser?.displayName || '로그인 계정',sync}),
  errorMessage,
  queueSave,
  saveNow:async state=>{queueSave(state);await flush();},
  signIn:async(email,password)=>{await ensureReady();await authApi.signInWithEmailAndPassword(auth,email,password);},
  signUp:async(email,password)=>{await ensureReady();await authApi.createUserWithEmailAndPassword(auth,email,password);},
  signInGoogle:async()=>{await ensureReady();await authApi.signInWithPopup(auth,new authApi.GoogleAuthProvider());},
  resetPassword:async email=>{await ensureReady();await authApi.sendPasswordResetEmail(auth,email);},
  signOut:async()=>{await flush();await authApi.signOut(auth);}
};

const ready = (async () => {
  if(!configured)return;
  const version='12.17.0';
  const [appApi,authModule,firestoreModule]=await Promise.all([
    import(`https://www.gstatic.com/firebasejs/${version}/firebase-app.js`),
    import(`https://www.gstatic.com/firebasejs/${version}/firebase-auth.js`),
    import(`https://www.gstatic.com/firebasejs/${version}/firebase-firestore.js`)
  ]);
  authApi=authModule;firestoreApi=firestoreModule;
  const app=appApi.initializeApp(config);
  auth=authApi.getAuth(app);db=firestoreApi.getFirestore(app);
  authApi.onAuthStateChanged(auth,async user=>{
    if(!user){
      if(activeUser){activeUser=null;latest=null;clearTimeout(timer);bridge.restoreGuest();}
      sync='동기화 대기 중';feedback();return;
    }
    if(activeUser?.uid===user.uid)return;
    sync='저장 내용 불러오는 중';feedback();
    try{
      const document=await firestoreApi.getDoc(firestoreApi.doc(db,'saves',user.uid));
      const remote=document.exists()?document.data()?.state:null;
      let pending=null;
      try{pending=JSON.parse(localStorage.getItem(pendingKey(user.uid))||'null');}catch{}
      if(remote && pending && comparable(remote)===comparable(pending)){
        localStorage.removeItem(pendingKey(user.uid));pending=null;
      }
      const guest=bridge.hasProgress() && !localStorage.getItem(adoptedKey(user.uid))?bridge.snapshot():null;
      const device=pending||guest;
      if(remote && device && comparable(remote)!==comparable(device)){
        const selection=await bridge.chooseSave();
        if(!selection){await authApi.signOut(auth);return;}
        activeUser=user;
        bridge.applyCloud(selection==='cloud'?remote:device);
        localStorage.setItem(adoptedKey(user.uid),'1');
        if(selection==='device')queueSave(device);
      } else {
        activeUser=user;
        const chosen=remote||device||bridge.snapshot();
        bridge.applyCloud(chosen);
        localStorage.setItem(adoptedKey(user.uid),'1');
        if(!remote && chosen.companyName)queueSave(chosen);
      }
      if(remote && !latest)sync='저장 완료';
      feedback();bridge.toast('계정에 연결했어요. 다른 기기에서도 이어할 수 있어요.');
    }catch(error){
      sync='불러오기 실패';feedback();bridge.toast(errorMessage(error));
      await authApi.signOut(auth);
    }
  },error=>{sync='로그인 상태 확인 실패';feedback();bridge.toast(errorMessage(error));});
})().catch(error=>{connectionError=error;sync='계정 서비스 연결 실패';feedback();bridge.toast(errorMessage(error));});
