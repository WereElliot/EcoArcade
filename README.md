# 🌍 EcoArcade - Gamified Carbon Footprint Tracker

A extension that gamifies your digital carbon footprint. Track time spent on high-carbon websites, estimate CO₂ emissions, and earn points by completing sustainability quizzes.

## 🎮 Features

- **Carbon Tracking**: Automatically tracks time spent on energy-intensive websites (YouTube, Netflix, Twitch, etc.)
- **Emission Calculation**: Uses real-world emission factors to estimate CO₂ consumption per hour
- **Sustainability Quizzes**: Answer eco-friendly trivia questions to earn points
- **Points System**: Earn points from correct answers to "offset" your digital emissions
- **Achievement Badges**: Unlock badges as you reach milestones
- **Real-time Dashboard**: View your total CO₂ emissions and points earned

## 📦 Project Structure

```
ecoarcade-extension/
├── manifest.json              # Extension configuration & permissions
├── bacckground.js             # Service worker (tracks tabs & emissions)
├── popup/
│   ├── popup.html            # UI layout
│   ├── popup.css             # Arcade-themed styles
│   └── popup.js              # Logic for quiz & UI updates
├── data/
│   ├── emissionFactors.json  # CO₂ per hour for each domain
│   └── quizQuestions.json    # Quiz questions & answers
├── assets/
│   └── icons/                # Extension icons (16x16, 48x48, 128x128)
└── README.md                 # This file
```

## 🚀 Installation

### Load Unpacked in Edge

1. Open Edge and navigate to **Edge://extensions/**
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select the `ecoarcade-extension` folder
5. The extension will appear in your Edge toolbar

### First Run

When the extension first loads, it will:
- Initialize the storage system
- Load emission factors and quiz questions
- Set your initial stats to 0

Click the extension icon to open the popup and start using it!

## 📊 How It Works

### 1. **Carbon Tracking (bacckground.js)**
- Monitors which tabs you have open
- Extracts domain names from visited websites
- Tracks time spent per domain
- Calculates CO₂ emissions using emission factors
- Stores data in Edge's local storage

### 2. **Emission Factors (data/emissionFactors.json)**
Each website has an associated CO₂ emission factor (grams per hour):
- **YouTube**: 150g/hour
- **Netflix**: 200g/hour
- **Twitch**: 180g/hour
- **Instagram**: 120g/hour
- **TikTok**: 160g/hour
- **Default**: 100g/hour (for unlisted sites)

### 3. **Quiz System (popup.js)**
- Loads 10 sustainability questions
- Displays one question at a time with multiple choice options
- Awards points for correct answers
- Shows explanations after each question
- Tracks cumulative points

### 4. **Badges (bacckground.js)**
Automatic badges unlock when you reach milestones:

| Badge | Requirement |
|-------|-------------|
| 👁️ Eco Watcher | 100g CO₂ tracked |
| 📊 Carbon Tracker | 1kg CO₂ tracked |
| 🦸 Environmental Hero | 5kg CO₂ tracked |
| 🎓 Quiz Master | 100 points earned |
| 🧙 Sustainability Guru | 500 points earned |

## 🎯 Quiz Questions

The extension includes 10 pre-loaded questions covering:
- Carbon footprint reduction strategies
- Energy consumption of streaming
- Sustainable transportation
- Eco-friendly tech habits
- Email and data server emissions

Each correct answer awards **10-15 points** depending on difficulty.

## 💾 Data Storage

All data is stored in **Edge's local storage** (persistent per user):
- `totalCO2`: Total grams of CO₂ tracked
- `totalPoints`: Total points earned from quizzes
- `badges`: Array of earned badges
- `sessionData`: Hour-by-hour tracking per domain per day

## 🔧 Customization

### Add More High-Carbon Sites

Edit `data/emissionFactors.json`:
```json
{
  "facebook.com": 140,
  "www.facebook.com": 140,
  "your-site.com": 150,
  "default": 100
}
```

### Add More Quiz Questions

Edit `data/quizQuestions.json`. Each question needs:
```json
{
  "id": 11,
  "question": "Your question?",
  "options": ["Option A", "Option B", "Option C"],
  "correctAnswer": "Option A",
  "points": 10,
  "explanation": "Why is this correct?"
}
```

### Modify Badge Thresholds

Edit the `checkBadges()` function in `bacckground.js`:
```javascript
if (co2 >= 100 && !badges.includes('Eco Watcher')) {
  newBadges.push('Eco Watcher');
}
```

## 🎨 UI/UX Details

- **Arcade Theme**: Vibrant gradient backgrounds with playful emojis
- **Real-time Updates**: Stats refresh every 2 seconds
- **Visual Feedback**: Selected answers highlight, correct/incorrect colors
- **Responsive Design**: Works on different popup sizes
- **Smooth Animations**: Pulse effects, slide-in badges, hover transitions

## 🔐 Privacy & Permissions

The extension requests:
- **tabs**: To track which websites you visit
- **storage**: To save your stats and quiz progress
- **webRequest**: To monitor tab activities

**Data is stored locally only** - nothing is sent to external servers.

## 🐛 Troubleshooting

### Extension not tracking sites
- Ensure you've enabled the extension (visible in toolbar)
- Check that you have the latest version loaded
- Reload the extension at Edge://extensions/

### Quiz questions not appearing
- Verify `quizQuestions.json` exists and is properly formatted
- Check browser console (F12) for error messages
- Try refreshing the popup (close and reopen)

### Stats not updating
- Make sure you have the latest manifest.json
- Clear Edge storage: Settings → Privacy & Security → Clear browsing data
- Reload the extension

## 📝 File Details

### manifest.json
- Declares extension metadata
- Registers permissions and service worker
- Specifies popup and icon locations

### bacckground.js
- Runs continuously in the background
- Tracks active tabs and time spent
- Calculates CO₂ emissions
- Awards badges and responds to quiz submissions

### popup.html
- Main UI structure
- Dashboard section with stats
- Quiz section with Q&A
- Badges display area

### popup.css
- Arcade/gaming aesthetic
- Gradient backgrounds
- Responsive grid layouts
- Smooth animations and transitions

### popup.js
- Handles quiz logic (load, shuffle, validate)
- Updates UI with current stats
- Communicates with background worker
- Manages quiz flow (start, answer, skip, end)

## 🌱 Real-world Impact

While this is a gamified tool, the CO₂ calculations are based on real estimates:
- Streaming video generates ~200-400g CO₂ per hour
- Data centers account for ~2-3% of global electricity use
- Reducing screen time and optimizing streaming quality genuinely reduces carbon footprint

Use EcoArcade to become more aware of your digital habits!

## 📄 License

Open source - feel free to modify and extend!

## 🤝 Contributing

Want to add more features?
- Add new quiz categories
- Expand emission factor database
- Create more badge types
- Improve UI/UX

Simply edit the JSON data files and JavaScript logic!

---

**Happy tracking! Every point counts. 🌱**
