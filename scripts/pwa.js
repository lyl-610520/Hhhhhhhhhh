/**
 * PWA Service Worker 注册和管理
 * Just in Time PWA
 */

// ================================================
// Service Worker 注册
// ================================================

if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            console.log('开始注册 Service Worker...');
            
            const registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/'
            });
            
            console.log('Service Worker 注册成功:', registration.scope);
            
            // 监听更新
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                if (newWorker) {
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // 有新版本可用
                            showUpdateNotification();
                        }
                    });
                }
            });
            
        } catch (error) {
            console.error('Service Worker 注册失败:', error);
        }
    });
}

// ================================================
// PWA 安装提示
// ================================================

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    console.log('PWA 安装提示准备就绪');
    
    // 阻止浏览器默认的安装提示
    e.preventDefault();
    deferredPrompt = e;
    
    // 显示自定义安装提示
    showInstallPrompt();
});

// 显示安装提示
function showInstallPrompt() {
    // 检查是否已经显示过安装提示
    const hasShownPrompt = localStorage.getItem('pwa-install-prompt-shown');
    if (hasShownPrompt) return;
    
    // 创建安装提示
    const installBanner = document.createElement('div');
    installBanner.id = 'install-banner';
    installBanner.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 1rem;
        text-align: center;
        z-index: 9998;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        transform: translateY(-100%);
        transition: transform 0.3s ease;
    `;
    
    installBanner.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; max-width: 600px; margin: 0 auto;">
            <div style="flex: 1;">
                <strong>安装 Just in Time</strong>
                <div style="font-size: 0.9rem; opacity: 0.9; margin-top: 0.25rem;">
                    添加到主屏幕，获得更好的体验
                </div>
            </div>
            <div style="display: flex; gap: 0.5rem;">
                <button id="install-btn" style="
                    background: rgba(255, 255, 255, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    color: white;
                    padding: 0.5rem 1rem;
                    border-radius: 1.5rem;
                    cursor: pointer;
                    font-size: 0.9rem;
                    backdrop-filter: blur(10px);
                ">安装</button>
                <button id="dismiss-btn" style="
                    background: transparent;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    color: white;
                    padding: 0.5rem 1rem;
                    border-radius: 1.5rem;
                    cursor: pointer;
                    font-size: 0.9rem;
                ">稍后</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(installBanner);
    
    // 显示动画
    setTimeout(() => {
        installBanner.style.transform = 'translateY(0)';
    }, 100);
    
    // 绑定事件
    document.getElementById('install-btn').addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log('用户选择:', outcome);
            deferredPrompt = null;
        }
        hideInstallBanner();
    });
    
    document.getElementById('dismiss-btn').addEventListener('click', () => {
        hideInstallBanner();
        localStorage.setItem('pwa-install-prompt-shown', 'true');
    });
    
    // 5秒后自动隐藏
    setTimeout(() => {
        if (document.getElementById('install-banner')) {
            hideInstallBanner();
        }
    }, 5000);
}

function hideInstallBanner() {
    const banner = document.getElementById('install-banner');
    if (banner) {
        banner.style.transform = 'translateY(-100%)';
        setTimeout(() => {
            if (banner.parentNode) {
                banner.parentNode.removeChild(banner);
            }
        }, 300);
    }
}

// ================================================
// 应用更新通知
// ================================================

function showUpdateNotification() {
    if (window.app && typeof window.app.showModal === 'function') {
        window.app.showModal(
            '发现新版本',
            '有新版本可用，重新加载以获得最新功能？',
            [{
                text: '稍后',
                callback: () => {}
            }, {
                text: '立即更新',
                primary: true,
                callback: () => {
                    window.location.reload();
                }
            }]
        );
    } else {
        // 降级处理
        if (confirm('有新版本可用，是否立即更新？')) {
            window.location.reload();
        }
    }
}

// ================================================
// PWA 生命周期事件
// ================================================

// 监听应用安装事件
window.addEventListener('appinstalled', () => {
    console.log('PWA 安装成功');
    localStorage.setItem('pwa-installed', 'true');
    
    // 隐藏安装横幅
    hideInstallBanner();
    
    // 显示安装成功提示
    if (window.app && typeof window.app.showToast === 'function') {
        window.app.showToast('应用安装成功！现在可以离线使用了');
    }
});

// 监听网络状态变化
window.addEventListener('online', () => {
    console.log('网络连接恢复');
    if (window.app && typeof window.app.showToast === 'function') {
        window.app.showToast('网络连接已恢复');
    }
});

window.addEventListener('offline', () => {
    console.log('网络连接断开');
    if (window.app && typeof window.app.showToast === 'function') {
        window.app.showToast('当前处于离线模式');
    }
});

// ================================================
// PWA 工具函数
// ================================================

// 检查是否在 PWA 环境中运行
function isPWA() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone ||
           document.referrer.includes('android-app://');
}

// 检查设备类型
function getDeviceType() {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/ipad/.test(userAgent)) {
        return 'iPad';
    } else if (/iphone/.test(userAgent)) {
        return 'iPhone';
    } else if (/android/.test(userAgent)) {
        return 'Android';
    } else if (/windows/.test(userAgent)) {
        return 'Windows';
    } else if (/mac/.test(userAgent)) {
        return 'Mac';
    } else {
        return 'Unknown';
    }
}

// 检查是否支持触摸
function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// ================================================
// PWA 性能监控
// ================================================

// 记录应用启动时间
const startTime = performance.now();

window.addEventListener('load', () => {
    const loadTime = performance.now() - startTime;
    console.log(`应用加载时间: ${loadTime.toFixed(2)}ms`);
    
    // 发送性能数据（在真实应用中可以发送到分析服务）
    if (loadTime > 3000) {
        console.warn('应用加载时间过长，需要优化');
    }
});

// 监控内存使用
if ('memory' in performance) {
    setInterval(() => {
        const memory = performance.memory;
        const usedMemory = memory.usedJSHeapSize / 1024 / 1024;
        
        if (usedMemory > 50) { // 超过50MB时警告
            console.warn(`内存使用量较高: ${usedMemory.toFixed(2)}MB`);
        }
    }, 30000); // 每30秒检查一次
}

// ================================================
// 导出 PWA 工具
// ================================================

window.PWA = {
    isPWA,
    getDeviceType,
    isTouchDevice,
    showInstallPrompt,
    showUpdateNotification
};

console.log('PWA 模块加载完成');
console.log('设备类型:', getDeviceType());
console.log('触摸设备:', isTouchDevice());
console.log('PWA 模式:', isPWA());