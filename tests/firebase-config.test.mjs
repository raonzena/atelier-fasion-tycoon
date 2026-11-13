import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import worker from '../dist/server/index.js';

const values={apiKey:'browser-key',authDomain:'example.firebaseapp.com',projectId:'example',appId:'app-1',googleEnabled:false,serviceAccount:'never-send'};
const env={FIREBASE_WEB_CONFIG:JSON.stringify(values),ASSETS:{fetch:async()=>new Response('game')}};
const response=await worker.fetch(new Request('https://example.test/api/firebase-config'),env);
assert.equal(response.status,200);
assert.equal(response.headers.get('cache-control'),'no-store');
assert.deepEqual(await response.json(),{apiKey:'browser-key',authDomain:'example.firebaseapp.com',projectId:'example',appId:'app-1',googleEnabled:false});
assert.equal((await worker.fetch(new Request('https://example.test/api/firebase-config'),{...env,FIREBASE_WEB_CONFIG:''})).status,503);
assert.equal((await worker.fetch(new Request('https://example.test/'),env)).status,200);
assert.doesNotMatch(readFileSync(resolve('dist/client/index.html'),'utf8'),/firebase-config\.js/);
console.log('Runtime Firebase configuration route and static fallback passed.');
