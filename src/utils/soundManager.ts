/**
 * 音效管理器
 * 使用Web Audio API生成简单的音效
 */

interface SoundConfig {
  frequency?: number;
  duration?: number;
  volume?: number;
  type?: 'sine' | 'square' | 'sawtooth' | 'triangle';
}

class SoundManager {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    // 延迟初始化AudioContext，避免浏览器自动播放策略限制
    if (typeof window !== 'undefined') {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        console.warn('AudioContext not supported', e);
      }
    }
  }

  /**
   * 启用/禁用音效
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  /**
   * 获取是否启用
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * 初始化AudioContext（在用户交互后调用）
   */
  init() {
    if (!this.audioContext || this.audioContext.state === 'running') return;

    try {
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
    } catch (e) {
      console.warn('Failed to resume audio context', e);
    }
  }

  /**
   * 播放音效
   */
  private playTone(config: SoundConfig) {
    if (!this.enabled || !this.audioContext) return;

    this.init();

    const {
      frequency = 440,
      duration = 100,
      volume = 0.3,
      type = 'sine'
    } = config;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration / 1000);
    } catch (e) {
      console.warn('Failed to play sound', e);
    }
  }

  /**
   * 播放卡片移动音效
   */
  playCardMove() {
    this.playTone({
      frequency: 300,
      duration: 80,
      volume: 0.2,
      type: 'sine'
    });
  }

  /**
   * 播放卡片放置音效
   */
  playCardPlace() {
    this.playTone({
      frequency: 400,
      duration: 100,
      volume: 0.25,
      type: 'sine'
    });
  }

  /**
   * 播放发牌音效
   */
  playDealCard() {
    this.playTone({
      frequency: 200,
      duration: 60,
      volume: 0.15,
      type: 'square'
    });
  }

  /**
   * 播放完成序列音效
   */
  playCompleteSequence() {
    // 播放一个上升的音调序列
    const frequencies = [440, 523, 659, 784];
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone({
          frequency: freq,
          duration: 150,
          volume: 0.3,
          type: 'sine'
        });
      }, index * 100);
    });
  }

  /**
   * 播放胜利音效
   */
  playWin() {
    // 播放一个胜利的音调序列
    const frequencies = [523, 659, 784, 1047];
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        this.playTone({
          frequency: freq,
          duration: 200,
          volume: 0.4,
          type: 'sine'
        });
      }, index * 150);
    });
  }

  /**
   * 播放错误音效
   */
  playError() {
    this.playTone({
      frequency: 200,
      duration: 150,
      volume: 0.2,
      type: 'square'
    });
  }

  /**
   * 播放点击音效
   */
  playClick() {
    this.playTone({
      frequency: 500,
      duration: 50,
      volume: 0.15,
      type: 'sine'
    });
  }
}

// 导出单例
export const soundManager = new SoundManager();

