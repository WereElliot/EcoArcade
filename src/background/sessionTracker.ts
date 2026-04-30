import emissionFactors from '../../data/emissionFactors.json';
import { getBadgesFromPoints } from '../features/carbon/scoring';
import { getTodayEntry, getWeeklyTotal } from '../features/carbon/selectors';
import type {
  DashboardSnapshot,
  EcoArcadeState,
  EmissionsHistory,
  LiveSessionMetrics,
  RoutinePlan,
  SiteStat,
  TrackingState
} from '../types/domain';
import { getHistoryKeys, getLocalDayKey } from '../utils/dates';
import { getDomain } from '../utils/urls';
import {
  clearTrackingState,
  getAppState,
  getTrackingState,
  setAppState,
  setTrackingState,
  updateAppState
} from '../services/storage/chromeStorage';
import { getLevelFromPoints, getNextLevelPoints } from '../features/carbon/scoring';

const DEFAULT_EMISSION_FACTOR = 60;
const IDLE_DETECTION_INTERVAL_SECONDS = 15;
const HISTORY_DAY_LIMIT = 45;
const HISTORY_MONTH_LIMIT = 18;

let currentIdleState: chrome.idle.IdleState = 'active';
let isBrowserFocused = true;

function queryIdleState(intervalSeconds: number): Promise<chrome.idle.IdleState> {
  return new Promise((resolve) => {
    chrome.idle.queryState(intervalSeconds, (state) => resolve(state));
  });
}

function cloneSiteStats(siteStats: Record<string, SiteStat>): Record<string, SiteStat> {
  return Object.fromEntries(
    Object.entries(siteStats).map(([domain, stat]) => [
      domain,
      {
        time: stat.time,
        co2: stat.co2
      }
    ])
  );
}

function cloneHistory(history: EmissionsHistory): EmissionsHistory {
  const cloneEntries = (entries: EmissionsHistory['daily']) =>
    Object.fromEntries(
      Object.entries(entries).map(([key, value]) => [
        key,
        {
          totalCO2: value.totalCO2,
          totalTime: value.totalTime,
          sites: cloneSiteStats(value.sites)
        }
      ])
    );

  return {
    daily: cloneEntries(history.daily),
    monthly: cloneEntries(history.monthly)
  };
}

function getEmissionFactor(domain: string): number {
  return (emissionFactors as Record<string, number>)[domain] ?? (emissionFactors as Record<string, number>).default ?? DEFAULT_EMISSION_FACTOR;
}

export async function initializeTrackingEnvironment(): Promise<void> {
  chrome.idle.setDetectionInterval(IDLE_DETECTION_INTERVAL_SECONDS);
  currentIdleState = await queryIdleState(IDLE_DETECTION_INTERVAL_SECONDS);
  await refreshBrowserFocusState();
}

export async function refreshBrowserFocusState(): Promise<void> {
  try {
    const lastFocusedWindow = await chrome.windows.getLastFocused();
    isBrowserFocused =
      Boolean(lastFocusedWindow?.focused) && lastFocusedWindow.id !== chrome.windows.WINDOW_ID_NONE;
  } catch {
    isBrowserFocused = true;
  }
}

export function updateIdleState(state: chrome.idle.IdleState): void {
  currentIdleState = state;
}

