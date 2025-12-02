
class TechnoAudio {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private nextNoteTime: number = 0;
  private timerID: number | undefined;
  private bpm: number = 135;
  private startTime: number = 0;
  private currentSongId: string = '';

  // Scales
  private fMinorPentatonic = [174.61, 207.65, 233.08, 261.63, 311.13]; 
  private eMinor = [329.63, 392.00, 440.00, 493.88, 587.33]; // E4, G4, A4, B4, D5

  constructor() {
    // Initialize loosely
  }

  public init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public startMusic(bpm: number, songId: string = 'warehouse_acid') {
    this.init();
    if (!this.ctx) return;
    
    this.bpm = bpm;
    this.currentSongId = songId;
    this.isPlaying = true;
    this.startTime = this.ctx.currentTime + 0.1; 
    this.nextNoteTime = this.startTime;
    this.stepCounter = 0; // Reset step
    this.scheduler();
  }

  public stopMusic() {
    this.isPlaying = false;
    window.clearTimeout(this.timerID);
  }

  public getStartTime() {
    return this.startTime;
  }

  // "Player" Sound 
  public playHitSound(laneIndex: number) {
    if (!this.ctx) return;
    
    // Choose scale based on song
    let freqs = this.fMinorPentatonic;
    if (this.currentSongId === 'top_gear') {
        freqs = this.eMinor;
    }

    const freq = freqs[laneIndex % freqs.length];

    if (this.currentSongId === 'top_gear') {
        this.playRetroLead(freq);
    } else {
        this.playAcidStab(freq);
    }
  }

  public playMissSound() {
    if (!this.ctx) return;
    this.playNoise(0.1); 
  }

  private scheduler() {
    if (!this.ctx || !this.isPlaying) return;

    while (this.nextNoteTime < this.ctx.currentTime + 0.1) {
      if (this.currentSongId === 'top_gear') {
          this.scheduleTopGear(this.nextNoteTime);
      } else {
          this.scheduleTechno(this.nextNoteTime);
      }
      this.nextNote();
    }
    this.timerID = window.setTimeout(() => this.scheduler(), 25);
  }

  private nextNote() {
    // 16th note resolution
    const secondsPerBeat = 60.0 / this.bpm;
    const sixteenth = secondsPerBeat / 4; 
    this.nextNoteTime += sixteenth;
  }

  private stepCounter = 0;

  // --- TECHNO SEQUENCER ---
  private scheduleTechno(time: number) {
    if (!this.ctx) return;

    const step = this.stepCounter % 16;
    const beat = this.stepCounter % 4;

    // KICK (Four on the floor)
    if (beat === 0) {
      this.playKick(time);
    }

    // HI-HAT (Off beats)
    if (beat === 2) {
      this.playHat(time, true); 
    } else {
      this.playHat(time, false); 
    }

    // RUMBLE BASS
    if (beat !== 0) {
      this.playRumbleBass(time);
    }

    this.stepCounter++;
  }

  // --- TOP GEAR (HORIZON CIRCUIT) SEQUENCER ---
  private scheduleTopGear(time: number) {
      if (!this.ctx) return;
      const step = this.stepCounter % 64; // 4 bar loop for harmony
      const beat16 = this.stepCounter % 16; // 1 bar measure
      const qBeat = this.stepCounter % 4; // quarter beat check

      // Harmony progression (simplified Em -> C -> D -> Em)
      // Bars 1-2: Em (Steps 0-31)
      // Bar 3: C (Steps 32-47)
      // Bar 4: D (Steps 48-63)
      
      let rootFreq = 82.41; // E2
      if (step >= 32 && step < 48) rootFreq = 65.41; // C2
      if (step >= 48) rootFreq = 73.42; // D2

      // 1. DRUMS (Rock Beat)
      // Kick on 0, 8 (Beat 1 and 3) plus some syncopation
      if (beat16 === 0 || beat16 === 8) {
          this.playKick(time);
      }
      // Snare on 4, 12 (Beat 2 and 4)
      if (beat16 === 4 || beat16 === 12) {
          this.playSnare(time);
      }
      // Driving Hi-hats every 8th note (0, 2, 4...)
      if (step % 2 === 0) {
          this.playHat(time, false);
      }

      // 2. DRIVING BASS (Running 8ths)
      // Plays on every 8th note
      if (step % 2 === 0) {
          this.playSquareBass(time, rootFreq);
      }

      // 3. ARPEGGIATOR (16th notes background)
      // Creates that rushing feeling. 
      // Em Arp: E G B
      const arpFreqs = [rootFreq * 2, rootFreq * 2 * 1.2, rootFreq * 2 * 1.5]; // Approx Root, min3, 5th
      const arpNote = arpFreqs[step % 3];
      // Play quietly in background
      this.playArp(time, arpNote);

      this.stepCounter++;
  }

