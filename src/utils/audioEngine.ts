import { MusicTrack } from '../types';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private isPlaying: boolean = false;
  private volume: number = 1.0;
  private isMuted: boolean = false;

  private readonly KALAIDO_URL = 'https://archive.org/download/kalaido-hanging-lanterns_202101/Kalaido%20-%20Hanging%20Lanterns.mp3';

  constructor() {
    try {
      const savedMuted = localStorage.getItem('cb_client_muted');
      if (savedMuted !== null) {
        this.isMuted = savedMuted === 'true';
      }
      this.volume = 1.0;
    } catch {
      // ignore
    }
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public async startBgm() {
    this.initContext();

    if (this.audioElement && this.isPlaying) {
      return;
    }

    try {
      if (!this.audioElement) {
        const audio = new Audio(this.KALAIDO_URL);
        audio.loop = true;
        audio.volume = this.isMuted ? 0 : this.volume;
        this.audioElement = audio;
      }

      await this.audioElement.play();
      this.isPlaying = true;
    } catch (err) {
      // Browser autoplay policy might block before user interaction
      console.log('Autoplay pending user gesture:', err);
    }
  }

  // Alias for compatibility
  public async playTrack(_track?: string, _forceStart?: boolean) {
    return this.startBgm();
  }

  public pause() {
    if (this.audioElement) {
      this.audioElement.pause();
    }
    this.isPlaying = false;
  }

  public resume() {
    this.startBgm();
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.audioElement) {
      this.audioElement.volume = this.isMuted ? 0 : this.volume;
    }
  }

  // --- Interactive Sound Effects ---
  public playPokeballThrow() {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain || this.isMuted) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.25);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.12, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch {}
  }

  public playCatchSuccess() {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain || this.isMuted) return;
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 victory chime

      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = now + idx * 0.12;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.exponentialRampToValueAtTime(0.15, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.4);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(startTime);
        osc.stop(startTime + 0.45);
      });
    } catch {}
  }

  public playCatchEscape() {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain || this.isMuted) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.3);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.4);
    } catch {}
  }

  public playClick() {
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain || this.isMuted) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.06);
    } catch {}
  }

  public getState() {
    return {
      isPlaying: this.isPlaying,
      volume: this.volume,
      isMuted: this.isMuted,
    };
  }
}

export const soundEngine = new SoundEngine();
