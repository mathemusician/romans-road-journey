import natural from 'natural';
import fs from 'fs';
import zlib from 'zlib';
import path from 'path';

const TfIdf = natural.TfIdf;
const tokenizer = new natural.WordTokenizer();

// Load Bible verses from compressed file
function loadBibleVerses() {
  try {
    const compressedPath = path.join(process.cwd(), 'data', 'bible-verses.json.gz');
    const compressed = fs.readFileSync(compressedPath);
    const decompressed = zlib.gunzipSync(compressed);
    return JSON.parse(decompressed.toString());
  } catch (error) {
    console.error('Failed to load compressed Bible, falling back to uncompressed');
    const uncompressedPath = path.join(process.cwd(), 'data', 'bible-verses.json');
    return JSON.parse(fs.readFileSync(uncompressedPath, 'utf8'));
  }
}

// Load pre-computed embeddings
function loadPrecomputedEmbeddings(): number[][] {
  try {
    const embeddingsPath = path.join(process.cwd(), 'data', 'bible-embeddings.json.gz');
    const compressed = fs.readFileSync(embeddingsPath);
    const decompressed = zlib.gunzipSync(compressed);
    const data = JSON.parse(decompressed.toString());
    return data.embeddings;
  } catch (error) {
    console.error('Failed to load pre-computed embeddings');
    return [];
  }
}

const bibleVerses = loadBibleVerses();
const precomputedEmbeddings = loadPrecomputedEmbeddings();

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
  private topicIndex: Map<string, number[]> = new Map();

  constructor() {
    this.verses = bibleVerses as BibleVerse[];
    this.tfidf = new TfIdf();
    // Load pre-computed embeddings
    this.embeddings = precomputedEmbeddings;
  }

  async initialize() {
    if (this.isInitialized) return;

    console.log('Initializing Bible RAG system...');

    // Add documents to TF-IDF
    this.verses.forEach((verse) => {
      this.tfidf.addDocument(verse.text.toLowerCase());
    });

    this.isInitialized = true;
    console.log(`Bible RAG initialized with ${this.verses.length} verses and ${this.embeddings.length} pre-computed embeddings`);
  }

  private createSimpleEmbedding(text: string): number[] {
    const tokens = tokenizer.tokenize(text.toLowerCase()) || [];
    const embedding = new Array(384).fill(0);

    const importantWords = [
      'sin', 'sinned', 'death', 'life', 'eternal', 'saved', 'salvation', 'believe', 'faith',
      'jesus', 'christ', 'lord', 'god', 'love', 'grace', 'mercy', 'forgiveness', 'righteous',
      'righteousness', 'justified', 'confess', 'repent', 'born', 'again', 'spirit', 'holy',
      'money', 'wealth', 'riches', 'treasure', 'poor', 'rich', 'give', 'giving', 'tithe',
      'heaven', 'hell', 'prayer', 'pray', 'worship', 'obey', 'obedience', 'truth', 'word'
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

  private keywordSearch(query: string, topK: number = 10, candidateIndices?: number[]): SearchResult[] {
    const results: { index: number; score: number }[] = [];
    
    // If candidate indices provided, only search those (pre-filtered)
    const indicesToSearch = candidateIndices || Array.from({ length: this.verses.length }, (_, i) => i);
    
    // Limit to 1000 candidates max for performance
    const searchIndices = indicesToSearch.slice(0, 1000);
    
    this.tfidf.tfidfs(query.toLowerCase(), (i: number, measure: number) => {
      if (searchIndices.includes(i) && measure > 0) {
        results.push({ index: i, score: measure });
      }
    });

    results.sort((a, b) => b.score - a.score);

    return results.slice(0, topK).map(({ index, score }) => ({
      verse: this.verses[index],
      score,
      source: 'keyword' as const,
    }));
  }

  private semanticSearch(query: string, topK: number = 10, threshold: number = 0.3): SearchResult[] {
    // Compute query embedding once
    const queryEmbedding = this.createSimpleEmbedding(query);
    const results: SearchResult[] = [];

    // Fast cosine similarity search through ALL pre-computed embeddings
    this.embeddings.forEach((embedding, index) => {
      const similarity = this.cosineSimilarity(queryEmbedding, embedding);
      if (similarity >= threshold) {
        results.push({
          verse: this.verses[index],
          score: similarity,
          source: 'semantic' as const,
        });
      }
    });

    // Sort by score and return top K
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
      'repentance': 'repent repentance turn away forsake',
      'money': 'money wealth riches treasure mammon silver gold',
      'wealth': 'wealth riches treasure possessions money',
      'poor': 'poor poverty needy humble meek',
      'prayer': 'pray prayer praying ask petition',
      'heaven': 'heaven heavenly paradise eternal glory',
      'hell': 'hell hades destruction perish fire',
      'obedience': 'obey obedience keep commandments follow'
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

// Initialize immediately on module load (singleton pattern)
// This ensures the RAG system is ready before any API calls
if (typeof window === 'undefined') {
  // Only initialize on server-side
  bibleRAG.initialize().catch(err => {
    console.error('Failed to initialize Bible RAG on module load:', err);
  });
}
