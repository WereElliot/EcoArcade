# EcoArcade Rebuild Architecture

## Rebuild direction

EcoArcade will be rebuilt as a clean Manifest V3 browser extension with a single TypeScript codebase, a React dashboard, shared domain logic, and explicit service boundaries for AI, carbon tracking, rewards, and Solana integrations.

The current repository mixes:

- legacy extension scripts at the root
- a newer React dashboard in `panel/`
- mock blockchain services
- deleted dashboard/popup assets still referenced by git history

The new target structure below replaces that with a single build pipeline and a clear separation between extension entry points and reusable application modules.

## Target folder structure

```text
ecoarcade-extension/
├─ assets/
│  ├─ branding/
│  ├─ icons/
│  └─ illustrations/
├─ config/
│  ├─ env.example.ts
│  ├─ featureFlags.ts
│  └─ solana.ts
├─ docs/
│  ├─ product/
│  │  ├─ user-flow.md
│  │  └─ gamification-model.md
│  ├─ technical/
│  │  ├─ architecture.md
│  │  ├─ state-model.md
│  │  ├─ messaging-contracts.md
│  │  └─ security-and-privacy.md
│  └─ rebuild-architecture.md
├─ public/
│  ├─ manifest.json
│  └─ sidepanel.html
├─ scripts/
│  ├─ build-manifest.ts
│  ├─ copy-assets.ts
│  └─ package-extension.ts
├─ src/
│  ├─ background/
│  │  ├─ index.ts
│  │  ├─ alarms.ts
│  │  ├─ messaging.ts
│  │  ├─ sessionTracker.ts
│  │  ├─ badge.ts
│  │  └─ rules.ts
│  ├─ content/
│  │  ├─ index.ts
│  │  ├─ overlay/
│  │  │  ├─ FloatingCounter.tsx
│  │  │  ├─ OverlayRoot.tsx
│  │  │  └─ overlay.css
│  │  └─ bridge.ts
│  ├─ sidepanel/
│  │  ├─ main.tsx
│  │  ├─ App.tsx
│  │  ├─ routes/
│  │  │  ├─ InsightsPage.tsx
│  │  │  ├─ LearnPage.tsx
│  │  │  ├─ ActPage.tsx
│  │  │  ├─ CommunityPage.tsx
│  │  │  └─ RewardsPage.tsx
│  │  ├─ layout/
│  │  │  ├─ Shell.tsx
│  │  │  ├─ Sidebar.tsx
│  │  │  ├─ TopBar.tsx
│  │  │  └─ CommandBar.tsx
│  │  ├─ sections/
│  │  │  ├─ insights/
│  │  │  ├─ learn/
│  │  │  ├─ act/
│  │  │  ├─ community/
│  │  │  └─ rewards/
│  │  └─ styles/
│  │     └─ globals.css
│  ├─ components/
│  │  ├─ cards/
│  │  ├─ charts/
│  │  ├─ feedback/
│  │  ├─ forms/
│  │  └─ motion/
│  ├─ features/
│  │  ├─ carbon/
│  │  │  ├─ calculators/
│  │  │  ├─ formatters.ts
│  │  │  ├─ scoring.ts
│  │  │  └─ selectors.ts
│  │  ├─ guardian/
│  │  │  ├─ geminiClient.ts
│  │  │  ├─ prompts.ts
│  │  │  └─ insightMapper.ts
│  │  ├─ learn/
│  │  │  ├─ contentCatalog.ts
│  │  │  ├─ readingRewards.ts
│  │  │  └─ quizEngine.ts
│  │  ├─ actions/
│  │  │  ├─ imageVerification.ts
│  │  │  ├─ gpsMetadata.ts
│  │  │  ├─ nftMinting.ts
│  │  │  └─ actionRewards.ts
│  │  ├─ community/
│  │  │  ├─ challenges.ts
│  │  │  ├─ leaderboards.ts
│  │  │  └─ campaigns.ts
│  │  └─ rewards/
│  │     ├─ tokenConversion.ts
│  │     ├─ donationCatalog.ts
│  │     └─ walletSync.ts
│  ├─ services/
│  │  ├─ storage/
│  │  │  ├─ chromeStorage.ts
│  │  │  ├─ migrations.ts
│  │  │  └─ keys.ts
│  │  ├─ messaging/
│  │  │  ├─ contracts.ts
│  │  │  └─ runtimeBus.ts
│  │  ├─ solana/
│  │  │  ├─ connection.ts
│  │  │  ├─ wallet.ts
│  │  │  ├─ ecotoken.ts
│  │  │  └─ actionNft.ts
│  │  ├─ analytics/
│  │  │  └─ events.ts
│  │  └─ api/
│  │     ├─ climateProjects.ts
│  │     └─ learningContent.ts
│  ├─ state/
│  │  ├─ store.ts
│  │  ├─ slices/
│  │  │  ├─ carbonSlice.ts
│  │  │  ├─ profileSlice.ts
│  │  │  ├─ learningSlice.ts
│  │  │  ├─ communitySlice.ts
│  │  │  └─ rewardsSlice.ts
│  │  └─ selectors/
│  ├─ types/
│  │  ├─ chrome.ts
│  │  ├─ domain.ts
│  │  ├─ api.ts
│  │  └─ wallet.ts
│  ├─ utils/
│  │  ├─ dates.ts
│  │  ├─ formatters.ts
│  │  ├─ guards.ts
│  │  ├─ ids.ts
│  │  └─ urls.ts
│  └─ test/
│     ├─ unit/
│     ├─ integration/
│     └─ fixtures/
├─ data/
│  ├─ emissionFactors.json
│  ├─ quizQuestions.json
│  ├─ learningSeed.json
│  ├─ challengeSeed.json
│  └─ donationPartners.json
├─ package.json
├─ tsconfig.json
├─ vite.config.ts
├─ tailwind.config.ts
├─ postcss.config.js
└─ .gitignore
```

