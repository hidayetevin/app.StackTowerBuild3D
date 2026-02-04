export class HUD {
    constructor(onPauseClick) {
        this.onPauseClick = onPauseClick;
        this.container = document.createElement('div');
        this.container.style.position = 'absolute';
        this.container.style.top = '0';
        this.container.style.left = '0';
        this.container.style.width = '100%';
        this.container.style.width = '100%'; // Full width
        this.container.style.height = '100%'; // Full height for floating anims
        this.container.style.pointerEvents = 'none';
        this.container.style.fontFamily = 'Arial, sans-serif';
        this.container.style.zIndex = '500';
        this.container.style.overflow = 'hidden'; // Don't show scrolls

        // Score
        this.scoreEl = document.createElement('div');
        this.scoreEl.style.position = 'absolute';
        this.scoreEl.style.top = '50px';
        this.scoreEl.style.left = '50%';
        this.scoreEl.style.transform = 'translateX(-50%)';
        this.scoreEl.style.fontSize = '64px';
        this.scoreEl.style.fontWeight = 'bold';
        this.scoreEl.style.color = 'white';
        this.scoreEl.style.textShadow = '0 2px 10px rgba(0,0,0,0.3)';
        this.scoreEl.innerText = '0';

        // Combo
        this.comboEl = document.createElement('div');
        this.comboEl.style.position = 'absolute';
        this.comboEl.style.top = '120px';
        this.comboEl.style.left = '50%';
        this.comboEl.style.transform = 'translateX(-50%) scale(0)';
        this.comboEl.style.fontSize = '32px';
        this.comboEl.style.fontWeight = 'bold';
        this.comboEl.style.color = '#FFD700';
        this.comboEl.style.textShadow = '0 0 10px orange';
        this.comboEl.style.transition = 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        this.comboEl.innerText = '';

        // Coins Display
        this.coinEl = document.createElement('div');
        this.coinEl.id = 'hud-coin-container';
        this.coinEl.style.position = 'absolute';
        this.coinEl.style.top = '25px';
        this.coinEl.style.left = '20px';
        this.coinEl.style.background = 'rgba(0,0,0,0.5)';
        this.coinEl.style.padding = '8px 15px';
        this.coinEl.style.borderRadius = '20px';
        this.coinEl.style.color = '#FFD700';
        this.coinEl.style.fontSize = '24px';
        this.coinEl.style.fontWeight = 'bold';
        this.coinEl.style.display = 'flex';
        this.coinEl.style.alignItems = 'center';
        this.coinEl.style.gap = '10px';
        this.coinEl.innerHTML = `<span>💰</span><span id="coin-count">0</span>`;

        // Pause Button
        this.pauseBtn = document.createElement('button');
        this.pauseBtn.innerText = 'II';
        this.pauseBtn.style.position = 'absolute';
        this.pauseBtn.style.top = '20px';
        this.pauseBtn.style.right = '20px';
        this.pauseBtn.style.width = '50px';
        this.pauseBtn.style.height = '50px';
        this.pauseBtn.style.borderRadius = '50%';
        this.pauseBtn.style.border = 'none';
        this.pauseBtn.style.background = 'rgba(255,255,255,0.2)';
        this.pauseBtn.style.color = 'white';
        this.pauseBtn.style.fontSize = '20px';
        this.pauseBtn.style.fontWeight = 'bold';
        this.pauseBtn.style.cursor = 'pointer';
        this.pauseBtn.style.pointerEvents = 'auto';
        this.pauseBtn.style.backdropFilter = 'blur(4px)';
        this.pauseBtn.onclick = () => { if (this.onPauseClick) this.onPauseClick(); };

        this.container.appendChild(this.scoreEl);
        this.container.appendChild(this.comboEl);
        this.container.appendChild(this.coinEl);
        this.container.appendChild(this.pauseBtn);

        document.body.appendChild(this.container);
    }

    updateCoins(amount) {
        const el = this.container.querySelector('#coin-count');
        if (el) el.innerText = amount;
    }

    updateScore(score) {
        this.scoreEl.innerText = score;
        this.scoreEl.style.transform = 'translateX(-50%) scale(1.2)';
        setTimeout(() => {
            this.scoreEl.style.transform = 'translateX(-50%) scale(1.0)';
        }, 100);
    }

    updateCombo(combo) {
        if (combo > 1) {
            this.comboEl.innerText = `COMBO x${combo}`;
            this.comboEl.style.transform = 'translateX(-50%) scale(1.0)';
        } else {
            this.comboEl.style.transform = 'translateX(-50%) scale(0)';
        }
    }

    showFeedback(text, color = '#FFFFFF') {
        const el = document.createElement('div');
        el.innerText = text;
        el.style.position = 'absolute';
        el.style.top = '200px';
        el.style.left = '50%';
        el.style.transform = 'translateX(-50%)';
        el.style.fontSize = '24px';
        el.style.fontWeight = 'bold';
        el.style.color = color;
        el.style.textShadow = '0 0 5px black';
        el.style.opacity = '1';
        el.style.transition = 'all 1s ease-out';

        this.container.appendChild(el);

        requestAnimationFrame(() => {
            el.style.top = '100px';
            el.style.opacity = '0';
        });

        setTimeout(() => { el.remove(); }, 1000);
    }

    spawnFloatingCoin(x, y) {
        const coin = document.createElement('div');
        coin.innerText = '💰';
        coin.style.position = 'absolute';
        coin.style.left = x + 'px';
        coin.style.top = y + 'px';
        coin.style.fontSize = '40px';
        coin.style.zIndex = '600';
        coin.style.pointerEvents = 'none';
        coin.style.transition = 'all 0.8s ease-in-out';

        this.container.appendChild(coin);

        // Target is the coin count in top left
        // Get target bounding rect
        // Since we know position is top 25, left 20.. target center roughly:
        const targetX = 50;
        const targetY = 40;

        // Use timeout to ensure DOM render before transforming
        setTimeout(() => {
            coin.style.left = targetX + 'px';
            coin.style.top = targetY + 'px';
            coin.style.fontSize = '20px';
            coin.style.opacity = '0.5';
        }, 50);

        setTimeout(() => {
            coin.remove();

            // Pop effect on coin counter
            const counter = this.container.querySelector('#hud-coin-container');
            if (counter) {
                counter.style.transform = 'scale(1.5)';
                counter.style.color = '#fff';
                setTimeout(() => {
                    counter.style.transform = 'scale(1.0)';
                    counter.style.color = '#FFD700';
                }, 200);
            }
        }, 850);
    }

    showGameUI() {
        this.container.style.display = 'block';
        this.scoreEl.innerText = '0';
        this.updateCombo(0);
        this.pauseBtn.style.display = 'block';
    }

    hideGameUI() {
        this.container.style.display = 'none';
    }
}
