'use client';

import { getSupabase, isSupabaseConfigured } from './supabase';

type Message = { role: 'user' | 'assistant'; content: string };

async function invokeFunction<T>(name: string, body: Record<string, unknown>): Promise<T> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.functions.invoke<T>(name, { body });
  if (error) throw error;
  return data as T;
}

export function isAiAvailable(): boolean {
  return isSupabaseConfigured();
}

export async function aiTranslate(
  text: string,
  sourceLang = 'en',
  targetLang = 'fr',
): Promise<string> {
  const result = await invokeFunction<{ translation: string }>('translate', {
    text,
    sourceLang,
    targetLang,
  });
  return result.translation;
}

export async function lynxChat(
  messages: Message[],
  targetLanguage = 'English',
  nativeLanguage = 'French',
): Promise<string> {
  const result = await invokeFunction<{ message: string }>('chat', {
    messages,
    targetLanguage,
    nativeLanguage,
  });
  return result.message;
}

export async function aiSimplify(
  text: string,
  targetLanguage = 'English',
  level: 'beginner' | 'intermediate' | 'advanced' = 'beginner',
): Promise<string> {
  const result = await invokeFunction<{ simplified: string }>('simplify', {
    text,
    targetLanguage,
    level,
  });
  return result.simplified;
}
