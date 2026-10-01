import assert from 'node:assert/strict';
import handler from '../api/firebase-config.mjs';

const names = ['FIREBASE_API_KEY', 'FIREBASE_AUTH_DOMAIN', 'FIREBASE_PROJECT_ID', 'FIREBASE_APP_ID', 'FIREBASE_GOOGLE_ENABLED'];
const saved = Object.fromEntries(names.map(name => [name, process.env[name]]));
try {
  process.env.FIREBASE_API_KEY = 'public-web-key';
  process.env.FIREBASE_AUTH_DOMAIN = 'example.firebaseapp.com';
  process.env.FIREBASE_PROJECT_ID = 'example';
  process.env.FIREBASE_APP_ID = 'example-app';
  process.env.FIREBASE_GOOGLE_ENABLED = 'false';
  const result = handler.fetch(new Request('https://example.vercel.app/api/firebase-config'));
  assert.equal(result.status, 200);
  assert.equal(result.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await result.json(), {
    apiKey: 'public-web-key', authDomain: 'example.firebaseapp.com',
    projectId: 'example', appId: 'example-app', googleEnabled: false
  });
  assert.equal(handler.fetch(new Request('https://example.vercel.app/api/firebase-config', {method: 'POST'})).status, 405);
  delete process.env.FIREBASE_APP_ID;
  assert.equal(handler.fetch(new Request('https://example.vercel.app/api/firebase-config')).status, 503);
} finally {
  for (const name of names) {
    if (saved[name] === undefined) delete process.env[name];
    else process.env[name] = saved[name];
  }
}
console.log('Vercel Firebase runtime config passed.');
