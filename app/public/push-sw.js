// Akşam hatırlatması: sunucu boş bir push gönderir (içerik yok); metni burada yazarız. Service worker'a importScripts ile eklenir.
self.addEventListener('push', event => {
  event.waitUntil(self.registration.showNotification('Hoca Nova', {
    body: 'Bugünkü 3 dakikan seni bekliyor. Kısa bir tekrarla serini koru 🔥',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'aksam-hatirlatma',
    renotify: false,
  }))
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  event.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    const open = wins.find(w => new URL(w.url).origin === self.location.origin)
    if (open) return open.focus()
    return self.clients.openWindow('/')
  })())
})
