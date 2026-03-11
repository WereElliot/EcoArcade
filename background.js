// EcoArcade Background Service Worker - 1.1.1
// FIXED: Resolves "Receiving end does not exist" and implements storage.sync

let emissionFactors = {};
let activeTabId = null;
let startTime = null;
let currentUrl = null;
let notifiedTabs = new Set(); 

// Load emission factors from local data file
fetch(chrome.runtime.getURL('data/emissionFactors.json'))
    .then(response => response.json())
    .then(data => { 
        emissionFactors = data; 
        console.log("EcoArcade: Emission data loaded.");
    })
    .catch(err => console.error('EcoArcade: Load Error', err));

// Initial storage setup on installation
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.get(['totalCO2', 'totalPoints', 'badges', 'siteStats'], (data) => {
        if (data.totalCO2 === undefined) chrome.storage.sync.set({ totalCO2: 0 });
        if (data.totalPoints === undefined) chrome.storage.sync.set({ totalPoints: 0 });
        if (!data.badges) chrome.storage.sync.set({ badges: [] });
        if (!data.siteStats) chrome.storage.sync.set({ siteStats: {} });
    });
});

/**
 * FIXED: GLOBAL MESSAGE LISTENER
 * Returning 'true' in onMessage.addListener keeps the communication channel open 
 * for the asynchronous sendResponse call.
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getStats") {
        chrome.storage.sync.get(['totalCO2', 'totalPoints', 'badges'], (data) => {
            sendResponse({ 
                totalCO2: data.totalCO2 || 0,
                totalPoints: data.totalPoints || 0,
                badges: data.badges || []
            });
        });
        return true; // Mandatory for async response
    }
    
    if (request.action === "checkBadges") {
        chrome.storage.sync.get(['totalPoints', 'badges'], (data) => {
            const points = data.totalPoints || 0;
            let badges = data.badges || [];
            let newBadge = false;

            if (points >= 100 && !badges.includes('Eco Rookie')) { badges.push('Eco Rookie'); newBadge = true; }
            if (points >= 500 && !badges.includes('Carbon Crusader')) { badges.push('Carbon Crusader'); newBadge = true; }
            if (points >= 1000 && !badges.includes('Gaia Guardian')) { badges.push('Gaia Guardian'); newBadge = true; }

            if (newBadge) chrome.storage.sync.set({ badges: badges });
            sendResponse({ success: true, badges: badges });
        });
        return true;
    }
});

/**
 * TRACKING LOGIC
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) processTab(tabId, tab.url);
});

chrome.tabs.onActivated.addListener(activeInfo => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        if (!chrome.runtime.lastError && tab.url) processTab(activeInfo.tabId, tab.url);
    });
});

function processTab(tabId, url) {
    const domain = getDomain(url);
    if (!domain) return;
    startTracking(tabId, url, domain);
}

function startTracking(tabId, url, domain) {
    if (activeTabId === tabId && currentUrl === url) return;
    finalizePreviousSession();
    activeTabId = tabId;
    currentUrl = url;
    startTime = Date.now();
}

function finalizePreviousSession() {
    if (!activeTabId || !startTime || !currentUrl) return;

    const domain = getDomain(currentUrl);
    const endTime = Date.now();
    const durationMs = endTime - startTime;
    const durationHrs = durationMs / (1000 * 60 * 60);
    
    let factor = emissionFactors[domain] || 60; // 60g/hr default
    const co2 = factor * durationHrs;

    chrome.storage.sync.get(['totalCO2', 'siteStats'], (data) => {
        let totalCO2 = (data.totalCO2 || 0) + co2;
        let siteStats = data.siteStats || {};

        if (!siteStats[domain]) siteStats[domain] = { time: 0, co2: 0 };
        siteStats[domain].time += durationMs;
        siteStats[domain].co2 += co2;

        chrome.storage.sync.set({ totalCO2, siteStats });
    });
}

function getDomain(url) {
    try {
        const u = new URL(url);
        if (u.protocol.startsWith('chrome')) return null;
        return u.hostname.replace('www.', '');
    } catch (e) { return null; }
}

chrome.tabs.onRemoved.addListener(tabId => {
    if (activeTabId === tabId) finalizePreviousSession();
});
