export class SkinManager {
    constructor(saveSystem, tower) {
        this.saveSystem = saveSystem;
        this.tower = tower;
        this.skins = [];
        this.currentSkinId = this.saveSystem.get('current_skin', 'default');
        this.unlockedSkins = this.saveSystem.get('unlocked_skins', ['default']);
    }

    async loadSkins() {
        try {
            const response = await fetch('assets/skins.json');
            const data = await response.json();
            this.skins = data.skins;
            this.applySkin(this.currentSkinId);
        } catch (e) {
            console.error('Failed to load skins', e);
            this.skins = [{
                id: 'default', name: 'Classic', unlocked: true, color: '#4CAF50'
            }];
        }
    }

    getSkins() {
        return this.skins.map(s => ({
            ...s,
            unlocked: this.unlockedSkins.includes(s.id)
        }));
    }

    isUnlocked(skinId) {
        return this.unlockedSkins.includes(skinId);
    }

    unlockSkin(skinId) {
        if (!this.unlockedSkins.includes(skinId)) {
            this.unlockedSkins.push(skinId);
            this.saveSystem.set('unlocked_skins', this.unlockedSkins);

            // Notify / Toast (Optional)
            console.log(`Unlocked skin: ${skinId}`);

            return true;
        }
        return false;
    }

    applySkin(skinId) {
        if (!this.isUnlocked(skinId)) return false;

        const skin = this.skins.find(s => s.id === skinId);
        if (!skin) return false;

        this.currentSkinId = skinId;
        this.saveSystem.set('current_skin', skinId);

        if (this.tower && this.tower.setBlockStyle) {
            this.tower.setBlockStyle(skin);
        }
        return true;
    }

    checkAutoUnlock(score) {
        let unlockedAny = false;

        this.skins.forEach(skin => {
            if (!this.isUnlocked(skin.id) &&
                skin.unlockMethod === 'score_threshold' &&
                score >= skin.unlockValue) {

                this.unlockSkin(skin.id);
                unlockedAny = true;

                // Show simple toast or alert (Could remain silent or use game UI)
                // For now, console log and hopefully UI toast if available
                const event = new CustomEvent('skin-unlocked', { detail: { name: skin.name } });
                window.dispatchEvent(event);
            }
        });

        return unlockedAny;
    }
}
