import * as THREE from 'three';
import { GAME_CONFIG } from '../utils/Constants.js';

export class SceneManager {
    constructor() {
        this.scene = new THREE.Scene();
        this.scene.background = this.createGradientTexture('#1a2a6c', '#b21f1f', '#fdbb2d');
        this.setupLights();
    }

    applyTheme(theme) {
        if (!theme) return;

        // Background
        if (theme.background.type === 'gradient') {
            this.scene.background = this.createGradientTexture(theme.background.topColor, theme.background.topColor, theme.background.bottomColor); // Simplified middle
        } else if (theme.background.type === 'solid') {
            this.scene.background = new THREE.Color(theme.background.color);
        }

        // Light
        if (this.directionalLight && theme.lightColor) {
            this.directionalLight.color.set(theme.lightColor);
        }
    }

    createGradientTexture(top, mid, bot) {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');

        const gradient = ctx.createLinearGradient(0, 0, 0, 128);
        gradient.addColorStop(0, top);
        gradient.addColorStop(0.5, mid);
        gradient.addColorStop(1, bot);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 32, 128);

        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        return texture;
    }

    setupLights() {
        const ambient = new THREE.AmbientLight(0xffffff, 0.4);

        // Save reference to modify later
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
        this.directionalLight.position.set(10, 20, 10);

        const pointLight = new THREE.PointLight(0x00ffff, 0.5);
        pointLight.position.set(-5, 10, -5);

        this.scene.add(ambient, this.directionalLight, pointLight);
        this.pointLight = pointLight;
    }

    add(object) { this.scene.add(object); }
    remove(object) { this.scene.remove(object); }

    update() { }
}
