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
import LocalizationManager from '../utils/LocalizationManager.js';

// Phase 7 Stores
import { SkinManager } from '../game/SkinManager.js';
import { ThemeManager } from '../game/ThemeManager.js';
import { ChallengeManager } from '../game/ChallengeManager.js';
import { SkinScreen } from '../ui/SkinScreen.js';
import { ThemeScreen } from '../ui/ThemeScreen.js';
import { ChallengeScreen } from '../ui/ChallengeScreen.js';
import { PauseMenu } from '../ui/PauseMenu.js';

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

        this.hud = new HUD(() => this.pauseGame());
        this.hud.updateCoins(this.retentionSystem.getCoins()); // Init coins

        // Screens
        this.skinScreen = new SkinScreen(this.skinManager, Analytics);
        this.themeScreen = new ThemeScreen(this.themeManager, Analytics);
        this.challengeScreen = new ChallengeScreen(this.challengeManager, Analytics, (challengeConfig) => {
            this.startChallenge(challengeConfig);
        });

        this.pauseMenu = new PauseMenu({
            onResume: () => this.resumeGame(),
            onRestart: () => this.checkTutorialAndStart(),
            onMenu: () => this.goToMenu()
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

    // ... init ...
    async init() {
        await Analytics.init();
        await AdsManager.init();
        await AudioManager.loadAll();

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

    // ... goToMenu, pauseGame, resumeGame ...
    goToMenu() {
        this.stateMachine.setState(STATES.MENU);
        this.mainMenu.show();
        this.gameOverScreen.hide();
        this.skinScreen.hide();
        this.themeScreen.hide();
        this.challengeScreen.hide();
        this.pauseMenu.hide();
        AdsManager.showBanner();
        this.hud.hideGameUI();
        this.challengeMode = null;

        // Refresh coins in case they were added elsewhere
        this.hud.updateCoins(this.retentionSystem.getCoins());
    }

    pauseGame() {
        if (this.stateMachine.getState() === STATES.PLAYING) {
            this.stateMachine.setState(STATES.PAUSED);
            this.pauseMenu.show();
        }
    }

    resumeGame() {
        if (this.stateMachine.getState() === STATES.PAUSED) {
            this.stateMachine.setState(STATES.PLAYING);
            this.pauseMenu.hide();
        }
    }

    checkTutorialAndStart() {
        AdsManager.hideBanner();
        this.mainMenu.hide();
        this.gameOverScreen.hide();
        this.pauseMenu.hide();
        this.hud.showGameUI();
        this.hud.updateCoins(this.retentionSystem.getCoins()); // Ensure UI is sync
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
        if (state === STATES.MENU || state === STATES.PAUSED) {
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
            const percentage = result.result.percentage;

            // Check Coins Logic (Moved outside if/else to handle both Perfect(100%) and Good(70+%)
            const coinAwarded = this.scoring.checkAccuracyStreak(percentage);
            if (coinAwarded) {
                const newTotal = this.retentionSystem.addCoins(1);
                this.hud.updateCoins(newTotal);
                this.hud.showFeedback("+1 COIN!", "#FFD700");
                AudioManager.playSound('perfect'); // Reuse sound or new 'coin' sound
            }

            // FEEDBACK LOGIC
            if (result.result.isPerfect) {
                this.scoring.registerPerfectHit();
                AudioManager.playSound('perfect');
                if (combo > 1) AudioManager.playSound('combo');
                Analytics.track('perfect_hit', { score: currentScore, combo: combo });

                const perfectTexts = LocalizationManager.getCurrentLang() === 'TR' ? ["MÜKEMMEL!", "FISTIK GİBİ!"] : ["PERFECT!", "AWESOME!"];
                this.hud.showFeedback(perfectTexts[0], '#00FF00');

                if (this.challengeMode) {
                    this.checkChallengeProgress('perfect_hit', 1);
                }
            } else {
                this.scoring.resetCombo();
                AudioManager.playSound('tap');

                let color = '#FFFFFF';
                let text = '';
                const pct = Math.floor(percentage * 100);

                if (pct >= 90) {
                    text = LocalizationManager.getCurrentLang() === 'TR' ? `HARİKA!` : `GREAT!`;
                    color = '#FFFF00';
                } else if (pct >= 70) {
                    text = LocalizationManager.getCurrentLang() === 'TR' ? `İYİ!` : `GOOD!`;
                    color = '#FFA500';
                } else if (pct >= 50) {
                    text = LocalizationManager.getCurrentLang() === 'TR' ? `İDARE EDER!` : `OKAY!`;
                    color = '#DDDDDD';
                } else {
                    text = `%${pct}`;
                    color = '#FF0000';
                }

                if (text && !coinAwarded) this.hud.showFeedback(text, color); // Priority to Coin feedback if coincided
            }

            this.hud.updateScore(currentScore);
            this.hud.updateCombo(this.scoring.getCombo());
            this.difficulty.increaseXY();

            Analytics.track('block_placed', { score: currentScore, is_perfect: result.result.isPerfect });

            this.retentionSystem.updateMissionProgress('blocks_placed', 1);
            if (result.result.isPerfect) {
                this.retentionSystem.updateMissionProgress('perfect_hits', 1);
            }
            if (currentScore > 50) {
                this.retentionSystem.updateMissionProgress('high_score', currentScore);
            }

            if (this.challengeMode) {
                if (this.checkChallengeProgress('score', currentScore)) return;
            }

            this.skinManager.checkAutoUnlock(currentScore);
            this.themeManager.checkAutoUnlock(currentScore);

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
            alert(`Challenge Completed! Reward: ${JSON.stringify(this.challengeMode.options.reward)}`);
            this.challengeManager.stopChallenge();
            this.goToMenu();
            return true;
        }
        return false;
    }

    gameOver() {
        this.stateMachine.setState(STATES.GAMEOVER);
        this.hud.hideGameUI();
        Analytics.track('game_over', { score: this.scoring.getScore(), max_combo: this.scoring.getCombo() });
        AdsManager.showInterstitial();
        this.gameOverScreen.setScore(this.scoring.getScore());
        this.gameOverScreen.show();
    }

    continueGame() {
        this.stateMachine.setState(STATES.PLAYING);
        this.gameOverScreen.hide();
        this.hud.showGameUI();
        this.tower.spawnNextBlock(this.difficulty.getSpeed() * this.speedMultiplier);
    }

    setSpeedMultiplier(multiplier) { this.speedMultiplier = multiplier; }

    update(delta) {
        const state = this.stateMachine.getState();
        if (state === STATES.PLAYING || state === STATES.TUTORIAL) {
            this.tower.update(delta * this.speedMultiplier);
        }
        this.cameraController.update(this.tower.getHeight());
        this.renderer.render(this.sceneManager.scene, this.cameraController.camera);
        this.performanceMonitor.update(delta);
    }

    onResize() {
        this.cameraController.onResize();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}
