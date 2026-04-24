import type { DashboardData, TabId } from '../types';

interface TopBarProps {
  activeTab: TabId;
  searchValue: string;
  onSearchChange: (value: string) => void;
  totals: DashboardData;
  theme: 'dark' | 'light';
  onThemeToggle: () => void;
}

const rankLabel = (points: number) => {
  if (points >= 320) return 'Gaia Guardian';
  if (points >= 200) return 'Carbon Crusader';
  if (points >= 80) return 'Eco Rookie';
  return 'Green Explorer';
};

export function TopBar({ searchValue, onSearchChange, totals, theme, onThemeToggle }: TopBarProps) {
  return (
    <div className="rounded-[16px] border border-white/10 bg-slate-950/85 p-5 shadow-soft backdrop-blur-xl transition duration-300">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-emerald-400/10 text-emerald-200 ring-1 ring-emerald-400/15">
            <span className="text-xl font-semibold">E</span>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-emerald-200/70">EcoArcade</p>
            <h1 className="text-2xl font-semibold text-white sm:text-3xl">Your climate control feed</h1>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto] lg:w-[560px]">
          <label className="relative block">
            <span className="sr-only">Search dashboard</span>
            <input
              type="search"
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search actions, insights, rewards…"
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 pr-12 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-emerald-400/60 focus:ring-2 focus:ring-emerald-400/15"
            />
            <span className="pointer-events-none absolute inset-y-0 right-4 inline-flex items-center text-slate-500">
              <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </span>
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-slate-900/85 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-emerald-200/70">Rank</p>
              <p className="mt-2 text-lg font-semibold text-white">{rankLabel(totals.totalPoints)}</p>
              <p className="mt-1 text-sm text-slate-400">{totals.totalPoints} Eco points</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-900/85 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-emerald-200/70">Eco tokens</p>
                  <p className="mt-2 text-lg font-semibold text-white">{totals.ecoTokens}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-200">
                  <span className="text-sm font-semibold">🌿</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
        <p>Modern climate insights, rewards, and action prompts built to feel premium, calm, and nature-inspired.</p>
        <button
          type="button"
          onClick={onThemeToggle}
          className="rounded-full border border-white/10 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-100 transition hover:bg-emerald-400/15"
        >
          Toggle {theme === 'dark' ? 'light' : 'dark'} theme
        </button>
      </div>
    </div>
  );
}
