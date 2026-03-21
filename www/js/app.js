/**
 * App.js - 主应用控制器
 */

const GAMES_CONFIG = {
  english: [
    { id: 'letters-match', name: '字母配对', icon: '🔤', desc: '把字母拖到图片下' },
    { id: 'word-select', name: '看图选词', icon: '🖼️', desc: '点击正确的单词' },
    { id: 'listen-identify', name: '听音识字母', icon: '🔊', desc: '听到哪个点哪个' },
    { id: 'letter-sort', name: '字母排序', icon: '🔤', desc: '按顺序排好字母' },
    { id: 'word-puzzle', name: '单词拼图', icon: '🧩', desc: '拼出完整的单词' },
    { id: 'letter-center', name: '字母发音学习', icon: '📚', desc: '系统学习26个字母' }
  ],
  math: [
    { id: 'counting', name: '数数练习', icon: '🔢', desc: '数一数有多少个' },
    { id: 'number-match', name: '数字配对', icon: '🎴', desc: '找出相同的数字' },
    { id: 'number-sort', name: '数字排序', icon: '📊', desc: '把数字排好顺序' },
    { id: 'addition', name: '简单加法', icon: '➕', desc: '算出答案是多少' }
  ]
};

let currentGame = null;
let currentTab = 'english';

function initApp() {
  console.log('[initApp] Starting...');

  if (typeof MusicManager !== 'undefined') {
    MusicManager.init();
    // 默认开启音乐
    MusicManager.play(0, true);
  }

  console.log('[initApp] Calling renderGameGrids...');
  renderGameGrids();

  console.log('[initApp] Calling updateProgressDisplay...');
  updateProgressDisplay();

  console.log('[initApp] Calling initSettingsToggles...');
  initSettingsToggles();

  console.log('[initApp] Done!');
}

function renderGameGrids() {
  console.log('[renderGameGrids] Starting...');
  
  const englishGrid = document.getElementById('english-games');
  const mathGrid = document.getElementById('math-games');
  
  console.log('[renderGameGrids] englishGrid:', englishGrid);
  console.log('[renderGameGrids] mathGrid:', mathGrid);
  console.log('[renderGameGrids] GAMES_CONFIG:', GAMES_CONFIG);

  if (englishGrid) {
    const html = GAMES_CONFIG.english.map(game => `
      <div class="game-card ${getCardColor(game.id)}" onclick="startGame('${game.id}')">
        <div class="game-icon">${game.icon}</div>
        <div class="game-title">${game.name}</div>
        <div class="game-desc">${game.desc}</div>
      </div>
    `).join('');
    console.log('[renderGameGrids] Setting englishGrid HTML, length:', html.length);
    englishGrid.innerHTML = html;
    console.log('[renderGameGrids] englishGrid HTML set, new length:', englishGrid.innerHTML.length);
  } else {
    console.warn('[renderGameGrids] englishGrid not found!');
  }

  if (mathGrid) {
    const html = GAMES_CONFIG.math.map(game => `
      <div class="game-card ${getCardColor(game.id)}" onclick="startGame('${game.id}')">
        <div class="game-icon">${game.icon}</div>
        <div class="game-title">${game.name}</div>
        <div class="game-desc">${game.desc}</div>
      </div>
    `).join('');
    console.log('[renderGameGrids] Setting mathGrid HTML, length:', html.length);
    mathGrid.innerHTML = html;
    console.log('[renderGameGrids] mathGrid HTML set, new length:', mathGrid.innerHTML.length);
  } else {
    console.warn('[renderGameGrids] mathGrid not found!');
  }
}

function getCardColor(gameId) {
  const colors = ['red', 'blue', 'yellow', 'purple', 'green', 'orange'];
  const index = GAMES_CONFIG.english.findIndex(g => g.id === gameId);
  if (index !== -1) return colors[index % colors.length];
  const mathIndex = GAMES_CONFIG.math.findIndex(g => g.id === gameId);
  if (mathIndex !== -1) return colors[(mathIndex + 2) % colors.length];
  return 'blue';
}

