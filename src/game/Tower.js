import { Block } from './Block.js';
import { Collision } from './Collision.js';
import { ParticleSystem } from './ParticleSystem.js'; // Added
import { GAME_CONFIG, PERFORMANCE } from '../utils/Constants.js';
import * as THREE from 'three';

export class Tower {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.blocks = [];
        this.blockPool = [];
        this.baseSize = { x: GAME_CONFIG.INITIAL_BLOCK_SIZE, y: GAME_CONFIG.BLOCK_HEIGHT, z: GAME_CONFIG.INITIAL_BLOCK_SIZE };

        // Visuals
        this.particleSystem = new ParticleSystem(sceneManager);
        this.hue = 0; // For rainbow colors
    }

    init() {
        this.addBaseBlock();
    }

    reset() {
        this.blocks.forEach(block => this.recycleBlock(block));
        this.blocks = [];
        this.hue = 0;
        this.addBaseBlock();
    }

    update(delta) {
        const topBlock = this.getTopBlock();
        if (topBlock && topBlock.state === 'MOVING') {
            topBlock.update(delta);
        }
        this.particleSystem.update(delta); // Update particles
    }

    addBaseBlock() {
        const baseBlock = new Block(
            this.baseSize,
            new THREE.Vector3(0, 0, 0),
            'static',
            this.getRainbowColor()
        );
        baseBlock.stop();
        this.sceneManager.add(baseBlock.mesh);
        this.blocks.push(baseBlock);
    }

    getRainbowColor() {
        const color = new THREE.Color().setHSL(this.hue, 0.7, 0.5);
        this.hue += 0.05; // Increment hue for next block
        if (this.hue > 1) this.hue -= 1;
        return color.getHex();
    }

    spawnNextBlock(speed) {
        const prevBlock = this.getTopBlock();
        const yPos = prevBlock.mesh.position.y + GAME_CONFIG.BLOCK_HEIGHT;
        const direction = (this.blocks.length % 2 === 0) ? 'x' : 'z';

        let startPos = new THREE.Vector3(prevBlock.mesh.position.x, yPos, prevBlock.mesh.position.z);
        if (direction === 'x') startPos.x = -GAME_CONFIG.BLOCK_START_POS;
        else startPos.z = -GAME_CONFIG.BLOCK_START_POS;

        const newBlock = this.getBlockFromPool();
        const currentSize = { ...prevBlock.size };
        currentSize.y = GAME_CONFIG.BLOCK_HEIGHT;

        newBlock.reset(currentSize, startPos, direction, speed);
        newBlock.setColor(this.getRainbowColor()); // Apply new color

        this.sceneManager.add(newBlock.mesh);
        this.blocks.push(newBlock);

        return newBlock;
    }

    placeCurrentBlock() {
        if (this.blocks.length <= 1) return { success: true };

        const currentBlock = this.blocks[this.blocks.length - 1];
        const prevBlock = this.blocks[this.blocks.length - 2];

        currentBlock.stop();
        const collisionResult = Collision.checkOverlap(currentBlock, prevBlock);

        if (collisionResult.hasMissed) {
            this.dropBlock(currentBlock);
            return { success: false, result: collisionResult };
        }

        if (collisionResult.isPerfect) {
            const axis = currentBlock.direction === 'x' ? 'x' : 'z';
            currentBlock.mesh.position[axis] = prevBlock.mesh.position[axis];

            // Visual: Perfect Effect
            this.spawnPerfectEffect(currentBlock.mesh.position);
        } else {
            this.sliceBlock(currentBlock, collisionResult);
        }

        return { success: true, result: collisionResult };
    }

    spawnPerfectEffect(position) {
        // Spawn white particles for perfect hit
        this.particleSystem.spawnParticles(position, 0xffffff, 20);

        // Flash effect (optional, implies simple light tween or similar)
        // For MVP, particles are enough juice.
    }

    sliceBlock(block, collision) {
        const { axis, newCenter, overlap } = collision;

        const newSize = { ...block.size };
        newSize[axis] = overlap;

        const newPos = block.mesh.position.clone();
        newPos[axis] = newCenter;

        block.resize(newSize, newPos);

        // Spawn debris particles instead of physical chunk for performance
        this.particleSystem.spawnParticles(block.mesh.position, block.material.uniforms.colorTop.value.getHex(), 5);
    }

    dropBlock(block) {
        // Just let it fall visually if we had physics
        // For now, we spawn "fail" particles and remove it
        this.particleSystem.spawnParticles(block.mesh.position, 0xff0000, 30);
    }

    getTopBlock() { return this.blocks[this.blocks.length - 1]; }
    getHeight() { return (this.blocks.length - 1) * GAME_CONFIG.BLOCK_HEIGHT; }

    getBlockFromPool() {
        if (this.blockPool.length > 0) return this.blockPool.pop();
        return new Block(this.baseSize, new THREE.Vector3(), 'x');
    }

    recycleBlock(block) {
        this.sceneManager.remove(block.mesh);
        if (this.blockPool.length < PERFORMANCE.MAX_ACTIVE_BLOCKS) {
            this.blockPool.push(block);
        } else {
            block.geometry.dispose();
            block.material.dispose();
        }
    }
}
