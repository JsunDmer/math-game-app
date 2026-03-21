/**
 * Listen Identify Game - 听音识字母
 * 播放字母发音，点击正确的字母
 */
class ListenIdentifyGame {
  static score = 0;
  static currentRound = 0;
  static totalRounds = 10;
  static currentLetter = null;
  static isPlaying = false;
  static letterPool = [];

  static render() {
    this.score = 0;
    this.currentRound = 0;
    this.letterPool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    return `
      <div class="top-bar">
        <button class="back-btn" onclick="showHome()">🏠 返回</button>
        <span class="game-title-header">听音识字母</span>
        <span class="stars-display">⭐ <span id="score">0</span></span>
      </div>

      <div class="game-area">
        <div class="round-info">第 <span id="round-num">1</span> / ${this.totalRounds} 轮</div>

        <div class="listen-area" id="listen-area">
          <button class="play-btn" id="play-btn" onclick="ListenIdentifyGame.playSound()">
            <span class="play-icon">🔊</span>
            <span class="play-text">点击播放</span>
          </button>
          <div class="listen-hint" id="listen-hint">等待小朋友点击播放按钮</div>
        </div>

        <div class="letters-grid" id="letters-grid">
          ${this.generateLetterOptions()}
        </div>
      </div>

      <div class="game-progress">
        <div class="progress-bar">
          <div class="progress-fill" id="progress-fill" style="width: 0%"></div>
        </div>
      </div>

      <style>
        .game-area { text-align: center; padding: 20px 0; }
        .round-info { font-size: 18px; color: #666; margin-bottom: 20px; }
        .listen-area { margin-bottom: 30px; }
        .play-btn { width: 180px; height: 180px; border-radius: 50%; background: linear-gradient(135deg, var(--primary-blue), #4080E0); border: none; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 8px 30px rgba(84, 160, 255, 0.4); transition: transform 0.2s; }
        .play-btn:active { transform: scale(0.95); }
        .play-btn.playing { animation: pulse 1s infinite; }
        .play-icon { font-size: 64px; }
        .play-text { font-size: 18px; color: white; margin-top: 8px; }
        .listen-hint { margin-top: 16px; font-size: 16px; color: #888; min-height: 24px; }
        .letters-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; padding: 0 10px; }
        .letter-btn { height: 60px; font-size: 28px; font-family: 'ZCOOL KuaiLe', sans-serif; background: white; border: 3px solid #ddd; border-radius: 12px; cursor: pointer; transition: all 0.2s; }
        .letter-btn:active { transform: scale(0.9); }
        .letter-btn.correct { background: var(--success); color: white; border-color: var(--success); }
        .letter-btn.wrong { background: var(--error); color: white; border-color: var(--error); }
        .letter-btn:disabled { pointer-events: none; opacity: 0.5; }
        .letter-btn.highlight { border-color: var(--primary-yellow); background: rgba(255, 230, 109, 0.2); }
      </style>
    `;
  }

  static generateLetterOptions() {
    const shuffled = [...this.letterPool].sort(() => Math.random() - 0.5);
    this.currentLetter = shuffled[0];
    const options = [this.currentLetter, ...shuffled.slice(1, 7)].sort(() => Math.random() - 0.5);

    return options.map(letter => `
      <button class="letter-btn" data-letter="${letter}" onclick="ListenIdentifyGame.checkAnswer('${letter}', this)">
        ${letter}
      </button>
    `).join('');
  }

  static async playSound() {
    if (this.isPlaying) return;
    this.isPlaying = true;

    const btn = document.getElementById('play-btn');
    const hint = document.getElementById('listen-hint');

    btn.classList.add('playing');
    hint.textContent = '播放中...';

    await LetterAudioManager.speakLetterName(this.currentLetter);

    setTimeout(() => {
      btn.classList.remove('playing');
      hint.textContent = '请选择刚才听到的字母';
      this.isPlaying = false;
    }, 1500);
  }

  static checkAnswer(letter, btn) {
    const buttons = document.querySelectorAll('.letter-btn');
    buttons.forEach(b => b.disabled = true);

    if (letter === this.currentLetter) {
      btn.classList.add('correct');
      this.score += 10;
      AudioManager.playCorrect();
    } else {
      btn.classList.add('wrong');
      AudioManager.playWrong();
      buttons.forEach(b => {
        if (b.dataset.letter === this.currentLetter) {
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
    }, 2000);
  }

  static nextRound() {
    this.currentRound++;
    document.getElementById('round-num').textContent = this.currentRound + 1;
    document.getElementById('letters-grid').innerHTML = this.generateLetterOptions();
    document.getElementById('listen-hint').textContent = '等待小朋友点击播放按钮';
  }

  static endGame() {
    const stars = Math.ceil(this.score / 30);
    ProgressManager.addStars(stars);
    showFeedback(true, `🎉 完成！得分: ${this.score}`);
    updateProgressDisplay();
  }
}
