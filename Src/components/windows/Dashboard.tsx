import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import {
  LayoutDashboard, Activity, Package, Globe, LineChart, AlertTriangle, AlertCircle,
  Truck, Wallet, Users, Beaker, PackageSearch, Bolt, Grip,
} from 'lucide-react';
import type {
  Batch, InventoryItem, Order, Expense, Employee, Vendor,
  RDProject, SampleStatus, Market, COOInsight, WidgetId,
} from '@/types';
import { ALL_WIDGETS } from '@/data/initial';
import { StatCard } from '@/components/shared/StatCard';

interface Props {
  batches: Batch[];
  inventory: InventoryItem[];
  orders: Order[];
  expenses: Expense[];
  employees: Employee[];
  vendors: Vendor[];
  rdProjects: RDProject[];
  samples: SampleStatus[];
  markets: Market[];
  insights: COOInsight[];
  visibleWidgets: WidgetId[];
  isCustomizeOpen: boolean;
  onOpenCustomize: () => void;
  onSaveWidgets: (ids: WidgetId[]) => void;
  onCloseCustomize: () => void;
  onNavigate: (tab: string) => void;
  onQuickScan: () => void;
  isScanning: boolean;
}

const COLORS = ['#4f46e5', '#8b5cf6', '#0ea5e9', '#10b981', '#f43f5e', '#eab308'];

