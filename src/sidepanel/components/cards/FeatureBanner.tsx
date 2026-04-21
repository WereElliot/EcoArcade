export function FeatureBanner({
  eyebrow,
  title,
  body,
  cta,
  asideLabel,
  onCta
}: {
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  asideLabel: string;
  onCta?: () => void;
}) {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-violet-500/35 bg-[radial-gradient(circle_at_top_right,rgba(113,47,255,0.38),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.18),transparent_24%),linear-gradient(180deg,#0f141d_0%,#111722_100%)] p-6 shadow-[0_25px_60px_rgba(0,0,0,0.28)]">
      <div className="max-w-[760px]">
        <p className="text-sm text-white/78">{eyebrow}</p>
        <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-white">{title}</h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/62">{body}</p>
        <button
          type="button"
          onClick={onCta}
          className="mt-6 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#11131b] transition hover:-translate-y-0.5"
        >
          {cta}
        </button>
      </div>
      <div className="pointer-events-none absolute right-6 top-6 hidden h-[150px] w-[190px] rounded-[26px] border border-white/14 bg-[radial-gradient(circle_at_35%_30%,rgba(255,157,238,0.85),transparent_22%),radial-gradient(circle_at_70%_65%,rgba(255,179,71,0.85),transparent_28%),radial-gradient(circle_at_45%_50%,rgba(99,102,241,0.95),transparent_45%),linear-gradient(180deg,rgba(42,14,85,0.9),rgba(12,18,28,0.6))] shadow-[0_20px_45px_rgba(0,0,0,0.28)] lg:block">
        <div className="absolute inset-x-5 bottom-5 rounded-2xl bg-black/28 px-3 py-2 text-right text-xs font-medium uppercase tracking-[0.26em] text-white/65">
          {asideLabel}
        </div>
      </div>
    </section>
  );
}
