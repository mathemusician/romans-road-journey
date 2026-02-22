# Romans Road Journey 🙏

An interactive, AI-powered web application that guides users through the Romans Road to salvation—a biblical gospel presentation using key verses from the Book of Romans. Built with Next.js, OpenAI, and FAISS-powered RAG for Scripture-only responses.

## 🌟 Features

- **Interactive Gospel Journey**: Step-by-step walkthrough of the Romans Road (Romans 3:23, 6:23, 5:8, 10:9-10, 10:13)
- **Scripture-Only AI Responses**: All AI responses pull exclusively from the Bible using RAG (Retrieval-Augmented Generation)
- **FAISS Hybrid Search**: Combines semantic and keyword search for accurate Bible verse retrieval
- **Modern Chat Interface**: ChatGPT-like conversational UI with progress tracking
- **Follow-up Q&A**: Ask questions about the gospel, faith, and Scripture after the journey
- **Prayer Guidance**: Biblically-grounded sinner's prayer with Scripture citations
- **Mobile Responsive**: Beautiful, modern UI that works on all devices

## 🛠️ Tech Stack

- **Frontend**: Next.js 14+ (App Router), React, Tailwind CSS
- **AI/LLM**: OpenRouter (Claude 3.5 Sonnet with Gemini Pro 1.5 fallback)
- **RAG System**: FAISS (vector search), Natural (NLP), custom hybrid search
- **Backend**: Next.js API Routes (serverless)
- **Deployment**: Vercel-ready

## 📋 Prerequisites

