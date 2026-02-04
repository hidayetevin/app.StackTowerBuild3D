# Stack / Tower Build 3D – VARIATION PACK v2
## Skin + Theme + Challenge Mode (UPDATED)

Bu döküman, mevcut oyunun kazanç ve retention odaklı varyasyonlarını içerir.

---

## 1️⃣ SKIN SİSTEMİ

### Skin Tanımı
Skin'ler **sadece blok görünümünü** değiştirir:
- Color
- Emissive (glow)
- Metalness / Roughness
- Opacity

**Fizik DEĞİŞMEZ** (oyun dengesi korunur)

### Skin JSON Formatı
```json
{
  "skins": [
    {
      "id": "default",
      "name": "Classic",
      "unlocked": true,
      "color": "#4CAF50",
      "emissive": "#000000",
      "metalness": 0.3,
      "roughness": 0.7,
      "opacity": 1.0
    },
    {
      "id": "neon_blue",
      "name": "Neon Blue",
      "unlocked": false,
      "unlockMethod": "score_threshold",
      "unlockValue": 50,
      "color": "#00FFFF",
      "emissive": "#00FFFF",
      "metalness": 0.8,
      "roughness": 0.2,
      "opacity": 0.9
    },
    {
      "id": "gold",
      "name": "Golden",
      "unlocked": false,
      "unlockMethod": "rewarded_ad",
      "color": "#FFD700",
      "emissive": "#FFA500",
      "metalness": 1.0,
      "roughness": 0.1,
      "opacity": 1.0
    },
    {
      "id": "daily_skin_1",
      "name": "Daily Reward",
      "unlocked": false,
      "unlockMethod": "daily_login",
      "unlockValue": 3,
      "color": "#FF1493",
      "emissive": "#FF69B4",
      "metalness": 0.5,
      "roughness": 0.5,
      "opacity": 1.0
    }
  ]
}
```

### Skin Unlock Methodları
```
- score_threshold: Belirli skora ulaş
- rewarded_ad: Rewarded ad izle
- daily_login: X gün login yap
- mission_complete: Mission tamamla
- purchase: Coin ile satın al
```

### Skin Manager
```javascript
class SkinManager {
  constructor() {
    this.skins = this.loadSkins();
    this.currentSkin = SaveSystem.get('current_skin', 'default');
  }
  
  loadSkins() {
    // Load from JSON
    return skinsData.skins;
  }
  
  applySkin(skinId) {
    const skin = this.skins.find(s => s.id === skinId);
    
    if (!skin.unlocked) {
      this.showUnlockPrompt(skin);
      return false;
    }
    
    // Apply to all blocks
    Block.setMaterial({
      color: skin.color,
      emissive: skin.emissive,
      metalness: skin.metalness,
      roughness: skin.roughness,
      opacity: skin.opacity
    });
    
    this.currentSkin = skinId;
    SaveSystem.set('current_skin', skinId);
    Analytics.track('skin_selected', { skin_id: skinId });
    
    return true;
  }
  
  unlockSkin(skinId, method) {
    const skin = this.skins.find(s => s.id === skinId);
    skin.unlocked = true;
    
    SaveSystem.set('unlocked_skins', this.getUnlockedSkins());
    Analytics.track('skin_unlocked', {
      skin_id: skinId,
      unlock_method: method
    });
    
    this.showUnlockedPopup(skin);
  }
  
  checkAutoUnlock(score) {
    this.skins.forEach(skin => {
      if (!skin.unlocked && 
          skin.unlockMethod === 'score_threshold' && 
          score >= skin.unlockValue) {
        this.unlockSkin(skin.id, 'score_threshold');
      }
    });
  }
}
```

---

## 2️⃣ TEMA SİSTEMİ

### Tema Tanımı
Tema değiştiğinde:
- Arka plan (sky, color, gradient)
- Işık rengi
- Platform rengi
- Partikül efekti
- Müzik
- UI accent color

