// Capacitor TTS 桥接脚本
// 检测是否在Capacitor环境中
window.isCapacitor = typeof Capacitor !== 'undefined';

// TTS对象
window.AppTTS = {
  // 使用原生TTS（通过Capacitor插件）
  async speakNative(text) {
    if (!window.isCapacitor) {
      throw new Error('Not in Capacitor environment');
    }
    
    try {
      // 通过Capacitor调用原生TTS
      await Capacitor.Plugins.TextToSpeech.speak({
        text: text,
        lang: 'zh-CN',
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0
      });
      return true;
    } catch (e) {
      console.error('Native TTS error:', e);
      throw e;
    }
  },
  
  // 使用Web TTS
  speakWeb(text) {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Web Speech API not supported'));
        return;
      }
      
      try {
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        utterance.rate = 0.9;
        utterance.volume = 1;
        
        utterance.onend = () => resolve(true);
        utterance.onerror = (e) => reject(e);
        
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        reject(e);
      }
    });
  },
  
  // 智能选择TTS方式
  async speak(text) {
    // 优先尝试原生TTS
    if (window.isCapacitor) {
      try {
        await this.speakNative(text);
        console.log('Native TTS success:', text);
        return;
      } catch (e) {
        console.log('Native TTS failed, fallback to Web TTS:', e);
      }
    }
    
    // 降级到Web TTS
    try {
      await this.speakWeb(text);
      console.log('Web TTS success:', text);
    } catch (e) {
      console.error('All TTS failed:', e);
    }
  }
};

// 初始化时检测环境
console.log('Capacitor environment:', window.isCapacitor);
console.log('Capacitor plugins:', window.isCapacitor ? Object.keys(Capacitor.Plugins || {}) : 'N/A');
