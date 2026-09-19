import {
  ChartColumn,
  CalendarDays,
  LayoutDashboard,
  ListTodo,
  StickyNote,
  Sparkles,
} from 'lucide-react';
import type { PageKey } from '../../types';
import { useApp } from '../../store/AppContext';
import { cx } from '../../lib/ui';

export const navItems: { key: PageKey; label: string; icon: typeof LayoutDashboard }[] = [
  { key: 'dashboard', label: '首页', icon: LayoutDashboard },
  { key: 'tasks', label: '任务', icon: ListTodo },
  { key: 'calendar', label: '日程', icon: CalendarDays },
  { key: 'notes', label: '笔记', icon: StickyNote },
  { key: 'insights', label: '洞察', icon: ChartColumn },
];

export default function Sidebar() {
  const { page, navigate } = useApp();
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[220px] flex-col border-r border-gray-200/80 bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-gray-900/80 md:flex">
      <div className="flex h-14 items-center gap-2.5 px-5">
        <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 text-white shadow-sm">
          <Sparkles size={16} />
        </div>
        <div>
          <p className="text-sm font-bold leading-none">Nimbus</p>
          <p className="mt-1 text-[10px] leading-none text-gray-400">个人工作台 · Demo</p>
        </div>
      </div>

      <nav className="mt-2 flex-1 space-y-1 px-3" aria-label="主导航">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = page === item.key;
          return (
            <button
              key={item.key}
              onClick={() => navigate(item.key)}
              aria-current={active ? 'page' : undefined}
              className={cx(
                'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors duration-150',
                active
                  ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/60 dark:hover:text-gray-100'
              )}
            >
              <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-gray-200/80 p-3 dark:border-gray-800">
        <button
          onClick={() => navigate('insights')}
          className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <kbd className="rounded border border-gray-300 px-1 font-mono dark:border-gray-700">
            Ctrl K
          </kbd>
          呼出命令面板
        </button>
        <div className="mt-1 flex items-center gap-2.5 rounded-xl px-2 py-2">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-rose-400 text-xs font-bold text-white">
            先
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold">先生</p>
            <p className="truncate text-[10px] text-gray-400">产品经理 · 北京</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
