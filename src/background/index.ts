import { formatCO2 } from '../features/carbon/formatters';
import { getRankLabel } from '../features/carbon/scoring';
import type { RuntimeRequest } from '../services/messaging/contracts';
import type { DashboardSnapshot } from '../types/domain';
import {
  buildDashboardSnapshot,
  convertPointsToToken,
  finalizeTrackingSession,
  handleLearnItemCompletion,
  initializeTrackingEnvironment,
  joinChallenge,
  restoreTrackingForFocusedTab,
  startTrackingSession,
  submitActionProof,
  updateIdleState
} from './sessionTracker';

const DASHBOARD_URL = chrome.runtime.getURL('dashboard.html');

function getBadgeColor(co2: number): string {
  if (co2 >= 8) {
    return '#9f1239';
  }

  if (co2 >= 3) {
    return '#92400e';
  }

  return '#166534';
}

function formatBadgeText(co2: number): string {
  if (!co2 || co2 < 0.05) {
    return '0';
  }

  if (co2 >= 1000) {
    return `${Math.min(99, Math.round(co2 / 1000))}k`;
  }

  if (co2 >= 100) {
    return `${Math.min(999, Math.round(co2))}`;
  }

  return co2.toFixed(1).replace(/\.0$/, '');
}

async function getContextTab(sender?: chrome.runtime.MessageSender): Promise<chrome.tabs.Tab | null> {
  if (sender?.tab?.id) {
    return sender.tab;
  }

  const [activeTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  return activeTab ?? null;
}

async function getContextSnapshot(sender?: chrome.runtime.MessageSender): Promise<DashboardSnapshot> {
  const tab = await getContextTab(sender);
  return buildDashboardSnapshot(tab?.id, tab?.url ?? tab?.pendingUrl);
}

async function updateActionPresentation(tabId?: number, url?: string): Promise<void> {
  const snapshot = await buildDashboardSnapshot(tabId, url);
  const badgeText = formatBadgeText(snapshot.currentTabCO2);
  const rank = getRankLabel(snapshot.totalPoints);

  await chrome.action.setBadgeText({ text: badgeText });
  await chrome.action.setBadgeBackgroundColor({ color: getBadgeColor(snapshot.currentTabCO2) });
  await chrome.action.setTitle({
    title: snapshot.currentDomain
      ? `EcoArcade\n${snapshot.currentDomain}: ${formatCO2(snapshot.currentTabCO2)}\nToday: ${formatCO2(snapshot.dailyCO2)}\nRank: ${rank}`
      : `EcoArcade\nCurrent tab: ${formatCO2(snapshot.currentTabCO2)}\nToday: ${formatCO2(snapshot.dailyCO2)}\nRank: ${rank}`
  });
}

async function openDashboardPage(tab?: chrome.tabs.Tab): Promise<void> {
  await chrome.tabs.create({
    url: DASHBOARD_URL,
    active: true,
    windowId: tab?.windowId
  });
}

async function handleTabUpdate(tabId: number, url: string): Promise<void> {
  if (!url) {
    await finalizeTrackingSession();
    await updateActionPresentation();
    return;
  }

  await startTrackingSession(tabId, url);
  await updateActionPresentation(tabId, url);
}

async function refreshFocusedBadge(): Promise<void> {
  const [activeTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  await updateActionPresentation(activeTab?.id, activeTab?.url ?? activeTab?.pendingUrl);
}

chrome.runtime.onInstalled.addListener(() => {
  void initializeTrackingEnvironment().then(refreshFocusedBadge);
  void restoreTrackingForFocusedTab();
});

chrome.runtime.onStartup.addListener(() => {
  void initializeTrackingEnvironment().then(refreshFocusedBadge);
  void restoreTrackingForFocusedTab();
});

chrome.tabs.onActivated.addListener(({ tabId }) => {
  void chrome.tabs
    .get(tabId)
    .then((tab) => handleTabUpdate(tabId, tab.url ?? tab.pendingUrl ?? ''))
    .catch(async () => {
      await finalizeTrackingSession();
      await refreshFocusedBadge();
    });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const url = changeInfo.url ?? tab.url ?? tab.pendingUrl ?? '';
  if (!url || (!changeInfo.url && changeInfo.status !== 'complete')) {
    return;
  }

  void handleTabUpdate(tabId, url);
});

chrome.tabs.onRemoved.addListener(() => {
  void finalizeTrackingSession().then(refreshFocusedBadge);
});

chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    void finalizeTrackingSession().then(refreshFocusedBadge);
    return;
  }

  void restoreTrackingForFocusedTab().then(refreshFocusedBadge);
});

chrome.idle.onStateChanged.addListener((state) => {
  updateIdleState(state);

  if (state === 'active') {
    void restoreTrackingForFocusedTab().then(refreshFocusedBadge);
    return;
  }

  void finalizeTrackingSession().then(refreshFocusedBadge);
});

chrome.runtime.onMessage.addListener((request: RuntimeRequest, sender, sendResponse) => {
  const respond = async () => {
    switch (request.action) {
      case 'getDashboardData':
        sendResponse(await getContextSnapshot(sender));
        return;
      case 'openEcoArcadeDashboard':
        await openDashboardPage(await getContextTab(sender) ?? undefined);
        sendResponse({ success: true });
        return;
      case 'completeLearnItem': {
        const snapshot = await handleLearnItemCompletion(request.itemId);
        await refreshFocusedBadge();
        sendResponse({ success: true, snapshot });
        return;
      }
      case 'joinChallenge': {
        const snapshot = await joinChallenge(request.challengeId);
        await refreshFocusedBadge();
        sendResponse({ success: true, snapshot });
        return;
      }
      case 'convertPointsToToken': {
        const snapshot = await convertPointsToToken(request.points);
        await refreshFocusedBadge();
        sendResponse(
          snapshot
            ? { success: true, snapshot }
            : { success: false, reason: 'You need at least 100 points to convert.' }
        );
        return;
      }
      case 'submitActionProof': {
        const snapshot = await submitActionProof(request.fileName, request.hasGps);
        await refreshFocusedBadge();
        sendResponse({ success: true, snapshot });
        return;
      }
      default:
        sendResponse({ success: false, reason: 'Unsupported action' });
    }
  };

  void respond();
  return true;
});
