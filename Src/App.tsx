import React, { useState, useCallback } from 'react';
import { useAppState } from '@/hooks/useAppState';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Modal } from '@/components/shared/Modal';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { SettingsModal } from '@/components/shared/SettingsModal';
import { Dashboard } from '@/components/windows/Dashboard';
import { Manufacturing } from '@/components/windows/Manufacturing';
import { Inventory } from '@/components/windows/Inventory';
import { Sales } from '@/components/windows/Sales';
import { Procurement } from '@/components/windows/Procurement';
import { Accounting } from '@/components/windows/Accounting';
import { HRAdmin } from '@/components/windows/HRAdmin';
import { RDLab } from '@/components/windows/RDLab';
import { IndustrialStudio } from '@/components/windows/IndustrialStudio';
import { BusinessDev } from '@/components/windows/BusinessDev';
import { Samples } from '@/components/windows/Samples';
import { Calculator } from '@/components/windows/Calculator';
import { AICommand } from '@/components/windows/AICommand';
import { AuditHistory } from '@/components/windows/AuditHistory';
import { analyzeOperations, optimizeFormulation } from '@/services/gemini';
import { callAIProxy, extractText } from '@/services/aiProxy';
import type { RDProject, ChatSession } from '@/types';

const App: React.FC = () => {
  const state = useAppState();
  const [isScanning, setIsScanning] = useState(false);

  // ── Dashboard quick scan ────────────────────────────────────────────────────
  const handleQuickScan = useCallback(async () => {
    setIsScanning(true);
    try {
      const results = await analyzeOperations(
        state.batches, state.inventory, state.orders,
        state.expenses, state.employees
      );
      state.setInsights(results);
    } catch {/* ignore */} finally {
      setIsScanning(false);
    }
  }, [state]);

  // ── Calculator ──────────────────────────────────────────────────────────────
  const handleCalculate = useCallback(() => {
    const d = state.calcData;
    const totalCostPerKg = d.rmc + d.labor + d.packing + d.logistics;
    const shippingPerKg = d.volume > 0 ? d.shippingCost / d.volume : 0;
    const totalCostWithShipping = totalCostPerKg + shippingPerKg;
    const grossProfit = (d.targetPrice - totalCostWithShipping) * d.volume;
    const grossMarginPct = d.targetPrice > 0 ? ((d.targetPrice - totalCostWithShipping) / d.targetPrice) * 100 : 0;
    const totalRevenue = d.targetPrice * d.volume;
    const totalCost = totalCostWithShipping * d.volume;

    state.setCalcResults({
      'Revenue': totalRevenue,
      'Total Cost': totalCost,
      'Gross Profit': grossProfit,
      'Gross Margin %': grossMarginPct,
      'Cost / Kg': totalCostWithShipping,
      'Shipping / Kg': shippingPerKg,
    });
  }, [state]);

  const handleCalcReset = useCallback(() => {
    state.setCalcData({
      product: '', volume: 0, targetPrice: 0, rmc: 0,
      labor: 0, packing: 0, logistics: 0, shippingCost: 0,
      shippingMethod: 'CIF by Air - Muscat Airport',
    });
    state.setCalcResults(null);
  }, [state]);

  // ── R&D Optimize ────────────────────────────────────────────────────────────
  const handleOptimizeRD = useCallback(async (project: RDProject): Promise<string> => {
    return optimizeFormulation(project);
  }, []);

  // ── Industrial file analysis ────────────────────────────────────────────────
  const handleAnalyzeFile = useCallback(async (file: File): Promise<string> => {
    try {
      // Read file as text for non-binary files
      const text = await file.text().catch(() => `[Binary file: ${file.name}]`);
      const preview = text.slice(0, 3000);
      const res = await callAIProxy({
        provider: 'gemini',
        model: 'gemini-2.0-flash',
        system: 'You are a pharmaceutical document analyst. Analyze the document and provide key insights.',
        messages: [{
          role: 'user',
          content: `Analyze this pharmaceutical document:\n\nFilename: ${file.name}\n\nContent:\n${preview}\n\nProvide: 1) Document type 2) Key data points 3) Quality/compliance flags 4) Action items`,
        }],
      });
      return extractText(res, 'gemini') || 'Analysis complete.';
    } catch (e) {
      return `Analysis failed: ${String(e)}`;
    }
  }, []);

  // ── AI chat session handlers ────────────────────────────────────────────────
  const handleSetSessions = useCallback((fn: (prev: ChatSession[]) => ChatSession[]) => {
    state.setChatSessions(fn);
  }, [state]);

  const criticalCount = state.insights.filter(i => i.severity === 'critical').length;

  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
      <Sidebar activeTab={state.activeTab} onTabChange={state.setActiveTab}/>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          activeTab={state.activeTab}
          isMobileMenuOpen={state.isMobileMenuOpen}
          onToggleMobile={() => state.setIsMobileMenuOpen(p => !p)}
          onTabChange={state.setActiveTab}
          onSettings={() => state.setIsSettingsOpen(true)}
          criticalCount={criticalCount}
        />

        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6">
          {state.activeTab === 'dashboard' && (
            <Dashboard
              batches={state.batches}
              inventory={state.inventory}
              orders={state.orders}
              expenses={state.expenses}
              employees={state.employees}
              vendors={state.vendors}
              rdProjects={state.rdProjects}
              samples={state.samples}
              markets={state.markets}
              insights={state.insights}
              visibleWidgets={state.visibleWidgets}
              isCustomizeOpen={state.isCustomizeOpen}
              onOpenCustomize={() => state.setIsCustomizeOpen(true)}
              onSaveWidgets={state.saveWidgets}
              onCloseCustomize={() => state.setIsCustomizeOpen(false)}
              onNavigate={tab => state.setActiveTab(tab as never)}
              onQuickScan={handleQuickScan}
              isScanning={isScanning}
            />
          )}
          {state.activeTab === 'production' && (
            <Manufacturing
              batches={state.batches}
              onOpenModal={state.openModal}
              onDelete={state.handleDelete}
            />
          )}
          {state.activeTab === 'inventory' && (
            <Inventory
              inventory={state.inventory}
              onOpenModal={state.openModal}
              onDelete={state.handleDelete}
              onNavigate={tab => state.setActiveTab(tab as never)}
            />
          )}
          {state.activeTab === 'sales' && (
            <Sales
              orders={state.orders}
              onOpenModal={state.openModal}
            />
          )}
          {state.activeTab === 'procurement' && (
            <Procurement
              inventory={state.inventory}
              vendors={state.vendors}
              onOpenModal={state.openModal}
              onDelete={state.handleDelete}
            />
          )}
          {state.activeTab === 'accounting' && (
            <Accounting
              expenses={state.expenses}
              onOpenModal={state.openModal}
              onDelete={state.handleDelete}
            />
          )}
          {state.activeTab === 'hr' && (
            <HRAdmin
              employees={state.employees}
              onOpenModal={state.openModal}
              onDelete={state.handleDelete}
            />
          )}
          {state.activeTab === 'rd' && (
            <RDLab
              rdProjects={state.rdProjects}
              onOpenModal={state.openModal}
              onDelete={state.handleDelete}
              onUpdateProject={p => state.setRdProjects(prev => prev.map(x => x.id === p.id ? p : x))}
              onOptimize={handleOptimizeRD}
            />
          )}
          {state.activeTab === 'industrial' && (
            <IndustrialStudio onAnalyzeFile={handleAnalyzeFile}/>
          )}
          {state.activeTab === 'bd' && (
            <BusinessDev
              bdLeads={state.bdLeads}
              markets={state.markets}
              onOpenModal={state.openModal}
              onDelete={state.handleDelete}
            />
          )}
          {state.activeTab === 'samples' && (
            <Samples
              samples={state.samples}
              onOpenModal={state.openModal}
              onDelete={state.handleDelete}
            />
          )}
          {state.activeTab === 'costing' && (
            <Calculator
              calcData={state.calcData}
              calcResults={state.calcResults}
              rdProjects={state.rdProjects}
              onDataChange={state.setCalcData}
              onCalculate={handleCalculate}
              onReset={handleCalcReset}
            />
          )}
          {state.activeTab === 'ai' && (
            <AICommand
              chatSessions={state.chatSessions}
              activeChatId={state.activeChatId}
              activeProvider={state.activeProvider as never}
              onSetSessions={handleSetSessions}
              onSetActiveChat={state.setActiveChatId}
              onSetProvider={state.setActiveProvider as never}
            />
          )}
          {state.activeTab === 'history' && (
            <AuditHistory
              auditLogs={state.auditLogs}
              onClear={() => state.logAudit('CLEAR_AUDIT', 'Audit log cleared by user')}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      <Modal modal={state.modal} onSave={state.handleSave} onClose={state.closeModal}/>
      <ConfirmDialog
        isOpen={state.confirmDialog.isOpen}
        message={state.confirmDialog.message}
        onConfirm={state.confirmDialog.onConfirm}
        onCancel={() => state.setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
      <SettingsModal
        isOpen={state.isSettingsOpen}
        config={state.apiConfig}
        onSave={state.saveApiConfig}
        onClose={() => state.setIsSettingsOpen(false)}
      />
    </div>
  );
};

export default App;
