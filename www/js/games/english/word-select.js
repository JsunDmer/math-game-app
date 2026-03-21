/**
 * Word Select Game - 看图选词游戏
 * 根据图片选择正确的单词
 */
class WordSelectGame {
  static score = 0;
  static currentRound = 0;
  static totalRounds = 10;
  static roundData = null;

  static words = [
    { word: 'APPLE', emoji: '🍎' },
    { word: 'BANANA', emoji: '🍌' },
    { word: 'ORANGE', emoji: '🍊' },
    { word: 'GRAPES', emoji: '🍇' },
    { word: 'STRAWBERRY', emoji: '🍓' },
    { word: 'WATERMELON', emoji: '🍉' },
    { word: 'CAT', emoji: '🐱' },
    { word: 'DOG', emoji: '🐕' },
    { word: 'BIRD', emoji: '🐦' },
    { word: 'FISH', emoji: '🐟' },
    { word: 'CAR', emoji: '🚗' },
    { word: 'BUS', emoji: '🚌' },
    { word: 'TREE', emoji: '🌳' },
    { word: 'FLOWER', emoji: '🌸' },
    { word: 'SUN', emoji: '☀️' },
    { word: 'MOON', emoji: '🌙' },
    { word: 'STAR', emoji: '⭐' },
    { word: 'BOOK', emoji: '📚' },
    { word: 'PENCIL', emoji: '✏️' },
    { word: 'CHAIR', emoji: '🪑' }
  ];

  static render() {
    this.score = 0;
    this.currentRound = 0;
    this.generateRound();

    return `
      <div class="top-bar">
        <button class="back-btn" onclick="showHome()">🏠 返回</button>
        <span class="game-title-header">看图选词</span>
        <span class="stars-display">⭐ <span id="score">0</span></span>
      </div>

      <div class="game-area">
        <div class="round-info">第 <span id="round-num">1</span> / ${this.totalRounds} 轮</div>

        <div class="emoji-display" id="emoji-display">
          <div class="emoji-big">${this.roundData.emoji}</div>
        </div>

        <div class="options-container" id="options-container">
          ${this.roundData.options.map((opt, idx) => `
            <button class="option-btn" data-word="${opt}" onclick="WordSelectGame.checkAnswer('${opt}', this)">
              ${opt}
            </button>
          `).join('')}
        </div>
      </div>

      <div class="game-progress">
        <div class="progress-bar">
          <div class="progress-fill" id="progress-fill" style="width: 0%"></div>
        </div>
      </div>

      <style>
        .game-area { text-align: center; padding: 8px 0; }
        .round-info { font-size: 16px; color: #666; margin-bottom: 8px; }
        .emoji-display { margin-bottom: 12px; }
        .emoji-big { font-size: 80px; animation: float 2s ease-in-out infinite; }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .options-container { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; padding: 0 16px; max-width: 400px; margin: 0 auto; }
        .option-btn { padding: 14px; font-size: 18px; font-family: 'ZCOOL KuaiLe', sans-serif; background: white; border: 2px solid #ddd; border-radius: 12px; cursor: pointer; transition: all 0.3s; min-height: 50px; }
        .option-btn:active { transform: scale(0.95); }
        .option-btn.correct { background: var(--success); color: white; border-color: var(--success); animation: bounce 0.5s ease; }
        .option-btn.wrong { background: var(--error); color: white; border-color: var(--error); animation: shake 0.5s ease; }
        .option-btn:disabled { pointer-events: none; }
      </style>
    `;
  }

  static generateRound() {
    const shuffled = [...this.words].sort(() => Math.random() - 0.5);
    const correct = shuffled[0];
    const others = shuffled.slice(1, 3).map(w => w.word);
    const options = [...others, correct.word].sort(() => Math.random() - 0.5);

    this.roundData = {
      correct: correct.word,
      emoji: correct.emoji,
      options: options
    };
  }

  static checkAnswer(word, btn) {
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(b => b.disabled = true);

    if (word === this.roundData.correct) {
      btn.classList.add('correct');
      this.score += 10;
      AudioManager.playCorrect();
      VoiceManager.speakWord(this.roundData.correct);
      ProgressManager.incrementWordsLearned(1);
    } else {
      btn.classList.add('wrong');
      AudioManager.playWrong();
      buttons.forEach(b => {
        if (b.dataset.word === this.roundData.correct) {
          b.classList.add('correct');
        }
      });
    }

    document.getElementById('score').textContent = this.score;
    document.getElementById('progress-fill').style.width = ((this.currentRound + 1) / this.totalRounds * 100) + '%';

    setTimeout(() => {
      this.currentRound++;
      if (this.currentRound >= this.totalRounds) {
        this.endGame();
      } else {
        this.nextRound();
      }
    }, 1500);
  }

  static nextRound() {
    this.currentRound++;
    this.generateRound();

    document.getElementById('round-num').textContent = this.currentRound + 1;
    document.getElementById('emoji-display').innerHTML = `<div class="emoji-big">${this.roundData.emoji}</div>`;
    document.getElementById('options-container').innerHTML = this.roundData.options.map((opt, idx) => `
      <button class="option-btn" data-word="${opt}" onclick="WordSelectGame.checkAnswer('${opt}', this)">
        ${opt}
      </button>
    `).join('');
  }

  static endGame() {
    const stars = Math.ceil(this.score / 30);
    ProgressManager.addStars(stars);
    showFeedback(true, `🎉 完成！得分: ${this.score}`);
    updateProgressDisplay();
  }
}
