import {
  Home,
  MessageCircle,
  CalendarDays,
  Layers,
  CheckSquare,
  Settings,
  GraduationCap,
  X,
} from 'lucide-react';
import type { ViewId } from '@/types';

interface SidebarProps {
  current: ViewId;
  onNavigate: (view: ViewId) => void;
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS: { id: ViewId; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Study Home', icon: Home },
  { id: 'ask', label: 'Ask StudyPilot', icon: MessageCircle },
  { id: 'plan', label: 'My Study Plan', icon: CalendarDays },
  { id: 'flashcards', label: 'Flashcards', icon: Layers },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ current, onNavigate, isOpen, onClose }: SidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-navy-900/30 backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r border-navy-100 bg-cream-50 transition-transform duration-300 md:static md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-700 text-white">
              <GraduationCap size={20} />
            </div>
            <div>
              <h1 className="text-base font-semibold text-navy-800">StudyPilot</h1>
              <p className="text-xs text-navy-400">Study Companion</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-ghost p-1.5 md:hidden"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = current === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`sidebar-item w-full text-left ${active ? 'sidebar-item-active' : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="border-t border-navy-100 px-4 py-4">
          <p className="text-xs text-navy-400">
            Built for the Alexa+ track
          </p>
          <p className="text-xs text-navy-400 mt-0.5">
            Amazon Build, Ship, Shape Hackathon
          </p>
        </div>
      </aside>
    </>
  );
}
