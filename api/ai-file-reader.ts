// api/ai-file-reader.ts
// Vercel Serverless Function — Universal AI File Reader
// Accepts base64-encoded files (images, text) and uses Gemini Vision
// to extract structured ERP data and classify the document type.

import type { VercelRequest, VercelResponse } from '@vercel/node';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const SYSTEM_PROMPT = `You are the Al Wajer Pharmaceutical ERP intelligent document processor.

Your job: Given a document (image, PDF text, spreadsheet data, etc.), do TWO things:

1. **CLASSIFY** the document into exactly ONE ERP module:
   - "sales" → Sales orders, invoices, customer POs, LC documents, shipping docs
   - "inventory" → Stock lists, material receipts, warehouse reports
   - "production" → Batch records, manufacturing logs, yield reports
   - "accounting" → Expense receipts, bills, payment vouchers, bank statements
   - "hr" → Employee records, contracts, attendance, payroll
   - "procurement" → Purchase orders, vendor invoices, supplier quotations
   - "rd" → Formulation sheets, stability data, lab results, CoA
   - "bd" → Market research, lead lists, opportunity reports
   - "samples" → Sample dispatch notes, tracking info, destination lists
   - "markets" → Market registration docs, country approvals

2. **EXTRACT** structured data as a JSON array of records matching the module's fields.

## Field schemas per module:

**sales**: { sNo, date, invoiceNo, customer, lcNo, country, product, quantity, rateUSD, amountUSD, amountOMR, status, paymentTerms, remarks, shippingMethod }
**inventory**: { sNo, name, category (API|Excipient|Packing|Finished|R&D|Spare|Other), requiredForOrders, stock, unit, safetyStock }
**production**: { product, quantity, actualYield, expectedYield, status (In-Progress|Completed|Quarantine|Scheduled), timestamp }
**accounting**: { description, category (Utilities|Salaries|Maintenance|Logistics|Raw Materials), amount, status (Paid|Pending), dueDate }
**hr**: { name, role, department (Production|QC|Sales|Admin|R&D), salary, status (Active|On Leave|Terminated), joinDate }
**procurement**: { name, category (API|Excipient|Packing|Equipment), rating, status (Verified|Audit Pending|Blacklisted), country }
**rd**: { title, productCode, dosageForm, strength, therapeuticCategory, status (Formulation|Stability|Bioequivalence|Clinical|Optimizing|Approved), ingredients: [{ name, quantity, unit, rateUSD, role }] }
**bd**: { targetMarket, opportunity, potentialValue, status (Prospecting|Negotiation|Contracting|Closed), probability }
**samples**: { product, destination, quantity, status (Requested|Production|QC Testing|Dispatched|Arrived), trackingNumber }
**markets**: { name, region, status (Active|Pending|Exit) }

## Rules:
- Extract ALL records visible in the document
- Use reasonable defaults when a field is unclear (e.g. status="Pending")
- For numbers, convert from any currency/format to plain numbers
- For dates, use YYYY-MM-DD format
- If only partial data is visible, still extract what you can
- balanceToPurchase = requiredForOrders - stock (auto-calculate)

## Response format (strict JSON):
{
  "module": "sales",
  "summary": "2 sales orders from Pakistan for Esomeprazole",
  "records": [ { ... }, { ... } ]
}`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  Object.entries(CORS).forEach(([k, v]) => res.setHeader(k, v));
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { content, mimeType, fileName, textContent } = req.body ?? {};
  if (!content && !textContent) {
    return res.status(400).json({ error: 'Missing content (base64) or textContent' });
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(500).json({ error: 'GEMINI_API_KEY not set in Vercel environment.' });

  try {
    const parts: Record<string, unknown>[] = [];

    // If we have base64 image/PDF content, use Gemini's vision
    if (content && mimeType) {
      parts.push({
        inlineData: { mimeType, data: content },
      });
      parts.push({
        text: `Analyze this document (${fileName || 'uploaded file'}). Extract ALL data and classify into the correct ERP module. Return strict JSON only.`,
      });
    } else if (textContent) {
      // Text-based content (CSV, XLSX parsed, plain text)
      parts.push({
        text: `Analyze this document data (${fileName || 'uploaded file'}):\n\n${textContent}\n\nExtract ALL data and classify into the correct ERP module. Return strict JSON only.`,
      });
    }

    const body = {
      contents: [{ role: 'user', parts }],
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      generationConfig: { responseMimeType: 'application/json' },
    };

    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) },
    );

    const data = await upstream.json();
    if (!upstream.ok) throw new Error(data?.error?.message ?? JSON.stringify(data));

    // Extract the JSON text from Gemini's response
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { module: 'unknown', summary: text, records: [] };
    }

    return res.status(200).json(parsed);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[ai-file-reader]', message);
    return res.status(500).json({ error: message });
  }
}