function switchTab(pageId, tabId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  
  const page = document.getElementById(pageId);
  const tab = document.getElementById(tabId);
  
  if (page) page.classList.add('active');
  if (tab) tab.classList.add('active');
  
  currentTab = pageId.replace('-page', '');
  updateProgressDisplay();
  
  if (typeof AudioManager !== 'undefined') {
    AudioManager.playClick();
  }
}

function showEnglishTab() {
  switchTab('english-page', 'tab-english');
}

function showMathTab() {
  switchTab('math-page', 'tab-math');
}

function showSettingsTab() {
  switchTab('settings-page', 'tab-settings');
  renderMusicList();
}

function showHome() {
  currentGame = null;
  if (currentTab === 'math') {
    showMathTab();
  } else if (currentTab === 'settings') {
    showSettingsTab();
  } else {
    showEnglishTab();
  }
}

function showSettings() {
  showSettingsTab();
}

function showGame(gameContent) {
  currentGame = gameContent;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('game-page').classList.add('active');
}

function startGame(gameId) {
  if (typeof AudioManager !== 'undefined') {
    AudioManager.playClick();
  }
  ProgressManager.incrementGamePlayed(gameId);

  let gameContent = '';
  switch (gameId) {
    case 'letters-match':
      gameContent = LettersMatchGame.render();
      break;
    case 'word-select':
      gameContent = WordSelectGame.render();
      break;
    case 'listen-identify':
      gameContent = ListenIdentifyGame.render();
      break;
    case 'letter-sort':
      gameContent = LetterSortGame.render();
      break;
    case 'word-puzzle':
      gameContent = WordPuzzleGame.render();
      break;
    case 'letter-center':
      gameContent = LetterCenterGame.render();
      break;
    case 'counting':
      gameContent = CountingGame.render();
      break;
    case 'number-match':
      gameContent = NumberMatchGame.render();
      break;
    case 'number-sort':
      gameContent = NumberSortGame.render();
      break;
    case 'addition':
      gameContent = AdditionGame.render();
      break;
    default:
      gameContent = '<p>游戏开发中...</p>';
  }

  document.getElementById('game-content').innerHTML = gameContent;
  showGame(gameContent);
}

function toggleSound() {
  const toggle = document.getElementById('toggle-sound');
  const isEnabled = !ProgressManager.isSoundEnabled();
  ProgressManager.updateSettings({ soundEnabled: isEnabled });
  toggle.classList.toggle('active', isEnabled);
  if (isEnabled && typeof AudioManager !== 'undefined') {
    AudioManager.playClick();
  }
}

function toggleMusic() {
  const toggle = document.getElementById('toggle-music');
  const controls = document.getElementById('music-controls');

  if (typeof MusicManager === 'undefined') {
    console.warn('MusicManager not loaded');
    return;
  }

  // Toggle music on/off
  const isPlaying = MusicManager.toggle();

  toggle.classList.toggle('active', isPlaying);
  controls.style.display = isPlaying ? 'block' : 'none';

  if (isPlaying) {
    renderMusicList();
    // Music is already playing via toggle(), no need to call play() again
  }

  ProgressManager.updateSettings({ bgMusicEnabled: isPlaying });
}

function selectMusic(index) {
  if (typeof MusicManager === 'undefined') return;

  // Play single track when user selects from list
  MusicManager.play(index, false);
  renderMusicList();

  const toggle = document.getElementById('toggle-music');
  const controls = document.getElementById('music-controls');
  toggle.classList.add('active');
  controls.style.display = 'block';

  ProgressManager.updateSettings({ bgMusicEnabled: true });
}