  // --- INSTRUMENTS ---

  private playKick(time: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
    
    gain.gain.setValueAtTime(1.0, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.5);
  }

  private playSnare(time: number) {
      if (!this.ctx) return;
      
      // Noise burst
      const noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.1, this.ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for(let i=0; i<data.length; i++) data[i] = (Math.random() * 2 - 1);
      
      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.value = 1000;
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.5, time);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
      
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      // Body tone
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.frequency.setValueAtTime(250, time);
      osc.frequency.exponentialRampToValueAtTime(100, time + 0.1);
      oscGain.gain.setValueAtTime(0.5, time);
      oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
      
      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);

      noise.start(time);
      osc.start(time);
      osc.stop(time + 0.2);
  }

  private playHat(time: number, open: boolean) {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * (open ? 0.1 : 0.05);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 8000;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(open ? 0.3 : 0.1, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + (open ? 0.1 : 0.05));

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(time);
  }

  private playRumbleBass(time: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.value = 43.65; // F1 Sub Bass

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, time);
    filter.frequency.linearRampToValueAtTime(100, time + 0.1);

    gain.gain.setValueAtTime(0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.2);
  }

  private playSquareBass(time: number, freq: number) {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.3, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(time);
      osc.stop(time + 0.2);
  }

  private playArp(time: number, freq: number) {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, time);
      
      // Low volume background
      gain.gain.setValueAtTime(0.05, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(time);
      osc.stop(time + 0.15);
  }

  // The "Player" sound - Acid 303 Style
  private playAcidStab(freq: number) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.value = freq;

    // High Resonance Lowpass
    filter.type = 'lowpass';
    filter.Q.value = 15; 
    filter.frequency.setValueAtTime(200, t);
    filter.frequency.exponentialRampToValueAtTime(3000, t + 0.05); // Attack
    filter.frequency.exponentialRampToValueAtTime(200, t + 0.3); // Decay

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.5, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    osc.start(t);
    osc.stop(t + 0.4);
  }

  // The "Player" sound - Retro Lead Style
  private playRetroLead(freq: number) {
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'square'; // Classic NES/SNES lead
      osc.frequency.setValueAtTime(freq, t);
      
      // Slight vibrato
      const vibOsc = this.ctx.createOscillator();
      const vibGain = this.ctx.createGain();
      vibOsc.frequency.value = 5;
      vibGain.gain.value = 5;
      vibOsc.connect(vibGain);
      vibGain.connect(osc.frequency);
      vibOsc.start(t);
      vibOsc.stop(t+0.3);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.linearRampToValueAtTime(0.3, t + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.4);
  }

  private playNoise(duration: number) {
     if (!this.ctx) return;
     const bufferSize = this.ctx.sampleRate * duration;
     const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
     const data = buffer.getChannelData(0);
     for (let i = 0; i < bufferSize; i++) {
       data[i] = Math.random() * 2 - 1;
     }
     const noise = this.ctx.createBufferSource();
     noise.buffer = buffer;
     const gain = this.ctx.createGain();
     gain.gain.value = 0.2;
     noise.connect(gain);
     gain.connect(this.ctx.destination);
     noise.start();
  }
  
  public getCurrentTime(): number {
    return this.ctx ? this.ctx.currentTime : 0;
  }
}

export const audioService = new TechnoAudio();
