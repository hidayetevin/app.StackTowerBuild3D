import * as THREE from 'three';
import AudioManager from '../audio/AudioManager.js';

export class ThemeManager {
    constructor(saveSystem, sceneManager) {
        this.saveSystem = saveSystem;
        this.sceneManager = sceneManager;
        this.themes = [];
        this.currentThemeId = this.saveSystem.get('current_theme', 'sky_world');
        this.unlockedThemes = this.saveSystem.get('unlocked_themes', ['sky_world']);
        this.trialUsed = this.saveSystem.get('theme_trial_used', {});
    }

    async loadThemes() {
        try {
            const response = await fetch('assets/themes.json');
            const data = await response.json();
            this.themes = data.themes;
            this.applyTheme(this.currentThemeId);
        } catch (e) {
            console.error('Failed to load themes', e);
        }
    }

    getThemes() {
        return this.themes.map(t => ({
            ...t,
            unlocked: this.unlockedThemes.includes(t.id),
            trialUsed: !!this.trialUsed[t.id]
        }));
    }

    isUnlocked(themeId) {
        return this.unlockedThemes.includes(themeId);
    }

    unlockTheme(themeId) {
        if (!this.unlockedThemes.includes(themeId)) {
            this.unlockedThemes.push(themeId);
            this.saveSystem.set('unlocked_themes', this.unlockedThemes);
            return true;
        }
        return false;
    }

    markTrialUsed(themeId) {
        this.trialUsed[themeId] = true;
        this.saveSystem.set('theme_trial_used', this.trialUsed);
    }

    applyTheme(themeId, isTemporary = false) {
        const theme = this.themes.find(t => t.id === themeId);
        if (!theme) return false;

        if (!isTemporary && !this.isUnlocked(themeId)) return false;

        if (!isTemporary) {
            this.currentThemeId = themeId;
            this.saveSystem.set('current_theme', themeId);
        }

        if (this.sceneManager) {
            this.sceneManager.applyTheme(theme);
        }

        document.documentElement.style.setProperty('--accent-color', theme.uiAccent || '#4CAF50');
        return true;
    }

    checkAutoUnlock(score) {
        let unlockedAny = false;

        this.themes.forEach(theme => {
            if (!this.isUnlocked(theme.id) &&
                theme.unlockMethod === 'score_threshold' &&
                score >= theme.unlockValue) {

                this.unlockTheme(theme.id);
                unlockedAny = true;

                const event = new CustomEvent('theme-unlocked', { detail: { name: theme.name } });
                window.dispatchEvent(event);
            }
        });

        return unlockedAny;
    }
}
