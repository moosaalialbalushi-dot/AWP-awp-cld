import type { Batch, InventoryItem, Order, COOInsight, Expense, Employee } from '@/types';
import { callAIProxy, extractText } from './aiProxy';

const SYSTEM = `You are the Al Wajer Solo-ERP Brain. Ensure 100% operational accuracy at the 20 MT Sohar facility.

Rules:
1. Production: Cross-reference every batch against specs. Flag yield deviation >1% as critical.
2. Inventory: Trigger procurement at 20% safety stock.
3. Finance: Warn when liabilities exceed 30% of projected order revenue.
4. HR: Monitor staffing for critical production runs.
5. Tone: Luxury, high-precision.

Respond in JSON for data updates; concise professional messages for alerts.`;

export async function analyzeOperations(
  batches: Batch[], inventory: InventoryItem[], orders: Order[],
  expenses: Expense[] = [], employees: Employee[] = []
): Promise<COOInsight[]> {
  const prompt = `Current State:
Batches: ${JSON.stringify(batches)}
Inventory: ${JSON.stringify(inventory)}
Orders: ${JSON.stringify(orders)}
Expenses: ${JSON.stringify(expenses)}
Employees: ${JSON.stringify(employees)}

Provide 3-5 operational insights covering production, finance, and staffing risks.
JSON format: Array<{ type: string, message: string, severity: 'info'|'warning'|'critical', actionTaken?: string }>`;

  try {
    const response = await callAIProxy({
      provider: 'gemini', model: 'gemini-2.0-flash',
      system: SYSTEM, messages: [{ role: 'user', content: prompt }], json_mode: true,
    });
    const text = extractText(response, 'gemini') || '[]';
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error('Gemini insight error:', e);
    return [];
  }
}

export async function quickInsight(summary: string): Promise<string> {
  try {
    const response = await callAIProxy({
      provider: 'gemini', model: 'gemini-2.0-flash',
      system: 'You are a fast ERP assistant. Be brief and actionable.',
      messages: [{ role: 'user', content: `Quickly summarize status: ${summary}` }],
    });
    return extractText(response, 'gemini') || 'Status normal.';
  } catch {
    return 'System operational.';
  }
}

export async function chatWithCOO(message: string, history: { role: string; text: string }[]): Promise<string> {
  const messages = [
    ...history.map(h => ({ role: h.role === 'user' ? 'user' as const : 'assistant' as const, content: h.text })),
    { role: 'user' as const, content: message },
  ];
  try {
    const response = await callAIProxy({
      provider: 'gemini', model: 'gemini-2.0-flash',
      system: SYSTEM, messages,
    });
    return extractText(response, 'gemini') || 'No response.';
  } catch (e) {
    return `Error: ${String(e)}`;
  }
}

export async function optimizeFormulation(rdData: unknown): Promise<string> {
  try {
    const response = await callAIProxy({
      provider: 'gemini', model: 'gemini-2.5-pro',
      system: SYSTEM,
      messages: [{
        role: 'user',
        content: `Analyze and optimize this pharmaceutical formulation:\n${JSON.stringify(rdData, null, 2)}\n\nProvide:\n1. Optimization recommendations\n2. Cost reduction opportunities\n3. Quality improvements\n4. Regulatory considerations`,
      }],
    });
    return extractText(response, 'gemini') || 'No optimization data.';
  } catch (e) {
    return `Optimization failed: ${String(e)}`;
  }
}

export async function brainstormSession(topic: string, context: string): Promise<string> {
  try {
    const response = await callAIProxy({
      provider: 'gemini', model: 'gemini-2.5-pro',
      system: 'You are an expert pharmaceutical R&D and business strategist.',
      messages: [{
        role: 'user',
        content: `Brainstorm on: ${topic}\n\nContext: ${context}\n\nProvide innovative ideas, strategies, and actionable insights.`,
      }],
    });
    return extractText(response, 'gemini') || 'No ideas generated.';
  } catch (e) {
    return `Brainstorm failed: ${String(e)}`;
  }
}
