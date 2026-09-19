import type {
  CalendarEvent,
  ChatMessage,
  Conversation,
  Habit,
  Note,
  NotificationItem,
  Task,
} from '../types';

/* ============ 任务（全站唯一数据源，多处共享联动） ============ */

export const mockTasks: Task[] = [
  { id: 't1', title: '整理 Q3 周报初稿', done: false, priority: 'high', due: '14:00', tag: '工作', group: 'today' },
  { id: 't2', title: '回复张总的合作邮件', done: false, priority: 'high', due: '11:30', tag: '沟通', group: 'today' },
  { id: 't3', title: '评审设计稿：工作台首页 v2', done: false, priority: 'medium', due: '16:00', tag: '设计', group: 'today' },
  { id: 't4', title: '更新项目 Roadmap', done: false, priority: 'medium', due: '18:00', tag: '规划', group: 'today' },
  { id: 't5', title: '晨会纪要同步给团队', done: true, priority: 'low', due: '09:40', tag: '沟通', group: 'today' },
  { id: 't6', title: '修复登录页样式错位', done: true, priority: 'medium', due: '10:20', tag: '开发', group: 'today' },
  { id: 't7', title: '预定下周评审会议室', done: true, priority: 'low', due: '08:50', tag: '事务', group: 'today' },
  { id: 't8', title: '整理昨天的用户访谈录音', done: false, priority: 'low', due: '20:00', tag: '调研', group: 'today' },

  { id: 't9', title: '准备季度述职 PPT', done: false, priority: 'high', due: '周四', tag: '工作', group: 'week' },
  { id: 't10', title: '输出竞品分析文档 v1', done: false, priority: 'medium', due: '周五', tag: '调研', group: 'week' },
  { id: 't11', title: '读完《系统之美》第 4 章', done: false, priority: 'low', due: '周日', tag: '学习', group: 'week' },
  { id: 't12', title: '约牙医复诊', done: false, priority: 'low', due: '本周内', tag: '生活', group: 'week' },

  { id: 't13', title: '研究 Recharts 自定义 Tooltip 写法', done: false, priority: 'low', tag: '灵感', group: 'inbox' },
  { id: 't14', title: '周末买菜清单：燕麦、蓝莓、鸡蛋', done: false, priority: 'low', tag: '生活', group: 'inbox' },
];

/* ============ 日程 ============ */

export const mockEvents: CalendarEvent[] = [
  { id: 'e1', title: '团队晨会', start: 510, end: 540, kind: 'meeting', attendees: ['全组 8 人'] },
  { id: 'e2', title: '与设计组评审首页 v2', start: 540, end: 600, kind: 'meeting', attendees: ['王芳', '刘洋'] },
  { id: 'e3', title: '深度工作 · 周报初稿', start: 600, end: 660, kind: 'focus' },
  { id: 'e4', title: 'Q3 周报对焦', start: 840, end: 900, kind: 'meeting', attendees: ['陈晨', '产品线 3 人'] },
  { id: 'e5', title: '一对一沟通：陈晨', start: 900, end: 930, kind: 'meeting', attendees: ['陈晨'] },
  { id: 'e6', title: '健身 · 力量训练', start: 960, end: 1020, kind: 'personal' },
];

export const mockTomorrowEvents: CalendarEvent[] = [
  { id: 'e7', title: '产品委员会季度评审', start: 600, end: 660, kind: 'meeting', attendees: ['委员会 6 人'] },
  { id: 'e8', title: '与设计组对齐首页改版结论', start: 900, end: 930, kind: 'meeting', attendees: ['王芳'] },
];

/* ============ 笔记 ============ */

export const mockNotes: Note[] = [
  {
    id: 'n1',
    title: '工作台 Demo 设计要点',
    tag: '产品',
    updatedAt: '今天 10:24',
    content:
      '关键词：现代、克制、呼吸感。\n中性灰承担 90% 界面，品牌靶蓝只出现在主 CTA、AI 元素与选中态。\nAI 相关一律带渐变与 ✨ 图形语言，和自然模块一眼区分。\n动效只服务于反馈：勾选、出卡片、切页，时长控制在 150–300ms。\n假数据要像真数据——文案禁用 test/示例1。',
  },
  {
    id: 'n2',
    title: 'Q3 目标对齐会议纪要',
    tag: '会议',
    updatedAt: '昨天 17:02',
    content:
      '结论一：Q3 重心从拉新转向留存，北极星指标改为 7 日回访率。\n结论二：增长实验由数据组统一排期，业务方不再并行开实验。\n待办：我负责在周五前输出指标看板初稿；陈晨跟进埋点评审。\n风险：留存口径与财务口径不一致，下周找对账会确认。',
  },
  {
    id: 'n3',
    title: '读书笔记：《系统之美》第 3 章',
    tag: '学习',
    updatedAt: '周一 22:41',
    content:
      '存量与流量：水库模型。浴缸的水位是存量，水龙头和排水口是流量。\n任何系统都有反馈回路；正回路放大，负回路回归目标。\n个人启发：把"任务完成数"当流量、"精力"当存量来管理，避免只优化流量不顾存量枯竭。',
  },
  {
    id: 'n4',
    title: '面试素材：项目里最难的一次取舍',
    tag: '个人',
    updatedAt: '上周四',
    content:
      '背景：搜索改版工期一周，方案 A 全量重构、方案 B 灰度共存。\n选择 B 的理由：可回滚、验证成本低、团队心智负担小。\n结果：两周后指标正向，再平滑迁移，零事故。\n可复用的表达框架：约束 → 选项 → 判据 → 结果 → 反思。',
  },
];

