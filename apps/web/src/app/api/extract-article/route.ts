/**
 * Web article extraction — server-side Readability.
 *
 * Fetching happens here so the browser is never the CORS origin and so we can
 * set a User-Agent that most news sites accept. The response is text-only
 * (HTML stripped): the client pastes it straight into the lesson content field.
 *
 * Security: `url` is validated as a real http(s) URL before we fetch it.
 * We never forward cookies or credentials, and the response is plain text.
 */

import { NextResponse } from 'next/server';
import { Readability } from '@mozilla/readability';
import { DOMParser } from 'linkedom';

const MAX_BYTES = 2 * 1024 * 1024; // 2 MiB — enough for any article
const TIMEOUT_MS = 10_000;

function isAllowedUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}

/** Strip HTML tags and collapse whitespace for plain lesson text. */
function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<p[^>]*>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export async function GET(request: Request) {
  const url = new URL(request.url).searchParams.get('url') ?? '';

  if (!url || !isAllowedUrl(url)) {
    return NextResponse.json({ error: 'invalid_url' }, { status: 400 });
  }

  let html: string;
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; YaproBot/1.0; +https://yapro.app/bot)',
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'en,fr;q=0.9',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `upstream_${res.status}` },
        { status: 502 }
      );
    }

    const ct = res.headers.get('content-type') ?? '';
    if (!ct.includes('html')) {
      return NextResponse.json({ error: 'not_html' }, { status: 415 });
    }

    const buf = await res.arrayBuffer();
    if (buf.byteLength > MAX_BYTES) {
      return NextResponse.json({ error: 'too_large' }, { status: 413 });
    }

    // Detect charset from meta tag; default utf-8
    const raw = new TextDecoder('utf-8', { fatal: false }).decode(buf);
    const charsetMatch = raw.match(/charset=["']?([\w-]+)/i);
    const charset = charsetMatch?.[1] ?? 'utf-8';
    html =
      charset.toLowerCase() === 'utf-8'
        ? raw
        : new TextDecoder(charset, { fatal: false }).decode(buf);
  } catch (err) {
    const name = (err as { name?: string }).name;
    const isTimeout = name === 'TimeoutError' || name === 'AbortError';
    return NextResponse.json(
      { error: isTimeout ? 'timeout' : 'fetch_failed' },
      { status: 502 }
    );
  }

  // Run Readability
  const doc = new DOMParser().parseFromString(html, 'text/html') as unknown as Document;
  const reader = new Readability(doc, { keepClasses: false });
  const article = reader.parse();

  if (!article || !article.textContent?.trim()) {
    return NextResponse.json({ error: 'parse_failed' }, { status: 422 });
  }

  const text = htmlToText(article.content ?? article.textContent);
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  return NextResponse.json(
    {
      title: article.title ?? '',
      text,
      wordCount,
      author: article.byline ?? null,
      siteName: article.siteName ?? null,
    },
    { headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400' } }
  );
}
