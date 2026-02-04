import LocalizationManager from '../utils/LocalizationManager.js';
import AdsManager from '../monetization/AdsManager.js';

export class GameOverScreen {
    constructor(callbacks) {
        this.callbacks = callbacks;
        this.container = document.createElement('div');
        this.container.id = 'game-over';
        this.container.style.cssText = `
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            display: none; flex-direction: column; align-items: center; justify-content: center;
            background-color: rgba(0,0,0,0.85); z-index: 1000; opacity: 0; transition: opacity 0.5s ease-in;
        `;

        this.currentSessionCoins = 0;
        this.retentionSystem = null; // Need to inject or pass

        this.render();
        document.body.appendChild(this.container);
    }

    setRetentionSystem(rs) {
        this.retentionSystem = rs;
    }

    render() {
        // Build structure once, update text dynamically
        this.container.innerHTML = `
            <h1 class="go-title" style="color:#ff4444; font-size:64px; font-family:Arial,sans-serif; margin-bottom: 20px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); transform: scale(0.5); transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); text-align:center;">GAME OVER</h1>
            
            <h2 id="final-score" style="color:white; font-size:36px; font-family:Arial,sans-serif; margin-bottom: 5px;">Score: 0</h2>
            <h3 id="high-score" style="color:#FFD700; font-size:24px; font-family:Arial,sans-serif; margin-bottom: 10px;">Best: 0</h3>
            
            <div id="coin-result" style="color:#00FFFF; font-size:20px; font-family:Arial; margin-bottom: 30px;"></div>
            
            <div style="display: flex; gap: 20px; flex-direction: column; align-items: center;">
                 <button id="btn-ad-2x" style="display:none; padding: 12px 30px; font-size: 20px; border: none; border-radius: 30px; background: linear-gradient(45deg, #FFD700, #FFA500); color: black; cursor: pointer; font-weight: bold; box-shadow: 0 0 15px rgba(255, 215, 0, 0.6); animation: pulse 1.5s infinite;">
                    📺 WATCH 2x WIN
                </button>
            
                <button id="btn-retry" style="padding: 15px 40px; font-size: 24px; border: none; border-radius: 30px; background: #4CAF50; color: white; cursor: pointer; box-shadow: 0 5px 15px rgba(76, 175, 80, 0.4); transition: transform 0.2s;">RETRY</button>
            </div>
            
            <div style="margin-top: 20px; display: flex; gap: 15px;">
                <button id="btn-menu" style="padding: 10px 30px; font-size: 16px; border: none; border-radius: 20px; background: #555; color: white; cursor: pointer;">MENU</button>
            </div>
            
            <style>
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }
            </style>
        `;

        const retryBtn = this.container.querySelector('#btn-retry');
        retryBtn.onmouseover = () => retryBtn.style.transform = 'scale(1.1)';
        retryBtn.onmouseout = () => retryBtn.style.transform = 'scale(1.0)';

        this.container.querySelector('#btn-retry').onclick = () => this.onRetry();
        this.container.querySelector('#btn-menu').onclick = () => this.onMenu();

        this.container.querySelector('#btn-ad-2x').onclick = () => this.onWatchAd2x();
    }

