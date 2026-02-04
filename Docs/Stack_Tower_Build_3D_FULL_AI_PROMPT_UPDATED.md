# Stack / Tower Build 3D  
## FULL AI PRODUCTION PROMPT (MASTER) - UPDATED v2

Bu doküman, **Stack / Tower Build 3D** oyununun baştan sona,
**hiç boşluk kalmadan**, bir yapay zekâ tarafından üretilmesi için hazırlanmıştır.

Amaç:  
Bu dosya AI'ye verildiğinde; mimariyi kursun, kodu yazsın, performansı düşünsün,
mobil uyumluluğu sağlasın, **tutorial, error handling, ve retention mechanics dahil** çalışır bir MVP çıkarsın.

---

## 🔴 GENEL TALİMAT (ÇOK ÖNEMLİ)

Sen deneyimli bir **mobil oyun geliştiricisisin**.  
Hedefin **Android + iOS** için çalışan, **hyper-casual**, **yüksek performanslı**
bir **Three.js** oyunu üretmek.

Öncelik sırası:
1. **Performans** (mobil cihazlarda 60 FPS)
2. **Clean Code & modüler yapı**
3. **Oynanabilir MVP** (tutorial dahil)
4. **Genişletilebilir mimari**
5. **Error handling** (offline, ad fail, storage fail)

---

## 1️⃣ TEKNOLOJİ & ARAÇLAR

### Core Stack
- JavaScript (ES6+)
- Three.js (r150+, latest stable)
- WebGL
- requestAnimationFrame
- Web Audio API

### Mobile Integration (Capacitor)
```json
{
  "dependencies": {
    "@capacitor/core": "^5.0.0",
    "@capacitor/android": "^5.0.0",
    "@capacitor/ios": "^5.0.0",
    "@capacitor-firebase/analytics": "^5.0.0",
    "admob-plus-capacitor": "^2.0.0"
  }
}
```

### ZORUNLU Plugins
- `admob-plus-capacitor` (AdMob entegrasyonu)
- `@capacitor-firebase/analytics` (Analytics)
- `@capacitor/haptics` (vibration feedback)
- `@capacitor/status-bar` (immersive mode)

❌ Kullanma:
- Heavy post-processing
- Gereksiz kütüphaneler
- Karmaşık shader'lar
- Physics engine (manuel hesapla)

---

## 2️⃣ PROJE KURULUMU

### Dosya Yapısı (BUNA SIKI SIKIYA UY)
```
src/
 ├── core/
 │    ├── Game.js                   # Ana oyun sınıfı
 │    ├── SceneManager.js           # Three.js scene yönetimi
 │    ├── CameraController.js       # Kamera takip ve lerp
 │    ├── GameLoop.js               # requestAnimationFrame loop
 │    ├── InputManager.js           # Touch/click handler
 │    └── StateMachine.js           # Oyun state'leri (MENU, TUTORIAL, PLAYING, GAMEOVER)
 ├── game/
 │    ├── Block.js                  # Blok sınıfı (mesh, movement, collision)
 │    ├── Tower.js                  # Kule yönetimi (stack, pooling)
 │    ├── Collision.js              # AABB hizalama hesabı
 │    ├── Scoring.js                # Skor, combo, perfect tracking
 │    └── Difficulty.js             # Zorluk artış sistemi
 ├── systems/
 │    ├── TutorialSystem.js         # FTUE (3-step tutorial)
 │    ├── RetentionSystem.js        # Daily login, streak, missions
 │    ├── SaveSystem.js             # LocalStorage + fallback
 │    └── ErrorHandler.js           # Global error yönetimi
 ├── monetization/
 │    ├── AdsManager.js             # AdMob wrapper (banner, interstitial, rewarded)
 │    └── RewardSystem.js           # Rewarded ad reward dağıtımı
 ├── analytics/
 │    └── Analytics.js              # Firebase Analytics wrapper
 ├── ui/
 │    ├── HUD.js                    # In-game UI (score, combo)
 │    ├── MainMenu.js               # Ana menü
 │    ├── GameOverScreen.js         # Game over ekranı
 │    ├── TutorialOverlay.js        # Tutorial hint'leri
 │    └── SettingsMenu.js           # Settings panel
 ├── audio/
 │    └── AudioManager.js           # Müzik ve SFX yönetimi
 ├── utils/
 │    ├── MathUtils.js              # Lerp, clamp, vb.
 │    └── Constants.js              # Sabit değerler
 └── main.js                        # Entry point
```

