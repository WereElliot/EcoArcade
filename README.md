<p align="center">
  <img src="assets/icons/logo-wordmark.png" alt="EcoArcade" width="260">
</p>

# EcoArcade

EcoArcade is a Microsoft Edge extension that estimates browsing-related carbon activity, tracks time spent on sites, and uses quizzes, milestones, and a dashboard to build digital carbon awareness.

## What the product does

EcoArcade currently includes two main surfaces:

- A popup window that shows the current site, time on the active site, estimated site CO2, total tracked CO2, eco points, current rank, the next milestone, one awareness question, and unlocked achievements.
- A full dashboard that shows an overview, impact summaries, site comparisons, tracked-site breakdowns, contextual reference panels, a curated awareness-video section, and a long-form explainer on digital carbon footprint.

## Current experience

### Popup

The popup experience includes:

- current active-site summary
- time spent on the current site
- estimated CO2 for the current site
- total tracked carbon and eco points
- rank and next milestone progress
- one quiz question at a time
- unlocked badges
- a shortcut to the full dashboard

### Dashboard

The dashboard includes:

- a top bar with tracking status, rank, points, theme toggle, and responsive compact controls
- a collapsible left navigation rail
- a home area with a rotating digital-carbon awareness video
- insight cards that link to other parts of the dashboard or popup flow
- site-level tables for tracked domains, time spent, estimated CO2, and impact level
- comparison bars for global, Kenya, and tracked browsing benchmarks
- an explainer block that describes the lifecycle and impact of digital activity
- light and dark theme support

## Tracking behavior

The current build tracks browsing activity using these rules:

- tracks the active tab only
- pauses when the browser loses focus
- pauses when the device becomes idle
- stores site totals and overall totals in extension storage
- restores tracking state after background restarts where possible

The current build also opens the popup window automatically:

- at browser startup
- when a new tab is opened

That behavior is part of the live product and should be disclosed anywhere the extension is distributed.

## Quiz and rank system

The popup quiz currently:

- builds a 1,000-question playable pool from the seed bank in `data/quizQuestionBank.json`
- adjusts question difficulty based on the user's rank
- awards points by difficulty
- updates milestone progress and rank display

The current ranks are:

- `Recruit`
- `Eco Rookie`
- `Carbon Crusader`
- `Gaia Guardian`

## Awareness and dashboard content

The dashboard currently includes:

- curated YouTube-based awareness videos selected from a fixed list
- a site-impact summary driven by tracked browsing data
- contextual comparison against global and Kenya daily values
- a bottom explainer section covering the screen, delivery through networks, and the data-center engine room

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
|-- assets/
|   |-- icons/
|   `-- branding/
`-- content/
    `-- content.js
```

## Key files

### `background.js`

- manages active-tab tracking
- pauses tracking on idle and focus loss
- maintains popup-window auto-open behavior
- calculates site and total CO2 estimates
- maintains runtime storage state
- applies YouTube embed request-header rules

### `popup/popup.js`

- loads quiz data
- renders current site tracking stats
- applies rank and milestone logic
- awards points and checks badges
- opens the full dashboard

### `dashboard/dashboard.js`

- renders dashboard totals and site summaries
- powers shortcuts between cards and sections
- loads awareness videos
- handles theme switching
- updates rank and comparison displays

## Permissions

The current manifest uses:

- `tabs`
- `storage`
- `declarativeNetRequest`
- `idle`

These support tab tracking, local state, YouTube embed request handling, and idle-based pause logic.

## Load unpacked in Microsoft Edge

1. Open `edge://extensions/`
2. Turn on `Developer mode`
3. Select `Load unpacked`
4. Choose the project folder

## Publishing note

For Microsoft Edge Add-ons review, make sure the listing and screenshots accurately reflect:

- active-tab tracking
- site-level carbon estimates
- quiz, rank, and milestone behavior
- automatic popup-window behavior on startup and new tabs
- dashboard video and explainer content

## Related files

- [manifest.json](/C:/Users/USER/Desktop/ecoarcade-%20extension/manifest.json)
- [EDGE_STORE_LISTING.md](/C:/Users/USER/Desktop/ecoarcade-%20extension/EDGE_STORE_LISTING.md)
