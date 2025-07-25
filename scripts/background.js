/* ================================================
   成长伙伴 PWA - 动态背景系统
   时间变化 + 季节效果 + 天气适配
   ================================================ */

class BackgroundManager {
  constructor() {
    this.currentSeason = this.getCurrentSeason();
    this.currentTimeOfDay = this.getTimeOfDay();
    this.weatherType = 'sunny'; // 默认晴天
    
    this.init();
  }
  
  init() {
    console.log('🎨 初始化动态背景系统');
    
    // 创建背景容器
    this.createBackgroundElements();
    
    // 设置初始背景
    this.updateBackground();
    
    // 启动定时器
    this.startTimers();
    
    console.log('✅ 动态背景系统启动完成');
  }
  
  createBackgroundElements() {
    // 移除已存在的背景
    const existing = document.getElementById('dynamic-bg');
    if (existing) existing.remove();
    
    // 创建背景容器
    const bgContainer = document.createElement('div');
    bgContainer.id = 'dynamic-bg';
    bgContainer.className = 'dynamic-background';
    
    // 创建渐变层
    const gradientLayer = document.createElement('div');
    gradientLayer.className = 'bg-gradient';
    
    // 创建粒子层
    const particleLayer = document.createElement('div');
    particleLayer.className = 'bg-particles';
    
    // 创建装饰层
    const decorLayer = document.createElement('div');
    decorLayer.className = 'bg-decorations';
    
    bgContainer.appendChild(gradientLayer);
    bgContainer.appendChild(particleLayer);
    bgContainer.appendChild(decorLayer);
    
    // 插入到body开头
    document.body.insertBefore(bgContainer, document.body.firstChild);
  }
  
  getCurrentSeason() {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'autumn';
    return 'winter';
  }
  
  getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 8) return 'dawn';
    if (hour >= 8 && hour < 11) return 'morning';
    if (hour >= 11 && hour < 14) return 'noon';
    if (hour >= 14 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 19) return 'dusk';
    if (hour >= 19 && hour < 22) return 'evening';
    return 'night';
  }
  
  updateBackground() {
    const bgContainer = document.getElementById('dynamic-bg');
    if (!bgContainer) return;
    
    // 更新时间和季节
    this.currentTimeOfDay = this.getTimeOfDay();
    this.currentSeason = this.getCurrentSeason();
    
    // 获取背景配置
    const config = this.getBackgroundConfig();
    
    // 应用渐变
    const gradientLayer = bgContainer.querySelector('.bg-gradient');
    if (gradientLayer) {
      gradientLayer.style.background = config.gradient;
    }
    
    // 更新粒子效果
    this.updateParticles(config.particles);
    
    // 更新装饰元素
    this.updateDecorations(config.decorations);
    
    console.log(`🎨 背景更新: ${this.currentSeason}-${this.currentTimeOfDay}`);
  }
  
  getBackgroundConfig() {
    const configs = {
      spring: {
        dawn: {
          gradient: 'linear-gradient(135deg, #ffeaa7 0%, #fab1a0 50%, #fd79a8 100%)',
          particles: { type: 'flowers', count: 15, color: '#ff7675' },
          decorations: ['🌸', '🌺', '🦋']
        },
        morning: {
          gradient: 'linear-gradient(135deg, #a8e6cf 0%, #dcedc1 50%, #ffd3a5 100%)',
          particles: { type: 'leaves', count: 20, color: '#00b894' },
          decorations: ['🌱', '🌿', '🐝']
        },
        noon: {
          gradient: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 50%, #6c5ce7 100%)',
          particles: { type: 'bubbles', count: 25, color: '#74b9ff' },
          decorations: ['☀️', '🌤️', '🌈']
        },
        afternoon: {
          gradient: 'linear-gradient(135deg, #fd79a8 0%, #fdcb6e 50%, #e17055 100%)',
          particles: { type: 'petals', count: 18, color: '#fd79a8' },
          decorations: ['🌸', '🌼', '🌷']
        },
        dusk: {
          gradient: 'linear-gradient(135deg, #fd79a8 0%, #e84393 50%, #a29bfe 100%)',
          particles: { type: 'sparkles', count: 30, color: '#fd79a8' },
          decorations: ['✨', '🌅', '🦋']
        },
        evening: {
          gradient: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 50%, #fd79a8 100%)',
          particles: { type: 'fireflies', count: 20, color: '#fdcb6e' },
          decorations: ['🌙', '⭐', '✨']
        },
        night: {
          gradient: 'linear-gradient(135deg, #2d3436 0%, #636e72 50%, #74b9ff 100%)',
          particles: { type: 'stars', count: 40, color: '#ddd' },
          decorations: ['🌙', '⭐', '✨']
        }
      },
      summer: {
        dawn: {
          gradient: 'linear-gradient(135deg, #fdcb6e 0%, #e17055 50%, #fd79a8 100%)',
          particles: { type: 'bubbles', count: 20, color: '#74b9ff' },
          decorations: ['🌅', '🌊', '🐚']
        },
        morning: {
          gradient: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 50%, #00cec9 100%)',
          particles: { type: 'waves', count: 15, color: '#74b9ff' },
          decorations: ['☀️', '🌊', '🏖️']
        },
        noon: {
          gradient: 'linear-gradient(135deg, #fdcb6e 0%, #e17055 50%, #74b9ff 100%)',
          particles: { type: 'sun-rays', count: 25, color: '#fdcb6e' },
          decorations: ['☀️', '🌞', '🔥']
        },
        afternoon: {
          gradient: 'linear-gradient(135deg, #fd79a8 0%, #fdcb6e 50%, #74b9ff 100%)',
          particles: { type: 'heat-waves', count: 20, color: '#fd79a8' },
          decorations: ['🌺', '🍉', '🏄']
        },
        dusk: {
          gradient: 'linear-gradient(135deg, #fd79a8 0%, #e84393 50%, #fdcb6e 100%)',
          particles: { type: 'sparkles', count: 30, color: '#fd79a8' },
          decorations: ['🌅', '🌴', '🦩']
        },
        evening: {
          gradient: 'linear-gradient(135deg, #6c5ce7 0%, #fd79a8 50%, #fdcb6e 100%)',
          particles: { type: 'fireflies', count: 25, color: '#fdcb6e' },
          decorations: ['🌙', '🌊', '⭐']
        },
        night: {
          gradient: 'linear-gradient(135deg, #2d3436 0%, #00cec9 50%, #74b9ff 100%)',
          particles: { type: 'stars', count: 35, color: '#ddd' },
          decorations: ['🌙', '⭐', '🌊']
        }
      },
      autumn: {
        dawn: {
          gradient: 'linear-gradient(135deg, #e17055 0%, #fdcb6e 50%, #fd79a8 100%)',
          particles: { type: 'falling-leaves', count: 25, color: '#e17055' },
          decorations: ['🍂', '🍁', '🦔']
        },
        morning: {
          gradient: 'linear-gradient(135deg, #fdcb6e 0%, #e17055 50%, #d63031 100%)',
          particles: { type: 'leaves', count: 30, color: '#e17055' },
          decorations: ['🍂', '🍁', '🐿️']
        },
        noon: {
          gradient: 'linear-gradient(135deg, #fdcb6e 0%, #e17055 50%, #74b9ff 100%)',
          particles: { type: 'falling-leaves', count: 20, color: '#e17055' },
          decorations: ['🍂', '🎃', '🌰']
        },
        afternoon: {
          gradient: 'linear-gradient(135deg, #e17055 0%, #d63031 50%, #74b9ff 100%)',
          particles: { type: 'leaves', count: 25, color: '#d63031' },
          decorations: ['🍁', '🍂', '🦉']
        },
        dusk: {
          gradient: 'linear-gradient(135deg, #d63031 0%, #e84393 50%, #6c5ce7 100%)',
          particles: { type: 'sparkles', count: 20, color: '#d63031' },
          decorations: ['🌅', '🍂', '🕯️']
        },
        evening: {
          gradient: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 50%, #e17055 100%)',
          particles: { type: 'fireflies', count: 15, color: '#fdcb6e' },
          decorations: ['🌙', '🍂', '⭐']
        },
        night: {
          gradient: 'linear-gradient(135deg, #2d3436 0%, #636e72 50%, #e17055 100%)',
          particles: { type: 'stars', count: 40, color: '#ddd' },
          decorations: ['🌙', '⭐', '🍂']
        }
      },
      winter: {
        dawn: {
          gradient: 'linear-gradient(135deg, #74b9ff 0%, #a29bfe 50%, #fd79a8 100%)',
          particles: { type: 'snowflakes', count: 30, color: '#ddd' },
          decorations: ['❄️', '⛄', '🌨️']
        },
        morning: {
          gradient: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 50%, #ddd 100%)',
          particles: { type: 'snow', count: 35, color: '#fff' },
          decorations: ['❄️', '☃️', '🏔️']
        },
        noon: {
          gradient: 'linear-gradient(135deg, #ddd 0%, #74b9ff 50%, #0984e3 100%)',
          particles: { type: 'snowflakes', count: 25, color: '#fff' },
          decorations: ['☀️', '❄️', '⛄']
        },
        afternoon: {
          gradient: 'linear-gradient(135deg, #74b9ff 0%, #fd79a8 50%, #ddd 100%)',
          particles: { type: 'snow', count: 20, color: '#fff' },
          decorations: ['❄️', '🔥', '🧣']
        },
        dusk: {
          gradient: 'linear-gradient(135deg, #fd79a8 0%, #6c5ce7 50%, #74b9ff 100%)',
          particles: { type: 'sparkles', count: 25, color: '#74b9ff' },
          decorations: ['🌅', '❄️', '✨']
        },
        evening: {
          gradient: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 50%, #74b9ff 100%)',
          particles: { type: 'snowflakes', count: 30, color: '#ddd' },
          decorations: ['🌙', '❄️', '⭐']
        },
        night: {
          gradient: 'linear-gradient(135deg, #2d3436 0%, #636e72 50%, #74b9ff 100%)',
          particles: { type: 'stars', count: 45, color: '#fff' },
          decorations: ['🌙', '⭐', '❄️']
        }
      }
    };
    
    return configs[this.currentSeason][this.currentTimeOfDay];
  }
  
  updateParticles(particleConfig) {
    const particleLayer = document.querySelector('.bg-particles');
    if (!particleLayer) return;
    
    // 清空现有粒子
    particleLayer.innerHTML = '';
    
    // 创建新粒子
    for (let i = 0; i < particleConfig.count; i++) {
      const particle = document.createElement('div');
      particle.className = `particle ${particleConfig.type}`;
      
      // 随机位置
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      
      // 随机动画延迟
      particle.style.animationDelay = Math.random() * 5 + 's';
      particle.style.animationDuration = (Math.random() * 3 + 2) + 's';
      
      // 设置颜色
      particle.style.color = particleConfig.color;
      
      particleLayer.appendChild(particle);
    }
  }
  
  updateDecorations(decorations) {
    const decorLayer = document.querySelector('.bg-decorations');
    if (!decorLayer) return;
    
    // 清空现有装饰
    decorLayer.innerHTML = '';
    
    // 添加装饰元素
    decorations.forEach((emoji, index) => {
      const decor = document.createElement('div');
      decor.className = 'decoration';
      decor.textContent = emoji;
      
      // 随机位置
      decor.style.left = (index * 30 + Math.random() * 20) + '%';
      decor.style.top = (Math.random() * 80 + 10) + '%';
      
      // 随机动画
      decor.style.animationDelay = Math.random() * 3 + 's';
      
      decorLayer.appendChild(decor);
    });
  }
  
  setWeather(weatherType) {
    this.weatherType = weatherType;
    this.updateBackground();
  }
  
  startTimers() {
    // 每分钟检查时间变化
    setInterval(() => {
      const newTimeOfDay = this.getTimeOfDay();
      if (newTimeOfDay !== this.currentTimeOfDay) {
        this.updateBackground();
      }
    }, 60000);
    
    // 每小时检查季节变化
    setInterval(() => {
      const newSeason = this.getCurrentSeason();
      if (newSeason !== this.currentSeason) {
        this.updateBackground();
      }
    }, 3600000);
  }
}

// 全局暴露
window.BackgroundManager = BackgroundManager;