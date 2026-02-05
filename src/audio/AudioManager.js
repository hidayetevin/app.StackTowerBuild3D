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

        // Music Properties
        this.bgmBuffer = null;
        this.bgmSource = null;
        this.bgmSpeed = 1.0;
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

    async loadAll() {
        if (!this.initialized) this.init();

        // Load Music
        try {
            const response = await fetch('assets/music.mp3');
            const arrayBuffer = await response.arrayBuffer();
            this.bgmBuffer = await this.context.decodeAudioData(arrayBuffer);
            console.log("Music Loaded");
        } catch (e) {
            console.warn('Failed to load music', e);
        }

        return Promise.resolve();
    }

    playMusic() {
        if (!this.initialized || !this.bgmBuffer || this.isPlayingMusic) return;

        // Stop previous instance if any
        if (this.bgmSource) {
            try { this.bgmSource.stop(); } catch (e) { }
        }

        this.bgmSource = this.context.createBufferSource();
        this.bgmSource.buffer = this.bgmBuffer;
        this.bgmSource.loop = true; // Loop is handled natively by Web Audio API
        this.bgmSource.playbackRate.value = this.bgmSpeed;

        this.bgmSource.connect(this.musicGain);
        this.bgmSource.start(0);

        this.isPlayingMusic = true;
    }

    stopMusic() {
        if (this.bgmSource) {
            try { this.bgmSource.stop(); } catch (e) { }
            this.bgmSource = null;
        }
        this.isPlayingMusic = false;
    }

    setMusicSpeed(speed) {
        // Map game speed (usually 5.0 base) to playback rate (1.0 base)
        // Adjust these factors based on game feel. 
        // Example: speed 5 -> 1.0, speed 10 -> 1.5
        // Or pass in a normalized multiplier directly.

        // Assuming 'speed' passed here is the Game Speed Multiplier (1.0 + increment) or raw speed?
        // Let's assume normalized multiplier (1.0, 1.1, 1.2...)
        this.bgmSpeed = 0.8 + (speed * 0.2); // Start slightly slower, ramp up

        // Clamp
        if (this.bgmSpeed < 0.5) this.bgmSpeed = 0.5;
        if (this.bgmSpeed > 2.0) this.bgmSpeed = 2.0;

        if (this.bgmSource) {
            // Smooth transition
            this.bgmSource.playbackRate.setTargetAtTime(this.bgmSpeed, this.context.currentTime, 0.5);
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
        if (this.isMusicMuted) {
            // Optionally pause source, but mute via Gain is easier for sync
        }
        return this.isMusicMuted;
    }

    applyMuteState() {
        if (!this.masterGain) return;
        this.sfxGain.gain.setTargetAtTime(this.isMuted ? 0 : 1.0, this.context.currentTime, 0.1);
        this.musicGain.gain.setTargetAtTime((this.isMuted || this.isMusicMuted) ? 0 : 0.3, this.context.currentTime, 0.1);
    }
}

export default new AudioManager();
