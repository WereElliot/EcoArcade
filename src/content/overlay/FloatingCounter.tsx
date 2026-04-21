import { useMemo } from 'react';
import { formatCO2 } from '../../features/carbon/formatters';
import type { OverlaySnapshot } from '../../types/domain';

interface FloatingCounterProps {
  snapshot: OverlaySnapshot;
  onOpenDashboard: () => void;
}

export function FloatingCounter({ snapshot, onOpenDashboard }: FloatingCounterProps) {
  const title = useMemo(() => {
    if (!snapshot.currentDomain) {
      return 'EcoArcade Live';
    }

    return snapshot.currentDomain;
  }, [snapshot.currentDomain]);

  return (
    <div className="ecoarcade-widget">
      <button type="button" className="ecoarcade-card" onClick={onOpenDashboard} aria-label="Open EcoArcade dashboard">
        <div className="ecoarcade-topline">
          <div className="ecoarcade-brand">
            <span className="ecoarcade-orb" aria-hidden="true" />
            <div>
              <p className="ecoarcade-eyebrow">EcoArcade</p>
              <p className="ecoarcade-title">{title}</p>
            </div>
          </div>
          <span className="ecoarcade-badge">{snapshot.trackingEnabled ? 'Live' : 'Paused'}</span>
        </div>

        <div className="ecoarcade-stats">
          <div className="ecoarcade-stat">
            <span className="ecoarcade-label">Tab</span>
            <span className="ecoarcade-value">{formatCO2(snapshot.currentTabCO2)}</span>
          </div>
          <div className="ecoarcade-stat">
            <span className="ecoarcade-label">Today</span>
            <span className="ecoarcade-value">{formatCO2(snapshot.dailyCO2)}</span>
          </div>
          <div className="ecoarcade-stat">
            <span className="ecoarcade-label">Points</span>
            <span className="ecoarcade-value">{snapshot.totalPoints}</span>
          </div>
        </div>

        {!snapshot.trackingEnabled ? (
          <p className="ecoarcade-paused">Tracking is paused right now.</p>
        ) : (
          <p className="ecoarcade-note">Open the dashboard for insights, learning, actions, and rewards.</p>
        )}
      </button>
    </div>
  );
}
