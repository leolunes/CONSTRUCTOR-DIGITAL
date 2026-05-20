// =====================================
// NOMBRE CACHE
// =====================================

const CACHE_NAME = 'como-el-ha-dicho-v1';

// =====================================
// ARCHIVOS A CACHEAR
// =====================================

const urlsToCache = [

    '/',

    '/index.html',

    '/categoria.html',

    '/favoritos.html',

    '/perfil.html',

    '/css/styles.css',

    '/css/cards.css',

    '/css/animations.css',

    '/css/responsive.css',

    '/js/app.js',

    '/js/categoria.js',

    '/js/favoritos.js',

    '/js/storage.js',

    '/js/ui.js',

    '/js/router.js',

    '/js/audio.js',

    '/js/buscador.js',

    '/js/categorias.js',

    '/js/declaraciones.js',

    '/data/categorias.json',

    '/data/declaraciones.json',

    '/data/subcategorias.json',

    '/data/planes.json'

];

// =====================================
// INSTALAR SERVICE WORKER
// =====================================

self.addEventListener('install', event => {

    event.waitUntil(

        caches.open(CACHE_NAME)

        .then(cache => {

            return cache.addAll(urlsToCache);

        })

    );

});

// =====================================
// ACTIVAR SERVICE WORKER
// =====================================

self.addEventListener('activate', event => {

    event.waitUntil(

        caches.keys().then(cacheNames => {

            return Promise.all(

                cacheNames.map(cache => {

                    if(cache !== CACHE_NAME){

                        return caches.delete(cache);

                    }

                })

            );

        })

    );

});

// =====================================
// FETCH
// =====================================

self.addEventListener('fetch', event => {

    event.respondWith(

        caches.match(event.request)

        .then(response => {

            return response || fetch(event.request);

        })

    );

});