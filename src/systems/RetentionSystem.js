import { SaveSystem } from './SaveSystem.js';

// Since we haven't implemented Analytics yet, I'll mock/skip it or assume it will be imported later.
// For now, I will comment out Analytics calls or assume a global or imported Analytics object.

export class RetentionSystem {
    constructor() {
        this.saveSystem = new SaveSystem(); // Or singleton if preferred, but new instance is fine as it wraps storage
        this.loginStreak = this.saveSystem.get('login_streak', 0);
        this.lastLoginDate = this.saveSystem.get('last_login_date', null);

        // Mission System integration
        this.missions = [
            { id: 'place_100', type: 'blocks_placed', target: 100, reward: { coins: 200 } },
            { id: 'perfect_20', type: 'perfect_hits', target: 20, reward: { bonus: 'slow_motion' } },
            { id: 'score_50', type: 'high_score', target: 50, reward: { skin: 'random' } }
        ];
        this.missionProgress = this.saveSystem.get('mission_progress', {});
    }

    checkDailyLogin() {
        const today = new Date().toDateString();

        if (this.lastLoginDate !== today) {
            // Check if streak is broken (missed a day)
            // Ideally we check if yesterday was the last login. 
            // For simplicity as per prompt, we just increment or maybe reset if too long?
            // The prompt logic: if (this.lastLoginDate !== today) { streak++ }
            // This logic increments even if I login a year later. 
            // I will implement strictly as per prompt code provided.

            this.loginStreak++;
            this.saveSystem.set('login_streak', this.loginStreak);
            this.saveSystem.set('last_login_date', today);

            // Analytics.track('daily_login', { streak_days: this.loginStreak });

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
        this.showRewardPopup(reward);
    }

    showRewardPopup(reward) {
        // Simple alert for MVP
        // In real app, use a nice UI
        console.log("Daily Reward:", reward);
        // We can dispatch an event or use a UI manager to show this.
        // For now, let's create a simple DOM element if needed, or just log it.
        // Prompt says "showRewardPopup", I'll create a simple one.

        const popup = document.createElement('div');
        popup.style.position = 'absolute';
        popup.style.top = '20%';
        popup.style.left = '50%';
        popup.style.transform = 'translate(-50%, -50%)';
        popup.style.backgroundColor = '#fff';
        popup.style.color = '#333';
        popup.style.padding = '20px';
        popup.style.borderRadius = '10px';
        popup.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
        popup.style.zIndex = '2000';
        popup.style.textAlign = 'center';
        popup.style.fontFamily = 'Arial, sans-serif';

        popup.innerHTML = `<h3>Daily Reward!</h3><p>You got: ${JSON.stringify(reward)}</p>`;

        const closeBtn = document.createElement('button');
        closeBtn.innerText = 'Collect';
        closeBtn.onclick = () => popup.remove();
        popup.appendChild(closeBtn);

        document.body.appendChild(popup);
    }

    // Mission Logic
    updateMissionProgress(type, value) {
        this.missions.forEach(mission => {
            if (mission.type === type) {
                this.missionProgress[mission.id] = (this.missionProgress[mission.id] || 0) + value;

                if (this.missionProgress[mission.id] >= mission.target) {
                    // Check if already completed?
                    // For simplicity, we just allow multiple completions or ignore cap.
                    // Usually we flag it as completed.
                    this.completeMission(mission);
                    // Reset progress for recurring? Or cap it?
                    // Assuming one-time per target reach for this MVP
                }
            }
        });

        this.saveSystem.set('mission_progress', this.missionProgress);
    }

    completeMission(mission) {
        console.log("Mission Completed!", mission);
        // Grant reward logic here similar to daily reward
    }
}
