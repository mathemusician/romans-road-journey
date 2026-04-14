'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ScriptureReference } from './ScriptureReference';
import { remarkScriptureLinks } from '@/lib/bible/remark-scripture-links';
import { cn } from '@/lib/utils';

interface MarkdownMessageRendererProps {
  content: string;
  className?: string;
}

export function MarkdownMessageRenderer({ content, className }: MarkdownMessageRendererProps) {
  // Allow a strict URL subset for untrusted model output.
  // Scripture links use a private bible:// scheme and are mapped to ScriptureReference chips below.
  const urlTransform = (url: string) => {
    if (url.startsWith('bible://')) return url;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:')) return url;
    if (url.startsWith('/') || url.startsWith('#')) return url;
    return '';
  };

  return (
    <div className={cn('space-y-3', className)}>
      <ReactMarkdown
        // GFM enables tables, strikethrough, and task-list syntax from model output.
        // remarkScriptureLinks rewrites scripture text into bible:// links for interactive rendering.
        remarkPlugins={[remarkGfm, remarkScriptureLinks]}
        urlTransform={urlTransform}
        components={{
          h2: ({ children }) => (
            <h2 className="text-4xl font-bold text-center bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 px-6 py-3 rounded-full border-2 border-blue-200 dark:border-blue-700">
                <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">{children}</h3>
              </div>
            </div>
          ),
          p: ({ children }) => (
            <p className="text-base text-gray-800 dark:text-gray-200 leading-relaxed">{children}</p>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-4 pl-6 border-l-4 border-purple-300 dark:border-purple-700 text-base text-gray-700 dark:text-gray-300 leading-relaxed italic">
              {children}
            </blockquote>
          ),
          ul: ({ children }) => <ul className="space-y-2 my-3">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-6 space-y-2 my-3">{children}</ol>,
          li: ({ children }) => (
            <li className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">{children}</li>
          ),
          hr: () => <hr className="my-6 border-t-2 border-purple-200 dark:border-purple-800" />,
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border border-purple-200 dark:border-purple-800 rounded-lg overflow-hidden">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-purple-100 dark:bg-purple-900/40">{children}</thead>
          ),
          tbody: ({ children }) => <tbody className="divide-y divide-purple-100 dark:divide-purple-900/30">{children}</tbody>,
          tr: ({ children }) => <tr>{children}</tr>,
          th: ({ children }) => (
            <th className="px-3 py-2 text-left text-sm font-semibold text-purple-900 dark:text-purple-200 border-r last:border-r-0 border-purple-200 dark:border-purple-800">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 text-sm text-gray-800 dark:text-gray-200 align-top border-r last:border-r-0 border-purple-100 dark:border-purple-900/30">
              {children}
            </td>
          ),
          a: ({ href, children }) => {
            if (href?.startsWith('bible://')) {
              const reference = decodeURIComponent(href.replace('bible://', ''));
              return <ScriptureReference reference={reference}>{children}</ScriptureReference>;
            }

            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="text-blue-600 dark:text-blue-400 underline underline-offset-2 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
              >
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
