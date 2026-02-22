# GitHub & Vercel Setup Guide

Complete step-by-step guide to push your Romans Road Journey app to GitHub and deploy on Vercel.

## 📋 Prerequisites

- [x] Git repository initialized (✅ Done)
- [x] All files committed (✅ Done)
- [ ] GitHub account ([Sign up here](https://github.com/signup))
- [ ] Vercel account ([Sign up here](https://vercel.com/signup))
- [ ] OpenRouter API key ([Get one here](https://openrouter.ai/keys))

## 🚀 Step 1: Push to GitHub

### Option A: Create New Repository on GitHub (Recommended)

1. **Go to GitHub** and create a new repository:
   - Visit https://github.com/new
   - Repository name: `romans-road-journey`
   - Description: `Interactive AI-powered Romans Road to salvation with Scripture-only responses`
   - Visibility: **Public** (or Private if preferred)
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
   - Click **"Create repository"**

2. **Copy the repository URL** shown on the next page:
   ```
   https://github.com/YOUR_USERNAME/romans-road-journey.git
   ```

3. **Add GitHub as remote and push:**

   ```bash
   cd /Users/jvkyleeclarin/gospel-app/romans-road-journey
   
   # Add GitHub remote
   git remote add origin https://github.com/YOUR_USERNAME/romans-road-journey.git
   
   # Push to GitHub
   git push -u origin main
   ```

   If prompted for credentials:
   - Username: Your GitHub username
   - Password: Use a [Personal Access Token](https://github.com/settings/tokens) (not your password)

### Option B: Use Existing Repository

If you already have a repository:

```bash
# Check current remote
git remote -v

# Update remote URL if needed
git remote set-url origin https://github.com/YOUR_USERNAME/romans-road-journey.git

# Push
git push -u origin main
```

### ✅ Verify GitHub Push

1. Go to your repository on GitHub: `https://github.com/YOUR_USERNAME/romans-road-journey`
2. You should see all your files (README.md, app/, components/, etc.)
3. **Verify `.env.local` is NOT visible** (it should be ignored by .gitignore)

---

## 🌐 Step 2: Deploy to Vercel

### Method 1: Deploy via Vercel Dashboard (Easiest)

1. **Go to Vercel** and sign in:
   - Visit https://vercel.com
   - Click "Sign Up" or "Log In"
   - Choose "Continue with GitHub" (recommended)

2. **Import your repository:**
   - Click **"Add New..."** → **"Project"**
   - Find `romans-road-journey` in the list
   - Click **"Import"**

3. **Configure project:**
   - **Framework Preset**: Next.js (auto-detected ✅)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install --legacy-peer-deps` ⚠️ **IMPORTANT: Change this!**

4. **Add Environment Variables:**

   Click **"Environment Variables"** and add:

   | Name | Value | Environments |
   |------|-------|--------------|
   | `OPENROUTER_API_KEY` | `sk-or-v1-your-actual-key` | Production, Preview, Development |
   | `OPENROUTER_APP_NAME` | `Romans Road Journey` | Production, Preview, Development |
   | `OPENROUTER_APP_URL` | (leave empty for now) | Production, Preview, Development |

   **Get your OpenRouter API key:**
   - Go to https://openrouter.ai/keys
   - Click "Create Key"
   - Copy the key (starts with `sk-or-v1-`)

5. **Deploy:**
   - Click **"Deploy"**
   - Wait 2-3 minutes for build to complete
   - You'll see "Congratulations!" when done

6. **Update `OPENROUTER_APP_URL`:**
   - Copy your deployment URL (e.g., `https://romans-road-journey.vercel.app`)
   - Go to **Project Settings** → **Environment Variables**
   - Edit `OPENROUTER_APP_URL` and paste your URL
   - Redeploy: **Deployments** → **...** → **Redeploy**

### Method 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
cd /Users/jvkyleeclarin/gospel-app/romans-road-journey
vercel

# Follow prompts:
# - Set up and deploy? Y
# - Which scope? [Select your account]
# - Link to existing project? N
# - What's your project's name? romans-road-journey
# - In which directory is your code located? ./
# - Want to override settings? N

# Add environment variables
vercel env add OPENROUTER_API_KEY production
# Paste your OpenRouter API key when prompted

vercel env add OPENROUTER_APP_NAME production
# Enter: Romans Road Journey

# Deploy to production
vercel --prod
```

---

## ✅ Step 3: Verify Deployment

### Test Your Live App

1. **Visit your Vercel URL** (e.g., `https://romans-road-journey.vercel.app`)

2. **Test the journey:**
   - Click "Start the Romans Road"
   - Verify Romans 3:23 appears
   - Click "Continue to Next Step"
   - Complete all 5 steps

3. **Test AI responses:**
   - Ask: "What is sin?"
   - Verify Bible verses are cited
   - Check console for model logs (Claude Sonnet or Gemini)

4. **Test fallback:**
   - Check Vercel logs for model usage
   - Look for: `Attempting with primary model: anthropic/claude-3.5-sonnet`

### Check Vercel Logs

```bash
# Via CLI
vercel logs --follow

# Or in Dashboard:
# Project → Deployments → [Latest] → View Function Logs
```

---

## 🔧 Step 4: Configure Custom Domain (Optional)

### Add Custom Domain

1. **In Vercel Dashboard:**
   - Go to **Project Settings** → **Domains**
   - Click **"Add"**
   - Enter your domain (e.g., `romansroad.yourdomain.com`)
   - Click **"Add"**

2. **Configure DNS** (at your domain registrar):

   **For subdomain (romansroad.yourdomain.com):**
   ```
   Type: CNAME
   Name: romansroad
   Value: cname.vercel-dns.com
   ```

   **For root domain (yourdomain.com):**
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   ```

3. **Verify:**
   - Wait 5-10 minutes for DNS propagation
   - Vercel will automatically provision SSL certificate
   - Visit your custom domain

---

## 🔄 Step 5: Set Up Automatic Deployments

### How It Works

Every time you push to GitHub, Vercel automatically:
1. Detects the push
2. Builds your app
3. Deploys to production (if pushed to `main` branch)
4. Creates preview deployment (if pushed to other branches)

### Make Changes and Deploy

```bash
# Make changes to your code
# Example: Edit data/bible-verses.json to add more verses

# Commit changes
git add .
git commit -m "Add more Bible verses to dataset"

# Push to GitHub
git push origin main

# Vercel automatically deploys! 🚀
```

### Preview Deployments

Create a feature branch for testing:

```bash
# Create new branch
git checkout -b add-new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push to GitHub
git push origin add-new-feature

# Vercel creates a preview URL (e.g., romans-road-journey-git-add-new-feature.vercel.app)
# Test the preview before merging to main
```

---

## 📊 Step 6: Monitor Your App

### Vercel Dashboard

Monitor at https://vercel.com/dashboard

**Key Metrics:**
- Deployment status
- Build logs
- Function logs (API routes)
- Analytics (page views, performance)
- Error tracking

### OpenRouter Dashboard

Monitor at https://openrouter.ai/activity

**Key Metrics:**
- API usage (requests, tokens)
- Model breakdown (Claude vs Gemini)
- Costs per model
- Error rates
- Fallback frequency

### Set Up Alerts

**Vercel:**
- Project Settings → Notifications
- Enable email alerts for:
  - Deployment failures
  - Budget alerts (if on paid plan)

**OpenRouter:**
- Settings → Notifications
- Set spending limits
- Enable low balance alerts

---

## 🐛 Troubleshooting

### Build Fails on Vercel

**Error: "Module not found"**
```bash
# Solution: Update install command
# In Vercel: Project Settings → General → Install Command
# Set to: npm install --legacy-peer-deps
```

**Error: "Build exceeded maximum duration"**
- Check build logs for errors
- Ensure all dependencies are in package.json
- Remove unused packages

### Runtime Errors

**Error: "OPENROUTER_API_KEY is not defined"**
1. Go to Project Settings → Environment Variables
2. Verify `OPENROUTER_API_KEY` exists
3. Check it's enabled for Production
4. Redeploy

**Error: "Function execution timed out"**
- OpenRouter may be slow
- Check fallback is working
- Consider increasing timeout in vercel.json

### API Errors

**"Insufficient credits"**
- Add credits at https://openrouter.ai/credits
- Minimum $5 recommended

**"Rate limit exceeded"**
- Check OpenRouter dashboard for limits
- Implement rate limiting in your app
- Upgrade OpenRouter plan if needed

---

## 🔒 Security Checklist

Before going public:

- [ ] `.env.local` is in `.gitignore` (✅ Already configured)
- [ ] No API keys in source code
- [ ] Environment variables set in Vercel
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] OpenRouter spending limits configured
- [ ] Rate limiting considered (optional)
- [ ] Error tracking enabled

---

## 📈 Next Steps

### Enhance Your App

1. **Expand Bible Dataset:**
   - Add more verses to `data/bible-verses.json`
   - Commit and push to auto-deploy

2. **Add Analytics:**
   - Enable Vercel Analytics
   - Track user engagement
   - Monitor conversion rates

3. **Optimize Costs:**
   - Monitor which model is used most
   - Adjust primary/fallback based on usage
   - Implement response caching

4. **Share the Gospel:**
   - Share your Vercel URL on social media
   - Embed in your church website
   - Use in evangelism campaigns

### Marketing Your App

**Share on:**
- Church website
- Social media (Twitter, Facebook, Instagram)
- Christian forums and communities
- Email newsletters
- QR codes on printed materials

**Example social media post:**
```
🙏 Introducing Romans Road Journey - an interactive AI-powered guide 
through the gospel message using Scripture alone.

Explore God's plan of salvation step-by-step with Bible verses and 
answers to your questions.

Try it now: [Your Vercel URL]

#Gospel #RomansRoad #Faith #Christianity
```

---

## 📞 Support

### Getting Help

**Vercel Issues:**
- Documentation: https://vercel.com/docs
- Support: https://vercel.com/support
- Community: https://github.com/vercel/next.js/discussions

**OpenRouter Issues:**
- Documentation: https://openrouter.ai/docs
- Discord: https://discord.gg/openrouter
- Email: support@openrouter.ai

**App Issues:**
- Check TROUBLESHOOTING section in README.md
- Review Vercel function logs
- Check OpenRouter dashboard for API errors

---

## ✅ Deployment Checklist

- [x] Git repository initialized
- [x] All files committed
- [x] .gitignore configured (excludes .env files)
- [ ] Pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables configured
- [ ] Deployed successfully
- [ ] Live app tested
- [ ] OpenRouter credits added
- [ ] Monitoring set up
- [ ] Custom domain configured (optional)

---

**Congratulations!** Your Romans Road Journey app is now live and ready to share the gospel with the world! 🎉

*"Go into all the world and preach the gospel to all creation." - Mark 16:15*
