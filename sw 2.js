/**
 * Service Worker for KOR Website
 * Provides caching, offline functionality, and performance optimization
 */

const CACHE_NAME = 'kor-website-v1.2';
const STATIC_CACHE = 'kor-static-v1.2';
const DYNAMIC_CACHE = 'kor-dynamic-v1.2';
const IMAGE_CACHE = 'kor-images-v1.2';

// Critical resources to cache immediately
const CRITICAL_RESOURCES = [
  '/',
  '/index.html',
  '/styles/styles.css',
  '/js/performance.js',
  '/images/KOR_app_Logo.png',
  '/images/wilson_background-min.JPG',
  '/images/wilson_background_2-min.JPG'
];

// Pages to cache
const PAGES_TO_CACHE = [
  '/our_app.html',
  '/our_story.html',
  '/contact_us.html',
  '/sign_up.html',
  '/FAQ.html',
  '/personal_plans.html'
];

// Images to cache
const IMAGES_TO_CACHE = [
  '/images/Google_play_button.svg',
  '/images/Apple_app_store_button.svg',
  '/images/facebook.png',
  '/images/instagram.png',
  '/images/BikeDashboard.png',
  '/images/BikeSettings.png',
  '/images/PartPopup.png',
  '/images/PartSettings.png',
  '/images/PartVisibility.png',
  '/images/WelcomeScreenshot.png'
];

// Install event - cache critical resources
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');

  event.waitUntil(
    Promise.all([
      // Cache critical resources
      caches.open(STATIC_CACHE).then(cache => {
        console.log('Service Worker: Caching critical resources');
        return cache.addAll(CRITICAL_RESOURCES);
      }),

      // Cache pages
      caches.open(DYNAMIC_CACHE).then(cache => {
        console.log('Service Worker: Caching pages');
        return cache.addAll(PAGES_TO_CACHE);
      }),

      // Cache images
      caches.open(IMAGE_CACHE).then(cache => {
        console.log('Service Worker: Caching images');
        return cache.addAll(IMAGES_TO_CACHE);
      })
    ]).then(() => {
      console.log('Service Worker: Installation complete');
      return self.skipWaiting();
    })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');

  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (
              cacheName !== STATIC_CACHE &&
              cacheName !== DYNAMIC_CACHE &&
              cacheName !== IMAGE_CACHE
            ) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external requests (except fonts)
  if (url.origin !== location.origin && !isFontRequest(request)) {
    return;
  }

  // Apply different strategies based on resource type
  if (isImageRequest(request)) {
    event.respondWith(imageStrategy(request));
  } else if (isHTMLRequest(request)) {
    event.respondWith(htmlStrategy(request));
  } else if (isCSSOrJSRequest(request)) {
    event.respondWith(staticStrategy(request));
  } else if (isFontRequest(request)) {
    event.respondWith(fontStrategy(request));
  } else {
    event.respondWith(genericStrategy(request));
  }
});

// Cache strategies
async function imageStrategy(request) {
  try {
    // Try cache first, then network
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);

    // Cache the response for future use
    if (networkResponse.ok) {
      const cache = await caches.open(IMAGE_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Image strategy failed', error);
    // Return a placeholder image if available
    return (
      caches.match('/images/placeholder.png') ||
      new Response('Image not available', { status: 404 })
    );
  }
}

async function htmlStrategy(request) {
  try {
    // Network first for HTML to get fresh content
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }

    throw new Error('Network response not ok');
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache');
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page if available
    return (
      caches.match('/offline.html') ||
      new Response('Page not available offline', {
        status: 404,
        headers: { 'Content-Type': 'text/html' }
      })
    );
  }
}

async function staticStrategy(request) {
  try {
    // Cache first for static resources
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Static strategy failed', error);
    return new Response('Resource not available', { status: 404 });
  }
}

async function fontStrategy(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Font strategy failed', error);
    return new Response('Font not available', { status: 404 });
  }
}

async function genericStrategy(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    return await fetch(request);
  } catch (error) {
    console.log('Service Worker: Generic strategy failed', error);
    return new Response('Resource not available', { status: 404 });
  }
}

// Helper functions
function isImageRequest(request) {
  return request.url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
}

function isHTMLRequest(request) {
  return (
    request.headers.get('accept')?.includes('text/html') ||
    request.url.endsWith('.html') ||
    !request.url.includes('.')
  );
}

function isCSSOrJSRequest(request) {
  return request.url.match(/\.(css|js)$/i);
}

function isFontRequest(request) {
  return (
    request.url.includes('fonts.googleapis.com') ||
    request.url.match(/\.(woff|woff2|ttf|eot)$/i)
  );
}

// Background sync for form submissions
self.addEventListener('sync', event => {
  console.log('Service Worker: Background sync triggered', event.tag);

  if (event.tag === 'contact-form') {
    event.waitUntil(syncContactForm());
  }
});

async function syncContactForm() {
  try {
    // Retrieve pending form data from IndexedDB
    const formData = await getFormDataFromIndexedDB();

    if (formData) {
      const response = await fetch('/submit-contact', {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        await clearFormDataFromIndexedDB();
        console.log('Form submitted successfully via background sync');
      }
    }
  } catch (error) {
    console.log('Background sync failed:', error);
  }
}

// Push notifications
self.addEventListener('push', event => {
  console.log('Service Worker: Push received');

  const options = {
    body: event.data ? event.data.text() : 'New update available!',
    icon: '/images/KOR_app_Logo.png',
    badge: '/images/KOR_app_Logo.png',
    vibrate: [200, 100, 200],
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/images/view-icon.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/images/dismiss-icon.png'
      }
    ]
  };

  event.waitUntil(self.registration.showNotification('KOR Update', options));
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  console.log('Notification clicked:', event.action);

  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(clients.openWindow('/'));
  }
});

// Periodically clean up caches
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'CLEANUP_CACHES') {
    event.waitUntil(cleanupCaches());
  }
});

async function cleanupCaches() {
  const cacheNames = await caches.keys();
  const oldCaches = cacheNames.filter(
    name => !name.includes('v1.2') && name.startsWith('kor-')
  );

  await Promise.all(oldCaches.map(cacheName => caches.delete(cacheName)));

  console.log('Cache cleanup completed');
}

// Utility functions for IndexedDB (simplified)
async function getFormDataFromIndexedDB() {
  // Implement IndexedDB retrieval
  return null;
}

async function clearFormDataFromIndexedDB() {
  // Implement IndexedDB clearing
  return Promise.resolve();
}

console.log('Service Worker: Script loaded');
