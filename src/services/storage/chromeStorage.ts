import type {
  ActionProof,
  Challenge,
  DonationProject,
  EcoArcadeState,
  EmissionsHistory,
  LearnItem,
  SiteStat,
  TrackingState
} from '../../types/domain';
import { getBadgesFromPoints } from '../../features/carbon/scoring';
import { APP_STATE_KEY, TRACKING_STATE_KEY } from './keys';
import { getLocalDayKey } from '../../utils/dates';

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
  const cloneEntries = (entries: Record<string, { totalCO2: number; totalTime: number; sites: Record<string, SiteStat> }>) =>
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

function defaultLearnCatalog(): LearnItem[] {
  return [
    {
      id: 'learn-1',
      kind: 'article',
      title: 'Why lighter websites are climate-friendly',
      summary: 'Understand how media weight, autoplay, and trackers increase digital emissions.',
      minutes: 4,
      points: 24,
      completed: false,
      tags: ['#climate', '#carbon'],
      thumbnailTheme: 'shoreline'
    },
    {
      id: 'learn-2',
      kind: 'video',
      title: 'Stream smarter in three quick steps',
      summary: 'A short video on lowering streaming energy without ruining the experience.',
      minutes: 3,
      points: 18,
      completed: false,
      tags: ['#video', '#efficiency'],
      thumbnailTheme: 'violet',
      mediaUrl: 'https://www.youtube.com/watch?v=ZqiSiX8QD7o'
    },
    {
      id: 'learn-3',
      kind: 'quiz',
      title: 'Carbon habits pulse check',
      summary: 'A fast quiz that rewards clean browsing awareness.',
      minutes: 2,
      points: 20,
      completed: false,
      tags: ['#quiz', '#carbon'],
      thumbnailTheme: 'forest'
    },
    {
      id: 'learn-4',
      kind: 'reflection',
      title: 'Write your climate commitment',
      summary: 'Capture one digital habit you will change this week.',
      minutes: 2,
      points: 16,
      completed: false,
      tags: ['#reflection', '#habit'],
      thumbnailTheme: 'aurora'
    }
  ];
}

function defaultChallenges(): Challenge[] {
  return [
    {
      id: 'challenge-1',
      title: 'Plant 100 Trees',
      description: 'Support the community challenge by contributing real-world action proofs.',
      target: 100,
      progress: 37,
      rewardPoints: 250
    },
    {
      id: 'challenge-2',
      title: 'Low-bandwidth Browsing Day',
      description: 'Spend one day using lower-footprint digital habits and help the community trend down.',
      target: 1000,
      progress: 612,
      rewardPoints: 90
    }
  ];
}

function defaultDonations(): DonationProject[] {
  return [
    {
      id: 'donation-1',
      name: 'Nairobi Urban Forest Renewal',
      region: 'Kenya',
      description: 'Tree restoration and stewardship around high-density city neighborhoods.',
      tokenCost: 8
    },
    {
      id: 'donation-2',
      name: 'Lake Victoria Plastic Recovery',
      region: 'East Africa',
      description: 'Community cleanup and recycling support across shoreline hubs.',
      tokenCost: 12
    }
  ];
}

function defaultActionProof(): ActionProof {
  return {
    status: 'idle',
    summary: 'Upload a photo with GPS metadata to verify a real-world climate action.',
    minted: false,
    pointsAwarded: 0
  };
}

export function createEmptyHistory(): EmissionsHistory {
  return {
    daily: {},
    monthly: {}
  };
}

export function createDefaultState(): EcoArcadeState {
  return {
    totalCO2: 0,
    totalPoints: 120,
    ecoTokens: 6,
    badges: ['Eco Rookie'],
    siteStats: {},
    history: createEmptyHistory(),
    streakDays: 4,
    lastActiveDay: getLocalDayKey(new Date()),
    learnCatalog: defaultLearnCatalog(),
    challenges: defaultChallenges(),
    donations: defaultDonations(),
    actionProof: defaultActionProof()
  };
}

export async function getAppState(): Promise<EcoArcadeState> {
  const data = await chrome.storage.local.get(APP_STATE_KEY);
  const storedState = data[APP_STATE_KEY] as EcoArcadeState | undefined;

  if (!storedState) {
    const state = createDefaultState();
    await setAppState(state);
    return state;
  }

  return {
    ...createDefaultState(),
    ...storedState,
    badges: getBadgesFromPoints(storedState.totalPoints ?? 0),
    siteStats: cloneSiteStats(storedState.siteStats ?? {}),
    history: cloneHistory(storedState.history ?? createEmptyHistory())
  };
}

export async function setAppState(state: EcoArcadeState): Promise<void> {
  await chrome.storage.local.set({
    [APP_STATE_KEY]: {
      ...state,
      badges: getBadgesFromPoints(state.totalPoints)
    }
  });
}

export async function updateAppState(
  updater: (currentState: EcoArcadeState) => EcoArcadeState | Promise<EcoArcadeState>
): Promise<EcoArcadeState> {
  const currentState = await getAppState();
  const nextState = await updater(currentState);
  await setAppState(nextState);
  return nextState;
}

export async function getTrackingState(): Promise<TrackingState | null> {
  const data = await chrome.storage.session.get(TRACKING_STATE_KEY);
  return (data[TRACKING_STATE_KEY] as TrackingState | undefined) ?? null;
}

export async function setTrackingState(state: TrackingState): Promise<void> {
  await chrome.storage.session.set({ [TRACKING_STATE_KEY]: state });
}

export async function clearTrackingState(): Promise<void> {
  await chrome.storage.session.remove(TRACKING_STATE_KEY);
}
