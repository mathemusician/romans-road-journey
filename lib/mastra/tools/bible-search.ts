import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { bibleRAG } from '../../rag/bible-rag';

export const bibleSearchTool = createTool({
  id: 'search-bible',
  description: `Search the Bible for verses related to a query. This tool performs comprehensive semantic and keyword search across all 31,100 Bible verses. Use this when the user asks questions about what the Bible says on any topic.`,
  inputSchema: z.object({
    query: z.string().describe('The user\'s question or topic to search for in the Bible'),
    keywordTerms: z.array(z.string()).optional().describe('Exact keyword terms from the query'),
    semanticTerms: z.array(z.string()).optional().describe('Conceptually related terms'),
    biblicalTerms: z.array(z.string()).optional().describe('Biblical language equivalents (e.g., leviathan, behemoth, mammon)'),
  }),
  outputSchema: z.object({
    verses: z.array(z.object({
      reference: z.string(),
      text: z.string(),
      book: z.string(),
      chapter: z.number(),
      verse: z.number(),
    })),
    count: z.number(),
  }),
  execute: async ({ query, keywordTerms = [], semanticTerms = [], biblicalTerms = [] }) => {
    console.log('[Bible Search Tool] Searching for:', query);
    console.log('[Bible Search Tool] Terms:', { keywordTerms, semanticTerms, biblicalTerms });

    // Combine all expanded terms
    const allExpandedTerms = [...keywordTerms, ...semanticTerms, ...biblicalTerms];

    // Perform hybrid search with context enrichment
    const results = await bibleRAG.hybridSearch(query, 20, 0.6, allExpandedTerms);

    const verses = results.map(r => ({
      reference: r.verse.reference,
      text: r.verse.text,
      book: r.verse.book,
      chapter: r.verse.chapter,
      verse: r.verse.verse,
    }));

    console.log('[Bible Search Tool] Found', verses.length, 'verses');

    return {
      verses,
      count: verses.length,
    };
  },
});
