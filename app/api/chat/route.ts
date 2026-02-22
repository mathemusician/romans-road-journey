import { NextRequest, NextResponse } from 'next/server';
import {
  generateAgentResponse,
  searchBibleVerses,
  searchByTopic,
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
      // ONLY use AI for user questions - not templates!
      
      // Step 1: Call AI ONCE to generate 3 arrays of search terms
      let keywordTerms: string[] = [];
      let semanticTerms: string[] = [];
      let biblicalTerms: string[] = [];
      
      try {
        const searchTermsPrompt = `Given the query "${message}", generate 3 arrays of search terms to find relevant Bible verses:

1. KEYWORD TERMS: Exact words/phrases from the query
2. SEMANTIC TERMS: Conceptually related modern terms
3. BIBLICAL TERMS: Biblical language equivalents

Examples:
Query: "monsters"
{
  "keyword": ["monster", "monsters"],
  "semantic": ["creature", "beast", "evil being"],
  "biblical": ["leviathan", "behemoth", "dragon", "serpent", "beast"]
}

Query: "money"
{
  "keyword": ["money"],
  "semantic": ["wealth", "finances", "riches"],
  "biblical": ["mammon", "treasure", "silver", "gold"]
}

Return ONLY a JSON object with these 3 arrays, nothing else.`;
        
        const termsResponse = await generateAgentResponse(
          [{ role: 'user', content: searchTermsPrompt }],
          ''
        );
        
        // Parse AI response to get 3 arrays
        try {
          const match = termsResponse.match(/\{[\s\S]*\}/);
          if (match) {
            const parsed = JSON.parse(match[0]);
            keywordTerms = parsed.keyword || [];
            semanticTerms = parsed.semantic || [];
            biblicalTerms = parsed.biblical || [];
            console.log('[API] AI generated search terms:', { keywordTerms, semanticTerms, biblicalTerms });
          }
        } catch (parseError) {
          console.error('[API] Failed to parse AI search terms response');
        }
      } catch (aiError) {
        console.error('[API] AI search term generation failed:', aiError);
      }
      
      // Step 2: Run 3 PARALLEL searches with the 3 arrays (comprehensive: 20 verses with context)
      try {
        const searchResults = await searchBibleVerses(message, 20, keywordTerms, semanticTerms, biblicalTerms);
        console.log('[API] RAG search returned', searchResults.length, 'verses');
        
        if (searchResults.length > 0) {
          bibleContext = `RELEVANT BIBLE VERSES FOR "${message}":\n\n`;
          bibleContext += searchResults
            .map((v, i) => `${i + 1}. ${v.reference}: "${v.text}"`)
            .join('\n\n');
        } else {
          bibleContext = `No specific verses found for "${message}". Please use the general biblical knowledge to answer.`;
        }
      } catch (ragError) {
        console.error('[API] RAG search error:', ragError);
        bibleContext = `Error searching Bible verses. Please try again.`;
      }

      const currentStepInfo = state.currentStep > 0 
        ? getRomansRoadStep(state.currentStep) 
        : null;

      if (currentStepInfo) {
        bibleContext += `\n\n---\nCURRENT ROMANS ROAD STEP (Step ${state.currentStep}/5):\n${currentStepInfo.verse}: "${currentStepInfo.text}"\n\nExplanation: ${currentStepInfo.explanation}`;
      }

      if (state.completedSteps.length > 0) {
        bibleContext += `\n\n---\nCOMPLETED STEPS: ${state.completedSteps.join(', ')}`;
      }

      console.log('[API] Calling AI with context length:', bibleContext.length);
      try {
        response = await generateAgentResponse(
          conversationHistory,
          bibleContext
        );
        console.log('[API] AI response received, length:', response.length);
      } catch (aiError) {
        console.error('[API] AI generation error:', aiError);
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
