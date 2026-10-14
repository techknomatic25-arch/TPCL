import { readdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const assets = readdirSync('dist/assets').map(name => './assets/' + name);
const cache='opcl-'+createHash('sha256').update(assets.join('|')).digest('hex').slice(0,12);
writeFileSync('dist/sw.js', `const CACHE=${JSON.stringify(cache)};\nconst ASSETS=${JSON.stringify(['./','./index.html',...assets])};\nself.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));\nself.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('opcl-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));\nself.addEventListener('fetch',event=>{if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;event.respondWith(fetch(event.request).catch(()=>caches.match(event.request).then(hit=>hit||(event.request.mode==='navigate'?caches.match('./index.html'):Response.error()))));});\n`);
console.log('Offline cache generated for', assets.length, 'assets.');
