# Stack / Tower Build 3D  
## Game Design Document (GDD) - UPDATED v2

---

## 1. OYUN GENEL BAKIŞ

**Oyun Adı (Working Title):** Stack / Tower Build 3D  
**Tür:** Hyper-Casual / Arcade  
**Platform:** Android & iOS  
**Motor:** Three.js (WebGL)  
**Wrapper:** Capacitor  
**Hedef Kitle:**  
- 8–45 yaş  
- Casual & hyper-casual oyuncular  
- Kısa süreli, tekrar oynanabilir oyun sevenler

**Ana Amaç:**  
Oyuncu, yatayda hareket eden blokları doğru zamanda bırakarak mümkün olan en yüksek kuleyi inşa etmeye çalışır.

---

## 2. CORE GAMEPLAY LOOP

1. Blok yatay eksende hareket eder  
2. Oyuncu ekrana dokunur  
3. Blok düşer ve alttaki blokla hizalanır  
4. Hizalama değerlendirilir:
   - Perfect (≥95%)
   - Good (70-95%)
   - Bad (<70%)
5. Blok yerleşir / kırpılır  
6. Kamera yukarı çıkar  
7. Hız artar  
8. Hata → Oyun biter → Reklam / Retry

---

## 3. KONTROLLER

- **Tek Dokunuş (Tap)**
- Blok hareketi otomatik
- Oyuncu sadece zamanlamaya odaklanır

---

## 4. MEKANİKLER

### 4.1 Hizalama Sistemi
- %95+ hizalama → Perfect
- %70–95 → Good
- %70 altı → Bad (blok daralır)

### 4.2 Perfect & Combo
- Perfect hit → Combo +1
- 3 Combo → Bonus blok (1.2x genişlik)

