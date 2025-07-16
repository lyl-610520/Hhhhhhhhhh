import { loadGreetings } from './modules/greetings.js';
import { initCanvas } from './modules/canvas.js';
import { initWeather } from './modules/weather.js';
import { initCheckins } from './modules/checkins.js';
import { initAchievements } from './modules/achievements.js';
import { initMusic } from './modules/music.js';
import { initAlarm } from './modules/alarm.js';
import { initCharts } from './modules/charts.js';
import { initTheme } from './modules/theme.js';

// 页面容器
const pageContainer = document.getElementById('page-container');
const navItems = document.querySelectorAll('.nav-item');

// 页面内容
const pages = {
  home: `<div class="page" id="page-home">
    <h1 id="greeting"></h1>
    <div id="clock"></div>
    <button id="alarm-btn">设置闹钟</button>
    <div class="checkin-buttons">
      <button id="wakeup-btn" disabled>我醒了</button>
      <button id="sleep-btn" disabled>我要睡了</button>
    </div>
    <div class="custom-checkin">
      <input id="checkin-input" placeholder="自定义打卡">
      <select id="checkin-category">
        <option value="life">生活</option>
        <option value="study">学习</option>
        <option value="work">工作</option>
      </select>
      <button id="checkin-add">添加</button>
    </div>
    <ul id="checkin-list"></ul>
    <div class="gamification">
      <div class="pet">
        <svg id="pet-svg"></svg>
        <span id="pet-name"></span>
      </div>
      <div class="flower">
        <svg id="flower-svg"></svg>
        <progress id="sunshine-bar" max="1000" value="0"></progress>
      </div>
    </div>
    <div id="countdown" class="hidden"></div>
  </div>`,
  stats: `<div class="page" id="page-stats">
    <canvas id="pie-chart"></canvas>
    <canvas id="line-chart"></canvas>
  </div>`,
  wardrobe: `<div class="page" id="page-wardrobe">
    <div class="tabs">
      <button class="tab active" data-tab="accessories">配件</button>
      <button class="tab" data-tab="achievements">成就</button>
      <button class="tab" data-tab="night-sky">夜空</button>
    </div>
    <div id="accessories" class="tab-content"></div>
    <div id="achievements" class="tab-content hidden"></div>
    <div id="night-sky" class="tab-content hidden">
      <canvas id="night-sky-canvas"></canvas>
    </div>
  </div>`,
  settings: `<div class="page" id="page-settings">
    <select id="display-mode">
      <option value="auto">自动</option>
      <option value="light">浅色</option>
      <option value="dark">深色</option>
    </select>
    <select id="language">
      <option value="zh">中文</option>
      <option value="en">英语</option>
    </select>
    <input id="pet-name" placeholder="宠物名称">
    <select id="weather-preference">
      <option value="all">所有天气</option>
      <option value="no-rain">讨厌雨天</option>
    </select>
    <input id="countdown-event" placeholder="倒计时事件">
    <input id="countdown-date" type="date">
    <input id="notification-time" type="time">
    <button id="request-notification">开启通知</button>
    <button id="reset-data">回到最初的时光</button>
  </div>`
};

// 路由与动画
function loadPage(hash) {
  const page = hash.slice(1) || 'home';
  pageContainer.innerHTML = pages[page];
  gsap.fromTo(pageContainer, { opacity: 0, x: 100 }, { opacity: 1, x: 0, duration: 0.5 });
  navItems.forEach(item => item.classList.toggle('active', item.getAttribute('href') === `#${page}`));
  initPage(page);
}

// 初始化页面
function initPage(page) {
  if (page === 'home') {
    loadGreetings();
    initCheckins();
    initAlarm();
  } else if (page === 'stats') {
    initCharts();
  } else if (page === 'wardrobe') {
    initAchievements();
  } else if (page === 'settings') {
    initTheme();
  }
}

// 入口
document.addEventListener('DOMContentLoaded', () => {
  initCanvas();
  initWeather();
  initMusic();
  initTheme();
  loadPage(window.location.hash);
  window.addEventListener('hashchange', () => loadPage(window.location.hash));
});
