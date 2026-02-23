import { NextRequest } from 'next/server';
import { handleChatStream } from '@mastra/ai-sdk';
import { createUIMessageStream, createUIMessageStreamResponse } from 'ai';
import { mastra } from '@/lib/mastra';
import {
  getStepMessage,
  getCompletionMessage,
  getPrayerGuidance,
  ConversationState,
} from '@/lib/mastra/agent';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    console.log('[STREAM API] Received request');
    const { messages, data } = await req.json();
    const { action, state } = data || {};

    console.log('[STREAM API] Action:', action, 'State:', state);

    // Handle template actions as instant streams
    if (action === 'welcome') {
      return handleTemplateStream('welcome', state);
    }
    
    if (action === 'start') {
      return handleTemplateStream('start', state);
    }
    
    if (action === 'next_step') {
      return handleTemplateStream('next_step', state);
    }
    
    if (action === 'show_prayer') {
      return handleTemplateStream('show_prayer', state);
    }

    // Handle user questions with Mastra agent streaming
    console.log('[STREAM API] Streaming agent response');
    
    // Use handleChatStream - it properly transforms fullStream including tool results
    const stream = await handleChatStream({
      mastra,
      agentId: 'bibleAgent',
      params: { 
        messages,
        maxSteps: 10, // Allow multiple tool calls for deep research (default is 1)
        modelSettings: {
          maxOutputTokens: 8000, // Increased to prevent truncation in final response after tool calls
        },
      },
    });
    
    return createUIMessageStreamResponse({ stream });
  } catch (error) {
    console.error('[STREAM API] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process streaming message',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

async function handleTemplateStream(action: string, state: ConversationState) {
  console.log('[STREAM API] Handling template:', action);
  
  return createUIMessageStreamResponse({
    stream: createUIMessageStream({
      async execute({ writer }) {
        let templateText = '';
        let newState = { ...state };

        // Generate template content
        if (action === 'welcome') {
          templateText = `Welcome! I'm here to help you explore God's Word.

**I can help you in two ways:**

**1. Ask Me Anything About the Bible**
Have questions about what Scripture says? I can search through all 31,100 verses to find relevant passages and provide thoughtful analysis on any topic.

**2. Take the Romans Road Journey**
New to Christianity or want to understand God's plan of salvation? The Romans Road is a guided journey through key verses that explain the gospel step by step.

**What would you like to do?**
- Ask me any Bible question (e.g., "What does the Bible say about forgiveness?")
- Click "Start the Romans Road" for a guided journey through salvation

I'm here to help you explore God's Word!`;
        } else if (action === 'start') {
          newState.currentStep = 1;
          templateText = await getStepMessage(1, true);
        } else if (action === 'next_step') {
          const nextStep = state.currentStep + 1;
          
          if (!state.completedSteps.includes(state.currentStep)) {
            newState.completedSteps.push(state.currentStep);
          }

          if (nextStep <= 5) {
            newState.currentStep = nextStep;
            templateText = await getStepMessage(nextStep, true);
          } else {
            newState.journeyComplete = true;
            templateText = getCompletionMessage();
          }
        } else if (action === 'show_prayer') {
          newState.hasAcceptedChrist = true;
          templateText = getPrayerGuidance();
        }

        // Stream the template text
        writer.write({
          type: 'text-delta',
          id: 'template-text',
          delta: templateText,
        });

        // Stream the state update as custom data
        writer.write({
          type: 'data-romans-road-state',
          data: newState,
        });
      },
    }),
  });
}
