/* Caché independiente: Floridablanca basada en la matriz v1.4.24. */
const CACHE = 'matriz-floridablanca-v118-completo-superpuesto';
const CORE = [
  './', './index.html', './styles.css?v=1.0.35',
  './floridablanca-guane-v106.css?v=1.0.6',
  './santander-electoral-v107.css?v=1.0.7',
  './contact-categories-v108.css?v=1.0.8',
  './future-commitments-v109.css?v=1.0.9',
  './watermark-v116.css?v=1.0.16',
  './watermark-v117.css?v=1.0.19',
  './watermark-v120.css?v=1.0.20',
  './dashboard-watermark-v118.css?v=1.1.8',
  './identidad-cercana-v124.css?v=1.0.24',
  './peticion-tactil-v125.css?v=1.0.27',
  './app.js?v=1.0.24',
  './catalogo-floridablanca-v103.js?v=1.0.3',
  './territorio-floridablanca.js?v=1.0.3',
  './ubicaciones-floridablanca-v104.js?v=1.0.4',
  './floridablanca-comunas.js?v=1.0',
  './santander-puestos-v107.js?v=1.0.7',
  './santander-electoral-v107.js?v=1.0.7',
  './contact-categories-v108.js?v=1.0.8',
  './binary-storage-v1419.js?v=1.4.19',
  './leader-network-v1412.js?v=1.4.12',
  './photos.js?v=1.4.19',
  './pdf-portable-v1418.js?v=1.0.35',
  './petition.js?v=1.0.35',
  './petition-recovery-v128.css?v=1.0.32',
  './contacts.js?v=1.0.24',
  './card-mass-share.js?v=1.4.22',
  './pdf-canvas-floridablanca-v110.js?v=1.0.10',
  './birthdays.js?v=1.0.24',
  './territory-link.js?v=1.0.9',
  './intelligence.js?v=1.0.24',
  './map.js?v=1.0.9',
  './urban-neighborhoods-v1414.js?v=1.0.11',
  './need-territory-v1416.js?v=1.4.16',
  './direct-card-actions.js?v=1.0.24',
  './position-simple-v1424.js?v=1.0.24',
  './stories.js?v=1.4.19',
  './agenda.js?v=1.3.22',
  './dossier.js?v=1.0.24',
  './positioning.js?v=1.3.25',
  './territorial-db.js?v=1.4.16-publica-1',
  './need-contacts-v1410.js?v=1.4.10',
  './communications.js?v=1.4.11',
  './responsive.js?v=1.3.36',
  './institutional-directory.js?v=1.0.26',
  './batch-recipients.js?v=1.0.26',
  './respaldo-integral-v1417.js?v=1.1.0',
  './manifest.json',
  './assets/icons/icon-192.png', './assets/icons/icon-512.png',
  './assets/marco-andres-marca.svg',
  './assets/icono-floridablanca.svg',
  './assets/floridablanca-header-landscape.svg',
  './assets/marco-andres-silva-lopez.jpeg',
  './assets/marca-agua-marco-palacio-v116.png',
  './assets/marca-agua-marco-palacio-completa-v115.png?v=1.1.8',
  './assets/mapa-floridablanca-rural.png',
  './assets/mapa-floridablanca-barrios.png',
  './assets/mapa-floridablanca-barrios-respaldo.jpg',
  './assets/mapa-floridablanca-comunas.png',
  './assets/mapa-santander.jpg'
];
const CORE_NAMES = new Set(CORE.map(s=>new URL(s,self.registration.scope).pathname));

self.addEventListener('install', event => event.waitUntil(
  // Un archivo cartográfico que falle temporalmente no debe bloquear la
  // actualización completa ni impedir que se utilice su imagen alternativa.
  caches.open(CACHE)
    .then(cache => Promise.all(CORE.map(file => cache.add(file).catch(err => {
      console.warn('Recurso disponible solo por red:', file, err);
    }))))
    .then(() => self.skipWaiting())
));

self.addEventListener('activate', event => event.waitUntil(
  caches.keys()
    .then(keys=>Promise.all(keys
      .filter(key=>key.startsWith('matriz-floridablanca-') && key!==CACHE)
      .map(key=>caches.delete(key))))
    .then(()=>self.clients.claim())
));

self.addEventListener('fetch', event => {
  if(event.request.method!=='GET') return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin) return;
  if(url.pathname.endsWith('/index.html')){
    event.respondWith(fetch(event.request,{cache:'no-store'}).catch(()=>caches.match('./index.html')));
    return;
  }
  if(CORE_NAMES.has(url.pathname)){
    event.respondWith(fetch(event.request,{cache:'no-store'}).then(response=>{
      const copy=response.clone();
      if(response.ok)caches.open(CACHE).then(cache=>cache.put(event.request,copy));
      return response;
    }).catch(()=>caches.match(event.request).then(hit=>hit||caches.match('./index.html'))));
    return;
  }
  event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request).then(response=>{
    if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}
    return response;
  })));
});
