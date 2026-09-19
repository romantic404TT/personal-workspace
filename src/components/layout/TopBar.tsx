import { useEffect, useState } from 'react';
import { Bell, Moon, Search, Sparkles, Sun } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { mockNotifications } from '../../data/mock';
import { cx } from '../../lib/ui';

export default function TopBar() {
  const { setPaletteOpen, theme, toggleTheme, openChat, chatOpen } = useApp();
  const [now, setNow] = useState(() => new Date());
  const [notifOpen, setNotifOpen] = useState(false);
  const [unread, setUnread] = useState(mockNotifications.filter((n) => n.unread).length);

  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 15000);
    return () => window.clearInterval(t);
  }, []);

  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-gray-200/80 bg-white/80 px-4 backdrop-blur dark:border-gray-800 dark:bg-gray-950/70 sm:px-6">
      <button
        onClick={() => setPaletteOpen(true)}
        className="group flex h-9 flex-1 items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-400 transition-colors hover:border-brand-300 hover:text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-brand-700 sm:max-w-md"
        aria-label="搜索（打开命令面板）"
      >
        <Search size={15} />
        <span className="flex-1 text-left">搜索任务、笔记、页面…</span>
        <kbd className="hidden rounded border border-gray-300 px-1.5 py-0.5 font-mono text-[10px] text-gray-400 group-hover:text-gray-500 dark:border-gray-700 sm:block">
          Ctrl K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <span className="hidden items-center gap-1.5 text-sm tabular-nums text-gray-500 dark:text-gray-400 md:flex">
          {time}
          <span className="text-gray-300 dark:text-gray-600">·</span>
          <span className="text-xs">北京 ☀️ 22°</span>
        </span>

        <button
          onClick={() => openChat()}
          className={cx(
            'flex h-9 items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-500 to-violet-500 px-3 text-sm font-medium text-white shadow-sm transition-transform hover:scale-[1.03] active:scale-95',
            chatOpen && 'ring-2 ring-brand-300'
          )}
        >
          <Sparkles size={15} />
          <span className="hidden sm:inline">AI 助手</span>
        </button>

        <div className="relative">
          <button
            onClick={() => {
              setNotifOpen((v) => !v);
              setUnread(0);
            }}
            className="relative grid h-9 w-9 place-items-center rounded-xl text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            aria-label="通知"
          >
            <Bell size={17} />
            {unread > 0 && (
              <span className="absolute right-1.5 top-1.5 grid h-4 w-4 place-items-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                {unread}
              </span>
            )}
          </button>
          {notifOpen && (
            <>
              <button
                className="fixed inset-0 z-40 cursor-default"
                aria-label="关闭通知"
                onClick={() => setNotifOpen(false)}
              />
              <div className="absolute right-0 z-50 mt-2 w-80 rounded-2xl border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-800 dark:bg-gray-900">
                <p className="px-2 py-1.5 text-xs font-semibold text-gray-400">通知</p>
                {mockNotifications.map((n) => (
                  <div
                    key={n.id}
                    className="flex gap-2.5 rounded-xl px-2 py-2 hover:bg-gray-50 dark:hover:bg-gray-800/60"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                    <div>
                      <p className="text-xs leading-relaxed text-gray-700 dark:text-gray-200">
                        {n.text}
                      </p>
                      <p className="mt-0.5 text-[10px] text-gray-400">{n.time}</p>
                    </div>
                  </div>
                ))}
                <p className="px-2 py-1.5 text-center text-[10px] text-gray-400">
                  Demo 演示数据
                </p>
              </div>
            </>
          )}
        </div>

        <button
          onClick={toggleTheme}
          className="grid h-9 w-9 place-items-center rounded-xl text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          aria-label={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        <button
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-rose-400 text-sm font-bold text-white ring-2 ring-white dark:ring-gray-900"
          aria-label="用户头像"
          title="先生"
        >
          先
        </button>
      </div>
    </header>
  );
}
