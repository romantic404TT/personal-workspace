import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Check,
  ChevronsDown,
  Eraser,
  History,
  Maximize2,
  Minimize2,
  Pin,
  RotateCw,
  Send,
  Sparkles,
  Square,
  Trash2,
  TriangleAlert,
  X,
} from 'lucide-react';
import type { ChatMessage, Conversation, Task } from '../../types';
import { useApp, pageLabels } from '../../store/AppContext';
import { matchScript, quickCommands, type ScriptSegment } from '../../ai/engine';
import { mockConversations } from '../../data/mock';
import { cx, priorityMeta } from '../../lib/ui';

let uid = 0;
const nid = () => `msg-${++uid}`;

export default function ChatDrawer() {
  const {
    chatOpen,
    closeChat,
    chatPreset,
    consumePreset,
    openChat,
    aiContext,
    clearAiContext,
    page,
    addTasks,
    tasks,
  } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [convs, setConvs] = useState<Conversation[]>(mockConversations);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [showJump, setShowJump] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const streamIdRef = useRef(0);
  const timersRef = useRef<number[]>([]);
  const queueRef = useRef<ScriptSegment[]>([]);
  const suggestionsRef = useRef<string[]>([]);
  const activeIdRef = useRef<string | null>(null);
  const lastUserTextRef = useRef('');

  const clearTimers = () => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  };
  useEffect(() => clearTimers, []);

  const patch = (id: string, changes: Partial<ChatMessage>) =>
    setMessages((ms) => ms.map((m) => (m.id === id ? { ...m, ...changes } : m)));
  const push = (m: ChatMessage) => setMessages((ms) => [...ms, m]);

  /* ---------- 滚动跟随 ---------- */
  const nearBottomRef = useRef(true);
  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const near = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    nearBottomRef.current = near;
    setShowJump(!near && messages.length > 0);
  };
  useEffect(() => {
    if (nearBottomRef.current && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, thinking]);

  /* ---------- 流式播放引擎（setTimeout 模拟，非真实模型） ---------- */
  function beginSend(text: string) {
    const runId = ++streamIdRef.current;
    clearTimers();
    lastUserTextRef.current = text;
    const script = matchScript(text, aiContext);
    queueRef.current = [...script.segments];
    suggestionsRef.current = script.suggestions;

    push({ id: nid(), role: 'user', text, streaming: false });
    setThinking(true);
    setBusy(true);
    setInput('');

    const pid = nid();
    activeIdRef.current = pid;
    timersRef.current.push(
      window.setTimeout(() => {
        if (runId !== streamIdRef.current) return;
        setThinking(false);
        push({ id: pid, role: 'ai', text: '', streaming: true });
        nextSegment(runId);
      }, 800 + Math.random() * 400)
    );
  }

  function nextSegment(runId: number) {
    if (runId !== streamIdRef.current) return;
    const seg = queueRef.current.shift();
    if (!seg) {
      finish(runId);
      return;
    }
    const mid = activeIdRef.current;
    if (!mid) return;
    if (seg.kind === 'error') {
      patch(mid, { streaming: false, error: true, text: '' });
      setBusy(false);
      return;
    }
    if (seg.kind === 'cards') {
      patch(mid, { streaming: false, cards: seg.tasks, confirm: true });
      timersRef.current.push(window.setTimeout(() => nextSegment(runId), 450));
      return;
    }
    typeOut(runId, mid, seg.content);
  }

  function typeOut(runId: number, msgId: string, full: string) {
    const chars = Array.from(full);
    let i = 0;
    const step = () => {
      if (runId !== streamIdRef.current) return;
      i = Math.min(chars.length, i + 2);
      patch(msgId, { text: chars.slice(0, i).join(''), streaming: true });
      if (i < chars.length) {
        timersRef.current.push(window.setTimeout(step, 16));
      } else {
        timersRef.current.push(window.setTimeout(() => newMsgOrFinish(runId), 300));
      }
    };
    step();
  }

  function newMsgOrFinish(runId: number) {
    if (runId !== streamIdRef.current) return;
    if (queueRef.current.length === 0) {
      finish(runId);
      return;
    }
    const id = nid();
    activeIdRef.current = id;
    push({ id, role: 'ai', text: '', streaming: true });
    nextSegment(runId);
  }

  function finish(runId: number) {
    if (runId !== streamIdRef.current) return;
    const mid = activeIdRef.current;
    if (mid) patch(mid, { streaming: false, suggestions: suggestionsRef.current });
    setBusy(false);
    setThinking(false);
  }

  function stopGeneration() {
    streamIdRef.current += 1;
    clearTimers();
    const mid = activeIdRef.current;
    if (mid) patch(mid, { streaming: false, stopped: true });
    setThinking(false);
    setBusy(false);
  }

  function retry(id: string) {
    setMessages((ms) => ms.filter((m) => m.id !== id));
    beginSend(lastUserTextRef.current);
  }

  /* ---------- 预设指令（首屏召唤卡 / 局部入口带入） ---------- */
  useEffect(() => {
    if (chatOpen && chatPreset) {
      const p = chatPreset;
      consumePreset();
      timersRef.current.push(window.setTimeout(() => beginSend(p), 350));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatOpen, chatPreset]);

  useEffect(() => {
    if (chatOpen) window.setTimeout(() => inputRef.current?.focus(), 250);
  }, [chatOpen]);

  /* ---------- 应用到今日待办：Demo 最强时刻 ---------- */
  function applyCards(msg: ChatMessage) {
    if (!msg.cards) return;
    addTasks(msg.cards.map((t) => ({ ...t }) as Task));
    patch(msg.id, { applied: true, confirm: false });
  }

  const lastAssistant = [...messages].reverse().find((m) => m.role === 'ai');
  const canSend = input.trim().length > 0;

  return (
    <AnimatePresence>
      {chatOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeChat}
            aria-hidden
          />
          <motion.aside
            className={cx(
              'fixed z-50 flex flex-col border-l border-gray-200/80 bg-white/90 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-900/95',
              fullscreen
                ? 'inset-4 rounded-3xl border sm:inset-8'
                : 'inset-y-0 right-0 w-full sm:w-[400px] md:rounded-l-3xl md:border'
            )}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            role="dialog"
            aria-label="AI 助手"
          >
            {/* 头部 */}
            <header className="flex items-center gap-2.5 border-b border-gray-100 px-4 py-3 dark:border-gray-800">
              <button
                className="relative flex items-center gap-2.5 text-left"
                onClick={() => setHistoryOpen((v) => !v)}
                title="切换历史会话"
              >
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 text-white shadow-sm">
                  <Sparkles size={16} />
                </span>
                <span>
                  <span className="block text-sm font-semibold leading-none">AI 工作台助手</span>
                  <span className="mt-1 block text-[10px] leading-none text-gray-400">
                    当前页面：{pageLabels[page]} · 本地脚本模拟
                  </span>
                </span>
                <History size={13} className="ml-1 text-gray-300" />
              </button>
              <div className="ml-auto flex items-center gap-0.5">
                <IconButton label="清空当前会话" onClick={() => setMessages([])}>
                  <Eraser size={15} />
                </IconButton>
                <IconButton
                  label={fullscreen ? '退出沉浸模式' : '沉浸模式'}
                  onClick={() => setFullscreen((v) => !v)}
                >
                  {fullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                </IconButton>
                <IconButton label="关闭" onClick={closeChat}>
                  <X size={16} />
                </IconButton>
              </div>
            </header>

            {/* 历史会话下拉 */}
            {historyOpen && (
              <div className="absolute left-4 right-4 z-10 mt-2 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-xl dark:border-gray-700 dark:bg-gray-900">
                <p className="px-2 py-1 text-[10px] font-semibold text-gray-400">历史会话</p>
                {convs.map((c) => (
                  <div
                    key={c.id}
                    className="group flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <button
                      className="min-w-0 flex-1 truncate text-left text-xs"
                      onClick={() => {
                        setMessages(c.messages.map((m) => ({ ...m })));
                        setHistoryOpen(false);
                        push({ id: nid(), role: 'system', text: `已切换到「${c.title}」` });
                      }}
                    >
                      {c.title}
                      <span className="ml-1.5 text-[10px] text-gray-400">
                        {c.messages.length} 条
                      </span>
                    </button>
                    <button
                      aria-label={`删除会话 ${c.title}`}
                      onClick={() => setConvs((cs) => cs.filter((x) => x.id !== c.id))}
                      className="text-gray-300 opacity-0 transition-opacity hover:text-rose-500 group-hover:opacity-100"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 消息流 */}
            <div
              ref={scrollRef}
              onScroll={onScroll}
              className="scrollbar-thin relative flex-1 overflow-y-auto px-4 py-4"
            >
              {messages.length === 0 && !thinking ? (
                <EmptyAI onPick={(c) => beginSend(c)} busy={busy} />
              ) : (
                <div className="space-y-4">
                  {messages.map((m) => (
                    <MessageItem
                      key={m.id}
                      msg={m}
                      onSuggestion={(s) => beginSend(s)}
                      onApply={() => applyCards(m)}
                      onIgnore={() => patch(m.id, { ignored: true, confirm: false })}
                      onRetry={() => retry(m.id)}
                    />
                  ))}
                  {thinking && <ThinkingDots />}
                </div>
              )}

              {showJump && (
                <button
                  onClick={() => {
                    scrollRef.current?.scrollTo({
                      top: scrollRef.current.scrollHeight,
                      behavior: 'smooth',
                    });
                    setShowJump(false);
                  }}
                  className="sticky bottom-0 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-gray-200 bg-white/90 px-3 py-1 text-[11px] text-gray-500 shadow-md backdrop-blur dark:border-gray-700 dark:bg-gray-900/90 dark:text-gray-300"
                >
                  <ChevronsDown size={12} /> 回到底部
                </button>
              )}
            </div>

            {/* 输入区 */}
            <footer className="border-t border-gray-100 px-4 pb-4 pt-3 dark:border-gray-800">
              {aiContext && (
                <div className="mb-2 flex items-center gap-2 rounded-lg bg-brand-50 px-2.5 py-1.5 text-[11px] text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
                  <Pin size={11} className="shrink-0" />
                  <span className="min-w-0 flex-1 truncate">
                    来自{aiContext.kind === 'task' ? '任务' : '笔记'}「{aiContext.title}」
                  </span>
                  <button onClick={clearAiContext} aria-label="移除上下文" className="shrink-0">
                    <X size={12} />
                  </button>
                </div>
              )}

              {messages.length === 0 && (
                <div className="no-scrollbar mb-2.5 flex gap-1.5 overflow-x-auto pb-1">
                  {quickCommands.map((c) => (
                    <Chip key={c} onClick={() => beginSend(c)} disabled={busy}>
                      {c}
                    </Chip>
                  ))}
                </div>
              )}
              {lastAssistant?.suggestions && lastAssistant.suggestions.length > 0 && !busy && (
                <div className="no-scrollbar mb-2.5 flex gap-1.5 overflow-x-auto pb-1">
                  {lastAssistant.suggestions.map((c) => (
                    <Chip key={c} onClick={() => beginSend(c)}>
                      {c}
                    </Chip>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && canSend && !busy) beginSend(input.trim());
                  }}
                  placeholder={busy ? 'AI 正在回复…' : '与助手对话（试试"帮我规划今天下午"）'}
                  className="h-10 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3.5 text-sm outline-none transition-colors placeholder:text-gray-400 focus:border-brand-400 focus:bg-white dark:border-gray-700 dark:bg-gray-800/70 dark:focus:bg-gray-800"
                />
                {busy ? (
                  <button
                    onClick={stopGeneration}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                    aria-label="停止生成"
                    title="停止生成"
                  >
                    <Square size={13} fill="currentColor" />
                  </button>
                ) : (
                  <button
                    onClick={() => canSend && beginSend(input.trim())}
                    disabled={!canSend}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 text-white shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
                    aria-label="发送"
                  >
                    <Send size={14} />
                  </button>
                )}
              </div>
              <p className="mt-2 text-center text-[10px] text-gray-400">
                回复由本地脚本模拟，未接入真实模型 · 今日任务 {tasks.filter((t) => !t.done && t.group === 'today').length} 项待办
              </p>
            </footer>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/* ---------------- 子组件 ---------------- */

function IconButton({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid h-8 w-8 place-items-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
    >
      {children}
    </button>
  );
}

function Chip({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] text-gray-600 transition-colors hover:border-brand-300 hover:text-brand-600 disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800/70 dark:text-gray-300 dark:hover:border-brand-600"
    >
      {children}
    </button>
  );
}

function ThinkingDots() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-violet-500 text-white">
        <Sparkles size={12} />
      </span>
      <span className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-gray-100 px-3.5 py-3 dark:bg-gray-800">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-gray-400"
            animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18 }}
          />
        ))}
      </span>
    </div>
  );
}

function EmptyAI({ onPick, busy }: { onPick: (c: string) => void; busy: boolean }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-2 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 20 }}
        className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-violet-500 text-white shadow-lg shadow-brand-500/25"
      >
        <Sparkles size={24} />
      </motion.div>
      <h3 className="mt-4 text-base font-bold">你好，我是你的工作台助手</h3>
      <p className="mt-1.5 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
        我可以帮你规划时间、总结进展、拆解任务。
        <br />
        我的回复与工作台数据实时联动 —— 生成的任务可以直接落进今日待办。
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {quickCommands.map((c) => (
          <Chip key={c} onClick={() => onPick(c)} disabled={busy}>
            {c}
          </Chip>
        ))}
      </div>
      <p className="mt-6 text-[10px] text-gray-400">
        💡 小提示：输入包含"报错"二字可以演示错误重试链路
      </p>
    </div>
  );
}

