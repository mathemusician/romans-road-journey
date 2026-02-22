# Romans Road Journey - Complete Setup Guide

This guide walks you through setting up and deploying the Romans Road Journey application from scratch.

## 📦 Installation Steps

### 1. Install Dependencies

```bash
cd romans-road-journey
npm install --legacy-peer-deps
```

**Note**: The `--legacy-peer-deps` flag resolves peer dependency conflicts with FAISS and LangChain packages.

### 2. Configure Environment Variables

Create your `.env.local` file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your OpenAI API key:

```env
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OPENROUTER_APP_NAME=Romans Road Journey
OPENROUTER_APP_URL=https://your-deployment-url.vercel.app
```

**Get an OpenRouter API Key:**
1. Go to https://openrouter.ai/keys
2. Sign up or log in
3. Click "Create Key"
4. Copy the key (starts with `sk-or-v1-`)
5. Paste it into `.env.local`

**Why OpenRouter?**
- Access to multiple AI models (Claude, Gemini, GPT-4, etc.)
- Automatic fallback if primary model is down
- Often more cost-effective than direct API access
- Pay-as-you-go pricing

### 3. Verify Installation

Run the development server:

```bash
npm run dev
```

Open http://localhost:3000 - you should see the Romans Road Journey welcome screen.

## 🧪 Testing the Application

### Test 1: Basic Functionality

1. Click "Start the Romans Road"
2. Verify you see Romans 3:23 with explanation
3. Click "Continue to Next Step"
4. Verify progress bar updates
5. Complete all 5 steps

**Expected**: Smooth progression through all steps with Scripture citations.

### Test 2: RAG System (Bible Search)

1. Start the journey
2. Type a question: "What does the Bible say about sin?"
3. Submit the question

**Expected**: Response with multiple Bible verses cited (e.g., Romans 3:23, 1 John 1:8)

**Check Console Logs:**
```
Bible RAG initialized with 52 verses
```

### Test 3: Scripture-Only Validation

Ask off-topic questions:
- "What's the weather today?"
- "Tell me about politics"
- "What's your favorite movie?"

**Expected**: Responses like:
- "Let's focus on what Scripture says about this..."
- Gentle redirect with relevant Bible verses

### Test 4: Prayer Guidance

1. Complete all 5 steps
2. Click "Guide Me in Prayer"
3. Verify the sinner's prayer appears with Scripture references

**Expected**: Prayer text with citations (Romans 3:23, 6:23, 5:8, 10:9-10, 10:13)

### Test 5: Follow-up Questions

After completing the journey, ask:
- "How do I know I'm saved?"
- "What is grace?"
- "Can I lose my salvation?"

**Expected**: Biblically grounded answers with verse citations.

## 🔍 Debugging

### Check RAG Initialization

Add console logging to verify RAG is working:

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for: `Bible RAG initialized with 52 verses`

If missing, check:
- `data/bible-verses.json` exists and is valid JSON
- No errors in the console

### Verify OpenAI Connection

If you get errors like "Failed to process message":

1. Check `.env.local` has correct API key
2. Verify API key is active: https://platform.openai.com/api-keys
3. Check you have credits: https://platform.openai.com/account/usage
4. Restart dev server: `npm run dev`

### Common Issues

**Issue**: "Module not found: Can't resolve 'faiss-node'"
```bash
npm install faiss-node --legacy-peer-deps
```

**Issue**: "OpenRouter API error: Incorrect API key"
- Verify your API key in `.env.local`
- Make sure there are no extra spaces or quotes
- Restart the dev server
- Check your OpenRouter dashboard for API key status

**Issue**: Chat not responding
- Open browser console for errors
- Check Network tab for failed API calls
- Verify `/api/chat` endpoint is accessible

## 🚀 Deployment to Vercel

### Method 1: Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

When prompted:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N**
- Project name? `romans-road-journey`
- Directory? `./`
- Override settings? **N**

**Add Environment Variable:**
```bash
vercel env add OPENROUTER_API_KEY
```
Paste your OpenRouter API key when prompted (starts with `sk-or-v1-`).

**Deploy to Production:**
```bash
vercel --prod
```

### Method 2: GitHub + Vercel Dashboard

1. **Push to GitHub:**
```bash
git init
git add .
git commit -m "Initial commit: Romans Road Journey"
git branch -M main
git remote add origin https://github.com/yourusername/romans-road-journey.git
git push -u origin main
```

