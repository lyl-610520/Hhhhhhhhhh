/* ================================================
   成长伙伴 PWA - 数据存储系统
   简洁的localStorage封装
   ================================================ */

const Storage = {
  // 默认数据结构
  defaultData: {
    userData: {
      flowerLevel: 0,
      companionLevel: 0,
      totalCheckins: 0,
      achievements: []
    },
    checkins: [],
    settings: {
      language: 'auto',
      theme: 'auto',
      notifications: true
    }
  },
  
  // 初始化存储
  async init() {
    try {
      // 检查是否有数据，没有则初始化
      if (!this.get('userData')) {
        await this.initializeData();
      }
      console.log('💾 存储系统初始化完成');
      return true;
    } catch (error) {
      console.error('💾 存储初始化失败:', error);
      return false;
    }
  },
  
  // 初始化数据
  async initializeData() {
    for (const [key, value] of Object.entries(this.defaultData)) {
      this.set(key, value);
    }
  },
  
  // 获取数据
  get(key) {
    try {
      const data = localStorage.getItem(`growthCompanion_${key}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('💾 读取数据失败:', key, error);
      return null;
    }
  },
  
  // 保存数据
  set(key, value) {
    try {
      localStorage.setItem(`growthCompanion_${key}`, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('💾 保存数据失败:', key, error);
      return false;
    }
  },
  
  // 删除数据
  remove(key) {
    try {
      localStorage.removeItem(`growthCompanion_${key}`);
      return true;
    } catch (error) {
      console.error('💾 删除数据失败:', key, error);
      return false;
    }
  },
  
  // 清空所有数据
  clear() {
    try {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith('growthCompanion_')
      );
      
      keys.forEach(key => localStorage.removeItem(key));
      
      console.log('💾 已清空所有数据');
      return true;
    } catch (error) {
      console.error('💾 清空数据失败:', error);
      return false;
    }
  },
  
  // 保存打卡记录
  saveCheckin(type, timestamp) {
    try {
      const checkins = this.get('checkins') || [];
      const newCheckin = {
        id: Date.now(),
        type, // 'wakeUp' or 'sleep'
        timestamp: timestamp.toISOString(),
        date: timestamp.toISOString().split('T')[0] // YYYY-MM-DD
      };
      
      checkins.push(newCheckin);
      
      // 只保留最近100条记录
      if (checkins.length > 100) {
        checkins.splice(0, checkins.length - 100);
      }
      
      this.set('checkins', checkins);
      
      // 更新用户数据
      this.updateUserStats(type);
      
      console.log('📝 打卡记录已保存:', newCheckin);
      return newCheckin;
    } catch (error) {
      console.error('📝 保存打卡记录失败:', error);
      return null;
    }
  },
  
  // 更新用户统计
  updateUserStats(checkinType) {
    try {
      const userData = this.get('userData') || this.defaultData.userData;
      
      userData.totalCheckins = (userData.totalCheckins || 0) + 1;
      
      // 检查花朵成长
      const growthRate = Math.floor(userData.totalCheckins / 5); // 每5次打卡成长一级
      userData.flowerLevel = Math.min(growthRate, 4); // 最高4级
      
      // 检查成就
      this.checkAchievements(userData);
      
      this.set('userData', userData);
      return userData;
    } catch (error) {
      console.error('📊 更新用户统计失败:', error);
      return null;
    }
  },
  
  // 检查成就
  checkAchievements(userData) {
    const achievements = userData.achievements || [];
    const checkins = this.get('checkins') || [];
    
    // 早起成就
    const morningCheckins = checkins.filter(c => {
      const hour = new Date(c.timestamp).getHours();
      return c.type === 'wakeUp' && hour >= 5 && hour <= 7;
    });
    
    if (morningCheckins.length >= 3 && !achievements.includes('morningBird')) {
      achievements.push('morningBird');
    }
    
    if (morningCheckins.length >= 10 && !achievements.includes('earlyBird')) {
      achievements.push('earlyBird');
    }
    
    // 坚持成就
    if (userData.totalCheckins >= 20 && !achievements.includes('studyMaster')) {
      achievements.push('studyMaster');
    }
    
    userData.achievements = achievements;
  },
  
  // 获取今日打卡
  getTodayCheckins() {
    try {
      const checkins = this.get('checkins') || [];
      const today = new Date().toISOString().split('T')[0];
      
      return checkins.filter(c => c.date === today);
    } catch (error) {
      console.error('📅 获取今日打卡失败:', error);
      return [];
    }
  },
  
  // 获取最近打卡
  getRecentCheckins(limit = 10) {
    try {
      const checkins = this.get('checkins') || [];
      return checkins
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);
    } catch (error) {
      console.error('📝 获取最近打卡失败:', error);
      return [];
    }
  },
  
  // 获取统计数据
  getStats() {
    try {
      const checkins = this.get('checkins') || [];
      const userData = this.get('userData') || {};
      
      const stats = {
        totalCheckins: checkins.length,
        flowerLevel: userData.flowerLevel || 0,
        achievements: userData.achievements || [],
        weeklyCheckins: this.getWeeklyStats(checkins),
        monthlyCheckins: this.getMonthlyStats(checkins)
      };
      
      return stats;
    } catch (error) {
      console.error('📊 获取统计失败:', error);
      return null;
    }
  },
  
  // 获取周统计
  getWeeklyStats(checkins) {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return checkins.filter(c => 
      new Date(c.timestamp) >= oneWeekAgo
    ).length;
  },
  
  // 获取月统计
  getMonthlyStats(checkins) {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    return checkins.filter(c => 
      new Date(c.timestamp) >= oneMonthAgo
    ).length;
  }
};

// 全局暴露
window.Storage = Storage;