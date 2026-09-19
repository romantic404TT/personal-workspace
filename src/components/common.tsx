import type { ReactNode } from 'react';

export function Card({
  children,
  className = '',
  title,
  action,
}: {
  children: ReactNode;
  className?: string;
  title?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section
      className={`card p-4 transition-transform duration-200 sm:hover:-translate-y-0.5 sm:hover:shadow-md ${className}`}
    >
      {(title || action) && (
        <header className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function ViewAll({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-xs text-gray-400 opacity-0 transition-opacity duration-200 hover:text-brand-500 focus:opacity-100 group-hover:opacity-100"
    >
      → 查看全部
    </button>
  );
}

export function ProgressRing({
  value,
  total,
  size = 44,
}: {
  value: number;
  total: number;
  size?: number;
}) {
  const pct = total === 0 ? 0 : value / total;
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="stroke-gray-200 dark:stroke-gray-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          className="stroke-brand-500 transition-all duration-500"
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-[11px] font-semibold tabular-nums">
        {Math.round(pct * 100)}%
      </span>
    </div>
  );
}

export function PageTitle({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="mb-5">
      <h1 className="text-xl font-bold tracking-tight">{title}</h1>
      {desc && <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{desc}</p>}
    </div>
  );
}

/** 各页首访骨架屏（故意演出 700ms 加载） */
export function PageSkeleton() {
  return (
    <div aria-busy="true" className="space-y-5">
      <div className="skeleton h-24 w-full" />
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-24" />
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-3">
        <div className="skeleton h-80 xl:col-span-2" />
        <div className="space-y-5">
          <div className="skeleton h-40" />
          <div className="skeleton h-32" />
        </div>
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  desc,
}: {
  icon: ReactNode;
  title: string;
  desc?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-gray-100 text-gray-400 dark:bg-gray-800">
        {icon}
      </div>
      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</p>
      {desc && <p className="mt-1 text-xs text-gray-400">{desc}</p>}
    </div>
  );
}
