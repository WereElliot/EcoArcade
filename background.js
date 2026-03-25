// EcoArcade Background Service Worker - 1.1.1
// FIXED: Reliable session tracking and sync storage support

let emissionFactors = {};

const DEFAULT_EMISSION_FACTOR = 60;
const TRACKING_STATE_KEY = 'trackingState';
const TRACKING_ENABLED_KEY = 'trackingEnabled';
const SHOW_POPUP_ON_STARTUP_KEY = 'showPopupOnStartup';
const STARTUP_POPUP_PENDING_KEY = 'startupPopupPending';
const YOUTUBE_EMBED_RULE_IDS = [1001, 1002];
const IDLE_DETECTION_INTERVAL_SECONDS = 15;
const IDLE_DETECTION_INTERVAL_MS = IDLE_DETECTION_INTERVAL_SECONDS * 1000;
const STARTUP_POPUP_WIDTH = 620;
const STARTUP_POPUP_HEIGHT = 840;
const POPUP_PAGE_URL = chrome.runtime.getURL('popup/popup.html');

let currentIdleState = 'active';
let isBrowserFocused = true;
let trackingEnabled = true;
let showPopupOnStartup = true;
let startupPopupPending = false;

fetch(chrome.runtime.getURL('data/emissionFactors.json'))
    .then((response) => response.json())
    .then((data) => {
        emissionFactors = data;
        console.log('EcoArcade: Emission data loaded.');
    })
    .catch((error) => console.error('EcoArcade: Load Error', error));

chrome.runtime.onInstalled.addListener((details) => {
    void initializeExtension(details);
});

chrome.runtime.onStartup.addListener(() => {
    void restoreRuntimeState();
});

chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync') {
        return;
    }

    if (changes[TRACKING_ENABLED_KEY]) {
        trackingEnabled = changes[TRACKING_ENABLED_KEY].newValue !== false;
    }

    if (changes[SHOW_POPUP_ON_STARTUP_KEY]) {
        showPopupOnStartup = changes[SHOW_POPUP_ON_STARTUP_KEY].newValue !== false;
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getStats') {
        void respondWithStats(sendResponse);
        return true;
    }

    if (request.action === 'getDashboardData') {
        void respondWithDashboardData(sendResponse);
        return true;
    }

    if (request.action === 'checkBadges') {
        void checkBadges(sendResponse);
        return true;
    }

    return false;
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && tab.active) {
        void handleTabContextChange(tabId, tab.url);
    }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
    void handleActivatedTab(activeInfo.tabId);
});

chrome.tabs.onCreated.addListener((tab) => {
    void handleTabCreated(tab);
});

chrome.tabs.onRemoved.addListener((tabId) => {
    void handleTabRemoved(tabId);
});

chrome.windows.onFocusChanged.addListener((windowId) => {
    void handleWindowFocusChanged(windowId);
});

chrome.windows.onCreated.addListener(() => {
    void maybeOpenPendingStartupPopup();
});

chrome.idle.onStateChanged.addListener((newState) => {
    void handleIdleStateChange(newState);
});

void ensureYouTubeEmbedRefererRules();

async function initializeExtension(details) {
    await ensureYouTubeEmbedRefererRules();
    await initializeIdleTracking();
    await refreshBrowserFocusState();
    await ensureRuntimePreferences({ forceTrackingEnabled: true });
    await chrome.action.enable();

    const data = await chrome.storage.sync.get(['totalCO2', 'totalPoints', 'badges', 'siteStats']);
    const updates = {};

    if (data.totalCO2 === undefined) updates.totalCO2 = 0;
    if (data.totalPoints === undefined) updates.totalPoints = 0;
    if (!Array.isArray(data.badges)) updates.badges = [];
    if (!data.siteStats) updates.siteStats = {};

    if (Object.keys(updates).length) {
        await chrome.storage.sync.set(updates);
    }

    await restoreTrackingForFocusedTab();

    if (details?.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        await scheduleStartupPopup();
    }
}

