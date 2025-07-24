/**
 * Just in Time PWA - 主应用脚本
 * 一个美妙的打卡与成长应用
 */

// ================================================
// 全局常量与配置
// ================================================

const CONFIG = {
    // WeatherAPI配置
    weatherApi: {
        key: 'f080dd8eccd341b4a06152132251207',
        baseUrl: 'https://api.weatherapi.com/v1/current.json'
    },
    
    // 应用配置
    app: {
        name: 'Just in Time',
        version: '1.0.0',
        defaultLanguage: 'zh',
        defaultTheme: 'auto'
    },
    
    // 花朵成长配置
    flower: {
        levels: ['种子', '出芽', '小苗', '花骨朵', '开花'],
        thresholds: [0, 50, 150, 300, 500], // 每个级别需要的阳光值
        sleepPoints: 15,    // 睡觉打卡获得的阳光值
        generalPoints: 5    // 普通打卡获得的阳光值
    },
    
    // 成就配置 - 使用国际化key
    achievements: {
        morningBird: { threshold: 7, nameKey: 'achievements.morningBird', icon: '🌅' },
        earlyBird: { threshold: 5, nameKey: 'achievements.earlyBird', icon: '🐦' },
        healthyLife: { threshold: 7, nameKey: 'achievements.healthyLife', icon: '💪' },
        studyMaster: { threshold: 10, nameKey: 'achievements.studyMaster', icon: '📚' },
        workHero: { threshold: 15, nameKey: 'achievements.workHero', icon: '💼' },
        lifeExpert: { threshold: 20, nameKey: 'achievements.lifeExpert', icon: '🏠' }
    },
    
    // 预设音乐列表
    defaultMusic: [
        { name: 'Track 1', path: './audio/track1.mp3' },
        { name: 'Track 2', path: './audio/track2.mp3' },
        { name: 'Track 3', path: './audio/track3.mp3' },
        { name: 'Track 4', path: './audio/track4.mp3' },
        { name: 'Track 5', path: './audio/track5.mp3' }
    ]
};

// ================================================
// 应用状态管理
// ================================================

class AppState {
    constructor() {
        this.data = this.loadData();
        this.setupAutoSave();
    }
    
    // 检测系统语言
    detectSystemLanguage() {
        // 检测浏览器语言
        const systemLang = navigator.language || navigator.userLanguage || 'zh';
        const langCode = systemLang.toLowerCase();
        
        // 支持的语言映射
        if (langCode.startsWith('zh')) {
            return 'zh'; // 中文
        } else if (langCode.startsWith('en')) {
            return 'en'; // 英文
        } else {
            // 默认英文，因为应用主要面向国际用户
            return 'en';
        }
    }
    
    // 动态屏幕适配
    setupDynamicLayout() {
        const updateLayout = () => {
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const isLandscape = vw > vh;
            const isMobile = vw <= 768;
            const isTablet = vw > 768 && vw <= 1024;
            
            // 动态设置CSS变量
            document.documentElement.style.setProperty('--actual-vh', `${vh * 0.01}px`);
            
            // 根据设备类型调整导航栏高度
            let navHeight = 80;
            if (vw <= 374) navHeight = 65;
            else if (vw <= 414) navHeight = 75;
            else if (isTablet) navHeight = 85;
            
            document.documentElement.style.setProperty('--nav-height-base', `${navHeight}px`);
            
            // 音乐播放器高度适配
            const musicHeight = Math.max(55, Math.min(75, navHeight * 0.85));
            document.documentElement.style.setProperty('--music-height', `${musicHeight}px`);
            
            // 强制显示关键元素
            const nav = document.querySelector('.bottom-navigation');
            const music = document.querySelector('#music-player');
            
            if (nav) {
                nav.style.display = 'flex';
                nav.style.visibility = 'visible';
                nav.style.opacity = '1';
                nav.style.position = 'fixed';
                nav.style.zIndex = '9999';
            }
            
            if (music) {
                music.style.display = 'flex !important';
                music.style.visibility = 'visible !important';
                music.style.opacity = '1 !important';
                music.style.position = 'fixed !important';
                music.style.zIndex = '9998 !important';
                music.style.left = '0 !important';
                music.style.right = '0 !important';
                // 确保音乐播放器在所有设备都可见，特别是iPad
                const safeBottom = `max(${Math.max(5, navHeight * 0.1)}px, env(safe-area-inset-bottom))`;
                music.style.bottom = `calc(${navHeight}px + ${safeBottom}) !important`;
                
                console.log(`音乐播放器强制显示: position=${music.style.position}, z-index=${music.style.zIndex}, bottom=${music.style.bottom}`);
            }
            
            console.log(`屏幕适配: ${vw}x${vh}, 导航栏: ${navHeight}px, 音乐播放器: ${musicHeight}px`);
        };
        
        // 初始化
        updateLayout();
        
        // 监听窗口变化
        window.addEventListener('resize', updateLayout);
        window.addEventListener('orientationchange', () => {
            setTimeout(updateLayout, 100);
        });
        
        // 使用ResizeObserver监听更精确的变化
        if (window.ResizeObserver) {
            const resizeObserver = new ResizeObserver(updateLayout);
            resizeObserver.observe(document.documentElement);
        }
    }
    
    // 生成设备唯一标识符，确保用户数据独立
    generateDeviceId() {
        let deviceId = localStorage.getItem('deviceId');
        if (!deviceId) {
            deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('deviceId', deviceId);
            console.log('生成新设备ID:', deviceId);
        }
        return deviceId;
    }
    
    // 加载本地存储的数据
    loadData() {
        const defaultData = {
            // 设备标识，确保数据隔离
            deviceId: this.generateDeviceId(),
            
            // 用户设置
            settings: {
                theme: CONFIG.app.defaultTheme,
                language: this.detectSystemLanguage(), // 自动检测系统语言
                petName: '小伙伴',
                weatherPreference: 'all',
                soundEffects: true,
                notificationTime: '21:00'
            },
            
            // 打卡记录
            checkins: [],
            
            // 花朵状态
            flower: {
                level: 0,
                sunlight: 0
            },
            
            // 宠物状态
            pet: {
                currentAccessory: 'spring' // 默认春季配饰
            },
            
            // 成就数据
            achievements: {
                unlocked: [],
                points: 0
            },
            
            // 倒计时数据
            countdown: null,
            
            // 音乐列表
            musicList: [...CONFIG.defaultMusic],
            currentTrack: 0,
            
            // 今日快捷打卡状态
            todayStatus: {
                date: new Date().toDateString(),
                wakeUp: false,
                sleep: false
            },
            
            // 闹钟设置
            alarm: null
        };
        
        try {
            const stored = localStorage.getItem('justInTimeData');
            if (stored) {
                const parsed = JSON.parse(stored);
                // 合并默认数据和存储数据，确保新字段有默认值
                return this.mergeDeep(defaultData, parsed);
            }
        } catch (error) {
            console.error('加载数据失败:', error);
        }
        
        return defaultData;
    }
    
