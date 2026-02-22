'use client';

import { cn } from '@/lib/utils';
import { BookOpen, Sparkles } from 'lucide-react';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isTyping?: boolean;
}

export function ChatMessage({ role, content, isTyping }: ChatMessageProps) {
  const isUser = role === 'user';

  // Extract verse reference if present (e.g., "Romans 3:23")
  const verseMatch = content.match(/^(Romans|John|Acts|Ephesians|1 John|Isaiah|Ezekiel|Psalm|Ecclesiastes|James|1 Peter|2 Corinthians|Revelation|Genesis|Joel|Titus|Hebrews|Matthew|Luke|Colossians)\s+\d+:\d+/);
  const hasVerse = verseMatch !== null;

  return (
    <div className={cn('flex w-full gap-3 mb-6', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
      )}
      
      <div
        className={cn(
          'max-w-[85%] rounded-3xl px-6 py-4 shadow-2xl backdrop-blur-sm',
          isUser
            ? 'bg-gradient-to-br from-blue-600 to-blue-500 text-white'
            : 'bg-white/95 dark:bg-white/95 light:bg-white text-gray-900 border border-white/20 dark:border-white/20 light:border-gray-200'
        )}
      >
        {isTyping ? (
          <div className="flex gap-2">
            <span className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        ) : (
          <div className="space-y-3">
            {content.split('\n').map((line, i) => {
              // Main heading (##)
              if (line.startsWith('## ')) {
                return (
                  <div key={i} className="mb-4">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      {line.replace('## ', '')}
                    </h2>
                  </div>
                );
              }
              
              // Verse reference (###)
              if (line.startsWith('### ')) {
                return (
                  <div key={i} className="inline-block bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full mb-2">
                    <h3 className="text-sm font-bold text-blue-900">{line.replace('### ', '')}</h3>
                  </div>
                );
              }
              
              // Quoted verse text
              if (line.startsWith('*"') && line.endsWith('"*')) {
                return (
                  <div key={i} className="my-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border-l-4 border-purple-500">
                    <p className="text-lg italic font-serif text-gray-800 leading-relaxed">
                      {line.replace(/\*/g, '')}
                    </p>
                  </div>
                );
              }
              
              // Bold text
              if (line.startsWith('**') && line.endsWith('**')) {
                return <p key={i} className="font-bold text-gray-900 text-sm">{line.replace(/\*\*/g, '')}</p>;
              }
              
              // List items - make more compact
              if (line.startsWith('- ')) {
                const listText = line.replace('- ', '');
                // Extract verse reference and text
                const match = listText.match(/\*\*(.+?)\*\*:\s*"(.+?)"/);
                if (match) {
                  return (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <span className="text-purple-600 font-semibold min-w-fit">{match[1]}</span>
                      <span className="text-gray-600 line-clamp-1">"{match[2]}"</span>
                    </div>
                  );
                }
                return <li key={i} className="ml-4 text-sm text-gray-700">{listText}</li>;
              }
              
              // Divider
              if (line.trim() === '---') {
                return <hr key={i} className="my-3 border-purple-200" />;
              }
              
              // Regular paragraph - make more compact
              if (line.trim()) {
                return <p key={i} className="text-sm leading-relaxed text-gray-700">{line}</p>;
              }
              
              return null;
            })}
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-white text-lg font-bold shadow-lg">
          You
        </div>
      )}
    </div>
  );
}
