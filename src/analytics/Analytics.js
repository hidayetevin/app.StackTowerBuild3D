import { FirebaseAnalytics } from '@capacitor-firebase/analytics';

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
            // Capacitor might not be available in browser dev mode, check first
            // or rely on try-catch if plugin is not mocked.
            // For web preview, we often skip actual plugin calls or expect them to fail gracefully.
            if (window.Capacitor) {
                await FirebaseAnalytics.setEnabled({ enabled: true });
                this.isEnabled = true;
                console.log('Firebase Analytics initialized');
                this.flushQueue();
            } else {
                console.log('Analytics running in web/mock mode');
            }
        } catch (error) {
            console.warn('Analytics init failed (likely web environment):', error);
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
            // Queue if offline or not initialized (but might initialize later)
            // If strictly disabled due to error, we might skip, but queuing acts as safety
            this.eventQueue.push(eventData);

            // If strictly offline, keep in queue.
            // If dev mode/web, just log it.
            if (!this.isOffline && !window.Capacitor) {
                console.log('[Analytics Mock]', eventName, params);
                // Clear from queue to avoid memory leak in dev
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
        // Process queue
        const queueToProcess = [...this.eventQueue];
        this.eventQueue = [];

        queueToProcess.forEach(event => {
            this.track(event.eventName, event.params);
        });
    }
}

export default new Analytics();
