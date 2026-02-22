'use client';

import { cn } from '@/lib/utils';
import { BookOpen, Sparkles, AlertCircle, Skull, Heart, Cross, Phone } from 'lucide-react';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isTyping?: boolean;
}

// Map step titles to icons and colors
const stepIcons: Record<string, { icon: any; gradient: string; bgGradient: string }> = {
  'All Have Sinned': { 
    icon: AlertCircle, 
    gradient: 'from-red-500 to-orange-500',
    bgGradient: 'from-red-50 to-orange-50'
  },
  'The Consequence of Sin': { 
    icon: Skull, 
    gradient: 'from-gray-700 to-gray-900',
    bgGradient: 'from-gray-100 to-gray-200'
  },
  "God's Love Demonstrated": { 
    icon: Heart, 
    gradient: 'from-pink-500 to-rose-600',
    bgGradient: 'from-pink-50 to-rose-50'
  },
  'Salvation Through Faith': { 
    icon: Cross, 
    gradient: 'from-blue-500 to-indigo-600',
    bgGradient: 'from-blue-50 to-indigo-50'
  },
  'Call Upon the Lord': { 
    icon: Phone, 
    gradient: 'from-green-500 to-emerald-600',
    bgGradient: 'from-green-50 to-emerald-50'
  }
};

export function ChatMessage({ role, content, isTyping }: ChatMessageProps) {
  const isUser = role === 'user';

  // Extract verse reference if present (e.g., "Romans 3:23")
  const verseMatch = content.match(/^(Romans|John|Acts|Ephesians|1 John|Isaiah|Ezekiel|Psalm|Ecclesiastes|James|1 Peter|2 Corinthians|Revelation|Genesis|Joel|Titus|Hebrews|Matthew|Luke|Colossians)\s+\d+:\d+/);
  const hasVerse = verseMatch !== null;
  
  // Detect which step this is based on content
  const stepTitle = Object.keys(stepIcons).find(title => content.includes(title));
  const stepConfig = stepTitle ? stepIcons[stepTitle] : null;

  return (
    <div className={cn(
      'flex w-full gap-3 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500',
      isUser ? 'justify-end' : 'justify-start'
    )}>
      {!isUser && (
        <div className={cn(
          "flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 hover:rotate-6 animate-in zoom-in duration-700",
          stepConfig 
            ? `bg-gradient-to-br ${stepConfig.gradient}` 
            : "bg-gradient-to-br from-blue-500 to-purple-600"
        )}>
          {stepConfig ? (
            <stepConfig.icon className="w-8 h-8 text-white animate-pulse" />
          ) : (
            <Sparkles className="w-7 h-7 text-white" />
          )}
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
              // Main heading (##) - Add large visual icon
              if (line.startsWith('## ')) {
                const heading = line.replace('## ', '');
                const headingStepConfig = Object.keys(stepIcons).find(title => heading.includes(title));
                const headingConfig = headingStepConfig ? stepIcons[headingStepConfig] : null;
                
                return (
                  <div key={i} className="mb-6 animate-in slide-in-from-left duration-700">
                    {headingConfig && (
                      <div className={cn(
                        "w-24 h-24 mx-auto mb-4 rounded-3xl flex items-center justify-center shadow-2xl animate-in zoom-in-50 duration-1000 hover:scale-110 hover:rotate-12 transition-all",
                        `bg-gradient-to-br ${headingConfig.gradient}`
                      )}>
                        <headingConfig.icon className="w-12 h-12 text-white animate-bounce" style={{ animationDuration: '2s' }} />
                      </div>
                    )}
                    <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent animate-in fade-in duration-1000">
                      {heading}
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
              
              // Quoted verse text - Enhanced with animation and visual appeal
              if (line.startsWith('*"') && line.endsWith('"*')) {
                const verseStepConfig = stepConfig || { bgGradient: 'from-blue-50 to-purple-50', gradient: 'from-purple-500 to-blue-500' };
                return (
                  <div key={i} className={cn(
                    "my-4 p-6 rounded-3xl border-l-4 shadow-lg animate-in slide-in-from-right duration-700 hover:scale-105 transition-transform",
                    `bg-gradient-to-r ${verseStepConfig.bgGradient} border-${verseStepConfig.gradient.split(' ')[1]}`
                  )} style={{ borderLeftColor: stepConfig ? undefined : '#a855f7' }}>
                    <div className="flex items-start gap-3">
                      <BookOpen className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1 animate-pulse" />
                      <p className="text-xl italic font-serif text-gray-800 leading-relaxed">
                        {line.replace(/\*/g, '')}
                      </p>
                    </div>
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
