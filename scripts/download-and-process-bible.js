const https = require('https');
const fs = require('fs');
const zlib = require('zlib');
const { chain } = require('stream-chain');
const { parser } = require('stream-json');
const { streamArray } = require('stream-json/streamers/StreamArray');

console.log('📥 Downloading complete Bible JSON...');

// Download the Bible JSON
const file = fs.createWriteStream('data/bible-raw.json.gz');
const request = https.get('https://raw.githubusercontent.com/thiagobodruk/bible/master/json/en_kjv.json', (response) => {
  const gzip = zlib.createGzip();
  response.pipe(gzip).pipe(file);
  
  file.on('finish', () => {
    file.close();
    console.log('✅ Downloaded and compressed Bible');
    
    // Get file size
    const stats = fs.statSync('data/bible-raw.json.gz');
    console.log(`📦 Compressed size: ${(stats.size / 1024).toFixed(2)} KB`);
    
    // Now stream parse it to extract verses
    console.log('\n🔄 Streaming parse to extract verses...');
    extractVerses();
  });
});

request.on('error', (err) => {
  fs.unlink('data/bible-raw.json.gz', () => {});
  console.error('❌ Download failed:', err.message);
});

function extractVerses() {
  const verses = [];
  let bookIndex = 0;
  
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
  
  const pipeline = chain([
    fs.createReadStream('data/bible-raw.json.gz'),
    zlib.createGunzip(),
    parser(),
    streamArray()
  ]);
  
  pipeline.on('data', (data) => {
    const book = data.value;
    const bookName = bookNames[bookIndex];
    
    book.chapters.forEach((chapter, chapterIndex) => {
      chapter.forEach((verseText, verseIndex) => {
        const chapterNum = chapterIndex + 1;
        const verseNum = verseIndex + 1;
        
        // Clean text (remove annotations)
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
    
    bookIndex++;
    process.stdout.write(`\r📖 Processed ${bookIndex}/66 books (${verses.length} verses)`);
  });
  
  pipeline.on('end', () => {
    console.log(`\n✅ Extracted ${verses.length} verses from complete Bible`);
    
    // Save as compressed JSON
    const json = JSON.stringify(verses);
    const compressed = zlib.gzipSync(json);
    fs.writeFileSync('data/bible-verses.json.gz', compressed);
    
    const uncompressedSize = (json.length / 1024 / 1024).toFixed(2);
    const compressedSize = (compressed.length / 1024).toFixed(2);
    const ratio = ((1 - compressed.length / json.length) * 100).toFixed(1);
    
    console.log(`\n📊 Compression stats:`);
    console.log(`   Uncompressed: ${uncompressedSize} MB`);
    console.log(`   Compressed: ${compressedSize} KB`);
    console.log(`   Ratio: ${ratio}% reduction`);
    
    // Also save uncompressed for development
    fs.writeFileSync('data/bible-verses.json', JSON.stringify(verses, null, 2));
    console.log(`\n✅ Saved both compressed and uncompressed versions`);
    
    // Clean up raw download
    fs.unlinkSync('data/bible-raw.json.gz');
    console.log('🧹 Cleaned up temporary files');
  });
  
  pipeline.on('error', (err) => {
    console.error('❌ Parsing failed:', err.message);
  });
}
