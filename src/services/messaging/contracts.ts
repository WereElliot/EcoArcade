import type { DashboardSnapshot, OverlaySnapshot } from '../../types/domain';

export type RuntimeRequest =
  | { action: 'getDashboardData' }
  | { action: 'getOverlaySnapshot'; pageUrl?: string }
  | { action: 'openEcoArcadeDashboard' }
  | { action: 'completeLearnItem'; itemId: string }
  | { action: 'joinChallenge'; challengeId: string }
  | { action: 'convertPointsToToken'; points: number }
  | { action: 'submitActionProof'; fileName: string; hasGps: boolean };

export type RuntimeResponse =
  | DashboardSnapshot
  | OverlaySnapshot
  | { success: boolean; reason?: string }
  | { success: true; snapshot: DashboardSnapshot };
