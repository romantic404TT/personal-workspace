import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { AIContext, Habit, PageKey, Task } from '../types';
import { mockHabits, mockTasks } from '../data/mock';

export const pageLabels: Record<PageKey, string> = {
  dashboard: '首页',
  tasks: '任务',
  calendar: '日程',
  notes: '笔记',
  insights: '洞察',
};

interface AppValue {
  page: PageKey;
  navigate: (p: PageKey) => void;
  visited: Set<PageKey>;
  markVisited: (p: PageKey) => void;

  theme: 'light' | 'dark';
  toggleTheme: () => void;

  tasks: Task[];
  toggleTask: (id: string) => void;
  addTasks: (items: Task[]) => void;
  highlightIds: string[];

  habits: Habit[];
  toggleHabit: (id: string) => void;

  chatOpen: boolean;
  chatPreset: string | null;
  consumePreset: () => void;
  openChat: (prompt?: string, ctx?: AIContext) => void;
  closeChat: () => void;
  aiContext: AIContext | null;
  clearAiContext: () => void;

  paletteOpen: boolean;
  setPaletteOpen: (v: boolean) => void;

  toast: string | null;
  showToast: (msg: string) => void;
}

const Ctx = createContext<AppValue | null>(null);

export function useApp(): AppValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp 必须在 AppProvider 内使用');
  return v;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ws-theme');
      if (saved === 'light' || saved === 'dark') return saved;
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem('ws-theme', theme);
    } catch {
      /* 隐私模式下忽略 */
    }
  }, [theme]);

  const [page, setPage] = useState<PageKey>('dashboard');
  const [visited, setVisited] = useState<Set<PageKey>>(new Set());

  const [tasks, setTasks] = useState<Task[]>(() => mockTasks.map((t) => ({ ...t })));
  const [highlightIds, setHighlightIds] = useState<string[]>([]);
  const [addSeq, setAddSeq] = useState(0);

  const [habits, setHabits] = useState<Habit[]>(() =>
    mockHabits.map((h) => ({ ...h, week: [...h.week] }))
  );

  const [chatOpen, setChatOpen] = useState(false);
  const [chatPreset, setChatPreset] = useState<string | null>(null);
  const [aiContext, setAiContext] = useState<AIContext | null>(null);

  const [paletteOpen, setPaletteOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  const showToast = (msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  };

  const navigate = (p: PageKey) => {
    setPage(p);
    window.scrollTo({ top: 0 });
  };

  const markVisited = (p: PageKey) =>
    setVisited((s) => {
      if (s.has(p)) return s;
      const n = new Set(s);
      n.add(p);
      return n;
    });

  const toggleTask = (id: string) =>
    setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const addTasks = (items: Task[]) => {
    const stamp = Date.now();
    const mapped = items.map((t, i) => ({ ...t, id: `${t.id.split('-').slice(0, -1).join('-')}-${stamp}-${i}` }));
    setTasks((ts) => [
      ...ts.filter((x) => !mapped.some((m) => m.title === x.title && m.group === x.group)),
      ...mapped,
    ]);
    setHighlightIds(mapped.map((m) => m.id));
    setAddSeq((s) => s + 1);
    showToast(`已将 ${mapped.length} 个任务应用到今日待办`);
  };

  useEffect(() => {
    if (addSeq === 0) return;
    const t = window.setTimeout(() => setHighlightIds([]), 2000);
    return () => window.clearTimeout(t);
  }, [addSeq]);

  const todayIdx = (new Date().getDay() + 6) % 7; // 周一为 0
  const toggleHabit = (id: string) =>
    setHabits((hs) =>
      hs.map((h) => {
        if (h.id !== id) return h;
        const week = [...h.week];
        const v = !week[todayIdx];
        week[todayIdx] = v;
        return { ...h, week, streak: Math.max(0, h.streak + (v ? 1 : -1)) };
      })
    );

  const openChat = (prompt?: string, ctx?: AIContext) => {
    if (prompt) setChatPreset(prompt);
    if (ctx) setAiContext(ctx);
    setPaletteOpen(false);
    setChatOpen(true);
  };

  const value: AppValue = {
    page,
    navigate,
    visited,
    markVisited,
    theme,
    toggleTheme: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
    tasks,
    toggleTask,
    addTasks,
    highlightIds,
    habits,
    toggleHabit,
    chatOpen,
    chatPreset,
    consumePreset: () => setChatPreset(null),
    openChat,
    closeChat: () => setChatOpen(false),
    aiContext,
    clearAiContext: () => setAiContext(null),
    paletteOpen,
    setPaletteOpen,
    toast,
    showToast,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
