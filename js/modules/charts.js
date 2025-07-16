// js/modules/charts.js
import Chart from 'chart.js/auto';

export function initCharts() {
  const state = JSON.parse(localStorage.getItem('state') || '{}');
  const checkins = state.checkins || [];

  // 饼图：类别分布
  const pieCtx = document.getElementById('pie-chart').getContext('2d');
  const categories = ['life', 'study', 'work'].map(c => ({
    label: c === 'life' ? '生活' : c === 'study' ? '学习' : '工作',
    count: checkins.filter(ch => ch.category === c).length
  }));
  new Chart(pieCtx, {
    type: 'pie',
    data: {
      labels: categories.map(c => c.label),
      datasets: [{
        data: categories.map(c => c.count),
        backgroundColor: getTheme() === 'dark' ? ['#7286d3', '#a8e6cf', '#f8e1e9'] : ['#ff6b6b', '#4ecdc4', '#f8e1e9']
      }]
    },
    options: {
      plugins: {
        legend: { position: 'bottom' },
        tooltip: { enabled: true }
      }
    }
  });

  // 折线图：7天睡眠时长
  const lineCtx = document.getElementById('line-chart').getContext('2d');
  const sleepData = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const day = date.toDateString();
    const wakeup = checkins.find(c => c.type === 'wakeup' && c.time.startsWith(day));
    const sleep = checkins.find(c => c.type === 'sleep' && c.time.startsWith(day));
    const hours = wakeup && sleep ? (new Date(wakeup.time) - new Date(sleep.time)) / 1000 / 60 / 60 : 0;
    sleepData.push(hours);
  }
  new Chart(lineCtx, {
    type: 'line',
    data: {
      labels: ['-6天', '-5天', '-4天', '-3天', '-2天', '-1天', '今天'],
      datasets: [{
        label: '睡眠时长（小时）',
        data: sleepData,
        borderColor: getTheme() === 'dark' ? '#7286d3' : '#ff6b6b',
        fill: false
      }]
    },
    options: {
      plugins: { tooltip: { enabled: true } }
    }
  });
}

function getTheme() {
  return localStorage.getItem('displayMode') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
}
