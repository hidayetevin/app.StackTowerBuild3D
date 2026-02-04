import * as THREE from 'three';
import { GAME_CONFIG } from '../utils/Constants.js';

export class SceneManager {
    constructor() {
        this.scene = new THREE.Scene();
        // Gradient Background via CSS or Texture?
        // Let's keep it simple THREE.Color but a bit nicer/dynamic if possible.
        // For MVP, a solid nice blue is fine, let's tweak it to Soft Purple/Blue gradient style
        // Since THREE.Scene.background can be a texture, we can use a canvas gradient.
        this.scene.background = this.createGradientTexture();

        this.setupLights();
    }

    createGradientTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 128; // Vertical gradient
        const ctx = canvas.getContext('2d');

        // Deep Space Blue to Lighter Blue
        const gradient = ctx.createLinearGradient(0, 0, 0, 128);
        gradient.addColorStop(0, '#1a2a6c');   // Top
        gradient.addColorStop(0.5, '#b21f1f'); // Middle (Sunset vibe)
        gradient.addColorStop(1, '#fdbb2d');   // Bottom

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 32, 128);

        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        return texture;
    }

    setupLights() {
        const ambient = new THREE.AmbientLight(0xffffff, 0.4);

        const directional = new THREE.DirectionalLight(0xffffff, 0.9);
        directional.position.set(10, 20, 10);

        // Add a secondary colored light for artistic feel
        const pointLight = new THREE.PointLight(0x00ffff, 0.5);
        pointLight.position.set(-5, 10, -5);

        this.scene.add(ambient, directional, pointLight);
        this.pointLight = pointLight;
    }

    add(object) { this.scene.add(object); }
    remove(object) { this.scene.remove(object); }

    update() {
        // Maybe rotate lights or background?
    }
}
