/**
 * Audio Manager - 音效和背景音乐管理
 * 使用 Web Audio API 生成简单音效
 */
class AudioManager {
  static audioContext = null;
  static bgMusicGain = null;
  static sfxGain = null;

  static init() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.bgMusicGain = this.audioContext.createGain();
      this.sfxGain = this.audioContext.createGain();
      this.bgMusicGain.connect(this.audioContext.destination);
      this.sfxGain.connect(this.audioContext.destination);
      this.bgMusicGain.gain.value = 0.3;
      this.sfxGain.gain.value = 0.5;
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
    }
  }

  static playTone(frequency, duration, type = 'sine') {
    if (!this.audioContext) this.init();
    if (!this.audioContext || !ProgressManager.isSoundEnabled()) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.sfxGain);

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  static playCorrect() {
    this.playTone(523, 0.1, 'sine');
    setTimeout(() => this.playTone(659, 0.1, 'sine'), 100);
    setTimeout(() => this.playTone(784, 0.15, 'sine'), 200);
  }

  static playWrong() {
    this.playTone(200, 0.2, 'square');
    setTimeout(() => this.playTone(180, 0.3, 'square'), 150);
  }

  static playClick() {
    this.playTone(440, 0.05, 'sine');
  }

  static playStar() {
    this.playTone(880, 0.1, 'sine');
    setTimeout(() => this.playTone(1100, 0.1, 'sine'), 80);
    setTimeout(() => this.playTone(1320, 0.15, 'sine'), 160);
  }

  static playBackground() {
    if (!this.audioContext || !ProgressManager.isBgMusicEnabled()) return;

    // Simple ambient melody
    const notes = [262, 294, 330, 349, 392, 349, 330, 294];
    let index = 0;

    const playNext = () => {
      if (!ProgressManager.isBgMusicEnabled()) return;

      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      osc.connect(gain);
      gain.connect(this.bgMusicGain);
      osc.type = 'sine';
      osc.frequency.value = notes[index];
      gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.8);
      osc.start();
      osc.stop(this.audioContext.currentTime + 0.8);

      index = (index + 1) % notes.length;
      setTimeout(playNext, 1000);
    };

    playNext();
  }
}

// Initialize on first interaction
document.addEventListener('click', () => AudioManager.init(), { once: true });
