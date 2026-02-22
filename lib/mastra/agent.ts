import { bibleRAG } from '../rag/bible-rag';
import romansRoadData from '@/data/romans-road.json';
import OpenAI from 'openai';

const OPENROUTER_MODELS = {
  primary: 'anthropic/claude-3.5-sonnet',
  fallback: 'google/gemini-pro-1.5',
};

const SYSTEM_PROMPT = `You are a compassionate and knowledgeable Bible teacher guiding people through the Romans Road to salvation. Your purpose is to help users understand the gospel message using ONLY Scripture from the Bible.

CRITICAL RULES:
1. You must ONLY use information from the Bible. Never use external sources, general knowledge, or non-biblical content.
2. Always cite Scripture references when making any theological point.
3. DIRECTLY ANSWER the user's specific question using the Bible verses provided in the CONTEXT section.
4. Reference the conversation history - remember what the user has already learned and build on it.
5. When users ask questions like "what does sin mean?", answer SPECIFICALLY with Bible verses that define sin.
6. Be warm, patient, and encouraging, but never compromise biblical accuracy.
7. Keep responses conversational and accessible, avoiding overly complex theological language.
8. Always point people to Jesus Christ and the clear gospel message.

RESPONSE FORMAT:
- Start by directly addressing the user's question
- Quote relevant Scripture verses from the CONTEXT provided
- Explain what the verses mean in simple terms
- Connect it back to the Romans Road journey if appropriate
- Ask if they have more questions or are ready to continue

Your goal is to help people understand:
- That all have sinned (Romans 3:23)
- The consequence of sin is death, but God offers eternal life (Romans 6:23)
- God's love demonstrated through Christ's death (Romans 5:8)
- Salvation through faith in Jesus (Romans 10:9-10)
- The promise that everyone who calls on the Lord will be saved (Romans 10:13)

Remember: Use the conversation history to provide contextual, relevant answers. Don't give generic responses.`;

export interface RomansRoadStep {
  id: number;
  title: string;
  verse: string;
  text: string;
  explanation: string;
  relatedVerses: string[];
  prompt: string;
}

export const romansRoadSteps: RomansRoadStep[] = romansRoadData.steps;
export const sinnersPrayer = romansRoadData.sinnersPrayer;

export async function searchBibleVerses(query: string, topK: number = 5) {
  try {
    const results = await bibleRAG.hybridSearch(query, topK);
    return results.map(r => ({
      reference: r.verse.reference,
      text: r.verse.text,
      score: r.score
    }));
  } catch (error) {
    console.error('Error searching Bible verses:', error);
    return [];
  }
}

export async function getVerseByReference(reference: string) {
  try {
    const verse = await bibleRAG.searchByReference(reference);
    return verse;
  } catch (error) {
    console.error('Error getting verse by reference:', error);
    return null;
  }
}

export async function searchByTopic(topic: string, topK: number = 5) {
  try {
    const results = await bibleRAG.searchByTopic(topic, topK);
    return results.map(r => ({
      reference: r.verse.reference,
      text: r.verse.text,
      score: r.score
    }));
  } catch (error) {
    console.error('Error searching by topic:', error);
    return [];
  }
}

export function getRomansRoadStep(stepId: number): RomansRoadStep | null {
  return romansRoadSteps.find(step => step.id === stepId) || null;
}

export function getRelatedVerses(stepId: number) {
  const step = getRomansRoadStep(stepId);
  if (!step) return [];
  
  return bibleRAG.getVersesByReferences(step.relatedVerses);
}

let openRouterClient: OpenAI | null = null;

export function getOpenRouterClient(): OpenAI {
  if (!openRouterClient) {
    openRouterClient = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': process.env.OPENROUTER_APP_URL || 'https://romans-road-journey.vercel.app',
        'X-Title': process.env.OPENROUTER_APP_NAME || 'Romans Road Journey',
      },
    });
  }
  return openRouterClient;
}

