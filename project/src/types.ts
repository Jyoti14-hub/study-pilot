export type ViewId =
  | 'home'
  | 'ask'
  | 'plan'
  | 'flashcards'
  | 'tasks'
  | 'settings';

export type Priority = 'high' | 'medium' | 'low';

export interface StudyTask {
  id: string;
  subject: string;
  title: string;
  deadline: string; // ISO date
  priority: Priority;
  estimatedMinutes: number;
  completed: boolean;
  createdAt: string;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  subject: string;
  status: 'new' | 'known' | 'revision';
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isDemo: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
  subject: string;
}

export interface QuizResult {
  id: string;
  score: number;
  total: number;
  subject: string;
  takenAt: string;
}

export interface StudyBlock {
  day: string;
  taskTitle: string;
  subject: string;
  minutes: number;
  priority: Priority;
}

export interface StudySchedule {
  blocks: StudyBlock[];
  explanation: string;
}

export interface AppSettings {
  speechRate: number;
  autoSpeak: boolean;
  demoModeAcknowledged: boolean;
}
