import { SaveSystem } from '../systems/SaveSystem.js';

export class ChallengeManager {
    constructor() {
        this.saveSystem = new SaveSystem();
        this.challenges = [];
        this.activeChallenge = null;
        this.activeMode = false;

        // Progress tracking
        this.currentProgress = 0;
    }

    async loadChallenges() {
        try {
            const response = await fetch('assets/challenges.json');
            const data = await response.json();
            this.challenges = data.challenges;
        } catch (e) {
            console.error('Failed to load challenges');
        }
    }

    getTodaysChallenge() {
        if (this.challenges.length === 0) return null;
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
        return this.challenges[dayOfYear % this.challenges.length];
    }

    startChallenge(challenge) {
        this.activeChallenge = challenge;
        this.activeMode = true;
        this.currentProgress = 0;

        // Return config overrides for Game
        return {
            isChallenge: true,
            type: challenge.type,
            target: challenge.target,
            options: challenge
        };
    }

    stopChallenge() {
        this.activeMode = false;
        this.activeChallenge = null;
    }

    updateProgress(metric, value) {
        if (!this.activeMode || !this.activeChallenge) return false;

        if (this.activeChallenge.type === 'perfect_streak') {
            if (metric === 'perfect_hit') {
                this.currentProgress++;
            } else if (metric === 'block_placed') {
                // Reset streak if block placed but not perfect? 
                // Dependent on metric source. Usually block_placed comes with result.
                // Assuming caller logic handles "streak break" logic or sends explicit "reset".
            } else if (metric === 'reset_streak') {
                this.currentProgress = 0;
            }
        }
        else if (this.activeChallenge.type === 'special_condition' || this.activeChallenge.type === 'timed') {
            if (metric === 'score' || metric === 'blocks_placed') {
                this.currentProgress = value;
            }
        }

        // Check completion
        if (this.currentProgress >= this.activeChallenge.target) {
            return true; // Completed
        }
        return false;
    }
}
