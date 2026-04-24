import type { DashboardSnapshot } from '../../types/domain';

export type RuntimeRequest =
  | { action: 'getDashboardData' }
  | { action: 'openEcoArcadeDashboard' }
  | { action: 'completeLearnItem'; itemId: string }
  | { action: 'joinChallenge'; challengeId: string }
  | { action: 'convertPointsToToken'; points: number }
  | { action: 'submitActionProof'; fileName: string; hasGps: boolean };

export type RuntimeResponse =
  | DashboardSnapshot
  | { success: boolean; reason?: string }
  | { success: true; snapshot: DashboardSnapshot };
