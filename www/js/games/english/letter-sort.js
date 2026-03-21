/**
 * Letter Sort Game - 字母排序游戏
 * 将打乱的字母按顺序排列
 */
class LetterSortGame {
  static score = 0;
  static currentRound = 0;
  static totalRounds = 5;
  static letters = [];
  static userSequence = [];
  static selectedIndex = -1;

  static render() {
    this.score = 0;
    this.currentRound = 0;
    // 初始化数据
    this.initRound();

    return `
      <div class="top-bar">
        <button class="back-btn" onclick="showHome()">🏠 返回</button>
        <span class="game-title-header">字母排序</span>
        <span class="stars-display">⭐ <span id="score">0</span></span>
      </div>

      <div class="game-area">
        <div class="round-info">第 <span id="round-num">1</span> / ${this.totalRounds} 轮</div>
        <div class="target-sequence" id="target-sequence">
          目标顺序: ${this.letters.join(' → ')}
        </div>

        <div class="sort-area">
          <div class="sort-hint">点击字母，按 A-Z 的顺序排列</div>
          <div class="letter-slots" id="letter-slots">
            ${this.userSequence.map((letter, idx) => `
              <div class="letter-slot ${letter ? 'filled' : ''}" data-index="${idx}" onclick="LetterSortGame.selectSlot(${idx})">
                ${letter || '?'}
              </div>
            `).join('')}
          </div>
        </div>

        <div class="available-letters" id="available-letters">
          ${this.getAvailableLetters().map(letter => `
            <button class="letter-btn ${letter.used ? 'used' : ''}" data-letter="${letter.char}" onclick="LetterSortGame.selectLetter('${letter.char}')" ${letter.used ? 'disabled' : ''}>
              ${letter.char}
            </button>
          `).join('')}
        </div>

        <button class="btn btn-secondary mt-md" onclick="LetterSortGame.checkSequence()">检查答案</button>
      </div>

      <style>
        .game-area { text-align: center; padding: 20px 0; }
        .round-info { font-size: 18px; color: #666; margin-bottom: 16px; }
        .target-sequence { background: #f0f0f0; padding: 12px 20px; border-radius: 12px; font-size: 18px; color: #666; margin-bottom: 20px; }
        .sort-hint { font-size: 16px; color: #888; margin-bottom: 12px; }
        .letter-slots { display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
        .letter-slot { width: 50px; height: 50px; border: 3px dashed #ddd; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; cursor: pointer; transition: all 0.2s; background: white; }
        .letter-slot.filled { border-style: solid; border-color: var(--primary-blue); background: rgba(84, 160, 255, 0.1); }
        .letter-slot.selected { border-color: var(--primary-pink); background: rgba(255, 107, 157, 0.2); transform: scale(1.1); }
        .available-letters { display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; }
        .letter-btn { width: 50px; height: 50px; font-size: 22px; font-family: 'ZCOOL KuaiLe', sans-serif; background: white; border: 3px solid var(--primary-purple); border-radius: 12px; cursor: pointer; transition: all 0.2s; }
        .letter-btn:active { transform: scale(0.9); }
        .letter-btn.used { opacity: 0.3; border-color: #ccc; }
      </style>
    `;
  }

  static initRound() {
    const startCode = 65 + Math.floor(Math.random() * 20);
    this.letters = Array.from(String.fromCharCode(startCode, startCode + 1, startCode + 2, startCode + 3));
    this.userSequence = ['', '', '', ''];
  }

  static getAvailableLetters() {
    const shuffled = [...this.letters].sort(() => Math.random() - 0.5);
    return shuffled.map(char => ({
      char,
      used: this.userSequence.includes(char)
    }));
  }

  static selectLetter(letter) {
    const emptyIndex = this.userSequence.findIndex(s => s === '');
    if (emptyIndex !== -1) {
      this.userSequence[emptyIndex] = letter;
      this.updateDisplay();
    }
  }

  static selectSlot(index) {
    if (this.userSequence[index]) {
      this.userSequence[index] = '';
      this.updateDisplay();
    }
  }

  static updateDisplay() {
    const slotsHtml = this.userSequence.map((letter, idx) => `
      <div class="letter-slot ${letter ? 'filled' : ''}" data-index="${idx}" onclick="LetterSortGame.selectSlot(${idx})">
        ${letter || '?'}
      </div>
    `).join('');
    document.getElementById('letter-slots').innerHTML = slotsHtml;

    const availableHtml = this.getAvailableLetters().map(letter => `
      <button class="letter-btn ${letter.used ? 'used' : ''}" data-letter="${letter.char}" onclick="LetterSortGame.selectLetter('${letter.char}')" ${letter.used ? 'disabled' : ''}>
        ${letter.char}
      </button>
    `).join('');
    document.getElementById('available-letters').innerHTML = availableHtml;
  }

  static checkSequence() {
    const isCorrect = this.userSequence.every((letter, idx) => letter === this.letters[idx]);

    if (isCorrect) {
      this.score += 20;
      AudioManager.playCorrect();
      showFeedback(true, '🎉 正确！');
    } else {
      AudioManager.playWrong();
      showFeedback(false, '💪 再试试！');
    }

    document.getElementById('score').textContent = this.score;

    setTimeout(() => {
      this.currentRound++;
      if (this.currentRound >= this.totalRounds) {
        const stars = Math.ceil(this.score / 30);
        ProgressManager.addStars(stars);
        showFeedback(true, `🎉 完成！得分: ${this.score}`);
        updateProgressDisplay();
      } else {
        this.initRound();
        document.getElementById('round-num').textContent = this.currentRound + 1;
        document.getElementById('target-sequence').innerHTML = `目标顺序: ${this.letters.join(' → ')}`;
        this.updateDisplay();
      }
    }, 1500);
  }
}
