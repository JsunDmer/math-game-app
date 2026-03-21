/**
 * Counting Game - 数数练习
 * 数物品的数量，选择正确答案
 */
class CountingGame {
  static score = 0;
  static currentRound = 0;
  static totalRounds = 10;
  static currentCount = 0;
  static currentEmoji = '';

  static items = [
    { emoji: '🍎', name: '苹果' },
    { emoji: '⭐', name: '星星' },
    { emoji: '🐱', name: '小猫' },
    { emoji: '🌸', name: '花朵' },
    { emoji: '🦋', name: '蝴蝶' },
    { emoji: '🍓', name: '草莓' },
    { emoji: '🌙', name: '月亮' },
    { emoji: '🐶', name: '小狗' },
    { emoji: '🍌', name: '香蕉' },
    { emoji: '🌈', name: '彩虹' }
  ];

  static render() {
    this.score = 0;
    this.currentRound = 0;

    const item = this.items[Math.floor(Math.random() * this.items.length)];
    this.currentCount = Math.floor(Math.random() * 9) + 1;
    this.currentEmoji = item.emoji;
    const correctAnswer = this.currentCount;
    const options = this.generateOptions(correctAnswer);
    const itemsHtml = Array(this.currentCount).fill(0).map(() => `<span class="item">${this.currentEmoji}</span>`).join('');
    const optionsHtml = options.map(opt => `
      <button class="option-btn" data-value="${opt}" onclick="CountingGame.checkAnswer(${opt})">
        ${opt}
      </button>
    `).join('');

    return `
      <div class="top-bar">
        <button class="back-btn" onclick="showHome()">🏠 返回</button>
        <span class="game-title-header">数数练习</span>
        <span class="stars-display">⭐ <span id="score">0</span></span>
      </div>

      <div class="game-area">
        <div class="round-info">第 <span id="round-num">1</span> / ${this.totalRounds} 轮</div>

        <div class="count-display" id="count-display">
          <div class="count-question">数一数有多少个？</div>
          <div class="items-container" id="items-container">${itemsHtml}</div>
        </div>

        <div class="options-container" id="options-container">${optionsHtml}</div>
      </div>

      <div class="game-progress">
        <div class="progress-bar">
          <div class="progress-fill" id="progress-fill" style="width: 0%"></div>
        </div>
      </div>

      <style>
        .game-area { text-align: center; padding: 20px 0; }
        .round-info { font-size: 18px; color: #666; margin-bottom: 20px; }
        .count-display { margin-bottom: 30px; }
        .count-question { font-size: 22px; color: var(--text-primary); margin-bottom: 20px; }
        .items-container { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; padding: 20px; background: white; border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .item { font-size: 48px; animation: popIn 0.3s ease; }
        @keyframes popIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .options-container { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; padding: 0 10px; }
        .option-btn { padding: 20px; font-size: 28px; font-family: 'ZCOOL KuaiLe', sans-serif; background: white; border: 3px solid #ddd; border-radius: 16px; cursor: pointer; transition: all 0.2s; }
        .option-btn:active { transform: scale(0.95); }
        .option-btn.correct { background: var(--success); color: white; border-color: var(--success); animation: bounce 0.5s ease; }
        .option-btn.wrong { background: var(--error); color: white; border-color: var(--error); animation: shake 0.5s ease; }
      </style>
    `;
  }

  static initRound() {
    const item = this.items[Math.floor(Math.random() * this.items.length)];
    this.currentCount = Math.floor(Math.random() * 9) + 1;
    this.currentEmoji = item.emoji;

    const itemsHtml = Array(this.currentCount).fill(0).map(() => `<span class="item">${this.currentEmoji}</span>`).join('');
    document.getElementById('items-container').innerHTML = itemsHtml;

    const correctAnswer = this.currentCount;
    const options = this.generateOptions(correctAnswer);

    document.getElementById('options-container').innerHTML = options.map(opt => `
      <button class="option-btn" data-value="${opt}" onclick="CountingGame.checkAnswer(${opt})">
        ${opt}
      </button>
    `).join('');
  }

  static generateOptions(correct) {
    const options = new Set([correct]);
    while (options.size < 4) {
      const offset = Math.floor(Math.random() * 5) - 2;
      const val = correct + offset;
      if (val > 0 && val <= 12) {
        options.add(val);
      }
    }
    return [...options].sort(() => Math.random() - 0.5);
  }

  static checkAnswer(value) {
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(b => b.disabled = true);

    if (value === this.currentCount) {
      value === this.currentCount;
      this.score += 10;
      AudioManager.playCorrect();
      VoiceManager.speakNumber(this.currentCount);
      ProgressManager.incrementWordsLearned(1);
      buttons.forEach(b => {
        if (parseInt(b.dataset.value) === this.currentCount) {
          b.classList.add('correct');
        }
      });
    } else {
      AudioManager.playWrong();
      buttons.forEach(b => {
        if (parseInt(b.dataset.value) === this.currentCount) {
          b.classList.add('correct');
        } else if (parseInt(b.dataset.value) === value) {
          b.classList.add('wrong');
        }
      });
    }

    document.getElementById('score').textContent = this.score;
    document.getElementById('progress-fill').style.width = ((this.currentRound + 1) / this.totalRounds * 100) + '%';

    setTimeout(() => {
      this.currentRound++;
      if (this.currentRound >= this.totalRounds) {
        const stars = Math.ceil(this.score / 30);
        ProgressManager.addStars(stars);
        showFeedback(true, `🎉 完成！得分: ${this.score}`);
        updateProgressDisplay();
      } else {
        document.getElementById('round-num').textContent = this.currentRound + 1;
        this.initRound();
      }
    }, 1500);
  }

  static nextRound() {
    this.currentRound++;
    if (this.currentRound < this.totalRounds) {
      document.getElementById('round-num').textContent = this.currentRound + 1;
      this.initRound();
    }
  }
}
