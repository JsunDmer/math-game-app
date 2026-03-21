/**
 * Word Puzzle Game - 单词拼图
 * 将字母打乱，点击按正确顺序排列
 */
class WordPuzzleGame {
  static score = 0;
  static currentRound = 0;
  static totalRounds = 8;
  static targetWord = '';
  static scrambledLetters = [];
  static userSequence = [];

  static words = ['CAT', 'DOG', 'SUN', 'HAT', 'PEN', 'CUP', 'BOX', 'KEY',
                   'APPLE', 'BIRD', 'FISH', 'TREE', 'STAR', 'MOON', 'BOOK'];

  static render() {
    this.score = 0;
    this.currentRound = 0;
    this.initRound();

    return `
      <div class="top-bar">
        <button class="back-btn" onclick="showHome()">🏠 返回</button>
        <span class="game-title-header">单词拼图</span>
        <span class="stars-display">⭐ <span id="score">0</span></span>
      </div>

      <div class="game-area">
        <div class="round-info">第 <span id="round-num">1</span> / ${this.totalRounds} 轮</div>

        <div class="target-word" id="target-word">
          <div class="word-hint">拼出这个单词:</div>
          <div class="word-display">${this.targetWord}</div>
        </div>

        <div class="puzzle-area">
          <div class="answer-slots" id="answer-slots">
            ${this.userSequence.map((letter, idx) => `
              <div class="answer-slot ${letter ? 'filled' : ''}" data-index="${idx}" onclick="WordPuzzleGame.removeLetter(${idx})">
                ${letter || ''}
              </div>
            `).join('')}
          </div>

          <button class="btn btn-success mt-md" onclick="WordPuzzleGame.checkWord()">检查答案</button>

          <div class="scrambled-letters" id="scrambled-letters">
            ${this.scrambledLetters.map((letter, idx) => `
              <button class="scrambled-btn ${letter.used ? 'used' : ''}" data-index="${idx}" onclick="WordPuzzleGame.selectLetter(${idx})" ${letter.used ? 'disabled' : ''}>
                ${letter.char}
              </button>
            `).join('')}
          </div>
        </div>
      </div>

      <style>
        .game-area { text-align: center; padding: 20px 0; }
        .round-info { font-size: 18px; color: #666; margin-bottom: 24px; }
        .target-word { margin-bottom: 30px; }
        .word-hint { font-size: 18px; color: #888; margin-bottom: 12px; }
        .word-display { font-size: 42px; font-weight: bold; color: var(--primary-pink); letter-spacing: 6px; }
        .puzzle-area { }
        .answer-slots { display: flex; justify-content: center; gap: 12px; margin-bottom: 30px; }
        .answer-slot { width: 80px; height: 90px; border: 3px solid var(--primary-blue); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 36px; font-weight: bold; background: rgba(84, 160, 255, 0.1); cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(84, 160, 255, 0.2); }
        .answer-slot.filled { background: white; border-color: var(--primary-blue); box-shadow: 0 6px 20px rgba(84, 160, 255, 0.3); }
        .answer-slot:active { transform: scale(0.95); }
        .scrambled-letters { display: flex; justify-content: center; gap: 16px; flex-wrap: wrap; margin-top: 30px; padding: 20px; background: rgba(78, 205, 196, 0.1); border-radius: 20px; }
        .scrambled-btn { width: 80px; height: 80px; font-size: 36px; font-family: 'ZCOOL KuaiLe', sans-serif; background: linear-gradient(135deg, var(--primary-green), #3DB9A8); color: white; border: none; border-radius: 16px; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(78, 205, 196, 0.3); }
        .scrambled-btn:active { transform: scale(0.95); }
        .scrambled-btn.used { opacity: 0.3; pointer-events: none; }
      </style>
    `;
  }

  static initRound() {
    const wordList = this.words.filter(w => w.length >= 3);
    this.targetWord = wordList[Math.floor(Math.random() * wordList.length)];
    this.scrambledLetters = [...this.targetWord].sort(() => Math.random() - 0.5).map(char => ({ char, used: false }));
    this.userSequence = new Array(this.targetWord.length).fill('');
  }

  static selectLetter(index) {
    if (this.scrambledLetters[index].used) return;

    const emptyIndex = this.userSequence.findIndex(s => s === '');
    if (emptyIndex !== -1) {
      this.scrambledLetters[index].used = true;
      this.userSequence[emptyIndex] = this.scrambledLetters[index].char;
      this.updateDisplay();
    }
  }

  static removeLetter(index) {
    if (!this.userSequence[index]) return;

    const char = this.userSequence[index];
    const letterIndex = this.scrambledLetters.findIndex(l => l.char === char && l.used);
    if (letterIndex !== -1) {
      this.scrambledLetters[letterIndex].used = false;
    }
    this.userSequence[index] = '';
    this.updateDisplay();
  }

  static updateDisplay() {
    const slotsHtml = this.userSequence.map((letter, idx) => `
      <div class="answer-slot ${letter ? 'filled' : ''}" data-index="${idx}" onclick="WordPuzzleGame.removeLetter(${idx})">
        ${letter || ''}
      </div>
    `).join('');
    document.getElementById('answer-slots').innerHTML = slotsHtml;

    const scrambledHtml = this.scrambledLetters.map((letter, idx) => `
      <button class="scrambled-btn ${letter.used ? 'used' : ''}" data-index="${idx}" onclick="WordPuzzleGame.selectLetter(${idx})" ${letter.used ? 'disabled' : ''}>
        ${letter.char}
      </button>
    `).join('');
    document.getElementById('scrambled-letters').innerHTML = scrambledHtml;
  }

  static checkWord() {
    const userWord = this.userSequence.join('');
    const isCorrect = userWord === this.targetWord;

    if (isCorrect) {
      this.score += 15;
      AudioManager.playCorrect();
      VoiceManager.speakWord(this.targetWord);
      ProgressManager.incrementWordsLearned(1);
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
        document.getElementById('target-word').innerHTML = `
          <div class="word-hint">拼出这个单词:</div>
          <div class="word-display">${this.targetWord}</div>
        `;
        this.updateDisplay();
      }
    }, 1500);
  }
}
