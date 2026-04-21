// EcoArcade Background Service Worker

let emissionFactors = {};

const DEFAULT_EMISSION_FACTOR = 60;
const TRACKING_STATE_KEY = 'trackingState';
const TRACKING_ENABLED_KEY = 'trackingEnabled';
const EMISSIONS_HISTORY_KEY = 'emissionsHistory';
const YOUTUBE_EMBED_RULE_IDS = [1001, 1002];
const IDLE_DETECTION_INTERVAL_SECONDS = 15;
const IDLE_DETECTION_INTERVAL_MS = IDLE_DETECTION_INTERVAL_SECONDS * 1000;
const HISTORY_DAY_LIMIT = 45;
const HISTORY_MONTH_LIMIT = 18;
const BADGE_REFRESH_ALARM_NAME = 'ecoArcadeRefreshBadge';
const BADGE_REFRESH_INTERVAL_MINUTES = 1;
const DASHBOARD_URL_PREFIX = chrome.runtime.getURL('panel/');
const DASHBOARD_HOME_URL = chrome.runtime.getURL('panel/panel.html');
const BADGE_COLORS = {
    low: '#5ebc67',
    medium: '#ff851b',
    high: '#85144b',
    inactive: '#5b6f68'
};

let currentIdleState = 'active';
let isBrowserFocused = true;
let trackingEnabled = true;

fetch(chrome.runtime.getURL('data/emissionFactors.json'))
    .then((response) => response.json())
    .then((data) => {
        emissionFactors = data;
        console.log('EcoArcade: emission data loaded.');
    })
    .catch((error) => console.error('EcoArcade: emission data load failed.', error));

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
        void restoreTrackingForFocusedTab();
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

    if (request.action === 'getOverlaySnapshot') {
        void respondWithOverlaySnapshot(request, sender, sendResponse);
        return true;
    }

    if (request.action === 'openEcoArcadeDashboard') {
        void openOrFocusDashboardTab(sender?.tab?.windowId).then(() => {
            sendResponse({ success: true });
        }).catch((error) => {
            console.error('EcoArcade: failed to open dashboard tab.', error);
            sendResponse({ success: false });
        });
        return true;
    }

    return false;
});

chrome.action.onClicked.addListener((tab) => {
    void openOrFocusDashboardTab(tab?.windowId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (!tab.active) {
        return;
    }

    const candidateUrl = changeInfo.url || tab.url || tab.pendingUrl || '';
    if (!candidateUrl) {
        return;
    }

    if (changeInfo.status === 'complete' || changeInfo.url) {
        void handleTabContextChange(tabId, candidateUrl);
    }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
    void handleActivatedTab(activeInfo.tabId);
});

chrome.tabs.onRemoved.addListener((tabId) => {
    void handleTabRemoved(tabId);
});

chrome.windows.onFocusChanged.addListener((windowId) => {
    void handleWindowFocusChanged(windowId);
});

chrome.idle.onStateChanged.addListener((newState) => {
    void handleIdleStateChange(newState);
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === BADGE_REFRESH_ALARM_NAME) {
        void updateActionBadgeForActiveTab();
    }
});

void ensureYouTubeEmbedRefererRules();

async function initializeExtension() {
    await ensureYouTubeEmbedRefererRules();
    await initializeIdleTracking();
    await refreshBrowserFocusState();
    await ensureRuntimePreferences({ forceTrackingEnabled: true });
    await ensureDefaultStorage();
    await ensureBadgeRefreshAlarm();
    await chrome.action.enable();
    await restoreTrackingForFocusedTab();
}

async function restoreRuntimeState() {
    await ensureYouTubeEmbedRefererRules();
    await initializeIdleTracking();
    await refreshBrowserFocusState();
    await ensureRuntimePreferences({ forceTrackingEnabled: true });
    await ensureDefaultStorage();
    await ensureBadgeRefreshAlarm();
    await chrome.action.enable();
    await restoreTrackingForFocusedTab();
}

