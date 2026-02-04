import AdsManager from '../monetization/AdsManager.js';

export class SkinScreen {
    constructor(skinManager, analytics) {
        this.skinManager = skinManager;
        this.analytics = analytics;
        this.retentionSystem = null; // To be injected

        this.container = document.createElement('div');
        this.container.id = 'skin-screen';
        this.container.style.cssText = `
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.9); z-index: 1200; display: none;
            flex-direction: column; align-items: center; justify-content: center;
        `;

        this.container.innerHTML = `
            <div id="skin-balance" style="position:absolute; top:20px; right:20px; color:#FFD700; font-size:24px; font-weight:bold;"></div>
            <h2 style="color:white; font-family:Arial; margin-bottom:30px;">SKINS</h2>
            <div id="skin-list" style="display:flex; gap:15px; flex-wrap:wrap; justify-content:center; max-width: 80%;"></div>
            <p id="skin-msg" style="color:white; margin-top:20px; font-style:italic; height:20px;"></p>
            <button id="btn-close-skins" style="margin-top:20px; padding:10px 30px; border-radius:20px; border:none; background:#555; color:white; font-size:16px;">CLOSE</button>
        `;

        document.body.appendChild(this.container);

        this.container.querySelector('#btn-close-skins').addEventListener('click', () => this.hide());
    }

    setRetentionSystem(rs) {
        this.retentionSystem = rs;
    }

    show() {
        this.container.style.display = 'flex';
        this.renderList();
        this.analytics.track('skin_screen_opened');

        if (this.retentionSystem) {
            this.container.querySelector('#skin-balance').innerText = `💰 ${this.retentionSystem.getCoins()}`;
        }
    }

    hide() {
        this.container.style.display = 'none';
        this.container.querySelector('#skin-msg').innerText = '';
    }

    renderList() {
        const list = this.container.querySelector('#skin-list');
        list.innerHTML = '';

        const skins = this.skinManager.getSkins();

        skins.forEach(skin => {
            const el = document.createElement('div');
            el.style.cssText = `
                width: 90px; height: 110px; border-radius: 10px;
                background: #333; 
                border: 3px solid ${skin.unlocked ? (this.skinManager.currentSkinId === skin.id ? '#FFFF00' : 'white') : '#555'};
                display:flex; flex-direction:column; align-items:center; justify-content:flex-start;
                cursor: pointer; position: relative; opacity: ${skin.unlocked ? 1 : 0.8};
                overflow: hidden;
            `;

            // Preview Color
            const colorDiv = document.createElement('div');
            colorDiv.style.width = '100%';
            colorDiv.style.height = '60px';
            colorDiv.style.background = skin.color;
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
                    infoDiv.innerHTML = `<span style="font-size:12px; color:aaa;">Owned</span>`;
                }
            } else {
                if (skin.unlockMethod === 'coins') {
                    infoDiv.innerHTML = `<span style="font-size:14px; color:#FFD700;">💰 ${skin.unlockValue}</span>`;
                } else if (skin.unlockMethod === 'rewarded_ad') {
                    infoDiv.innerHTML = `<span style="font-size:20px;">▶️</span>`;
                } else if (skin.unlockMethod === 'score_threshold') {
                    infoDiv.innerHTML = `<span style="font-size:11px; color:#aaa;">Score: ${skin.unlockValue}</span>`;
                } else if (skin.unlockMethod === 'daily_login') {
                    infoDiv.innerHTML = `<span style="font-size:11px; color:#aaa;">Day: ${skin.unlockValue}</span>`;
                } else {
                    infoDiv.innerHTML = `<span style="font-size:16px;">🔒</span>`;
                }
            }
            el.appendChild(infoDiv);

            el.addEventListener('click', () => this.onSkinClick(skin));
            list.appendChild(el);
        });

        if (this.retentionSystem) {
            this.container.querySelector('#skin-balance').innerText = `💰 ${this.retentionSystem.getCoins()}`;
        }
    }

    async onSkinClick(skin) {
        if (skin.unlocked) {
            this.skinManager.applySkin(skin.id);
            this.renderList();
            this.analytics.track('skin_selected', { skin_id: skin.id });
        } else {
            console.log("Locked skin clicked:", skin.name);

            if (skin.unlockMethod === 'rewarded_ad') {
                if (confirm(`Watch an Ad to unlock ${skin.name}?`)) {
                    const success = await AdsManager.showRewarded('unlock_skin');
                    if (success) {
                        this.skinManager.unlockSkin(skin.id);
                        this.skinManager.applySkin(skin.id);
                        this.renderList();
                        this.showMessage(`Unlocked ${skin.name}!`);
                    } else {
                        this.showMessage("Ad failed or cancelled.");
                    }
                }
            } else if (skin.unlockMethod === 'coins') {
                if (confirm(`Buy ${skin.name} for ${skin.unlockValue} Coins?`)) {
                    if (this.retentionSystem) {
                        const success = this.skinManager.unlockWithCoins(skin.id, this.retentionSystem);
                        if (success) {
                            this.skinManager.applySkin(skin.id);
                            this.renderList();
                            this.showMessage(`Bought ${skin.name}!`);
                        } else {
                            this.showMessage("Not enough coins!");
                        }
                    } else {
                        this.showMessage("Error: No Coin System");
                    }
                }
            } else {
                this.showMessage(`Unlock via: ${skin.unlockMethod} (Value: ${skin.unlockValue})`);
            }
        }
    }

    showMessage(msg) {
        this.container.querySelector('#skin-msg').innerText = msg;
    }
}
