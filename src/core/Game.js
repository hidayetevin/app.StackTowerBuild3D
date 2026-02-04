import { SceneManager } from './SceneManager.js';
import { CameraController } from './CameraController.js';
import { GameLoop } from './GameLoop.js';
import { InputManager } from './InputManager.js';
import { StateMachine } from './StateMachine.js';
import { Tower } from '../game/Tower.js';
import { Scoring } from '../game/Scoring.js';
import { Difficulty } from '../game/Difficulty.js';
import { HUD } from '../ui/HUD.js';

// Phase 2 & 4 Added Imports
import { STATES, GAME_CONFIG } from '../utils/Constants.js';
import { TutorialSystem } from '../systems/TutorialSystem.js';
import { RetentionSystem } from '../systems/RetentionSystem.js';
import { ErrorHandler } from '../systems/ErrorHandler.js';
import { TutorialOverlay } from '../ui/TutorialOverlay.js';
import { MainMenu } from '../ui/MainMenu.js';
import { GameOverScreen } from '../ui/GameOverScreen.js';
import { SettingsMenu } from '../ui/SettingsMenu.js';
import * as THREE from 'three';

// Monetization & Analytics
import AdsManager from '../monetization/AdsManager.js';
import Analytics from '../analytics/Analytics.js';

export class Game {
    constructor() {
        // Core Systems
        this.errorHandler = new ErrorHandler();

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

        // Systems
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

    async init() {
        // Analytics & Ads Init
        await Analytics.init();
        await AdsManager.init();

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
        AdsManager.showBanner(); // Show Banner in Menu

        this.hud.showGameUI();
        this.hud.container.style.display = 'none';
    }

    checkTutorialAndStart() {
        AdsManager.hideBanner(); // Hide Banner in Game

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

        Analytics.track('tutorial_begin');

        this.tower.spawnNextBlock(this.difficulty.getSpeed() * this.speedMultiplier);
    }

    startGame() {
        this.stateMachine.setState(STATES.PLAYING);
        this.resetGameLogic();

        Analytics.track('game_start');

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
        }
    }

    placeBlock() {
        const result = this.tower.placeCurrentBlock();

        if (!result.success) {
            this.gameOver();
        } else {
            // Success
            this.scoring.addPoint();
            const currentScore = this.scoring.getScore();
            const combo = this.scoring.getCombo();

            if (result.result.isPerfect) {
                this.scoring.registerPerfectHit();
                Analytics.track('perfect_hit', { score: currentScore, combo: combo });
            } else {
                this.scoring.resetCombo();
            }

            Analytics.track('block_placed', { score: currentScore, is_perfect: result.result.isPerfect });

            this.hud.updateScore(currentScore);
            this.difficulty.increaseXY();

            // Track Mission Progress
            this.retentionSystem.updateMissionProgress('blocks_placed', 1);
            if (result.result.isPerfect) {
                this.retentionSystem.updateMissionProgress('perfect_hits', 1);
            }
            if (currentScore > 50) {
                this.retentionSystem.updateMissionProgress('high_score', currentScore);
            }

            // Tutorial Hook
            if (this.stateMachine.getState() === STATES.TUTORIAL) {
                this.tutorialSystem.onBlockPlaced(result.result);
                if (this.tutorialSystem.currentState === this.tutorialSystem.states.COMPLETED) {
                    this.stateMachine.setState(STATES.PLAYING);
                }
            }

            // Camera & Next Block
            this.cameraController.update(this.tower.getHeight());
            this.tower.spawnNextBlock(this.difficulty.getSpeed() * this.speedMultiplier);
        }
    }

    gameOver() {
        this.stateMachine.setState(STATES.GAMEOVER);
        this.hud.container.style.display = 'none';

        Analytics.track('game_over', {
            score: this.scoring.getScore(),
            max_combo: this.scoring.getCombo()
        });

        // Show Interstitial (Logic inside AdsManager)
        AdsManager.showInterstitial();

        this.gameOverScreen.setScore(this.scoring.getScore());
        this.gameOverScreen.show();
    }

    // Reward methods called by RewardSystem
    continueGame() {
        // Simple continue: remove top block (failed one) or just restart from current height?
        // Since we dropped the block, we can just spawn a new one.
        // We need to restore state to PLAYING.
        this.stateMachine.setState(STATES.PLAYING);
        this.gameOverScreen.hide();
        this.hud.container.style.display = 'block';

        // Spawn next block at current height
        this.tower.spawnNextBlock(this.difficulty.getSpeed() * this.speedMultiplier);
    }

    activateSlowMotion() {
        this.setSpeedMultiplier(0.5);
        setTimeout(() => this.setSpeedMultiplier(1.0), 5000); // 5 seconds slow mo
    }

    setSpeedMultiplier(multiplier) {
        this.speedMultiplier = multiplier;
    }

    update(delta) {
        this.tower.update(delta * this.speedMultiplier);
        this.cameraController.update(this.tower.getHeight());
        this.renderer.render(this.sceneManager.scene, this.cameraController.camera);
    }

    onResize() {
        this.cameraController.onResize();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
