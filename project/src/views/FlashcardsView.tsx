import { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  ChevronLeft,
  ChevronRight,
  Check,
  RotateCcw,
  Eye,
  EyeOff,
  Trash2,
  BookOpen,
  Brain,
  Award,
  RefreshCw,
} from 'lucide-react';
import type { Flashcard, QuizQuestion, QuizResult } from '@/types';
import { storage, generateId } from '@/services/storage';
import { generateQuiz } from '@/services/api';
import { demoQuizQuestions } from '@/services/demoData';

interface FlashcardsViewProps {
  flashcards: Flashcard[];
  setFlashcards: (cards: Flashcard[]) => void;
}

type Tab = 'cards' | 'quiz';

export function FlashcardsView({ flashcards, setFlashcards }: FlashcardsViewProps) {
  const [tab, setTab] = useState<Tab>('cards');
  const [showForm, setShowForm] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [formData, setFormData] = useState({ subject: '', question: '', answer: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizSubject, setQuizSubject] = useState('All Subjects');
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [quizResults, setQuizResults] = useState<QuizResult[]>(storage.getQuizResults());

  const subjects = ['All Subjects', ...Array.from(new Set(flashcards.map((c) => c.subject)))];
  const filteredCards = flashcards;
  const currentCard = filteredCards[currentIndex];

  useEffect(() => {
    if (currentIndex >= filteredCards.length && filteredCards.length > 0) {
      setCurrentIndex(0);
    }
    setIsRevealed(false);
  }, [filteredCards.length, currentIndex]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!formData.subject.trim()) e.subject = 'Subject is required';
    if (!formData.question.trim()) e.question = 'Question is required';
    if (!formData.answer.trim()) e.answer = 'Answer is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const card: Flashcard = {
      id: generateId(),
      subject: formData.subject.trim(),
      question: formData.question.trim(),
      answer: formData.answer.trim(),
      status: 'new',
      createdAt: new Date().toISOString(),
    };
    setFlashcards([...flashcards, card]);
    setFormData({ subject: '', question: '', answer: '' });
    setShowForm(false);
  };

  const updateCardStatus = (status: Flashcard['status']) => {
    if (!currentCard) return;
    setFlashcards(
      flashcards.map((c) => (c.id === currentCard.id ? { ...c, status } : c)),
    );
    // Move to next card
    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsRevealed(false);
    }
  };

  const deleteCard = (id: string) => {
    const newCards = flashcards.filter((c) => c.id !== id);
    setFlashcards(newCards);
    if (currentIndex >= newCards.length && newCards.length > 0) {
      setCurrentIndex(newCards.length - 1);
    }
  };

  const prevCard = () => {
    setIsRevealed(false);
    setCurrentIndex((i) => (i > 0 ? i - 1 : filteredCards.length - 1));
  };

  const nextCard = () => {
    setIsRevealed(false);
    setCurrentIndex((i) => (i < filteredCards.length - 1 ? i + 1 : 0));
  };

  // Quiz functions
  const startQuiz = async () => {
    setIsLoadingQuiz(true);
    setQuizFinished(false);
    setQuizIndex(0);
    setQuizScore(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    try {
      const { questions } = await generateQuiz(quizSubject, 6);
      setQuizQuestions(questions.length > 0 ? questions : demoQuizQuestions);
    } catch {
      setQuizQuestions(demoQuizQuestions);
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  const handleAnswer = (index: number) => {
    if (showExplanation) return;
    setSelectedAnswer(index);
    setShowExplanation(true);
    if (index === quizQuestions[quizIndex].correctIndex) {
      setQuizScore(quizScore + 1);
    }
  };

  const nextQuestion = () => {
    if (quizIndex < quizQuestions.length - 1) {
      setQuizIndex(quizIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setQuizFinished(true);
      const result: QuizResult = {
        id: generateId(),
        score: quizScore,
        total: quizQuestions.length,
        subject: quizSubject,
        takenAt: new Date().toISOString(),
      };
      const newResults = [result, ...quizResults];
      setQuizResults(newResults);
      storage.setQuizResults(newResults);
    }
  };

  const statusBadge = (status: Flashcard['status']) => {
    if (status === 'known') return <span className="badge-low">Known</span>;
    if (status === 'revision') return <span className="badge-medium">Needs Revision</span>;
    return <span className="badge bg-navy-50 text-navy-500">New</span>;
  };

  const knownCount = flashcards.filter((c) => c.status === 'known').length;
  const revisionCount = flashcards.filter((c) => c.status === 'revision').length;

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-4xl px-4 py-6 md:px-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-navy-800">Flashcards &amp; Quizzes</h2>
          <p className="text-sm text-navy-400">Practice with flashcards and test your knowledge</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-lg bg-navy-50 p-1">
          <button
            onClick={() => setTab('cards')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-all ${
              tab === 'cards' ? 'bg-white text-navy-800 shadow-soft' : 'text-navy-500 hover:text-navy-700'
            }`}
          >
            <Layers size={16} />
            Flashcards
          </button>
          <button
            onClick={() => setTab('quiz')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-all ${
              tab === 'quiz' ? 'bg-white text-navy-800 shadow-soft' : 'text-navy-500 hover:text-navy-700'
            }`}
          >
            <Brain size={16} />
            Quiz
          </button>
        </div>

        {/* Flashcards Tab */}
        {tab === 'cards' && (
          <div>
            {/* Stats bar */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-4 text-sm">
                <span className="text-navy-600">
                  <strong className="text-navy-800">{flashcards.length}</strong> cards
                </span>
                <span className="text-accent-green">
                  <strong>{knownCount}</strong> known
                </span>
                <span className="text-accent-amber">
                  <strong>{revisionCount}</strong> need revision
                </span>
              </div>
              <button onClick={() => setShowForm(!showForm)} className="btn-primary">
                <Plus size={18} />
                Add Card
              </button>
            </div>

            {/* Add form */}
            {showForm && (
              <form onSubmit={handleAddCard} className="card mb-6 animate-slide-up p-5">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="label-text" htmlFor="card-subject">Subject</label>
                    <input
                      id="card-subject"
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="input-field"
                      placeholder="e.g. Electronics"
                    />
                    {errors.subject && <p className="mt-1 text-xs text-accent-red">{errors.subject}</p>}
                  </div>
                  <div>
                    <label className="label-text" htmlFor="card-question">Question</label>
                    <input
                      id="card-question"
                      type="text"
                      value={formData.question}
                      onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                      className="input-field"
                      placeholder="e.g. What is Ohm's Law?"
                    />
                    {errors.question && <p className="mt-1 text-xs text-accent-red">{errors.question}</p>}
                  </div>
                  <div>
                    <label className="label-text" htmlFor="card-answer">Answer</label>
                    <input
                      id="card-answer"
                      type="text"
                      value={formData.answer}
                      onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                      className="input-field"
                      placeholder="e.g. V = I x R"
                    />
                    {errors.answer && <p className="mt-1 text-xs text-accent-red">{errors.answer}</p>}
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button type="submit" className="btn-primary">Add Card</button>
                  <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Card viewer */}
            {flashcards.length > 0 ? (
              <div className="card mb-4 overflow-hidden p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} className="text-lavender-500" />
                    <span className="text-sm font-medium text-navy-600">
                      {currentCard?.subject}
                    </span>
                    {currentCard && statusBadge(currentCard.status)}
                  </div>
                  <span className="text-xs text-navy-400">
                    Card {currentIndex + 1} of {filteredCards.length}
                  </span>
                </div>

                {/* Card content */}
                <div
                  className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border border-navy-100 bg-cream-50 p-8 text-center transition-all hover:bg-cream-100"
                  onClick={() => setIsRevealed(!isRevealed)}
                >
                  <p className="mb-2 text-xs uppercase tracking-wide text-navy-400">
                    {isRevealed ? 'Answer' : 'Question'}
                  </p>
                  <p className="text-lg font-medium text-navy-800">
                    {isRevealed ? currentCard?.answer : currentCard?.question}
                  </p>
                  <div className="mt-4 flex items-center gap-1.5 text-xs text-navy-400">
                    {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                    Click to {isRevealed ? 'hide' : 'reveal'} answer
                  </div>
                </div>

                {/* Controls */}
                <div className="mt-4 flex items-center justify-between">
                  <button onClick={prevCard} className="btn-ghost" aria-label="Previous card">
                    <ChevronLeft size={18} />
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateCardStatus('revision')}
                      className="btn-secondary"
                      disabled={!isRevealed}
                    >
                      <RotateCcw size={16} />
                      Needs Revision
                    </button>
                    <button
                      onClick={() => updateCardStatus('known')}
                      className="btn-secondary text-accent-green hover:bg-accent-green/10"
                      disabled={!isRevealed}
                    >
                      <Check size={16} />
                      Known
                    </button>
                    <button
                      onClick={() => deleteCard(currentCard.id)}
                      className="btn-ghost text-accent-red hover:bg-accent-red/10"
                      aria-label="Delete card"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <button onClick={nextCard} className="btn-ghost" aria-label="Next card">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="card p-12 text-center">
                <Layers size={36} className="mx-auto mb-3 text-navy-200" />
                <h3 className="text-sm font-medium text-navy-700">No flashcards yet</h3>
                <p className="mt-1 text-sm text-navy-400">
                  Create your first flashcard to start practicing.
                </p>
                <button onClick={() => setShowForm(true)} className="btn-primary mt-4">
                  <Plus size={18} />
                  Add Card
                </button>
              </div>
            )}
          </div>
        )}

        {/* Quiz Tab */}
        {tab === 'quiz' && (
          <div>
            {quizQuestions.length === 0 && !isLoadingQuiz && !quizFinished && (
              <div className="card p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Brain size={20} className="text-lavender-500" />
                  <h3 className="text-sm font-semibold text-navy-800">Start a Quiz</h3>
                </div>
                <div className="mb-4">
                  <label className="label-text" htmlFor="quiz-subject">Choose a subject</label>
                  <select
                    id="quiz-subject"
                    value={quizSubject}
                    onChange={(e) => setQuizSubject(e.target.value)}
                    className="input-field"
                  >
                    {subjects.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <button onClick={startQuiz} className="btn-accent">
                  <Brain size={18} />
                  Start Quiz (6 questions)
                </button>

                {/* Quiz history */}
                {quizResults.length > 0 && (
                  <div className="mt-6 border-t border-navy-100 pt-4">
                    <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-navy-700">
                      <Award size={16} className="text-lavender-500" />
                      Recent Results
                    </h4>
                    <div className="space-y-2">
                      {quizResults.slice(0, 5).map((r) => (
                        <div
                          key={r.id}
                          className="flex items-center justify-between rounded-lg bg-cream-50 px-3.5 py-2.5 text-sm"
                        >
                          <span className="text-navy-600">
                            {r.subject}
                          </span>
                          <span className={`font-medium ${
                            r.score / r.total >= 0.7 ? 'text-accent-green' :
                            r.score / r.total >= 0.5 ? 'text-accent-amber' : 'text-accent-red'
                          }`}>
                            {r.score}/{r.total} ({Math.round((r.score / r.total) * 100)}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {isLoadingQuiz && (
              <div className="card flex items-center justify-center gap-3 p-8">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-lavender-200 border-t-lavender-500" />
                <span className="text-sm text-navy-500">Loading quiz questions...</span>
              </div>
            )}

            {/* Quiz in progress */}
            {quizQuestions.length > 0 && !quizFinished && !isLoadingQuiz && (
              <div className="card p-6 animate-fade-in">
                {/* Progress */}
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm text-navy-500">
                    Question {quizIndex + 1} of {quizQuestions.length}
                  </span>
                  <span className="text-sm font-medium text-lavender-600">
                    Score: {quizScore}
                  </span>
                </div>
                <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-navy-100">
                  <div
                    className="h-full rounded-full bg-lavender-400 transition-all"
                    style={{ width: `${((quizIndex + (showExplanation ? 1 : 0)) / quizQuestions.length) * 100}%` }}
                  />
                </div>

                {/* Question */}
                <div className="mb-4">
                  <span className="badge bg-lavender-100 text-lavender-700 mb-2">
                    {quizQuestions[quizIndex].subject}
                  </span>
                  <h3 className="text-base font-semibold text-navy-800">
                    {quizQuestions[quizIndex].question}
                  </h3>
                </div>

                {/* Choices */}
                <div className="space-y-2">
                  {quizQuestions[quizIndex].choices.map((choice, i) => {
                    const isCorrect = i === quizQuestions[quizIndex].correctIndex;
                    const isSelected = i === selectedAnswer;
                    let className = 'border-navy-200 bg-white hover:border-lavender-300 hover:bg-lavender-50';
                    if (showExplanation) {
                      if (isCorrect) {
                        className = 'border-accent-green bg-accent-green/10 text-accent-green';
                      } else if (isSelected) {
                        className = 'border-accent-red bg-accent-red/10 text-accent-red';
                      } else {
                        className = 'border-navy-100 bg-white opacity-60';
                      }
                    }
                    return (
                      <button
                        key={i}
                        onClick={() => handleAnswer(i)}
                        disabled={showExplanation}
                        className={`flex w-full items-center gap-3 rounded-lg border-2 px-4 py-3 text-left text-sm font-medium transition-all ${className}`}
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs">
                          {String.fromCharCode(65 + i)}
                        </span>
                        {choice}
                        {showExplanation && isCorrect && <Check size={16} className="ml-auto" />}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation */}
                {showExplanation && (
                  <div className="mt-4 animate-slide-up rounded-lg bg-cream-100 p-4">
                    <p className="text-sm text-navy-700">
                      <strong>Explanation: </strong>
                      {quizQuestions[quizIndex].explanation}
                    </p>
                    <button onClick={nextQuestion} className="btn-primary mt-3">
                      {quizIndex < quizQuestions.length - 1 ? 'Next Question' : 'See Results'}
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Quiz results */}
            {quizFinished && (
              <div className="card p-8 text-center animate-slide-up">
                <Award size={48} className="mx-auto mb-4 text-lavender-500" />
                <h3 className="text-lg font-semibold text-navy-800">Quiz Complete!</h3>
                <p className="mt-2 text-3xl font-bold text-navy-800">
                  {quizScore}/{quizQuestions.length}
                </p>
                <p className="mt-1 text-sm text-navy-500">
                  {quizScore === quizQuestions.length
                    ? 'Perfect score! Excellent work.'
                    : quizScore >= quizQuestions.length * 0.7
                      ? 'Great job! You know this well.'
                      : quizScore >= quizQuestions.length * 0.5
                        ? 'Good effort. Keep practicing!'
                        : 'Keep studying — you\u2019ll get there!'}
                </p>
                <div className="mt-6 flex justify-center gap-2">
                  <button
                    onClick={() => {
                      setQuizQuestions([]);
                      setQuizFinished(false);
                    }}
                    className="btn-secondary"
                  >
                    <RefreshCw size={16} />
                    New Quiz
                  </button>
                  <button
                    onClick={startQuiz}
                    className="btn-primary"
                  >
                    <Brain size={16} />
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
