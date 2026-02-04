import LocalizationManager from '../utils/LocalizationManager.js';

export class SettingsMenu {
    constructor(callbacks) {
        this.callbacks = callbacks;
        this.container = document.createElement('div');
        this.container.id = 'settings-menu';
        this.container.style.position = 'absolute';
        this.container.style.top = '0';
        this.container.style.left = '0';
        this.container.style.width = '100%';
        this.container.style.height = '100%';
        this.container.style.display = 'none';
        this.container.style.flexDirection = 'column';
        this.container.style.alignItems = 'center';
        this.container.style.justifyContent = 'center';
        this.container.style.backgroundColor = 'rgba(0,0,0,0.9)';
        this.container.style.zIndex = '1100';

        this.render();
        document.body.appendChild(this.container);
    }

    render() {
        const TXT = (k) => LocalizationManager.get(k);
        const currentLang = LocalizationManager.getCurrentLang();

        this.container.innerHTML = `
            <h2 style="color: white; font-family: Arial; margin-bottom: 30px;">${TXT('SETTINGS')}</h2>
            
            <div style="display: flex; flex-direction: column; gap: 20px; width: 250px;">
                <div style="display: flex; justify-content: space-between; align-items: center; color: white; font-family: Arial;">
                    <span>${TXT('SOUND')}</span>
                    <button id="toggle-sound" style="padding: 5px 15px; border-radius: 15px; border: none; cursor: pointer; background: #4CAF50; color: white;">ON</button>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; color: white; font-family: Arial;">
                    <span>${TXT('MUSIC')}</span>
                    <button id="toggle-music" style="padding: 5px 15px; border-radius: 15px; border: none; cursor: pointer; background: #4CAF50; color: white;">ON</button>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; color: white; font-family: Arial;">
                    <span>${TXT('LANGUAGE')}</span>
                    <button id="toggle-lang" style="padding: 5px 15px; border-radius: 15px; border: none; cursor: pointer; background: #2196F3; color: white;">${currentLang}</button>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; color: white; font-family: Arial;">
                    <span>${TXT('VIBRATION')}</span>
                    <button id="toggle-haptic" style="padding: 5px 15px; border-radius: 15px; border: none; cursor: pointer; background: #4CAF50; color: white;">ON</button>
                </div>
                
                <a href="https://yoursite.com/privacy" target="_blank" style="color: #aaa; text-align: center; font-family: Arial; font-size: 12px; margin-top: 20px;">${TXT('PRIVACY')}</a>
                
                <button id="btn-close-settings" style="margin-top: 20px; padding: 10px; border-radius: 20px; border: none; background: #555; color: white; cursor: pointer;">${TXT('CLOSE')}</button>
            </div>
        `;

        // Re-bind events after render
        this.container.querySelector('#btn-close-settings').onclick = () => this.hide();

        this.sndBtn = this.container.querySelector('#toggle-sound');
        this.musBtn = this.container.querySelector('#toggle-music');
        this.vibBtn = this.container.querySelector('#toggle-haptic');
        this.langBtn = this.container.querySelector('#toggle-lang');

        this.sndBtn.onclick = () => {
            const muted = this.callbacks.onToggleSound();
            this.updateButtons(muted, null, null);
        };

        this.musBtn.onclick = () => {
            const muted = this.callbacks.onToggleMusic();
            this.updateButtons(null, muted, null);
        };

        this.vibBtn.onclick = () => {
            const enabled = this.callbacks.onToggleHaptic();
            this.updateButtons(null, null, enabled);
        };

        this.langBtn.onclick = () => {
            const newLang = currentLang === 'EN' ? 'TR' : 'EN';
            LocalizationManager.setLanguage(newLang);
        };
    }

    show(isMuted, isMusicMuted, isHapticEnabled) {
        this.updateButtons(isMuted, isMusicMuted, isHapticEnabled);
        this.container.style.display = 'flex';
    }

    // ... hide ...

    updateButtons(isSoundMuted, isMusicMuted, isHapticEnabled) {
        if (isSoundMuted !== null && isSoundMuted !== undefined) {
            this.sndBtn.innerText = isSoundMuted ? 'OFF' : 'ON';
            this.sndBtn.style.background = isSoundMuted ? '#f44336' : '#4CAF50';
        }
        if (isMusicMuted !== null && isMusicMuted !== undefined) {
            this.musBtn.innerText = isMusicMuted ? 'OFF' : 'ON';
            this.musBtn.style.background = isMusicMuted ? '#f44336' : '#4CAF50';
        }
        if (isHapticEnabled !== null && isHapticEnabled !== undefined) {
            this.vibBtn.innerText = isHapticEnabled ? 'ON' : 'OFF';
            this.vibBtn.style.background = isHapticEnabled ? '#4CAF50' : '#f44336';
        }
    }
}
