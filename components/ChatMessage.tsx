'use client';

import { cn } from '@/lib/utils';
import { BookOpen } from 'lucide-react';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isTyping?: boolean;
}

export function ChatMessage({ role, content, isTyping }: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <div className={cn('flex w-full gap-3 mb-4', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
          <BookOpen className="w-4 h-4 text-white" />
        </div>
      )}
      
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-3 shadow-sm',
          isUser
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-white border border-gray-200 text-gray-900 rounded-bl-none'
        )}
      >
        {isTyping ? (
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        ) : (
          <div className="prose prose-sm max-w-none">
            {content.split('\n').map((line, i) => {
              if (line.startsWith('## ')) {
                return <h2 key={i} className="text-lg font-bold mt-3 mb-2">{line.replace('## ', '')}</h2>;
              }
              if (line.startsWith('### ')) {
                return <h3 key={i} className="text-base font-semibold mt-2 mb-1">{line.replace('### ', '')}</h3>;
              }
              if (line.startsWith('**') && line.endsWith('**')) {
                return <p key={i} className="font-semibold mt-2">{line.replace(/\*\*/g, '')}</p>;
              }
              if (line.startsWith('*"') && line.endsWith('"*')) {
                return <p key={i} className="italic text-gray-700 my-2 pl-3 border-l-4 border-blue-400">{line.replace(/\*/g, '')}</p>;
              }
              if (line.startsWith('- ')) {
                return <li key={i} className="ml-4">{line.replace('- ', '')}</li>;
              }
              if (line.trim() === '---') {
                return <hr key={i} className="my-3 border-gray-300" />;
              }
              if (line.trim()) {
                return <p key={i} className="mb-2">{line}</p>;
              }
              return <br key={i} />;
            })}
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm font-semibold">
          U
        </div>
      )}
    </div>
  );
}
