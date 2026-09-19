import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  Figma,
  Flame,
  Github,
  Kanban,
  Pen,
  Podcast,
  Sparkles,
  Timer,
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { mockEvents, mockNotes, quickLinks, weeklyCompleted } from '../data/mock';
import { cx, fmtDate, fmtMin, greeting } from '../lib/ui';
import { Card } from '../components/common';
import TaskRow from '../components/tasks/TaskRow';

const linkIcons: Record<string, typeof Github> = {
  github: Github,
  figma: Figma,
  book: BookOpen,
  kanban: Kanban,
  pen: Pen,
  podcast: Podcast,
};

export default function Dashboard() {
  const { tasks } = useApp();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(t);
  }, []);

  const today = tasks.filter((t) => t.group === 'today');
  const done = today.filter((t) => t.done).length;
  const pct = today.length ? Math.round((done / today.length) * 100) : 0;
  const nextTask = today.find((t) => !t.done);

  return (
    <div className="space-y-5">
      <Greeting now={now} done={done} total={today.length} pct={pct} />
      <StatOverview />
      <div className="grid gap-5 xl:grid-cols-3">
        <div className="space-y-5 xl:col-span-2">
          <TodoCard nextTitle={nextTask?.title} />
          <NotesPreview />
          <WeekMiniChart />
        </div>
        <div className="space-y-5">
          <AgendaMini now={now} />
          <AICallout />
          <HabitsCard />
          <QuickLinksCard />
        </div>
      </div>
    </div>
  );
}

/* ① 问候横幅 */
function Greeting({
  now,
  done,
  total,
  pct,
}: {
  now: Date;
  done: number;
  total: number;
  pct: number;
}) {
  const emoji = now.getHours() < 18 && now.getHours() >= 5 ? '☀️' : '🌙';
  return (
    <section className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {greeting(now.getHours())}，先生 {emoji}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {fmtDate(now)} · 北京 晴 22° · 今天也是有条理的一天
        </p>
      </div>
      <div className="sm:w-56">
        <div className="mb-1.5 flex items-baseline justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>今日进度</span>
          <span className="font-semibold tabular-nums text-gray-900 dark:text-gray-100">
            {done}/{total}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500"
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>
    </section>
  );
}

/* ② 今日概览四宫格 */
function StatOverview() {
  const { tasks, navigate, habits } = useApp();
  const today = tasks.filter((t) => t.group === 'today');
  const pending = today.filter((t) => !t.done).length;
  const meetings = mockEvents.filter((e) => e.kind === 'meeting').length;
  const maxStreak = Math.max(...habits.map((h) => h.streak));

  const stats = [
    { label: '今日待办', value: String(pending), unit: '项', icon: CalendarDays, to: 'tasks' as const, color: 'text-brand-500 bg-brand-50 dark:bg-brand-500/10' },
    { label: '今日会议', value: String(meetings), unit: '场', icon: Timer, to: 'calendar' as const, color: 'text-violet-500 bg-violet-50 dark:bg-violet-500/10' },
    { label: '本周专注', value: '17.2', unit: '小时', icon: Sparkles, to: 'insights' as const, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' },
    { label: '连续打卡', value: String(maxStreak), unit: '天', icon: Flame, to: 'insights' as const, color: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <button key={s.label} onClick={() => navigate(s.to)} className="card p-4 text-left transition-transform duration-200 sm:hover:-translate-y-0.5 sm:hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className={cx('grid h-8 w-8 place-items-center rounded-lg', s.color)}>
                <Icon size={15} />
              </span>
              <ChevronRight size={14} className="text-gray-300" />
            </div>
            <p className="mt-3 text-2xl font-bold tabular-nums tracking-tight">
              {s.value}
              <span className="ml-1 text-xs font-normal text-gray-400">{s.unit}</span>
            </p>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{s.label}</p>
          </button>
        );
      })}
    </div>
  );
}

