import { useState, useEffect, useCallback } from 'react';
import { Menu } from 'lucide-react';
import type { ViewId, StudyTask, Flashcard, AppSettings } from '@/types';
import { storage } from '@/services/storage';
import { demoTasks, demoFlashcards } from '@/services/demoData';
import { isDemoMode } from '@/services/api';
import { Sidebar } from '@/components/Sidebar';
import { ContextPanel } from '@/components/ContextPanel';
import { HomeView } from '@/views/HomeView';
import { ChatView } from '@/views/ChatView';
import { PlannerView } from '@/views/PlannerView';
import { FlashcardsView } from '@/views/FlashcardsView';
import { TasksView } from '@/views/TasksView';
import { SettingsView } from '@/views/SettingsView';

function App() {
  const [view, setView] = useState<ViewId>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    speechRate: 1,
    autoSpeak: false,
    demoModeAcknowledged: false,
  });

  // Initialize data from localStorage or seed with demo data
  useEffect(() => {
    const savedTasks = storage.getTasks();
    const savedCards = storage.getFlashcards();
    const savedSettings = storage.getSettings();

    if (savedTasks.length === 0) {
      storage.setTasks(demoTasks);
      setTasks(demoTasks);
    } else {
      setTasks(savedTasks);
    }

    if (savedCards.length === 0) {
      storage.setFlashcards(demoFlashcards);
      setFlashcards(demoFlashcards);
    } else {
      setFlashcards(savedCards);
    }

    setSettings(savedSettings);
  }, []);

  // Persist tasks and flashcards on change
  const updateTasks = useCallback((newTasks: StudyTask[]) => {
    setTasks(newTasks);
    storage.setTasks(newTasks);
  }, []);

  const updateFlashcards = useCallback((newCards: Flashcard[]) => {
    setFlashcards(newCards);
    storage.setFlashcards(newCards);
  }, []);

  const updateSettings = useCallback((newSettings: AppSettings) => {
    setSettings(newSettings);
  }, []);

  const handleNavigate = (newView: ViewId) => {
    setView(newView);
    setSidebarOpen(false);
  };

  const handleResetData = () => {
    storage.setTasks(demoTasks);
    storage.setFlashcards(demoFlashcards);
    storage.clearChat();
    storage.setQuizResults([]);
    setTasks(demoTasks);
    setFlashcards(demoFlashcards);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-cream-100">
      <Sidebar
        current={view}
        onNavigate={handleNavigate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile header */}
        <header className="flex items-center justify-between border-b border-navy-100 bg-white px-4 py-3 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="btn-ghost p-2"
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>
          <span className="text-sm font-semibold text-navy-800">StudyPilot</span>
          <span className="w-9" />
        </header>

        {/* Content + Context panel */}
        <div className="flex min-h-0 flex-1">
          <main className="min-w-0 flex-1 overflow-hidden">
            {view === 'home' && (
              <HomeView
                tasks={tasks}
                flashcards={flashcards}
                onNavigate={handleNavigate}
                isDemoMode={isDemoMode}
              />
            )}
            {view === 'ask' && (
              <ChatView
                isDemoMode={isDemoMode}
                speechRate={settings.speechRate}
              />
            )}
            {view === 'plan' && (
              <PlannerView tasks={tasks} isDemoMode={isDemoMode} />
            )}
            {view === 'flashcards' && (
              <FlashcardsView
                flashcards={flashcards}
                setFlashcards={updateFlashcards}
              />
            )}
            {view === 'tasks' && (
              <TasksView tasks={tasks} setTasks={updateTasks} />
            )}
            {view === 'settings' && (
              <SettingsView
                settings={settings}
                setSettings={updateSettings}
                onResetData={handleResetData}
              />
            )}
          </main>

          <ContextPanel tasks={tasks} onNavigate={handleNavigate} />
        </div>
      </div>
    </div>
  );
}

export default App;
