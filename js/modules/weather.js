// js/modules/weather.js
export function getWeather() {
  const settings = JSON.parse(localStorage.getItem('settings') || '{}');
  const weather = JSON.parse(localStorage.getItem('weather') || '{}');
  if (weather.lastUpdate && Date.now() - weather.lastUpdate < 3600000) {
    return weather.data;
  }

  navigator.geolocation.getCurrentPosition(async pos => {
    const res = await fetch(`https://api.weatherapi.com/v1/current.json?key=f080dd8eccd341b4a06152132251207&q=${pos.coords.latitude},${pos.coords.longitude}`);
    const data = await res.json();
    localStorage.setItem('weather', JSON.stringify({ lastUpdate: Date.now(), data }));
    updateBackground(data.current.condition.text);
  });

  return weather.data || { condition: '未知' };
}

function updateBackground(condition) {
  const canvas = document.getElementById('background-canvas');
  if (condition.includes('rain') && JSON.parse(localStorage.getItem('settings') || '{}').weatherPreference === 'no-rain') {
    return; // 讨厌雨天不显示效果
  }
  // 待实现：雨天粒子效果
}
