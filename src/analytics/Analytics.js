// import { FirebaseAnalytics } from '@capacitor-firebase/analytics';

// MOCK FOR WEB / INSTALL FAILURE
const FirebaseAnalytics = {
    setEnabled: async () => console.log('[Mock] Analytics Enabled'),
    logEvent: async (opts) => console.log('[Mock] Log Event:', opts.name, opts.params)
};

class Analytics {
    constructor() {
        this.isEnabled = false;
        this.eventQueue = [];
        this.isOffline = !navigator.onLine;

        window.addEventListener('online', () => {
            this.isOffline = false;
            this.flushQueue();
        });

        window.addEventListener('offline', () => {
            this.isOffline = true;
        });
    }

    async init() {
        try {
            // Check if native plugin is available (this check usually works if properly installed)
            // But since import is mocked, we just run mock logic.
            await FirebaseAnalytics.setEnabled({ enabled: true });
            this.isEnabled = true;
            console.log('Firebase Analytics initialized (Mock/Web Mode)');
            this.flushQueue();
        } catch (error) {
            console.warn('Analytics init failed:', error);
            this.isEnabled = false;
        }
    }

    track(eventName, params = {}) {
        const eventData = {
            eventName,
            params: {
                ...params,
                timestamp: Date.now()
            }
        };

        if (this.isOffline || !this.isEnabled) {
            this.eventQueue.push(eventData);
            if (!this.isOffline) {
                console.log('[Analytics Mock]', eventName, params);
                this.eventQueue.pop();
            }
            return;
        }

        try {
            FirebaseAnalytics.logEvent({
                name: eventName,
                params: eventData.params
            });
        } catch (error) {
            console.error('Analytics track error:', error);
        }
    }

    flushQueue() {
        if (this.eventQueue.length === 0 || !this.isEnabled) return;

        console.log(`Flushing ${this.eventQueue.length} queued events`);
        const queueToProcess = [...this.eventQueue];
        this.eventQueue = [];

        queueToProcess.forEach(event => {
            this.track(event.eventName, event.params);
        });
    }
}

export default new Analytics();
