import React from 'react';
import {
  LayoutDashboard, Factory, Boxes, BadgeDollarSign, Truck, Wallet,
  Users, Beaker, DraftingCompass, Globe, PackageSearch, Calculator,
  BrainCircuit, History, ChevronRight,
} from 'lucide-react';
import type { TabId } from '@/types';

interface NavItem { id: TabId; label: string; icon: React.ElementType; }

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',  label: 'Dashboard',        icon: LayoutDashboard },
  { id: 'production', label: 'Manufacturing',     icon: Factory },
  { id: 'inventory',  label: 'Inventory',         icon: Boxes },
  { id: 'sales',      label: 'Sales Orders',      icon: BadgeDollarSign },
  { id: 'procurement',label: 'Procurement',       icon: Truck },
  { id: 'accounting', label: 'Accounting',        icon: Wallet },
  { id: 'hr',         label: 'HR & Admin',        icon: Users },
  { id: 'rd',         label: 'R&D Lab',           icon: Beaker },
  { id: 'industrial', label: 'Industrial Studio', icon: DraftingCompass },
  { id: 'bd',         label: 'Business Dev',      icon: Globe },
  { id: 'samples',    label: 'Sample Status',     icon: PackageSearch },
  { id: 'costing',    label: 'Sales vs Cost',     icon: Calculator },
  { id: 'ai',         label: 'AI Command',        icon: BrainCircuit },
  { id: 'history',    label: 'Audit History',     icon: History },
];

interface Props {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export const Sidebar: React.FC<Props> = ({ activeTab, onTabChange }) => (
  <aside className="hidden lg:flex flex-col w-56 shrink-0 bg-slate-950 border-r border-white/5 h-screen sticky top-0 overflow-y-auto custom-scrollbar">
    {/* Logo */}
    <div className="flex flex-col items-center py-6 px-4 border-b border-white/5">
      <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center mb-2">
        <span className="text-[#D4AF37] font-black text-sm">AWP</span>
      </div>
      <h1 className="text-white font-black text-xs tracking-widest uppercase">Al Wajer</h1>
      <p className="text-slate-600 text-[9px] tracking-widest uppercase mt-0.5">Pharma ERP v2</p>
    </div>
    {/* Nav */}
    <nav className="flex-1 py-4 px-3 space-y-1">
      {NAV_ITEMS.map(item => {
        const Icon = item.icon;
        const active = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all text-sm font-medium
              ${active
                ? 'bg-[#D4AF37] text-slate-950 font-bold shadow-lg shadow-[#D4AF37]/20'
                : 'text-slate-500 hover:bg-white/5 hover:text-white'
              }`}
          >
            <Icon size={15} />
            <span className="flex-1 truncate">{item.label}</span>
            {active && <ChevronRight size={12} />}
          </button>
        );
      })}
    </nav>
    <div className="p-3 border-t border-white/5">
      <p className="text-[10px] text-slate-600 text-center tracking-wider">© 2026 Al Wajer Pharma</p>
    </div>
  </aside>
);

export { NAV_ITEMS };
