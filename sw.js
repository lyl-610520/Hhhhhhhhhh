/**
 * Just in Time PWA Service Worker
 * 提供离线功能和后台同步
 */

const CACHE_NAME = 'just-in-time-v1.0.0';
const RUNTIME_CACHE = 'just-in-time-runtime';

// 需要缓存的核心资源
const CORE_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/styles/main.css',
    '/scripts/main.js',
    '/scripts/pwa.js',
    
    // 字体资源
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans+SC:wght@300;400;500;600;700&display=swap',
    
    // 外部库
    'https://cdn.jsdelivr.net/npm/chart.js',
    
    // 图标（如果有的话）
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

// 运行时缓存的资源模式
const RUNTIME_CACHE_PATTERNS = [
    // 天气API
    /^https:\/\/api\.weatherapi\.com\//,
    // Google Fonts
    /^https:\/\/fonts\.googleapis\.com\//,
    /^https:\/\/fonts\.gstatic\.com\//,
    // CDN 资源
    /^https:\/\/cdn\.jsdelivr\.net\//
];

// ================================================
// Service Worker 安装
// ================================================

self.addEventListener('install', (event) => {
    console.log('[SW] 开始安装 Service Worker');
    
    event.waitUntil(
        (async () => {
            try {
                const cache = await caches.open(CACHE_NAME);
                console.log('[SW] 开始缓存核心资源');
                
                // 缓存核心资源
                await cache.addAll(CORE_ASSETS);
                console.log('[SW] 核心资源缓存完成');
                
                // 跳过等待，立即激活
                self.skipWaiting();
                
            } catch (error) {
                console.error('[SW] 安装失败:', error);
            }
        })()
    );
});

// ================================================
// Service Worker 激活
// ================================================

self.addEventListener('activate', (event) => {
    console.log('[SW] 激活 Service Worker');
    
    event.waitUntil(
        (async () => {
            try {
                // 清理旧缓存
                const cacheNames = await caches.keys();
                const oldCaches = cacheNames.filter(name => 
                    name.startsWith('just-in-time-') && name !== CACHE_NAME && name !== RUNTIME_CACHE
                );
                
                await Promise.all(
                    oldCaches.map(name => {
                        console.log('[SW] 删除旧缓存:', name);
                        return caches.delete(name);
                    })
                );
                
                // 立即控制所有客户端
                await self.clients.claim();
                console.log('[SW] Service Worker 激活完成');
                
            } catch (error) {
                console.error('[SW] 激活失败:', error);
            }
        })()
    );
});

// ================================================
// 网络请求拦截
// ================================================

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // 只处理同源请求和允许的外部请求
    if (shouldHandleRequest(request)) {
        event.respondWith(handleRequest(request));
    }
});

// 判断是否应该处理请求
function shouldHandleRequest(request) {
    const url = new URL(request.url);
    
    // 跳过 chrome-extension 等特殊协议
    if (!url.protocol.startsWith('http')) {
        return false;
    }
    
    // 跳过POST请求（通常是API调用）
    if (request.method !== 'GET') {
        return false;
    }
    
    return true;
}

// 处理请求的主要逻辑
async function handleRequest(request) {
    const url = new URL(request.url);
    
    try {
        // 1. 核心资源：缓存优先策略
        if (isCoreAsset(request)) {
            return await cacheFirst(request);
        }
        
        // 2. 运行时资源：网络优先，失败时使用缓存
        if (isRuntimeCacheable(request)) {
            return await networkFirst(request);
        }
        
        // 3. 天气API：网络优先，失败时返回默认数据
        if (url.hostname === 'api.weatherapi.com') {
            return await handleWeatherRequest(request);
        }
        
        // 4. 其他请求：直接网络请求
        return await fetch(request);
        
    } catch (error) {
        console.error('[SW] 请求处理失败:', error);
        
        // 如果是导航请求，返回离线页面
        if (request.mode === 'navigate') {
            const cache = await caches.open(CACHE_NAME);
            return await cache.match('/index.html');
        }
        
        // 其他请求返回网络错误
        return new Response('Network Error', {
            status: 408,
            headers: { 'Content-Type': 'text/plain' }
        });
    }
}

// 判断是否为核心资源
function isCoreAsset(request) {
    const url = new URL(request.url);
    return CORE_ASSETS.some(asset => {
        if (asset.startsWith('http')) {
            return url.href === asset;
        } else {
            return url.pathname === asset;
        }
    });
}

// 判断是否为运行时可缓存资源
function isRuntimeCacheable(request) {
    const url = new URL(request.url);
    return RUNTIME_CACHE_PATTERNS.some(pattern => pattern.test(url.href));
}

// 缓存优先策略
async function cacheFirst(request) {
    try {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // 缓存中没有，从网络获取并缓存
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            await cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
        
    } catch (error) {
        console.error('[SW] 缓存优先策略失败:', error);
        throw error;
    }
}

// 网络优先策略
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // 缓存成功的响应
            const cache = await caches.open(RUNTIME_CACHE);
            await cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
        
    } catch (error) {
        console.log('[SW] 网络请求失败，尝试缓存:', request.url);
        
        // 网络失败，尝试缓存
        const cache = await caches.open(RUNTIME_CACHE);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        throw error;
    }
}

