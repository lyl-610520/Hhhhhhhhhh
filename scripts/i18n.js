/* ================================================
   成长伙伴 PWA - 国际化系统
   简洁且完整的多语言支持
   ================================================ */

const I18N = {
  // 当前语言
  currentLang: 'zh',
  
  // 语言包
  messages: {
    zh: {
      // 导航
      nav: {
        home: '首页',
        stats: '统计', 
        growth: '成长',
        settings: '设置'
      },
      
      // 首页
      home: {
        checkin: {
          title: '快捷打卡',
          wakeUp: '起床',
          sleep: '睡觉',
          alreadyWakeUp: '已起床',
          alreadySleep: '已睡觉'
        },
        records: {
          title: '最近记录',
          noRecords: '还没有记录'
        },
        greeting: {
          morning: [
            '早安！新的一天开始了', '晨光正好，开始美好的一天吧', '早上好！愿你今天元气满满',
            '朝阳升起，希望也随之而来', '清晨的空气真清新', '今天又是充满可能的一天',
            '早起的你真棒！', '晨光中的你最美丽', '新的一天，新的开始', '早安，我的朋友！'
          ],
          noon: [
            '午安！记得吃午饭哦', '中午了，是时候休息一下了', '阳光正好，享受午后时光',
            '午餐时间到！要好好吃饭哦', '中午的阳光很温暖', '休息一下，下午更有精神',
            '忙碌的上午辛苦了', '午后时光很惬意呢', '阳光透过窗户很美', '午间小憩很重要'
          ],
          afternoon: [
            '下午好！工作进展如何？', '午后时光，来杯茶放松一下', '下午的阳光很温暖呢',
            '午后的时光很宝贵', '下午茶时间到了', '继续加油，你很棒！', '下午的微风很舒服',
            '工作告一段落了吗？', '下午的阳光刚刚好', '慢慢来，不用着急', '下午好！今天过得如何？'
          ],
          evening: [
            '晚上好！今天辛苦了', '夜幕降临，该放松一下了', '晚安时光即将到来',
            '夕阳西下很美丽', '今天的任务完成了吗？', '傍晚的时光很温柔', '晚风习习很舒服',
            '今天过得充实吗？', '夜晚来临，该休息了', '星星开始闪烁了', '晚霞很美呢'
          ],
          night: [
            '夜深了，该休息了', '安静的夜晚，适合思考', '愿你有个甜美的梦',
            '月亮出来了', '夜晚的宁静很珍贵', '准备睡觉了吗？', '晚安，好梦！',
            '今天辛苦了，好好休息', '夜深人静的时候', '星空很美丽', '夜晚适合冥想'
          ]
        },
        weather: {
          current: '当前天气是',
          sunny: '晴朗',
          cloudy: '多云',
          rainy: '雨天'
        },
        checkin: {
          wakeUp: '起床',
          sleep: '睡觉',
          alreadyWakeUp: '已起床',
          alreadySleep: '已睡觉'
        },
        companion: {
          title: '我的伙伴',
          welcome: '点击我陪你聊天！'
        },
        flower: {
          title: '我的花朵',
          stages: {
            seed: '种子',
            sprout: '幼苗',
            sapling: '小苗',
            bud: '花骨朵',
            bloom: '盛开'
          }
        }
      },
      
      // 成长页
      growth: {
        title: '成长历程',
        achievements: {
          title: '我的成就',
          morningBird: '一日之计在于晨',
          earlyBird: '早起的鸟儿有虫吃',
          studyMaster: '学习达人',
          workHero: '工作英雄',
          lifeExpert: '生活专家',
          healthyLife: '健康生活家',
          unlocked: '已解锁',
          locked: '未解锁'
        }
      },
      
      // 统计页
      stats: {
        title: '数据统计',
        noData: '还没有数据'
      },
      
      // 设置页
      settings: {
        title: '设置',
        language: '语言',
        theme: '主题',
        themeAuto: '跟随系统',
        themeLight: '浅色模式',
        themeDark: '深色模式',
        backgroundEffects: '背景特效',
        notifications: '通知',
        reset: '重置数据'
      },
      
      // 通用
      common: {
        success: '成功',
        error: '错误',
        confirm: '确定',
        cancel: '取消',
        save: '保存',
        delete: '删除',
        loading: '加载中...'
      }
    },
    
    en: {
      // Navigation
      nav: {
        home: 'Home',
        stats: 'Stats',
        growth: 'Growth', 
        settings: 'Settings'
      },
      
      // Home page
      home: {
        checkin: {
          title: 'Quick Check-in',
          wakeUp: 'Wake Up',
          sleep: 'Sleep',
          alreadyWakeUp: 'Already Awake',
          alreadySleep: 'Already Slept'
        },
        records: {
          title: 'Recent Records',
          noRecords: 'No records yet'
        },
        greeting: {
          morning: [
            'Good morning! A new day begins', 'Morning light is just right, start a beautiful day', 'Good morning! May you be energetic today',
            'The sunrise brings hope', 'Fresh morning air is wonderful', 'Today is full of possibilities',
            'You\'re amazing for waking up early!', 'You look beautiful in the morning light', 'New day, new beginning', 'Morning, my friend!'
          ],
          noon: [
            'Good noon! Remember to have lunch', 'It\'s noon, time to take a break', 'The sun is just right, enjoy the afternoon',
            'Lunch time! Please eat well', 'The noon sun is warm', 'Take a break, you\'ll have more energy in the afternoon',
            'Busy morning, well done!', 'Afternoon time is pleasant', 'Sunlight through the window is beautiful', 'Midday rest is important'
          ],
          afternoon: [
            'Good afternoon! How\'s work going?', 'Afternoon time, have a cup of tea and relax', 'The afternoon sun is very warm',
            'Afternoon time is precious', 'Time for afternoon tea', 'Keep going, you\'re doing great!', 'The afternoon breeze feels nice',
            'Is work coming to an end?', 'The afternoon sun is just perfect', 'Take your time, no rush', 'Good afternoon! How has your day been?'
          ],
          evening: [
            'Good evening! You worked hard today', 'Night falls, time to relax', 'Good night time is coming',
            'The sunset is beautiful', 'Did you complete today\'s tasks?', 'Evening time is gentle', 'The evening breeze is comfortable',
            'Was today fulfilling?', 'Night comes, time to rest', 'The stars are starting to twinkle', 'The sunset is lovely'
          ],
          night: [
            'It\'s late, time to rest', 'Quiet night, good for thinking', 'May you have sweet dreams',
            'The moon is out', 'The tranquility of night is precious', 'Ready for bed?', 'Good night, sweet dreams!',
            'You worked hard today, rest well', 'In the quiet of the night', 'The starry sky is beautiful', 'Night is perfect for meditation'
          ]
        },
        weather: {
          current: 'Current weather is ',
          sunny: 'sunny',
          cloudy: 'cloudy',
          rainy: 'rainy'
        },
        checkin: {
          wakeUp: 'Wake Up',
          sleep: 'Sleep',
          alreadyWakeUp: 'Already Awake',
          alreadySleep: 'Already Slept'
        },
        companion: {
          title: 'My Companion',
          welcome: 'Click me to chat!'
        },
        flower: {
          title: 'My Flower',
          stages: {
            seed: 'Seed',
            sprout: 'Sprout',
            sapling: 'Sapling',
            bud: 'Bud',
            bloom: 'Bloom'
          }
        }
      },
      
      // Growth page
      growth: {
        title: 'Growth Journey',
        achievements: {
          title: 'My Achievements',
          morningBird: 'Early Riser Champion',
          earlyBird: 'Morning Bird',
          studyMaster: 'Study Master',
          workHero: 'Work Hero',
          lifeExpert: 'Life Expert',
          healthyLife: 'Healthy Lifestyle',
          unlocked: 'Unlocked',
          locked: 'Locked'
        }
      },
      
      // Stats page
      stats: {
        title: 'Statistics',
        noData: 'No data yet'
      },
      
      // Settings page
      settings: {
        title: 'Settings',
        language: 'Language',
        theme: 'Theme',
        themeAuto: 'Follow System',
        themeLight: 'Light Mode',
        themeDark: 'Dark Mode',
        backgroundEffects: 'Background Effects',
        notifications: 'Notifications',
        reset: 'Reset Data'
      },
      
      // Common
      common: {
        success: 'Success',
        error: 'Error',
        confirm: 'Confirm',
        cancel: 'Cancel',
        save: 'Save',
        delete: 'Delete',
        loading: 'Loading...'
      }
    }
  },
  
  // 获取翻译文本
  t(key, lang = this.currentLang) {
    const keys = key.split('.');
    let value = this.messages[lang];
    
    for (const k of keys) {
      if (value && value[k] !== undefined) {
        value = value[k];
      } else {
        // 如果当前语言没有，尝试中文
        if (lang !== 'zh') {
          return this.t(key, 'zh');
        }
        console.warn(`Translation missing for key: ${key}`);
        return key;
      }
    }
    
    return value;
  },
  
  // 设置语言
  setLang(lang) {
    if (this.messages[lang]) {
      this.currentLang = lang;
      this.updateDOM();
      return true;
    }
    return false;
  },
  
  // 更新DOM中的翻译
  updateDOM() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const text = this.t(key);
      if (Array.isArray(text)) {
        // 如果是数组，随机选择一个
        el.textContent = text[Math.floor(Math.random() * text.length)];
      } else {
        el.textContent = text;
      }
    });
    
    // 更新placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      el.placeholder = this.t(key);
    });
    
    // 更新HTML语言属性
    document.documentElement.lang = this.currentLang === 'zh' ? 'zh-CN' : 'en';
  },
  
  // 检测系统语言
  detectSystemLang() {
    const systemLang = navigator.language || navigator.userLanguage || 'zh';
    if (systemLang.toLowerCase().startsWith('en')) {
      return 'en';
    }
    return 'zh';
  },
  
  // 初始化
  init() {
    // 从localStorage获取语言设置，或检测系统语言
    const savedLang = localStorage.getItem('app-language');
    const lang = savedLang || this.detectSystemLang();
    this.setLang(lang);
    
    console.log('I18N initialized with language:', this.currentLang);
  }
};

// 全局暴露
window.I18N = I18N;