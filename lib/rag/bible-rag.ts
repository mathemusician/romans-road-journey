import natural from 'natural';
import bibleVerses from '@/data/bible-verses.json';

const TfIdf = natural.TfIdf;
const tokenizer = new natural.WordTokenizer();

export interface BibleVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  reference: string;
}

export interface SearchResult {
  verse: BibleVerse;
  score: number;
  source: 'semantic' | 'keyword' | 'hybrid';
}

class BibleRAG {
  private verses: BibleVerse[];
  private embeddings: number[][] = [];
  private tfidf: any;
  private isInitialized = false;

  constructor() {
    this.verses = bibleVerses as BibleVerse[];
    this.tfidf = new TfIdf();
  }

  async initialize() {
    if (this.isInitialized) return;

    console.log('Initializing Bible RAG system...');

    this.verses.forEach((verse) => {
      this.tfidf.addDocument(verse.text.toLowerCase());
    });

    this.embeddings = this.verses.map((verse) => this.createSimpleEmbedding(verse.text));

    this.isInitialized = true;
    console.log(`Bible RAG initialized with ${this.verses.length} verses`);
  }

  private createSimpleEmbedding(text: string): number[] {
    const tokens = tokenizer.tokenize(text.toLowerCase()) || [];
    const embedding = new Array(384).fill(0);

    const importantWords = [
      'sin', 'sinned', 'death', 'life', 'eternal', 'saved', 'salvation', 'believe', 'faith',
      'jesus', 'christ', 'lord', 'god', 'love', 'grace', 'mercy', 'forgiveness', 'righteous',
      'righteousness', 'justified', 'confess', 'repent', 'born', 'again', 'spirit', 'holy'
    ];

    tokens.forEach((token, idx) => {
      const hash = this.simpleHash(token);
      const position = hash % embedding.length;
      embedding[position] += 1.0;

      if (importantWords.includes(token)) {
        embedding[position] += 2.0;
      }
    });

    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return magnitude > 0 ? embedding.map(val => val / magnitude) : embedding;
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      magnitudeA += a[i] * a[i];
      magnitudeB += b[i] * b[i];
    }

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    if (magnitudeA === 0 || magnitudeB === 0) return 0;
    return dotProduct / (magnitudeA * magnitudeB);
  }

  private keywordSearch(query: string, topK: number = 5): SearchResult[] {
    const queryTokens = tokenizer.tokenize(query.toLowerCase()) || [];
    const scores: { index: number; score: number }[] = [];

    this.verses.forEach((verse, index) => {
      const verseTokens = tokenizer.tokenize(verse.text.toLowerCase()) || [];
      let score = 0;

      queryTokens.forEach(queryToken => {
        if (verseTokens.includes(queryToken)) {
          score += 1;
        }
      });

      this.tfidf.tfidfs(query.toLowerCase(), (i: number, measure: number) => {
        if (i === index) {
          score += measure * 10;
        }
      });

      if (score > 0) {
        scores.push({ index, score });
      }
    });

    scores.sort((a, b) => b.score - a.score);

    return scores.slice(0, topK).map(({ index, score }) => ({
      verse: this.verses[index],
      score,
      source: 'keyword' as const
    }));
  }

  private semanticSearch(query: string, topK: number = 5, threshold: number = 0.5): SearchResult[] {
    const queryEmbedding = this.createSimpleEmbedding(query);
    const results: SearchResult[] = [];

    this.embeddings.forEach((embedding, index) => {
      const similarity = this.cosineSimilarity(queryEmbedding, embedding);
      if (similarity >= threshold) {
        results.push({
          verse: this.verses[index],
          score: similarity,
          source: 'semantic' as const
        });
      }
    });

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
  }

  async hybridSearch(query: string, topK: number = 5, semanticWeight: number = 0.6): Promise<SearchResult[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const semanticResults = this.semanticSearch(query, topK * 2, 0.3);
    const keywordResults = this.keywordSearch(query, topK * 2);

    const combinedScores = new Map<string, { verse: BibleVerse; score: number }>();

    semanticResults.forEach(result => {
      const key = result.verse.reference;
      combinedScores.set(key, {
        verse: result.verse,
        score: result.score * semanticWeight
      });
    });

    const maxKeywordScore = Math.max(...keywordResults.map(r => r.score), 1);
    keywordResults.forEach(result => {
      const key = result.verse.reference;
      const normalizedScore = result.score / maxKeywordScore;
      const existing = combinedScores.get(key);

      if (existing) {
        existing.score += normalizedScore * (1 - semanticWeight);
      } else {
        combinedScores.set(key, {
          verse: result.verse,
          score: normalizedScore * (1 - semanticWeight)
        });
      }
    });

    const finalResults = Array.from(combinedScores.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map(({ verse, score }) => ({
        verse,
        score,
        source: 'hybrid' as const
      }));

    return finalResults;
  }

  async searchByReference(reference: string): Promise<BibleVerse | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const verse = this.verses.find(v => 
      v.reference.toLowerCase() === reference.toLowerCase()
    );

    return verse || null;
  }

  async searchByTopic(topic: string, topK: number = 5): Promise<SearchResult[]> {
    const topicQueries: Record<string, string> = {
      'sin': 'sin sinned transgression iniquity wickedness',
      'salvation': 'saved salvation redemption deliverance rescue',
      'faith': 'faith believe trust believing',
      'grace': 'grace mercy favor undeserved gift',
      'love': 'love loved loving compassion',
      'forgiveness': 'forgive forgiveness pardon cleanse',
      'eternal life': 'eternal life everlasting heaven',
      'death': 'death die perish destruction',
      'jesus': 'jesus christ lord savior messiah',
      'repentance': 'repent repentance turn away forsake'
    };

    const query = topicQueries[topic.toLowerCase()] || topic;
    return this.hybridSearch(query, topK);
  }

  getVersesByReferences(references: string[]): BibleVerse[] {
    return references
      .map(ref => this.verses.find(v => v.reference === ref))
      .filter((v): v is BibleVerse => v !== undefined);
  }
}

export const bibleRAG = new BibleRAG();
