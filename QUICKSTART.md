# Quick Start Guide - Romans Road Journey

Get the app running in **5 minutes**! ⚡

## Step 1: Install Dependencies (2 min)

```bash
cd romans-road-journey
npm install --legacy-peer-deps
```

## Step 2: Set Up OpenRouter API Key (1 min)

1. Get your API key from https://openrouter.ai/keys
2. Create `.env.local` file:

```bash
cp .env.example .env.local
```

3. Edit `.env.local` and add your key:

```env
OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here
OPENROUTER_APP_NAME=Romans Road Journey
OPENROUTER_APP_URL=https://your-deployment-url.vercel.app
```

## Step 3: Run the App (1 min)

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Step 4: Test It Out (1 min)

1. Click **"Start the Romans Road"**
2. Read through the first step (Romans 3:23)
3. Click **"Continue to Next Step"**
4. Ask a question: "What is grace?"

**You're done!** 🎉

---

## Deploy to Vercel (Optional - 5 min)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Add API key
vercel env add OPENROUTER_API_KEY production

# Deploy to production
vercel --prod
```

Your app is now live! Share the URL to spread the gospel. 🙏

---

## Troubleshooting

**Problem**: "Module not found" errors  
**Solution**: Run `npm install --legacy-peer-deps`

**Problem**: "OpenRouter API error"  
**Solution**: Check your API key in `.env.local` (should start with `sk-or-v1-`)

**Problem**: App won't start  
**Solution**: Make sure you're in the `romans-road-journey` directory

---

## Next Steps

- Read [README.md](./README.md) for full documentation
- See [TESTING.md](./TESTING.md) for testing guide
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment details

**"Go into all the world and preach the gospel." - Mark 16:15**
