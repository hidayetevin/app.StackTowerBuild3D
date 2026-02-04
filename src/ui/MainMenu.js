export class MainMenu {
    constructor(callbacks) {
        this.callbacks = callbacks;
        this.container = document.createElement('div');
        this.container.id = 'main-menu';
        this.container.style.position = 'absolute';
        this.container.style.top = '0';
        this.container.style.left = '0';
        this.container.style.width = '100%';
        this.container.style.height = '100%';
        this.container.style.display = 'flex';
        this.container.style.flexDirection = 'column';
        this.container.style.alignItems = 'center';
        this.container.style.justifyContent = 'center';
        this.container.style.backgroundColor = 'rgba(0,0,0,0.4)';
        this.container.style.backdropFilter = 'blur(5px)';
        this.container.style.zIndex = '1000';

        this.container.innerHTML = `
            <h1 style="color:white; font-size:48px; font-family:Arial,sans-serif; margin-bottom: 40px; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">Stack Tower 3D</h1>
            <button id="btn-play" style="padding: 15px 40px; font-size: 24px; border: none; border-radius: 30px; background: #4CAF50; color: white; cursor: pointer; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">PLAY</button>
            <button id="btn-settings" style="padding: 10px 30px; font-size: 18px; border: none; border-radius: 20px; background: #2196F3; color: white; cursor: pointer; margin-bottom: 20px;">SETTINGS</button>
            <div style="color: white; font-family: Arial; font-size: 12px; margin-top: 20px;">v1.0.0</div>
        `;

        document.body.appendChild(this.container);

        this.container.querySelector('#btn-play').addEventListener('click', () => this.onPlay());
        this.container.querySelector('#btn-settings').addEventListener('click', () => this.onSettings());
    }

    onPlay() {
        if (this.callbacks.onPlay) this.callbacks.onPlay();
        this.hide();
    }

    onSettings() {
        if (this.callbacks.onSettings) this.callbacks.onSettings();
    }

    show() {
        this.container.style.display = 'flex';
    }

    hide() {
        this.container.style.display = 'none';
    }
}
