// js/modules/music.js
export function initMusic() {
  const playBtn = document.querySelector('.music-btn[data-action="play"]');
  const nextBtn = document.querySelector('.music-btn[data-action="next"]');
  const addBtn = document.querySelector('.music-btn[data-action="add"]');
  const deleteBtn = document.querySelector('.music-btn[data-action="delete"]');
  const currentTrack = document.querySelector('.current-track');
  let state = JSON.parse(localStorage.getItem('state') || '{}');

  state.playlist = state.playlist || [
    { id: 'track1', name: '曲目一', url: 'assets/audio/track1.mp3' },
    { id: 'track2', name: '曲目二', url: 'assets/audio/track2.mp3' },
    { id: 'track3', name: '曲目三', url: 'assets/audio/track3.mp3' }
  ];
  state.currentTrack = state.currentTrack || 0;
  saveState(state);

  const audio = new Audio(state.playlist[state.currentTrack].url);
  currentTrack.textContent = state.playlist[state.currentTrack].name;

  playBtn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play();
      playBtn.textContent = '暂停';
    } else {
      audio.pause();
      playBtn.textContent = '播放';
    }
  });

  nextBtn.addEventListener('click', () => {
    state.currentTrack = (state.currentTrack + 1) % state.playlist.length;
    audio.src = state.playlist[state.currentTrack].url;
    currentTrack.textContent = state.playlist[state.currentTrack].name;
    audio.play();
    saveState(state);
  });

  addBtn.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/mp3';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      const id = `custom_${Date.now()}`;
      state.playlist.push({ id, name: file.name, url });
      saveState(state);
      currentTrack.textContent = file.name;
      audio.src = url;
      audio.play();
    };
    input.click();
  });

  deleteBtn.addEventListener('click', () => {
    if (state.playlist.length <= 1) return;
    state.playlist.splice(state.currentTrack, 1);
    state.currentTrack = Math.min(state.currentTrack, state.playlist.length - 1);
    audio.src = state.playlist[state.currentTrack].url;
    currentTrack.textContent = state.playlist[state.currentTrack].name;
    saveState(state);
  });

  function saveState(newState) {
    localStorage.setItem('state', JSON.stringify(newState));
  }
}
