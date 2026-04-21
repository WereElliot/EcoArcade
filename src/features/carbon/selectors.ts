import type { DashboardSnapshot, EmissionsHistory, HistoryEntry } from '../../types/domain';
import { getLevelFromPoints, getNextLevelPoints } from './scoring';
import { getLocalDayKey } from '../../utils/dates';

export function getTodayEntry(history: EmissionsHistory): HistoryEntry {
  return history.daily[getLocalDayKey(new Date())] ?? {
    totalCO2: 0,
    totalTime: 0,
    sites: {}
  };
}

export function getWeeklyTotal(history: EmissionsHistory): number {
  let total = 0;
  const today = new Date();

  for (let offset = 0; offset < 7; offset += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    total += history.daily[getLocalDayKey(date)]?.totalCO2 ?? 0;
  }

  return total;
}

export function withProgress<T extends Pick<DashboardSnapshot, 'totalPoints'>>(snapshot: T) {
  return {
    level: getLevelFromPoints(snapshot.totalPoints),
    nextLevelPoints: getNextLevelPoints(snapshot.totalPoints)
  };
}
