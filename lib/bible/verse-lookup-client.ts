export interface BibleVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  reference: string;
}

export interface ParsedReference {
  book: string;
  chapter: number;
  startVerse: number;
  endVerse?: number;
  fullReference: string;
}

// Book name mappings (abbreviations to full names)
const bookMappings: Record<string, string> = {
  // Old Testament
  'gen': 'Genesis', 'genesis': 'Genesis',
  'exod': 'Exodus', 'ex': 'Exodus', 'exodus': 'Exodus',
  'lev': 'Leviticus', 'leviticus': 'Leviticus',
  'num': 'Numbers', 'numbers': 'Numbers',
  'deut': 'Deuteronomy', 'dt': 'Deuteronomy', 'deuteronomy': 'Deuteronomy',
  'josh': 'Joshua', 'joshua': 'Joshua',
  'judg': 'Judges', 'judges': 'Judges',
  'ruth': 'Ruth',
  '1sam': '1 Samuel', '1 sam': '1 Samuel', '1 samuel': '1 Samuel',
  '2sam': '2 Samuel', '2 sam': '2 Samuel', '2 samuel': '2 Samuel',
  '1kings': '1 Kings', '1 kings': '1 Kings',
  '2kings': '2 Kings', '2 kings': '2 Kings',
  '1chr': '1 Chronicles', '1 chronicles': '1 Chronicles',
  '2chr': '2 Chronicles', '2 chronicles': '2 Chronicles',
  'ezra': 'Ezra',
  'neh': 'Nehemiah', 'nehemiah': 'Nehemiah',
  'esth': 'Esther', 'esther': 'Esther',
  'job': 'Job',
  'ps': 'Psalms', 'psalm': 'Psalms', 'psalms': 'Psalms',
  'prov': 'Proverbs', 'proverbs': 'Proverbs',
  'eccl': 'Ecclesiastes', 'ecc': 'Ecclesiastes', 'ecclesiastes': 'Ecclesiastes',
  'song': 'Song of Solomon', 'songs': 'Song of Solomon',
  'isa': 'Isaiah', 'is': 'Isaiah', 'isaiah': 'Isaiah',
  'jer': 'Jeremiah', 'jeremiah': 'Jeremiah',
  'lam': 'Lamentations', 'lamentations': 'Lamentations',
  'ezek': 'Ezekiel', 'eze': 'Ezekiel', 'ezekiel': 'Ezekiel',
  'dan': 'Daniel', 'daniel': 'Daniel',
  'hos': 'Hosea', 'hosea': 'Hosea',
  'joel': 'Joel',
  'amos': 'Amos',
  'obad': 'Obadiah', 'obadiah': 'Obadiah',
  'jonah': 'Jonah',
  'mic': 'Micah', 'micah': 'Micah',
  'nah': 'Nahum', 'nahum': 'Nahum',
  'hab': 'Habakkuk', 'habakkuk': 'Habakkuk',
  'zeph': 'Zephaniah', 'zephaniah': 'Zephaniah',
  'hag': 'Haggai', 'haggai': 'Haggai',
  'zech': 'Zechariah', 'zec': 'Zechariah', 'zechariah': 'Zechariah',
  'mal': 'Malachi', 'malachi': 'Malachi',
  
  // New Testament
  'matt': 'Matthew', 'mt': 'Matthew', 'matthew': 'Matthew',
  'mark': 'Mark', 'mk': 'Mark',
  'luke': 'Luke', 'lk': 'Luke',
  'john': 'John', 'jn': 'John',
  'acts': 'Acts',
  'rom': 'Romans', 'romans': 'Romans',
  '1cor': '1 Corinthians', '1 cor': '1 Corinthians', '1 corinthians': '1 Corinthians',
  '2cor': '2 Corinthians', '2 cor': '2 Corinthians', '2 corinthians': '2 Corinthians',
  'gal': 'Galatians', 'galatians': 'Galatians',
  'eph': 'Ephesians', 'ephesians': 'Ephesians',
  'phil': 'Philippians', 'php': 'Philippians', 'philippians': 'Philippians',
  'col': 'Colossians', 'colossians': 'Colossians',
  '1thess': '1 Thessalonians', '1 thess': '1 Thessalonians', '1 thessalonians': '1 Thessalonians',
  '2thess': '2 Thessalonians', '2 thess': '2 Thessalonians', '2 thessalonians': '2 Thessalonians',
  '1tim': '1 Timothy', '1 tim': '1 Timothy', '1 timothy': '1 Timothy',
  '2tim': '2 Timothy', '2 tim': '2 Timothy', '2 timothy': '2 Timothy',
  'titus': 'Titus', 'tit': 'Titus',
  'philem': 'Philemon', 'philemon': 'Philemon',
  'heb': 'Hebrews', 'hebrews': 'Hebrews',
  'james': 'James', 'jas': 'James',
  '1pet': '1 Peter', '1 pet': '1 Peter', '1 peter': '1 Peter',
  '2pet': '2 Peter', '2 pet': '2 Peter', '2 peter': '2 Peter',
  '1john': '1 John', '1 jn': '1 John', '1 john': '1 John',
  '2john': '2 John', '2 jn': '2 John', '2 john': '2 John',
  '3john': '3 John', '3 jn': '3 John', '3 john': '3 John',
  'jude': 'Jude',
  'rev': 'Revelation', 'revelation': 'Revelation',
};

