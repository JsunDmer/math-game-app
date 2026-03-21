/**
 * Audio Manager - 音效和背景音乐管理
 * 使用 Web Audio API 生成简单音效
 * 支持 Android WebView 和 iOS Safari
 */
class AudioManager {
  static audioContext = null;
  static bgMusicGain = null;
  static sfxGain = null;
  static isInitialized = false;
  static bgMusicInterval = null;

  static init() {
    if (this.isInitialized) return;

    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      this.bgMusicGain = this.audioContext.createGain();
      this.sfxGain = this.audioContext.createGain();

      this.bgMusicGain.connect(this.audioContext.destination);
      this.sfxGain.connect(this.audioContext.destination);

      this.bgMusicGain.gain.value = 0.3;
      this.sfxGain.gain.value = 0.5;

      this.isInitialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
    }
  }

  static ensureContext() {
    if (!this.isInitialized) {
      this.init();
    }

    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  static playTone(frequency, duration, type = 'sine') {
    this.ensureContext();

    if (!this.audioContext || !ProgressManager.isSoundEnabled()) return;

    try {
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
    } catch (e) {
      console.warn('Failed to play tone:', e);
    }
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
    if (!ProgressManager.isBgMusicEnabled()) return;

    this.ensureContext();

    if (!this.audioContext) return;

    if (this.bgMusicInterval) {
      clearInterval(this.bgMusicInterval);
    }

    const notes = [262, 294, 330, 349, 392, 349, 330, 294];
    let index = 0;

    const playNext = () => {
      if (!ProgressManager.isBgMusicEnabled() || !this.audioContext) {
        clearInterval(this.bgMusicInterval);
        return;
      }

      try {
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
      } catch (e) {
        console.warn('Background music error:', e);
      }
    };

    playNext();
    this.bgMusicInterval = setInterval(playNext, 1000);
  }

  static stopBackground() {
    if (this.bgMusicInterval) {
      clearInterval(this.bgMusicInterval);
      this.bgMusicInterval = null;
    }
  }
}

function initAudioOnInteraction() {
  AudioManager.init();
}

document.addEventListener('click', initAudioOnInteraction, { once: true });
document.addEventListener('touchstart', initAudioOnInteraction, { once: true });
document.addEventListener('touchend', initAudioOnInteraction, { once: true });
