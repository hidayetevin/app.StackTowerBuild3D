import { AdMob } from 'admob-plus-capacitor';
import Analytics from '../analytics/Analytics.js';
import RewardSystem from './RewardSystem.js';

class AdsManager {
    constructor() {
        this.isInitialized = false;
        this.lastInterstitialTime = 0;
        this.interstitialCooldown = 5000; // Reduced cooldown for button triggers
        this.adIds = {
             // REPLACE THESE WITH YOUR REAL IDS IF AVAILABLE, OTHERWISE USE TEST IDS
            banner: 'ca-app-pub-4190858087915294/6293542928', 
            interstitial: 'ca-app-pub-4190858087915294/1552244338', 
            rewarded: 'ca-app-pub-4190858087915294/3667379581' 
        };
        // Use Test Ids for development if needed, but user supplied specific IDs in previous version.
        // Keeping the IDs from the previous file content.
        this.adIds = {
            banner: 'ca-app-pub-3940256099942544/6300978111', // Test ID
            interstitial: 'ca-app-pub-3940256099942544/1033173712', // Test ID
            rewarded: 'ca-app-pub-3940256099942544/5224354917' // Test ID
        };
        // NOTE: Restoring user provided IDs if they were real, but usually for "didn't see ads" in APK, it's better to verify with Test IDs first. 
        // However, user specifically asked to fix it. I will use the headers from the previous file but ensure AdMob is actually called.
        // Actually, the previous file had specific IDs: 'ca-app-pub-4190858087915294/...' 
        // I will restore THOSE IDs.
        this.adIds = {
            banner: 'ca-app-pub-4190858087915294/6293542928',
            interstitial: 'ca-app-pub-4190858087915294/1552244338',
            rewarded: 'ca-app-pub-4190858087915294/3667379581'
        };
    }

    async init() {
        try {
            await AdMob.initialize({
                requestTrackingAuthorization: true,
                initializeForTesting: false // Set to true if testing on device with test IDs
            });
            this.isInitialized = true;
            console.log('AdMob initialized');
            Analytics.track('ads_initialized');
            
            // Auto show banner on init as requested
            this.showBanner();
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
                position: 'bottom',
                offset: 0 
            });
            Analytics.track('ad_impression', { ad_type: 'banner', placement: 'bottom' });
        } catch (error) {
            console.warn('Banner failed:', error);
        }
    }

    hideBanner() {
        // User requested banner on ALL screens. 
        // We will disable hiding unless explicitly needed for some overlapping UI.
        // For now, doing nothing or logging.
        console.log('Hide banner requested but ignored (Banner Peristent)');
    }

    async showInterstitial(force = false) {
        if (!this.isInitialized) return;

        const now = Date.now();
        // If forced (button press), ignore cooldown
        if (!force && now - this.lastInterstitialTime < this.interstitialCooldown) {
            console.log('Interstitial on cooldown');
            return;
        }

        try {
            await AdMob.prepareInterstitial({ adId: this.adIds.interstitial });
            await AdMob.showInterstitial();
            this.lastInterstitialTime = now;
            Analytics.track('ad_impression', { ad_type: 'interstitial', placement: force ? 'button_click' : 'game_over' });
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
            // If ad fails to load, normally we don't grant reward to prevent abuse, 
            // but for better UX in "broken ad" situations, some grant it.
            // User requirement: "reklam gelmeli". 
            // I'll stick to: if ad fails, return false, don't grant. 
            // EXCEPT if offline/not-init where we grant.
            return false;
        }
    }
}

export default new AdsManager();
