import {
  MessageCircle,
  CalendarDays,
  Layers,
  CheckSquare,
  ArrowRight,
  Sparkles,
  Clock,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import type { ViewId, StudyTask, Flashcard } from '@/types';
import { formatDeadline, deadlineColor } from '@/utils/date';

interface HomeViewProps {
  tasks: StudyTask[];
  flashcards: Flashcard[];
  onNavigate: (view: ViewId) => void;
  isDemoMode: boolean;
}

export function HomeView({ tasks, flashcards, onNavigate, isDemoMode }: HomeViewProps) {
  const incomplete = tasks.filter((t) => !t.completed);
  const completed = tasks.filter((t) => t.completed);
  const completionRate =
    tasks.length > 0 ? Math.round((completed.length / tasks.length) * 100) : 0;

  const nextDeadline = incomplete
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())[0];

  const knownCards = flashcards.filter((c) => c.status === 'known').length;

  const features: { id: ViewId; title: string; desc: string; icon: typeof MessageCircle; color: string }[] = [
    {
      id: 'ask',
      title: 'Ask StudyPilot',
      desc: 'Get explanations, study plans, quizzes, and revision help through conversation.',
      icon: MessageCircle,
      color: 'text-lavender-500 bg-lavender-100',
    },
    {
      id: 'plan',
      title: 'Study Plan',
      desc: 'Generate a personalized study schedule from your tasks and available time.',
      icon: CalendarDays,
      color: 'text-accent-blue bg-accent-blue/10',
    },
    {
      id: 'flashcards',
      title: 'Flashcards & Quiz',
      desc: 'Practice with flashcards and test yourself with multiple-choice quizzes.',
      icon: Layers,
      color: 'text-accent-green bg-accent-green/10',
    },
    {
      id: 'tasks',
      title: 'Tasks',
      desc: 'Manage your study tasks, deadlines, and priorities all in one place.',
      icon: CheckSquare,
      color: 'text-accent-amber bg-accent-amber/10',
    },
  ];

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-4xl px-4 py-6 md:px-6">
        {/* Welcome */}
        <div className="mb-8 rounded-xl border border-navy-100 bg-white p-6 shadow-card md:p-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={20} className="text-lavender-500" />
            <span className="text-xs font-medium uppercase tracking-wide text-lavender-600">
              Welcome to StudyPilot
            </span>
          </div>
          <h2 className="text-2xl font-bold text-navy-800 md:text-3xl">
            Your conversational AI study companion
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-navy-500 md:text-base">
            Understand concepts, organize deadlines, prepare for exams, and practice what
            you learn — all through natural conversation. StudyPilot helps you stay on top
            of your studies with a calm, focused approach.
          </p>
          {isDemoMode && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-lavender-50 px-3.5 py-2.5 text-sm text-lavender-700">
              <AlertCircle size={16} />
              Running in demo mode with sample responses. Connect an AI backend for fully dynamic answers.
            </div>
          )}
          <button
            onClick={() => onNavigate('ask')}
            className="btn-primary mt-5"
          >
            <MessageCircle size={18} />
            Start a conversation
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Quick stats */}
        <div className="mb-8 grid gap-3 sm:grid-cols-3">
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={16} className="text-lavender-500" />
              <span className="text-xs text-navy-400">Completion</span>
            </div>
            <p className="text-2xl font-bold text-navy-800">{completionRate}%</p>
            <p className="text-xs text-navy-400">{completed.length} of {tasks.length} tasks done</p>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={16} className="text-accent-amber" />
              <span className="text-xs text-navy-400">Pending tasks</span>
            </div>
            <p className="text-2xl font-bold text-navy-800">{incomplete.length}</p>
            <p className="text-xs text-navy-400">
              {incomplete.filter((t) => t.priority === 'high').length} high priority
            </p>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-1">
              <Layers size={16} className="text-accent-green" />
              <span className="text-xs text-navy-400">Flashcards known</span>
            </div>
            <p className="text-2xl font-bold text-navy-800">{knownCards}</p>
            <p className="text-xs text-navy-400">of {flashcards.length} total</p>
          </div>
        </div>

        {/* Next deadline alert */}
        {nextDeadline && (
          <div className="mb-8 flex items-center gap-3 rounded-xl border border-accent-amber/20 bg-accent-amber/5 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-amber/10 text-accent-amber">
              <Clock size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-navy-800">{nextDeadline.title}</p>
              <p className={`text-xs ${deadlineColor(nextDeadline.deadline)}`}>
                {formatDeadline(nextDeadline.deadline)} &middot; {nextDeadline.subject}
              </p>
            </div>
            <button
              onClick={() => onNavigate('plan')}
              className="btn-ghost shrink-0 text-xs"
            >
              View Plan
              <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* Feature cards */}
        <h3 className="mb-3 text-sm font-semibold text-navy-700">What would you like to do?</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <button
                key={f.id}
                onClick={() => onNavigate(f.id)}
                className="card group flex items-start gap-4 p-5 text-left transition-all hover:shadow-lifted hover:border-lavender-200"
              >
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${f.color}`}>
                  <Icon size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-semibold text-navy-800">{f.title}</h4>
                  <p className="mt-0.5 text-xs leading-relaxed text-navy-400">{f.desc}</p>
                </div>
                <ArrowRight
                  size={18}
                  className="shrink-0 text-navy-300 transition-all group-hover:translate-x-1 group-hover:text-lavender-500"
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
