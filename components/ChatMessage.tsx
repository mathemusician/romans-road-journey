'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { BookOpen, Sparkles, AlertCircle, Skull, Heart, Cross, Phone, OctagonX, AlertTriangle, GitBranch, Signpost, Sparkle } from 'lucide-react';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content?: string;
  isTyping?: boolean;
  messageParts?: any[]; // Full message parts for interleaved rendering
}

// Map step titles to icons and colors based on traditional Romans Road imagery
const stepIcons: Record<string, { icon: any; gradient: string; bgGradient: string; symbolism: string }> = {
  'All Have Sinned': { 
    icon: OctagonX, // STOP sign - stop and recognize sin
    gradient: 'from-black via-gray-800 to-black', // Black = sin, separation
    bgGradient: 'from-gray-50 to-gray-100',
    symbolism: 'STOP Sign - Recognize Sin'
  },
  'The Consequence of Sin': { 
    icon: AlertTriangle, // Danger sign - warning of consequences
    gradient: 'from-red-600 via-red-700 to-red-800', // Red = blood, death, danger
    bgGradient: 'from-red-50 to-orange-50',
    symbolism: 'Danger Sign - Wages of Sin'
  },
  "God's Love Demonstrated": { 
    icon: GitBranch, // Bridge sign - God bridges the gap
    gradient: 'from-red-500 via-rose-600 to-pink-600', // Red = Christ's blood sacrifice
    bgGradient: 'from-red-50 to-pink-50',
    symbolism: 'Bridge - God Bridges the Gap'
  },
  'Salvation Through Faith': { 
    icon: Signpost, // Crossroad sign - choose Jesus
    gradient: 'from-white via-gray-100 to-white', // White = purity, cleansing
    bgGradient: 'from-blue-50 to-indigo-50',
    symbolism: 'Crossroad - Choose Jesus'
  },
  'Call Upon the Lord': { 
    icon: Sparkle, // Gold/Yellow = Heaven, glory
    gradient: 'from-yellow-400 via-amber-500 to-yellow-600', // Gold = Heaven
    bgGradient: 'from-yellow-50 to-amber-50',
    symbolism: 'Heaven - Eternal Life'
  }
};