export const Dashboard: React.FC<Props> = ({
  batches, inventory, orders, expenses, employees, vendors,
  rdProjects, samples, markets, insights, visibleWidgets,
  isCustomizeOpen, onOpenCustomize, onSaveWidgets, onCloseCustomize,
  onNavigate, onQuickScan, isScanning,
}) => {
  const avgYield = batches.length
    ? (batches.reduce((s, b) => s + b.actualYield, 0) / batches.length).toFixed(1) + '%'
    : '0%';
  const totalOrderVolume = (orders.reduce((s, o) => s + o.quantity, 0) / 1000).toFixed(1) + ' MT';
  const criticalStock = inventory.filter(i => i.balanceToPurchase && i.balanceToPurchase > 0).length;
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const liabilities = expenses.filter(e => e.status === 'Pending').reduce((s, e) => s + e.amount, 0);
  const payroll = employees.reduce((s, e) => s + e.salary, 0);

  const statMap: Record<WidgetId, { title: string; value: string | number; icon: React.ElementType; color?: string }> = {
    stats_yield:     { title: 'Yield Accuracy',  value: avgYield,                   icon: Activity },
    stats_orders:    { title: 'Order Volume',     value: totalOrderVolume,            icon: Package },
    stats_markets:   { title: 'Active Markets',   value: markets.length,              icon: Globe },
    stats_pipeline:  { title: 'Pipeline Value',   value: '$4.8M',                    icon: LineChart },
    stats_inventory: { title: 'Critical Stock',   value: criticalStock,               icon: AlertTriangle, color: 'text-red-400' },
    stats_vendors:   { title: 'Active Vendors',   value: vendors.length,              icon: Truck },
    stats_expenses:  { title: 'Total Expenses',   value: `$${totalExpenses.toLocaleString()}`, icon: Wallet },
    stats_liability: { title: 'Liabilities',      value: `$${liabilities.toLocaleString()}`,  icon: AlertCircle, color: 'text-red-400' },
    stats_staff:     { title: 'Staff Count',      value: employees.length,            icon: Users },
    stats_rd:        { title: 'R&D Projects',     value: rdProjects.length,           icon: Beaker },
    stats_samples:   { title: 'Active Samples',   value: samples.length,              icon: PackageSearch },
    // feed entries (not used in stat grid)
    feed_ai: { title: '', value: '', icon: Activity },
    feed_batches: { title: '', value: '', icon: Activity },
    feed_inventory: { title: '', value: '', icon: Activity },
    feed_orders: { title: '', value: '', icon: Activity },
    feed_hr: { title: '', value: '', icon: Activity },
    feed_finance: { title: '', value: '', icon: Activity },
  };

  const activeStats = visibleWidgets.filter(id => id.startsWith('stats_'));
  const activeFeeds = visibleWidgets.filter(id => id.startsWith('feed_'));

  // Chart data
  const customerChart = orders
    .reduce<{ name: string; value: number }[]>((acc, o) => {
      const ex = acc.find(c => c.name === o.customer);
      if (ex) ex.value += Number(o.amountUSD) || 0;
      else acc.push({ name: o.customer, value: Number(o.amountUSD) || 0 });
      return acc;
    }, [])
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const expenseChart = expenses.reduce<{ name: string; value: number }[]>((acc, e) => {
    const ex = acc.find(c => c.name === e.category);
    if (ex) ex.value += e.amount;
    else acc.push({ name: e.category, value: e.amount });
    return acc;
  }, []);

  const renderFeed = (id: WidgetId) => {
    switch (id) {
      case 'feed_ai':
        return (
          <div className="space-y-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Live Insights</span>
              <button
                onClick={onQuickScan}
                disabled={isScanning}
                className="text-xs flex items-center gap-1 text-[#F4C430] hover:text-white transition-colors bg-[#F4C430]/10 px-2 py-1 rounded border border-[#F4C430]/20 disabled:opacity-50"
              >
                <Bolt size={12}/> {isScanning ? 'Scanning…' : 'Fast Scan'}
              </button>
            </div>
            {insights.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">No critical alerts. Operations normal.</p>
            ) : insights.map((insight, i) => (
              <div key={i} className={`p-3 rounded-lg border flex gap-3 ${insight.severity === 'critical' ? 'bg-red-500/10 border-red-500/20' : 'bg-slate-800/50 border-white/5'}`}>
                <AlertTriangle className={insight.severity === 'critical' ? 'text-red-400' : 'text-[#F4C430]'} size={16}/>
                <div>
                  <h4 className="text-[10px] font-bold text-white uppercase mb-0.5">{insight.type}</h4>
                  <p className="text-xs text-slate-300">{insight.message}</p>
                </div>
              </div>
            ))}
          </div>
        );
      case 'feed_batches':
        return (
          <div className="space-y-2">
            {batches.slice(0, 3).map(b => (
              <div key={b.id} className="flex justify-between items-center p-3 bg-slate-800/30 rounded border border-white/5">
                <div>
                  <p className="text-[#D4AF37] text-xs font-mono">{b.id}</p>
                  <p className="text-white text-sm font-bold truncate max-w-[160px]">{b.product}</p>
                </div>
                <span className={`text-[9px] px-2 py-0.5 rounded-full border ${b.status === 'Completed' ? 'text-green-500 border-green-500/20' : 'text-blue-500 border-blue-500/20'}`}>{b.status}</span>
              </div>
            ))}
          </div>
        );
      case 'feed_orders':
        return (
          <div className="space-y-2">
            {orders.slice(0, 3).map(o => (
              <div key={o.id} className="p-3 bg-slate-800/30 rounded border border-white/5">
                <div className="flex justify-between">
                  <span className="text-[#D4AF37] text-xs font-bold">{o.customer}</span>
                  <span className="text-xs text-slate-400">{o.status}</span>
                </div>
                <p className="text-white text-xs mt-0.5 truncate">{o.product}</p>
                <p className="text-slate-500 text-[10px] font-mono">${Number(o.amountUSD).toLocaleString()}</p>
              </div>
            ))}
          </div>
        );
      case 'feed_inventory': {
        const alerts = inventory.filter(i => i.balanceToPurchase && i.balanceToPurchase > 0);
        return alerts.length === 0
          ? <p className="text-slate-500 text-sm">Stock levels healthy.</p>
          : (
            <div className="space-y-2">
              {alerts.slice(0, 4).map(i => (
                <div key={i.id} className="flex items-center gap-3 p-3 bg-red-500/10 rounded border border-red-500/20">
                  <AlertCircle className="text-red-400 shrink-0" size={14}/>
                  <div className="min-w-0">
                    <p className="text-white text-xs font-bold truncate">{i.name}</p>
                    <p className="text-[10px] text-red-300">Shortage: {i.balanceToPurchase} {i.unit}</p>
                  </div>
                </div>
              ))}
            </div>
          );
      }
      case 'feed_hr':
        return (
          <div className="space-y-2">
            {employees.slice(0, 3).map(e => (
              <div key={e.id} className="flex items-center gap-3 p-3 bg-slate-800/30 rounded border border-white/5">
                <div className="w-8 h-8 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] font-bold text-xs shrink-0">{e.name.charAt(0)}</div>
                <div>
                  <p className="text-white text-xs font-bold">{e.name}</p>
                  <p className="text-[10px] text-slate-500">{e.role}</p>
                </div>
              </div>
            ))}
          </div>
        );
      case 'feed_finance':
        return (
          <div className="space-y-2">
            {expenses.slice(0, 3).map(e => (
              <div key={e.id} className="flex justify-between items-center p-3 bg-slate-800/30 rounded border border-white/5">
                <div>
                  <p className="text-white text-xs font-bold truncate max-w-[140px]">{e.description}</p>
                  <p className="text-[10px] text-slate-500">{e.dueDate}</p>
                </div>
                <div className="text-right">
                  <p className="text-[#D4AF37] text-xs font-mono">${e.amount.toLocaleString()}</p>
                  <span className={`text-[9px] uppercase font-bold ${e.status === 'Paid' ? 'text-green-500' : 'text-yellow-500'}`}>{e.status}</span>
                </div>
              </div>
            ))}
          </div>
        );
      default: return null;
    }
  };

  const feedLabel = (id: WidgetId) => ALL_WIDGETS.find(w => w.id === id)?.label ?? id;
  const feedSpan = (id: WidgetId) => id === 'feed_ai' ? 'lg:col-span-2' : '';

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <LayoutDashboard className="text-[#F4C430]" size={20}/> Executive Overview
        </h2>
        <button
          onClick={onOpenCustomize}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-white/10 text-sm font-bold transition-all"
        >
          <Grip size={15}/> Customize
        </button>
      </div>

      {/* Stat Cards */}
      {activeStats.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          {activeStats.map(id => {
            const s = statMap[id];
            return (
              <StatCard key={id} title={s.title} value={s.value} icon={s.icon as React.ComponentType<{ size?: number; className?: string }>} color={s.color} />
            );
          })}
        </div>
      )}

      {/* Feed Widgets */}
      {activeFeeds.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {activeFeeds.map(id => (
            <div key={id} className={`${feedSpan(id)} bg-slate-900/50 border border-[#D4AF37]/30 rounded-xl p-5 gold-glow`}>
              <h3 className="text-base font-bold text-white mb-4">{feedLabel(id)}</h3>
              {renderFeed(id)}
            </div>
          ))}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-xl">
          <h3 className="text-sm font-bold text-white mb-4">Revenue by Customer</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={customerChart}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tick={{ fill: '#64748b' }}/>
                <YAxis stroke="#94a3b8" fontSize={9} tickFormatter={v => '$' + (v / 1000) + 'k'} tick={{ fill: '#64748b' }}/>
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px' }}/>
                <Bar dataKey="value" fill="#4f46e5" radius={[3, 3, 0, 0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-xl">
          <h3 className="text-sm font-bold text-white mb-4">Expense Breakdown</h3>
          <div className="h-56 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={expenseChart} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name }) => name}>
                  {expenseChart.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                </Pie>
                <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px' }} formatter={(v: number) => [`$${v.toLocaleString()}`, 'Amount']}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-slate-900/50 border border-[#D4AF37]/20 rounded-xl p-4">
        <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-3">Quick Access</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: 'Log Batch', tab: 'production' },
            { label: 'Add Order', tab: 'sales' },
            { label: 'Procurement', tab: 'procurement' },
            { label: 'AI Command', tab: 'ai' },
          ].map(q => (
            <button
              key={q.tab}
              onClick={() => onNavigate(q.tab)}
              className="px-3 py-2 bg-slate-800 hover:bg-[#D4AF37]/10 text-slate-300 hover:text-[#D4AF37] rounded-lg text-xs font-bold transition-all border border-white/5 hover:border-[#D4AF37]/30"
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* Customize Modal */}
      {isCustomizeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <h2 className="text-base font-bold text-white">Customize Dashboard</h2>
              <button onClick={onCloseCustomize} className="text-slate-500 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-all">✕</button>
            </div>
            <div className="p-5 space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
              {ALL_WIDGETS.map(w => {
                const active = visibleWidgets.includes(w.id);
                return (
                  <label key={w.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-all">
                    <input
                      type="checkbox" checked={active}
                      onChange={e => {
                        const next = e.target.checked
                          ? [...visibleWidgets, w.id]
                          : visibleWidgets.filter(id => id !== w.id);
                        onSaveWidgets(next);
                      }}
                      className="w-4 h-4 accent-[#D4AF37]"
                    />
                    <div>
                      <p className="text-white text-sm font-medium">{w.label}</p>
                      <p className="text-slate-500 text-[10px]">{w.category} · {w.type}</p>
                    </div>
                  </label>
                );
              })}
            </div>
            <div className="p-4 border-t border-white/5 text-right">
              <button onClick={onCloseCustomize} className="px-5 py-2 bg-[#D4AF37] hover:bg-[#c4a030] text-slate-950 font-bold text-sm rounded-lg">Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
