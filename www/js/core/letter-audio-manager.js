/**
 * Letter Audio Manager - 字母发音专用管理器
 * 优化版本：修复移动端兼容性问题，添加音频回退机制
 */
class LetterAudioManager {
  static isInitialized = false;
  static femaleVoice = null;
  static isSpeaking = false;
  static audioContext = null;
  static useFallbackAudio = false;
  static initAttempts = 0;
  static maxInitAttempts = 3;

  // 字母发音映射（音标提示）
  static letterPhonetics = {
    'A': { sound: 'ey', ipa: '/eɪ/', phonetic: 'ei' },
    'B': { sound: 'bee', ipa: '/biː/', phonetic: 'bi' },
    'C': { sound: 'see', ipa: '/siː/', phonetic: 'si' },
    'D': { sound: 'dee', ipa: '/diː/', phonetic: 'di' },
    'E': { sound: 'ee', ipa: '/iː/', phonetic: 'i' },
    'F': { sound: 'ef', ipa: '/ɛf/', phonetic: 'ef' },
    'G': { sound: 'jee', ipa: '/dʒiː/', phonetic: 'dʒi' },
    'H': { sound: 'aych', ipa: '/eɪtʃ/', phonetic: 'eitʃ' },
    'I': { sound: 'eye', ipa: '/aɪ/', phonetic: 'ai' },
    'J': { sound: 'jay', ipa: '/dʒeɪ/', phonetic: 'dʒei' },
    'K': { sound: 'kay', ipa: '/keɪ/', phonetic: 'kei' },
    'L': { sound: 'el', ipa: '/ɛl/', phonetic: 'el' },
    'M': { sound: 'em', ipa: '/ɛm/', phonetic: 'em' },
    'N': { sound: 'en', ipa: '/ɛn/', phonetic: 'en' },
    'O': { sound: 'oh', ipa: '/oʊ/', phonetic: 'əu' },
    'P': { sound: 'pee', ipa: '/piː/', phonetic: 'pi' },
    'Q': { sound: 'cue', ipa: '/kjuː/', phonetic: 'kju' },
    'R': { sound: 'ar', ipa: '/ɑːr/', phonetic: 'ɑr' },
    'S': { sound: 'es', ipa: '/ɛs/', phonetic: 'es' },
    'T': { sound: 'tee', ipa: '/tiː/', phonetic: 'ti' },
    'U': { sound: 'you', ipa: '/juː/', phonetic: 'ju' },
    'V': { sound: 'vee', ipa: '/viː/', phonetic: 'vi' },
    'W': { sound: 'double you', ipa: '/ˈdʌbəljuː/', phonetic: 'ˈdʌblju' },
    'X': { sound: 'ex', ipa: '/ɛks/', phonetic: 'eks' },
    'Y': { sound: 'why', ipa: '/waɪ/', phonetic: 'wai' },
    'Z': { sound: 'zee', ipa: '/ziː/', phonetic: 'zi' }
  };

  static init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // 检测是否需要使用回退音频
    this.checkAudioSupport();

