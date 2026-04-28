<p align="center">
  <img src="assets/icons/logo-wordmark.png" alt="EcoArcade" width="260">
</p>

# EcoArcade

EcoArcade is a premium Microsoft Edge extension that tracks your browsing carbon impact in real-time, gamifies climate action through eco points and rewards, and provides a unified dashboard for climate awareness, verified actions, and community challenges.

## What the product does

EcoArcade is a climate-focused browser extension with an integrated panel UI featuring:

- **Real-time carbon tracking** of your active tab and daily browsing impact with live CO2 estimates
- **Multi-section dashboard** with Insights, Learn, Act, Community, and Rewards sections
- **Gamification system** with ranks, eco points, streaks, and milestone tracking
- **AI-powered personalized tips** for reducing your digital footprint
- **Eco token rewards** that convert points into verified climate action donations
- **Community features** including leaderboards, live challenges, and shared quests
- **Light/Dark theme support** with persistent user preferences

## Current UI Architecture

The extension now uses a modern React-based panel with five main sections:

### Insights (Home)
- Real-time carbon metrics: today's impact, current tab CO2, total tracked carbon
- Real-world equivalents: compares your CO2 to relatable activities (email, phone charge, latte, video call)
- Progress rings: weekly carbon goal, eco points progress, eco streak tracking
- Rank display and tree equivalent calculation
- AI Climate Guardian with personalized recommendations
- Quick access to other sections

### Learn
- Educational content on digital carbon footprint and climate impact
- Awareness materials and resources

### Act
- Actionable tips for reducing browsing carbon impact
- Low-carbon browsing recommendations with point rewards

### Community
- Live challenges and daily/weekly quests
- Leaderboards and competition tracking
- Verified action submissions with badge rewards
- Community momentum and shared progress

### Rewards
- Eco points to Solana token conversion
- Integration with verified climate projects
- Token-based donations for climate action
- Reward history and redemption tracking

## Tracking behavior

The extension tracks browsing activity with these features:

- **Active tab only**: Tracks only the currently active tab in the focused browser window
- **Pauses on unfocus**: Stops tracking when the browser window loses focus
- **Idle detection**: Pauses tracking when the device becomes idle (configurable detection interval)
- **Real-time metrics**: Provides live CO2 estimates for the current tab and session
- **Persistent storage**: Maintains total CO2, points, badges, and site statistics across sessions
- **History retention**: Stores daily and monthly emissions history (45 days daily, 18 months monthly)
- **Auto-restoration**: Restores tracking state after background service worker restarts
- **Session tracking**: Uses Chrome's session storage for active session state and sync storage for persistent data

The extension also features:

- **Icon badge updates**: Real-time color-coded CO2 indicators (green/low, orange/medium, red/high) on the extension icon
- **Focus-aware pausing**: Badge indicates when tracking is paused due to browser unfocus or idle state

## Rank and streak system

The rank system awards progression based on eco points earned:

- `Eco Rookie`: 100+ points
- `Carbon Crusader`: 500+ points
- `Gaia Guardian`: 1000+ points

Features:

- **Eco Streaks**: Track consecutive days of active browsing with climate awareness
- **Points system**: Awards points based on low-carbon browsing duration and verified actions
- **Milestone tracking**: Shows progress toward next rank milestone
- **Achievement badges**: Unlocks special badges for completing community challenges
- **Leaderboard integration**: Compares progress against community members

## AI and web3 integration

The extension includes advanced features:

- **AI Climate Guardian**: Gemini-powered personalized recommendations based on browsing patterns
- **Web3 Integration**: Blockchain-based token rewards and smart contract interactions
- **Solana tokens**: Converts eco points to Solana-based carbon credit tokens
- **Verified climate projects**: Integration with third-party climate organizations for verified donations

## Project structure

