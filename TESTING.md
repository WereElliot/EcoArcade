# EcoArcade - Installation & Verification Checklist

## 📋 Pre-Installation Requirements

- [ ] Chrome browser version 88 or higher
- [ ] Extension folder at: `C:\Users\USER\Desktop\ecoarcade- extension`
- [ ] All files present (see file inventory below)

## 📁 File Inventory (Quick Check)

```
ecoarcade- extension/
├── ✅ manifest.json
├── ✅ bacckground.js
├── ✅ README.md
├── ✅ QUICKSTART.md
├── popup/
│   ├── ✅ popup.html
│   ├── ✅ popup.css
│   └── ✅ popup.js
├── data/
│   ├── ✅ emissionFactors.json
│   └── ✅ quizQuestions.json
└── assets/icons/
    ├── ✅ icon16.svg
    ├── ✅ icon48.svg
    └── ✅ icon128.svg
```

All 12 files should be present.

## 🚀 Installation Steps

### Step 1: Open Chrome Extensions Page
- [ ] Open Chrome browser
- [ ] Type `chrome://extensions/` in address bar
- [ ] Press Enter

### Step 2: Enable Developer Mode
- [ ] Look for "Developer mode" toggle (top right corner)
- [ ] Click the toggle to enable it
- [ ] Page should refresh with new options

### Step 3: Load Unpacked Extension
- [ ] Click "Load unpacked" button
- [ ] Navigate to folder: `C:\Users\USER\Desktop\ecoarcade- extension`
- [ ] Click "Select Folder"
- [ ] Wait for extension to load

### Step 4: Verify Installation
- [ ] Extension appears in the list (should say "EcoArcade")
- [ ] Extension ID appears (e.g., "dpkjf...xyz")
- [ ] 🌍 Icon appears in Chrome toolbar (top right)

## ✅ Post-Installation Verification

### Test 1: Extension Opens
- [ ] Click the 🌍 icon in toolbar
- [ ] Popup window opens
- [ ] Shows "EcoArcade" title
- [ ] Shows "Gamify Your Carbon Footprint" tagline

### Test 2: UI Elements Visible
- [ ] Dashboard section shows:
  - [ ] "CO₂ Emitted: 0g"
  - [ ] "Points Earned: 0"
- [ ] Badges section shows:
  - [ ] "🏆 Badges" header
  - [ ] "Complete quizzes to earn badges!" message
- [ ] Quiz section shows:
  - [ ] "🎮 Sustainability Quiz" header
  - [ ] "Ready to offset your emissions?" message
  - [ ] "Start Quiz" button
- [ ] Footer shows "Every point counts! 🌱"

### Test 3: Start Quiz
- [ ] Click "Start Quiz" button
- [ ] Popup shows first question
- [ ] Question has text like "Which action reduces..."
- [ ] 3 radio button options appear
- [ ] "Submit Answer" and "Skip Question" buttons appear

### Test 4: Quiz Interaction
- [ ] Select an answer (click radio button)
- [ ] Selected option highlights
- [ ] Click "Submit Answer"
- [ ] Result message appears (✅ Correct or ❌ Incorrect)
- [ ] Explanation text appears
- [ ] "Next Question" button appears
- [ ] Click "Next Question"
- [ ] Next question loads

### Test 5: Complete Quiz
- [ ] Continue through multiple questions
- [ ] After final question, see "Quiz Complete!" message
- [ ] "Play Again" button appears
- [ ] Stats should show updated points

### Test 6: Verify Background Worker
- [ ] Go to `chrome://extensions/`
- [ ] Find "EcoArcade" in the list
- [ ] Click "Inspect views" → "service_worker"
- [ ] DevTools console opens
- [ ] Should see "EcoArcade initialized" message

### Test 7: Verify Carbon Tracking
- [ ] Close the popup
- [ ] Open a new tab with YouTube (`youtube.com`)
- [ ] Wait 15-20 seconds on the site
- [ ] Click extension popup again
- [ ] CO₂ value should be higher than 0
- [ ] Should show something like "0g" or "25mg"

### Test 8: Check Console for Errors
- [ ] Open popup
- [ ] Press F12 to open DevTools
- [ ] Click "Console" tab
- [ ] Should see messages like:
  - [ ] "Loaded 10 quiz questions"
  - [ ] No red error messages
- [ ] Check for warnings (yellow)

## 🧪 Advanced Testing

### Test A: Tab Switching Tracking
1. [ ] Keep popup open
2. [ ] Open multiple tabs (YouTube, Netflix, Reddit)
3. [ ] Switch between tabs rapidly
4. [ ] Watch CO₂ value update
5. [ ] Spend 30 seconds on each
6. [ ] Close popup and reopen
7. [ ] Verify CO₂ accumulated correctly

### Test B: Quiz Points Accumulation
1. [ ] Start new quiz
2. [ ] Answer first 3 questions correctly
3. [ ] Check points after each
4. [ ] Points should accumulate (10-15 per question)
5. [ ] Example: 10 + 15 + 10 = 35 points

