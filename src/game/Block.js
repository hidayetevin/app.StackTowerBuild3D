import * as THREE from 'three';
import { GAME_CONFIG } from '../utils/Constants.js';
import { VERTEX_SHADER, FRAGMENT_SHADER } from './Shaders.js';

export class Block {
    constructor(size, position, direction, color = GAME_CONFIG.COLORS.BLOCK_BASE, patternType = 0) {
        this.size = { ...size };
        // Create a 1x1x1 cube once and scale it
        this.geometry = new THREE.BoxGeometry(1, 1, 1);

        this.material = new THREE.ShaderMaterial({
            uniforms: {
                colorTop: { value: new THREE.Color(color).offsetHSL(0, 0, 0.1) },
                colorBottom: { value: new THREE.Color(color).offsetHSL(0, 0, -0.1) },
                opacity: { value: 1.0 },
                patternType: { value: patternType }
            },
            vertexShader: VERTEX_SHADER,
            fragmentShader: FRAGMENT_SHADER,
            transparent: true
        });

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.mesh.position.copy(position);

        // Initial scale
        this.updateScale();

        this.direction = direction;
        this.speed = GAME_CONFIG.BASE_SPEED;
        this.state = 'MOVING';
        this.patternType = patternType;
    }

    updateScale() {
        this.mesh.scale.set(this.size.x, this.size.y, this.size.z);
    }

    update(delta) {
        if (this.state !== 'MOVING') return;

        const axis = this.direction === 'x' ? 'x' : 'z';
        this.mesh.position[axis] += this.speed * delta;

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

    setColor(hexColor) {
        if (this.material.uniforms) {
            this.material.uniforms.colorTop.value.setHex(hexColor).offsetHSL(0, 0, 0.1);
            this.material.uniforms.colorBottom.value.setHex(hexColor).offsetHSL(0, 0, -0.1);
        }
    }

    setPattern(type) {
        if (this.material.uniforms) {
            this.material.uniforms.patternType.value = type;
            this.patternType = type;
        }
    }

    resize(newSize, newPosition) {
        this.size = { ...newSize };
        this.updateScale();
        this.mesh.position.copy(newPosition);
    }

    reset(size, position, direction, speed, patternType = 0) {
        this.state = 'MOVING';
        this.direction = direction;
        this.speed = speed;
        this.size = { ...size };
        this.updateScale();
        this.mesh.position.copy(position);
        this.setPattern(patternType);
        this.mesh.visible = true;
    }
}