async function restoreRuntimeState() {
    await ensureYouTubeEmbedRefererRules();
    await initializeIdleTracking();
    await refreshBrowserFocusState();
    await ensureRuntimePreferences({ forceTrackingEnabled: true });
    await chrome.action.enable();
    await restoreTrackingForFocusedTab();
    await scheduleStartupPopup();
}

async function respondWithStats(sendResponse) {
    try {
        const snapshot = await buildStatsSnapshot();
        sendResponse({
            totalCO2: snapshot.totalCO2,
            totalPoints: snapshot.totalPoints,
            badges: snapshot.badges
        });
    } catch (error) {
        console.error('EcoArcade: Failed to build stats snapshot.', error);
        sendResponse({ totalCO2: 0, totalPoints: 0, badges: [] });
    }
}

async function respondWithDashboardData(sendResponse) {
    try {
        const snapshot = await buildStatsSnapshot();
        sendResponse(snapshot);
    } catch (error) {
        console.error('EcoArcade: Failed to build dashboard snapshot.', error);
        sendResponse({
            totalCO2: 0,
            totalPoints: 0,
            badges: [],
            siteStats: {}
        });
    }
}

async function checkBadges(sendResponse) {
    const data = await chrome.storage.sync.get(['totalPoints', 'badges']);
    const points = data.totalPoints || 0;
    const badges = Array.isArray(data.badges) ? [...data.badges] : [];
    let newBadge = false;

    if (points >= 100 && !badges.includes('Eco Rookie')) {
        badges.push('Eco Rookie');
        newBadge = true;
    }

    if (points >= 500 && !badges.includes('Carbon Crusader')) {
        badges.push('Carbon Crusader');
        newBadge = true;
    }

    if (points >= 1000 && !badges.includes('Gaia Guardian')) {
        badges.push('Gaia Guardian');
        newBadge = true;
    }

    if (newBadge) {
        await chrome.storage.sync.set({ badges });
    }

    sendResponse({ success: true, badges });
}

async function handleActivatedTab(tabId) {
    try {
        const tab = await chrome.tabs.get(tabId);
        await handleTabContextChange(tabId, tab.url);
    } catch (error) {
        console.warn('EcoArcade: Could not read activated tab.', error);
    }
}

async function handleTabCreated(tab) {
    if (!trackingEnabled) {
        return;
    }

    const tabUrl = tab.pendingUrl || tab.url || '';
    if (!isAutoPopupNewTab(tabUrl)) {
        return;
    }

    try {
        const window = await chrome.windows.get(tab.windowId);
        if (window?.type !== 'normal') {
            return;
        }
    } catch (error) {
        console.warn('EcoArcade: Could not inspect newly created tab window.', error);
        return;
    }

    await openOrFocusPopupWindow();
}

async function handleWindowFocusChanged(windowId) {
    isBrowserFocused = windowId !== chrome.windows.WINDOW_ID_NONE;

    await maybeOpenPendingStartupPopup();

    if (windowId === chrome.windows.WINDOW_ID_NONE) {
        await finalizeTrackingSession();
        return;
    }

    const tabs = await chrome.tabs.query({ active: true, windowId });
    const activeTab = tabs.find((tab) => Boolean(tab.url));

    if (activeTab?.url) {
        await handleTabContextChange(activeTab.id, activeTab.url);
        return;
    }

    await finalizeTrackingSession();
}

async function handleTabRemoved(tabId) {
    const trackingState = await getTrackingState();
    if (trackingState?.activeTabId === tabId) {
        await finalizeTrackingSession();
    }
}

async function handleTabContextChange(tabId, url) {
    await refreshBrowserFocusState();

    if (!trackingEnabled) {
        await finalizeTrackingSession();
        return;
    }

    if (!isBrowserFocused || currentIdleState !== 'active') {
        await finalizeTrackingSession(getSessionEndTimeForIdleState(currentIdleState));
        return;
    }

    const domain = getDomain(url);

    if (!domain) {
        await finalizeTrackingSession();
        return;
    }

    await startTrackingSession(tabId, url);
}

