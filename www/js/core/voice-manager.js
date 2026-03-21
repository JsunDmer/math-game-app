/**
 * Voice Manager - 语音播放管理
 * 多重 fallback 机制确保 Android/iOS 兼容性
 */
class VoiceManager {
  static isInitialized = false;
  static preferredVoice = null;
  static isSpeaking = false;

  static init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    if ('speechSynthesis' in window) {
      if (speechSynthesis.getVoices().length > 0) {
        this.selectBestVoice();
      }
      
      speechSynthesis.onvoiceschanged = () => {
        this.selectBestVoice();
      };
    }
  }

  static selectBestVoice() {
    try {
      const voices = speechSynthesis.getVoices();
      const englishVoices = voices.filter(v => v.lang.toLowerCase().startsWith('en'));

      const blockedPatterns = [
        'captain', 'capitano', 'capito',
        'male', 'man', 'david', 'mark', 'miguel',
        'tom', 'thomas', 'alex', 'fred', 'bruce', 'ralph',
        'espeak'
      ];

      const preferredNames = [
        'Samantha', 'Victoria', 'Karen', 'Moira', 'Tessa',
        'Google UK English Female', 'Microsoft Zira',
        'Google US English', 'English'
      ];

      const femaleIndicators = ['female', 'woman', 'samantha', 'victoria', 'karen', 'moira', 'tessa', 'zira', 'eva'];

      const scoreVoice = (v) => {
        const name = v.name.toLowerCase();
        if (blockedPatterns.some(p => name.includes(p))) return -9999;
        let score = 0;
        if (v.lang === 'en-US') score += 100;
        else if (v.lang.toLowerCase().startsWith('en-us')) score += 90;
        else if (v.lang.toLowerCase().startsWith('en')) score += 60;
        if (v.localService) score += 20;
        const pi = preferredNames.findIndex(t => name.includes(t.toLowerCase()));
        if (pi >= 0) score += 120 - pi * 2;
        if (femaleIndicators.some(p => name.includes(p))) score += 12;
        if (name.includes('google')) score += 10;
        return score;
      };

      const scored = englishVoices.map(v => ({ v, s: scoreVoice(v) })).filter(x => x.s > -9999).sort((a, b) => b.s - a.s);

      if (scored.length > 0) {
        this.preferredVoice = scored[0].v;
        console.log('Selected voice:', this.preferredVoice.name, this.preferredVoice.lang, 'score=' + scored[0].s);
        return;
      }

      this.preferredVoice = englishVoices[0] || voices[0];
      console.log('Fallback voice:', this.preferredVoice?.name || 'none');
    } catch (e) {
      console.warn('Voice selection failed:', e);
    }
  }

  static speak(text, lang = 'en-US') {
    if (!ProgressManager.isSoundEnabled()) return Promise.resolve();

    this.init();
    return this.speakWithWebSpeech(text, lang);
  }

  static speakWithWebSpeech(text, lang = 'en-US') {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        console.warn('Speech synthesis not supported');
        resolve();
        return;
      }

      try {
        speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.8;
        utterance.pitch = 1.2;
        
        const settings = ProgressManager.getSettings();
        utterance.volume = settings.volume || 0.8;

        if (this.preferredVoice) {
          utterance.voice = this.preferredVoice;
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
        
        setTimeout(() => {
          if (this.isSpeaking && !speechSynthesis.speaking) {
            this.isSpeaking = false;
            resolve();
          }
        }, 100);
      } catch (e) {
        this.isSpeaking = false;
        console.warn('Speech synthesis failed:', e);
        resolve();
      }
    });
  }

  static speakEnglish(text) {
    return this.speak(text, 'en-US');
  }

  static speakChinese(text) {
    return this.speak(text, 'zh-CN');
  }

  static speakLetter(letter) {
    return this.speakEnglish(letter.toUpperCase());
  }

  static speakWord(word) {
    return this.speakEnglish(word);
  }

  static speakNumber(num) {
    return this.speakEnglish(num.toString());
  }

  static stop() {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      this.isSpeaking = false;
    }
  }
}

function playSound(text) {
  VoiceManager.speakEnglish(text);
}

document.addEventListener('DOMContentLoaded', () => VoiceManager.init());
