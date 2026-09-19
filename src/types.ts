export type Priority = 'high' | 'medium' | 'low';
export type TaskGroup = 'today' | 'week' | 'inbox';
export type PageKey = 'dashboard' | 'tasks' | 'calendar' | 'notes' | 'insights';

export interface Task {
  id: string;
  title: string;
  done: boolean;
  priority: Priority;
  due?: string;
  tag?: string;
  group: TaskGroup;
}

export interface CalendarEvent {
  id: string;
  title: string;
  /** 当天分钟数，如 14:00 => 840 */
  start: number;
  end: number;
  kind: 'meeting' | 'focus' | 'personal';
  attendees?: string[];
}

export interface Note {
  id: string;
  title: string;
  tag: string;
  updatedAt: string;
  content: string;
}

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  streak: number;
  /** 周一为索引 0 */
  week: boolean[];
}

export interface NotificationItem {
  id: string;
  text: string;
  time: string;
  unread: boolean;
}

export interface AIContext {
  kind: 'task' | 'note';
  title: string;
}

export type MessageRole = 'user' | 'ai' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  /** AI 正在流式输出 */
  streaming?: boolean;
  /** 输出被手动停止 */
  stopped?: boolean;
  cards?: Task[];
  /** 卡片下方显示"应用到今日待办"确认条 */
  confirm?: boolean;
  applied?: boolean;
  ignored?: boolean;
  suggestions?: string[];
  error?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
}