async function ensureDefaultStorage() {
    const data = await chrome.storage.sync.get(['totalCO2', 'totalPoints', 'badges', 'siteStats', 'ecoTokens']);
    const updates = {};

    if (data.totalCO2 === undefined) updates.totalCO2 = 0;
    if (data.totalPoints === undefined) updates.totalPoints = 0;
    if (data.ecoTokens === undefined) updates.ecoTokens = 0;
    if (!Array.isArray(data.badges)) updates.badges = [];
    if (!data.siteStats) updates.siteStats = {};

    if (Object.keys(updates).length) {
        await chrome.storage.sync.set(updates);
    }

    const localData = await chrome.storage.local.get(EMISSIONS_HISTORY_KEY);
    if (!localData[EMISSIONS_HISTORY_KEY]) {
        await chrome.storage.local.set({ [EMISSIONS_HISTORY_KEY]: createEmptyEmissionsHistory() });
    }
}

async function ensureBadgeRefreshAlarm() {
    const existingAlarm = await chrome.alarms.get(BADGE_REFRESH_ALARM_NAME);

    if (existingAlarm) {
        return;
    }

    await chrome.alarms.create(BADGE_REFRESH_ALARM_NAME, {
        periodInMinutes: BADGE_REFRESH_INTERVAL_MINUTES
    });
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
        console.error('EcoArcade: failed to build stats snapshot.', error);
        sendResponse({ totalCO2: 0, totalPoints: 0, badges: [] });
    }
}

async function respondWithDashboardData(sendResponse) {
    try {
        const snapshot = await buildStatsSnapshot();
        sendResponse(snapshot);
    } catch (error) {
        console.error('EcoArcade: failed to build dashboard snapshot.', error);
        sendResponse({
            totalCO2: 0,
            totalPoints: 0,
            badges: [],
            siteStats: {},
            history: createEmptyEmissionsHistory()
        });
    }
}

