export type BadgeId = 'Eco Rookie' | 'Carbon Crusader' | 'Gaia Guardian';

export type TabId = 'insights' | 'learn' | 'act' | 'community' | 'rewards';

export interface SiteStat {
  time: number;
  co2: number;
}

export interface HistoryEntry {
  totalCO2: number;
  totalTime: number;
  sites: Record<string, SiteStat>;
}

export interface EmissionsHistory {
  daily: Record<string, HistoryEntry>;
  monthly: Record<string, HistoryEntry>;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  target: number;
  progress: number;
  rewardPoints: number;
}

export interface LearnArticleSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface LearnItem {
  id: string;
  kind: 'article' | 'video' | 'quiz' | 'reflection';
  title: string;
  summary: string;
  minutes: number;
  points: number;
  completed: boolean;
  tags?: string[];
  thumbnailTheme?: string;
  mediaUrl?: string;
  sourceName?: string;
  articleSections?: LearnArticleSection[];
}

export interface DonationProject {
  id: string;
  name: string;
  region: string;
  description: string;
  tokenCost: number;
}

export interface ActionProof {
  status: 'idle' | 'reviewing' | 'verified' | 'missing_metadata';
  summary: string;
  minted: boolean;
  pointsAwarded: number;
  location?: string;
}

export interface EcoArcadeState {
  totalCO2: number;
  totalPoints: number;
  ecoTokens: number;
  badges: BadgeId[];
  siteStats: Record<string, SiteStat>;
  history: EmissionsHistory;
  streakDays: number;
  lastActiveDay: string;
  learnCatalog: LearnItem[];
  challenges: Challenge[];
  donations: DonationProject[];
  actionProof: ActionProof;
}

export interface LiveSessionMetrics {
  domain: string;
  durationMs: number;
  co2: number;
}

export interface DashboardSnapshot extends EcoArcadeState {
  currentTabCO2: number;
  dailyCO2: number;
  weeklyCO2: number;
  currentDomain: string;
  level: number;
  nextLevelPoints: number;
}

export interface OverlaySnapshot {
  trackingEnabled: boolean;
  currentDomain: string;
  currentTabCO2: number;
  dailyCO2: number;
  weeklyCO2: number;
  totalPoints: number;
}

export interface TrackingState {
  activeTabId: number;
  currentUrl: string;
  startTime: number;
}
