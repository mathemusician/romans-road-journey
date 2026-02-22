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
    const stream = await handleChatStream({
      mastra,
      agentId: 'bibleAgent',
      params: { messages },
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
          templateText = `Welcome to the Romans Road Journey! 🙏

I'm here to walk with you through one of the most beautiful presentations of the gospel found in God's Word. The "Romans Road" is a collection of verses from the Book of Romans that clearly explains God's plan of salvation.

This journey will help you understand:
- Why we all need salvation
- What God has done for us through Jesus Christ
- How you can receive eternal life

We'll go step by step, and you can ask questions at any time. Are you ready to begin this important journey?

Click "Start the Romans Road" when you're ready, or feel free to ask me any questions first.`;
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
