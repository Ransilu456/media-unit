self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

self.addEventListener('push', (event) => {
  if (!event.data) return;
  try {
    const data = event.data.json();
    const title = data.title || 'Agradhi Media Unit';
    const options = {
      body: data.body || data.message || 'New notification',
      icon: '/Agradhi.png',
      badge: '/icons/icon-192.png',
      vibrate: [200, 100, 200],
      tag: data.id || 'agradhi-notification',
      data: {
        url: data.url || '/dashboard',
      },
    };
    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.warn('[sw push event error]', err);
  }
});