**Her dosyada tek sorumluluk prensibini uygula.**

---

## 3️⃣ SAHNE & KAMERA

### Scene Setup
```javascript
// SceneManager.js
class SceneManager {
  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
    
    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    const directional = new THREE.DirectionalLight(0xffffff, 0.8);
    directional.position.set(5, 10, 5);
    
    // NO SHADOWS (performance)
    directional.castShadow = false;
    
    this.scene.add(ambient, directional);
  }
}
```

### Camera
```javascript
// CameraController.js
class CameraController {
  constructor() {
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    this.camera.position.set(0, 5, 10);
    this.camera.lookAt(0, 0, 0);
    
    this.targetY = 0;
    this.smoothness = 0.1; // Lerp factor
  }
  
  update(towerHeight) {
    this.targetY = towerHeight + 5;
    this.camera.position.y = THREE.MathUtils.lerp(
      this.camera.position.y,
      this.targetY,
      this.smoothness
    );
  }
}
```

---

## 4️⃣ OYUN MEKANİĞİ (CORE)

### Block System
```javascript
// Block.js
class Block {
  constructor(size, position, direction) {
    this.geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    this.material = new THREE.MeshStandardMaterial({ color: 0x4CAF50 });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.copy(position);
    
    this.direction = direction; // 'x' or 'z'
    this.speed = 2.0;
    this.moving = true;
  }
  
  update(delta) {
    if (!this.moving) return;
    
    const axis = this.direction === 'x' ? 'x' : 'z';
    this.mesh.position[axis] += this.speed * delta;
    
    // Ping-pong movement
    if (Math.abs(this.mesh.position[axis]) > 3) {
      this.speed *= -1;
    }
  }
  
  stop() {
    this.moving = false;
  }
}
```

### Collision & Alignment
```javascript
// Collision.js
class Collision {
  static checkOverlap(currentBlock, previousBlock) {
    const dir = currentBlock.direction;
    const axis = dir === 'x' ? 'x' : 'z';
    
    const current = currentBlock.mesh.position[axis];
    const previous = previousBlock.mesh.position[axis];
    const currentSize = currentBlock.mesh.scale[axis];
    const previousSize = previousBlock.mesh.scale[axis];
    
    const overlapStart = Math.max(current - currentSize/2, previous - previousSize/2);
    const overlapEnd = Math.min(current + currentSize/2, previous + previousSize/2);
    const overlap = Math.max(0, overlapEnd - overlapStart);
    
    const overlapPercentage = overlap / previousSize;
    
    return {
      overlap,
      percentage: overlapPercentage,
      isPerfect: overlapPercentage >= 0.95,
      isGood: overlapPercentage >= 0.70,
      newSize: overlap,
      newPosition: (overlapStart + overlapEnd) / 2
    };
  }
}
```

---

## 5️⃣ TUTORIAL SYSTEM (YENİ - ZORUNLU)

