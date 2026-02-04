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
        this.container.style.display = 'none'; // Hidden by default
        this.container.style.flexDirection = 'column';
        this.container.style.alignItems = 'center';
        this.container.style.justifyContent = 'center';
        this.container.style.backgroundColor = 'rgba(0,0,0,0.7)';
        this.container.style.zIndex = '1000';

        this.container.innerHTML = `
            <h1 style="color:#ff4444; font-size:64px; font-family:Arial,sans-serif; margin-bottom: 20px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">GAME OVER</h1>
            <h2 id="final-score" style="color:white; font-size:36px; font-family:Arial,sans-serif; margin-bottom: 40px;">Score: 0</h2>
            <button id="btn-retry" style="padding: 15px 40px; font-size: 24px; border: none; border-radius: 30px; background: #4CAF50; color: white; cursor: pointer; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">RETRY</button>
            <button id="btn-share" style="padding: 10px 30px; font-size: 18px; border: none; border-radius: 20px; background: #FF9800; color: white; cursor: pointer; margin-bottom: 20px;">SHARE</button>
            <button id="btn-menu" style="padding: 10px 30px; font-size: 18px; border: none; border-radius: 20px; background: #AAA; color: white; cursor: pointer;">MAIN MENU</button>
        `;

        document.body.appendChild(this.container);

        this.container.querySelector('#btn-retry').addEventListener('click', () => this.onRetry());
        this.container.querySelector('#btn-menu').addEventListener('click', () => this.onMenu());
    }

    setScore(score) {
        this.container.querySelector('#final-score').textContent = `Score: ${score}`;
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
    }

    hide() {
        this.container.style.display = 'none';
    }
}
