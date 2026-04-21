export type TabId = 'home' | 'learn' | 'act' | 'community' | 'rewards';

export interface DashboardData {
  totalCO2: number;
  totalPoints: number;
  badges: string[];
  siteStats: Record<string, unknown>;
  history: Record<string, unknown>;
  currentTabCO2: number;
  dailyCO2: number;
  weeklyCO2: number;
}