// Normalize book name
function normalizeBookName(book: string): string {
  const normalized = book.toLowerCase().replace(/\s+/g, '');
  return bookMappings[normalized] || book;
}

// Parse scripture reference
export function parseScriptureReference(reference: string): ParsedReference | null {
  // Regex to match patterns like:
  // "John 3:16", "1 John 3:16-17", "Gen 1:1", "Romans 8:28-30"
  const pattern = /^(\d?\s?[A-Za-z]+)\s+(\d+):(\d+)(?:-(\d+))?$/;
  const match = reference.trim().match(pattern);
  
  if (!match) return null;
  
  const [, book, chapter, startVerse, endVerse] = match;
  const normalizedBook = normalizeBookName(book);
  
  return {
    book: normalizedBook,
    chapter: parseInt(chapter, 10),
    startVerse: parseInt(startVerse, 10),
    endVerse: endVerse ? parseInt(endVerse, 10) : undefined,
    fullReference: reference.trim(),
  };
}

// Detect scripture references in text
export function detectScriptureReferences(text: string): ParsedReference[] {
  // Pattern to match scripture references in text
  const pattern = /\b(\d?\s?[A-Za-z]+)\s+(\d+):(\d+)(?:-(\d+))?\b/g;
  const matches: ParsedReference[] = [];
  let match;
  
  while ((match = pattern.exec(text)) !== null) {
    const [fullMatch, book, chapter, startVerse, endVerse] = match;
    const normalizedBook = normalizeBookName(book);
    
    // Verify this is a valid book name
    if (normalizedBook !== book || Object.values(bookMappings).includes(normalizedBook)) {
      matches.push({
        book: normalizedBook,
        chapter: parseInt(chapter, 10),
        startVerse: parseInt(startVerse, 10),
        endVerse: endVerse ? parseInt(endVerse, 10) : undefined,
        fullReference: fullMatch,
      });
    }
  }
  
  return matches;
}

// API calls to fetch verses
export async function fetchVerse(reference: string): Promise<BibleVerse | null> {
  try {
    const response = await fetch(`/api/bible/verse?reference=${encodeURIComponent(reference)}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Error fetching verse:', error);
    return null;
  }
}

export async function fetchVerseRange(reference: string): Promise<BibleVerse[]> {
  try {
    const response = await fetch(`/api/bible/verse-range?reference=${encodeURIComponent(reference)}`);
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error('Error fetching verse range:', error);
    return [];
  }
}

export async function fetchChapter(book: string, chapter: number): Promise<BibleVerse[]> {
  try {
    const response = await fetch(`/api/bible/chapter?book=${encodeURIComponent(book)}&chapter=${chapter}`);
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error('Error fetching chapter:', error);
    return [];
  }
}
