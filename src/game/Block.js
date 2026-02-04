import * as THREE from 'three';
import { GAME_CONFIG } from '../utils/Constants.js';

export class Block {
    constructor(size, position, direction, color = GAME_CONFIG.COLORS.BLOCK_BASE) {
        // Create geometry and material
        this.geometry = new THREE.BoxGeometry(size.x, size.y, size.z);

        // Use MeshStandardMaterial for reaction to light
        this.material = new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.5,
            metalness: 0.1
        });

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.copy(position);

        this.direction = direction; // 'x' or 'z'
        this.speed = GAME_CONFIG.BASE_SPEED;
        this.state = 'MOVING'; // MOVING, STOPPED, FALLING

        // Store size for collision logic
        this.size = { ...size };
    }

    update(delta) {
        if (this.state !== 'MOVING') return;

        const axis = this.direction === 'x' ? 'x' : 'z';
        this.mesh.position[axis] += this.speed * delta;

        // Ping-pong movement
        // We oscillate between -range and +range relative to center (0,0) usually
        // But the previous block might be offset. 
        // For simplicity in Phase 1, we oscillate around 0 with a fixed amplitude derived from GAME_CONFIG
        const limit = GAME_CONFIG.BLOCK_START_POS;

        if (this.mesh.position[axis] > limit) {
            this.mesh.position[axis] = limit;
            this.speed *= -1;
        } else if (this.mesh.position[axis] < -limit) {
            this.mesh.position[axis] = -limit;
            this.speed *= -1;
        }
    }

    stop() {
        this.state = 'STOPPED';
    }

    // Update mesh geometry size (used after slicing)
    resize(newSize, newPosition) {
        this.size = { ...newSize };

        // Dispose old geometry to free memory
        this.geometry.dispose();

        // Create new geometry with updated size
        this.geometry = new THREE.BoxGeometry(newSize.x, newSize.y, newSize.z);
        this.mesh.geometry = this.geometry;

        // Update position
        this.mesh.position.copy(newPosition);
    }

    // For object pooling: reset state
    reset(size, position, direction, speed) {
        this.state = 'MOVING';
        this.direction = direction;
        this.speed = speed;

        // Reset Geometry if size changed drastically or just resize
        this.resize(size, position);
        this.mesh.visible = true;
    }
}
