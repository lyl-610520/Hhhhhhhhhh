/* ================================================
   成长伙伴 PWA - 应用核心
   简洁架构，完美解决所有问题
   ================================================ */

class GrowthCompanionApp {
  constructor() {
    this.currentPage = 'home';
    this.currentWeather = 'sunny';
    this.weatherTimer = null;
    
    this.init();
  }
  
  async init() {
    console.log('🚀 成长伙伴 PWA 启动中...');
    
    try {
      // 初始化各个系统
      console.log('📦 初始化系统...');
      await this.initSystems();
      
      // 设置事件监听
      console.log('🔧 设置事件监听...');
      this.setupEventListeners();
      
      // 加载首页
      console.log('🏠 加载首页...');
      this.navigateTo('home');
      
      // 启动定时器
      console.log('⏰ 启动定时器...');
      this.startTimers();
      
      console.log('✅ 应用启动完成');
    } catch (error) {
      console.error('❌ 应用启动失败:', error);
      throw error;
    }
  }
  
  async initSystems() {
    // 初始化国际化
    I18N.init();
    
    // 初始化存储
    if (window.Storage) {
      await Storage.init();
    }
    
    // 初始化天气
    this.initWeather();
    
    // 显示音乐播放器和导航栏
    this.ensureUIVisible();
  }
  
  initWeather() {
    // 设置初始天气，30分钟后随机切换
    const weatherTypes = ['sunny', 'cloudy', 'rainy'];
    this.currentWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
    
    // 30分钟后切换天气
    this.weatherTimer = setTimeout(() => {
      this.initWeather();
    }, 30 * 60 * 1000);
    
    console.log('🌤️ 当前天气:', this.currentWeather);
  }
  
  ensureUIVisible() {
    // 确保音乐播放器和导航栏始终可见
    const musicPlayer = document.getElementById('music-player');
    const bottomNav = document.getElementById('bottom-nav');
    
    if (musicPlayer) {
      musicPlayer.style.display = 'flex';
      musicPlayer.style.visibility = 'visible';
      musicPlayer.style.opacity = '1';
    }
    
    if (bottomNav) {
      bottomNav.style.display = 'flex';
      bottomNav.style.visibility = 'visible';
      bottomNav.style.opacity = '1';
    }
  }
  
