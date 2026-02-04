import { SaveSystem } from './SaveSystem.js';
import Analytics from '../analytics/Analytics.js';
import LocalizationManager from '../utils/LocalizationManager.js';

export class TutorialSystem {
    constructor(game) {
        this.game = game;
        this.saveSystem = new SaveSystem();

        this.states = {
            NOT_STARTED: 0,
            STEP_1_TAP: 1,
            STEP_2_PERFECT: 2,
            STEP_3_COMBO: 3,
            COMPLETED: 4
        };

        this.currentState = this.states.NOT_STARTED;
        this.skipTimer = 0;
        this.showSkipAfter = 3.0;
        this.overlay = null;
    }

    setOverlay(overlay) {
        this.overlay = overlay;
    }

    isCompleted() {
        return this.saveSystem.get('tutorial_completed', false);
    }

    _T(key, fallback) {
        // Simple helper to not break flow if key missing, but ideal is straight LocMan.get
        const val = LocalizationManager.get(key);
        return val === key ? fallback : val;
    }

    start() {
        if (this.isCompleted()) return;

        this.currentState = this.states.STEP_1_TAP;
        // Use hardcoded fallback strings compatible with english if keys missing
        if (this.overlay) this.overlay.showHint("Tap to drop!");

        if (this.game.setSpeedMultiplier) {
            this.game.setSpeedMultiplier(0.5);
        }
    }

    onBlockPlaced(result) {
        if (this.currentState === this.states.COMPLETED) return;

        switch (this.currentState) {
            case this.states.STEP_1_TAP:
                this.currentState = this.states.STEP_2_PERFECT;
                if (this.overlay) this.overlay.showHint("Align perfectly!");
                break;

            case this.states.STEP_2_PERFECT:
                if (result.isPerfect) {
                    this.currentState = this.states.STEP_3_COMBO;
                    if (this.overlay) this.overlay.showHint("Make combos!");
                } else {
                    if (this.overlay) this.overlay.showHint("Align perfectly!");
                }
                break;

            case this.states.STEP_3_COMBO:
                if (this.game.scoring && this.game.scoring.getCombo() >= 3) {
                    this.complete();
                }
                break;
        }
    }

    complete() {
        this.currentState = this.states.COMPLETED;
        this.saveSystem.set('tutorial_completed', true);
        Analytics.track('tutorial_complete');
        if (this.overlay) this.overlay.hide();
        if (this.game.setSpeedMultiplier) {
            this.game.setSpeedMultiplier(1.0);
        }
    }

    skip() {
        this.complete();
        Analytics.track('tutorial_skipped', { step: this.currentState });
    }
}
