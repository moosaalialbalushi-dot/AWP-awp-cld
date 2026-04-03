import React from 'react';
import { Calculator as CalcIcon, RefreshCw } from 'lucide-react';
import type { CalcData, RDProject } from '@/types';

interface Props {
  calcData: CalcData;
  calcResults: Record<string, number> | null;
  rdProjects: RDProject[];
  onDataChange: (d: CalcData) => void;
  onCalculate: () => void;
  onReset: () => void;
}

const SHIPPING_METHODS = [
  'CIF by Air - Muscat Airport', 'CIF by Sea - Sohar Port',
  'FOB Sohar', 'DDP - Destination', 'EXW - Sohar Plant',
];

export const Calculator: React.FC<Props> = ({ calcData, calcResults, rdProjects, onDataChange, onCalculate, onReset }) => {
  const set = (key: keyof CalcData, v: unknown) => onDataChange({ ...calcData, [key]: v });

  const Field = ({ label, field, type = 'number' }: { label: string; field: keyof CalcData; type?: string }) => (
    <div>
      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
      {type === 'select' ? (
        <select
          value={String(calcData[field])}
          onChange={e => set(field, e.target.value)}
          className="w-full bg-slate-800/50 border border-white/10 text-white rounded-lg px-3 py-2.5 text-sm focus:border-[#D4AF37]/50 focus:outline-none"
        >
          {SHIPPING_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      ) : (
        <input
          type={type}
          value={type === 'number' ? Number(calcData[field]) : String(calcData[field])}
          onChange={e => set(field, type === 'number' ? Number(e.target.value) : e.target.value)}
          className="w-full bg-slate-800/50 border border-white/10 text-white rounded-lg px-3 py-2.5 text-sm focus:border-[#D4AF37]/50 focus:outline-none"
        />
      )}
    </div>
  );

  return (
    <div className="space-y-5 animate-fadeIn">
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        <CalcIcon className="text-[#F4C430]" size={20}/> Sales vs Cost Calculator
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Input Panel */}
        <div className="bg-slate-900/50 border border-[#D4AF37]/30 rounded-xl p-5 gold-glow space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-white/5 pb-3">Input Parameters</h3>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Product</label>
            <select
              value={calcData.product}
              onChange={e => set('product', e.target.value)}
              className="w-full bg-slate-800/50 border border-white/10 text-white rounded-lg px-3 py-2.5 text-sm focus:border-[#D4AF37]/50 focus:outline-none"
            >
              <option value="">Select product or type…</option>
              {rdProjects.map(p => <option key={p.id} value={p.title}>{p.title}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Volume (Kg)" field="volume"/>
            <Field label="Target Price ($/Kg)" field="targetPrice"/>
            <Field label="RMC ($/Kg)" field="rmc"/>
            <Field label="Labor ($/Kg)" field="labor"/>
            <Field label="Packing ($/Kg)" field="packing"/>
            <Field label="Logistics ($/Kg)" field="logistics"/>
            <Field label="Shipping Cost ($)" field="shippingCost"/>
          </div>

          <Field label="Shipping Method" field="shippingMethod" type="select"/>

          <div className="flex gap-3 pt-2">
            <button onClick={onCalculate} className="flex-1 erp-btn-gold justify-center py-2.5">
              <CalcIcon size={15}/> Calculate
            </button>
            <button onClick={onReset} className="erp-btn-ghost py-2.5">
              <RefreshCw size={13}/> Reset
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {calcResults ? (
            <>
              <div className="bg-slate-900/50 border border-[#D4AF37]/30 rounded-xl p-5 gold-glow">
                <h3 className="text-sm font-bold text-white border-b border-white/5 pb-3 mb-4">Results</h3>
                <div className="space-y-3">
                  {Object.entries(calcResults).map(([key, val]) => (
                    <div key={key} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                      <span className="text-slate-400 text-sm">{key}</span>
                      <span className={`text-sm font-bold font-mono ${
                        key.includes('Profit') || key.includes('Margin')
                          ? Number(val) >= 0 ? 'text-green-400' : 'text-red-400'
                          : 'text-white'
                      }`}>
                        {key.includes('%') || key.includes('Margin') ? `${Number(val).toFixed(1)}%` : `$${Number(val).toLocaleString()}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`p-4 rounded-xl border ${
                (calcResults['Gross Margin %'] ?? 0) >= 20
                  ? 'bg-green-500/10 border-green-500/30'
                  : (calcResults['Gross Margin %'] ?? 0) >= 0
                    ? 'bg-yellow-500/10 border-yellow-500/30'
                    : 'bg-red-500/10 border-red-500/30'
              }`}>
                <p className="text-xs font-bold uppercase tracking-widest mb-1">
                  {(calcResults['Gross Margin %'] ?? 0) >= 20 ? '✓ Profitable — Proceed' :
                   (calcResults['Gross Margin %'] ?? 0) >= 0 ? '⚠ Marginal — Review' : '✕ Loss — Renegotiate'}
                </p>
                <p className="text-slate-400 text-xs">
                  Gross margin: {(calcResults['Gross Margin %'] ?? 0).toFixed(1)}% on {calcData.volume.toLocaleString()} Kg @ ${calcData.targetPrice}/Kg
                </p>
              </div>
            </>
          ) : (
            <div className="bg-slate-900/50 border border-[#D4AF37]/20 rounded-xl p-8 text-center">
              <CalcIcon className="text-slate-600 mx-auto mb-3" size={36}/>
              <p className="text-slate-500 text-sm">Enter values and click Calculate to see results.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
