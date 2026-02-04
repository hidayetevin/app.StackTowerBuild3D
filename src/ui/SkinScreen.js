export class SkinScreen {
    constructor(skinManager, analytics) {
        this.skinManager = skinManager;
        this.analytics = analytics;

        this.container = document.createElement('div');
        this.container.id = 'skin-screen';
        this.container.style.cssText = `
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.9); z-index: 1200; display: none;
            flex-direction: column; align-items: center; justify-content: center;
        `;

        this.container.innerHTML = `
            <h2 style="color:white; font-family:Arial; margin-bottom:30px;">SKINS</h2>
            <div id="skin-list" style="display:flex; gap:15px; flex-wrap:wrap; justify-content:center; max-width: 80%;"></div>
            <button id="btn-close-skins" style="margin-top:40px; padding:10px 30px; border-radius:20px; border:none; background:#555; color:white; font-size:16px;">CLOSE</button>
        `;

        document.body.appendChild(this.container);

        this.container.querySelector('#btn-close-skins').addEventListener('click', () => this.hide());
    }

    show() {
        this.container.style.display = 'flex';
        this.renderList();
        this.analytics.track('skin_screen_opened');
    }

    hide() {
        this.container.style.display = 'none';
    }

    renderList() {
        const list = this.container.querySelector('#skin-list');
        list.innerHTML = '';

        const skins = this.skinManager.getSkins();

        skins.forEach(skin => {
            const el = document.createElement('div');
            el.style.cssText = `
                width: 80px; height: 80px; border-radius: 10px;
                background: ${skin.color}; border: 3px solid ${skin.unlocked ? (this.skinManager.currentSkinId === skin.id ? '#FFFF00' : 'white') : '#555'};
                display:flex; flex-direction:column; align-items:center; justify-content:center;
                cursor: pointer; position: relative; opacity: ${skin.unlocked ? 1 : 0.6};
            `;

            if (!skin.unlocked) {
                el.innerHTML = `<span style="font-size:20px;">🔒</span><span style="font-size:10px; color:white;">${skin.unlockMethod}</span>`;
            } else if (this.skinManager.currentSkinId === skin.id) {
                el.innerHTML = `<span style="font-size:24px;">✓</span>`;
            }

            el.addEventListener('click', () => this.onSkinClick(skin));
            list.appendChild(el);
        });
    }

    onSkinClick(skin) {
        if (skin.unlocked) {
            this.skinManager.applySkin(skin.id);
            this.renderList();
            this.analytics.track('skin_selected', { skin_id: skin.id });
        } else {
            console.log("Locked skin clicked:", skin.name);
            // Handle unlock logic (e.g., check ads or score)
            // For MVP simplicity, we might just log or show a toast
            alert(`Unlock this skin via: ${skin.unlockMethod}`);
        }
    }
}