### Test C: Badge Unlocking
1. [ ] Complete the quiz fully (10 questions)
2. [ ] Get all correct (150 points)
3. [ ] Check "Quiz Master" badge appears
4. [ ] Badge should have 🎓 emoji

### Test D: Data Persistence
1. [ ] Earn some points (take quiz)
2. [ ] Close the popup
3. [ ] Close Chrome completely
4. [ ] Reopen Chrome
5. [ ] Click extension
6. [ ] Points should still be there

### Test E: Console Logging
1. [ ] Open DevTools (F12)
2. [ ] Click "Console" tab
3. [ ] Switch tabs while on YouTube
4. [ ] Should see: "Tracking tab: youtube.com"
5. [ ] Check DevTools → Sources → Service Worker
6. [ ] Look for emission calculations in console

## 🎨 Visual Verification

### Colors & Styling
- [ ] Header has purple-to-red gradient
- [ ] Dashboard cards have white background
- [ ] Stat icons (💨 and ⭐) display correctly
- [ ] Buttons have purple gradient
- [ ] Quiz options have blue borders when selected
- [ ] Correct answers show green background
- [ ] Incorrect answers show red background

### Typography
- [ ] Title "EcoArcade" is large and bold
- [ ] Tagline "Gamify Your Carbon Footprint" is smaller
- [ ] Stats are clearly readable
- [ ] Quiz questions are readable
- [ ] No text overflow or wrapping issues

### Animations
- [ ] Title pulses (should see slight grow/shrink)
- [ ] Buttons have hover effects (darken slightly)
- [ ] Cards have hover effects (lift up slightly)
- [ ] Badges slide in when earned

## 🔧 Troubleshooting Verification

If tests fail, check:

### Extension doesn't load
- [ ] Verify folder path is correct
- [ ] Check manifest.json is valid (use JSON validator)
- [ ] Look for red errors in chrome://extensions/

### No CO₂ tracking
- [ ] Ensure "tabs" permission in manifest
- [ ] Check service worker is running (Inspect views)
- [ ] Verify emission factors JSON is valid
- [ ] Wait 30+ seconds on a site

### Quiz doesn't start
- [ ] Verify quizQuestions.json is valid
- [ ] Check console for "Loaded X quiz questions" message
- [ ] Ensure popup.js loads without errors

### Points don't update
- [ ] Check background worker console
- [ ] Verify chrome.storage is not blocked
- [ ] Try answering question again
- [ ] Check for "Added X points" in console

### Buttons don't work
- [ ] Open DevTools console
- [ ] Should see click events
- [ ] Check for JavaScript errors
- [ ] Verify popup.js loads completely

## 📊 Performance Expectations

### First Load
- [ ] Extension loads in < 1 second
- [ ] Popup opens in < 500ms
- [ ] Quiz questions load in < 1 second
- [ ] No lag when clicking buttons

### Runtime
- [ ] Stats update every 2 seconds
- [ ] No memory leaks (DevTools → Memory)
- [ ] Service worker stays responsive
- [ ] CPU usage minimal when idle

## 🎯 Functionality Matrix

| Feature | Expected Behavior | Status |
|---------|------------------|--------|
| Extension Icon | Shows in toolbar | [ ] ✅ |
| Popup Opens | Shows dashboard | [ ] ✅ |
| Dashboard | Displays CO₂ & points | [ ] ✅ |
| Start Quiz | Quiz begins | [ ] ✅ |
| Load Question | Question + options | [ ] ✅ |
| Submit Answer | Shows result | [ ] ✅ |
| Points Award | Updates on correct | [ ] ✅ |
| Quiz Complete | All 10 questions load | [ ] ✅ |
| Badge System | Badges appear | [ ] ✅ |
| Tab Tracking | CO₂ increases | [ ] ✅ |
| Data Persist | Survives close | [ ] ✅ |

## 🎉 Success Criteria

✅ **Installation Successful If:**
- Extension loads without errors
- All UI elements visible
- Quiz questions load and display
- User can select and submit answers
- Points accumulate
- CO₂ tracking increases over time
- Data persists after browser restart
- No console errors (only warnings okay)
- Extension responds to all interactions

## 📝 Notes for Support

If reporting issues:
1. Share error message from console (F12)
2. Include Chrome version (chrome://version/)
3. Include extension ID
4. Note steps to reproduce
5. Check extension isn't using incognito mode

## ✨ You're Ready!

If all tests pass, your EcoArcade extension is working perfectly. 

**Next Steps:**
1. Start browsing normally - it tracks automatically
2. Take quizzes to earn points
3. Unlock badges by hitting milestones
4. Watch your carbon footprint grow (awareness step!)
5. Share with friends

---

**Questions?** See:
- README.md for detailed documentation
- QUICKSTART.md for usage guide
- Console logs for debugging

**Happy tracking! 🌍**
