const fs = require('fs');

// Read the KJV Bible JSON
const kjvData = JSON.parse(fs.readFileSync('data/kjv-all-verses.json', 'utf8'));

// Book name mapping
const bookNames = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth',
  '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah',
  'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah',
  'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah',
  'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi', 'Matthew', 'Mark', 'Luke',
  'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians',
  'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon',
  'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation'
];

const verses = [];

// Convert to our format
kjvData.forEach((book, bookIndex) => {
  const bookName = bookNames[bookIndex];
  
  book.chapters.forEach((chapter, chapterIndex) => {
    const chapterNum = chapterIndex + 1;
    
    chapter.forEach((verseText, verseIndex) => {
      const verseNum = verseIndex + 1;
      
      // Clean up verse text (remove annotations in {})
      const cleanText = verseText.replace(/\{[^}]*\}/g, '').trim();
      
      verses.push({
        book: bookName,
        chapter: chapterNum,
        verse: verseNum,
        text: cleanText,
        reference: `${bookName} ${chapterNum}:${verseNum}`
      });
    });
  });
});

console.log(`Total verses: ${verses.length}`);

// Save all verses
fs.writeFileSync('data/bible-verses-full.json', JSON.stringify(verses, null, 2));
console.log('Saved all verses to bible-verses-full.json');

// Create a curated subset of important verses for common topics
const importantVerses = [
  // Salvation & Gospel
  'John 3:16', 'Romans 3:23', 'Romans 6:23', 'Romans 5:8', 'Romans 10:9', 'Romans 10:10', 'Romans 10:13',
  'Ephesians 2:8', 'Ephesians 2:9', 'Acts 16:31', 'John 1:12', 'Acts 4:12', 'John 14:6',
  
  // Money & Wealth
  'Matthew 6:24', '1 Timothy 6:10', 'Luke 12:15', 'Proverbs 22:7', 'Malachi 3:10', 'Luke 6:38',
  'Proverbs 3:9', 'Proverbs 3:10', '2 Corinthians 9:7', 'Hebrews 13:5', 'Matthew 6:19', 'Matthew 6:20',
  'Matthew 6:21', 'Proverbs 13:11', 'Ecclesiastes 5:10', 'Luke 16:13', '1 Timothy 6:17', '1 Timothy 6:18',
  
  // Prayer
  'Matthew 6:6', 'Philippians 4:6', '1 Thessalonians 5:17', 'James 5:16', '1 John 5:14', '1 John 5:15',
  'Matthew 7:7', 'Matthew 7:8', 'John 14:13', 'John 14:14', 'Matthew 21:22', 'Mark 11:24',
  
  // Love
  '1 Corinthians 13:4', '1 Corinthians 13:5', '1 Corinthians 13:6', '1 Corinthians 13:7', '1 Corinthians 13:8',
  '1 Corinthians 13:13', '1 John 4:8', '1 John 4:16', 'John 13:34', 'John 13:35', 'Romans 13:8',
  
  // Faith
  'Hebrews 11:1', 'Romans 10:17', 'James 2:17', 'James 2:26', 'Ephesians 2:8', '2 Corinthians 5:7',
  'Hebrews 11:6', 'Mark 11:22', 'Mark 11:23',
  
  // Sin & Forgiveness
  '1 John 1:8', '1 John 1:9', 'Psalm 51:1', 'Psalm 51:2', 'Isaiah 1:18', 'Colossians 1:14',
  'Ephesians 1:7', 'Acts 3:19', 'Proverbs 28:13',
  
  // Heaven & Eternal Life
  'Revelation 21:4', 'John 14:2', 'John 14:3', 'Philippians 3:20', '2 Corinthians 5:1', '1 Peter 1:4',
  
  // Hell & Judgment
  'Matthew 25:46', 'Revelation 20:15', 'Luke 16:23', '2 Thessalonians 1:9',
  
  // Grace
  'Ephesians 2:8', 'Ephesians 2:9', 'Romans 3:24', 'Romans 5:15', 'Titus 2:11', '2 Corinthians 12:9',
  
  // Obedience
  'John 14:15', '1 John 2:3', '1 John 2:4', '1 John 2:5', 'James 1:22', 'Luke 6:46',
  
  // Fear & Anxiety
  'Philippians 4:6', 'Philippians 4:7', '1 Peter 5:7', 'Matthew 6:25', 'Matthew 6:34', 'Isaiah 41:10',
  'Psalm 23:4', 'Proverbs 3:5', 'Proverbs 3:6',
  
  // Wisdom
  'James 1:5', 'Proverbs 2:6', 'Proverbs 3:5', 'Proverbs 3:6', 'Proverbs 9:10', 'Colossians 2:3',
  
  // Hope
  'Romans 15:13', 'Jeremiah 29:11', 'Psalm 42:5', 'Hebrews 6:19', '1 Peter 1:3',
  
  // Peace
  'John 14:27', 'Philippians 4:7', 'Romans 5:1', 'Isaiah 26:3', 'Colossians 3:15',
  
  // Strength
  'Philippians 4:13', 'Isaiah 40:31', 'Psalm 46:1', '2 Corinthians 12:9', 'Ephesians 6:10'
];

const curatedVerses = verses.filter(v => importantVerses.includes(v.reference));
console.log(`Curated verses: ${curatedVerses.length}`);

fs.writeFileSync('data/bible-verses-curated.json', JSON.stringify(curatedVerses, null, 2));
console.log('Saved curated verses to bible-verses-curated.json');
