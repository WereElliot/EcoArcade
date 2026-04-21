const challenges = [
  { title: 'Plant 100 Trees', description: 'Join a climate push to plant 100 verified trees today.', reward: '+150 XP' },
  { title: 'Clean-up weekend', description: 'Log one cleanup action with proof and invite friends.', reward: '+85 XP' },
  { title: 'Zero-waste sprint', description: 'Complete one video, one article, and one real action.', reward: '+40 XP' }
];

const leaderboard = [
  { name: 'Nina', score: 1340, avatar: 'N' },
  { name: 'Mateo', score: 1260, avatar: 'M' },
  { name: 'Sora', score: 1120, avatar: 'S' },
  { name: 'Leila', score: 1040, avatar: 'L' }
];

export function CommunitySection() {
  return (
    <div className="space-y-6">
      <header className="rounded-[32px] border border-white/10 bg-slate-950/85 p-6 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-emerald-200/70">Community</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Live climate challenges and leaderboards.</h2>
          </div>
          <span className="rounded-full bg-cyan-400/15 px-4 py-2 text-sm uppercase tracking-[0.28em] text-cyan-100">Solana impact</span>
        </div>
        <p className="mt-4 text-sm leading-7 text-slate-300">Compete with the community, complete challenges, and watch your verified impact rise with every action.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-4 rounded-[32px] border border-white/10 bg-slate-950/85 p-6 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-emerald-200/70">Challenges</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Today’s active missions</h3>
            </div>
            <button className="rounded-full bg-white/5 px-4 py-2 text-sm uppercase tracking-[0.28em] text-slate-300 hover:bg-white/10">View all</button>
          </div>
          <div className="space-y-4">
            {challenges.map((challenge) => (
              <div key={challenge.title} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-base font-semibold text-white">{challenge.title}</p>
                    <p className="mt-1 text-sm text-slate-400">{challenge.description}</p>
                  </div>
                  <span className="rounded-full bg-emerald-300/15 px-3 py-1 text-sm text-emerald-100">{challenge.reward}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[32px] border border-white/10 bg-slate-950/85 p-6 shadow-soft">
          <p className="text-sm uppercase tracking-[0.32em] text-emerald-200/70">Leaderboard</p>
          <h3 className="mt-2 text-xl font-semibold text-white">Top climate performers</h3>
          <div className="mt-6 space-y-3">
            {leaderboard.map((player, index) => (
              <div key={player.name} className="flex items-center justify-between gap-3 rounded-3xl bg-white/5 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-300/15 text-lg font-semibold text-emerald-100">{player.avatar}</div>
                  <div>
                    <p className="font-semibold text-white">{player.name}</p>
                    <p className="text-sm text-slate-400">Impact score</p>
                  </div>
                </div>
                <span className="rounded-full bg-white/5 px-3 py-1 text-sm text-slate-300">{player.score}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
