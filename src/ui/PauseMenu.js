export class PauseMenu {
    constructor(callbacks) {
        this.callbacks = callbacks;
        this.container = document.createElement('div');
        this.container.id = 'pause-menu';
        this.container.style.position = 'absolute';
        this.container.style.top = '0';
        this.container.style.left = '0';
        this.container.style.width = '100%';
        this.container.style.height = '100%';
        this.container.style.display = 'none';
        this.container.style.flexDirection = 'column';
        this.container.style.alignItems = 'center';
        this.container.style.justifyContent = 'center';
        this.container.style.backgroundColor = 'rgba(0,0,0,0.7)';
        this.container.style.backdropFilter = 'blur(5px)';
        this.container.style.zIndex = '2000'; // High z-index to be on top

        this.container.innerHTML = `
            <div style="
                background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
                padding: 40px;
                border-radius: 20px;
                display: flex;
                flex-direction: column;
                gap: 20px;
                align-items: center;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                border: 2px solid rgba(255,255,255,0.1);
                min-width: 250px;
            ">
                <h1 style="color: white; font-family: Arial; margin: 0 0 10px 0;">PAUSED</h1>
                
                <button id="btn-resume" style="
                    background: #4CAF50; color: white; border: none; padding: 12px 30px;
                    border-radius: 25px; font-size: 18px; cursor: pointer; width: 100%;
                    transition: transform 0.1s;
                ">RESUME</button>
                
                <button id="btn-restart" style="
                    background: #FF9800; color: white; border: none; padding: 12px 30px;
                    border-radius: 25px; font-size: 18px; cursor: pointer; width: 100%;
                    transition: transform 0.1s;
                ">RESTART</button>
                
                <button id="btn-menu" style="
                    background: #f44336; color: white; border: none; padding: 12px 30px;
                    border-radius: 25px; font-size: 18px; cursor: pointer; width: 100%;
                    transition: transform 0.1s;
                ">MAIN MENU</button>
            </div>
        `;

        document.body.appendChild(this.container);

        // Bind Events
        this.container.querySelector('#btn-resume').onclick = () => this.onResume();
        this.container.querySelector('#btn-restart').onclick = () => this.onRestart();
        this.container.querySelector('#btn-menu').onclick = () => this.onMenu();
    }

    show() {
        this.container.style.display = 'flex';
    }

    hide() {
        this.container.style.display = 'none';
    }

    onResume() {
        if (this.callbacks.onResume) this.callbacks.onResume();
        this.hide();
    }

    onRestart() {
        if (this.callbacks.onRestart) this.callbacks.onRestart();
        this.hide(); // Hide first, then game logic handles reset
    }

    onMenu() {
        if (this.callbacks.onMenu) this.callbacks.onMenu();
        this.hide();
    }
}
