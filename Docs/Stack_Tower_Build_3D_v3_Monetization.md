# Stack / Tower Build 3D – AI PROMPT v3
## Monetization + Analytics + Error Handling

> Production-ready prompt with AdMob, Firebase Analytics, Tutorial, Retention Mechanics

---

## AI ROLE
Senior mobile game developer + monetization expert

## TASK
Create a Three.js hyper-casual game with:
- AdMob integration (banner, interstitial, rewarded)
- Firebase Analytics
- Tutorial system (3-step FTUE)
- Daily login + missions + streak
- Error handling (offline, ad fail, storage fail)
- Privacy compliance (Privacy Policy link, ATT)

## TECH STACK
- Three.js + Capacitor
- admob-plus-capacitor
- @capacitor-firebase/analytics
- Mobile-first (Android + iOS)

## CRITICAL RULES
✅ Game MUST work offline
✅ Ads MUST NOT break gameplay if they fail
✅ Storage errors MUST be handled gracefully
✅ Tutorial MUST be skippable
✅ FPS MUST stay ≥ 45

## ADMOB INTEGRATION

### Setup
```javascript
import { AdMob } from 'admob-plus-capacitor';

class AdsManager {
  async init() {
    try {
      await AdMob.initialize({
        requestTrackingAuthorization: true,
        testingDevices: ['TEST_DEVICE_ID']
      });
      this.isInitialized = true;
    } catch (error) {
      console.error('AdMob failed:', error);
      this.isInitialized = false;
      // GAME CONTINUES WITHOUT ADS
    }
  }
  
  async showInterstitial() {
    if (!this.isInitialized) return;
    
    // Cooldown: 30s
    // Frequency: Every 3rd game over
    
    try {
      await AdMob.showInterstitial();
      Analytics.track('ad_impression', { ad_type: 'interstitial' });
    } catch (error) {
      // GAME CONTINUES
      console.warn('Ad failed:', error);
    }
  }
  
  async showRewarded(rewardType) {
    if (!this.isInitialized) {
      // OFFLINE: Grant reward anyway
      this.grantReward(rewardType);
      return true;
    }
    
    try {
      const result = await AdMob.showRewardedAd();
      if (result.rewarded) {
        this.grantReward(rewardType);
        return true;
      }
    } catch (error) {
      // PLAYER-FRIENDLY: Grant reward
      this.grantReward(rewardType);
      return true;
    }
  }
}
```

## ANALYTICS INTEGRATION

### Setup
```javascript
import { FirebaseAnalytics } from '@capacitor-firebase/analytics';

class Analytics {
  async init() {
    try {
      await FirebaseAnalytics.setEnabled({ enabled: true });
      this.isEnabled = true;
      this.flushQueue();
    } catch (error) {
      this.isEnabled = false;
    }
  }
  
  track(eventName, params = {}) {
    if (!navigator.onLine) {
      this.eventQueue.push({ eventName, params });
      return;
    }
    
    if (!this.isEnabled) return;
    
    FirebaseAnalytics.logEvent({
      name: eventName,
      params: { ...params, timestamp: Date.now() }
    });
  }
}
```

### Events
```
tutorial_begin, tutorial_complete, tutorial_skipped
game_start, game_over, block_placed, perfect_hit
ad_impression, rewarded_ad_watched, rewarded_ad_failed
daily_login, mission_completed, streak_achieved
```

## TUTORIAL SYSTEM

```javascript
class TutorialSystem {
  states = {
    STEP_1_TAP: 1,
    STEP_2_PERFECT: 2,
    STEP_3_COMBO: 3,
    COMPLETED: 4
  };
  
  start() {
    this.currentState = this.states.STEP_1_TAP;
    this.showHint("Tap to drop the block!");
    Game.setTimeScale(0.8); // Slower for beginners
    
    // Show skip button after 3s
    setTimeout(() => this.showSkipButton(), 3000);
  }
  
  complete() {
    SaveSystem.set('tutorial_completed', true);
    Analytics.track('tutorial_complete');
    Game.setTimeScale(1.0);
  }
}
```

## RETENTION MECHANICS

### Daily Login
```javascript
class RetentionSystem {
  checkDailyLogin() {
    const today = new Date().toDateString();
    
    if (this.lastLoginDate !== today) {
      this.loginStreak++;
      this.grantDailyReward();
      Analytics.track('daily_login', { streak_days: this.loginStreak });
    }
  }
  
  grantDailyReward() {
    const rewards = {
      1: { coins: 100 },
      2: { bonus: 'shield' },
      3: { skin: 'daily_skin_1' },
      7: { theme: 'premium_theme' }
    };
    // Show reward popup
  }
}
```

### Missions
```javascript
const missions = [
  { id: 'place_100', type: 'blocks_placed', target: 100, reward: { coins: 200 } },
  { id: 'perfect_20', type: 'perfect_hits', target: 20, reward: { bonus: 'slow_motion' } },
  { id: 'score_50', type: 'high_score', target: 50, reward: { skin: 'random' } }
];
```

## ERROR HANDLING

### Global Handler
```javascript
window.addEventListener('error', (event) => {
  Analytics.track('error_occurred', { message: event.error.message });
  showErrorToast('Restarting...');
  setTimeout(() => Game.restart(), 2000);
});
```

### Storage Fallback
```javascript
class SaveSystem {
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      // Fallback to memory
      this.memoryFallback[key] = value;
    }
  }
}
```

### Offline Mode
```javascript
window.addEventListener('offline', () => {
  // Game continues
  // Show offline indicator
  Analytics.track('went_offline');
});

window.addEventListener('online', () => {
  Analytics.flushQueue();
  AdsManager.init();
});
```

## PRIVACY

### Privacy Policy Link
```javascript
// In Settings Menu
<a href="https://yoursite.com/privacy-policy">Privacy Policy</a>
```

### iOS ATT
```javascript
// Handled automatically by AdMob.initialize()
// requestTrackingAuthorization: true
```

## PERFORMANCE

```javascript
const BUDGET = {
  MAX_DRAW_CALLS: 25,
  MAX_TRIANGLES: 6000,
  MAX_ACTIVE_BLOCKS: 30,
  TARGET_FPS: 60,
  MIN_FPS: 45
};

class PerformanceMonitor {
  update() {
    if (this.fps < 45) {
      this.enablePerformanceMode();
    }
  }
  
  enablePerformanceMode() {
    renderer.setPixelRatio(1);
    renderer.shadowMap.enabled = false;
  }
}
```

## FILE STRUCTURE

```
src/
 ├── core/
 │   ├── Game.js
 │   ├── SceneManager.js
 │   └── StateMachine.js
 ├── game/
 │   ├── Block.js
 │   ├── Tower.js
 │   └── Collision.js
 ├── systems/
 │   ├── TutorialSystem.js
 │   ├── RetentionSystem.js
 │   ├── SaveSystem.js
 │   └── ErrorHandler.js
 ├── monetization/
 │   └── AdsManager.js
 ├── analytics/
 │   └── Analytics.js
 └── ui/
     ├── HUD.js
     ├── MainMenu.js
     └── SettingsMenu.js
```

## OUTPUT

AI must produce:
1. All code files (modular, commented)
2. README.md (setup, build, deploy)
3. package.json
4. Capacitor config

## TEST CHECKLIST

- [ ] Tutorial works & skippable
- [ ] Offline mode works
- [ ] Ads don't break game when failed
- [ ] Storage errors handled
- [ ] FPS ≥ 45
- [ ] Analytics logging
- [ ] Daily login works

---

BİTTİ.