/* ③ 今日待办 */
function TodoCard({ nextTitle }: { nextTitle?: string }) {
  const { tasks, navigate } = useApp();
  const today = tasks.filter((t) => t.group === 'today');
  const done = today.filter((t) => t.done).length;
  return (
    <Card
      className="group"
      title={
        <span className="flex items-center gap-2">
          今日待办
          <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-normal text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            {done}/{today.length}
          </span>
        </span>
      }
      action={
        <span className="text-xs text-gray-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          → 查看全部
        </span>
      }
    >
      <header onClick={() => navigate('tasks')} className="cursor-pointer">
        <ul className="space-y-0.5" onClick={(e) => e.stopPropagation()}>
          <AnimatePresence initial={false}>
            {today.map((t) => (
              <TaskRow key={t.id} task={t} />
            ))}
          </AnimatePresence>
        </ul>
      </header>
      <footer className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
        <span>
          {nextTitle ? (
            <>
              下一个：<span className="font-medium text-gray-900 dark:text-gray-100">{nextTitle}</span>
            </>
          ) : (
            '🎉 今日任务已全部完成'
          )}
        </span>
        <button
          onClick={() => navigate('tasks')}
          className="flex items-center gap-0.5 text-brand-500 hover:text-brand-600"
        >
          管理任务 <ChevronRight size={13} />
        </button>
      </footer>
    </Card>
  );
}

