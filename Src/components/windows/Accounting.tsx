import React from 'react';
import { Wallet, AlertCircle, Plus, Edit2, Trash2, TrendingDown } from 'lucide-react';
import type { Expense, ModalState } from '@/types';
import { StatusBadge } from '@/components/shared/StatusBadge';

interface Props {
  expenses: Expense[];
  onOpenModal: (mode: ModalState['mode'], type: ModalState['type'], data?: Record<string, unknown>) => void;
  onDelete: (type: string, id: string, name: string) => void;
}

export const Accounting: React.FC<Props> = ({ expenses, onOpenModal, onDelete }) => {
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const liabilities = expenses.filter(e => e.status === 'Pending').reduce((s, e) => s + e.amount, 0);
  const paid = expenses.filter(e => e.status === 'Paid').reduce((s, e) => s + e.amount, 0);

  const newExpense = (): Record<string, unknown> => ({
    id: `EXP-${Date.now()}`, description: '', category: 'Utilities',
    amount: 0, status: 'Pending', dueDate: new Date().toISOString().split('T')[0],
  });

  return (
    <div className="space-y-5 animate-fadeIn">
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        <Wallet className="text-[#F4C430]" size={20}/> Accounting & Finance
      </h2>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/50 border border-[#D4AF37]/30 p-5 rounded-xl gold-glow">
          <Wallet className="text-[#F4C430] mb-3" size={22}/>
          <p className="text-slate-400 text-xs uppercase tracking-widest font-bold mb-1">Total Expenses</p>
          <p className="text-3xl font-bold text-white">${total.toLocaleString()}</p>
        </div>
        <div className="bg-slate-900/50 border border-red-500/30 p-5 rounded-xl">
          <AlertCircle className="text-red-400 mb-3" size={22}/>
          <p className="text-slate-400 text-xs uppercase tracking-widest font-bold mb-1">Outstanding</p>
          <p className="text-3xl font-bold text-red-400">${liabilities.toLocaleString()}</p>
        </div>
        <div className="bg-slate-900/50 border border-green-500/30 p-5 rounded-xl">
          <TrendingDown className="text-green-400 mb-3" size={22}/>
          <p className="text-slate-400 text-xs uppercase tracking-widest font-bold mb-1">Paid</p>
          <p className="text-3xl font-bold text-green-400">${paid.toLocaleString()}</p>
        </div>
      </div>

      {/* Ledger table */}
      <div className="bg-slate-900/50 border border-[#D4AF37]/30 rounded-xl p-5 gold-glow">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-base font-bold text-white">Ledger Overview</h3>
          <button onClick={() => onOpenModal('add', 'accounting', newExpense())} className="erp-btn-gold">
            <Plus size={15}/> Add Transaction
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-slate-500 text-[10px] uppercase">
                <th className="pb-3 font-bold">Description</th>
                <th className="pb-3 font-bold hidden sm:table-cell">Category</th>
                <th className="pb-3 font-bold">Amount</th>
                <th className="pb-3 font-bold hidden sm:table-cell">Due Date</th>
                <th className="pb-3 font-bold">Status</th>
                <th className="pb-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {expenses.length === 0 && (
                <tr><td colSpan={6} className="p-6 text-center text-slate-500 text-sm">No transactions recorded.</td></tr>
              )}
              {expenses.map(exp => (
                <tr key={exp.id} className="hover:bg-white/5 transition-all">
                  <td className="py-3 text-white text-sm font-medium max-w-[180px] truncate">{exp.description}</td>
                  <td className="py-3 text-slate-400 text-xs uppercase hidden sm:table-cell">{exp.category}</td>
                  <td className="py-3 text-white font-mono text-sm">${exp.amount.toLocaleString()}</td>
                  <td className="py-3 text-slate-500 text-xs hidden sm:table-cell">{exp.dueDate}</td>
                  <td className="py-3"><StatusBadge status={exp.status}/></td>
                  <td className="py-3 text-right">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => onOpenModal('edit', 'accounting', exp as unknown as Record<string, unknown>)} className="p-1.5 rounded hover:bg-yellow-500/20 text-[#D4AF37] transition-all"><Edit2 size={13}/></button>
                      <button onClick={() => onDelete('accounting', exp.id, exp.description)} className="p-1.5 rounded hover:bg-red-500/20 text-red-400 transition-all"><Trash2 size={13}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
