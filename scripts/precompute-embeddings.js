const fs = require('fs');
const zlib = require('zlib');
const natural = require('natural');

const tokenizer = new natural.WordTokenizer();

console.log('📥 Loading Bible verses...');
const compressedVerses = fs.readFileSync('data/bible-verses.json.gz');
const verses = JSON.parse(zlib.gunzipSync(compressedVerses).toString());
console.log(`✅ Loaded ${verses.length} verses`);

console.log('\n🔄 Computing embeddings for all verses...');

const importantWords = [
  'sin', 'sinned', 'death', 'life', 'eternal', 'saved', 'salvation', 'believe', 'faith',
  'jesus', 'christ', 'lord', 'god', 'love', 'grace', 'mercy', 'forgiveness', 'righteous',
  'righteousness', 'justified', 'confess', 'repent', 'born', 'again', 'spirit', 'holy',
  'money', 'wealth', 'riches', 'treasure', 'poor', 'rich', 'give', 'giving', 'tithe',
  'heaven', 'hell', 'prayer', 'pray', 'worship', 'obey', 'obedience', 'truth', 'word',
  'fear', 'afraid', 'anxiety', 'anxious', 'worry', 'peace', 'joy', 'hope', 'trust',
  'strength', 'strong', 'power', 'wisdom', 'wise', 'understanding', 'knowledge',
  'beast', 'dragon', 'leviathan', 'behemoth', 'creature', 'serpent', 'demon'
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

// Compute embeddings for all verses
const embeddings = [];
verses.forEach((verse, idx) => {
  embeddings.push(createEmbedding(verse.text));
  
  if ((idx + 1) % 1000 === 0) {
    process.stdout.write(`\r📊 Processed ${idx + 1}/${verses.length} verses`);
  }
});

console.log(`\n✅ Computed ${embeddings.length} embeddings`);

// Save embeddings
const embeddingsData = {
  embeddings: embeddings,
  metadata: {
    totalVerses: verses.length,
    embeddingDimension: 384,
    computedAt: new Date().toISOString()
  }
};

const json = JSON.stringify(embeddingsData);
const compressedData = zlib.gzipSync(json);
fs.writeFileSync('data/bible-embeddings.json.gz', compressedData);

const uncompressedSize = (json.length / 1024 / 1024).toFixed(2);
const compressedSize = (compressedData.length / 1024).toFixed(2);
const ratio = ((1 - compressedData.length / json.length) * 100).toFixed(1);

console.log(`\n📊 Embedding computation complete:`);
console.log(`   Total verses: ${verses.length}`);
console.log(`   Embedding dimension: 384`);
console.log(`   Total embeddings: ${embeddings.length}`);
console.log(`\n📦 File size:`);
console.log(`   Uncompressed: ${uncompressedSize} MB`);
console.log(`   Compressed: ${compressedSize} KB`);
console.log(`   Compression ratio: ${ratio}%`);
console.log(`\n✅ Saved to data/bible-embeddings.json.gz`);
