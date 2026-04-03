// api/ai-proxy.ts
// Vercel Serverless Function — Gemini primary, OpenRouter auto-fallback.
//
// Set these in Vercel → Settings → Environment Variables:
//   GEMINI_API_KEY       → AIza...   (free tier: aistudio.google.com)
//   OPENROUTER_API_KEY   → sk-or-... (free models: openrouter.ai)
//   ANTHROPIC_API_KEY    → sk-ant-... (optional, if you have credits)

import type { VercelRequest, VercelResponse } from '@vercel/node';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

async function callGemini(
  model: string, system: string | undefined,
  messages: { role: string; content: string }[],
  jsonMode: boolean, maxTokens: number,
) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY not set in Vercel Environment Variables');

  const m = model.startsWith('gemini') ? model : 'gemini-2.0-flash';
  const contents = messages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));
  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      maxOutputTokens: maxTokens,
      ...(jsonMode ? { responseMimeType: 'application/json' } : {}),
    },
  };
  if (system) body.systemInstruction = { parts: [{ text: system }] };

  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${key}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) },
  );
  const data = await r.json();
  if (!r.ok) throw new Error(data?.error?.message ?? `Gemini HTTP ${r.status}`);
  return data;
}

async function callOpenRouter(
  model: string, system: string | undefined,
  messages: { role: string; content: string }[],
  maxTokens: number,
) {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error('OPENROUTER_API_KEY not set in Vercel Environment Variables');

  const msgs = system ? [{ role: 'system', content: system }, ...messages] : messages;
  const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
      'HTTP-Referer': 'https://awp-awp-cld.vercel.app',
      'X-Title': 'Al Wajer Pharma ERP',
    },
    body: JSON.stringify({ model, messages: msgs, max_tokens: maxTokens }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data?.error?.message ?? `OpenRouter HTTP ${r.status}`);
  return data;
}

async function callAnthropic(
  model: string, system: string | undefined,
  messages: { role: string; content: string }[],
  maxTokens: number,
) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY not set');
  const body: Record<string, unknown> = { model, max_tokens: maxTokens, messages };
  if (system) body.system = system;
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify(body),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data?.error?.message ?? `Anthropic HTTP ${r.status}`);
  return data;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { provider = 'gemini', model, system, messages, max_tokens = 2048, json_mode = false } = req.body ?? {};
  if (!messages?.length) return res.status(400).json({ error: 'Missing required field: messages' });

  try {
    // ── Gemini (primary) with auto-fallback to OpenRouter ────────────
    if (provider === 'gemini') {
      try {
        return res.status(200).json(await callGemini(model ?? 'gemini-2.0-flash', system, messages, json_mode, max_tokens));
      } catch (geminiErr) {
        console.warn('[ai-proxy] Gemini failed, falling back to OpenRouter:', (geminiErr as Error).message);
        try {
          const fb = 'meta-llama/llama-3.3-70b-instruct:free';
          const data = await callOpenRouter(fb, system, messages, max_tokens);
          return res.status(200).json({ ...data, _via: 'openrouter-fallback' });
        } catch (fbErr) {
          return res.status(500).json({
            error: `Gemini: ${(geminiErr as Error).message} | OpenRouter fallback: ${(fbErr as Error).message}`,
          });
        }
      }
    }

    // ── OpenRouter (explicit) ────────────────────────────────────────
    if (provider === 'openrouter') {
      const m = model ?? 'meta-llama/llama-3.3-70b-instruct:free';
      return res.status(200).json(await callOpenRouter(m, system, messages, max_tokens));
    }

    // ── Anthropic (optional, legacy) ─────────────────────────────────
    if (provider === 'anthropic' || provider === 'claude') {
      return res.status(200).json(await callAnthropic(model ?? 'claude-sonnet-4-6', system, messages, max_tokens));
    }

    return res.status(400).json({ error: `Unknown provider: "${provider}". Use: gemini, openrouter` });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[ai-proxy][${provider}]`, msg);
    return res.status(500).json({ error: msg });
  }
}
