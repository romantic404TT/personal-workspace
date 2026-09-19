import { useState } from 'react';
import { ListTodo, Plus } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { PageTitle, ProgressRing } from '../components/common';
import TaskRow from '../components/tasks/TaskRow';
import { groupLabels } from '../lib/ui';
import type { Task, TaskGroup } from '../types';
import { EmptyState } from '../components/common';

const groups: TaskGroup[] = ['today', 'week', 'inbox'];

export default function Tasks() {
  const { tasks, addTasks } = useApp();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');

  const done = tasks.filter((t) => t.done).length;

  const submit = () => {
    const title = draft.trim();
    if (!title) return;
    const t: Task = {
      id: `u-${Date.now()}`,
      title,
      done: false,
      priority: 'medium',
      group: 'today',
      tag: '手动',
    };
    addTasks([t]);
    setDraft('');
    setAdding(false);
  };

  return (
    <div>
      <PageTitle title="任务" desc="一处数据、多端呈现 —— 与首页待办、命令面板、AI 聊天共享同一份清单" />

      <div className="card mb-5 flex items-center gap-4 p-4">
        <ProgressRing value={done} total={tasks.length} size={52} />
        <div>
          <p className="text-sm font-semibold">
            已完成 {done} / {tasks.length}
          </p>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            勾选即时生效（会话内），刷新后恢复初始演示数据
          </p>
        </div>
      </div>

      {groups.map((g) => {
        const list = tasks.filter((t) => t.group === g);
        return (
          <section key={g} className="card group mb-5 p-4">
            <header className="mb-2 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                {groupLabels[g]}
                <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-normal text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                  {list.filter((t) => !t.done).length} 待办
                </span>
              </h2>
              {g === 'today' && (
                <button
                  onClick={() => setAdding((v) => !v)}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-gray-400 hover:bg-gray-100 hover:text-brand-500 dark:hover:bg-gray-800"
                >
                  <Plus size={13} /> 添加
                </button>
              )}
            </header>

            {list.length === 0 ? (
              <EmptyState icon={<ListTodo size={20} />} title="这里还空着" desc="添加一条任务，或让 AI 帮你生成" />
            ) : (
              <ul className="space-y-0.5">
                {list.map((t) => (
                  <TaskRow key={t.id} task={t} />
                ))}
              </ul>
            )}

            {g === 'today' && adding && (
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-dashed border-brand-300 px-3 py-2 dark:border-brand-700">
                <Plus size={14} className="text-brand-400" />
                <input
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') submit();
                    if (e.key === 'Escape') setAdding(false);
                  }}
                  onBlur={submit}
                  placeholder="输入任务标题，回车添加…"
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
                />
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
