# UI 重构与功能优化实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 重构为三标签页布局，修复滚动和语音问题，添加背景音乐功能

**Architecture:** 底部固定标签栏切换三个独立页面（英语/数学/设置），使用 CSS overflow 实现滚动，Web Audio API 播放在线音乐

**Tech Stack:** HTML5, CSS3, JavaScript, Web Audio API, Web Speech API

---

### Task 1: 重构 HTML 为三标签页布局

**Files:**
- Modify: `/Users/sunjian/project/ai_kids_tech/math-game-app/www/index.html`

**Step 1: 修改页面结构**

将现有三个页面改为英语、数学、设置三个标签页：

```html
<!-- 英语标签页 -->
<div id="english-page" class="page english-page active">
  <div class="game-container">
    <h1 class="page-title">🔤 英语学习</h1>
    <div class="game-grid" id="english-games"></div>
    <div class="progress-panel mt-lg">...</div>
  </div>
</div>

<!-- 数学标签页 -->
<div id="math-page" class="page math-page">
  <div class="game-container">
    <h1 class="page-title">🔢 数学练习</h1>
    <div class="game-grid" id="math-games"></div>
    <div class="progress-panel mt-lg">...</div>
  </div>
</div>

<!-- 设置标签页 -->
<div id="settings-page" class="page settings-page">
  ...
</div>

<!-- 底部导航 -->
<nav class="bottom-tab-bar">
  <button class="tab-btn active" onclick="showEnglishTab()">
    <span class="icon">🔤</span>
    <span class="label">英语</span>
  </button>
  <button class="tab-btn" onclick="showMathTab()">
    <span class="icon">🔢</span>
    <span class="label">数学</span>
  </button>
  <button class="tab-btn" onclick="showSettingsTab()">
    <span class="icon">⚙️</span>
    <span class="label">设置</span>
  </button>
</nav>
```

**Step 2: 添加滚动相关 CSS**

```css
.page {
  height: calc(100vh - 80px);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.game-container {
  padding: 20px;
  padding-bottom: 40px;
}
```

**Step 3: 验证 HTML 语法**

---

### Task 2: 更新 app.js 标签页切换逻辑

**Files:**
- Modify: `/Users/sunjian/project/ai_kids_tech/math-game-app/www/js/app.js`

**Step 1: 添加标签页切换函数**

```javascript
function showEnglishTab() {
  switchTab('english-page');
  AudioManager.playClick();
}

function showMathTab() {
  switchTab('math-page');
  AudioManager.playClick();
}

function showSettingsTab() {
  switchTab('settings-page');
  AudioManager.playClick();
}

function switchTab(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
  event.currentTarget.classList.add('active');
  updateProgressDisplay();
}
```

**Step 2: 移除 touchmove 阻止默认行为**

删除 bindEvents 中的 touchmove 阻止代码。

**Step 3: 更新 showHome 函数**

```javascript
function showHome() {
  currentGame = null;
  showEnglishTab();
}
```

---

### Task 3: 创建背景音乐管理器

**Files:**
- Create: `/Users/sunjian/project/ai_kids_tech/math-game-app/www/js/core/music-manager.js`

**Step 1: 创建 MusicManager 类**

```javascript
class MusicManager {
  static audio = null;
  static currentTrack = 0;
  static isPlaying = false;
  static volume = 0.5;

  static tracks = [
    {
      name: 'Happy Piano',
      url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
      icon: '🎹'
    },
    {
      name: 'Playful Fun',
      url: 'https://cdn.pixabay.com/download/audio/2021/09/06/audio_8c6497b51b.mp3',
      icon: '🎵'
    },
    {
      name: 'Kids Party',
      url: 'https://cdn.pixabay.com/download/audio/2022/10/25/audio_946bc3eb81.mp3',
      icon: '🎉'
    },
    {
      name: 'Sunny Day',
      url: 'https://cdn.pixabay.com/download/audio/2022/02/23/audio_0b83a75c1c.mp3',
      icon: '☀️'
    }
  ];

  static init() {
    this.audio = new Audio();
    this.audio.loop = true;
    this.audio.volume = this.volume;
    this.loadProgress();
  }

  static play(index = this.currentTrack) {
    if (!this.audio) this.init();
    this.currentTrack = index;
    this.audio.src = this.tracks[index].url;
    this.audio.play().catch(e => console.warn('Music play failed:', e));
    this.isPlaying = true;
    this.saveProgress();
  }

  static pause() {
    if (this.audio) {
      this.audio.pause();
      this.isPlaying = false;
    }
  }

  static toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
    return this.isPlaying;
  }

  static setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.audio) this.audio.volume = this.volume;
    this.saveProgress();
  }

  static selectTrack(index) {
    this.currentTrack = index;
    if (this.isPlaying) {
      this.play(index);
    }
    this.saveProgress();
  }

  static saveProgress() {
    try {
      localStorage.setItem('music-state', JSON.stringify({
        currentTrack: this.currentTrack,
        volume: this.volume
      }));
    } catch (e) {}
  }

  static loadProgress() {
    try {
      const saved = localStorage.getItem('music-state');
      if (saved) {
        const state = JSON.parse(saved);
        this.currentTrack = state.currentTrack || 0;
        this.volume = state.volume || 0.5;
        if (this.audio) this.audio.volume = this.volume;
      }
    } catch (e) {}
  }
}
```

