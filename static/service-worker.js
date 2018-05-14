self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();

        const title = data.title;
        const options = {
            body: data.body,
            icon: data.icon || 'http://codeshala.org/assets/favicon/android-icon-192x192.png',
            tag: data.tag || 'default',
            data: data.url,
        };

        event.waitUntil(
            self.registration.showNotification(title, options),
        );
    }
});

self.addEventListener('pushsubscriptionchange', (event) => {
    const options = event.oldSubscription.options;
    // Fetch options if they do not exist in the event.
    event.waitUntil(
        self.registration.pushManager.subscribe(options)
            .then((subscription) => { // eslint-disable-line no-unused-vars
                // Send new subscription to application server.
            }),
    );
});

self.addEventListener('notificationclick', (event) => {
    let url = 'http://codeshala.org/';
    if (event.notification.data) {
        url = event.notification.data;
    }

    event.notification.close();

    event.waitUntil(
        self.clients.matchAll({
            type: 'window',
        }).then((clientList) => {
            for (let i = 0; i < clientList.length; i += 1) {
                const client = clientList[i];
                const found = client.url === url || client.url === `${url}/`;
                if (found && 'focus' in client) {
                    client.focus();
                    return;
                }
            }
            if (self.clients.openWindow) {
                self.clients.openWindow(url);
            }
        }),
    );
});

const CACHE_VERSION = 1;
let CURRENT_CACHES = {
    offline: 'offline-v' + CACHE_VERSION
};
const OFFLINE_URL = 'offline.html';

function createCacheBustedRequest(url) {
    let request = new Request(url, {cache: 'reload'});
    if ('cache' in request) {
        return request;
    }
    let bustedUrl = new URL(url, self.location.href);
    bustedUrl.search += (bustedUrl.search ? '&' : '') + 'cachebust=' + Date.now();
    return new Request(bustedUrl);
}

self.addEventListener('install', event => {
    event.waitUntil(
        fetch(createCacheBustedRequest(OFFLINE_URL)).then(function(response) {
            return caches.open(CURRENT_CACHES.offline).then(function(cache) {
                return cache.put(OFFLINE_URL, response);
            });
        })
    );
});

self.addEventListener('activate', event => {
    let expectedCacheNames = Object.keys(CURRENT_CACHES).map(function(key) {
        return CURRENT_CACHES[key];
    });

    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (expectedCacheNames.indexOf(cacheName) === -1) {
                        //console.log('Deleting out of date cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', event => {
    if (event.request.mode === 'navigate' ||
        (event.request.method === 'GET' &&
            event.request.headers.get('accept').includes('text/html'))) {
        //console.log('Handling fetch event for', event.request.url);
        event.respondWith(
            fetch(createCacheBustedRequest(event.request.url)).catch(error => {
                //console.log('Fetch failed; returning offline page instead.', error);
                return caches.match(OFFLINE_URL);
            })
        );
    }else{
        //console.log('Incorrect request');
    }
});