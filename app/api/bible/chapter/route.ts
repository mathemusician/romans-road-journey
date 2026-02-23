import { NextRequest, NextResponse } from 'next/server';
import { getChapter } from '@/lib/bible/verse-lookup';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const book = searchParams.get('book');
    const chapterStr = searchParams.get('chapter');
    
    if (!book || !chapterStr) {
      return NextResponse.json(
        { error: 'Book and chapter parameters are required' },
        { status: 400 }
      );
    }
    
    const chapter = parseInt(chapterStr, 10);
    if (isNaN(chapter)) {
      return NextResponse.json(
        { error: 'Invalid chapter number' },
        { status: 400 }
      );
    }
    
    const verses = getChapter(book, chapter);
    
    if (verses.length === 0) {
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(verses);
  } catch (error) {
    console.error('Error fetching chapter:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
