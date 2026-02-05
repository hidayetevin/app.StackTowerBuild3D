import * as THREE from 'three';
import { GAME_CONFIG } from '../utils/Constants.js';

export class SceneManager {
    constructor() {
        this.scene = new THREE.Scene();

        // Sky: Light blue or gradient as requested
        this.scene.background = new THREE.Color(0x87ceeb);

        this.setupLights();

        // World Group for environment (Ground, Clouds)
        this.worldGroup = new THREE.Group();
        this.scene.add(this.worldGroup);

        this.initEnvironment();
    }

    initEnvironment() {
        // 1. Ground (Green Plane)
        const groundGeo = new THREE.PlaneGeometry(100, 100);
        const groundMat = new THREE.MeshLambertMaterial({ color: 0x3fa34d });

        this.ground = new THREE.Mesh(groundGeo, groundMat);
        this.ground.rotation.x = -Math.PI / 2;
        // Position at -10 to be visible at bottom but not intrusive
        this.ground.position.y = -10;

        // Ensure ground render order is higher than clouds to force it in front
        this.ground.renderOrder = 2;

        this.worldGroup.add(this.ground);

        // 2. Cloud System
        this.cloudGroup = new THREE.Group();
        this.worldGroup.add(this.cloudGroup);

        this.clouds = [];
        const cloudCount = 15; // Increased count for better saturation
        const texture = this.createCloudTexture();
        const baseMaterial = new THREE.SpriteMaterial({
            map: texture,
            color: 0xffffff,
            transparent: true,
            opacity: 0.85,
            depthWrite: false
        });

        for (let i = 0; i < cloudCount; i++) {
            // Randomly select a cloud style
            const type = Math.random() > 0.6 ? 'cumulus' : (Math.random() > 0.5 ? 'stratus' : 'puff');
            const cloud = this.createCloud(type, baseMaterial);

            // Allow clouds to cover a wider area
            cloud.position.x = (Math.random() - 0.5) * 80;
            // Height variance: Keep them in the "sky" but visible
            cloud.position.y = -5 + Math.random() * 50;
            // Depth variance: Push further back to ensure separation from ground
            cloud.position.z = -30 - Math.random() * 40;

            // Random scaling for the whole cloud group
            const globalScale = 1 + Math.random() * 0.5;
            cloud.scale.set(globalScale, globalScale, globalScale);

            this.cloudGroup.add(cloud);
            this.clouds.push(cloud);
        }
    }

    createCloud(type, material) {
        const cloud = new THREE.Group();
        // Set renderOrder for the whole group to ensure it renders behind the ground
        cloud.renderOrder = -1;

        let particles = 0;

        // Define shape generation logic
        if (type === 'cumulus') {
            // Dense, tall, fluffy cluster
            particles = 8 + Math.floor(Math.random() * 5);
            for (let j = 0; j < particles; j++) {
                const sprite = new THREE.Sprite(material.clone());
                sprite.renderOrder = -1; // Ensure sprites conform to the background order

                // Central mass with some spread
                sprite.position.set(
                    (Math.random() - 0.5) * 6,
                    (Math.random() - 0.2) * 5, // Taller
                    (Math.random() - 0.5) * 4
                );
                // Large overlapping puffs
                const scale = 6 + Math.random() * 5;
                sprite.scale.set(scale, scale, 1);
                // Rotate material slightly (if supported) or just vary opacity per puff for depth
                sprite.material.rotation = Math.random() * 0.5 - 0.25;
                sprite.material.opacity = 0.7 + Math.random() * 0.3; // Varying opacity
                cloud.add(sprite);
            }
        } else if (type === 'stratus') {
            // Flat, wide, stretched
            particles = 6 + Math.floor(Math.random() * 4);
            for (let j = 0; j < particles; j++) {
                const sprite = new THREE.Sprite(material.clone());
                sprite.renderOrder = -1;

                sprite.position.set(
                    (Math.random() - 0.5) * 12, // Wider
                    (Math.random() - 0.5) * 2,  // Flatter
                    (Math.random() - 0.5) * 3
                );
                const scale = 5 + Math.random() * 4;
                sprite.scale.set(scale, scale * 0.7, 1); // Slightly flattened
                sprite.material.opacity = 0.6 + Math.random() * 0.3;
                cloud.add(sprite);
            }
        } else {
            // Small 'puff' / generic cloud
            particles = 3 + Math.floor(Math.random() * 3);
            for (let j = 0; j < particles; j++) {
                const sprite = new THREE.Sprite(material.clone());
                sprite.renderOrder = -1;

                sprite.position.set(
                    (Math.random() - 0.5) * 4,
                    (Math.random() - 0.5) * 3,
                    (Math.random() - 0.5) * 3
                );
                const scale = 4 + Math.random() * 3;
                sprite.scale.set(scale, scale, 1);
                cloud.add(sprite);
            }
        }
        return cloud;
    }

    createCloudTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');

        // Radial gradient for soft puff
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)'); // Center opaque-ish
        gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.5)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)'); // Edge transparent

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);

        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    update(towerHeight) {
        // Implement the "World Scroll" effect from prompt
        if (this.worldGroup) {
            this.worldGroup.position.y = -towerHeight * 0.5;
        }

        // Ground disappearing logic
        if (this.ground && towerHeight > 5) {
            this.ground.position.y = THREE.MathUtils.lerp(
                this.ground.position.y,
                -40, // Move it further down to hide
                0.01
            );
        }

        // Cloud movement
        if (this.clouds) {
            this.clouds.forEach(cloud => {
                // Parallax/Drift
                cloud.position.y -= 0.02;

                // Reset if too low
                if (cloud.position.y < -20) {
                    cloud.position.y = 60 + Math.random() * 20;
                    cloud.position.x = (Math.random() - 0.5) * 60;
                }
            });
        }

        // Background color transition
        if (towerHeight > 50) {
            // Future implementation
        }
    }
    setupLights() {
        const ambient = new THREE.AmbientLight(0xffffff, 0.5);

        // Keep standard directional light for shadows/depth
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        this.directionalLight.position.set(10, 20, 10);

        // Simple point light for fill
        const pointLight = new THREE.PointLight(0x00ffff, 0.3);
        pointLight.position.set(-5, 10, -5);

        this.scene.add(ambient, this.directionalLight, pointLight);
    }

    applyTheme(theme) {
        // Basic theme support if requested later, minimal implementation for now
        if (theme && theme.background && theme.background.type === 'solid') {
            // Maybe override? For now stick to prompt requirement of 0x87ceeb
        }
    }

    add(object) { this.scene.add(object); }
    remove(object) { this.scene.remove(object); }
}
