import type { StudyTask, Flashcard, QuizQuestion } from '@/types';

export const demoTasks: StudyTask[] = [
  {
    id: 'demo-task-1',
    subject: 'Electronics',
    title: 'Revise Ohm\u2019s Law and circuit analysis',
    deadline: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
    priority: 'high',
    estimatedMinutes: 90,
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-task-2',
    subject: 'Electronics',
    title: 'Practice transistor amplifier problems',
    deadline: new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10),
    priority: 'high',
    estimatedMinutes: 120,
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-task-3',
    subject: 'Mathematics',
    title: 'Review linear algebra: eigenvalues',
    deadline: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    priority: 'medium',
    estimatedMinutes: 60,
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-task-4',
    subject: 'History',
    title: 'Read Chapter 12: The Industrial Revolution',
    deadline: new Date(Date.now() + 10 * 86400000).toISOString().slice(0, 10),
    priority: 'low',
    estimatedMinutes: 45,
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-task-5',
    subject: 'Electronics',
    title: 'Summarize key formulas on one page',
    deadline: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
    priority: 'high',
    estimatedMinutes: 30,
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-task-6',
    subject: 'Computer Science',
    title: 'Complete sorting algorithms exercise',
    deadline: new Date(Date.now() + 4 * 86400000).toISOString().slice(0, 10),
    priority: 'medium',
    estimatedMinutes: 75,
    completed: true,
    createdAt: new Date().toISOString(),
  },
];

export const demoFlashcards: Flashcard[] = [
  {
    id: 'demo-card-1',
    subject: 'Electronics',
    question: 'What does Ohm\u2019s Law state?',
    answer: 'V = I \u00d7 R \u2014 Voltage equals current multiplied by resistance.',
    status: 'new',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-card-2',
    subject: 'Electronics',
    question: 'What is the function of a capacitor in a DC circuit?',
    answer: 'A capacitor stores electrical energy in an electric field and blocks DC current once fully charged, acting as a temporary energy reservoir.',
    status: 'new',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-card-3',
    subject: 'Electronics',
    question: 'What is the difference between NPN and PNP transistors?',
    answer: 'NPN transistors use electrons as majority carriers (faster) with current flowing from collector to emitter. PNP transistors use holes as majority carriers with current flowing from emitter to collector.',
    status: 'revision',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-card-4',
    subject: 'Mathematics',
    question: 'What is an eigenvalue?',
    answer: 'An eigenvalue is a scalar \u03bb such that Av = \u03bbv for some non-zero vector v (the eigenvector) of a square matrix A.',
    status: 'new',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-card-5',
    subject: 'Electronics',
    question: 'What does a diode do?',
    answer: 'A diode allows current to flow in one direction only (forward bias) and blocks it in the opposite direction (reverse bias).',
    status: 'known',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-card-6',
    subject: 'Computer Science',
    question: 'What is the time complexity of merge sort?',
    answer: 'O(n log n) in all cases \u2014 best, average, and worst.',
    status: 'known',
    createdAt: new Date().toISOString(),
  },
];

export const demoQuizQuestions: QuizQuestion[] = [
  {
    id: 'quiz-1',
    subject: 'Electronics',
    question: 'Which formula correctly represents Ohm\u2019s Law?',
    choices: ['V = I + R', 'V = I \u00d7 R', 'V = I / R', 'V = R / I'],
    correctIndex: 1,
    explanation: 'Ohm\u2019s Law states that voltage equals current multiplied by resistance: V = I \u00d7 R.',
  },
  {
    id: 'quiz-2',
    subject: 'Electronics',
    question: 'What does a capacitor primarily do in a circuit?',
    choices: [
      'Amplifies a signal',
      'Stores energy in an electric field',
      'Converts AC to DC',
      'Limits current flow',
    ],
    correctIndex: 1,
    explanation: 'A capacitor stores electrical energy in an electric field between its plates.',
  },
  {
    id: 'quiz-3',
    subject: 'Electronics',
    question: 'In an NPN transistor, the majority charge carriers are:',
    choices: ['Holes', 'Electrons', 'Protons', 'Ions'],
    correctIndex: 1,
    explanation: 'NPN transistors use electrons as majority carriers, which makes them generally faster than PNP transistors.',
  },
  {
    id: 'quiz-4',
    subject: 'Mathematics',
    question: 'If A is a square matrix, an eigenvalue \u03bb satisfies:',
    choices: ['Av = \u03bb + v', 'Av = \u03bbv', 'Av = \u03bb/v', 'A = \u03bbv'],
    correctIndex: 1,
    explanation: 'An eigenvalue \u03bb satisfies Av = \u03bbv for some non-zero eigenvector v.',
  },
  {
    id: 'quiz-5',
    subject: 'Computer Science',
    question: 'What is the time complexity of merge sort?',
    choices: ['O(n)', 'O(n log n)', 'O(n\u00b2)', 'O(log n)'],
    correctIndex: 1,
    explanation: 'Merge sort divides the array in half recursively (log n levels) and merges in O(n), giving O(n log n).',
  },
  {
    id: 'quiz-6',
    subject: 'Electronics',
    question: 'A diode in forward bias:',
    choices: [
      'Blocks current completely',
      'Allows current to flow',
      'Reverses current direction',
      'Stores energy',
    ],
    correctIndex: 1,
    explanation: 'In forward bias, a diode allows current to pass through. In reverse bias, it blocks current.',
  },
];

