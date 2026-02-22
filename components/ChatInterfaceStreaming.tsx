'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState, useRef, useEffect } from 'react';
import { ChatMessage } from './ChatMessage';
import { ProgressBar } from './ProgressBar';
import { Send, Loader2, StopCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConversationState {
  currentStep: number;
  completedSteps: number[];
  userQuestions: string[];
  journeyComplete: boolean;
  hasAcceptedChrist: boolean;
}

const WELCOME_MESSAGE = `Welcome to the Romans Road Journey! 🙏

I'm here to walk with you through one of the most beautiful presentations of the gospel found in God's Word. The "Romans Road" is a collection of verses from the Book of Romans that clearly explains God's plan of salvation.

This journey will help you understand:
- Why we all need salvation
- What God has done for us through Jesus Christ
- How you can receive eternal life

We'll go step by step, and you can ask questions at any time. Are you ready to begin this important journey?

Click "Start the Romans Road" when you're ready, or feel free to ask me any questions first.`;

export function ChatInterface() {
  const [input, setInput] = useState('');
  const [state, setState] = useState<ConversationState>({
    currentStep: 0,
    completedSteps: [],
    userQuestions: [],
    journeyComplete: false,
    hasAcceptedChrist: false,
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [isLoadingAction, setIsLoadingAction] = useState(false);
  
  const { messages, sendMessage, status, stop, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  });

  // Add welcome message on mount
  useEffect(() => {
    if (messages.length === 0) {
      handleAction('welcome');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Removed auto-scroll - let user control scrolling

  // Extract state updates from message parts
  useEffect(() => {
    messages.forEach(message => {
      message.parts?.forEach(part => {
        if (part.type === 'data-romans-road-state') {
          setState(part.data as ConversationState);
        }
      });
    });
  }, [messages]);

  // Handle template actions via direct API call (not through chat)
  const handleAction = async (action: string) => {
    setIsLoadingAction(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [],
          data: { action, state },
        }),
      });

      if (!response.ok) throw new Error('Action failed');

      // Read the streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let assistantMessage = '';

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim() || line.startsWith(':')) continue;
          
          try {
            const data = JSON.parse(line.replace(/^data: /, ''));
            
            if (data.type === 'text-delta') {
              assistantMessage += data.delta;
            } else if (data.type === 'data-romans-road-state') {
              setState(data.data);
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }

      // Add the assistant message to chat
      if (assistantMessage) {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'assistant',
            parts: [{ type: 'text', text: assistantMessage }],
          } as any,
        ]);
      }
    } catch (error) {
      console.error('Action error:', error);
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || status !== 'ready') return;

    sendMessage(
      { text: input },
      { body: { data: { state } } }
    );
    setInput('');
  };

  const handleStartJourney = () => handleAction('start');
  const handleNextStep = () => handleAction('next_step');
  const handleShowPrayer = () => handleAction('show_prayer');

  const isStreaming = status === 'streaming' || status === 'submitted' || isLoadingAction;

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-500 via-blue-500 to-purple-600 dark:from-purple-900 dark:via-blue-900 dark:to-purple-900 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 dark:bg-purple-700 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-300 dark:bg-blue-700 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 dark:bg-pink-700 rounded-full mix-blend-multiply dark:mix-blend-normal filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      
      <div className="flex-1 overflow-y-auto px-4 py-8 space-y-6 relative z-10">
        {state.currentStep > 0 && (
          <div className="max-w-4xl mx-auto mb-6">
            <ProgressBar currentStep={state.currentStep} totalSteps={5} />
          </div>
        )}

        <div className="max-w-4xl mx-auto space-y-6">
          {messages
            .filter(message => message.role !== 'system')
            .map((message) => {
              // For user messages or messages without parts, use simple content
              if (message.role === 'user' || !message.parts) {
                return (
                  <ChatMessage
                    key={message.id}
                    role={message.role as 'user' | 'assistant'}
                    content={message.parts
                      ?.filter(part => part.type === 'text')
                      .map(part => (part as any).text)
                      .join('') || ''}
                  />
                );
              }
              
              // For assistant messages with parts, pass parts for interleaved rendering
              return (
                <ChatMessage
                  key={message.id}
                  role={message.role as 'user' | 'assistant'}
                  messageParts={message.parts}
                />
              );
            })}

          {isStreaming && (
            <div className="flex items-center gap-2 text-white/60 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>
                {isLoadingAction ? 'Loading...' : status === 'submitted' ? 'Thinking...' : 'Responding...'}
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-white/10 bg-black/20 backdrop-blur-md">
        <div className="max-w-4xl mx-auto p-6 space-y-4">
          {state.currentStep === 0 && (
            <div className="mb-4 animate-in slide-in-from-bottom-8 fade-in duration-700">
              <button
                onClick={handleStartJourney}
                disabled={isStreaming}
                className="group relative w-full min-h-[56px] bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-size-200 hover:bg-pos-100 text-white font-bold py-5 px-10 rounded-3xl transition-all duration-500 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl text-xl hover:shadow-purple-500/60 overflow-hidden"
                style={{ backgroundSize: '200% 100%', backgroundPosition: '0% 0%' }}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Start the Romans Road
                  <span className="text-2xl">✨</span>
                </span>
              </button>
            </div>
          )}

          {state.currentStep > 0 && state.currentStep < 5 && !state.journeyComplete && (
            <div className="mb-4 animate-in slide-in-from-bottom-8 fade-in duration-700">
              <button
                onClick={handleNextStep}
                disabled={isStreaming}
                className="group relative w-full min-h-[56px] bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-5 px-10 rounded-3xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl text-xl hover:shadow-green-500/60"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Continue to Next Step
                  <span className="text-2xl">→</span>
                </span>
              </button>
            </div>
          )}

          {state.journeyComplete && !state.hasAcceptedChrist && (
            <div className="mb-4 animate-in slide-in-from-bottom-8 fade-in duration-700">
              <button
                onClick={handleShowPrayer}
                disabled={isStreaming}
                className="group relative w-full min-h-[56px] bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-size-200 hover:bg-pos-100 text-white font-bold py-5 px-10 rounded-3xl transition-all duration-500 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl text-xl hover:shadow-pink-500/60 overflow-hidden"
                style={{ backgroundSize: '200% 100%', backgroundPosition: '0% 0%' }}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Pray to Accept Christ
                  <span className="text-2xl">🙏</span>
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
              className="flex-1 px-6 py-4 bg-white/20 dark:bg-white/20 dark:text-white dark:placeholder-white/60 light:bg-white light:text-gray-900 light:placeholder-gray-400 backdrop-blur-md border border-white/30 dark:border-white/30 light:border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-white/50 dark:focus:ring-white/50 light:focus:ring-blue-500 focus:border-transparent"
            />
            {isStreaming ? (
              <button
                type="button"
                onClick={stop}
                className={cn(
                  "px-6 py-4 rounded-2xl font-semibold transition-all transform hover:scale-105",
                  "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white",
                  "flex items-center gap-2 shadow-xl"
                )}
              >
                <StopCircle className="w-5 h-5" />
                Stop
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className={cn(
                  "px-6 py-4 rounded-2xl font-semibold transition-all transform hover:scale-105",
                  "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "flex items-center gap-2 shadow-xl"
                )}
              >
                <Send className="w-5 h-5" />
                Send
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
