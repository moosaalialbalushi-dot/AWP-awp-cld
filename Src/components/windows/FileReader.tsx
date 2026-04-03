import React, { useState, useCallback, useRef } from 'react';
import {
  Upload, FileText, Image as ImageIcon, Table2, Loader2, CheckCircle2,
  AlertCircle, ChevronDown, ChevronUp, Inbox, Sparkles,
} from 'lucide-react';
import type { EntityType } from '@/types';

interface ParsedResult {
  id: string;
  fileName: string;
  module: string;
  summary: string;
  records: Record<string, unknown>[];
  imported: boolean;
  timestamp: string;
}

interface Props {
  onImport: (type: string, records: Record<string, unknown>[]) => void;
}

const MODULE_LABELS: Record<string, string> = {
  sales: 'Sales Orders',
  inventory: 'Inventory',
  production: 'Manufacturing',
  accounting: 'Accounting',
  hr: 'HR & Admin',
  procurement: 'Procurement',
  rd: 'R&D Lab',
  bd: 'Business Dev',
  samples: 'Samples',
  markets: 'Markets',
};

const MODULE_COLORS: Record<string, string> = {
  sales: 'text-green-400 bg-green-400/10 border-green-400/30',
  inventory: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  production: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
  accounting: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  hr: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
  procurement: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30',
  rd: 'text-pink-400 bg-pink-400/10 border-pink-400/30',
  bd: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
  samples: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/30',
  markets: 'text-teal-400 bg-teal-400/10 border-teal-400/30',
};

