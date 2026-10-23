import type { ChatMessage, StudyTask, StudySchedule, QuizQuestion } from '@/types';
import { demoChatResponses, demoQuizQuestions } from './demoData';
import { generateId } from './storage';

/**
 * API service layer for StudyPilot.
 *
 * All functions read the backend base URL from VITE_API_BASE_URL.
 * If no backend is configured or the request fails, functions fall back
 * to labelled demo responses so the app remains fully functional.
 *
 * To connect a real Python FastAPI backend:
 * 1. Set VITE_API_BASE_URL in your .env file (e.g. http://localhost:8000)
 * 2. Implement these endpoints on your backend:
 *    - POST /api/chat           -> { message: string, history: ChatMessage[] }
 *    - POST /api/study-plan     -> { tasks: StudyTask[], availableMinutes: number }
 *    - POST /api/quiz           -> { subject: string, count: number }
 */

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';
const BASE_URL = rawBaseUrl.replace(/\/+$/, '');

export const isDemoMode = !BASE_URL;

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Backend returned ${res.status}`);
  }
  return (await res.json()) as T;
}

function findDemoResponse(message: string): string {
  const lower = message.toLowerCase();
  const match = demoChatResponses.find((r) =>
    r.keywords.some((k) => lower.includes(k)),
  );
  return (
    match?.response ??
    `Here's what I can tell you about that:

Your question touches on an important topic. While I'm in demo mode, here's a general approach:

1. **Break the problem down** into smaller parts
2. **Identify what you already know** versus what you need to learn
3. **Find examples** that illustrate the concept
4. **Practice** applying it to new situations

When a real AI backend is connected, I'll give you a detailed, specific answer. For now, try asking me to "explain a concept," "plan my study session," "quiz me," or "help me revise for an exam."`
  );
}

/**
 * Send a chat message and get a response.
 * Falls back to a demo response labelled as such.
 */
export async function sendChatMessage(
  message: string,
  _history: ChatMessage[],
): Promise<{ content: string; isDemo: boolean }> {
  if (!BASE_URL) {
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 600));
    return { content: findDemoResponse(message), isDemo: true };
  }

  try {
    const data = await postJson<{ response?: string; reply?: string }>('/api/chat', {
      message,
      history: _history,
    });
    const content = data.reply ?? data.response ?? '';
    return { content, isDemo: false };
  } catch {
    return {
      content:
        findDemoResponse(message) +
        '\n\n*Note: I could not reach the AI backend, so this is a demo response.*',
      isDemo: true,
    };
  }
}

/**
 * Generate a study schedule from incomplete tasks and available time.
 * Falls back to a locally-computed schedule.
 */
export async function generateStudyPlan(
  tasks: StudyTask[],
  availableMinutesPerDay: number,
): Promise<{ schedule: StudySchedule; isDemo: boolean }> {
  if (!BASE_URL) {
    await new Promise((r) => setTimeout(r, 500 + Math.random() * 400));
    return { schedule: localStudyPlan(tasks, availableMinutesPerDay), isDemo: true };
  }

  try {
    const data = await postJson<{ schedule: StudySchedule }>('/api/study-plan', {
      tasks,
      availableMinutesPerDay,
    });
    return { schedule: data.schedule, isDemo: false };
  } catch {
    return {
      schedule: localStudyPlan(tasks, availableMinutesPerDay),
      isDemo: true,
    };
  }
}

/**
 * Generate quiz questions for a subject.
 * Falls back to demo questions.
 */
export async function generateQuiz(
  subject: string,
  count: number,
): Promise<{ questions: QuizQuestion[]; isDemo: boolean }> {
  if (!BASE_URL) {
    await new Promise((r) => setTimeout(r, 500 + Math.random() * 400));
    return { questions: localQuiz(subject, count), isDemo: true };
  }

  try {
    const data = await postJson<{ questions: QuizQuestion[] }>('/api/quiz', {
      subject,
      count,
    });
    return { questions: data.questions, isDemo: false };
  } catch {
    return { questions: localQuiz(subject, count), isDemo: true };
  }
}

// --- Local computation helpers ---

function localStudyPlan(
  tasks: StudyTask[],
  availableMinutesPerDay: number,
): StudySchedule {
  const incomplete = tasks
    .filter((t) => !t.completed)
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    });

  const blocks: StudySchedule['blocks'] = [];
  let dayIndex = 0;
  let remainingToday = availableMinutesPerDay;

  const dayNames = ['Today', 'Tomorrow', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];

  for (const task of incomplete) {
    let allocated = 0;
    while (allocated < task.estimatedMinutes) {
      if (remainingToday <= 0) {
        dayIndex++;
        remainingToday = availableMinutesPerDay;
      }
      const chunk = Math.min(
        task.estimatedMinutes - allocated,
        remainingToday,
        90, // cap sessions at 90 min
      );
      blocks.push({
        day: dayNames[Math.min(dayIndex, dayNames.length - 1)],
        taskTitle: task.title,
        subject: task.subject,
        minutes: chunk,
        priority: task.priority,
      });
      allocated += chunk;
      remainingToday -= chunk;
    }
  }

  const highPriority = incomplete.filter((t) => t.priority === 'high');
  const explanation = `This schedule prioritizes **${highPriority.length} high-priority tasks** first, sorted by deadline urgency. Each study session is capped at 90 minutes to maintain focus, with tasks split across available days based on your ${availableMinutesPerDay}-minute daily capacity. Tasks closer to their deadline are scheduled earlier, and longer tasks are broken into manageable chunks.`;

  return { blocks, explanation };
}

function localQuiz(subject: string, count: number): QuizQuestion[] {
  let pool = demoQuizQuestions;
  if (subject !== 'All Subjects') {
    pool = demoQuizQuestions.filter((q) => q.subject === subject);
  }
  return pool.slice(0, count);
}

export function createAssistantMessage(
  content: string,
  isDemo: boolean,
): ChatMessage {
  return {
    id: generateId(),
    role: 'assistant',
    content,
    timestamp: new Date().toISOString(),
    isDemo,
  };
}

export function createUserMessage(content: string): ChatMessage {
  return {
    id: generateId(),
    role: 'user',
    content,
    timestamp: new Date().toISOString(),
    isDemo: false,
  };
}
