// js/modules/checkins.js
import { showModal } from './utils.js'; // 假设工具函数

export function initCheckins() {
  const wakeupBtn = document.getElementById('wakeup-btn');
  const sleepBtn = document.getElementById('sleep-btn');
  const addBtn = document.getElementById('checkin-add');
  const checkinList = document.getElementById('checkin-list');
  let state = JSON.parse(localStorage.getItem('state') || '{}');

  // 初始化状态
  state.checkins = state.checkins || [];
  state.sunshine = state.sunshine || 0;
  state.consecutiveWakeup = state.consecutiveWakeup || 0;
  state.consecutiveSleep = state.consecutiveSleep || 0;
  saveState(state);

  // 检查每日打卡状态
  const now = new Date();
  const today = now.toDateString();
  const lastWakeup = state.lastWakeup || '';
  const lastSleep = state.lastSleep || '';
  wakeupBtn.disabled = lastWakeup === today;
  sleepBtn.disabled = lastSleep === today;

  // “我醒了”打卡
  wakeupBtn.addEventListener('click', () => {
    const hours = now.getHours();
    if (hours >= 6 && hours < 9) state.consecutiveWakeup++;
    else state.consecutiveWakeup = 0;
    state.lastWakeup = today;
    state.checkins.push({ type: 'wakeup', time: now.toISOString(), category: 'life' });
    state.sunshine += 20;
    saveState(state);
    wakeupBtn.disabled = true;
    showModal(hours >= 6 && hours < 9
      ? '早起的你真是闪闪发光！今天又是元气满满的一天！'
      : '哇，起的这么早，世界都在为你鼓掌！');
    if (state.consecutiveWakeup === 3) {
      showModal('连续3次早起啦！你是晨光中的小英雄，好棒诶！');
    }
    updateCheckinList();
    checkAchievements();
  });

  // “我要睡了”打卡
  sleepBtn.addEventListener('click', () => {
    const hours = now.getHours();
    if (hours >= 22 || hours < 1) state.consecutiveSleep++;
    else state.consecutiveSleep = 0;
    state.lastSleep = today;
    state.checkins.push({ type: 'sleep', time: now.toISOString(), category: 'life' });
    state.sunshine += 20;
    saveState(state);
    sleepBtn.disabled = true;
    showModal(hours >= 22 || hours < 1
      ? '早睡是给身体最好的礼物，你今天又给自己加分啦！'
      : '夜猫子终于要休息啦？快去梦里和星星说晚安吧～');
    if (state.consecutiveSleep === 3) {
      showModal('连续3次早睡啦！你的健康作息简直是教科书级别，太棒了！');
    }
    updateCheckinList();
    checkAchievements();
  });

  // 自定义打卡
  addBtn.addEventListener('click', () => {
    const input = document.getElementById('checkin-input').value;
    const category = document.getElementById('checkin-category').value;
    if (!input) return;
    const existing = state.checkins.filter(c => c.type === 'custom' && c.text === input && c.time.startsWith(today));
    if (existing.length > 0) {
      showModal('今天已经打过这个卡啦！确定要重复吗？', () => {
        state.checkins.push({ type: 'custom', text: input, category, time: now.toISOString() });
        state.sunshine += 10;
        saveState(state);
        updateCheckinList();
        checkAchievements();
      });
    } else {
      state.checkins.push({ type: 'custom', text: input, category, time: now.toISOString() });
      state.sunshine += 10;
      saveState(state);
      updateCheckinList();
      checkAchievements();
    }
  });

  function updateCheckinList() {
    checkinList.innerHTML = state.checkins
      .filter(c => c.time.startsWith(today))
      .map(c => `<li>${c.type === 'wakeup' ? '我醒了' : c.type === 'sleep' ? '我要睡了' : c.text} (${c.category})</li>`)
      .join('');
  }

  function saveState(newState) {
    localStorage.setItem('state', JSON.stringify(newState));
  }
}
