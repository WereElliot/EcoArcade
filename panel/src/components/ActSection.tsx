const actions = [
  {
    title: 'Tree planting proof',
    description: 'Upload a photo with GPS and timestamp so the AI verifier can confirm the action.',
    status: 'Verified'
  },
  {
    title: 'Cleanup evidence',
    description: 'Submit a clean-up image and earn a verified reward badge.',
    status: 'Pending'
  }
];

export function ActSection() {
  return (
    <div className="space-y-6">
      <header className="rounded-[32px] border border-white/10 bg-slate-950/85 p-6 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-emerald-200/70">Act</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Real-world action, verified and rewarded.</h2>
          </div>
          <span className="rounded-full bg-emerald-400/15 px-4 py-2 text-sm uppercase tracking-[0.28em] text-emerald-100">AI verification</span>
        </div>
        <p className="mt-4 text-sm leading-7 text-slate-300">Upload proof of tree planting, clean-ups, or climate-friendly habits. Our AI healer checks GPS, timestamp, and image quality before granting your reward.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[32px] border border-white/10 bg-slate-950/85 p-6 shadow-soft">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.32em] text-emerald-200/70">Photo upload</p>
                <h3 className="mt-2 text-xl font-semibold text-white">Submit your action proof</h3>
              </div>
              <span className="rounded-full bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.28em] text-slate-300">Secure</span>
            </div>
            <div className="rounded-[28px] border border-dashed border-white/10 bg-white/5 p-6 text-center text-slate-300">
              <p className="text-base font-semibold text-white">Drag and drop a photo or choose a file</p>
              <p className="mt-2 text-sm text-slate-400">PNG, JPEG, or HEIC • GPS metadata required • max 12MB</p>
              <button type="button" className="mt-5 rounded-full bg-emerald-400/15 px-6 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/25">Upload proof</button>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-white/10 bg-emerald-400/10 p-6 shadow-soft">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.32em] text-emerald-200/70">Verification status</p>
                <h3 className="mt-2 text-xl font-semibold text-white">AI climate review</h3>
              </div>
              <span className="rounded-full bg-slate-900/80 px-3 py-1 text-xs uppercase tracking-[0.28em] text-slate-300">Fast feedback</span>
            </div>
            <p className="text-sm leading-7 text-slate-300">Every upload is checked by our Gemini-powered verifier for location, timestamp, and visual evidence before the action is approved.</p>
            <div className="space-y-3">
              {actions.map((action) => (
                <div key={action.title} className="rounded-3xl bg-slate-900/90 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{action.title}</p>
                      <p className="mt-1 text-sm text-slate-400">{action.description}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-sm ${action.status === 'Verified' ? 'bg-emerald-300/20 text-emerald-100' : 'bg-amber-300/15 text-amber-100'}`}>
                      {action.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
