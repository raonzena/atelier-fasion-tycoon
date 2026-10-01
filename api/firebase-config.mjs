export default {
  fetch(request) {
    if (request.method !== 'GET') {
      return new Response('Method not allowed', {status: 405, headers: {Allow: 'GET'}});
    }

    const config = {
      apiKey: process.env.FIREBASE_API_KEY?.trim(),
      authDomain: process.env.FIREBASE_AUTH_DOMAIN?.trim(),
      projectId: process.env.FIREBASE_PROJECT_ID?.trim(),
      appId: process.env.FIREBASE_APP_ID?.trim(),
      googleEnabled: process.env.FIREBASE_GOOGLE_ENABLED === 'true'
    };

    if (!config.apiKey || !config.authDomain || !config.projectId || !config.appId) {
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
      googleEnabled: config.googleEnabled
    }, {
      headers: {
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff'
      }
    });
  }
};
