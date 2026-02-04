import * as THREE from 'three';
import { GAME_CONFIG } from '../utils/Constants.js';

export class SceneManager {
    constructor() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(GAME_CONFIG.COLORS.BACKGROUND);

        this.setupLights();
    }

    setupLights() {
        // Ambient light for base illumination
        const ambient = new THREE.AmbientLight(GAME_CONFIG.COLORS.LIGHT_AMBIENT, 0.6);

        // Directional light for shadows (if enabled) and definition
        const directional = new THREE.DirectionalLight(GAME_CONFIG.COLORS.LIGHT_DIR, 0.8);
        directional.position.set(5, 10, 5);

        // NO SHADOWS (performance optimization as per prompt)
        directional.castShadow = false;

        this.scene.add(ambient, directional);
    }

    add(object) {
        this.scene.add(object);
    }

    remove(object) {
        this.scene.remove(object);
    }

    // Helper to get the underlying THREE.Scene
    getScene() {
        return this.scene;
    }
}
