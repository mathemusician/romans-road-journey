import { NextRequest, NextResponse } from 'next/server';
import { mastra } from '@/lib/mastra';
import {
  getRomansRoadStep,
  getWelcomeMessage,
  getStepMessage,
  getCompletionMessage,
  getPrayerGuidance,
  ConversationState,
} from '@/lib/mastra/agent';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  message: string;
  conversationHistory: ChatMessage[];
  state: ConversationState;
  action?: 'start' | 'next_step' | 'show_prayer' | 'ask_question';
}

export async function POST(req: NextRequest) {
  try {
    console.log('[API] Received chat request');
    const body: ChatRequest = await req.json();
    const { message, conversationHistory, state, action } = body;
    console.log('[API] Action:', action, 'Message:', message?.substring(0, 50));

    let response = '';
    let newState = { ...state };
    let bibleContext = '';

    // Templates - no AI needed, just return the content directly
    if (action === 'start') {
      console.log('[API] Returning template for step 1');
      newState.currentStep = 1;
      response = await getStepMessage(1, true);
    } else if (action === 'next_step') {
      const nextStep = state.currentStep + 1;
      
      if (!state.completedSteps.includes(state.currentStep)) {
        newState.completedSteps.push(state.currentStep);
      }

      if (nextStep <= 5) {
        console.log('[API] Returning template for step', nextStep);
        newState.currentStep = nextStep;
        response = await getStepMessage(nextStep, true);
      } else {
        console.log('[API] Returning completion template');
        newState.journeyComplete = true;
        response = getCompletionMessage();
      }
    } else if (action === 'show_prayer') {
      console.log('[API] Returning prayer template');
      response = getPrayerGuidance();
      newState.hasAcceptedChrist = true;
    } else {
      // Use Mastra agent to handle user questions
      console.log('[API] Using Mastra agent for user question');
      
      const agent = mastra.getAgent('bibleAgent');
      
      try {
        const result = await agent.generate(message);
        response = result.text;
        
        console.log('[API] Mastra agent response length:', response.length);
      } catch (aiError) {
        console.error('[API] Mastra agent error:', aiError);
        throw aiError;
      }

      if (!state.userQuestions.includes(message)) {
        newState.userQuestions.push(message);
      }
    }

    return NextResponse.json({
      response,
      state: newState,
      bibleVerses: bibleContext ? bibleContext.split('\n\n').slice(0, 3) : [],
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
