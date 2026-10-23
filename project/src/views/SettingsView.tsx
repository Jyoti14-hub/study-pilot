import { useState } from 'react';
import {
  Settings as SettingsIcon,
  Volume2,
  Gauge,
  Info,
  Trash2,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import type { AppSettings } from '@/types';
import { storage } from '@/services/storage';
import { isDemoMode } from '@/services/api';

interface SettingsViewProps {
  settings: AppSettings;
  setSettings: (s: AppSettings) => void;
  onResetData: () => void;
}

export function SettingsView({ settings, setSettings, onResetData }: SettingsViewProps) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSettings(settings);
    storage.setSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    onResetData();
    setShowResetConfirm(false);
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl px-4 py-6 md:px-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-navy-800">Settings</h2>
          <p className="text-sm text-navy-400">Customize your StudyPilot experience</p>
        </div>

        {/* Speech settings */}
        <div className="card mb-4 p-5">
          <div className="mb-4 flex items-center gap-2">
            <Volume2 size={18} className="text-lavender-500" />
            <h3 className="text-sm font-semibold text-navy-800">Text-to-Speech</h3>
          </div>

          <div className="mb-4">
            <label className="label-text flex items-center gap-2" htmlFor="auto-speak">
              <input
                id="auto-speak"
                type="checkbox"
                checked={settings.autoSpeak}
                onChange={(e) =>
                  setSettings({ ...settings, autoSpeak: e.target.checked })
                }
                className="h-4 w-4 rounded accent-lavender-500"
              />
              Automatically speak assistant responses
            </label>
            <p className="ml-6 text-xs text-navy-400">
              When enabled, StudyPilot will read responses aloud automatically.
            </p>
          </div>

          <div>
            <label className="label-text flex items-center gap-2" htmlFor="speech-rate">
              <Gauge size={14} />
              Speech rate: {settings.speechRate}x
            </label>
            <input
              id="speech-rate"
              type="range"
              min={0.5}
              max={2}
              step={0.25}
              value={settings.speechRate}
              onChange={(e) =>
                setSettings({ ...settings, speechRate: Number(e.target.value) })
              }
              className="w-full accent-lavender-500"
            />
            <div className="flex justify-between text-xs text-navy-400">
              <span>0.5x (slow)</span>
              <span>2x (fast)</span>
            </div>
          </div>
        </div>

        {/* Backend status info */}
        <div className="card mb-4 p-5">
          <div className="mb-3 flex items-center gap-2">
            <Info size={18} className="text-lavender-500" />
            <h3 className="text-sm font-semibold text-navy-800">AI Backend Status</h3>
          </div>
          {isDemoMode ? (
            <div className="rounded-lg bg-lavender-50 p-3.5 text-sm text-lavender-700">
              <p className="mb-2 font-medium">Demo Mode Active</p>
              <p className="text-xs leading-relaxed">
                StudyPilot is currently running without a connected AI backend. Chat responses,
                study plans, and quizzes use locally-generated demo data. All planner and
                flashcard features work fully offline.
              </p>
              <p className="mt-2 text-xs leading-relaxed">
                To connect a backend, set the <code className="rounded bg-lavender-100 px-1.5 py-0.5 font-mono text-xs">VITE_API_BASE_URL</code> environment variable
                to your FastAPI server URL.
              </p>
            </div>
          ) : (
            <div className="rounded-lg bg-emerald-50 p-3.5 text-sm text-emerald-800 border border-emerald-200">
              <p className="mb-2 font-medium flex items-center gap-2 text-emerald-800">
                <CheckCircle2 size={16} className="text-emerald-600" /> Backend Configured
              </p>
              <p className="text-xs leading-relaxed text-navy-700">
                Connected to API base URL: <code className="rounded bg-white px-1.5 py-0.5 font-mono text-xs border border-emerald-200 text-emerald-900">{import.meta.env.VITE_API_BASE_URL}</code>
              </p>
              <p className="mt-2 text-xs leading-relaxed text-navy-500">
                Ensure your Python FastAPI server is running on port 8000 to receive live requests.
              </p>
            </div>
          )}
        </div>

        {/* Data management */}
        <div className="card mb-4 p-5">
          <div className="mb-3 flex items-center gap-2">
            <Trash2 size={18} className="text-accent-red" />
            <h3 className="text-sm font-semibold text-navy-800">Data Management</h3>
          </div>
          <p className="mb-3 text-sm text-navy-500">
            Your tasks, flashcards, chat history, and quiz results are stored locally in your browser.
          </p>

          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="btn-danger"
            >
              <Trash2 size={16} />
              Reset all data to demo defaults
            </button>
          ) : (
            <div className="rounded-lg border border-accent-red/20 bg-accent-red/5 p-4">
              <div className="mb-3 flex items-center gap-2 text-accent-red">
                <AlertTriangle size={16} />
                <span className="text-sm font-medium">Are you sure?</span>
              </div>
              <p className="mb-3 text-xs text-navy-500">
                This will erase all your tasks, flashcards, chat history, and quiz results,
                and replace them with the original sample data. This cannot be undone.
              </p>
              <div className="flex gap-2">
                <button onClick={handleReset} className="btn-danger">
                  Yes, reset everything
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Save button */}
        <div className="flex items-center gap-3">
          <button onClick={handleSave} className="btn-primary">
            Save Settings
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-accent-green animate-fade-in">
              <CheckCircle2 size={16} />
              Settings saved
            </span>
          )}
        </div>

        {/* About */}
        <div className="mt-8 border-t border-navy-100 pt-6">
          <div className="flex items-center gap-2 mb-2">
            <SettingsIcon size={14} className="text-navy-300" />
            <h3 className="text-xs font-medium uppercase tracking-wide text-navy-400">About</h3>
          </div>
          <p className="text-xs leading-relaxed text-navy-400">
            StudyPilot is a conversational AI study companion built for the Alexa+ track
            of Amazon's Build, Ship, Shape Developer Hackathon. It uses the simulated
            Alexa+ experience concept. This is an original project and is not affiliated
            with or endorsed by Amazon.
          </p>
        </div>
      </div>
    </div>
  );
}
