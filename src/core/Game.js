import { SceneManager } from './SceneManager.js';
import { CameraController } from './CameraController.js';
import { GameLoop } from './GameLoop.js';
import { InputManager } from './InputManager.js';
import { StateMachine } from './StateMachine.js';
import { Tower } from '../game/Tower.js';
import { Scoring } from '../game/Scoring.js';
import { Difficulty } from '../game/Difficulty.js';
import { HUD } from '../ui/HUD.js';
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
import AdsManager from '../monetization/AdsManager.js';
import Analytics from '../analytics/Analytics.js';

// Phase 7 Stores
import { SkinManager } from '../game/SkinManager.js';
import { ThemeManager } from '../game/ThemeManager.js';
import { ChallengeManager } from '../game/ChallengeManager.js';
import { SkinScreen } from '../ui/SkinScreen.js';
import { ThemeScreen } from '../ui/ThemeScreen.js';
import { ChallengeScreen } from '../ui/ChallengeScreen.js';

export class Game {
    constructor() {
        this.errorHandler = new ErrorHandler();
        this.loadingScreen = new LoadingScreen();
        this.sceneManager = new SceneManager();
        this.cameraController = new CameraController();
        this.stateMachine = new StateMachine();
        this.gameLoop = new GameLoop();
        this.inputManager = new InputManager(this.onInput.bind(this));

        this.tower = new Tower(this.sceneManager);
        this.scoring = new Scoring();
        this.difficulty = new Difficulty();
        this.retentionSystem = new RetentionSystem();
        this.tutorialSystem = new TutorialSystem(this);

        // Phase 7 Managers
        this.skinManager = new SkinManager(this.retentionSystem.saveSystem, this.tower);
        this.themeManager = new ThemeManager(this.retentionSystem.saveSystem, this.sceneManager);
        this.challengeManager = new ChallengeManager();

        this.hud = new HUD();

        // Screens
        this.skinScreen = new SkinScreen(this.skinManager, Analytics);
        this.themeScreen = new ThemeScreen(this.themeManager, Analytics);
        this.challengeScreen = new ChallengeScreen(this.challengeManager, Analytics, (challengeConfig) => {
            this.startChallenge(challengeConfig);
        });

        this.mainMenu = new MainMenu({
            onPlay: () => this.checkTutorialAndStart(),
            onSettings: () => this.settingsMenu.show(AudioManager.isMuted, AudioManager.isMusicMuted),
            onSkins: () => this.skinScreen.show(),
            onThemes: () => this.themeScreen.show(),
            onChallenge: () => this.challengeScreen.show()
        });

        this.gameOverScreen = new GameOverScreen({
            onRetry: () => this.checkTutorialAndStart(),
            onMenu: () => this.goToMenu()
        });

        this.settingsMenu = new SettingsMenu({
            onToggleSound: () => AudioManager.toggleMute(),
            onToggleMusic: () => AudioManager.toggleMusic(),
            onClose: () => { }
        });

        this.tutorialOverlay = new TutorialOverlay(() => this.tutorialSystem.skip());
        this.tutorialSystem.setOverlay(this.tutorialOverlay);

        this.update = this.update.bind(this);
        this.speedMultiplier = 1.0;

        this.challengeMode = null;

        this.init();
    }

    async init() {
        await Analytics.init();
        await AdsManager.init();
        await AudioManager.loadAll();

        // Init managers
        await this.skinManager.loadSkins();
        await this.themeManager.loadThemes();
        await this.challengeManager.loadChallenges();

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        document.body.appendChild(this.renderer.domElement);

        this.performanceMonitor = new PerformanceMonitor(this.renderer);
        window.addEventListener('resize', this.onResize.bind(this));
        this.gameLoop.add(this.update);

        this.goToMenu();
        this.tower.init();
        this.gameLoop.start();

        this.retentionSystem.checkDailyLogin();
        AudioManager.playMusic();
        this.loadingScreen.hide();
    }

