import { AdMob, BannerAdPosition, RewardAdPluginEvents } from '@capacitor-community/admob';
import Analytics from '../analytics/Analytics.js';
import RewardSystem from './RewardSystem.js';

class AdsManager {
    constructor() {
        this.isInitialized = false;
        this.lastInterstitialTime = 0;
        this.interstitialCooldown = 5000;

        // Use Real IDs provided by user
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
                initializeForTesting: false
            });
            this.isInitialized = true;
            console.log('AdMob initialized (@capacitor-community/admob)');
            Analytics.track('ads_initialized');

            // Auto show banner
            this.showBanner();

            // Prepare ads in advance if possible (optional but good for performance)
            this.prepareInterstitial();
            this.prepareRewarded();
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
            Analytics.track('ad_impression', { ad_type: 'banner', placement: 'bottom' });
        } catch (error) {
            console.warn('Banner failed:', error);
        }
    }

    hideBanner() {
        console.log('Hide banner requested but ignored (Persistent Banner)');
        // If we really wanted to hide: AdMob.hideBanner();
    }

    async prepareInterstitial() {
        if (!this.isInitialized) return;
        try {
            await AdMob.prepareInterstitial({
                adId: this.adIds.interstitial,
                isTesting: false
            });
        } catch (e) {
            console.log('Prepare interstitial failed', e);
        }
    }

    async showInterstitial(force = false) {
        if (!this.isInitialized) return;

        const now = Date.now();
        if (!force && now - this.lastInterstitialTime < this.interstitialCooldown) {
            console.log('Interstitial on cooldown');
            return;
        }

        try {
            // Ensure prepared
            await this.prepareInterstitial();

            await AdMob.showInterstitial();
            this.lastInterstitialTime = now;
            Analytics.track('ad_impression', { ad_type: 'interstitial', placement: force ? 'button_click' : 'game_over' });

            // Prepare next one
            this.prepareInterstitial();
        } catch (error) {
            console.warn('Interstitial failed:', error);
            Analytics.track('ad_failed', { ad_type: 'interstitial', reason: error.message || 'unknown' });
        }
    }

    async prepareRewarded() {
        if (!this.isInitialized) return;
        try {
            await AdMob.prepareRewardVideoAd({
                adId: this.adIds.rewarded,
                isTesting: false
            });
        } catch (e) {
            console.log('Prepare rewarded failed', e);
        }
    }

    async showRewarded(rewardType) {
        if (!this.isInitialized) {
            console.log('Offline/NoAds Mode: Granting reward anyway');
            RewardSystem.grantReward(rewardType);
            return true;
        }

        return new Promise(async (resolve) => {
            let rewarded = false;

            // Setup listener for reward
            const onReward = AdMob.addListener(RewardAdPluginEvents.Rewarded, (rewardItem) => {
                console.log('User rewarded:', rewardItem);
                rewarded = true;
            });

            // Setup listener for dismiss to cleanup
            const onDismiss = AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
                onReward.remove();
                onDismiss.remove();
                onFailed.remove();

                if (rewarded) {
                    Analytics.track('rewarded_ad_watched', { reward_type: rewardType });
                    RewardSystem.grantReward(rewardType);
                    resolve(true);
                } else {
                    resolve(false);
                }
                // Prepare next
                this.prepareRewarded();
            });

            const onFailed = AdMob.addListener(RewardAdPluginEvents.FailedToLoad, (err) => {
                console.warn('Rewarded failed to load', err);
                onReward.remove();
                onDismiss.remove();
                onFailed.remove();
                resolve(false);
            });


            try {
                await this.prepareRewarded();
                await AdMob.showRewardVideoAd();
            } catch (error) {
                console.warn('Rewarded show failed:', error);

                // Cleanup listeners if show fails immediately
                onReward.remove();
                onDismiss.remove();
                onFailed.remove();

                Analytics.track('rewarded_ad_failed', { reason: error.message || 'unknown' });
                // Do not grant reward on error unless offline (handled at top)
                resolve(false);
            }
        });
    }
}

export default new AdsManager();
