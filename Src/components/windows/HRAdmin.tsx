import React from 'react';
import { Users, Briefcase, CheckCircle2, BadgeDollarSign, Plus, Edit2, Trash2 } from 'lucide-react';
import type { Employee, ModalState } from '@/types';
import { StatusBadge } from '@/components/shared/StatusBadge';

interface Props {
  employees: Employee[];
  onOpenModal: (mode: ModalState['mode'], type: ModalState['type'], data?: Record<string, unknown>) => void;
  onDelete: (type: string, id: string, name: string) => void;
}

export const HRAdmin: React.FC<Props> = ({ employees, onOpenModal, onDelete }) => {
  const payroll = employees.reduce((s, e) => s + e.salary, 0);
  const departments = [...new Set(employees.map(e => e.department))];

  const newEmployee = (): Record<string, unknown> => ({
    id: `EMP-${Date.now()}`, name: '', role: '', department: 'Production',
    salary: 0, status: 'Active', joinDate: new Date().toISOString().split('T')[0],
  });

  return (
    <div className="space-y-5 animate-fadeIn">
      <h2 className="text-xl font-bold text-white flex items-center gap-2">
        <Users className="text-[#F4C430]" size={20}/> HR & Administration
      </h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Staff Count', value: employees.length, icon: Users },
          { label: 'Departments', value: departments.length, icon: Briefcase },
          { label: 'Attendance', value: '98%', icon: CheckCircle2 },
          { label: 'Monthly Payroll', value: '$' + payroll.toLocaleString(), icon: BadgeDollarSign },
        ].map(s => (
          <div key={s.label} className="bg-slate-900/50 border border-[#D4AF37]/20 p-4 rounded-xl">
            <s.icon className="text-[#F4C430] mb-2" size={18}/>
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">{s.label}</p>
            <p className="text-xl font-bold text-white mt-0.5">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Employee Directory */}
      <div className="bg-slate-900/50 border border-[#D4AF37]/30 rounded-xl p-5 gold-glow">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-base font-bold text-white">Employee Directory</h3>
          <button onClick={() => onOpenModal('add', 'hr', newEmployee())} className="erp-btn-gold">
            <Plus size={15}/> Add Employee
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {employees.length === 0 && (
            <div className="col-span-2 text-center text-slate-500 py-6 text-sm">No employees added yet.</div>
          )}
          {employees.map(emp => (
            <div key={emp.id} className="p-4 bg-slate-800/30 rounded-lg border border-white/5 flex justify-between items-center group hover:border-[#D4AF37]/30 transition-all">
              <div className="flex gap-3 items-center">
                <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] font-bold text-sm shrink-0">
                  {emp.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm">{emp.name}</h4>
                  <p className="text-[10px] text-slate-500 uppercase">{emp.role} • {emp.department}</p>
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-1">
                <span className="text-xs font-mono text-white">${emp.salary.toLocaleString()}</span>
                <StatusBadge status={emp.status}/>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => onOpenModal('edit', 'hr', emp as unknown as Record<string, unknown>)} className="p-1 rounded hover:bg-yellow-500/20 text-[#D4AF37]"><Edit2 size={11}/></button>
                  <button onClick={() => onDelete('hr', emp.id, emp.name)} className="p-1 rounded hover:bg-red-500/20 text-red-400"><Trash2 size={11}/></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Department breakdown */}
      <div className="bg-slate-900/50 border border-[#D4AF37]/20 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white mb-4">Department Breakdown</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {(['Production', 'QC', 'R&D', 'Sales', 'Admin'] as const).map(dept => {
            const count = employees.filter(e => e.department === dept).length;
            const deptPayroll = employees.filter(e => e.department === dept).reduce((s, e) => s + e.salary, 0);
            return (
              <div key={dept} className="bg-slate-800/30 rounded-lg p-3 border border-white/5">
                <p className="text-[10px] text-slate-500 uppercase font-bold">{dept}</p>
                <p className="text-white text-lg font-bold">{count}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">${deptPayroll.toLocaleString()}/mo</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
