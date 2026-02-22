const https = require('https');
const fs = require('fs');

// Comprehensive list of important Bible verses by topic
const verseReferences = [
  // SALVATION & GOSPEL
  'John 3:16', 'John 3:17', 'John 3:18', 'Romans 3:23', 'Romans 6:23', 'Romans 5:8', 
  'Romans 10:9', 'Romans 10:10', 'Romans 10:13', 'Ephesians 2:8', 'Ephesians 2:9',
  'Acts 16:31', 'John 1:12', 'Acts 4:12', 'John 14:6', '2 Corinthians 5:17',
  'Romans 3:10', 'Romans 3:11', 'Romans 3:12', 'Romans 5:6', 'Titus 3:5',
  
  // MONEY & WEALTH
  'Matthew 6:24', '1 Timothy 6:10', 'Luke 12:15', 'Proverbs 22:7', 'Malachi 3:10',
  'Luke 6:38', '2 Corinthians 9:7', 'Hebrews 13:5', 'Matthew 6:19', 'Matthew 6:20',
  'Matthew 6:21', 'Proverbs 3:9', 'Proverbs 3:10', 'Proverbs 13:11', 'Ecclesiastes 5:10',
  'Luke 16:13', '1 Timothy 6:17', '1 Timothy 6:18', 'Proverbs 11:24', 'Proverbs 11:25',
  'Acts 20:35', 'Proverbs 23:4', 'Proverbs 23:5', 'Matthew 6:33',
  
  // PRAYER
  'Matthew 6:6', 'Philippians 4:6', '1 Thessalonians 5:17', 'James 5:16', '1 John 5:14',
  '1 John 5:15', 'Matthew 7:7', 'Matthew 7:8', 'John 14:13', 'John 14:14',
  'Matthew 21:22', 'Mark 11:24', 'Jeremiah 29:12', 'Psalm 145:18', 'Romans 8:26',
  '1 Peter 3:12', 'James 1:5', 'Matthew 6:9', 'Matthew 6:10', 'Matthew 6:11',
  
  // LOVE
  '1 Corinthians 13:4', '1 Corinthians 13:5', '1 Corinthians 13:6', '1 Corinthians 13:7',
  '1 Corinthians 13:8', '1 Corinthians 13:13', '1 John 4:8', '1 John 4:16',
  'John 13:34', 'John 13:35', 'Romans 13:8', '1 John 4:7', '1 John 4:19',
  'Matthew 22:37', 'Matthew 22:38', 'Matthew 22:39', 'John 15:12', 'John 15:13',
  
  // FAITH
  'Hebrews 11:1', 'Romans 10:17', 'James 2:17', 'James 2:26', 'Hebrews 11:6',
  '2 Corinthians 5:7', 'Mark 11:22', 'Mark 11:23', 'Matthew 17:20', 'Galatians 2:20',
  'Ephesians 3:17', 'Romans 1:17', 'Habakkuk 2:4',
  
  // SIN & FORGIVENESS
  '1 John 1:8', '1 John 1:9', 'Psalm 51:1', 'Psalm 51:2', 'Isaiah 1:18',
  'Colossians 1:14', 'Ephesians 1:7', 'Acts 3:19', 'Proverbs 28:13', 'Micah 7:18',
  'Micah 7:19', 'Psalm 103:12', 'Isaiah 43:25', 'Matthew 6:14', 'Matthew 6:15',
  
  // HEAVEN & ETERNAL LIFE
  'Revelation 21:4', 'John 14:2', 'John 14:3', 'Philippians 3:20', '2 Corinthians 5:1',
  '1 Peter 1:4', 'John 10:28', 'John 11:25', 'John 11:26', '1 Corinthians 15:51',
  '1 Corinthians 15:52', '1 Thessalonians 4:16', '1 Thessalonians 4:17',
  
  // HELL & JUDGMENT
  'Matthew 25:46', 'Revelation 20:15', 'Luke 16:23', '2 Thessalonians 1:9',
  'Matthew 13:42', 'Mark 9:43', 'Hebrews 9:27', 'Romans 14:12',
  
  // GRACE
  'Romans 3:24', 'Romans 5:15', 'Titus 2:11', '2 Corinthians 12:9', 'Romans 11:6',
  'Ephesians 4:7', 'James 4:6', '2 Peter 3:18',
  
  // OBEDIENCE
  'John 14:15', '1 John 2:3', '1 John 2:4', '1 John 2:5', 'James 1:22',
  'Luke 6:46', 'John 14:21', '1 Samuel 15:22', 'Deuteronomy 11:1',
  
  // FEAR & ANXIETY
  'Philippians 4:7', '1 Peter 5:7', 'Matthew 6:25', 'Matthew 6:34', 'Isaiah 41:10',
  'Psalm 23:4', 'Proverbs 3:5', 'Proverbs 3:6', 'Psalm 56:3', 'Psalm 27:1',
  'Joshua 1:9', 'Deuteronomy 31:6', '2 Timothy 1:7', 'Isaiah 41:13',
  
  // WISDOM
  'James 1:5', 'Proverbs 2:6', 'Proverbs 9:10', 'Colossians 2:3', 'Proverbs 4:7',
  'Proverbs 16:16', 'Ecclesiastes 7:12', 'Psalm 111:10',
  
  // HOPE
  'Romans 15:13', 'Jeremiah 29:11', 'Psalm 42:5', 'Hebrews 6:19', '1 Peter 1:3',
  'Romans 5:5', 'Psalm 147:11', 'Lamentations 3:22', 'Lamentations 3:23',
  
  // PEACE
  'John 14:27', 'Philippians 4:7', 'Romans 5:1', 'Isaiah 26:3', 'Colossians 3:15',
  'Numbers 6:24', 'Numbers 6:25', 'Numbers 6:26', 'Psalm 29:11',
  
  // STRENGTH
  'Philippians 4:13', 'Isaiah 40:31', 'Psalm 46:1', 'Ephesians 6:10', 'Nehemiah 8:10',
  'Psalm 28:7', '2 Corinthians 12:10', 'Isaiah 40:29',
  
  // JOY
  'Nehemiah 8:10', 'Psalm 16:11', 'John 15:11', 'Romans 15:13', 'Galatians 5:22',
  'Philippians 4:4', '1 Thessalonians 5:16', 'James 1:2',
  
  // TRUST
  'Proverbs 3:5', 'Proverbs 3:6', 'Psalm 37:5', 'Isaiah 26:4', 'Nahum 1:7',
  'Psalm 56:3', 'Psalm 118:8', 'Jeremiah 17:7',
  
  // COMFORT
  '2 Corinthians 1:3', '2 Corinthians 1:4', 'Psalm 23:1', 'Psalm 23:2', 'Psalm 23:3',
  'Matthew 5:4', 'Romans 8:28', 'Isaiah 40:1',
  
  // GUIDANCE
  'Psalm 32:8', 'Proverbs 3:5', 'Proverbs 3:6', 'Isaiah 30:21', 'Psalm 25:9',
  'John 16:13', 'Psalm 119:105',
  
  // PATIENCE
  'Galatians 5:22', 'James 1:3', 'James 1:4', 'Romans 12:12', 'Colossians 3:12',
  'Hebrews 10:36', 'Psalm 37:7',
  
  // HUMILITY
  'Philippians 2:3', 'James 4:6', 'Proverbs 11:2', '1 Peter 5:5', 'Matthew 23:12',
  'Proverbs 22:4', 'Micah 6:8',
];

