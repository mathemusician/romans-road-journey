'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { BookOpen, ExternalLink, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  fetchVerseRange, 
  fetchChapter, 
  parseScriptureReference,
  type BibleVerse 
} from '@/lib/bible/verse-lookup-client';

interface ScriptureReferenceProps {
  reference: string;
  children?: React.ReactNode;
  className?: string;
}

export function ScriptureReference({ reference, children, className }: ScriptureReferenceProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFullChapter, setShowFullChapter] = useState(false);
  const [chapterVerses, setChapterVerses] = useState<BibleVerse[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  
  const hoverTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || !window.matchMedia('(hover: hover)').matches);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load verses when opened
  useEffect(() => {
    if (isOpen && verses.length === 0 && !isLoading) {
      loadVerses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const loadVerses = async () => {
    setIsLoading(true);
    try {
      const result = await fetchVerseRange(reference);
      setVerses(result);
    } catch (error) {
      console.error('Error loading verses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFullChapter = async () => {
    const parsed = parseScriptureReference(reference);
    if (!parsed) return;

    setIsLoading(true);
    try {
      const result = await fetchChapter(parsed.book, parsed.chapter);
      setChapterVerses(result);
      setShowFullChapter(true);
    } catch (error) {
      console.error('Error loading chapter:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMouseEnter = () => {
    if (isMobile) return;
    
    setIsHovering(true);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsOpen(true);
    }, 300);
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    
    setIsHovering(false);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  const handleClick = () => {
    if (isMobile) {
      setIsOpen(!isOpen);
    } else {
      setIsOpen(true);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setShowFullChapter(false);
    setChapterVerses([]);
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Close on click outside (desktop only)
  useEffect(() => {
    if (!isOpen || isMobile) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, isMobile]);

  const displayVerses = showFullChapter ? chapterVerses : verses;

  return (
    <>
      <button
        ref={triggerRef}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "relative inline-flex items-center gap-1 px-2 py-0.5 rounded-md transition-all duration-200",
          "bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30",
          "border border-purple-300 dark:border-purple-700",
          "hover:from-purple-200 hover:to-blue-200 dark:hover:from-purple-800/40 dark:hover:to-blue-800/40",
          "hover:shadow-lg hover:shadow-purple-500/20 dark:hover:shadow-purple-500/10",
          "hover:scale-105 active:scale-95",
          "text-purple-700 dark:text-purple-300 font-medium text-sm",
          "cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2",
          isHovering && "shadow-lg shadow-purple-500/20",
          className
        )}
        aria-label={`View ${reference}`}
        role="button"
        tabIndex={0}
      >
        <BookOpen className="w-3.5 h-3.5" />
        {children || reference}
      </button>

      {/* Desktop Popover - Centered Modal */}
      {!isMobile && isOpen && typeof document !== 'undefined' && createPortal(
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
            onClick={handleClose}
          />
          
          {/* Top-Center Modal - Fixed to Viewport */}
          <div
            ref={popoverRef}
            className="fixed z-50 w-[90vw] max-w-2xl max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700"
            style={{
              top: '3rem',
              left: '50%',
              transform: 'translateX(-50%)',
              animation: 'fadeIn 0.2s ease-out',
            }}
          >
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between rounded-t-xl">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {reference}
              </h3>
              <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded">
                KJV
              </span>
            </div>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
              </div>
            ) : displayVerses.length > 0 ? (
              <>
                {displayVerses.map((verse, idx) => (
                  <div
                    key={idx}
                    className="animate-in fade-in slide-in-from-left-2 duration-300"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <span className="inline-block w-8 text-sm font-bold text-purple-600 dark:text-purple-400">
                      {verse.verse}
                    </span>
                    <span className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {verse.text}
                    </span>
                  </div>
                ))}

                {!showFullChapter && (
                  <button
                    onClick={loadFullChapter}
                    disabled={isLoading}
                    className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Full Chapter
                  </button>
                )}

                {showFullChapter && (
                  <button
                    onClick={() => {
                      setShowFullChapter(false);
                      setChapterVerses([]);
                    }}
                    className="w-full mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
                  >
                    Show Less
                  </button>
                )}
              </>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                Verse not found
              </p>
            )}
          </div>
          </div>
        </>,
        document.body
      )}

      {/* Mobile Bottom Sheet */}
      {isMobile && isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
            onClick={handleClose}
          />

          {/* Bottom Sheet */}
          <div className="fixed inset-x-0 bottom-0 z-50 bg-white dark:bg-gray-800 rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[85vh] flex flex-col">
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                    {reference}
                  </h3>
                  <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded">
                    KJV
                  </span>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                </div>
              ) : displayVerses.length > 0 ? (
                <>
                  {displayVerses.map((verse, idx) => (
                    <div
                      key={idx}
                      className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <span className="inline-block w-10 text-base font-bold text-purple-600 dark:text-purple-400">
                        {verse.verse}
                      </span>
                      <span className="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                        {verse.text}
                      </span>
                    </div>
                  ))}

                  {!showFullChapter && (
                    <button
                      onClick={loadFullChapter}
                      disabled={isLoading}
                      className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 active:from-purple-700 active:to-blue-700 text-white font-semibold rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                    >
                      <ExternalLink className="w-5 h-5" />
                      View Full Chapter
                    </button>
                  )}

                  {showFullChapter && (
                    <button
                      onClick={() => {
                        setShowFullChapter(false);
                        setChapterVerses([]);
                      }}
                      className="w-full mt-6 px-6 py-4 bg-gray-200 dark:bg-gray-700 active:bg-gray-300 dark:active:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-all text-lg"
                    >
                      Show Less
                    </button>
                  )}
                </>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-12 text-lg">
                  Verse not found
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
