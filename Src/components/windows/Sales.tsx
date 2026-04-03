import React from 'react';
import { BadgeDollarSign, Plus, Edit2, Download } from 'lucide-react';
import type { Order, ModalState } from '@/types';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { exportToCSV } from '@/services/export';

interface Props {
  orders: Order[];
  onOpenModal: (mode: ModalState['mode'], type: ModalState['type'], data?: Record<string, unknown>) => void;
}

export const Sales: React.FC<Props> = ({ orders, onOpenModal }) => {
  const grouped = orders.reduce<Record<string, Order[]>>((acc, o) => {
    const key = o.invoiceNo || 'Draft';
    if (!acc[key]) acc[key] = [];
    acc[key].push(o);
    return acc;
  }, {});

  const newOrder = (): Record<string, unknown> => ({
    id: `ORD-${Date.now()}`, sNo: '', invoiceNo: '', lcNo: '',
    date: new Date().toISOString().split('T')[0],
    customer: '', country: '', product: '', quantity: 0,
    rateUSD: 0, amountUSD: 0, amountOMR: 0, status: 'Pending',
  });

  const totalPipeline = orders.reduce((s, o) => s + (Number(o.amountUSD) || 0), 0);
  const pendingCount = orders.filter(o => o.status === 'Pending').length;

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <BadgeDollarSign className="text-[#F4C430]" size={20}/> Sales & Orders
        </h2>
        <div className="flex gap-2">
          <button onClick={() => exportToCSV(orders as unknown as Record<string, unknown>[], 'sales')} className="erp-btn-ghost">
            <Download size={13}/> Export
          </button>
          <button onClick={() => onOpenModal('add', 'sales', newOrder())} className="erp-btn-gold">
            <Plus size={15}/> New Order
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Orders', value: orders.length },
          { label: 'Pending', value: pendingCount, color: 'text-yellow-400' },
          { label: 'Pipeline (USD)', value: '$' + totalPipeline.toLocaleString() },
        ].map(s => (
          <div key={s.label} className="bg-slate-900/50 border border-[#D4AF37]/20 p-4 rounded-xl">
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">{s.label}</p>
            <p className={`text-xl font-bold mt-1 ${s.color ?? 'text-white'}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Grouped by Invoice */}
      <div className="space-y-4">
        {Object.keys(grouped).length === 0 && (
          <div className="bg-slate-900/50 border border-[#D4AF37]/20 p-8 rounded-xl text-center text-slate-500">No orders yet. Add your first order.</div>
        )}
        {Object.entries(grouped).map(([inv, invOrders]) => {
          const totalUSD = invOrders.reduce((s, o) => s + (Number(o.amountUSD) || 0), 0);
          const totalOMR = invOrders.reduce((s, o) => s + (Number(o.amountOMR) || 0), 0);
          const first = invOrders[0];
          return (
            <div key={inv} className="bg-slate-900/50 border border-[#D4AF37]/30 rounded-xl overflow-hidden gold-glow">
              <div className="bg-slate-950/50 border-b border-white/5 px-5 py-4 flex flex-wrap justify-between items-center gap-3">
                <div>
                  <span className="text-lg font-bold text-[#D4AF37]">{inv}</span>
                  <span className="ml-3 text-xs text-slate-500 font-mono">{first.date}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[9px] text-slate-500 uppercase font-bold">Total Value</p>
                    <p className="text-sm font-bold text-white">${totalUSD.toLocaleString()} / OMR {totalOMR.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <table className="w-full text-left">
                <tbody className="divide-y divide-white/5">
                  {invOrders.map(order => (
                    <tr key={order.id} className="hover:bg-white/5 transition-all group">
                      <td className="p-4">
                        <div className="font-bold text-white text-sm">{order.customer}</div>
                        <div className="text-[10px] text-slate-500">{order.country}</div>
                      </td>
                      <td className="p-4 hidden sm:table-cell">
                        <div className="text-sm text-slate-300 truncate max-w-[200px]">{order.product}</div>
                        <div className="text-xs font-bold text-white font-mono">{Number(order.quantity).toLocaleString()} KG</div>
                      </td>
                      <td className="p-4 hidden md:table-cell text-xs font-mono text-[#D4AF37]">
                        ${order.rateUSD || 0}/KG
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-bold text-white font-mono">${Number(order.amountUSD).toLocaleString()}</div>
                      </td>
                      <td className="p-4 hidden sm:table-cell">
                        <StatusBadge status={order.status}/>
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => onOpenModal('edit', 'sales', order as unknown as Record<string, unknown>)} className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-all">
                          <Edit2 size={13}/>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
};
