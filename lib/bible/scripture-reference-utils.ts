export interface ScriptureMatch {
  reference: string;
  start: number;
  end: number;
}

const VALID_BOOKS = new Set([
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth',
  '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles',
  'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes',
  'Song of Solomon', 'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel',
  'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk',
  'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
  'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans',
  '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians',
  'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy',
  'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter',
  '1 John', '2 John', '3 John', 'Jude', 'Revelation',
]);

const BOOK_ABBREV: Record<string, string> = {
  gen: 'Genesis', exod: 'Exodus', ex: 'Exodus', lev: 'Leviticus',
  num: 'Numbers', deut: 'Deuteronomy', dt: 'Deuteronomy',
  josh: 'Joshua', judg: 'Judges', '1sam': '1 Samuel', '2sam': '2 Samuel',
  '1kings': '1 Kings', '2kings': '2 Kings', '1chr': '1 Chronicles', '2chr': '2 Chronicles',
  neh: 'Nehemiah', esth: 'Esther', ps: 'Psalms', psalm: 'Psalms',
  prov: 'Proverbs', eccl: 'Ecclesiastes', ecc: 'Ecclesiastes',
  song: 'Song of Solomon', songs: 'Song of Solomon', sos: 'Song of Solomon',
  isa: 'Isaiah', is: 'Isaiah', jer: 'Jeremiah', lam: 'Lamentations',
  ezek: 'Ezekiel', eze: 'Ezekiel', dan: 'Daniel', hos: 'Hosea',
  joel: 'Joel', amos: 'Amos', obad: 'Obadiah', jonah: 'Jonah',
  mic: 'Micah', nah: 'Nahum', hab: 'Habakkuk', zeph: 'Zephaniah',
  hag: 'Haggai', zech: 'Zechariah', zec: 'Zechariah', mal: 'Malachi',
  matt: 'Matthew', mt: 'Matthew', mark: 'Mark', mk: 'Mark',
  luke: 'Luke', lk: 'Luke', john: 'John', jn: 'John',
  acts: 'Acts', rom: 'Romans', '1cor': '1 Corinthians', '2cor': '2 Corinthians',
  gal: 'Galatians', eph: 'Ephesians', phil: 'Philippians', php: 'Philippians',
  col: 'Colossians', '1thess': '1 Thessalonians', '2thess': '2 Thessalonians',
  '1tim': '1 Timothy', '2tim': '2 Timothy', titus: 'Titus', tit: 'Titus',
  philem: 'Philemon', heb: 'Hebrews', james: 'James', jas: 'James',
  '1pet': '1 Peter', '2pet': '2 Peter', '1john': '1 John', '2john': '2 John', '3john': '3 John',
  jude: 'Jude', rev: 'Revelation',
};

// Accepts single/multi-word books and range separators -, – and —.
const SCRIPTURE_PATTERN = /\b((?:[1-3]\s*)?[A-Za-z]+(?:\s+[A-Za-z]+)*)\s+(\d+):(\d+)(?:\s*[-–—]\s*(\d+))?\b/g;

export function normalizeBookName(book: string): string {
  const cleaned = book.trim().replace(/\s+/g, ' ');
  const normalized = cleaned.toLowerCase().replace(/\s+/g, '');
  return BOOK_ABBREV[normalized] || cleaned;
}

export function isValidBookName(book: string): boolean {
  return VALID_BOOKS.has(normalizeBookName(book));
}

export function findScriptureReferences(text: string): ScriptureMatch[] {
  const matches: ScriptureMatch[] = [];
  SCRIPTURE_PATTERN.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = SCRIPTURE_PATTERN.exec(text)) !== null) {
    const [full, book, chapter, startVerse, endVerse] = match;
    if (!isValidBookName(book)) continue;

    const normalizedBook = normalizeBookName(book);
    const normalizedReference = endVerse
      ? `${normalizedBook} ${chapter}:${startVerse}-${endVerse}`
      : `${normalizedBook} ${chapter}:${startVerse}`;

    matches.push({
      reference: normalizedReference,
      start: match.index,
      end: match.index + full.length,
    });
  }

  return matches;
}
