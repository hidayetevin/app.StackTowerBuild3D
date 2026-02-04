import { GAME_CONFIG } from '../utils/Constants.js';

export class Collision {
    static checkOverlap(currentBlock, previousBlock) {
        const dir = currentBlock.direction;
        const axis = dir === 'x' ? 'x' : 'z';

        // Get positions and sizes
        const currentPos = currentBlock.mesh.position[axis];
        const previousPos = previousBlock.mesh.position[axis];

        const currentLen = currentBlock.size[axis];
        const previousLen = previousBlock.size[axis]; // Usually same as current before cut

        // Calculate edges
        const currentStart = currentPos - currentLen / 2;
        const currentEnd = currentPos + currentLen / 2;
        const previousStart = previousPos - previousLen / 2;
        const previousEnd = previousPos + previousLen / 2;

        // Calculate overlap
        const overlapStart = Math.max(currentStart, previousStart);
        const overlapEnd = Math.min(currentEnd, previousEnd);
        const overlap = Math.max(0, overlapEnd - overlapStart);

        // Normalize overlap against previous block size
        const overlapPercentage = overlap / previousLen;

        // Calculate new center for the overlapping part
        const newCenter = (overlapStart + overlapEnd) / 2;

        return {
            overlap,
            percentage: overlapPercentage,
            isPerfect: Math.abs(currentPos - previousPos) < GAME_CONFIG.PERFECT_TOLERANCE, // If centers are very close
            isGood: overlapPercentage >= 0.70,
            hasMissed: overlap <= 0,
            axis: axis,
            newCenter: newCenter
        };
    }
}
