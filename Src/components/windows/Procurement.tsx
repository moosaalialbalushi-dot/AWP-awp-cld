import React, { useState } from 'react';
import { Truck, Plus, Edit2, Trash2, AlertTriangle, BadgeDollarSign, Globe, Star, UserPlus } from 'lucide-react';
import type { InventoryItem, Vendor, ModalState } from '@/types';
import { StatusBadge } from '@/components/shared/StatusBadge';

interface Props {
  inventory: InventoryItem[];
  vendors: Vendor[];
  onOpenModal: (mode: ModalState['mode'], type: ModalState['type'], data?: Record<string, unknown>) => void;
  onDelete: (type: string, id: string, name: string) => void;
}

const MARKET_RATES = [
  { name: 'Esomeprazole Sodium', price: '$48.50/kg', change: '+1.2%', up: true },
  { name: 'Omeprazole Pellet 8.5%', price: '$12.20/kg', change: '-0.5%', up: false },
  { name: 'Empty Hard Gelatin Cap', price: '$3.80/k', change: 'Stable', up: null },
  { name: 'Alu-Alu Foil', price: '$9.40/kg', change: '+2.1%', up: true },
];

export const Procurement: React.FC<Props> = ({ inventory, vendors, onOpenModal, onDelete }) => {
  const [isPOOpen, setIsPOOpen] = useState(false);
  const [poItem, setPoItem] = useState<InventoryItem | null>(null);
  const [poQty, setPoQty] = useState('');
  const [poVendor, setPoVendor] = useState('');

  const shortages = inventory.filter(i => i.balanceToPurchase && i.balanceToPurchase > 0);

  const newVendor = (): Record<string, unknown> => ({
    id: `V-${Math.floor(Math.random() * 900) + 100}`,
    name: '', category: 'API', rating: 5, status: 'Audit Pending', country: '',
  });

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Truck className="text-[#F4C430]" size={20}/> Procurement & Supply Chain
        </h2>
        <div className="flex gap-2">
          <button onClick={() => setIsPOOpen(true)} className="bg-[#D4AF37] hover:bg-[#c4a030] text-slate-950 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
            <Plus size={15}/> Generate PO
          </button>
          <button onClick={() => onOpenModal('add', 'vendors', newVendor())} className="erp-btn-gold">
            <UserPlus size={15}/> Add Vendor
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Shortages */}
        <div className="space-y-4">
          <div className="bg-slate-900/50 border border-[#D4AF37]/30 rounded-xl p-5 gold-glow">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="text-red-400" size={16}/> Material Shortages
            </h3>
            {shortages.length === 0
              ? <p className="text-slate-500 text-sm">No critical shortages.</p>
              : shortages.map(item => (
                <div key={item.id} className="p-4 bg-red-500/10 rounded-lg border border-red-500/20 flex justify-between items-center mb-3">
                  <div>
                    <h4 className="text-white font-bold text-sm">{item.name}</h4>
                    <p className="text-[10px] text-red-300 font-mono">Required: {item.balanceToPurchase} {item.unit}</p>
                  </div>
                  <button
                    onClick={() => { setPoItem(item); setPoQty(String(item.balanceToPurchase)); setIsPOOpen(true); }}
                    className="text-xs bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white px-3 py-1.5 rounded-lg border border-red-500/30 font-bold transition-all"
                  >
                    Fill Needs
                  </button>
                </div>
              ))
            }
          </div>

          {/* Market Rates */}
          <div className="bg-slate-900/50 border border-[#D4AF37]/30 rounded-xl p-5 gold-glow">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <BadgeDollarSign className="text-green-400" size={16}/> Market Raw Material Rates
            </h3>
            <table className="w-full">
              <thead>
                <tr className="text-[9px] text-slate-500 uppercase font-bold border-b border-white/5">
                  <th className="pb-2 text-left">Material</th>
                  <th className="pb-2 text-left">Price</th>
                  <th className="pb-2 text-left">Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {MARKET_RATES.map(m => (
                  <tr key={m.name} className="hover:bg-white/5 transition-colors">
                    <td className="py-2.5 text-slate-300 text-xs font-medium">{m.name}</td>
                    <td className="py-2.5 text-[#D4AF37] text-xs font-bold font-mono">{m.price}</td>
                    <td className={`py-2.5 text-[10px] font-bold ${m.up === true ? 'text-green-400' : m.up === false ? 'text-red-400' : 'text-slate-500'}`}>{m.change}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vendors */}
        <div className="bg-slate-900/50 border border-[#D4AF37]/30 rounded-xl p-5 gold-glow">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Globe className="text-[#F4C430]" size={16}/> Approved Suppliers
          </h3>
          <div className="space-y-3">
            {vendors.map(v => (
              <div key={v.id} className="p-4 bg-slate-950/30 rounded-lg border border-white/5 hover:border-[#D4AF37]/20 transition-all group">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-white font-bold text-sm group-hover:text-[#D4AF37] transition-colors">{v.name}</h4>
                      <StatusBadge status={v.status}/>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">{v.country} • {v.category}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <div className="flex items-center text-[#D4AF37] text-xs font-bold gap-1">
                      <Star size={10} fill="#D4AF37"/> {v.rating}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => onOpenModal('edit', 'vendors', v as unknown as Record<string, unknown>)} className="p-1 text-slate-500 hover:text-[#D4AF37]"><Edit2 size={11}/></button>
                      <button onClick={() => onDelete('vendors', v.id, v.name)} className="p-1 text-slate-500 hover:text-red-400"><Trash2 size={11}/></button>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                  <p className="text-[10px] text-slate-500">Materials: <span className="text-slate-300">API, Pellets</span></p>
                  <p className="text-[10px] text-right text-slate-500">Lead Time: <span className="text-slate-300">15-20d</span></p>
                </div>
              </div>
            ))}
            {vendors.length === 0 && <p className="text-slate-500 text-sm text-center py-4">No vendors added yet.</p>}
          </div>
        </div>
      </div>

      {/* PO Modal */}
      {isPOOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <h2 className="text-base font-bold text-white">Generate Purchase Order</h2>
              <button onClick={() => setIsPOOpen(false)} className="text-slate-500 hover:text-white p-1.5 rounded-lg">✕</button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Material</label>
                <input value={poItem?.name ?? ''} onChange={() => {}} readOnly
                  className="w-full bg-slate-800/50 border border-white/10 text-white rounded-lg px-3 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Quantity ({poItem?.unit ?? 'kg'})</label>
                <input type="number" value={poQty} onChange={e => setPoQty(e.target.value)}
                  className="w-full bg-slate-800/50 border border-white/10 text-white rounded-lg px-3 py-2.5 text-sm focus:border-[#D4AF37]/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Preferred Vendor</label>
                <select value={poVendor} onChange={e => setPoVendor(e.target.value)}
                  className="w-full bg-slate-800/50 border border-white/10 text-white rounded-lg px-3 py-2.5 text-sm focus:border-[#D4AF37]/50 focus:outline-none"
                >
                  <option value="">Select vendor...</option>
                  {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t border-white/5">
              <button onClick={() => setIsPOOpen(false)} className="px-4 py-2 text-sm font-bold text-slate-400 bg-slate-800 rounded-lg">Cancel</button>
              <button onClick={() => {
                alert(`PO generated for ${poQty} ${poItem?.unit} of ${poItem?.name}`);
                setIsPOOpen(false); setPoItem(null); setPoQty(''); setPoVendor('');
              }} className="px-5 py-2 text-sm font-bold text-slate-950 bg-[#D4AF37] hover:bg-[#c4a030] rounded-lg">
                Generate PO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
