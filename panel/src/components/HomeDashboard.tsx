import type { DashboardData } from '../types';

const realWorldEquivalent = (grams: number) => {
  if (grams < 75) return 'a short email';
  if (grams < 250) return 'one smartphone charge';
  if (grams < 750) return 'a latte';
  return 'a 10-minute video call';
};

interface HomeDashboardProps {
  data: DashboardData;
  loading: boolean;
}

export function HomeDashboard({ data, loading }: HomeDashboardProps) {
  const comparison = realWorldEquivalent(data.dailyCO2);
  const treeEquivalent = Math.max(1, Math.round(data.dailyCO2 / 22));
  const weeklyGoal = 700;
  const weeklyProgress = Math.min(100, (data.weeklyCO2 / weeklyGoal) * 100);
  const pointsGoal = 300;
  const pointsProgress = Math.min(100, (data.totalPoints / pointsGoal) * 100);

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.55fr_0.95fr]">
        <div className="rounded-[32px] border border-white/10 bg-slate-950/85 p-8 shadow-soft">
          <div className="flex flex-col gap-6">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.32em] text-emerald-200/70">Home / Insights</p>
              <h2 className="text-3xl font-semibold text-white sm:text-4xl">Planet impact in one calm view.</h2>
              <p className="max-w-2xl text-sm leading-7 text-slate-300">Your browsing footprint is now visible with premium climate context, real-world comparisons, and motivating progress that makes every session feel meaningful.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-emerald-400/10 to-slate-950/60 p-6 shadow-glow">
                <p className="text-sm uppercase tracking-[0.3em] text-emerald-100/75">Today</p>
                <p className="mt-4 text-5xl font-semibold text-white">{loading ? '—' : `${data.dailyCO2.toFixed(1)}g`}</p>
                <p className="mt-3 text-sm text-slate-300">Equivalent to {loading ? '—' : comparison}.</p>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-soft">
                <p className="text-sm uppercase tracking-[0.3em] text-emerald-200/70">Current tab</p>
                <p className="mt-4 text-5xl font-semibold text-white">{loading ? '—' : `${data.currentTabCO2.toFixed(1)}g`}</p>
                <p className="mt-3 text-sm text-slate-400">Live carbon from your active tab.</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-emerald-200/70">Rank</p>
                <p className="mt-3 text-2xl font-semibold text-white">Gaia Guardian</p>
              </div>
              <div className="rounded-3xl bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-emerald-200/70">Eco streak</p>
                <p className="mt-3 text-2xl font-semibold text-white">5 days</p>
              </div>
              <div className="rounded-3xl bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-emerald-200/70">Tree equivalent</p>
                <p className="mt-3 text-2xl font-semibold text-white">{loading ? '—' : `${treeEquivalent} trees`}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[32px] border border-white/10 bg-slate-950/85 p-6 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-emerald-200/70">AI Climate Guardian</p>
                <h3 className="mt-2 text-xl font-semibold text-white">Personalized action tip</h3>
              </div>
              <span className="rounded-full bg-emerald-300/15 px-3 py-1 text-xs uppercase tracking-[0.24em] text-emerald-100">Gemini</span>
            </div>
            <p className="mt-5 text-sm leading-7 text-slate-300">Your browsing pattern is calm today. Keep this flow by closing idle tabs, switching to lower-bandwidth modes when streaming, and checking in on daily impact before hour two.</p>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-slate-950/85 p-6 shadow-soft">
            <p className="text-xs uppercase tracking-[0.32em] text-emerald-200/70">Progress rings</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Weekly goal', value: `${Math.round(weeklyProgress)}%`, accent: 'bg-emerald-400/10', fill: weeklyProgress },
                { label: 'Eco points', value: `${Math.round(pointsProgress)}%`, accent: 'bg-cyan-400/10', fill: pointsProgress },
                { label: 'Streak', value: '80%', accent: 'bg-violet-400/10', fill: 80 }
              ].map((item) => (
                <div key={item.label} className="rounded-3xl bg-white/5 p-4 text-center">
                  <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-white/10 bg-slate-900/80">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400/20 to-cyan-400/10 blur-xl" />
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-slate-950/90">
                      <p className="text-lg font-semibold text-white">{item.value}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-slate-300">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-[28px] border border-white/10 bg-slate-950/85 p-6 shadow-soft">
          <p className="text-sm uppercase tracking-[0.32em] text-emerald-200/70">Momentum</p>
          <h3 className="mt-3 text-xl font-semibold text-white">Your carbon actions today</h3>
          <p className="mt-4 text-sm text-slate-300">Keep your browsing light and earn points by choosing low-carbon actions in the Learn and Act sections.</p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-slate-950/85 p-6 shadow-soft">
          <p className="text-sm uppercase tracking-[0.32em] text-emerald-200/70">Rewards</p>
          <h3 className="mt-3 text-xl font-semibold text-white">Eco Tokens in reach</h3>
          <p className="mt-4 text-sm text-slate-300">Convert points into Solana tokens and donate to verified climate projects in the Rewards tab.</p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-slate-950/85 p-6 shadow-soft">
          <p className="text-sm uppercase tracking-[0.32em] text-emerald-200/70">Community</p>
          <h3 className="mt-3 text-xl font-semibold text-white">Join live challenges</h3>
          <p className="mt-4 text-sm text-slate-300">Take part in daily and weekly climate quests, see leaderboards, and compete for the top spot.</p>
        </div>
      </section>
    </div>
  );
}
