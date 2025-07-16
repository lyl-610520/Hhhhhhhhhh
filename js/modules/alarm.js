// js/modules/alarm.js
import { showModal } from './utils.js';

export function initAlarm() {
  const alarmBtn = document.getElementById('alarm-btn');
  alarmBtn.addEventListener('click', () => {
    showModal('设置闹钟时间：<input type="time" id="alarm-time">', () => {
      const time = document.getElementById('alarm-time').value;
      if (!time) return;
      localStorage.setItem('alarm', time);
      scheduleAlarm(time);
    });
  });
}

function scheduleAlarm(time) {
  const [hours, minutes] = time.split(':').map(Number);
  const now = new Date();
  const alarmTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
  if (alarmTime < now) alarmTime.setDate(now.getDate() + 1);
  const timeout = alarmTime - now;

  setTimeout(() => {
    if (document.hidden) {
      new Notification('闹钟响了！', { body: '时间到啦，起床迎接新一天吧～', icon: '/assets/icons/icon-192.png' });
    } else {
      const audio = new Audio('assets/audio/alarm.mp3'); // 需提供音效文件
      audio.play();
      showModal('闹钟响了！时间到啦，起床迎接新一天吧～');
    }
  }, timeout);
}
