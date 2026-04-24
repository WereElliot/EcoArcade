import type { BadgeId } from '../../types/domain';

export function getRankLabel(points: number): string {
  if (points >= 2200) {
    return 'Climate Steward';
  }

  if (points >= 1000) {
    return 'Gaia Guardian';
  }

  if (points >= 500) {
    return 'Carbon Crusader';
  }

  if (points >= 100) {
    return 'Eco Rookie';
  }

  return 'Recruit';
}

export function getLevelFromPoints(points: number): number {
  return Math.max(1, Math.floor(points / 180) + 1);
}

export function getNextLevelPoints(points: number): number {
  return getLevelFromPoints(points) * 180;
}

export function getBadgesFromPoints(points: number): BadgeId[] {
  const badges: BadgeId[] = [];

  if (points >= 100) {
    badges.push('Eco Rookie');
  }

  if (points >= 500) {
    badges.push('Carbon Crusader');
  }

  if (points >= 1000) {
    badges.push('Gaia Guardian');
  }

  return badges;
}
