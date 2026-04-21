(function initEcoArcadeWidget() {
    if (window.top !== window.self) {
        return;
    }

    const ROOT_ID = 'ecoarcade-widget-root';
    if (document.getElementById(ROOT_ID)) {
        return;
    }

    const host = document.createElement('div');
    host.id = ROOT_ID;
    document.documentElement.appendChild(host);

    const shadow = host.attachShadow({ mode: 'open' });
    const iconUrl = chrome.runtime.getURL('assets/icons/icon16.png');
    let refreshTimer = null;

    shadow.innerHTML = `
        <style>
            :host {
                all: initial;
            }

            .ecoarcade-widget {
                position: fixed;
                top: 16px;
                right: 16px;
                z-index: 2147483646;
                font-family: Inter, "Segoe UI", system-ui, sans-serif;
                pointer-events: none;
            }

            .ecoarcade-card {
                display: grid;
                grid-template-columns: 1fr;
                gap: 10px;
                min-width: 232px;
                max-width: 282px;
                padding: 14px 16px;
                border-radius: 28px;
                border: 1px solid rgba(94, 188, 103, 0.18);
                background: rgba(9, 22, 29, 0.92);
                color: #eef8f2;
                box-shadow: 0 24px 60px rgba(0, 0, 0, 0.26);
                backdrop-filter: blur(16px);
                -webkit-backdrop-filter: blur(16px);
                transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
                pointer-events: auto;
            }

            .ecoarcade-card:hover {
                transform: translateY(-2px);
                border-color: rgba(94, 188, 103, 0.32);
                box-shadow: 0 28px 72px rgba(0, 0, 0, 0.3);
            }

            .ecoarcade-headline {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 10px;
            }

            .ecoarcade-mark {
                width: 30px;
                height: 30px;
                border-radius: 999px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(135deg, rgba(94, 188, 103, 0.24), rgba(84, 213, 157, 0.16));
                flex-shrink: 0;
            }

            .ecoarcade-mark img {
                width: 16px;
                height: 16px;
                display: block;
            }

            .ecoarcade-title {
                font-size: 12px;
                letter-spacing: 0.2em;
                text-transform: uppercase;
                color: rgba(193, 243, 210, 0.82);
            }

            .ecoarcade-stats {
                display: grid;
                grid-template-columns: repeat(3, minmax(0, 1fr));
                gap: 10px;
            }

            .ecoarcade-cell {
                display: flex;
                flex-direction: column;
                gap: 4px;
                padding: 10px 12px;
                border-radius: 18px;
                background: rgba(255, 255, 255, 0.04);
                border: 1px solid rgba(255, 255, 255, 0.06);
            }

            .ecoarcade-label {
                font-size: 10px;
                text-transform: uppercase;
                letter-spacing: 0.18em;
                color: rgba(173, 241, 191, 0.72);
            }

            .ecoarcade-value {
                font-size: 14px;
                font-weight: 700;
                line-height: 1.1;
                color: #f5fff7;
                animation: pulse 3s ease-in-out infinite;
            }

            .ecoarcade-note {
                font-size: 10px;
                color: rgba(220, 241, 220, 0.72);
                line-height: 1.4;
            }

            .ecoarcade-pill {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                padding: 4px 10px;
                border-radius: 999px;
                background: rgba(94, 188, 103, 0.14);
                color: #b8f2c4;
                font-size: 10px;
                text-transform: uppercase;
                letter-spacing: 0.18em;
            }

            @keyframes pulse {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.92; transform: scale(1.01); }
            }

            @media (prefers-color-scheme: light) {
                .ecoarcade-card {
                    background: rgba(245, 250, 242, 0.95);
                    color: #113022;
                    border-color: rgba(38, 166, 91, 0.16);
                    box-shadow: 0 24px 60px rgba(14, 27, 16, 0.14);
                }

                .ecoarcade-cell {
                    background: rgba(255, 255, 255, 0.85);
                    border-color: rgba(38, 166, 91, 0.08);
                }

                .ecoarcade-title,
                .ecoarcade-label,
                .ecoarcade-note {
                    color: rgba(36, 54, 35, 0.78);
                }

                .ecoarcade-value {
                    color: #0f3722;
                }
            }

            @media (max-width: 700px) {
                .ecoarcade-widget {
                    top: 12px;
                    right: 12px;
                }

                .ecoarcade-card {
                    min-width: 220px;
                }

                .ecoarcade-stats {
                    grid-template-columns: 1fr;
                }
            }
        </style>
        <div class="ecoarcade-widget">
            <button class="ecoarcade-card" type="button" aria-label="Open EcoArcade dashboard">
                <div class="ecoarcade-headline">
                    <span class="ecoarcade-mark">
                        <img src="${iconUrl}" alt="EcoArcade logo" />
                    </span>
                    <span class="ecoarcade-title">EcoArcade Live</span>
                    <span class="ecoarcade-pill">Browse mode</span>
                </div>
                <div class="ecoarcade-stats">
                    <div class="ecoarcade-cell">
                        <span class="ecoarcade-label">This tab</span>
                        <span class="ecoarcade-value" id="widgetTabValue">0g</span>
                        <span class="ecoarcade-note">Current tab emissions</span>
                    </div>
                    <div class="ecoarcade-cell">
                        <span class="ecoarcade-label">Today</span>
                        <span class="ecoarcade-value" id="widgetDailyValue">0g</span>
                        <span class="ecoarcade-note">Daily total carbon</span>
                    </div>
                    <div class="ecoarcade-cell">
                        <span class="ecoarcade-label">Eco points</span>
                        <span class="ecoarcade-value" id="widgetPointsValue">0</span>
                        <span class="ecoarcade-note">Reward balance</span>
                    </div>
                </div>
            </button>
        </div>
    `;

    const button = shadow.querySelector('.ecoarcade-widget-button');
    const value = shadow.querySelector('.ecoarcade-value');

    function formatCO2(grams) {
        if (!grams || grams < 0.05) {
            return '0g';
        }

        if (grams >= 1000) {
            return `${(grams / 1000).toFixed(1)}kg`;
        }

        if (grams >= 100) {
            return `${Math.round(grams)}g`;
        }

        return `${grams.toFixed(1)}g`;
    }

    const tabValue = shadow.querySelector('#widgetTabValue');
    const dailyValue = shadow.querySelector('#widgetDailyValue');
    const pointsValue = shadow.querySelector('#widgetPointsValue');

    function renderSnapshot(snapshot) {
        const currentValue = formatCO2(snapshot.currentTabCO2 || 0);
        const dailyTotal = formatCO2(snapshot.dailyCO2 || 0);
        const pointsTotal = snapshot.totalPoints || 0;

        if (tabValue) tabValue.textContent = currentValue;
        if (dailyValue) dailyValue.textContent = dailyTotal;
        if (pointsValue) pointsValue.textContent = pointsTotal.toString();

        button.title = snapshot.trackingEnabled === false
            ? 'EcoArcade tracking is paused.'
            : `${snapshot.currentDomain || 'This page'} | This tab: ${currentValue} | Today: ${dailyTotal} | Week: ${formatCO2(snapshot.weeklyCO2 || 0)} | Points: ${pointsTotal}`;
    }

    async function refreshSnapshot() {
        try {
            const snapshot = await chrome.runtime.sendMessage({
                action: 'getOverlaySnapshot',
                pageUrl: window.location.href
            });

            if (snapshot) {
                renderSnapshot(snapshot);
            }
        } catch (error) {
            console.warn('EcoArcade: widget snapshot could not be refreshed.', error);
        }
    }

    function startPolling() {
        if (refreshTimer !== null) {
            return;
        }

        refreshTimer = window.setInterval(() => {
            void refreshSnapshot();
        }, 10000);
    }

    function stopPolling() {
        if (refreshTimer === null) {
            return;
        }

        window.clearInterval(refreshTimer);
        refreshTimer = null;
    }

    button.addEventListener('click', () => {
        void chrome.runtime.sendMessage({ action: 'openEcoArcadeDashboard' });
    });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopPolling();
            return;
        }

        startPolling();
        void refreshSnapshot();
    });

    startPolling();
    void refreshSnapshot();
})();
