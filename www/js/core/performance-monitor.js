/**
 * Performance Monitor - 性能监控工具
 * 用于监控内存使用、CPU占用、帧率等指标
 */
class PerformanceMonitor {
  static isMonitoring = false;
  static metrics = {
    memory: [],
    fps: [],
    longTasks: [],
    errors: []
  };
  static callbacks = [];
  static observers = [];

  // 开始监控
  static start() {
    if (this.isMonitoring) return;
    this.isMonitoring = true;
    
    console.log('[PerformanceMonitor] Started monitoring');
    
    // 监控内存
    this._startMemoryMonitoring();
    
    // 监控帧率
    this._startFPSMonitoring();
    
    // 监控长任务
    this._startLongTaskMonitoring();
    
    // 监控错误
    this._startErrorMonitoring();
    
    // 定期报告
    this._startReporting();
  }

  // 停止监控
  static stop() {
    this.isMonitoring = false;
    
    // 断开所有观察者
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    
    console.log('[PerformanceMonitor] Stopped monitoring');
    console.log('[PerformanceMonitor] Final metrics:', this.getSummary());
  }

  // 内存监控
  static _startMemoryMonitoring() {
    const sampleMemory = () => {
      if (!this.isMonitoring) return;
      
      if (performance.memory) {
        const data = {
          timestamp: Date.now(),
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
        };
        this.metrics.memory.push(data);
        
        // 只保留最近100个样本
        if (this.metrics.memory.length > 100) {
          this.metrics.memory.shift();
        }
      }
      
      setTimeout(sampleMemory, 5000); // 每5秒采样一次
    };
    
    sampleMemory();
  }

  // FPS监控
  static _startFPSMonitoring() {
    let lastTime = performance.now();
    let frames = 0;
    
    const measureFPS = () => {
      if (!this.isMonitoring) return;
      
      frames++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frames * 1000) / (currentTime - lastTime));
        this.metrics.fps.push({
          timestamp: Date.now(),
          fps: fps
        });
        
        // 只保留最近60个样本
        if (this.metrics.fps.length > 60) {
          this.metrics.fps.shift();
        }
        
        frames = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    requestAnimationFrame(measureFPS);
  }

  // 长任务监控
  static _startLongTaskMonitoring() {
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) { // 超过50ms的任务
              this.metrics.longTasks.push({
                timestamp: Date.now(),
                duration: entry.duration,
                startTime: entry.startTime
              });
              
              console.warn(`[PerformanceMonitor] Long task detected: ${entry.duration.toFixed(2)}ms`);
            }
          }
        });
        
        observer.observe({ entryTypes: ['longtask'] });
        this.observers.push(observer);
      } catch (e) {
        console.warn('[PerformanceMonitor] Long task monitoring not supported');
      }
    }
  }

  // 错误监控
  static _startErrorMonitoring() {
    this._errorHandler = (event) => {
      this.metrics.errors.push({
        timestamp: Date.now(),
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.stack
      });
    };
    
    window.addEventListener('error', this._errorHandler);
  }

  // 定期报告
  static _startReporting() {
    const report = () => {
      if (!this.isMonitoring) return;
      
      const summary = this.getSummary();
      
      // 检查性能问题
      if (summary.avgFPS < 30) {
        console.warn('[PerformanceMonitor] Low FPS detected:', summary.avgFPS);
      }
      
      if (summary.memoryGrowth > 50 * 1024 * 1024) { // 超过50MB增长
        console.warn('[PerformanceMonitor] High memory growth detected:', 
          (summary.memoryGrowth / 1024 / 1024).toFixed(2) + 'MB');
      }
      
      // 触发回调
      this.callbacks.forEach(cb => {
        try {
          cb(summary);
        } catch (e) {
          console.error('[PerformanceMonitor] Callback error:', e);
        }
      });
      
      setTimeout(report, 30000); // 每30秒报告一次
    };
    
    setTimeout(report, 30000);
  }

  // 获取摘要
  static getSummary() {
    const memory = this.metrics.memory;
    const fps = this.metrics.fps;
    
    const summary = {
      timestamp: Date.now(),
      duration: memory.length > 0 ? 
        (memory[memory.length - 1].timestamp - memory[0].timestamp) / 1000 : 0,
      
      // 内存统计
      memory: {
        current: memory.length > 0 ? memory[memory.length - 1].usedJSHeapSize : 0,
        peak: memory.length > 0 ? 
          Math.max(...memory.map(m => m.usedJSHeapSize)) : 0,
        growth: memory.length > 1 ? 
          memory[memory.length - 1].usedJSHeapSize - memory[0].usedJSHeapSize : 0,
        samples: memory.length
      },
      
      // FPS统计
      fps: {
        current: fps.length > 0 ? fps[fps.length - 1].fps : 0,
        avg: fps.length > 0 ? 
          Math.round(fps.reduce((a, b) => a + b.fps, 0) / fps.length) : 0,
        min: fps.length > 0 ? Math.min(...fps.map(f => f.fps)) : 0,
        max: fps.length > 0 ? Math.max(...fps.map(f => f.fps)) : 0,
        samples: fps.length
      },
      
      // 长任务统计
      longTasks: {
        count: this.metrics.longTasks.length,
        avgDuration: this.metrics.longTasks.length > 0 ?
          this.metrics.longTasks.reduce((a, b) => a + b.duration, 0) / 
          this.metrics.longTasks.length : 0,
        maxDuration: this.metrics.longTasks.length > 0 ?
          Math.max(...this.metrics.longTasks.map(t => t.duration)) : 0
      },
      
      // 错误统计
      errors: {
        count: this.metrics.errors.length,
        recent: this.metrics.errors.slice(-5)
      }
    };
    
    return summary;
  }

  // 添加回调
  static onReport(callback) {
    this.callbacks.push(callback);
  }

  // 移除回调
  static offReport(callback) {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }

  // 重置数据
  static reset() {
    this.metrics = {
      memory: [],
      fps: [],
      longTasks: [],
      errors: []
    };
    console.log('[PerformanceMonitor] Metrics reset');
  }

  // 导出报告
  static exportReport() {
    const summary = this.getSummary();
    const report = {
      summary,
      rawData: this.metrics,
      generatedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    return report;
  }
}

// 自动启动（如果需要）
// PerformanceMonitor.start();

// 导出到全局
window.PerformanceMonitor = PerformanceMonitor;
