import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { habitHeat, timeAllocation, weeklyCompleted, focusTrend } from '../data/mock';
import { Card, PageTitle } from '../components/common';
import { cx } from '../lib/ui';

const PIE_COLORS = ['#6366f1', '#8b5cf6', '#c4b5fd'];

const tiles = [
  { label: '本周完成任务', value: '39', delta: '+14%', up: true },
  { label: '深度工作时长', value: '17.2h', delta: '+8%', up: true },
  { label: '会议占比', value: '25%', delta: '-3%', up: false },
  { label: '习惯打卡完成率', value: '86%', delta: '+5%', up: true },
];

export default function Insights() {
  return (
    <div>
      <PageTitle title="洞察" desc="本周数据一览（mock 数据，图表为 Recharts 渲染）" />

      <div className="mb-5 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {tiles.map((t) => (
          <Card key={t.label} className="!shadow-none">
            <p className="text-xs text-gray-500 dark:text-gray-400">{t.label}</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-bold tabular-nums tracking-tight">{t.value}</span>
              <span
                className={cx(
                  'rounded-md px-1.5 py-0.5 text-[10px] font-medium',
                  t.up
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10'
                    : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10'
                )}
              >
                {t.delta}
              </span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card title="每日完成任务">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyCompleted} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.2)" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis tickLine={false} axisLine={false} allowDecimals={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip
                  cursor={{ fill: 'rgba(99,102,241,0.08)' }}
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', fontSize: 12 }}
                  formatter={(v) => [`${v} 项`, '完成']}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="时间去向">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={timeAllocation}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {timeAllocation.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', fontSize: 12 }}
                  formatter={(v) => [`${v}%`]}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="专注时长趋势（小时）">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={focusTrend} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', fontSize: 12 }}
                  formatter={(v) => [`${v} h`, '专注']}
                />
                <Line type="monotone" dataKey="hours" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 3, fill: '#8b5cf6' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="习惯打卡热力图（最近 28 天）">
          <div className="space-y-3 pt-1">
            {habitHeat.map((h) => (
              <div key={h.name} className="flex items-center gap-3">
                <span className="w-24 shrink-0 truncate text-xs text-gray-500 dark:text-gray-400">
                  {h.emoji} {h.name}
                </span>
                <div className="grid flex-1 grid-cols-14 gap-1" style={{ gridTemplateColumns: 'repeat(14, minmax(0, 1fr))' }}>
                  {h.pattern.split('').map((c, i) => (
                    <span
                      key={i}
                      title={`第 ${28 - i} 天前`}
                      className={cx(
                        'aspect-square rounded-[4px]',
                        c === '1'
                          ? i > 21
                            ? 'bg-brand-500'
                            : 'bg-brand-400/70'
                          : 'bg-gray-100 dark:bg-gray-800'
                      )}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