    if ('speechSynthesis' in window) {
      // 立即尝试选择语音
      this.selectFemaleVoice();

      // 监听语音列表变化
      speechSynthesis.onvoiceschanged = () => {
        console.log('[LetterAudioManager] Voices changed, reselecting...');
        this.selectFemaleVoice();
      };
    } else {
      console.warn('[LetterAudioManager] Web Speech API not supported');
      this.useFallbackAudio = true;
    }
  }

  static checkAudioSupport() {
    // 检测 iOS Safari 的特殊限制
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    if (isIOS && isSafari) {
      console.log('[LetterAudioManager] iOS Safari detected, enabling fallback');
      // iOS 需要用户交互后才能播放音频
      this.useFallbackAudio = false; // 先尝试 Web Speech
    }

    // 检测 Android WebView
    const isAndroidWebView = /Android.*WebView/.test(navigator.userAgent);
    if (isAndroidWebView) {
      console.log('[LetterAudioManager] Android WebView detected');
    }
  }

  static selectFemaleVoice() {
    try {
      const allVoices = speechSynthesis.getVoices();
      console.log('[LetterAudioManager] Available voices:', allVoices.length);

      if (allVoices.length === 0) {
        console.warn('[LetterAudioManager] No voices available');
        return;
      }

      const englishVoices = allVoices.filter(v => v.lang.toLowerCase().startsWith('en'));
      console.log('[LetterAudioManager] English voices:', englishVoices.map(v => `${v.name} (${v.lang})`));

      const preferredNames = [
        'Google US English',
        'Google UK English Female',
        'Samantha',
        'Victoria',
        'Karen',
        'Moira',
        'Tessa',
        'Allison',
        'Susan',
        'Katherine',
        'Vicki',
        'Veena',
        'Microsoft Eva',
        'Microsoft Zira',
        'Microsoft Catherine',
        'Microsoft Linda',
        'Microsoft Susan'
      ];

      const blockedPatterns = [
        'captain', 'capitano', 'capito',
        'male', 'man',
        'david', 'mark', 'miguel', 'tom', 'thomas', 'alex', 'fred', 'bruce', 'ralph', 'albert',
        'espeak',
        'bad', 'good'
      ];

      const femaleIndicators = ['female', 'woman', 'girl', 'samantha', 'victoria', 'karen', 'moira', 'tessa', 'susan', 'zira', 'eva'];

      const scoreVoice = (voice) => {
        const name = voice.name.toLowerCase();
        const lang = voice.lang.toLowerCase();

        if (blockedPatterns.some(pattern => name.includes(pattern))) {
          return Number.NEGATIVE_INFINITY;
        }

        let score = 0;

        if (lang === 'en-us') score += 100;
        else if (lang.startsWith('en-us')) score += 90;
        else if (lang.startsWith('en')) score += 60;

        if (voice.localService) score += 20;
        if (voice.default) score += 15;

        const preferredIndex = preferredNames.findIndex(target => {
          const search = target.toLowerCase();
          return name === search || name.endsWith(search) || name.includes(search);
        });
        if (preferredIndex >= 0) {
          score += 120 - preferredIndex * 2;
        }

        if (femaleIndicators.some(pattern => name.includes(pattern))) {
          score += 12;
        }

        if (name.includes('google')) score += 10;
        if (name.includes('premium') || name.includes('enhanced') || name.includes('neural')) score += 8;

        return score;
      };

      const scoredEnglish = englishVoices
        .map(voice => ({ voice, score: scoreVoice(voice) }))
        .filter(item => Number.isFinite(item.score))
        .sort((a, b) => b.score - a.score);

      if (scoredEnglish.length > 0) {
        this.femaleVoice = scoredEnglish[0].voice;
        console.log('[LetterAudioManager] ✅ Selected voice:', this.femaleVoice.name, this.femaleVoice.lang, `score=${scoredEnglish[0].score}`);
        return;
      }

      // 如果没有找到合适的，使用第一个英语语音
      this.femaleVoice = englishVoices[0] || allVoices[0] || null;
      console.log('[LetterAudioManager] ⚠️ Using fallback voice:', this.femaleVoice?.name || 'none');

    } catch (e) {
      console.error('[LetterAudioManager] Voice selection error:', e);
    }
  }

  /**
   * 播放字母发音 - 主入口
   * @param {string} letter - 单个字母 A-Z
   * @returns {Promise}
   */
  static async speakLetterName(letter) {
    if (!ProgressManager.isSoundEnabled()) {
      console.log('[LetterAudioManager] Sound disabled');
      return;
    }

    const upperLetter = letter.toUpperCase();
    const phonetic = this.letterPhonetics[upperLetter];

    if (!phonetic) {
      console.warn('[LetterAudioManager] Unknown letter:', letter);
      return;
    }

    this.init();

    // 等待语音列表加载
    await this.waitForVoices();

    // 尝试播放
    try {
      await this.speakWithRetry(phonetic.sound);
    } catch (e) {
      console.error('[LetterAudioManager] Failed to speak:', e);
    }
  }

  static waitForVoices(timeout = 3000) {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        resolve();
        return;
      }

      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        this.selectFemaleVoice();
        resolve();
        return;
      }

      // 等待语音列表加载
      let attempts = 0;
      const maxAttempts = 30;
      
      const checkInterval = setInterval(() => {
        attempts++;
        const voices = speechSynthesis.getVoices();
        
        if (voices.length > 0) {
          clearInterval(checkInterval);
          this.selectFemaleVoice();
          resolve();
        } else if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          console.warn('[LetterAudioManager] Timeout waiting for voices');
          resolve();
        }
      }, 100);

      // 备用：超时后无论如何都继续
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve();
      }, timeout);
    });
  }

  static async speakWithRetry(text, maxRetries = 2) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        await this.speak(text);
        return; // 成功
      } catch (e) {
        console.warn(`[LetterAudioManager] Speak attempt ${attempt + 1} failed:`, e);
        
        if (attempt < maxRetries) {
          // 等待后重试
          await this.delay(200 * (attempt + 1));
          
          // 重新初始化
          if (attempt === 1) {
            this.selectFemaleVoice();
          }
        }
      }
    }
    
    throw new Error('All speak attempts failed');
  }

  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static speak(text) {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      try {
        // 关键修复：iOS Safari 需要先取消之前的语音
        speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        // 设置语言
        utterance.lang = this.femaleVoice?.lang || 'en-US';
        
        // 调整语速和音调，使其更清晰
        utterance.rate = 0.75; // 稍微慢一点
        utterance.pitch = 1.1; // 稍微高一点

        // 获取音量设置
        const settings = ProgressManager.getSettings();
        utterance.volume = settings.volume !== undefined ? settings.volume : 1.0;

        // 强制使用选中的语音
        if (this.femaleVoice) {
          utterance.voice = this.femaleVoice;
          console.log('[LetterAudioManager] Speaking with voice:', this.femaleVoice.name);
        } else {
          console.warn('[LetterAudioManager] No voice selected, using default');
        }

        this.isSpeaking = true;

        // 设置事件处理器
        utterance.onend = () => {
          this.isSpeaking = false;
          console.log('[LetterAudioManager] Speak ended successfully');
          resolve();
        };

        utterance.onerror = (e) => {
          this.isSpeaking = false;
          console.error('[LetterAudioManager] Speech error:', e.error, e);
          
          // 某些错误可以忽略（如用户中断）
          if (e.error === 'canceled' || e.error === 'interrupted') {
            resolve();
          } else {
            reject(new Error(`Speech error: ${e.error}`));
          }
        };

        // 关键修复：iOS 需要延迟一点再播放
        setTimeout(() => {
          speechSynthesis.speak(utterance);
          
          // 关键修复：iOS Safari 需要定期调用 resume()
          if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
            const resumeInterval = setInterval(() => {
              if (!this.isSpeaking) {
                clearInterval(resumeInterval);
              } else if (speechSynthesis.paused) {
                speechSynthesis.resume();
              }
            }, 100);
            
            // 10秒后停止检查
            setTimeout(() => clearInterval(resumeInterval), 10000);
          }
        }, 50);

        // 超时保护
        setTimeout(() => {
          if (this.isSpeaking) {
            this.isSpeaking = false;
            speechSynthesis.cancel();
            console.warn('[LetterAudioManager] Speak timeout');
            reject(new Error('Speak timeout'));
          }
        }, 5000);

      } catch (e) {
        this.isSpeaking = false;
        console.error('[LetterAudioManager] Speak error:', e);
        reject(e);
      }
    });
  }

  static stop() {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      this.isSpeaking = false;
    }
  }

  static getCurrentVoice() {
    return this.femaleVoice;
  }

  static isReady() {
    return this.femaleVoice !== null;
  }

  // 测试语音功能
  static async testSpeech() {
    console.log('[LetterAudioManager] Testing speech...');
    
    const testResults = {
      speechSynthesisSupported: 'speechSynthesis' in window,
      voicesAvailable: 0,
      selectedVoice: null,
      testSpeakSuccess: false
    };

    if (!testResults.speechSynthesisSupported) {
      console.error('[LetterAudioManager] Web Speech API not supported');
      return testResults;
    }

    const voices = speechSynthesis.getVoices();
    testResults.voicesAvailable = voices.length;
    testResults.selectedVoice = this.femaleVoice?.name || null;

    console.log('[LetterAudioManager] Test results:', testResults);

    // 尝试播放测试
    try {
      await this.speakLetterName('A');
      testResults.testSpeakSuccess = true;
      console.log('[LetterAudioManager] Test speak succeeded');
    } catch (e) {
      console.error('[LetterAudioManager] Test speak failed:', e);
    }

    return testResults;
  }
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
  LetterAudioManager.init();
  
  // 延迟测试语音功能
  setTimeout(() => {
    LetterAudioManager.testSpeech();
  }, 1000);
});

// 处理用户首次交互（iOS 需要）
let audioContextUnlocked = false;
function unlockAudioContext() {
  if (audioContextUnlocked) return;
  audioContextUnlocked = true;
  
  console.log('[LetterAudioManager] User interaction detected, unlocking audio...');
  
  // 解锁 Web Speech API
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
    
    // 尝试播放一个空语音来解锁
    const unlockUtterance = new SpeechSynthesisUtterance('');
    unlockUtterance.volume = 0;
    speechSynthesis.speak(unlockUtterance);
    speechSynthesis.cancel();
  }
}

// 监听用户交互事件
document.addEventListener('click', unlockAudioContext, { once: true });
document.addEventListener('touchstart', unlockAudioContext, { once: true });
document.addEventListener('keydown', unlockAudioContext, { once: true });
