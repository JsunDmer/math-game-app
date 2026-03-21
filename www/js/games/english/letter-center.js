/**
 * Letter Center Game - 字母发音学习
 * 系统学习26个字母的发音
 */
class LetterCenterGame {
  static currentIndex = 0;
  static letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  static learnedLetters = new Set();

  static render() {
    this.currentIndex = 0;

    return `
      <div class="top-bar">
        <button class="back-btn" onclick="showHome()">🏠 返回</button>
        <span class="game-title-header">字母发音学习</span>
        <span class="stars-display">📚 <span id="learned-count">0</span>/26</span>
      </div>

      <div class="game-area">
        <div class="progress-indicator">
          ${this.letters.map((letter, idx) => `
            <div class="progress-dot ${this.learnedLetters.has(letter) ? 'learned' : ''} ${idx === this.currentIndex ? 'current' : ''}" data-index="${idx}" onclick="LetterCenterGame.goToLetter(${idx})">
              ${letter}
            </div>
          `).join('')}
        </div>

        <div class="letter-display-area">
          <div class="current-letter" id="current-letter">A</div>
          <div class="letter-sound" id="letter-sound">/eɪ/</div>
        </div>

        <div class="control-buttons">
          <button class="control-btn prev" id="prev-btn" onclick="LetterCenterGame.prevLetter()">◀</button>
          <button class="control-btn play" id="play-btn" onclick="LetterCenterGame.playSound()">
            <span class="play-icon">🔊</span>
          </button>
          <button class="control-btn next" id="next-btn" onclick="LetterCenterGame.nextLetter()">▶</button>
        </div>

        <div class="learning-tips" id="learning-tips">
          点击播放按钮听发音，然后跟读练习
        </div>

        <button class="btn btn-success mt-lg" onclick="LetterCenterGame.markAsLearned()" style="width: 100%;">
          ✓ 我学会了！
        </button>
      </div>

      <style>
        .game-area { text-align: center; padding: 20px 0; }
        .progress-indicator { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; margin-bottom: 30px; }
        .progress-dot { width: 32px; height: 32px; border-radius: 50%; background: #ddd; display: flex; align-items: center; justify-content: center; font-size: 12px; cursor: pointer; transition: all 0.2s; }
        .progress-dot.learned { background: var(--success); color: white; }
        .progress-dot.current { background: var(--primary-blue); color: white; transform: scale(1.2); }
        .letter-display-area { margin-bottom: 30px; }
        .current-letter { font-size: 120px; font-weight: bold; color: var(--primary-pink); text-shadow: 4px 4px 0 rgba(0,0,0,0.1); margin-bottom: 10px; }
        .letter-sound { font-size: 28px; color: #888; }
        .control-buttons { display: flex; justify-content: center; align-items: center; gap: 20px; margin-bottom: 24px; }
        .control-btn { border: none; cursor: pointer; transition: transform 0.2s; }
        .control-btn:active { transform: scale(0.9); }
        .control-btn.prev, .control-btn.next { width: 60px; height: 60px; border-radius: 50%; background: white; font-size: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .control-btn.play { width: 100px; height: 100px; border-radius: 50%; background: linear-gradient(135deg, var(--primary-blue), #4080E0); box-shadow: 0 8px 30px rgba(84, 160, 255, 0.4); }
        .control-btn.play .play-icon { font-size: 40px; }
        .control-btn.play:hover { transform: scale(1.05); }
        .learning-tips { font-size: 16px; color: #888; padding: 12px 20px; background: #f5f5f5; border-radius: 12px; }
      </style>
    `;
  }

  static updateDisplay() {
    const letter = this.letters[this.currentIndex];
    document.getElementById('current-letter').textContent = letter;
    document.getElementById('letter-sound').textContent = this.getPhonetic(letter);
    document.getElementById('learned-count').textContent = this.learnedLetters.size;
    document.getElementById('prev-btn').style.opacity = this.currentIndex > 0 ? '1' : '0.3';
    document.getElementById('next-btn').style.opacity = this.currentIndex < 25 ? '1' : '0.3';

    const dotsHtml = this.letters.map((l, idx) => `
      <div class="progress-dot ${this.learnedLetters.has(l) ? 'learned' : ''} ${idx === this.currentIndex ? 'current' : ''}" data-index="${idx}" onclick="LetterCenterGame.goToLetter(${idx})">
        ${l}
      </div>
    `).join('');
    document.querySelector('.progress-indicator').innerHTML = dotsHtml;
  }

  static getPhonetic(letter) {
    const phonetics = {
      A: '/eɪ/', B: '/biː/', C: '/siː/', D: '/diː/', E: '/iː/', F: '/ɛf/',
      G: '/dʒiː/', H: '/eɪtʃ/', I: '/aɪ/', J: '/dʒeɪ/', K: '/keɪ/',
      L: '/ɛl/', M: '/ɛm/', N: '/ɛn/', O: '/oʊ/', P: '/piː/', Q: '/kjuː/',
      R: '/ɑːr/', S: '/ɛs/', T: '/tiː/', U: '/juː/', V: '/viː/',
      W: '/ˈdʌbəljuː/', X: '/ɛks/', Y: '/waɪ/', Z: '/ziː/'
    };
    return phonetics[letter] || '';
  }

  static async playSound() {
    const letter = this.letters[this.currentIndex];
    await LetterAudioManager.speakLetterName(letter);
  }

  static prevLetter() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.updateDisplay();
    }
  }

  static nextLetter() {
    if (this.currentIndex < 25) {
      this.currentIndex++;
      this.updateDisplay();
    }
  }

  static goToLetter(index) {
    this.currentIndex = index;
    this.updateDisplay();
  }

  static markAsLearned() {
    const letter = this.letters[this.currentIndex];
    this.learnedLetters.add(letter);
    AudioManager.playCorrect();
    ProgressManager.incrementWordsLearned(1);
    this.updateDisplay();

    if (this.learnedLetters.size === 26) {
      ProgressManager.addStars(5);
      showFeedback(true, '🎉 全部学完了！太棒了！');
    } else {
      showFeedback(true, `✓ ${letter} 学会了！`);
    }
    updateProgressDisplay();
  }
}
