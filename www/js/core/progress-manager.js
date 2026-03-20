/**
 * Progress Manager - 用户进度管理
 */
class ProgressManager {
  static STORAGE_KEY = 'learning-paradise-progress';

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

  static load() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      return saved ? JSON.parse(saved) : { ...this.defaultProgress };
    } catch (e) {
      console.warn('Failed to load progress:', e);
      return { ...this.defaultProgress };
    }
  }

  static save(progress) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      console.warn('Failed to save progress:', e);
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
    return this.getSettings().soundEnabled;
  }

  static isBgMusicEnabled() {
    return this.getSettings().bgMusicEnabled;
  }

  static reset() {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

// Global function for HTML onclick
function updateProgressDisplay() {
  document.getElementById('stars-count').textContent = ProgressManager.getStars();
  document.getElementById('completed-count').textContent = ProgressManager.getCompletedGamesCount();
  document.getElementById('words-count').textContent = ProgressManager.getWordsLearned();
}
