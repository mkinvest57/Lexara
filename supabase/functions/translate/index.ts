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
    const { text, sourceLang = 'en', targetLang = 'fr' } = await req.json() as {
      text: string;
      sourceLang?: string;
      targetLang?: string;
    };

    if (!text?.trim()) {
      return Response.json({ translation: '' }, { headers: corsHeaders });
    }

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'AI not configured' }, { status: 503, headers: corsHeaders });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        system: `You are a precise language translator. Translate the given text from ${sourceLang} to ${targetLang}. Return ONLY the translation, no explanations or alternatives.`,
        messages: [{ role: 'user', content: text.slice(0, 2000) }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json() as { content: { text: string }[] };
    const translation = data.content[0]?.text?.trim() ?? text;

    return Response.json({ translation }, { headers: corsHeaders });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500, headers: corsHeaders });
  }
});