### 4.3 Zorluk Artışı
- Blok hızı artar (her 10 blokta +5%)
- Kamera daha hızlı yükselir
- Blok genişliği azalır (max %70'e kadar)

---

## 5. BONUSLAR

| Bonus | Etki | Unlock Yöntemi |
|-------|------|----------------|
| Slow Motion | 1 blok yavaşlar | Rewarded Ad |
| Extra Width | Sonraki blok 1.5x geniş | Rewarded Ad |
| Shield | 1 hata affı | Daily login bonus |

---

## 6. ONBOARDING & FTUE (YENİ)

### İlk Açılış Akışı
```
1. Splash Screen (1s)
2. Tutorial (skippable)
   - Step 1: "Tap to drop block" (hand animation)
   - Step 2: "Align perfectly for combo!"
   - Step 3: "Build the tallest tower!"
3. First Game (assist mode: %20 daha yavaş)
4. Game Over → "Great! Try again?"
```

### Tutorial Tracking
```javascript
TutorialStates:
- NOT_STARTED
- STEP_1_TAP_HINT
- STEP_2_PERFECT_HINT
- STEP_3_COMBO_HINT
- COMPLETED
```

**Atlama Kuralı:** 3 saniye sonra "Skip Tutorial" butonu belirir.

---

## 7. RETENTION MECHANİCS (GENİŞLETİLDİ)

### Daily Login Bonus
```
Day 1: 100 coins
Day 2: Shield bonus
Day 3: New skin unlock
Day 5: Extra width bonus
Day 7: Premium theme unlock
```

### Streak Sistemi
- 3 gün üst üste → Special skin
- 5 gün üst üste → Exclusive theme
- 7 gün üst üste → Legendary skin

### Weekly Missions
```
Mission 1: Place 100 blocks (Reward: 200 coins)
Mission 2: Get 20 perfect hits (Reward: Slow motion bonus)
Mission 3: Reach score 50 (Reward: Random skin)
```

### Social Sharing Incentive
- İlk paylaşım → 1 free skin
- Her paylaşım → 50 coins

---

## 8. GÖRSEL TASARIM

- Minimalist
- Düz renkler
- Gradient arka plan (Sky / Void)
- Glow efekt sadece Perfect anlarında
- Particle effects: Minimal (perfect hit için 10-15 particle)

---

## 9. KAMERA

- Hafif açılı (35° isometric)
- Sadece Y ekseninde hareket
- Smooth lerp (0.1 damping)
- Oyuncu kuleyi her zaman ortada görür

---

## 10. SES & MÜZİK

### Audio Files
```
assets/audio/
 ├── music/
 │   ├── ambient_loop.ogg (loopable, 800KB max)
 │   └── menu_theme.ogg (loopable, 500KB max)
 └── sfx/
     ├── tap.mp3 (5KB)
     ├── perfect.mp3 (8KB)
     ├── combo.mp3 (10KB)
     ├── fail.mp3 (12KB)
     └── ui_click.mp3 (3KB)
```

### Audio Policy Handling
```javascript
// Chrome autoplay workaround
if (AudioContext.state === 'suspended') {
  AudioContext.resume();
}
```

---

## 11. SKOR & PROGRESS

- **Skor** = Yerleştirilen blok sayısı
- **Combo multiplier** → Extra points (combo x 10)
- **High score** → LocalStorage
- **Coin system** → Unlock skins/themes

---

## 12. MONETİZASYON

### Ad Integration (AdMob via Capacitor)
```
admob-plus-capacitor plugin
```

### Ad Types
| Type | Placement | Frequency |
|------|-----------|-----------|
| Banner | Main menu (bottom) | Always visible |
| Interstitial | Game Over | Every 3rd death |
| Rewarded | Continue / Bonuses | User initiated |

### Ad Fallback (OFFLINE/FAIL)
```javascript
if (!adLoaded) {
  // Oyun devam eder
  // "Ad not available" toast (1s)
  // Continue game normally
}
```

### Frequency Capping
- Interstitial: Min 30s cooldown
- Rewarded: No limit (user choice)

---

## 13. ANALYTICS (Firebase)

### Integration
```
@capacitor-firebase/analytics
```

### Event Tracking
```javascript
// Tutorial
tutorial_begin
tutorial_step_complete (step_number)
tutorial_complete
tutorial_skipped

// Gameplay
game_start
block_placed (score, combo, is_perfect)
perfect_hit
combo_achieved (combo_count)
game_over (score, duration_seconds, perfect_hits, max_combo)
level_restart

// Monetization
ad_impression (ad_type, placement)
ad_clicked (ad_type)
rewarded_ad_watched (reward_type)
rewarded_ad_failed (reason)

// Retention
daily_login (streak_days)
mission_started (mission_id)
mission_completed (mission_id)

// Customization
skin_selected (skin_id)
theme_selected (theme_id)
skin_unlocked (skin_id, unlock_method)
theme_unlocked (theme_id, unlock_method)

// Settings
settings_changed (setting_key, setting_value)
audio_toggled (is_enabled)

// Session
session_start
session_end (total_playtime_seconds)
```

---

## 14. PERFORMANCE BUDGET (UPDATED)

### Hard Limits
```
- Draw Calls: < 25
- Triangles: < 6,000 active
- Memory: < 120MB
- FPS: 60 (target), 45 (minimum)
```

### Asset Limits
```
- Textures: 512x512 max, total < 1.5MB
- Audio: Total < 400KB
- Models: 50 vertices per block
- Total bundle size: < 4MB
```

### Optimization Techniques
- Object pooling (max 30 blocks in scene)
- Single material reuse
- No shadows
- Minimal post-processing
- Dispose old blocks

---

## 15. ERROR HANDLING & EDGE CASES

### Network Errors
```javascript
// Ad failed to load
if (adError) {
  console.warn('Ad failed, continuing game');
  proceedWithoutAd();
}
```

### Offline Mode
```javascript
// Game works fully offline
// Only analytics & ads disabled
if (!navigator.onLine) {
  disableAnalytics();
  disableAds();
  showOfflineIndicator(); // Small icon
}
```

### Storage Errors
```javascript
// LocalStorage full
try {
  localStorage.setItem(key, value);
} catch (e) {
  // Fallback to in-memory storage
  memoryStorage[key] = value;
}
```

### Audio Context Blocked
```javascript
// Resume on first user interaction
document.addEventListener('click', () => {
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
}, { once: true });
```

---

## 16. ASSET PIPELINE

### 3D Models
- **Source:** Procedural (BoxGeometry)
- **Format:** Built-in Three.js primitives
- **No external models needed** (hyper-casual approach)

### Textures
- **Format:** PNG (compressed)
- **Size:** 512x512 max
- **Usage:** Minimal (solid colors preferred)

### Audio
- **Music:** OGG (better compression)
- **SFX:** MP3 (wider support)
- **Bitrate:** 96kbps (music), 64kbps (sfx)

---

## 17. PRIVACY & COMPLIANCE

### GDPR (EU Players)
- No explicit consent needed (using legitimate interest)
- Privacy policy link in settings
- No personal data collection

### Privacy Policy
```
Settings Menu → "Privacy Policy" link
Opens: https://yoursite.com/privacy-policy
```

### iOS ATT (App Tracking Transparency)
```
Info.plist:
NSUserTrackingUsageDescription: "We use tracking to show you relevant ads and improve the game."
```

**Request timing:** After tutorial completion

---

## 18. BUILD & DEPLOYMENT

### Version Strategy
```
Format: MAJOR.MINOR.PATCH
Example: 1.0.0 (launch), 1.1.0 (themes), 1.1.1 (bugfix)
```

### Build Flow
```
1. Development (local testing)
   - npm run dev
   - Browser testing

2. Capacitor Sync
   - npx cap sync

3. Android Build
   - Android Studio → Build → Generate Signed Bundle (AAB)
   - Upload to Play Console (Internal Testing)

4. iOS Build
   - Xcode → Archive → Upload to TestFlight
   - Beta test (100 users, 1 week)

5. Production Release
   - Play Store: Gradual rollout (10% → 50% → 100%)
   - App Store: Phased release
```

### Environments
```
- Development (localhost)
- Staging (test ads, debug analytics)
- Production (live ads, live analytics)
```

---

## 19. MVP KAPSAMI (İLK SÜRÜM)

✅ Sonsuz stack mekaniği  
✅ Tutorial (3 steps)  
✅ Skor sistemi  
✅ AdMob entegrasyonu (Banner, Interstitial, Rewarded)  
✅ Firebase Analytics  
✅ Basit UI  
✅ Daily login bonus  
✅ 3 tema (Sky, Neon, Lava)  
✅ 5 skin  
❌ Leaderboard (v1.1.0)  
❌ Challenge mode (v1.2.0)  

---

## 20. BAŞARI KRİTERLERİ (KPI)

### Soft Launch (Turkey, Philippines)
- **D1 Retention:** ≥ 30%
- **D7 Retention:** ≥ 15%
- **Session Length:** ≥ 45s
- **Ad Fill Rate:** ≥ 75%
- **CPI:** < $0.20
- **Daily Ad Impressions/User:** ≥ 4

### Global Launch
- **D1 Retention:** ≥ 35%
- **ARPDAU:** ≥ $0.05
- **Playtime/Session:** ≥ 60s

---

## 21. POST-LAUNCH ROADMAP

### v1.1.0 (Week 4)
- Online leaderboard (Firebase)
- Friend system
- New themes (Ice, Void)

### v1.2.0 (Week 8)
- Challenge mode
- Weekly tournaments
- Clan system (basic)

### v1.3.0 (Week 12)
- Season pass
- Battle pass
- Limited time events

---

## 22. KNOWN LIMITATIONS & FUTURE IMPROVEMENTS

### Technical Debt
```
Phase 1 (MVP):
- Manual physics (AABB only)
- LocalStorage for saves

Phase 2 (Post-launch):
- Consider Cannon.js for realistic physics
- Migrate to IndexedDB for better storage
```

### Performance Optimizations (Future)
```
- Implement LOD (Level of Detail)
- Use instanced rendering for blocks
- Shader optimization pass
```

---

## 23. LOCALIZATION (Future)

### Priority Languages
1. English (default)
2. Turkish
3. Spanish
4. Portuguese
5. Arabic

### Implementation
```javascript
// i18n.js
const strings = {
  en: { play: "Play", retry: "Retry" },
  tr: { play: "Oyna", retry: "Tekrar Dene" }
};
```

---

## 24. ÖZET

Stack / Tower Build 3D, düşük öğrenme eşiği, yüksek tekrar oynanabilirliği ve
hyper-casual monetizasyon modeliyle mobil pazara uygun, Three.js ile rahatça
geliştirilebilecek bir oyundur.

**Güncellenmiş bu versiyon:**
- Tutorial/Onboarding sistemi içerir
- Error handling tanımlanmıştır
- Retention mechanics genişletilmiştir
- Performance budget netleştirilmiştir
- AdMob + Firebase entegrasyonu detaylandırılmıştır
- Build & deployment stratejisi eklenmiştir
- Privacy compliance (temel seviye) eklenmiştir
