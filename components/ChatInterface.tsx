'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatMessage } from './ChatMessage';
import { ProgressBar } from './ProgressBar';
import { Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ConversationState {
  currentStep: number;
  completedSteps: number[];
  userQuestions: string[];
  journeyComplete: boolean;
  hasAcceptedChrist: boolean;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Welcome to the Romans Road Journey! 🙏

I'm here to walk with you through one of the most beautiful presentations of the gospel found in God's Word. The "Romans Road" is a collection of verses from the Book of Romans that clearly explains God's plan of salvation.

This journey will help you understand:
- Why we all need salvation
- What God has done for us through Jesus Christ
- How you can receive eternal life

We'll go step by step, and you can ask questions at any time. Are you ready to begin this important journey?

Click "Start the Romans Road" when you're ready, or feel free to ask me any questions first.`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [state, setState] = useState<ConversationState>({
    currentStep: 0,
    completedSteps: [],
    userQuestions: [],
    journeyComplete: false,
    hasAcceptedChrist: false,
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (messageText: string, action?: string) => {
    if (!messageText.trim() && !action) return;

    const userMessage: Message = { role: 'user', content: messageText };
    if (messageText.trim()) {
      setMessages(prev => [...prev, userMessage]);
    }
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          conversationHistory: messages.map(m => ({ role: m.role, content: m.content })),
          state,
          action,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      setState(data.state);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "I apologize, but I encountered an error. Please try again. Remember, I'm here to share God's Word with you from the Bible."
        }
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleStartJourney = () => {
    sendMessage('I want to start the Romans Road journey', 'start');
  };

  const handleNextStep = () => {
    sendMessage('Continue to the next step', 'next_step');
  };

  const handleShowPrayer = () => {
    sendMessage('I want to pray to receive Christ', 'show_prayer');
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 light:from-blue-50 light:via-purple-50 light:to-pink-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-20 dark:opacity-20 light:opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 dark:bg-blue-500 light:bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500 dark:bg-purple-500 light:bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 dark:bg-pink-500 light:bg-pink-400 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      {state.currentStep > 0 && (
        <div className="relative z-10 px-4 pt-4">
          <div className="max-w-4xl mx-auto">
            <ProgressBar currentStep={state.currentStep} totalSteps={5} />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto relative z-10 pt-6">
        <div className="max-w-4xl mx-auto px-4 pb-6 min-h-full flex flex-col justify-end">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <ChatMessage
                key={index}
                role={message.role}
                content={message.content}
              />
            ))}
            {isLoading && <ChatMessage role="assistant" content="" isTyping />}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      <div className="relative z-10 backdrop-blur-xl bg-white/10 dark:bg-white/10 border-t border-white/20 dark:border-white/20 light:bg-white/80 light:border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {state.currentStep === 0 && !state.journeyComplete && (
            <div className="mb-4 animate-in slide-in-from-bottom-8 fade-in duration-700">
              <button
                onClick={handleStartJourney}
                disabled={isLoading}
                className="group relative w-full min-h-[56px] bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-size-200 hover:bg-pos-100 text-white font-bold py-5 px-10 rounded-3xl transition-all duration-500 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl text-xl hover:shadow-purple-500/60 overflow-hidden"
                style={{ backgroundSize: '200% 100%', backgroundPosition: '0% 0%' }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                <span className="relative z-10 flex items-center justify-center gap-3">
                  <span className="text-2xl animate-pulse">✨</span>
                  <span>Begin Your Journey</span>
                  <span className="text-2xl animate-pulse" style={{ animationDelay: '0.5s' }}>✨</span>
                </span>
              </button>
            </div>
          )}

          {state.currentStep > 0 && state.currentStep < 5 && !state.journeyComplete && (
            <div className="mb-4 animate-in slide-in-from-bottom-8 fade-in duration-700">
              <button
                onClick={handleNextStep}
                disabled={isLoading}
                className="group relative w-full min-h-[56px] bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-5 px-10 rounded-3xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl text-xl hover:shadow-green-500/60"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <span>Continue</span>
                  <span className="inline-block transition-transform duration-300 group-hover:translate-x-2">→</span>
                </span>
              </button>
            </div>
          )}

          {state.journeyComplete && !state.hasAcceptedChrist && (
            <div className="mb-4 animate-in slide-in-from-bottom-8 fade-in duration-700">
              <button
                onClick={handleShowPrayer}
                disabled={isLoading}
                className="group relative w-full min-h-[56px] bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-size-200 hover:bg-pos-100 text-white font-bold py-5 px-10 rounded-3xl transition-all duration-500 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl text-xl hover:shadow-pink-500/60 overflow-hidden"
                style={{ backgroundSize: '200% 100%', backgroundPosition: '0% 0%' }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                <span className="relative z-10 flex items-center justify-center gap-3">
                  <span className="text-2xl" style={{ animation: 'pulse 2s ease-in-out infinite' }}>🙏</span>
                  <span>Pray with Me</span>
                </span>
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              disabled={isLoading}
              className="flex-1 px-6 py-4 bg-white/20 dark:bg-white/20 dark:text-white dark:placeholder-white/60 light:bg-white light:text-gray-900 light:placeholder-gray-400 backdrop-blur-md border border-white/30 dark:border-white/30 light:border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/50 dark:focus:ring-white/50 light:focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={cn(
                "px-6 py-4 rounded-2xl font-semibold transition-all transform hover:scale-105",
                "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "flex items-center gap-2 shadow-xl"
              )}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
