import { PERFORMANCE } from './Constants.js';

export class PerformanceMonitor {
    constructor(renderer) {
        this.renderer = renderer;
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fps = 60;
        this.isPerformanceMode = false;

        // Check interval
        this.checkInterval = 2000; // Check every 2s
        this.timeSinceCheck = 0;
    }

    update(delta) {
        this.frameCount++;
        this.timeSinceCheck += delta * 1000;

        if (this.timeSinceCheck >= this.checkInterval) {
            this.fps = (this.frameCount * 1000) / this.timeSinceCheck;

            this.checkPerformance();

            // Reset
            this.frameCount = 0;
            this.timeSinceCheck = 0;
        }
    }

    checkPerformance() {
        if (this.fps < PERFORMANCE.MIN_FPS && !this.isPerformanceMode) {
            console.warn(`Low FPS detected (${Math.round(this.fps)}). Enabling Performance Mode.`);
            this.enablePerformanceMode();
        }
    }

    enablePerformanceMode() {
        this.isPerformanceMode = true;

        // Reduce pixel ratio
        if (this.renderer) {
            this.renderer.setPixelRatio(1); // Force 1x pixel ratio
        }

        // Additional hooks could go here (reduce particles, simple shaders, etc.)
        // We can dispatch an event to Game or Tower to reduce visual fidelity
        const event = new CustomEvent('performance-mode-enabled');
        window.dispatchEvent(event);
    }
}
