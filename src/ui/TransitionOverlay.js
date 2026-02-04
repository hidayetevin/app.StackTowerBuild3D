export class TransitionOverlay {
    constructor() {
        this.overlay = document.createElement('div');
        this.overlay.style.position = 'absolute';
        this.overlay.style.top = '0';
        this.overlay.style.left = '0';
        this.overlay.style.width = '100vw';
        this.overlay.style.height = '100vh';
        this.overlay.style.backgroundColor = 'black';
        this.overlay.style.pointerEvents = 'none';
        this.overlay.style.zIndex = '9999';
        this.overlay.style.opacity = '0';
        this.overlay.style.transition = 'opacity 0.3s ease-in-out';

        document.body.appendChild(this.overlay);
    }

    async fadeOutIn(callback) {
        // Fade to black
        this.overlay.style.opacity = '1';

        await new Promise(r => setTimeout(r, 300));

        if (callback) callback();

        // Wait a bit
        await new Promise(r => setTimeout(r, 100));

        // Fade back in
        this.overlay.style.opacity = '0';
    }
}