// 处理天气API请求
async function handleWeatherRequest(request) {
    try {
        // 尝试网络请求
        const response = await fetch(request);
        
        if (response.ok) {
            // 缓存天气数据（有效期10分钟）
            const cache = await caches.open(RUNTIME_CACHE);
            const clonedResponse = response.clone();
            
            // 添加时间戳到缓存
            const headers = new Headers(clonedResponse.headers);
            headers.set('sw-cached-at', Date.now().toString());
            
            const cachedResponse = new Response(clonedResponse.body, {
                status: clonedResponse.status,
                statusText: clonedResponse.statusText,
                headers: headers
            });
            
            await cache.put(request, cachedResponse);
            return response;
        }
        
        throw new Error('Weather API response not ok');
        
    } catch (error) {
        console.log('[SW] 天气API请求失败，检查缓存');
        
        // 检查缓存
        const cache = await caches.open(RUNTIME_CACHE);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            const cachedAt = cachedResponse.headers.get('sw-cached-at');
            const now = Date.now();
            const cacheAge = now - parseInt(cachedAt || '0');
            
            // 如果缓存不超过10分钟，使用缓存
            if (cacheAge < 10 * 60 * 1000) {
                return cachedResponse;
            }
        }
        
        // 返回默认天气数据
        return new Response(JSON.stringify({
            location: { name: '未知位置' },
            current: {
                temp_c: 22,
                condition: { text: '晴', code: 1000 },
                humidity: 60,
                wind_kph: 5
            }
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// ================================================
// 后台同步
// ================================================

self.addEventListener('sync', (event) => {
    console.log('[SW] 后台同步事件:', event.tag);
    
    if (event.tag === 'background-sync') {
        event.waitUntil(handleBackgroundSync());
    }
});

// 处理后台同步
async function handleBackgroundSync() {
    try {
        console.log('[SW] 执行后台同步');
        
        // 这里可以添加需要后台同步的逻辑
        // 例如：同步离线时的打卡数据
        
        // 通知客户端同步完成
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'BACKGROUND_SYNC_COMPLETE'
            });
        });
        
    } catch (error) {
        console.error('[SW] 后台同步失败:', error);
    }
}

// ================================================
// 推送通知
// ================================================

self.addEventListener('push', (event) => {
    console.log('[SW] 收到推送消息');
    
    const options = {
        body: '记得完成今天的打卡哦！',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            url: '/',
            timestamp: Date.now()
        },
        actions: [
            {
                action: 'open',
                title: '打开应用'
            },
            {
                action: 'dismiss',
                title: '稍后提醒'
            }
        ]
    };
    
    if (event.data) {
        try {
            const data = event.data.json();
            options.body = data.body || options.body;
            options.title = data.title || 'Just in Time';
        } catch (error) {
            console.error('[SW] 解析推送数据失败:', error);
        }
    }
    
    event.waitUntil(
        self.registration.showNotification('Just in Time', options)
    );
});

// 处理通知点击
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] 通知被点击:', event.action);
    
    event.notification.close();
    
    if (event.action === 'open' || !event.action) {
        // 打开应用
        event.waitUntil(
            clients.matchAll({ type: 'window' }).then(clientList => {
                // 如果应用已经打开，聚焦到该窗口
                for (const client of clientList) {
                    if (client.url === '/' && 'focus' in client) {
                        return client.focus();
                    }
                }
                
                // 否则打开新窗口
                if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            })
        );
    } else if (event.action === 'dismiss') {
        // 稍后提醒逻辑
        console.log('[SW] 用户选择稍后提醒');
    }
});

// ================================================
// 消息处理
// ================================================

self.addEventListener('message', (event) => {
    console.log('[SW] 收到客户端消息:', event.data);
    
    if (event.data && event.data.type) {
        switch (event.data.type) {
            case 'SKIP_WAITING':
                self.skipWaiting();
                break;
                
            case 'GET_VERSION':
                event.ports[0].postMessage({ version: CACHE_NAME });
                break;
                
            case 'CLEAR_CACHE':
                event.waitUntil(clearAllCaches());
                break;
                
            default:
                console.log('[SW] 未知消息类型:', event.data.type);
        }
    }
});

// 清理所有缓存
async function clearAllCaches() {
    try {
        const cacheNames = await caches.keys();
        await Promise.all(
            cacheNames.map(name => {
                console.log('[SW] 清理缓存:', name);
                return caches.delete(name);
            })
        );
        console.log('[SW] 所有缓存已清理');
    } catch (error) {
        console.error('[SW] 清理缓存失败:', error);
    }
}

// ================================================
// 工具函数
// ================================================

// 检查网络连接状态
function isOnline() {
    return navigator.onLine;
}

// 获取缓存大小
async function getCacheSize() {
    try {
        const cacheNames = await caches.keys();
        let totalSize = 0;
        
        for (const name of cacheNames) {
            const cache = await caches.open(name);
            const keys = await cache.keys();
            
            for (const request of keys) {
                const response = await cache.match(request);
                if (response) {
                    const blob = await response.blob();
                    totalSize += blob.size;
                }
            }
        }
        
        return totalSize;
    } catch (error) {
        console.error('[SW] 获取缓存大小失败:', error);
        return 0;
    }
}

// ================================================
// 调试信息
// ================================================

console.log('[SW] Service Worker 脚本加载完成');
console.log('[SW] 缓存名称:', CACHE_NAME);
console.log('[SW] 核心资源数量:', CORE_ASSETS.length);