function renderMusicList() {
  const list = document.getElementById('music-list');
  if (!list || typeof MusicManager === 'undefined') return;
  
  list.innerHTML = MusicManager.tracks.map((track, i) => `
    <div class="music-item ${i === MusicManager.currentTrack ? 'active' : ''}" 
         onclick="selectMusic(${i})">
      <span class="music-icon">${track.icon}</span>
      <span class="music-name">${track.name}</span>
    </div>
  `).join('');
}

function setVolume(value) {
  if (typeof MusicManager === 'undefined') return;
  MusicManager.setVolume(value / 100);
}

function initSettingsToggles() {
  const soundToggle = document.getElementById('toggle-sound');
  const musicToggle = document.getElementById('toggle-music');

  if (soundToggle) {
    soundToggle.classList.toggle('active', ProgressManager.isSoundEnabled());
  }
  if (musicToggle) {
    musicToggle.classList.toggle('active', ProgressManager.isBgMusicEnabled());
  }
}

function selectMusic(index) {
  if (typeof MusicManager === 'undefined') return;

  MusicManager.selectTrack(index);
  renderMusicList();

  const toggle = document.getElementById('toggle-music');
  const controls = document.getElementById('music-controls');
  toggle.classList.add('active');
  controls.style.display = 'block';

  ProgressManager.updateSettings({ bgMusicEnabled: true });
}

function renderMusicList() {
  const list = document.getElementById('music-list');
  if (!list || typeof MusicManager === 'undefined') return;
  
  list.innerHTML = MusicManager.tracks.map((track, i) => `
    <div class="music-item ${i === MusicManager.currentTrack ? 'active' : ''}" 
         onclick="selectMusic(${i})">
      <span class="music-icon">${track.icon}</span>
      <span class="music-name">${track.name}</span>
    </div>
  `).join('');
}

function setVolume(value) {
  if (typeof MusicManager === 'undefined') return;
  MusicManager.setVolume(value / 100);
}

function initSettingsToggles() {
  const soundToggle = document.getElementById('toggle-sound');
  const musicToggle = document.getElementById('toggle-music');

  if (soundToggle) {
    soundToggle.classList.toggle('active', ProgressManager.isSoundEnabled());
  }
  if (musicToggle) {
    musicToggle.classList.toggle('active', ProgressManager.isBgMusicEnabled());
  }
}

function updateProgressDisplay() {
  const starsEn = document.getElementById('stars-count-en');
  const starsMath = document.getElementById('stars-count-math');
  const completedEl = document.getElementById('completed-count');
  const wordsEl = document.getElementById('words-count');

  const stars = ProgressManager.getStars();
  if (starsEn) starsEn.textContent = stars;
  if (starsMath) starsMath.textContent = stars;
  if (completedEl) completedEl.textContent = ProgressManager.getCompletedGamesCount();
  if (wordsEl) wordsEl.textContent = ProgressManager.getWordsLearned();
}

function showStarAnimation(x, y) {
  if (typeof AudioManager !== 'undefined') {
    AudioManager.playStar();
  }
  const star = document.createElement('div');
  star.className = 'star-particle';
  star.textContent = '⭐';
  star.style.left = x + 'px';
  star.style.top = y + 'px';
  document.body.appendChild(star);
  setTimeout(() => star.remove(), 1000);
  ProgressManager.addStars(1);
  updateProgressDisplay();
}

function showFeedback(isCorrect, message = '') {
  const feedback = document.createElement('div');
  feedback.className = `feedback-popup ${isCorrect ? 'success' : 'error'}`;
  feedback.textContent = message || (isCorrect ? '🎉 太棒了!' : '💪 再试试!');
  document.body.appendChild(feedback);

  if (typeof AudioManager !== 'undefined') {
    if (isCorrect) {
      AudioManager.playCorrect();
    } else {
      AudioManager.playWrong();
    }
  }

  setTimeout(() => {
    feedback.style.animation = 'popOut 0.5s ease';
    setTimeout(() => feedback.remove(), 500);
  }, 1500);
}

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});
