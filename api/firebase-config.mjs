const required = ['apiKey', 'authDomain', 'projectId', 'appId'];

export default {
  fetch(request) {
    if (request.method !== 'GET') {
      return new Response('Method not allowed', {status: 405, headers: {Allow: 'GET'}});
    }

    let config;
    try {
      config = JSON.parse(process.env.FIREBASE_WEB_CONFIG || 'null');
    } catch {
      config = null;
    }

    if (!config || required.some(key => typeof config[key] !== 'string' || !config[key])) {
      return Response.json({error: 'Firebase is not configured'}, {
        status: 503,
        headers: {'Cache-Control': 'no-store'}
      });
    }

    return Response.json({
      apiKey: config.apiKey,
      authDomain: config.authDomain,
      projectId: config.projectId,
      appId: config.appId,
      googleEnabled: config.googleEnabled === true
    }, {
      headers: {
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff'
      }
    });
  }
};
