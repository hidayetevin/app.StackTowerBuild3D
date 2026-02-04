import { STATES } from '../utils/Constants.js';

export class StateMachine {
    constructor() {
        this.currentState = STATES.MENU;
        this.listeners = [];
    }

    setState(newState) {
        if (this.currentState === newState) return;

        const oldState = this.currentState;
        this.currentState = newState;

        console.log(`State Changed: ${oldState} -> ${newState}`);
        this.notify(newState, oldState);
    }

    getState() {
        return this.currentState;
    }

    addListener(callback) {
        this.listeners.push(callback);
    }

    notify(newState, oldState) {
        this.listeners.forEach(cb => cb(newState, oldState));
    }
}