export const demoChatResponses: { keywords: string[]; response: string }[] = [
  {
    keywords: ['explain', 'concept', 'understand', 'what is'],
    response: `Here's a clear explanation:

**The Concept**

When you encounter a difficult concept, the best approach is to break it into smaller, manageable parts:

1. **Identify the core idea** \u2014 What is the one sentence that captures the essence?
2. **Find a real-world analogy** \u2014 Connect the abstract to something familiar
3. **Work through an example** \u2014 Apply the concept to a concrete problem
4. **Check your understanding** \u2014 Try explaining it back in your own words

For example, if you're studying Ohm's Law, the core idea is that voltage, current, and resistance are related: **V = I \u00d7 R**. Think of it like water flowing through a pipe \u2014 voltage is the water pressure, current is the flow rate, and resistance is the pipe's width.

Would you like me to explain a specific topic? Just tell me the subject and concept.`,
  },
  {
    keywords: ['plan', 'session', 'schedule', 'study plan'],
    response: `Let's plan your study session efficiently.

**Suggested Study Plan**

Based on your current tasks, here's how I'd structure your time:

1. **Start with the highest-priority, closest-deadline task** \u2014 Your Electronics exam prep needs immediate attention
2. **Use the Pomodoro technique** \u2014 Study for 25 minutes, then take a 5-minute break
3. **Tackle difficult material first** \u2014 Your brain is fresher at the start
4. **End with a quick review** \u2014 Spend 10 minutes summarizing what you covered

You can head to **My Study Plan** to see a full schedule generated from your tasks, or ask me to help with a specific subject.

What subject would you like to focus on today?`,
  },
  {
    keywords: ['quiz', 'test me', 'practice', 'questions'],
    response: `Great idea \u2014 active recall is one of the most effective study techniques!

**Quiz Mode**

You can take a quick quiz right now:

1. Go to **Flashcards** in the sidebar
2. Switch to the **Quiz** tab
3. Choose a subject and answer multiple-choice questions
4. See your score and explanations after each answer

I have sample questions ready for Electronics, Mathematics, and Computer Science.

Would you like me to generate more quiz questions on a specific topic? Tell me the subject and I'll help you practice.`,
  },
  {
    keywords: ['revise', 'review', 'exam', 'prepare'],
    response: `Let's make your revision strategic and effective.

**Revision Strategy**

Here's a proven approach for exam preparation:

1. **Identify high-weight topics** \u2014 Focus on areas that carry the most marks
2. **Use spaced repetition** \u2014 Review material at increasing intervals (1 day, 3 days, 7 days)
3. **Practice with flashcards** \u2014 Active recall strengthens memory more than re-reading
4. **Take practice quizzes** \u2014 Test yourself to find gaps in your knowledge
5. **Create a summary sheet** \u2014 Condense key formulas and concepts onto one page

For your **Electronics exam**, I'd recommend:
- Reviewing Ohm's Law, capacitors, and transistors first
- Practicing circuit problems
- Using the flashcards in the Flashcards section to drill key definitions

Would you like me to help you revise a specific topic?`,
  },
];

export const welcomeMessage = `Hi, I'm **StudyPilot** \u2014 your conversational study companion. I can help you:

- **Understand difficult concepts** with clear, step-by-step explanations
- **Plan study sessions** tailored to your deadlines and available time
- **Quiz yourself** to test your knowledge and find gaps
- **Revise for exams** with proven study strategies

Try one of the suggested prompts below, or just type your question. If you have tasks in your Study Plan, I can use them to give you more relevant advice.

**Note:** I'm currently running in demo mode with sample responses. Connecting a real AI backend will give you fully dynamic answers.`;
