import React from 'react';
import { Globe, Plus, Edit2, Trash2, TrendingUp } from 'lucide-react';
import type { BDLead, Market, ModalState } from '@/types';
import { StatusBadge } from '@/components/shared/StatusBadge';

interface Props {
  bdLeads: BDLead[];
  markets: Market[];
  onOpenModal: (mode: ModalState['mode'], type: ModalState['type'], data?: Record<string, unknown>) => void;
  onDelete: (type: string, id: string, name: string) => void;
}

export const BusinessDev: React.FC<Props> = ({ bdLeads, markets, onOpenModal, onDelete }) => {
  const newLead = (): Record<string, unknown> => ({
    id: `BD-${Date.now()}`, targetMarket: '', opportunity: '',
    potentialValue: '$0', status: 'Prospecting', probability: 0,
  });

  const newMarket = (): Record<string, unknown> => ({
    id: `M-${Date.now()}`, name: '', region: '', status: 'Pending',
  });

  const pipelineTotal = bdLeads
    .map(l => parseFloat(l.potentialValue.replace(/[^0-9.]/g, '') || '0'))
    .reduce((s, v) => s + v, 0);

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Globe className="text-[#F4C430]" size={20}/> Business Development
        </h2>
        <div className="flex gap-2">
          <button onClick={() => onOpenModal('add', 'markets', newMarket())} className="erp-btn-ghost">
            Add Market
          </button>
          <button onClick={() => onOpenModal('add', 'bd', newLead())} className="erp-btn-gold">
            <Plus size={15}/> Add Lead
          </button>
        </div>
      </div>

      {/* Pipeline Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Active Leads', value: bdLeads.length },
          { label: 'In Negotiation', value: bdLeads.filter(l => l.status === 'Negotiation').length },
          { label: 'Active Markets', value: markets.filter(m => m.status === 'Active').length },
          { label: 'Pipeline', value: `$${(pipelineTotal / 1000000).toFixed(1)}M` },
        ].map(s => (
          <div key={s.label} className="bg-slate-900/50 border border-[#D4AF37]/20 p-4 rounded-xl">
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">{s.label}</p>
            <p className="text-xl font-bold text-white mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* BD Pipeline */}
      <div className="bg-slate-900/50 border border-[#D4AF37]/30 rounded-xl p-5 gold-glow">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="text-[#F4C430]" size={16}/> Business Pipeline
        </h3>
        <div className="space-y-3">
          {bdLeads.length === 0 && <p className="text-slate-500 text-sm text-center py-4">No BD leads added yet.</p>}
          {bdLeads.map(lead => (
            <div key={lead.id} className="p-4 bg-slate-800/30 rounded-lg border border-white/5 hover:border-[#D4AF37]/20 transition-all group">
              <div className="flex flex-wrap justify-between items-start gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-white font-bold text-sm">{lead.opportunity}</h4>
                    <StatusBadge status={lead.status}/>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">{lead.targetMarket}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] text-slate-500 uppercase">Value</p>
                    <p className="text-sm text-[#D4AF37] font-bold">{lead.potentialValue}</p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] text-slate-500 uppercase">Probability</p>
                    <p className="text-sm text-white font-bold">{lead.probability}%</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => onOpenModal('edit', 'bd', lead as unknown as Record<string, unknown>)} className="p-1.5 rounded hover:bg-yellow-500/20 text-[#F4C430]"><Edit2 size={13}/></button>
                    <button onClick={() => onDelete('bd', lead.id, lead.opportunity)} className="p-1.5 rounded hover:bg-red-500/20 text-red-400"><Trash2 size={13}/></button>
                  </div>
                </div>
              </div>
              {/* Progress bar */}
              <div className="mt-3 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-[#D4AF37] rounded-full transition-all" style={{ width: `${lead.probability}%` }}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Markets */}
      <div className="bg-slate-900/50 border border-[#D4AF37]/20 rounded-xl p-5">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Globe className="text-[#F4C430]" size={16}/> Market Coverage
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {markets.map(m => (
            <div key={m.id} className="p-3 bg-slate-800/30 rounded-lg border border-white/5 flex justify-between items-center hover:border-[#D4AF37]/20 transition-all group">
              <div>
                <p className="text-white text-sm font-bold">{m.name}</p>
                <p className="text-[10px] text-slate-500">{m.region}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <StatusBadge status={m.status}/>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => onOpenModal('edit', 'markets', m as unknown as Record<string, unknown>)} className="p-0.5 text-slate-500 hover:text-[#D4AF37]"><Edit2 size={10}/></button>
                  <button onClick={() => onDelete('markets', m.id, m.name)} className="p-0.5 text-slate-500 hover:text-red-400"><Trash2 size={10}/></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
