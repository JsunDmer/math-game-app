/**
 * App.js - 主应用控制器
 */

// 游戏配置
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

// 全局状态
let currentGame = null;

// 初始化应用
function initApp() {
  renderGameGrids();
  updateProgressDisplay();
  bindEvents();
}

// 渲染游戏网格
function renderGameGrids() {
  const englishGrid = document.getElementById('english-games');
  const mathGrid = document.getElementById('math-games');

  englishGrid.innerHTML = GAMES_CONFIG.english.map(game => `
    <div class="game-card ${getCardColor(game.id)}" onclick="startGame('${game.id}')">
      <div class="game-icon">${game.icon}</div>
      <div class="game-title">${game.name}</div>
      <div class="game-desc">${game.desc}</div>
    </div>
  `).join('');

  mathGrid.innerHTML = GAMES_CONFIG.math.map(game => `
    <div class="game-card ${getCardColor(game.id)}" onclick="startGame('${game.id}')">
      <div class="game-icon">${game.icon}</div>
      <div class="game-title">${game.name}</div>
      <div class="game-desc">${game.desc}</div>
    </div>
  `).join('');
}

// 获取卡片颜色
function getCardColor(gameId) {
  const colors = ['red', 'blue', 'yellow', 'purple', 'green', 'orange'];
  const index = GAMES_CONFIG.english.findIndex(g => g.id === gameId);
  if (index !== -1) return colors[index % colors.length];
  const mathIndex = GAMES_CONFIG.math.findIndex(g => g.id === gameId);
  if (mathIndex !== -1) return colors[(mathIndex + 2) % colors.length];
  return 'blue';
}

// 绑定事件
function bindEvents() {
  // 阻止默认触摸行为
  document.addEventListener('touchmove', (e) => {
    if (currentGame) e.preventDefault();
  }, { passive: false });
}

// 显示首页
function showHome() {
  currentGame = null;
  document.getElementById('home-page').classList.add('active');
  document.getElementById('game-page').classList.remove('active');
  document.getElementById('settings-page').classList.remove('active');
  updateProgressDisplay();
  AudioManager.playClick();
}

// 显示设置页
function showSettings() {
  currentGame = null;
  document.getElementById('settings-page').classList.add('active');
  document.getElementById('home-page').classList.remove('active');
  document.getElementById('game-page').classList.remove('active');
  AudioManager.playClick();
}

// 显示游戏页面
function showGame(gameContent) {
  currentGame = gameContent;
  document.getElementById('game-page').classList.add('active');
  document.getElementById('home-page').classList.remove('active');
  document.getElementById('settings-page').classList.remove('active');
}

// 启动游戏
function startGame(gameId) {
  AudioManager.playClick();
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

// 切换声音设置
function toggleSound() {
  const toggle = document.getElementById('toggle-sound');
  const isEnabled = !ProgressManager.isSoundEnabled();
  ProgressManager.updateSettings({ soundEnabled: isEnabled });
  toggle.classList.toggle('active', isEnabled);
  if (isEnabled) AudioManager.playClick();
}

// 切换音乐设置
function toggleMusic() {
  const toggle = document.getElementById('toggle-music');
  const isEnabled = !ProgressManager.isBgMusicEnabled();
  ProgressManager.updateSettings({ bgMusicEnabled: isEnabled });
  toggle.classList.toggle('active', isEnabled);
  if (isEnabled) AudioManager.playBackground();
  AudioManager.playClick();
}

// 初始化设置页开关状态
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

// 显示星星动画
function showStarAnimation(x, y) {
  AudioManager.playStar();
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

// 显示反馈弹窗
function showFeedback(isCorrect, message = '') {
  const feedback = document.createElement('div');
  feedback.className = `feedback-popup ${isCorrect ? 'success' : 'error'}`;
  feedback.textContent = message || (isCorrect ? '🎉 太棒了!' : '💪 再试试!');
  document.body.appendChild(feedback);

  if (isCorrect) {
    AudioManager.playCorrect();
  } else {
    AudioManager.playWrong();
  }

  setTimeout(() => {
    feedback.style.animation = 'popOut 0.5s ease';
    setTimeout(() => feedback.remove(), 500);
  }, 1500);
}

// DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  initApp();
  initSettingsToggles();
});
