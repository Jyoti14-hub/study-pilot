import type { StudyTask, Flashcard, ChatMessage, QuizResult, AppSettings } from '@/types';

const KEYS = {
  tasks: 'studypilot_tasks',
  flashcards: 'studypilot_flashcards',
  chat: 'studypilot_chat',
  quizResults: 'studypilot_quiz_results',
  settings: 'studypilot_settings',
} as const;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota errors silently
  }
}

export const storage = {
  getTasks: (): StudyTask[] => read<StudyTask[]>(KEYS.tasks, []),
  setTasks: (tasks: StudyTask[]) => write(KEYS.tasks, tasks),

  getFlashcards: (): Flashcard[] => read<Flashcard[]>(KEYS.flashcards, []),
  setFlashcards: (cards: Flashcard[]) => write(KEYS.flashcards, cards),

  getChat: (): ChatMessage[] => read<ChatMessage[]>(KEYS.chat, []),
  setChat: (messages: ChatMessage[]) => write(KEYS.chat, messages),
  clearChat: () => localStorage.removeItem(KEYS.chat),

  getQuizResults: (): QuizResult[] => read<QuizResult[]>(KEYS.quizResults, []),
  setQuizResults: (results: QuizResult[]) => write(KEYS.quizResults, results),

  getSettings: (): AppSettings =>
    read<AppSettings>(KEYS.settings, {
      speechRate: 1,
      autoSpeak: false,
      demoModeAcknowledged: false,
    }),
  setSettings: (settings: AppSettings) => write(KEYS.settings, settings),
};

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
