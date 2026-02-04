export class SaveSystem {
    constructor() {
        this.storage = this.detectStorage();
        this.memoryFallback = {};
    }

    detectStorage() {
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            return 'localStorage';
        } catch (e) {
            console.warn('localStorage unavailable, using memory');
            return 'memory';
        }
    }

    set(key, value) {
        try {
            if (this.storage === 'localStorage') {
                localStorage.setItem(key, JSON.stringify(value));
            } else {
                this.memoryFallback[key] = value;
            }
        } catch (e) {
            console.error('Storage error:', e);
            // Fallback to memory
            this.memoryFallback[key] = value;
        }
    }

    get(key, defaultValue = null) {
        try {
            if (this.storage === 'localStorage') {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } else {
                return this.memoryFallback[key] ?? defaultValue;
            }
        } catch (e) {
            console.error('Storage read error:', e);
            return defaultValue;
        }
    }
}
