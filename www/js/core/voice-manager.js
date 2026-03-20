/**
 * Voice Manager - 语音播放管理
 * 使用 Google Translate TTS + Web Speech API 双保险
 */
class VoiceManager {
  static useGoogleTTS = true;

  static speak(text, lang = 'en-US') {
    if (!ProgressManager.isSoundEnabled()) return;

    if (this.useGoogleTTS) {
      this.speakWithGoogle(text).catch(() => {
        this.speakWithWebSpeech(text, lang);
      });
    } else {
      this.speakWithWebSpeech(text, lang);
    }
  }

  static speakWithGoogle(text) {
    return new Promise((resolve, reject) => {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=en&client=tw-ob`;
      const audio = new Audio();
      audio.src = url;
      audio.playbackRate = 0.85;
      audio.volume = ProgressManager.getSettings().volume;

      audio.oncanplaythrough = () => {
        audio.play().then(resolve).catch(reject);
      };

      audio.onerror = reject;

      setTimeout(() => reject(new Error('TTS timeout')), 5000);
    });
  }

  static speakWithWebSpeech(text, lang = 'en-US') {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.8;
      utterance.pitch = 1.2;
      utterance.volume = ProgressManager.getSettings().volume;

      const voices = speechSynthesis.getVoices();
      const femaleVoice = voices.find(v =>
        v.lang.includes('en') &&
        (v.name.includes('Samantha') || v.name.includes('Victoria') ||
         v.name.includes('Female') || v.name.includes('Karen'))
      );
      if (femaleVoice) utterance.voice = femaleVoice;

      speechSynthesis.speak(utterance);
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
}

// Global function
function playSound(text) {
  VoiceManager.speakEnglish(text);
}
