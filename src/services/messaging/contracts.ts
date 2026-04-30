import type { DashboardSnapshot } from '../../types/domain';

export type RuntimeRequest =
  | { action: 'getDashboardData' }
  | { action: 'openEcoArcadeDashboard' }
  | { action: 'completeLearnItem'; itemId: string }
  | {
      action: 'saveRoutinePlan';
      routinePlan: {
        dailyCO2Limit: number;
        articleGoal: number;
        triviaGoal: number;
        reflectionGoal: number;
        enabled: boolean;
      };
    }
  | { action: 'joinChallenge'; challengeId: string }
  | {
      action: 'submitCrowdsourcedArticle';
      article: {
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
      };
    }
  | {
      action: 'createCommunityChallenge';
      challenge: {
        title: string;
        description: string;
        target: number;
        category: string;
        collectiveActionType: string;
      };
    }
  | { action: 'convertPointsToToken'; points: number }
  | { action: 'submitActionProof'; fileName: string; hasGps: boolean };

export type RuntimeResponse =
  | DashboardSnapshot
  | { success: boolean; reason?: string }
  | { success: true; snapshot: DashboardSnapshot };