```text
ecoarcade-extension/
|-- manifest.json
|-- background.js
|-- content/
|   `-- content.js
|-- panel/
|   |-- src/
|   |   |-- main.tsx
|   |   |-- App.tsx
|   |   |-- types.ts
|   |   |-- components/
|   |   |   |-- Sidebar.tsx
|   |   |   |-- HomeDashboard.tsx
|   |   |   |-- LearnSection.tsx
|   |   |   |-- ActSection.tsx
|   |   |   |-- CommunitySection.tsx
|   |   |   `-- RewardsSection.tsx
|   |   `-- styles/
|   |   |   `-- global.css
|   |-- panel.html
|   |-- package.json
|   |-- vite.config.ts
|   |-- tailwind.config.js
|   `-- tsconfig.json
|-- data/
|   |-- emissionFactors.json
|   |-- quizQuestionBank.json
|   `-- quizzQuestions.json
|-- services/
|   |-- aiCopilot.js
|   |-- web3Integration.js
|   `-- blockchainMock.js
|-- assets/
|   |-- icons/
|   |-- branding/
|   `-- lib/
`-- README.md
```

## Key files

### `background.js`

The service worker handling core functionality:

- **Tab tracking**: Manages active-tab tracking with real-time CO2 calculations
- **Idle detection**: Monitors device idle state and pauses tracking accordingly
- **Browser focus detection**: Tracks browser window focus state
- **Icon badge updates**: Updates extension icon with color-coded CO2 indicators and tooltips
- **CO2 calculations**: Uses emission factors from `emissionFactors.json` to estimate carbon impact
- **Storage management**: Maintains sync storage for totals/points/stats and local storage for history
- **YouTube embed handling**: Applies declarativeNetRequest rules for proper embed referer headers
- **Alarm scheduling**: Manages periodic badge refresh intervals
- **Message handling**: Responds to requests from panel for stats, dashboard data, and overlay snapshots

### `panel/src/App.tsx`

Main React application component:

- **Multi-section routing**: Manages navigation between Insights, Learn, Act, Community, and Rewards sections
- **Dashboard data loading**: Fetches real-time metrics from background service worker
- **Theme management**: Handles light/dark theme toggle and persistence
- **Header layout**: Premium header with search, rank display, and eco points summary
- **Sidebar navigation**: Responsive navigation with quick stats summary
- **Section rendering**: Conditionally renders appropriate section component based on active tab
- **Responsive grid**: Mobile-first responsive layout using Tailwind CSS

### `panel/src/components/Sidebar.tsx`

Navigation sidebar component:

- **Navigation items**: Five main sections with custom icons
- **Active tab styling**: Visual feedback for current section
- **Theme toggle**: Light/dark mode switcher
- **Quick summary**: Shows today's total carbon and eco points
- **Sticky positioning**: Stays visible while scrolling main content
- **Premium design**: Rounded corners, gradient backgrounds, shadow effects

### `panel/src/components/HomeDashboard.tsx`

Insights/home section component:

- **Real-time metrics**: Displays current tab CO2 and today's total impact
- **Real-world equivalents**: Converts CO2 to relatable activities (email, charge, latte, video call)
- **Progress rings**: Visualizes weekly goal progress, eco points, and streak percentages
- **AI recommendations**: Shows personalized tips from Gemini-powered climate advisor
- **Tree equivalents**: Calculates carbon offset in trees for context
- **Stat cards**: Rank, eco streak, and tree equivalent badges
- **Momentum section**: Quick access cards for Actions, Rewards, and Community features

### `services/aiCopilot.js`

AI-powered recommendation engine:

- Generates personalized climate action tips
- Analyzes browsing patterns for optimization suggestions
- Integrates with Gemini for intelligent recommendations

### `services/web3Integration.js`

Blockchain integration service:

- Manages Solana token conversions
- Handles web3 wallet interactions
- Coordinates with verified climate projects
- Manages token-based donations

## Styling and design

The extension uses:

- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Modern design system**: Rounded corners (16px, 28px, 32px), subtle shadows, and glass-morphism effects
- **Color palette**: Emerald green for eco-themed elements, slate grey for backgrounds, with light/dark mode support
- **Responsive design**: Mobile-first approach with breakpoints for tablet and desktop
- **Typography**: Semibold headers, uppercase tracking for labels, consistent sizing hierarchy

## Permissions

The manifest uses:

- `tabs`: Query and track active tab information for carbon calculations
- `storage`: Sync storage for persistent user data (totals, points, badges, site stats) and local storage for emissions history
- `declarativeNetRequest`: Apply referer header modifications for YouTube embed playback
- `idle`: Detect device idle state to pause tracking during user inactivity
- `alarms`: Schedule periodic badge refresh intervals

Host permissions:

- `https://www.youtube.com/*`: YouTube embed playback support
- `https://www.youtube-nocookie.com/*`: Privacy-focused YouTube embed support

## Building the extension

### Prerequisites

- Node.js 16+ and npm
- bash/shell environment (for Windows, use WSL or Git Bash)

### Development build

```bash
cd panel
npm install
npm run build
```

This generates the panel UI into the `dist` folder, which is loaded by the extension.

### Loading unpacked in Microsoft Edge

1. Open `edge://extensions/`
2. Enable `Developer mode` (toggle in the top-right corner)
3. Click `Load unpacked`
4. Select the project root directory (the folder containing `manifest.json`)
5. The extension appears in your extensions list and toolbar

### Development workflow

During development, rebuild the panel after making changes:

```bash
cd panel
npm run build
```

Hard refresh the extension in `edge://extensions/` or reload the browser to see changes.

## Publishing and distribution

### Key features to highlight for Microsoft Edge Add-ons

When publishing to the Microsoft Edge Add-ons store, ensure listings and screenshots accurately reflect:

- **Real-time carbon tracking**: Active tab CO2 monitoring with live updates
- **Multi-section dashboard**: Unified interface for Insights, Learn, Act, Community, and Rewards
- **Gamification**: Eco points, ranks, streaks, and achievement badges
- **AI recommendations**: Personalized climate tips powered by Gemini
- **Web3 rewards**: Token-based rewards and verified climate donations via Solana
- **Community features**: Challenges, leaderboards, and verified action sharing
- **Theme support**: Beautiful light and dark mode designs
- **Real-world context**: CO2 comparisons to relatable activities (email, phone charge, latte, etc.)
