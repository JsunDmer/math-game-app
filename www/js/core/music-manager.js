class MusicManager {
  static audio = null;
  static currentTrack = 0;
  static isPlaying = false;
  static volume = 0.5;
  static isReady = false;

  static tracks = [
    { name: 'Happy Piano', url: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3', icon: '🎹' },
    { name: 'Playful Fun', url: 'https://cdn.pixabay.com/audio/2021/09/06/audio_8c6497b51b.mp3', icon: '🎵' },
    { name: 'Kids Party', url: 'https://cdn.pixabay.com/audio/2022/10/25/audio_946bc3eb81.mp3', icon: '🎉' },
    { name: 'Sunny Day', url: 'https://cdn.pixabay.com/audio/2022/02/23/audio_0b83a75c1c.mp3', icon: '☀️' }
  ];

  static init() {
    if (this.audio) return;

    this.audio = new Audio();
    this.audio.loop = true;
    this.audio.volume = this.volume;
    this.audio.crossOrigin = 'anonymous';

    this.audio.addEventListener('error', (e) => {
      console.warn('Music error:', e);
    });

    this.audio.addEventListener('canplaythrough', () => {
      this.isReady = true;
      if (this.isPlaying) {
        this.audio.play().catch(() => {});
      }
    });

    this.loadProgress();
    this.audio.src = this.tracks[this.currentTrack].url;
  }

  static play(index = this.currentTrack) {
    if (!this.audio) this.init();

    this.currentTrack = index;
    this.audio.src = this.tracks[index].url;
    this.isPlaying = true;
    this.isReady = false;

    this.audio.load();

    const doPlay = () => {
      this.audio.play().then(() => {
        console.log('Music playing:', this.tracks[index].name);
        this.saveProgress();
      }).catch(e => {
        console.warn('Music play failed:', e);
      });
    };

    if (this.audio.readyState >= 3) {
      doPlay();
    } else {
      this.audio.addEventListener('canplay', doPlay, { once: true });
    }
  }

  static pause() {
    if (this.audio) {
      this.audio.pause();
      this.isPlaying = false;
    }
  }

  static toggle() {
    if (!this.audio) this.init();

    if (this.isPlaying) {
      this.pause();
      return false;
    } else {
      this.play();
      return true;
    }
  }

  static setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.audio) this.audio.volume = this.volume;
    this.saveProgress();
  }

  static selectTrack(index) {
    if (index < 0 || index >= this.tracks.length) return;
    if (!this.audio) this.init();

    this.currentTrack = index;
    this.audio.src = this.tracks[index].url;
    this.isReady = false;
    this.audio.load();

    if (this.isPlaying) {
      this.audio.play().catch(e => console.warn('Music play failed:', e));
    }

    this.saveProgress();
  }

  static saveProgress() {
    try {
      localStorage.setItem('music-state', JSON.stringify({
        currentTrack: this.currentTrack,
        volume: this.volume
      }));
    } catch (e) {}
  }

  static loadProgress() {
    try {
      const saved = localStorage.getItem('music-state');
      if (saved) {
        const state = JSON.parse(saved);
        this.currentTrack = state.currentTrack || 0;
        this.volume = state.volume !== undefined ? state.volume : 0.5;
      }
    } catch (e) {}
  }

  static getCurrentTrackName() {
    return this.tracks[this.currentTrack]?.name || 'Unknown';
  }
}