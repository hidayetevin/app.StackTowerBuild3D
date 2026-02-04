import { SceneManager } from './SceneManager.js';
import { CameraController } from './CameraController.js';
import { GameLoop } from './GameLoop.js';
import { InputManager } from './InputManager.js';
import { StateMachine } from './StateMachine.js';
import { Tower } from '../game/Tower.js';
import { Scoring } from '../game/Scoring.js';
import { Difficulty } from '../game/Difficulty.js';
import { HUD } from '../ui/HUD.js';

// Phase 2, 4, 5 Added Imports
import { STATES, GAME_CONFIG } from '../utils/Constants.js';
import { TutorialSystem } from '../systems/TutorialSystem.js';
import { RetentionSystem } from '../systems/RetentionSystem.js';
import { ErrorHandler } from '../systems/ErrorHandler.js';
import { TutorialOverlay } from '../ui/TutorialOverlay.js';
import { MainMenu } from '../ui/MainMenu.js';
import { GameOverScreen } from '../ui/GameOverScreen.js';
import { SettingsMenu } from '../ui/SettingsMenu.js';
import { LoadingScreen } from '../ui/LoadingScreen.js';
import { PerformanceMonitor } from '../utils/PerformanceMonitor.js';
import AudioManager from '../audio/AudioManager.js';
import * as THREE from 'three';

// Monetization & Analytics
import AdsManager from '../monetization/AdsManager.js';
import Analytics from '../analytics/Analytics.js';

export class Game {
    constructor() {
        // 1. Core Error Handling
        this.errorHandler = new ErrorHandler();

        // 2. UI - Loading Screen First
        this.loadingScreen = new LoadingScreen();

        // 3. Managers
        this.sceneManager = new SceneManager();
        this.cameraController = new CameraController();
        this.stateMachine = new StateMachine();
        this.gameLoop = new GameLoop();
        this.inputManager = new InputManager(this.onInput.bind(this));

        // 4. Game Logic
        this.tower = new Tower(this.sceneManager);
        this.scoring = new Scoring();
        this.difficulty = new Difficulty();

        // 5. Systems
        this.retentionSystem = new RetentionSystem();
        this.tutorialSystem = new TutorialSystem(this);

        // 6. UI Components
        this.hud = new HUD();
        this.mainMenu = new MainMenu({
            onPlay: () => this.checkTutorialAndStart(),
            onSettings: () => this.settingsMenu.show(AudioManager.isMuted, AudioManager.isMusicMuted)
        });
        this.gameOverScreen = new GameOverScreen({
            onRetry: () => this.checkTutorialAndStart(),
            onMenu: () => this.goToMenu()
        });
        this.settingsMenu = new SettingsMenu({
            onToggleSound: () => AudioManager.toggleMute(),
            onToggleMusic: () => AudioManager.toggleMusic(),
            onClose: () => { /* maybe helpful later */ }
        });

        this.tutorialOverlay = new TutorialOverlay(() => this.tutorialSystem.skip());
        this.tutorialSystem.setOverlay(this.tutorialOverlay);

        // Bindings
        this.update = this.update.bind(this);
        this.speedMultiplier = 1.0;

        // Init
        this.init();
    }

    async init() {
        // Analytics & Ads & Audio
        await Analytics.init();
        await AdsManager.init();
        await AudioManager.loadAll(); // Preload sounds

        // Setup Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        document.body.appendChild(this.renderer.domElement);

        // Performance Monitor
        this.performanceMonitor = new PerformanceMonitor(this.renderer);

        // Setup Resizer
        window.addEventListener('resize', this.onResize.bind(this));

        // Setup Loop
        this.gameLoop.add(this.update);

        // Initialize Game State
        this.goToMenu();
        this.tower.init();

        // Start Render Loop
        this.gameLoop.start();

        // Check Daily Login
        this.retentionSystem.checkDailyLogin();

        // Play Music
        AudioManager.playMusic();

        // Hide Loader
        this.loadingScreen.hide();
    }

    goToMenu() {
        this.stateMachine.setState(STATES.MENU);
        this.mainMenu.show();
        this.gameOverScreen.hide();
        AdsManager.showBanner();

        this.hud.showGameUI();
        this.hud.container.style.display = 'none';
    }

    checkTutorialAndStart() {
        AdsManager.hideBanner();

        this.mainMenu.hide();
        this.gameOverScreen.hide();
        this.hud.container.style.display = 'block';
        this.hud.showGameUI();

        AudioManager.playSound('tap');

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
            // UI handles it
        } else if (state === STATES.PLAYING || state === STATES.TUTORIAL) {
            AudioManager.resumeContext(); // Ensure audio context is unlocked
            this.placeBlock();
        }
    }

    placeBlock() {
        // Visual/Audio Feedback for Tap
        // AudioManager.playSound('tap'); // Optional, maybe too noisy if every tap

        const result = this.tower.placeCurrentBlock();

        if (!result.success) {
            AudioManager.playSound('fail');
            this.gameOver();
        } else {
            // Success
            this.scoring.addPoint();
            const currentScore = this.scoring.getScore();
            const combo = this.scoring.getCombo();

            if (result.result.isPerfect) {
                this.scoring.registerPerfectHit();
                AudioManager.playSound('perfect');
                if (combo > 1) AudioManager.playSound('combo');

                Analytics.track('perfect_hit', { score: currentScore, combo: combo });
            } else {
                this.scoring.resetCombo();
                AudioManager.playSound('tap'); // Normal tap sound for non-perfect
            }

            Analytics.track('block_placed', { score: currentScore, is_perfect: result.result.isPerfect });

            this.hud.updateScore(currentScore);
            this.hud.updateCombo(this.scoring.getCombo());
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

        AdsManager.showInterstitial();

        this.gameOverScreen.setScore(this.scoring.getScore());
        this.gameOverScreen.show();
    }

    continueGame() {
        this.stateMachine.setState(STATES.PLAYING);
        this.gameOverScreen.hide();
        this.hud.container.style.display = 'block';
        this.tower.spawnNextBlock(this.difficulty.getSpeed() * this.speedMultiplier);
    }

    activateSlowMotion() {
        this.setSpeedMultiplier(0.5);
        setTimeout(() => this.setSpeedMultiplier(1.0), 5000);
    }

    setSpeedMultiplier(multiplier) {
        this.speedMultiplier = multiplier;
    }

    update(delta) {
        this.tower.update(delta * this.speedMultiplier);
        this.cameraController.update(this.tower.getHeight());
        this.renderer.render(this.sceneManager.scene, this.cameraController.camera);

        this.performanceMonitor.update(delta);
    }

    onResize() {
        this.cameraController.onResize();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
