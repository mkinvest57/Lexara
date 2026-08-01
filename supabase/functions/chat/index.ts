import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type Message = { role: 'user' | 'assistant'; content: string };

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      messages,
      targetLanguage = 'English',
      nativeLanguage = 'French',
    } = await req.json() as {
      messages: Message[];
      targetLanguage?: string;
      nativeLanguage?: string;
    };

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
        max_tokens: 1024,
        system: `You are Lynx, a friendly and encouraging language coach helping someone learn ${targetLanguage}.
Their native language is ${nativeLanguage}.
- Keep responses concise (2-4 sentences max)
- Gently correct mistakes inline without making the user feel bad
- Use examples from everyday life
- Occasionally include a word or short phrase in ${targetLanguage} with its translation in parentheses
- Always end with an encouraging note or a follow-up question to keep the conversation going`,
        messages: messages.slice(-20),
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json() as { content: { text: string }[] };
    const message = data.content[0]?.text?.trim() ?? '';

    return Response.json({ message }, { headers: corsHeaders });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500, headers: corsHeaders });
  }
});
