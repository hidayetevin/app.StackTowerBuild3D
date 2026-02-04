export class MathUtils {
    static lerp(start, end, t) {
        return start * (1 - t) + end * t;
    }

    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
}