function fetchVerse(reference) {
  return new Promise((resolve, reject) => {
    const url = `https://bible-api.com/${encodeURIComponent(reference)}?translation=kjv`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.text) {
            resolve({
              reference: parsed.reference,
              text: parsed.text.trim().replace(/\s+/g, ' '),
              book: reference.split(' ')[0],
              chapter: parseInt(reference.match(/\d+/)?.[0] || '0'),
              verse: parseInt(reference.match(/:(\d+)/)?.[1] || '0')
            });
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

async function fetchAllVerses() {
  console.log(`Fetching ${verseReferences.length} verses...`);
  const verses = [];
  
  for (let i = 0; i < verseReferences.length; i++) {
    const ref = verseReferences[i];
    process.stdout.write(`\rProgress: ${i + 1}/${verseReferences.length} - ${ref.padEnd(30)}`);
    
    const verse = await fetchVerse(ref);
    if (verse) {
      verses.push(verse);
    }
    
    // Rate limit: 100ms between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`\n\n✅ Successfully fetched ${verses.length} verses`);
  
  // Save to file
  fs.writeFileSync('data/bible-verses.json', JSON.stringify(verses, null, 2));
  console.log('✅ Saved to data/bible-verses.json');
  
  // Print summary
  const topics = {
    'Salvation': verses.filter(v => ['John 3', 'Romans 3', 'Romans 5', 'Romans 6', 'Romans 10', 'Ephesians 2', 'Acts 4', 'Acts 16'].some(t => v.reference.startsWith(t))).length,
    'Money': verses.filter(v => ['Matthew 6:19', 'Matthew 6:20', 'Matthew 6:21', 'Matthew 6:24', '1 Timothy 6', 'Luke 12:15', 'Proverbs 22:7', 'Malachi 3:10'].some(t => v.reference.startsWith(t))).length,
    'Prayer': verses.filter(v => ['Matthew 6:6', 'Matthew 6:9', 'Matthew 7:7', 'Philippians 4:6', '1 Thessalonians 5:17', 'James 5:16'].some(t => v.reference.startsWith(t))).length,
    'Love': verses.filter(v => ['1 Corinthians 13', '1 John 4', 'John 13:34', 'John 15:12'].some(t => v.reference.startsWith(t))).length,
    'Faith': verses.filter(v => ['Hebrews 11', 'Romans 10:17', 'James 2'].some(t => v.reference.startsWith(t))).length,
  };
  
  console.log('\nTopics covered:');
  Object.entries(topics).forEach(([topic, count]) => {
    console.log(`- ${topic}: ${count} verses`);
  });
}

fetchAllVerses().catch(console.error);