function buildSessionMetrics(trackingState: TrackingState | null, endTime: number): LiveSessionMetrics | null {
  if (!trackingState) {
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

  return {
    domain,
    durationMs,
    co2: getEmissionFactor(domain) * (durationMs / (1000 * 60 * 60))
  };
}

function applySessionToSiteStats(siteStats: Record<string, SiteStat>, session: LiveSessionMetrics): void {
  const existing = siteStats[session.domain] ?? { time: 0, co2: 0 };
  siteStats[session.domain] = {
    time: existing.time + session.durationMs,
    co2: existing.co2 + session.co2
  };
}

function applySessionToHistory(history: EmissionsHistory, session: LiveSessionMetrics, timestamp: number): void {
  const { dayKey, monthKey } = getHistoryKeys(timestamp);

  for (const key of [
    { collection: history.daily, id: dayKey },
    { collection: history.monthly, id: monthKey }
  ]) {
    const existing = key.collection[key.id] ?? { totalCO2: 0, totalTime: 0, sites: {} };
    existing.totalCO2 += session.co2;
    existing.totalTime += session.durationMs;
    applySessionToSiteStats(existing.sites, session);
    key.collection[key.id] = existing;
  }
}

function pruneHistory(history: EmissionsHistory): void {
  const prune = (entries: Record<string, unknown>, limit: number) => {
    const keys = Object.keys(entries).sort();
    const staleKeys = keys.slice(0, Math.max(0, keys.length - limit));
    staleKeys.forEach((key) => delete entries[key]);
  };

  prune(history.daily, HISTORY_DAY_LIMIT);
  prune(history.monthly, HISTORY_MONTH_LIMIT);
}

function awardPassiveBrowsePoints(totalPoints: number, session: LiveSessionMetrics): number {
  const durationMinutes = session.durationMs / 60000;
  if (durationMinutes > 1 && session.co2 < 2) {
    return totalPoints + Math.floor(durationMinutes * 5);
  }

  return totalPoints;
}

function updateStreak(state: EcoArcadeState, timestamp: number): EcoArcadeState {
  const today = getLocalDayKey(new Date(timestamp));
  if (state.lastActiveDay === today) {
    return state;
  }

  const previousDate = new Date(state.lastActiveDay);
  previousDate.setDate(previousDate.getDate() + 1);
  const expectedNextDay = getLocalDayKey(previousDate);

  return {
    ...state,
    streakDays: today === expectedNextDay ? state.streakDays + 1 : 1,
    lastActiveDay: today
  };
}

export async function startTrackingSession(tabId: number, url: string): Promise<void> {
  if (!isBrowserFocused || currentIdleState !== 'active') {
    return;
  }

  const domain = getDomain(url);
  if (!domain) {
    await clearTrackingState();
    return;
  }

  const trackingState = await getTrackingState();
  if (trackingState?.activeTabId === tabId && trackingState.currentUrl === url) {
    return;
  }

  if (trackingState) {
    await finalizeTrackingSession();
  }

  await setTrackingState({
    activeTabId: tabId,
    currentUrl: url,
    startTime: Date.now()
  });
}

export async function finalizeTrackingSession(endTime = Date.now()): Promise<void> {
  const trackingState = await getTrackingState();
  const session = buildSessionMetrics(trackingState, endTime);

  if (!session) {
    await clearTrackingState();
    return;
  }

  const currentState = await getAppState();
  const nextState: EcoArcadeState = {
    ...updateStreak(currentState, endTime),
    totalCO2: currentState.totalCO2 + session.co2,
    totalPoints: awardPassiveBrowsePoints(currentState.totalPoints, session),
    badges: getBadgesFromPoints(currentState.totalPoints),
    siteStats: cloneSiteStats(currentState.siteStats),
    history: cloneHistory(currentState.history)
  };

  applySessionToSiteStats(nextState.siteStats, session);
  applySessionToHistory(nextState.history, session, endTime);
  pruneHistory(nextState.history);

  await setAppState({
    ...nextState,
    badges: getBadgesFromPoints(nextState.totalPoints)
  });
  await clearTrackingState();
}

export async function buildLiveMetricsForTab(tabId?: number, url?: string): Promise<LiveSessionMetrics | null> {
  if (!tabId || !url || !isBrowserFocused || currentIdleState !== 'active') {
    return null;
  }

  const trackingState = await getTrackingState();
  if (!trackingState || trackingState.activeTabId !== tabId) {
    return null;
  }

  if (getDomain(trackingState.currentUrl) !== getDomain(url)) {
    return null;
  }

  return buildSessionMetrics(trackingState, Date.now());
}

export async function buildDashboardSnapshot(tabId?: number, url?: string): Promise<DashboardSnapshot> {
  const appState = await getAppState();
  const snapshot: DashboardSnapshot = {
    ...appState,
    currentTabCO2: 0,
    dailyCO2: 0,
    weeklyCO2: 0,
    currentDomain: getDomain(url ?? ''),
    level: getLevelFromPoints(appState.totalPoints),
    nextLevelPoints: getNextLevelPoints(appState.totalPoints)
  };

  const liveMetrics = await buildLiveMetricsForTab(tabId, url);
  const history = cloneHistory(appState.history);

  if (liveMetrics) {
    snapshot.currentTabCO2 = liveMetrics.co2;
    applySessionToSiteStats(snapshot.siteStats, liveMetrics);
    applySessionToHistory(history, liveMetrics, Date.now());
  }

  snapshot.dailyCO2 = getTodayEntry(history).totalCO2;
  snapshot.weeklyCO2 = getWeeklyTotal(history);
  return snapshot;
}

export async function restoreTrackingForFocusedTab(): Promise<void> {
  await refreshBrowserFocusState();

  if (!isBrowserFocused || currentIdleState !== 'active') {
    await finalizeTrackingSession();
    return;
  }

  const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  const activeTab = tabs[0];

  if (activeTab?.id && (activeTab.url || activeTab.pendingUrl)) {
    await startTrackingSession(activeTab.id, activeTab.url ?? activeTab.pendingUrl ?? '');
    return;
  }

  await clearTrackingState();
}

export async function handleLearnItemCompletion(itemId: string): Promise<DashboardSnapshot> {
  const state = await updateAppState((currentState) => {
    const existingCatalogItem = currentState.learnCatalog.find((item) => item.id === itemId);
    const wasCompleted = Boolean(existingCatalogItem?.completed) || Boolean(currentState.learnProgress[itemId]);
    const learnedItem = existingCatalogItem ?? null;
    const earnedPoints = learnedItem && !wasCompleted ? learnedItem.points : 0;
    const learnCatalog = currentState.learnCatalog.map((item) =>
      item.id === itemId && !item.completed ? { ...item, completed: true } : item
    );

    return {
      ...currentState,
      totalPoints: currentState.totalPoints + earnedPoints,
      badges: getBadgesFromPoints(currentState.totalPoints + earnedPoints),
      learnCatalog,
      learnProgress: learnedItem
        ? {
            ...currentState.learnProgress,
            [itemId]: true
          }
        : currentState.learnProgress
    };
  });

  return {
    ...(await buildDashboardSnapshot()),
    ...state
  };
}

export async function saveRoutinePlan(routinePlan: RoutinePlan): Promise<DashboardSnapshot> {
  await updateAppState((currentState) => ({
    ...currentState,
    routinePlan: {
      dailyCO2Limit: Math.max(3, Math.min(120, routinePlan.dailyCO2Limit)),
      articleGoal: Math.max(1, Math.min(6, routinePlan.articleGoal)),
      triviaGoal: Math.max(1, Math.min(10, routinePlan.triviaGoal)),
      reflectionGoal: Math.max(0, Math.min(3, routinePlan.reflectionGoal)),
      enabled: routinePlan.enabled
    }
  }));

  return buildDashboardSnapshot();
}

export async function joinChallenge(challengeId: string): Promise<DashboardSnapshot> {
  await updateAppState((currentState) => ({
    ...currentState,
    challenges: currentState.challenges.map((challenge) =>
      challenge.id === challengeId
        ? {
            ...challenge,
            progress: Math.min(challenge.target, challenge.progress + 1)
          }
        : challenge
    ),
    totalPoints: currentState.totalPoints + 12
  }));

  return buildDashboardSnapshot();
}

export async function createCommunityChallenge(challenge: {
  title: string;
  description: string;
  target: number;
  category: string;
  collectiveActionType: string;
}): Promise<DashboardSnapshot | null> {
  const normalizedTitle = challenge.title.trim();
  const normalizedDescription = challenge.description.trim();

  if (!normalizedTitle || !normalizedDescription) {
    return null;
  }

  const nextTarget = Math.max(10, Math.min(50000, Math.round(challenge.target)));

  await updateAppState((currentState) => {
    if (currentState.membershipTier !== 'premium') {
      return currentState;
    }

    return {
      ...currentState,
      challenges: [
        {
          id: `challenge-${Date.now()}`,
          title: normalizedTitle,
          description: normalizedDescription,
          target: nextTarget,
          progress: 1,
          rewardPoints: Math.min(500, Math.max(75, Math.round(nextTarget / 8))),
          category: challenge.category.trim() || 'Community action',
          createdBy: 'Premium member',
          premiumOnly: true,
          collectiveActionType: challenge.collectiveActionType.trim() || 'Collective action'
        },
        ...currentState.challenges
      ],
      totalPoints: currentState.totalPoints + 18
    };
  });

  return buildDashboardSnapshot();
}

export async function submitCrowdsourcedArticle(article: {
  title: string;
  summary: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  author: string;
  sectionOneHeading: string;
  sectionOneBody: string;
  sectionTwoHeading: string;
  sectionTwoBody: string;
  bullets: string[];
}): Promise<DashboardSnapshot | null> {
  const title = article.title.trim();
  const summary = article.summary.trim();
  const category = article.category.trim();
  const author = article.author.trim();
  const sectionOneHeading = article.sectionOneHeading.trim();
  const sectionOneBody = article.sectionOneBody.trim();
  const sectionTwoHeading = article.sectionTwoHeading.trim();
  const sectionTwoBody = article.sectionTwoBody.trim();
  const bullets = article.bullets.map((bullet) => bullet.trim()).filter(Boolean).slice(0, 6);

  if (!title || !summary || !category || !author || !sectionOneHeading || !sectionOneBody || !sectionTwoHeading || !sectionTwoBody) {
    return null;
  }

  await updateAppState((currentState) => ({
    ...currentState,
    learnCatalog: [
      {
        id: `community-article-${Date.now()}`,
        kind: 'article',
        title,
        summary,
        minutes: Math.max(3, Math.min(12, Math.ceil((sectionOneBody.length + sectionTwoBody.length) / 380))),
        points: article.difficulty === 'hard' ? 42 : article.difficulty === 'medium' ? 30 : 22,
        completed: false,
        tags: ['#article', '#community', `#${category.toLowerCase().replace(/\s+/g, '-')}`],
        thumbnailTheme:
          article.difficulty === 'hard' ? 'aurora' : article.difficulty === 'medium' ? 'shoreline' : 'forest',
        sourceName: 'EcoArcade Community Desk',
        difficulty: article.difficulty,
        category,
        author,
        articleSections: [
          {
            heading: sectionOneHeading,
            paragraphs: sectionOneBody
              .split(/\n+/)
              .map((paragraph) => paragraph.trim())
              .filter(Boolean),
            bullets: bullets.slice(0, 3)
          },
          {
            heading: sectionTwoHeading,
            paragraphs: sectionTwoBody
              .split(/\n+/)
              .map((paragraph) => paragraph.trim())
              .filter(Boolean),
            bullets: bullets.slice(3)
          }
        ]
      },
      ...currentState.learnCatalog
    ],
    totalPoints: currentState.totalPoints + 15
  }));

  return buildDashboardSnapshot();
}

export async function convertPointsToToken(points: number): Promise<DashboardSnapshot | null> {
  if (points < 100) {
    return null;
  }

  await updateAppState((currentState) => {
    if (currentState.totalPoints < points) {
      return currentState;
    }

    return {
      ...currentState,
      totalPoints: currentState.totalPoints - points,
      ecoTokens: currentState.ecoTokens + Math.floor(points / 100)
    };
  });

  return buildDashboardSnapshot();
}

export async function submitActionProof(fileName: string, hasGps: boolean): Promise<DashboardSnapshot> {
  await updateAppState((currentState) => {
    const verified = hasGps;
    const pointsAwarded = verified ? 180 : 0;

    return {
      ...currentState,
      totalPoints: currentState.totalPoints + pointsAwarded,
      actionProof: {
        status: verified ? 'verified' : 'missing_metadata',
        summary: verified
          ? `Gemini-ready verification pipeline accepted ${fileName} and marked it ready for NFT minting.`
          : `${fileName} is missing GPS metadata, so the proof cannot be verified or minted yet.`,
        minted: verified,
        pointsAwarded,
        location: verified ? 'GPS metadata detected' : undefined
      }
    };
  });

  return buildDashboardSnapshot();
}
