export default class HapticManager {
    static init() {
        this.enabled = true;
        // If using Capacitor later, we can initialize it here.
        // For now, we use the Web Vibration API.
        this.canVibrate = "vibrate" in navigator;
    }

    static vibrate(pattern) {
        if (!this.enabled || !this.canVibrate) return;
        try {
            navigator.vibrate(pattern);
        } catch (e) {
            console.warn("Haptic error:", e);
        }
    }

    static light() {
        this.vibrate(10); // Very short, sharp tick
    }

    static medium() {
        this.vibrate(40); // Noticeable thud
    }

    static heavy() {
        this.vibrate([50, 50, 50]); // Rumble
    }

    static success() {
        this.vibrate([10, 30, 10]); // Da-da-da
    }

    static failure() {
        this.vibrate([50, 50, 100]); // Thud... thud... long
    }

    static toggle(state) {
        this.enabled = state;
    }
}
