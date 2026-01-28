// 音效管理类 - 全平台兼容与智能自适应引擎
export class SoundManager {
  private static instance: SoundManager;
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;
  private currentAudio: HTMLAudioElement | null = null;

  private constructor() {
    if (typeof window !== 'undefined') {
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.audioContext = new AudioCtx();

      // 预热浏览器语音引擎
      if ('speechSynthesis' in window) {
        window.speechSynthesis.getVoices();
      }
    }
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public playCorrect() {
    this.safePlayOscillator([523.25, 659.25], 0.3, 0.15);
  }

  public playIncorrect() {
    this.safePlayOscillator([300, 250], 0.2, 0.15);
  }

  public playFlip() {
    this.safePlayOscillator([800, 400], 0.05, 0.1);
  }

  public playClick() {
    this.safePlayOscillator([1000], 0.02, 0.1);
  }

  private safePlayOscillator(frequencies: number[], duration: number, volume: number) {
    if (!this.enabled || !this.audioContext) return;
    try {
      if (this.audioContext.state === 'suspended') this.audioContext.resume();
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      frequencies.forEach((freq, i) => {
        oscillator.frequency.setValueAtTime(freq, this.audioContext!.currentTime + (i * 0.1));
      });
      gainNode.gain.setValueAtTime(volume, this.audioContext!.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext!.currentTime + duration);
      oscillator.start(this.audioContext!.currentTime);
      oscillator.stop(this.audioContext!.currentTime + duration);
    } catch (e) { /* ignore safe fail */ }
  }

  public playLevelUp() {
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      setTimeout(() => this.safePlayOscillator([freq], 0.5, 0.2), i * 100);
    });
  }

  /**
   * 增强型多路发音调度器
   * 解决 Linux 环境下 SpeechSynthesis 可能失效以及 Youdao 长句 500 的问题
   */
  public playHighQualityTTS(text: string, lang: 'en-US' | 'zh-CN' = 'en-US') {
    if (!this.enabled) return;

    // 清理并准备文本
    const cleanText = text.trim().replace(/[""“”'']/g, '');
    const isWord = cleanText.split(/\s+/).length <= 3;
    const accent = lang === 'en-US' ? 2 : 1;

    // 停止上一个音频
    this.stopAudio();

    if (isWord) {
      // 单词播放：使用有道经典接口（专精单词）
      const url = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(cleanText)}&type=${accent}`;
      this.playAudioSource(url, () => this.playBasicTTS(cleanText, lang));
    } else {
      // 例句播放：直接使用更稳的百度 TTS 接口（专精句子）
      // 百度接口对 Referer 限制较少，且长句不会报 500
      const baiduLang = lang === 'en-US' ? 'en' : 'zh';
      const url = `https://tts.baidu.com/text2audio?lan=${baiduLang}&ie=UTF-8&spd=5&text=${encodeURIComponent(cleanText)}`;
      this.playAudioSource(url, () => this.playBasicTTS(cleanText, lang));
    }
  }

  private stopAudio() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.src = '';
      this.currentAudio.load();
      this.currentAudio = null;
    }
  }

  private playAudioSource(url: string, fallback: () => void) {
    const audio = new Audio();
    this.currentAudio = audio;

    // 设置超时保护，如果音频 3 秒内没反应，退回到系统 TTS
    const timeout = setTimeout(() => {
      if (this.currentAudio === audio) {
        console.warn("Audio source timed out, falling back");
        fallback();
      }
    }, 3000);

    audio.addEventListener('error', () => {
      clearTimeout(timeout);
      fallback();
    }, { once: true });

    audio.addEventListener('play', () => {
      clearTimeout(timeout);
    }, { once: true });

    try {
      audio.src = url;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => fallback());
      }
    } catch (e) {
      fallback();
    }
  }

  // 终极备份策略：原生语音合成（修复 Linux/Chrome 静默由于 voices 为空导致的失效）
  public playBasicTTS(text: string, lang: string = 'en-US') {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    // 立即执行或等待加载后执行
    const doSpeak = () => {
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();

      // 查找最合适的发音人
      const voice = voices.find(v => v.lang.startsWith(lang) && (v.name.includes('Natural') || v.name.includes('Online'))) ||
        voices.find(v => v.lang.startsWith(lang));

      if (voice) utterance.voice = voice;
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    };

    if (window.speechSynthesis.getVoices().length === 0) {
      // 极速监听
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null;
        doSpeak();
      };
      // 防止监听不触发的兜底执行
      setTimeout(doSpeak, 200);
    } else {
      doSpeak();
    }
  }
}