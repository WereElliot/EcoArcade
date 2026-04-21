interface LearnSectionProps {
  totalPoints: number;
}

const awarenessVideos = [
  { title: 'Internet carbon footprint', duration: '6m', reward: 28 },
  { title: 'Data center sustainability', duration: '8m', reward: 34 },
  { title: 'Green browsing habits', duration: '5m', reward: 24 }
];

const articles = [
  { title: 'The lifecycle of a click', readTime: '4 min', reward: 22 },
  { title: 'Smarter streaming habits', readTime: '5 min', reward: 26 },
  { title: 'Why green software matters', readTime: '6 min', reward: 30 }
];

export function LearnSection({ totalPoints }: LearnSectionProps) {
  return (
    <div className="space-y-6">
      <header className="rounded-[32px] border border-white/10 bg-slate-950/85 p-6 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-emerald-200/70">Learn</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Earn points while expanding your climate awareness.</h2>
          </div>
          <span className="rounded-full bg-emerald-400/15 px-4 py-2 text-sm uppercase tracking-[0.28em] text-emerald-100">{totalPoints} points collected</span>
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">Watch videos, read articles, and answer adaptive quizzes. Every meaningful learning step awards points and nudges you toward verified climate action.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-5 rounded-[32px] border border-white/10 bg-slate-950/85 p-6 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-emerald-200/70">Video vault</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Curated climate shorts</h3>
            </div>
            <span className="rounded-full bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.28em] text-slate-300">70% watch reward</span>
          </div>
          <div className="space-y-4">
            {awarenessVideos.map((video) => (
              <article key={video.title} className="rounded-3xl border border-white/10 bg-white/5 p-4 transition hover:-translate-y-0.5 hover:bg-white/10">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-base font-semibold text-white">{video.title}</p>
                    <p className="mt-1 text-sm text-slate-400">{video.duration} watch • +{video.reward} pts</p>
                  </div>
                  <button className="rounded-full bg-emerald-400/15 px-4 py-2 text-sm text-emerald-100 transition hover:bg-emerald-400/25">Start</button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-5 rounded-[32px] border border-white/10 bg-slate-950/85 p-6 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-emerald-200/70">Articles</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Reading rewards</h3>
            </div>
            <span className="rounded-full bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.28em] text-slate-300">Timed reading</span>
          </div>
          <div className="space-y-4">
            {articles.map((article) => (
              <article key={article.title} className="rounded-3xl border border-white/10 bg-white/5 p-4 transition hover:-translate-y-0.5 hover:bg-white/10">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-base font-semibold text-white">{article.title}</p>
                    <p className="mt-1 text-sm text-slate-400">{article.readTime} read • +{article.reward} pts</p>
                  </div>
                  <button className="rounded-full bg-cyan-400/15 px-4 py-2 text-sm text-cyan-100 transition hover:bg-cyan-400/25">Read</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-[32px] border border-white/10 bg-emerald-400/10 p-6 shadow-soft">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.28em] text-emerald-200/70">Quiz power</p>
            <p className="mt-3 text-2xl font-semibold text-white">Adaptive</p>
          </div>
          <div className="rounded-3xl bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.28em] text-emerald-200/70">Essay boost</p>
            <p className="mt-3 text-2xl font-semibold text-white">Reflection</p>
          </div>
          <div className="rounded-3xl bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.28em] text-emerald-200/70">Point streak</p>
            <p className="mt-3 text-2xl font-semibold text-white">Daily wins</p>
          </div>
        </div>
      </section>
    </div>
  );
}
