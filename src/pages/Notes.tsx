import { useState } from 'react';
import { ArrowLeft, Sparkles, StickyNote } from 'lucide-react';
import { mockNotes } from '../data/mock';
import { useApp } from '../store/AppContext';
import { Card, EmptyState, PageTitle } from '../components/common';
import type { Note } from '../types';
import { cx } from '../lib/ui';

const tagColor: Record<string, string> = {
  产品: 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300',
  会议: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300',
  学习: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300',
  个人: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300',
};

export default function Notes() {
  const [selected, setSelected] = useState<Note | null>(null);
  const { openChat } = useApp();

  if (selected) {
    return (
      <div>
        <button
          onClick={() => setSelected(null)}
          className="mb-4 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
        >
          <ArrowLeft size={15} /> 返回笔记列表
        </button>
        <article className="card mx-auto max-w-2xl p-6 sm:p-8">
          <span className={cx('rounded-md px-2 py-0.5 text-[11px] font-medium', tagColor[selected.tag])}>
            {selected.tag}
          </span>
          <h1 className="mt-3 text-xl font-bold tracking-tight">{selected.title}</h1>
          <p className="mt-1 text-xs text-gray-400">更新于 {selected.updatedAt}</p>
          <div className="prose-none mt-5 space-y-3">
            {selected.content.split('\n').map((line, i) => (
              <p key={i} className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                {line}
              </p>
            ))}
          </div>
          <footer className="mt-8 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
            <span className="text-[11px] text-gray-400">Demo 数据 · markdown 渲染为简化排版</span>
            <button
              onClick={() =>
                openChat(`帮我把《${selected.title}》整理成行动清单`, {
                  kind: 'note',
                  title: selected.title,
                })
              }
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-500 to-violet-500 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-transform hover:scale-[1.03]"
            >
              <Sparkles size={13} /> AI 润色
            </button>
          </footer>
        </article>
      </div>
    );
  }

  return (
    <div>
      <PageTitle title="笔记" desc="点击卡片查看详情，详情页可唤起 AI 助手润色" />
      {mockNotes.length === 0 ? (
        <EmptyState icon={<StickyNote size={20} />} title="还没有笔记" desc="在首页快速笔记区创建一条" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {mockNotes.map((n) => (
            <button key={n.id} onClick={() => setSelected(n)} className="card p-4 text-left transition-transform duration-200 sm:hover:-translate-y-0.5 sm:hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className={cx('rounded-md px-2 py-0.5 text-[11px] font-medium', tagColor[n.tag])}>
                  {n.tag}
                </span>
                <span className="text-[10px] text-gray-400">{n.updatedAt}</span>
              </div>
              <h3 className="mt-2.5 line-clamp-1 text-sm font-semibold">{n.title}</h3>
              <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                {n.content}
              </p>
            </button>
          ))}
          <button
            onClick={() => setSelected(null)}
            className="card flex min-h-32 flex-col items-center justify-center gap-1 border-dashed !bg-transparent text-gray-400 hover:border-brand-300 hover:text-brand-500 dark:hover:border-brand-700"
          >
            <StickyNote size={18} />
            <span className="text-xs">新建笔记（Demo 中略）</span>
          </button>
        </div>
      )}
    </div>
  );
}