### Tema JSON Formatı
```json
{
  "themes": [
    {
      "id": "sky_world",
      "name": "Sky World",
      "unlocked": true,
      "background": {
        "type": "gradient",
        "topColor": "#87CEEB",
        "bottomColor": "#E0F6FF"
      },
      "lightColor": "#FFFFFF",
      "platformColor": "#8B4513",
      "particleColor": "#FFFFFF",
      "musicFile": "ambient_sky.ogg",
      "uiAccent": "#4A90E2"
    },
    {
      "id": "neon_city",
      "name": "Neon City",
      "unlocked": false,
      "unlockMethod": "rewarded_trial",
      "background": {
        "type": "solid",
        "color": "#1A0033"
      },
      "lightColor": "#FF00FF",
      "platformColor": "#00FFFF",
      "particleColor": "#FF00FF",
      "musicFile": "ambient_neon.ogg",
      "uiAccent": "#FF00FF"
    },
    {
      "id": "lava_core",
      "name": "Lava Core",
      "unlocked": false,
      "unlockMethod": "score_threshold",
      "unlockValue": 100,
      "background": {
        "type": "gradient",
        "topColor": "#FF4500",
        "bottomColor": "#8B0000"
      },
      "lightColor": "#FF6347",
      "platformColor": "#2F2F2F",
      "particleColor": "#FF4500",
      "musicFile": "ambient_lava.ogg",
      "uiAccent": "#FF4500"
    }
  ]
}
```

### Theme Manager
```javascript
class ThemeManager {
  constructor() {
    this.themes = this.loadThemes();
    this.currentTheme = SaveSystem.get('current_theme', 'sky_world');
    this.trialUsed = SaveSystem.get('theme_trial_used', {});
  }
  
  applyTheme(themeId) {
    const theme = this.themes.find(t => t.id === themeId);
    
    if (!theme.unlocked) {
      this.showUnlockOptions(theme);
      return false;
    }
    
    // Apply background
    if (theme.background.type === 'gradient') {
      scene.background = new THREE.Color(theme.background.topColor);
      // Add gradient shader if needed
    } else {
      scene.background = new THREE.Color(theme.background.color);
    }
    
    // Apply light color
    directionalLight.color.set(theme.lightColor);
    
    // Apply platform color
    platform.material.color.set(theme.platformColor);
    
    // Apply particle color
    ParticleSystem.setColor(theme.particleColor);
    
    // Change music
    AudioManager.playMusic(theme.musicFile);
    
    // Update UI accent
    document.documentElement.style.setProperty('--accent-color', theme.uiAccent);
    
    this.currentTheme = themeId;
    SaveSystem.set('current_theme', themeId);
    Analytics.track('theme_selected', { theme_id: themeId });
    
    return true;
  }
  
  async tryThemeWithAd(themeId) {
    if (this.trialUsed[themeId]) {
      showToast("You've already tried this theme");
      return false;
    }
    
    const success = await AdsManager.showRewarded('theme_trial');
    
    if (success) {
      this.trialUsed[themeId] = true;
      SaveSystem.set('theme_trial_used', this.trialUsed);
      
      // Apply theme temporarily
      this.applyThemeTemporary(themeId);
      
      Analytics.track('theme_trial_used', { theme_id: themeId });
      
      return true;
    }
    
    return false;
  }
  
  applyThemeTemporary(themeId) {
    // Apply theme for 5 minutes or 3 games
    const expiresAt = Date.now() + (5 * 60 * 1000);
    SaveSystem.set('temp_theme', { id: themeId, expires: expiresAt });
    
    this.applyTheme(themeId);
    
    // Revert after expiry
    setTimeout(() => {
      if (SaveSystem.get('temp_theme')?.id === themeId) {
        this.applyTheme(this.currentTheme);
        showToast("Theme trial ended. Unlock to use permanently!");
      }
    }, 5 * 60 * 1000);
  }
}
```

---

## 3️⃣ UI FLOW

