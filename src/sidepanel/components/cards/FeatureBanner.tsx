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
    <section className="eco-banner relative overflow-hidden rounded-[28px] border p-6 shadow-[0_25px_60px_rgba(0,0,0,0.28)]">
      <div className="max-w-[760px]">
        <p className="text-sm text-white/78">{eyebrow}</p>
        <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-white">{title}</h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/62">{body}</p>
        <button
          type="button"
          onClick={onCta}
          className="eco-cta mt-6 rounded-2xl px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5"
        >
          {cta}
        </button>
      </div>
      <div className="eco-banner-art pointer-events-none absolute right-6 top-6 hidden h-[150px] w-[190px] rounded-[26px] border border-white/14 shadow-[0_20px_45px_rgba(0,0,0,0.28)] lg:block">
        <div className="absolute inset-x-5 bottom-5 rounded-2xl bg-black/28 px-3 py-2 text-right text-xs font-medium uppercase tracking-[0.26em] text-white/65">
          {asideLabel}
        </div>
      </div>
    </section>
  );
}
