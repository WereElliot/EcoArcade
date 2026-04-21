# EcoArcade Daily Dashboard Architecture

## Updated Project Structure

```text
ecoarcade- extension/
├─ assets/
│  ├─ branding/
│  ├─ icons/
│  └─ lib/
├─ content/
│  └─ content.js
├─ contracts/
│  ├─ EcoToken.sol
│  └─ StewardshipNFT.sol
├─ dashboard/
│  ├─ dashboard.css
│  ├─ dashboard.js
│  ├─ explainer.html
│  ├─ index.html
│  ├─ insights.html
│  ├─ stewardship.html
│  └─ wallet.html
├─ data/
│  ├─ emissionFactors.json
│  └─ quizQuestionBank.json
├─ docs/
│  └─ daily-dashboard-architecture.md
├─ panel/
│  ├─ panel.css
│  ├─ panel.html
│  └─ panel.js
├─ popup/
│  ├─ popup.css
│  ├─ popup.html
│  └─ popup.js
├─ services/
│  ├─ aiCopilot.js
│  └─ web3Integration.js
├─ background.js
└─ manifest.json
```

## Main Interface Plan

### 1. Floating Counter Widget
- Inject via `content/content.js` on normal `http` and `https` pages.
- Render inside a shadow DOM so site CSS cannot break it.
- Show:
  - current tab carbon
  - total daily carbon
  - current Eco Points
- Open the main sidebar overlay when clicked.
- Refresh from background snapshots on an interval and after reward events.

### 2. Main Dashboard Overlay
- Load `panel/panel.html` into an iframe-based right sidebar.
- Keep all premium UI styling in `panel/panel.css`.
- Keep all overlay state, rewards, timers, and actions in `panel/panel.js`.
- Let the extension icon trigger the same overlay through `background.js`.

## Tab Breakdown

### Insights
- Today carbon summary
- 7-day trend chart
- AI insight card
- streak and rank progress
- quick stats for points, NFTs, trees planted, and total impact

### Learn
- awareness videos with watch rewards
- article reader with reading-time rewards
- adaptive quiz block
- essay reflection block

### Challenges
- trending and active climate challenges
- global, national, and friends leaderboards
- social sharing card for `#EcoArcadeChallenge`

### Actions
- real-world action form
- EXIF extraction and GPS gating
- AI verification flow
- NFT mint trigger
- recent verified action log

### Rewards
- wallet connection state
- Eco Points to EcoTokens conversion
- native-crypto token purchase
- on-chain donations
- donation history

## Reward Handling

### Reading Time Rewards
- each article defines a `readSeconds` threshold
- reading timer runs only while the Learn tab is open and the page is visible
- once the threshold is met, the article is marked completed and points are awarded once

### Video Watch Rewards
- each awareness video defines `durationSeconds`
- reward threshold is `durationSeconds * 0.7`
- the timer begins only after the user starts a watch session
- each video can only grant points once

### Quiz Rewards
- quiz difficulty is chosen based on current rank
- reward value is tied to difficulty
- only correct answers award points

### Essay Rewards
- if OpenAI is configured, use AI scoring
- otherwise use a local rubric fallback
- successful submissions grant one reward event and are tracked in daily progress

### Real-world Action Rewards
- require image upload
- require GPS latitude, longitude, and original timestamp from EXIF
- block resubmission by hashing uploaded proofs
- after verification, mint action NFT and award action points

## Real Integration Requirements

### AI
- store `openAIApiKey` in `chrome.storage.local`
- optional `openAIModel` override can also be stored locally

### Web3
- store these in `chrome.storage.local`:
  - `ecoTokenAddress`
  - `stewardshipAddress`
  - `climateProjectAddress`
- supported target chains:
  - Polygon
  - Base

## Notes
- The sidebar overlay is now the primary interface.
- The old popup is no longer the main flow.
- The dashboard pages under `dashboard/` remain available as supporting extension pages while the overlay matures.
