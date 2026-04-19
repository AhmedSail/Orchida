const CACHE_NAME = "orchida-pwa-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener("fetch", (event) => {
  // We use a basic network-first strategy or just pass through.
  // The fetch listener is required for Chrome to trigger "Add to Home Screen" (PWA install prompt).
  event.respondWith(
    fetch(event.request).catch(() => {
      // Return a basic fallback if offline
      return new Response("Network error, please check your connection.");
    })
  );
});
