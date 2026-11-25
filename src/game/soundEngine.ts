export type MusicMode =
  | 'none'
  | 'menu'
  | 'hero_select'
  | 'loading'
  | 'explore'
  | 'combat'
  | 'boss'
  | 'victory'
  | 'defeat';

export type AnnouncerEvent =
  | 'welcome'
  | 'first_blood'
  | 'enemy_defeated'
  | 'ally_killed_enemy'
  | 'player_killed'
  | 'ally_defeated'
  | 'double_kill'
  | 'triple_kill'
  | 'maniac'
  | 'legendary'
  | 'enemy_dominating'
  | 'blue_leading'
  | 'red_leading'
  | 'turret_destroyed'
  | 'turtle_defeated'
  | 'lord_arrived'
  | 'allied_lord_march'
  | 'base_under_attack'
  | 'base_shield_broken'
  | 'base_destroyed'
  | 'victory'
  | 'defeat';

export interface SoundSettings {
  muted: boolean;
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  announcerEnabled: boolean;
  announcerVolume: number;
}

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private ambienceGain: GainNode | null = null;
  private ambienceSource: AudioBufferSourceNode | null = null;

  private settings: SoundSettings = {
    muted: false,
    masterVolume: 0.78,
    musicVolume: 0.52,
    sfxVolume: 0.82,
    announcerEnabled: true,
    announcerVolume: 0.88,
  };

  private currentMode: MusicMode = 'none';
  private musicTimer: number | null = null;
  private stepIndex = 0;
  private lastAnnounceTime = 0;
  private lastAnnounceKey: string = '';

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.ambienceGain = this.ctx.createGain();

      this.musicGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      this.ambienceGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      this.applyVolumes();
      this.startAmbienceLoop();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public unlock() {
    this.ensureContext();
  }

  public getSettings(): SoundSettings {
    return { ...this.settings };
  }

  public updateSettings(partial: Partial<SoundSettings>) {
    this.settings = { ...this.settings, ...partial };
    this.applyVolumes();
  }

  private applyVolumes() {
    if (!this.ctx || !this.masterGain || !this.musicGain || !this.sfxGain || !this.ambienceGain) return;
    const now = this.ctx.currentTime;
    const master = this.settings.muted ? 0 : this.settings.masterVolume;
    this.masterGain.gain.setTargetAtTime(master, now, 0.05);
    this.musicGain.gain.setTargetAtTime(this.settings.musicVolume, now, 0.08);
    this.sfxGain.gain.setTargetAtTime(this.settings.sfxVolume, now, 0.05);
    this.ambienceGain.gain.setTargetAtTime(this.settings.musicVolume * 0.14, now, 0.2);
  }

  private startAmbienceLoop() {
    if (!this.ctx || !this.ambienceGain || this.ambienceSource) return;
    const sampleRate = this.ctx.sampleRate;
    const length = sampleRate * 3;
    const buffer = this.ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.02 * white) / 1.02;
      data[i] = lastOut * 1.6;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 520;
    filter.Q.value = 0.7;

    source.connect(filter);
    filter.connect(this.ambienceGain);
    source.start();
    this.ambienceSource = source;
  }

  public setMusicMode(mode: MusicMode) {
    if (this.currentMode === mode) return;
    this.currentMode = mode;
    this.stepIndex = 0;
    if (this.musicTimer !== null) {
      window.clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
    if (mode === 'none') return;

    const tempoMs =
      mode === 'boss'
        ? 185
        : mode === 'combat'
          ? 220
          : mode === 'loading'
            ? 200
            : mode === 'victory'
              ? 210
              : mode === 'hero_select'
                ? 280
                : mode === 'defeat'
                  ? 460
                  : 335;

    this.musicTimer = window.setInterval(() => {
      this.playMusicStep();
    }, tempoMs);
  }

  private playMusicStep() {
    if (this.settings.muted || !this.ctx || this.ctx.state !== 'running' || !this.musicGain) return;
    const now = this.ctx.currentTime;

    const scales: Record<Exclude<MusicMode, 'none'>, number[]> = {
      menu: [293.66, 349.23, 440.0, 523.25, 587.33, 523.25, 440.0, 392.0],
      hero_select: [329.63, 392.0, 493.88, 587.33, 659.25, 587.33, 493.88, 440.0],
      loading: [220.0, 293.66, 329.63, 440.0, 523.25, 440.0, 329.63, 293.66],
      explore: [293.66, 349.23, 440.0, 523.25, 440.0, 392.0, 349.23, 440.0],
      combat: [220.0, 261.63, 329.63, 392.0, 440.0, 392.0, 329.63, 293.66],
      boss: [146.83, 174.61, 220.0, 233.08, 220.0, 174.61, 164.81, 220.0],
      victory: [523.25, 659.25, 783.99, 1046.5, 880.0, 783.99, 1046.5, 1318.5],
      defeat: [220.0, 196.0, 174.61, 164.81],
    };

    if (this.currentMode === 'none') return;
    const notes = scales[this.currentMode];
    const freq = notes[this.stepIndex % notes.length];

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type =
      this.currentMode === 'boss' || this.currentMode === 'combat'
        ? 'sawtooth'
        : this.currentMode === 'victory' || this.currentMode === 'loading'
          ? 'triangle'
          : 'sine';
    osc.frequency.setValueAtTime(freq, now);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value =
      this.currentMode === 'boss' ? 1250 : this.currentMode === 'combat' ? 1550 : 2100;

    const dur = this.currentMode === 'defeat' ? 0.55 : 0.34;
    const peak = this.currentMode === 'boss' ? 0.14 : this.currentMode === 'combat' ? 0.13 : 0.14;
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(peak, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);
    osc.start(now);
    osc.stop(now + dur + 0.02);

    if (
      (this.currentMode === 'menu' ||
        this.currentMode === 'hero_select' ||
        this.currentMode === 'loading' ||
        this.currentMode === 'combat' ||
        this.currentMode === 'boss' ||
        this.currentMode === 'victory') &&
      this.stepIndex % 2 === 0
    ) {
      const harm = this.ctx.createOscillator();
      const hGain = this.ctx.createGain();
      harm.type = 'triangle';
      harm.frequency.setValueAtTime(freq * 1.5, now);
      hGain.gain.setValueAtTime(0.001, now);
      hGain.gain.exponentialRampToValueAtTime(0.065, now + 0.03);
      hGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      harm.connect(hGain);
      hGain.connect(this.musicGain);
      harm.start(now);
      harm.stop(now + 0.32);
    }

    if (this.stepIndex % 2 === 0 && this.currentMode !== 'defeat') {
      const bass = this.ctx.createOscillator();
      const bGain = this.ctx.createGain();
      bass.type = 'triangle';
      bass.frequency.setValueAtTime(freq * 0.5, now);
      bGain.gain.setValueAtTime(0.001, now);
      bGain.gain.exponentialRampToValueAtTime(
        this.currentMode === 'boss' ? 0.21 : this.currentMode === 'combat' ? 0.16 : 0.11,
        now + 0.02
      );
      bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      bass.connect(bGain);
      bGain.connect(this.musicGain);
      bass.start(now);
      bass.stop(now + 0.3);
    }

    this.stepIndex++;
  }

  private playTone(
    freqStart: number,
    freqEnd: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume = 0.22,
    delay = 0
  ) {
    if (this.settings.muted) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain) return;
    const t = ctx.currentTime + delay;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), t + duration);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.exponentialRampToValueAtTime(volume, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + duration + 0.02);
  }

  private playNoiseBurst(duration: number, filterFreq: number, volume = 0.16, delay = 0) {
    if (this.settings.muted) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxGain) return;
    const t = ctx.currentTime + delay;

    const size = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < size; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const src = ctx.createBufferSource();
    src.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = filterFreq;
    filter.Q.value = 1.2;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    src.start(t);
  }

  public playAnnouncer(event: AnnouncerEvent) {
    if (this.settings.muted || !this.settings.announcerEnabled) return;
    const nowMs = Date.now();
    const highPriority =
      event === 'victory' ||
      event === 'defeat' ||
      event === 'first_blood' ||
      event === 'triple_kill' ||
      event === 'maniac' ||
      event === 'legendary' ||
      event === 'double_kill';

    // Prevent overlapping spam while letting high-priority announcements cut through
    if (!highPriority) {
      if (nowMs - this.lastAnnounceTime < 3400 && this.lastAnnounceKey === event) return;
      if (nowMs - this.lastAnnounceTime < 2200) return;
    } else if (event !== 'victory' && event !== 'defeat') {
      if (nowMs - this.lastAnnounceTime < 900) return;
    }
    this.lastAnnounceTime = nowMs;
    this.lastAnnounceKey = event;

    // Dramatic Announcer Chime Prefix
    this.playTone(587.33, 880, 0.14, 'triangle', 0.17 * this.settings.announcerVolume, 0);
    this.playTone(880, 1174.66, 0.18, 'sine', 0.15 * this.settings.announcerVolume, 0.07);

    const lines: Record<AnnouncerEvent, string> = {
      welcome: 'Welcome to Legenda Kata Adjektif! Five versus five battle begins!',
      first_blood: 'First Blood!',
      enemy_defeated: 'You have slain an enemy!',
      ally_killed_enemy: 'An enemy has been slain!',
      player_killed: 'You have been slain!',
      ally_defeated: 'An ally has been slain!',
      double_kill: 'Double Kill!',
      triple_kill: 'Triple Kill!',
      maniac: 'Maniac!',
      legendary: 'Legendary!',
      enemy_dominating: 'An enemy is dominating!',
      blue_leading: 'Blue team is leading!',
      red_leading: 'Red team is taking the lead!',
      turret_destroyed: 'Turret destroyed!',
      turtle_defeated: 'The Turtle has been defeated!',
      lord_arrived: 'The Lord has arrived!',
      allied_lord_march: 'The Lord has been defeated!',
      base_under_attack: 'Your base is under attack!',
      base_shield_broken: 'Enemy base shield is down!',
      base_destroyed: 'Base destroyed!',
      victory: 'Victory!',
      defeat: 'Defeat!',
    };

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(lines[event]);
        utter.lang = 'en-US';
        utter.rate =
          event === 'double_kill' || event === 'triple_kill' || event === 'maniac' || event === 'legendary'
            ? 1.12
            : 1.05;
        utter.pitch = event === 'victory' || event === 'legendary' ? 1.12 : 1.04;
        utter.volume = Math.max(0, Math.min(1, this.settings.announcerVolume * this.settings.masterVolume));

        const voices = window.speechSynthesis.getVoices();
        const preferredVoice =
          voices.find((v) => /en[-_]US/i.test(v.lang) && /natural|google|samantha|aria|guy|daniel/i.test(v.name)) ||
          voices.find((v) => /en[-_]US/i.test(v.lang)) ||
          voices.find((v) => /^en/i.test(v.lang));
        if (preferredVoice) utter.voice = preferredVoice;

        utter.onstart = () => {
          if (this.ctx && this.musicGain && !this.settings.muted) {
            this.musicGain.gain.setTargetAtTime(this.settings.musicVolume * 0.14, this.ctx.currentTime, 0.08);
          }
        };
        const restoreMusic = () => {
          if (this.ctx && this.musicGain && !this.settings.muted) {
            this.musicGain.gain.setTargetAtTime(this.settings.musicVolume * 0.34, this.ctx.currentTime, 0.18);
          }
        };
        utter.onend = restoreMusic;
        utter.onerror = restoreMusic;

        window.speechSynthesis.speak(utter);
      } catch {
        // Fallback chime already played cleanly
      }
    }
  }

  public playUiClick() {
    this.playTone(620, 880, 0.08, 'triangle', 0.15);
  }

  public playTargetLock() {
    this.playTone(880, 1180, 0.09, 'sine', 0.15);
  }

  public playHeroSelect() {
    this.playTone(392, 523.25, 0.16, 'triangle', 0.2, 0);
    this.playTone(523.25, 783.99, 0.22, 'sine', 0.2, 0.09);
  }

  public playItemBuy() {
    this.playTone(783.99, 1046.5, 0.12, 'triangle', 0.2, 0);
    this.playTone(1046.5, 1318.5, 0.16, 'sine', 0.2, 0.08);
  }

  public playBuffGain(type: 'red' | 'blue' | 'turtle') {
    if (type === 'red') {
      this.playTone(220, 440, 0.24, 'sawtooth', 0.2);
      this.playNoiseBurst(0.2, 700, 0.18);
    } else if (type === 'blue') {
      this.playTone(523, 1046, 0.25, 'sine', 0.2);
      this.playTone(659, 1318, 0.25, 'triangle', 0.16, 0.06);
    } else {
      this.playTone(293.66, 587.33, 0.24, 'triangle', 0.24, 0);
      this.playTone(440, 880, 0.3, 'sine', 0.22, 0.08);
      this.playTone(587.33, 1174.66, 0.35, 'triangle', 0.2, 0.16);
    }
  }

  public playTurretShot() {
    this.playTone(760, 260, 0.15, 'square', 0.14);
  }

  public playTurretDestroy() {
    this.playTone(150, 42, 0.55, 'sawtooth', 0.26, 0);
    this.playNoiseBurst(0.45, 520, 0.25, 0.05);
  }

  public playShieldBreak() {
    this.playTone(980, 320, 0.26, 'triangle', 0.22, 0);
    this.playTone(1480, 740, 0.22, 'sine', 0.18, 0.04);
    this.playNoiseBurst(0.18, 2800, 0.2, 0.02);
  }

  public playBaseDestroy() {
    this.playTone(110, 35, 0.9, 'sawtooth', 0.3, 0);
    this.playNoiseBurst(0.8, 380, 0.28, 0.04);
    this.playTone(523.25, 1046.5, 0.5, 'triangle', 0.24, 0.35);
  }

  public playLordFootstep() {
    this.playTone(92, 38, 0.24, 'triangle', 0.22);
    this.playNoiseBurst(0.16, 220, 0.16);
  }

  public playLordEntrance() {
    this.playTone(110, 55, 0.7, 'sawtooth', 0.25, 0);
    this.playTone(164.81, 220, 0.55, 'triangle', 0.22, 0.18);
    this.playNoiseBurst(0.55, 420, 0.22, 0.08);
  }

  public playHeroAttack(heroId: string) {
    if (heroId === 'miya' || heroId === 'karrie') {
      this.playTone(840, 310, 0.1, 'triangle', 0.18);
      this.playNoiseBurst(0.06, 2600, 0.11);
    } else if (['layla', 'granger', 'ixia', 'clint', 'brody', 'beatrix'].includes(heroId)) {
      this.playTone(heroId === 'brody' ? 240 : 320, 95, 0.16, 'sawtooth', 0.2);
      this.playNoiseBurst(0.1, 1050, 0.17);
    } else if (heroId === 'bruno') {
      this.playTone(260, 120, 0.13, 'triangle', 0.2);
    } else if (['eudora', 'kagura', 'pharsa', 'harley', 'cyclops', 'valir', 'aurora', 'cecilion', 'luoyi', 'yve', 'change'].includes(heroId)) {
      this.playTone(heroId === 'aurora' ? 1150 : 940, 480, 0.12, 'square', 0.11);
      this.playNoiseBurst(0.09, 2900, 0.12);
    } else if (['nana', 'estes', 'angela'].includes(heroId)) {
      this.playTone(680, 1020, 0.15, 'sine', 0.16);
      this.playTone(880, 1180, 0.12, 'triangle', 0.12, 0.03);
    } else if (['tigreal', 'balmond', 'fredrinn', 'hylos', 'johnson', 'atlas', 'khufra', 'terizla'].includes(heroId)) {
      this.playTone(155, 52, 0.2, 'sawtooth', 0.22);
      this.playNoiseBurst(0.14, 380, 0.18);
    } else if (['saber', 'gusion', 'fanny', 'lancelot', 'aamon', 'hayabusa', 'karina', 'helcurt', 'natalia', 'ruby'].includes(heroId)) {
      this.playNoiseBurst(0.08, 3000, 0.16);
      this.playTone(660, 240, 0.1, 'sawtooth', 0.15);
    } else {
      this.playNoiseBurst(0.11, 1600, 0.17);
      this.playTone(450, 150, 0.12, 'sawtooth', 0.17);
    }
  }

  public playHeroSkill(heroId: string, slot: 1 | 2 | 3) {
    if (['eudora', 'pharsa', 'valir', 'aurora', 'yve', 'cecilion'].includes(heroId)) {
      this.playNoiseBurst(slot === 3 ? 0.35 : 0.18, heroId === 'aurora' ? 3400 : 2600, 0.21);
      this.playTone(slot === 3 ? 880 : 640, 180, slot === 3 ? 0.42 : 0.22, 'sawtooth', 0.18);
      return;
    }
    if (['estes', 'nana', 'angela', 'kagura', 'luoyi', 'change'].includes(heroId)) {
      this.playTone(523.25, 783.99, 0.22, 'sine', 0.2, 0);
      this.playTone(783.99, 1046.5, 0.28, 'triangle', 0.19, 0.07);
      if (slot === 3) this.playTone(1046.5, 1318.5, 0.35, 'sine', 0.19, 0.14);
      return;
    }
    if (heroId === 'johnson' && slot === 3) {
      // Engine rev turbo
      this.playTone(120, 440, 0.45, 'sawtooth', 0.23);
      this.playNoiseBurst(0.25, 750, 0.18, 0.08);
      return;
    }
    if (heroId === 'fanny' && slot === 2) {
      this.playTone(420, 1320, 0.16, 'triangle', 0.2);
      this.playNoiseBurst(0.12, 3200, 0.14);
      return;
    }
    if (slot === 1) {
      this.playTone(440, 880, 0.22, 'triangle', 0.21);
      this.playNoiseBurst(0.15, 1300, 0.15);
    } else if (slot === 2) {
      this.playTone(523, 784, 0.22, 'sine', 0.21);
      this.playTone(659, 987, 0.22, 'triangle', 0.15, 0.05);
    } else {
      this.playTone(210, 680, 0.38, 'sawtooth', 0.21);
      this.playTone(440, 1046, 0.44, 'triangle', 0.22, 0.08);
      this.playNoiseBurst(0.3, 900, 0.2, 0.04);
    }
  }

  public playDash() {
    this.playNoiseBurst(0.15, 1950, 0.15);
    this.playTone(340, 680, 0.12, 'sine', 0.14);
  }

  public playHit(heavy = false) {
    this.playTone(heavy ? 135 : 210, 58, heavy ? 0.16 : 0.09, 'triangle', heavy ? 0.22 : 0.14);
  }

  public playPlayerHurt() {
    this.playTone(190, 95, 0.15, 'sawtooth', 0.17);
  }

  public playHeal() {
    this.playTone(523.25, 659.25, 0.14, 'sine', 0.18, 0);
    this.playTone(659.25, 783.99, 0.16, 'sine', 0.18, 0.07);
    this.playTone(783.99, 1046.5, 0.22, 'sine', 0.17, 0.14);
  }

  public playGold() {
    this.playTone(1046.5, 1318.5, 0.09, 'sine', 0.15, 0);
    this.playTone(1318.5, 1567.98, 0.11, 'sine', 0.15, 0.06);
  }

  public playXp() {
    this.playTone(660, 990, 0.12, 'triangle', 0.14);
  }

  public playLevelUp() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, idx) => {
      this.playTone(f, f * 1.02, 0.22, 'triangle', 0.21, idx * 0.08);
    });
  }

  public playEnemyDefeat() {
    this.playTone(440, 220, 0.18, 'triangle', 0.21, 0);
    this.playTone(587.33, 880, 0.25, 'sine', 0.21, 0.11);
  }

  public playEnemyWarning() {
    this.playTone(220, 195, 0.2, 'sawtooth', 0.19, 0);
    this.playTone(220, 195, 0.2, 'sawtooth', 0.19, 0.22);
  }

  public playCardCollect() {
    [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => {
      this.playTone(f, f * 1.03, 0.25, 'sine', 0.21, i * 0.07);
    });
  }

  public playAchievement() {
    [587.33, 739.99, 880, 1174.66].forEach((f, i) => {
      this.playTone(f, f, 0.26, 'triangle', 0.22, i * 0.09);
    });
  }

  public playVictoryCelebration() {
    const fanfare = [523.25, 523.25, 523.25, 659.25, 783.99, 659.25, 1046.5];
    const times = [0, 0.16, 0.32, 0.5, 0.72, 0.96, 1.15];
    fanfare.forEach((f, idx) => {
      this.playTone(f, f, idx === fanfare.length - 1 ? 0.65 : 0.2, 'triangle', 0.26, times[idx]);
    });
    for (let i = 0; i < 16; i++) {
      this.playNoiseBurst(0.14, 1400 + Math.random() * 1400, 0.13, 0.35 + i * 0.16);
    }
    this.playTone(784, 1046.5, 0.8, 'sine', 0.15, 0.6);
  }

  public playDefeat() {
    this.playTone(329.63, 246.94, 0.35, 'sawtooth', 0.18, 0);
    this.playTone(246.94, 174.61, 0.5, 'triangle', 0.19, 0.32);
  }
}

export const soundEngine = new SoundEngine();
