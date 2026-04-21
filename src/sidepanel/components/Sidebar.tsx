import type { TabId } from '../../types/domain';
import { navItems } from '../config';
import {
  ActIcon,
  ChevronRightIcon,
  CommunityIcon,
  HomeIcon,
  LearnIcon,
  RewardsIcon,
  SparkIcon
} from './icons';

function iconFor(id: TabId) {
  switch (id) {
    case 'insights':
      return HomeIcon;
    case 'learn':
      return LearnIcon;
    case 'act':
      return ActIcon;
    case 'community':
      return CommunityIcon;
    case 'rewards':
      return RewardsIcon;
    default:
      return HomeIcon;
  }
}

export function Sidebar({
  activeTab,
  onSelect,
  onQuickAction
}: {
  activeTab: TabId;
  onSelect: (tab: TabId) => void;
  onQuickAction: () => void;
}) {
  return (
    <aside className="hidden w-[250px] shrink-0 border-r border-white/8 bg-[#0c1017] px-3 py-4 xl:block">
      <div className="flex items-center gap-3 px-3 pb-4">
        <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-violet-500/40 via-blue-400/30 to-emerald-300/20 text-white">
          <SparkIcon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-lg font-semibold tracking-tight text-white">EcoArcade</p>
          <p className="text-xs text-white/45">daily climate flow</p>
        </div>
      </div>

      <div className="px-3">
        <button
          type="button"
          onClick={onQuickAction}
          className="mb-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#10131c] transition hover:-translate-y-0.5"
        >
          <span className="text-lg leading-none">+</span>
          Quick action
        </button>
      </div>

      <div className="space-y-1 px-2">
        {navItems.map((item) => {
          const Icon = iconFor(item.id);
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                active ? 'bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]' : 'text-white/64 hover:bg-white/6 hover:text-white'
              }`}
            >
              <Icon className={`h-4 w-4 ${active ? 'text-violet-300' : 'text-white/55'}`} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{item.label}</div>
                <div className="truncate text-xs text-white/42">{item.subtitle}</div>
              </div>
              <ChevronRightIcon className="h-4 w-4 text-white/28" />
            </button>
          );
        })}
      </div>

      <div className="mt-6 px-3">
        <div className="rounded-[22px] border border-violet-400/20 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.22),transparent_40%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4">
          <p className="text-xs uppercase tracking-[0.28em] text-violet-200/70">Eco Plus</p>
          <p className="mt-2 text-sm font-semibold text-white">Level up with premium climate missions.</p>
        </div>
      </div>
    </aside>
  );
}
