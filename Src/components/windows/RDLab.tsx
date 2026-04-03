import React, { useState } from 'react';
import { Beaker, Plus, Edit2, Trash2, Search, ChevronDown, Wand2, Download } from 'lucide-react';
import type { RDProject, Ingredient, ModalState } from '@/types';
import { StatusBadge } from '@/components/shared/StatusBadge';

interface Props {
  rdProjects: RDProject[];
  onOpenModal: (mode: ModalState['mode'], type: ModalState['type'], data?: Record<string, unknown>) => void;
  onDelete: (type: string, id: string, name: string) => void;
  onUpdateProject: (project: RDProject) => void;
  onOptimize: (project: RDProject) => Promise<string>;
}

export const RDLab: React.FC<Props> = ({ rdProjects, onOpenModal, onDelete, onUpdateProject, onOptimize }) => {
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(rdProjects[0]?.id ?? null);
  const [optimizing, setOptimizing] = useState<string | null>(null);
  const [aiNotes, setAiNotes] = useState<Record<string, string>>({});

  const filtered = rdProjects.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleOptimize = async (p: RDProject) => {
    setOptimizing(p.id);
    const result = await onOptimize(p);
    setAiNotes(prev => ({ ...prev, [p.id]: result }));
    setOptimizing(null);
  };

  const handleIngredientChange = (project: RDProject, idx: number, field: keyof Ingredient, value: unknown) => {
    const ings = project.ingredients.map((ing, i) => {
      if (i !== idx) return ing;
      const updated = { ...ing, [field]: value };
      updated.cost = Number((Number(updated.quantity) * Number(updated.rateUSD)).toFixed(3));
      return updated;
    });
    const totalRMC = Number(ings.reduce((s, i) => s + i.cost, 0).toFixed(3));
    const totalFinalRMC = Number(((totalRMC / project.batchSize) + project.loss).toFixed(3));
    onUpdateProject({ ...project, ingredients: ings, totalRMC, totalFinalRMC });
  };

  const newProject = (): Record<string, unknown> => ({
    id: `RD-${Date.now()}`, title: '', status: 'Formulation', optimizationScore: 0,
    lastUpdated: new Date().toISOString().split('T')[0], batchSize: 100, batchUnit: 'Kg',
    totalRMC: 0, loss: 0.02, totalFinalRMC: 0, ingredients: [],
  });

  return (
    <div className="space-y-5 animate-fadeIn pb-8">
      <div className="flex flex-wrap gap-3 justify-between items-center">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Beaker className="text-[#F4C430]" size={20}/> R&D Formulation Lab
        </h2>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13}/>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search projects…"
              className="bg-slate-800/50 border border-white/10 text-white rounded-lg pl-8 pr-3 py-2 text-sm focus:border-[#D4AF37]/50 focus:outline-none w-48"
            />
          </div>
          <button onClick={() => onOpenModal('add', 'rd', newProject())} className="erp-btn-gold">
            <Plus size={15}/> New Project
          </button>
        </div>
      </div>

      {/* Project List */}
      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className="bg-slate-900/50 border border-[#D4AF37]/20 rounded-xl p-8 text-center text-slate-500">
            No R&D projects match your search.
          </div>
        )}
        {filtered.map(project => {
          const isExpanded = expandedId === project.id;
          return (
            <div key={project.id} className="bg-slate-900/50 border border-[#D4AF37]/30 rounded-xl overflow-hidden gold-glow">
              {/* Project Header */}
              <div
                className="p-4 flex flex-wrap justify-between items-center gap-3 cursor-pointer hover:bg-white/5 transition-all"
                onClick={() => setExpandedId(isExpanded ? null : project.id)}
              >
                <div className="flex items-center gap-3">
                  <ChevronDown size={16} className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}/>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-white font-bold text-sm">{project.title}</h3>
                      <StatusBadge status={project.status}/>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">{project.id} · Updated {project.lastUpdated}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Batch RMC</p>
                    <p className="text-sm text-[#D4AF37] font-bold font-mono">${project.totalRMC.toFixed(2)}</p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">Score</p>
                    <p className={`text-sm font-bold ${project.optimizationScore >= 90 ? 'text-green-400' : project.optimizationScore >= 70 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {project.optimizationScore}%
                    </p>
                  </div>
                  <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => handleOptimize(project)}
                      disabled={optimizing === project.id}
                      className="p-1.5 rounded hover:bg-purple-500/20 text-purple-400 transition-all disabled:opacity-50"
                      title="AI Optimize"
                    >
                      <Wand2 size={13}/>
                    </button>
                    <button onClick={() => onOpenModal('edit', 'rd', project as unknown as Record<string, unknown>)} className="p-1.5 rounded hover:bg-yellow-500/20 text-[#F4C430]"><Edit2 size={13}/></button>
                    <button onClick={() => onDelete('rd', project.id, project.title)} className="p-1.5 rounded hover:bg-red-500/20 text-red-400"><Trash2 size={13}/></button>
                  </div>
                </div>
              </div>

              {/* Expanded: Ingredient Table */}
              {isExpanded && (
                <div className="border-t border-white/5 p-4 space-y-4">
                  {/* Summary */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Batch Size', value: `${project.batchSize} ${project.batchUnit}` },
                      { label: 'Total RMC', value: `$${project.totalRMC.toFixed(2)}` },
                      { label: 'Loss Factor', value: project.loss },
                      { label: 'Final RMC/Kg', value: `$${project.totalFinalRMC.toFixed(3)}` },
                    ].map(s => (
                      <div key={s.label} className="bg-slate-950/40 rounded-lg p-3 border border-white/5">
                        <p className="text-[9px] text-slate-500 uppercase font-bold">{s.label}</p>
                        <p className="text-[#D4AF37] font-bold text-sm">{s.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Ingredients */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="text-[9px] text-slate-500 uppercase border-b border-white/5">
                          <th className="pb-2 px-2">#</th>
                          <th className="pb-2 px-2">Ingredient</th>
                          <th className="pb-2 px-2">Role</th>
                          <th className="pb-2 px-2 text-right">Qty (Kg)</th>
                          <th className="pb-2 px-2 text-right">Rate $</th>
                          <th className="pb-2 px-2 text-right">Cost $</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {project.ingredients.map((ing, idx) => (
                          <tr key={idx} className="hover:bg-white/5">
                            <td className="py-2 px-2 text-slate-500 text-xs">{ing.sNo || idx + 1}</td>
                            <td className="py-2 px-2 text-white font-medium text-xs">{ing.name}</td>
                            <td className="py-2 px-2">
                              <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">{ing.role}</span>
                            </td>
                            <td className="py-2 px-2 text-right">
                              <input
                                type="number" value={ing.quantity}
                                onChange={e => handleIngredientChange(project, idx, 'quantity', Number(e.target.value))}
                                className="w-20 bg-slate-800/50 border border-white/10 text-white rounded px-2 py-1 text-xs text-right focus:border-[#D4AF37]/50 focus:outline-none"
                              />
                            </td>
                            <td className="py-2 px-2 text-right">
                              <input
                                type="number" value={ing.rateUSD}
                                onChange={e => handleIngredientChange(project, idx, 'rateUSD', Number(e.target.value))}
                                className="w-20 bg-slate-800/50 border border-white/10 text-white rounded px-2 py-1 text-xs text-right focus:border-[#D4AF37]/50 focus:outline-none"
                              />
                            </td>
                            <td className="py-2 px-2 text-right font-mono text-[#D4AF37] text-xs">{ing.cost.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* AI Notes */}
                  {(aiNotes[project.id] || optimizing === project.id) && (
                    <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-4">
                      <p className="text-[10px] text-purple-400 uppercase font-bold mb-2 flex items-center gap-1.5">
                        <Wand2 size={10}/> AI Optimization Notes
                      </p>
                      {optimizing === project.id
                        ? <div className="animate-pulse text-slate-500 text-xs">Analyzing formulation…</div>
                        : <p className="text-slate-300 text-xs whitespace-pre-wrap">{aiNotes[project.id]}</p>
                      }
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
