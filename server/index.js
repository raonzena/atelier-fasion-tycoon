export default {
  async fetch(request, env) {
    const url=new URL(request.url);
    if(url.pathname==='/api/firebase-config'){
      if(request.method!=='GET')return new Response('Method not allowed',{status:405});
      let config;
      try{config=JSON.parse(env.FIREBASE_WEB_CONFIG||'null');}catch{}
      if(!config?.apiKey||!config?.projectId||!config?.appId||!config?.authDomain){
        return Response.json({error:'Firebase is not configured'},{status:503,headers:{'cache-control':'no-store'}});
      }
      return Response.json({
        apiKey:config.apiKey,
        authDomain:config.authDomain,
        projectId:config.projectId,
        appId:config.appId,
        googleEnabled:Boolean(config.googleEnabled)
      },{headers:{'cache-control':'no-store','x-content-type-options':'nosniff'}});
    }
    return env.ASSETS.fetch(request);
  }
};
