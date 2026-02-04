import { SaveSystem } from '../systems/SaveSystem.js';

class AudioManager {
    constructor() {
        this.context = null;
        this.masterGain = null;
        this.musicGain = null;
        this.sfxGain = null;

        this.musicNode = null;
        this.buffers = {};

        this.saveSystem = new SaveSystem();
        this.isMuted = this.saveSystem.get('audio_muted', false);
        this.isMusicMuted = this.saveSystem.get('music_muted', false);

        // Define paths
        this.sounds = {
            tap: 'assets/audio/sfx/tap.mp3',
            perfect: 'assets/audio/sfx/perfect.mp3',
            combo: 'assets/audio/sfx/combo.mp3',
            fail: 'assets/audio/sfx/fail.mp3',
            theme: 'assets/audio/music/ambient_loop.ogg'
        };

        this.initialized = false;
    }

    init() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.context = new AudioContext();

            // Master Gain
            this.masterGain = this.context.createGain();
            this.masterGain.connect(this.context.destination);

            // Music Gain
            this.musicGain = this.context.createGain();
            this.musicGain.connect(this.masterGain);

            // SFX Gain
            this.sfxGain = this.context.createGain();
            this.sfxGain.connect(this.masterGain);

            this.applyMuteState();

            this.initialized = true;
            console.log('Audio Context Initialized');

            // Resume context if suspended (browser autoplay policy)
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

        const promises = Object.entries(this.sounds).map(async ([key, url]) => {
            try {
                const response = await fetch(url);
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
                this.buffers[key] = audioBuffer;
            } catch (e) {
                console.warn(`Failed to load audio: ${url}`, e);
                // Creating a dummy buffer so game doesn't crash on play
                // 1 second of silence
                if (this.context) {
                    this.buffers[key] = this.context.createBuffer(1, this.context.sampleRate, this.context.sampleRate);
                }
            }
        });

        await Promise.all(promises);
    }

    playSound(name) {
        if (!this.initialized || !this.buffers[name]) return;

        const source = this.context.createBufferSource();
        source.buffer = this.buffers[name];
        source.connect(this.sfxGain);
        source.start(0);
    }

    playMusic(name = 'theme') {
        if (!this.initialized || !this.buffers[name]) return;
        if (this.musicNode) return; // Already playing

        this.musicNode = this.context.createBufferSource();
        this.musicNode.buffer = this.buffers[name];
        this.musicNode.loop = true;
        this.musicNode.connect(this.musicGain);
        this.musicNode.start(0);
    }

    stopMusic() {
        if (this.musicNode) {
            this.musicNode.stop();
            this.musicNode = null;
        }
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

        // Master Mute
        this.sfxGain.gain.value = this.isMuted ? 0 : 1;

        // Music Mute (Independent + Master)
        this.musicGain.gain.value = (this.isMuted || this.isMusicMuted) ? 0 : 0.5; // Music quieter
    }
}

export default new AudioManager();
