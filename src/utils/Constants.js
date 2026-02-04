export const PERFORMANCE = {
    MAX_DRAW_CALLS: 25,
    MAX_TRIANGLES: 6000,
    MAX_ACTIVE_BLOCKS: 30,
    TARGET_FPS: 60,
    MIN_FPS: 45,
    MAX_MEMORY_MB: 120
};

export const GAME_CONFIG = {
    BLOCK_HEIGHT: 1.0,
    INITIAL_BLOCK_SIZE: 3.0,
    BLOCK_START_POS: 6.0, // Distance from center where block spawns
    BASE_SPEED: 2.0,
    SPEED_INCREMENT: 0.1,
    PERFECT_TOLERANCE: 0.05, // Error margin for perfect alignment
    COLORS: {
        BACKGROUND: 0x87CEEB,
        BLOCK_BASE: 0x4CAF50,
        LIGHT_AMBIENT: 0xffffff,
        LIGHT_DIR: 0xffffff
    },
    CAMERA: {
        FOV: 45,
        NEAR: 0.1,
        FAR: 1000,
        INIT_POS: { x: 4, y: 7, z: 10 }, // Isometric-ish view
        LOOK_AT: { x: 0, y: 0, z: 0 }
    }
};

export const STATES = {
    MENU: 'MENU',
    PLAYING: 'PLAYING',
    GAMEOVER: 'GAMEOVER',
    PAUSED: 'PAUSED'
};
