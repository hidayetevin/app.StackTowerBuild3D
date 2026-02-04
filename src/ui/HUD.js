export class HUD {
    constructor(onPauseClick) {
        this.onPauseClick = onPauseClick;
        this.container = document.createElement('div');
        this.container.style.position = 'absolute';
        this.container.style.top = '0';
        this.container.style.left = '0';
        this.container.style.width = '100%';
        this.container.style.pointerEvents = 'none'; // Allow clicks to pass through generally
        this.container.style.fontFamily = 'Arial, sans-serif';
        this.container.style.zIndex = '500';

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

        // Combo text
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
        this.pauseBtn.style.pointerEvents = 'auto'; // Re-enable pointer events for button
        this.pauseBtn.style.backdropFilter = 'blur(4px)';

        this.pauseBtn.onclick = () => {
            if (this.onPauseClick) this.onPauseClick();
        };

        this.container.appendChild(this.scoreEl);
        this.container.appendChild(this.comboEl);
        this.container.appendChild(this.pauseBtn);

        document.body.appendChild(this.container);
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
