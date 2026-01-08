const CACHE_NAME = 'triosync-v32-offline';
const ASSETS_TO_CACHE = [
    './index.html',
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

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