function MessageItem({
  msg,
  onSuggestion,
  onApply,
  onIgnore,
  onRetry,
}: {
  msg: ChatMessage;
  onSuggestion: (s: string) => void;
  onApply: () => void;
  onIgnore: () => void;
  onRetry: () => void;
}) {
  if (msg.role === 'system') {
    return <p className="text-center text-[10px] text-gray-400">{msg.text}</p>;
  }

  if (msg.role === 'user') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-end"
      >
        <span className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-sm bg-brand-600 px-3.5 py-2.5 text-sm leading-relaxed text-white shadow-sm">
          {msg.text}
          <span className="ml-1.5 inline-flex translate-y-0.5 items-center gap-0.5 text-[9px] text-white/60">
            ✓<Check size={8} strokeWidth={4} />
          </span>
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-2.5"
    >
      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-violet-500 text-white">
        <Sparkles size={12} />
      </span>
      <div className="min-w-0 flex-1 space-y-2">
        {msg.error ? (
          <div className="rounded-2xl rounded-tl-sm border border-rose-200 bg-rose-50 px-3.5 py-3 text-xs dark:border-rose-900 dark:bg-rose-950/40">
            <p className="flex items-center gap-1.5 font-medium text-rose-600 dark:text-rose-400">
              <TriangleAlert size={13} /> 生成失败：模拟网络异常
            </p>
            <p className="mt-1 text-rose-500/80 dark:text-rose-400/70">
              （演示状态：错误恢复链路。点重试继续。）
            </p>
            <button
              onClick={onRetry}
              className="mt-2 flex items-center gap-1 rounded-lg bg-rose-500 px-2.5 py-1.5 font-medium text-white hover:bg-rose-600"
            >
              <RotateCw size={11} /> 重试
            </button>
          </div>
        ) : (
          <>
            {(msg.text || msg.streaming) && (
              <div className="max-w-[92%] whitespace-pre-wrap break-words rounded-2xl rounded-tl-sm bg-gray-100 px-3.5 py-2.5 text-sm leading-relaxed dark:bg-gray-800">
                {msg.text}
                {msg.streaming && <span className="typing-caret" />}
                {msg.stopped && <span className="ml-1 text-[10px] text-gray-400">（已停止）</span>}
              </div>
            )}

            {msg.cards?.map((t, i) => {
              const p = priorityMeta[t.priority];
              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 shadow-sm dark:border-gray-700 dark:bg-gray-900"
                >
                  <div className="flex items-center gap-2">
                    <span className={cx('h-2 w-2 shrink-0 rounded-full', p.dot)} />
                    <span className="min-w-0 flex-1 truncate text-xs font-medium">{t.title}</span>
                  </div>
                  <p className="mt-1 pl-4 text-[10px] text-gray-400">
                    {t.due} · 优先级{p.label} · {t.tag}
                  </p>
                </motion.div>
              );
            })}

            {msg.confirm && !msg.applied && !msg.ignored && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-50 to-violet-50 px-3 py-2 dark:from-brand-500/10 dark:to-violet-500/10"
              >
                <span className="flex-1 text-[11px] text-brand-700 dark:text-brand-300">
                  要改动你的工作台数据
                </span>
                <button
                  onClick={onApply}
                  className="flex items-center gap-1 rounded-lg bg-brand-600 px-2.5 py-1.5 text-[11px] font-medium text-white shadow-sm hover:bg-brand-500"
                >
                  <Check size={11} /> 应用到今日待办
                </button>
                <button
                  onClick={onIgnore}
                  aria-label="忽略"
                  className="grid h-6 w-6 place-items-center rounded-lg text-gray-400 hover:bg-white/60 hover:text-gray-600 dark:hover:bg-gray-800"
                >
                  <X size={12} />
                </button>
              </motion.div>
            )}
            {msg.applied && (
              <p className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                <Check size={11} /> 已应用到今日待办
              </p>
            )}
            {msg.ignored && <p className="text-[11px] text-gray-400">已忽略</p>}

            {msg.suggestions?.map((s) => (
              <Chip key={s} onClick={() => onSuggestion(s)}>
                {s}
              </Chip>
            ))}
          </>
        )}
      </div>
    </motion.div>
  );
}
