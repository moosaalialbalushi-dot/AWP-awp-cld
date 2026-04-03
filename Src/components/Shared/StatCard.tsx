import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface Props {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<Props> = ({ title, value, icon: Icon, color = 'text-[#F4C430]', onClick }) => (
  <div
    className={`bg-slate-900/50 border border-[#D4AF37]/30 p-5 rounded-xl gold-glow flex flex-col justify-between h-28 transition-all ${onClick ? 'cursor-pointer hover:border-[#D4AF37]/60' : ''}`}
    onClick={onClick}
  >
    <Icon className={color} size={20} />
    <div>
      <h3 className="text-slate-400 text-[10px] mb-1 uppercase tracking-widest font-bold">{title}</h3>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  </div>
);
