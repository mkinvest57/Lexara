/**
 * YouTube transcript extraction.
 *
 * Attempts captions in (1) the requested language, (2) English, (3) any
 * available language — so the learner still gets text even when the video
 * has only auto-generated captions in a different language.
 * Video title is fetched from the oEmbed endpoint (no API key required).
 */

import { NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';

const OEMBED = 'https://www.youtube.com/oembed?format=json&url=';
const TIMEOUT_MS = 15_000;

function extractVideoId(input: string): string | null {
  try {
    const u = new URL(input);
    if (u.hostname === 'youtu.be') return u.pathname.slice(1).split(/[?#]/)[0] ?? null;
    const v = u.searchParams.get('v');
    if (v) return v;
    const match = u.pathname.match(/\/embed\/([^/?#]+)/);
    if (match) return match[1] ?? null;
  } catch {
    // fall through
  }
  // bare video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(input.trim())) return input.trim();
  return null;
}

function cleanText(segments: { text: string }[]): string {
  return segments
    .map((s) => s.text.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join(' ')
    .replace(/ {2,}/g, ' ')
    .trim();
}

async function fetchTitle(url: string): Promise<string | null> {
  try {
    const res = await fetch(`${OEMBED}${encodeURIComponent(url)}`, {
      signal: AbortSignal.timeout(5_000),
      cache: 'force-cache',
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { title?: string };
    return data.title ?? null;
  } catch {
    return null;
  }
}

async function fetchTranscript(
  videoId: string,
  preferredLang: string
): Promise<{ text: string; lang: string } | null> {
  const candidates =
    preferredLang && preferredLang !== 'en'
      ? [preferredLang, 'en']
      : ['en'];

  for (const lang of candidates) {
    try {
      const segments = await YoutubeTranscript.fetchTranscript(videoId, { lang });
      if (segments.length > 0) return { text: cleanText(segments), lang };
    } catch {
      // try next language
    }
  }

  // Last resort: no language filter — YouTube picks whatever is available
  try {
    const segments = await YoutubeTranscript.fetchTranscript(videoId);
    if (segments.length > 0) return { text: cleanText(segments), lang: 'auto' };
  } catch {
    // nothing works
  }

  return null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get('url') ?? '';
  const lang = (searchParams.get('lang') ?? 'en').slice(0, 10);

  const videoId = extractVideoId(raw);
  if (!videoId) {
    return NextResponse.json({ error: 'invalid_url' }, { status: 400 });
  }

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

  const [transcriptResult, title] = await Promise.allSettled([
    Promise.race([
      fetchTranscript(videoId, lang),
      new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), TIMEOUT_MS)
      ),
    ]),
    fetchTitle(videoUrl),
  ]);

  if (
    transcriptResult.status === 'rejected' ||
    transcriptResult.value === null
  ) {
    return NextResponse.json(
      {
        error: 'no_transcript',
        hint: 'Cette vidéo ne dispose pas de sous-titres accessibles. Activez les sous-titres automatiques YouTube et réessayez.',
      },
      { status: 422 }
    );
  }

  const { text, lang: detectedLang } = transcriptResult.value;
  const videoTitle = title.status === 'fulfilled' ? title.value : null;

  return NextResponse.json(
    {
      text,
      title: videoTitle,
      videoId,
      lang: detectedLang,
      wordCount: text.split(/\s+/).filter(Boolean).length,
    },
    { headers: { 'Cache-Control': 'public, max-age=1800, s-maxage=7200' } }
  );
}
