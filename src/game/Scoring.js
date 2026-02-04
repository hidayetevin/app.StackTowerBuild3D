export class Scoring {
    constructor() {
        this.score = 0;
        this.highScore = 0; // In a real app, load this from storage
        this.combo = 0;
        this.perfectHits = 0;
    }

    reset() {
        this.score = 0;
        this.combo = 0;
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
        // Maybe add bonus points for combos
        this.score += this.combo; // Bonus points
    }

    resetCombo() {
        this.combo = 0;
    }

    getScore() {
        return this.score;
    }

    getCombo() {
        return this.combo;
    }
}
