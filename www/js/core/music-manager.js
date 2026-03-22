/**
 * Music Manager - 背景音乐管理
 * 优化版本：修复内存泄漏，添加音频缓存，优化事件处理
 */
class MusicManager {
  static audio = null;
  static currentTrack = 0;
  static isPlaying = false;
  static volume = 0.5;
  static isReady = false;
  static playAllMode = false;
  static eventListeners = new Map(); // 跟踪事件监听器
  static audioCache = new Map(); // 音频缓存
  static maxCacheSize = 2; // 最多缓存2首歌曲

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
    this.audio.preload = 'metadata'; // 只预加载元数据

    // 使用绑定的事件处理器，方便移除
    this._boundErrorHandler = this._handleError.bind(this);
    this._boundEndedHandler = this._handleEnded.bind(this);
    this._boundCanPlayHandler = this._handleCanPlay.bind(this);

    this.audio.addEventListener('error', this._boundErrorHandler);
    this.audio.addEventListener('ended', this._boundEndedHandler);
    this.audio.addEventListener('canplaythrough', this._boundCanPlayHandler);

    this.loadProgress();
    
    // 预加载第一首歌
    this._preloadTrack(0);
    
    console.log('[MusicManager] Initialized with cache');
  }

  static _handleError(e) {
    console.warn('Music error:', e);
    this.isReady = false;
  }

  static _handleEnded() {
    if (this.isPlaying) {
      if (this.playAllMode) {
        this.nextTrack();
      } else {
        // 单曲循环
        this.audio.currentTime = 0;
        this.audio.play().catch(e => {
          if (e.name !== 'AbortError') {
            console.warn('Music replay failed:', e);
          }
        });
      }
    }
  }

  static _handleCanPlay() {
    this.isReady = true;
  }

  // 预加载指定曲目
  static _preloadTrack(index) {
    const track = this.tracks[index];
    if (!track || this.audioCache.has(track.url)) return;

    // 如果缓存已满，移除最旧的
    if (this.audioCache.size >= this.maxCacheSize) {
      const firstKey = this.audioCache.keys().next().value;
      const oldAudio = this.audioCache.get(firstKey);
      if (oldAudio) {
        oldAudio.pause();
        oldAudio.src = '';
      }
      this.audioCache.delete(firstKey);
    }

    const preloadAudio = new Audio();
    preloadAudio.preload = 'auto';
    preloadAudio.src = track.url;
    this.audioCache.set(track.url, preloadAudio);
  }

  static play(index = this.currentTrack, playAll = false) {
    if (!this.audio) this.init();

    // 停止当前播放
    this.pause();

    this.playAllMode = playAll;
    this.currentTrack = index;
    this.isPlaying = true;
    this.isReady = false;

    const track = this.tracks[index];
    const trackUrl = track.url;

    // 检查缓存
    const cachedAudio = this.audioCache.get(trackUrl);
    if (cachedAudio && cachedAudio.readyState >= 2) {
      // 使用缓存的音频
      this.audio.src = trackUrl;
      this._tryPlay();
    } else {
      // 设置音源并等待加载
      this.audio.src = trackUrl;
      
      // 预加载下一首
      const nextIndex = (index + 1) % this.tracks.length;
      this._preloadTrack(nextIndex);
    }

    return this.isPlaying;
  }

  static _tryPlay() {
    if (!this.isPlaying) return;

    const playPromise = this.audio.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log('Music playing:', this.tracks[this.currentTrack].name);
          this.saveProgress();
        })
        .catch(e => {
          // 忽略中止错误
          if (e.name === 'AbortError' || e.message?.includes('abort')) {
            console.log('Music play aborted (normal when switching tracks)');
          } else {
            console.warn('Music play failed:', e.message || e);
          }
          // 只有在不是用户主动切换的情况下才重置状态
          if (this.isPlaying) {
            this.isPlaying = false;
          }
        });
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
      return this.play();
    }
  }

  static nextTrack() {
    if (!this.isPlaying) return;

    this.currentTrack = (this.currentTrack + 1) % this.tracks.length;
    this.play(this.currentTrack, this.playAllMode);
  }

  static prevTrack() {
    if (!this.isPlaying) return;

    this.currentTrack = (this.currentTrack - 1 + this.tracks.length) % this.tracks.length;
    this.play(this.currentTrack, this.playAllMode);
  }

  static setVolume(value) {
    this.volume = Math.max(0, Math.min(1, value));
    if (this.audio) {
      this.audio.volume = this.volume;
    }
    this.saveProgress();
  }

  static getVolume() {
    return this.volume;
  }

  static saveProgress() {
    try {
      const progress = ProgressManager.load();
      progress.settings = progress.settings || {};
      progress.settings.currentTrack = this.currentTrack;
      progress.settings.volume = this.volume;
      progress.settings.isPlaying = this.isPlaying;
      ProgressManager.save(progress);
    } catch (e) {
      console.warn('Failed to save music progress:', e);
    }
  }

  static loadProgress() {
    try {
      const progress = ProgressManager.load();
      if (progress.settings) {
        this.currentTrack = progress.settings.currentTrack || 0;
        this.volume = progress.settings.volume || 0.5;
        if (this.audio) {
          this.audio.volume = this.volume;
        }
      }
    } catch (e) {
      console.warn('Failed to load music progress:', e);
    }
  }

  // 清理资源
  static dispose() {
    this.pause();

    // 移除事件监听器
    if (this.audio) {
      this.audio.removeEventListener('error', this._boundErrorHandler);
      this.audio.removeEventListener('ended', this._boundEndedHandler);
      this.audio.removeEventListener('canplaythrough', this._boundCanPlayHandler);
      this.audio.src = '';
      this.audio = null;
    }

    // 清理缓存
    this.audioCache.forEach(audio => {
      audio.pause();
      audio.src = '';
    });
    this.audioCache.clear();

    this.isPlaying = false;
    this.isReady = false;
    
    console.log('[MusicManager] Disposed');
  }
}

// 页面卸载时清理
window.addEventListener('beforeunload', () => {
  MusicManager.dispose();
});
