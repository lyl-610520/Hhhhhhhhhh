// js/modules/theme.js
export function initTheme() {
  const displayMode = document.getElementById('display-mode');
  displayMode.addEventListener('change', () => {
    localStorage.setItem('displayMode', displayMode.value);
    updateTheme();
  });
  updateTheme();
}

export function getTheme() {
  const mode = localStorage.getItem('displayMode') || 'auto';
  if (mode === 'auto') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return mode;
}

function updateTheme() {
  const theme = getTheme();
  document.documentElement.style.setProperty('--bg', theme === 'dark' ? '#2b2a4c' : '#f8e1e9');
  document.documentElement.style.setProperty('--accent', theme === 'dark' ? '#7286d3' : '#a8e6cf');
  document.documentElement.style.setProperty('--text', theme === 'dark' ? '#fff' : '#333');
}
