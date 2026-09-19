import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CalendarDays,
  ChartColumn,
  LayoutDashboard,
  ListTodo,
  Search,
  Sparkles,
  StickyNote,
} from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { mockNotes } from '../../data/mock';
import { navItems } from '../layout/Sidebar';
import { cx } from '../../lib/ui';
import type { PageKey } from '../../types';

interface PaletteItem {
  id: string;
  group: string;
  label: string;
  sub?: string;
  icon: typeof Search;
  run: () => void;
}

const pageIcons: Record<PageKey, typeof Search> = {
  dashboard: LayoutDashboard,
  tasks: ListTodo,
  calendar: CalendarDays,
  notes: StickyNote,
  insights: ChartColumn,
};

export default function CommandPalette() {
  const { paletteOpen, setPaletteOpen, navigate, tasks, openChat } = useApp();
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (paletteOpen) {
      setQ('');
      setSel(0);
      window.setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [paletteOpen]);

  const items: PaletteItem[] = useMemo(() => {
    const kw = q.trim().toLowerCase();
    const hit = (s: string) => !kw || s.toLowerCase().includes(kw);
    const list: PaletteItem[] = [];

    navItems
      .filter((n) => hit(n.label) || hit(n.key))
      .forEach((n) =>
        list.push({
          id: `page-${n.key}`,
          group: '页面',
          label: n.label,
          icon: pageIcons[n.key],
          run: () => navigate(n.key),
        })
      );

    tasks
      .filter((t) => hit(t.title))
      .slice(0, 6)
      .forEach((t) =>
        list.push({
          id: `task-${t.id}`,
          group: '任务',
          label: t.title,
          sub: t.done ? '已完成' : '未完成',
          icon: ListTodo,
          run: () => navigate('tasks'),
        })
      );

    mockNotes
      .filter((n) => hit(n.title) || hit(n.tag))
      .slice(0, 4)
      .forEach((n) =>
        list.push({
          id: `note-${n.id}`,
          group: '笔记',
          label: n.title,
          sub: n.tag,
          icon: StickyNote,
          run: () => navigate('notes'),
        })
      );

    list.push({
      id: 'ask-ai',
      group: '操作',
      label: kw ? `问问 AI 助手：「${q.trim()}」` : '打开 AI 助手',
      icon: Sparkles,
      run: () => openChat(kw ? q.trim() : undefined),
    });

    return list;
  }, [q, tasks, navigate, openChat]);

  const active = Math.min(sel, items.length - 1);
  const groups = useMemo(() => {
    const m = new Map<string, PaletteItem[]>();
    items.forEach((it) => m.set(it.group, [...(m.get(it.group) ?? []), it]));
    return [...m.entries()];
  }, [items]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setPaletteOpen(false);
    else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSel((s) => Math.min(s + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSel((s) => Math.max(s - 1, 0));
    } else if (e.key === 'Enter' && items[active]) {
      items[active].run();
      setPaletteOpen(false);
    }
  };

  let flatIdx = -1;

  return (
    <AnimatePresence>
      {paletteOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-[12vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={() => setPaletteOpen(false)}
        >
          <motion.div
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900"
            initial={{ y: -12, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: -8, scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="命令面板"
          >
            <div className="flex items-center gap-2.5 border-b border-gray-100 px-4 dark:border-gray-800">
              <Search size={16} className="text-gray-400" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setSel(0);
                }}
                onKeyDown={onKeyDown}
                placeholder="搜索任务、笔记、页面，或询问 AI…"
                className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
              />
              <kbd className="rounded border border-gray-200 px-1.5 py-0.5 text-[10px] text-gray-400 dark:border-gray-700">
                Esc
              </kbd>
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {items.length === 0 ? (
                <p className="px-3 py-8 text-center text-sm text-gray-400">
                  未找到「{q}」相关内容
                </p>
              ) : (
                groups.map(([g, list]) => (
                  <div key={g} className="mb-1">
                    <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                      {g}
                    </p>
                    {list.map((it) => {
                      flatIdx += 1;
                      const idx = flatIdx;
                      const Icon = it.icon;
                      return (
                        <button
                          key={it.id}
                          onClick={() => {
                            it.run();
                            setPaletteOpen(false);
                          }}
                          onMouseEnter={() => setSel(idx)}
                          className={cx(
                            'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm',
                            idx === active
                              ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                              : 'text-gray-600 dark:text-gray-300'
                          )}
                        >
                          <Icon size={15} className="shrink-0 text-gray-400" />
                          <span className="flex-1 truncate">{it.label}</span>
                          {it.sub && <span className="text-[10px] text-gray-400">{it.sub}</span>}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
