import type { RuntimeRequest } from '../services/messaging/contracts';
import {
  buildDashboardSnapshot,
  buildOverlaySnapshot,
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
const YOUTUBE_EMBED_RULE_IDS = [1001, 1002];

async function ensureYouTubeEmbedRefererRules(): Promise<void> {
  const appReferrer = `https://${chrome.runtime.id}.chromiumapp.org/`;
  const youtubeEmbedRules = [
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
  ] as any;

  try {
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: YOUTUBE_EMBED_RULE_IDS,
      addRules: youtubeEmbedRules
    });
  } catch (error) {
    console.error('EcoArcade: failed to apply YouTube embed referer rules.', error);
  }
}

async function openDashboardPage(tab?: chrome.tabs.Tab): Promise<void> {
  const existingTabs = await chrome.tabs.query({});
  const existingDashboard = existingTabs.find((candidate) => candidate.url === DASHBOARD_URL);

  if (existingDashboard?.id) {
    await chrome.windows.update(existingDashboard.windowId, { focused: true });
    await chrome.tabs.update(existingDashboard.id, { active: true });
    return;
  }

  await chrome.tabs.create({
    url: DASHBOARD_URL,
    active: true,
    windowId: tab?.windowId
  });
}

async function handleTabUpdate(tabId: number, url: string): Promise<void> {
  if (!url) {
    await finalizeTrackingSession();
    return;
  }

  await startTrackingSession(tabId, url);
}

chrome.runtime.onInstalled.addListener(() => {
  void ensureYouTubeEmbedRefererRules();
  void initializeTrackingEnvironment();
  void restoreTrackingForFocusedTab();
});

chrome.runtime.onStartup.addListener(() => {
  void ensureYouTubeEmbedRefererRules();
  void initializeTrackingEnvironment();
  void restoreTrackingForFocusedTab();
});

chrome.tabs.onActivated.addListener(({ tabId }) => {
  void chrome.tabs
    .get(tabId)
    .then((tab) => handleTabUpdate(tabId, tab.url ?? tab.pendingUrl ?? ''))
    .catch(() => finalizeTrackingSession());
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const url = changeInfo.url ?? tab.url ?? tab.pendingUrl ?? '';
  if (!url || (!changeInfo.url && changeInfo.status !== 'complete')) {
    return;
  }

  void handleTabUpdate(tabId, url);
});

chrome.tabs.onRemoved.addListener(() => {
  void finalizeTrackingSession();
});

chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    void finalizeTrackingSession();
    return;
  }

  void restoreTrackingForFocusedTab();
});

chrome.idle.onStateChanged.addListener((state) => {
  updateIdleState(state);

  if (state === 'active') {
    void restoreTrackingForFocusedTab();
    return;
  }

  void finalizeTrackingSession();
});

chrome.runtime.onMessage.addListener((request: RuntimeRequest, sender, sendResponse) => {
  const respond = async () => {
    switch (request.action) {
      case 'getDashboardData':
        sendResponse(await buildDashboardSnapshot(sender.tab?.id, sender.tab?.url));
        return;
      case 'getOverlaySnapshot':
        sendResponse(await buildOverlaySnapshot(sender.tab?.id, request.pageUrl ?? sender.tab?.url));
        return;
      case 'openEcoArcadeDashboard':
        await openDashboardPage(sender.tab);
        sendResponse({ success: true });
        return;
      case 'completeLearnItem':
        sendResponse({ success: true, snapshot: await handleLearnItemCompletion(request.itemId) });
        return;
      case 'joinChallenge':
        sendResponse({ success: true, snapshot: await joinChallenge(request.challengeId) });
        return;
      case 'convertPointsToToken': {
        const snapshot = await convertPointsToToken(request.points);
        sendResponse(
          snapshot
            ? { success: true, snapshot }
            : { success: false, reason: 'You need at least 100 points to convert.' }
        );
        return;
      }
      case 'submitActionProof':
        sendResponse({
          success: true,
          snapshot: await submitActionProof(request.fileName, request.hasGps)
        });
        return;
      default:
        sendResponse({ success: false, reason: 'Unsupported action' });
    }
  };

  void respond();
  return true;
});