### Tutorial States
```javascript
// TutorialSystem.js
class TutorialSystem {
  constructor() {
    this.states = {
      NOT_STARTED: 0,
      STEP_1_TAP: 1,      // "Tap to drop block"
      STEP_2_PERFECT: 2,  // "Align perfectly!"
      STEP_3_COMBO: 3,    // "Build a combo!"
      COMPLETED: 4
    };
    
    this.currentState = this.states.NOT_STARTED;
    this.skipTimer = 0;
    this.showSkipAfter = 3.0; // 3 seconds
  }
  
  start() {
    this.currentState = this.states.STEP_1_TAP;
    this.showHint("Tap to drop the block!");
    
    // Assist mode: slow down game
    Game.setTimeScale(0.8);
  }
  
  onBlockPlaced(result) {
    switch(this.currentState) {
      case this.states.STEP_1_TAP:
        this.currentState = this.states.STEP_2_PERFECT;
        this.showHint("Try to align perfectly!");
        break;
        
      case this.states.STEP_2_PERFECT:
        if (result.isPerfect) {
          this.currentState = this.states.STEP_3_COMBO;
          this.showHint("Keep going for a combo!");
        }
        break;
        
      case this.states.STEP_3_COMBO:
        if (Game.combo >= 3) {
          this.complete();
        }
        break;
    }
  }
  
  complete() {
    this.currentState = this.states.COMPLETED;
    SaveSystem.set('tutorial_completed', true);
    Analytics.track('tutorial_complete');
    
    // Return to normal speed
    Game.setTimeScale(1.0);
  }
  
  skip() {
    this.complete();
    Analytics.track('tutorial_skipped', { step: this.currentState });
  }
}
```

### Tutorial UI
```javascript
// TutorialOverlay.js
class TutorialOverlay {
  constructor() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'tutorial-overlay';
    this.overlay.innerHTML = `
      <div class="tutorial-hint"></div>
      <div class="tutorial-skip" style="display:none">Skip Tutorial</div>
    `;
    document.body.appendChild(this.overlay);
  }
  
  showHint(text) {
    const hint = this.overlay.querySelector('.tutorial-hint');
    hint.textContent = text;
    hint.classList.add('fade-in');
    
    setTimeout(() => {
      const skipBtn = this.overlay.querySelector('.tutorial-skip');
      skipBtn.style.display = 'block';
    }, 3000);
  }
}
```

---

## 6️⃣ RETENTION MECHANICS (YENİ - ZORUNLU)

### Daily Login System
```javascript
// RetentionSystem.js
class RetentionSystem {
  constructor() {
    this.loginStreak = SaveSystem.get('login_streak', 0);
    this.lastLoginDate = SaveSystem.get('last_login_date', null);
  }
  
  checkDailyLogin() {
    const today = new Date().toDateString();
    
    if (this.lastLoginDate !== today) {
      this.loginStreak++;
      SaveSystem.set('login_streak', this.loginStreak);
      SaveSystem.set('last_login_date', today);
      
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
    this.showRewardPopup(reward);
  }
}
```

### Weekly Missions
```javascript
class MissionSystem {
  constructor() {
    this.missions = [
      { id: 'place_100', type: 'blocks_placed', target: 100, reward: { coins: 200 } },
      { id: 'perfect_20', type: 'perfect_hits', target: 20, reward: { bonus: 'slow_motion' } },
      { id: 'score_50', type: 'high_score', target: 50, reward: { skin: 'random' } }
    ];
    
    this.progress = SaveSystem.get('mission_progress', {});
  }
  
  updateProgress(type, value) {
    this.missions.forEach(mission => {
      if (mission.type === type) {
        this.progress[mission.id] = (this.progress[mission.id] || 0) + value;
        
        if (this.progress[mission.id] >= mission.target) {
          this.completeMission(mission);
        }
      }
    });
    
    SaveSystem.set('mission_progress', this.progress);
  }
}
```

---

## 7️⃣ ADMOB INTEGRATION (ZORUNLU)

