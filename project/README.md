# StudyPilot — Your Conversational AI Study Companion

StudyPilot is a conversational study assistant built for college students. It helps you understand concepts, organize academic deadlines, prepare for exams, and practice what you learn — all through natural conversation.

Built for the **Alexa+ track** of Amazon's Build, Ship, Shape Developer Hackathon using the simulated Alexa+ experience concept. This is an original project and is not affiliated with or endorsed by Amazon.

## Features

### Conversational Assistant
- Chat interface with suggested prompts and natural conversation flow
- Voice input using browser speech recognition (when supported)
- Text-to-speech playback for assistant responses with play/stop controls
- Clear loading states and demo-mode indicators
- Chat history persisted across page refreshes

### Study Planner
- Add tasks with subject, deadline, priority, and estimated study time
- View upcoming and completed tasks
- Edit, delete, and mark tasks as complete
- Generate a suggested study schedule from incomplete tasks and available daily study time
- See an explanation of why the schedule prioritizes certain tasks

### Flashcards & Quizzes
- Create flashcards with question and answer
- Reveal answers by clicking cards
- Mark cards as "known" or "needs revision"
- Navigate between cards
- Take multiple-choice quizzes with instant feedback and explanations
- View quiz scores and history

### Additional
- Right-side context panel showing today's tasks, next deadline, and study progress
- Responsive layout: sidebar collapses to a mobile menu, content stacks vertically
- All data persisted in localStorage — works fully offline
- Clean, calm academic design with accessible contrast and keyboard navigation

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Running the development server

```bash
npm run dev
```

The app will be available at the URL shown in your terminal (typically `http://localhost:5173`).

### Building for production

```bash
npm run build
```

### Type checking

```bash
npm run typecheck
```

## Architecture

### Frontend (Current)
- **React + TypeScript + Vite** — modern, fast development experience
- **Tailwind CSS** — utility-first styling with a custom design system
- **Lucide React** — clean, consistent icons
- **Browser Speech API** — speech recognition and text-to-speech (no external dependencies)
- **localStorage** — persistent demo data (tasks, flashcards, chat, quiz results)

### Backend Integration (Ready for Connection)

The app is architected to connect a Python FastAPI backend. All API calls are centralized in `src/services/api.ts` and read the backend URL from the `VITE_API_BASE_URL` environment variable.

To connect a backend:

1. Create a `.env` file in the project root:
   ```
   VITE_API_BASE_URL=http://localhost:8000
   ```

2. Implement these endpoints on your FastAPI server:

   | Endpoint | Method | Request Body | Response |
   |---|---|---|---|
   | `/api/chat` | POST | `{ message: string, history: ChatMessage[] }` | `{ response: string }` |
   | `/api/study-plan` | POST | `{ tasks: StudyTask[], availableMinutesPerDay: number }` | `{ schedule: StudySchedule }` |
   | `/api/quiz` | POST | `{ subject: string, count: number }` | `{ questions: QuizQuestion[] }` |

3. Restart the dev server. The app will automatically use the backend and hide demo-mode indicators.

### When No Backend Is Connected

If `VITE_API_BASE_URL` is not set or the backend is unreachable, the app:
- Uses locally generated demo responses (clearly labelled as "Demo response")
- Computes study schedules locally based on priority and deadline sorting
- Serves sample quiz questions
- Continues to fully support the planner, flashcards, and quiz features

The app never pretends a real AI model was called when using demo data.

## Project Structure

```
src/
├── components/
│   ├── Sidebar.tsx          # Left navigation
│   └── ContextPanel.tsx     # Right-side study context
├── hooks/
│   ├── useSpeechRecognition.ts  # Voice input
│   └── useTextToSpeech.ts       # Audio playback
├── services/
│   ├── api.ts               # API layer with demo fallback
│   ├── storage.ts           # localStorage persistence
│   └── demoData.ts          # Sample tasks, cards, quiz, chat
├── utils/
│   ├── date.ts              # Date formatting helpers
│   └── markdown.tsx         # Lightweight markdown renderer
├── views/
│   ├── HomeView.tsx         # Landing page with quick stats
│   ├── ChatView.tsx         # Conversational interface
│   ├── PlannerView.tsx      # Study schedule generator
│   ├── FlashcardsView.tsx   # Flashcards + quiz
│   ├── TasksView.tsx        # Task CRUD
│   └── SettingsView.tsx     # Preferences and data management
├── types.ts                 # Shared TypeScript types
├── App.tsx                  # Main app with navigation
└── index.css                # Design system + Tailwind
```

## Sample Data

The app comes pre-loaded with sample data so it can be demonstrated immediately:
- **6 study tasks** including an upcoming Electronics exam, revision tasks, and limited study time
- **6 flashcards** covering Electronics, Mathematics, and Computer Science
- **6 quiz questions** across the same subjects
- **4 demo chat responses** for common study-related prompts

## Demo Mode vs. Real AI

| Feature | Demo Mode | With Backend |
|---|---|---|
| Chat responses | Template-based, labelled as demo | Dynamic AI-generated answers |
| Study schedule | Locally computed (priority + deadline sorting) | AI-optimized schedule |
| Quiz questions | Pre-built sample questions | Dynamically generated questions |
| Tasks & flashcards | Fully functional (localStorage) | Fully functional (localStorage) |
| Voice input/output | Works (browser APIs) | Works (browser APIs) |

## Tech Stack

- React 18
- TypeScript 5
- Vite 7
- Tailwind CSS 3
- Lucide React (icons)
- Browser Web Speech API (speech recognition + synthesis)

## License

This is a hackathon project. All sample content is original and educational in nature.
