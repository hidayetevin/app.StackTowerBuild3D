# Test Checklist - Stack Tower Build 3D

## Core Gameplay
- [ ] Game loads without white screen
- [ ] Blocks spawn and move left/right
- [ ] Tap places block correctly
- [ ] Perfect placement triggers visual effect
- [ ] Missed placement calculates cut correctly
- [ ] Complete miss triggers Game Over

## Tutorial
- [ ] First run shows "Tap to drop" hint
- [ ] Hint disappears after action
- [ ] Skip button appears after 3 seconds
- [ ] Tutorial completion saves to storage (doesn't show again)

## Audio (Procedural)
- [ ] Tap sound plays on placement
- [ ] Perfect sound plays on alignment
- [ ] Fail sound plays on game over
- [ ] Ambient music loops in background
- [ ] Mute buttons in Settings work
- [ ] Audio resumes after minimizing app/tab

## Monetization & Analytics
- [ ] Banner ad shows in Main Menu
- [ ] Banner ad hides during Gameplay
- [ ] Interstitial ad shows on Game Over (every 3rd time)
- [ ] Offline mode: Game works, no ads, but no crashes
- [ ] Analytics events firing (check console in dev mode)

## Performance
- [ ] 60 FPS on standard play
- [ ] Particles don't cause stutter
- [ ] Restarting game doesn't leak memory (check heap if possible)
- [ ] Resizing window adjusts camera/renderer

## UI/UX
- [ ] Loading screen fades out
- [ ] Settings menu opens/closes
- [ ] Privacy policy link opens
- [ ] Game Over screen shows correct score and best score
