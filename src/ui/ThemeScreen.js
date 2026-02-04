export class ThemeScreen {
    constructor(themeManager, analytics) {
        this.themeManager = themeManager;
        this.analytics = analytics;

        this.container = document.createElement('div');
        this.container.id = 'theme-screen';
        this.container.style.cssText = `
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.9); z-index: 1200; display: none;
            flex-direction: column; align-items: center; justify-content: center;
        `;

        this.container.innerHTML = `
            <h2 style="color:white; font-family:Arial; margin-bottom:30px;">THEMES</h2>
            <div id="theme-list" style="display:flex; gap:15px; flex-wrap:wrap; justify-content:center; max-width: 80%;"></div>
            <button id="btn-close-themes" style="margin-top:40px; padding:10px 30px; border-radius:20px; border:none; background:#555; color:white; font-size:16px;">CLOSE</button>
        `;

        document.body.appendChild(this.container);
        this.container.querySelector('#btn-close-themes').addEventListener('click', () => this.hide());
    }

    show() {
        this.container.style.display = 'flex';
        this.renderList();
        this.analytics.track('theme_screen_opened');
    }

    hide() {
        this.container.style.display = 'none';
    }

    renderList() {
        const list = this.container.querySelector('#theme-list');
        list.innerHTML = '';

        const themes = this.themeManager.getThemes();

        themes.forEach(theme => {
            const bg = theme.background.type === 'gradient'
                ? `linear-gradient(${theme.background.topColor}, ${theme.background.bottomColor})`
                : theme.background.color;

            const el = document.createElement('div');
            el.style.cssText = `
                width: 100px; height: 120px; border-radius: 10px;
                background: ${bg}; border: 3px solid ${theme.unlocked ? (this.themeManager.currentThemeId === theme.id ? '#FFFF00' : 'white') : '#555'};
                display:flex; flex-direction:column; align-items:center; justify-content:center;
                cursor: pointer; position: relative; opacity: ${theme.unlocked ? 1 : 0.6};
            `;

            el.innerHTML = `<span style="font-family:Arial; font-size:14px; color:white; text-shadow:1px 1px 2px black; font-weight:bold;">${theme.name}</span>`;

            if (!theme.unlocked) {
                el.innerHTML += `<div style="font-size:20px; margin-top:5px;">🔒</div>`;
            } else if (this.themeManager.currentThemeId === theme.id) {
                el.innerHTML += `<div style="font-size:20px; margin-top:5px; color:#FFFF00;">✓</div>`;
            }

            el.addEventListener('click', () => this.onThemeClick(theme));
            list.appendChild(el);
        });
    }

    onThemeClick(theme) {
        if (theme.unlocked) {
            this.themeManager.applyTheme(theme.id);
            this.renderList();
            this.analytics.track('theme_selected', { theme_id: theme.id });
        } else {
            alert(`Unlock this theme via: ${theme.unlockMethod}\n(Try Logic Not Implemented in UI Demo)`);
            // Here we would call tryThemeWithAd logic if implemented in Manager
        }
    }
}
