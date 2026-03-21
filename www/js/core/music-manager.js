class MusicManager {
  static audio = null;
  static currentTrack = 0;
  static isPlaying = false;
  static volume = 0.5;
  static isReady = false;
  static playAllMode = false;

  static tracks = [
    { name: '欢乐旋律', url: 'audio/happy.mp3', icon: '🎵' },
    { name: '童趣时光', url: 'audio/playful.mp3', icon: '🎸' },
    { name: '儿童派对', url: 'audio/kids_party.mp3', icon: '🎉' },
    { name: '阳光日子', url: 'audio/sunny_day.mp3', icon: '☀️' }
  ];

  static init() {
    if (this.audio) return;

    this.audio = new Audio();
    this.audio.volume = this.volume;
    this.audio.crossOrigin = 'anonymous';

    this.audio.addEventListener('error', (e) => {
      console.warn('Music error:', e);
    });

    this.audio.addEventListener('ended', () => {
      if (this.isPlaying) {
        if (this.playAllMode) {
          this.nextTrack();
        } else {
          // In single track mode, loop the current track
          this.audio.currentTime = 0;
          this.audio.play().catch(e => console.warn('Music replay failed:', e));
        }
      }
    });

    this.audio.addEventListener('canplaythrough', () => {
      this.isReady = true;
    });

    this.loadProgress();
  }

  static play(index = this.currentTrack, playAll = false) {
    if (!this.audio) this.init();

    this.playAllMode = playAll;
    this.currentTrack = index;
    this.isPlaying = true;
    this.isReady = false;

    // 设置音源
    const trackUrl = this.tracks[index].url;
    
    // 如果正在加载其他音频，先暂停
    if (this.audio.src && this.audio.src !== window.location.href + trackUrl) {
      this.audio.pause();
    }
    
    this.audio.src = trackUrl;

    // 等待音频可以播放后再播放
    const tryPlay = () => {
      if (!this.isPlaying) return;
      
      const playPromise = this.audio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('Music playing:', this.tracks[index].name);
            this.saveProgress();
          })
          .catch(e => {
            // 忽略中止错误（用户快速切换导致的）
            if (e.name === 'AbortError' || e.message?.includes('abort')) {
              console.log('Music play aborted (normal when switching tracks)');
            } else {
              console.warn('Music play failed:', e.message || e);
            }
            // 只有在不是用户主动切换的情况下才重置状态
            if (this.currentTrack === index) {
              this.isPlaying = false;
            }
          });
      }
    };

    // 如果音频已经加载足够，直接播放
    if (this.audio.readyState >= 2) {
      tryPlay();
    } else {
      // 等待可以播放
      const onCanPlay = () => {
        this.audio.removeEventListener('canplay', onCanPlay);
        tryPlay();
      };
      this.audio.addEventListener('canplay', onCanPlay);
      
      // 超时处理
      setTimeout(() => {
        this.audio.removeEventListener('canplay', onCanPlay);
        if (this.isPlaying && this.audio.paused) {
          tryPlay();
        }
      }, 1000);
    }
    
    return this.isPlaying;
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
      return this.play();
    }
  }

  static nextTrack() {
    if (!this.isPlaying) return;

    this.currentTrack = (this.currentTrack + 1) % this.tracks.length;
    const trackUrl = this.tracks[this.currentTrack].url;
    
    // 暂停当前音频避免冲突
    this.audio.pause();
    this.audio.src = trackUrl;

    // 等待可以播放后再播放
    const onCanPlay = () => {
      this.audio.removeEventListener('canplay', onCanPlay);
      if (!this.isPlaying) return;
      
      this.audio.play()
        .then(() => {
          console.log('Music playing:', this.tracks[this.currentTrack].name);
          this.saveProgress();
        })
        .catch(e => {
          if (e.name !== 'AbortError') {
            console.warn('Music play failed:', e.message || e);
          }
        });
    };
    
    this.audio.addEventListener('canplay', onCanPlay);
    
    // 超时处理
    setTimeout(() => {
      this.audio.removeEventListener('canplay', onCanPlay);
    }, 1000);
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
    const trackUrl = this.tracks[index].url;
    this.isReady = false;

    if (this.isPlaying) {
      // 暂停当前音频避免冲突
      this.audio.pause();
      this.audio.src = trackUrl;
      
      // 等待可以播放后再播放
      const onCanPlay = () => {
        this.audio.removeEventListener('canplay', onCanPlay);
        if (!this.isPlaying) return;
        
        this.audio.play()
          .then(() => {
            console.log('Music playing:', this.tracks[index].name);
            this.saveProgress();
          })
          .catch(e => {
            if (e.name !== 'AbortError') {
              console.warn('Music play failed:', e.message || e);
            }
          });
      };
      
      this.audio.addEventListener('canplay', onCanPlay);
      
      // 超时处理
      setTimeout(() => {
        this.audio.removeEventListener('canplay', onCanPlay);
      }, 1000);
    } else {
      this.audio.src = trackUrl;
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