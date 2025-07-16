// 缓存版本
const CACHE_NAME = 'just-in-time-v1';
const CACHE_FILES = [
  '/',
  '/index.html',
  '/css/global.css',
  '/css/home.css',
  '/css/stats.css',
  '/css/wardrobe.css',
  '/css/settings.css',
  '/assets/audio/track1.mp3',
  '/assets/audio/track2.mp3',
  '/assets/audio/track3.mp3',
  '/assets/icons/icon-192.png',
  '/assets/icons/icon-512.png',
  '/assets/icons/apple-touch-icon.png'
];

// 安装：缓存静态资源
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CACHE_FILES);
    })
  );
});

// 激活：清理旧缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys
        .filter(key => key !== CACHE_NAME)
        .map(key => caches.delete(key))
      );
    })
  );
});

// 拦截请求：优先缓存
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

// 推送通知
self.addEventListener('push', event => {
  const data = event.data.json();
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/assets/icons/icon-192.png'
  });
});
