# EcoArcade

EcoArcade is a Microsoft Edge extension that estimates browsing-related carbon activity, summarizes site-level usage, and includes short awareness questions with point and rank progression.

## Overview

The extension provides:

- A popup summary for the current browsing session
- A dashboard with totals, site comparisons, milestones, and an explainer section
- A quiz flow that awards points and updates rank progress
- Estimated site activity based on time spent and configured emission factors

## Current behavior

When tracking is enabled, the extension:

- tracks the active tab while the browser is in use
- pauses tracking when the browser loses focus or the device becomes idle
- opens the popup window at browser startup
- opens the popup window when a new tab is created

If you publish this build to Microsoft Edge Add-ons, that popup behavior should be disclosed in the store listing and screenshots.

## Project structure

```text
ecoarcade-extension/
|-- manifest.json
|-- background.js
|-- popup/
|   |-- popup.html
|   |-- popup.css
|   `-- popup.js
|-- dashboard/
|   |-- dashboard.html
|   |-- dashboard.css
|   `-- dashboard.js
|-- data/
|   |-- emissionFactors.json
|   `-- quizQuestionBank.json
`-- assets/
    |-- icons/
    `-- branding/
```

## Load unpacked in Microsoft Edge

1. Open `edge://extensions/`
2. Turn on `Developer mode`
3. Select `Load unpacked`
4. Choose the project folder

## Main files

### `manifest.json`

- Declares extension metadata
- Registers the popup and background service worker
- Declares runtime permissions used by the extension

### `background.js`

- Tracks active-tab browsing time
- Applies idle and focus-based pause logic
- Calculates estimated site-level carbon totals
- Opens the popup window on startup and on new tabs
- Maintains background state in extension storage

### `popup/popup.html`, `popup/popup.css`, `popup/popup.js`

- Show current site activity and totals
- Load awareness questions from the question bank
- Award points and update rank progression
- Link to the full dashboard

### `dashboard/dashboard.html`, `dashboard/dashboard.css`, `dashboard/dashboard.js`

- Show overall totals and tracked-site summaries
- Provide milestone, comparison, and explainer sections
- Link key dashboard cards to deeper parts of the experience

### `data/emissionFactors.json`

- Stores site-level emission factor values used for estimates

### `data/quizQuestionBank.json`

- Stores the seed quiz bank used to generate the popup question pool

## Permissions

The current build uses:

- `tabs`
- `storage`
- `declarativeNetRequest`
- `idle`

These permissions support site tracking, local extension state, YouTube embed request handling, and pause/resume behavior during idle time.

## Microsoft Edge note

This project uses the standard Chromium-compatible extension API namespace in code. It does not need to be rebranded inside source files. What must stay Edge-safe for review is the extension name, description, screenshots, store listing, and other user-facing metadata.

## Publishing note

For Microsoft Edge Add-ons review:

- keep the name and description factual
- avoid references to other browsers in listing metadata
- disclose the automatic popup behavior clearly
- ensure screenshots match the real product behavior

## Related files

- [manifest.json](/C:/Users/USER/Desktop/ecoarcade-%20extension/manifest.json)
- [EDGE_STORE_LISTING.md](/C:/Users/USER/Desktop/ecoarcade-%20extension/EDGE_STORE_LISTING.md)
