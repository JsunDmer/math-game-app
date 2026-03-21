/**
 * Letters Match Game - 字母配对游戏
 * 拖动字母到对应图片下方
 */
class LettersMatchGame {
  static currentLetter = null;
  static score = 0;
  static totalAttempts = 0;
  static matchedPairs = 0;
  static totalPairs = 4;

  static words = [
    { word: 'APPLE', letter: 'A', emoji: '🍎' },
    { word: 'BALL', letter: 'B', emoji: '⚽' },
    { word: 'CAT', letter: 'C', emoji: '🐱' },
    { word: 'DOG', letter: 'D', emoji: '🐕' },
    { word: 'EGG', letter: 'E', emoji: '🥚' },
    { word: 'FISH', letter: 'F', emoji: '🐟' }
  ];

  static render() {
    this.score = 0;
    this.matchedPairs = 0;
    this.totalAttempts = 0;

    const shuffledWords = [...this.words].sort(() => Math.random() - 0.5).slice(0, 4);
    const shuffledLetters = shuffledWords.map(w => w.letter).sort(() => Math.random() - 0.5);

    return `
      <div class="top-bar">
        <button class="back-btn" onclick="showHome()">🏠 返回</button>
        <span class="game-title-header">字母配对</span>
        <span class="stars-display">⭐ <span id="score">0</span></span>
      </div>

      <div class="game-area">
        <div class="words-container">
          ${shuffledWords.map((item, idx) => `
            <div class="word-card" data-letter="${item.letter}">
              <div class="word-emoji">${item.emoji}</div>
              <div class="word-text">${item.word}</div>
              <div class="drop-zone" data-letter="${item.letter}" ondrop="LettersMatchGame.handleDrop(event)" ondragover="LettersMatchGame.handleDragOver(event)" ondragleave="LettersMatchGame.handleDragLeave(event)"></div>
            </div>
          `).join('')}
        </div>

        <div class="letters-container" id="letters-container">
          ${shuffledLetters.map(letter => `
            <div class="letter-card" draggable="true" data-letter="${letter}" ondragstart="LettersMatchGame.handleDragStart(event)" ondragend="LettersMatchGame.handleDragEnd(event)" ontouchstart="LettersMatchGame.handleTouchStart(event)" ontouchmove="LettersMatchGame.handleTouchMove(event)" ontouchend="LettersMatchGame.handleTouchEnd(event)">
              <span class="letter-text">${letter}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="game-progress">
        <div class="progress-bar">
          <div class="progress-fill" id="progress-fill" style="width: 0%"></div>
        </div>
        <div class="progress-text">配对成功: <span id="matched-count">0</span>/${this.totalPairs}</div>
      </div>

      <style>
        .game-area { margin-bottom: 20px; }
        .words-container { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 24px; }
        .word-card { background: white; border-radius: 16px; padding: 16px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .word-emoji { font-size: 48px; margin-bottom: 8px; }
        .word-text { font-size: 20px; color: #5D4E37; margin-bottom: 12px; }
        .drop-zone { height: 60px; border: 3px dashed #ddd; border-radius: 12px; display: flex; align-items: center; justify-content: center; transition: all 0.3s; }
        .drop-zone.drag-over { border-color: var(--primary-blue); background: rgba(84, 160, 255, 0.1); }
        .drop-zone.correct { border-color: var(--success); background: rgba(77, 217, 100, 0.1); }
        .letters-container { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; padding: 16px; background: white; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .letter-card { width: 70px; height: 70px; background: linear-gradient(135deg, var(--primary-pink), #E85A8C); border-radius: 16px; display: flex; align-items: center; justify-content: center; cursor: grab; box-shadow: 0 4px 12px rgba(255, 107, 157, 0.3); transition: transform 0.2s, opacity 0.2s; }
        .letter-card:active { cursor: grabbing; }
        .letter-card.dragging { opacity: 0.5; transform: scale(1.1); }
        .letter-card.matched { opacity: 0.3; pointer-events: none; }
        .letter-text { font-size: 36px; font-weight: bold; color: white; }
        .game-progress { text-align: center; }
        .progress-text { margin-top: 8px; color: #666; }
      </style>
    `;
  }

  static handleDragStart(e) {
    e.target.classList.add('dragging');
    e.dataTransfer.setData('text/plain', e.target.dataset.letter);
  }

  static handleDragEnd(e) {
    e.target.classList.remove('dragging');
  }

  static handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  }

  static handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
  }

  static async handleDrop(e) {
    e.preventDefault();
    const dropZone = e.currentTarget;
    dropZone.classList.remove('drag-over');

    const draggedLetter = e.dataTransfer.getData('text/plain');
    const targetLetter = dropZone.dataset.letter;

    await this.checkMatch(draggedLetter, targetLetter, dropZone);
  }

  static handleTouchStart(e) {
    const touch = e.touches[0];
    const target = e.currentTarget;
    target.dataset.touchStartX = touch.clientX;
    target.dataset.touchStartY = touch.clientY;
    target.classList.add('dragging');
  }

  static handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const target = e.currentTarget;
    const dropZones = document.querySelectorAll('.drop-zone');

    dropZones.forEach(zone => {
      const rect = zone.getBoundingClientRect();
      if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
          touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
        zone.classList.add('drag-over');
      } else {
        zone.classList.remove('drag-over');
      }
    });
  }

  static async handleTouchEnd(e) {
    const target = e.currentTarget;
    target.classList.remove('dragging');

    const touch = e.changedTouches[0];
    const dropZones = document.querySelectorAll('.drop-zone');
    let matchedZone = null;

    dropZones.forEach(zone => {
      zone.classList.remove('drag-over');
      const rect = zone.getBoundingClientRect();
      if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
          touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
        matchedZone = zone;
      }
    });

    if (matchedZone) {
      const draggedLetter = target.dataset.letter;
      const targetLetter = matchedZone.dataset.letter;
      await this.checkMatch(draggedLetter, targetLetter, matchedZone);
    }
  }

  static async checkMatch(draggedLetter, targetLetter, dropZone) {
    this.totalAttempts++;

    if (draggedLetter === targetLetter) {
      dropZone.classList.add('correct');
      dropZone.innerHTML = `<span class="letter-text" style="font-size:36px;color:var(--success)">${draggedLetter}</span>`;

      const letterCard = document.querySelector(`.letter-card[data-letter="${draggedLetter}"]`);
      if (letterCard) letterCard.classList.add('matched');

      this.matchedPairs++;
      this.score += 10;

      AudioManager.playCorrect();
      await LetterAudioManager.speakLetterName(draggedLetter);

      document.getElementById('score').textContent = this.score;
      document.getElementById('matched-count').textContent = this.matchedPairs;
      document.getElementById('progress-fill').style.width = (this.matchedPairs / this.totalPairs * 100) + '%';

      if (this.matchedPairs >= this.totalPairs) {
        setTimeout(() => {
          ProgressManager.addStars(Math.max(1, 3 - Math.floor(this.totalAttempts / 10)));
          showFeedback(true, '🎉 太棒了！全部完成！');
          updateProgressDisplay();
        }, 500);
      }
    } else {
      AudioManager.playWrong();
      dropZone.style.animation = 'shake 0.5s ease';
      setTimeout(() => dropZone.style.animation = '', 500);
    }
  }
}
