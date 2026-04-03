import React, { useState } from 'react';
import { DraftingCompass, Upload, Loader2, FileText, Wand2, Image as ImageIcon } from 'lucide-react';

interface AnalysisResult {
  fileName: string;
  analysis: string;
  timestamp: string;
}

interface Props {
  onAnalyzeFile: (file: File) => Promise<string>;
}

export const IndustrialStudio: React.FC<Props> = ({ onAnalyzeFile }) => {
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsLoading(true);
    try {
      const analysis = await onAnalyzeFile(file);
      setResults(prev => [{
        fileName: file.name,
        analysis,
        timestamp: new Date().toISOString(),
      }, ...prev]);
    } catch (err) {
      setResults(prev => [{
        fileName: file.name,
        analysis: `Error analyzing file: ${String(err)}`,
        timestamp: new Date().toISOString(),
      }, ...prev]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const { callAIProxy, extractText } = await import('@/services/aiProxy');
      const res = await callAIProxy({
        provider: 'gemini',
        model: 'gemini-2.0-flash',
        system: 'You are an industrial pharmaceutical production expert. Help with process design, equipment selection, capacity planning, and GMP compliance.',
        messages: [{ role: 'user', content: prompt }],
      });
      setAiResponse(extractText(res, 'gemini') || 'No response.');
    } catch (e) {
      setAiResponse(`Error: ${String(e)}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        <DraftingCompass className="text-[#F4C430]" size={20}/> Industrial Studio
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* File Analysis */}
        <div className="bg-slate-900/50 border border-[#D4AF37]/30 rounded-xl p-5 gold-glow space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText size={15} className="text-[#D4AF37]"/> Document Analyzer
          </h3>
          <p className="text-xs text-slate-500">Upload pharmaceutical documents, CoA, batch records, or technical specs for AI analysis.</p>
          <label className={`flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all ${isLoading ? 'border-[#D4AF37]/30 bg-[#D4AF37]/5' : 'border-white/10 hover:border-[#D4AF37]/40 hover:bg-white/5'}`}>
            {isLoading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="animate-spin text-[#D4AF37]" size={24}/>
                <p className="text-[#D4AF37] text-xs">Analyzing…</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="text-slate-500" size={24}/>
                <p className="text-slate-500 text-xs">Drop file here or click to upload</p>
                <p className="text-slate-600 text-[10px]">PDF, DOCX, XLSX, images</p>
              </div>
            )}
            <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.docx,.xlsx,.csv,.txt,.png,.jpg,.jpeg"/>
          </label>

          {results.length > 0 && (
            <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
              {results.map((r, i) => (
                <div key={i} className="bg-slate-950/50 border border-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText size={12} className="text-[#D4AF37]"/>
                    <span className="text-[10px] text-slate-400 font-mono">{r.fileName}</span>
                    <span className="text-[9px] text-slate-600 ml-auto">{new Date(r.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">{r.analysis}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Industrial AI Query */}
        <div className="bg-slate-900/50 border border-[#D4AF37]/30 rounded-xl p-5 gold-glow space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Wand2 size={15} className="text-[#D4AF37]"/> Industrial AI Query
          </h3>
          <textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Ask about equipment specifications, capacity planning, process flow, GMP requirements, batch record design…"
            rows={5}
            className="w-full bg-slate-800/50 border border-white/10 text-white rounded-xl px-3 py-2.5 text-sm focus:border-[#D4AF37]/50 focus:outline-none resize-none custom-scrollbar"
          />
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="erp-btn-gold w-full justify-center py-2.5 disabled:opacity-50"
          >
            {isGenerating ? <Loader2 size={14} className="animate-spin"/> : <Wand2 size={14}/>}
            {isGenerating ? 'Generating…' : 'Generate'}
          </button>

          {aiResponse && (
            <div className="bg-slate-950/50 border border-white/5 rounded-xl p-4 max-h-64 overflow-y-auto custom-scrollbar">
              <p className="text-[10px] text-[#D4AF37] font-bold uppercase mb-2">AI Response</p>
              <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{aiResponse}</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick tools */}
      <div className="bg-slate-900/50 border border-[#D4AF37]/20 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white mb-4">Industrial Quick Tools</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: '📐 Process Flow Design', desc: 'AI-generated PFDs' },
            { label: '⚙️ Equipment Selection', desc: 'Spec recommendations' },
            { label: '📋 Batch Record Template', desc: 'GMP-compliant templates' },
            { label: '🔬 CoA Analysis', desc: 'Certificate analysis' },
          ].map(t => (
            <button
              key={t.label}
              onClick={() => setPrompt(`Help me with: ${t.label} for a pharmaceutical manufacturing facility`)}
              className="p-3 bg-slate-800/30 hover:bg-[#D4AF37]/5 rounded-lg border border-white/5 hover:border-[#D4AF37]/20 text-left transition-all"
            >
              <p className="text-white text-xs font-bold">{t.label}</p>
              <p className="text-slate-500 text-[10px] mt-0.5">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
