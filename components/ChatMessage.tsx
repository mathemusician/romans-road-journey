'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ScriptureReference } from './ScriptureReference';
import { MarkdownMessageRenderer } from './MarkdownMessageRenderer';
import { BookOpen, Sparkles, OctagonX, AlertTriangle, GitBranch, Signpost, Sparkle } from 'lucide-react';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content?: string;
  isTyping?: boolean;
  messageParts?: any[];
}

const stepIcons: Record<string, { icon: any; gradient: string; bgGradient: string; symbolism: string }> = {
  'All Have Sinned': {
    icon: OctagonX,
    gradient: 'from-black via-gray-800 to-black',
    bgGradient: 'from-gray-50 to-gray-100',
    symbolism: 'STOP Sign - Recognize Sin',
  },
  'The Consequence of Sin': {
    icon: AlertTriangle,
    gradient: 'from-red-600 via-red-700 to-red-800',
    bgGradient: 'from-red-50 to-orange-50',
    symbolism: 'Danger Sign - Wages of Sin',
  },
  "God's Love Demonstrated": {
    icon: GitBranch,
    gradient: 'from-red-500 via-rose-600 to-pink-600',
    bgGradient: 'from-red-50 to-pink-50',
    symbolism: 'Bridge - God Bridges the Gap',
  },
  'Salvation Through Faith': {
    icon: Signpost,
    gradient: 'from-white via-gray-100 to-white',
    bgGradient: 'from-blue-50 to-indigo-50',
    symbolism: 'Crossroad - Choose Jesus',
  },
  'Call Upon the Lord': {
    icon: Sparkle,
    gradient: 'from-yellow-400 via-amber-500 to-yellow-600',
    bgGradient: 'from-yellow-50 to-amber-50',
    symbolism: 'Heaven - Eternal Life',
  },
};

function CollapsibleSearchResult({ query, verses }: { query: string; verses: any[] }) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div className="border-l-4 border-purple-400 pl-4 py-2 bg-purple-50/50 dark:bg-purple-900/10 rounded-r-lg">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left text-sm font-semibold text-purple-700 dark:text-purple-300 mb-2 flex items-center gap-2 hover:text-purple-800 dark:hover:text-purple-200 transition-colors"
      >
        <BookOpen className="w-4 h-4" />
        Search: "{query}" ({verses.length} {verses.length === 1 ? 'verse' : 'verses'})
        <span className={cn('ml-auto transition-transform duration-200', isExpanded ? 'rotate-180' : '')}>▼</span>
      </button>

      {isExpanded && (
        <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
          {verses.map((verse: any, idx: number) => (
            <div key={idx} className="p-3 rounded-lg bg-white dark:bg-gray-800 border border-purple-200 dark:border-gray-700">
              <div className="mb-1">
                <ScriptureReference reference={verse.reference}>{verse.reference}</ScriptureReference>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{verse.text}"</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ChatMessage({ role, content, isTyping, messageParts }: ChatMessageProps) {
  const isUser = role === 'user';
  const displayContent = content || '';
  const textualParts = messageParts?.filter((part: any) => part.type === 'text').map((part: any) => part.text).join('\n') || '';
  const combinedText = `${displayContent}\n${textualParts}`;
  const stepTitle = Object.keys(stepIcons).find(title => combinedText.includes(title));
  const stepConfig = stepTitle ? stepIcons[stepTitle] : null;

  const mergeConsecutiveVerses = (verses: any[]) => {
    if (!verses || verses.length === 0) return [];

    const sorted = [...verses].sort((a, b) => {
      if (a.book !== b.book) return a.book.localeCompare(b.book);
      if (a.chapter !== b.chapter) return a.chapter - b.chapter;
      return a.verse - b.verse;
    });

    const merged: any[] = [];
    let current = { ...sorted[0], endVerse: sorted[0].verse };

    for (let i = 1; i < sorted.length; i++) {
      const verse = sorted[i];
      if (verse.book === current.book && verse.chapter === current.chapter && verse.verse === current.endVerse + 1) {
        current.endVerse = verse.verse;
        current.text += ` ${verse.text}`;
      } else {
        merged.push(current);
        current = { ...verse, endVerse: verse.verse };
      }
    }
    merged.push(current);

    return merged.map(v => ({
      ...v,
      reference: v.verse === v.endVerse ? v.reference : `${v.book} ${v.chapter}:${v.verse}-${v.endVerse}`,
    }));
  };

  return (
    <div className={cn('flex w-full gap-4 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div
          className={cn(
            'flex-shrink-0 w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl transition-all duration-500 hover:scale-110 hover:rotate-6 animate-in zoom-in duration-1000',
            stepConfig ? `bg-gradient-to-br ${stepConfig.gradient}` : 'bg-gradient-to-br from-blue-500 to-purple-600'
          )}
        >
          {stepConfig ? (
            <stepConfig.icon className="w-10 h-10 text-white drop-shadow-lg" />
          ) : (
            <Sparkles className="w-9 h-9 text-white drop-shadow-lg" />
          )}
        </div>
      )}

      <div
        className={cn(
          'max-w-[85%] rounded-3xl px-8 py-6 shadow-2xl backdrop-blur-sm transition-all duration-300',
          isUser ? 'bg-gradient-to-br from-blue-600 to-blue-500 text-white' : 'bg-white/95 dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100 border-2 border-gray-200 dark:border-gray-700'
        )}
      >
        {isTyping ? (
          <div className="flex gap-2">
            <span className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        ) : (
          <div className="space-y-4">
            {content && !messageParts && <MarkdownMessageRenderer content={content} />}

            {!isUser && messageParts && messageParts.length > 0 && (
              <div className="space-y-4">
                {messageParts.map((part: any, idx: number) => {
                  if (part.type === 'text') {
                    return <MarkdownMessageRenderer key={idx} content={part.text} />;
                  }

                  if ((part.type === 'tool-bibleSearchTool' || part.type === 'tool-biblePassageTool') && part.output) {
                    const verses = part.output.verses || [];
                    const mergedVerses = mergeConsecutiveVerses(verses);
                    const query = part.input?.query || part.input?.reference || 'Unknown query';
                    return <CollapsibleSearchResult key={idx} query={query} verses={mergedVerses} />;
                  }

                  return null;
                })}
              </div>
            )}
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
