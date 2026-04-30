import type { TabId } from '../../types/domain';
import { navItems } from '../config';
import {
  ActIcon,
  ChevronRightIcon,
  CommunityIcon,
  HomeIcon,
  LearnIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  RewardsIcon
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
  onQuickAction,
  collapsed,
  onToggleCollapse
}: {
  activeTab: TabId;
  onSelect: (tab: TabId) => void;
  onQuickAction: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}) {
  return (
    <aside
      className={`eco-sidebar hidden h-full shrink-0 overflow-y-auto border-r px-3 py-4 transition-[width] duration-200 xl:block ${
        collapsed ? 'w-[88px]' : 'w-[250px]'
      }`}
    >
      <div className="mb-5 flex items-center gap-2 px-1">
        <button
          type="button"
          onClick={onQuickAction}
          className={`eco-cta flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition hover:-translate-y-0.5 ${
            collapsed ? 'h-12 w-12 px-0' : 'flex-1'
          }`}
          aria-label="Quick action"
        >
          <span className="text-lg leading-none">+</span>
          {!collapsed ? 'Quick action' : null}
        </button>
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand menu' : 'Collapse menu'}
          className="grid h-10 w-10 shrink-0 place-items-center text-white/55 transition hover:text-white"
          title={collapsed ? 'Expand menu' : 'Collapse menu'}
        >
          {collapsed ? <PanelLeftOpenIcon className="h-4 w-4" /> : <PanelLeftCloseIcon className="h-4 w-4" />}
        </button>
      </div>

      <div className="space-y-1 px-1">
        {navItems.map((item) => {
          const Icon = iconFor(item.id);
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={`flex w-full items-center rounded-2xl px-3 py-3 text-left transition ${
                collapsed ? 'justify-center gap-0' : 'gap-3'
              } ${
                active ? 'bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]' : 'text-white/64 hover:bg-white/6 hover:text-white'
              }`}
              aria-label={item.label}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`h-4 w-4 ${active ? 'text-emerald-300' : 'text-white/55'}`} />
              {!collapsed ? (
                <>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{item.label}</div>
                    <div className="truncate text-xs text-white/42">{item.subtitle}</div>
                  </div>
                  <ChevronRightIcon className="h-4 w-4 text-white/28" />
                </>
              ) : null}
            </button>
          );
        })}
      </div>

      {!collapsed ? (
        <div className="mt-6 px-3">
          <div className="rounded-[22px] border border-emerald-400/20 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.22),transparent_40%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4">
            <p className="text-xs uppercase tracking-[0.28em] text-emerald-200/70">Eco Plus</p>
            <p className="mt-2 text-sm font-semibold text-white">Level up with premium climate missions.</p>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
