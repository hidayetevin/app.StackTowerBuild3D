export class GameLoop {
    constructor() {
        this.lastTime = 0;
        this.running = false;
        this.callbacks = [];
        this.loop = this.loop.bind(this);
    }

    start() {
        if (this.running) return;
        this.running = true;
        this.lastTime = performance.now();
        requestAnimationFrame(this.loop);
    }

    stop() {
        this.running = false;
    }

    add(callback) {
        this.callbacks.push(callback);
    }

    loop(currentTime) {
        if (!this.running) return;

        const delta = (currentTime - this.lastTime) / 1000; // Convert to seconds
        this.lastTime = currentTime;

        // Cap delta to prevent huge jumps if tab was inactive
        const safeDelta = Math.min(delta, 0.1);

        this.callbacks.forEach(cb => cb(safeDelta));

        requestAnimationFrame(this.loop);
    }
}
