import { NextRequest, NextResponse } from 'next/server';
import { getVerse } from '@/lib/bible/verse-lookup';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get('reference');
    
    if (!reference) {
      return NextResponse.json(
        { error: 'Reference parameter is required' },
        { status: 400 }
      );
    }
    
    const verse = getVerse(reference);
    
    if (!verse) {
      return NextResponse.json(
        { error: 'Verse not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(verse);
  } catch (error) {
    console.error('Error fetching verse:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
