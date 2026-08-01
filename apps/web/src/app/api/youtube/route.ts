import { NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Missing YouTube URL' }, { status: 400 });
  }

  try {
    const transcript = await YoutubeTranscript.fetchTranscript(url, { lang: 'en' });
    const text = transcript.map((t) => t.text).join(' ');
    
    return NextResponse.json({ text });
  } catch (error) {
    console.error('Failed to fetch YouTube transcript:', error);
    return NextResponse.json(
      { error: 'Could not fetch transcript. Make sure the video has captions enabled.' },
      { status: 500 }
    );
  }
}
