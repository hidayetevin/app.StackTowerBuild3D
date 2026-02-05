import AdsManager from '../monetization/AdsManager.js';
import LocalizationManager from '../utils/LocalizationManager.js';

export class SkinScreen {
    constructor(skinManager, analytics) {
        this.skinManager = skinManager;
        this.analytics = analytics;
        this.retentionSystem = null;

        this.container = document.createElement('div');
        this.container.id = 'skin-screen';
        this.container.style.cssText = `
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.9); z-index: 1200; display: none;
            flex-direction: column; align-items: center; justify-content: center;
            pointer-events: auto;
        `;

        this.buildUI();
        if (document.body) document.body.appendChild(this.container);
    }

    buildUI() {
        this.container.innerHTML = `
            <div id="skin-balance" style="position:absolute; top:20px; right:20px; color:#FFD700; font-size:24px; font-weight:bold;"></div>
            <h2 id="skin-title" style="color:white; font-family:Arial; margin-bottom:15px; margin-top: 10px;">SKINS</h2>
            <div id="skin-list" style="display:grid; grid-template-columns: repeat(3, 1fr); gap:10px; justify-items:center; width: 95%; max-height: 65vh; overflow-y: auto; padding: 10px;"></div>
            <p id="skin-msg" style="color:white; margin-top:10px; font-size: 14px; font-style:italic; height:20px;"></p>
            <button id="btn-close-skins" style="margin-top:10px; margin-bottom: 20px; padding:12px 40px; border-radius:30px; border:none; background:#555; color:white; font-size:18px; font-weight:bold; cursor:pointer; pointer-events:auto;">CLOSE</button>
        `;

        this.container.querySelector('#btn-close-skins').addEventListener('click', () => this.hide());
    }

    setRetentionSystem(rs) {
        this.retentionSystem = rs;
    }

    show() {
        const TXT = (k) => LocalizationManager.get(k);

        // Update Static Texts
        this.container.querySelector('#skin-title').innerText = TXT('SKINS');
        this.container.querySelector('#btn-close-skins').innerText = TXT('CLOSE');

        if (!this.container.parentElement && document.body) document.body.appendChild(this.container);

        this.container.style.display = 'flex';
        this.updateBalance();
        this.renderList();
        this.analytics.track('skin_screen_opened');
    }

    updateBalance() {
        if (this.retentionSystem) {
            this.container.querySelector('#skin-balance').innerText = `💰 ${this.retentionSystem.getCoins()}`;
        }
    }

    hide() {
        this.container.style.display = 'none';
        const msgEl = this.container.querySelector('#skin-msg');
        if (msgEl) msgEl.innerText = '';
    }

