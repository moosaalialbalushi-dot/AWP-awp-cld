import React from 'react';
import { PackageSearch, Plus, Edit2, Trash2, Truck } from 'lucide-react';
import type { SampleStatus, ModalState } from '@/types';
import { StatusBadge } from '@/components/shared/StatusBadge';

interface Props {
  samples: SampleStatus[];
  onOpenModal: (mode: ModalState['mode'], type: ModalState['type'], data?: Record<string, unknown>) => void;
  onDelete: (type: string, id: string, name: string) => void;
}

const SAMPLE_STAGES: SampleStatus['status'][] = ['Requested', 'Production', 'QC Testing', 'Dispatched', 'Arrived'];

function stageIndex(s: SampleStatus['status']): number {
  return SAMPLE_STAGES.indexOf(s);
}

export const Samples: React.FC<Props> = ({ samples, onOpenModal, onDelete }) => {
  const newSample = (): Record<string, unknown> => ({
    id: `SMP-${Date.now()}`, product: '', destination: '', quantity: '', status: 'Requested',
  });

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <PackageSearch className="text-[#F4C430]" size={20}/> Sample Tracking
        </h2>
        <button onClick={() => onOpenModal('add', 'samples', newSample())} className="erp-btn-gold">
          <Plus size={15}/> New Sample
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {SAMPLE_STAGES.map(stage => {
          const count = samples.filter(s => s.status === stage).length;
          return (
            <div key={stage} className="bg-slate-900/50 border border-[#D4AF37]/20 p-3 rounded-xl text-center">
              <p className="text-[10px] text-slate-500 uppercase font-bold">{stage}</p>
              <p className="text-xl font-bold text-white mt-0.5">{count}</p>
            </div>
          );
        })}
      </div>

      <div className="space-y-3">
        {samples.length === 0 && (
          <div className="bg-slate-900/50 border border-[#D4AF37]/20 rounded-xl p-8 text-center text-slate-500">
            No samples being tracked.
          </div>
        )}
        {samples.map(sample => {
          const idx = stageIndex(sample.status);
          const pct = ((idx + 1) / SAMPLE_STAGES.length) * 100;
          return (
            <div key={sample.id} className="bg-slate-900/50 border border-[#D4AF37]/30 rounded-xl p-5 gold-glow">
              <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[#D4AF37] font-mono text-xs">{sample.id}</span>
                    <StatusBadge status={sample.status}/>
                  </div>
                  <h3 className="text-white font-bold mt-1">{sample.product}</h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Truck size={11} className="text-slate-500"/>
                    <p className="text-xs text-slate-500">{sample.destination} · {sample.quantity}</p>
                  </div>
                  {sample.trackingNumber && (
                    <p className="text-[10px] text-[#D4AF37] font-mono mt-0.5">TRK: {sample.trackingNumber}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => onOpenModal('edit', 'samples', sample as unknown as Record<string, unknown>)} className="p-1.5 rounded hover:bg-yellow-500/20 text-[#F4C430]"><Edit2 size={13}/></button>
                  <button onClick={() => onDelete('samples', sample.id, sample.product)} className="p-1.5 rounded hover:bg-red-500/20 text-red-400"><Trash2 size={13}/></button>
                </div>
              </div>

              {/* Progress Pipeline */}
              <div className="relative">
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-[#D4AF37] rounded-full transition-all" style={{ width: `${pct}%` }}/>
                </div>
                <div className="flex justify-between mt-2">
                  {SAMPLE_STAGES.map((stage, i) => (
                    <div key={stage} className="text-center" style={{ width: '20%' }}>
                      <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${i <= idx ? 'bg-[#D4AF37]' : 'bg-slate-700'}`}/>
                      <p className={`text-[8px] font-bold ${i === idx ? 'text-[#D4AF37]' : i < idx ? 'text-slate-500' : 'text-slate-700'}`}>
                        {stage}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
