import * as THREE from 'three';
import { GAME_CONFIG } from '../utils/Constants.js';
import { MathUtils } from '../utils/MathUtils.js';

export class CameraController {
    constructor() {
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(
            GAME_CONFIG.CAMERA.FOV,
            aspect,
            GAME_CONFIG.CAMERA.NEAR,
            GAME_CONFIG.CAMERA.FAR
        );

        // Initial Position
        this.camera.position.set(
            GAME_CONFIG.CAMERA.INIT_POS.x,
            GAME_CONFIG.CAMERA.INIT_POS.y,
            GAME_CONFIG.CAMERA.INIT_POS.z
        );
        this.camera.lookAt(
            GAME_CONFIG.CAMERA.LOOK_AT.x,
            GAME_CONFIG.CAMERA.LOOK_AT.y,
            GAME_CONFIG.CAMERA.LOOK_AT.z
        );

        this.targetY = GAME_CONFIG.CAMERA.INIT_POS.y;
        this.smoothness = 0.1; // Lerp factor
        this.renderSize = new THREE.Vector2(window.innerWidth, window.innerHeight);
    }

    update(towerHeight) {
        // Camera rises as the tower grows
        this.targetY = towerHeight + GAME_CONFIG.CAMERA.INIT_POS.y;

        this.camera.position.y = MathUtils.lerp(
            this.camera.position.y,
            this.targetY,
            this.smoothness
        );
    }

    onResize() {
        this.renderSize.set(window.innerWidth, window.innerHeight);
        this.camera.aspect = this.renderSize.width / this.renderSize.height;
        this.camera.updateProjectionMatrix();
    }

    getCamera() {
        return this.camera;
    }

    reset() {
        this.targetY = GAME_CONFIG.CAMERA.INIT_POS.y;
        this.camera.position.y = this.targetY;
    }
}
