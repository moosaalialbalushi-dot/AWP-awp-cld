import React, { useState } from 'react';
import { Boxes, Plus, Edit2, Trash2, AlertCircle, Download } from 'lucide-react';
import type { InventoryItem, ModalState } from '@/types';
import { exportToCSV } from '@/services/export';

type InventoryTab = 'raw' | 'packing' | 'spares' | 'finished';

interface Props {
  inventory: InventoryItem[];
  onOpenModal: (mode: ModalState['mode'], type: ModalState['type'], data?: Record<string, unknown>) => void;
  onDelete: (type: string, id: string, name: string) => void;
  onNavigate: (tab: string) => void;
}

export const Inventory: React.FC<Props> = ({ inventory, onOpenModal, onDelete, onNavigate }) => {
  const [tab, setTab] = useState<InventoryTab>('raw');

  const filtered = inventory.filter(i => {
    if (tab === 'raw') return i.category === 'API' || i.category === 'Excipient';
    if (tab === 'packing') return i.category === 'Packing';
    if (tab === 'spares') return i.category === 'Spare';
    return i.category === 'Finished';
  });

  const critical = filtered.filter(i => i.balanceToPurchase && i.balanceToPurchase > 0);
  const isRaw = tab === 'raw';

  const newItem = (): Record<string, unknown> => ({
    id: `RM-${Math.floor(Math.random() * 900) + 100}`,
    sNo: '', name: '', category: 'API', stock: 0,
    requiredForOrders: 0, balanceToPurchase: 0, unit: 'kg',
    stockDate: new Date().toLocaleDateString(),
  });

  const TABS: { id: InventoryTab; label: string }[] = [
    { id: 'raw', label: 'Raw Materials' },
    { id: 'packing', label: 'Packing' },
    { id: 'spares', label: 'Equipment Spares' },
    { id: 'finished', label: 'Finished Goods' },
  ];

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Boxes className="text-[#F4C430]" size={20}/> Inventory Control
        </h2>
        <div className="flex gap-2">
          <button onClick={() => exportToCSV(inventory as unknown as Record<string, unknown>[], 'inventory')} className="erp-btn-ghost">
            <Download size={13}/> Export
          </button>
          <button onClick={() => onOpenModal('add', 'inventory', newItem())} className="erp-btn-gold">
            <Plus size={15}/> Add Material
          </button>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 border-b border-white/5 overflow-x-auto custom-scrollbar">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`pb-2 px-4 text-sm font-bold whitespace-nowrap transition-all ${tab === t.id ? 'text-[#F4C430] border-b-2 border-[#F4C430]' : 'text-slate-500 hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {critical.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex items-center gap-4">
          <AlertCircle className="text-red-500 shrink-0" size={22}/>
          <div className="flex-1">
            <h3 className="text-red-500 font-bold">Critical Procurement Required</h3>
            <p className="text-red-400 text-sm">{critical.length} item(s) have procurement deficits.</p>
          </div>
          <button onClick={() => onNavigate('procurement')} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold">
            Procurement
          </button>
        </div>
      )}

      <div className="bg-slate-900/50 border border-[#D4AF37]/30 rounded-xl overflow-hidden gold-glow">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-slate-500 text-[10px] uppercase">
                <th className="pb-3 px-4 pt-4 font-bold">S.No</th>
                <th className="pb-3 px-4 pt-4 font-bold">Material Name</th>
                <th className="pb-3 px-4 pt-4 font-bold">Present Stock</th>
                {isRaw && <th className="pb-3 px-4 pt-4 font-bold hidden sm:table-cell">Required</th>}
                {isRaw && <th className="pb-3 px-4 pt-4 font-bold hidden sm:table-cell">Balance</th>}
                <th className="pb-3 px-4 pt-4 font-bold">Status</th>
                <th className="pb-3 px-4 pt-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 && (
                <tr><td colSpan={isRaw ? 7 : 5} className="p-6 text-center text-slate-500 text-sm">No items in this category.</td></tr>
              )}
              {filtered.map(item => {
                const isCritical = item.balanceToPurchase && item.balanceToPurchase > 0;
                return (
                  <tr key={item.id} className="hover:bg-white/5 transition-all">
                    <td className="py-3 px-4 text-slate-500 font-mono text-xs">{item.sNo}</td>
                    <td className="py-3 px-4 text-white font-bold text-sm">{item.name}</td>
                    <td className="py-3 px-4">
                      <span className="text-white font-mono font-bold">{item.stock.toLocaleString()}</span>
                      <span className="text-xs text-slate-500 ml-1">{item.unit}</span>
                      {item.stockDate && <div className="text-[9px] text-slate-600 uppercase">DT: {item.stockDate}</div>}
                    </td>
                    {isRaw && (
                      <td className="py-3 px-4 text-slate-300 font-mono text-sm hidden sm:table-cell">
                        {item.requiredForOrders?.toLocaleString() || '—'} <span className="text-xs text-slate-500">{item.unit}</span>
                      </td>
                    )}
                    {isRaw && (
                      <td className="py-3 px-4 hidden sm:table-cell">
                        <span className={`font-mono font-bold text-sm ${isCritical ? 'text-red-400' : 'text-green-400'}`}>
                          {item.balanceToPurchase?.toLocaleString() || '—'} <span className="text-xs font-normal">{item.unit}</span>
                        </span>
                      </td>
                    )}
                    <td className="py-3 px-4">
                      <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold uppercase ${isCritical ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
                        {isCritical ? 'Shortage' : 'OK'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => onOpenModal('edit', 'inventory', item as unknown as Record<string, unknown>)} className="p-1.5 rounded hover:bg-yellow-500/20 text-[#F4C430] transition-all"><Edit2 size={13}/></button>
                        <button onClick={() => onDelete('inventory', item.id, item.name)} className="p-1.5 rounded hover:bg-red-500/20 text-red-400 transition-all"><Trash2 size={13}/></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
