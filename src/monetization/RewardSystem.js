import { Game } from '../core/Game.js'; // You might need to access Game instance or pass it
// To avoid circular dependency, strategies:
// 1. Pass callback function to RewardSystem
// 2. Access a global Game instance (window.game) - risky but common in simple games
// 3. Make Game listen to Reward events
// We'll use window.game for simplicity as established in main.js, or better, accept a game instance in init/methods.
// However, AdsManager imports RewardSystem, and AdsManager is likely a specific instance.
// Let's assume we can access game actions via window.game for this hyper-casual setup.

export class RewardSystem {
    grantReward(type) {
        console.log(`Granting Reward: ${type}`);

        // Ensure game instance is available
        const game = window.game;
        if (!game) {
            console.warn('Game instance not found for granting reward');
            return;
        }

        switch (type) {
            case 'continue':
                // Continue game from game over state
                // We need to implement continue logic in Game.js
                if (game.continueGame) game.continueGame();
                break;

            case 'double_score':
                // Double current score
                if (game.scoring) {
                    game.scoring.multiplyScore(2);
                    game.hud.updateScore(game.scoring.getScore());
                }
                break;

            case 'bonus_shield':
                // Activate shield (invincibility/no slice for next error)
                if (game.activateShield) game.activateShield();
                break;

            case 'slow_motion':
                // Slow down temporarily
                if (game.activateSlowMotion) game.activateSlowMotion();
                break;

            case 'coins':
                // Retention/Economy system
                // game.retentionSystem.addCoins(100);
                console.log("Coins added (Logic to be implemented in RetentionSystem)");
                break;

            default:
                console.warn('Unknown reward type:', type);
        }
    }
}

export default new RewardSystem();
