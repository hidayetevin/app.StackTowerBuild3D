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
        this.container.style.display = 'none';
        this.container.style.flexDirection = 'column';
        this.container.style.alignItems = 'center';
        this.container.style.justifyContent = 'center';
        this.container.style.backgroundColor = 'rgba(255,255,255,0.95)';
        this.container.style.zIndex = '1100';

        this.container.innerHTML = `
            <h2 style="color:#333; font-size:36px; font-family:Arial,sans-serif; margin-bottom: 40px;">Settings</h2>
            
            <div style="margin-bottom: 20px; display: flex; align-items: center; width: 250px; justify-content: space-between;">
                <label style="font-family:Arial; font-size:20px;">Sound FX</label>
                <div class="toggle-switch" id="toggle-sound" style="
                    width: 50px; height: 26px; background: #ddd; border-radius: 13px; position: relative; cursor: pointer; transition: 0.3s;
                ">
                    <div style="width: 22px; height: 22px; background: white; border-radius: 50%; position: absolute; top: 2px; left: 2px; transition: 0.3s; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>
                </div>
            </div>
            
            <div style="margin-bottom: 20px; display: flex; align-items: center; width: 250px; justify-content: space-between;">
                <label style="font-family:Arial; font-size:20px;">Music</label>
                 <div class="toggle-switch" id="toggle-music" style="
                    width: 50px; height: 26px; background: #ddd; border-radius: 13px; position: relative; cursor: pointer; transition: 0.3s;
                ">
                    <div style="width: 22px; height: 22px; background: white; border-radius: 50%; position: absolute; top: 2px; left: 2px; transition: 0.3s; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>
                </div>
            </div>
            
            <a href="https://yoursite.com/privacy-policy" target="_blank" style="color: #2196F3; font-family: Arial; margin-bottom: 40px; text-decoration: none; border-bottom: 1px solid #2196F3;">Privacy Policy</a>
            
            <button id="btn-back" style="padding: 10px 40px; font-size: 18px; border: none; border-radius: 20px; background: #333; color: white; cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">BACK</button>
        `;

        document.body.appendChild(this.container);

        // Helpers for toggles
        const updateToggle = (id, isActive) => {
            const el = this.container.querySelector(id);
            const knob = el.firstElementChild;
            if (isActive) {
                el.style.backgroundColor = '#4CAF50';
                knob.style.left = '26px';
            } else {
                el.style.backgroundColor = '#ddd';
                knob.style.left = '2px';
            }
        };

        this.container.querySelector('#btn-back').addEventListener('click', () => this.hide());

        this.container.querySelector('#toggle-sound').addEventListener('click', () => {
            if (this.callbacks.onToggleSound) {
                const newState = this.callbacks.onToggleSound();
                updateToggle('#toggle-sound', !newState); // !muted = active
            }
        });

        this.container.querySelector('#toggle-music').addEventListener('click', () => {
            if (this.callbacks.onToggleMusic) {
                const newState = this.callbacks.onToggleMusic();
                updateToggle('#toggle-music', !newState);
            }
        });

        // Initial State (Assumes onShow sets this, but defaults to Active)
        updateToggle('#toggle-sound', true);
        updateToggle('#toggle-music', true);
    }

    show(soundMuted, musicMuted) {
        this.container.style.display = 'flex';

        const soundActive = !soundMuted;
        const musicActive = !musicMuted;

        // Update visuals manually
        const updateToggle = (id, isActive) => {
            const el = this.container.querySelector(id);
            const knob = el.firstElementChild;
            if (isActive) {
                el.style.backgroundColor = '#4CAF50';
                knob.style.left = '26px';
            } else {
                el.style.backgroundColor = '#ddd';
                knob.style.left = '2px';
            }
        };

        updateToggle('#toggle-sound', soundActive);
        updateToggle('#toggle-music', musicActive);
    }

    hide() {
        this.container.style.display = 'none';
        if (this.callbacks.onClose) this.callbacks.onClose();
    }
}