    setScore(score, sessionCoins = 0) {
        this.currentSessionCoins = sessionCoins;
        const TXT = (k) => LocalizationManager.get(k);

        // Update Texts
        this.container.querySelector('.go-title').innerText = TXT('GAME_OVER');
        this.container.querySelector('#final-score').innerText = `${TXT('SCORE')}: ${score}`;
        this.container.querySelector('#btn-retry').innerText = TXT('RETRY');
        this.container.querySelector('#btn-menu').innerText = TXT('MENU');

        const adBtn = this.container.querySelector('#btn-ad-2x');
        adBtn.innerText = `📺 ${TXT('WATCH_AD_2X')}`;

        // Hide/Show Ad Button based on coins
        // Even if 0 coins, we treat as 1 for multiplier potential (user requested "if 0 then treat as 1")
        // But multiplying 0 is 0. User said "calculate as 1".
        // Logic: if currentSessionCoins == 0, potential is 1 * 2 = 2? Or just give 2 coins?
        // Let's assume user means: base is Math.max(1, sessionCoins). Reward is base * 2.
        // Actually, "calculate as 1" likely means base amount to multiply is 1.

        const baseAmount = this.currentSessionCoins === 0 ? 1 : this.currentSessionCoins;

        // If they have coins (or 0 treated as 1), show offer
        if (baseAmount > 0) {
            adBtn.style.display = 'block';
            this.container.querySelector('#coin-result').innerText = `+${this.currentSessionCoins} Coins`;
        } else {
            adBtn.style.display = 'none'; // Should technically always be true if 0->1
        }

        // High Score Logic
        const best = localStorage.getItem('high_score') || 0;
        const highScoreEl = this.container.querySelector('#high-score');
        if (score > best) {
            localStorage.setItem('high_score', score);
            highScoreEl.innerText = `New ${TXT('BEST')}: ${score}!`;
            highScoreEl.style.color = '#00ff00';
        } else {
            highScoreEl.innerText = `${TXT('BEST')}: ${Math.max(score, best)}`;
            highScoreEl.style.color = '#FFD700';
        }
    }

    async onWatchAd2x() {
        const TXT = (k) => LocalizationManager.get(k);
        const baseAmount = this.currentSessionCoins === 0 ? 1 : this.currentSessionCoins;

        const success = await AdsManager.showRewarded('double_coins');

        // Hide button after attempt
        this.container.querySelector('#btn-ad-2x').style.display = 'none';

        let reward = 0;
        if (success) {
            reward = baseAmount * 2;
            // We already gave 'currentSessionCoins' during game.
            // So we need to add the difference?
            // "kazandığı coin sayısı 2 ile çarğılarak ödül verilir" -> Total reward = base * 2.
            // We already gave 'base' (if >0) during gameplay? NO, wait.
            // In Game.js, we do `retentionSystem.addCoins(1)` immediately.
            // So user HAS `currentSessionCoins`.
            // Reward is EXTRA `currentSessionCoins` (or whatever makes total 2x).
            // If base was 0 (treated as 1), user has 0. Reward = 2. difference = 2.
            // If user has 10. Reward = 20. difference = 10.

            // Wait, if base=0 treated as 1 for CALCULATION.
            // Target is 1 * 2 = 2. User has 0. Add 2.

            let amountToAdd = 0;
            if (this.currentSessionCoins === 0) {
                amountToAdd = 2;
            } else {
                amountToAdd = this.currentSessionCoins; // Doubling it means adding same amount again
            }

            if (this.retentionSystem) {
                this.retentionSystem.addCoins(amountToAdd);
                this.container.querySelector('#coin-result').innerText = `${TXT('YOU_WON_COINS')}: ${this.currentSessionCoins + amountToAdd} 💰`;
                this.container.querySelector('#coin-result').style.color = '#00FF00';
                this.container.querySelector('#coin-result').style.fontSize = '28px';
            }
        } else {
            // Failed or cancelled.
            // "kazandı o oyun içinde coin kadarı oyuncuya verilsin"
            // They already have it because Game.js added it instantly.
            // If 0, they have 0.
            // So just show "You have X coins".
            this.container.querySelector('#coin-result').innerText = `${TXT('YOU_WON_COINS')}: ${this.currentSessionCoins} 💰`;
        }
    }

    onRetry() {
        if (this.callbacks.onRetry) this.callbacks.onRetry();
        this.hide();
    }

    onMenu() {
        if (this.callbacks.onMenu) this.callbacks.onMenu();
        this.hide();
    }

    show() {
        this.container.style.display = 'flex';
        this.container.offsetHeight;
        this.container.style.opacity = '1';
        this.container.querySelector('.go-title').style.transform = 'scale(1.0)';
    }

    hide() {
        this.container.style.opacity = '0';
        this.container.querySelector('.go-title').style.transform = 'scale(0.5)';
        setTimeout(() => {
            if (this.container.style.opacity === '0') {
                this.container.style.display = 'none';
            }
        }, 500);
    }
}
