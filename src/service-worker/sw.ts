/**
 * Enhanced Service Worker with Offline Support
 * Features: Caching, Background Sync, Offline Fallback
 */

import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

// Service Worker type declarations
interface ExtendableEvent extends Event {
  waitUntil(promise: Promise<unknown>): void;
}

interface FetchEvent extends ExtendableEvent {
  request: Request;
  respondWith(response: Promise<Response> | Response): void;
}

interface ExtendableMessageEvent extends ExtendableEvent {
  data: { type?: string; [key: string]: unknown };
}

interface PushEvent extends ExtendableEvent {
  data?: {
    text(): string;
    json(): Record<string, unknown>;
  };
}

declare const self: ServiceWorkerGlobalScope & {
  addEventListener(type: 'fetch', listener: (event: FetchEvent) => void): void;
  addEventListener(type: 'sync', listener: (event: ExtendableEvent & { tag: string }) => void): void;
  addEventListener(type: 'message', listener: (event: ExtendableMessageEvent) => void): void;
  addEventListener(type: 'activate', listener: (event: ExtendableEvent) => void): void;
  addEventListener(type: 'push', listener: (event: PushEvent) => void): void;
  skipWaiting(): Promise<void>;
  registration: ServiceWorkerRegistration;
  __WB_MANIFEST: Array<{ url: string; revision: string }>;
};

interface Clients {
  claim(): Promise<void>;
}

declare const clients: Clients;

// Precache all static assets
precacheAndRoute(self.__WB_MANIFEST);

// Clean up old caches
cleanupOutdatedCaches();

// Cache configuration
const CACHE_NAMES = {
  API: 'api-cache-v1',
  IMAGES: 'images-cache-v1',
  STATIC: 'static-cache-v1',
  RUNTIME: 'runtime-cache-v1'
};

// API caching with background sync
const bgSyncPlugin = new BackgroundSyncPlugin('api-queue', {
  maxRetentionTime: 24 * 60 // Retry for up to 24 hours
});

// Cache API responses
registerRoute(
  ({ url }) => url.pathname.includes('/api/') || url.pathname.includes('script.google.com'),
  new NetworkFirst({
    cacheName: CACHE_NAMES.API,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200]
      }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60, // 5 minutes
        purgeOnQuotaError: true
      }),
      bgSyncPlugin
    ]
  })
);

// Cache images
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: CACHE_NAMES.IMAGES,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200]
      }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        purgeOnQuotaError: true
      })
    ]
  })
);

// Cache CSS and JS files
registerRoute(
  ({ request }) =>
    request.destination === 'style' ||
    request.destination === 'script',
  new StaleWhileRevalidate({
    cacheName: CACHE_NAMES.STATIC,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200]
      })
    ]
  })
);

// Cache fonts
registerRoute(
  ({ url }) =>
    url.origin === 'https://fonts.googleapis.com' ||
    url.origin === 'https://fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'google-fonts',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200]
      })
    ]
  })
);

// App shell route with improved denylist
registerRoute(
  new NavigationRoute(
    createHandlerBoundToURL('/index.html'),
    {
      // More specific denylist to prevent over-blocking
      denylist: [
        /^\/_/,           // System routes
        /\/api\//,        // API routes
        /\/__/,           // Build artifacts
        /\.map$/,         // Source maps
        /\.json$/,        // JSON files (except manifest)
        /\.txt$/,         // Text files
        /\.xml$/,         // XML files
      ]
    }
  )
);

// Handle offline fallback with better error handling
self.addEventListener('fetch', (event: FetchEvent) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(async (error) => {
        // Log 404 errors for debugging
        if (process.env.NODE_ENV === 'development') {
          console.error('Navigation fetch failed:', event.request.url, error);
        }

        // Try to serve from cache
        const cached = await caches.match(event.request);
        if (cached) {
          return cached;
        }

        // Try to serve index.html as fallback
        const indexCache = await caches.match('/index.html');
        if (indexCache) {
          return indexCache;
        }

        // Last resort: offline message
        return new Response('Offline - Please check your internet connection', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'text/plain' }
        });
      })
    );
  }
});

// Background sync for failed API calls
self.addEventListener('sync', (event: ExtendableEvent & { tag: string }) => {
  if (event.tag === 'sync-api-data') {
    event.waitUntil(syncApiData());
  }
});

async function syncApiData() {
  try {
    // Sync any pending data
    const cache = await caches.open(CACHE_NAMES.API);
    const requests = await cache.keys();

    for (const request of requests) {
      try {
        const response = await fetch(request);
        await cache.put(request, response.clone());
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Sync failed for:', request.url);
        }
      }
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Background sync failed:', error);
    }
  }
}

// Skip waiting and claim clients
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    clients.claim().then(() => {
      // Clean up old caches
      return caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => !Object.values(CACHE_NAMES).includes(cacheName))
            .map(cacheName => caches.delete(cacheName))
        );
      });
    })
  );
});

// Listen for push notifications (future feature)
self.addEventListener('push', (event: PushEvent) => {
  const options = {
    body: event.data?.text() || 'New update available',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    vibrate: [200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification('Student Dashboard', options)
  );
});

// Service worker configured - see workbox settings above for cache strategies