**Step 2: 在 index.html 中引入**

```html
<script src="js/core/music-manager.js"></script>
```

---

### Task 4: 更新设置页面添加音乐控制

**Files:**
- Modify: `/Users/sunjian/project/ai_kids_tech/math-game-app/www/index.html`

**Step 1: 添加音乐控制 UI**

```html
<div class="setting-item">
  <span class="setting-label">🎵 背景音乐</span>
  <div class="toggle-switch" id="toggle-music" onclick="toggleMusic()"></div>
</div>

<div class="setting-section" id="music-controls" style="display: none;">
  <div class="setting-item">
    <span class="setting-label">选择音乐</span>
  </div>
  <div class="music-list" id="music-list"></div>
  
  <div class="setting-item">
    <span class="setting-label">🔊 音量</span>
    <input type="range" min="0" max="100" value="50" 
           class="volume-slider" id="volume-slider" 
           oninput="setVolume(this.value)">
  </div>
</div>
```

**Step 2: 添加音乐列表渲染函数**

在 app.js 中添加：

```javascript
function renderMusicList() {
  const list = document.getElementById('music-list');
  if (!list) return;
  
  list.innerHTML = MusicManager.tracks.map((track, i) => `
    <div class="music-item ${i === MusicManager.currentTrack ? 'active' : ''}" 
         onclick="selectMusic(${i})">
      <span class="music-icon">${track.icon}</span>
      <span class="music-name">${track.name}</span>
    </div>
  `).join('');
}

function selectMusic(index) {
  MusicManager.selectTrack(index);
  renderMusicList();
}

function setVolume(value) {
  MusicManager.setVolume(value / 100);
}

function toggleMusic() {
  const toggle = document.getElementById('toggle-music');
  const controls = document.getElementById('music-controls');
  const isPlaying = MusicManager.toggle();
  
  toggle.classList.toggle('active', isPlaying);
  controls.style.display = isPlaying ? 'block' : 'none';
  
  if (isPlaying) {
    renderMusicList();
  }
  
  ProgressManager.updateSettings({ bgMusicEnabled: isPlaying });
}
```

---

### Task 5: 修复语音播报功能

**Files:**
- Modify: `/Users/sunjian/project/ai_kids_tech/math-game-app/www/js/core/voice-manager.js`

**Step 1: 增强语音播报稳定性**

```javascript
static speak(text, lang = 'en-US') {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      resolve();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.8;
    utterance.pitch = 1.2;

    if (this.preferredVoice) {
      utterance.voice = this.preferredVoice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = (e) => {
      console.warn('Speech error:', e);
      resolve();
    };

    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  });
}

static speakNumber(num) {
  return this.speak(num.toString(), 'en-US');
}

static speakLetter(letter) {
  return this.speak(letter.toUpperCase(), 'en-US');
}

static speakWord(word) {
  return this.speak(word, 'en-US');
}
```

**Step 2: 在数学游戏中添加语音播报**

修改 counting.js 等数学游戏，在显示数字时调用 `VoiceManager.speakNumber()`。

---

### Task 6: 添加音乐控制相关 CSS

**Files:**
- Modify: `/Users/sunjian/project/ai_kids_tech/math-game-app/www/styles/design-system.css`

**Step 1: 添加音乐控制样式**

```css
.music-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 12px 0;
}

.music-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: var(--transition-fast);
  border: 2px solid transparent;
}

.music-item:hover {
  background: var(--bg-secondary);
}

.music-item.active {
  border-color: var(--primary-pink);
  background: rgba(255, 107, 157, 0.1);
}

.music-icon {
  font-size: 24px;
}

.music-name {
  font-size: 16px;
  color: var(--text-primary);
}

.volume-slider {
  width: 120px;
  height: 8px;
  -webkit-appearance: none;
  appearance: none;
  background: var(--bg-secondary);
  border-radius: 4px;
  outline: none;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: var(--primary-pink);
  border-radius: 50%;
  cursor: pointer;
}

.setting-section {
  padding: 0 20px;
  margin-top: 12px;
}
```

---

### Task 7: 测试与提交

**Step 1: 本地测试**

启动本地服务器验证：
- 标签页切换正常
- 页面可滚动
- 语音播报正常
- 背景音乐播放正常

**Step 2: 提交代码**

```bash
git add .
git commit -m "feat: UI重构为三标签页布局，添加背景音乐功能

1. 重构为英语/数学/设置三标签页独立布局
2. 修复页面滚动问题
3. 增强语音播报功能稳定性
4. 添加背景音乐管理器，支持在线音乐播放
5. 设置页面添加音乐选择和音量控制"
git push origin main
```