### AdsManager Setup
```javascript
// monetization/AdsManager.js
import { AdMob } from 'admob-plus-capacitor';

class AdsManager {
  constructor() {
    this.isInitialized = false;
    this.lastInterstitialTime = 0;
    this.interstitialCooldown = 30000; // 30 seconds
    this.gameOverCount = 0;
    
    this.adIds = {
      banner: 'ca-app-pub-XXXXX/BANNER_ID',
      interstitial: 'ca-app-pub-XXXXX/INTERSTITIAL_ID',
      rewarded: 'ca-app-pub-XXXXX/REWARDED_ID'
    };
  }
  
  async init() {
    try {
      await AdMob.initialize({
        testingDevices: ['DEVICE_ID'], // Remove in production
        initializeForTesting: true
      });
      
      this.isInitialized = true;
      console.log('AdMob initialized');
      
      // Preload ads
      this.loadInterstitial();
      this.loadRewarded();
      
      Analytics.track('ads_initialized');
    } catch (error) {
      console.error('AdMob init failed:', error);
      this.isInitialized = false;
      // GAME CONTINUES WITHOUT ADS
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
      // Game continues
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
      console.log('Interstitial frequency not met');
      return;
    }
    
    try {
      await AdMob.prepareInterstitial({ adId: this.adIds.interstitial });
      await AdMob.showInterstitial();
      
      this.lastInterstitialTime = now;
      Analytics.track('ad_impression', { ad_type: 'interstitial', placement: 'game_over' });
      
      // Preload next
      this.loadInterstitial();
    } catch (error) {
      console.warn('Interstitial failed:', error);
      // GAME CONTINUES WITHOUT AD
      Analytics.track('ad_failed', { ad_type: 'interstitial', reason: error.message });
    }
  }
  
  async showRewarded(rewardType) {
    if (!this.isInitialized) {
      // FALLBACK: Give reward anyway (offline mode)
      this.grantReward(rewardType);
      return true;
    }
    
    try {
      await AdMob.prepareRewardedAd({ adId: this.adIds.rewarded });
      
      const result = await AdMob.showRewardedAd();
      
      if (result.rewarded) {
        Analytics.track('rewarded_ad_watched', { reward_type: rewardType });
        this.grantReward(rewardType);
        
        // Preload next
        this.loadRewarded();
        return true;
      }
    } catch (error) {
      console.warn('Rewarded ad failed:', error);
      Analytics.track('rewarded_ad_failed', { reason: error.message });
      
      // OPTION 1: No reward (strict)
      // return false;
      
      // OPTION 2: Grant reward anyway (player-friendly)
      this.grantReward(rewardType);
      return true;
    }
  }
  
  grantReward(type) {
    switch(type) {
      case 'continue':
        Game.continueGame();
        break;
      case 'double_score':
        Game.doubleScore();
        break;
      case 'slow_motion':
        Game.activateSlowMotion();
        break;
    }
  }
  
  async loadInterstitial() {
    try {
      await AdMob.prepareInterstitial({ adId: this.adIds.interstitial });
    } catch (error) {
      console.warn('Failed to preload interstitial');
    }
  }
  
  async loadRewarded() {
    try {
      await AdMob.prepareRewardedAd({ adId: this.adIds.rewarded });
    } catch (error) {
      console.warn('Failed to preload rewarded');
    }
  }
}

export default new AdsManager();
```

---

## 8️⃣ ANALYTICS (FIREBASE - ZORUNLU)

### Analytics Wrapper
```javascript
// analytics/Analytics.js
import { FirebaseAnalytics } from '@capacitor-firebase/analytics';

class Analytics {
  constructor() {
    this.isEnabled = true;
    this.eventQueue = [];
    this.isOffline = false;
  }
  
  async init() {
    try {
      await FirebaseAnalytics.setEnabled({ enabled: true });
      console.log('Firebase Analytics initialized');
      
      // Flush queued events
      this.flushQueue();
    } catch (error) {
      console.error('Analytics init failed:', error);
      this.isEnabled = false;
    }
  }
  
  track(eventName, params = {}) {
    // Check online status
    if (!navigator.onLine) {
      this.isOffline = true;
      this.eventQueue.push({ eventName, params });
      return;
    }
    
    if (!this.isEnabled) {
      console.log('[Analytics Disabled]', eventName, params);
      return;
    }
    
    try {
      FirebaseAnalytics.logEvent({
        name: eventName,
        params: {
          ...params,
          timestamp: Date.now()
        }
      });
    } catch (error) {
      console.error('Analytics track error:', error);
    }
  }
  
  flushQueue() {
    if (this.eventQueue.length === 0) return;
    
    console.log(`Flushing ${this.eventQueue.length} queued events`);
    this.eventQueue.forEach(event => {
      this.track(event.eventName, event.params);
    });
    this.eventQueue = [];
  }
  
  // Common events
  gameStart() {
    this.track('game_start');
  }
  
  gameOver(score, duration, perfectHits, maxCombo) {
    this.track('game_over', {
      score,
      duration_seconds: Math.floor(duration),
      perfect_hits: perfectHits,
      max_combo: maxCombo
    });
  }
  
  blockPlaced(score, combo, isPerfect) {
    this.track('block_placed', {
      score,
      combo,
      is_perfect: isPerfect
    });
  }
}

export default new Analytics();
```

