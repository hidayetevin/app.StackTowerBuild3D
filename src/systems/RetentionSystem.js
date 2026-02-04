import { SaveSystem } from './SaveSystem.js';
import Analytics from '../analytics/Analytics.js';

export class RetentionSystem {
    constructor() {
        this.saveSystem = new SaveSystem();
        this.loginStreak = this.saveSystem.get('login_streak', 0);
        this.lastLoginDate = this.saveSystem.get('last_login_date', null);
        this.coins = this.saveSystem.get('coins', 0);

        this.missions = [
            { id: 'place_100', type: 'blocks_placed', target: 100, reward: { coins: 200 } },
            { id: 'perfect_20', type: 'perfect_hits', target: 20, reward: { bonus: 'slow_motion' } },
            { id: 'score_50', type: 'high_score', target: 50, reward: { skin: 'random' } }
        ];
        this.missionProgress = this.saveSystem.get('mission_progress', {});
    }

    addCoins(amount) {
        this.coins += amount;
        this.saveSystem.set('coins', this.coins);
        return this.coins;
    }

    getCoins() {
        return this.coins;
    }

    checkDailyLogin() {
        const today = new Date().toDateString();

        if (this.lastLoginDate !== today) {
            this.loginStreak++;
            this.saveSystem.set('login_streak', this.loginStreak);
            this.saveSystem.set('last_login_date', today);

            Analytics.track('daily_login', { streak_days: this.loginStreak });

            this.grantDailyReward();
        }
    }

    grantDailyReward() {
        const rewards = {
            1: { type: 'coins', amount: 100 },
            2: { type: 'bonus', name: 'shield' },
            3: { type: 'skin', id: 'daily_skin_1' },
            5: { type: 'bonus', name: 'extra_width' },
            7: { type: 'theme', id: 'premium_theme_1' }
        };

        const reward = rewards[this.loginStreak] || { type: 'coins', amount: 50 };
        if (reward.type === 'coins') {
            this.addCoins(reward.amount);
        }
        this.showRewardPopup(reward);
    }

    showRewardPopup(reward) {
        // UI implementation...
        console.log("Daily Reward:", reward);
    }

    updateMissionProgress(type, value) {
        let completedMissions = [];

        this.missions.forEach(mission => {
            if (mission.type === type) {
                const oldVal = this.missionProgress[mission.id] || 0;
                const newVal = oldVal + value;
                this.missionProgress[mission.id] = newVal;

                if (oldVal < mission.target && newVal >= mission.target) {
                    this.completeMission(mission);
                    completedMissions.push(mission);
                }
            }
        });

        if (completedMissions.length > 0) {
            this.saveSystem.set('mission_progress', this.missionProgress);
        }
    }

    completeMission(mission) {
        console.log("Mission Completed!", mission);
        if (mission.reward && mission.reward.coins) {
            this.addCoins(mission.reward.coins);
        }
        Analytics.track('mission_completed', { mission_id: mission.id });
    }
}
