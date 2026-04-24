import { useEffect, useState } from 'react';
import { formatCO2 } from '../features/carbon/formatters';
import { getRankLabel } from '../features/carbon/scoring';
import type { DashboardSnapshot } from '../types/domain';

const emptySnapshot: DashboardSnapshot = {
  totalCO2: 0,
  totalPoints: 0,
  ecoTokens: 0,
  badges: [],
  siteStats: {},
  history: { daily: {}, monthly: {} },
  streakDays: 0,
  lastActiveDay: '',
  learnCatalog: [],
  challenges: [],
  donations: [],
  actionProof: {
    status: 'idle',
    summary: '',
    minted: false,
    pointsAwarded: 0
  },
  currentTabCO2: 0,
  dailyCO2: 0,
  weeklyCO2: 0,
  currentDomain: '',
  level: 1,
  nextLevelPoints: 180
};

async function sendMessage<T>(message: object): Promise<T | null> {
  try {
    return (await chrome.runtime.sendMessage(message)) as T;
  } catch {
    return null;
  }
}

function MiniStat({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="popup-stat">
      <div className="popup-stat-label">{label}</div>
      <div className="popup-stat-value">{value}</div>
    </div>
  );
}

export default function App() {
  const [snapshot, setSnapshot] = useState<DashboardSnapshot>(emptySnapshot);
  const rankLabel = getRankLabel(snapshot.totalPoints);

  useEffect(() => {
    void sendMessage<DashboardSnapshot>({ action: 'getDashboardData' }).then((response) => {
      if (response) {
        setSnapshot(response);
      }
    });
  }, []);

  const openDashboard = async () => {
    await sendMessage({ action: 'openEcoArcadeDashboard' });
    window.close();
  };

  return (
    <div className="popup-shell">
      <div className="popup-top">
        <div>
          <div className="popup-brand">EcoArcade</div>
          <div className="popup-subtitle">Daily climate dashboard</div>
        </div>
        <div className="popup-avatar">EA</div>
      </div>

      <div className="popup-hero">
        <div className="popup-kicker">Current site CO2</div>
        <h1 className="popup-title">{formatCO2(snapshot.currentTabCO2)}</h1>
        <p className="popup-copy">
          {snapshot.currentDomain || 'EcoArcade new tab dashboard'}
        </p>
      </div>

      <div className="popup-grid">
        <MiniStat label="Today" value={formatCO2(snapshot.dailyCO2)} />
        <MiniStat label="Points" value={String(snapshot.totalPoints)} />
        <MiniStat label="Rank" value={rankLabel} />
        <MiniStat label="Streak" value={`${snapshot.streakDays}d`} />
      </div>

      <div className="popup-footer">
        <div className="popup-meta">
          <span>{snapshot.ecoTokens} ECO</span>
          <span>{rankLabel}</span>
          <span>Level {snapshot.level}</span>
        </div>
        <button type="button" className="popup-button" onClick={openDashboard}>
          Open full dashboard
        </button>
      </div>
    </div>
  );
}
