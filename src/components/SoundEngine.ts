// Web Audio API Synthesizer for 8-bit retro sound effects and looping music
class RetroSoundEngine {
  private ctx: AudioContext | null = null;
  private bgmInterval: any = null;
  private isMuted: boolean = false;
  private activeOscillators: { osc: OscillatorNode; gain: GainNode }[] = [];

  constructor() {
    // Initialized lazily on first user interaction to comply with browser autoplay security policies
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMute(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopBGM();
    } else {
      this.initContext();
    }
  }

  toggleMute(): boolean {
    this.setMute(!this.isMuted);
    return this.isMuted;
  }

  getMuted() {
    return this.isMuted;
  }

  // General synthesizer bleep
  playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.1) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio failure', e);
    }
  }

  // UI Selection
  playSelect() {
    this.playTone(523.25, 0.15, 'square', 0.08); // C5
    setTimeout(() => {
      this.playTone(659.25, 0.2, 'square', 0.08); // E5
    }, 60);
  }

  // UI Hover
  playHover() {
    this.playTone(392.00, 0.06, 'triangle', 0.1); // G4
  }

  // Character Jump Sfx
  playJump() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.18);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.18);
    } catch (e) {}
  }

  // Character Sword Slash Sfx
  playSlash() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      // Noise buffer for swish sound
      const bufferSize = this.ctx.sampleRate * 0.1;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noiseNode = this.ctx.createBufferSource();
      noiseNode.buffer = buffer;

      // Bandpass filter to make it sound like a slash
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1000, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.1);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

      noiseNode.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noiseNode.start();
      noiseNode.stop(this.ctx.currentTime + 0.1);

      // Add a metallic element
      this.playTone(880, 0.08, 'triangle', 0.05);
    } catch (e) {}
  }

  // Character Dash Sfx
  playDash() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch (e) {}
  }

  // Character Special Ghost Mask Skill Sfx
  playSkill() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(450, this.ctx.currentTime + 0.35);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(300, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(3000, this.ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);

      // Play double tone for harmonious feeling
      setTimeout(() => {
        this.playTone(554.37, 0.25, 'triangle', 0.06); // C#5
      }, 50);
    } catch (e) {}
  }

  // Score pickup coin sound
  playCoin() {
    this.playTone(987.77, 0.08, 'sine', 0.06); // B5
    setTimeout(() => {
      this.playTone(1318.51, 0.15, 'sine', 0.06); // E6
    }, 60);
  }

  // Hit obstacle damage sound
  playDamage() {
    this.playTone(220, 0.12, 'sawtooth', 0.15);
    setTimeout(() => {
      this.playTone(110, 0.18, 'sawtooth', 0.15);
    }, 50);
  }

  // Start looping background music (A traditional Thai pentatonic Pin melody: A C D E G)
  startBGM() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
    }

    // Thai Pin Pentatonic scale notes (approx. frequencies in Hz)
    const notes = [
      440.00, // A4
      523.25, // C5
      587.33, // D5
      659.25, // E5
      783.99, // G5
      880.00, // A5
      1046.50, // C6
    ];

    // Simple folk-like sequence: indexing notes (relative to our pentatonic scale)
    const melodyPattern = [
      0, 2, 3, 5, 3, 2, 0, 0, // phrase 1
      1, 3, 5, 6, 5, 3, 1, 1, // phrase 2
      2, 3, 5, 3, 2, 0, 1, 0, // phrase 3
      3, 5, 3, 5, 6, 5, 3, 0  // phrase 4
    ];

    const bassPattern = [
      440.00, 440.00, 523.25, 440.00,
      349.23, 349.23, 392.00, 392.00,
    ];

    let beat = 0;
    this.bgmInterval = setInterval(() => {
      if (!this.ctx || this.isMuted) return;

      try {
        // Play Melody Note
        const noteIndex = melodyPattern[beat % melodyPattern.length];
        const freq = notes[noteIndex];
        
        // Slightly random timing to sound organic like a wooden pin instrument
        const strumDelay = Math.random() * 0.02;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Pin-like sound: rapid attack, quick decay, pluck timbre
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + strumDelay);

        // Lowpass filter to mellow the sawtooth to sound like stringed pin
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.04, this.ctx.currentTime + strumDelay);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + strumDelay + 0.28);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + strumDelay);
        osc.stop(this.ctx.currentTime + strumDelay + 0.3);

        // Play bass beat on quarter notes
        if (beat % 2 === 0) {
          const bassFreq = bassPattern[(beat / 2) % bassPattern.length] / 2;
          const bassOsc = this.ctx.createOscillator();
          const bassGain = this.ctx.createGain();

          bassOsc.type = 'triangle';
          bassOsc.frequency.setValueAtTime(bassFreq, this.ctx.currentTime);
          
          bassGain.gain.setValueAtTime(0.06, this.ctx.currentTime);
          bassGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.4);

          bassOsc.connect(bassGain);
          bassGain.connect(this.ctx.destination);
          
          bassOsc.start();
          bassOsc.stop(this.ctx.currentTime + 0.4);
        }

        beat++;
      } catch (err) {
        console.error("BGM player error", err);
      }
    }, 250); // 120 BPM
  }

  stopBGM() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
}

export const soundEngine = new RetroSoundEngine();
