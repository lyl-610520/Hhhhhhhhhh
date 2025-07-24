/**
 * 应用入场动画和PWA安装指引系统
 */

class AppIntroManager {
    constructor() {
        this.isFirstVisit = !localStorage.getItem('hasVisited');
        this.currentLanguage = this.detectLanguage();
        this.deferredPrompt = null;
        this.skipIntroFlag = false;
        
        this.init();
    }
    
    detectLanguage() {
        const stored = localStorage.getItem('justInTimeData');
        if (stored) {
            try {
                const data = JSON.parse(stored);
                if (data.settings?.language) {
                    return data.settings.language;
                }
            } catch (e) {}
        }
        
        // 检测浏览器语言
        const browserLang = navigator.language || navigator.userLanguage;
        return browserLang.startsWith('zh') ? 'zh' : 'en';
    }
    
    init() {
        // 监听PWA安装提示
        this.setupPWAInstallPrompt();
        
        // 如果是首次访问，显示入场动画
        if (this.isFirstVisit) {
            this.showIntroAnimation();
        } else {
            // 检查是否可以显示PWA安装指引
            setTimeout(() => this.checkPWAInstallGuide(), 2000);
        }
        
        // 标记已访问
        localStorage.setItem('hasVisited', 'true');
    }
    
    setupPWAInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            console.log('PWA install prompt captured');
        });
        
        // 监听应用安装成功
        window.addEventListener('appinstalled', () => {
            console.log('PWA installed successfully');
            this.deferredPrompt = null;
            this.showSuccessMessage();
        });
    }
    
    showIntroAnimation() {
        const introHtml = `
            <div id="intro-overlay" class="intro-overlay">
                <div class="intro-content">
                    <div class="intro-logo">
                        <div class="logo-icon">
                            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                                <circle cx="40" cy="40" r="35" fill="url(#logoGradient)" />
                                <path d="M25 40 L35 50 L55 30" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                                <defs>
                                    <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" style="stop-color:#8B5FBF" />
                                        <stop offset="100%" style="stop-color:#6366f1" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                        <div class="logo-text">
                            <h1 class="intro-title">Just in Time</h1>
                            <p class="intro-subtitle">${this.getIntroText().subtitle}</p>
                        </div>
                    </div>
                    
                    <div class="intro-features">
                        <div class="feature-item">
                            <div class="feature-icon">🌸</div>
                            <p>${this.getIntroText().feature1}</p>
                        </div>
                        <div class="feature-item">
                            <div class="feature-icon">🌳</div>
                            <p>${this.getIntroText().feature2}</p>
                        </div>
                        <div class="feature-item">
                            <div class="feature-icon">⭐</div>
                            <p>${this.getIntroText().feature3}</p>
                        </div>
                    </div>
                    
                    <div class="intro-actions">
                        <button id="skip-intro" class="skip-btn">${this.getIntroText().skip}</button>
                        <button id="start-journey" class="start-btn">${this.getIntroText().start}</button>
                    </div>
                    
                    <div class="loading-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" id="intro-progress"></div>
                        </div>
                        <p class="loading-text">${this.getIntroText().loading}</p>
                    </div>
                </div>
                
                <div class="intro-background">
                    <canvas id="intro-canvas"></canvas>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', introHtml);
        this.setupIntroEvents();
        this.startIntroAnimation();
    }
    
    getIntroText() {
        const texts = {
            zh: {
                subtitle: '恰逢其时',
                feature1: '精美花朵成长',
                feature2: '四季变幻场景',
                feature3: '习惯养成系统',
                skip: '跳过',
                start: '开始旅程',
                loading: '正在准备你的专属花园...',
                installTitle: '添加到主屏幕',
                installMessage: '将「恰逢其时」添加到主屏幕，随时记录美好时光',
                installButton: '立即添加',
                installLater: '稍后提醒',
                installSteps: {
                    safari: '点击分享按钮 → 添加到主屏幕',
                    chrome: '点击菜单 → 安装应用',
                    general: '点击浏览器菜单 → 添加到主屏幕'
                }
            },
            en: {
                subtitle: 'Just in Time',
                feature1: 'Beautiful Flower Growth',
                feature2: 'Four Seasons Scenes',
                feature3: 'Habit Building System',
                skip: 'Skip',
                start: 'Start Journey',
                loading: 'Preparing your exclusive garden...',
                installTitle: 'Add to Home Screen',
                installMessage: 'Add "Just in Time" to your home screen for quick access',
                installButton: 'Add Now',
                installLater: 'Remind Later',
                installSteps: {
                    safari: 'Tap Share button → Add to Home Screen',
                    chrome: 'Tap Menu → Install App',
                    general: 'Tap Browser Menu → Add to Home Screen'
                }
            }
        };
        
        return texts[this.currentLanguage] || texts.en;
    }
    
    setupIntroEvents() {
        const skipBtn = document.getElementById('skip-intro');
        const startBtn = document.getElementById('start-journey');
        
        skipBtn?.addEventListener('click', () => {
            this.skipIntroFlag = true;
            this.hideIntroAnimation();
        });
        
        startBtn?.addEventListener('click', () => {
            this.hideIntroAnimation();
        });
    }
    
    startIntroAnimation() {
        const progressBar = document.getElementById('intro-progress');
        const canvas = document.getElementById('intro-canvas');
        
        if (canvas) {
            this.renderIntroBackground(canvas);
        }
        
        // 模拟加载进度
        let progress = 0;
        const interval = setInterval(() => {
            if (this.skipIntroFlag) {
                clearInterval(interval);
                return;
            }
            
            progress += Math.random() * 15 + 5;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                
                setTimeout(() => {
                    if (!this.skipIntroFlag) {
                        this.hideIntroAnimation();
                    }
                }, 1000);
            }
            
            if (progressBar) {
                progressBar.style.width = progress + '%';
            }
        }, 200);
    }
    
    renderIntroBackground(canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const particles = [];
        for (let i = 0; i < 50; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: Math.random() * 3 + 1,
                opacity: Math.random() * 0.5 + 0.3
            });
        }
        
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // 渐变背景
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#667eea');
            gradient.addColorStop(1, '#764ba2');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // 粒子动画
            particles.forEach(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
                if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
                
                ctx.globalAlpha = particle.opacity;
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
            });
            
            if (document.getElementById('intro-overlay')) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    hideIntroAnimation() {
        const overlay = document.getElementById('intro-overlay');
        if (overlay) {
            overlay.style.opacity = '0';
            overlay.style.transform = 'scale(0.9)';
            
            setTimeout(() => {
                overlay.remove();
                // 检查PWA安装指引
                setTimeout(() => this.checkPWAInstallGuide(), 1000);
            }, 500);
        }
    }
    
    checkPWAInstallGuide() {
        // 检查是否已经安装
        if (window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches) {
            return;
        }
        
        // 检查是否已经拒绝过安装提示
        if (localStorage.getItem('pwa-install-declined')) {
            return;
        }
        
        // 显示安装指引
        this.showPWAInstallGuide();
    }
    
    showPWAInstallGuide() {
        const texts = this.getIntroText();
        const userAgent = navigator.userAgent.toLowerCase();
        
        let installSteps = texts.installSteps.general;
        if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
            installSteps = texts.installSteps.safari;
        } else if (userAgent.includes('chrome')) {
            installSteps = texts.installSteps.chrome;
        }
        
        const guideHtml = `
            <div id="pwa-install-guide" class="pwa-install-guide">
                <div class="install-content glass-effect">
                    <div class="install-header">
                        <div class="install-icon">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                            </svg>
                        </div>
                        <h3 class="install-title">${texts.installTitle}</h3>
                        <p class="install-message">${texts.installMessage}</p>
                    </div>
                    
                    <div class="install-steps">
                        <p class="steps-text">${installSteps}</p>
                    </div>
                    
                    <div class="install-actions">
                        <button id="install-later" class="install-later-btn">${texts.installLater}</button>
                        <button id="install-now" class="install-now-btn">${texts.installButton}</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', guideHtml);
        this.setupPWAGuideEvents();
    }
    
    setupPWAGuideEvents() {
        const installNowBtn = document.getElementById('install-now');
        const installLaterBtn = document.getElementById('install-later');
        
        installNowBtn?.addEventListener('click', () => {
            this.triggerPWAInstall();
        });
        
        installLaterBtn?.addEventListener('click', () => {
            this.hidePWAInstallGuide();
            // 24小时后再次提示
            localStorage.setItem('pwa-install-remind', Date.now() + 24 * 60 * 60 * 1000);
        });
    }
    
    triggerPWAInstall() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            
            this.deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('PWA installation accepted');
                } else {
                    console.log('PWA installation declined');
                    localStorage.setItem('pwa-install-declined', 'true');
                }
                this.deferredPrompt = null;
                this.hidePWAInstallGuide();
            });
        } else {
            // 显示手动安装指引
            this.showManualInstallSteps();
        }
    }
    
    showManualInstallSteps() {
        const guide = document.getElementById('pwa-install-guide');
        if (guide) {
            const content = guide.querySelector('.install-content');
            content.innerHTML = `
                <div class="manual-install-steps">
                    <h3>${this.getIntroText().installTitle}</h3>
                    <div class="step-list">
                        <div class="step-item">
                            <span class="step-number">1</span>
                            <p>点击浏览器菜单（⋮ 或 ⚙️）</p>
                        </div>
                        <div class="step-item">
                            <span class="step-number">2</span>
                            <p>选择"添加到主屏幕"或"安装应用"</p>
                        </div>
                        <div class="step-item">
                            <span class="step-number">3</span>
                            <p>确认安装</p>
                        </div>
                    </div>
                    <button id="manual-install-close" class="install-now-btn">知道了</button>
                </div>
            `;
            
            document.getElementById('manual-install-close')?.addEventListener('click', () => {
                this.hidePWAInstallGuide();
            });
        }
    }
    
    hidePWAInstallGuide() {
        const guide = document.getElementById('pwa-install-guide');
        if (guide) {
            guide.style.opacity = '0';
            guide.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                guide.remove();
            }, 300);
        }
    }
    
    showSuccessMessage() {
        const successHtml = `
            <div id="install-success" class="install-success">
                <div class="success-content glass-effect">
                    <div class="success-icon">✨</div>
                    <h3>安装成功！</h3>
                    <p>「恰逢其时」已添加到您的主屏幕</p>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', successHtml);
        
        setTimeout(() => {
            const success = document.getElementById('install-success');
            if (success) {
                success.style.opacity = '0';
                setTimeout(() => success.remove(), 300);
            }
        }, 3000);
    }
}

// 导出到全局
window.AppIntroManager = AppIntroManager;