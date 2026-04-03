import React, { useState } from 'react';
import { X, Key, Database, Save } from 'lucide-react';
import type { ApiConfig } from '@/types';

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Key className="text-[#D4AF37]" size={18} /> Settings & API Keys
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white p-1.5 hover:bg-white/5 rounded-lg transition-all"><X size={18}/></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Database size={11}/> Supabase URL
            </label>
            <input
              type="text" value={form.supabaseUrl}
              onChange={e => handle('supabaseUrl', e.target.value)}
              placeholder="https://xxx.supabase.co"
              className="w-full bg-slate-800/50 border border-white/10 text-white rounded-lg px-3 py-2.5 text-sm focus:border-[#D4AF37]/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Supabase Anon Key</label>
            <input
              type="password" value={form.supabaseKey}
              onChange={e => handle('supabaseKey', e.target.value)}
              placeholder="eyJ..."
              className="w-full bg-slate-800/50 border border-white/10 text-white rounded-lg px-3 py-2.5 text-sm focus:border-[#D4AF37]/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Claude API Key (Optional)</label>
            <input
              type="password" value={form.claudeKey}
              onChange={e => handle('claudeKey', e.target.value)}
              placeholder="sk-ant-..."
              className="w-full bg-slate-800/50 border border-white/10 text-white rounded-lg px-3 py-2.5 text-sm focus:border-[#D4AF37]/50 focus:outline-none"
            />
          </div>
          <p className="text-[10px] text-slate-600">Settings are stored locally in your browser. For production, use environment variables in Vercel.</p>
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
