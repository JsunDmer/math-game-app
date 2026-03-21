/**
 * Progress Manager - 用户进度管理
 * 增强错误处理，支持 localStorage 不可用的情况
 */
class ProgressManager {
  static STORAGE_KEY = 'learning-paradise-progress';
  static memoryStorage = null;
  static isLocalStorageAvailable = null;

  static defaultProgress = {
    stars: 0,
    gamesPlayed: {},
    highestScores: {},
    achievements: [],
    wordsLearned: 0,
    settings: {
      soundEnabled: true,
      bgMusicEnabled: false,
      volume: 0.8
    }
  };

  static checkLocalStorage() {
    if (this.isLocalStorageAvailable !== null) {
      return this.isLocalStorageAvailable;
    }

    try {
      const testKey = '__test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      this.isLocalStorageAvailable = true;
    } catch (e) {
      console.warn('localStorage not available, using memory storage');
      this.isLocalStorageAvailable = false;
    }

    return this.isLocalStorageAvailable;
  }

  static load() {
    try {
      if (this.checkLocalStorage()) {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        return saved ? JSON.parse(saved) : { ...this.defaultProgress };
      } else {
        return this.memoryStorage || { ...this.defaultProgress };
      }
    } catch (e) {
      console.warn('Failed to load progress:', e);
      return { ...this.defaultProgress };
    }
  }

  static save(progress) {
    try {
      if (this.checkLocalStorage()) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(progress));
      } else {
        this.memoryStorage = progress;
      }
    } catch (e) {
      console.warn('Failed to save progress:', e);
      this.memoryStorage = progress;
    }
  }

  static addStars(count) {
    const progress = this.load();
    progress.stars += count;
    this.save(progress);
    return progress.stars;
  }

  static getStars() {
    return this.load().stars;
  }

  static incrementGamePlayed(gameId) {
    const progress = this.load();
    progress.gamesPlayed[gameId] = (progress.gamesPlayed[gameId] || 0) + 1;
    this.save(progress);
    return progress.gamesPlayed[gameId];
  }

  static updateHighestScore(gameId, score) {
    const progress = this.load();
    if (!progress.highestScores[gameId] || score > progress.highestScores[gameId]) {
      progress.highestScores[gameId] = score;
      this.save(progress);
    }
    return progress.highestScores[gameId];
  }

  static getHighestScore(gameId) {
    return this.load().highestScores[gameId] || 0;
  }

  static incrementWordsLearned(count = 1) {
    const progress = this.load();
    progress.wordsLearned += count;
    this.save(progress);
    return progress.wordsLearned;
  }

  static getWordsLearned() {
    return this.load().wordsLearned;
  }

  static getCompletedGamesCount() {
    const progress = this.load();
    return Object.values(progress.gamesPlayed).filter(v => v > 0).length;
  }

  static updateSettings(settings) {
    const progress = this.load();
    progress.settings = { ...progress.settings, ...settings };
    this.save(progress);
    return progress.settings;
  }

  static getSettings() {
    return this.load().settings;
  }

  static isSoundEnabled() {
    try {
      return this.getSettings().soundEnabled;
    } catch (e) {
      return true;
    }
  }

  static isBgMusicEnabled() {
    try {
      return this.getSettings().bgMusicEnabled;
    } catch (e) {
      return false;
    }
  }

  static reset() {
    try {
      if (this.checkLocalStorage()) {
        localStorage.removeItem(this.STORAGE_KEY);
      }
      this.memoryStorage = null;
    } catch (e) {
      console.warn('Failed to reset progress:', e);
    }
  }
}

function updateProgressDisplay() {
  try {
    const starsEl = document.getElementById('stars-count');
    const completedEl = document.getElementById('completed-count');
    const wordsEl = document.getElementById('words-count');

    if (starsEl) starsEl.textContent = ProgressManager.getStars();
    if (completedEl) completedEl.textContent = ProgressManager.getCompletedGamesCount();
    if (wordsEl) wordsEl.textContent = ProgressManager.getWordsLearned();
  } catch (e) {
    console.warn('Failed to update progress display:', e);
  }
}