## Surface ownership

- `src/background`: session tracking, alarms, badges, extension action, and global message handling
- `src/content`: injected floating counter and page-level runtime bridge
- `src/sidepanel`: premium daily.dev-inspired dashboard opened from the extension action
- `src/features`: business logic for carbon, learning, actions, community, rewards, and AI guardian
- `src/services`: platform and external integrations such as Chrome storage, Solana, Gemini, and API access
- `src/state`: normalized app state and derived selectors shared by the sidepanel and content overlay

## Why this structure fixes the current damage

- removes split ownership between legacy root scripts and the `panel/` app
- prevents UI regressions by keeping visual components separate from business logic
- makes background/content/dashboard communication explicit through message contracts
- allows Solana and Gemini work to be isolated behind adapters instead of leaking into UI components
- gives us room for real testing around carbon calculations, reward logic, and extension messaging

## Floating counter implementation plan

### Goal

Provide a minimal, elegant, always-available carbon widget in the top-right of every normal web page without blocking page interactions.

### Build plan

1. Create `src/content/index.ts` as the single content-script entry.
2. Mount a Shadow DOM root so the widget is fully style-isolated from websites.
3. Render `FloatingCounter.tsx` with React for easier state, animation, and consistent formatting.
4. Poll or subscribe to background snapshot updates using typed runtime messages.
5. Display exactly three metrics:
   - current tab CO2
   - daily carbon total
   - Eco Points
6. Make the surface compact by default, with:
   - soft glassmorphism
   - small carbon pulse indicator
   - reduced mobile width
   - safe-area offsets
7. Clicking the widget opens the sidepanel dashboard.
8. Respect page context and user state:
   - skip if inside iframes
   - pause updates when tab is hidden
   - show a passive paused state if tracking is disabled

### Data flow

- content script asks background for `overlaySnapshot`
- background builds live session metrics from active tracking state
- shared formatter converts grams to `g` or `kg`
- component updates values with gentle number transitions

### Quality gates

- no global CSS leakage
- no console errors on restricted pages
- no duplicate widgets per page
- keyboard accessible
- stable on narrow screens

## Main React dashboard implementation plan

### Goal

Open a stunning right-side extension dashboard that feels premium, focused, and fast while covering the entire EcoArcade product journey.

### IA and routing

Primary routes:

- `Insights`
- `Learn`
- `Act`
- `Community`
- `Rewards`

Secondary shell elements:

- persistent left navigation
- top command/search bar
- profile and rank summary
- context-aware AI Guardian panel

### Page-by-page build plan

#### Insights

- hero cards for current tab impact, today total, weekly trend, and Eco Points
- streak counter, level progress, and next rank ladder
- AI Guardian message generated from browsing behavior and progress state
- trend charts for daily and category emissions
- quick actions such as low-bandwidth mode tips and challenge prompts

#### Learn

- content feed with videos, articles, and quizzes
- timed reading and watch completion tracking
- reflection card with short text submission
- point rewards based on completion, time, and correctness

#### Act

- image upload flow with EXIF/GPS extraction
- Gemini-powered verification summary
- human-readable evidence result
- Solana NFT mint confirmation and reward payout state
- retry and fallback handling when metadata is missing or insufficient

#### Community

- challenge cards with progress meters
- leaderboard list
- campaign detail cards
- join/leave challenge actions

#### Rewards

- Eco Points to EcoToken conversion
- wallet connection state
- token purchase flow
- donation cards for verified climate projects in Kenya and Africa
- transaction history and claim status

### Dashboard technical plan

1. Rebuild the app shell in `src/sidepanel/layout`.
2. Move all mock data access behind services and typed feature modules.
3. Centralize dashboard state in `src/state`.
4. Use dedicated route sections so each page can be tested independently.
5. Define message contracts between sidepanel and background for:
   - live carbon data
   - point totals
   - badge and streak state
   - challenge updates
   - reward conversions
6. Isolate external providers:
   - Gemini in `features/guardian` and `features/actions`
   - Solana in `services/solana`
7. Add loading, empty, success, and error states for every major card.

### Design direction

- dark-mode first
- soft earth palette: forest, moss, sand, basalt, mist
- strong type hierarchy and editorial card composition
- layered gradients, subtle grid textures, and restrained motion
- premium rounded geometry without looking toy-like

### Smooth user flow expectations

- extension icon opens the same dashboard surface every time
- floating counter numbers match dashboard totals
- actions and rewards update points immediately after success
- leaderboard and challenge joins feel instant with optimistic UI
- users always understand what to do next through guardian guidance and CTA placement

## Build phases

### Phase 1

- clean MV3 scaffolding
- manifest generation
- background tracking rewrite
- floating counter rewrite
- sidepanel shell and Insights page

### Phase 2

- Learn system
- Community system
- state persistence and migrations
- richer charts and trends

### Phase 3

- Gemini insight generation
- image verification pipeline
- Solana wallet, EcoToken, and NFT flows
- donation and rewards transactions

### Phase 4

- test coverage
- accessibility pass
- performance hardening
- production packaging and store readiness

## Immediate next build step

Replace the current mixed root-and-panel setup with a unified root TypeScript workspace, then migrate the existing tracking logic and panel UI into the new `src/` structure feature by feature.
