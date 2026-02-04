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
        // Prevent default behavior to avoid scrolling or zooming on double tap
        if (event.type === 'touchstart') {
            event.preventDefault();
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
