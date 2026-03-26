/**
 * ToolBox Service Worker
 * Provides offline caching and PWA support
 */

const CACHE_NAME = 'toolbox-v1';
const STATIC_CACHE = 'toolbox-static-v1';

// Core files to cache for offline use
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/js/tools/pdf-tools.js',
  '/js/tools/pptx-tools.js',
  '/js/tools/image-tools.js',
  '/js/tools/text-tools.js',
  '/js/tools/calculators.js',
  '/js/tools/design-tools.js',
  '/js/tools/dev-tools.js',
  '/manifest.json',
  '/suggest.html',
  // Tool pages
  '/tools/pdf-to-word.html',
  '/tools/word-to-pdf.html',
  '/tools/pdf-merger.html',
  '/tools/pdf-splitter.html',
  '/tools/pptx-to-pdf.html',
  '/tools/image-compressor.html',
  '/tools/image-converter.html',
  '/tools/image-resizer.html',
  '/tools/word-counter.html',
  '/tools/case-converter.html',
  '/tools/remove-diacritics.html',
  '/tools/lorem-ipsum.html',
  '/tools/text-to-speech.html',
  '/tools/base64.html',
  '/tools/url-encoder.html',
  '/tools/age-calculator.html',
  '/tools/bmi-calculator.html',
  '/tools/currency-converter.html',
  '/tools/percentage-calculator.html',
  '/tools/loan-calculator.html',
  '/tools/color-picker.html',
  '/tools/qr-generator.html',
  '/tools/favicon-generator.html',
  '/tools/gradient-generator.html',
  '/tools/my-ip.html',
  '/tools/password-generator.html',
  '/tools/json-formatter.html',
  '/tools/minifier.html',
  '/tools/regex-tester.html',
  '/tools/markdown-preview.html',
];

// Install: cache all core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
      .catch(err => console.warn('[SW] Install cache failed:', err))
  );
});

// Activate: clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME && k !== STATIC_CACHE)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: Cache-first for static assets, network-first for API calls
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Skip non-GET and external non-CDN requests that may fail
  if (event.request.method !== 'GET') return;

  // For CDN libraries: network-first with cache fallback
  if (url.hostname !== self.location.hostname && !url.hostname.includes('fonts.')) {
    event.respondWith(
      fetch(event.request)
        .then(resp => {
          if (resp && resp.status === 200) {
            const respClone = resp.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, respClone));
          }
          return resp;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // For same-origin: cache-first strategy
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(resp => {
        if (!resp || resp.status !== 200 || resp.type === 'opaque') return resp;

        const respClone = resp.clone();
        caches.open(STATIC_CACHE).then(cache => cache.put(event.request, respClone));
        return resp;
      }).catch(() => {
        // Return offline fallback for HTML pages
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('/index.html');
        }
      });
    })
  );
});

// Background sync: notify clients when new version available
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
