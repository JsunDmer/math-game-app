/**
 * Letter Audio Manager - 字母发音专用管理器
 * 使用 Web Speech API 并强制使用女生声音
 * 提供字母发音的标准化播放
 */
class LetterAudioManager {
  static isInitialized = false;
  static femaleVoice = null;
  static isSpeaking = false;

  // 字母发音映射（音标提示）
  static letterPhonetics = {
    'A': { sound: 'ey', ipa: '/eɪ/' },
    'B': { sound: 'bee', ipa: '/biː/' },
    'C': { sound: 'see', ipa: '/siː/' },
    'D': { sound: 'dee', ipa: '/diː/' },
    'E': { sound: 'ee', ipa: '/iː/' },
    'F': { sound: 'ef', ipa: '/ɛf/' },
    'G': { sound: 'jee', ipa: '/dʒiː/' },
    'H': { sound: 'aych', ipa: '/eɪtʃ/' },
    'I': { sound: 'eye', ipa: '/aɪ/' },
    'J': { sound: 'jay', ipa: '/dʒeɪ/' },
    'K': { sound: 'kay', ipa: '/keɪ/' },
    'L': { sound: 'el', ipa: '/ɛl/' },
    'M': { sound: 'em', ipa: '/ɛm/' },
    'N': { sound: 'en', ipa: '/ɛn/' },
    'O': { sound: 'oh', ipa: '/oʊ/' },
    'P': { sound: 'pee', ipa: '/piː/' },
    'Q': { sound: 'cue', ipa: '/kjuː/' },
    'R': { sound: 'ar', ipa: '/ɑːr/' },
    'S': { sound: 'es', ipa: '/ɛs/' },
    'T': { sound: 'tee', ipa: '/tiː/' },
    'U': { sound: 'you', ipa: '/juː/' },
    'V': { sound: 'vee', ipa: '/viː/' },
    'W': { sound: 'double you', ipa: '/ˈdʌbəljuː/' },
    'X': { sound: 'ex', ipa: '/ɛks/' },
    'Y': { sound: 'why', ipa: '/waɪ/' },
    'Z': { sound: 'zee', ipa: '/ziː/' }
  };

  static init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    if ('speechSynthesis' in window) {
      // 立即尝试选择语音
      this.selectFemaleVoice();

      // 监听语音列表变化
      speechSynthesis.onvoiceschanged = () => {
        console.log('Voices changed, reselecting...');
        this.selectFemaleVoice();
      };
    }
  }

  static selectFemaleVoice() {
    try {
      const allVoices = speechSynthesis.getVoices();
      console.log('Available voices:', allVoices.length);

      const englishVoices = allVoices.filter(v => v.lang.toLowerCase().startsWith('en'));
      console.log('English voices:', englishVoices.map(v => `${v.name} (${v.lang})`));

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
        console.log('✅ Selected standard voice:', this.femaleVoice.name, this.femaleVoice.lang, `score=${scoredEnglish[0].score}`);
        return;
      }

      this.femaleVoice = englishVoices[0] || allVoices[0] || null;
      console.log('⚠️ Using final fallback voice:', this.femaleVoice?.name || 'none');

    } catch (e) {
      console.error('Voice selection error:', e);
    }
  }

  /**
   * 播放字母发音
   * @param {string} letter - 单个字母 A-Z
   * @returns {Promise}
   */
  static async speakLetter(letter) {
    return this.speakLetterName(letter);
  }

  static async speakLetterName(letter) {
    if (!ProgressManager.isSoundEnabled()) return;

    const upperLetter = letter.toUpperCase();
    const phonetic = this.letterPhonetics[upperLetter];

    if (!phonetic) {
      console.warn('Unknown letter:', letter);
      return;
    }

    this.init();

    // 等待语音列表加载
    await this.waitForVoices();

    return this.speak(phonetic.sound);
  }

  /**
   * 播放字母音标提示
   * @param {string} letter - 单个字母 A-Z
   */
  static async speakLetterPhonetic(letter) {
    if (!ProgressManager.isSoundEnabled()) return;

    const upperLetter = letter.toUpperCase();
    const phonetic = this.letterPhonetics[upperLetter];

    if (!phonetic) return;

    this.init();
    await this.waitForVoices();

    // 播放音标读音（如 "ey" 而不是字母 "A"）
    return this.speak(phonetic.sound);
  }

  static waitForVoices(timeout = 2000) {
    return new Promise((resolve) => {
      if (speechSynthesis.getVoices().length > 0) {
        this.selectFemaleVoice();
        resolve();
        return;
      }

      const checkVoices = setInterval(() => {
        if (speechSynthesis.getVoices().length > 0) {
          clearInterval(checkVoices);
          this.selectFemaleVoice();
          resolve();
        }
      }, 100);

      setTimeout(() => {
        clearInterval(checkVoices);
        resolve();
      }, timeout);
    });
  }

  static speak(text) {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        resolve();
        return;
      }

      try {
        // 取消之前的语音
        speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        utterance.lang = this.femaleVoice?.lang || 'en-US';
        utterance.rate = 0.72;
        utterance.pitch = 1.0;

        const settings = ProgressManager.getSettings();
        utterance.volume = settings.volume !== undefined ? settings.volume : 1.0;

        // 强制使用选中的女声
        if (this.femaleVoice) {
          utterance.voice = this.femaleVoice;
          console.log('Speaking with voice:', this.femaleVoice.name);
        }

        this.isSpeaking = true;

        utterance.onend = () => {
          this.isSpeaking = false;
          resolve();
        };

        utterance.onerror = (e) => {
          this.isSpeaking = false;
          console.warn('Speech error:', e.error);
          resolve();
        };

        speechSynthesis.speak(utterance);

        // 超时保护
        setTimeout(() => {
          if (this.isSpeaking) {
            this.isSpeaking = false;
            resolve();
          }
        }, 3000);

      } catch (e) {
        this.isSpeaking = false;
        console.error('Speak error:', e);
        resolve();
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
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
  LetterAudioManager.init();
});