async function startTrackingSession(tabId, url) {
    if (!trackingEnabled || !isBrowserFocused || currentIdleState !== 'active') {
        return;
    }

    const existingState = await getTrackingState();

    if (existingState?.activeTabId === tabId && existingState?.currentUrl === url) {
        return;
    }

    if (existingState) {
        await finalizeTrackingSession();
    }

    await setTrackingState({
        activeTabId: tabId,
        currentUrl: url,
        startTime: Date.now()
    });
}

async function finalizeTrackingSession(endTime = Date.now()) {
    const trackingState = await getTrackingState();
    if (!trackingState?.startTime || !trackingState.currentUrl) {
        await clearTrackingState();
        return;
    }

    const sessionMetrics = buildSessionMetrics(trackingState, endTime);
    if (!sessionMetrics) {
        await clearTrackingState();
        return;
    }

    const data = await chrome.storage.sync.get(['totalCO2', 'siteStats']);
    const totalCO2 = (data.totalCO2 || 0) + sessionMetrics.co2;
    const siteStats = cloneSiteStats(data.siteStats || {});

    applySessionToSiteStats(siteStats, sessionMetrics);

    await chrome.storage.sync.set({ totalCO2, siteStats });
    await clearTrackingState();
}

async function restoreTrackingForFocusedTab() {
    await refreshBrowserFocusState();

    if (!trackingEnabled) {
        await finalizeTrackingSession();
        return;
    }

    if (!isBrowserFocused || currentIdleState !== 'active') {
        await finalizeTrackingSession(getSessionEndTimeForIdleState(currentIdleState));
        return;
    }

    const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    const activeTab = tabs.find((tab) => Boolean(tab.url));

    if (activeTab?.url) {
        await handleTabContextChange(activeTab.id, activeTab.url);
        return;
    }

    await finalizeTrackingSession();
}

async function buildStatsSnapshot() {
    const syncData = await chrome.storage.sync.get(['totalCO2', 'totalPoints', 'badges', 'siteStats']);
    const snapshot = {
        totalCO2: syncData.totalCO2 || 0,
        totalPoints: syncData.totalPoints || 0,
        badges: Array.isArray(syncData.badges) ? syncData.badges : [],
        siteStats: cloneSiteStats(syncData.siteStats || {})
    };

    currentIdleState = await chrome.idle.queryState(IDLE_DETECTION_INTERVAL_SECONDS);
    await refreshBrowserFocusState();
    const trackingState = await getTrackingState();
    const sessionMetrics = trackingEnabled && isBrowserFocused
        ? buildSessionMetrics(trackingState, getSessionEndTimeForIdleState(currentIdleState))
        : null;

    if (!sessionMetrics) {
        return snapshot;
    }

    snapshot.totalCO2 += sessionMetrics.co2;
    applySessionToSiteStats(snapshot.siteStats, sessionMetrics);

    return snapshot;
}

function buildSessionMetrics(trackingState, endTime) {
    if (!trackingState?.startTime || !trackingState.currentUrl) {
        return null;
    }

    const domain = getDomain(trackingState.currentUrl);
    if (!domain) {
        return null;
    }

    const durationMs = Math.max(0, endTime - trackingState.startTime);
    if (durationMs < 1000) {
        return null;
    }

    const durationHrs = durationMs / (1000 * 60 * 60);
    const co2 = getEmissionFactor(domain) * durationHrs;

    return { domain, durationMs, co2 };
}

function applySessionToSiteStats(siteStats, sessionMetrics) {
    const existingStats = siteStats[sessionMetrics.domain] || { time: 0, co2: 0 };

    siteStats[sessionMetrics.domain] = {
        time: existingStats.time + sessionMetrics.durationMs,
        co2: existingStats.co2 + sessionMetrics.co2
    };
}

