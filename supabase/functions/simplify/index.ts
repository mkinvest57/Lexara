import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      text,
      targetLanguage = 'English',
      level = 'beginner',
    } = await req.json() as {
      text: string;
      targetLanguage?: string;
      level?: 'beginner' | 'intermediate' | 'advanced';
    };

    if (!text?.trim()) {
      return Response.json({ simplified: '' }, { headers: corsHeaders });
    }

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'AI not configured' }, { status: 503, headers: corsHeaders });
    }

    const levelGuide = {
      beginner: 'Use only the 1000 most common words, very short sentences (under 12 words), present tense only.',
      intermediate: 'Use common vocabulary, clear sentences (under 20 words), avoid idioms.',
      advanced: 'Preserve the original style but clarify complex structures and rare vocabulary.',
    };

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2048,
        system: `You are a ${targetLanguage} language teacher simplifying texts for learners.
Level: ${level}. Rules: ${levelGuide[level]}
Return ONLY the simplified text, preserving paragraph breaks. Do not add commentary.`,
        messages: [{ role: 'user', content: text.slice(0, 4000) }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json() as { content: { text: string }[] };
    const simplified = data.content[0]?.text?.trim() ?? text;

    return Response.json({ simplified }, { headers: corsHeaders });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500, headers: corsHeaders });
  }
});
