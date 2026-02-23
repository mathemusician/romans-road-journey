import { NextRequest, NextResponse } from 'next/server';
import { getVerseRange } from '@/lib/bible/verse-lookup';

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
    
    const verses = getVerseRange(reference);
    
    if (verses.length === 0) {
      return NextResponse.json(
        { error: 'Verses not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(verses);
  } catch (error) {
    console.error('Error fetching verse range:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
