/**
 * Word / sentence translation.
 *
 * Runs server-side so the upstream provider sees this app's IP rather than each
 * learner's, and so a paid provider can be swapped in later behind the same
 * contract without touching the client. No credentials are involved today.
 */

import { NextResponse } from 'next/server';
import { translateText } from '@yapro/core';

const MAX_TEXT_LENGTH = 500;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const text = url.searchParams.get('text')?.trim() ?? '';
  const target = url.searchParams.get('target')?.trim() || 'fr';
  const source = url.searchParams.get('source')?.trim() || 'en';

  if (!text) {
    return NextResponse.json({ error: 'text is required' }, { status: 400 });
  }
  if (text.length > MAX_TEXT_LENGTH) {
    return NextResponse.json({ error: 'text is too long' }, { status: 413 });
  }
  // Language codes are interpolated into an upstream URL, so only accept the
  // shapes we expect (`en`, `pt-BR`) rather than passing input through.
  if (!/^[a-z]{2,3}(-[A-Za-z]{2,4})?$/.test(target) || !/^[a-z]{2,3}(-[A-Za-z]{2,4})?$/.test(source)) {
    return NextResponse.json({ error: 'invalid language code' }, { status: 400 });
  }

  try {
    const result = await translateText(text, target, source);
    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=604800' },
    });
  } catch (error) {
    console.error('[translate] lookup failed', error);
    return NextResponse.json({ error: 'translation unavailable' }, { status: 502 });
  }
}
