import type { DashboardData, TabId } from '../types';

const navItems: Array<{ id: TabId; label: string; icon: JSX.Element }> = [
  {
    id: 'home',
    label: 'Insights',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12.5L12 5l9 7.5" />
        <path d="M6.5 10.5V19h11v-8.5" />
      </svg>
    )
  },
  {
    id: 'learn',
    label: 'Learn',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 5.5h9.5a2.5 2.5 0 0 1 2.5 2.5V19H8.5A2.5 2.5 0 0 0 6 21V5.5Z" />
      </svg>
    )
  },
  {
    id: 'act',
    label: 'Act',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.5 20.5a7.5 7.5 0 1 1 5.3-12.8" />
        <path d="M13 11.5 20 4.5" />
        <path d="M15 4.5h5v5" />
      </svg>
    )
  },
  {
    id: 'community',
    label: 'Community',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 4.5 14.1 8.7l4.6.7-3.3 3.2.8 4.6L12 15l-4.2 2.2.8-4.6-3.3-3.2 4.6-.7L12 4.5Z" />
      </svg>
    )
  },
  {
    id: 'rewards',
    label: 'Rewards',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 8.5h15v9a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2v-9Z" />
        <path d="M4.5 10.5h15" />
        <path d="M15.5 14.5h2.5" />
        <path d="M7.5 8.5V7a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v1.5" />
      </svg>
    )
  }
];

interface SidebarProps {
  activeTab: TabId;
  onSelect: (tab: TabId) => void;
  theme: 'dark' | 'light';
  onThemeToggle: () => void;
  totals: DashboardData;
}

export function Sidebar({ activeTab, onSelect, theme, onThemeToggle, totals }: SidebarProps) {
  return (
    <aside className="sticky top-4 space-y-6 rounded-[16px] border border-emerald-200 bg-emerald-50 p-5 shadow-soft backdrop-blur-xl lg:top-6">
      <div className="rounded-[28px] border border-emerald-200 bg-white p-5 shadow-[0_18px_44px_rgba(16,185,129,0.15)]">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-emerald-100 ring-1 ring-emerald-200">
            <img src="../assets/icons/logo.png" alt="EcoArcade" className="h-8 w-8 object-contain" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-emerald-600">EcoArcade</p>
            <h2 className="text-lg font-semibold text-gray-900">Planet-friendly browsing</h2>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-gray-500">A premium climate dashboard built for calm daily tracking, verified action, and reward-based sustainability.</p>
      </div>

      <div className="grid gap-3 rounded-[28px] border border-emerald-200 bg-white p-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition ${
              activeTab === item.id
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-soft'
                : 'border-transparent text-gray-600 hover:border-emerald-200 hover:bg-emerald-50'
            }`}
            onClick={() => onSelect(item.id)}
            aria-current={activeTab === item.id ? 'page' : undefined}
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="space-y-4 rounded-[28px] border border-emerald-200 bg-emerald-50 p-5 shadow-soft text-gray-700">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-emerald-600">Quick summary</p>
            <h3 className="mt-2 text-sm font-semibold text-gray-900">Today's momentum</h3>
          </div>
          <button
            type="button"
            className="rounded-full border border-emerald-200 bg-white px-3 py-2 text-sm text-emerald-600 transition hover:bg-emerald-100"
            onClick={onThemeToggle}
          >
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
        </div>

        <div className="grid gap-3">
          <div className="rounded-3xl bg-white p-4">
            <p className="text-xs uppercase tracking-[0.28em] text-emerald-600">Total carbon</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">{totals.totalCO2.toFixed(1)}g</p>
          </div>
          <div className="rounded-3xl bg-white p-4">
            <p className="text-xs uppercase tracking-[0.28em] text-emerald-600">Eco points</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">{totals.totalPoints}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