async function respondWithOverlaySnapshot(request, sender, sendResponse) {
    try {
        const pageUrl = request?.pageUrl || sender?.tab?.url || '';
        const tabId = sender?.tab?.id || null;
        const snapshot = await buildStatsSnapshot();
        const currentDomain = getDomain(pageUrl);
        const currentSessionMetrics = tabId
            ? await buildLiveMetricsForTab(tabId, pageUrl)
            : null;

        sendResponse({
            trackingEnabled,
            currentDomain,
            currentTabCO2: currentSessionMetrics?.co2 || 0,
            currentTabTime: currentSessionMetrics?.durationMs || 0,
            dailyCO2: getTodayEntry(snapshot.history).totalCO2 || 0,
            weeklyCO2: getWeeklyTotal(snapshot.history),
            totalPoints: snapshot.totalPoints || 0,
            totalCO2: snapshot.totalCO2 || 0
        });
    } catch (error) {
        console.error('EcoArcade: failed to build overlay snapshot.', error);
        sendResponse({
            trackingEnabled,
            currentDomain: '',
            currentTabCO2: 0,
            currentTabTime: 0,
            dailyCO2: 0,
            weeklyCO2: 0,
            totalPoints: 0,
            totalCO2: 0
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
        await handleTabContextChange(tabId, tab.url || tab.pendingUrl || '');
    } catch (error) {
        console.warn('EcoArcade: could not read activated tab.', error);
        await updateActionBadgeForActiveTab();
    }
}

async function handleWindowFocusChanged(windowId) {
    isBrowserFocused = windowId !== chrome.windows.WINDOW_ID_NONE;

    if (windowId === chrome.windows.WINDOW_ID_NONE) {
        await finalizeTrackingSession();
        await updateActionBadgeForActiveTab();
        return;
    }

    const tabs = await chrome.tabs.query({ active: true, windowId });
    const activeTab = tabs.find((tab) => Boolean(tab.url || tab.pendingUrl));

    if (activeTab) {
        await handleTabContextChange(activeTab.id, activeTab.url || activeTab.pendingUrl || '');
        return;
    }

    await finalizeTrackingSession();
    await updateActionBadgeForActiveTab();
}

async function handleTabRemoved(tabId) {
    const trackingState = await getTrackingState();
    if (trackingState?.activeTabId === tabId) {
        await finalizeTrackingSession();
    }

    await updateActionBadgeForActiveTab();
}

async function handleTabContextChange(tabId, url) {
    await refreshBrowserFocusState();

    if (!trackingEnabled) {
        await finalizeTrackingSession();
        await updateActionBadgeForActiveTab();
        return;
    }

    if (!isBrowserFocused || currentIdleState !== 'active') {
        await finalizeTrackingSession(getSessionEndTimeForIdleState(currentIdleState));
        await updateActionBadgeForActiveTab();
        return;
    }

    if (!getDomain(url)) {
        await finalizeTrackingSession();
        await updateActionBadgeForTab(tabId, url);
        return;
    }

    await startTrackingSession(tabId, url);
    await updateActionBadgeForTab(tabId, url);
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

    const [data, localData] = await Promise.all([
        chrome.storage.sync.get(['totalCO2', 'totalPoints', 'siteStats']),
        chrome.storage.local.get(EMISSIONS_HISTORY_KEY)
    ]);
    const totalCO2 = (data.totalCO2 || 0) + sessionMetrics.co2;
    let totalPoints = data.totalPoints || 0;
    const siteStats = cloneSiteStats(data.siteStats || {});
    const emissionsHistory = normalizeEmissionsHistory(localData[EMISSIONS_HISTORY_KEY]);

    const durationMins = sessionMetrics.durationMs / (1000 * 60);
    if (durationMins > 1 && sessionMetrics.co2 < 2.0) {
        totalPoints += Math.floor(durationMins * 5);
    }

    applySessionToSiteStats(siteStats, sessionMetrics);
    applySessionToHistory(emissionsHistory, sessionMetrics, endTime);
    pruneEmissionsHistory(emissionsHistory);

    await Promise.all([
        chrome.storage.sync.set({ totalCO2, totalPoints, siteStats }),
        chrome.storage.local.set({ [EMISSIONS_HISTORY_KEY]: emissionsHistory })
    ]);
    await clearTrackingState();
}

async function restoreTrackingForFocusedTab() {
    await refreshBrowserFocusState();

    if (!trackingEnabled) {
        await finalizeTrackingSession();
        await updateActionBadgeForActiveTab();
        return;
    }

    if (!isBrowserFocused || currentIdleState !== 'active') {
        await finalizeTrackingSession(getSessionEndTimeForIdleState(currentIdleState));
        await updateActionBadgeForActiveTab();
        return;
    }

    const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    const activeTab = tabs.find((tab) => Boolean(tab.url || tab.pendingUrl));

    if (activeTab) {
        await handleTabContextChange(activeTab.id, activeTab.url || activeTab.pendingUrl || '');
        return;
    }

    await finalizeTrackingSession();
    await updateActionBadgeForActiveTab();
}

async function buildStatsSnapshot() {
    const [syncData, localData] = await Promise.all([
        chrome.storage.sync.get(['totalCO2', 'totalPoints', 'badges', 'siteStats']),
        chrome.storage.local.get(EMISSIONS_HISTORY_KEY)
    ]);
    const snapshot = {
        totalCO2: syncData.totalCO2 || 0,
        totalPoints: syncData.totalPoints || 0,
        badges: Array.isArray(syncData.badges) ? syncData.badges : [],
        siteStats: cloneSiteStats(syncData.siteStats || {}),
        history: normalizeEmissionsHistory(localData[EMISSIONS_HISTORY_KEY])
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
    applySessionToHistory(snapshot.history, sessionMetrics, getSessionEndTimeForIdleState(currentIdleState));

    return snapshot;
}

async function buildLiveMetricsForTab(tabId, url) {
    if (!trackingEnabled || !isBrowserFocused || currentIdleState !== 'active') {
        return null;
    }

    const trackingState = await getTrackingState();
    if (!trackingState || trackingState.activeTabId !== tabId) {
        return null;
    }

    const trackingDomain = getDomain(trackingState.currentUrl);
    const urlDomain = getDomain(url);
    if (!trackingDomain || !urlDomain || trackingDomain !== urlDomain) {
        return null;
    }

    return buildSessionMetrics(trackingState, Date.now());
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

function createEmptyEmissionsHistory() {
    return {
        daily: {},
        monthly: {}
    };
}

function normalizeEmissionsHistory(history) {
    const normalized = createEmptyEmissionsHistory();

    if (!history || typeof history !== 'object') {
        return normalized;
    }

    normalized.daily = cloneHistoryEntries(history.daily);
    normalized.monthly = cloneHistoryEntries(history.monthly);

    return normalized;
}

function cloneHistoryEntries(entries) {
    if (!entries || typeof entries !== 'object') {
        return {};
    }

    return Object.fromEntries(
        Object.entries(entries).map(([key, value]) => [
            key,
            {
                totalCO2: value?.totalCO2 || 0,
                totalTime: value?.totalTime || 0,
                sites: cloneSiteStats(value?.sites || {})
            }
        ])
    );
}

function applySessionToHistory(history, sessionMetrics, timestamp) {
    if (!history || !sessionMetrics?.domain) {
        return;
    }

    const { dayKey, monthKey } = getHistoryKeys(timestamp);
    applySessionToHistoryEntry(history.daily, dayKey, sessionMetrics);
    applySessionToHistoryEntry(history.monthly, monthKey, sessionMetrics);
}

function applySessionToHistoryEntry(container, key, sessionMetrics) {
    const existingEntry = container[key] || {
        totalCO2: 0,
        totalTime: 0,
        sites: {}
    };

    existingEntry.totalCO2 += sessionMetrics.co2;
    existingEntry.totalTime += sessionMetrics.durationMs;
    applySessionToSiteStats(existingEntry.sites, sessionMetrics);

    container[key] = existingEntry;
}

function pruneEmissionsHistory(history) {
    pruneHistoryContainer(history.daily, HISTORY_DAY_LIMIT);
    pruneHistoryContainer(history.monthly, HISTORY_MONTH_LIMIT);
}

function pruneHistoryContainer(container, limit) {
    const keys = Object.keys(container).sort();
    const staleKeys = keys.slice(0, Math.max(0, keys.length - limit));

    staleKeys.forEach((key) => {
        delete container[key];
    });
}

function getHistoryKeys(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return {
        dayKey: `${year}-${month}-${day}`,
        monthKey: `${year}-${month}`
    };
}

function getTodayEntry(history) {
    const todayKey = getLocalDayKey(new Date());
    return history?.daily?.[todayKey] || {
        totalCO2: 0,
        totalTime: 0,
        sites: {}
    };
}

function getWeeklyTotal(history) {
    let total = 0;
    const today = new Date();

    for (let offset = 0; offset < 7; offset += 1) {
        const date = new Date(today);
        date.setDate(today.getDate() - offset);
        const dayKey = getLocalDayKey(date);
        total += history?.daily?.[dayKey]?.totalCO2 || 0;
    }

    return total;
}

function getLocalDayKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function getEmissionFactor(domain) {
    return emissionFactors[domain] || emissionFactors.default || DEFAULT_EMISSION_FACTOR;
}

async function initializeIdleTracking() {
    chrome.idle.setDetectionInterval(IDLE_DETECTION_INTERVAL_SECONDS);
    currentIdleState = await chrome.idle.queryState(IDLE_DETECTION_INTERVAL_SECONDS);
}

async function ensureRuntimePreferences({ forceTrackingEnabled = false } = {}) {
    const data = await chrome.storage.sync.get([TRACKING_ENABLED_KEY]);
    const updates = {};

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

async function openOrFocusDashboardTab(preferredWindowId) {
    const dashboardTab = await findDashboardTab();

    if (dashboardTab) {
        await chrome.windows.update(dashboardTab.windowId, { focused: true });
        await chrome.tabs.update(dashboardTab.id, { active: true });
        return;
    }

    const createOptions = { url: DASHBOARD_HOME_URL };
    if (preferredWindowId) {
        createOptions.windowId = preferredWindowId;
    }

    await chrome.tabs.create(createOptions);
}

async function findDashboardTab() {
    try {
        const tabs = await chrome.tabs.query({});
        return tabs.find((tab) => typeof tab.url === 'string' && tab.url.startsWith(DASHBOARD_URL_PREFIX)) || null;
    } catch (error) {
        console.warn('EcoArcade: could not inspect dashboard tabs.', error);
        return null;
    }
}

async function refreshBrowserFocusState() {
    try {
        const lastFocusedWindow = await chrome.windows.getLastFocused();
        isBrowserFocused = Boolean(lastFocusedWindow?.focused) && lastFocusedWindow?.id !== chrome.windows.WINDOW_ID_NONE;
    } catch (error) {
        console.warn('EcoArcade: could not refresh browser focus state.', error);
    }
}

async function handleIdleStateChange(newState) {
    currentIdleState = newState;

    if (newState === 'active') {
        await restoreTrackingForFocusedTab();
        return;
    }

    await finalizeTrackingSession(getSessionEndTimeForIdleState(newState));
    await updateActionBadgeForActiveTab();
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

async function updateActionBadgeForActiveTab() {
    const activeTabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    const activeTab = activeTabs[0];

    if (!activeTab) {
        await setGlobalActionState({
            text: '',
            title: 'Open EcoArcade dashboard'
        });
        return;
    }

    await updateActionBadgeForTab(activeTab.id, activeTab.url || activeTab.pendingUrl || '');
}

async function updateActionBadgeForTab(tabId, url) {
    if (!tabId) {
        return;
    }

    const presentation = await buildActionPresentation(tabId, url);

    try {
        await chrome.action.setBadgeText({ tabId, text: presentation.text });
        await chrome.action.setTitle({ tabId, title: presentation.title });

        if (presentation.text) {
            await chrome.action.setBadgeBackgroundColor({ tabId, color: presentation.color });
        }
    } catch (error) {
        console.warn('EcoArcade: could not update the toolbar badge.', error);
    }
}

async function setGlobalActionState({ text, title, color = BADGE_COLORS.inactive }) {
    try {
        await chrome.action.setBadgeText({ text });
        await chrome.action.setTitle({ title });
        if (text) {
            await chrome.action.setBadgeBackgroundColor({ color });
        }
    } catch (error) {
        console.warn('EcoArcade: could not update global toolbar state.', error);
    }
}

async function buildActionPresentation(tabId, url) {
    if (!trackingEnabled) {
        return {
            text: '',
            color: BADGE_COLORS.inactive,
            title: 'EcoArcade tracking is paused. Click to open the dashboard.'
        };
    }

    const domain = getDomain(url);

    if (!domain) {
        return {
            text: '',
            color: BADGE_COLORS.inactive,
            title: 'EcoArcade tracks normal web pages only. Click to open the dashboard.'
        };
    }

    if (!isBrowserFocused || currentIdleState !== 'active') {
        return {
            text: '',
            color: BADGE_COLORS.inactive,
            title: `EcoArcade paused while ${currentIdleState === 'active' ? 'the browser is unfocused' : 'you are away'}. Click to open the dashboard.`
        };
    }

    const trackingState = await getTrackingState();
    const sessionMetrics = trackingState?.activeTabId === tabId
        ? buildSessionMetrics(trackingState, Date.now())
        : null;

    const visitCO2 = sessionMetrics?.co2 || 0;
    const visitTime = sessionMetrics?.durationMs || 0;
    const tone = getBadgeTone(visitCO2);

    return {
        text: formatBadgeText(visitCO2),
        color: BADGE_COLORS[tone],
        title: [
            `${domain}`,
            `Estimated CO2 this visit: ${formatReadableCO2(visitCO2)}`,
            `Time on current visit: ${formatDurationForTitle(visitTime)}`,
            'Click to open the EcoArcade dashboard.'
        ].join('\n')
    };
}

function getBadgeTone(grams) {
    if (grams >= 10) {
        return 'high';
    }

    if (grams >= 2) {
        return 'medium';
    }

    return 'low';
}

function formatBadgeText(grams) {
    if (!grams || grams < 0.05) {
        return '0g';
    }

    if (grams < 9.95) {
        return `${grams.toFixed(1)}g`;
    }

    if (grams < 1000) {
        return `${Math.round(grams)}g`;
    }

    return `${Math.round(grams / 1000)}kg`;
}

function formatReadableCO2(grams) {
    if (grams >= 1000) {
        return `${(grams / 1000).toFixed(2)} kg`;
    }

    return `${grams.toFixed(2)}g`;
}

function formatDurationForTitle(durationMs) {
    if (!durationMs || durationMs < 1000) {
        return '< 1 minute';
    }

    const totalMinutes = Math.floor(durationMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }

    return `${Math.max(totalMinutes, 1)}m`;
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
        console.error('EcoArcade: failed to apply YouTube embed referer rules.', error);
    }
}
