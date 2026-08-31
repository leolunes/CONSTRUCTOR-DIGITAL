const CACHE='matriz-giron-v1.3.1';
const ASSETS=[
  './',
  './index.html',
  './styles.css?v=1.3.1',
  './app.js?v=1.1.1',
  './photos.js?v=1.2.1',
  './petition.js?v=1.3.1',
  './manifest.json',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/jhonatan-pineda.png',
  './assets/ivan-ortiz-logo.png',
  './assets/ivan-ortiz-foto.png'
];
self.addEventListener('install',e=>e.waitUntil(
  caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())
));
self.addEventListener('activate',e=>e.waitUntil(
  caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
    .then(()=>self.clients.claim())
));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  const url=new URL(e.request.url);
  const isCore=url.pathname.endsWith('/') || url.pathname.endsWith('/index.html') || url.pathname.endsWith('/styles.css') || url.pathname.endsWith('/app.js') || url.pathname.endsWith('/photos.js') || url.pathname.endsWith('/petition.js');
  if(isCore){
    e.respondWith(
      fetch(e.request,{cache:'no-store'}).then(resp=>{
        const copy=resp.clone();
        caches.open(CACHE).then(c=>c.put(e.request,copy));
        return resp;
      }).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html')))
    );
    return;
  }
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{
    const copy=resp.clone();
    caches.open(CACHE).then(c=>c.put(e.request,copy));
    return resp;
  })));
});