- Node.js 18+ and npm
- OpenRouter API key ([Get one here](https://openrouter.ai/keys))

## 🚀 Quick Start

### 1. Clone and Install

```bash
cd romans-road-journey
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your OpenRouter API key:

```
OPENROUTER_API_KEY=sk-or-v1-your-actual-openrouter-api-key-here
OPENROUTER_APP_NAME=Romans Road Journey
OPENROUTER_APP_URL=https://your-app-url.vercel.app
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📁 Project Structure

```
romans-road-journey/
├── app/
│   ├── api/chat/          # Chat API endpoint
│   │   └── route.ts       # Handles messages, RAG, and agent responses
│   ├── page.tsx           # Main page (renders ChatInterface)
│   └── layout.tsx         # Root layout
├── components/
│   ├── ChatInterface.tsx  # Main chat UI component
│   ├── ChatMessage.tsx    # Individual message component
│   └── ProgressBar.tsx    # Romans Road progress tracker
├── lib/
│   ├── mastra/
│   │   └── agent.ts       # AI agent logic, workflow, and helpers
│   ├── rag/
│   │   └── bible-rag.ts   # FAISS-based Bible RAG system
│   └── utils.ts           # Utility functions
├── data/
│   ├── romans-road.json   # Romans Road steps and content
│   └── bible-verses.json  # Bible verse dataset (50+ verses)
├── .env.example           # Environment variable template
└── README.md              # This file
```

## 🔧 How It Works

### RAG System (Bible Retrieval)

The app uses a **hybrid search** approach combining:

1. **Semantic Search**: Vector embeddings with FAISS for conceptual similarity
2. **Keyword Search**: TF-IDF for exact term matching
3. **Weighted Combination**: Blends both approaches for optimal retrieval

**Key Features:**
- Custom embeddings optimized for biblical terms (sin, salvation, grace, etc.)
- Cosine similarity threshold (>0.5) to ensure relevance
- Always cites Scripture references (e.g., "Romans 3:23")

### AI Agent Workflow

1. **User Input**: User asks a question or progresses through the journey
2. **Context Retrieval**: RAG system searches Bible verses relevant to the query
3. **LLM Generation**: OpenAI GPT-4 generates a response using **only** retrieved Scripture
4. **Response Validation**: System ensures no external knowledge is used
5. **Delivery**: User receives biblically accurate, conversational response

### Romans Road Steps

1. **Romans 3:23** - All have sinned
2. **Romans 6:23** - Wages of sin is death; gift of God is eternal life
3. **Romans 5:8** - God's love demonstrated through Christ
4. **Romans 10:9-10** - Salvation through faith and confession
5. **Romans 10:13** - Everyone who calls on the Lord will be saved

## 🧪 Testing

### Verify Scripture-Only Responses

1. Start the app and begin the Romans Road journey
2. Ask questions like:
   - "What is sin?"
   - "How can I be saved?"
   - "What does the Bible say about grace?"
3. **Check**: All responses should cite Bible verses (e.g., "Romans 3:23 says...")
4. **Test Edge Cases**: Ask off-topic questions (e.g., "What's the weather?")
   - Expected: Gentle redirect to Scripture

### Test RAG Retrieval

Open the browser console and check for RAG logs:

```javascript
// In bible-rag.ts, logs show:
// "Bible RAG initialized with X verses"
// Search results with similarity scores
```

### Verify No External Knowledge

Ask the AI about non-biblical topics:
- "Tell me about politics"
- "What's your opinion on X?"

**Expected Response**: "Let's focus on what Scripture says" + relevant verses

## 🌐 Deployment to Vercel

### Option 1: Deploy via Vercel CLI

```bash
npm install -g vercel
vercel
```

Follow the prompts and add your `OPENAI_API_KEY` as an environment variable.

### Option 2: Deploy via Vercel Dashboard

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com) and import your repository
3. Add environment variable:
   - Key: `OPENAI_API_KEY`
   - Value: Your OpenAI API key
4. Deploy!

### Environment Variables for Production

In Vercel dashboard, add:
- `OPENROUTER_API_KEY` (required)
- `OPENROUTER_APP_URL` (optional, your deployment URL)

## 📊 Bible Dataset

The app includes a curated dataset of **50+ Bible verses** covering:
- Sin and separation from God
- Salvation and redemption
- Faith and belief
- Grace and mercy
- Eternal life
- Repentance and forgiveness

**To expand the dataset:**
1. Add verses to `data/bible-verses.json` in this format:
   ```json
   {
     "book": "John",
     "chapter": 3,
     "verse": 16,
     "text": "For God so loved the world...",
     "reference": "John 3:16"
   }
   ```
2. The RAG system will automatically index new verses on startup

## 🎨 Customization

### Change Bible Translation

Edit `data/bible-verses.json` and replace verse text with your preferred translation (ESV, NIV, NKJV, etc.).

### Modify Romans Road Steps

Edit `data/romans-road.json` to customize:
- Step explanations
- Related verses
- Prompts and questions

### Adjust AI Behavior

Edit `lib/mastra/agent.ts`:
- Modify `SYSTEM_PROMPT` for different tone/approach
- Adjust temperature (currently 0.7) for more/less creative responses
- Change max_tokens for longer/shorter responses

### UI Styling

All components use Tailwind CSS. Customize in:
- `components/ChatInterface.tsx` - Main layout and colors
- `components/ChatMessage.tsx` - Message styling
- `components/ProgressBar.tsx` - Progress indicator

## 🔒 Security & Best Practices

- ✅ API key stored in environment variables (never committed)
- ✅ Server-side API calls (OpenAI key not exposed to client)
- ✅ Input validation on all user messages
- ✅ Rate limiting recommended for production (add middleware)
- ✅ Content filtering via OpenAI moderation API (optional enhancement)

## 🐛 Troubleshooting

### "Module not found" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### FAISS installation issues
```bash
npm install faiss-node --legacy-peer-deps
```

### OpenRouter API errors
- Check your API key in `.env.local`
- Verify you have credits in your OpenRouter account
- Check rate limits: [OpenRouter Dashboard](https://openrouter.ai/activity)
- The app automatically falls back from Claude Sonnet to Gemini if the primary model fails

### RAG not returning verses
- Check console logs for "Bible RAG initialized"
- Verify `data/bible-verses.json` is valid JSON
- Try more specific queries (e.g., "sin" instead of "bad things")

## 📝 License

This project is open-source and available for ministry use. Feel free to modify and deploy for your church, ministry, or personal evangelism efforts.

## 🙏 Credits

Built with:
- [Next.js](https://nextjs.org)
- [OpenAI](https://openai.com)
- [FAISS](https://github.com/facebookresearch/faiss)
- [Tailwind CSS](https://tailwindcss.com)
- [Lucide Icons](https://lucide.dev)

Scripture quotations are from the Holy Bible (public domain).

## 🤝 Contributing

Contributions welcome! Areas for enhancement:
- Expand Bible verse dataset
- Add more gospel presentations (Bridge Illustration, 3 Circles, etc.)
- Multi-language support
- Audio/video integration
- Analytics for ministry insights

---

**"For I am not ashamed of the gospel, because it is the power of God that brings salvation to everyone who believes." - Romans 1:16**
