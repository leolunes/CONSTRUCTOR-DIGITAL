const CACHE='bitacora-obra-v1.50.0';
const CORE=['./','./app/index.html','./app/obras.html','./app/contratistas.html','./app/configuracion.html','./app/historial.html','./app/anexos.html','./app/vista-previa.html','./css/general.css','./css/responsive.css','./js/browser-api.js','./js/ipc-renderer.js','./assets/icons/icon-192.png','./assets/icons/icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./app/index.html'))))});