    renderList() {
        const list = this.container.querySelector('#skin-list');
        list.innerHTML = '';
        const TXT = (k) => LocalizationManager.get(k);

        const skins = this.skinManager.getSkins();

        skins.forEach(skin => {
            const el = document.createElement('div');
            el.style.cssText = `
                width: 85px; height: 105px; border-radius: 10px;
                background: #333; 
                border: 3px solid ${skin.unlocked ? (this.skinManager.currentSkinId === skin.id ? '#FFFF00' : 'white') : '#555'};
                display:flex; flex-direction:column; align-items:center; justify-content:flex-start;
                cursor: pointer; position: relative; opacity: ${skin.unlocked ? 1 : 0.8};
                overflow: hidden; pointer-events: auto;
            `;

            // Preview Color
            const colorDiv = document.createElement('div');
            colorDiv.style.width = '100%';
            colorDiv.style.height = '60px';
            colorDiv.style.background = skin.color;
            colorDiv.style.display = 'flex';
            colorDiv.style.alignItems = 'center';
            colorDiv.style.justifyContent = 'center';

            if (skin.patternType) {
                let patternHTML = '';
                const size = '30px';
                const opacity = '0.7';

                if (skin.patternType === 1) { // Star
                    patternHTML = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="white" style="opacity:${opacity};"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
                } else if (skin.patternType === 2) { // Heart
                    patternHTML = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="white" style="opacity:${opacity};"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
                } else if (skin.patternType === 3) { // Moon
                    patternHTML = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="white" style="opacity:${opacity};"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-3.03 0-5.5-2.47-5.5-5.5 0-1.82.89-3.42 2.26-4.4C12.92 3.04 12.46 3 12 3z"/></svg>`;
                } else if (skin.patternType === 4) { // Polka
                    patternHTML = `<div style="display:flex; flex-wrap:wrap; width:100%; height:100%; justify-content:space-around; align-items:center;">
                        <div style="width:8px; height:8px; background:white; opacity:${opacity}; border-radius:50%;"></div>
                        <div style="width:8px; height:8px; background:white; opacity:${opacity}; border-radius:50%;"></div>
                        <div style="width:8px; height:8px; background:white; opacity:${opacity}; border-radius:50%;"></div>
                        <div style="width:8px; height:8px; background:white; opacity:${opacity}; border-radius:50%;"></div>
                    </div>`;
                }

                if (patternHTML) colorDiv.innerHTML = patternHTML;
            }

            el.appendChild(colorDiv);

            // Info
            const infoDiv = document.createElement('div');
            infoDiv.style.width = '100%';
            infoDiv.style.height = '50px';
            infoDiv.style.display = 'flex';
            infoDiv.style.flexDirection = 'column';
            infoDiv.style.alignItems = 'center';
            infoDiv.style.justifyContent = 'center';

            if (skin.unlocked) {
                if (this.skinManager.currentSkinId === skin.id) {
                    infoDiv.innerHTML = `<span style="font-size:24px; color:white;">✓</span>`;
                } else {
                    infoDiv.innerHTML = `<span style="font-size:12px; color:aaa;">${TXT('OWNED')}</span>`;
                }
            } else {
                if (skin.unlockMethod === 'coins') {
                    infoDiv.innerHTML = `<span style="font-size:14px; color:#FFD700;">💰 ${skin.unlockValue}</span>`;
                } else if (skin.unlockMethod === 'rewarded_ad') {
                    infoDiv.innerHTML = `<span style="font-size:20px;">▶️</span>`;
                } else if (skin.unlockMethod === 'score_threshold') {
                    infoDiv.innerHTML = `<span style="font-size:11px; color:#aaa;">${TXT('SCORE_REQ')} ${skin.unlockValue}</span>`;
                } else if (skin.unlockMethod === 'daily_login') {
                    infoDiv.innerHTML = `<span style="font-size:11px; color:#aaa;">${TXT('DAY_REQ')} ${skin.unlockValue}</span>`;
                } else {
                    infoDiv.innerHTML = `<span style="font-size:16px;">🔒</span>`;
                }
            }
            el.appendChild(infoDiv);

            el.addEventListener('click', () => this.onSkinClick(skin));
            list.appendChild(el);
        });

        this.updateBalance();
    }

    async onSkinClick(skin) {
        const TXT = (k) => LocalizationManager.get(k);

        if (skin.unlocked) {
            this.skinManager.applySkin(skin.id);
            this.renderList();
            this.analytics.track('skin_selected', { skin_id: skin.id });
        } else {
            console.log("Locked skin clicked:", skin.name);

            if (skin.unlockMethod === 'rewarded_ad') {
                if (confirm(`${TXT('WATCH_AD_CONFIRM')} (${skin.name})`)) {
                    const success = await AdsManager.showRewarded('unlock_skin');
                    if (success) {
                        this.skinManager.unlockSkin(skin.id);
                        this.skinManager.applySkin(skin.id);
                        this.renderList();
                        this.showMessage(`${TXT('SKIN_UNLOCKED')} ${skin.name}!`);
                    } else {
                        this.showMessage(TXT('AD_FAILED'));
                    }
                }
            } else if (skin.unlockMethod === 'coins') {
                if (confirm(`${TXT('BUY_FOR')} ${skin.unlockValue} Coins?`)) {
                    if (this.retentionSystem) {
                        const success = this.skinManager.unlockWithCoins(skin.id, this.retentionSystem);
                        if (success) {
                            this.skinManager.applySkin(skin.id);
                            this.renderList();
                            this.updateBalance();
                            this.showMessage(`${TXT('BOUGHT')} ${skin.name}!`);
                            // Update HUD immediately
                            if (window.gameInstance && window.gameInstance.hud) {
                                window.gameInstance.hud.updateCoins(this.retentionSystem.getCoins());
                            }
                        } else {
                            this.showMessage(TXT('NOT_ENOUGH_COINS'));
                        }
                    } else {
                        this.showMessage(TXT('ERROR_NO_COIN_SYS'));
                    }
                }
            } else {
                this.showMessage(`${TXT('UNLOCK_VIA')} ${skin.unlockMethod}`);
            }
        }
    }

    showMessage(msg) {
        this.container.querySelector('#skin-msg').innerText = msg;
    }
}
