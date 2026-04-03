import React, { useState } from 'react';
import { History, Search, Download, Trash2 } from 'lucide-react';
import type { AuditLog } from '@/types';
import { exportToCSV } from '@/services/export';

interface Props {
  auditLogs: AuditLog[];
  onClear: () => void;
}

export const AuditHistory: React.FC<Props> = ({ auditLogs, onClear }) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PER_PAGE = 20;

  const filtered = auditLogs.filter(
    l => l.action.toLowerCase().includes(search.toLowerCase()) ||
         l.details.toLowerCase().includes(search.toLowerCase()) ||
         l.user.toLowerCase().includes(search.toLowerCase())
  );
  const pages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const ACTION_COLOR: Record<string, string> = {
    ADD: 'text-green-400',
    EDIT: 'text-yellow-400',
    DELETE: 'text-red-400',
  };
  const getColor = (action: string) => {
    const prefix = action.split('_')[0];
    return ACTION_COLOR[prefix] ?? 'text-slate-400';
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <History className="text-[#F4C430]" size={20}/> Audit History
        </h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13}/>
            <input
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search logs…"
              className="bg-slate-800/50 border border-white/10 text-white rounded-lg pl-8 pr-3 py-2 text-sm focus:border-[#D4AF37]/50 focus:outline-none w-44"
            />
          </div>
          <button onClick={() => exportToCSV(auditLogs as unknown as Record<string, unknown>[], 'audit_log')} className="erp-btn-ghost">
            <Download size={13}/>
          </button>
          <button onClick={onClear} className="p-2 text-slate-500 hover:text-red-400 bg-slate-800 hover:bg-red-500/10 rounded-lg border border-white/10 transition-all" title="Clear all">
            <Trash2 size={14}/>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Events', value: auditLogs.length },
          { label: 'Add Events', value: auditLogs.filter(l => l.action.startsWith('ADD')).length },
          { label: 'Delete Events', value: auditLogs.filter(l => l.action.startsWith('DELETE')).length },
        ].map(s => (
          <div key={s.label} className="bg-slate-900/50 border border-[#D4AF37]/20 p-3 rounded-xl">
            <p className="text-[10px] text-slate-500 uppercase font-bold">{s.label}</p>
            <p className="text-xl font-bold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-900/50 border border-[#D4AF37]/30 rounded-xl overflow-hidden gold-glow">
        {paginated.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            {auditLogs.length === 0 ? 'No audit events recorded yet. Changes will appear here.' : 'No logs match your search.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 text-[10px] text-slate-500 uppercase">
                  <th className="pb-3 px-4 pt-4 font-bold">Timestamp</th>
                  <th className="pb-3 px-4 pt-4 font-bold">Action</th>
                  <th className="pb-3 px-4 pt-4 font-bold hidden sm:table-cell">User</th>
                  <th className="pb-3 px-4 pt-4 font-bold">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginated.map(log => (
                  <tr key={log.id} className="hover:bg-white/5 transition-all">
                    <td className="py-3 px-4 text-slate-500 text-xs font-mono whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className={`py-3 px-4 text-xs font-bold font-mono ${getColor(log.action)}`}>
                      {log.action}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-xs hidden sm:table-cell">{log.user}</td>
                    <td className="py-3 px-4 text-slate-300 text-xs max-w-[300px] truncate">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-white/5">
            <p className="text-xs text-slate-500">{filtered.length} total events</p>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-7 h-7 text-xs font-bold rounded-lg transition-all ${page === p ? 'bg-[#D4AF37] text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
