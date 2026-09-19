import { CalendarDays, ChartColumn, LayoutDashboard, ListTodo, Sparkles, StickyNote } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { cx } from '../../lib/ui';

const tabs = [
  { key: 'dashboard', label: '首页', icon: LayoutDashboard },
  { key: 'tasks', label: '任务', icon: ListTodo },
  { key: 'calendar', label: '日程', icon: CalendarDays },
  { key: 'notes', label: '笔记', icon: StickyNote },
  { key: 'insights', label: '洞察', icon: ChartColumn },
] as const;

export default function BottomTabs() {
  const { page, navigate, openChat } = useApp();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 flex items-stretch justify-around border-t border-gray-200/80 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur dark:border-gray-800 dark:bg-gray-950/90 md:hidden"
      aria-label="底部导航"
    >
      {tabs.slice(0, 3).map((t) => (
        <TabBtn
          key={t.key}
          icon={t.icon}
          label={t.label}
          active={page === t.key}
          onClick={() => navigate(t.key)}
        />
      ))}
      <button
        onClick={() => openChat()}
        className="flex flex-1 flex-col items-center gap-0.5 py-1.5"
        aria-label="AI 助手"
      >
        <span className="grid h-9 w-9 -translate-y-2 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-violet-500 text-white shadow-md">
          <Sparkles size={17} />
        </span>
        <span className="text-[10px] text-gray-400">AI</span>
      </button>
      {tabs.slice(3).map((t) => (
        <TabBtn
          key={t.key}
          icon={t.icon}
          label={t.label}
          active={page === t.key}
          onClick={() => navigate(t.key)}
        />
      ))}
    </nav>
  );
}

function TabBtn({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  icon: typeof LayoutDashboard;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={cx(
        'flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px]',
        active
          ? 'font-semibold text-brand-600 dark:text-brand-300'
          : 'text-gray-400 dark:text-gray-500'
      )}
    >
      <Icon size={18} />
      {label}
    </button>
  );
}
