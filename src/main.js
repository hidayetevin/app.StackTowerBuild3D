import { Game } from './core/Game.js';

// Wait for DOM
window.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    // Expose for debugging
    window.game = game;
});