---

## 9️⃣ ERROR HANDLING (YENİ - ZORUNLU)

### Global Error Handler
```javascript
// systems/ErrorHandler.js
class ErrorHandler {
  constructor() {
    this.setupGlobalHandlers();
  }
  
  setupGlobalHandlers() {
    // Uncaught errors
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      Analytics.track('error_occurred', {
        message: event.error.message,
        stack: event.error.stack
      });
      
      // Show user-friendly message
      this.showErrorToast('Something went wrong. Please restart.');
    });
    
    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise:', event.reason);
      Analytics.track('promise_rejection', {
        reason: event.reason
      });
    });
  }
  
  showErrorToast(message) {
    // Show non-blocking toast notification
    const toast = document.createElement('div');
    toast.className = 'error-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.remove(), 3000);
  }
}
```

### Storage Fallback
```javascript
// systems/SaveSystem.js
class SaveSystem {
  constructor() {
    this.storage = this.detectStorage();
    this.memoryFallback = {};
  }
  
  detectStorage() {
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      return 'localStorage';
    } catch (e) {
      console.warn('localStorage unavailable, using memory');
      return 'memory';
    }
  }
  
  set(key, value) {
    try {
      if (this.storage === 'localStorage') {
        localStorage.setItem(key, JSON.stringify(value));
      } else {
        this.memoryFallback[key] = value;
      }
    } catch (e) {
      console.error('Storage error:', e);
      // Fallback to memory
      this.memoryFallback[key] = value;
    }
  }
  
  get(key, defaultValue = null) {
    try {
      if (this.storage === 'localStorage') {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } else {
        return this.memoryFallback[key] ?? defaultValue;
      }
    } catch (e) {
      console.error('Storage read error:', e);
      return defaultValue;
    }
  }
}

export default new SaveSystem();
```

### Offline Mode
```javascript
// Handle offline gracefully
window.addEventListener('online', () => {
  console.log('Back online');
  Analytics.flushQueue();
  AdsManager.init(); // Retry ad init
});

window.addEventListener('offline', () => {
  console.log('Gone offline - game continues');
  // Show small offline indicator
  document.querySelector('.offline-indicator').style.display = 'block';
});
```

---

## 🔟 PERFORMANCE BUDGET (SIKI TAKİP ET)

### Hard Limits
```javascript
// utils/Constants.js
export const PERFORMANCE = {
  MAX_DRAW_CALLS: 25,
  MAX_TRIANGLES: 6000,
  MAX_ACTIVE_BLOCKS: 30,
  TARGET_FPS: 60,
  MIN_FPS: 45,
  MAX_MEMORY_MB: 120
};
```

