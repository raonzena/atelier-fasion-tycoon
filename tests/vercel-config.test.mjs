import assert from 'node:assert/strict';
import handler from '../api/firebase-config.mjs';

const saved = process.env.FIREBASE_WEB_CONFIG;
try {
  process.env.FIREBASE_WEB_CONFIG = JSON.stringify({
    apiKey: 'public-web-key', authDomain: 'example.firebaseapp.com',
    projectId: 'example', appId: 'example-app', googleEnabled: false,
    serviceAccount: 'must-never-be-returned'
  });
  const result = handler.fetch(new Request('https://example.vercel.app/api/firebase-config'));
  assert.equal(result.status, 200);
  assert.equal(result.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await result.json(), {
    apiKey: 'public-web-key', authDomain: 'example.firebaseapp.com',
    projectId: 'example', appId: 'example-app', googleEnabled: false
  });
  assert.equal(handler.fetch(new Request('https://example.vercel.app/api/firebase-config', {method: 'POST'})).status, 405);
  process.env.FIREBASE_WEB_CONFIG = '{bad json';
  assert.equal(handler.fetch(new Request('https://example.vercel.app/api/firebase-config')).status, 503);
} finally {
  if (saved === undefined) delete process.env.FIREBASE_WEB_CONFIG;
  else process.env.FIREBASE_WEB_CONFIG = saved;
}
console.log('Vercel Firebase runtime config passed.');
