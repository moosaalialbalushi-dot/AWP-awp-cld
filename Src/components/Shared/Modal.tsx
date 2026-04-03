import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import type { ModalState, EntityType } from '@/types';

interface FieldDef {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'date' | 'textarea';
  options?: string[];
  readOnly?: boolean;
}

const FIELDS: Record<EntityType, FieldDef[]> = {
  production: [
    { key: 'id', label: 'Batch ID', type: 'text', readOnly: true },
    { key: 'product', label: 'Product', type: 'text' },
    { key: 'quantity', label: 'Quantity (Kg)', type: 'number' },
    { key: 'actualYield', label: 'Actual Yield (%)', type: 'number' },
    { key: 'expectedYield', label: 'Expected Yield (%)', type: 'number' },
    { key: 'status', label: 'Status', type: 'select', options: ['Scheduled', 'In-Progress', 'Completed', 'Quarantine'] },
    { key: 'timestamp', label: 'Date', type: 'date' },
    { key: 'dispatchDate', label: 'Dispatch Date', type: 'date' },
  ],
  inventory: [
    { key: 'sNo', label: 'S.No', type: 'text' },
    { key: 'name', label: 'Material Name', type: 'text' },
    { key: 'category', label: 'Category', type: 'select', options: ['API', 'Excipient', 'Packing', 'Finished', 'R&D', 'Spare', 'Other'] },
    { key: 'stock', label: 'Present Stock', type: 'number' },
    { key: 'unit', label: 'Unit', type: 'text' },
    { key: 'requiredForOrders', label: 'Required for Orders', type: 'number' },
    { key: 'balanceToPurchase', label: 'Balance to Purchase', type: 'number' },
    { key: 'stockDate', label: 'Stock Date', type: 'text' },
  ],
  sales: [
    { key: 'invoiceNo', label: 'Invoice No', type: 'text' },
    { key: 'date', label: 'Date', type: 'date' },
    { key: 'customer', label: 'Customer', type: 'text' },
    { key: 'country', label: 'Country', type: 'text' },
    { key: 'product', label: 'Product', type: 'text' },
    { key: 'quantity', label: 'Quantity (Kg)', type: 'number' },
    { key: 'rateUSD', label: 'Rate (USD/Kg)', type: 'number' },
    { key: 'amountUSD', label: 'Amount (USD)', type: 'number' },
    { key: 'amountOMR', label: 'Amount (OMR)', type: 'number' },
    { key: 'status', label: 'Status', type: 'select', options: ['Pending', 'Confirmed', 'Dispatched', 'Delivered', 'Cancelled'] },
    { key: 'paymentTerms', label: 'Payment Terms', type: 'text' },
    { key: 'remarks', label: 'Remarks', type: 'textarea' },
  ],
  procurement: [
    { key: 'name', label: 'Vendor Name', type: 'text' },
    { key: 'category', label: 'Category', type: 'select', options: ['API', 'Excipient', 'Packing', 'Equipment'] },
    { key: 'country', label: 'Country', type: 'text' },
    { key: 'rating', label: 'Rating (1-5)', type: 'number' },
    { key: 'status', label: 'Status', type: 'select', options: ['Verified', 'Audit Pending', 'Blacklisted'] },
  ],
  vendors: [
    { key: 'name', label: 'Vendor Name', type: 'text' },
    { key: 'category', label: 'Category', type: 'select', options: ['API', 'Excipient', 'Packing', 'Equipment'] },
    { key: 'country', label: 'Country', type: 'text' },
    { key: 'rating', label: 'Rating (1-5)', type: 'number' },
    { key: 'status', label: 'Status', type: 'select', options: ['Verified', 'Audit Pending', 'Blacklisted'] },
  ],
  accounting: [
    { key: 'description', label: 'Description', type: 'text' },
    { key: 'category', label: 'Category', type: 'select', options: ['Utilities', 'Salaries', 'Maintenance', 'Logistics', 'Raw Materials'] },
    { key: 'amount', label: 'Amount (USD)', type: 'number' },
    { key: 'status', label: 'Status', type: 'select', options: ['Pending', 'Paid'] },
    { key: 'dueDate', label: 'Due Date', type: 'date' },
  ],
  hr: [
    { key: 'name', label: 'Full Name', type: 'text' },
    { key: 'role', label: 'Role', type: 'text' },
    { key: 'department', label: 'Department', type: 'select', options: ['Production', 'QC', 'Sales', 'Admin', 'R&D'] },
    { key: 'salary', label: 'Monthly Salary (USD)', type: 'number' },
    { key: 'status', label: 'Status', type: 'select', options: ['Active', 'On Leave', 'Terminated'] },
    { key: 'joinDate', label: 'Join Date', type: 'date' },
  ],
  rd: [
    { key: 'title', label: 'Project Title', type: 'text' },
    { key: 'productCode', label: 'Product Code', type: 'text' },
    { key: 'dosageForm', label: 'Dosage Form', type: 'select', options: ['Pellet', 'Tablet', 'Capsule', 'Sachet', 'Liquid', 'Other'] },
    { key: 'strength', label: 'Strength', type: 'text' },
    { key: 'status', label: 'Status', type: 'select', options: ['Formulation', 'Stability', 'Bioequivalence', 'Clinical', 'Optimizing', 'Approved'] },
    { key: 'optimizationScore', label: 'Optimization Score (%)', type: 'number' },
    { key: 'batchSize', label: 'Batch Size', type: 'number' },
    { key: 'batchUnit', label: 'Batch Unit', type: 'text' },
    { key: 'loss', label: 'Loss Factor', type: 'number' },
    { key: 'regulatoryStatus', label: 'Regulatory Status', type: 'text' },
  ],
  bd: [
    { key: 'targetMarket', label: 'Target Market', type: 'text' },
    { key: 'opportunity', label: 'Opportunity', type: 'text' },
    { key: 'potentialValue', label: 'Potential Value', type: 'text' },
    { key: 'status', label: 'Status', type: 'select', options: ['Prospecting', 'Negotiation', 'Contracting', 'Closed'] },
    { key: 'probability', label: 'Probability (%)', type: 'number' },
  ],
  samples: [
    { key: 'product', label: 'Product', type: 'text' },
    { key: 'destination', label: 'Destination', type: 'text' },
    { key: 'quantity', label: 'Quantity', type: 'text' },
    { key: 'status', label: 'Status', type: 'select', options: ['Requested', 'Production', 'QC Testing', 'Dispatched', 'Arrived'] },
    { key: 'trackingNumber', label: 'Tracking Number', type: 'text' },
  ],
  markets: [
    { key: 'name', label: 'Market Name', type: 'text' },
    { key: 'region', label: 'Region', type: 'text' },
    { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Pending', 'Exit'] },
  ],
};

interface Props {
  modal: ModalState;
  onSave: (type: EntityType, data: Record<string, unknown>) => void;
  onClose: () => void;
}

export const Modal: React.FC<Props> = ({ modal, onSave, onClose }) => {
  const [form, setForm] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (modal.isOpen) setForm({ ...modal.data });
  }, [modal.isOpen, modal.data]);

  if (!modal.isOpen || !modal.type) return null;

  const fields = FIELDS[modal.type] ?? [];
  const isView = modal.mode === 'view';
  const title = isView ? 'View Details' : modal.mode === 'add' ? 'Add New' : 'Edit';

  const handleChange = (key: string, value: unknown) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modal.type) onSave(modal.type, form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-1.5 hover:bg-white/5 rounded-lg">
            <X size={18} />
          </button>
        </div>
        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map(field => (
              <div key={field.key} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  {field.label}
                </label>
                {isView || field.readOnly ? (
                  <div className="bg-slate-800/50 border border-white/5 rounded-lg px-3 py-2.5 text-sm text-slate-300">
                    {String(form[field.key] ?? '—')}
                  </div>
                ) : field.type === 'select' ? (
                  <select
                    value={String(form[field.key] ?? '')}
                    onChange={e => handleChange(field.key, e.target.value)}
                    className="w-full bg-slate-800/50 border border-white/10 text-white rounded-lg px-3 py-2.5 text-sm focus:border-[#D4AF37]/50 focus:outline-none transition-colors"
                  >
                    <option value="">Select...</option>
                    {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : field.type === 'textarea' ? (
                  <textarea
                    value={String(form[field.key] ?? '')}
                    onChange={e => handleChange(field.key, e.target.value)}
                    rows={3}
                    className="w-full bg-slate-800/50 border border-white/10 text-white rounded-lg px-3 py-2.5 text-sm focus:border-[#D4AF37]/50 focus:outline-none transition-colors resize-none"
                  />
                ) : (
                  <input
                    type={field.type}
                    value={field.type === 'number' ? Number(form[field.key] ?? 0) : String(form[field.key] ?? '')}
                    onChange={e => handleChange(field.key, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                    className="w-full bg-slate-800/50 border border-white/10 text-white rounded-lg px-3 py-2.5 text-sm focus:border-[#D4AF37]/50 focus:outline-none transition-colors"
                  />
                )}
              </div>
            ))}
          </div>
          {!isView && (
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/5">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-all">
                Cancel
              </button>
              <button type="submit" className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-slate-950 bg-[#D4AF37] hover:bg-[#c4a030] rounded-lg transition-all">
                <Save size={14} /> Save
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
