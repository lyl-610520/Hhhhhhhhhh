/**
 * 动态Canvas背景渲染系统
 * 支持24小时渐变变化和夜晚星空效果
 */

class DynamicBackgroundRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
        this.currentHour = new Date().getHours();
        this.stars = [];
        this.meteors = [];
        this.clouds = [];
        this.animationId = null;
        this.lastUpdateTime = 0;
        
        this.initializeElements();
        this.startAnimation();
    }
    
    setupCanvas() {
        const dpr = window.devicePixelRatio || 1;
        
        // 设置canvas尺寸为全屏
        const updateSize = () => {
            this.canvas.width = window.innerWidth * dpr;
            this.canvas.height = window.innerHeight * dpr;
            this.ctx.scale(dpr, dpr);
            
            this.canvas.style.width = window.innerWidth + 'px';
            this.canvas.style.height = window.innerHeight + 'px';
            
            this.width = window.innerWidth;
            this.height = window.innerHeight;
        };
        
        updateSize();
        window.addEventListener('resize', updateSize);
        
        // 优化渲染性能
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
    }
    
    initializeElements() {
        // 初始化星星（只在夜晚显示）
        this.generateStars();
        
        // 初始化云朵
        this.generateClouds();
    }
    
    generateStars() {
        this.stars = [];
        const starCount = 150;
        
        for (let i = 0; i < starCount; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height * 0.7, // 星星主要在上半部分
                size: Math.random() * 2 + 0.5,
                opacity: Math.random() * 0.8 + 0.2,
                twinkleSpeed: Math.random() * 0.03 + 0.01,
                twinklePhase: Math.random() * Math.PI * 2,
                brightness: Math.random() * 0.5 + 0.5
            });
        }
    }
    
    generateClouds() {
        this.clouds = [];
        const cloudCount = 8;
        
        for (let i = 0; i < cloudCount; i++) {
            this.clouds.push({
                x: Math.random() * (this.width + 200) - 100,
                y: Math.random() * this.height * 0.4 + this.height * 0.1,
                width: Math.random() * 150 + 100,
                height: Math.random() * 60 + 40,
                speed: Math.random() * 0.5 + 0.2,
                opacity: Math.random() * 0.3 + 0.1
            });
        }
    }
    
    getTimeBasedColors() {
        const hour = this.currentHour;
        
        // 定义一天中不同时段的颜色
        if (hour >= 5 && hour < 7) {
            // 黎明 (5:00-7:00)
            return {
                top: '#FF6B6B',
                middle: '#FFE66D',
                bottom: '#FF8E53',
                atmosphere: 'dawn'
            };
        } else if (hour >= 7 && hour < 17) {
            // 白天 (7:00-17:00)
            return {
                top: '#74C0FC',
                middle: '#96F2D7',
                bottom: '#FFE066',
                atmosphere: 'day'
            };
        } else if (hour >= 17 && hour < 19) {
            // 黄昏 (17:00-19:00)
            return {
                top: '#845EC2',
                middle: '#FF6F91',
                bottom: '#FFC75F',
                atmosphere: 'sunset'
            };
        } else if (hour >= 19 && hour < 22) {
            // 傍晚 (19:00-22:00)
            return {
                top: '#2C3E50',
                middle: '#4A6FA5',
                bottom: '#6C5CE7',
                atmosphere: 'evening'
            };
        } else {
            // 夜晚 (22:00-5:00)
            return {
                top: '#0F172A',
                middle: '#1E293B',
                bottom: '#334155',
                atmosphere: 'night'
            };
        }
    }
    
    drawBackground() {
        const colors = this.getTimeBasedColors();
        
        // 创建渐变背景
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, colors.top);
        gradient.addColorStop(0.5, colors.middle);
        gradient.addColorStop(1, colors.bottom);
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // 添加光线效果
        if (colors.atmosphere === 'dawn' || colors.atmosphere === 'sunset') {
            this.drawSunRays();
        }
    }
    
    drawSunRays() {
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'screen';
        
        const rayCount = 12;
        const centerX = this.width * 0.8;
        const centerY = this.height * 0.3;
        
        for (let i = 0; i < rayCount; i++) {
            const angle = (i / rayCount) * Math.PI * 2;
            const length = this.height * 0.6;
            
            const gradient = this.ctx.createLinearGradient(
                centerX, centerY,
                centerX + Math.cos(angle) * length,
                centerY + Math.sin(angle) * length
            );
            
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
            gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.05)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.lineTo(
                centerX + Math.cos(angle) * length,
                centerY + Math.sin(angle) * length
            );
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }
    
    drawStars(time) {
        const hour = this.currentHour;
        
        // 只在夜晚显示星星 (22:00-4:00)
        const isNightTime = hour >= 22 || hour <= 4;
        if (!isNightTime) return;
        
        this.ctx.save();
        
        this.stars.forEach(star => {
            // 闪烁效果
            const twinkle = Math.sin(time * star.twinkleSpeed + star.twinklePhase);
            const opacity = star.opacity * (0.7 + twinkle * 0.3) * star.brightness;
            
            this.ctx.globalAlpha = opacity;
            
            // 绘制星星
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            // 添加星星光晕
            if (star.size > 1.5) {
                this.ctx.globalAlpha = opacity * 0.3;
                this.ctx.shadowColor = '#FFFFFF';
                this.ctx.shadowBlur = star.size * 4;
                this.ctx.beginPath();
                this.ctx.arc(star.x, star.y, star.size * 0.5, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.shadowBlur = 0;
            }
        });
        
        this.ctx.restore();
    }
    
    drawMeteors(time) {
        const hour = this.currentHour;
        const isNightTime = hour >= 22 || hour <= 4;
        if (!isNightTime) return;
        
        // 随机生成流星
        if (Math.random() < 0.001 && this.meteors.length < 3) {
            this.meteors.push({
                x: Math.random() * this.width + this.width * 0.2,
                y: -50,
                vx: -(Math.random() * 3 + 2),
                vy: Math.random() * 2 + 1,
                length: Math.random() * 80 + 60,
                opacity: 1,
                life: 0
            });
        }
        
        this.ctx.save();
        
        this.meteors = this.meteors.filter(meteor => {
            meteor.x += meteor.vx;
            meteor.y += meteor.vy;
            meteor.life += 0.016;
            meteor.opacity = Math.max(0, 1 - meteor.life * 2);
            
            if (meteor.opacity > 0) {
                // 绘制流星轨迹
                const gradient = this.ctx.createLinearGradient(
                    meteor.x, meteor.y,
                    meteor.x + meteor.vx * meteor.length,
                    meteor.y + meteor.vy * meteor.length
                );
                
                gradient.addColorStop(0, `rgba(255, 255, 255, ${meteor.opacity})`);
                gradient.addColorStop(0.5, `rgba(135, 206, 235, ${meteor.opacity * 0.6})`);
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                
                this.ctx.strokeStyle = gradient;
                this.ctx.lineWidth = 2;
                this.ctx.lineCap = 'round';
                
                this.ctx.beginPath();
                this.ctx.moveTo(meteor.x, meteor.y);
                this.ctx.lineTo(
                    meteor.x + meteor.vx * meteor.length * meteor.opacity,
                    meteor.y + meteor.vy * meteor.length * meteor.opacity
                );
                this.ctx.stroke();
                
                return true;
            }
            
            return false;
        });
        
        this.ctx.restore();
    }
    
    drawClouds() {
        const hour = this.currentHour;
        const isDayTime = hour >= 6 && hour <= 18;
        
        if (!isDayTime) return;
        
        this.ctx.save();
        
        this.clouds.forEach(cloud => {
            // 移动云朵
            cloud.x += cloud.speed;
            if (cloud.x > this.width + 100) {
                cloud.x = -cloud.width - 100;
                cloud.y = Math.random() * this.height * 0.4 + this.height * 0.1;
            }
            
            // 绘制云朵
            this.ctx.globalAlpha = cloud.opacity;
            this.ctx.fillStyle = '#FFFFFF';
            
            // 使用多个圆形组成云朵
            const circleCount = 5;
            for (let i = 0; i < circleCount; i++) {
                const x = cloud.x + (i / (circleCount - 1)) * cloud.width;
                const y = cloud.y + Math.sin(i * 0.5) * cloud.height * 0.2;
                const radius = cloud.height * (0.3 + Math.sin(i * 0.8) * 0.2);
                
                this.ctx.beginPath();
                this.ctx.arc(x, y, radius, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
        
        this.ctx.restore();
    }
    
    drawAtmosphericEffects() {
        const colors = this.getTimeBasedColors();
        
        // 添加大气散射效果
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'soft-light';
        
        const gradient = this.ctx.createRadialGradient(
            this.width * 0.5, this.height * 0.3, 0,
            this.width * 0.5, this.height * 0.3, this.width
        );
        
        if (colors.atmosphere === 'dawn' || colors.atmosphere === 'sunset') {
            gradient.addColorStop(0, 'rgba(255, 200, 100, 0.3)');
            gradient.addColorStop(0.5, 'rgba(255, 150, 150, 0.1)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        } else if (colors.atmosphere === 'day') {
            gradient.addColorStop(0, 'rgba(255, 255, 200, 0.2)');
            gradient.addColorStop(0.7, 'rgba(135, 206, 235, 0.1)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        }
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.ctx.restore();
    }
    
    updateTime() {
        this.currentHour = new Date().getHours();
    }
    
    render(currentTime) {
        // 每分钟更新一次时间
        if (currentTime - this.lastUpdateTime > 60000) {
            this.updateTime();
            this.lastUpdateTime = currentTime;
        }
        
        // 清空画布
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // 绘制各个元素
        this.drawBackground();
        this.drawClouds();
        this.drawAtmosphericEffects();
        this.drawStars(currentTime);
        this.drawMeteors(currentTime);
    }
    
    startAnimation() {
        const animate = (time) => {
            this.render(time);
            this.animationId = requestAnimationFrame(animate);
        };
        
        animate(0);
    }
    
    stopAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    resize() {
        this.setupCanvas();
        this.generateStars();
        this.generateClouds();
    }
    
    // 手动切换时间用于测试
    setTimeForTesting(hour) {
        this.currentHour = hour;
    }
}

// 导出到全局
window.DynamicBackgroundRenderer = DynamicBackgroundRenderer;