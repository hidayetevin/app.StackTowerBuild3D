export class Scoring {
    constructor() {
        this.score = 0;
        this.highScore = 0;
        this.combo = 0;
        this.perfectHits = 0;

        this.accuracyStreak = 0; // Streak for >= 70% accuracy
    }

    reset() {
        this.score = 0;
        this.combo = 0;
        this.accuracyStreak = 0;
    }

    addPoint() {
        this.score++;
        if (this.score > this.highScore) {
            this.highScore = this.score;
        }
        return this.score;
    }

    registerPerfectHit() {
        this.combo++;
        this.perfectHits++;
        this.score += this.combo;
    }

    resetCombo() {
        this.combo = 0;
    }

    // Updates accuracy streak logic
    // Returns true if a coin should be awarded
    checkAccuracyStreak(percentage) {
        if (percentage >= 0.70) {
            this.accuracyStreak++;
            if (this.accuracyStreak >= 5) {
                this.accuracyStreak = 0; // Reset after reward
                return true; // Award coin!
            }
        } else {
            this.accuracyStreak = 0; // Reset on bad hit
        }
        return false;
    }

    getScore() {
        return this.score;
    }

    getCombo() {
        return this.combo;
    }
}
