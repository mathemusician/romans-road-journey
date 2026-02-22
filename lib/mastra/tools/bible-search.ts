import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { bibleRAG } from '../../rag/bible-rag';

export const bibleSearchTool = createTool({
  id: 'search-bible',
  description: `Search the Bible for verses related to a query. This tool performs comprehensive semantic and keyword search across all 31,100 Bible verses. Use this when the user asks questions about what the Bible says on any topic. Simply provide the user's question as the query parameter.`,
  inputSchema: z.object({
    query: z.string().describe('The user\'s question or topic to search for in the Bible (e.g., "what does the bible say about monsters?")'),
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
  execute: async ({ query }, context) => {
    console.log('[Bible Search Tool] Searching for:', query);

    // Perform hybrid search without expanded terms (RAG will handle it internally)
    const results = await bibleRAG.hybridSearch(query, 20, 0.6, []);

    const verses = results.map(r => ({
      reference: r.verse.reference,
      text: r.verse.text,
      book: r.verse.book,
      chapter: r.verse.chapter,
      verse: r.verse.verse,
    }));

    console.log('[Bible Search Tool] Found', verses.length, 'verses');

    // Emit custom event with search results so they appear in the stream
    if (context?.writer) {
      context.writer.write({
        type: 'bible-search-result',
        query,
        verses,
        count: verses.length,
      });
    }

    return {
      verses,
      count: verses.length,
    };
  },
});
