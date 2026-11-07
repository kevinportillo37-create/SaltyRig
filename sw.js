// Saltwater Rig & Knot Guide: offline cache
// Bump the version number whenever you change index.html so phones pick up the update.
const CACHE = "saltyrig-v9";
const ASSETS = [
    "./",
    "./index.html",
    "./regulations.json",
    "./manifest.json",
    "./icon-192.png",
    "./icon-512.png",
    "./apple-touch-icon.png"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
            .then(() => self.clients.claim())
    );
});

// Serve from cache right away, then refresh the cache in the background when there's signal
self.addEventListener("fetch", event => {
    const request = event.request;
    if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;

    event.respondWith(
        caches.match(request, { ignoreSearch: true }).then(cached => {
            const fromNetwork = fetch(request)
                .then(response => {
                    if (response.ok) {
                        const copy = response.clone();
                        caches.open(CACHE).then(cache => cache.put(request, copy));
                    }
                    return response;
                })
                .catch(() => cached || caches.match("./index.html"));
            return cached || fromNetwork;
        })
    );
});
