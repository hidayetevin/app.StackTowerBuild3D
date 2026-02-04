export class ErrorHandler {
    constructor() {
        this.setupGlobalHandlers();
    }

    setupGlobalHandlers() {
        // Uncaught errors
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            // In a real app, we would track this event in analytics here
            // Analytics.track('error_occurred', { message: event.error.message, stack: event.error.stack });

            // Show user-friendly message
            this.showErrorToast('Something went wrong. Please restart.');
        });

        // Unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise:', event.reason);
            // Analytics.track('promise_rejection', { reason: event.reason });
        });
    }

    showErrorToast(message) {
        // Show non-blocking toast notification
        const toast = document.createElement('div');
        toast.className = 'error-toast';
        toast.textContent = message;
        toast.style.position = 'absolute';
        toast.style.bottom = '20px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
        toast.style.color = 'white';
        toast.style.padding = '10px 20px';
        toast.style.borderRadius = '5px';
        toast.style.zIndex = '1000';
        toast.style.fontFamily = 'Arial, sans-serif';

        document.body.appendChild(toast);

        setTimeout(() => toast.remove(), 3000);
    }
}
