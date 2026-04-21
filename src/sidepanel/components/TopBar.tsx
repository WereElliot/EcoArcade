import type { ReactNode } from 'react';
import type { DashboardSnapshot, TabId } from '../../types/domain';
import { getRankLabel, navItems } from '../config';
import { BellIcon, FlameIcon, GemIcon, PointsIcon, SearchIcon } from './icons';

function StatChip({
  icon,
  value,
  label
}: {
  icon: ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-white/8 bg-white/5 px-3 py-2">
      <span className="text-white/60">{icon}</span>
      <div>
        <div className="text-sm font-semibold text-white">{value}</div>
        <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">{label}</div>
      </div>
    </div>
  );
}

export function TopBar({
  snapshot,
  searchQuery,
  onSearchChange,
  onBellClick,
  onLogoClick,
  onStatClick,
  activeTab,
  onTabSelect
}: {
  snapshot: DashboardSnapshot;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onBellClick: () => void;
  onLogoClick: () => void;
  onStatClick: (tab: TabId) => void;
  activeTab: TabId;
  onTabSelect: (tab: TabId) => void;
}) {
  return (
    <header className="border-b border-white/8 bg-[#0c1017] px-4 py-4 sm:px-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 items-center gap-4">
          <button type="button" onClick={onLogoClick} className="xl:hidden">
          <p className="text-base font-semibold tracking-tight text-white">EcoArcade</p>
          </button>
          <label className="relative block w-full max-w-[440px]">
            <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-white/42">
              <SearchIcon className="h-4 w-4" />
            </span>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search climate lessons, actions, rewards"
              className="h-12 w-full rounded-2xl border border-white/8 bg-white/5 pl-11 pr-24 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-violet-400/35 focus:bg-white/7"
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center gap-1 text-xs text-white/45">
              <kbd className="rounded-md border border-white/10 bg-white/6 px-2 py-1">Ctrl</kbd>
              <span>+</span>
              <kbd className="rounded-md border border-white/10 bg-white/6 px-2 py-1">K</kbd>
            </span>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => onStatClick('rewards')}>
            <StatChip icon={<PointsIcon className="h-4 w-4" />} value={String(snapshot.totalPoints)} label="Points" />
          </button>
          <button type="button" onClick={() => onStatClick('rewards')}>
            <StatChip icon={<GemIcon className="h-4 w-4" />} value={String(snapshot.ecoTokens)} label="Gems" />
          </button>
          <button type="button" onClick={() => onStatClick('community')}>
            <StatChip icon={<FlameIcon className="h-4 w-4" />} value={`${snapshot.streakDays}`} label="Streak" />
          </button>
          <button
            type="button"
            onClick={() => onStatClick('insights')}
            className="hidden rounded-2xl border border-violet-400/20 bg-violet-500/10 px-3 py-2 text-left sm:block"
          >
            <div className="text-sm font-semibold text-violet-100">{getRankLabel(snapshot.totalPoints)}</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-violet-100/50">Rank</div>
          </button>
          <button
            type="button"
            onClick={onBellClick}
            className="relative grid h-11 w-11 place-items-center rounded-2xl border border-white/8 bg-white/5 text-white/72 transition hover:bg-white/8"
          >
            <BellIcon className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-fuchsia-500" />
          </button>
          <button
            type="button"
            onClick={onLogoClick}
            className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.35),transparent_60%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] text-sm font-semibold text-white"
          >
            EA
          </button>
        </div>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto xl:hidden">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onTabSelect(item.id)}
            className={`min-w-fit rounded-full border px-4 py-2 text-sm transition ${
              activeTab === item.id
                ? 'border-violet-400/30 bg-violet-500/12 text-white'
                : 'border-white/10 bg-white/5 text-white/62'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
}