function cloneSiteStats(siteStats) {
    return Object.fromEntries(
        Object.entries(siteStats).map(([domain, stats]) => [
            domain,
            {
                time: stats.time || 0,
                co2: stats.co2 || 0
            }
        ])
    );
}

function getEmissionFactor(domain) {
    return emissionFactors[domain] || emissionFactors.default || DEFAULT_EMISSION_FACTOR;
}

async function initializeIdleTracking() {
    chrome.idle.setDetectionInterval(IDLE_DETECTION_INTERVAL_SECONDS);
    currentIdleState = await chrome.idle.queryState(IDLE_DETECTION_INTERVAL_SECONDS);
}

async function ensureRuntimePreferences({ forceTrackingEnabled = false } = {}) {
    const data = await chrome.storage.sync.get([TRACKING_ENABLED_KEY, SHOW_POPUP_ON_STARTUP_KEY]);
    const updates = {};

    if (data[SHOW_POPUP_ON_STARTUP_KEY] === undefined) {
        updates[SHOW_POPUP_ON_STARTUP_KEY] = true;
        showPopupOnStartup = true;
    } else {
        showPopupOnStartup = data[SHOW_POPUP_ON_STARTUP_KEY] !== false;
    }

    if (forceTrackingEnabled || data[TRACKING_ENABLED_KEY] === undefined) {
        updates[TRACKING_ENABLED_KEY] = true;
        trackingEnabled = true;
    } else {
        trackingEnabled = data[TRACKING_ENABLED_KEY] !== false;
    }

    if (Object.keys(updates).length) {
        await chrome.storage.sync.set(updates);
    }
}

async function scheduleStartupPopup() {
    if (!showPopupOnStartup) {
        await setStartupPopupPending(false);
        return;
    }

    await setStartupPopupPending(true);
    await maybeOpenPendingStartupPopup();
}

async function maybeOpenPendingStartupPopup() {
    startupPopupPending = await getStartupPopupPending();

    if (!showPopupOnStartup || !startupPopupPending) {
        return;
    }

    if (await focusExistingPopupWindow()) {
        await setStartupPopupPending(false);
        return;
    }

    const hasNormalWindow = await hasNormalBrowserWindow();
    if (!hasNormalWindow) {
        return;
    }

    try {
        await openOrFocusPopupWindow();
        await setStartupPopupPending(false);
    } catch (error) {
        console.error('EcoArcade: could not open the startup popup window.', error);
    }
}

async function openOrFocusPopupWindow() {
    if (await focusExistingPopupWindow()) {
        return;
    }

    await chrome.windows.create({
        url: POPUP_PAGE_URL,
        type: 'popup',
        width: STARTUP_POPUP_WIDTH,
        height: STARTUP_POPUP_HEIGHT,
        focused: true
    });
}

async function focusExistingPopupWindow() {
    const popupTab = await findPopupPageTab();

    if (!popupTab) {
        return false;
    }

    try {
        await chrome.windows.update(popupTab.windowId, { focused: true });
        await chrome.tabs.update(popupTab.id, { active: true });
        await chrome.tabs.reload(popupTab.id);
        return true;
    } catch (error) {
        console.warn('EcoArcade: could not focus existing popup window.', error);
        return false;
    }
}

async function findPopupPageTab() {
    try {
        const tabs = await chrome.tabs.query({});
        return tabs.find((tab) => typeof tab.url === 'string' && tab.url.startsWith(POPUP_PAGE_URL)) || null;
    } catch (error) {
        console.warn('EcoArcade: could not inspect existing popup pages.', error);
        return null;
    }
}

function isAutoPopupNewTab(tabUrl) {
    if (typeof tabUrl !== 'string') {
        return false;
    }

    if (tabUrl.startsWith(POPUP_PAGE_URL) || tabUrl.startsWith(chrome.runtime.getURL('dashboard/'))) {
        return false;
    }

    return tabUrl === '' || tabUrl === 'about:blank' || tabUrl === 'chrome://newtab/' || tabUrl === 'chrome://newtab';
}