// Helper function to parse inline markdown (bold text)
function parseInlineMarkdown(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  const boldRegex = /\*\*(.+?)\*\*/g;
  let match;

  while ((match = boldRegex.exec(text)) !== null) {
    // Add text before the bold
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    // Add bold text
    parts.push(<strong key={match.index} className="font-bold">{match[1]}</strong>);
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

// Collapsible search result component
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
        <span className={cn(
          "ml-auto transition-transform duration-200",
          isExpanded ? "rotate-180" : ""
        )}>▼</span>
      </button>
      
      {isExpanded && (
        <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
          {verses.map((verse: any, vIdx: number) => (
            <div 
              key={vIdx}
              className="p-3 rounded-lg bg-white dark:bg-gray-800 border border-purple-200 dark:border-gray-700"
            >
              <div className="font-semibold text-purple-700 dark:text-purple-300 text-sm mb-1">
                {verse.reference}
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                "{verse.text}"
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ChatMessage({ role, content, isTyping, messageParts }: ChatMessageProps) {
  const isUser = role === 'user';

  // For simple messages (user or legacy), use content
  const displayContent = content || '';
  
  // Extract verse reference if present (e.g., "Romans 3:23")
  const verseMatch = displayContent.match(/^(Romans|John|Acts|Ephesians|1 John|Isaiah|Ezekiel|Psalm|Ecclesiastes|James|1 Peter|2 Corinthians|Revelation|Genesis|Joel|Titus|Hebrews|Matthew|Luke|Colossians)\s+\d+:\d+/);
  const hasVerse = verseMatch !== null;
  
  // Detect which step this is based on content
  const stepTitle = Object.keys(stepIcons).find(title => displayContent.includes(title));
  const stepConfig = stepTitle ? stepIcons[stepTitle] : null;
  
  // Helper to merge consecutive verses
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
      if (
        verse.book === current.book &&
        verse.chapter === current.chapter &&
        verse.verse - current.endVerse <= 2
      ) {
        current.endVerse = verse.verse;
        current.text += ' ' + verse.text;
      } else {
        merged.push(current);
        current = { ...verse, endVerse: verse.verse };
      }
    }
    merged.push(current);
    
    return merged.map((v: any) => ({
      ...v,
      reference: v.verse === v.endVerse 
        ? v.reference 
        : `${v.book} ${v.chapter}:${v.verse}-${v.endVerse}`
    }));
  };

  return (
    <div className={cn(
      'flex w-full gap-4 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700',
      isUser ? 'justify-end' : 'justify-start'
    )}>
      {!isUser && (
        <div className={cn(
          "flex-shrink-0 w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl transition-all duration-500 hover:scale-110 hover:rotate-6 hover:shadow-3xl animate-in zoom-in duration-1000 cursor-pointer",
          stepConfig 
            ? `bg-gradient-to-br ${stepConfig.gradient}` 
            : "bg-gradient-to-br from-blue-500 to-purple-600"
        )}>
          {stepConfig ? (
            <stepConfig.icon className="w-10 h-10 text-white drop-shadow-lg" style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
          ) : (
            <Sparkles className="w-9 h-9 text-white drop-shadow-lg" />
          )}
        </div>
      )}
      
      <div
        className={cn(
          'max-w-[85%] rounded-3xl px-8 py-6 shadow-2xl backdrop-blur-sm transition-all duration-300 hover:shadow-3xl',
          isUser
            ? 'bg-gradient-to-br from-blue-600 to-blue-500 text-white'
            : 'bg-white/95 dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100 border-2 border-gray-200 dark:border-gray-700'
        )}
      >
        {isTyping ? (
          <div className="flex gap-2">
            <span className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        ) : content && !messageParts ? (
          <div className="text-base text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line">
            {content}
          </div>
        ) : (
          <div className="space-y-3">
            {(content || '').split('\n').map((line, i) => {
              // Main heading (##) - Add large visual icon
              if (line.startsWith('## ')) {
                const heading = line.replace('## ', '');
                const headingStepConfig = Object.keys(stepIcons).find(title => heading.includes(title));
                const headingConfig = headingStepConfig ? stepIcons[headingStepConfig] : null;
                
                return (
                  <div key={i} className="mb-8 animate-in slide-in-from-left duration-700">
                    {headingConfig && (
                      <div className="relative">
                        <div className={cn(
                          "w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center shadow-2xl animate-in zoom-in-50 duration-1000 hover:scale-110 hover:rotate-12 transition-all cursor-pointer relative",
                          `bg-gradient-to-br ${headingConfig.gradient}`
                        )}>
                          <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" style={{ animationDuration: '3s' }}></div>
                          <headingConfig.icon className="w-16 h-16 text-white drop-shadow-2xl relative z-10" style={{ animation: 'bounce 2s ease-in-out infinite' }} />
                        </div>
                        <div className="text-center mb-4">
                          <span className="inline-block px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full text-sm font-semibold text-purple-700 dark:text-purple-300">
                            {headingConfig.symbolism}
                          </span>
                        </div>
                      </div>
                    )}
                    <h2 className="text-4xl font-bold text-center bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent animate-in fade-in duration-1000 mb-4">
                      {heading}
                    </h2>
                  </div>
                );
              }
              
              // Verse reference (###)
              if (line.startsWith('### ')) {
                return (
                  <div key={i} className="flex items-center justify-center mb-4 animate-in fade-in duration-500">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-md opacity-30 animate-pulse"></div>
                      <div className="relative bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 px-6 py-3 rounded-full border-2 border-blue-200 dark:border-blue-700">
                        <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">{line.replace('### ', '')}</h3>
                      </div>
                    </div>
                  </div>
                );
              }
              
              // Quoted verse text - Enhanced with animation and visual appeal
              if (line.startsWith('*"') && line.endsWith('"*')) {
                const verseStepConfig = stepConfig || { bgGradient: 'from-blue-50 to-purple-50', gradient: 'from-purple-500 to-blue-500' };
                return (
                  <div key={i} className="my-6 animate-in slide-in-from-right duration-700">
                    <div className={cn(
                      "relative p-8 rounded-3xl border-l-8 shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-3xl",
                      `bg-gradient-to-r ${verseStepConfig.bgGradient} dark:from-gray-800 dark:to-gray-800`
                    )} style={{ borderLeftColor: stepConfig ? undefined : '#a855f7' }}>
                      <div className="absolute top-4 left-4 opacity-10">
                        <BookOpen className="w-16 h-16" />
                      </div>
                      <div className="flex items-start gap-4 relative z-10">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-600 dark:bg-purple-500 flex items-center justify-center shadow-lg">
                          <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-2xl italic font-serif text-gray-800 dark:text-gray-200 leading-relaxed">
                          {line.replace(/\*/g, '')}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              }
              
              // Bold text (full line)
              if (line.startsWith('**') && line.endsWith('**')) {
                return <p key={i} className="font-bold text-gray-900 dark:text-gray-100 text-base">{line.replace(/\*\*/g, '')}</p>;
              }
              
              // List items - Related Scriptures with interactive cards
              if (line.startsWith('- ')) {
                const listText = line.replace('- ', '');
                // Extract verse reference and text
                const match = listText.match(/\*\*(.+?)\*\*:\s*"(.+?)"/);
                if (match) {
                  const [_, reference, verseText] = match;
                  return (
                    <div key={i} className="group mb-3 animate-in slide-in-from-left duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                      <div className="relative p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-800 border-2 border-purple-200 dark:border-gray-600 hover:border-purple-400 dark:hover:border-gray-500 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-pointer">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                            <BookOpen className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-purple-700 dark:text-purple-300 mb-1 text-sm">{reference}</div>
                            <p className="text-base text-gray-700 dark:text-white leading-relaxed italic">"{verseText}"</p>
                          </div>
                        </div>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  );
                }
                return <li key={i} className="ml-4 text-base text-gray-700 dark:text-gray-300">{listText}</li>;
              }
              
              // Divider
              if (line.trim() === '---') {
                return <hr key={i} className="my-3 border-purple-200" />;
              }
              
              // Regular paragraph - readable size
              if (line.trim()) {
                return <p key={i} className="text-base text-gray-800 dark:text-gray-200 leading-relaxed">{parseInlineMarkdown(line)}</p>;
              }
              
              return null;
            })}
          </div>
        )}

        {/* Render message parts in order with interleaved search results */}
        {!isUser && messageParts && messageParts.length > 0 && (
          <div className="mt-4 space-y-4">
            {messageParts.map((part: any, idx: number) => {
              // Render text parts
              if (part.type === 'text') {
                return (
                  <div key={idx} className="text-base text-gray-800 dark:text-gray-200 leading-relaxed">
                    {parseInlineMarkdown(part.text)}
                  </div>
                );
              }
              
              // Render tool search results inline
              if (part.type === 'tool-bibleSearchTool' && part.output) {
                const verses = part.output.verses || [];
                const mergedVerses = mergeConsecutiveVerses(verses);
                const query = part.input?.query || 'Unknown query';
                
                return <CollapsibleSearchResult key={idx} query={query} verses={mergedVerses} />;
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
