import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { getChapter, getVerseRange } from '../../bible/verse-lookup';

type ParsedPassage =
  | { kind: 'verse-range'; reference: string }
  | { kind: 'chapter'; book: string; chapter: number }
  | { kind: 'chapter-range'; book: string; startChapter: number; endChapter: number };

function parsePassageReference(raw: string): ParsedPassage | null {
  const reference = raw.trim().replace(/\s+/g, ' ');

  // Verse or verse-range: "John 3:16" / "John 3:16-18" / with en/em dash
  const verseRangeMatch = reference.match(/^(.+?)\s+(\d+):(\d+)(?:\s*[-–—]\s*(\d+))?$/);
  if (verseRangeMatch) {
    const [, book, chapter, startVerse, endVerse] = verseRangeMatch;
    const normalizedRange = endVerse
      ? `${book} ${chapter}:${startVerse}-${endVerse}`
      : `${book} ${chapter}:${startVerse}`;
    return { kind: 'verse-range', reference: normalizedRange };
  }

  // Chapter range: "Deuteronomy 12-15" / "Deuteronomy 12—15"
  const chapterRangeMatch = reference.match(/^(.+?)\s+(\d+)\s*[-–—]\s*(\d+)$/);
  if (chapterRangeMatch) {
    const [, book, startChapter, endChapter] = chapterRangeMatch;
    const start = parseInt(startChapter, 10);
    const end = parseInt(endChapter, 10);
    if (Number.isNaN(start) || Number.isNaN(end) || end < start) return null;
    return { kind: 'chapter-range', book, startChapter: start, endChapter: end };
  }

  // Single chapter: "Deuteronomy 12"
  const chapterMatch = reference.match(/^(.+?)\s+(\d+)$/);
  if (chapterMatch) {
    const [, book, chapter] = chapterMatch;
    const parsedChapter = parseInt(chapter, 10);
    if (Number.isNaN(parsedChapter)) return null;
    return { kind: 'chapter', book, chapter: parsedChapter };
  }

  return null;
}

export const biblePassageTool = createTool({
  id: 'fetch-bible-passage',
  description:
    'Fetch exact Bible passages by explicit reference. Use this for chapter summaries and direct references like "Deuteronomy 12-15", "John 3", or "Romans 10:9-10" before answering.',
  inputSchema: z.object({
    reference: z.string().describe('Scripture reference, chapter, or chapter range'),
    maxVerses: z.number().int().min(1).max(1000).default(300),
  }),
  outputSchema: z.object({
    reference: z.string(),
    verses: z.array(
      z.object({
        reference: z.string(),
        text: z.string(),
        book: z.string(),
        chapter: z.number(),
        verse: z.number(),
      })
    ),
    count: z.number(),
    truncated: z.boolean(),
  }),
  execute: async ({ reference, maxVerses }) => {
    console.log('[Bible Passage Tool] Fetching:', reference);
    const parsed = parsePassageReference(reference);

    if (!parsed) {
      console.log('[Bible Passage Tool] Could not parse reference');
      return { reference, verses: [], count: 0, truncated: false };
    }

    let verses: ReturnType<typeof getVerseRange> = [];

    if (parsed.kind === 'verse-range') {
      verses = getVerseRange(parsed.reference);
    } else if (parsed.kind === 'chapter') {
      verses = getChapter(parsed.book, parsed.chapter);
    } else {
      for (let chapter = parsed.startChapter; chapter <= parsed.endChapter; chapter++) {
        verses.push(...getChapter(parsed.book, chapter));
      }
    }

    const truncated = verses.length > maxVerses;
    const sliced = truncated ? verses.slice(0, maxVerses) : verses;

    console.log('[Bible Passage Tool] Found', verses.length, 'verses');

    return {
      reference,
      verses: sliced,
      count: sliced.length,
      truncated,
    };
  },
});