### Main Menu
```
┌─────────────────────┐
│   STACK TOWER 3D    │
│                     │
│   [  PLAY  ]        │
│   [  THEMES ]       │
│   [  SKINS  ]       │
│   [  SETTINGS ]     │
│                     │
│   High Score: 145   │
└─────────────────────┘
```

### Theme Screen
```
┌─────────────────────┐
│   ← THEMES          │
│                     │
│  ┌──┐  ┌──┐  ┌──┐  │
│  │✓ │  │🔒│  │🔒│  │
│  │Sky│  │Neo│  │Lav│ │
│  └──┘  └──┘  └──┘  │
│         ▼           │
│   [Try with Ad]     │
│   Unlock: Score 100 │
│                     │
│   [  APPLY  ]       │
└─────────────────────┘
```

### Skin Screen
```
┌─────────────────────┐
│   ← SKINS           │
│                     │
│  ◄ ┌───────┐ ►      │
│    │ NEON  │        │
│    │ BLUE  │        │
│    │Preview│        │
│    └───────┘        │
│                     │
│  🔒 Unlock with Ad  │
│  [WATCH AD]         │
│                     │
│  [  EQUIP  ]        │
└─────────────────────┘
```

---

## 4️⃣ SOFT LAUNCH İÇİN TEMA SEÇİMİ

### İlk Yayın Temaları (ÖNERİLEN)
1. **Sky World** (default) - Rahatlatıcı, geniş kitle
2. **Neon City** (rewarded trial) - Reklam izletir
3. **Lava Core** (score 100) - Hedef koyar

### Neden Bu Üçlü?
- Sky → Herkes için uygun
- Neon → Ad engagement arttırır
- Lava → Retention için hedef

### Sonradan Eklenecekler
- Ice Realm (score 200)
- Void/Space (premium, IAP)
- Forest (seasonal)

---

## 5️⃣ CHALLENGE MODE

### Mode Tanımı
Ana oyundan ayrı bir mod:
- Günlük/haftalık challenge'lar
- Sabit kurallar (herkes için aynı)
- Özel ödüller

### Challenge Türleri
```json
{
  "challenges": [
    {
      "id": "perfect_10",
      "name": "Perfect Precision",
      "description": "Place 10 perfect blocks in a row",
      "type": "perfect_streak",
      "target": 10,
      "reward": { "type": "skin", "id": "challenge_skin_1" },
      "duration": "daily"
    },
    {
      "id": "windy_tower",
      "name": "Windy Tower",
      "description": "Build a tower of 15 blocks with wind effect",
      "type": "special_condition",
      "condition": "wind_enabled",
      "target": 15,
      "reward": { "type": "coins", "amount": 500 },
      "duration": "daily"
    },
    {
      "id": "time_attack",
      "name": "Time Attack",
      "description": "Reach score 30 in 60 seconds",
      "type": "timed",
      "timeLimit": 60,
      "target": 30,
      "reward": { "type": "theme", "id": "challenge_theme_1" },
      "duration": "weekly"
    },
    {
      "id": "reverse_camera",
      "name": "Reverse View",
      "description": "Build 20 blocks with reversed camera",
      "type": "special_condition",
      "condition": "reverse_camera",
      "target": 20,
      "reward": { "type": "bonus", "name": "shield" },
      "duration": "daily"
    }
  ]
}
```

