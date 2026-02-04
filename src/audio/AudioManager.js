import { SaveSystem } from '../systems/SaveSystem.js';

class AudioManager {
    constructor() {
        this.context = null;
        this.masterGain = null;
        this.musicGain = null;
        this.sfxGain = null;

        this.saveSystem = new SaveSystem();
        this.isMuted = this.saveSystem.get('audio_muted', false);
        this.isMusicMuted = this.saveSystem.get('music_muted', false);

        this.initialized = false;

        // Melody for background (simple sequence)
        this.melodyNotes = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25]; // C Major
        this.melodyIndex = 0;
        this.nextNoteTime = 0;
        this.isPlayingMusic = false;
    }

    init() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.context = new AudioContext();

            this.masterGain = this.context.createGain();
            this.masterGain.connect(this.context.destination);

            this.musicGain = this.context.createGain();
            this.musicGain.connect(this.masterGain);

            this.sfxGain = this.context.createGain();
            this.sfxGain.connect(this.masterGain);

            this.applyMuteState();

            this.initialized = true;
            console.log('Audio (Procedural) Initialized');

            this.resumeContext();

        } catch (e) {
            console.warn('Web Audio API not supported', e);
        }
    }

    resumeContext() {
        if (this.context && this.context.state === 'suspended') {
            const resume = () => {
                this.context.resume();
                document.removeEventListener('click', resume);
                document.removeEventListener('touchstart', resume);
            };
            document.addEventListener('click', resume);
            document.addEventListener('touchstart', resume);
        }
    }

    // Procedural Sound Generation (No assets needed!)
    playSound(name, pitchMultiplier = 1.0) {
        if (!this.initialized || this.isMuted) return;
        this.resumeContext();

        const osc = this.context.createOscillator();
        const gain = this.context.createGain();

        osc.connect(gain);
        gain.connect(this.sfxGain);

        const now = this.context.currentTime;

        switch (name) {
            case 'tap':
                // Short Tick
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
                gain.gain.setValueAtTime(0.5, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;

            case 'perfect':
                // High Ping form C5 to C6
                osc.type = 'triangle';
                const baseFreq = 523.25 * pitchMultiplier;
                osc.frequency.setValueAtTime(baseFreq, now); // C5 scaled
                osc.frequency.exponentialRampToValueAtTime(baseFreq * 2.0, now + 0.1); // C6 scaled
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.3);
                break;

            case 'combo':
                // Ascending Arpeggio scaled
                this.playTone(523.25 * pitchMultiplier, now, 0.1, 'sine');
                this.playTone(659.25 * pitchMultiplier, now + 0.1, 0.1, 'sine');
                this.playTone(783.99 * pitchMultiplier, now + 0.2, 0.2, 'sine');
                break;

            case 'fail':
                // Low descending buzz
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(100, now);
                osc.frequency.linearRampToValueAtTime(50, now + 0.5);
                gain.gain.setValueAtTime(0.5, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.5);
                osc.start(now);
                osc.stop(now + 0.5);
                break;
        }
    }

    playTone(freq, time, duration, type = 'sine') {
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        osc.connect(gain);
        gain.connect(this.sfxGain);
        gain.gain.setValueAtTime(0.3, time);
        gain.gain.linearRampToValueAtTime(0.01, time + duration);
        osc.start(time);
        osc.stop(time + duration);
    }

    // Simple procedural ambient loop
    playMusic() {
        if (!this.initialized || this.isPlayingMusic) return;
        this.isPlayingMusic = true;
        this.scheduleNextNote();
    }

    scheduleNextNote() {
        if (!this.isPlayingMusic) return;

        // Simple generative ambient: random notes from C Major scale
        // Very slow, ambient feel
        const duration = 2.0;
        const now = this.context.currentTime;
        const nextTime = Math.max(now, this.nextNoteTime);

        if (nextTime - now < 0.1) {
            const note = this.melodyNotes[Math.floor(Math.random() * this.melodyNotes.length)];
            // Shift octave randomly
            const octave = Math.random() > 0.5 ? 1 : 0.5;

            const osc = this.context.createOscillator();
            const gain = this.context.createGain();

            osc.type = 'sine';
            osc.frequency.value = note * octave;

            // Soft attack and release for ambient pad effect
            gain.connect(this.musicGain);
            gain.gain.setValueAtTime(0, nextTime);
            gain.gain.linearRampToValueAtTime(0.2, nextTime + 1.0);
            gain.gain.linearRampToValueAtTime(0, nextTime + duration);

            osc.start(nextTime);
            osc.stop(nextTime + duration);

            this.nextNoteTime = nextTime + 1.5; // Overlap slightly
        }

        // Loop check
        requestAnimationFrame(() => this.scheduleNextNote());
    }

    stopMusic() {
        this.isPlayingMusic = false;
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        this.saveSystem.set('audio_muted', this.isMuted);
        this.applyMuteState();
        return this.isMuted;
    }

    toggleMusic() {
        this.isMusicMuted = !this.isMusicMuted;
        this.saveSystem.set('music_muted', this.isMusicMuted);
        this.applyMuteState();
        return this.isMusicMuted;
    }

    applyMuteState() {
        if (!this.masterGain) return;
        this.sfxGain.gain.setTargetAtTime(this.isMuted ? 0 : 1.0, this.context.currentTime, 0.1);
        this.musicGain.gain.setTargetAtTime((this.isMuted || this.isMusicMuted) ? 0 : 0.3, this.context.currentTime, 0.1);
    }

    // Placeholder to satisfy interface but we play procedural music immediately
    loadAll() {
        if (!this.initialized) this.init();
        return Promise.resolve();
    }
}

export default new AudioManager();