    // 深度合并对象
    mergeDeep(target, source) {
        const result = { ...target };
        
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.mergeDeep(target[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        
        return result;
    }
    
    // 保存数据到本地存储
    saveData() {
        try {
            localStorage.setItem('justInTimeData', JSON.stringify(this.data));
            console.log('数据已保存');
        } catch (error) {
            console.error('保存数据失败:', error);
        }
    }
    
    // 设置自动保存
    setupAutoSave() {
        // 监听页面卸载事件，确保数据保存
        window.addEventListener('beforeunload', () => {
            this.saveData();
        });
        
        // 定时自动保存（每30秒）
        setInterval(() => {
            this.saveData();
        }, 30000);
    }
    
    // 获取数据
    get(path) {
        return path.split('.').reduce((obj, key) => obj && obj[key], this.data);
    }
    
    // 设置数据
    set(path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const obj = keys.reduce((obj, key) => {
            if (!obj[key]) obj[key] = {};
            return obj[key];
        }, this.data);
        
        obj[lastKey] = value;
        this.saveData();
    }
    
    // 添加打卡记录
    addCheckin(task, category) {
        const checkin = {
            id: Date.now(),
            task,
            category,
            timestamp: new Date().toISOString(),
            date: new Date().toDateString()
        };
        
        this.data.checkins.push(checkin);
        
        // 增加花朵阳光值
        const points = category === 'sleep' ? CONFIG.flower.sleepPoints : CONFIG.flower.generalPoints;
        this.addSunlight(points);
        
        // 检查成就
        this.checkAchievements();
        
        this.saveData();
        return checkin;
    }
    
    // 增加花朵阳光值
    addSunlight(points) {
        this.data.flower.sunlight += points;
        
        // 检查是否升级
        const currentLevel = this.data.flower.level;
        const thresholds = CONFIG.flower.thresholds;
        
        for (let i = currentLevel + 1; i < thresholds.length; i++) {
            if (this.data.flower.sunlight >= thresholds[i]) {
                this.data.flower.level = i;
                this.showFlowerLevelUp(i);
            } else {
                break;
            }
        }
    }
    
    // 显示花朵升级动画
    showFlowerLevelUp(level) {
        const levelName = CONFIG.flower.levels[level];
        app.showModal('花朵升级了！', `恭喜！你的花朵成长为${levelName}了！`, [{
            text: '太棒了！',
            primary: true,
            callback: () => {}
        }]);
    }
    
    // 检查成就
    checkAchievements() {
        const checkins = this.data.checkins;
        const now = new Date();
        const today = now.toDateString();
        
        // 检查早起成就（6-9点之间的起床打卡）
        const morningCheckins = checkins.filter(c => {
            const checkTime = new Date(c.timestamp);
            const hour = checkTime.getHours();
            return (c.task.includes('起床') || c.task.includes('Awake') || c.task.includes('I\'m Awake')) && hour >= 6 && hour <= 9;
        });
        
        if (morningCheckins.length >= CONFIG.achievements.morningBird.threshold) {
            this.unlockAchievement('morningBird');
        }
        
        // 检查类别成就
        const categories = ['study', 'work', 'life'];
        categories.forEach(category => {
            const categoryCheckins = checkins.filter(c => c.category === category);
            const achievementKey = category + 'Master';
            
            if (categoryCheckins.length >= CONFIG.achievements[achievementKey]?.threshold) {
                this.unlockAchievement(achievementKey);
            }
        });
        
        // 检查连续作息成就
        this.checkConsecutiveSchedule();
    }
    
    // 检查连续作息
    checkConsecutiveSchedule() {
        const checkins = this.data.checkins;
        const last7Days = [];
        const today = new Date();
        
        // 获取最近7天的数据(倒序，从今天开始往前)
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toDateString();
            
            const dayCheckins = checkins.filter(c => c.date === dateStr);
            const wakeUp = dayCheckins.find(c => c.task.includes('起床') || c.task.includes('Awake'));
            const sleep = dayCheckins.find(c => c.task.includes('睡') || c.task.includes('Sleep'));
            
            last7Days.push({
                date: dateStr,
                hasWakeUp: !!wakeUp,
                hasSleep: !!sleep,
                wakeUpTime: wakeUp ? new Date(wakeUp.timestamp).getHours() : null,
                sleepTime: sleep ? new Date(sleep.timestamp).getHours() : null
            });
        }
        
        // 检查连续健康作息(从今天开始倒推)
        let consecutiveHealthy = 0;
        for (const day of last7Days) {
            // 修复睡眠时间判断逻辑
            const isHealthySleep = day.sleepTime !== null && 
                                 (day.sleepTime >= 22 || day.sleepTime <= 2);
            const isHealthyWakeUp = day.wakeUpTime !== null && 
                                  day.wakeUpTime >= 6 && day.wakeUpTime <= 9;
            
            if (day.hasWakeUp && day.hasSleep && isHealthyWakeUp && isHealthySleep) {
                consecutiveHealthy++;
            } else {
                break; // 中断连续计数
            }
        }
        
        console.log('连续健康作息天数:', consecutiveHealthy);
        
        // 只有真正连续7天才解锁成就
        if (consecutiveHealthy >= 7) {
            this.unlockAchievement('healthyLife');
        }
    }
    
    // 解锁成就
    unlockAchievement(achievementKey) {
        if (!this.data.achievements.unlocked.includes(achievementKey)) {
            this.data.achievements.unlocked.push(achievementKey);
            this.data.achievements.points += 10; // 每个成就10点
            
            const achievement = CONFIG.achievements[achievementKey];
            const t = i18n[this.currentLanguage];
            const achievementName = this.getNestedValue(t, achievement.nameKey) || achievement.nameKey;
            app.showModal(t.ui.achievementUnlocked, `🎉 ${t.ui.congratulations}${achievementName}`, [{
                text: t.ui.awesome,
                primary: true,
                callback: () => {}
            }]);
            
            this.saveData();
        }
    }
    
    // 重置所有数据
    resetAllData() {
        localStorage.removeItem('justInTimeData');
        this.data = this.loadData();
        location.reload();
    }
    
    // 导出数据
    exportData() {
        const dataStr = JSON.stringify(this.data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `just-in-time-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    }
}

// ================================================
// 国际化管理
// ================================================

const i18n = {
    zh: {
        nav: {
            home: '主页',
            stats: '统计',
            wardrobe: '成长',
            settings: '设置'
        },
        greetings: {
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
            sunny: '今天阳光明媚，心情也要像阳光一样灿烂哦！',
            cloudy: '今天多云，就像生活有起有落，但都是美好的',
            rainy: '今天下雨了，雨天也有雨天的浪漫呢',
            rainyComfort: '虽然下雨了，但我们依然可以保持好心情',
            snowy: '今天下雪了，雪花纷飞的日子很有诗意',
            currentWeather: '当前天气是',
            weatherDesc: {
                sunny: '晴朗',
                cloudy: '多云', 
                rainy: '雨天',
                snowy: '雪天',
                foggy: '雾霾'
            }
        },
        checkin: {
            wakeUpMessages: {
                veryEarly: ['哇！凌晨起床？你是超人吗？', '这么早起来，是要征服世界吗？', '夜猫子还是早起鸟？你让我困惑了！'],
                early: ['早起的鸟儿有虫吃！你真棒！', '晨光中醒来的你，闪闪发光', '哇！你起得真早，太厉害了！'],
                normal: ['新的一天开始了，加油！', '早安！愿你今天充满活力', '美好的早晨，从现在开始'],
                late: ['虽然起得有点晚，但还是很棒！', '慢慢来，生活不用太着急', '迟到的美好也是美好'],
                veryLate: ['中午好！太阳都晒屁股啦！', '午安！看来昨晚睡得很香呢', '起床困难户？我懂的～'],
                afternoon: ['下午起床？昨晚熬夜了吧！', '下午好！这算是起床还是午觉呢？', '夜猫子的下午时光～']
            },
            sleepMessages: {
                veryEarly: ['这么早就睡？你是老爷爷吗？', '太阳还没下山呢！早睡早起好习惯', '早睡的好孩子，点个赞！'],
                early: ['晚安！愿你有个甜美的梦', '早睡早起身体好！', '好习惯值得表扬！'],
                normal: ['今天辛苦了，好好休息', '夜晚来临，是时候充电了', '睡个好觉，明天会更美好'],
                late: ['夜深了，该休息了哦', '熬夜对身体不好呢', '明天要早点睡哦'],
                veryLate: ['深夜了！赶紧睡觉！', '夜猫子，该睡了！', '这个点睡觉，明天起得来吗？'],
                dawn: ['天都亮了才睡？你是吸血鬼吗？', '通宵达旦？注意身体哦！', '看日出后睡觉，很浪漫呢～']
            }
        },
        ui: {
            quickCheckin: '快捷打卡',
            customCheckin: '自定义打卡',
            wakeUp: '我起床啦',
            sleep: '我要睡了',
            addTask: '添加',
            myCompanion: '我的伙伴',
            myFlower: '我的花朵',
            importantCountdown: '重要倒计时',
            dataStats: '数据统计',
            checkinCategories: '打卡类别分布',
            last7DaysSleep: '最近7日睡眠时长',
            wardrobeAndShop: '衣柜与商店',
            achievementPoints: '成就点',
            achievementGarden: '成就花园',
            petWardrobe: '宠物衣柜',
            themeShop: '主题商店',
            displayAndLanguage: '显示与语言',
            personalization: '个性化',
            countdownSettings: '倒计时设置',
            smartNotifications: '智能通知',
            dataManagement: '数据管理',
            theme: '主题模式',
            language: '语言',
            petName: '宠物名称',
            weatherPreference: '天气偏好',
            soundEffects: '音效',
            eventName: '事件名称',
            targetDate: '目标日期',
            setCountdown: '设置倒计时',
            dailyReminderTime: '每日提醒时间',
            requestNotificationPermission: '申请通知权限',
            exportData: '导出数据',
            backToBeginning: '回到最初的时光',
            auto: '自动',
            light: '浅色',
            dark: '深色',
            chinese: '中文',
            english: 'English',
            likeAllWeather: '喜欢所有天气',
            hateRainyDays: '讨厌雨天',
            hateSnowyDays: '讨厌雪天',
            categories: {
                life: '生活',
                study: '学习',
                work: '工作',
                wake: '起床',
                sleep: '睡觉'
            },
            flowerLevels: {
                seed: '种子',
                sprout: '出芽',
                sapling: '小苗',
                bud: '花骨朵',
                bloom: '开花'
            },
            placeholders: {
                petName: '给你的伙伴起个名字',
                taskInput: '今天做了什么？',
                eventName: '重要的日子',
                customTask: '今天做了什么？'
            },
            messages: {
                resetConfirm: '确定要重置所有数据吗？此操作无法撤销。',
                resetComplete: '数据重置成功，涅槃重生！✨',
                exportSuccess: '数据导出成功！',
                duplicateCheckin: '今天已经打过这个卡了',
                alarmSet: '闹钟设置成功！',
                notificationPermissionGranted: '通知权限已开启！',
                notificationPermissionDenied: '通知权限被拒绝'
            },
            loading: '加载中...',
            loadingWeather: '正在获取天气信息...',
            comingSoon: '主题商店即将开放！',
            achievementUnlocked: '成就解锁！',
            congratulations: '恭喜解锁成就：',
            awesome: '太棒了！',
            toastCheckinSuccess: '打卡成功！',
            toastDuplicateCheckin: '今天已经打过这个卡了',
            modalResetTitle: '确认重置',
            modalResetMessage: '确定要重置所有数据吗？此操作无法撤销。',
            buttonConfirm: '确定',
            buttonCancel: '取消',
            recentCheckins: '最近打卡',
            viewAll: '查看全部',
            noCheckins: '还没有打卡记录',
            achievements: {
                morningBird: '一日之计在于晨',
                earlyBird: '早起的鸟儿有虫吃',
                studyMaster: '学习达人',
                workHero: '工作英雄',
                lifeExpert: '生活专家',
                healthyLife: '健康生活家'
            },
            flowerStages: {
                seed: '种子',
                sprout: '幼苗', 
                bud: '花骨朵',
                bloom: '盛开',
                mature: '成熟'
            },
            petGreetings: {
                morning: ['早上好呀！今天要加油哦！', '新的一天开始了！', '早安，我的朋友！'],
                evening: ['晚上好！今天过得怎么样？', '夜晚来临了~', '晚安，好梦！']
            },
            petWelcome: '点击我陪你聊天！',
            myCompanion: '我的伙伴',
            myFlower: '我的花朵'
        }
    },
    en: {
        nav: {
            home: 'Home',
            stats: 'Stats',
            wardrobe: 'Growth',
            settings: 'Settings'
        },
        greetings: {
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
            sunny: 'It\'s sunny today, your mood should be as bright as the sunshine!',
            cloudy: 'It\'s cloudy today, just like life has ups and downs, but they\'re all beautiful',
            rainy: 'It\'s raining today, rainy days have their own romance',
            rainyComfort: 'Although it\'s raining, we can still stay in a good mood',
            snowy: 'It\'s snowing today, snowy days are very poetic',
            currentWeather: 'Current weather is',
            weatherDesc: {
                sunny: 'sunny',
                cloudy: 'cloudy',
                rainy: 'rainy', 
                snowy: 'snowy',
                foggy: 'foggy'
            }
        },
        checkin: {
            wakeUpMessages: {
                veryEarly: ['Wow! Up at dawn? Are you superhuman?', 'So early! Are you conquering the world?', 'Night owl or early bird? You confuse me!'],
                early: ['The early bird catches the worm! Amazing!', 'You shining in the morning light!', 'Wow! So early, you\'re fantastic!'],
                normal: ['A new day begins, let\'s go!', 'Good morning! May you be energetic today', 'Beautiful morning starts now'],
                late: ['A bit late but still wonderful!', 'Take your time, no need to rush', 'Late beauty is still beauty'],
                veryLate: ['Good noon! The sun is high up!', 'Good afternoon! Slept well last night?', 'Sleepyhead? I understand~'],
                afternoon: ['Afternoon wake-up? Late night yesterday?', 'Good afternoon! Wake up or nap?', 'Night owl\'s afternoon time~']
            },
            sleepMessages: {
                veryEarly: ['So early to sleep? Are you a grandpa?', 'Sun\'s still up! Good habit though', 'Early sleeper gets a thumbs up!'],
                early: ['Good night! Sweet dreams ahead', 'Early to bed, early to rise!', 'Good habits deserve praise!'],
                normal: ['You worked hard today, rest well', 'Night comes, time to recharge', 'Sleep well, tomorrow will be better'],
                late: ['It\'s late, time to rest', 'Late nights aren\'t good for health', 'Sleep earlier tomorrow, okay?'],
                veryLate: ['It\'s really late! Go to sleep!', 'Night owl, time to rest!', 'Can you wake up tomorrow after this?'],
                dawn: ['Sleeping at dawn? Are you a vampire?', 'All-nighter? Take care of yourself!', 'Sleeping after sunrise, how romantic~']
            }
        },
        ui: {
            quickCheckin: 'Quick Check-in',
            customCheckin: 'Custom Check-in',
            wakeUp: 'I\'m Awake',
            sleep: 'Going to Sleep',
            addTask: 'Add',
            myCompanion: 'My Companion',
            myFlower: 'My Flower',
            importantCountdown: 'Important Countdown',
            dataStats: 'Data Statistics',
            checkinCategories: 'Check-in Categories',
            last7DaysSleep: 'Last 7 Days Sleep Duration',
            wardrobeAndShop: 'Wardrobe & Shop',
            achievementPoints: 'Achievement Points',
            achievementGarden: 'Achievement Garden',
            petWardrobe: 'Pet Wardrobe',
            themeShop: 'Theme Shop',
            displayAndLanguage: 'Display & Language',
            personalization: 'Personalization',
            countdownSettings: 'Countdown Settings',
            smartNotifications: 'Smart Notifications',
            dataManagement: 'Data Management',
            theme: 'Theme',
            language: 'Language',
            petName: 'Pet Name',
            weatherPreference: 'Weather Preference',
            soundEffects: 'Sound Effects',
            eventName: 'Event Name',
            targetDate: 'Target Date',
            setCountdown: 'Set Countdown',
            dailyReminderTime: 'Daily Reminder Time',
            requestNotificationPermission: 'Request Notification Permission',
            exportData: 'Export Data',
            backToBeginning: 'Back to the Beginning',
            auto: 'Auto',
            light: 'Light',
            dark: 'Dark',
            chinese: 'Chinese',
            english: 'English',
            likeAllWeather: 'Like All Weather',
            hateRainyDays: 'Hate Rainy Days',
            hateSnowyDays: 'Hate Snowy Days',
            categories: {
                life: 'Life',
                study: 'Study',
                work: 'Work',
                wake: 'Wake Up',
                sleep: 'Sleep'
            },
            flowerLevels: {
                seed: 'Seed',
                sprout: 'Sprout',
                sapling: 'Sapling',
                bud: 'Bud',
                bloom: 'Bloom'
            },
            placeholders: {
                petName: 'Give your companion a name',
                taskInput: 'What did you do today?',
                eventName: 'Important day',
                customTask: 'What did you do today?'
            },
            messages: {
                resetConfirm: 'Are you sure you want to reset all data? This action cannot be undone.',
                resetComplete: 'Data has been reset successfully. A new journey begins! ✨',
                exportSuccess: 'Data exported successfully!',
                duplicateCheckin: 'You have already checked in for this today',
                alarmSet: 'Alarm set successfully!',
                notificationPermissionGranted: 'Notification permission granted!',
                notificationPermissionDenied: 'Notification permission denied'
            },
            loading: 'Loading...',
            loadingWeather: 'Getting weather information...',
            comingSoon: 'Theme shop coming soon!',
            achievementUnlocked: 'Achievement Unlocked!',
            congratulations: 'Congratulations on unlocking: ',
            awesome: 'Awesome!',
            toastCheckinSuccess: 'Check-in successful!',
            toastDuplicateCheckin: 'You have already checked in for this today',
            modalResetTitle: 'Confirm Reset',
            modalResetMessage: 'Are you sure you want to reset all data? This action cannot be undone.',
            buttonConfirm: 'Confirm',
            buttonCancel: 'Cancel',
            recentCheckins: 'Recent Check-ins',
            viewAll: 'View All',
            noCheckins: 'No check-in records yet',
            achievements: {
                morningBird: 'Early Bird Gets the Worm',
                earlyBird: 'Morning Person',
                studyMaster: 'Study Master',
                workHero: 'Work Hero',
                lifeExpert: 'Life Expert',
                healthyLife: 'Healthy Lifestyle'
            },
            flowerStages: {
                seed: 'Seed',
                sprout: 'Sprout',
                bud: 'Bud', 
                bloom: 'Bloom',
                mature: 'Mature'
            },
            petGreetings: {
                morning: ['Good morning! Let\'s have a great day!', 'A new day begins!', 'Morning, my friend!'],
                evening: ['Good evening! How was your day?', 'Night is coming~', 'Good night, sweet dreams!']
            },
            petWelcome: 'Click me to chat!',
            myCompanion: 'My Companion',
            myFlower: 'My Flower'
        }
    }
};

// ================================================
// 音乐播放器
// ================================================

class MusicPlayer {
    constructor() {
        this.audio = document.getElementById('audio-player');
        this.currentTrackSpan = document.getElementById('current-track');
        this.playPauseBtn = document.getElementById('play-pause-btn');
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.addMusicBtn = document.getElementById('add-music-btn');
        this.volumeSlider = document.getElementById('volume-slider');
        this.musicUpload = document.getElementById('music-upload');
        
        this.isPlaying = false;
        this.currentIndex = 0;
        
        this.setupEventListeners();
        this.loadTrack();
    }
    
    setupEventListeners() {
        // 播放/暂停按钮
        this.playPauseBtn.addEventListener('click', () => {
            this.togglePlayPause();
        });
        
        // 上一首
        this.prevBtn.addEventListener('click', () => {
            this.previousTrack();
        });
        
        // 下一首
        this.nextBtn.addEventListener('click', () => {
            this.nextTrack();
        });
        
        // 添加音乐
        this.addMusicBtn.addEventListener('click', () => {
            this.musicUpload.click();
        });
        
        // 音量控制
        this.volumeSlider.addEventListener('input', (e) => {
            this.audio.volume = e.target.value / 100;
        });
        
        // 文件上传
        this.musicUpload.addEventListener('change', (e) => {
            this.handleFileUpload(e.files);
        });
        
        // 音频事件
        this.audio.addEventListener('ended', () => {
            this.nextTrack();
        });
        
        this.audio.addEventListener('error', (e) => {
            console.error('音频播放错误:', e);
            this.nextTrack();
        });
    }
    
    loadTrack() {
        const musicList = appState.get('musicList');
        const currentIndex = appState.get('currentTrack');
        
        if (musicList && musicList[currentIndex]) {
            const track = musicList[currentIndex];
            this.currentTrackSpan.textContent = track.name;
            this.audio.src = track.path;
            this.currentIndex = currentIndex;
        }
    }
    
    togglePlayPause() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }
    
    async play() {
        try {
            await this.audio.play();
            this.isPlaying = true;
            this.updatePlayPauseIcon();
            this.playSound('play');
        } catch (error) {
            console.error('播放失败:', error);
        }
    }
    
    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.updatePlayPauseIcon();
    }
    
    updatePlayPauseIcon() {
        const playIcon = document.getElementById('play-icon');
        const pauseIcon = document.getElementById('pause-icon');
        
        if (this.isPlaying) {
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
        } else {
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        }
    }
    
    nextTrack() {
        const musicList = appState.get('musicList');
        this.currentIndex = (this.currentIndex + 1) % musicList.length;
        appState.set('currentTrack', this.currentIndex);
        this.loadTrack();
        
        if (this.isPlaying) {
            this.play();
        }
    }
    
    previousTrack() {
        const musicList = appState.get('musicList');
        this.currentIndex = (this.currentIndex - 1 + musicList.length) % musicList.length;
        appState.set('currentTrack', this.currentIndex);
        this.loadTrack();
        
        if (this.isPlaying) {
            this.play();
        }
    }
    
    async handleFileUpload(files) {
        const musicList = appState.get('musicList');
        
        for (const file of files) {
            if (file.type.startsWith('audio/')) {
                try {
                    // 创建对象URL
                    const url = URL.createObjectURL(file);
                    const track = {
                        name: file.name.replace(/\.[^/.]+$/, ""), // 移除扩展名
                        path: url,
                        isUserUploaded: true
                    };
                    
                    musicList.push(track);
                } catch (error) {
                    console.error('处理音频文件失败:', error);
                }
            }
        }
        
        appState.set('musicList', musicList);
        this.playSound('success');
    }
    
    playSound(type) {
        if (!appState.get('settings.soundEffects')) return;
        
        // 播放简单的音效
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        switch (type) {
            case 'success':
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
                break;
            case 'play':
                oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                break;
            default:
                oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        }
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    }
}

// ================================================
// 天气服务
// ================================================

class WeatherService {
    constructor() {
        this.currentWeather = null;
        this.lastFetch = 0;
        this.cacheDuration = 10 * 60 * 1000; // 10分钟缓存
    }
    
    async getCurrentWeather() {
        const now = Date.now();
        
        // 检查缓存
        if (this.currentWeather && (now - this.lastFetch) < this.cacheDuration) {
            return this.currentWeather;
        }
        
        try {
            // 获取用户位置
            const position = await this.getUserLocation();
            
            // 请求天气数据
            const response = await fetch(
                `${CONFIG.weatherApi.baseUrl}?key=${CONFIG.weatherApi.key}&q=${position.latitude},${position.longitude}&aqi=no&lang=zh`
            );
            
            if (!response.ok) {
                throw new Error('天气API请求失败');
            }
            
            const data = await response.json();
            this.currentWeather = {
                condition: data.current.condition.text,
                code: data.current.condition.code,
                temp: data.current.temp_c,
                humidity: data.current.humidity,
                windSpeed: data.current.wind_kph,
                location: data.location.name
            };
            
            this.lastFetch = now;
            return this.currentWeather;
            
        } catch (error) {
            console.error('获取天气信息失败:', error);
            return this.getDefaultWeather();
        }
    }
    
    getUserLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                console.warn('浏览器不支持地理定位，使用默认位置');
                resolve({ latitude: 39.9042, longitude: 116.4074 }); // 北京
                return;
            }
            
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    console.log('获取到用户位置:', position.coords);
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                (error) => {
                    console.warn('获取位置失败，使用默认位置:', error);
                    // 使用默认位置（北京）
                    resolve({
                        latitude: 39.9042,
                        longitude: 116.4074
                    });
                },
                {
                    timeout: 10000,
                    enableHighAccuracy: false
                }
            );
        });
    }
    
    getDefaultWeather() {
        return {
            condition: '晴',
            code: 1000,
            temp: 22,
            humidity: 60,
            windSpeed: 5,
            location: '未知位置'
        };
    }
    
    // 根据天气条件显示特效
    showWeatherEffect(weather) {
        const effectsContainer = document.getElementById('weather-effects');
        effectsContainer.innerHTML = '';
        
        const preference = appState.get('settings.weatherPreference');
        
        // 雨天效果
        if (weather.code >= 1180 && weather.code <= 1201) {
            if (preference !== 'no-rain') {
                this.createRainEffect(effectsContainer);
            }
        }
        
        // 雪天效果
        if (weather.code >= 1210 && weather.code <= 1282) {
            if (preference !== 'no-snow') {
                this.createSnowEffect(effectsContainer);
            }
        }
    }
    
    createRainEffect(container) {
        container.style.opacity = '1';
        
        for (let i = 0; i < 50; i++) {
            const drop = document.createElement('div');
            drop.className = 'rain-drop';
            drop.style.left = Math.random() * 100 + '%';
            drop.style.animationDelay = Math.random() * 2 + 's';
            drop.style.animationDuration = (Math.random() * 0.5 + 0.5) + 's';
            container.appendChild(drop);
        }
    }
    
    createSnowEffect(container) {
        container.style.opacity = '1';
        
        for (let i = 0; i < 30; i++) {
            const flake = document.createElement('div');
            flake.className = 'snowflake';
            flake.textContent = '❄';
            flake.style.left = Math.random() * 100 + '%';
            flake.style.animationDelay = Math.random() * 3 + 's';
            flake.style.animationDuration = (Math.random() * 2 + 2) + 's';
            container.appendChild(flake);
        }
    }
}

// ================================================
// 画布渲染器（四季树和星空）
// ================================================

class CanvasRenderer {
    constructor() {
        this.canvas = document.getElementById('atmosphere-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        
        this.setupCanvas();
        this.createSeasonalTree();
        this.createStarField();
        this.startAnimation();
    }
    
    setupCanvas() {
        const resizeCanvas = () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
    }
    
    createSeasonalTree() {
        const now = new Date();
        const month = now.getMonth() + 1;
        
        // 根据月份确定季节
        let season;
        if (month >= 3 && month <= 5) season = 'spring';
        else if (month >= 6 && month <= 8) season = 'summer';
        else if (month >= 9 && month <= 11) season = 'autumn';
        else season = 'winter';
        
        this.drawTree(season);
    }
    
    drawTree(season) {
        const centerX = this.canvas.width * 0.8;
        const centerY = this.canvas.height * 0.7;
        const trunkHeight = 100;
        const trunkWidth = 20;
        
        // 绘制树干
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(centerX - trunkWidth/2, centerY - trunkHeight, trunkWidth, trunkHeight);
        
        // 绘制树冠
        const crownRadius = 60;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY - trunkHeight, crownRadius, 0, Math.PI * 2);
        
        switch (season) {
            case 'spring':
                this.ctx.fillStyle = '#90EE90';
                this.ctx.fill();
                // 添加花朵
                this.addTreeDecorations(centerX, centerY - trunkHeight, crownRadius, '🌸', 8);
                break;
            case 'summer':
                this.ctx.fillStyle = '#228B22';
                this.ctx.fill();
                // 添加果实
                this.addTreeDecorations(centerX, centerY - trunkHeight, crownRadius, '🍎', 5);
                break;
            case 'autumn':
                this.ctx.fillStyle = '#FFD700';
                this.ctx.fill();
                // 添加落叶动画
                this.createFallingLeaves(centerX, centerY - trunkHeight);
                break;
            case 'winter':
                this.ctx.fillStyle = '#696969';
                this.ctx.fill();
                // 添加雪花
                this.addTreeDecorations(centerX, centerY - trunkHeight, crownRadius, '❄️', 6);
                break;
        }
    }
    
    addTreeDecorations(x, y, radius, emoji, count) {
        this.ctx.font = '16px serif';
        
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const decorX = x + Math.cos(angle) * (radius * 0.7);
            const decorY = y + Math.sin(angle) * (radius * 0.7);
            this.ctx.fillText(emoji, decorX, decorY);
        }
    }
    
    createFallingLeaves(treeX, treeY) {
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: treeX + (Math.random() - 0.5) * 120,
                y: treeY + Math.random() * 20,
                vx: (Math.random() - 0.5) * 2,
                vy: Math.random() * 2 + 1,
                char: ['🍂', '🍁'][Math.floor(Math.random() * 2)],
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.1
            });
        }
    }
    
    createStarField() {
        const hour = new Date().getHours();
        
        // 只在夜晚显示星空 (22:00 - 04:00)
        if (hour >= 22 || hour <= 4) {
            for (let i = 0; i < 100; i++) {
                this.particles.push({
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height * 0.6, // 只在上半部分
                    brightness: Math.random(),
                    twinkleSpeed: Math.random() * 0.02 + 0.01,
                    type: 'star'
                });
            }
            
            // 偶尔添加流星
            if (Math.random() < 0.1) {
                this.createMeteor();
            }
        }
    }
    
    createMeteor() {
        this.particles.push({
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height * 0.3,
            vx: Math.random() * 5 + 3,
            vy: Math.random() * 3 + 2,
            life: 60,
            maxLife: 60,
            type: 'meteor'
        });
    }
    
    startAnimation() {
        const animate = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // 重绘树
            this.createSeasonalTree();
            
            // 更新和绘制粒子
            this.updateParticles();
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    updateParticles() {
        this.particles = this.particles.filter(particle => {
            if (particle.type === 'star') {
                // 星星闪烁效果
                particle.brightness += particle.twinkleSpeed;
                if (particle.brightness > 1) {
                    particle.brightness = 1;
                    particle.twinkleSpeed = -Math.abs(particle.twinkleSpeed);
                } else if (particle.brightness < 0.3) {
                    particle.brightness = 0.3;
                    particle.twinkleSpeed = Math.abs(particle.twinkleSpeed);
                }
                
                this.ctx.fillStyle = `rgba(255, 255, 255, ${particle.brightness})`;
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, 1, 0, Math.PI * 2);
                this.ctx.fill();
                
                return true;
            }
            
            if (particle.type === 'meteor') {
                // 流星效果
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.life--;
                
                const alpha = particle.life / particle.maxLife;
                this.ctx.strokeStyle = `rgba(255, 255, 200, ${alpha})`;
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(particle.x, particle.y);
                this.ctx.lineTo(particle.x - particle.vx * 10, particle.y - particle.vy * 10);
                this.ctx.stroke();
                
                return particle.life > 0;
            }
            
            // 落叶效果
            if (particle.char) {
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.rotation += particle.rotationSpeed;
                
                this.ctx.save();
                this.ctx.translate(particle.x, particle.y);
                this.ctx.rotate(particle.rotation);
                this.ctx.font = '20px serif';
                this.ctx.fillText(particle.char, 0, 0);
                this.ctx.restore();
                
                return particle.y < this.canvas.height;
            }
            
            return false;
        });
    }
}

// ================================================
// 主应用类
// ================================================

class JustInTimeApp {
    constructor() {
        this.currentPage = 'home';
        this.currentLanguage = 'zh';
        this.currentTheme = 'auto';
        
        this.setupEventListeners();
        this.initializeApp();
    }
    
    async initializeApp() {
        console.log('初始化 Just in Time 应用...');
        
        // 加载用户设置
        this.loadSettings();
        
        // 初始化各个组件
        this.musicPlayer = new MusicPlayer();
        this.weatherService = new WeatherService();
        
        // 启动时间更新
        this.startTimeUpdate();
        
        // 获取天气信息
        await this.updateWeather();
        
        // 更新UI
        this.updateGreeting();
        this.updateFlowerDisplay();
        this.updatePetDisplay();
        this.updateTodayTasks();
        this.updateTodayStatus();
        this.updateCountdown();
        this.updateAchievements();
        
        console.log('所有UI更新完成');
        
        // 设置当前页面为首页
        this.currentPage = 'home';
        
        // 确保首页显示
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        const homePage = document.getElementById('page-home');
        if (homePage) {
            homePage.classList.add('active');
        }
        
        // 确保导航栏首页高亮
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        const homeNav = document.querySelector('[data-page="home"]');
        if (homeNav) {
            homeNav.classList.add('active');
        }
        
        // 设置通知
        this.setupNotifications();
        
        console.log('应用初始化完成！');
    }
    
    loadSettings() {
        const settings = appState.get('settings');
        this.currentLanguage = settings.language;
        this.currentTheme = settings.theme;
        
        // 应用主题
        this.applyTheme();
        
        // 应用语言
        this.applyLanguage();
    }
    
    applyTheme() {
        const hour = new Date().getHours();
        let theme = this.currentTheme;
        
        if (theme === 'auto') {
            theme = (hour >= 6 && hour < 18) ? 'light' : 'dark';
        }
        
        document.documentElement.setAttribute('data-theme', theme);
        
        // 更新背景渐变
        this.updateBackgroundGradient();
    }
    
    updateBackgroundGradient() {
        const hour = new Date().getHours();
        const background = document.getElementById('dynamic-background');
        
        let gradient;
        if (hour >= 5 && hour < 8) {
            // 日出时分
            gradient = 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)';
        } else if (hour >= 8 && hour < 17) {
            // 白天
            gradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        } else if (hour >= 17 && hour < 20) {
            // 黄昏
            gradient = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
        } else {
            // 夜晚
            gradient = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)';
        }
        
        background.style.background = gradient;
    }
    
    applyLanguage() {
        const lang = this.currentLanguage;
        const t = i18n[lang];
        
        console.log('应用语言:', lang);
        
        // 添加淡出效果
        document.body.style.opacity = '0.7';
        document.body.style.transition = 'opacity 0.2s ease';
        
        setTimeout(() => {
            // 使用data-i18n属性更新所有文本
            document.querySelectorAll('[data-i18n]').forEach(element => {
                const key = element.getAttribute('data-i18n');
                const text = this.getNestedValue(t, key);
                if (text) {
                    element.textContent = text;
                }
            });
            
            // 更新placeholder
            document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
                const key = element.getAttribute('data-i18n-placeholder');
                const text = this.getNestedValue(t, key);
                if (text) {
                    element.placeholder = text;
                }
            });
            
                    // 更新日期显示格式
        this.updateDateTime();
        
        // 更新问候语
        this.updateGreeting();
        
        // 更新花朵等级显示
        this.updateFlowerDisplay();
            
            // 更新主题商店等动态内容
            if (this.currentPage === 'wardrobe') {
                this.updateThemeShop();
            }
            
            // 淡入效果
            document.body.style.opacity = '1';
        }, 100);
    }
    
    // 获取嵌套对象值的辅助函数
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : null;
        }, obj);
    }
    

    
    setupEventListeners() {
        // 导航事件
        document.addEventListener('click', (e) => {
            if (e.target.closest('.nav-item')) {
                const page = e.target.closest('.nav-item').dataset.page;
                console.log('导航点击:', page);
                this.navigateToPage(page);
            }
        });
        
        // 快捷打卡按钮
        document.getElementById('wake-up-btn').addEventListener('click', () => {
            const t = i18n[this.currentLanguage];
            this.handleQuickCheckin(t.ui.wakeUp, 'wake');
        });
        
        document.getElementById('sleep-btn').addEventListener('click', () => {
            const t = i18n[this.currentLanguage];
            this.handleQuickCheckin(t.ui.sleep, 'sleep');
        });
        
        // 自定义打卡
        document.getElementById('add-task-btn').addEventListener('click', () => {
            this.handleCustomCheckin();
        });
        
        // 闹钟按钮
        document.getElementById('alarm-btn').addEventListener('click', () => {
            this.showAlarmModal();
        });
        
        // 宠物交互事件
        this.setupPetInteraction();
        
        // 设置页面事件
        this.setupSettingsEvents();
        
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.id === 'custom-task') {
                this.handleCustomCheckin();
            }
        });
    }
    
    setupSettingsEvents() {
        // 主题切换
        document.getElementById('theme-select').addEventListener('change', (e) => {
            this.currentTheme = e.target.value;
            appState.set('settings.theme', e.target.value);
            this.applyTheme();
        });
        
        // 语言切换
        document.getElementById('language-select').addEventListener('change', (e) => {
            this.currentLanguage = e.target.value;
            appState.set('settings.language', e.target.value);
            this.applyLanguage();
            this.updateGreeting();
        });
        
        // 宠物名称
        document.getElementById('pet-name-input').addEventListener('change', (e) => {
            appState.set('settings.petName', e.target.value);
            this.updatePetDisplay();
        });
        
        // 天气偏好
        document.getElementById('weather-preference').addEventListener('change', (e) => {
            appState.set('settings.weatherPreference', e.target.value);
            this.updateWeather();
        });
        
        // 音效开关
        const soundEffectsToggle = document.getElementById('sound-effects');
        const soundEffectsSlider = soundEffectsToggle.parentElement;
        
        soundEffectsToggle.addEventListener('change', (e) => {
            appState.set('settings.soundEffects', e.target.checked);
            console.log('音效开关:', e.target.checked);
        });
        
        // 确保slider可点击
        soundEffectsSlider.addEventListener('click', (e) => {
            if (e.target !== soundEffectsToggle) {
                soundEffectsToggle.checked = !soundEffectsToggle.checked;
                appState.set('settings.soundEffects', soundEffectsToggle.checked);
                console.log('音效开关(点击slider):', soundEffectsToggle.checked);
            }
        });
        
        // 通知时间
        document.getElementById('notification-time').addEventListener('change', (e) => {
            appState.set('settings.notificationTime', e.target.value);
        });
        
        // 倒计时设置
        document.getElementById('save-countdown-btn').addEventListener('click', () => {
            this.saveCountdown();
        });
        
        // 通知权限
        document.getElementById('request-permission-btn').addEventListener('click', () => {
            this.requestNotificationPermission();
        });
        
        // 数据导出
        document.getElementById('export-data-btn').addEventListener('click', () => {
            appState.exportData();
        });
        
        // 数据重置
        document.getElementById('reset-data-btn').addEventListener('click', () => {
            this.showResetDataModal();
        });
    }
    
    navigateToPage(page) {
        console.log('navigateToPage被调用:', page, '当前页面:', this.currentPage);
        
        if (page === this.currentPage) return;
        
        // 更新导航状态
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        const targetNav = document.querySelector(`[data-page="${page}"]`);
        if (targetNav) {
            targetNav.classList.add('active');
        }
        
        // 页面切换动画
        const currentPageEl = document.getElementById(`page-${this.currentPage}`);
        const nextPageEl = document.getElementById(`page-${page}`);
        
        console.log('切换页面:', {
            from: this.currentPage,
            to: page,
            currentEl: !!currentPageEl,
            nextEl: !!nextPageEl
        });
        
        // 隐藏所有页面
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active', 'prev');
        });
        
        // 显示目标页面
        if (nextPageEl) {
            nextPageEl.classList.add('active');
        }
        
        this.currentPage = page;
        
        // 页面特定的更新
        if (page === 'stats') {
            this.updateStats();
        } else if (page === 'wardrobe') {
            this.updateWardrobe();
        } else if (page === 'settings') {
            this.updateSettings();
        }
    }
    
    handleQuickCheckin(task, type) {
        const todayStatus = appState.get('todayStatus');
        const today = new Date().toDateString();
        
        // 检查是否是新的一天
        if (todayStatus.date !== today) {
            appState.set('todayStatus', {
                date: today,
                wakeUp: false,
                sleep: false
            });
        }
        
        // 检查是否已经打卡
        if ((type === 'wake' && todayStatus.wakeUp) || (type === 'sleep' && todayStatus.sleep)) {
            const t = i18n[this.currentLanguage];
            this.showModal(t.ui.toastDuplicateCheckin, t.ui.toastDuplicateCheckin, [{
                text: t.ui.buttonConfirm,
                primary: true,
                callback: () => {}
            }]);
            return;
        }
        
        // 添加打卡记录
        appState.addCheckin(task, type);
        
        // 更新今日状态
        const newStatus = { ...todayStatus, date: today };
        if (type === 'wake') newStatus.wakeUp = true;
        if (type === 'sleep') newStatus.sleep = true;
        appState.set('todayStatus', newStatus);
        
        // 显示个性化消息
        this.showCheckinMessage(task, type);
        
        // 更新UI
        this.updateTodayStatus();
        this.updateFlowerDisplay();
        this.updateTodayTasks();
        
        // 播放音效
        this.musicPlayer.playSound('success');
    }
    
    showCheckinMessage(task, type) {
        const hour = new Date().getHours();
        const messages = i18n[this.currentLanguage].checkin;
        let messageArray;
        let timeCategory = 'normal';
        
        if (type === 'wake') {
            if (hour < 5) timeCategory = 'veryEarly';
            else if (hour < 7) timeCategory = 'early';
            else if (hour < 10) timeCategory = 'normal';
            else if (hour < 12) timeCategory = 'late';
            else if (hour < 15) timeCategory = 'veryLate';
            else timeCategory = 'afternoon';
            
            messageArray = messages.wakeUpMessages[timeCategory];
        } else if (type === 'sleep') {
            if (hour < 20) timeCategory = 'veryEarly';
            else if (hour < 22) timeCategory = 'early';
            else if (hour < 24) timeCategory = 'normal';
            else if (hour < 2) timeCategory = 'late';
            else if (hour < 5) timeCategory = 'veryLate';
            else timeCategory = 'dawn';
            
            messageArray = messages.sleepMessages[timeCategory];
        } else {
            messageArray = messages.sleepMessages;
        }
        
        const message = messageArray[Math.floor(Math.random() * messageArray.length)];
        
        this.showModal('打卡成功！', message, [{
            text: '谢谢！',
            primary: true,
            callback: () => {}
        }]);
    }
    
    handleCustomCheckin() {
        const taskInput = document.getElementById('custom-task');
        const categorySelect = document.getElementById('task-category');
        
        const task = taskInput.value.trim();
        const category = categorySelect.value;
        
        if (!task) {
            taskInput.focus();
            return;
        }
        
        // 检查重复打卡
        const todayCheckins = appState.get('checkins').filter(c => 
            c.date === new Date().toDateString() && c.task === task
        );
        
        if (todayCheckins.length > 0) {
            const t = i18n[this.currentLanguage];
            this.showModal(t.ui.modalResetTitle, `${t.ui.toastDuplicateCheckin} "${task}"`, [{
                text: t.ui.buttonConfirm,
                primary: true,
                callback: () => {
                    this.doCustomCheckin(task, category);
                }
            }, {
                text: t.ui.buttonCancel,
                callback: () => {}
            }]);
        } else {
            this.doCustomCheckin(task, category);
        }
    }
    
    doCustomCheckin(task, category) {
        // 添加打卡记录
        appState.addCheckin(task, category);
        
        // 清空输入
        document.getElementById('custom-task').value = '';
        
        // 更新UI
        this.updateTodayTasks();
        this.updateFlowerDisplay();
        
        // 播放音效
        this.musicPlayer.playSound('success');
        
        // 显示成功提示
        const t = i18n[this.currentLanguage];
        this.showToast(t.ui.toastCheckinSuccess);
    }
    
    startTimeUpdate() {
        const updateTime = () => {
            this.updateDateTime();
            
            // 每小时更新一次问候语和背景
            const now = new Date();
            if (now.getMinutes() === 0 && now.getSeconds() === 0) {
                this.updateGreeting();
                this.updateBackgroundGradient();
            }
        };
        
        updateTime();
        setInterval(updateTime, 1000);
    }
    
    updateDateTime() {
        const now = new Date();
        const timeEl = document.getElementById('current-time');
        const dateEl = document.getElementById('current-date');
        
        if (timeEl) {
            timeEl.textContent = now.toLocaleTimeString(this.currentLanguage === 'zh' ? 'zh-CN' : 'en-US', {
                hour12: this.currentLanguage === 'en',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        }
        
        if (dateEl) {
            const locale = this.currentLanguage === 'zh' ? 'zh-CN' : 'en-US';
            dateEl.textContent = now.toLocaleDateString(locale, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
            });
        }
    }
    
    async updateWeather() {
        console.log('开始更新天气...');
        try {
            const weather = await this.weatherService.getCurrentWeather();
            console.log('获取到天气数据:', weather);
            
            const greetingEl = document.getElementById('weather-greeting');
            
            if (greetingEl && weather) {
                let weatherMessage = i18n[this.currentLanguage].weather.sunny;
                
                // 根据天气条件选择消息
                if (weather.code >= 1180 && weather.code <= 1201) {
                    const preference = appState.get('settings.weatherPreference');
                    weatherMessage = preference === 'no-rain' 
                        ? i18n[this.currentLanguage].weather.rainyComfort
                        : i18n[this.currentLanguage].weather.rainy;
                } else if (weather.code >= 1210 && weather.code <= 1282) {
                    weatherMessage = i18n[this.currentLanguage].weather.snowy;
                } else if (weather.code >= 1006 && weather.code <= 1030) {
                    weatherMessage = i18n[this.currentLanguage].weather.cloudy;
                }
                
                const weatherText = `${weather.location} ${weather.temp}°C，${weatherMessage}`;
                greetingEl.textContent = weatherText;
                console.log('天气信息已更新:', weatherText);
            }
            
            // 显示天气特效
            if (this.weatherService.showWeatherEffect) {
                this.weatherService.showWeatherEffect(weather);
            }
            
        } catch (error) {
            console.error('更新天气失败:', error);
            // 显示默认天气信息
            const greetingEl = document.getElementById('weather-greeting');
            if (greetingEl) {
                greetingEl.textContent = '今天天气不错，心情也要棒棒的！';
            }
        }
    }
    
    updateGreeting() {
        const hour = new Date().getHours();
        const greetingEl = document.getElementById('weather-greeting');
        
        if (!greetingEl) return;
        
        let greetingKey;
        if (hour >= 5 && hour < 11) {
            greetingKey = 'morning';
        } else if (hour >= 11 && hour < 14) {
            greetingKey = 'noon';
        } else if (hour >= 14 && hour < 18) {
            greetingKey = 'afternoon';
        } else if (hour >= 18 && hour < 22) {
            greetingKey = 'evening';
        } else {
            greetingKey = 'night';
        }
        
        // 使用多语言问候语
        const greetings = i18n[this.currentLanguage]?.greetings?.[greetingKey];
        let greeting = '';
        
        if (greetings && greetings.length > 0) {
            greeting = greetings[Math.floor(Math.random() * greetings.length)];
        } else {
            // 兜底方案
            const fallbackGreetings = {
                'zh': {
                    morning: '早晨好！新的一天开始了，要加油哦！',
                    noon: '中午好！该吃午饭了，记得休息！',
                    afternoon: '下午好！午后时光，继续努力！',
                    evening: '傍晚好！今天过得怎么样？',
                    night: '晚上好！该准备休息了，晚安！'
                },
                'en': {
                    morning: 'Good morning! A new day begins, keep going!',
                    noon: 'Good noon! Time for lunch, remember to rest!',
                    afternoon: 'Good afternoon! Keep up the good work!',
                    evening: 'Good evening! How was your day?',
                    night: 'Good night! Time to rest, sweet dreams!'
                }
            };
            greeting = fallbackGreetings[this.currentLanguage]?.[greetingKey] || 
                      fallbackGreetings['zh'][greetingKey];
        }
        
        // 获取天气信息
        const weatherDisplay = this.getWeatherDisplay();
        
        // 显示问候语和天气
        greetingEl.innerHTML = `
            <div class="greeting-main">${greeting}</div>
            ${weatherDisplay ? `<div class="weather-info">${weatherDisplay}</div>` : ''}
        `;
    }
    
    getWeatherDisplay() {
        try {
            // 这里可以模拟天气或从API获取
            // 为了演示，我们随机选择一个天气
            const weatherTypes = ['sunny', 'cloudy', 'rainy'];
            const currentWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
            
            const t = i18n[this.currentLanguage];
            const weatherDesc = t.weather.weatherDesc[currentWeather] || currentWeather;
            
            return `${t.weather.currentWeather}${weatherDesc}`;
        } catch (error) {
            return null;
        }
    }
    
    updateFlowerDisplay() {
        const flower = appState.get('flower');
        const levelEl = document.getElementById('flower-level');
        const progressEl = document.getElementById('sunlight-progress');
        const svgEl = document.getElementById('flower-svg');
        
        if (levelEl) {
            levelEl.textContent = CONFIG.flower.levels[flower.level];
        }
        
        if (progressEl) {
            const currentThreshold = CONFIG.flower.thresholds[flower.level];
            const nextThreshold = CONFIG.flower.thresholds[flower.level + 1] || CONFIG.flower.thresholds[flower.level];
            const progress = ((flower.sunlight - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
            progressEl.style.width = Math.max(0, Math.min(100, progress)) + '%';
        }
        
        if (svgEl) {
            this.renderFlowerSVG(svgEl, flower.level);
        }
    }
    
    renderFlowerSVG(svgEl, level) {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const primaryColor = isDark ? '#a78bfa' : '#667eea';
        const secondaryColor = isDark ? '#34d399' : '#48bb78';
        
        let svgContent = '';
        
        switch (level) {
            case 0: // 种子
                svgContent = `
                    <circle cx="40" cy="60" r="8" fill="${primaryColor}" opacity="0.8"/>
                    <text x="40" y="20" text-anchor="middle" font-size="12" fill="currentColor">🌱</text>
                `;
                break;
            case 1: // 出芽
                svgContent = `
                    <rect x="38" y="50" width="4" height="20" fill="${secondaryColor}"/>
                    <path d="M40 50 Q35 45 30 50 Q35 40 40 45" fill="${secondaryColor}" opacity="0.7"/>
                `;
                break;
            case 2: // 小苗
                svgContent = `
                    <rect x="38" y="40" width="4" height="30" fill="${secondaryColor}"/>
                    <path d="M40 45 Q30 40 25 50 Q30 35 40 40" fill="${secondaryColor}"/>
                    <path d="M40 50 Q50 45 55 55 Q50 40 40 45" fill="${secondaryColor}"/>
                `;
                break;
            case 3: // 花骨朵
                svgContent = `
                    <rect x="38" y="35" width="4" height="35" fill="${secondaryColor}"/>
                    <path d="M40 40 Q30 35 25 45 Q30 30 40 35" fill="${secondaryColor}"/>
                    <path d="M40 45 Q50 40 55 50 Q50 35 40 40" fill="${secondaryColor}"/>
                    <circle cx="40" cy="35" r="6" fill="${primaryColor}" opacity="0.8"/>
                `;
                break;
            case 4: // 开花
                svgContent = `
                    <rect x="38" y="30" width="4" height="40" fill="${secondaryColor}"/>
                    <path d="M40 35 Q30 30 25 40 Q30 25 40 30" fill="${secondaryColor}"/>
                    <path d="M40 40 Q50 35 55 45 Q50 30 40 35" fill="${secondaryColor}"/>
                    <circle cx="40" cy="30" r="3" fill="#ffd700"/>
                    <path d="M40 30 m-8,0 a8,8 0 0,1 16,0 a8,8 0 0,1 -16,0" fill="${primaryColor}" opacity="0.9"/>
                    <path d="M40 30 m-6,-6 a6,6 0 0,1 12,0 a6,6 0 0,1 -12,0" fill="${primaryColor}" opacity="0.7"/>
                    <path d="M40 30 m6,-6 a6,6 0 0,1 0,12 a6,6 0 0,1 0,-12" fill="${primaryColor}" opacity="0.7"/>
                    <path d="M40 30 m6,6 a6,6 0 0,1 -12,0 a6,6 0 0,1 12,0" fill="${primaryColor}" opacity="0.7"/>
                    <path d="M40 30 m-6,6 a6,6 0 0,1 0,-12 a6,6 0 0,1 0,12" fill="${primaryColor}" opacity="0.7"/>
                `;
                break;
        }
        
        svgEl.innerHTML = svgContent;
    }
    
    updatePetDisplay() {
        const petNameEl = document.getElementById('pet-name');
        const accessoryEl = document.getElementById('pet-accessory');
        
        if (petNameEl) {
            const petName = appState.get('settings.petName') || '小伙伴';
            petNameEl.textContent = petName;
        }
        
        if (accessoryEl) {
            const month = new Date().getMonth() + 1;
            let accessory = '';
            
            if (month >= 3 && month <= 5) {
                accessory = '🌱'; // 春天嘴叼青草
            } else if (month >= 6 && month <= 8) {
                accessory = '🌼'; // 夏天拿扇子
            } else if (month >= 9 && month <= 11) {
                accessory = '🍂'; // 秋天拿果实
            } else {
                accessory = '❄️'; // 冬天戴帽子围巾手套
            }
            
            accessoryEl.textContent = accessory;
        }
    }
    
    updateTodayTasks() {
        const tasksContainer = document.getElementById('today-tasks');
        if (!tasksContainer) {
            return;
        }
        
        // 获取所有打卡记录，显示最近3条
        const allCheckins = appState.get('checkins');
        const recentCheckins = allCheckins.slice(-3).reverse(); // 最近3条，倒序
        
        tasksContainer.innerHTML = '';
        
        if (recentCheckins.length === 0) {
            const t = i18n[this.currentLanguage];
            tasksContainer.innerHTML = `<div class="no-tasks">${t.ui.noCheckins}</div>`;
            return;
        }
        
        recentCheckins.forEach(checkin => {
            const taskEl = document.createElement('div');
            taskEl.className = 'task-item';
            
            const time = new Date(checkin.timestamp).toLocaleTimeString(
                this.currentLanguage === 'zh' ? 'zh-CN' : 'en-US', 
                {
                    hour: '2-digit',
                    minute: '2-digit'
                }
            );
            
            const t = i18n[this.currentLanguage];
            const categoryNames = t.ui.categories;
            
            taskEl.innerHTML = `
                <div class="task-content">
                    <span class="task-category category-${checkin.category}">${categoryNames[checkin.category]}</span>
                    <span class="task-text">${checkin.task}</span>
                </div>
                <span class="task-time">${time}</span>
            `;
            
            tasksContainer.appendChild(taskEl);
        });
        
        if (todayCheckins.length === 0) {
            tasksContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 1rem;">今天还没有打卡记录</p>';
        }
    }
    
    updateTodayStatus() {
        const todayStatus = appState.get('todayStatus');
        const today = new Date().toDateString();
        
        // 检查是否是新的一天
        if (todayStatus.date !== today) {
            appState.set('todayStatus', {
                date: today,
                wakeUp: false,
                sleep: false
            });
        }
        
        const wakeUpBtn = document.getElementById('wake-up-btn');
        const sleepBtn = document.getElementById('sleep-btn');
        
        if (wakeUpBtn) {
            wakeUpBtn.disabled = todayStatus.wakeUp;
            if (todayStatus.wakeUp) {
                wakeUpBtn.innerHTML = `
                    <span class="btn-icon">✅</span>
                    <span class="btn-text">已起床</span>
                `;
            }
        }
        
        if (sleepBtn) {
            sleepBtn.disabled = todayStatus.sleep;
            if (todayStatus.sleep) {
                sleepBtn.innerHTML = `
                    <span class="btn-icon">✅</span>
                    <span class="btn-text">已睡觉</span>
                `;
            }
        }
    }
    
    updateCountdown() {
        const countdown = appState.get('countdown');
        const countdownSection = document.getElementById('countdown-section');
        
        if (!countdown || !countdown.date) {
            countdownSection.style.display = 'none';
            return;
        }
        
        const targetDate = new Date(countdown.date);
        const now = new Date();
        const diff = targetDate.getTime() - now.getTime();
        
        if (diff <= 0) {
            countdownSection.style.display = 'none';
            return;
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        document.getElementById('countdown-name').textContent = countdown.name;
        document.getElementById('countdown-time').textContent = `${days}天 ${hours}小时 ${minutes}分钟`;
        
        countdownSection.style.display = 'block';
    }
    
    updateAchievements() {
        const achievementsContainer = document.getElementById('achievements-list');
        const gardenContainer = document.getElementById('achievement-garden');
        const pointsEl = document.getElementById('achievement-points');
        
        if (!achievementsContainer) return;
        
        const unlockedAchievements = appState.get('achievements.unlocked');
        const points = appState.get('achievements.points');
        
        if (pointsEl) {
            pointsEl.textContent = points;
        }
        
        // 更新成就花园
        if (gardenContainer) {
            gardenContainer.innerHTML = '';
            for (let i = 0; i < points; i++) {
                const star = document.createElement('span');
                star.className = 'achievement-star';
                star.textContent = '⭐';
                star.style.animationDelay = `${i * 0.1}s`;
                gardenContainer.appendChild(star);
            }
        }
        
        // 更新成就列表
        achievementsContainer.innerHTML = '';
        
        Object.entries(CONFIG.achievements).forEach(([key, achievement]) => {
            const isUnlocked = unlockedAchievements.includes(key);
            
            const achievementEl = document.createElement('div');
            achievementEl.className = 'achievement-item';
            
            achievementEl.innerHTML = `
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-info">
                    <div class="achievement-name">${achievement.name}</div>
                    <div class="achievement-desc">${this.getAchievementDescription(key, achievement)}</div>
                </div>
                <div class="achievement-status ${isUnlocked ? 'status-unlocked' : 'status-locked'}">
                    ${isUnlocked ? '已解锁' : '未解锁'}
                </div>
            `;
            
            achievementsContainer.appendChild(achievementEl);
        });
    }
    
    getAchievementDescription(key, achievement) {
        const descriptions = {
            morningBird: `连续${achievement.threshold}天早起`,
            earlyBird: `${achievement.threshold}次早起打卡`,
            healthyLife: `连续${achievement.threshold}天健康作息`,
            studyMaster: `完成${achievement.threshold}次学习打卡`,
            workHero: `完成${achievement.threshold}次工作打卡`,
            lifeExpert: `完成${achievement.threshold}次生活打卡`
        };
        
        return descriptions[key] || '特殊成就';
    }
    
    updateStats() {
        this.updateCategoryChart();
        this.updateSleepChart();
    }
    
    updateCategoryChart() {
        const canvas = document.getElementById('category-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const checkins = appState.get('checkins');
        
        // 统计各类别打卡数量
        const categoryCounts = {
            life: 0,
            study: 0,
            work: 0,
            wake: 0,
            sleep: 0
        };
        
        checkins.forEach(checkin => {
            if (categoryCounts.hasOwnProperty(checkin.category)) {
                categoryCounts[checkin.category]++;
            }
        });
        
        const labels = ['生活', '学习', '工作', '起床', '睡觉'];
        const data = [
            categoryCounts.life,
            categoryCounts.study,
            categoryCounts.work,
            categoryCounts.wake,
            categoryCounts.sleep
        ];
        
        const colors = [
            '#48bb78',
            '#667eea',
            '#ed8936',
            '#f093fb',
            '#4facfe'
        ];
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
                            usePointStyle: true,
                            padding: 20
                        }
                    }
                }
            }
        });
    }
    
    updateSleepChart() {
        const canvas = document.getElementById('sleep-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const checkins = appState.get('checkins');
        
        // 获取最近7天的睡眠数据
        const last7Days = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toDateString();
            
            const dayCheckins = checkins.filter(c => c.date === dateStr);
                    const wakeUp = dayCheckins.find(c => c.task.includes('起床') || c.task.includes('Awake') || c.task.includes('I\'m Awake'));
        const sleep = dayCheckins.find(c => c.task.includes('睡') || c.task.includes('Sleep') || c.task.includes('Going to Sleep'));
            
            let sleepDuration = 0;
            if (wakeUp && sleep) {
                const wakeTime = new Date(wakeUp.timestamp);
                const sleepTime = new Date(sleep.timestamp);
                
                // 如果睡觉时间在第二天，计算跨天的睡眠时长
                if (sleepTime.getDate() !== wakeTime.getDate()) {
                    const endOfDay = new Date(sleepTime);
                    endOfDay.setHours(23, 59, 59, 999);
                    sleepDuration = (endOfDay.getTime() - sleepTime.getTime()) / (1000 * 60 * 60);
                    
                    const startOfNextDay = new Date(wakeTime);
                    startOfNextDay.setHours(0, 0, 0, 0);
                    sleepDuration += (wakeTime.getTime() - startOfNextDay.getTime()) / (1000 * 60 * 60);
                } else {
                    sleepDuration = (wakeTime.getTime() - sleepTime.getTime()) / (1000 * 60 * 60);
                }
                
                sleepDuration = Math.max(0, Math.min(24, sleepDuration));
            }
            
            last7Days.push({
                label: date.getMonth() + 1 + '/' + date.getDate(),
                duration: sleepDuration
            });
        }
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: last7Days.map(day => day.label),
                datasets: [{
                    label: '睡眠时长(小时)',
                    data: last7Days.map(day => day.duration),
                    borderColor: '#4facfe',
                    backgroundColor: 'rgba(79, 172, 254, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 12,
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary')
                        }
                    }
                }
            }
        });
    }
    
    updateWardrobe() {
        this.updateAccessories();
        this.updateThemes();
        this.updateAchievements();
    }
    
    setupPetInteraction() {
        const petAvatar = document.getElementById('pet-avatar');
        const petMessage = document.getElementById('pet-message');
        const petExpression = document.getElementById('pet-expression');
        
        if (!petAvatar) return;
        
        const messages = [
            '今天过得怎么样？',
            '记得要好好休息哦！',
            '你真棒，继续加油！',
            '喵～陪你一起成长！',
            '每一天都是新的开始呢！',
            '打卡让生活更有意义！',
            '我们一起变得更好吧！',
            '你的努力我都看到了！',
            '今天也要开心哦～',
            '相信自己，你可以的！'
        ];
        
        const expressions = ['😊', '😄', '🤩', '😉', '😸', '🥰', '😋'];
        
        let interactionCount = 0;
        
        petAvatar.addEventListener('click', () => {
            // 添加动画效果
            petAvatar.classList.add('pet-happy');
            setTimeout(() => petAvatar.classList.remove('pet-happy'), 800);
            
            // 随机更换表情
            if (petExpression) {
                const randomExpression = expressions[Math.floor(Math.random() * expressions.length)];
                petExpression.textContent = randomExpression;
            }
            
            // 显示随机消息
            if (petMessage) {
                const randomMessage = messages[Math.floor(Math.random() * messages.length)];
                petMessage.textContent = randomMessage;
            }
            
            // 显示对话泡泡
            petAvatar.classList.add('speaking');
            setTimeout(() => petAvatar.classList.remove('speaking'), 3000);
            
            // 增加互动次数，偶尔显示特殊效果
            interactionCount++;
            if (interactionCount % 5 === 0) {
                petAvatar.classList.add('excited');
                setTimeout(() => petAvatar.classList.remove('excited'), 2000);
                
                if (petMessage) {
                    petMessage.textContent = '哇！我们已经互动' + interactionCount + '次了！✨';
                }
            }
        });
        
        // 定期自动说话
        setInterval(() => {
            if (!petAvatar.classList.contains('speaking')) {
                const randomChance = Math.random();
                if (randomChance < 0.1) { // 10%概率自动说话
                    const autoMessages = [
                        '咕咕咕～',
                        '今天记得打卡哦！',
                        '我在这里陪着你～',
                        '要不要休息一下？',
                        '你今天很棒呢！'
                    ];
                    
                    if (petMessage) {
                        const randomMsg = autoMessages[Math.floor(Math.random() * autoMessages.length)];
                        petMessage.textContent = randomMsg;
                    }
                    
                    petAvatar.classList.add('speaking');
                    setTimeout(() => petAvatar.classList.remove('speaking'), 2500);
                }
            }
        }, 30000); // 每30秒检查一次
    }
    
    updateAccessories() {
        const grid = document.getElementById('accessories-grid');
        if (!grid) return;
        
        const accessories = [
            { id: 'spring', name: '春季', icon: '🌱', season: 'spring' },
            { id: 'summer', name: '夏季', icon: '🌼', season: 'summer' },
            { id: 'autumn', name: '秋季', icon: '🍂', season: 'autumn' },
            { id: 'winter', name: '冬季', icon: '❄️', season: 'winter' }
        ];
        
        const currentAccessory = appState.get('pet.currentAccessory');
        
        grid.innerHTML = '';
        
        accessories.forEach(accessory => {
            const item = document.createElement('div');
            item.className = 'accessory-item';
            if (currentAccessory === accessory.id) {
                item.classList.add('item-selected');
            }
            
            item.innerHTML = `
                <div class="accessory-icon">${accessory.icon}</div>
                <div class="accessory-name">${accessory.name}</div>
            `;
            
            item.addEventListener('click', () => {
                appState.set('pet.currentAccessory', accessory.id);
                this.updatePetDisplay();
                this.updateAccessories();
            });
            
            grid.appendChild(item);
        });
    }
    
    updateThemes() {
        const grid = document.getElementById('themes-grid');
        if (!grid) return;
        
        // 主题功能可以在这里扩展
        const comingSoonText = i18n[this.currentLanguage]?.ui?.comingSoon || 'Theme shop coming soon!';
        grid.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 2rem;">${comingSoonText}</p>`;
    }
    
    updateSettings() {
        const settings = appState.get('settings');
        
        // 更新设置表单的值
        document.getElementById('theme-select').value = settings.theme;
        document.getElementById('language-select').value = settings.language;
        document.getElementById('pet-name-input').value = settings.petName;
        document.getElementById('weather-preference').value = settings.weatherPreference;
        document.getElementById('sound-effects').checked = settings.soundEffects;
        document.getElementById('notification-time').value = settings.notificationTime;
        
        // 更新倒计时设置
        const countdown = appState.get('countdown');
        if (countdown) {
            document.getElementById('countdown-name-input').value = countdown.name || '';
            document.getElementById('countdown-date-input').value = countdown.date || '';
        }
    }
    
    saveCountdown() {
        const name = document.getElementById('countdown-name-input').value.trim();
        const date = document.getElementById('countdown-date-input').value;
        
        if (!name || !date) {
            this.showToast('请填写完整的倒计时信息');
            return;
        }
        
        appState.set('countdown', { name, date });
        this.updateCountdown();
        this.showToast('倒计时设置成功！');
    }
    
    async requestNotificationPermission() {
        const t = i18n[this.currentLanguage];
        
        if (!('Notification' in window)) {
            this.showToast('Browser does not support notifications');
            return;
        }
        
        if (Notification.permission === 'granted') {
            this.showToast(t.messages.notificationPermissionGranted);
            this.setupNotifications();
            return;
        }
        
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            this.showToast(t.messages.notificationPermissionGranted);
            this.setupNotifications();
        } else {
            this.showToast(t.messages.notificationPermissionDenied);
        }
    }
    
    setupNotifications() {
        if (!('Notification' in window) || Notification.permission !== 'granted') {
            return;
        }
        
        // 根据设置的时间发送每日提醒
        const reminderTime = appState.get('settings.notificationTime') || '21:00';
        this.scheduleNotification(reminderTime);
    }
    
    scheduleNotification(time) {
        const [hours, minutes] = time.split(':').map(Number);
        const now = new Date();
        const notificationTime = new Date();
        notificationTime.setHours(hours, minutes, 0, 0);
        
        // 如果今天的时间已过，设为明天
        if (notificationTime <= now) {
            notificationTime.setDate(notificationTime.getDate() + 1);
        }
        
        const timeUntilNotification = notificationTime.getTime() - now.getTime();
        
        setTimeout(() => {
            this.sendDailyReminder();
            // 设置下一天的通知
            this.scheduleNotification(time);
        }, timeUntilNotification);
    }
    
    sendDailyReminder() {
        const t = i18n[this.currentLanguage];
        if (Notification.permission === 'granted') {
            new Notification(t.ui.toastCheckinSuccess, {
                body: 'Time to check in! Keep up your great habits!',
                icon: './icons/icon-192x192.png'
            });
        }
    }
    
    checkAndSendNotification() {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        const notificationTime = appState.get('settings.notificationTime');
        
        if (!notificationTime) return;
        
        const [targetHour, targetMinute] = notificationTime.split(':').map(Number);
        
        // 检查是否到达通知时间（允许1分钟误差）
        if (hour === targetHour && Math.abs(minute - targetMinute) <= 1) {
            this.sendDailyNotification();
        }
    }
    
    sendDailyNotification() {
        const todayStatus = appState.get('todayStatus');
        const today = new Date().toDateString();
        
        let title, body;
        
        if (todayStatus.date !== today || (!todayStatus.wakeUp && !todayStatus.sleep)) {
            title = '今日打卡提醒';
            body = '还有任务没有完成哦，记得打卡！';
        } else {
            title = '晚安时光';
            body = '今天辛苦了，愿你有个甜美的梦！';
        }
        
        new Notification(title, {
            body: body,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            tag: 'daily-reminder'
        });
    }
    
    showAlarmModal() {
        this.showModal('设置闹钟', '', [{
            text: '取消',
            callback: () => {}
        }], `
            <div style="margin: 1rem 0;">
                <label for="alarm-time" style="display: block; margin-bottom: 0.5rem;">选择时间:</label>
                <input type="time" id="alarm-time" style="width: 100%; padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 0.5rem; background: rgba(255,255,255,0.1);">
            </div>
            <button id="set-alarm-btn" style="width: 100%; padding: 0.75rem; background: var(--primary-color); color: white; border: none; border-radius: 0.5rem; margin-top: 1rem; cursor: pointer;">设置闹钟</button>
        `);
        
        // 设置闹钟事件
        setTimeout(() => {
            document.getElementById('set-alarm-btn').addEventListener('click', () => {
                const time = document.getElementById('alarm-time').value;
                if (time) {
                    this.setAlarm(time);
                    this.hideModal();
                }
            });
        }, 100);
    }
    
    setAlarm(time) {
        const [hours, minutes] = time.split(':').map(Number);
        const now = new Date();
        const alarmTime = new Date();
        
        alarmTime.setHours(hours, minutes, 0, 0);
        
        // 如果设置时间已过，则设为明天
        if (alarmTime <= now) {
            alarmTime.setDate(alarmTime.getDate() + 1);
        }
        
        const timeUntilAlarm = alarmTime.getTime() - now.getTime();
        
        setTimeout(() => {
            this.triggerAlarm();
        }, timeUntilAlarm);
        
        appState.set('alarm', {
            time: time,
            timestamp: alarmTime.toISOString()
        });
        
        this.showToast(`闹钟设置成功！将在 ${time} 响起`);
    }
    
    triggerAlarm() {
        // 播放闹钟音效
        this.musicPlayer.playSound('alarm');
        
        // 显示闹钟弹窗
        this.showModal('⏰ 闹钟响了！', '时间到了！', [{
            text: '知道了',
            primary: true,
            callback: () => {}
        }]);
        
        // 发送通知
        if (Notification.permission === 'granted') {
            new Notification('闹钟提醒', {
                body: '设置的闹钟时间到了！',
                icon: '/icons/icon-192x192.png'
            });
        }
        
        // 清除闹钟设置
        appState.set('alarm', null);
    }
    
    showResetDataModal() {
        const t = i18n[this.currentLanguage];
        this.showModal(
            t.ui.modalResetTitle,
            t.ui.modalResetMessage,
            [{
                text: t.ui.buttonCancel,
                callback: () => {}
            }, {
                text: t.ui.buttonConfirm,
                primary: true,
                callback: () => {
                    // 直接重置数据
                    appState.resetAllData();
                    // 显示成功消息
                    this.showToast(t.messages.resetComplete);
                    // 重新加载页面
                    setTimeout(() => {
                        location.reload();
                    }, 1000);
                }
            }]
        );
    }
    
    showModal(title, message, buttons = [], customContent = '') {
        const modalContainer = document.getElementById('modal-container');
        
        let buttonsHtml = '';
        if (buttons.length > 0) {
            buttonsHtml = `
                <div class="modal-buttons">
                    ${buttons.map(btn => `
                        <button class="modal-btn ${btn.primary ? 'modal-btn-primary' : 'modal-btn-secondary'}">${btn.text}</button>
                    `).join('')}
                </div>
            `;
        }
        
        modalContainer.innerHTML = `
            <div class="modal-overlay show">
                <div class="modal-content">
                    <div class="modal-title">${title}</div>
                    ${message ? `<div class="modal-message">${message}</div>` : ''}
                    ${customContent}
                    ${buttonsHtml}
                </div>
            </div>
        `;
        
        // 绑定按钮事件
        const modalButtons = modalContainer.querySelectorAll('.modal-btn');
        modalButtons.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                if (buttons[index] && buttons[index].callback) {
                    buttons[index].callback();
                }
                this.hideModal();
            });
        });
        
        // 点击遮罩关闭
        modalContainer.querySelector('.modal-overlay').addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.hideModal();
            }
        });
    }
    
    hideModal() {
        const modalContainer = document.getElementById('modal-container');
        modalContainer.innerHTML = '';
    }
    
    showToast(message, duration = 3000) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--background-primary);
            color: var(--text-primary);
            padding: 1rem 2rem;
            border-radius: 2rem;
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid var(--border-color);
            box-shadow: 0 8px 32px var(--shadow-color);
            z-index: 10000;
            font-size: 0.9rem;
            animation: toastSlideIn 0.3s ease-out;
        `;
        toast.textContent = message;
        
        // 添加动画样式
        const style = document.createElement('style');
        style.textContent = `
            @keyframes toastSlideIn {
                from {
                    opacity: 0;
                    transform: translateX(-50%) translateY(-100%);
                }
                to {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'toastSlideIn 0.3s ease-out reverse';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);
    }
}

