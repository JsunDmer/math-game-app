// Capacitor TTS 桥接脚本

// 调试日志显示在APP中
function showDebugLog(message) {
  console.log(message);
  
  // 在页面底部显示调试信息
  let debugDiv = document.getElementById('debug-log');
  if (!debugDiv) {
    debugDiv = document.createElement('div');
    debugDiv.id = 'debug-log';
    debugDiv.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:rgba(0,0,0,0.8);color:#0f0;padding:10px;font-size:12px;max-height:150px;overflow-y:auto;z-index:9999;font-family:monospace;';
    document.body.appendChild(debugDiv);
  }
  
  const time = new Date().toLocaleTimeString();
  debugDiv.innerHTML += `<div>[${time}] ${message}</div>`;
  debugDiv.scrollTop = debugDiv.scrollHeight;
}

// 检测是否在Capacitor环境中
window.isCapacitor = typeof Capacitor !== 'undefined';

showDebugLog('=== TTS初始化开始 ===');
showDebugLog('Capacitor环境: ' + window.isCapacitor);

// 检测可用的插件
if (window.isCapacitor) {
  showDebugLog('Capacitor版本: ' + (Capacitor.getPlatform ? Capacitor.getPlatform() : 'unknown'));
  const plugins = Capacitor.Plugins ? Object.keys(Capacitor.Plugins) : [];
  showDebugLog('可用插件: ' + plugins.join(', '));
  showDebugLog('TextToSpeech插件: ' + (Capacitor.Plugins.TextToSpeech ? '存在' : '不存在'));
}

// TTS对象
window.AppTTS = {
  // 使用原生TTS（通过Capacitor插件）
  async speakNative(text) {
    showDebugLog('尝试原生TTS: ' + text);
    
    if (!window.isCapacitor) {
      throw new Error('Not in Capacitor environment');
    }
    
    if (!Capacitor.Plugins.TextToSpeech) {
      throw new Error('TextToSpeech plugin not available');
    }
    
    try {
      await Capacitor.Plugins.TextToSpeech.speak({
        text: text,
        lang: 'zh-CN',
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0
      });
      showDebugLog('✓ 原生TTS成功');
      return true;
    } catch (e) {
      showDebugLog('✗ 原生TTS失败: ' + e.message);
      throw e;
    }
  },
  
  // 使用Web TTS
  speakWeb(text) {
    showDebugLog('尝试Web TTS: ' + text);
    
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
        
        utterance.onstart = () => showDebugLog('Web TTS开始播放');
        utterance.onend = () => {
          showDebugLog('✓ Web TTS完成');
          resolve(true);
        };
        utterance.onerror = (e) => {
          showDebugLog('✗ Web TTS错误: ' + e.error);
          reject(e);
        };
        
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        showDebugLog('✗ Web TTS异常: ' + e.message);
        reject(e);
      }
    });
  },
  
  // 智能选择TTS方式
  async speak(text) {
    showDebugLog('=== 开始语音: ' + text + ' ===');
    
    // 优先尝试原生TTS
    if (window.isCapacitor && Capacitor.Plugins.TextToSpeech) {
      try {
        await this.speakNative(text);
        return;
      } catch (e) {
        showDebugLog('原生TTS失败，尝试Web TTS');
      }
    }
    
    // 降级到Web TTS
    try {
      await this.speakWeb(text);
    } catch (e) {
      showDebugLog('所有TTS方式都失败');
    }
  }
};

showDebugLog('=== TTS初始化完成 ===');
