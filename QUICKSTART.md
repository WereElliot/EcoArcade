# EcoArcade - Quick Start Guide

## ✅ Installation Steps

### 1. Load the Extension in Chrome

1. Open **Chrome** (version 88+)
2. Navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle switch in top right corner)
4. Click **Load unpacked**
5. Select the folder: `C:\Users\USER\Desktop\ecoarcade- extension`
6. The extension will appear in your toolbar with the 🌍 icon

### 2. First Run

When you click the extension icon, you'll see:
- **CO₂ Emitted**: 0g (starts tracking when you visit high-carbon sites)
- **Points Earned**: 0 (earn points by answering quiz questions)
- **Start Quiz** button to begin the sustainability quiz

### 3. How to Use

#### Tracking Your Carbon Footprint
- Simply browse normally - the extension tracks time on energy-intensive sites
- Visit YouTube, Netflix, Twitch, Instagram, TikTok, etc.
- The background worker calculates CO₂ emissions automatically
- Check the popup anytime to see your total

#### Taking Quizzes
1. Click **Start Quiz** button
2. Read the question and select your answer
3. Click **Submit Answer** to see if you're correct
4. Correct answers earn **10-15 points**
5. Points are "offset credits" against your CO₂ emissions
6. Continue through all questions or click **Skip**

#### Earning Badges
- 👁️ **Eco Watcher**: Track 100g of CO₂
- 📊 **Carbon Tracker**: Track 1kg of CO₂
- 🦸 **Environmental Hero**: Track 5kg of CO₂
- 🎓 **Quiz Master**: Earn 100 points
- 🧙 **Sustainability Guru**: Earn 500 points

## 📁 Complete File Structure

```
ecoarcade- extension/
│
├── manifest.json                 # Extension configuration
│                                 # - Declares permissions (tabs, storage)
│                                 # - Registers service worker
│                                 # - Specifies popup and icons
│
├── bacckground.js                # Service Worker (runs in background)
│                                 # - Tracks active tabs
│                                 # - Calculates CO₂ emissions
│                                 # - Manages badges
│                                 # - Handles quiz submissions
│
├── popup/
│   ├── popup.html               # Main UI structure
│   │                             # - Header with title
│   │                             # - Stats dashboard (CO₂ & points)
│   │                             # - Badges display
│   │                             # - Quiz section
│   │                             # - Footer
│   │
│   ├── popup.css                # Arcade-themed styling
│   │                             # - Vibrant gradients
│   │                             # - Smooth animations
│   │                             # - Responsive layout
│   │
│   └── popup.js                 # Popup logic
│                                 # - Quiz flow management
│                                 # - Stats display
│                                 # - Question shuffling
│                                 # - Communication with background worker
│
├── data/
│   ├── emissionFactors.json     # CO₂ per hour by domain
│   │                             # - YouTube: 150g/h
│   │                             # - Netflix: 200g/h
│   │                             # - Twitch: 180g/h
│   │                             # - 20+ other popular sites
│   │                             # - Default: 100g/h
│   │
│   └── quizQuestions.json       # 10 sustainability quiz questions
│                                 # - Each with 3 options
│                                 # - Points awarded (10-15)
│                                 # - Explanations for learning
│
├── assets/
│   └── icons/
│       ├── icon16.svg           # 16x16 extension icon
│       ├── icon48.svg           # 48x48 toolbar icon
│       └── icon128.svg          # 128x128 store icon
│
└── README.md                     # Full documentation
```

## 🔧 Customization

### Add More High-Carbon Sites

Edit `data/emissionFactors.json`:
```json
{
  "facebook.com": 140,
  "linkedin.com": 90,
  "amazon.com": 110,
  "default": 100
}
```

### Add More Quiz Questions

Edit `data/quizQuestions.json`. Add a new question object:
```json
{
  "id": 11,
  "question": "Your new question?",
  "options": ["Option A", "Option B", "Option C"],
  "correctAnswer": "Option A",
  "points": 10,
  "explanation": "Why is Option A correct?"
}
```

### Change Badge Thresholds

Edit the `checkBadges()` function in `bacckground.js`:
```javascript
if (co2 >= 50 && !badges.includes('Eco Watcher')) {  // Changed from 100
  newBadges.push('Eco Watcher');
}
```

## 🧪 Testing the Extension

### Test Tracking
1. Open multiple high-carbon sites (YouTube, Netflix)
2. Wait a few seconds
3. Click extension popup
4. You should see CO₂ increasing

### Test Quiz
1. Click "Start Quiz"
2. Select an answer
3. Click "Submit Answer"
4. Check that points update correctly

### Test Badges
1. Complete all 10 quiz questions (get at least 100 points)
2. Check for "Quiz Master" badge
3. (5kg CO₂ tracking takes real time, but threshold is in code)

### View Background Worker Logs
1. Go to `chrome://extensions/`
2. Find "EcoArcade"
3. Click "Inspect views" → "service_worker"
4. See console logs with tracking info

## 🐛 Troubleshooting

### Extension icon doesn't appear
- Make sure you loaded the unpacked extension
- Refresh chrome://extensions/
- Check for errors in the popup console (F12)

### Not tracking websites
- Check that tab tracking is working: visit youtube.com, wait 10 seconds, check CO₂
- Ensure "tabs" permission is in manifest.json
- Check service worker logs

### Quiz not loading
- Verify `quizQuestions.json` is valid JSON (use a JSON validator)
- Check console for error messages
- Reload extension at chrome://extensions/

### Points not adding
- Ensure background.js is loaded (check service worker status)
- Verify quiz questions have correct "correctAnswer" format
- Check if message passing works (console should show "Added X points")

## 📊 How It Works (Technical)

### Tab Tracking Flow
```
User switches tabs
    ↓
background.js detects onActivated event
    ↓
Extracts domain from URL
    ↓
Saves previous tab's session (time + CO₂)
    ↓
Updates Chrome storage
    ↓
popup.js reads storage and displays
```

### Quiz Flow
```
User clicks "Start Quiz"
    ↓
popup.js loads quizQuestions.json
    ↓
Shuffles options randomly
    ↓
User selects answer and clicks Submit
    ↓
popup.js validates against correctAnswer
    ↓
Sends message to background.js with points
    ↓
background.js adds points and checks badges
    ↓
popup.js updates display
```

## 🔐 Privacy

- **No external servers**: Everything stays on your computer
- **No data collection**: We don't send your usage data anywhere
- **Local storage only**: Uses Chrome's built-in storage API
- **Clear anytime**: Go to Settings → Privacy → Clear browsing data

## 📝 Notes

- The extension tracks **actual time** on websites
- CO₂ calculations are based on **real research** into data center emissions
- Points are meant as a gamification mechanic - they don't literally offset CO₂
- But the awareness helps you make better digital consumption choices!

## 🚀 Next Steps

1. **Load the extension** using the steps above
2. **Browse normally** - let it track for a few hours
3. **Take the quiz** to earn points
4. **Share with friends** to spread eco-awareness!

---

**Questions?** Check the full README.md for detailed information about each component.

**Ready to go?** Open chrome://extensions/ and load the unpacked folder! 🌱
