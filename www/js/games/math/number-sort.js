/**
 * Number Sort Game - 数字排序
 * 将打乱的数字按从小到大的顺序排列
 */
class NumberSortGame {
  static score = 0;
  static currentRound = 0;
  static totalRounds = 5;
  static numbers = [];
  static userSequence = [];
  static availableNumbers = [];

  static render() {
    this.score = 0;
    this.currentRound = 0;
    this.initRound();

    return `
      <div class="top-bar">
        <button class="back-btn" onclick="showHome()">🏠 返回</button>
        <span class="game-title-header">数字排序</span>
        <span class="stars-display">⭐ <span id="score">0</span></span>
      </div>

      <div class="game-area">
        <div class="round-info">第 <span id="round-num">1</span> / ${this.totalRounds} 轮</div>
        <div class="sort-hint">从小到大排列数字</div>

        <div class="target-hint" id="target-hint">
          正确答案: ${this.numbers.join(' < ')}
        </div>

        <div class="answer-area">
          <div class="answer-slots" id="answer-slots">
            ${this.userSequence.map((num, idx) => `
              <div class="number-slot ${num !== null ? 'filled' : ''}" data-index="${idx}" onclick="NumberSortGame.removeNumber(${idx})">
                ${num !== null ? num : '?'}
              </div>
            `).join('')}
          </div>
        </div>

        <div class="available-numbers" id="available-numbers">
          ${this.availableNumbers.map((num, idx) => `
            <button class="number-btn ${num.used ? 'used' : ''}" data-index="${idx}" onclick="NumberSortGame.selectNumber(${idx})" ${num.used ? 'disabled' : ''}>
              ${num.value}
            </button>
          `).join('')}
        </div>

        <button class="btn btn-success mt-md" onclick="NumberSortGame.checkOrder()" style="width: 100%; max-width: 300px;">
          ✓ 检查答案
        </button>
      </div>

      <style>
        .game-area { text-align: center; padding: 8px 0; }
        .round-info { font-size: 16px; color: #666; margin-bottom: 8px; }
        .sort-hint { font-size: 16px; color: var(--primary-blue); margin-bottom: 8px; font-weight: bold; }
        .target-hint { font-size: 12px; color: #888; background: #f5f5f5; padding: 6px 12px; border-radius: 8px; margin-bottom: 12px; display: inline-block; }
        .answer-area { margin-bottom: 12px; }
        .answer-slots { display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; }
        .number-slot { width: 60px; height: 60px; border: 2px solid var(--primary-green); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: bold; background: rgba(78, 205, 196, 0.1); cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(78, 205, 196, 0.2); }
        .number-slot.filled { background: white; border-color: var(--primary-green); box-shadow: 0 4px 12px rgba(78, 205, 196, 0.3); }
        .number-slot:active { transform: scale(0.95); }
        .available-numbers { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; margin-top: 12px; padding: 12px; background: rgba(255, 159, 67, 0.1); border-radius: 16px; }
        .number-btn { width: 60px; height: 60px; font-size: 28px; font-family: 'ZCOOL KuaiLe', sans-serif; background: linear-gradient(135deg, var(--primary-orange), #E88A30); color: white; border: none; border-radius: 12px; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(255, 159, 67, 0.3); }
        .number-btn:active { transform: scale(0.95); }
        .number-btn.used { opacity: 0.3; pointer-events: none; }
      </style>
    `;
  }

  static initRound() {
    const startNum = Math.floor(Math.random() * 10) + 1;
    const count = 4;
    this.numbers = Array.from({ length: count }, (_, i) => startNum + i);
    this.availableNumbers = [...this.numbers].sort(() => Math.random() - 0.5).map(value => ({ value, used: false }));
    this.userSequence = new Array(count).fill(null);
  }

  static selectNumber(index) {
    if (this.availableNumbers[index].used) return;

    const emptyIndex = this.userSequence.findIndex(s => s === null);
    if (emptyIndex !== -1) {
      this.availableNumbers[index].used = true;
      this.userSequence[emptyIndex] = this.availableNumbers[index].value;
      this.updateDisplay();
    }
  }

  static removeNumber(index) {
    if (this.userSequence[index] === null) return;

    const value = this.userSequence[index];
    const numIndex = this.availableNumbers.findIndex(n => n.value === value && n.used);
    if (numIndex !== -1) {
      this.availableNumbers[numIndex].used = false;
    }
    this.userSequence[index] = null;
    this.updateDisplay();
  }

  static updateDisplay() {
    const slotsHtml = this.userSequence.map((num, idx) => `
      <div class="number-slot ${num !== null ? 'filled' : ''}" data-index="${idx}" onclick="NumberSortGame.removeNumber(${idx})">
        ${num !== null ? num : '?'}
      </div>
    `).join('');
    document.getElementById('answer-slots').innerHTML = slotsHtml;

    const availableHtml = this.availableNumbers.map((num, idx) => `
      <button class="number-btn ${num.used ? 'used' : ''}" data-index="${idx}" onclick="NumberSortGame.selectNumber(${idx})" ${num.used ? 'disabled' : ''}>
        ${num.value}
      </button>
    `).join('');
    document.getElementById('available-numbers').innerHTML = availableHtml;
  }

  static checkOrder() {
    const isCorrect = this.userSequence.every((num, idx) => num === this.numbers[idx]);

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
        document.getElementById('round-num').textContent = this.currentRound + 1;
        this.initRound();
        document.getElementById('target-hint').innerHTML = `正确答案: ${this.numbers.join(' < ')}`;
        this.updateDisplay();
      }
    }, 1500);
  }
}
