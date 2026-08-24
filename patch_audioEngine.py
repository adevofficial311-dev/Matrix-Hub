import sys

with open('src/utils/audioEngine.ts', 'r') as f:
    content = f.read()

replacement = """
  private mixedElements: HTMLAudioElement[] = [];

  constructor() {
    try {
      const savedMuted = localStorage.getItem('cb_client_muted');
      if (savedMuted !== null) {
        this.isMuted = savedMuted === 'true';
      }
      this.volume = 2.0; // 200% volume
      localStorage.setItem('cb_client_volume', '2');
    } catch {
    }
  }

  public subscribe(cb: (state: { isPlaying: boolean; volume: number; isMuted: boolean; currentTrack: MusicTrack }) => void) {
    this.listeners.add(cb);
    this.notify();
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify() {
    const state = {
      isPlaying: this.isPlaying,
      volume: this.volume,
      isMuted: this.isMuted,
      currentTrack: this.currentTrack,
    };
    this.listeners.forEach((cb) => cb(state));
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : Math.min(2.0, this.volume), this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public async playTrack(track: MusicTrack = 'main', forceStart: boolean = true) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    if (this.isPlaying && !forceStart) {
      return;
    }

    this.currentTrack = track;

    const trackUrls = [
      'https://archive.org/download/Melodies_Of_Fear/John_Holowach_-_02_-_Shadows_on_the_Walls.mp3',
      'https://archive.org/download/kalaido-hanging-lanterns_202101/Kalaido%20-%20Hanging%20Lanterns.mp3',
      'https://archive.org/download/kalaido-hanging-lanterns_202101/flovry%20-%20car%20radio.mp3',
      'https://archive.org/download/kalaido-hanging-lanterns_202101/Matt%20Quentin%20-%20Waves.mp3'
    ];

    try {
      if (this.audioElement) {
        this.audioElement.pause();
        this.audioElement = null;
      }
      this.mixedElements.forEach(el => el.pause());
      this.mixedElements = [];

      // Mix all 4 songs together
      let loaded = 0;
      for (let i = 0; i < trackUrls.length; i++) {
        const audio = new Audio(trackUrls[i]);
        audio.crossOrigin = 'anonymous';
        audio.loop = true;
        // Native volume caps at 1.0, but we use WebAudio Gain to reach 2.0 later
        audio.volume = this.isMuted ? 0 : 1.0; 
        this.mixedElements.push(audio);
        
        try {
           if (this.ctx) {
             const source = this.ctx.createMediaElementSource(audio);
             source.connect(this.masterGain);
           }
        } catch (e) {
           // CORS or duplicate connection
        }
      }

      await Promise.all(this.mixedElements.map(el => el.play().catch(() => {})));
      
      this.isPlaying = true;
      this.stopSynth();
      this.notify();
      return;
    } catch (err) {
      console.warn("Audio playback failed:", err);
    }

    this.isPlaying = true;
    this.notify();
  }
"""

start_idx = content.find('  constructor() {')
end_idx = content.find('  private stopSynth() {')

if start_idx != -1 and end_idx != -1:
    new_content = content[:start_idx] + replacement.strip() + '\n\n  private stopSynth() {' + content[end_idx + 23:]
    with open('src/utils/audioEngine.ts', 'w') as f:
        f.write(new_content)
    print("Patched audioEngine!")
else:
    print("Could not find bounds")