// ================================================
// 应用初始化
// ================================================

let appState;
let app;

document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM加载完成，开始初始化应用...');
    
    try {
        // 先初始化核心应用
        appState = new AppState();
        app = new JustInTimeApp();
        
        console.log('核心应用初始化完成');
        
        // 自动检测并应用系统语言
        if (!appState.get('settings.language')) {
            const detectedLang = this.detectSystemLanguage();
            appState.set('settings.language', detectedLang);
            this.currentLanguage = detectedLang;
            console.log('自动检测系统语言:', detectedLang);
        }
        this.applyLanguage();
        
        // 动态屏幕适配
        this.setupDynamicLayout();
        
        // 快速初始化入场动画
        setTimeout(() => {
            try {
                if (window.AppIntroManager) {
                    window.introManager = new AppIntroManager();
                }
                console.log('入场动画初始化完成');
            } catch (error) {
                console.warn('入场动画初始化失败:', error);
            }
        }, 100);
        
        // 延迟初始化其他功能
        setTimeout(() => {
            try {
                if (window.FlowerSVGGenerator) {
                    window.flowerGenerator = new FlowerSVGGenerator();
                }
                console.log('花朵生成器初始化完成');
            } catch (error) {
                console.warn('花朵生成器初始化失败:', error);
            }
        }, 1000);
        
        // 暂时禁用Canvas组件，专注核心功能
        /*
        setTimeout(() => {
            try {
                // 初始化动态背景（可选）
                if (window.DynamicBackgroundRenderer && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                    window.dynamicBg = new DynamicBackgroundRenderer('dynamic-background-canvas');
                }
                
                // 初始化四季树（可选）
                if (window.SeasonsTreeRenderer && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                    window.seasonsTree = new SeasonsTreeRenderer('atmosphere-canvas');
                    window.seasonsTree.startAnimation();
                }
                
                console.log('Canvas组件初始化完成');
            } catch (error) {
                console.warn('Canvas组件初始化失败:', error);
            }
        }, 1500);
        */
        
        // 响应式处理
        window.addEventListener('resize', () => {
            if (window.dynamicBg) window.dynamicBg.resize();
            if (window.seasonsTree) window.seasonsTree.resize();
        });
        
        // iPad横竖屏切换优化
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                if (window.dynamicBg) window.dynamicBg.resize();
                if (window.seasonsTree) window.seasonsTree.resize();
            }, 100);
        });
        
        // 定时更新问候语（每5分钟更换一次）
        setInterval(() => {
            if (window.app && window.app.updateGreeting) {
                window.app.updateGreeting();
            }
        }, 5 * 60 * 1000);
        
        // 每小时强制更新一次问候语和天气
        setInterval(() => {
            if (window.app) {
                if (window.app.updateGreeting) window.app.updateGreeting();
                if (window.app.updateWeather) window.app.updateWeather();
            }
        }, 60 * 60 * 1000);
        
    } catch (error) {
        console.error('应用初始化失败:', error);
    }
});

// 全局错误处理
window.addEventListener('error', (e) => {
    console.error('应用错误:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('未处理的Promise拒绝:', e.reason);
});

// 导出到全局作用域供调试使用
window.appState = appState;
window.app = app;