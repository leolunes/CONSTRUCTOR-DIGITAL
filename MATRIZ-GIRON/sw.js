const CACHE='matriz-giron-v1.3.37';
const ASSETS=[
  './',
  './index.html',
  './styles.css?v=1.3.37',
  './assets/centro-democratico-logo.png',
  './app.js?v=1.1.1',
  './photos.js?v=1.2.1',
  './petition.js?v=1.3.37',
  './contacts.js?v=1.3.16',
  './birthdays.js?v=1.3.20',
  './territory-link.js?v=1.3.13',
  './intelligence.js?v=1.3.8',
  './map.js?v=1.3.28',
  './position.js?v=1.3.20',
  './stories.js?v=1.3.34',
  './agenda.js?v=1.3.22',
  './dossier.js?v=1.3.23',
  './positioning.js?v=1.3.25',
  './territorial-db.js?v=1.3.32',
  './communications.js?v=1.3.32',
  './responsive.js?v=1.3.36',
  './assets/mapa-giron-territorial.png',
  './manifest.json',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/jhonatan-pineda.png',
  './assets/ivan-ortiz-logo.png',
  './assets/ivan-ortiz-marca.png',
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
  const isCore=url.pathname.endsWith('/') || url.pathname.endsWith('/index.html') || url.pathname.endsWith('/styles.css') || url.pathname.endsWith('/app.js') || url.pathname.endsWith('/photos.js') || url.pathname.endsWith('/petition.js') || url.pathname.endsWith('/contacts.js') || url.pathname.endsWith('/birthdays.js') || url.pathname.endsWith('/territory-link.js') || url.pathname.endsWith('/intelligence.js') || url.pathname.endsWith('/map.js') || url.pathname.endsWith('/position.js') || url.pathname.endsWith('/stories.js') || url.pathname.endsWith('/agenda.js') || url.pathname.endsWith('/dossier.js') || url.pathname.endsWith('/territorial-db.js') || url.pathname.endsWith('/communications.js') || url.pathname.endsWith('/responsive.js');
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
