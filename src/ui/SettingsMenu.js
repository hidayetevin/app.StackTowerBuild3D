export class SettingsMenu {
    constructor(callbacks) {
        this.callbacks = callbacks;
        this.container = document.createElement('div');
        this.container.id = 'settings-menu';
        this.container.style.position = 'absolute';
        this.container.style.top = '0';
        this.container.style.left = '0';
        this.container.style.width = '100%';
        this.container.style.height = '100%';
        this.container.style.display = 'none'; // Hidden by default
        this.container.style.flexDirection = 'column';
        this.container.style.alignItems = 'center';
        this.container.style.justifyContent = 'center';
        this.container.style.backgroundColor = 'rgba(255,255,255,0.9)';
        this.container.style.zIndex = '1100'; // Higher than menu

        this.container.innerHTML = `
            <h2 style="color:#333; font-size:36px; font-family:Arial,sans-serif; margin-bottom: 40px;">Settings</h2>
            
            <div style="margin-bottom: 20px; display: flex; align-items: center; width: 200px; justify-content: space-between;">
                <label style="font-family:Arial; font-size:20px;">Sound</label>
                <input type="checkbox" checked style="transform: scale(1.5);">
            </div>
            
            <div style="margin-bottom: 20px; display: flex; align-items: center; width: 200px; justify-content: space-between;">
                <label style="font-family:Arial; font-size:20px;">Music</label>
                <input type="checkbox" checked style="transform: scale(1.5);">
            </div>
            
            <a href="#" style="color: #2196F3; font-family: Arial; margin-bottom: 40px; text-decoration: none;">Privacy Policy</a>
            
            <button id="btn-back" style="padding: 10px 30px; font-size: 18px; border: none; border-radius: 20px; background: #666; color: white; cursor: pointer;">BACK</button>
        `;

        document.body.appendChild(this.container);

        this.container.querySelector('#btn-back').addEventListener('click', () => this.hide());
    }

    show() {
        this.container.style.display = 'flex';
    }

    hide() {
        this.container.style.display = 'none';
    }
}