### Challenge Manager
```javascript
class ChallengeManager {
  constructor() {
    this.challenges = this.loadChallenges();
    this.activeChallenge = this.getTodaysChallenge();
  }
  
  getTodaysChallenge() {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    return this.challenges[dayOfYear % this.challenges.length];
  }
  
  startChallenge(challengeId) {
    const challenge = this.challenges.find(c => c.id === challengeId);
    
    Analytics.track('challenge_start', { challenge_id: challengeId });
    
    // Apply challenge rules
    switch(challenge.type) {
      case 'perfect_streak':
        Game.startChallengeMode({ requirePerfect: true, target: challenge.target });
        break;
      case 'special_condition':
        this.applyCondition(challenge.condition);
        Game.startChallengeMode({ target: challenge.target });
        break;
      case 'timed':
        Game.startChallengeMode({ timeLimit: challenge.timeLimit, target: challenge.target });
        break;
    }
  }
  
  applyCondition(condition) {
    switch(condition) {
      case 'wind_enabled':
        Game.enableWind(2.0); // Wind force
        break;
      case 'reverse_camera':
        CameraController.setReverse(true);
        break;
    }
  }
  
  completeChallenge(challengeId) {
    const challenge = this.challenges.find(c => c.id === challengeId);
    
    Analytics.track('challenge_complete', {
      challenge_id: challengeId,
      reward_type: challenge.reward.type
    });
    
    this.grantReward(challenge.reward);
    this.showCompletionPopup(challenge);
    
    // Mark as completed
    SaveSystem.set(`challenge_completed_${challengeId}`, Date.now());
  }
  
  failChallenge(challengeId) {
    Analytics.track('challenge_fail', { challenge_id: challengeId });
    
    // Show retry with ad option
    this.showRetryPopup(challengeId);
  }
  
  async retryWithAd(challengeId) {
    const success = await AdsManager.showRewarded('challenge_retry');
    
    if (success) {
      Analytics.track('challenge_retry_ad', { challenge_id: challengeId });
      this.startChallenge(challengeId);
    }
  }
}
```

### Challenge UI
```
┌─────────────────────┐
│   DAILY CHALLENGE   │
│                     │
│   🏆 Perfect 10     │
│   Place 10 perfect  │
│   blocks in a row   │
│                     │
│   Reward:           │
│   🎨 Special Skin   │
│                     │
│   [  START  ]       │
│                     │
│   Attempts: 3       │
└─────────────────────┘
```

---

## 6️⃣ MONETİZASYON STRATEJİSİ

### Skin Monetization
```
- Default skins: Free
- Score unlocks: 5 skins (score 50, 100, 150, 200, 250)
- Rewarded ad: 3 skins
- Daily login: 2 skins
- Mission completion: 2 skins
- IAP: 3 premium skins ($0.99 each)
```

### Theme Monetization
```
- Default: Free (Sky World)
- Rewarded trial: Try any locked theme for 5 min
- Score unlock: 2 themes (score 100, 200)
- Daily login streak: 1 theme (7 days)
- IAP: 2 premium themes ($1.99 each)
```

### Challenge Monetization
```
- Free attempts: 3 per day
- Rewarded ad: +1 attempt
- Failed challenge: Retry with ad
```

---

## 7️⃣ ANALYTICS EVENTS (YENİ)

```javascript
// Skin events
Analytics.track('skin_screen_opened');
Analytics.track('skin_preview_viewed', { skin_id });
Analytics.track('skin_unlock_attempt', { skin_id, method });
Analytics.track('skin_unlocked', { skin_id, unlock_method });
Analytics.track('skin_selected', { skin_id });

// Theme events
Analytics.track('theme_screen_opened');
Analytics.track('theme_selected', { theme_id });
Analytics.track('theme_trial_started', { theme_id });
Analytics.track('theme_trial_used', { theme_id });
Analytics.track('theme_unlocked', { theme_id, unlock_method });

// Challenge events
Analytics.track('challenge_screen_opened');
Analytics.track('challenge_start', { challenge_id });
Analytics.track('challenge_complete', { challenge_id, attempts, time_taken });
Analytics.track('challenge_fail', { challenge_id, score_reached });
Analytics.track('challenge_retry_ad', { challenge_id });
```

---

## 8️⃣ STRATEJİK ÖZET

Bu variation pack ile:
- **Aynı oyundan 3 farklı gelir kanalı** (skins, themes, challenges)
- **ASO'da farklı keyword'ler** ("customize", "challenge", "theme")
- **Uzun vadeli LiveOps altyapısı** (günlük/haftalık yeni content)
- **Retention artışı** (unlock hedefleri, streak sistemi)
- **Ad engagement artışı** (trial, retry, unlock mekanikleri)

---

BİTTİ.
