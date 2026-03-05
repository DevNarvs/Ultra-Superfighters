import { EventBus, Events } from './EventBus';

/**
 * Procedural audio system using Web Audio API.
 * All sounds are synthesized — no audio files needed.
 */
export class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicOscs: OscillatorNode[] = [];
  private musicPlaying = false;
  private _sfxVolume = 0.5;
  private _musicVolume = 0.25;
  private _muted = false;

  private static instance: SoundManager | null = null;

  static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  private constructor() {
    this.bindEvents();
  }

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.value = this._muted ? 0 : 1;

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this._sfxVolume;
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this._musicVolume;
      this.musicGain.connect(this.masterGain);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  private bindEvents(): void {
    EventBus.on(Events.HIT_LANDED, (data: { damage: number }) => {
      if (data.damage >= 15) this.playHeavyHit();
      else this.playLightHit();
    });
    EventBus.on(Events.COUNTDOWN_TICK, () => this.playCountdownTick());
    EventBus.on(Events.FIGHT, () => this.playFightAnnounce());
    EventBus.on(Events.ROUND_END, () => this.playRoundEnd());
    EventBus.on(Events.MATCH_END, () => this.playMatchEnd());
    EventBus.on(Events.ABILITY_USED, (data: { type: string }) => {
      switch (data.type) {
        case 'projectile': this.playProjectile(); break;
        case 'shield': this.playShield(); break;
        case 'dodge': this.playDodge(); break;
        case 'ultimate': this.playUltimate(); break;
      }
    });
    EventBus.on(Events.PLAYER_KO, () => this.playKO());
  }

  // --- SFX Methods ---

  playLightHit(): void {
    const ctx = this.ensureContext();
    const t = ctx.currentTime;

    // Short noise burst for punch feel
    const bufferSize = ctx.sampleRate * 0.08;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2000;
    filter.Q.value = 1.5;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

    noise.connect(filter).connect(gain).connect(this.sfxGain!);
    noise.start(t);
    noise.stop(t + 0.08);
  }

  playHeavyHit(): void {
    const ctx = this.ensureContext();
    const t = ctx.currentTime;

    // Low thump + noise
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.15);

    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0.8, t);
    oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

    osc.connect(oscGain).connect(this.sfxGain!);
    osc.start(t);
    osc.stop(t + 0.15);

    // Noise layer
    const bufferSize = ctx.sampleRate * 0.12;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1500;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.5, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

    noise.connect(filter).connect(noiseGain).connect(this.sfxGain!);
    noise.start(t);
    noise.stop(t + 0.12);
  }

  playProjectile(): void {
    const ctx = this.ensureContext();
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.2);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    osc.connect(gain).connect(this.sfxGain!);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  playShield(): void {
    const ctx = this.ensureContext();
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.linearRampToValueAtTime(600, t + 0.15);
    osc.frequency.linearRampToValueAtTime(500, t + 0.3);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.linearRampToValueAtTime(0.2, t + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

    osc.connect(gain).connect(this.sfxGain!);
    osc.start(t);
    osc.stop(t + 0.3);
  }

  playDodge(): void {
    const ctx = this.ensureContext();
    const t = ctx.currentTime;

    // Whoosh: filtered noise sweep
    const bufferSize = ctx.sampleRate * 0.2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(500, t);
    filter.frequency.exponentialRampToValueAtTime(3000, t + 0.1);
    filter.frequency.exponentialRampToValueAtTime(800, t + 0.2);
    filter.Q.value = 2;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    noise.connect(filter).connect(gain).connect(this.sfxGain!);
    noise.start(t);
    noise.stop(t + 0.2);
  }

  playUltimate(): void {
    const ctx = this.ensureContext();
    const t = ctx.currentTime;

    // Rising dramatic tone
    const osc1 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(150, t);
    osc1.frequency.exponentialRampToValueAtTime(600, t + 0.5);

    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(300, t);
    osc2.frequency.exponentialRampToValueAtTime(1200, t + 0.5);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.linearRampToValueAtTime(0.4, t + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.6);

    osc1.connect(gain).connect(this.sfxGain!);
    osc2.connect(gain);
    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.6);
    osc2.stop(t + 0.6);
  }

  playKO(): void {
    const ctx = this.ensureContext();
    const t = ctx.currentTime;

    // Descending dramatic tone
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.5);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);

    osc.connect(gain).connect(this.sfxGain!);
    osc.start(t);
    osc.stop(t + 0.5);
  }

  playCountdownTick(): void {
    const ctx = this.ensureContext();
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 880;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

    osc.connect(gain).connect(this.sfxGain!);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  playFightAnnounce(): void {
    const ctx = this.ensureContext();
    const t = ctx.currentTime;

    // Two-tone burst
    const osc1 = ctx.createOscillator();
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(440, t);
    osc1.frequency.setValueAtTime(660, t + 0.1);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

    osc1.connect(gain).connect(this.sfxGain!);
    osc1.start(t);
    osc1.stop(t + 0.25);
  }

  playRoundEnd(): void {
    const ctx = this.ensureContext();
    const t = ctx.currentTime;

    // Victory jingle: ascending 3-note
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = freq;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, t + i * 0.12);
      gain.gain.linearRampToValueAtTime(0.35, t + i * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.12 + 0.2);

      osc.connect(gain).connect(this.sfxGain!);
      osc.start(t + i * 0.12);
      osc.stop(t + i * 0.12 + 0.2);
    });
  }

  playMatchEnd(): void {
    const ctx = this.ensureContext();
    const t = ctx.currentTime;

    // Fanfare: ascending chord
    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = freq;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, t + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.3, t + i * 0.1 + 0.03);
      gain.gain.setValueAtTime(0.3, t + i * 0.1 + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.1 + 0.6);

      osc.connect(gain).connect(this.sfxGain!);
      osc.start(t + i * 0.1);
      osc.stop(t + i * 0.1 + 0.6);
    });
  }

  playMenuSelect(): void {
    const ctx = this.ensureContext();
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 600;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

    osc.connect(gain).connect(this.sfxGain!);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  playMenuConfirm(): void {
    const ctx = this.ensureContext();
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, t);
    osc.frequency.setValueAtTime(800, t + 0.05);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

    osc.connect(gain).connect(this.sfxGain!);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  playMenuBack(): void {
    const ctx = this.ensureContext();
    const t = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, t);
    osc.frequency.setValueAtTime(300, t + 0.05);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

    osc.connect(gain).connect(this.sfxGain!);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  // --- Music ---

  startBattleMusic(): void {
    if (this.musicPlaying) this.stopMusic();
    const ctx = this.ensureContext();
    this.musicPlaying = true;

    // Simple dark ambient loop with bass drone + arpeggiated notes
    const bassOsc = ctx.createOscillator();
    bassOsc.type = 'sawtooth';
    bassOsc.frequency.value = 55; // A1

    const bassFilter = ctx.createBiquadFilter();
    bassFilter.type = 'lowpass';
    bassFilter.frequency.value = 200;

    const bassGain = ctx.createGain();
    bassGain.gain.value = 0.15;

    bassOsc.connect(bassFilter).connect(bassGain).connect(this.musicGain!);
    bassOsc.start();
    this.musicOscs.push(bassOsc);

    // Pad chord
    const padNotes = [110, 164.81, 220]; // A2, E3, A3
    for (const freq of padNotes) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const gain = ctx.createGain();
      gain.gain.value = 0.06;

      osc.connect(gain).connect(this.musicGain!);
      osc.start();
      this.musicOscs.push(osc);
    }

    // Slow LFO on pad for movement
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.3;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 10;
    lfo.connect(lfoGain).connect(bassFilter.frequency);
    lfo.start();
    this.musicOscs.push(lfo);
  }

  startMenuMusic(): void {
    if (this.musicPlaying) this.stopMusic();
    const ctx = this.ensureContext();
    this.musicPlaying = true;

    // Calm ambient pad
    const padNotes = [130.81, 196.00, 261.63]; // C3, G3, C4
    for (const freq of padNotes) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const gain = ctx.createGain();
      gain.gain.value = 0.05;

      osc.connect(gain).connect(this.musicGain!);
      osc.start();
      this.musicOscs.push(osc);
    }
  }

  stopMusic(): void {
    for (const osc of this.musicOscs) {
      try { osc.stop(); } catch { /* already stopped */ }
    }
    this.musicOscs = [];
    this.musicPlaying = false;
  }

  // --- Volume Controls ---

  get sfxVolume(): number { return this._sfxVolume; }
  set sfxVolume(v: number) {
    this._sfxVolume = Math.max(0, Math.min(1, v));
    if (this.sfxGain) this.sfxGain.gain.value = this._sfxVolume;
  }

  get musicVolume(): number { return this._musicVolume; }
  set musicVolume(v: number) {
    this._musicVolume = Math.max(0, Math.min(1, v));
    if (this.musicGain) this.musicGain.gain.value = this._musicVolume;
  }

  get muted(): boolean { return this._muted; }
  set muted(v: boolean) {
    this._muted = v;
    if (this.masterGain) this.masterGain.gain.value = v ? 0 : 1;
  }

  toggleMute(): void {
    this.muted = !this._muted;
  }

  destroy(): void {
    this.stopMusic();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
    EventBus.removeAllListeners();
  }
}
