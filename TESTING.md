# Testing Guide - Romans Road Journey

Comprehensive testing procedures to ensure the app works correctly before deployment.

## 🧪 Pre-Deployment Testing

### Test Suite 1: Core Functionality

#### Test 1.1: Welcome Screen
**Steps:**
1. Start the app: `npm run dev`
2. Open http://localhost:3000
3. Verify welcome message displays
4. Check for "Start the Romans Road" button

**Expected Result:**
- Welcome message with journey overview
- Blue "Start the Romans Road" button visible
- No console errors

#### Test 1.2: Romans Road Progression
**Steps:**
1. Click "Start the Romans Road"
2. Verify Step 1 (Romans 3:23) displays
3. Click "Continue to Next Step" 4 times
4. Complete all 5 steps

**Expected Result:**
- Each step shows correct verse and explanation
- Progress bar updates (20%, 40%, 60%, 80%, 100%)
- Step indicators change color
- Completion message appears after Step 5

#### Test 1.3: Prayer Guidance
**Steps:**
1. Complete all 5 steps
2. Click "Guide Me in Prayer"
3. Read the prayer content

**Expected Result:**
- Sinner's prayer displays with Scripture citations
- All Romans Road verses referenced (3:23, 6:23, 5:8, 10:9-10, 10:13)
- "After Prayer" encouragement appears

---

### Test Suite 2: RAG System (Bible Search)

#### Test 2.1: Basic Bible Search
**Steps:**
1. Start the journey
2. Type: "What is sin?"
3. Submit and wait for response

**Expected Result:**
- Response includes Bible verses (Romans 3:23, 1 John 1:8, etc.)
- Each verse cited with reference
- Response is biblically accurate

**Console Check:**
```
Bible RAG initialized with 52 verses
```

#### Test 2.2: Topic-Based Search
**Test queries:**
- "Tell me about grace"
- "How can I be saved?"
- "What does God say about forgiveness?"

**Expected Result:**
- Relevant verses retrieved for each topic
- Multiple Scripture references provided
- Responses stay focused on biblical content

#### Test 2.3: Hybrid Search Accuracy
**Steps:**
1. Ask: "What are the consequences of sin?"
2. Check response for relevant verses

**Expected Verses:**
- Romans 6:23 (wages of sin is death)
- Ezekiel 18:20 (soul who sins will die)
- James 1:15 (sin leads to death)

#### Test 2.4: Verse Reference Lookup
**Steps:**
1. Ask: "Show me Romans 5:8"
2. Verify exact verse is returned

**Expected Result:**
- Exact verse text: "But God demonstrates his own love for us in this: While we were still sinners, Christ died for us."
- Reference: Romans 5:8

---

### Test Suite 3: AI Agent Validation

#### Test 3.1: Scripture-Only Responses
**Test queries:**
- "What is your opinion on politics?"
- "Tell me about the weather"
- "What's the best restaurant?"

**Expected Result:**
- Gentle redirect: "Let's focus on what Scripture says..."
- Relevant Bible verses offered
- No external knowledge used

#### Test 3.2: Theological Accuracy
**Test queries:**
- "Can I earn my salvation?"
- "What is faith?"
- "Who is Jesus?"

**Expected Result:**
- Biblically sound answers
- Multiple Scripture citations
- Aligns with Romans Road message

#### Test 3.3: Conversation Context
**Steps:**
1. Complete Step 1 (Romans 3:23)
2. Ask: "Can you explain more about this?"
3. Verify response references current step

**Expected Result:**
- Response relates to Romans 3:23 (sin)
- Additional verses about sin provided
- Context maintained from current step

---

### Test Suite 4: UI/UX Testing

#### Test 4.1: Responsive Design
**Test on:**
- Desktop (1920x1080)
- Tablet (768x1024)
- Mobile (375x667)

**Expected Result:**
- Layout adapts to screen size
- Buttons remain accessible
- Text is readable
- No horizontal scrolling

#### Test 4.2: User Interactions
**Steps:**
1. Click all buttons (Start, Continue, Prayer)
2. Type in chat input
3. Submit messages
4. Scroll through conversation

**Expected Result:**
- All buttons respond immediately
- Input field accepts text
- Messages appear in chat
- Auto-scroll to latest message

#### Test 4.3: Loading States
**Steps:**
1. Submit a question
2. Observe loading indicator

**Expected Result:**
- Typing indicator (3 dots) appears
- Button shows loading spinner
- Input disabled during loading
- Response appears smoothly

#### Test 4.4: Progress Visualization
**Steps:**
1. Start journey
2. Progress through each step
3. Watch progress bar

**Expected Result:**
- Progress bar fills incrementally
- Step numbers update
- Current step highlighted
- Completed steps show checkmark (green)

---

### Test Suite 5: Error Handling

#### Test 5.1: Missing API Key
**Steps:**
1. Remove `OPENAI_API_KEY` from `.env.local`
2. Restart server
3. Try to send a message

**Expected Result:**
- Error message displayed
- User-friendly error (not technical stack trace)
- Suggestion to check configuration

#### Test 5.2: Network Errors
**Steps:**
1. Disconnect internet
2. Try to send a message

**Expected Result:**
- Error message: "Failed to process message"
- Retry option available
- App doesn't crash

#### Test 5.3: Invalid Input
**Test inputs:**
- Empty message
- Very long message (1000+ characters)
- Special characters: `<script>alert('test')</script>`

**Expected Result:**
- Empty messages not sent
- Long messages handled gracefully
- XSS attempts sanitized

