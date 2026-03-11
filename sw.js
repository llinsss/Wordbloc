// Service Worker for SpellBloc - Offline Support
const CACHE_NAME = 'spellbloc-v1.0.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/game.js',
    '/advanced-systems.js',
    '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version or fetch from network
                return response || fetch(event.request);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Background sync for analytics data
self.addEventListener('sync', (event) => {
    if (event.tag === 'analytics-sync') {
        event.waitUntil(syncAnalyticsData());
    }
});

async function syncAnalyticsData() {
    try {
        // Get pending analytics data from IndexedDB
        const data = await getPendingAnalytics();
        
        // Send to server (placeholder)
        await fetch('/api/analytics', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        // Clear pending data after successful sync
        await clearPendingAnalytics();
    } catch (error) {
        console.log('Analytics sync failed, will retry later');
    }
}

// Placeholder functions for IndexedDB operations
async function getPendingAnalytics() {
    return JSON.parse(localStorage.getItem('spellbloc_pending_analytics') || '[]');
}

async function clearPendingAnalytics() {
    localStorage.removeItem('spellbloc_pending_analytics');
}

// Push notifications for engagement (if user opts in)
self.addEventListener('push', (event) => {
    const options = {
        body: 'Time for some spelling practice! 📚✨',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: 'spelling-reminder',
        actions: [
            {
                action: 'play',
                title: 'Start Playing',
                icon: '/play-icon.png'
            },
            {
                action: 'dismiss',
                title: 'Maybe Later',
                icon: '/dismiss-icon.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('SpellBloc Reminder', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'play') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});