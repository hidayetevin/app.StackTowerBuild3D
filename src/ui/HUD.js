export class HUD {
    constructor() {
        this.container = document.createElement('div');
        this.container.style.position = 'absolute';
        this.container.style.top = '0';
        this.container.style.left = '0';
        this.container.style.width = '100%';
        this.container.style.pointerEvents = 'none';
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
        this.comboEl.style.transform = 'translateX(-50%) scale(0)'; // Start hidden
        this.comboEl.style.fontSize = '32px';
        this.comboEl.style.fontWeight = 'bold';
        this.comboEl.style.color = '#FFD700'; // Gold
        this.comboEl.style.textShadow = '0 0 10px orange';
        this.comboEl.style.transition = 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        this.comboEl.innerText = '';

        this.container.appendChild(this.scoreEl);
        this.container.appendChild(this.comboEl);

        document.body.appendChild(this.container);
    }

    updateScore(score) {
        this.scoreEl.innerText = score;
        // Simple pulse animation
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
    }
}
