import { useEffect, useState } from 'react';
import { CalendarDays, Users } from 'lucide-react';
import { mockEvents } from '../data/mock';
import { cx, fmtMin } from '../lib/ui';
import { Card, EmptyState, PageTitle } from '../components/common';
import type { CalendarEvent } from '../types';

const START = 8 * 60;
const END = 21 * 60;
const HOUR_PX = 56;

const kindStyle: Record<CalendarEvent['kind'], string> = {
  meeting: 'border-brand-500 bg-brand-50 dark:bg-brand-500/10',
  focus: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10',
  personal: 'border-amber-500 bg-amber-50 dark:bg-amber-500/10',
};

export default function Calendar() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(t);
  }, []);

  const nowMin = now.getHours() * 60 + now.getMinutes();
  const inRange = nowMin >= START && nowMin <= END;
  const hours = Array.from({ length: (END - START) / 60 + 1 }, (_, i) => START + i * 60);
  const meetings = mockEvents.filter((e) => e.kind === 'meeting');

  const weekStrip = ['一', '二', '三', '四', '五', '六', '日'].map((d, i) => {
    const base = new Date(now);
    base.setDate(now.getDate() - ((now.getDay() + 6) % 7) + i);
    return { label: d, date: base.getDate(), isToday: i === (now.getDay() + 6) % 7 };
  });

  return (
    <div>
      <PageTitle title="日程" desc="今日时间轴 · 「现在」游标实时跟随系统时间" />

      <div className="grid gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">今日 · {fmtMin(START)} – {fmtMin(END)}</h2>
            <div className="flex gap-1.5">
              {weekStrip.map((d) => (
                <span
                  key={d.label}
                  className={cx(
                    'grid h-9 w-8 place-items-center rounded-lg text-[10px] leading-none',
                    d.isToday
                      ? 'bg-brand-500 font-semibold text-white'
                      : 'bg-gray-100 text-gray-400 dark:bg-gray-800'
                  )}
                >
                  {d.label}
                  <br />
                  {d.date}
                </span>
              ))}
            </div>
          </div>

          <div className="relative" style={{ height: ((END - START) / 60) * HOUR_PX }}>
            {hours.map((m) => (
              <div
                key={m}
                className="absolute inset-x-0 flex items-start gap-3"
                style={{ top: ((m - START) / 60) * HOUR_PX }}
              >
                <span className="w-10 shrink-0 -translate-y-1.5 text-right text-[10px] tabular-nums text-gray-400">
                  {fmtMin(m)}
                </span>
                <span className="h-px flex-1 bg-gray-100 dark:bg-gray-800/80" />
              </div>
            ))}

            {mockEvents.map((e) => {
              const top = ((e.start - START) / 60) * HOUR_PX;
              const height = ((e.end - e.start) / 60) * HOUR_PX - 4;
              const ongoing = nowMin >= e.start && nowMin < e.end;
              return (
                <div
                  key={e.id}
                  className={cx(
                    'group absolute left-14 right-2 overflow-hidden rounded-xl border-l-4 px-3 py-1.5 transition-shadow hover:shadow-md',
                    kindStyle[e.kind],
                    ongoing && 'ring-2 ring-rose-400/50'
                  )}
                  style={{ top, height: Math.max(height, 34) }}
                  title={e.attendees ? `参会：${e.attendees.join('、')}` : undefined}
                >
                  <p className="truncate text-xs font-semibold">{e.title}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
                    {fmtMin(e.start)} – {fmtMin(e.end)}
                    {e.attendees && (
                      <span className="opacity-0 transition-opacity group-hover:opacity-100">
                        · <Users size={9} className="inline" /> {e.attendees.join('、')}
                      </span>
                    )}
                  </p>
                </div>
              );
            })}

            {inRange && (
              <div
                className="absolute left-10 right-2 z-10 flex items-center"
                style={{ top: ((nowMin - START) / 60) * HOUR_PX }}
              >
                <span className="w-9 shrink-0 -translate-y-[7px] text-right text-[10px] font-semibold tabular-nums text-rose-500">
                  {fmtMin(nowMin)}
                </span>
                <span className="h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-rose-500 shadow-[0_0_0_4px_rgba(244,63,94,0.15)]" />
                <span className="h-px flex-1 bg-rose-400/70" />
              </div>
            )}
          </div>
        </Card>

        <div className="space-y-5">
          <Card title="今日会议">
            {meetings.length === 0 ? (
              <EmptyState icon={<CalendarDays size={20} />} title="今天没有会议" desc="整段时间都归你支配" />
            ) : (
              <ul className="space-y-2">
                {meetings.map((e) => (
                  <li key={e.id} className="flex items-start gap-3 rounded-xl px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800/60">
                    <span className="w-11 pt-0.5 text-xs font-semibold tabular-nums text-gray-500">
                      {fmtMin(e.start)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm">{e.title}</p>
                      <p className="text-[11px] text-gray-400">{e.end - e.start} 分钟 · {e.attendees?.join('、')}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card title="时间统计">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl bg-gray-50 py-3 dark:bg-gray-800/60">
                <p className="text-xl font-bold tabular-nums">{(meetings.reduce((a, e) => a + (e.end - e.start), 0) / 60).toFixed(1)}h</p>
                <p className="mt-0.5 text-[11px] text-gray-400">会议占用</p>
              </div>
              <div className="rounded-xl bg-gray-50 py-3 dark:bg-gray-800/60">
                <p className="text-xl font-bold tabular-nums text-emerald-500">
                  {(9 - meetings.reduce((a, e) => a + (e.end - e.start), 0) / 60).toFixed(1)}h
                </p>
                <p className="mt-0.5 text-[11px] text-gray-400">剩余可支配</p>
              </div>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-gray-400">
              周视图与真实日历订阅（ICS）不在本 Demo 范围内，此处为静态时间轴演出。
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
