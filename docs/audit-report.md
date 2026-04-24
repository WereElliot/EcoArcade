# EcoArcade Audit Report

## Scope

Audit date: 2026-04-24  
Workspace: `C:\Users\USER\Desktop\ecoarcade- extension`

This audit compares the active MV3 code in `src/`, `public/manifest.json`, `dashboard.html`, and `popup.html` against the current EcoArcade product specification.

## High-Risk Findings

### 1. New-tab ownership was missing

- The extension did not override the browser new tab page.
- The main dashboard only opened when explicitly launched.
- Result: the central-hub UX described in the spec was not implemented.

### 2. The old floating carbon widget was still active

- A content script mounted `src/content/overlay/FloatingCounter.tsx` on web pages.
- This directly conflicted with the new requirement to remove the floating widget entirely.

### 3. Toolbar icon behavior did not match the spec

- There was no live toolbar badge for current-tab CO2.
- The popup did not reliably resolve the active browsing tab when opened.
- Rank was not displayed in the quick-glance popup.

### 4. Several major product areas were still local-state stand-ins

- `Act` used filename and extension checks instead of real GPS extraction plus Gemini Vision verification.
- `Rewards` converted points in local storage only and had no real Solana wallet or SPL token transaction flow.
- `Community` progress and rankings were local-state only.
- `Learn` contained curated content, but not the 1,000+ adaptive quiz pipeline, watch-progress gating, or AI-graded reflections.

### 5. Feature naming and progression were incomplete

- Rank labels did not match the current spec.
- The current flow stopped at `Gaia Guardian` and used a non-spec starter label.

## Fixed In This Pass

### Extension shell and navigation

- Added `chrome_url_overrides.newtab` so `dashboard.html` becomes the new tab experience.
- Kept the toolbar popup as a compact quick-glance surface.
- Updated popup behavior so `Open full dashboard` always opens a new dashboard tab.

### Removed runtime use of the floating widget

- Removed the content-script entry from the active build path.
- Removed the content script registration from `public/manifest.json`.
- Removed the runtime message contract for overlay snapshots.

### Toolbar icon now acts as the carbon indicator

- Added live `chrome.action` badge updates in the background worker.
- Badge text now reflects current-tab CO2 in a compact format.
- Badge color shifts with impact level.
- Action tooltip now includes current domain, current-tab CO2, daily CO2, and current rank.

### Popup now matches the compact-glance spec more closely

- Popup now shows:
  - current site CO2
  - today total carbon
  - Eco Points
  - current rank
  - streak
  - quick button to open the full dashboard
- Popup resolves the active focused tab even though the popup itself has no tab context.

### Rank labels aligned with spec

- Added support for:
  - `Recruit`
  - `Eco Rookie`
  - `Carbon Crusader`
  - `Gaia Guardian`
  - `Climate Steward`

## Still Missing Or Not Yet Production-Real

These are not being marked complete because there is no honest way to call them fully functional yet:

### AI / Gemini

- No live Gemini API client is currently wired into the shipping `src/` runtime.
- No production prompt orchestration exists yet for:
  - personalized insights
  - adaptive quiz generation
  - essay grading
  - image verification chat flow

### Solana

- No live wallet connection flow exists yet for Phantom or Solflare.
- No SPL token mint or transfer logic exists in the active extension runtime.
- No NFT mint flow exists in the active extension runtime.
- No on-chain transaction history or leaderboard aggregation exists.

### Learn earning enforcement

- Videos are curated and selectable, but not yet gated by >=70% verified watch completion.
- Articles are displayed in-app, but actual timed reading reward enforcement is not yet implemented.
- Quizzes exist, but not from a 1,000+ adaptive question bank in the shipping runtime.
- Reflection prompts exist, but not AI-graded.

### Act verification

- No EXIF GPS parsing pipeline exists in active `src/`.
- No duplicate-proof protection exists beyond simple current-state logic.
- No Gemini Vision or NFT minting handoff exists.

### Community and rewards

- Leaderboards are not live global/national/friends boards.
- Team creation and social share flows are not implemented.
- Donations are still local-state only.
- On-chain donation recording is not implemented.

## Recommended Next Implementation Order

1. Add real service modules for Gemini and Solana with strict config validation.
2. Replace local Learn completion with verified watch-time, read-time, quiz-bank, and essay scoring flows.
3. Replace Act proof submission with EXIF extraction, duplicate detection, Gemini Vision verification, and NFT minting.
4. Replace local token conversion and donation actions with wallet-driven Solana transactions.
5. Add live leaderboards and challenge sync based on local plus on-chain events.

## Files Changed In This Pass

- `public/manifest.json`
- `vite.config.ts`
- `src/background/index.ts`
- `src/background/sessionTracker.ts`
- `src/features/carbon/scoring.ts`
- `src/popup/App.tsx`
- `src/popup/styles.css`
- `src/services/messaging/contracts.ts`
- `src/sidepanel/components/TopBar.tsx`
- `src/sidepanel/config.ts`
