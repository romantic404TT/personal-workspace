import type { Priority, TaskGroup } from '../types';

export const priorityMeta: Record<
  Priority,
  { label: string; dot: string; pill: string }
> = {
  high: {
    label: '高',
    dot: 'bg-rose-500',
    pill: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
  },
  medium: {
    label: '中',
    dot: 'bg-amber-500',
    pill: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  },
  low: {
    label: '低',
    dot: 'bg-emerald-500',
    pill: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
  },
};

export const groupLabels: Record<TaskGroup, string> = {
  today: '今日',
  week: '本周',
  inbox: '收集箱',
};

export function greeting(hour: number): string {
  if (hour < 5) return '夜深了';
  if (hour < 11) return '早上好';
  if (hour < 14) return '中午好';
  if (hour < 18) return '下午好';
  return '晚上好';
}

const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

export function fmtDate(d: Date): string {
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日 · ${weekdays[d.getDay()]}`;
}

export function fmtMin(m: number): string {
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
