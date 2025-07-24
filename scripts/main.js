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
    
    // 成就配置
    achievements: {
        morningBird: { threshold: 7, name: '一日之计在于晨', icon: '🌅' },
        earlyBird: { threshold: 5, name: '早起的鸟儿', icon: '🐦' },
        healthyLife: { threshold: 7, name: '健康作息', icon: '💪' },
        studyMaster: { threshold: 10, name: '学习达人', icon: '📚' },
        workHero: { threshold: 15, name: '工作英雄', icon: '💼' },
        lifeExpert: { threshold: 20, name: '生活专家', icon: '🏠' }
    },
    
    // 预设音乐列表
    defaultMusic: [
        { name: '曲目一', path: './audio/track1.mp3' },
        { name: '曲目二', path: './audio/track2.mp3' },
        { name: '曲目三', path: './audio/track3.mp3' },
        { name: '曲目四', path: './audio/track4.mp3' },
        { name: '曲目五', path: './audio/track5.mp3' }
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
    
    // 加载本地存储的数据
    loadData() {
        const defaultData = {
            // 用户设置
            settings: {
                theme: CONFIG.app.defaultTheme,
                language: CONFIG.app.defaultLanguage,
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
            return c.task === '我起床啦' && hour >= 6 && hour <= 9;
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
        
        // 获取最近7天的数据
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toDateString();
            
            const dayCheckins = checkins.filter(c => c.date === dateStr);
            const wakeUp = dayCheckins.find(c => c.task === '我起床啦');
            const sleep = dayCheckins.find(c => c.task === '我要睡了');
            
            last7Days.push({
                date: dateStr,
                hasWakeUp: !!wakeUp,
                hasSleep: !!sleep,
                wakeUpTime: wakeUp ? new Date(wakeUp.timestamp).getHours() : null,
                sleepTime: sleep ? new Date(sleep.timestamp).getHours() : null
            });
        }
        
        // 检查连续健康作息
        let consecutiveHealthy = 0;
        for (const day of last7Days) {
            if (day.hasWakeUp && day.hasSleep && 
                day.wakeUpTime >= 6 && day.wakeUpTime <= 9 &&
                day.sleepTime >= 22 || day.sleepTime <= 2) {
                consecutiveHealthy++;
            } else {
                break;
            }
        }
        
        if (consecutiveHealthy >= CONFIG.achievements.healthyLife.threshold) {
            this.unlockAchievement('healthyLife');
        }
    }
    
    // 解锁成就
    unlockAchievement(achievementKey) {
        if (!this.data.achievements.unlocked.includes(achievementKey)) {
            this.data.achievements.unlocked.push(achievementKey);
            this.data.achievements.points += 10; // 每个成就10点
            
            const achievement = CONFIG.achievements[achievementKey];
            app.showModal('成就解锁！', `🎉 恭喜解锁成就：${achievement.name}`, [{
                text: '太棒了！',
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
            morning: ['早安！新的一天开始了', '晨光正好，开始美好的一天吧', '早上好！愿你今天元气满满'],
            noon: ['午安！记得吃午饭哦', '中午了，是时候休息一下了', '阳光正好，享受午后时光'],
            afternoon: ['下午好！工作进展如何？', '午后时光，来杯茶放松一下', '下午的阳光很温暖呢'],
            evening: ['晚上好！今天辛苦了', '夜幕降临，该放松一下了', '晚安时光即将到来'],
            night: ['夜深了，该休息了', '安静的夜晚，适合思考', '愿你有个甜美的梦']
        },
        weather: {
            sunny: '今天阳光明媚，心情也要像阳光一样灿烂哦！',
            cloudy: '今天多云，就像生活有起有落，但都是美好的',
            rainy: '今天下雨了，雨天也有雨天的浪漫呢',
            rainyComfort: '虽然下雨了，但我们依然可以保持好心情',
            snowy: '今天下雪了，雪花纷飞的日子很有诗意'
        },
        checkin: {
            wakeUpMessages: [
                '早起的鸟儿有虫吃！你真棒！',
                '新的一天开始了，加油！',
                '晨光中醒来的你，闪闪发光',
                '早安！愿你今天充满活力'
            ],
            sleepMessages: [
                '晚安！愿你有个甜美的梦',
                '今天辛苦了，好好休息',
                '夜晚来临，是时候充电了',
                '睡个好觉，明天会更美好'
            ],
            lateWakeUp: [
                '虽然起得有点晚，但还是很棒！',
                '每一天的开始都值得庆祝',
                '慢慢来，生活不用太着急'
            ],
            earlyWakeUp: [
                '哇！你起得真早，太厉害了！',
                '早起的你真是太棒了！',
                '晨光中的你最美丽'
            ]
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
            }
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
            morning: ['Good morning! A new day begins', 'Morning light is just right, start a beautiful day', 'Good morning! May you be energetic today'],
            noon: ['Good noon! Remember to have lunch', 'It\'s noon, time to take a break', 'The sun is just right, enjoy the afternoon'],
            afternoon: ['Good afternoon! How\'s work going?', 'Afternoon time, have a cup of tea and relax', 'The afternoon sun is very warm'],
            evening: ['Good evening! You worked hard today', 'Night falls, time to relax', 'Good night time is coming'],
            night: ['It\'s late, time to rest', 'Quiet night, good for thinking', 'May you have sweet dreams']
        },
        weather: {
            sunny: 'It\'s sunny today, your mood should be as bright as the sunshine!',
            cloudy: 'It\'s cloudy today, just like life has ups and downs, but they\'re all beautiful',
            rainy: 'It\'s raining today, rainy days have their own romance',
            rainyComfort: 'Although it\'s raining, we can still stay in a good mood',
            snowy: 'It\'s snowing today, snowy days are very poetic'
        },
        checkin: {
            wakeUpMessages: [
                'The early bird catches the worm! You\'re amazing!',
                'A new day begins, keep it up!',
                'You waking up in the morning light, shining bright',
                'Good morning! May you be full of energy today'
            ],
            sleepMessages: [
                'Good night! May you have sweet dreams',
                'You worked hard today, rest well',
                'Night comes, time to recharge',
                'Sleep well, tomorrow will be better'
            ],
            lateWakeUp: [
                'Although you got up a bit late, you\'re still great!',
                'Every day\'s beginning is worth celebrating',
                'Take your time, life doesn\'t need to be rushed'
            ],
            earlyWakeUp: [
                'Wow! You got up really early, amazing!',
                'You getting up early is fantastic!',
                'You\'re most beautiful in the morning light'
            ]
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
            }
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
        // 更新导航标签
        const navItems = document.querySelectorAll('.nav-item');
        const navLabels = ['home', 'stats', 'wardrobe', 'settings'];
        
        navItems.forEach((item, index) => {
            const label = item.querySelector('.nav-label');
            if (label) {
                label.textContent = i18n[this.currentLanguage].nav[navLabels[index]];
            }
        });
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
            this.handleQuickCheckin('我起床啦', 'wake');
        });
        
        document.getElementById('sleep-btn').addEventListener('click', () => {
            this.handleQuickCheckin('我要睡了', 'sleep');
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
        document.getElementById('sound-effects').addEventListener('change', (e) => {
            appState.set('settings.soundEffects', e.target.checked);
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
            this.showModal('今日已打卡', '今天已经完成这项打卡了哦！', [{
                text: '好的',
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
        
        if (type === 'wake') {
            if (hour <= 7) {
                messageArray = messages.earlyWakeUp;
            } else if (hour >= 10) {
                messageArray = messages.lateWakeUp;
            } else {
                messageArray = messages.wakeUpMessages;
            }
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
            this.showModal('重复打卡确认', `今天已经打卡过"${task}"了，确定要再次打卡吗？`, [{
                text: '确定',
                primary: true,
                callback: () => {
                    this.doCustomCheckin(task, category);
                }
            }, {
                text: '取消',
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
        this.showToast('打卡成功！');
    }
    
    startTimeUpdate() {
        const updateTime = () => {
            const now = new Date();
            
            // 更新时间显示
            const timeEl = document.getElementById('current-time');
            const dateEl = document.getElementById('current-date');
            
            if (timeEl) {
                timeEl.textContent = now.toLocaleTimeString('zh-CN', {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                });
            }
            
            if (dateEl) {
                dateEl.textContent = now.toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long'
                });
            }
            
            // 每小时更新一次问候语和背景
            if (now.getMinutes() === 0 && now.getSeconds() === 0) {
                this.updateGreeting();
                this.updateBackgroundGradient();
            }
        };
        
        updateTime();
        setInterval(updateTime, 1000);
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
        const greetingEl = document.getElementById('greeting-text');
        
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
        
        const greetings = i18n[this.currentLanguage].greetings[greetingKey];
        const greeting = greetings[Math.floor(Math.random() * greetings.length)];
        
        greetingEl.textContent = greeting;
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
            console.warn('今日任务容器未找到');
            return;
        }
        
        const today = new Date().toDateString();
        const allCheckins = appState.get('checkins');
        const todayCheckins = allCheckins.filter(c => c.date === today);
        
        console.log('更新今日任务:', {
            today,
            allCheckins: allCheckins.length,
            todayCheckins: todayCheckins.length,
            checkins: todayCheckins
        });
        
        tasksContainer.innerHTML = '';
        
        if (todayCheckins.length === 0) {
            tasksContainer.innerHTML = '<div class="no-tasks">今天还没有打卡记录</div>';
            return;
        }
        
        todayCheckins.forEach(checkin => {
            const taskEl = document.createElement('div');
            taskEl.className = 'task-item';
            
            const time = new Date(checkin.timestamp).toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            const categoryNames = {
                life: '生活',
                study: '学习',
                work: '工作',
                wake: '起床',
                sleep: '睡觉'
            };
            
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
            const wakeUp = dayCheckins.find(c => c.task === '我起床啦');
            const sleep = dayCheckins.find(c => c.task === '我要睡了');
            
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
        grid.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">主题商店即将开放！</p>';
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
        if (!('Notification' in window)) {
            this.showToast('您的浏览器不支持通知功能');
            return;
        }
        
        if (Notification.permission === 'granted') {
            this.showToast('通知权限已经开启');
            return;
        }
        
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            this.showToast('通知权限开启成功！');
            this.setupNotifications();
        } else {
            this.showToast('通知权限被拒绝');
        }
    }
    
    setupNotifications() {
        if (!('Notification' in window) || Notification.permission !== 'granted') {
            return;
        }
        
        // 每小时检查一次是否需要发送通知
        setInterval(() => {
            this.checkAndSendNotification();
        }, 60 * 60 * 1000);
        
        // 立即检查一次
        this.checkAndSendNotification();
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
        this.showModal(
            '回到最初的时光',
            '你即将清除所有数据，这将让你重新开始这段美妙的旅程。此操作无法撤销，确定要继续吗？',
            [{
                text: '我再想想',
                callback: () => {}
            }, {
                text: '我明白',
                primary: true,
                callback: () => {
                    this.showModal(
                        '即将重生',
                        '你即将涅槃重生，恭喜进入人生的下一个美好阶段！',
                        [{
                            text: '开始新的旅程',
                            primary: true,
                            callback: () => {
                                appState.resetAllData();
                            }
                        }]
                    );
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