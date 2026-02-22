# Deployment Guide - Romans Road Journey

Complete guide for deploying the Romans Road Journey app to Vercel.

## 🚀 Quick Deploy (5 minutes)

### Prerequisites
- Vercel account (free): https://vercel.com/signup
- OpenRouter API key: https://openrouter.ai/keys
- GitHub account (optional, for Method 2)

---

## Method 1: Deploy with Vercel CLI ⚡ (Fastest)

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate.

### Step 3: Deploy from Project Directory

```bash
cd romans-road-journey
vercel
```

Answer the prompts:
- **Set up and deploy?** → Yes
- **Which scope?** → Select your account
- **Link to existing project?** → No
- **What's your project's name?** → `romans-road-journey` (or your choice)
- **In which directory is your code located?** → `./`
- **Want to override the settings?** → No

### Step 4: Add Environment Variable

```bash
vercel env add OPENROUTER_API_KEY production
```

When prompted, paste your OpenRouter API key (starts with `sk-or-v1-`).

### Step 5: Deploy to Production

```bash
vercel --prod
```

**Done!** Your app is live. Vercel will display your production URL.

---

## Method 2: Deploy via GitHub + Vercel Dashboard 🔄

### Step 1: Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Romans Road Journey app"

# Create main branch
git branch -M main

# Add your GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/romans-road-journey.git

# Push to GitHub
git push -u origin main
```

### Step 2: Import to Vercel

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your `romans-road-journey` repository
4. Configure project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install --legacy-peer-deps`

### Step 3: Add Environment Variables

In the "Environment Variables" section:
- **Name**: `OPENROUTER_API_KEY`
- **Value**: Your OpenRouter API key (paste it)
- **Environments**: Production, Preview, Development (select all)

Optional (for OpenRouter credits):
- **Name**: `OPENROUTER_APP_URL`
- **Value**: Your deployment URL
- **Environments**: Production, Preview, Development

### Step 4: Deploy

Click "Deploy" and wait 2-3 minutes.

**Done!** Visit your deployment URL to see the live app.

---

## 🔧 Post-Deployment Configuration

### Verify Deployment

1. Visit your Vercel URL (e.g., `https://romans-road-journey.vercel.app`)
2. Click "Start the Romans Road"
3. Test the full journey through all 5 steps
4. Ask a question to test RAG: "What does the Bible say about grace?"
5. Complete the journey and test the prayer guidance

### Check Deployment Logs

```bash
vercel logs --follow
```

Or in Vercel Dashboard:
- Go to your project
- Click "Deployments" → Select latest
- Click "View Function Logs"

### Update Environment Variables

To update your OpenRouter API key:

**CLI:**
```bash
vercel env rm OPENROUTER_API_KEY production
vercel env add OPENROUTER_API_KEY production
```

**Dashboard:**
1. Go to Project Settings → Environment Variables
2. Find `OPENROUTER_API_KEY`
3. Click "Edit" → Update value → Save

---

## 🌐 Custom Domain Setup

### Add Custom Domain

**Via CLI:**
```bash
vercel domains add yourdomain.com
```

**Via Dashboard:**
1. Go to Project Settings → Domains
2. Enter your domain name
3. Follow DNS configuration instructions

### Configure DNS

Add these records to your domain registrar:

**For root domain (example.com):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**Verify:**
```bash
vercel domains verify yourdomain.com
```

---

## 📊 Monitoring & Analytics

### View Real-time Logs

```bash
vercel logs --follow
```

### Monitor API Usage

**OpenRouter Dashboard:**
- Go to https://openrouter.ai/activity
- Monitor token usage and costs
- View model usage (Claude Sonnet vs Gemini fallback)
- Set spending limits

**Vercel Analytics:**
- Enable in Project Settings → Analytics
- Track page views, user engagement
- Monitor performance metrics

### Set Up Alerts

**OpenRouter:**
- Set usage alerts in OpenRouter dashboard
- Configure spending limits
- Monitor fallback usage (Claude → Gemini)

**Vercel:**
- Enable email notifications for deployment failures
- Set up Slack/Discord webhooks for alerts

---

## 🔒 Security Best Practices

### Environment Variables

✅ **Do:**
- Store API keys in Vercel environment variables
- Use different keys for development and production
- Rotate API keys regularly

❌ **Don't:**
- Commit `.env.local` to Git (already in `.gitignore`)
- Share API keys in code or documentation
- Use the same key across multiple projects

### Rate Limiting (Optional)