### Object Pooling
```javascript
// game/Tower.js
class Tower {
  constructor() {
    this.activeBlocks = [];
    this.blockPool = [];
    this.maxPoolSize = 10;
  }
  
  getBlock() {
    if (this.blockPool.length > 0) {
      return this.blockPool.pop();
    }
    return new Block();
  }
  
  recycleBlock(block) {
    block.mesh.visible = false;
    if (this.blockPool.length < this.maxPoolSize) {
      this.blockPool.push(block);
    } else {
      // Dispose
      block.geometry.dispose();
      block.material.dispose();
    }
  }
  
  update() {
    // Keep only recent blocks visible
    if (this.activeBlocks.length > PERFORMANCE.MAX_ACTIVE_BLOCKS) {
      const oldBlock = this.activeBlocks.shift();
      this.scene.remove(oldBlock.mesh);
      this.recycleBlock(oldBlock);
    }
  }
}
```

### FPS Monitor
```javascript
// utils/PerformanceMonitor.js
class PerformanceMonitor {
  constructor() {
    this.fps = 60;
    this.frameCount = 0;
    this.lastTime = performance.now();
  }
  
  update() {
    this.frameCount++;
    const now = performance.now();
    
    if (now >= this.lastTime + 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (now - this.lastTime));
      this.frameCount = 0;
      this.lastTime = now;
      
      // Warning if FPS drops
      if (this.fps < PERFORMANCE.MIN_FPS) {
        console.warn(`Low FPS: ${this.fps}`);
        Analytics.track('performance_warning', { fps: this.fps });
      }
    }
  }
}
```

---

## 1️⃣1️⃣ AUDIO HANDLING (WEB AUDIO API)

### AudioManager
```javascript
// audio/AudioManager.js
class AudioManager {
  constructor() {
    this.context = null;
    this.sounds = {};
    this.music = null;
    this.isMuted = SaveSystem.get('audio_muted', false);
  }
  
  async init() {
    try {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
      
      // Handle autoplay policy
      if (this.context.state === 'suspended') {
        document.addEventListener('click', () => {
          this.context.resume();
        }, { once: true });
      }
      
      await this.loadSounds();
    } catch (error) {
      console.error('Audio init failed:', error);
    }
  }
  
  async loadSounds() {
    const soundFiles = {
      tap: 'assets/audio/sfx/tap.mp3',
      perfect: 'assets/audio/sfx/perfect.mp3',
      combo: 'assets/audio/sfx/combo.mp3',
      fail: 'assets/audio/sfx/fail.mp3'
    };
    
    for (const [name, url] of Object.entries(soundFiles)) {
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
        this.sounds[name] = audioBuffer;
      } catch (error) {
        console.warn(`Failed to load sound: ${name}`);
      }
    }
  }
  
  play(soundName) {
    if (this.isMuted || !this.sounds[soundName]) return;
    
    const source = this.context.createBufferSource();
    source.buffer = this.sounds[soundName];
    source.connect(this.context.destination);
    source.start(0);
  }
  
  playMusic() {
    // Implement looping music
  }
  
  toggleMute() {
    this.isMuted = !this.isMuted;
    SaveSystem.set('audio_muted', this.isMuted);
    Analytics.track('audio_toggled', { is_enabled: !this.isMuted });
  }
}

export default new AudioManager();
```

---

## 1️⃣2️⃣ PRIVACY COMPLIANCE

### Privacy Policy Link
```javascript
// ui/SettingsMenu.js
class SettingsMenu {
  constructor() {
    this.createUI();
  }
  
  createUI() {
    const menu = document.createElement('div');
    menu.innerHTML = `
      <div class="settings-menu">
        <h2>Settings</h2>
        <button id="toggle-sound">Sound: ON</button>
        <button id="toggle-music">Music: ON</button>
        <a href="https://yoursite.com/privacy-policy" target="_blank">
          Privacy Policy
        </a>
        <button id="close-settings">Close</button>
      </div>
    `;
    document.body.appendChild(menu);
  }
}
```

### iOS ATT Request
```javascript
// iOS only - Request tracking permission
import { Plugins } from '@capacitor/core';

async function requestTrackingPermission() {
  if (Capacitor.getPlatform() === 'ios') {
    try {
      const { status } = await Plugins.AppTrackingTransparency.requestPermission();
      Analytics.track('att_permission', { status });
    } catch (error) {
      console.warn('ATT request failed:', error);
    }
  }
}

// Call after tutorial completion
TutorialSystem.on('complete', () => {
  requestTrackingPermission();
});
```