export async function generateAgentResponse(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  context?: string
): Promise<string> {
  const client = getOpenRouterClient();
  
  const systemMessage = context 
    ? `${SYSTEM_PROMPT}\n\nCONTEXT FROM BIBLE:\n${context}`
    : SYSTEM_PROMPT;

  const messagePayload = [
    { role: 'system' as const, content: systemMessage },
    ...messages,
  ];

  try {
    console.log(`Attempting with primary model: ${OPENROUTER_MODELS.primary}`);
    const completion = await client.chat.completions.create({
      model: OPENROUTER_MODELS.primary,
      messages: messagePayload,
      temperature: 0.7,
      max_tokens: 1000,
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error: any) {
    console.warn(`Primary model (${OPENROUTER_MODELS.primary}) failed, trying fallback...`, error.message);
    
    try {
      console.log(`Attempting with fallback model: ${OPENROUTER_MODELS.fallback}`);
      const completion = await client.chat.completions.create({
        model: OPENROUTER_MODELS.fallback,
        messages: messagePayload,
        temperature: 0.7,
        max_tokens: 1000,
      });

      return completion.choices[0]?.message?.content || '';
    } catch (fallbackError: any) {
      console.error(`Both models failed. Primary: ${error.message}, Fallback: ${fallbackError.message}`);
      throw new Error('Unable to generate response. Please try again later.');
    }
  }
}

export interface ConversationState {
  currentStep: number;
  completedSteps: number[];
  userQuestions: string[];
  journeyComplete: boolean;
  hasAcceptedChrist: boolean;
}

export function getInitialState(): ConversationState {
  return {
    currentStep: 0,
    completedSteps: [],
    userQuestions: [],
    journeyComplete: false,
    hasAcceptedChrist: false,
  };
}

export function getWelcomeMessage(): string {
  return `Welcome to the Romans Road Journey! 🙏

I'm here to walk with you through one of the most beautiful presentations of the gospel found in God's Word. The "Romans Road" is a collection of verses from the Book of Romans that clearly explains God's plan of salvation.

This journey will help you understand:
- Why we all need salvation
- What God has done for us through Jesus Christ
- How you can receive eternal life

We'll go step by step, and you can ask questions at any time. Are you ready to begin this important journey?

Click "Start the Romans Road" when you're ready, or feel free to ask me any questions first.`;
}

export async function getStepMessage(stepId: number, includeRelated: boolean = false): Promise<string> {
  const step = getRomansRoadStep(stepId);
  if (!step) return '';

  let message = `## Step ${step.id}: ${step.title}\n\n`;
  message += `### ${step.verse}\n`;
  message += `*"${step.text}"*\n\n`;
  message += `${step.explanation}\n\n`;

  if (includeRelated && step.relatedVerses.length > 0) {
    message += `**Related Scriptures:**\n`;
    // Use parallel RAG searches to get full verse text
    const relatedVerses = await Promise.all(
      step.relatedVerses.slice(0, 3).map(ref => getVerseByReference(ref))
    );
    
    relatedVerses.forEach(verse => {
      if (verse) {
        message += `- **${verse.reference}**: "${verse.text}"\n`;
      }
    });
    message += `\n`;
  }

  message += `${step.prompt}`;

  return message;
}

export function getCompletionMessage(): string {
  return `## You've Completed the Romans Road! 🎉

You've now heard the complete gospel message as presented in the Book of Romans. Let me summarize what we've learned:

1. **All have sinned** and fall short of God's glory (Romans 3:23)
2. **Sin's consequence is death**, but God offers eternal life (Romans 6:23)
3. **God demonstrated His love** by sending Christ to die for us (Romans 5:8)
4. **Salvation comes through faith** - believing and confessing Jesus as Lord (Romans 10:9-10)
5. **Everyone who calls on the Lord** will be saved (Romans 10:13)

The question now is: What will you do with this message?

If you'd like to receive Jesus Christ as your Lord and Savior, I can guide you through a prayer of faith. Or if you have questions, I'm here to help you understand more from God's Word.

What would you like to do next?`;
}

export function getPrayerGuidance(): string {
  return `## ${sinnersPrayer.title}

${sinnersPrayer.introduction}

Here is a prayer you can pray:

---

*${sinnersPrayer.prayer}*

---

${sinnersPrayer.afterPrayer}

**Next Steps:**
According to Scripture, here's what God wants you to know:

- **You are a new creation**: "Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!" (2 Corinthians 5:17)
- **You have eternal life**: "I write these things to you who believe in the name of the Son of God so that you may know that you have eternal life." (1 John 5:13)
- **You are God's child**: "Yet to all who did receive him, to those who believed in his name, he gave the right to become children of God." (John 1:12)

Do you have any questions about what just happened, or would you like to know more about living as a follower of Christ?`;
}