export const FileReader: React.FC<Props> = ({ onImport }) => {
  const [results, setResults] = useState<ParsedResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingFile, setProcessingFile] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new window.FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // strip data:...;base64, prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const readTextFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new window.FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const processFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    setProcessingFile(file.name);

    try {
      const isImage = file.type.startsWith('image/');
      const isPdf = file.type === 'application/pdf';
      const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv');
      const isText = file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.csv');

      let body: Record<string, unknown>;

      if (isImage || isPdf) {
        // Send as base64 for Gemini Vision
        const base64 = await fileToBase64(file);
        body = {
          content: base64,
          mimeType: file.type || (isPdf ? 'application/pdf' : 'image/jpeg'),
          fileName: file.name,
        };
      } else if (isExcel && !file.name.endsWith('.csv')) {
        // Parse XLSX with the xlsx library
        const { read, utils } = await import('xlsx');
        const buffer = await file.arrayBuffer();
        const wb = read(buffer);
        const sheets = wb.SheetNames.map(name => {
          const sheet = wb.Sheets[name];
          return `=== Sheet: ${name} ===\n` + utils.sheet_to_csv(sheet);
        }).join('\n\n');
        body = { textContent: sheets, fileName: file.name };
      } else if (isText) {
        const text = await readTextFile(file);
        body = { textContent: text.slice(0, 8000), fileName: file.name };
      } else {
        // Attempt as text
        try {
          const text = await readTextFile(file);
          body = { textContent: text.slice(0, 8000), fileName: file.name };
        } catch {
          throw new Error(`Unsupported file type: ${file.type || file.name}`);
        }
      }

      const res = await fetch('/api/ai-file-reader', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || `Server error ${res.status}`);
      }

      const data = await res.json();
      const result: ParsedResult = {
        id: `fr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        fileName: file.name,
        module: data.module || 'unknown',
        summary: data.summary || 'No summary available',
        records: data.records || [],
        imported: false,
        timestamp: new Date().toISOString(),
      };

      setResults(prev => [result, ...prev]);
      setExpandedId(result.id);
    } catch (err) {
      setResults(prev => [{
        id: `fr-${Date.now()}`,
        fileName: file.name,
        module: 'error',
        summary: `Error: ${err instanceof Error ? err.message : String(err)}`,
        records: [],
        imported: false,
        timestamp: new Date().toISOString(),
      }, ...prev]);
    } finally {
      setIsProcessing(false);
      setProcessingFile('');
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) processFile(files[0]);
  }, [processFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    if (inputRef.current) inputRef.current.value = '';
  }, [processFile]);

  const handleImport = useCallback((result: ParsedResult) => {
    if (result.records.length === 0 || result.module === 'error' || result.module === 'unknown') return;
    onImport(result.module, result.records);
    setResults(prev => prev.map(r => r.id === result.id ? { ...r, imported: true } : r));
  }, [onImport]);

  return (
    <div className="space-y-5 animate-fadeIn">
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        <Sparkles className="text-[#F4C430]" size={20}/> Universal AI File Reader
      </h2>
      <p className="text-sm text-slate-400">
        Drop any document — invoices, batch records, stock sheets, formulations — and AI will read, classify, and import data into the correct module.
      </p>

      {/* Drop Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center h-44 border-2 border-dashed rounded-2xl cursor-pointer transition-all
          ${dragOver ? 'border-[#D4AF37] bg-[#D4AF37]/10 scale-[1.01]' : 'border-white/10 hover:border-[#D4AF37]/40 hover:bg-white/5'}
          ${isProcessing ? 'pointer-events-none opacity-70' : ''}`}
      >
        {isProcessing ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-[#D4AF37]" size={32}/>
            <p className="text-[#D4AF37] text-sm font-bold">Analyzing {processingFile}…</p>
            <p className="text-slate-500 text-xs">AI is reading and classifying the document</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-3">
              <ImageIcon className="text-slate-500" size={22}/>
              <FileText className="text-slate-500" size={22}/>
              <Table2 className="text-slate-500" size={22}/>
            </div>
            <p className="text-white text-sm font-bold">Drop any file here</p>
            <p className="text-slate-500 text-xs">Images, PDF, Excel, CSV, text — AI reads everything</p>
            <div className="flex gap-2 mt-1">
              {['PNG', 'JPG', 'PDF', 'XLSX', 'CSV', 'TXT'].map(t => (
                <span key={t} className="text-[9px] text-slate-600 bg-slate-800 px-1.5 py-0.5 rounded">{t}</span>
              ))}
            </div>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={handleFileInput}
          accept=".png,.jpg,.jpeg,.gif,.webp,.pdf,.xlsx,.xls,.csv,.txt,.docx"
        />
      </div>

      {/* Results */}
      {results.length === 0 && !isProcessing && (
        <div className="flex flex-col items-center py-10 text-slate-600">
          <Inbox size={40} className="mb-3 opacity-30"/>
          <p className="text-sm">No files processed yet</p>
          <p className="text-xs mt-1">Upload a document to get started</p>
        </div>
      )}

      <div className="space-y-3">
        {results.map(result => {
          const isExpanded = expandedId === result.id;
          const isError = result.module === 'error';
          const colorClass = MODULE_COLORS[result.module] || 'text-slate-400 bg-slate-400/10 border-slate-400/30';

          return (
            <div key={result.id} className="bg-slate-900/50 border border-white/10 rounded-xl overflow-hidden">
              {/* Header */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : result.id)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-all text-left"
              >
                {isError ? (
                  <AlertCircle size={16} className="text-red-400 shrink-0"/>
                ) : result.imported ? (
                  <CheckCircle2 size={16} className="text-green-400 shrink-0"/>
                ) : (
                  <FileText size={16} className="text-[#D4AF37] shrink-0"/>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white text-sm font-bold truncate">{result.fileName}</span>
                    {!isError && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${colorClass}`}>
                        {MODULE_LABELS[result.module] || result.module}
                      </span>
                    )}
                    {result.records.length > 0 && (
                      <span className="text-[10px] text-slate-500">{result.records.length} record{result.records.length > 1 ? 's' : ''}</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{result.summary}</p>
                </div>
                {isExpanded ? <ChevronUp size={14} className="text-slate-500"/> : <ChevronDown size={14} className="text-slate-500"/>}
              </button>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="border-t border-white/5 px-4 py-3 space-y-3">
                  <p className="text-xs text-slate-400">{result.summary}</p>

                  {result.records.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-white/10">
                            {Object.keys(result.records[0]).slice(0, 8).map(key => (
                              <th key={key} className="text-left py-2 px-2 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                                {key}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {result.records.slice(0, 10).map((rec, i) => (
                            <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                              {Object.keys(result.records[0]).slice(0, 8).map(key => (
                                <td key={key} className="py-2 px-2 text-slate-300 max-w-[200px] truncate">
                                  {String(rec[key] ?? '-')}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {result.records.length > 10 && (
                        <p className="text-[10px] text-slate-600 mt-1">Showing 10 of {result.records.length} records</p>
                      )}
                    </div>
                  )}

                  {/* Import button */}
                  {!isError && result.records.length > 0 && (
                    <div className="flex justify-end">
                      {result.imported ? (
                        <span className="flex items-center gap-1.5 text-green-400 text-xs font-bold">
                          <CheckCircle2 size={14}/> Imported to {MODULE_LABELS[result.module]}
                        </span>
                      ) : (
                        <button
                          onClick={() => handleImport(result)}
                          className="erp-btn-gold text-xs px-4 py-2"
                        >
                          <Upload size={12}/> Import {result.records.length} record{result.records.length > 1 ? 's' : ''} → {MODULE_LABELS[result.module]}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
