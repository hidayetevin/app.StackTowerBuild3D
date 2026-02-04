import { Block } from './Block.js';
import { Collision } from './Collision.js';
import { GAME_CONFIG, PERFORMANCE } from '../utils/Constants.js';
import * as THREE from 'three';

export class Tower {
    constructor(sceneManager) {
        this.sceneManager = sceneManager;
        this.blocks = [];
        this.blockPool = []; // Object pooling
        this.baseSize = { x: GAME_CONFIG.INITIAL_BLOCK_SIZE, y: GAME_CONFIG.BLOCK_HEIGHT, z: GAME_CONFIG.INITIAL_BLOCK_SIZE };
        this.lastPosition = { x: 0, y: 0, z: 0 };
    }

    init() {
        // Create base block (static)
        this.addBaseBlock();
    }

    reset() {
        // Recycle all blocks
        this.blocks.forEach(block => {
            this.recycleBlock(block);
        });
        this.blocks = [];
        this.addBaseBlock();
    }

    addBaseBlock() {
        // The first block at the bottom
        const baseBlock = new Block(
            this.baseSize,
            new THREE.Vector3(0, 0, 0),
            'static', // No movement
            GAME_CONFIG.COLORS.BLOCK_BASE
        );
        baseBlock.stop();
        this.sceneManager.add(baseBlock.mesh);
        this.blocks.push(baseBlock);

        this.lastPosition = { x: 0, y: 0, z: 0 };
    }

    spawnNextBlock(speed) {
        const prevBlock = this.getTopBlock();
        const yPos = prevBlock.mesh.position.y + GAME_CONFIG.BLOCK_HEIGHT;

        // Alternate direction
        const direction = (this.blocks.length % 2 === 0) ? 'x' : 'z';

        // Start position offset
        let startPos = new THREE.Vector3(prevBlock.mesh.position.x, yPos, prevBlock.mesh.position.z);
        if (direction === 'x') {
            startPos.x = -GAME_CONFIG.BLOCK_START_POS;
        } else {
            startPos.z = -GAME_CONFIG.BLOCK_START_POS;
        }

        // Get from pool or create new
        const newBlock = this.getBlockFromPool();

        // Reset block state with current top block's size (because we might have sliced it)
        const currentSize = { ...prevBlock.size };
        // Reset height to standard just in case
        currentSize.y = GAME_CONFIG.BLOCK_HEIGHT;

        newBlock.reset(currentSize, startPos, direction, speed);

        this.sceneManager.add(newBlock.mesh);
        this.blocks.push(newBlock);

        return newBlock;
    }

    placeCurrentBlock() {
        if (this.blocks.length <= 1) return { success: true }; // Should not happen if game flow is correct

        const currentBlock = this.blocks[this.blocks.length - 1];
        const prevBlock = this.blocks[this.blocks.length - 2];

        currentBlock.stop();

        const collisionResult = Collision.checkOverlap(currentBlock, prevBlock);

        if (collisionResult.hasMissed) {
            // Game Over
            this.dropBlock(currentBlock);
            return { success: false, result: collisionResult };
        }

        // Handle Overlap (Slice)
        if (collisionResult.isPerfect) {
            // Perfect! Snap to previous position
            const axis = currentBlock.direction === 'x' ? 'x' : 'z';
            currentBlock.mesh.position[axis] = prevBlock.mesh.position[axis];
            // Size remains same
        } else {
            // Slice logic
            this.sliceBlock(currentBlock, collisionResult);
        }

        return { success: true, result: collisionResult };
    }

    sliceBlock(block, collision) {
        const { axis, newCenter, overlap } = collision;

        // Update current block to the overlapped size
        const newSize = { ...block.size };
        newSize[axis] = overlap;

        const newPos = block.mesh.position.clone();
        newPos[axis] = newCenter;

        block.resize(newSize, newPos);

        // Visual: Create falling part (the cutoff) using the debris
        this.spawnDebris(block, collision);
    }

    spawnDebris(block, collision) {
        // Phase 1: Minimal debris (optional, but good for visual debugging)
        // Leaving empty/simple for now to save tokens, or add simple mesh
        // For MVP, we skip debris physics for now as "Physics engine (manuel hesapla)" implies we shouldn't use Cannon.js etc.
        // We can just ignore the falling part for this exact step to keep it speed.
    }

    dropBlock(block) {
        // Visual: make it fall (simple gravity animation could be handled by block update if state is FALLING)
        // For now, just remove from scene or let it stay in air
    }

    getTopBlock() {
        return this.blocks[this.blocks.length - 1];
    }

    getHeight() {
        return (this.blocks.length - 1) * GAME_CONFIG.BLOCK_HEIGHT;
    }

    update(delta) {
        // Update the active moving block
        const topBlock = this.getTopBlock();
        if (topBlock && topBlock.state === 'MOVING') {
            topBlock.update(delta);
        }
    }

    // Pooling Logic
    getBlockFromPool() {
        if (this.blockPool.length > 0) {
            return this.blockPool.pop();
        }
        // Fallback: create new with placeholder values, will be reset immediately
        return new Block(this.baseSize, new THREE.Vector3(), 'x');
    }

    recycleBlock(block) {
        this.sceneManager.remove(block.mesh);
        if (this.blockPool.length < PERFORMANCE.MAX_ACTIVE_BLOCKS) {
            this.blockPool.push(block);
        } else {
            // Clean up geometry/material
            block.geometry.dispose();
            block.material.dispose();
        }
    }
}
