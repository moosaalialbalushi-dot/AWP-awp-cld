import React, { useState } from 'react';
import { X, Key, Database, Save, Globe, Bot, CheckCircle2 } from 'lucide-react';
import type { ApiConfig } from '@/types';
import { isSupabaseReady } from '@/services/database';

interface Props {
  isOpen: boolean;
  config: ApiConfig;
  onSave: (cfg: ApiConfig) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<Props> = ({ isOpen, config, onSave, onClose }) => {
  const [form, setForm] = useState<ApiConfig>(config);

  if (!isOpen) return null;

  const handle = (key: keyof ApiConfig, val: string) => setForm(prev => ({ ...prev, [key]: val }));
  const dbConnected = isSupabaseReady();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Key className="text-[#D4AF37]" size={18} /> Settings & Connections
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white p-1.5 hover:bg-white/5 rounded-lg transition-all"><X size={18}/></button>
        </div>
        <div className="p-5 space-y-5">
          {/* ── Database ───────────────────────────────────────── */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Database size={12} className="text-[#D4AF37]"/> Database (Supabase)
              {dbConnected && <span className="flex items-center gap-1 text-green-400 text-[10px] normal-case"><CheckCircle2 size={10}/> Connected</span>}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Supabase URL</label>
                <input
                  type="text" value={form.supabaseUrl}
                  onChange={e => handle('supabaseUrl', e.target.value)}
                  placeholder="https://xxx.supabase.co"
                  className="w-full bg-slate-800/50 border border-white/10 text-white rounded-lg px-3 py-2.5 text-sm focus:border-[#D4AF37]/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Supabase Anon Key</label>
                <input
                  type="password" value={form.supabaseKey}
                  onChange={e => handle('supabaseKey', e.target.value)}
                  placeholder="eyJ..."
                  className="w-full bg-slate-800/50 border border-white/10 text-white rounded-lg px-3 py-2.5 text-sm focus:border-[#D4AF37]/50 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* ── AI Keys ────────────────────────────────────────── */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Bot size={12} className="text-[#D4AF37]"/> AI Provider Keys
            </h3>
            <p className="text-[10px] text-slate-600 mb-3">
              API keys for Gemini, Claude, and OpenRouter are set in <span className="text-slate-400">Vercel → Settings → Environment Variables</span>.
              The field below is for optional local override.
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Bot size={10}/> Claude API Key (optional local override)
                </label>
                <input
                  type="password" value={form.claudeKey}
                  onChange={e => handle('claudeKey', e.target.value)}
                  placeholder="sk-ant-..."
                  className="w-full bg-slate-800/50 border border-white/10 text-white rounded-lg px-3 py-2.5 text-sm focus:border-[#D4AF37]/50 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* ── Info ────────────────────────────────────────────── */}
          <div className="bg-slate-800/30 border border-white/5 rounded-xl p-4">
            <h4 className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1.5">
              <Globe size={11}/> Vercel Environment Variables
            </h4>
            <div className="space-y-1.5 text-[10px] text-slate-500 font-mono">
              <p>GEMINI_API_KEY — Google AI (required for file reader)</p>
              <p>ANTHROPIC_API_KEY — Claude</p>
              <p>OPENROUTER_API_KEY — OpenRouter (free models)</p>
              <p>VITE_SUPABASE_URL — Database URL</p>
              <p>VITE_SUPABASE_ANON_KEY — Database key</p>
            </div>
          </div>

          <p className="text-[10px] text-slate-600">Settings stored locally in your browser. For production, use environment variables.</p>
        </div>
        <div className="flex justify-end gap-3 p-5 border-t border-white/5">
          <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-400 bg-slate-800 hover:bg-slate-700 rounded-lg">Cancel</button>
          <button onClick={() => { onSave(form); onClose(); }} className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-slate-950 bg-[#D4AF37] hover:bg-[#c4a030] rounded-lg">
            <Save size={14}/> Save
          </button>
        </div>
      </div>
    </div>
  );
};
