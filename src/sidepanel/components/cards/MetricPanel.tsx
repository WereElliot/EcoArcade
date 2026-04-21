export function MetricPanel({
  label,
  value,
  note,
  tone = 'violet',
  onClick
}: {
  label: string;
  value: string;
  note: string;
  tone?: 'violet' | 'blue' | 'green' | 'amber';
  onClick?: () => void;
}) {
  const tones = {
    violet: 'from-violet-500/22 via-violet-400/8 to-transparent',
    blue: 'from-sky-500/22 via-sky-400/8 to-transparent',
    green: 'from-emerald-500/22 via-emerald-400/8 to-transparent',
    amber: 'from-amber-400/20 via-orange-300/8 to-transparent'
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-[24px] border border-white/10 bg-gradient-to-br ${tones[tone]} p-5 text-left transition hover:-translate-y-0.5 hover:border-white/16`}
    >
      <p className="text-[10px] uppercase tracking-[0.28em] text-white/46">{label}</p>
      <p className="mt-3 text-[30px] font-semibold tracking-tight text-white">{value}</p>
      <p className="mt-2 text-sm text-white/56">{note}</p>
    </button>
  );
}
