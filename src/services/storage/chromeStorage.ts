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
      title: 'Climate change evidence in one quick read',
      summary: 'A grounded primer on the evidence behind climate change and why small digital choices still matter.',
      minutes: 4,
      points: 24,
      completed: false,
      tags: ['#climate', '#science'],
      thumbnailTheme: 'shoreline',
      mediaUrl: 'https://climate.nasa.gov/evidence/',
      sourceName: 'NASA Climate',
      articleSections: [
        {
          heading: 'Why scientists are certain',
          paragraphs: [
            'NASA points to multiple independent signals that all move in the same direction: rising temperatures, shrinking ice sheets, warming oceans, sea-level rise, and more frequent heat extremes.',
            'When several separate measurements tell the same story, confidence rises sharply. Climate evidence is not based on one graph or one model; it comes from a whole system of observations.'
          ],
          bullets: [
            'Carbon dioxide concentrations are far above pre-industrial levels.',
            'Glaciers and polar ice are losing mass over time.',
            'The ocean is absorbing most of the extra heat trapped by greenhouse gases.'
          ]
        },
        {
          heading: 'Why this matters for digital life',
          paragraphs: [
            'The internet feels invisible, but it depends on data centers, networks, and devices that all draw power. That means our digital habits connect back to the same energy system driving climate pressure.',
            'EcoArcade uses this kind of systems thinking: even when one browsing session looks small, repeated habits scale up quickly across millions of users.'
          ]
        }
      ]
    },
    {
      id: 'learn-2',
      kind: 'video',
      title: 'What Is Climate Change?',
      summary: 'A clear visual explainer that works well as the opening lesson for new EcoArcade users.',
      minutes: 3,
      points: 18,
      completed: false,
      tags: ['#video', '#climate'],
      thumbnailTheme: 'violet',
      mediaUrl: 'https://www.youtube.com/watch?v=ZqiSiX8QD7o',
      sourceName: 'Nat Geo'
    },
    {
      id: 'learn-3',
      kind: 'article',
      title: 'What is climate change and why does it matter now?',
      summary: 'A broader explainer connecting emissions, adaptation, justice, and urgency.',
      minutes: 5,
      points: 26,
      completed: false,
      tags: ['#climate', '#awareness'],
      thumbnailTheme: 'aurora',
      mediaUrl: 'https://www.un.org/en/climatechange/what-is-climate-change',
      sourceName: 'United Nations',
      articleSections: [
        {
          heading: 'The big picture',
          paragraphs: [
            'The United Nations frames climate change as a shift in temperatures and weather patterns that is now being accelerated mainly by human activity, especially burning fossil fuels.',
            'What makes this urgent is not only warming itself, but the knock-on effects: food insecurity, water stress, health risk, displacement, and pressure on already vulnerable communities.'
          ],
          bullets: [
            'Mitigation means reducing the emissions causing the problem.',
            'Adaptation means preparing communities for impacts already underway.',
            'Climate justice matters because the harms are not shared equally.'
          ]
        },
        {
          heading: 'What action looks like',
          paragraphs: [
            'Useful action spans both everyday habits and larger systems change. Digital awareness, cleaner energy, efficient infrastructure, and community-level projects all fit together.',
            'That is why EcoArcade mixes browsing feedback with real-world climate missions, donations, and community challenges instead of stopping at carbon tracking alone.'
          ]
        }
      ]
    },
    {
      id: 'learn-4',
      kind: 'video',
      title: 'Renewable energy basics',
      summary: 'Open a curated YouTube search focused on renewable energy basics and practical decarbonization.',
      minutes: 6,
      points: 24,
      completed: false,
      tags: ['#renewables', '#energy'],
      thumbnailTheme: 'forest',
      mediaUrl: 'https://www.youtube.com/results?search_query=renewable+energy+explained+national+geographic',
      sourceName: 'YouTube'
    },
    {
      id: 'learn-5',
      kind: 'article',
      title: 'Renewables explained for everyday decisions',
      summary: 'A concise energy-system overview that helps connect clean power to real-world action.',
      minutes: 5,
      points: 22,
      completed: false,
      tags: ['#renewables', '#energy'],
      thumbnailTheme: 'forest',
      mediaUrl: 'https://www.iea.org/energy-system/renewables',
      sourceName: 'IEA',
      articleSections: [
        {
          heading: 'Why renewables matter',
          paragraphs: [
            'The IEA overview highlights how renewables reduce dependence on high-emission energy sources and make power systems more resilient over time.',
            'For everyday users, the key takeaway is simple: the cleaner the grid becomes, the lower the emissions attached to digital activity, transport, and household electricity.'
          ],
          bullets: [
            'Solar and wind keep expanding because costs have fallen significantly.',
            'Cleaner grids lower the footprint of cloud services, streaming, and connected devices.',
            'Storage, grid upgrades, and policy support are part of making renewables reliable at scale.'
          ]
        },
        {
          heading: 'How this connects to EcoArcade',
          paragraphs: [
            'Learning about renewables helps users understand that their carbon counter is not abstract. It reflects real energy demand moving through real infrastructure.',
            'The stronger that infrastructure becomes, the more impact users can make by pairing digital efficiency with support for climate projects and better energy systems.'
          ]
        }
      ]
    },
    {
      id: 'learn-6',
      kind: 'video',
      title: 'Digital carbon footprint awareness',
      summary: 'Open a curated YouTube search about internet energy use, streaming, and the hidden cost of digital habits.',
      minutes: 5,
      points: 20,
      completed: false,
      tags: ['#internet', '#carbon'],
      thumbnailTheme: 'violet',
      mediaUrl: 'https://www.youtube.com/results?search_query=internet+carbon+footprint+explained',
      sourceName: 'YouTube'
    },
    {
      id: 'trivia-1',
      kind: 'quiz',
      title: 'Trivia: what increases digital emissions fastest?',
      summary: 'Test your awareness of the habits that usually drive a bigger browsing footprint.',
      minutes: 2,
      points: 20,
      completed: false,
      tags: ['#quiz', '#carbon'],
      thumbnailTheme: 'forest'
    },
    {
      id: 'trivia-2',
      kind: 'quiz',
      title: 'Trivia: climate awareness basics',
      summary: 'A short question on the main driver behind modern global warming.',
      minutes: 2,
      points: 20,
      completed: false,
      tags: ['#quiz', '#climate'],
      thumbnailTheme: 'shoreline'
    },
    {
      id: 'trivia-3',
      kind: 'quiz',
      title: 'Trivia: the cleanest first move',
      summary: 'Pick the strongest immediate digital habit for lowering carbon without losing usefulness.',
      minutes: 2,
      points: 20,
      completed: false,
      tags: ['#quiz', '#habit'],
      thumbnailTheme: 'aurora'
    },
    {
      id: 'learn-7',
      kind: 'reflection',
      title: 'Reflection: commit to one lighter digital habit',
      summary: 'Write down one browsing or streaming habit you will change this week and lock in the intention.',
      minutes: 2,
      points: 16,
      completed: false,
      tags: ['#reflection', '#habit'],
      thumbnailTheme: 'aurora',
      sourceName: 'EcoArcade Prompt'
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
