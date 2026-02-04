import { SceneManager } from './SceneManager.js';
import { CameraController } from './CameraController.js';
import { GameLoop } from './GameLoop.js';
import { InputManager } from './InputManager.js';
import { StateMachine } from './StateMachine.js';
import { Tower } from '../game/Tower.js';
import { Scoring } from '../game/Scoring.js';
import { Difficulty } from '../game/Difficulty.js';
import { HUD } from '../ui/HUD.js';
import { STATES } from '../utils/Constants.js';
import * as THREE from 'three';

export class Game {
    constructor() {
        // Managers
        this.sceneManager = new SceneManager();
        this.cameraController = new CameraController();
        this.stateMachine = new StateMachine();
        this.gameLoop = new GameLoop();
        this.inputManager = new InputManager(this.onInput.bind(this));
        this.hud = new HUD();

        // Game Logic
        this.tower = new Tower(this.sceneManager);
        this.scoring = new Scoring();
        this.difficulty = new Difficulty();

        // Bindings
        this.update = this.update.bind(this);

        // Init
        this.init();
    }

    init() {
        // Setup Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        document.body.appendChild(this.renderer.domElement);

        // Setup Resizer
        window.addEventListener('resize', this.onResize.bind(this));

        // Setup Loop
        this.gameLoop.add(this.update);

        // Initialize Game State
        this.stateMachine.setState(STATES.MENU);
        this.tower.init(); // Add base block

        // Start Render Loop
        this.gameLoop.start();
    }

    onInput() {
        const state = this.stateMachine.getState();

        if (state === STATES.MENU || state === STATES.GAMEOVER) {
            this.startGame();
        } else if (state === STATES.PLAYING) {
            this.placeBlock();
        }
    }

    startGame() {
        this.stateMachine.setState(STATES.PLAYING);
        this.tower.reset();
        this.scoring.reset();
        this.difficulty.reset();
        this.cameraController.reset();

        this.hud.showGameUI();

        // Spawn first block
        this.tower.spawnNextBlock(this.difficulty.getSpeed());
    }

    placeBlock() {
        const result = this.tower.placeCurrentBlock();

        if (!result.success) {
            this.gameOver();
        } else {
            // Success
            this.scoring.addPoint();
            if (result.result.isPerfect) {
                this.scoring.registerPerfectHit();
            } else {
                this.scoring.resetCombo();
            }

            this.hud.updateScore(this.scoring.getScore());
            this.difficulty.increaseXY();

            // Camera
            this.cameraController.update(this.tower.getHeight());

            // Next Block
            this.tower.spawnNextBlock(this.difficulty.getSpeed());
        }
    }

    gameOver() {
        this.stateMachine.setState(STATES.GAMEOVER);
        this.hud.showGameOver();
    }

    update(delta) {
        // Update Game Logic
        this.tower.update(delta);

        // Update Camera
        // (Camera lerping is handled in CameraController update relative to height, but we call it here if we need continuous smooth movement)
        // Here we just let it sit, or we could animate it slightly. 
        // Actually CameraController.update is called on block place, but the smooth lerp needs to happen every frame.
        // Let's modify CameraController to have a 'tick' method or similar if needed. 
        // For now, let's call update manually with current target if we want continuous smoothing
        // but currently CameraController.update sets the target and lerps once? No, lerp needs to be called every frame.

        // Fix for Camera Lerp:
        // We should probably read the target Y inside camera controller and lerp towards it every frame
        // I'll assume I need to fix CameraController to separate 'setTarget' and 'updatePosition'.
        // For now, I will re-call cameraController.update with the current height target to trigger the lerp.
        // Actually the current CameraController.update(height) sets the target AND does one lerp step.
        // So we should call it every frame with the CURRENT target height.
        this.cameraController.update(this.tower.getHeight());

        // Render
        this.renderer.render(this.sceneManager.scene, this.cameraController.camera);
    }

    onResize() {
        this.cameraController.onResize();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
