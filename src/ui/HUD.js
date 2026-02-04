export class HUD {
    constructor() {
        // Create simple UI overlay
        this.container = document.createElement('div');
        this.container.style.position = 'absolute';
        this.container.style.top = '0';
        this.container.style.left = '0';
        this.container.style.width = '100%';
        this.container.style.pointerEvents = 'none'; // click-through
        this.container.style.fontFamily = 'Arial, sans-serif';
        this.container.style.color = 'white';
        this.container.style.padding = '20px';

        this.scoreEl = document.createElement('div');
        this.scoreEl.style.fontSize = '48px';
        this.scoreEl.style.fontWeight = 'bold';
        this.scoreEl.innerText = '0';

        this.startBtn = document.createElement('div');
        this.startBtn.innerText = 'TAP TO START';
        this.startBtn.style.position = 'absolute';
        this.startBtn.style.top = '50%';
        this.startBtn.style.left = '50%';
        this.startBtn.style.transform = 'translate(-50%, -50%)';
        this.startBtn.style.fontSize = '32px';
        this.startBtn.style.pointerEvents = 'auto'; // Clickable
        this.startBtn.style.cursor = 'pointer';

        this.gameOverEl = document.createElement('div');
        this.gameOverEl.style.display = 'none';
        this.gameOverEl.style.position = 'absolute';
        this.gameOverEl.style.top = '40%';
        this.gameOverEl.style.left = '50%';
        this.gameOverEl.style.transform = 'translate(-50%, -50%)';
        this.gameOverEl.style.fontSize = '64px';
        this.gameOverEl.style.color = '#ff4444';
        this.gameOverEl.innerText = 'GAME OVER';

        this.container.appendChild(this.scoreEl);
        this.container.appendChild(this.startBtn);
        this.container.appendChild(this.gameOverEl);

        document.body.appendChild(this.container);
    }

    updateScore(score) {
        this.scoreEl.innerText = score;
    }

    showStartScreen() {
        this.startBtn.style.display = 'block';
        this.startBtn.innerText = 'TAP TO START';
        this.gameOverEl.style.display = 'none';
        this.scoreEl.style.display = 'none';
    }

    showGameUI() {
        this.startBtn.style.display = 'none';
        this.gameOverEl.style.display = 'none';
        this.scoreEl.style.display = 'block';
        this.scoreEl.innerText = '0';
    }

    showGameOver() {
        this.gameOverEl.style.display = 'block';
        this.startBtn.style.display = 'block';
        this.startBtn.innerText = 'TRY AGAIN';
    }
}
