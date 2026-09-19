import type { AIContext, Task } from '../types';
import { mockTasks, mockTomorrowEvents } from '../data/mock';

export type ScriptSegment =
  | { kind: 'text'; content: string }
  | { kind: 'cards'; tasks: Task[] }
  | { kind: 'error' };

export interface Script {
  segments: ScriptSegment[];
  suggestions: string[];
}

let seq = 0;
const aiTask = (title: string, priority: Task['priority'], due: string): Task => ({
  id: `ai-${++seq}`,
  title,
  priority,
  due,
  tag: 'AI 生成',
  group: 'today',
  done: false,
});

const fmtMin = (m: number) =>
  `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

export const quickCommands = [
  '帮我规划今天下午',
  '总结今天做了什么',
  '这个任务怎么拆？',
  '查一下明天有什么会',
  '帮我想个产品名',
];

/**
 * 规则匹配（关键词命中 → 播放预写脚本），非真实 AI。
 * 含"报错"二字的输入用于故意演示错误恢复链路。
 */
export function matchScript(input: string, context: AIContext | null): Script {
  const todo = mockTasks.filter((t) => t.group === 'today' && !t.done);
  const doneToday = mockTasks.filter((t) => t.group === 'today' && t.done);

  if (/报错|失败/.test(input)) {
    return {
      segments: [
        { kind: 'text', content: '好的，我来演示一次失败与恢复：' },
        { kind: 'error' },
      ],
      suggestions: [],
    };
  }

  if (/规划|安排/.test(input) || /下午/.test(input)) {
    return {
      segments: [
        {
          kind: 'text',
          content: `我看了一下你今天的节奏：会议都排在 08:30–11:00 与 14:00–17:00 两个窗口，14:00 有「Q3 周报对焦」，15:30–16:00 有半小时整段空档，17:00 健身结束后完全空闲。结合你还未完成的 ${
            todo.length
          } 项今日任务，建议这样安排下午：`,
        },
        {
          kind: 'text',
          content: '优先级从上到下递减，周报最紧，视觉稿可以拆两段做：',
        },
        {
          kind: 'cards',
          tasks: [
            aiTask('完成 Q3 周报初稿：聚焦三件事', 'high', '14:00 前'),
            aiTask('按评审意见修改工作台首页视觉稿', 'medium', '15:30'),
            aiTask('给陈晨发送一对一沟通议程', 'low', '17:30'),
          ],
        },
        { kind: 'text', content: '确认后点「应用到今日待办」，我会把它们同步进任务清单。' },
      ],
      suggestions: ['总结今天做了什么', '帮我想个产品名'],
    };
  }

  if (/生成今日日报|生成日报/.test(input)) {
    return {
      segments: [
        { kind: 'text', content: '已把今日总结存为笔记《9 月 19 日工作日报》，可在「笔记」页查看。' },
      ],
      suggestions: ['帮我规划今天下午'],
    };
  }

  if (/总结|日报|回顾/.test(input)) {
    const list = doneToday.map((t) => `· ${t.title}`).join('\n');
    return {
      segments: [
        {
          kind: 'text',
          content: `今天到目前为止你完成了 ${doneToday.length} 项任务：\n${list}\n\n深度专注约 2 小时 15 分钟。下午还有 2 场会议，建议 16:00 前保留一段不被打扰的时间收尾周报。`,
        },
        {
          kind: 'text',
          content: '（演示说明：点下方的「生成今日日报」，我会把这份总结归档为笔记。）',
        },
      ],
      suggestions: ['生成今日日报', '帮我规划今天下午'],
    };
  }

  if (/整理|润色|清单/.test(input)) {
    const target = context?.title ?? '这篇笔记';
    return {
      segments: [
        {
          kind: 'text',
          content: `我读完了「${target}」，提炼出 3 条可执行事项：`,
        },
        {
          kind: 'cards',
          tasks: [
            aiTask(`落实《${target}》· 明确本条结论的负责人与截止时间`, 'high', '明天 11:00 前'),
            aiTask(`落实《${target}》· 把关键数字同步给相关同学`, 'medium', '本周内'),
            aiTask(`落实《${target}》· 一周后回看执行结果`, 'low', '下周五'),
          ],
        },
      ],
      suggestions: ['帮我规划今天下午'],
    };
  }

  if (/拆|分解/.test(input)) {
    const target = context?.title ?? '整理 Q3 周报初稿';
    return {
      segments: [
        {
          kind: 'text',
          content: `我把「${target}」按"先搭骨架、再填内容、最后润色"的思路拆成了 3 步，每步都在 40 分钟以内：`,
        },
        {
          kind: 'cards',
          tasks: [
            aiTask(`拆解「${target}」· 步骤 1：列提纲与本周关键事件`, 'high', '今天 40 分钟'),
            aiTask(`拆解「${target}」· 步骤 2：填入指标与对比数据`, 'medium', '今天 40 分钟'),
            aiTask(`拆解「${target}」· 步骤 3：结论先行改写开头`, 'low', '明天上午'),
          ],
        },
        { kind: 'text', content: '点「应用到今日待办」即可写入任务清单。' },
      ],
      suggestions: ['帮我规划今天下午'],
    };
  }

  if (/明天|会议|日程/.test(input)) {
    const ev = mockTomorrowEvents
      .map((e) => `· ${fmtMin(e.start)} ${e.title}（${e.attendees?.join('、') ?? ''}）`)
      .join('\n');
    return {
      segments: [
        { kind: 'text', content: `你明天有 2 场会：\n${ev}\n\n上午 10:00–11:00 的季度评审需要你讲 Roadmap；两场会之间整段空闲，适合安排深度工作。` },
      ],
      suggestions: ['帮我规划今天下午', '这个任务怎么拆？'],
    };
  }

  if (/产品名|起名|命名/.test(input)) {
    return {
      segments: [
        {
          kind: 'text',
          content:
            '给你 5 个方向，都控制在 3 个字以内、能读出口：\n\n1. 栖云 —— 强调"安放工作"\n2. 流水台 —— 工作台 + 心流双关\n3. 晴耕 —— 晴耕雨读，节奏感\n4. 一格 —— 一屏一格的秩序\n5. Lumos —— 光，国际化语境\n\n个人偏好吃得开、讲得清的「一格」。',
        },
      ],
      suggestions: ['帮我想个 slogan', '这个任务怎么拆？'],
    };
  }

  return {
    segments: [
      {
        kind: 'text',
        content:
          '坦白说：这是一个纯前端 Demo，我的回复来自本地关键词脚本，不接真实大模型。但你看到的工作台联动（任务卡 → 应用到今日待办）是真的。\n\n试试上面的快捷指令，或者问我"帮我规划今天下午"。',
      },
    ],
    suggestions: quickCommands.slice(0, 3),
  };
}