    goToMenu() {
        this.stateMachine.setState(STATES.MENU);
        this.mainMenu.show();
        this.gameOverScreen.hide();
        this.skinScreen.hide();
        this.themeScreen.hide();
        this.challengeScreen.hide();

        AdsManager.showBanner();

        this.hud.showGameUI();
        this.hud.container.style.display = 'none';

        this.challengeMode = null; // Clear challenge
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

    startChallenge(config) {
        this.challengeMode = config;
        AdsManager.hideBanner();
        this.mainMenu.hide();
        this.challengeScreen.hide();
        this.hud.container.style.display = 'block';
        this.hud.showGameUI();

        this.stateMachine.setState(STATES.PLAYING);
        this.resetGameLogic();
        Analytics.track('challenge_start', { type: config.type });
        this.tower.spawnNextBlock(this.difficulty.getSpeed() * this.speedMultiplier);
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
            // UI
        } else if (state === STATES.PLAYING || state === STATES.TUTORIAL) {
            AudioManager.resumeContext();
            this.placeBlock();
        }
    }

    placeBlock() {
        const result = this.tower.placeCurrentBlock();

        if (!result.success) {
            AudioManager.playSound('fail');
            this.gameOver();
        } else {
            this.scoring.addPoint();
            const currentScore = this.scoring.getScore();
            const combo = this.scoring.getCombo();

            if (result.result.isPerfect) {
                this.scoring.registerPerfectHit();
                AudioManager.playSound('perfect');
                if (combo > 1) AudioManager.playSound('combo');
                Analytics.track('perfect_hit', { score: currentScore, combo: combo });

                // Challenge Update
                if (this.challengeMode) {
                    this.checkChallengeProgress('perfect_hit', 1);
                }
            } else {
                this.scoring.resetCombo();
                AudioManager.playSound('tap');

                if (this.challengeMode && this.challengeMode.type === 'perfect_streak') {
                    // Check specific reset logic if needed
                }
            }

            this.hud.updateScore(currentScore);
            this.hud.updateCombo(this.scoring.getCombo());
            this.difficulty.increaseXY();

            // Analytics
            Analytics.track('block_placed', { score: currentScore, is_perfect: result.result.isPerfect });

            // Mission Progress
            this.retentionSystem.updateMissionProgress('blocks_placed', 1);
            if (result.result.isPerfect) {
                this.retentionSystem.updateMissionProgress('perfect_hits', 1);
            }
            if (currentScore > 50) {
                this.retentionSystem.updateMissionProgress('high_score', currentScore);
            }

            // Challenge Progress (Score / Blocks)
            if (this.challengeMode) {
                if (this.checkChallengeProgress('score', currentScore)) return;
            }

            // AUTO UNLOCK CHECK (SKINS/THEMES)
            this.skinManager.checkAutoUnlock(currentScore);
            this.themeManager.checkAutoUnlock(currentScore);


            // Tutorial Hook
            if (this.stateMachine.getState() === STATES.TUTORIAL) {
                this.tutorialSystem.onBlockPlaced(result.result);
                if (this.tutorialSystem.currentState === this.tutorialSystem.states.COMPLETED) {
                    this.stateMachine.setState(STATES.PLAYING);
                }
            }

            this.cameraController.update(this.tower.getHeight());
            this.tower.spawnNextBlock(this.difficulty.getSpeed() * this.speedMultiplier);
        }
    }

    checkChallengeProgress(metric, value) {
        if (!this.challengeMode) return false;

        const completed = this.challengeManager.updateProgress(metric, value);
        if (completed) {
            // Challenge Won!
            alert(`Challenge Completed! Reward: ${JSON.stringify(this.challengeMode.options.reward)}`);
            this.challengeManager.stopChallenge();
            this.goToMenu();
            return true;
        }
        return false;
    }

    gameOver() {
        this.stateMachine.setState(STATES.GAMEOVER);
        this.hud.container.style.display = 'none';
        Analytics.track('game_over', { score: this.scoring.getScore(), max_combo: this.scoring.getCombo() });
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

    setSpeedMultiplier(multiplier) { this.speedMultiplier = multiplier; }

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