---

### Test Suite 6: Performance Testing

#### Test 6.1: Initial Load Time
**Steps:**
1. Clear browser cache
2. Load http://localhost:3000
3. Measure time to interactive

**Expected Result:**
- Page loads in < 3 seconds
- No layout shifts
- Smooth animations

#### Test 6.2: RAG Search Speed
**Steps:**
1. Ask a question
2. Measure response time

**Expected Result:**
- RAG search completes in < 1 second
- Total response time < 5 seconds
- No noticeable lag

#### Test 6.3: Memory Usage
**Steps:**
1. Open DevTools → Performance
2. Complete full journey
3. Ask 10 questions
4. Check memory usage

**Expected Result:**
- Memory usage stable (< 100MB)
- No memory leaks
- Smooth performance throughout

---

### Test Suite 7: Data Validation

#### Test 7.1: Bible Verses Dataset
**Steps:**
1. Open `data/bible-verses.json`
2. Validate JSON structure
3. Check for duplicates

**Validation:**
```bash
# Validate JSON
cat data/bible-verses.json | jq . > /dev/null && echo "Valid JSON"

# Check for duplicates
cat data/bible-verses.json | jq '.[].reference' | sort | uniq -d
```

**Expected Result:**
- Valid JSON format
- No duplicate references
- All verses have required fields

#### Test 7.2: Romans Road Data
**Steps:**
1. Open `data/romans-road.json`
2. Verify all 5 steps present
3. Check Scripture references

**Expected Result:**
- 5 steps with IDs 1-5
- All verses match Bible text
- Related verses exist in bible-verses.json

---

### Test Suite 8: Browser Compatibility

#### Test 8.1: Cross-Browser Testing
**Test on:**
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

**Expected Result:**
- Consistent appearance
- All features work
- No console errors

#### Test 8.2: Accessibility
**Steps:**
1. Use keyboard navigation (Tab, Enter)
2. Test with screen reader
3. Check color contrast

**Expected Result:**
- All interactive elements keyboard-accessible
- Screen reader announces content
- WCAG AA contrast compliance

---

## 🔍 Automated Testing Scripts

### Quick Test Script

Create `test-app.sh`:

```bash
#!/bin/bash

echo "🧪 Testing Romans Road Journey..."

# Check if server is running
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "❌ Server not running. Start with: npm run dev"
    exit 1
fi

echo "✅ Server is running"

# Check environment variables
if [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠️  Warning: OPENAI_API_KEY not set in environment"
fi

# Validate JSON files
echo "Checking JSON files..."
jq empty data/bible-verses.json && echo "✅ bible-verses.json is valid"
jq empty data/romans-road.json && echo "✅ romans-road.json is valid"

# Check for required files
FILES=("app/page.tsx" "app/api/chat/route.ts" "lib/rag/bible-rag.ts" "lib/mastra/agent.ts")
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
    fi
done

echo "🎉 Basic tests passed!"
```

Run with:
```bash
chmod +x test-app.sh
./test-app.sh
```

---

## 📊 Test Results Template

Use this template to document test results:

```markdown
## Test Results - [Date]

### Environment
- Node version: [version]
- Browser: [browser + version]
- OS: [operating system]

### Test Suite 1: Core Functionality
- [ ] Welcome Screen: PASS/FAIL
- [ ] Romans Road Progression: PASS/FAIL
- [ ] Prayer Guidance: PASS/FAIL

### Test Suite 2: RAG System
- [ ] Basic Bible Search: PASS/FAIL
- [ ] Topic-Based Search: PASS/FAIL
- [ ] Hybrid Search Accuracy: PASS/FAIL
- [ ] Verse Reference Lookup: PASS/FAIL

### Test Suite 3: AI Agent
- [ ] Scripture-Only Responses: PASS/FAIL
- [ ] Theological Accuracy: PASS/FAIL
- [ ] Conversation Context: PASS/FAIL

### Test Suite 4: UI/UX
- [ ] Responsive Design: PASS/FAIL
- [ ] User Interactions: PASS/FAIL
- [ ] Loading States: PASS/FAIL
- [ ] Progress Visualization: PASS/FAIL

### Test Suite 5: Error Handling
- [ ] Missing API Key: PASS/FAIL
- [ ] Network Errors: PASS/FAIL
- [ ] Invalid Input: PASS/FAIL

### Issues Found
1. [Description]
2. [Description]

### Notes
[Any additional observations]
```

---

## ✅ Pre-Deployment Checklist

Before deploying to production:

- [ ] All test suites pass
- [ ] No console errors
- [ ] RAG returns relevant verses
- [ ] AI responses are Scripture-only
- [ ] Mobile responsive
- [ ] Cross-browser tested
- [ ] Performance acceptable
- [ ] Error handling works
- [ ] Environment variables set
- [ ] Documentation reviewed

---

## 🐛 Known Issues & Workarounds

### Issue: FAISS initialization slow on first load
**Workaround:** Pre-initialize RAG on server startup

### Issue: Long responses may timeout
**Workaround:** Reduce max_tokens or implement streaming

### Issue: TypeScript lint warnings
**Status:** Non-blocking, can be ignored for MVP

---

## 📞 Reporting Issues

If you find bugs during testing:

1. Document the issue with screenshots
2. Note browser/OS/environment details
3. List steps to reproduce
4. Check console for error messages
5. Create GitHub issue (if applicable)

---

**Ready to deploy?** Ensure all critical tests pass before going live! 🚀