/* ============ 习惯打卡 ============ */

export const mockHabits: Habit[] = [
  { id: 'h1', name: '阅读 30 分钟', emoji: '📚', streak: 12, week: [true, true, true, true, true, false, false] },
  { id: 'h2', name: '晨间运动', emoji: '🏃', streak: 8, week: [true, false, true, true, false, true, false] },
  { id: 'h3', name: '喝水 8 杯', emoji: '💧', streak: 21, week: [true, true, true, true, true, true, false] },
  { id: 'h4', name: '英语单词', emoji: '🔤', streak: 5, week: [false, true, true, false, true, false, false] },
];

/* ============ 图表数据 ============ */

export const weeklyCompleted = [
  { day: '周一', count: 5 },
  { day: '周二', count: 8 },
  { day: '周三', count: 6 },
  { day: '周四', count: 9 },
  { day: '周五', count: 8 },
  { day: '周六', count: 3 },
  { day: '周日', count: 2 },
];

export const timeAllocation = [
  { name: '深度工作', value: 55 },
  { name: '会议沟通', value: 25 },
  { name: '碎片处理', value: 20 },
];

export const focusTrend = [
  { day: '周一', hours: 2.5 },
  { day: '周二', hours: 3.2 },
  { day: '周三', hours: 1.8 },
  { day: '周四', hours: 4.1 },
  { day: '周五', hours: 3.6 },
  { day: '周六', hours: 1.2 },
  { day: '周日', hours: 0.8 },
];

/** 洞察页热力图：最近 28 天（0 未打卡 / 1 已打卡） */
export const habitHeat: { name: string; emoji: string; pattern: string }[] = [
  { name: '阅读 30 分钟', emoji: '📚', pattern: '1111011111101111110111111101' },
  { name: '晨间运动', emoji: '🏃', pattern: '1011001101011001110011010011' },
  { name: '喝水 8 杯', emoji: '💧', pattern: '1111111111111011111111111111' },
  { name: '英语单词', emoji: '🔤', pattern: '0011010011010001101001101001' },
];

/* ============ 通知 / 快捷入口 ============ */

export const mockNotifications: NotificationItem[] = [
  { id: 'm1', text: '陈晨 评论了你的任务「整理 Q3 周报初稿」', time: '10 分钟前', unread: true },
  { id: 'm2', text: '15 分钟后将开始「Q3 周报对焦」', time: '刚刚', unread: true },
  { id: 'm3', text: '你已连续打卡 12 天，继续保持！', time: '今天 08:12', unread: true },
];

export const quickLinks: { id: string; label: string; icon: string }[] = [
  { id: 'q1', label: 'GitHub', icon: 'github' },
  { id: 'q2', label: 'Figma', icon: 'figma' },
  { id: 'q3', label: '语雀文档', icon: 'book' },
  { id: 'q4', label: '云效看板', icon: 'kanban' },
  { id: 'q5', label: 'Excalidraw', icon: 'pen' },
  { id: 'q6', label: '小宇宙', icon: 'podcast' },
];

/* ============ AI 历史会话（模拟"AI 有记忆"） ============ */

const hist = (id: string, role: 'user' | 'ai', text: string): ChatMessage => ({ id, role, text });

export const mockConversations: Conversation[] = [
  {
    id: 'c1',
    title: '今天 · 下午规划',
    messages: [],
  },
  {
    id: 'c2',
    title: '昨天的周报草稿',
    messages: [
      hist('c2-1', 'user', '帮我看看周报还缺什么'),
      hist('c2-2', 'ai', '目前缺三块：本周指标环比、风险项的定责、下周里程碑。建议把「留存口径不一致」写进风险项，并指派对账会。'),
    ],
  },
  {
    id: 'c3',
    title: '竞品功能拆解',
    messages: [
      hist('c3-1', 'user', 'Linear 的命令面板好在哪'),
      hist('c3-2', 'ai', '三点：全局可达（⌘K 随处唤起）、零鼠标闭环（键盘选择+回车执行）、结果分组贴合意图（跳转/操作/搜索分开）。这三点是命令面板的验收标准。'),
    ],
  },
];
