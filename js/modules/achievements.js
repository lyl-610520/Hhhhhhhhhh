// js/modules/achievements.js
import { showModal } from './utils.js';

export function initAchievements() {
  const accessoriesTab = document.getElementById('accessories');
  const achievementsTab = document.getElementById('achievements');
  const nightSkyTab = document.getElementById('night-sky');
  const tabs = document.querySelectorAll('.tab');
  let state = JSON.parse(localStorage.getItem('state') || '{}');

  state.achievements = state.achievements || [
    { id: 'life_5', name: '生活达人', description: '生活类打卡5次', points: 10, unlocked: false },
    { id: 'life_10', name: '生活大师', description: '生活类打卡10次', points: 20, unlocked: false },
    { id: 'morning_7', name: '一日之计在于晨', description: '早起7次', points: 30, unlocked: false },
    { id: 'night_7', name: '夜猫子', description: '深夜睡觉7次', points: 30, unlocked: false },
    { id: 'healthy_7', name: '健康作息', description: '连续7天早睡早起', points: 30, unlocked: false }
  ];
  state.accessories = state.accessories || [
    { id: 'spring_hat', name: '春帽', unlocked: true },
    { id: 'summer_scarf', name: '夏围巾', unlocked: true },
    { id: 'autumn_glasses', name: '秋眼镜', unlocked: true },
    { id: 'winter_coat', name: '冬大衣', unlocked: true }
  ];
  state.points = state.points || 0;
  saveState(state);

  // 配件Tab
  accessoriesTab.innerHTML = state.accessories
    .map(a => `<button data-id="${a.id}" ${a.unlocked ? '' : 'disabled'}>${a.name}</button>`)
    .join('');

  // 成就Tab
  achievementsTab.innerHTML = state.achievements
    .map(a => `<div>${a.name}: ${a.description} (${a.unlocked ? '已解锁' : `${a.points}点`})</div>`)
    .join('');

  // 夜空Tab（Canvas）
  const nightSkyCanvas = document.getElementById('night-sky-canvas');
  const p5 = require('p5');
  new p5(p => {
    const stars = [];
    p.setup = () => {
      p.createCanvas(nightSkyTab.offsetWidth, nightSkyTab.offsetHeight);
      for (let i = 0; i < state.points; i++) {
        stars.push({
          x: p.random(p.width),
          y: p.random(p.height),
          size: p.random(1, 3),
          alpha: p.random(0.5, 1)
        });
      }
    };
    p.draw = () => {
      p.background(getTheme() === 'dark' ? '#2b2a4c' : '#f8e1e9');
      stars.forEach(star => {
        p.fill(255, 255, 255, star.alpha * 255);
        p.noStroke();
        p.ellipse(star.x, star.y, star.size);
        star.alpha = p.sin(p.frameCount * 0.01 + star.x) * 0.5 + 0.5;
      });
    };
    p.mouseMoved = () => {
      const star = stars.find(s => p.dist(p.mouseX, p.mouseY, s.x, s.y) < 10);
      if (star) showModal(`成就点：${state.points}`);
    };
  }, nightSkyCanvas);

  // Tab切换
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
      document.getElementById(tab.dataset.tab).classList.remove('hidden');
    });
  });

  function saveState(newState) {
    localStorage.setItem('state', JSON.stringify(newState));
  }
}

export function checkAchievements() {
  let state = JSON.parse(localStorage.getItem('state') || '{}');
  const checkins = state.checkins || [];
  const lifeCount = checkins.filter(c => c.category === 'life').length;
  const morningCount = checkins.filter(c => c.type === 'wakeup' && new Date(c.time).getHours() >= 6 && new Date(c.time).getHours() < 9).length;
  const nightCount = checkins.filter(c => c.type === 'sleep' && new Date(c.time).getHours() >= 1 && new Date(c.time).getHours() < 4).length;

  state.achievements.forEach(a => {
    if (!a.unlocked) {
      if (a.id === 'life_5' && lifeCount >= 5) {
        a.unlocked = true;
        state.points += a.points;
        showModal(`解锁成就：${a.name}！`);
      } else if (a.id === 'life_10' && lifeCount >= 10) {
        a.unlocked = true;
        state.points += a.points;
        showModal(`解锁成就：${a.name}！`);
      } else if (a.id === 'morning_7' && morningCount >= 7) {
        a.unlocked = true;
        state.points += a.points;
        showModal(`解锁成就：${a.name}！`);
      } else if (a.id === 'night_7' && nightCount >= 7) {
        a.unlocked = true;
        state.points += a.points;
        showModal(`解锁成就：${a.name}！`);
      }
    }
  });
  saveState(state);
}