Add rate limiting middleware in `middleware.ts`:

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const rateLimit = new Map();

export function middleware(request: NextRequest) {
  const ip = request.ip ?? 'anonymous';
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 20;

  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, []);
  }

  const requests = rateLimit.get(ip).filter((time: number) => now - time < windowMs);
  
  if (requests.length >= maxRequests) {
    return new NextResponse('Too many requests', { status: 429 });
  }

  requests.push(now);
  rateLimit.set(ip, requests);

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

### Content Moderation (Optional)

Add OpenAI moderation to filter inappropriate content:

```typescript
// In app/api/chat/route.ts
const moderation = await openai.moderations.create({
  input: message,
});

if (moderation.results[0].flagged) {
  return NextResponse.json({
    response: "Let's keep our conversation focused on the gospel message.",
    state: newState,
  });
}
```

---

## 🔄 Continuous Deployment

### Automatic Deployments

Vercel automatically deploys when you push to GitHub:

```bash
git add .
git commit -m "Update Bible verses"
git push
```

**Preview Deployments:**
- Every push to a branch creates a preview deployment
- Test changes before merging to main

**Production Deployments:**
- Pushes to `main` branch deploy to production
- Automatic rollback on build failures

### Deployment Hooks

Trigger deployments via webhook:

```bash
# Get deploy hook URL from Vercel Dashboard
curl -X POST https://api.vercel.com/v1/integrations/deploy/...
```

---

## 🐛 Troubleshooting Deployment

### Build Failures

**Error: "Module not found"**
```bash
# Update install command in Vercel
npm install --legacy-peer-deps
```

**Error: "Build exceeded maximum duration"**
- Optimize dependencies
- Remove unused packages
- Check for infinite loops in build scripts

### Runtime Errors

**Error: "OPENROUTER_API_KEY is not defined"**
1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Verify `OPENROUTER_API_KEY` exists
3. Redeploy: `vercel --prod`

**Error: "Function execution timed out"**
- Increase timeout in `vercel.json`:
```json
{
  "functions": {
    "app/api/chat/route.ts": {
      "maxDuration": 30
    }
  }
}
```

### Performance Issues

**Slow response times:**
- Check OpenRouter status: https://openrouter.ai/status
- Monitor Vercel function logs for bottlenecks
- Check if fallback to Gemini is occurring (may be slower)
- Optimize RAG search (reduce vector dimensions)

**High API costs:**
- Reduce `max_tokens` in agent configuration
- Implement response caching
- Add user rate limiting
- Monitor which model is being used (Claude vs Gemini)
- Consider switching primary/fallback models based on cost

---

## 📈 Scaling for Production

### Database Integration (Optional)

For larger Bible datasets, use a database:

**PostgreSQL with Vercel:**
```bash
vercel postgres create
```

**MongoDB Atlas:**
- Create free cluster at https://www.mongodb.com/cloud/atlas
- Add connection string to environment variables

### Caching Strategy

Add Redis caching for frequently asked questions:

```typescript
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});

// Cache responses
await redis.set(`response:${query}`, response, { ex: 3600 });
```

### CDN Optimization

Vercel automatically uses Edge Network for:
- Static assets
- API routes (with Edge Runtime)
- Image optimization

---

## 🎯 Production Checklist

Before going live:

- [ ] All environment variables set in Vercel
- [ ] OpenRouter API key is valid and has credits
- [ ] Test all 5 Romans Road steps
- [ ] Verify RAG returns relevant verses
- [ ] Test on mobile devices
- [ ] Check browser console for errors
- [ ] Review Vercel function logs
- [ ] Set up custom domain (optional)
- [ ] Enable analytics (optional)
- [ ] Configure rate limiting (optional)
- [ ] Test with multiple users
- [ ] Verify SSL certificate is active
- [ ] Set up monitoring alerts

---

## 🔄 Rollback Procedure

If deployment has issues:

**Via Dashboard:**
1. Go to Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

**Via CLI:**
```bash
vercel rollback
```

---

## 📞 Support Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Next.js Documentation**: https://nextjs.org/docs
- **OpenAI API Reference**: https://platform.openai.com/docs
- **Vercel Support**: https://vercel.com/support

---

## 🎉 Success!

Your Romans Road Journey app is now live and ready to share the gospel!

**Share your deployment:**
- Copy your Vercel URL
- Share on social media
- Embed in your church website
- Use in evangelism efforts

**"Go into all the world and preach the gospel to all creation." - Mark 16:15**
