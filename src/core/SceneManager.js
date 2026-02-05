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
        // 1. Ground (Voxel Grass Terrain)
        this.ground = this.createVoxelGround();
        // Position at -25 as requested
        this.ground.position.y = -25;
        this.ground.renderOrder = 2;
        this.worldGroup.add(this.ground);

        // 2. Cloud System
        this.cloudGroup = new THREE.Group();
        this.worldGroup.add(this.cloudGroup);

        this.clouds = [];
        const cloudCount = 25; // Increased count for better saturation
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

    createVoxelGround() {
        const terrainGroup = new THREE.Group();
        // Use a smaller block size for finer detail
        const BLOCK_SIZE = 0.8;
        // Grid size needs to be larger to cover the same area (approx 70x0.8 = 56 width)
        const GRID_SIZE = 70;

        for (let x = -GRID_SIZE / 2; x < GRID_SIZE / 2; x++) {
            for (let z = -GRID_SIZE / 2; z < GRID_SIZE / 2; z++) {
                const distance = Math.sqrt(x * x + z * z);
                // Create a circular island effect
                if (distance > GRID_SIZE / 2) continue;

                // Slight height variation logic from example
                const noise = Math.sin(x * 0.2) * Math.cos(z * 0.2);
                const height = Math.max(0, 1 - distance / (GRID_SIZE / 2)) * 1.5 + noise * 0.3;
                const blockHeight = Math.max(1, Math.floor(height));

                // Create blocks for this column
                for (let y = 0; y < blockHeight; y++) {
                    const geometry = new THREE.BoxGeometry(BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);

                    // Determine color (dirt brown for lower blocks, grass green for top)
                    const isTopBlock = (y === blockHeight - 1);
                    let color;

                    if (isTopBlock) {
                        // Grass top - varied greens
                        const greenVariation = 0.8 + Math.random() * 0.4;
                        color = new THREE.Color(
                            0.15 * greenVariation,
                            0.45 * greenVariation,
                            0.15 * greenVariation
                        );
                    } else {
                        // Dirt - browns
                        color = new THREE.Color(
                            0.35 + Math.random() * 0.1,
                            0.25 + Math.random() * 0.1,
                            0.15
                        );
                    }

                    const material = new THREE.MeshLambertMaterial({
                        color: color
                    });

                    const block = new THREE.Mesh(geometry, material);
                    block.position.set(
                        x * BLOCK_SIZE,
                        y * BLOCK_SIZE, // Offset so y=0 is bottom? Actually just stack them
                        z * BLOCK_SIZE
                    );
                    block.receiveShadow = true;
                    terrainGroup.add(block);
                }

                // Add grass blades on top of the top block
                if (Math.random() > 0.4) { // 60% chance
                    const grassBlade = this.createSimpleGrassBlade(BLOCK_SIZE);
                    grassBlade.position.set(
                        x * BLOCK_SIZE + (Math.random() - 0.5) * BLOCK_SIZE * 0.6,
                        blockHeight * BLOCK_SIZE - (BLOCK_SIZE * 0.5), // Adjust to sit on top
                        z * BLOCK_SIZE + (Math.random() - 0.5) * BLOCK_SIZE * 0.6
                    );
                    grassBlade.position.y += BLOCK_SIZE; // Move up to surface
                    grassBlade.rotation.y = Math.random() * Math.PI * 2;
                    terrainGroup.add(grassBlade);
                }
            }
        }
        return terrainGroup;
    }

    createSimpleGrassBlade(scaleUnit) {
        const group = new THREE.Group();

        // Simple 2-3 segment grass blade
        const segments = 2 + Math.floor(Math.random() * 2);
        const baseWidth = 0.06 * scaleUnit; // Scale width generally

        for (let i = 0; i < segments; i++) {
            const size = baseWidth * (1 - i / segments * 0.4);
            const height = size * 3; // Make them a bit taller relative to width
            const geometry = new THREE.BoxGeometry(size, height, size);

            // Gradient from dark to light green
            const brightness = 0.7 + (i / segments) * 0.5;
            const color = new THREE.Color(
                0.15 * brightness,
                0.5 * brightness,
                0.15 * brightness
            );

            const material = new THREE.MeshLambertMaterial({
                color: color
            });

            const segment = new THREE.Mesh(geometry, material);
            segment.position.y = i * height * 0.8;
            segment.position.x = i * size * 0.3; // Slight lean
            group.add(segment);
        }

        return group;
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
