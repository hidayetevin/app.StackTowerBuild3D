export class GameOverScreen {
    constructor(callbacks) {
        this.callbacks = callbacks;
        this.container = document.createElement('div');
        this.container.id = 'game-over';
        this.container.style.position = 'absolute';
        this.container.style.top = '0';
        this.container.style.left = '0';
        this.container.style.width = '100%';
        this.container.style.height = '100%';
        this.container.style.display = 'none';
        this.container.style.flexDirection = 'column';
        this.container.style.alignItems = 'center';
        this.container.style.justifyContent = 'center';
        this.container.style.backgroundColor = 'rgba(0,0,0,0.85)';
        this.container.style.zIndex = '1000';
        this.container.style.opacity = '0';
        this.container.style.transition = 'opacity 0.5s ease-in';

        this.container.innerHTML = `
            <h1 class="go-title" style="color:#ff4444; font-size:64px; font-family:Arial,sans-serif; margin-bottom: 20px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); transform: scale(0.5); transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);">GAME OVER</h1>
            
            <h2 id="final-score" style="color:white; font-size:36px; font-family:Arial,sans-serif; margin-bottom: 10px;">Score: 0</h2>
            <h3 id="high-score" style="color:#FFD700; font-size:24px; font-family:Arial,sans-serif; margin-bottom: 40px;">Best: 0</h3>
            
            <div style="display: flex; gap: 20px;">
                <button id="btn-retry" style="padding: 15px 40px; font-size: 24px; border: none; border-radius: 30px; background: #4CAF50; color: white; cursor: pointer; box-shadow: 0 5px 15px rgba(76, 175, 80, 0.4); transition: transform 0.2s;">RETRY</button>
            </div>
            
            <div style="margin-top: 20px; display: flex; gap: 15px;">
                <button id="btn-menu" style="padding: 10px 30px; font-size: 16px; border: none; border-radius: 20px; background: #555; color: white; cursor: pointer;">MENU</button>
                <button id="btn-share" style="padding: 10px 30px; font-size: 16px; border: none; border-radius: 20px; background: #FF9800; color: white; cursor: pointer;">SHARE</button>
            </div>
        `;

        document.body.appendChild(this.container);

        // Add hover effects
        const retryBtn = this.container.querySelector('#btn-retry');
        retryBtn.onmouseover = () => retryBtn.style.transform = 'scale(1.1)';
        retryBtn.onmouseout = () => retryBtn.style.transform = 'scale(1.0)';

        this.container.querySelector('#btn-retry').addEventListener('click', () => this.onRetry());
        this.container.querySelector('#btn-menu').addEventListener('click', () => this.onMenu());
    }

    setScore(score) {
        this.container.querySelector('#final-score').textContent = `Score: ${score}`;
        // High score logic could be passed here or read from storage
        // For visual polish:
        const best = localStorage.getItem('high_score') || 0;
        if (score > best) {
            localStorage.setItem('high_score', score);
            this.container.querySelector('#high-score').textContent = `New Best: ${score}!`;
            this.container.querySelector('#high-score').style.color = '#00ff00';
        } else {
            this.container.querySelector('#high-score').textContent = `Best: ${Math.max(score, best)}`;
            this.container.querySelector('#high-score').style.color = '#FFD700';
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
        // Trigger reflow
        this.container.offsetHeight;

        // Anim In
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
