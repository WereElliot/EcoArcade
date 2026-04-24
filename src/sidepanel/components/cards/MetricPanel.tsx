export function MetricPanel({
  label,
  value,
  note,
  tone = 'green',
  onClick
}: {
  label: string;
  value: string;
  note: string;
  tone?: 'violet' | 'blue' | 'green' | 'amber';
  onClick?: () => void;
}) {
  const tones = {
    violet: 'from-emerald-500/22 via-green-400/8 to-transparent',
    blue: 'from-lime-500/22 via-emerald-400/8 to-transparent',
    green: 'from-emerald-500/22 via-emerald-400/8 to-transparent',
    amber: 'from-lime-400/20 via-yellow-200/8 to-transparent'
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`eco-surface eco-surface-hover w-full rounded-[24px] border bg-gradient-to-br ${tones[tone]} p-5 text-left transition hover:-translate-y-0.5 hover:border-white/16`}
    >
      <p className="text-[10px] uppercase tracking-[0.28em] text-white/46">{label}</p>
      <p className="mt-3 text-[30px] font-semibold tracking-tight text-white">{value}</p>
      <p className="mt-2 text-sm text-white/56">{note}</p>
    </button>
  );
}
