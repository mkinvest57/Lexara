import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'AI not configured' }, { status: 503 });
  }

  const { text, targetLanguage = 'English', level = 'beginner' } =
    (await request.json()) as {
      text: string;
      targetLanguage?: string;
      level?: 'beginner' | 'intermediate' | 'advanced';
    };

  if (!text?.trim()) {
    return NextResponse.json({ error: 'text required' }, { status: 400 });
  }

  const levelGuide: Record<string, string> = {
    beginner: 'Use only the 1000 most common words, very short sentences (under 12 words), present tense only.',
    intermediate: 'Use common vocabulary, clear sentences (under 20 words), avoid idioms.',
    advanced: 'Preserve the original style but clarify complex structures and rare vocabulary.',
  };

  const client = new Anthropic();

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      system: `You are a ${targetLanguage} language teacher simplifying texts for learners.
Level: ${level}. Rules: ${levelGuide[level] ?? levelGuide.beginner}
Return ONLY the simplified text, preserving paragraph breaks. Do not add commentary.`,
      messages: [{ role: 'user', content: text.slice(0, 4000) }],
    });

    const content = response.content[0];
    if (content.type !== 'text') throw new Error('unexpected response type');
    return NextResponse.json({ simplified: content.text.trim() });
  } catch (error) {
    console.error('[simplify] failed', error);
    return NextResponse.json({ error: 'simplification unavailable' }, { status: 502 });
  }
}
