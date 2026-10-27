const CACHE='matriz-giron-v1.4.20-paginacion-pdf-1';
const ASSETS=[
  './',
  './index.html',
  './styles.css?v=1.4.18',
  './binary-storage-v1419.js?v=1.4.19',
  './app.js?v=1.4.17',
  './leader-network-v1412.js?v=1.4.12',
  './photos.js?v=1.4.19',
  './petition.js?v=1.4.20',
  './contacts.js?v=1.3.16',
  './card-mass-share.js?v=1.4.11',
  './birthdays.js?v=1.4.08',
  './territory-link.js?v=1.3.13',
  './intelligence.js?v=1.3.8',
  './map.js?v=1.4.14',
  './urban-neighborhoods-v1414.js?v=1.4.16',
  './need-territory-v1416.js?v=1.4.16',
  './direct-card-actions.js?v=1.4.08',
  './position.js?v=1.4.08',
  './stories.js?v=1.4.19',
  './agenda.js?v=1.3.22',
  './dossier.js?v=1.3.23',
  './positioning.js?v=1.3.25',
  './territorial-db.js?v=1.4.16-publica-1',
  './need-contacts-v1410.js?v=1.4.10',
  './communications.js?v=1.4.11',
  './responsive.js?v=1.3.36',
  './representative-docs-v1407.js?v=1.4.19',
  './institutional-directory.js?v=1.4.08',
  './batch-recipients.js?v=1.4.08',
  './assets/representante-jonathan-encabezado.png',
  './assets/mapa-giron-territorial.png',
  './assets/plano-basico-urbano-giron.jpg',
  './assets/Plano Basico Urbano Giron.pdf',
  './respaldo-integral-v1417.js?v=1.4.19',
  './pdf-portable-v1418.js?v=1.4.18',
  './manifest.json',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
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
  const u=new URL(e.request.url);
  if(u.pathname.endsWith('/index.html')||u.pathname.endsWith('/representative-docs-v1407.js')){
    e.respondWith(fetch(e.request,{cache:'no-store'}));return;
  }

  if(e.request.method!=='GET') return;
  const url=new URL(e.request.url);
  const isCore=url.pathname.endsWith('/') || url.pathname.endsWith('/index.html') || url.pathname.endsWith('/styles.css') || url.pathname.endsWith('/binary-storage-v1419.js') || url.pathname.endsWith('/respaldo-integral-v1417.js') || url.pathname.endsWith('/app.js') || url.pathname.endsWith('/leader-network-v1412.js') || url.pathname.endsWith('/photos.js') || url.pathname.endsWith('/pdf-portable-v1418.js') || url.pathname.endsWith('/petition.js') || url.pathname.endsWith('/contacts.js') || url.pathname.endsWith('/card-mass-share.js') || url.pathname.endsWith('/birthdays.js') || url.pathname.endsWith('/territory-link.js') || url.pathname.endsWith('/intelligence.js') || url.pathname.endsWith('/map.js') || url.pathname.endsWith('/urban-neighborhoods-v1414.js') || url.pathname.endsWith('/need-territory-v1416.js') || url.pathname.endsWith('/direct-card-actions.js') || url.pathname.endsWith('/position.js') || url.pathname.endsWith('/stories.js') || url.pathname.endsWith('/agenda.js') || url.pathname.endsWith('/dossier.js') || url.pathname.endsWith('/territorial-db.js') || url.pathname.endsWith('/need-contacts-v1410.js') || url.pathname.endsWith('/communications.js') || url.pathname.endsWith('/responsive.js') || url.pathname.endsWith('/institutional-directory.js') || url.pathname.endsWith('/batch-recipients.js') || url.pathname.endsWith('/representative-docs-v1407.js');
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
