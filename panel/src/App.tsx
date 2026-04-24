import { useEffect, useMemo, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { HomeDashboard } from './components/HomeDashboard';
import { LearnSection } from './components/LearnSection';
import { ActSection } from './components/ActSection';
import { CommunitySection } from './components/CommunitySection';
import { RewardsSection } from './components/RewardsSection';
import type { DashboardData, TabId } from './types';

const defaultDashboardData: DashboardData = {
  totalCO2: 0,
  totalPoints: 0,
  badges: [],
  siteStats: {},
  history: {},
  currentTabCO2: 0,
  dailyCO2: 0,
  weeklyCO2: 0
};

const pageSections: Array<{ id: TabId; label: string }> = [
  { id: 'home', label: 'Insights' },
  { id: 'learn', label: 'Learn' },
  { id: 'act', label: 'Act' },
  { id: 'community', label: 'Community' },
  { id: 'rewards', label: 'Rewards' }
];

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [dashboardData, setDashboardData] = useState<DashboardData>(defaultDashboardData);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('ecoarcadePanelTheme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
    window.localStorage.setItem('ecoarcadePanelTheme', theme);
  }, [theme]);

  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ action: 'getDashboardData' }, (response) => {
        if (response && typeof response.totalCO2 === 'number') {
          setDashboardData({ ...defaultDashboardData, ...response });
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const currentSection = useMemo(() => {
    switch (activeTab) {
      case 'learn':
        return <LearnSection totalPoints={dashboardData.totalPoints} />;
      case 'act':
        return <ActSection />;
      case 'community':
        return <CommunitySection />;
      case 'rewards':
        return <RewardsSection />;
      default:
        return <HomeDashboard data={dashboardData} loading={loading} />;
    }
  }, [activeTab, dashboardData, loading]);

  return (
    <div className="min-h-screen bg-eco-radial px-4 py-5 text-gray-700 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-[1600px] gap-6 xl:grid-cols-[300px_minmax(0,1fr)] lg:gap-7">
        <Sidebar
          activeTab={activeTab}
          onSelect={setActiveTab}
          theme={theme}
          onThemeToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          totals={dashboardData}
        />

        <div className="space-y-6">
          <header className="rounded-[16px] border border-gray-200 bg-white p-6 shadow-soft backdrop-blur-xl">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-3 rounded-full bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
                  <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 font-semibold">E</span>
                  <span className="font-semibold">EcoArcade</span>
                </div>
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.32em] text-emerald-600">Climate feed</p>
                  <h1 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">Climate action built like a premium daily feed.</h1>
                  <p className="max-w-3xl text-sm leading-7 text-gray-500">A calming, premium dashboard for tracking carbon, rewards, verified action, and community progress in one elegant view.</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-[1fr_auto] xl:grid-cols-[minmax(0,1fr)_auto_auto]">
                <label className="relative block">
                  <span className="sr-only">Search</span>
                  <input
                    type="search"
                    placeholder="Search actions, cards, rewards"
                    className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400">⌘K</span>
                </label>
                <div className="rounded-3xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700">
                  <p className="text-xs uppercase tracking-[0.28em] text-gray-500">Rank</p>
                  <p className="mt-1 font-semibold text-gray-900">Gaia Guardian</p>
                </div>
                <div className="flex items-center gap-3 rounded-3xl border border-gray-200 bg-emerald-50 px-4 py-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600 font-semibold">GA</div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-gray-500">Eco Points</p>
                    <p className="mt-1 text-base font-semibold text-gray-900">{loading ? '—' : dashboardData.totalPoints}</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <section className="rounded-[16px] border border-gray-200 bg-white p-6 shadow-soft">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-gray-100 bg-gray-50 p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-emerald-600">Current tab</p>
                  <p className="mt-4 text-3xl font-semibold text-gray-900">{loading ? '—' : `${dashboardData.currentTabCO2.toFixed(1)}g`}</p>
                  <p className="mt-2 text-sm text-gray-500">Active page carbon.</p>
                </div>
                <div className="rounded-3xl border border-gray-100 bg-gray-50 p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-emerald-600">Today</p>
                  <p className="mt-4 text-3xl font-semibold text-gray-900">{loading ? '—' : `${dashboardData.dailyCO2.toFixed(1)}g`}</p>
                  <p className="mt-2 text-sm text-gray-500">Total browsing impact.</p>
                </div>
                <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-700 shadow-glow">
                  <p className="text-xs uppercase tracking-[0.3em] text-emerald-600">Eco points</p>
                  <p className="mt-4 text-3xl font-semibold text-gray-900">{loading ? '—' : dashboardData.totalPoints}</p>
                  <p className="mt-2 text-sm text-emerald-600">Reward balance.</p>
                </div>
              </div>
            </section>

            <aside className="space-y-5">
              <section className="rounded-[16px] border border-gray-200 bg-white p-6 shadow-soft">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.32em] text-emerald-600">Profile</p>
                    <h2 className="mt-2 text-xl font-semibold text-gray-900">Daily motion</h2>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs uppercase tracking-[0.24em] text-emerald-600">Live</span>
                </div>
                <div className="mt-5 rounded-3xl bg-gray-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-600 font-semibold">GA</div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Gaia Guardian</p>
                      <p className="text-sm text-gray-500">Eco level 7 • 23 missions</p>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-3">
                    <div className="rounded-3xl bg-gray-100 p-4">
                      <p className="text-xs uppercase tracking-[0.28em] text-emerald-600">Next milestone</p>
                      <p className="mt-2 text-2xl font-semibold text-gray-900">300 pts</p>
                    </div>
                    <div className="rounded-3xl bg-emerald-50 p-4">
                      <p className="text-xs uppercase tracking-[0.28em] text-emerald-600">Tip</p>
                      <p className="mt-2 text-sm leading-6 text-gray-600">Close idle tabs and switch to low-bandwidth streaming when possible.</p>
                    </div>
                  </div>
                </div>
              </section>
            </aside>
          </div>

          <main className="space-y-6">
            <section className="rounded-[16px] border border-gray-200 bg-white p-6 shadow-soft">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.32em] text-emerald-600">Featured</p>
                  <h2 className="mt-2 text-3xl font-semibold text-gray-900">A feed of climate actions and insights</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {pageSections.map((section) => (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => setActiveTab(section.id)}
                      className={`rounded-full px-4 py-2 text-sm transition ${
                        activeTab === section.id
                          ? 'bg-emerald-400/15 text-emerald-100 ring-1 ring-emerald-400/25'
                          : 'bg-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {section.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid gap-5 lg:grid-cols-2">
                <article className="group rounded-[12px] border border-gray-200 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-3xl bg-emerald-100 px-3 py-1 text-xs uppercase tracking-[0.28em] text-emerald-600">Insight</span>
                    <span className="text-xs uppercase tracking-[0.28em] text-gray-400">5m read</span>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-gray-900">How your active tab shapes today's carbon story</h3>
                  <p className="mt-3 text-sm leading-7 text-gray-500">Learn which actions are most effective in lowering your footprint while still preserving a premium browsing experience.</p>
                </article>
                <article className="group rounded-[12px] border border-gray-200 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-3xl bg-cyan-100 px-3 py-1 text-xs uppercase tracking-[0.28em] text-cyan-600">Action</span>
                    <span className="text-xs uppercase tracking-[0.28em] text-gray-400">+40 pts</span>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-gray-900">Switch to eco mode on streaming</h3>
                  <p className="mt-3 text-sm leading-7 text-gray-500">Reduce energy use during video playback with a single click and instantly earn a reward boost.</p>
                </article>
                <article className="group rounded-[12px] border border-gray-200 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-3xl bg-violet-100 px-3 py-1 text-xs uppercase tracking-[0.28em] text-violet-600">Community</span>
                    <span className="text-xs uppercase tracking-[0.28em] text-gray-400">Live</span>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-gray-900">Join the plant 100 trees mission</h3>
                  <p className="mt-3 text-sm leading-7 text-gray-500">Share proof, earn verified badges, and climb the leaderboard with community momentum.</p>
                </article>
                <article className="group rounded-[12px] border border-gray-200 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-3xl bg-emerald-100 px-3 py-1 text-xs uppercase tracking-[0.28em] text-emerald-600">Rewards</span>
                    <span className="text-xs uppercase tracking-[0.28em] text-gray-400">Fast</span>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-gray-900">Redeem points for carbon-backed tokens</h3>
                  <p className="mt-3 text-sm leading-7 text-gray-500">Convert your effort into climate-positive impact with token rewards tailored to your progress.</p>
                </article>
              </div>
            </section>

            <section className="space-y-6">{currentSection}</section>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
