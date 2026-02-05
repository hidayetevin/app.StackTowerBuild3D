import { AdMob, BannerAdPosition, RewardAdPluginEvents, InterstitialAdPluginEvents } from '@capacitor-community/admob';
import { App } from '@capacitor/app';
import Analytics from '../analytics/Analytics.js';
import RewardSystem from './RewardSystem.js';
import AudioManager from '../audio/AudioManager.js';

class AdsManager {
    constructor() {
        this.isInitialized = false;
        this.lastInterstitialTime = 0;
        this.interstitialCooldown = 45000; // Hard cooldown for hyper-casual: 45s

        // Ad Readiness States
        this.states = {
            interstitial: 'IDLE', // IDLE, LOADING, READY
            rewarded: 'IDLE'
        };

        // Use Real IDs provided by user
        this.adIds = {
            banner: 'ca-app-pub-4190858087915294/6293542928',
            interstitial: 'ca-app-pub-4190858087915294/1552244338',
            rewarded: 'ca-app-pub-4190858087915294/3667379581'
        };

        this.setupListeners();
    }

    setupListeners() {
        // Interstitial Listeners
        AdMob.addListener(InterstitialAdPluginEvents.Loaded, () => {
            console.log('ADMOB: Interstitial Ready');
            this.states.interstitial = 'READY';
        });

        AdMob.addListener(InterstitialAdPluginEvents.FailedToLoad, (info) => {
            console.warn('ADMOB: Interstitial Failed to Load:', info);
            this.states.interstitial = 'ERROR';
            // Retry after 15s
            setTimeout(() => this.prepareInterstitial(), 15000);
        });

        AdMob.addListener(InterstitialAdPluginEvents.Showed, () => {
            console.log('ADMOB: Interstitial Showed - Pausing Audio');
            AudioManager.pause();
        });

        AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
            console.log('ADMOB: Interstitial Dismissed - Reloading...');
            this.states.interstitial = 'IDLE';
            this.prepareInterstitial();
            // Resume Music
            AudioManager.resume();
        });

        // Rewarded Listeners
        AdMob.addListener(RewardAdPluginEvents.Loaded, () => {
            console.log('ADMOB: Rewarded Ready');
            this.states.rewarded = 'READY';
        });

        AdMob.addListener(RewardAdPluginEvents.FailedToLoad, (info) => {
            console.warn('ADMOB: Rewarded Failed to Load:', info);
            this.states.rewarded = 'ERROR';
            // Retry after 20s
            setTimeout(() => this.prepareRewarded(), 20000);
        });

        AdMob.addListener(RewardAdPluginEvents.Showed, () => {
            console.log('ADMOB: Rewarded Showed - Pausing Audio');
            AudioManager.pause();
        });

        AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
            console.log('ADMOB: Rewarded Dismissed - Reloading...');
            this.states.rewarded = 'IDLE';
            this.prepareRewarded();
            // Resume Music
            AudioManager.resume();
        });

        // App State Listener (Background/Foreground)
        App.addListener('appStateChange', ({ isActive }) => {
            console.log('App state changed. Is active?', isActive);
            if (isActive) {
                AudioManager.resume();
            } else {
                AudioManager.pause();
            }
        });
    }

    async init() {
        try {
            await AdMob.initialize({
                requestTrackingAuthorization: true,
                initializeForTesting: false
            });
            this.isInitialized = true;
            console.log('AdMob initialized (@capacitor-community/admob)');
            Analytics.track('ads_initialized');

            // 1. Show banner immediately (if not already shown)
            this.showBanner();

            // 2. Preload high-intent ads immediately
            // Stagger requests to avoid bandwidth choking
            this.prepareInterstitial();
            setTimeout(() => this.prepareRewarded(), 1000);

        } catch (error) {
            console.error('AdMob init failed:', error);
            this.isInitialized = false;
        }
    }

    async showBanner() {
        if (!this.isInitialized) return;
        try {
            await AdMob.showBanner({
                adId: this.adIds.banner,
                position: BannerAdPosition.BOTTOM,
                margin: 0,
                isTesting: false
            });
        } catch (error) {
            console.warn('Banner failed:', error);
        }
    }

    async prepareInterstitial() {
        if (!this.isInitialized || this.states.interstitial === 'LOADING') return;

        this.states.interstitial = 'LOADING';
        console.log('ADMOB: Loading Interstitial...');
        try {
            await AdMob.prepareInterstitial({
                adId: this.adIds.interstitial,
                isTesting: false
            });
        } catch (e) {
            this.states.interstitial = 'ERROR';
            console.log('Prepare interstitial failed', e);
        }
    }

    async showInterstitial(force = false) {
        if (!this.isInitialized) return;

        const now = Date.now();
        // Check cooldown
        if (!force && (now - this.lastInterstitialTime < this.interstitialCooldown)) {
            console.log('ADMOB: Interstitial on cooldown');
            return;
        }

        if (this.states.interstitial !== 'READY') {
            console.log('ADMOB: Interstitial not ready yet (State:', this.states.interstitial, ')');
            this.prepareInterstitial(); // Try to wake it up
            return;
        }

        try {
            // Pause Music before showing ad
            AudioManager.pause();

            await AdMob.showInterstitial();
            this.lastInterstitialTime = now;
            Analytics.track('ad_impression', { ad_type: 'interstitial', placement: force ? 'button_click' : 'game_over' });
        } catch (error) {
            console.warn('Interstitial show failed:', error);
            this.states.interstitial = 'IDLE';
            this.prepareInterstitial();
            // Resume music if show failed
            AudioManager.resume();
        }
    }

    async prepareRewarded() {
        if (!this.isInitialized || this.states.rewarded === 'LOADING') return;

        this.states.rewarded = 'LOADING';
        console.log('ADMOB: Loading Rewarded...');
        try {
            await AdMob.prepareRewardVideoAd({
                adId: this.adIds.rewarded,
                isTesting: false
            });
        } catch (e) {
            this.states.rewarded = 'ERROR';
            console.log('Prepare rewarded failed', e);
        }
    }

    async showRewarded(rewardType) {
        if (!this.isInitialized) {
            console.log('Offline/NoAds Mode: Granting reward anyway');
            RewardSystem.grantReward(rewardType);
            return true;
        }

        if (this.states.rewarded !== 'READY') {
            alert(LocalizationManager.get('AD_NOT_READY' || 'Ad not ready yet, please try again in a moment.'));
            this.prepareRewarded();
            return false;
        }

        return new Promise(async (resolve) => {
            let rewardedFlag = false;

            const onReward = AdMob.addListener(RewardAdPluginEvents.Rewarded, (rewardItem) => {
                rewardedFlag = true;
            });

            const onDismiss = AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
                onReward.remove();
                onDismiss.remove();
                if (rewardedFlag) {
                    Analytics.track('rewarded_ad_watched', { reward_type: rewardType });
                    RewardSystem.grantReward(rewardType);
                    resolve(true);
                } else {
                    resolve(false);
                }
            });

            try {
                // Pause Music before showing ad
                AudioManager.pause();
                await AdMob.showRewardVideoAd();
            } catch (error) {
                console.warn('Rewarded show failed:', error);
                onReward.remove();
                onDismiss.remove();
                this.states.rewarded = 'IDLE';
                this.prepareRewarded();
                // Resume music if show failed
                AudioManager.resume();
                resolve(false);
            }
        });
    }
}

export default new AdsManager();
