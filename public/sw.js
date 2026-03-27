self.addEventListener('install', (e) => {
  console.log('[Nova Service Worker] Installed');
  self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  // Pass-through fetch: Satisfies the browser's PWA install requirement 
  // without messing up Next.js's internal routing!
  return;
});