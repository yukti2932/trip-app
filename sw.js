const CACHE_NAME = 'triosync-v33-offline'; // Bumped version to force update
const ASSETS_TO_CACHE = [
    './',                 // Cache the directory root
    './index.html',       // Cache the file explicitly
    'https://cdn.tailwindcss.com',
    'https://unpkg.com/lucide@latest',
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
    'https://fonts.googleapis.com/css2?family=Karma:wght@400;600;700&family=Patrick+Hand&family=Gentium+Book+Plus:ital,wght@0,400;0,700;1,400&display=swap',
    'https://www.transparenttextures.com/patterns/rice-paper-2.png',
    'https://www.transparenttextures.com/patterns/black-scales.png',
    'https://www.transparenttextures.com/patterns/leather.png',
    'https://www.transparenttextures.com/patterns/cream-paper.png',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Mandala_61.svg/1024px-Mandala_61.svg.png'
];

// 1. INSTALL: Cache all assets immediately
self.addEventListener('install', (event) => {
    // Force the waiting service worker to become the active service worker
    self.skipWaiting();
    
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Caching offline assets...');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// 2. ACTIVATE: Clean up old caches and take control
self.addEventListener('activate', (event) => {
    event.waitUntil(
        Promise.all([
            // Enable navigation preload if supported
            self.registration.navigationPreload ? self.registration.navigationPreload.enable() : Promise.resolve(),
            // Delete old caches
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            // Take control of all clients immediately
            self.clients.claim()
        ])
    );
});

// 3. FETCH: Handle requests
self.addEventListener('fetch', (event) => {
    // NAVIGATION HANDLER (The fix for "doesn't launch")
    // If the user requests a page (HTML), serve index.html from cache
    if (event.request.mode === 'navigate') {
        event.respondWith(
            (async () => {
                try {
                    // Try the network first (to get latest data if online)
                    const networkResponse = await fetch(event.request);
                    return networkResponse;
                } catch (error) {
                    // If network fails (Offline), serve the cached index.html
                    const cachedResponse = await caches.match('./index.html');
                    return cachedResponse;
                }
            })()
        );
        return;
    }

    // ASSET HANDLER (Images, Scripts, Styles)
    // Stale-while-revalidate strategy: serve cache first, then update in background
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || fetch(event.request);
        })
    );
});
