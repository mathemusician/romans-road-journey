import React from 'react';
import { ScriptureReference } from '@/components/ScriptureReference';
import { findScriptureReferences } from './scripture-reference-utils';

/**
 * Parse text and convert scripture references into clickable components
 */
export function linkifyScripture(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let keyCounter = 0;
  const matches = findScriptureReferences(text);

  for (const match of matches) {
    const matchIndex = match.start;
    const fullMatch = text.slice(match.start, match.end);

    // Add text before the match
    if (matchIndex > lastIndex) {
      parts.push(
        <span key={`text-${keyCounter++}`}>
          {text.substring(lastIndex, matchIndex)}
        </span>
      );
    }

    // Add the scripture reference component
    parts.push(
      <ScriptureReference key={`ref-${keyCounter++}`} reference={match.reference}>
        {fullMatch}
      </ScriptureReference>
    );

    lastIndex = match.end;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(
      <span key={`text-${keyCounter++}`}>
        {text.substring(lastIndex)}
      </span>
    );
  }

  return parts.length > 0 ? parts : [text];
}

/**
 * Component that automatically linkifies scripture references in children
 */
interface LinkifyScriptureProps {
  children: string;
  className?: string;
}

export function LinkifyScripture({ children, className }: LinkifyScriptureProps) {
  const linkedContent = linkifyScripture(children);
  
  return <span className={className}>{linkedContent}</span>;
}
