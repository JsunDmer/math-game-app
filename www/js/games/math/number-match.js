/**
 * Number Match Game - 数字配对
 * 找出相同的数字
 */
class NumberMatchGame {
  static score = 0;
  static currentRound = 0;
  static totalRounds = 5;
  static numbers = [];
  static flippedCards = [];
  static matchedPairs = 0;
  static isProcessing = false;

  static render() {
    this.score = 0;
    this.currentRound = 0;
    this.matchedPairs = 0;
    this.initRound();

    return `
      <div class="top-bar" style="padding: 12px 16px; margin-bottom: 12px;">
        <button class="back-btn" onclick="showHome()" style="padding: 8px 14px; font-size: 14px;">🏠</button>
        <span class="game-title-header" style="font-size: 20px;">数字配对</span>
        <span class="stars-display">⭐ <span id="score">0</span></span>
      </div>

      <div class="match-cards-container">
        <div class="match-progress" style="font-size: 16px; color: #888; margin-bottom: 12px;">第 <span id="round-num">1</span> / ${this.totalRounds} 轮 · 配对: <span id="matched-count">0</span>/${this.numbers.length}</div>

        <div class="cards-grid" id="cards-grid">
          ${this.generateCardsHtml()}
        </div>
      </div>

      <div class="game-progress" style="padding: 0 12px; margin-top: 16px;">
        <div class="progress-bar" style="height: 10px;">
          <div class="progress-fill" id="progress-fill" style="width: 0%"></div>
        </div>
      </div>

      <style>
        .match-cards-container {
          display: flex;
          flex-direction: column;
          height: calc(100vh - 120px);
          padding: 0 8px;
        }
        .cards-grid { 
          display: grid; 
          grid-template-columns: repeat(3, 1fr); 
          gap: 5px; 
          flex: 1;
          align-content: start;
        }
        .card { 
          aspect-ratio: 1; 
          background: white; 
          border-radius: 6px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          font-size: 14px; 
          font-weight: bold; 
          cursor: pointer; 
          box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
          transition: all 0.3s; 
          border: 2px solid transparent;
          min-height: 0;
        }
        .card:active { transform: scale(0.95); }
        .card.flipped { background: var(--primary-blue); color: white; border-color: var(--primary-blue); }
        .card.matched { background: var(--success); color: white; border-color: var(--success); opacity: 0.7; pointer-events: none; }
        @media (min-width: 600px) {
          .cards-grid { grid-template-columns: repeat(4, 1fr); gap: 8px; }
          .card { font-size: 18px; }
        }
      </style>
    `;
  }

  static initRound() {
    this.numbers = [1, 2, 3, 4, 5, 6];
    this.flippedCards = [];
    this.matchedPairs = 0;
    this.isProcessing = false;
  }

  static generateCardsHtml() {
    const shuffled = [...this.numbers, ...this.numbers].sort(() => Math.random() - 0.5);
    return shuffled.map((num, idx) => `
      <div class="card" data-index="${idx}" data-number="${num}" onclick="NumberMatchGame.flipCard(${idx})">
        ?
      </div>
    `).join('');
  }

  static flipCard(index) {
    if (this.isProcessing) return;

    const cards = document.querySelectorAll('.card');
    const card = cards[index];

    if (card.classList.contains('flipped') || card.classList.contains('matched')) {
      return;
    }

    card.classList.add('flipped');
    card.textContent = card.dataset.number;
    AudioManager.playClick();

    this.flippedCards.push({ index, number: parseInt(card.dataset.number) });

    if (this.flippedCards.length === 2) {
      this.isProcessing = true;
      this.checkMatch();
    }
  }

  static checkMatch() {
    const [first, second] = this.flippedCards;
    const cards = document.querySelectorAll('.card');

    if (first.number === second.number) {
      setTimeout(() => {
        cards[first.index].classList.add('matched');
        cards[second.index].classList.add('matched');
        this.matchedPairs++;
        this.score += 10;
        AudioManager.playCorrect();
        VoiceManager.speakNumber(first.number);

        document.getElementById('score').textContent = this.score;
        document.getElementById('matched-count').textContent = this.matchedPairs;
        document.getElementById('progress-fill').style.width = (this.matchedPairs / this.numbers.length * 100) + '%';

        this.flippedCards = [];
        this.isProcessing = false;

        if (this.matchedPairs >= this.numbers.length) {
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
              document.getElementById('cards-grid').innerHTML = this.generateCardsHtml();
              document.getElementById('matched-count').textContent = 0;
            }
          }, 1000);
        }
      }, 500);
    } else {
      setTimeout(() => {
        cards[first.index].classList.remove('flipped');
        cards[second.index].classList.remove('flipped');
        cards[first.index].textContent = '?';
        cards[second.index].textContent = '?';
        AudioManager.playWrong();
        this.flippedCards = [];
        this.isProcessing = false;
      }, 1000);
    }
  }
}
