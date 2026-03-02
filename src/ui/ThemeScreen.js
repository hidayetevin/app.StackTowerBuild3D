import AdsManager from '../monetization/AdsManager.js';
import LocalizationManager from '../utils/LocalizationManager.js';
import ConfirmModal from './ConfirmModal.js';

export class ThemeScreen {
    constructor(themeManager, analytics) {
        this.themeManager = themeManager;
        this.analytics = analytics;
        this.retentionSystem = null;

        this.container = document.createElement('div');
        this.container.id = 'theme-screen';
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
            <div id="theme-balance" style="position:absolute; top:20px; right:20px; color:#FFD700; font-size:24px; font-weight:bold;"></div>
            <h2 id="theme-title" style="color:white; font-family:Arial; margin-bottom:30px;">THEMES</h2>
            <div id="theme-list" style="display:flex; flex-direction:column; gap:15px; width: 80%; max-height: 60%; overflow-y: auto;"></div>
            <p id="theme-msg" style="color:white; margin-top:20px; font-style:italic; height:20px;"></p>
            <button id="btn-close-themes" style="margin-top:20px; padding:10px 30px; border-radius:20px; border:none; background:#555; color:white; font-size:16px;">CLOSE</button>
        `;

        this.container.querySelector('#btn-close-themes').addEventListener('click', () => this.hide());
    }

    setRetentionSystem(rs) {
        this.retentionSystem = rs;
    }

    show() {
        const TXT = (k) => LocalizationManager.get(k);

        // Update Static Texts
        this.container.querySelector('#theme-title').innerText = TXT('THEMES');
        this.container.querySelector('#btn-close-themes').innerText = TXT('CLOSE');

        if (!this.container.parentElement && document.body) document.body.appendChild(this.container);

        this.container.style.display = 'flex';
        this.updateBalance();
        this.renderList();
        this.analytics.track('theme_screen_opened');
    }

    updateBalance() {
        if (this.retentionSystem) {
            this.container.querySelector('#theme-balance').innerText = `💰 ${this.retentionSystem.getCoins()}`;
        }
    }

    hide() {
        this.container.style.display = 'none';
        const msgEl = this.container.querySelector('#theme-msg');
        if (msgEl) msgEl.innerText = '';
    }

    renderList() {
        const list = this.container.querySelector('#theme-list');
        list.innerHTML = '';
        const TXT = (k) => LocalizationManager.get(k);

        const themes = this.themeManager.getThemes();

        themes.forEach(theme => {
            const el = document.createElement('div');
            el.style.cssText = `
                width: 100%; height: 60px; border-radius: 10px;
                background: linear-gradient(90deg, ${theme.background.type === 'gradient' ? theme.background.topColor : theme.background.color}, #333); 
                border: 2px solid ${theme.unlocked ? (this.themeManager.currentThemeId === theme.id ? '#FFFF00' : 'white') : '#555'};
                display:flex; align-items:center; justify-content:space-between; padding: 0 20px;
                cursor: pointer; opacity: ${theme.unlocked ? 1 : 0.6};
                box-sizing: border-box;
            `;

            const name = document.createElement('span');
            name.style.color = 'white';
            name.style.fontSize = '18px';
            name.innerText = theme.name;

            const status = document.createElement('div');

            if (theme.unlocked) {
                if (this.themeManager.currentThemeId === theme.id) {
                    status.innerHTML = `✅ ${TXT('ACTIVE')}`;
                    status.style.color = '#00FF00';
                } else {
                    status.innerHTML = TXT('OWNED');
                    status.style.color = '#AAA';
                }
            } else {
                if (theme.unlockMethod === 'coins') {
                    status.innerText = `💰 ${theme.unlockValue}`;
                    status.style.color = '#FFD700';
                } else if (theme.unlockMethod === 'rewarded_trial') {
                    status.innerHTML = TXT('TRIAL_AD');
                    status.style.color = '#00FFFF';
                } else if (theme.unlockMethod === 'score_threshold') {
                    status.innerHTML = `${TXT('SCORE_REQ')} ${theme.unlockValue}`;
                    status.style.color = '#FF8888';
                } else {
                    status.innerHTML = '🔒';
                }
            }

            el.appendChild(name);
            el.appendChild(status);

            el.addEventListener('click', () => this.onThemeClick(theme));
            list.appendChild(el);
        });

        this.updateBalance();
    }

    async onThemeClick(theme) {
        const TXT = (k) => LocalizationManager.get(k);

        if (theme.unlocked) {
            this.themeManager.applyTheme(theme.id);
            this.renderList();
        } else {
            console.log("Locked theme clicked:", theme.name);
            if (theme.unlockMethod === 'coins') {
                ConfirmModal.show({
                    message: `${TXT('BUY_FOR')} ${theme.unlockValue} Coins?`,
                    onConfirm: () => {
                        if (this.retentionSystem) {
                            const success = this.themeManager.unlockWithCoins(theme.id, this.retentionSystem);
                            if (success) {
                                this.themeManager.applyTheme(theme.id);
                                this.renderList();
                                this.showMessage(`${TXT('BOUGHT')} ${theme.name}!`);
                                // Update HUD immediately
                                if (window.gameInstance && window.gameInstance.hud) {
                                    window.gameInstance.hud.updateCoins(this.retentionSystem.getCoins());
                                }
                            } else {
                                this.showMessage(TXT('NOT_ENOUGH_COINS'));
                            }
                        }
                    }
                });
            } else if (theme.unlockMethod === 'rewarded_trial') {
                ConfirmModal.show({
                    message: TXT('TRIAL_CONFIRM'),
                    onConfirm: async () => {
                        const success = await AdsManager.showRewarded('try_theme');
                        if (success) {
                            this.themeManager.applyTheme(theme.id, true);
                            this.themeManager.markTrialUsed(theme.id);
                            this.hide();
                            alert(TXT('SESSION_APPLIED')); // Keeping alert for now as it's info only, or can replace later.
                        }
                    }
                });
            } else {
                this.showMessage(`${TXT('UNLOCK_VIA')} ${theme.unlockMethod}`);
            }
        }
    }

    showMessage(msg) {
        this.container.querySelector('#theme-msg').innerText = msg;
    }
}
