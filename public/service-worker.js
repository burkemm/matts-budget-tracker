// Referenced service-worker.js in the 23-Stu-Mini-Project as suggested in the homework read-me file.
const FILES_TO_CACHE = [
    "/",
    "/index.js",
    "/manifest.webmanifest",
    "/styles.css",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png"
  ];
  
  const cache_Static = "static-cache-v1";
  const cache_Runtime = "runtime-cache";
  // This event listener is for installation. It waits for install to be triggered and then opens the cache_Static and then adds to FILES_TO_CACHE.
  self.addEventListener("install", event => {
    event.waitUntil(
      caches
        .open(cache_Static)
        .then(cache => cache.addAll(FILES_TO_CACHE))
        .then(() => self.skipWaiting())
    );
  });
  
  // This event handler for activate deletes old caches using a Promise.
  self.addEventListener("activate", event => {
    const currentCaches = [cache_Static, cache_Runtime];
    event.waitUntil(
      caches
        .keys()
        .then(cacheNames => {
          // return array of cache names that are old to delete
          return cacheNames.filter(
            cacheName => !currentCaches.includes(cacheName)
          );
        })
        .then(cachesToDelete => {
          return Promise.all(
            cachesToDelete.map(cacheToDelete => {
              return caches.delete(cacheToDelete);
            })
          );
        })
        .then(() => self.clients.claim())
    );
  });
  // This fetch event handler does a few things.
  self.addEventListener("fetch", event => {
    // The if statement dictates that non-Get requests won't be cached. It also dictates other origin requests also won't be cached.
    if (
      event.request.method !== "GET" ||
      !event.request.url.startsWith(self.location.origin)
    ) {
      event.respondWith(fetch(event.request));
      return;
    }
  
    // This if statement starts with analyzing the request to the route.
    if (event.request.url.includes("/api/images")) {
      // The event response will send a network request, and if the request fails the cache will be used as an offline fallback.
      event.respondWith(
        caches.open(cache_Runtime).then(cache => {
          return fetch(event.request)
            .then(response => {
              cache.put(event.request, response.clone());
              return response;
            })
            .catch(() => caches.match(event.request));
        })
      );
      return;
    }
  
    // This event responds with using cache as a priority for all other performance requests.
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
  
        // This implied else statement opens the cache_runtime to see if a request is in the cache. 
        // If not in the cache, it will make a network request and cache the response.
        return caches.open(cache_Runtime).then(cache => {
          return fetch(event.request).then(response => {
            return cache.put(event.request, response.clone()).then(() => {
              return response;
            });
          });
        });
      })
    );
  });
  