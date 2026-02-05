import LocalizationManager from '../utils/LocalizationManager.js';
import { RetentionSystem } from '../systems/RetentionSystem.js'; // Ensure we can access saved coins if needed, but easier is pass value

export class MainMenu {
    constructor(callbacks) {
        this.callbacks = callbacks;
        this.container = document.createElement('div');
        this.container.id = 'main-menu';
        this.container.style.position = 'absolute';
        this.container.style.top = '0';
        this.container.style.left = '0';
        this.container.style.width = '100%';
        this.container.style.height = '100%';
        this.container.style.boxSizing = 'border-box'; // Space for Banner
        this.container.style.paddingBottom = '60px';
        this.container.style.display = 'flex';
        this.container.style.flexDirection = 'column';
        this.container.style.alignItems = 'center';
        this.container.style.justifyContent = 'center';
        this.container.style.backgroundColor = 'rgba(0,0,0,0.4)';
        this.container.style.backdropFilter = 'blur(5px)';
        this.container.style.zIndex = '1000';
        this.container.style.pointerEvents = 'auto';

        const TXT = (k) => LocalizationManager.get(k);

        this.container.innerHTML = `
            <div id="main-menu-coins" style="position:absolute; top:30px; right:30px; background:rgba(0,0,0,0.6); padding:8px 15px; border-radius:20px; color:#FFD700; font-family:Arial; font-weight:bold; display:flex; align-items:center; gap:8px;">
                <span>💰</span><span id="mm-coin-val">0</span>
            </div>

            <h1 style="color:white; font-size:48px; font-family:Arial,sans-serif; margin-bottom: 30px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">Stack Tower 3D</h1>
            
            <button id="btn-play" style="padding: 15px 60px; font-size: 24px; border: none; border-radius: 30px; background: #4CAF50; color: white; cursor: pointer; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">${TXT('PLAY')}</button>
            
            <div style="display:flex; gap:15px; margin-bottom: 20px;">
                <button id="btn-skins" style="padding: 10px 20px; border-radius: 20px; border:none; background: #9C27B0; color: white; cursor: pointer;">${TXT('SKINS')}</button>
            </div>
            
            <button id="btn-challenge" style="padding: 10px 40px; border-radius: 20px; border:none; background: #FF9800; color: white; cursor: pointer; margin-bottom: 20px; font-weight:bold;">🏆 ${TXT('CHALLENGE')}</button>
            
            <button id="btn-settings" style="padding: 10px 30px; font-size: 14px; border: none; border-radius: 20px; background: #2196F3; color: white; cursor: pointer;">${TXT('SETTINGS')}</button>
            
            <div style="color: white; font-family: Arial; font-size: 12px; margin-top: 30px; opacity:0.7;">v1.2.0</div>
        `;

        document.body.appendChild(this.container);

        this.container.querySelector('#btn-play').addEventListener('click', () => this.onPlay());
        this.container.querySelector('#btn-settings').addEventListener('click', () => this.onSettings());

        this.container.querySelector('#btn-skins').addEventListener('click', () => callbacks.onSkins && callbacks.onSkins());
        this.container.querySelector('#btn-challenge').addEventListener('click', () => callbacks.onChallenge && callbacks.onChallenge());
    }

    updateCoins(amount) {
        const el = this.container.querySelector('#mm-coin-val');
        if (el) el.innerText = amount;
    }

    onPlay() {
        if (this.callbacks.onPlay) this.callbacks.onPlay();
        this.hide();
    }

    onSettings() {
        if (this.callbacks.onSettings) this.callbacks.onSettings();
    }

    show() {
        this.container.style.display = 'flex';
    }

    hide() {
        this.container.style.display = 'none';
    }
}
