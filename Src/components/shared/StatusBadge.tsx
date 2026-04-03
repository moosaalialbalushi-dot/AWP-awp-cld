import React from 'react';

interface Props { status: string; size?: 'sm' | 'xs'; }

const STATUS_STYLES: Record<string, string> = {
  'Completed':    'bg-green-500/10 text-green-500 border-green-500/20',
  'Active':       'bg-green-500/10 text-green-500 border-green-500/20',
  'Verified':     'bg-green-500/10 text-green-500 border-green-500/20',
  'Paid':         'bg-green-500/10 text-green-500 border-green-500/20',
  'Arrived':      'bg-green-500/10 text-green-500 border-green-500/20',
  'Approved':     'bg-green-500/10 text-green-500 border-green-500/20',
  'Dispatched':   'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'In-Progress':  'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Production':   'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Formulation':  'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Stability':    'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'Negotiation':  'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  'Pending':      'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  'QC Testing':   'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  'Scheduled':    'bg-slate-500/10 text-slate-400 border-slate-500/20',
  'Audit Pending':'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  'Quarantine':   'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Blacklisted':  'bg-red-500/10 text-red-400 border-red-500/20',
  'Terminated':   'bg-red-500/10 text-red-400 border-red-500/20',
  'Contracting':  'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Closed':       'bg-green-500/10 text-green-500 border-green-500/20',
  'Prospecting':  'bg-slate-500/10 text-slate-400 border-slate-500/20',
  'Requested':    'bg-slate-500/10 text-slate-400 border-slate-500/20',
  'On Leave':     'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Pending Exit': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'Exit':         'bg-red-500/10 text-red-400 border-red-500/20',
  'Optimizing':   'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
};

export const StatusBadge: React.FC<Props> = ({ status, size = 'xs' }) => {
  const cls = STATUS_STYLES[status] ?? 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  const sz = size === 'xs' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';
  return (
    <span className={`${sz} rounded-full border font-bold uppercase tracking-wide ${cls}`}>
      {status}
    </span>
  );
};