2. **Deploy on Vercel:**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Configure:
     - Framework Preset: Next.js
     - Root Directory: `./`
     - Build Command: `npm run build`
     - Install Command: `npm install --legacy-peer-deps`
   - Add Environment Variables:
     - Name: `OPENROUTER_API_KEY`
     - Value: Your OpenRouter API key
     - Name: `OPENROUTER_APP_URL`
     - Value: Your deployment URL (optional)
   - Click "Deploy"

3. **Verify Deployment:**
   - Visit your Vercel URL (e.g., `romans-road-journey.vercel.app`)
   - Test the full journey
   - Check for any errors in Vercel logs

## 📊 Monitoring Production

### Vercel Logs

View real-time logs:
```bash
vercel logs
```

Or in Vercel Dashboard:
- Go to your project
- Click "Deployments"
- Select latest deployment
- Click "View Function Logs"

### Check for Errors

Common production issues:
- **API key not set**: Add `OPENAI_API_KEY` in Vercel environment variables
- **Build failures**: Check build logs for missing dependencies
- **Runtime errors**: Check function logs for API errors

## 🎨 Customization Guide

### Add More Bible Verses

Edit `data/bible-verses.json`:

```json
{
  "book": "Philippians",
  "chapter": 4,
  "verse": 13,
  "text": "I can do all things through Christ who strengthens me.",
  "reference": "Philippians 4:13"
}
```

Restart the server - RAG will automatically index new verses.

### Modify Romans Road Steps

Edit `data/romans-road.json`:

```json
{
  "id": 1,
  "title": "Your Custom Title",
  "verse": "Romans 3:23",
  "text": "For all have sinned...",
  "explanation": "Your custom explanation here",
  "relatedVerses": ["Romans 3:10", "Isaiah 53:6"],
  "prompt": "Your custom prompt"
}
```

### Change UI Colors

Edit `components/ChatInterface.tsx`:

```tsx
// Change primary color from blue to purple
className="bg-purple-600 hover:bg-purple-700"

// Change gradient background
className="bg-gradient-to-br from-purple-50 to-pink-50"
```

### Adjust AI Temperature

Edit `lib/mastra/agent.ts`:

```typescript
temperature: 0.7,  // Lower = more focused, Higher = more creative
max_tokens: 1000,  // Increase for longer responses
```

## 🔐 Security Checklist

Before deploying to production:

- [ ] `.env.local` is in `.gitignore` (already configured)
- [ ] OpenAI API key is set in Vercel environment variables
- [ ] No API keys are hardcoded in source files
- [ ] CORS is properly configured (Next.js handles this)
- [ ] Rate limiting is considered (optional: add middleware)
- [ ] Content moderation is enabled (optional: OpenAI moderation API)

## 📈 Performance Optimization

### Enable Caching

Add caching to API route (`app/api/chat/route.ts`):

```typescript
export const revalidate = 60; // Cache for 60 seconds
```

### Optimize Bible Dataset

For production with large Bible datasets:
- Use a database (PostgreSQL, MongoDB)
- Implement server-side caching (Redis)
- Use streaming responses for long answers

### Monitor API Usage

Track OpenAI API costs:
- Set usage limits in OpenAI dashboard
- Monitor token usage in Vercel logs
- Implement user rate limiting

## 🎯 Next Steps

After successful deployment:

1. **Test in Production**: Run all tests on your live URL
2. **Share the Gospel**: Share your app link with others
3. **Gather Feedback**: Ask users about their experience
4. **Expand Content**: Add more Bible verses and gospel presentations
5. **Add Analytics**: Track conversions and user engagement (optional)

## 📞 Support

If you encounter issues:

1. Check the [Troubleshooting section in README.md](./README.md#-troubleshooting)
2. Review Vercel deployment logs
3. Check OpenAI API status: https://status.openai.com
4. Verify all environment variables are set correctly

## ✅ Pre-Launch Checklist

- [ ] All dependencies installed
- [ ] `.env.local` configured with valid OpenAI API key
- [ ] App runs locally without errors
- [ ] All 5 Romans Road steps display correctly
- [ ] RAG system returns relevant Bible verses
- [ ] Prayer guidance appears after completion
- [ ] Off-topic questions are redirected appropriately
- [ ] Mobile responsive design tested
- [ ] Deployed to Vercel successfully
- [ ] Production environment variables set
- [ ] Live app tested end-to-end

---

**Ready to deploy?** Follow the deployment steps above and share the gospel with the world! 🙏
