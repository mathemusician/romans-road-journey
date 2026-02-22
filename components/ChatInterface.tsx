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
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-blue-600">✝️</span>
            Romans Road Journey
          </h1>
          <p className="text-sm text-gray-600 mt-1">Your path to understanding God's gift of salvation</p>
        </div>
      </header>

      {state.currentStep > 0 && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <ProgressBar currentStep={state.currentStep} totalSteps={5} />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
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

      <div className="bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {state.currentStep === 0 && !state.journeyComplete && (
            <div className="mb-3 flex gap-2">
              <button
                onClick={handleStartJourney}
                disabled={isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start the Romans Road
              </button>
            </div>
          )}

          {state.currentStep > 0 && state.currentStep < 5 && !state.journeyComplete && (
            <div className="mb-3 flex gap-2">
              <button
                onClick={handleNextStep}
                disabled={isLoading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Next Step →
              </button>
            </div>
          )}

          {state.journeyComplete && !state.hasAcceptedChrist && (
            <div className="mb-3 flex gap-2">
              <button
                onClick={handleShowPrayer}
                disabled={isLoading}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🙏 Guide Me in Prayer
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about the gospel or Scripture..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className={cn(
                "px-6 py-3 rounded-lg font-semibold transition-colors",
                "bg-blue-600 hover:bg-blue-700 text-white",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "flex items-center gap-2"
              )}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-2">
            All responses are based solely on Scripture from the Bible
          </p>
        </div>
      </div>
    </div>
  );
}
