import { AdMob } from 'admob-plus-capacitor';
import Analytics from '../analytics/Analytics.js';
import RewardSystem from './RewardSystem.js';

class AdsManager {
    constructor() {
        this.isInitialized = false;
        this.lastInterstitialTime = 0;
        this.interstitialCooldown = 30000; // 30 seconds
        this.gameOverCount = 0;

        // Test IDs (Replace with Prod IDs in release)
        this.adIds = {
            banner: 'ca-app-pub-3940256099942544/6300978111', // Test Banner ID
            interstitial: 'ca-app-pub-3940256099942544/1033173712', // Test Interstitial ID
            rewarded: 'ca-app-pub-3940256099942544/5224354917' // Test Rewarded ID
        };
    }

    async init() {
        if (!window.Capacitor) {
            console.log('AdsManager: Running in web mode (Ads mocked)');
            return;
        }

        try {
            await AdMob.initialize({
                requestTrackingAuthorization: true, // iOS ATT
                testingDevices: ['2077ef9a63d2b398840261c8221a0c9b'], // Example Test Device ID
                initializeForTesting: true // Use test ads
            });
            this.isInitialized = true;
            console.log('AdMob initialized');
            Analytics.track('ads_initialized');

        } catch (error) {
            console.error('AdMob init failed:', error);
            this.isInitialized = false;
            // Game continues without ads (Graceful degradation)
        }
    }

    async showBanner() {
        if (!this.isInitialized) return;

        try {
            await AdMob.showBanner({
                adId: this.adIds.banner,
                position: 'bottom'
            });
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

        // Cooldown check
        const now = Date.now();
        if (now - this.lastInterstitialTime < this.interstitialCooldown) {
            console.log('Interstitial on cooldown');
            return;
        }

        // Frequency: Every 3rd game over
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
            // Game continues
        }
    }

    async showRewarded(rewardType) {
        // ZORUNLU: Offline modda veya init olmamışsa reward yine de verilmeli
        if (!this.isInitialized || !navigator.onLine) {
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
                // Ad shown but not completed? Or failed?
                // Prompt says "Ad fail olursa oyun devam etmeli" - and usually players get angry if ad fails.
                // "ZORUNLU: Offline modda reward yine de verilmeli" implies user-friendly fallback.
                // If ad was dismissed without watching, usually no reward.
                // But if ERROR occurred, give reward.
                // We returned above if result.rewarded is true.
                // If we are here, something else happened (e.g. closed early).
                return false;
            }
        } catch (error) {
            console.warn('Rewarded ad failed:', error);
            Analytics.track('rewarded_ad_failed', { reason: error.message || 'unknown' });

            // Fallback: Reward user anyway to be kind/prevent breakage
            RewardSystem.grantReward(rewardType);
            return true;
        }
    }
}

export default new AdsManager();
