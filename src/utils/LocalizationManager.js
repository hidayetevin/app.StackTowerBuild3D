import { SaveSystem } from '../systems/SaveSystem.js';
import { TEXTS as RAW_TEXTS } from './Localization.js';

class LocalizationManager {
    constructor() {
        this.saveSystem = new SaveSystem();
        this.currentLang = this.saveSystem.get('language', 'EN');
        // Fallback to EN if RAW_TEXTS is somehow missing the key or corrupt
        this.texts = RAW_TEXTS[this.currentLang] || RAW_TEXTS['EN'];
    }

    setLanguage(lang) {
        if (RAW_TEXTS[lang]) {
            this.currentLang = lang;
            this.texts = RAW_TEXTS[lang];
            this.saveSystem.set('language', lang);

            // Dispatch event for UI updates
            window.dispatchEvent(new CustomEvent('language-changed', { detail: lang }));

            // Reload page to apply changes simply (or verify rigorous UI update support)
            // For this project, reloading is safest/easiest to update all static texts.
            // But we can try dynamic update if UIs subscribe.
            setTimeout(() => location.reload(), 100);
        }
    }

    get(key) {
        return this.texts && this.texts[key] ? this.texts[key] : key;
    }

    getCurrentLang() {
        return this.currentLang;
    }
}

export default new LocalizationManager();
