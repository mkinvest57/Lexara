import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

type Message = { role: 'user' | 'assistant'; content: string };

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'AI not configured' }, { status: 503 });
  }

  const { messages, targetLanguage = 'English', nativeLanguage = 'French' } =
    (await request.json()) as {
      messages: Message[];
      targetLanguage?: string;
      nativeLanguage?: string;
    };

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: 'messages required' }, { status: 400 });
  }

  const client = new Anthropic();

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: `You are Lynx, a friendly and encouraging language coach helping someone learn ${targetLanguage}.
Their native language is ${nativeLanguage}.
- Keep responses concise (2-4 sentences max)
- Gently correct mistakes inline without making the user feel bad
- Use examples from everyday life
- Occasionally include a word or short phrase in ${targetLanguage} with its translation in parentheses
- Always end with an encouraging note or a follow-up question`,
      messages: messages.slice(-20),
    });

    const content = response.content[0];
    if (content.type !== 'text') throw new Error('unexpected response type');
    return NextResponse.json({ message: content.text.trim() });
  } catch (error) {
    console.error('[lynx-chat] failed', error);
    return NextResponse.json({ error: 'chat unavailable' }, { status: 502 });
  }
}
