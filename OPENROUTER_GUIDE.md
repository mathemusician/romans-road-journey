# OpenRouter Integration Guide

This app uses **OpenRouter** instead of direct OpenAI API access, providing better reliability and flexibility through automatic model fallback.

## 🎯 Why OpenRouter?

### Benefits
- **Multiple AI Models**: Access Claude, Gemini, GPT-4, and more through one API
- **Automatic Fallback**: If Claude Sonnet fails, automatically switches to Gemini
- **Cost Effective**: Often cheaper than direct API access
- **Pay-as-you-go**: No monthly subscriptions required
- **Better Reliability**: If one model is down, fallback ensures service continues

### Current Configuration

**Primary Model**: `anthropic/claude-3.5-sonnet`
- High-quality responses
- Excellent biblical understanding
- Strong reasoning capabilities

**Fallback Model**: `google/gemini-pro-1.5`
- Fast and reliable
- Good contextual understanding
- Cost-effective backup

## 🔧 How It Works

### Automatic Fallback Flow

```
User Question
    ↓
Try Claude 3.5 Sonnet
    ↓
Success? → Return Response
    ↓
Failed? → Try Gemini Pro 1.5
    ↓
Success? → Return Response
    ↓
Failed? → Return Error
```

### Code Implementation

The fallback logic is in `lib/mastra/agent.ts`:

```typescript
try {
  // Try primary model (Claude Sonnet)
  const completion = await client.chat.completions.create({
    model: 'anthropic/claude-3.5-sonnet',
    messages: messagePayload,
    temperature: 0.7,
    max_tokens: 1000,
  });
  return completion.choices[0]?.message?.content || '';
} catch (error) {
  // Fallback to Gemini
  const completion = await client.chat.completions.create({
    model: 'google/gemini-pro-1.5',
    messages: messagePayload,
    temperature: 0.7,
    max_tokens: 1000,
  });
  return completion.choices[0]?.message?.content || '';
}
```

## 🚀 Getting Started

### 1. Get OpenRouter API Key

1. Go to https://openrouter.ai/keys
2. Sign up (free account available)
3. Click "Create Key"
4. Copy your API key (starts with `sk-or-v1-`)

### 2. Add Credits

OpenRouter uses pay-as-you-go pricing:
- Go to https://openrouter.ai/credits
- Add credits (minimum $5)
- No monthly fees

### 3. Configure Environment

Add to `.env.local`:

```env
OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here
OPENROUTER_APP_NAME=Romans Road Journey
OPENROUTER_APP_URL=https://your-deployment-url.vercel.app
```

## 💰 Pricing

### Cost Comparison (per 1M tokens)

| Model | Input | Output | Use Case |
|-------|-------|--------|----------|
| Claude 3.5 Sonnet | $3.00 | $15.00 | Primary (best quality) |
| Gemini Pro 1.5 | $1.25 | $5.00 | Fallback (cost-effective) |
| GPT-4 Turbo | $10.00 | $30.00 | Direct OpenAI (reference) |

### Estimated Costs

**Typical conversation** (5 messages):
- Input: ~2,000 tokens
- Output: ~1,000 tokens
- **Cost**: ~$0.02 per conversation

**Monthly estimates**:
- 100 conversations: ~$2
- 500 conversations: ~$10
- 1,000 conversations: ~$20

## 📊 Monitoring Usage

### OpenRouter Dashboard

View real-time usage at https://openrouter.ai/activity

**Metrics Available:**
- Total requests
- Model usage breakdown (Claude vs Gemini)
- Token consumption
- Cost per model
- Error rates

### Check Fallback Usage

In your Vercel logs, look for:
```
Attempting with primary model: anthropic/claude-3.5-sonnet
Primary model failed, trying fallback...
Attempting with fallback model: google/gemini-pro-1.5
```

## 🔄 Switching Models

### Change Primary Model

Edit `lib/mastra/agent.ts`:

```typescript
const OPENROUTER_MODELS = {
  primary: 'anthropic/claude-3.5-sonnet',  // Change this
  fallback: 'google/gemini-pro-1.5',
};
```

### Available Models

**Recommended for Scripture-only responses:**