async function hasNormalBrowserWindow() {
    try {
        const windows = await chrome.windows.getAll();
        return windows.some((win) => win.type === 'normal');
    } catch (error) {
        console.warn('EcoArcade: could not inspect browser windows.', error);
        return false;
    }
}

async function getStartupPopupPending() {
    try {
        const data = await chrome.storage.session.get(STARTUP_POPUP_PENDING_KEY);
        return Boolean(data[STARTUP_POPUP_PENDING_KEY]);
    } catch (error) {
        console.warn('EcoArcade: could not read startup popup state.', error);
        return startupPopupPending;
    }
}

async function setStartupPopupPending(value) {
    startupPopupPending = value;

    try {
        if (value) {
            await chrome.storage.session.set({ [STARTUP_POPUP_PENDING_KEY]: true });
        } else {
            await chrome.storage.session.remove(STARTUP_POPUP_PENDING_KEY);
        }
    } catch (error) {
        console.warn('EcoArcade: could not persist startup popup state.', error);
    }
}

async function refreshBrowserFocusState() {
    try {
        const lastFocusedWindow = await chrome.windows.getLastFocused();
        isBrowserFocused = Boolean(lastFocusedWindow?.focused) && lastFocusedWindow?.id !== chrome.windows.WINDOW_ID_NONE;
    } catch (error) {
        console.warn('EcoArcade: Could not refresh browser focus state.', error);
    }
}

async function handleIdleStateChange(newState) {
    currentIdleState = newState;

    if (newState === 'active') {
        await restoreTrackingForFocusedTab();
        return;
    }

    await finalizeTrackingSession(getSessionEndTimeForIdleState(newState));
}

function getSessionEndTimeForIdleState(idleState) {
    if (idleState === 'idle') {
        return Date.now() - IDLE_DETECTION_INTERVAL_MS;
    }

    return Date.now();
}

async function getTrackingState() {
    const data = await chrome.storage.session.get(TRACKING_STATE_KEY);
    return data[TRACKING_STATE_KEY] || null;
}

async function setTrackingState(state) {
    await chrome.storage.session.set({ [TRACKING_STATE_KEY]: state });
}

async function clearTrackingState() {
    await chrome.storage.session.remove(TRACKING_STATE_KEY);
}

function getDomain(url) {
    try {
        const parsedUrl = new URL(url);
        if (!parsedUrl.protocol.startsWith('http')) {
            return null;
        }

        return parsedUrl.hostname.replace('www.', '');
    } catch (error) {
        return null;
    }
}

async function ensureYouTubeEmbedRefererRules() {
    const appReferrer = `https://${chrome.runtime.id}.chromiumapp.org/`;

    try {
        await chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: YOUTUBE_EMBED_RULE_IDS,
            addRules: [
                {
                    id: 1001,
                    priority: 1,
                    action: {
                        type: 'modifyHeaders',
                        requestHeaders: [
                            {
                                header: 'referer',
                                operation: 'set',
                                value: appReferrer
                            }
                        ]
                    },
                    condition: {
                        urlFilter: '||youtube.com/embed/',
                        resourceTypes: ['sub_frame'],
                        initiatorDomains: [chrome.runtime.id]
                    }
                },
                {
                    id: 1002,
                    priority: 1,
                    action: {
                        type: 'modifyHeaders',
                        requestHeaders: [
                            {
                                header: 'referer',
                                operation: 'set',
                                value: appReferrer
                            }
                        ]
                    },
                    condition: {
                        urlFilter: '||youtube-nocookie.com/embed/',
                        resourceTypes: ['sub_frame'],
                        initiatorDomains: [chrome.runtime.id]
                    }
                }
            ]
        });

        console.log('EcoArcade: YouTube embed referer rules applied.');
    } catch (error) {
        console.error('EcoArcade: Failed to apply YouTube embed referer rules.', error);
    }
}
