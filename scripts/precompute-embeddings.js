const fs = require('fs');
const zlib = require('zlib');
const natural = require('natural');

const tokenizer = new natural.WordTokenizer();

console.log('📥 Loading Bible verses...');
const compressed = fs.readFileSync('data/bible-verses.json.gz');
const verses = JSON.parse(zlib.gunzipSync(compressed).toString());
console.log(`✅ Loaded ${verses.length} verses`);

console.log('\n🔄 Precomputing embeddings and building inverted index...');

const importantWords = [
  'sin', 'sinned', 'death', 'life', 'eternal', 'saved', 'salvation', 'believe', 'faith',
  'jesus', 'christ', 'lord', 'god', 'love', 'grace', 'mercy', 'forgiveness', 'righteous',
  'righteousness', 'justified', 'confess', 'repent', 'born', 'again', 'spirit', 'holy',
  'money', 'wealth', 'riches', 'treasure', 'poor', 'rich', 'give', 'giving', 'tithe',
  'heaven', 'hell', 'prayer', 'pray', 'worship', 'obey', 'obedience', 'truth', 'word',
  'fear', 'afraid', 'anxiety', 'anxious', 'worry', 'peace', 'joy', 'hope', 'trust',
  'strength', 'strong', 'power', 'wisdom', 'wise', 'understanding', 'knowledge'
];

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function createEmbedding(text) {
  const tokens = tokenizer.tokenize(text.toLowerCase()) || [];
  const embedding = new Array(384).fill(0);
  
  tokens.forEach((token, idx) => {
    const hash = simpleHash(token);
    const position = hash % 384;
    const weight = importantWords.includes(token) ? 3 : 1;
    embedding[position] += weight * (1 / (idx + 1));
  });
  
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return magnitude > 0 ? embedding.map(val => val / magnitude) : embedding;
}

// Build inverted index for fast keyword lookup
const invertedIndex = {};
const bookIndex = {};
const topicIndex = {
  salvation: [], gospel: [], sin: [], death: [], life: [], eternal: [],
  money: [], wealth: [], rich: [], poor: [], giving: [],
  prayer: [], pray: [], worship: [],
  love: [], grace: [], mercy: [], forgiveness: [],
  faith: [], believe: [], trust: [],
  heaven: [], hell: [], judgment: [],
  fear: [], anxiety: [], peace: [], joy: [], hope: [],
  strength: [], power: [], wisdom: []
};

verses.forEach((verse, idx) => {
  // Precompute embedding
  verse.embedding = createEmbedding(verse.text);
  
  // Build inverted index
  const tokens = tokenizer.tokenize(verse.text.toLowerCase()) || [];
  tokens.forEach(token => {
    if (!invertedIndex[token]) invertedIndex[token] = [];
    invertedIndex[token].push(idx);
  });
  
  // Build book index
  if (!bookIndex[verse.book]) bookIndex[verse.book] = [];
  bookIndex[verse.book].push(idx);
  
  // Build topic index
  const text = verse.text.toLowerCase();
  Object.keys(topicIndex).forEach(topic => {
    if (text.includes(topic)) {
      topicIndex[topic].push(idx);
    }
  });
  
  if (idx % 1000 === 0) {
    process.stdout.write(`\r📊 Processed ${idx}/${verses.length} verses`);
  }
});

console.log(`\n✅ Processed all ${verses.length} verses`);

// Save precomputed data
const precomputed = {
  verses,
  invertedIndex,
  bookIndex,
  topicIndex,
  metadata: {
    totalVerses: verses.length,
    totalBooks: Object.keys(bookIndex).length,
    totalTopics: Object.keys(topicIndex).length,
    indexSize: Object.keys(invertedIndex).length
  }
};

const json = JSON.stringify(precomputed);
const compressed = zlib.gzipSync(json);
fs.writeFileSync('data/bible-precomputed.json.gz', compressed);

const uncompressedSize = (json.length / 1024 / 1024).toFixed(2);
const compressedSize = (compressed.length / 1024).toFixed(2);
const ratio = ((1 - compressed.length / json.length) * 100).toFixed(1);

console.log(`\n📊 Precomputation complete:`);
console.log(`   Verses: ${verses.length}`);
console.log(`   Books: ${Object.keys(bookIndex).length}`);
console.log(`   Topics: ${Object.keys(topicIndex).length}`);
console.log(`   Index terms: ${Object.keys(invertedIndex).length}`);
console.log(`\n📦 File size:`);
console.log(`   Uncompressed: ${uncompressedSize} MB`);
console.log(`   Compressed: ${compressedSize} KB`);
console.log(`   Ratio: ${ratio}% reduction`);
console.log(`\n✅ Saved to data/bible-precomputed.json.gz`);