| Model | Strengths | Cost |
|-------|-----------|------|
| `anthropic/claude-3.5-sonnet` | Best reasoning, theological accuracy | $$$ |
| `google/gemini-pro-1.5` | Fast, good context, cost-effective | $$ |
| `openai/gpt-4-turbo` | Strong general knowledge | $$$$ |
| `anthropic/claude-3-haiku` | Very fast, cheapest | $ |

### Example: Switch to GPT-4

```typescript
const OPENROUTER_MODELS = {
  primary: 'openai/gpt-4-turbo',
  fallback: 'google/gemini-pro-1.5',
};
```

## 🛡️ Error Handling

### Common Errors

**"Insufficient credits"**
- Add credits at https://openrouter.ai/credits
- Minimum $5 recommended

**"Model not available"**
- Check OpenRouter status: https://openrouter.ai/status
- Fallback will automatically activate

**"Rate limit exceeded"**
- Upgrade your OpenRouter plan
- Implement request throttling

### Debugging

Enable verbose logging in `lib/mastra/agent.ts`:

```typescript
console.log(`Attempting with primary model: ${OPENROUTER_MODELS.primary}`);
console.log('Message payload:', messagePayload);
console.log('Response:', completion);
```

## 🔒 Security

### API Key Protection

✅ **Do:**
- Store in environment variables
- Use different keys for dev/prod
- Rotate keys regularly
- Monitor usage for anomalies

❌ **Don't:**
- Commit keys to Git
- Share keys publicly
- Use same key across projects
- Hardcode in source files

### Rate Limiting

Add to `middleware.ts` (optional):

```typescript
const rateLimit = new Map();

export function middleware(request: NextRequest) {
  const ip = request.ip ?? 'anonymous';
  // Limit to 20 requests per minute
  // Implementation details...
}
```

## 📈 Optimization Tips

### 1. Reduce Token Usage

```typescript
// In agent.ts
max_tokens: 500,  // Reduce from 1000
```

### 2. Cache Common Responses

```typescript
const cache = new Map();
const cacheKey = `${query}-${step}`;

if (cache.has(cacheKey)) {
  return cache.get(cacheKey);
}
```

### 3. Use Cheaper Model for Simple Queries

```typescript
// For simple questions, use Haiku
if (isSimpleQuery(message)) {
  model = 'anthropic/claude-3-haiku';
}
```

## 🧪 Testing Fallback

### Manual Test

1. Set invalid primary model:
```typescript
primary: 'invalid/model-name',
```

2. Send a message
3. Check logs for fallback activation
4. Verify Gemini response received

### Automated Test

```typescript
// test/fallback.test.ts
it('should fallback to Gemini when Claude fails', async () => {
  // Mock Claude failure
  // Verify Gemini is called
});
```

## 🔧 Troubleshooting

### Fallback Not Working

**Check:**
1. Both models configured correctly
2. Sufficient credits for both models
3. Error handling not catching exceptions
4. Logs show fallback attempt

### High Costs

**Solutions:**
1. Monitor which model is used most
2. Switch to cheaper primary model
3. Implement response caching
4. Add rate limiting
5. Reduce max_tokens

### Slow Responses

**Causes:**
- Fallback to slower model
- Network latency
- Large context windows

**Solutions:**
- Use faster primary model (Haiku)
- Reduce max_tokens
- Optimize RAG retrieval

## 📚 Additional Resources

- **OpenRouter Docs**: https://openrouter.ai/docs
- **Model Comparison**: https://openrouter.ai/models
- **Pricing**: https://openrouter.ai/docs/pricing
- **API Reference**: https://openrouter.ai/docs/api-reference

## 🎯 Best Practices

1. **Monitor Usage**: Check dashboard weekly
2. **Set Budgets**: Configure spending limits
3. **Test Fallback**: Verify it works before production
4. **Log Everything**: Track which model handles each request
5. **Optimize Prompts**: Shorter prompts = lower costs
6. **Cache Responses**: Reduce duplicate API calls
7. **Rate Limit**: Prevent abuse and runaway costs

---

**Questions?** Check the OpenRouter Discord or documentation for support.
