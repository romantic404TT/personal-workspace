import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import type { Task } from '../../types';
import { useApp } from '../../store/AppContext';
import { cx, priorityMeta } from '../../lib/ui';

export function TaskCheckbox({ done, onToggle }: { done: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      role="checkbox"
      aria-checked={done}
      aria-label="切换任务完成状态"
      className={cx(
        'grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-all duration-150',
        done
          ? 'border-brand-500 bg-brand-500 text-white'
          : 'border-gray-300 bg-transparent hover:border-brand-400 dark:border-gray-600'
      )}
    >
      {done && <Check size={12} strokeWidth={3} />}
    </button>
  );
}

export default function TaskRow({ task, showGroupPill = false }: { task: Task; showGroupPill?: boolean }) {
  const { toggleTask, highlightIds, openChat } = useApp();
  const p = priorityMeta[task.priority];
  const highlighted = highlightIds.includes(task.id);

  return (
    <motion.li
      layout
      transition={{ duration: 0.2 }}
      className={cx(
        'group flex items-center gap-3 rounded-xl border border-transparent px-2.5 py-2',
        highlighted &&
          'border-brand-300 bg-brand-50 ring-1 ring-brand-400 dark:border-brand-700 dark:bg-brand-500/10'
      )}
    >
      <TaskCheckbox done={task.done} onToggle={() => toggleTask(task.id)} />
      <span
        className={cx(
          'min-w-0 flex-1 truncate text-sm',
          task.done && 'text-gray-400 line-through dark:text-gray-500'
        )}
      >
        {task.title}
      </span>
      <span className="hidden items-center gap-2 sm:flex">
        {task.tag && (
          <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            {task.tag}
          </span>
        )}
        {showGroupPill && (
          <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            {task.group === 'today' ? '今日' : task.group === 'week' ? '本周' : '收集箱'}
          </span>
        )}
        {task.due && <span className="text-[11px] tabular-nums text-gray-400">{task.due}</span>}
        <span className={cx('flex items-center gap-1 text-[11px] text-gray-500', p.pill, 'rounded-md px-1.5 py-0.5')}>
          <span className={cx('h-1.5 w-1.5 rounded-full', p.dot)} />
          {p.label}
        </span>
      </span>
      <button
        title="让 AI 拆解这个任务"
        onClick={() => openChat('这个任务怎么拆？', { kind: 'task', title: task.title })}
        className="hidden shrink-0 rounded-md p-1 text-gray-300 opacity-0 transition-opacity hover:bg-brand-50 hover:text-brand-500 focus:opacity-100 group-hover:opacity-100 dark:hover:bg-brand-500/10 sm:block"
      >
        <Sparkles size={14} />
      </button>
    </motion.li>
  );
}
