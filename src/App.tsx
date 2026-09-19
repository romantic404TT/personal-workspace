import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AppProvider, useApp } from './store/AppContext';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import BottomTabs from './components/layout/BottomTabs';
import CommandPalette from './components/common/CommandPalette';
import ChatDrawer from './components/ai/ChatDrawer';
import { PageSkeleton } from './components/common';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Calendar from './pages/Calendar';
import Notes from './pages/Notes';
import Insights from './pages/Insights';
import type { PageKey } from './types';

const pages: Record<PageKey, () => JSX.Element> = {
  dashboard: Dashboard,
  tasks: Tasks,
  calendar: Calendar,
  notes: Notes,
  insights: Insights,
};

function Shell() {
  const { page, visited, markVisited, paletteOpen, setPaletteOpen, openChat, chatOpen, toast } =
    useApp();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if ((e.metaKey || e.ctrlKey) && k === 'k') {
        e.preventDefault();
        setPaletteOpen(!paletteOpen);
      } else if ((e.metaKey || e.ctrlKey) && k === 'j') {
        e.preventDefault();
        if (chatOpen) {
          // 交由抽屉自身的关闭逻辑处理
        } else {
          openChat();
        }
      } else if (k === 'escape' && paletteOpen) {
        setPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [paletteOpen, setPaletteOpen, openChat, chatOpen]);

  const Page = pages[page];
  const loading = !visited.has(page);

  useEffect(() => {
    if (loading) {
      const t = window.setTimeout(() => markVisited(page), 700);
      return () => window.clearTimeout(t);
    }
  }, [loading, page, markVisited]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <Sidebar />
      <div className="md:pl-[220px]">
        <TopBar />
        <main className="mx-auto w-full max-w-[1400px] px-4 pb-24 pt-5 sm:px-6 md:pb-8">
          {loading ? (
            <PageSkeleton />
          ) : (
            <motion.div
              key={page}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <Page />
            </motion.div>
          )}
        </main>
      </div>
      <BottomTabs />
      <CommandPalette />
      <ChatDrawer />

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            className="fixed bottom-20 left-1/2 z-[60] -translate-x-1/2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm text-white shadow-xl dark:bg-gray-100 dark:text-gray-900 md:bottom-8"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
