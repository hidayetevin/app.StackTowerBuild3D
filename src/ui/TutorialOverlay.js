export class TutorialOverlay {
    constructor(skipCallback) {
        this.overlay = document.createElement('div');
        this.overlay.className = 'tutorial-overlay';
        this.overlay.style.position = 'absolute';
        this.overlay.style.top = '150px'; // Below score
        this.overlay.style.width = '100%';
        this.overlay.style.textAlign = 'center';
        this.overlay.style.pointerEvents = 'none'; // click through
        this.overlay.style.zIndex = '900';

        this.overlay.innerHTML = `
            <div class="tutorial-hint" style="
                font-family: Arial, sans-serif; 
                font-size: 24px; 
                color: white; 
                text-shadow: 0 0 5px black;
                opacity: 0; 
                transition: opacity 0.5s;">
            </div>
            <div class="tutorial-skip" style="
                display:none; 
                margin-top: 20px; 
                font-size: 16px; 
                color: #ddd; 
                pointer-events: auto; 
                cursor: pointer; 
                text-decoration: underline;">
                Skip Tutorial
            </div>
        `;
        document.body.appendChild(this.overlay);

        const skipBtn = this.overlay.querySelector('.tutorial-skip');
        skipBtn.addEventListener('click', () => {
            if (skipCallback) skipCallback();
        });
    }

    showHint(text) {
        const hint = this.overlay.querySelector('.tutorial-hint');
        hint.textContent = text;
        hint.style.opacity = '1';

        // Show skip button after 3 seconds
        setTimeout(() => {
            const skipBtn = this.overlay.querySelector('.tutorial-skip');
            if (skipBtn) skipBtn.style.display = 'inline-block';
        }, 3000);
    }

    hide() {
        this.overlay.style.display = 'none';
    }
}
