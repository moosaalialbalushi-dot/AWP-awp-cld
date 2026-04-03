export interface AIMessage { role: 'user' | 'assistant'; content: string; }

export interface AIProxyRequest {
  provider: 'gemini' | 'claude' | 'openrouter';
  model: string;
  system?: string;
  messages: AIMessage[];
  json_mode?: boolean;
  max_tokens?: number;
}

export function extractText(response: unknown, provider: string): string {
  try {
    const r = response as Record<string, unknown>;
    if (provider === 'gemini') {
      const candidates = r.candidates as { content: { parts: { text: string }[] } }[];
      return candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    }
    if (provider === 'claude') {
      const content = r.content as { text: string }[];
      return content?.[0]?.text ?? '';
    }
    if (provider === 'openrouter') {
      const choices = r.choices as { message: { content: string } }[];
      return choices?.[0]?.message?.content ?? '';
    }
  } catch {/* swallow */}
  return '';
}

export async function callAIProxy(req: AIProxyRequest): Promise<unknown> {
  const res = await fetch('/api/ai-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`AI proxy error: ${res.status}`);
  return res.json();
}