/* ④ 接下来（迷你时间轴 + 现在游标） */
function AgendaMini({ now }: { now: Date }) {
  const { navigate } = useApp();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const sorted = [...mockEvents].sort((a, b) => a.start - b.start);
  const cursorIdx = sorted.findIndex((e) => e.start > nowMin);
  const upcoming = sorted.slice(Math.max(cursorIdx - 1, 0), cursorIdx + 2);

  return (
    <Card
      className="group"
      title="接下来"
      action={
        <span className="text-xs text-gray-400 opacity-0 transition-opacity group-hover:opacity-100">
          → 日程
        </span>
      }
    >
      <button onClick={() => navigate('calendar')} className="w-full text-left">
        {nowMin >= 8 * 60 && nowMin <= 21 * 60 && (
          <div className="mb-1.5 flex items-center gap-2 pl-0.5">
            <span className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_0_3px_rgba(244,63,94,0.2)]" />
            <span className="text-[10px] font-medium text-rose-500 tabular-nums">
              现在 {fmtMin(nowMin)}
            </span>
          </div>
        )}
        <div className="space-y-2">
          {upcoming.map((e) => {
            const ongoing = nowMin >= e.start && nowMin < e.end;
            return (
              <div
                key={e.id}
                className={cx(
                  'flex items-start gap-3 rounded-xl border border-transparent px-2.5 py-2 hover:border-gray-200 hover:bg-gray-50 dark:hover:border-gray-700 dark:hover:bg-gray-800/50',
                  ongoing && 'border-brand-200 bg-brand-50/60 dark:border-brand-800 dark:bg-brand-500/5'
                )}
              >
                <span className="w-11 shrink-0 pt-0.5 text-xs font-semibold tabular-nums text-gray-500 dark:text-gray-400">
                  {fmtMin(e.start)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{e.title}</p>
                  <p className="mt-0.5 text-[11px] text-gray-400">
                    {e.kind === 'meeting' ? '会议' : e.kind === 'focus' ? '专注' : '个人'} ·{' '}
                    {e.attendees?.join('、') ?? '单独'}
                  </p>
                </div>
                {ongoing && (
                  <span className="mt-1 shrink-0 rounded-md bg-rose-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
                    进行中
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </button>
    </Card>
  );
}

/* ⑤ AI 召唤卡 */
function AICallout() {
  const { openChat } = useApp();
  const samples = ['帮我规划今天下午', '总结今天做了什么', '这个任务怎么拆？'];
  const [si, setSi] = useState(0);
  const [chars, setChars] = useState(0);

  useEffect(() => {
    const text = samples[si];
    if (chars < text.length) {
      const t = window.setTimeout(() => setChars((c) => c + 1), 70);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => {
      setSi((i) => (i + 1) % samples.length);
      setChars(0);
    }, 1800);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chars, si]);

  return (
    <button
      onClick={() => openChat(samples[si])}
      className="w-full overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500 via-indigo-500 to-violet-500 p-[1.5px] text-left shadow-md transition-transform duration-200 sm:hover:-translate-y-0.5 sm:hover:shadow-lg"
    >
      <span className="block rounded-[15px] bg-gradient-to-br from-brand-500/95 to-violet-600/95 p-4 text-white backdrop-blur">
        <span className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles size={15} />
          问问工作台助手
        </span>
        <span className="mt-2 block h-5 text-xs text-white/85">
          「{samples[si].slice(0, chars)}
          <span className="animate-pulse">▍</span>」
        </span>
        <span className="mt-2 inline-flex items-center gap-1 rounded-lg bg-white/15 px-2 py-1 text-[11px]">
          打开 AI 抽屉 <ChevronRight size={12} />
        </span>
      </span>
    </button>
  );
}

/* ⑥ 快速笔记 */
function NotesPreview() {
  const { navigate } = useApp();
  return (
    <Card
      className="group"
      title="快速笔记"
      action={
        <span className="text-xs text-gray-400 opacity-0 transition-opacity group-hover:opacity-100">
          → 查看全部
        </span>
      }
    >
      <div className="grid gap-3 sm:grid-cols-3">
        {mockNotes.slice(0, 3).map((n) => (
          <button
            key={n.id}
            onClick={() => navigate('notes')}
            className="rounded-xl border border-gray-200/80 p-3 text-left transition-colors hover:border-brand-300 hover:bg-brand-50/40 dark:border-gray-800 dark:hover:border-brand-700 dark:hover:bg-brand-500/5"
          >
            <span className="mb-1.5 inline-block rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              {n.tag}
            </span>
            <p className="line-clamp-1 text-sm font-medium">{n.title}</p>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
              {n.content}
            </p>
            <p className="mt-2 text-[10px] text-gray-400">{n.updatedAt}</p>
          </button>
        ))}
      </div>
    </Card>
  );
}

/* ⑦ 习惯打卡 */
function HabitsCard() {
  const { habits, toggleHabit } = useApp();
  const todayIdx = (new Date().getDay() + 6) % 7;
  const labels = ['一', '二', '三', '四', '五', '六', '日'];
  return (
    <Card title={<span className="flex items-center gap-1.5">习惯打卡 <Flame size={13} className="text-amber-500" /></span>}>
      <ul className="space-y-2.5">
        {habits.map((h) => (
          <li key={h.id} className="flex items-center gap-3">
            <span className="text-base leading-none">{h.emoji}</span>
            <span className="min-w-0 flex-1 truncate text-sm">{h.name}</span>
            <span className="text-[10px] tabular-nums text-gray-400">{h.streak} 天</span>
            <span className="flex gap-1">
              {h.week.map((v, i) => {
                const isToday = i === todayIdx;
                return (
                  <button
                    key={i}
                    disabled={!isToday}
                    onClick={() => toggleHabit(h.id)}
                    title={isToday ? `点击${v ? '取消' : ''}打卡` : `周${labels[i]}`}
                    className={cx(
                      'grid h-5 w-5 place-items-center rounded text-[9px] font-medium transition-colors',
                      v
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 text-gray-400 dark:bg-gray-800',
                      isToday && 'ring-1 ring-inset ring-brand-400',
                      !isToday && 'cursor-default opacity-70'
                    )}
                  >
                    {labels[i]}
                  </button>
                );
              })}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ⑧ 本周概览迷你图 */
function WeekMiniChart() {
  const { navigate } = useApp();
  return (
    <Card
      className="group"
      title="本周完成任务"
      action={
        <span
          onClick={() => navigate('insights')}
          className="cursor-pointer text-xs text-gray-400 opacity-0 transition-opacity group-hover:opacity-100"
        >
          → 查看洞察
        </span>
      }
    >
      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyCompleted} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
            <defs>
              <linearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.65} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              tick={{ fontSize: 11, fill: '#9ca3af' }}
            />
            <Tooltip
              cursor={{ fill: 'rgba(99,102,241,0.08)' }}
              contentStyle={{
                borderRadius: 12,
                border: 'none',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                fontSize: 12,
              }}
              formatter={(v) => [`${v} 项`, '完成']}
            />
            <Bar dataKey="count" fill="url(#barFill)" radius={[6, 6, 0, 0]} maxBarSize={26} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

/* ⑨ 快捷入口 */
function QuickLinksCard() {
  const { showToast } = useApp();
  return (
    <Card title="快捷入口">
      <div className="grid grid-cols-3 gap-2">
        {quickLinks.map((l) => {
          const Icon = linkIcons[l.icon] ?? Github;
          return (
            <button
              key={l.id}
              onClick={() => showToast(`「${l.label}」在 Demo 中不真跳转`)}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-transparent py-3 text-gray-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-200 hover:bg-gray-50 hover:shadow-sm dark:text-gray-300 dark:hover:border-gray-700 dark:hover:bg-gray-800/60"
            >
              <Icon size={18} className="text-gray-400" />
              <span className="text-[11px]">{l.label}</span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
