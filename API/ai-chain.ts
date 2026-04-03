// api/ai-chain.ts
// Triple-LLM validation chain — runs entirely server-side.
// Chain: Gemini (Initiator) → Claude (Validator) → DeepSeek R1 (Final Validator)
//
// Required Vercel env vars (same as ai-proxy.ts):
//   ANTHROPIC_API_KEY, GEMINI_API_KEY, DEEPSEEK_API_KEY

import type { VercelRequest, VercelResponse } from '@vercel/node';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// ── Shared helpers ────────────────────────────────────────────────

async function callGemini(key: string, system: string, userMsg: string, model = 'gemini-2.0-flash'): Promise<string> {
  const body: Record<string, unknown> = {
    contents: [{ role: 'user', parts: [{ text: userMsg }] }],
    systemInstruction: { parts: [{ text: system }] },
  };
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message ?? JSON.stringify(data));
  return data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text ?? '').join('') ?? '';
}

async function callClaude(key: string, system: string, userMsg: string, model = 'claude-sonnet-4-6'): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model, max_tokens: 2048, system, messages: [{ role: 'user', content: userMsg }] }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message ?? JSON.stringify(data));
  return (data?.content as { type: string; text?: string }[])?.filter(b => b.type === 'text').map(b => b.text ?? '').join('\n') ?? '';
}

async function callDeepSeek(key: string, system: string, userMsg: string, model = 'deepseek-reasoner'): Promise<string> {
  const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      max_tokens: 2048,
      messages: [{ role: 'system', content: system }, { role: 'user', content: userMsg }],
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message ?? JSON.stringify(data));
  return data?.choices?.[0]?.message?.content ?? '';
}

// ── Main handler ──────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { query, context = '', domain = 'pharma' } = req.body ?? {};
  if (!query) return res.status(400).json({ error: 'Missing required field: query' });

  const geminiKey   = process.env.GEMINI_API_KEY;
  const claudeKey   = process.env.ANTHROPIC_API_KEY;
  const deepseekKey = process.env.DEEPSEEK_API_KEY;

  if (!geminiKey || !claudeKey || !deepseekKey) {
    const missing = [!geminiKey && 'GEMINI_API_KEY', !claudeKey && 'ANTHROPIC_API_KEY', !deepseekKey && 'DEEPSEEK_API_KEY'].filter(Boolean);
    return res.status(500).json({ error: `Missing Vercel env vars: ${missing.join(', ')}. Add them in Vercel → Settings → Environment Variables → Redeploy.` });
  }

  const domainContext = domain === 'pharma'
    ? 'Al Wajar Pharmaceuticals, Sohar Oman — specialises in pharmaceutical manufacturing (tablets, pellets, capsules). GMP compliant, exports to GCC/MENA. Key products: Esomeprazole, Pantoprazole, Omeprazole EC pellets.'
    : `Business context: ${domain}`;

  const contextBlock = context ? `\n\nAdditional context:\n${context}` : '';

  try {
    // ── STEP 1: Gemini initiates ──────────────────────────────────
    const initiatorSystem = `You are the Al Wajar Pharmaceuticals AI Initiator.
Context: ${domainContext}${contextBlock}

Your role is to generate a thorough first-draft response to the user's query.
Be comprehensive. Cover all relevant angles. Use specific numbers and facts where possible.
Structure your response clearly with headers where appropriate.`;

    const initiatorResponse = await callGemini(geminiKey, initiatorSystem, query);

    // ── STEP 2: Claude validates ──────────────────────────────────
    const validatorSystem = `You are the Al Wajar Pharmaceuticals Quality Validator AI.
Context: ${domainContext}

Your role is to critically review a first-draft AI response and validate it.
Check for:
1. Factual accuracy and logical consistency
2. Pharmaceutical/GMP compliance issues
3. Missing critical information
4. Any incorrect numbers, dates, or claims
5. Whether the answer fully addresses the original query

Be specific. Quote the parts you are correcting or endorsing. 
Output format:
VERDICT: [APPROVED / APPROVED WITH CORRECTIONS / REJECTED]
CORRECTIONS: [list any corrections, or "None required"]
ADDITIONS: [any important missing information]
VALIDATED RESPONSE: [the improved full response]`;

    const validationInput = `Original query: ${query}\n\nFirst-draft response to validate:\n\n${initiatorResponse}`;
    const validatorResponse = await callClaude(claudeKey, validatorSystem, validationInput);

    // ── STEP 3: DeepSeek R1 final confirmation ────────────────────
    const finalSystem = `You are the Al Wajar Pharmaceuticals Final Verification AI.
Context: ${domainContext}

You have received a query, a first-draft AI response, and a validator's critique.
Your role is to produce the definitive final answer.

Think step by step through all three inputs. Resolve any conflicts. 
Produce a clear, authoritative final response that the business can act on.

Output format:
REASONING: [brief chain-of-thought — why you chose this final answer]
CONSENSUS: [did all 3 AIs substantially agree? yes/partial/no]
FINAL ANSWER: [the definitive response]`;

    const finalInput = `Original query: ${query}

--- INITIATOR RESPONSE (Gemini 2.0 Flash) ---
${initiatorResponse}

--- VALIDATOR CRITIQUE (Claude Sonnet) ---
${validatorResponse}

Produce the definitive final answer.`;

    const finalResponse = await callDeepSeek(deepseekKey, finalSystem, finalInput);

    return res.status(200).json({
      query,
      chain: {
        initiator:      { provider: 'Gemini 2.0 Flash',   model: 'gemini-2.0-flash',  response: initiatorResponse },
        validator:      { provider: 'Claude Sonnet 4.6',  model: 'claude-sonnet-4-6', response: validatorResponse },
        finalValidator: { provider: 'DeepSeek R1',        model: 'deepseek-reasoner', response: finalResponse },
      },
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[ai-chain]', message);
    return res.status(500).json({ error: message });
  }
}
