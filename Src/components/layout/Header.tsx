import React from 'react';
import { Menu, X, Settings, Bell } from 'lucide-react';
import type { TabId } from '@/types';
import { NAV_ITEMS } from './Sidebar';

interface Props {
  activeTab: TabId;
  isMobileMenuOpen: boolean;
  onToggleMobile: () => void;
  onTabChange: (tab: TabId) => void;
  onSettings: () => void;
  criticalCount?: number;
}

export const Header: React.FC<Props> = ({
  activeTab, isMobileMenuOpen, onToggleMobile, onTabChange, onSettings, criticalCount = 0,
}) => {
  const current = NAV_ITEMS.find(n => n.id === activeTab);
  const Icon = current?.icon;

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6 py-4 bg-slate-950/90 backdrop-blur-md border-b border-white/5">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobile}
            className="lg:hidden text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-2">
            {Icon && <Icon className="text-[#D4AF37]" size={18} />}
            <h2 className="text-white font-bold text-sm tracking-widest uppercase">
              {activeTab === 'history' ? 'Audit History' : current?.label ?? activeTab}
            </h2>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {criticalCount > 0 && (
            <div className="relative">
              <Bell size={18} className="text-red-400 animate-pulse" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {criticalCount}
              </span>
            </div>
          )}
          <button
            onClick={onSettings}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            title="Settings"
          >
            <Settings size={16} />
          </button>
          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-white/10">
            <div className="w-7 h-7 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
              <span className="text-[#D4AF37] text-xs font-bold">AW</span>
            </div>
            <span className="text-slate-400 text-xs font-medium hidden md:block">Al Wajer</span>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-30 flex">
          <div className="w-64 bg-slate-950 border-r border-white/5 flex flex-col overflow-y-auto h-full">
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <div>
                <h1 className="text-white font-black text-sm">Al Wajer Pharma</h1>
                <p className="text-slate-600 text-[10px]">ERP v2</p>
              </div>
              <button onClick={onToggleMobile} className="text-slate-400 hover:text-white p-1.5"><X size={18}/></button>
            </div>
            <nav className="flex-1 p-3 space-y-1">
              {NAV_ITEMS.map(item => {
                const NavIcon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { onTabChange(item.id); onToggleMobile(); }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all
                      ${active ? 'bg-[#D4AF37] text-slate-950 font-bold' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                  >
                    <NavIcon size={16} /> {item.label}
                  </button>
                );
              })}
            </nav>
          </div>
          <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={onToggleMobile} />
        </div>
      )}
    </>
  );
};
