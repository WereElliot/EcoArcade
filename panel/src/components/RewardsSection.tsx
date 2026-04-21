export function RewardsSection() {
  return (
    <div className="space-y-6">
      <header className="rounded-[32px] border border-white/10 bg-slate-950/85 p-6 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-emerald-200/70">Rewards</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Turn Eco Points into real climate impact.</h2>
          </div>
          <span className="rounded-full bg-emerald-400/15 px-4 py-2 text-sm uppercase tracking-[0.28em] text-emerald-100">Solana-ready</span>
        </div>
        <p className="mt-4 text-sm leading-7 text-slate-300">Convert your earned points into EcoTokens, buy climate-backed tokens, or donate them to real-world restoration projects.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[32px] border border-white/10 bg-slate-950/85 p-6 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-emerald-200/70">Convert points</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Eco Points ? EcoTokens</h3>
            </div>
            <span className="rounded-full bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.28em] text-slate-300">1 point = 0.1 token</span>
          </div>
          <div className="mt-6 space-y-5 rounded-[28px] bg-white/5 p-5">
            <label className="block text-sm text-slate-300">Points to swap</label>
            <input className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/90 px-4 py-3 text-white outline-none focus:border-emerald-300/60" type="number" defaultValue={120} min={0} />
            <label className="block text-sm text-slate-300">Estimated EcoTokens</label>
            <input className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900/90 px-4 py-3 text-white outline-none" type="text" defaultValue="12.0" readOnly />
            <button className="w-full rounded-3xl bg-gradient-to-r from-emerald-400 to-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110">Convert points</button>
          </div>
        </section>

        <section className="rounded-[32px] border border-white/10 bg-emerald-400/10 p-6 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-emerald-200/70">Donations</p>
              <h3 className="mt-2 text-xl font-semibold text-white">Support climate projects</h3>
            </div>
            <span className="rounded-full bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.28em] text-slate-300">Low fee</span>
          </div>
          <div className="mt-6 space-y-4 rounded-[28px] border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-300">Use EcoTokens to back verified climate work on Solana. Select a cause and donate with a single smooth flow.</p>
            <ul className="space-y-3 text-sm text-slate-200">
              <li className="rounded-2xl bg-slate-900/70 px-4 py-3">?? Tree restoration</li>
              <li className="rounded-2xl bg-slate-900/70 px-4 py-3">?? Cleanup and water projects</li>
              <li className="rounded-2xl bg-slate-900/70 px-4 py-3">?? Clean energy funding</li>
            </ul>
            <button className="w-full rounded-3xl border border-emerald-300/25 bg-emerald-300/10 px-5 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-300/15">Donate EcoTokens</button>
          </div>
        </section>
      </div>
    </div>
  );
}
