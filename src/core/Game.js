import { SceneManager } from './SceneManager.js';
import { CameraController } from './CameraController.js';
import { GameLoop } from './GameLoop.js';
import { InputManager } from './InputManager.js';
import { StateMachine } from './StateMachine.js';
import { Tower } from '../game/Tower.js';
import { Scoring } from '../game/Scoring.js';
import { Difficulty } from '../game/Difficulty.js';
import { HUD } from '../ui/HUD.js';

// Phase 2 Added Imports
import { STATES, GAME_CONFIG } from '../utils/Constants.js';
import { TutorialSystem } from '../systems/TutorialSystem.js';
import { RetentionSystem } from '../systems/RetentionSystem.js';
import { ErrorHandler } from '../systems/ErrorHandler.js';
import { TutorialOverlay } from '../ui/TutorialOverlay.js';
import { MainMenu } from '../ui/MainMenu.js';
import { GameOverScreen } from '../ui/GameOverScreen.js';
import { SettingsMenu } from '../ui/SettingsMenu.js';
import * as THREE from 'three';

export class Game {
    constructor() {
        // Core Systems
        this.errorHandler = new ErrorHandler(); // Init first to catch errors

        // Managers
        this.sceneManager = new SceneManager();
        this.cameraController = new CameraController();
        this.stateMachine = new StateMachine();
        this.gameLoop = new GameLoop();
        this.inputManager = new InputManager(this.onInput.bind(this));

        // Game Logic
        this.tower = new Tower(this.sceneManager);
        this.scoring = new Scoring();
        this.difficulty = new Difficulty();

        // New Systems
        this.retentionSystem = new RetentionSystem();
        this.tutorialSystem = new TutorialSystem(this);

        // UI Components
        this.hud = new HUD();
        this.mainMenu = new MainMenu({
            onPlay: () => this.checkTutorialAndStart(),
            onSettings: () => this.settingsMenu.show()
        });
        this.gameOverScreen = new GameOverScreen({
            onRetry: () => this.checkTutorialAndStart(),
            onMenu: () => this.goToMenu()
        });
        this.settingsMenu = new SettingsMenu({});

        this.tutorialOverlay = new TutorialOverlay(() => this.tutorialSystem.skip());
        this.tutorialSystem.setOverlay(this.tutorialOverlay);

        // Bindings
        this.update = this.update.bind(this);

        // Speed Multiplier for tutorial assist
        this.speedMultiplier = 1.0;

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
        this.goToMenu();
        this.tower.init(); // Add base block

        // Start Render Loop
        this.gameLoop.start();

        // Check Daily Login
        this.retentionSystem.checkDailyLogin();
    }

    goToMenu() {
        this.stateMachine.setState(STATES.MENU);
        this.mainMenu.show();
        this.gameOverScreen.hide();
        this.hud.showGameUI(); // Hide HUD elements actually, HUD logic might need tweaks or we just hide score in menu
        this.hud.container.style.display = 'none'; // quick hide
    }

    checkTutorialAndStart() {
        this.mainMenu.hide();
        this.gameOverScreen.hide();
        this.hud.container.style.display = 'block';
        this.hud.showGameUI();

        if (!this.tutorialSystem.isCompleted()) {
            this.startTutorial();
        } else {
            this.startGame();
        }
    }

    startTutorial() {
        this.stateMachine.setState(STATES.TUTORIAL);
        this.resetGameLogic();
        this.tutorialSystem.start();

        // Spawn first block
        this.tower.spawnNextBlock(this.difficulty.getSpeed() * this.speedMultiplier);
    }

    startGame() {
        this.stateMachine.setState(STATES.PLAYING);
        this.resetGameLogic();

        // Spawn first block
        this.tower.spawnNextBlock(this.difficulty.getSpeed() * this.speedMultiplier);
    }

    resetGameLogic() {
        this.tower.reset();
        this.scoring.reset();
        this.difficulty.reset();
        this.cameraController.reset();
        this.hud.updateScore(this.scoring.getScore());
    }

    onInput() {
        const state = this.stateMachine.getState();

        if (state === STATES.MENU) {
            // Managed by buttons
        } else if (state === STATES.PLAYING || state === STATES.TUTORIAL) {
            this.placeBlock();
        } else if (state === STATES.GAMEOVER) {
            // Managed by buttons
        }
    }

    placeBlock() {
        const result = this.tower.placeCurrentBlock();

        if (!result.success) {
            if (this.stateMachine.getState() === STATES.TUTORIAL) {
                // Tutorial fail? Let's just retry or ignore fail for FTUE kindness?
                // For now standard fail, but user can retry.
                this.gameOver();
            } else {
                this.gameOver();
            }
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

            // Track Mission Progress
            this.retentionSystem.updateMissionProgress('blocks_placed', 1);
            if (result.result.isPerfect) {
                this.retentionSystem.updateMissionProgress('perfect_hits', 1);
            }
            if (this.scoring.getScore() > 50) { // Just simpler check than delta
                this.retentionSystem.updateMissionProgress('high_score', this.scoring.getScore()); // Logic might need refinement but fine for now
            }

            // Tutorial Hook
            if (this.stateMachine.getState() === STATES.TUTORIAL) {
                this.tutorialSystem.onBlockPlaced(result.result);
                if (this.tutorialSystem.currentState === this.tutorialSystem.states.COMPLETED) {
                    this.stateMachine.setState(STATES.PLAYING); // Transition to normal play seamlessly
                }
            }

            // Camera
            this.cameraController.update(this.tower.getHeight());

            // Next Block
            this.tower.spawnNextBlock(this.difficulty.getSpeed() * this.speedMultiplier);
        }
    }

    gameOver() {
        this.stateMachine.setState(STATES.GAMEOVER);
        this.hud.container.style.display = 'none';
        this.gameOverScreen.setScore(this.scoring.getScore());
        this.gameOverScreen.show();
    }

    setSpeedMultiplier(multiplier) {
        this.speedMultiplier = multiplier;
    }

    update(delta) {
        // Update Game Logic
        this.tower.update(delta * this.speedMultiplier); // Apply speed multiplier

        // Update Camera
        this.cameraController.update(this.tower.getHeight());

        // Render
        this.renderer.render(this.sceneManager.scene, this.cameraController.camera);
    }

    onResize() {
        this.cameraController.onResize();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