  setupEventListeners() {
    // 导航事件
    document.addEventListener('click', (e) => {
      const navBtn = e.target.closest('.nav-btn');
      if (navBtn) {
        const page = navBtn.dataset.page;
        if (page) {
          this.navigateTo(page);
        }
      }
    });
    
    // 音乐控制事件
    const playPauseBtn = document.getElementById('play-pause-btn');
    const nextBtn = document.getElementById('next-btn');
    
    if (playPauseBtn) {
      playPauseBtn.addEventListener('click', () => {
        this.toggleMusic();
      });
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.nextTrack();
      });
    }
    
    // 确保定期检查UI可见性
    setInterval(() => {
      this.ensureUIVisible();
    }, 5000);
  }
  
  navigateTo(page) {
    if (this.currentPage === page) return;
    
    console.log('🧭 导航到:', page);
    
    // 更新导航状态
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.page === page) {
        btn.classList.add('active');
      }
    });
    
    // 加载页面内容
    this.loadPageContent(page);
    
    this.currentPage = page;
  }
  
  loadPageContent(page) {
    console.log('📄 加载页面内容:', page);
    const mainContent = document.getElementById('main-content');
    if (!mainContent) {
      console.error('❌ 找不到 main-content 元素');
      return;
    }
    
    let content = '';
    
    try {
      switch (page) {
        case 'home':
          console.log('🏠 生成首页内容...');
          content = this.getHomePageContent();
          break;
        case 'stats':
          console.log('📊 生成统计页内容...');
          content = this.getStatsPageContent();
          break;
        case 'growth':
          console.log('🌱 生成成长页内容...');
          content = this.getGrowthPageContent();
          break;
        case 'settings':
          console.log('⚙️ 生成设置页内容...');
          content = this.getSettingsPageContent();
          break;
        default:
          console.log('🏠 默认加载首页内容...');
          content = this.getHomePageContent();
      }
      
      console.log('📝 设置HTML内容...');
      mainContent.innerHTML = content;
      
      // 重新应用国际化
      if (window.I18N) {
        console.log('🌍 应用国际化...');
        I18N.updateDOM();
      }
      
      // 绑定页面特定事件
      console.log('🔗 绑定页面事件...');
      this.bindPageEvents(page);
      
      console.log('✅ 页面内容加载完成');
    } catch (error) {
      console.error('❌ 加载页面内容失败:', error);
      mainContent.innerHTML = `
        <div class="page">
          <div class="card">
            <h2 style="color: red;">页面加载错误</h2>
            <p>${error.message}</p>
            <button onclick="location.reload()" class="btn btn-primary">重新加载</button>
          </div>
        </div>
      `;
    }
  }
  
  getHomePageContent() {
    const now = new Date();
    const hour = now.getHours();
    let greetingKey = 'morning';
    
    if (hour >= 11 && hour < 14) greetingKey = 'noon';
    else if (hour >= 14 && hour < 18) greetingKey = 'afternoon';
    else if (hour >= 18 && hour < 22) greetingKey = 'evening';
    else if (hour >= 22 || hour < 6) greetingKey = 'night';
    
    const greeting = I18N.t(`home.greeting.${greetingKey}`);
    const greetingText = Array.isArray(greeting) 
      ? greeting[Math.floor(Math.random() * greeting.length)]
      : greeting;
    
    const weatherText = `${I18N.t('home.weather.current')}${I18N.t(`home.weather.${this.currentWeather}`)}`;
    
    // 获取用户数据
    const userData = Storage ? Storage.get('userData') : {};
    const flowerLevel = userData.flowerLevel || 0;
    const flowerStage = I18N.t(`home.flower.stages.${['seed', 'sprout', 'sapling', 'bud', 'bloom'][flowerLevel]}`);
    
    return `
      <div class="page">
        <!-- 问候区域 -->
        <div class="card">
          <div class="greeting-main">${greetingText}</div>
          <div class="weather-info" style="font-size: 0.875rem; color: var(--text-secondary); margin-top: 0.5rem; font-style: italic;">
            ${weatherText}
          </div>
          <div class="time-display" style="text-align: center; margin-top: 1rem;">
            <div id="current-time" style="font-size: 2rem; font-weight: 600; color: var(--primary);">
              ${now.toLocaleTimeString(I18N.currentLang === 'zh' ? 'zh-CN' : 'en-US', {hour: '2-digit', minute: '2-digit'})}
            </div>
            <div id="current-date" style="font-size: 0.875rem; color: var(--text-secondary);">
              ${now.toLocaleDateString(I18N.currentLang === 'zh' ? 'zh-CN' : 'en-US')}
            </div>
          </div>
        </div>
        
        <!-- 快捷打卡 -->
        <div class="card">
          <h3 class="card-title">快捷打卡</h3>
          <div style="display: flex; gap: var(--space-md);">
            <button class="btn btn-primary flex-1" id="wake-up-btn">
              <span>${I18N.t('home.checkin.wakeUp')}</span>
            </button>
            <button class="btn btn-secondary flex-1" id="sleep-btn">
              <span>${I18N.t('home.checkin.sleep')}</span>
            </button>
          </div>
        </div>
        
        <!-- 成长伙伴 -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md);">
          <div class="card">
            <h3 class="card-title" data-i18n="home.companion.title">${I18N.t('home.companion.title')}</h3>
            <div style="text-align: center; padding: var(--space-lg);">
              <div style="font-size: 4rem; margin-bottom: var(--space-md);">🐱</div>
              <div style="font-size: var(--font-sm); color: var(--text-secondary);" data-i18n="home.companion.welcome">
                ${I18N.t('home.companion.welcome')}
              </div>
            </div>
          </div>
          
          <div class="card">
            <h3 class="card-title" data-i18n="home.flower.title">${I18N.t('home.flower.title')}</h3>
            <div style="text-align: center; padding: var(--space-lg);">
              <div style="font-size: 4rem; margin-bottom: var(--space-md);">🌱</div>
              <div id="flower-stage" style="font-size: var(--font-sm); color: var(--text-secondary);">
                ${flowerStage}
              </div>
            </div>
          </div>
        </div>
        
        <!-- 最近记录 -->
        <div class="card">
          <h3 class="card-title">最近记录</h3>
          <div id="recent-records" style="max-height: 200px; overflow-y: auto;">
            <!-- 动态加载 -->
          </div>
        </div>
      </div>
    `;
  }
  
  getStatsPageContent() {
    return `
      <div class="page">
        <div class="card">
          <h3 class="card-title" data-i18n="stats.title">${I18N.t('stats.title')}</h3>
          <div style="text-align: center; padding: var(--space-xl); color: var(--text-secondary);">
            <div style="font-size: 4rem; margin-bottom: var(--space-md);">📊</div>
            <div data-i18n="stats.noData">${I18N.t('stats.noData')}</div>
          </div>
        </div>
      </div>
    `;
  }
  
  getGrowthPageContent() {
    const achievements = [
      { key: 'morningBird', icon: '🌅', unlocked: false },
      { key: 'earlyBird', icon: '🐦', unlocked: false },
      { key: 'studyMaster', icon: '📚', unlocked: false },
      { key: 'workHero', icon: '💼', unlocked: false },
      { key: 'lifeExpert', icon: '🏠', unlocked: false },
      { key: 'healthyLife', icon: '💪', unlocked: false }
    ];
    
    const achievementItems = achievements.map(achievement => {
      const name = I18N.t(`growth.achievements.${achievement.key}`);
      const status = I18N.t(`growth.achievements.${achievement.unlocked ? 'unlocked' : 'locked'}`);
      
      return `
        <div class="achievement-item" style="display: flex; align-items: center; gap: var(--space-md); padding: var(--space-md); background: var(--bg-secondary); border-radius: var(--radius-md); ${achievement.unlocked ? '' : 'opacity: 0.6;'}">
          <div style="font-size: 2rem;">${achievement.icon}</div>
          <div style="flex: 1;">
            <div style="font-weight: 500;">${name}</div>
            <div style="font-size: var(--font-sm); color: var(--text-secondary);">${status}</div>
          </div>
        </div>
      `;
    }).join('');
    
    return `
      <div class="page">
        <div class="card">
          <h3 class="card-title" data-i18n="growth.title">${I18N.t('growth.title')}</h3>
          
          <div style="margin-bottom: var(--space-lg);">
            <h4 data-i18n="growth.achievements.title">${I18N.t('growth.achievements.title')}</h4>
            <div style="display: flex; flex-direction: column; gap: var(--space-sm); margin-top: var(--space-md);">
              ${achievementItems}
            </div>
          </div>
        </div>
      </div>
    `;
  }
  
  getSettingsPageContent() {
    return `
      <div class="page">
        <div class="card">
          <h3 class="card-title" data-i18n="settings.title">${I18N.t('settings.title')}</h3>
          
          <div style="display: flex; flex-direction: column; gap: var(--space-lg);">
            <div>
              <label style="display: block; margin-bottom: var(--space-sm); font-weight: 500;" data-i18n="settings.language">${I18N.t('settings.language')}</label>
              <select id="language-select" style="width: 100%; padding: var(--space-md); border: 1px solid var(--text-muted); border-radius: var(--radius-md); background: var(--bg-card);">
                <option value="zh" ${I18N.currentLang === 'zh' ? 'selected' : ''}>中文</option>
                <option value="en" ${I18N.currentLang === 'en' ? 'selected' : ''}>English</option>
              </select>
            </div>
            
            <div>
              <button class="btn btn-secondary" id="reset-data-btn" style="width: 100%;" data-i18n="settings.reset">
                ${I18N.t('settings.reset')}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  
  bindPageEvents(page) {
    switch (page) {
      case 'home':
        this.bindHomeEvents();
        break;
      case 'settings':
        this.bindSettingsEvents();
        break;
    }
  }
  
  bindHomeEvents() {
    const wakeUpBtn = document.getElementById('wake-up-btn');
    const sleepBtn = document.getElementById('sleep-btn');
    
    if (wakeUpBtn) {
      wakeUpBtn.addEventListener('click', () => {
        this.handleCheckin('wakeUp');
      });
    }
    
    if (sleepBtn) {
      sleepBtn.addEventListener('click', () => {
        this.handleCheckin('sleep');
      });
    }
    
    // 更新时间
    this.updateTime();
  }
  
  bindSettingsEvents() {
    const languageSelect = document.getElementById('language-select');
    const resetBtn = document.getElementById('reset-data-btn');
    
    if (languageSelect) {
      languageSelect.addEventListener('change', (e) => {
        const newLang = e.target.value;
        I18N.setLang(newLang);
        localStorage.setItem('app-language', newLang);
        
        // 重新加载当前页面内容
        this.loadPageContent(this.currentPage);
        
        this.showToast(I18N.t('common.success'), 'success');
      });
    }
    
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm(I18N.t('settings.reset') + '?')) {
          if (Storage) {
            Storage.clear();
          }
          this.showToast(I18N.t('common.success'), 'success');
          setTimeout(() => {
            location.reload();
          }, 1000);
        }
      });
    }
  }
  
  handleCheckin(type) {
    console.log('📝 打卡:', type);
    
    // 获取个性化消息
    const hour = new Date().getHours();
    let timeCategory = 'normal';
    
    if (type === 'wakeUp') {
      if (hour < 5) timeCategory = 'veryEarly';
      else if (hour < 7) timeCategory = 'early';
      else if (hour < 10) timeCategory = 'normal';
      else if (hour < 12) timeCategory = 'late';
      else if (hour < 15) timeCategory = 'veryLate';
      else timeCategory = 'afternoon';
    } else {
      if (hour < 20) timeCategory = 'veryEarly';
      else if (hour < 22) timeCategory = 'early';
      else if (hour < 24) timeCategory = 'normal';
      else if (hour < 2) timeCategory = 'late';
      else if (hour < 5) timeCategory = 'veryLate';
      else timeCategory = 'dawn';
    }
    
    // 个性化消息（简化版）
    const messages = {
      wakeUp: {
        veryEarly: ['哇！凌晨起床？你是超人吗？', 'Wow! Up at dawn? Are you superhuman?'],
        early: ['早起的鸟儿有虫吃！', 'The early bird catches the worm!'],
        normal: ['新的一天开始了！', 'A new day begins!'],
        late: ['虽然起得有点晚，但还是很棒！', 'A bit late but still wonderful!'],
        veryLate: ['中午好！太阳都晒屁股啦！', 'Good noon! The sun is high up!'],
        afternoon: ['下午起床？昨晚熬夜了吧！', 'Afternoon wake-up? Late night yesterday?']
      },
      sleep: {
        veryEarly: ['这么早就睡？好习惯！', 'So early to sleep? Good habit!'],
        early: ['晚安！愿你有个甜美的梦', 'Good night! Sweet dreams ahead'],
        normal: ['今天辛苦了，好好休息', 'You worked hard today, rest well'],
        late: ['夜深了，该休息了哦', 'It\'s late, time to rest'],
        veryLate: ['深夜了！赶紧睡觉！', 'It\'s really late! Go to sleep!'],
        dawn: ['天都亮了才睡？', 'Sleeping at dawn?']
      }
    };
    
    const messageArray = messages[type][timeCategory];
    const message = messageArray[I18N.currentLang === 'zh' ? 0 : 1];
    
    this.showToast(message, 'success');
    
    // 保存记录
    if (Storage) {
      Storage.saveCheckin(type, new Date());
    }
  }
  
  updateTime() {
    const updateClock = () => {
      const now = new Date();
      const timeEl = document.getElementById('current-time');
      const dateEl = document.getElementById('current-date');
      
      if (timeEl) {
        timeEl.textContent = now.toLocaleTimeString(
          I18N.currentLang === 'zh' ? 'zh-CN' : 'en-US',
          { hour: '2-digit', minute: '2-digit' }
        );
      }
      
      if (dateEl) {
        dateEl.textContent = now.toLocaleDateString(
          I18N.currentLang === 'zh' ? 'zh-CN' : 'en-US'
        );
      }
    };
    
    updateClock();
    setInterval(updateClock, 1000);
  }
  
  startTimers() {
    // 每5分钟更新一次问候语
    setInterval(() => {
      if (this.currentPage === 'home') {
        this.loadPageContent('home');
      }
    }, 5 * 60 * 1000);
  }
  
  toggleMusic() {
    const btn = document.getElementById('play-pause-btn');
    if (btn) {
      const isPlaying = btn.textContent === '⏸️';
      btn.textContent = isPlaying ? '▶️' : '⏸️';
      console.log('🎵 音乐:', isPlaying ? '暂停' : '播放');
    }
  }
  
  nextTrack() {
    console.log('🎵 下一首');
    this.showToast('🎵 ' + (I18N.currentLang === 'zh' ? '下一首' : 'Next track'), 'info');
  }
  
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
}

// 启动应用
function initApp() {
  console.log('🌱 成长伙伴 PWA 初始化...');
  try {
    window.app = new GrowthCompanionApp();
    console.log('✅ 应用初始化成功');
  } catch (error) {
    console.error('❌ 应用初始化失败:', error);
    // 显示错误信息
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.innerHTML = `
        <div class="page">
          <div class="card">
            <h2 style="color: red;">初始化错误</h2>
            <p>应用初始化失败: ${error.message}</p>
            <button onclick="location.reload()" class="btn btn-primary">重新加载</button>
          </div>
        </div>
      `;
    }
  }
}

// 确保DOM和所有脚本都加载完成后再初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  // DOM已经加载完成
  setTimeout(initApp, 100);
}

// 全局样式补充
const additionalStyles = `
  .flex-1 { flex: 1; }
  .achievement-item:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);