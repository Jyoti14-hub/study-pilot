import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  Square,
  Sparkles,
  Info,
  Trash2,
} from 'lucide-react';
import type { ChatMessage } from '@/types';
import {
  sendChatMessage,
  createAssistantMessage,
  createUserMessage,
} from '@/services/api';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { renderMarkdown } from '@/utils/markdown';
import { storage, generateId } from '@/services/storage';
import { welcomeMessage } from '@/services/demoData';

const SUGGESTED_PROMPTS = [
  'Explain a difficult concept',
  'Plan my study session',
  'Quiz me on a topic',
  'Help me revise for an exam',
];

interface ChatViewProps {
  isDemoMode: boolean;
  speechRate: number;
}

export function ChatView({ isDemoMode, speechRate }: ChatViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const speakingIdRef = useRef<string | null>(null);

  const { speak, stop, isSpeaking, isSupported: ttsSupported } = useTextToSpeech();

  const handleTranscript = useCallback((text: string) => {
    setInput(text);
  }, []);

  const { isListening, isSupported: srSupported, startListening, stopListening } =
    useSpeechRecognition(handleTranscript);

  // Load chat history on mount
  useEffect(() => {
    const saved = storage.getChat();
    if (saved.length > 0) {
      if (!isDemoMode && saved.length === 1 && saved[0].content === welcomeMessage) {
        const welcome: ChatMessage = {
          id: saved[0].id,
          role: 'assistant',
          content: "Hi, I'm **StudyPilot** — your conversational study companion. Your Python FastAPI backend is connected! Ask me anything to get started.",
          timestamp: saved[0].timestamp,
          isDemo: false,
        };
        setMessages([welcome]);
      } else {
        setMessages(saved);
      }
    } else {
      const welcome: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: isDemoMode
          ? welcomeMessage
          : "Hi, I'm **StudyPilot** — your conversational study companion. Your Python FastAPI backend is connected! Ask me anything to get started.",
        timestamp: new Date().toISOString(),
        isDemo: isDemoMode,
      };
      setMessages([welcome]);
    }
  }, [isDemoMode]);

  // Persist chat
  useEffect(() => {
    if (messages.length > 0) {
      storage.setChat(messages);
    }
  }, [messages]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || isLoading) return;

    const userMsg = createUserMessage(content);
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const { content: response, isDemo } = await sendChatMessage(
        content,
        newMessages,
      );
      const assistantMsg = createAssistantMessage(response, isDemo);
      setMessages([...newMessages, assistantMsg]);
    } catch {
      const errorMsg = createAssistantMessage(
        'Sorry, something went wrong. Please try again.',
        true,
      );
      setMessages([...newMessages, errorMsg]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMicToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      setInput('');
      startListening();
    }
  };

  const handleSpeak = (message: ChatMessage) => {
    if (speakingIdRef.current === message.id && isSpeaking) {
      stop();
      speakingIdRef.current = null;
    } else {
      stop();
      speakingIdRef.current = message.id;
      speak(message.content, speechRate);
    }
  };

  const handleClearChat = () => {
    storage.clearChat();
    const welcome: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: isDemoMode
        ? welcomeMessage
        : "Hi, I'm **StudyPilot** — your conversational study companion. Your Python FastAPI backend is connected! Ask me anything to get started.",
      timestamp: new Date().toISOString(),
      isDemo: isDemoMode,
    };
    setMessages([welcome]);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-navy-100 bg-white px-4 py-3 md:px-6">
        <div className="flex items-center gap-2">
          <Sparkles size={20} className="text-lavender-500" />
          <div>
            <h2 className="text-base font-semibold text-navy-800">Ask StudyPilot</h2>
            <p className="text-xs text-navy-400">Your conversational study companion</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isDemoMode && (
            <span className="badge bg-lavender-100 text-lavender-700">
              <Info size={12} />
              Demo Mode
            </span>
          )}
          {messages.length > 1 && (
            <button
              onClick={handleClearChat}
              className="btn-ghost text-xs"
              title="Clear conversation"
            >
              <Trash2 size={14} />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-6">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex animate-fade-in gap-3 ${
                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  msg.role === 'user'
                    ? 'bg-navy-700 text-white'
                    : 'bg-lavender-100 text-lavender-700'
                }`}
              >
                {msg.role === 'user' ? 'You' : 'SP'}
              </div>

              {/* Message */}
              <div
                className={`flex max-w-[80%] flex-col gap-1.5 ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`message-content rounded-2xl px-4 py-3 text-sm ${
                    msg.role === 'user'
                      ? 'rounded-tr-sm bg-navy-700 text-white'
                      : 'rounded-tl-sm bg-white text-navy-800 shadow-soft border border-navy-100'
                  }`}
                >
                  {msg.role === 'user' ? msg.content : renderMarkdown(msg.content)}
                </div>

                {/* Footer controls */}
                <div className="flex items-center gap-2 px-1">
                  {msg.role === 'assistant' && msg.isDemo && (
                    <span className="text-xs text-lavender-500">Demo response</span>
                  )}
                  {msg.role === 'assistant' && ttsSupported && (
                    <button
                      onClick={() => handleSpeak(msg)}
                      className="flex items-center gap-1 text-xs text-navy-400 transition-colors hover:text-lavender-500"
                      title={
                        speakingIdRef.current === msg.id && isSpeaking
                          ? 'Stop playback'
                          : 'Play audio'
                      }
                    >
                      {speakingIdRef.current === msg.id && isSpeaking ? (
                        <>
                          <Square size={12} />
                          Stop
                        </>
                      ) : (
                        <>
                          <Volume2 size={12} />
                          Listen
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex animate-fade-in gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-lavender-100 text-xs font-semibold text-lavender-700">
                SP
              </div>
              <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-navy-100 bg-white px-4 py-3 shadow-soft">
                <span className="h-2 w-2 animate-pulse-soft rounded-full bg-lavender-400" style={{ animationDelay: '0ms' }} />
                <span className="h-2 w-2 animate-pulse-soft rounded-full bg-lavender-400" style={{ animationDelay: '300ms' }} />
                <span className="h-2 w-2 animate-pulse-soft rounded-full bg-lavender-400" style={{ animationDelay: '600ms' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggested prompts */}
      {messages.length <= 1 && !isLoading && (
        <div className="px-4 pb-3 md:px-6">
          <div className="mx-auto flex max-w-3xl flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSend(prompt)}
                className="rounded-full border border-navy-200 bg-white px-3.5 py-2 text-sm text-navy-600 transition-all hover:border-lavender-300 hover:bg-lavender-50 hover:text-lavender-700"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-navy-100 bg-white px-4 py-3 md:px-6">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-end gap-2">
            <div className="flex flex-1 items-end rounded-xl border border-navy-200 bg-cream-50 focus-within:border-lavender-400 focus-within:ring-2 focus-within:ring-lavender-200">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask StudyPilot anything..."
                rows={1}
                className="max-h-32 flex-1 resize-none bg-transparent px-3.5 py-2.5 text-sm text-navy-900 placeholder:text-navy-300 focus:outline-none"
                disabled={isLoading}
              />
            </div>

            {srSupported && (
              <button
                onClick={handleMicToggle}
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all active:scale-95 ${
                  isListening
                    ? 'bg-accent-red text-white animate-pulse-soft'
                    : 'border border-navy-200 bg-white text-navy-600 hover:bg-cream-100'
                }`}
                title={isListening ? 'Stop recording' : 'Start voice input'}
                aria-label={isListening ? 'Stop recording' : 'Start voice input'}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
            )}

            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="btn-primary h-11 w-11 shrink-0 p-0"
              title="Send message"
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </div>

          {isListening && (
            <p className="mt-2 text-xs text-accent-red">Listening... speak your question.</p>
          )}
          {isSpeaking && (
            <p className="mt-2 text-xs text-lavender-500">Playing audio response...</p>
          )}
        </div>
      </div>
    </div>
  );
}
