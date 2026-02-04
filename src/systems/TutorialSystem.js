import { SaveSystem } from './SaveSystem.js';

// TutorialSystem.js
export class TutorialSystem {
    constructor(game) {
        this.game = game; // Reference to game to control speed etc.
        this.saveSystem = new SaveSystem();

        this.states = {
            NOT_STARTED: 0,
            STEP_1_TAP: 1,      // "Tap to drop block"
            STEP_2_PERFECT: 2,  // "Align perfectly!"
            STEP_3_COMBO: 3,    // "Build a combo!"
            COMPLETED: 4
        };

        this.currentState = this.states.NOT_STARTED;
        this.skipTimer = 0;
        this.showSkipAfter = 3.0; // 3 seconds
        this.overlay = null; // Will be set by Game or injected
    }

    setOverlay(overlay) {
        this.overlay = overlay;
    }

    isCompleted() {
        return this.saveSystem.get('tutorial_completed', false);
    }

    start() {
        if (this.isCompleted()) return;

        this.currentState = this.states.STEP_1_TAP;
        if (this.overlay) this.overlay.showHint("Tap to drop the block!");

        // Assist mode: slow down game (we need to implement setTimeScale in Game or Difficulty)
        // For now, assuming Game has a method or we access difficulty directly
        if (this.game.setSpeedMultiplier) {
            this.game.setSpeedMultiplier(0.5); // Slower for tutorial
        }
    }

    onBlockPlaced(result) {
        if (this.currentState === this.states.COMPLETED) return;

        switch (this.currentState) {
            case this.states.STEP_1_TAP:
                this.currentState = this.states.STEP_2_PERFECT;
                if (this.overlay) this.overlay.showHint("Try to align perfectly!");
                break;

            case this.states.STEP_2_PERFECT:
                if (result.isPerfect) {
                    this.currentState = this.states.STEP_3_COMBO;
                    if (this.overlay) this.overlay.showHint("Keep going for a combo!");
                } else {
                    if (this.overlay) this.overlay.showHint("Try to align perfectly!"); // Repeat hint
                }
                break;

            case this.states.STEP_3_COMBO:
                // Check if we have a combo (requires access to Scoring)
                // Assuming result passed from Game.js has combo info or we check Game.scoring
                if (this.game.scoring && this.game.scoring.getCombo() >= 3) {
                    this.complete();
                }
                break;
        }
    }

    complete() {
        this.currentState = this.states.COMPLETED;
        this.saveSystem.set('tutorial_completed', true);
        // Analytics.track('tutorial_complete');

        if (this.overlay) this.overlay.hide();

        // Return to normal speed
        if (this.game.setSpeedMultiplier) {
            this.game.setSpeedMultiplier(1.0);
        }
    }

    skip() {
        this.complete();
        // Analytics.track('tutorial_skipped', { step: this.currentState });
    }
}
