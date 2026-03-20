/**
 * Addition Game - 简单加法
 * 用直观的方式学习加法
 */
class AdditionGame {
  static score = 0;
  static currentRound = 0;
  static totalRounds = 10;
  static firstNum = 0;
  static secondNum = 0;
  static answer = 0;
  static themes = ['animals', 'fruits', 'objects'];
  static currentTheme = 'animals';

  static themeItems = {
    animals: ['🐶', '🐱', '🐰', '🐻', '🦊', '🦁', '🐼', '🐨'],
    fruits: ['🍎', '🍊', '🍋', '🍇', '🍓', '🍑', '🍒', '🥝'],
    objects: ['⭐', '🌙', '🌸', '🌈', '🎈', '🎁', '🎀', '🌺']
  };

  static render() {
    this.score = 0;
    this.currentRound = 0;
    this.currentTheme = this.themes[Math.floor(Math.random() * this.themes.length)];
    this.initRound();

    return `
      <div class="top-bar">
        <button class="back-btn" onclick="showHome()">🏠 返回</button>
        <span class="game-title-header">简单加法</span>
        <span class="stars-display">⭐ <span id="score">0</span></span>
      </div>

      <div class="game-area">
        <div class="round-info">第 <span id="round-num">1</span> / ${this.totalRounds} 轮</div>

        <div class="addition-display" id="addition-display">
          <div class="equation">
            <span class="num-display" id="first-num">${this.generateItemsHtml(this.firstNum)}</span>
            <span class="operator">+</span>
            <span class="num-display" id="second-num">${this.generateItemsHtml(this.secondNum)}</span>
            <span class="operator">=</span>
            <span class="result-slot">?</span>
          </div>
        </div>

        <div class="options-container" id="options-container">
          ${this.generateOptions()}
        </div>
      </div>

      <div class="game-progress">
        <div class="progress-bar">
          <div class="progress-fill" id="progress-fill" style="width: 0%"></div>
        </div>
      </div>

      <style>
        .game-area { text-align: center; padding: 20px 0; }
        .round-info { font-size: 18px; color: #666; margin-bottom: 24px; }
        .addition-display { background: white; border-radius: 24px; padding: 30px 20px; margin-bottom: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .equation { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 16px; }
        .num-display { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; min-width: 80px; min-height: 80px; }
        .num-display .item { font-size: 36px; }
        .operator { font-size: 36px; font-weight: bold; color: var(--primary-pink); }
        .result-slot { width: 80px; height: 80px; border: 4px dashed var(--primary-blue); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 40px; font-weight: bold; color: var(--primary-blue); }
        .options-container { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; padding: 0 30px; max-width: 400px; margin: 0 auto; }
        .option-btn { padding: 24px; font-size: 32px; font-family: 'ZCOOL KuaiLe', sans-serif; background: white; border: 3px solid #ddd; border-radius: 16px; cursor: pointer; transition: all 0.2s; }
        .option-btn:active { transform: scale(0.95); }
        .option-btn.correct { background: var(--success); color: white; border-color: var(--success); animation: bounce 0.5s ease; }
        .option-btn.wrong { background: var(--error); color: white; border-color: var(--error); animation: shake 0.5s ease; }
      </style>
    `;
  }

  static generateItemsHtml(count) {
    const items = this.themeItems[this.currentTheme];
    return Array(count).fill(0).map((_, i) =>
      `<span class="item">${items[i % items.length]}</span>`
    ).join('');
  }

  static initRound() {
    this.firstNum = Math.floor(Math.random() * 6) + 1;
    this.secondNum = Math.floor(Math.random() * 6) + 1;
    this.answer = this.firstNum + this.secondNum;
  }

  static generateOptions() {
    const correct = this.answer;
    const options = new Set([correct]);
    while (options.size < 4) {
      const offset = Math.floor(Math.random() * 5) - 2;
      const val = correct + offset;
      if (val > 0 && val <= 12) {
        options.add(val);
      }
    }
    return [...options].sort(() => Math.random() - 0.5).map(opt => `
      <button class="option-btn" data-value="${opt}" onclick="AdditionGame.checkAnswer(${opt}, this)">
        ${opt}
      </button>
    `).join('');
  }

  static checkAnswer(value, btn) {
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(b => b.disabled = true);

    if (value === this.answer) {
      btn.classList.add('correct');
      this.score += 10;
      AudioManager.playCorrect();
      VoiceManager.speakChinese(this.answer.toString());
      ProgressManager.incrementWordsLearned(1);
    } else {
      btn.classList.add('wrong');
      AudioManager.playWrong();
      buttons.forEach(b => {
        if (parseInt(b.dataset.value) === this.answer) {
          b.classList.add('correct');
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
        this.currentTheme = this.themes[Math.floor(Math.random() * this.themes.length)];
        document.getElementById('addition-display').innerHTML = `
          <div class="equation">
            <span class="num-display">${this.generateItemsHtml(this.firstNum)}</span>
            <span class="operator">+</span>
            <span class="num-display">${this.generateItemsHtml(this.secondNum)}</span>
            <span class="operator">=</span>
            <span class="result-slot">?</span>
          </div>
        `;
        document.getElementById('options-container').innerHTML = this.generateOptions();
      }
    }, 1500);
  }
}
