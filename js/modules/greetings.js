// js/modules/greetings.js
import { getWeather } from './weather.js';

export function loadGreetings() {
  const greetingEl = document.getElementById('greeting');
  if (!greetingEl) return;

  const now = new Date();
  const hours = now.getHours();
  const settings = JSON.parse(localStorage.getItem('settings') || '{}');
  const weatherPref = settings.weatherPreference || 'all';
  const weather = getWeather(); // 假设从weather.js获取

  const greetings = [
    { time: [6, 10], text: () => `吃早饭了吗？今天的天气是${weather.condition}！` },
    { time: [10, 12], text: () => `快到中午啦，今天的计划进行得如何？` },
    { time: [12, 14], text: () => `午饭时间到！吃点什么好吃的？` },
    { time: [14, 18], text: () => `下午时光有点慵懒？来杯茶吧～` },
    { time: [18, 20], text: () => `夕阳西下，晚饭想吃点啥特别的吗？` },
    { time: [20, 23], text: () => `夜幕降临，准备好迎接美梦了吗？` },
    { time: [23, 4], text: () => `夜猫子还在忙碌吗？早点休息哦～` }
  ];

  // 讨厌雨天逻辑
  const rainGreeting = weatherPref === 'no-rain' && weather.condition.includes('rain')
    ? '雨天有点阴沉，但你的心情可以像阳光一样明媚！'
    : null;

  const greeting = greetings.find(g => hours >= g.time[0] && hours < g.time[1])?.text() || '欢迎回来！';
  greetingEl.textContent = rainGreeting || greeting;

  // 动态更新（每分钟检查）
  setTimeout(loadGreetings, 60000);
}