---

## 1️⃣3️⃣ BUILD & DEPLOYMENT

### Capacitor Config
```javascript
// capacitor.config.json
{
  "appId": "com.yourstudio.stacktower",
  "appName": "Stack Tower Build 3D",
  "webDir": "dist",
  "bundledWebRuntime": false,
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 2000,
      "backgroundColor": "#87CEEB"
    },
    "StatusBar": {
      "style": "light",
      "backgroundColor": "#87CEEB"
    }
  }
}
```

### Build Commands
```bash
# Development
npm run dev

# Build for production
npm run build

# Sync with Capacitor
npx cap sync

# Android
npx cap open android
# Then: Build > Generate Signed Bundle (AAB)

# iOS
npx cap open ios
# Then: Archive > Upload to TestFlight
```

### Version Strategy
```
1.0.0 - Initial release
1.0.1 - Bug fixes
1.1.0 - New features (themes)
1.2.0 - Major features (challenge mode)
```

---

## 1️⃣4️⃣ ÇIKTI BEKLENTİSİ

AI, bu prompt'u aldığında şunları ÜRETMELİ:

### 1. Kod Dosyaları
- Yukarıdaki yapıya uygun tüm .js dosyaları
- Her dosyada yorumlar ve açıklamalar
- Modüler, clean code

### 2. README.md
```markdown
# Stack Tower Build 3D

## Setup
npm install

## Development
npm run dev

## Build
npm run build
npx cap sync

## Deploy
- Android: Open in Android Studio > Build AAB
- iOS: Open in Xcode > Archive

## Features
- Tutorial system
- Daily login rewards
- AdMob integration
- Firebase Analytics
- Offline support
```

### 3. package.json
```json
{
  "name": "stack-tower-3d",
  "version": "1.0.0",
  "dependencies": {
    "three": "^0.150.0",
    "@capacitor/core": "^5.0.0",
    "admob-plus-capacitor": "^2.0.0",
    "@capacitor-firebase/analytics": "^5.0.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  }
}
```

### 4. Assets Klasörü
```
assets/
 ├── audio/
 │   ├── music/
 │   │   └── ambient_loop.ogg
 │   └── sfx/
 │       ├── tap.mp3
 │       ├── perfect.mp3
 │       ├── combo.mp3
 │       └── fail.mp3
 └── images/
     └── logo.png
```

---

## 1️⃣5️⃣ KALİTE KONTROL ÖNCESİ TEST

AI, kodu ürettikten sonra şunları KONTROL ET:

- [ ] Tutorial akışı çalışıyor mu?
- [ ] Offline modda oyun oynayabiliyor mu?
- [ ] Reklam yüklenemezse hata veriyor mu? (VERMEMELİ)
- [ ] FPS 60'ın altına düşüyor mu?
- [ ] LocalStorage dolu olsa bile oyun çalışıyor mu?
- [ ] AdMob test modunda reklamlar gösteriliyor mu?
- [ ] Analytics event'leri loglanıyor mu?
- [ ] Mobil tarayıcıda touch input çalışıyor mu?

---

## 🎯 ÖZET

Bu güncellenmiş prompt ile AI:
1. ✅ Tutorial sistemi ekleyecek
2. ✅ Error handling (offline, ad fail, storage fail) yapacak
3. ✅ Retention mechanics (daily login, missions, streak) ekleyecek
4. ✅ AdMob entegrasyonu (fallback'ler ile) yapacak
5. ✅ Firebase Analytics entegrasyonu yapacak
6. ✅ Privacy policy link ekleyecek
7. ✅ Performance budget'a uyacak
8. ✅ Build & deployment hazır çıktı verecek

**SONUÇ:** Production-ready, hatasız, mobil için optimize edilmiş bir hyper-casual oyun.
