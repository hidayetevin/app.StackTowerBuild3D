export class InputManager {
    constructor(actionCallback) {
        this.actionCallback = actionCallback;
        this.boundHandler = this.handleInput.bind(this);

        this.init();
    }

    init() {
        // Touch for mobile
        window.addEventListener('touchstart', this.boundHandler, { passive: false });
        // Click for desktop
        window.addEventListener('mousedown', this.boundHandler);
        // Spacebar key
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                this.handleInput(e);
            }
        });
    }

    handleInput(event) {
        // Check if we are interacting with UI
        const target = event.target;
        const isInteractive = target.tagName === 'BUTTON' || target.tagName === 'A' || target.tagName === 'INPUT' || target.closest('button') || target.closest('.interactive');

        if (isInteractive) {
            // Let the UI handle it. Do NOT prevent default.
            return;
        }

        // Prevent default behavior ONLY if it's a game input (canvas or body), to avoid scrolling
        if (event.type === 'touchstart') {
            // Check if touch is on canvas (game area)
            if (target.tagName === 'CANVAS' || target === document.body) {
                event.preventDefault();
            }
        }

        if (this.actionCallback) {
            this.actionCallback();
        }
    }

    cleanup() {
        window.removeEventListener('touchstart', this.boundHandler);
        window.removeEventListener('mousedown', this.boundHandler);
    }
}
