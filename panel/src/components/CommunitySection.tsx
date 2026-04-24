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
      <header className="rounded-[16px] border border-gray-200 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-emerald-600">Community</p>
            <h2 className="mt-2 text-3xl font-semibold text-gray-900">Live climate challenges and leaderboards.</h2>
          </div>
          <span className="rounded-full bg-cyan-100 px-4 py-2 text-sm uppercase tracking-[0.28em] text-cyan-600">Solana impact</span>
        </div>
        <p className="mt-4 text-sm leading-7 text-gray-500">Compete with the community, complete challenges, and watch your verified impact rise with every action.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-4 rounded-[16px] border border-gray-200 bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-emerald-600">Challenges</p>
              <h3 className="mt-2 text-xl font-semibold text-gray-900">Today's active missions</h3>
            </div>
            <button className="rounded-full bg-gray-100 px-4 py-2 text-sm uppercase tracking-[0.28em] text-gray-500 hover:bg-gray-200">View all</button>
          </div>
          <div className="space-y-4">
            {challenges.map((challenge) => (
              <div key={challenge.title} className="rounded-3xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-base font-semibold text-gray-900">{challenge.title}</p>
                    <p className="mt-1 text-sm text-gray-500">{challenge.description}</p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm text-emerald-600">{challenge.reward}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[16px] border border-gray-200 bg-white p-6 shadow-soft">
          <p className="text-sm uppercase tracking-[0.32em] text-emerald-600">Leaderboard</p>
          <h3 className="mt-2 text-xl font-semibold text-gray-900">Top climate performers</h3>
          <div className="mt-6 space-y-3">
            {leaderboard.map((player, index) => (
              <div key={player.name} className="flex items-center justify-between gap-3 rounded-3xl bg-gray-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-lg font-semibold text-emerald-600">{player.avatar}</div>
                  <div>
                    <p className="font-semibold text-gray-900">{player.name}</p>
                    <p className="text-sm text-gray-500">Impact score</p>
                  </div>
                </div>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-500">{player.score}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
