import { GAME_CONFIG } from '../utils/Constants.js';

export class Difficulty {
    constructor() {
        this.currentSpeed = GAME_CONFIG.BASE_SPEED;
        this.level = 1;
    }

    reset() {
        this.currentSpeed = GAME_CONFIG.BASE_SPEED;
        this.level = 1;
    }

    increaseXY() {
        this.currentSpeed += GAME_CONFIG.SPEED_INCREMENT;
        this.level++;
    }

    getSpeed() {
        return this.currentSpeed;
    }
}
