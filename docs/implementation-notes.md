# EcoArcade Implementation Notes

## New Tab Dashboard

- `dashboard.html` is now the extension-owned new tab page through `chrome_url_overrides`.
- The dashboard remains the full React application entry and the central navigation surface.
- The toolbar popup still links into the same full dashboard page.

## Toolbar Carbon Indicator

- The floating page widget is no longer part of the active extension runtime.
- The background worker now updates the toolbar badge using `chrome.action.setBadgeText`.
- Badge text is compact to fit browser constraints and reflects current-tab CO2.
- Badge color is used as the discreet severity signal.

## Popup

- The popup fetches the active-tab-aware dashboard snapshot from the background worker.
- It is intentionally compact and optimized for quick glance behavior.
- It surfaces current carbon, daily total, points, rank, and streak without opening the full dashboard.

## Tracking Model

- Tracking still measures only the active tab.
- Sessions are paused when the browser loses focus or idle state changes away from `active`.
- Emission factors are still loaded from `data/emissionFactors.json`.
- Tracking data remains local via Chrome storage.

## Rank Progression

- Rank labels now follow the current spec through `getRankLabel()`:
  - Recruit
  - Eco Rookie
  - Carbon Crusader
  - Gaia Guardian
  - Climate Steward

## Current External Dependency Gaps

- Gemini needs a real API key and request pipeline.
- Solana needs wallet connection, mint configuration, RPC endpoints, and transaction handling.
- Until those exist in active runtime code, AI and blockchain features should be treated as incomplete.
