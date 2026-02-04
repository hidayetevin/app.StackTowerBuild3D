// import { AdMob } from 'admob-plus-capacitor';
import Analytics from '../analytics/Analytics.js';
import RewardSystem from './RewardSystem.js';

// MOCK ADMOB
const AdMob = {
    initialize: async () => console.log('[Mock] AdMob Initialized'),
    showBanner: async () => console.log('[Mock] Banner Shown'),
    hideBanner: async () => console.log('[Mock] Banner Hidden'),
    prepareInterstitial: async () => console.log('[Mock] Interstitial Prepared'),
    showInterstitial: async () => {
        console.log('[Mock] Interstitial Shown');
        return Promise.resolve();
    },
    prepareRewardedAd: async () => console.log('[Mock] Rewarded Prepared'),
    showRewardedAd: async () => {
        console.log('[Mock] Rewarded Shown');
        return Promise.resolve({ rewarded: true });
    }
};

class AdsManager {
    constructor() {
        this.isInitialized = false;
        this.lastInterstitialTime = 0;
        this.interstitialCooldown = 30000;
        this.gameOverCount = 0;

        this.adIds = {
            banner: 'ca-app-pub-4190858087915294/6293542928',
            interstitial: 'ca-app-pub-4190858087915294/1552244338',
            rewarded: 'ca-app-pub-4190858087915294/3667379581'
        };
        this.appId = 'ca-app-pub-4190858087915294~7606624597'; // For reference regarding AndroidManifest/Info.plist
    }

    async init() {
        try {
            await AdMob.initialize({
                requestTrackingAuthorization: true,
                testingDevices: ['TEST'],
                initializeForTesting: true
            });
            this.isInitialized = true;
            console.log('AdMob initialized (Mock/Web Mode)');
            Analytics.track('ads_initialized');

        } catch (error) {
            console.error('AdMob init failed:', error);
            this.isInitialized = false;
        }
    }

    async showBanner() {
        if (!this.isInitialized) return;
        try {
            await AdMob.showBanner({ adId: this.adIds.banner, position: 'bottom' });
            Analytics.track('ad_impression', { ad_type: 'banner', placement: 'menu' });
        } catch (error) {
            console.warn('Banner failed:', error);
        }
    }

    hideBanner() {
        if (!this.isInitialized) return;
        try {
            AdMob.hideBanner();
        } catch (e) {
            console.warn('Hide banner failed', e);
        }
    }

    async showInterstitial() {
        if (!this.isInitialized) return;

        const now = Date.now();
        if (now - this.lastInterstitialTime < this.interstitialCooldown) {
            console.log('Interstitial on cooldown');
            return;
        }

        this.gameOverCount++;
        if (this.gameOverCount % 3 !== 0) {
            console.log(`Interstitial skip. Count: ${this.gameOverCount}`);
            return;
        }

        try {
            await AdMob.prepareInterstitial({ adId: this.adIds.interstitial });
            await AdMob.showInterstitial();
            this.lastInterstitialTime = now;
            Analytics.track('ad_impression', { ad_type: 'interstitial', placement: 'game_over' });
        } catch (error) {
            console.warn('Interstitial failed:', error);
            Analytics.track('ad_failed', { ad_type: 'interstitial', reason: error.message || 'unknown' });
        }
    }

    async showRewarded(rewardType) {
        if (!this.isInitialized) {
            console.log('Offline/NoAds Mode: Granting reward anyway');
            RewardSystem.grantReward(rewardType);
            return true;
        }

        try {
            await AdMob.prepareRewardedAd({ adId: this.adIds.rewarded });
            const result = await AdMob.showRewardedAd();

            if (result && result.rewarded) {
                Analytics.track('rewarded_ad_watched', { reward_type: rewardType });
                RewardSystem.grantReward(rewardType);
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.warn('Rewarded ad failed:', error);
            Analytics.track('rewarded_ad_failed', { reason: error.message || 'unknown' });
            RewardSystem.grantReward(rewardType);
            return true;
        }
    }
}

export default new AdsManager();
