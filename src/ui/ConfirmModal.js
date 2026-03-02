import LocalizationManager from '../utils/LocalizationManager.js';

class ConfirmModal {
    constructor() {
        this.container = document.createElement('div');
        this.container.id = 'confirm-modal';
        this.container.style.cssText = `
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.85); z-index: 2000; display: none;
            flex-direction: column; align-items: center; justify-content: center;
            pointer-events: auto; backdrop-filter: blur(3px);
            opacity: 0; transition: opacity 0.2s ease-in-out;
        `;

        this.modalBox = document.createElement('div');
        this.modalBox.style.cssText = `
            background: linear-gradient(135deg, #2b2b2b, #1a1a1a);
            border: 2px solid #555; border-radius: 15px;
            padding: 25px 30px; min-width: 280px; max-width: 85%;
            display: flex; flex-direction: column; align-items: center;
            box-shadow: 0 10px 25px rgba(0,0,0,0.8);
            transform: scale(0.9); transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            text-align: center;
        `;

        this.titleEl = document.createElement('h3');
        this.titleEl.style.cssText = `color: #FFD700; margin: 0 0 15px 0; font-family: Arial, sans-serif; font-size: 22px; text-shadow: 0 2px 4px rgba(0,0,0,0.5);`;

        this.messageEl = document.createElement('p');
        this.messageEl.style.cssText = `color: white; margin: 0 0 25px 0; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.4;`;

        this.buttonContainer = document.createElement('div');
        this.buttonContainer.style.cssText = `display: flex; gap: 15px; width: 100%; justify-content: center;`;

        this.btnConfirm = document.createElement('button');
        this.btnConfirm.style.cssText = `
            padding: 12px 25px; border-radius: 25px; border: none;
            background: #4CAF50; color: white; font-size: 16px; font-weight: bold;
            cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.3); flex: 1;
            transition: transform 0.1s, background 0.2s;
        `;

        this.btnCancel = document.createElement('button');
        this.btnCancel.style.cssText = `
            padding: 12px 25px; border-radius: 25px; border: none;
            background: #f44336; color: white; font-size: 16px; font-weight: bold;
            cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.3); flex: 1;
            transition: transform 0.1s, background 0.2s;
        `;

        // Hover effects
        this.btnConfirm.onmousedown = () => this.btnConfirm.style.transform = 'scale(0.95)';
        this.btnConfirm.onmouseup = () => this.btnConfirm.style.transform = 'scale(1)';
        this.btnConfirm.onmouseleave = () => this.btnConfirm.style.transform = 'scale(1)';

        this.btnCancel.onmousedown = () => this.btnCancel.style.transform = 'scale(0.95)';
        this.btnCancel.onmouseup = () => this.btnCancel.style.transform = 'scale(1)';
        this.btnCancel.onmouseleave = () => this.btnCancel.style.transform = 'scale(1)';

        this.buttonContainer.appendChild(this.btnCancel);
        this.buttonContainer.appendChild(this.btnConfirm);

        this.modalBox.appendChild(this.titleEl);
        this.modalBox.appendChild(this.messageEl);
        this.modalBox.appendChild(this.buttonContainer);
        this.container.appendChild(this.modalBox);

        if (document.body) document.body.appendChild(this.container);

        this.onConfirmCallback = null;
        this.onCancelCallback = null;

        this.btnConfirm.addEventListener('click', () => {
            this.hide();
            if (this.onConfirmCallback) this.onConfirmCallback();
        });

        this.btnCancel.addEventListener('click', () => {
            this.hide();
            if (this.onCancelCallback) this.onCancelCallback();
        });
    }

    /**
     * Shows the confirmation modal.
     * @param {Object} options 
     * @param {string} options.title - The title text (optional, defaults to "CONFIRM")
     * @param {string} options.message - The main text to ask the user
     * @param {string} options.confirmText - Text for confirm button (optional, defaults to "YES")
     * @param {string} options.cancelText - Text for cancel button (optional, defaults to "NO")
     * @param {Function} options.onConfirm - Callback when confirm is clicked
     * @param {Function} options.onCancel - Callback when cancel is clicked
     */
    show({ title, message, confirmText, cancelText, onConfirm, onCancel }) {
        const TXT = (k) => LocalizationManager.get(k);

        this.titleEl.innerText = title || TXT('CONFIRM') || 'CONFIRM';
        this.messageEl.innerHTML = message || '?';
        this.btnConfirm.innerText = confirmText || TXT('YES') || 'YES';
        this.btnCancel.innerText = cancelText || TXT('NO') || 'NO';

        this.onConfirmCallback = onConfirm;
        this.onCancelCallback = onCancel;

        if (!this.container.parentElement && document.body) {
            document.body.appendChild(this.container);
        }

        this.container.style.display = 'flex';
        // Trigger reflow for transition
        void this.container.offsetWidth; 
        
        this.container.style.opacity = '1';
        this.modalBox.style.transform = 'scale(1)';
    }

    hide() {
        this.container.style.opacity = '0';
        this.modalBox.style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            this.container.style.display = 'none';
        }, 200); // Matches CSS transition duration
    }
}

// Export as singleton
export default new ConfirmModal();
