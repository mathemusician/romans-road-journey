import { NextRequest, NextResponse } from 'next/server';
import {
  generateAgentResponse,
  searchBibleVerses,
  getRomansRoadStep,
  getStepMessage,
  getWelcomeMessage,
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
    const body: ChatRequest = await req.json();
    const { message, conversationHistory, state, action } = body;

    let response = '';
    let newState = { ...state };
    let bibleContext = '';

    if (action === 'start') {
      newState.currentStep = 1;
      response = await getStepMessage(1, true);
    } else if (action === 'next_step') {
      const nextStep = state.currentStep + 1;
      
      if (!state.completedSteps.includes(state.currentStep)) {
        newState.completedSteps.push(state.currentStep);
      }

      if (nextStep <= 5) {
        newState.currentStep = nextStep;
        response = await getStepMessage(nextStep, true);
      } else {
        newState.journeyComplete = true;
        response = getCompletionMessage();
      }
    } else if (action === 'show_prayer') {
      response = getPrayerGuidance();
      newState.hasAcceptedChrist = true;
    } else {
      // Perform parallel RAG searches for comprehensive Bible context
      const searchResults = await searchBibleVerses(message, 8);
      
      if (searchResults.length > 0) {
        bibleContext = `RELEVANT BIBLE VERSES FOR "${message}":\n\n`;
        bibleContext += searchResults
          .map((v, i) => `${i + 1}. ${v.reference}: "${v.text}"`)
          .join('\n\n');
      }

      const currentStepInfo = state.currentStep > 0 
        ? getRomansRoadStep(state.currentStep) 
        : null;

      if (currentStepInfo) {
        bibleContext += `\n\n---\nCURRENT ROMANS ROAD STEP (Step ${state.currentStep}/5):\n${currentStepInfo.verse}: "${currentStepInfo.text}"\n\nExplanation: ${currentStepInfo.explanation}`;
      }

      // Add conversation context summary
      if (state.completedSteps.length > 0) {
        bibleContext += `\n\n---\nCOMPLETED STEPS: ${state.completedSteps.join(', ')}`;
      }

      response = await generateAgentResponse(
        conversationHistory,
        bibleContext
      );

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
