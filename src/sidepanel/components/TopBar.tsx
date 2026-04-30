import logoUrl from '../../../assets/icons/logo-wordmark.png';
import type { ReactNode } from 'react';
import type { DashboardSnapshot, TabId } from '../../types/domain';
import { getRankLabel } from '../../features/carbon/scoring';
import { navItems } from '../config';
import {
  BellIcon,
  FlameIcon,
  GemIcon,
  MoonIcon,
  PointsIcon,
  SearchIcon,
  SunIcon
} from './icons';

function StatChip({
  icon,
  value,
  label,
  tone = 'neutral'
}: {
  icon: ReactNode;
  value: string;
  label: string;
  tone?: 'neutral' | 'emerald' | 'mint' | 'amber';
}) {
  const toneClass = {
    neutral:
      'border-transparent bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))] text-white/68',
    emerald:
      'border-transparent bg-[linear-gradient(180deg,rgba(16,185,129,0.14),rgba(255,255,255,0.03))] text-emerald-100/84',
    mint:
      'border-transparent bg-[linear-gradient(180deg,rgba(45,212,191,0.14),rgba(255,255,255,0.03))] text-teal-100/84',
    amber:
      'border-transparent bg-[linear-gradient(180deg,rgba(132,204,22,0.14),rgba(255,255,255,0.03))] text-lime-100/84'
  }[tone];

  return (
    <div
      className={`flex h-10 min-w-[84px] items-center gap-2 rounded-[18px] border px-2.5 py-1 shadow-[0_12px_28px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 hover:bg-white/8 ${toneClass}`}
    >
      <span className="grid h-6 w-6 place-items-center rounded-full bg-black/16">{icon}</span>
      <div className="min-w-0">
        <div className="text-sm font-semibold leading-none text-white">{value}</div>
        <div className="mt-1 text-[9px] uppercase tracking-[0.22em] text-current/70">{label}</div>
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
  onTabSelect,
  themeMode,
  onToggleTheme
}: {
  snapshot: DashboardSnapshot;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onBellClick: () => void;
  onLogoClick: () => void;
  onStatClick: (tab: TabId) => void;
  activeTab: TabId;
  onTabSelect: (tab: TabId) => void;
  themeMode: 'dark' | 'light';
  onToggleTheme: () => void;
}) {
  return (
    <header className="eco-topbar sticky top-0 z-20 shrink-0 border-b px-2.5 py-1.5 sm:px-3">
      <div className="w-full">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <div className="hidden xl:flex xl:items-center xl:gap-3">
              <button type="button" onClick={onLogoClick} className="transition hover:opacity-90">
                <img src={logoUrl} alt="EcoArcade" className="h-auto w-[112px]" />
              </button>
            </div>
            <button type="button" onClick={onLogoClick} className="xl:hidden">
              <p className="text-sm font-semibold tracking-tight text-white sm:text-base">EcoArcade</p>
            </button>
            <label className="relative block w-full max-w-[360px] xl:max-w-[420px]">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-white/42">
                <SearchIcon className="h-3.5 w-3.5" />
              </span>
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search climate lessons, actions, rewards"
                className="h-10 w-full rounded-[18px] border border-white/8 bg-white/5 pl-9 pr-18 text-[13px] text-white outline-none transition placeholder:text-white/35 focus:border-emerald-400/35 focus:bg-white/7"
              />
              <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center gap-1 text-[10px] text-white/45">
                <kbd className="rounded-md border border-white/10 bg-white/6 px-1.5 py-0.5">Ctrl</kbd>
                <span>+</span>
                <kbd className="rounded-md border border-white/10 bg-white/6 px-1.5 py-0.5">K</kbd>
              </span>
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-1.5 lg:flex-nowrap">
            <button type="button" onClick={() => onStatClick('rewards')}>
              <StatChip
                icon={<PointsIcon className="h-3.5 w-3.5" />}
                value={String(snapshot.totalPoints)}
                label="Points"
                tone="neutral"
              />
            </button>
            <button type="button" onClick={() => onStatClick('rewards')}>
              <StatChip
                icon={<GemIcon className="h-3.5 w-3.5" />}
                value={String(snapshot.ecoTokens)}
                label="Gems"
                tone="mint"
              />
            </button>
            <button type="button" onClick={() => onStatClick('community')}>
              <StatChip
                icon={<FlameIcon className="h-3.5 w-3.5" />}
                value={`${snapshot.streakDays}`}
                label="Streak"
                tone="amber"
              />
            </button>
            <button
              type="button"
              onClick={() => onStatClick('insights')}
              className="hidden h-10 rounded-[18px] border border-transparent bg-[linear-gradient(180deg,rgba(16,185,129,0.16),rgba(255,255,255,0.03))] px-2.5 text-left shadow-[0_12px_28px_rgba(0,0,0,0.18)] sm:block"
            >
              <div className="text-sm font-semibold leading-none text-emerald-50">
                {getRankLabel(snapshot.totalPoints)}
              </div>
              <div className="mt-1 text-[9px] uppercase tracking-[0.22em] text-emerald-100/55">Rank</div>
            </button>
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={`Switch to ${themeMode === 'dark' ? 'light' : 'dark'} mode`}
              className="flex h-10 items-center gap-1.5 rounded-[18px] border border-transparent bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))] px-2.5 text-white/78 shadow-[0_12px_28px_rgba(0,0,0,0.16)] transition hover:-translate-y-0.5 hover:bg-white/8"
            >
              {themeMode === 'dark' ? <SunIcon className="h-3.5 w-3.5" /> : <MoonIcon className="h-3.5 w-3.5" />}
              <span className="hidden text-xs font-medium sm:inline">
                {themeMode === 'dark' ? 'Light' : 'Dark'}
              </span>
            </button>
            <button
              type="button"
              onClick={onBellClick}
              className="relative grid h-10 w-10 place-items-center rounded-[18px] border border-transparent bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))] text-white/72 shadow-[0_12px_28px_rgba(0,0,0,0.16)] transition hover:-translate-y-0.5 hover:bg-white/8"
            >
              <BellIcon className="h-3.5 w-3.5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-fuchsia-500" />
            </button>
            <button
              type="button"
              onClick={onLogoClick}
              className="grid h-10 w-10 place-items-center rounded-[18px] border border-transparent bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.42),transparent_62%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] text-[11px] font-semibold text-white shadow-[0_12px_28px_rgba(0,0,0,0.16)] sm:text-xs"
            >
              EA
            </button>
          </div>
        </div>

        <div className="mt-2 flex gap-2 overflow-x-auto xl:hidden">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabSelect(item.id)}
              className={`min-w-fit rounded-full border px-4 py-2 text-sm transition ${
                activeTab === item.id
                  ? 'border-emerald-400/30 bg-emerald-500/12 text-white'
                  : 'border-white/10 bg-white/5 text-white/62'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
