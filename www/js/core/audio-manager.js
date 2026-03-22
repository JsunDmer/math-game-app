/**
 * Audio Manager - 音效和背景音乐管理
 * 优化版本：修复内存泄漏，使用节点池，添加性能监控
 */
class AudioManager {
  static audioContext = null;
  static bgMusicGain = null;
  static sfxGain = null;
  static isInitialized = false;
  static bgMusicInterval = null;
  static activeNodes = new Set(); // 跟踪活动节点
  static nodePool = []; // 节点池
  static maxPoolSize = 20;
  
  // 性能监控
  static stats = {
    nodesCreated: 0,
    nodesReused: 0,
    nodesReleased: 0
  };

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
      console.log('[AudioManager] Initialized with node pool');
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

  // 从池中获取节点
  static getNodesFromPool() {
    if (this.nodePool.length > 0) {
      const nodes = this.nodePool.pop();
      this.stats.nodesReused++;
      return nodes;
    }
    this.stats.nodesCreated++;
    return null;
  }

  // 归还节点到池
  static returnNodesToPool(oscillator, gainNode) {
    if (this.nodePool.length >= this.maxPoolSize) {
      // 池已满，彻底释放
      oscillator.disconnect();
      gainNode.disconnect();
      this.stats.nodesReleased++;
      return;
    }
    
    try {
      oscillator.disconnect();
      gainNode.disconnect();
      this.nodePool.push({ oscillator, gainNode });
    } catch (e) {
      console.warn('[AudioManager] Failed to return nodes to pool:', e);
    }
  }

  static playTone(frequency, duration, type = 'sine') {
    this.ensureContext();

    if (!this.audioContext || !ProgressManager.isSoundEnabled()) return;

    try {
      let oscillator, gainNode;
      
      // 尝试从池中获取
      const pooled = this.getNodesFromPool();
      if (pooled) {
        oscillator = pooled.oscillator;
        gainNode = pooled.gainNode;
      } else {
        oscillator = this.audioContext.createOscillator();
        gainNode = this.audioContext.createGain();
      }

      // 重新连接
      oscillator.connect(gainNode);
      gainNode.connect(this.sfxGain);

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

      // 跟踪活动节点
      const nodeId = Date.now() + Math.random();
      this.activeNodes.add(nodeId);

      oscillator.onended = () => {
        this.activeNodes.delete(nodeId);
        this.returnNodesToPool(oscillator, gainNode);
      };

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);

    } catch (e) {
      console.warn('Failed to play tone:', e);
    }
  }

  static playCorrect() {
    // 使用 setTimeout 但确保不会累积
    this.playTone(523, 0.1, 'sine');
    setTimeout(() => {
      if (ProgressManager.isSoundEnabled()) {
        this.playTone(659, 0.1, 'sine');
      }
    }, 100);
    setTimeout(() => {
      if (ProgressManager.isSoundEnabled()) {
        this.playTone(784, 0.15, 'sine');
      }
    }, 200);
  }

  static playWrong() {
    this.playTone(200, 0.2, 'square');
    setTimeout(() => {
      if (ProgressManager.isSoundEnabled()) {
        this.playTone(180, 0.3, 'square');
      }
    }, 150);
  }

  static playClick() {
    this.playTone(440, 0.05, 'sine');
  }

  static playStar() {
    this.playTone(880, 0.1, 'sine');
    setTimeout(() => {
      if (ProgressManager.isSoundEnabled()) {
        this.playTone(1100, 0.1, 'sine');
      }
    }, 80);
    setTimeout(() => {
      if (ProgressManager.isSoundEnabled()) {
        this.playTone(1320, 0.15, 'sine');
      }
    }, 160);
  }

  static playBackground() {
    if (!ProgressManager.isBgMusicEnabled()) return;

    this.ensureContext();

    if (!this.audioContext) return;

    // 关键修复：确保清理旧的定时器
    this.stopBackground();

    const notes = [262, 294, 330, 349, 392, 349, 330, 294];
    let index = 0;
    let isRunning = true;

    const playNext = () => {
      if (!isRunning || !ProgressManager.isBgMusicEnabled() || !this.audioContext) {
        return;
      }

      try {
        // 使用节点池
        let osc, gain;
        const pooled = this.getNodesFromPool();
        if (pooled) {
          osc = pooled.oscillator;
          gain = pooled.gainNode;
        } else {
          osc = this.audioContext.createOscillator();
          gain = this.audioContext.createGain();
        }

        osc.connect(gain);
        gain.connect(this.bgMusicGain);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(notes[index], this.audioContext.currentTime);

        gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.8);

        const nodeId = Date.now() + Math.random();
        this.activeNodes.add(nodeId);

        osc.onended = () => {
          this.activeNodes.delete(nodeId);
          this.returnNodesToPool(osc, gain);
        };

        osc.start();
        osc.stop(this.audioContext.currentTime + 0.8);

        index = (index + 1) % notes.length;
      } catch (e) {
        console.warn('Background music error:', e);
      }
    };

    playNext();
    this.bgMusicInterval = setInterval(playNext, 1000);
    
    // 存储停止函数
    this._stopBackgroundMusic = () => {
      isRunning = false;
    };
  }

  static stopBackground() {
    if (this.bgMusicInterval) {
      clearInterval(this.bgMusicInterval);
      this.bgMusicInterval = null;
    }
    if (this._stopBackgroundMusic) {
      this._stopBackgroundMusic();
      this._stopBackgroundMusic = null;
    }
  }

  // 清理所有资源
  static dispose() {
    this.stopBackground();
    
    // 清理节点池
    this.nodePool.forEach(({ oscillator, gainNode }) => {
      try {
        oscillator.disconnect();
        gainNode.disconnect();
      } catch (e) {}
    });
    this.nodePool = [];
    
    // 关闭 AudioContext
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.isInitialized = false;
    console.log('[AudioManager] Disposed, stats:', this.stats);
  }

  // 获取性能统计
  static getStats() {
    return {
      ...this.stats,
      poolSize: this.nodePool.length,
      activeNodes: this.activeNodes.size
    };
  }
}

function initAudioOnInteraction() {
  AudioManager.init();
}

// 页面卸载时清理
window.addEventListener('beforeunload', () => {
  AudioManager.dispose();
});

// 定期清理（每5分钟）
setInterval(() => {
  if (AudioManager.nodePool.length > 10) {
    console.log('[AudioManager] Cleaning up node pool:', AudioManager.getStats());
    // 保留一半节点
    const toRemove = Math.floor(AudioManager.nodePool.length / 2);
    for (let i = 0; i < toRemove; i++) {
      const nodes = AudioManager.nodePool.pop();
      if (nodes) {
        try {
          nodes.oscillator.disconnect();
          nodes.gainNode.disconnect();
        } catch (e) {}
      }
    }
  }
}, 300000);
