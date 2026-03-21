/**
 * Voice Manager - 语音播放管理
 * 多重 fallback 机制确保 Android/iOS 兼容性
 */
class VoiceManager {
  static isInitialized = false;
  static preferredVoice = null;

  static init() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    if ('speechSynthesis' in window) {
      speechSynthesis.onvoiceschanged = () => {
        this.selectBestVoice();
      };
      this.selectBestVoice();
    }
  }

  static selectBestVoice() {
    const voices = speechSynthesis.getVoices();
    const englishVoices = voices.filter(v => v.lang.includes('en'));

    const preferredNames = [
      'Samantha', 'Victoria', 'Karen', 'Moira', 'Tessa',
      'Google UK English Female', 'Microsoft Zira',
      'Female', 'Woman'
    ];

    for (const name of preferredNames) {
      const found = englishVoices.find(v => v.name.includes(name));
      if (found) {
        this.preferredVoice = found;
        return;
      }
    }

    this.preferredVoice = englishVoices[0] || voices.find(v => v.lang.includes('en')) || voices[0];
  }

  static speak(text, lang = 'en-US') {
    if (!ProgressManager.isSoundEnabled()) return;

    this.init();

    this.speakWithWebSpeech(text, lang);
  }

  static speakWithWebSpeech(text, lang = 'en-US') {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      return;
    }

    try {
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.8;
      utterance.pitch = 1.2;
      utterance.volume = ProgressManager.getSettings().volume || 0.8;

      if (this.preferredVoice) {
        utterance.voice = this.preferredVoice;
      }

      utterance.onerror = (e) => {
        console.warn('Speech error:', e.error);
      };

      speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis failed:', e);
    }
  }

  static speakEnglish(text) {
    this.speak(text, 'en-US');
  }

  static speakChinese(text) {
    this.speak(text, 'zh-CN');
  }

  static speakLetter(letter) {
    this.speakEnglish(letter);
  }

  static speakWord(word) {
    this.speakEnglish(word);
  }

  static speakNumber(num) {
    this.speakChinese(num.toString());
  }
}

function playSound(text) {
  VoiceManager.speakEnglish(text);
}

document.addEventListener('DOMContentLoaded', () => VoiceManager.init());
