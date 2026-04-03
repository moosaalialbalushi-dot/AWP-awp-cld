import { useState, useCallback, useEffect } from 'react';
import {
  INITIAL_BATCHES, INITIAL_INVENTORY, INITIAL_ORDERS, INITIAL_EXPENSES,
  INITIAL_EMPLOYEES, INITIAL_VENDORS, INITIAL_BD, INITIAL_SAMPLES,
  INITIAL_MARKETS, INITIAL_RD, ALL_WIDGETS,
} from '@/data/initial';
import type {
  Batch, InventoryItem, Order, Expense, Employee, Vendor,
  BDLead, SampleStatus, Market, RDProject, AuditLog,
  COOInsight, TabId, WidgetId, ModalState, ApiConfig, CalcData, ChatSession,
} from '@/types';
import { generateId, today } from '@/lib/utils';
import { db } from '@/services/database';

export function useAppState() {
  // ── Navigation ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dbReady, setDbReady] = useState(false);

  // ── Data ─────────────────────────────────────────────────────────────────────
  const [batches, setBatches] = useState<Batch[]>(INITIAL_BATCHES);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [vendors, setVendors] = useState<Vendor[]>(INITIAL_VENDORS);
  const [bdLeads, setBdLeads] = useState<BDLead[]>(INITIAL_BD);
  const [samples, setSamples] = useState<SampleStatus[]>(INITIAL_SAMPLES);
  const [markets, setMarkets] = useState<Market[]>(INITIAL_MARKETS);
  const [rdProjects, setRdProjects] = useState<RDProject[]>(INITIAL_RD);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [insights, setInsights] = useState<COOInsight[]>([]);

  // ── Dashboard ─────────────────────────────────────────────────────────────
  const [visibleWidgets, setVisibleWidgets] = useState<WidgetId[]>(() => {
    try {
      const s = localStorage.getItem('erp_v2_widgets');
      return s ? JSON.parse(s) : ALL_WIDGETS.filter(w => w.default).map(w => w.id);
    } catch { return ALL_WIDGETS.filter(w => w.default).map(w => w.id); }
  });
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  // ── Settings / API Config ──────────────────────────────────────────────────
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiConfig, setApiConfig] = useState<ApiConfig>(() => {
    try {
      const s = localStorage.getItem('erp_v2_api_config');
      return s ? JSON.parse(s) : { claudeKey: '', notebookLmSource: '', supabaseUrl: '', supabaseKey: '' };
    } catch { return { claudeKey: '', notebookLmSource: '', supabaseUrl: '', supabaseKey: '' }; }
  });

  // ── Modal ─────────────────────────────────────────────────────────────────
  const [modal, setModal] = useState<ModalState>({
    isOpen: false, mode: 'add', type: null, data: {},
  });

  // ── Confirm Dialog ────────────────────────────────────────────────────────
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean; message: string; onConfirm: () => void;
  }>({ isOpen: false, message: '', onConfirm: () => {} });

  // ── AI chat sessions ───────────────────────────────────────────────────────
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeProvider, setActiveProvider] = useState<'Gemini' | 'OpenRouter'>('Gemini');

  // ── Calculator ────────────────────────────────────────────────────────────
  const [calcData, setCalcData] = useState<CalcData>({
    product: '', volume: 0, targetPrice: 0, rmc: 0,
    labor: 0, packing: 0, logistics: 0, shippingCost: 0,
    shippingMethod: 'CIF by Air - Muscat Airport',
  });
  const [calcResults, setCalcResults] = useState<Record<string, number> | null>(null);

  // ═══════════════════════════════════════════════════════════════════
  // Supabase: Load data on mount (falls back to initial data)
  // ═══════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!db.isReady()) { setDbReady(false); return; }

    let cancelled = false;
    (async () => {
      const [
        dbBatches, dbInventory, dbOrders, dbExpenses, dbEmployees,
        dbVendors, dbBdLeads, dbSamples, dbMarkets, dbRdProjects, dbAuditLogs,
      ] = await Promise.all([
        db.batches(), db.inventory(), db.orders(), db.expenses(), db.employees(),
        db.vendors(), db.bdLeads(), db.samples(), db.markets(), db.rdProjects(), db.auditLogs(),
      ]);

      if (cancelled) return;

      // If DB has data, use it; otherwise seed with initial data
      const hasData = (dbBatches?.length ?? 0) > 0 || (dbOrders?.length ?? 0) > 0;
      if (hasData) {
        if (dbBatches) setBatches(dbBatches);
        if (dbInventory) setInventory(dbInventory);
        if (dbOrders) setOrders(dbOrders);
        if (dbExpenses) setExpenses(dbExpenses);
        if (dbEmployees) setEmployees(dbEmployees);
        if (dbVendors) setVendors(dbVendors);
        if (dbBdLeads) setBdLeads(dbBdLeads);
        if (dbSamples) setSamples(dbSamples);
        if (dbMarkets) setMarkets(dbMarkets);
        if (dbRdProjects) setRdProjects(dbRdProjects);
        if (dbAuditLogs) setAuditLogs(dbAuditLogs);
      } else {
        // First run — seed the database with initial demo data
        await db.seedAll({
          batches: INITIAL_BATCHES, inventory: INITIAL_INVENTORY,
          orders: INITIAL_ORDERS, expenses: INITIAL_EXPENSES,
          employees: INITIAL_EMPLOYEES, vendors: INITIAL_VENDORS,
          bdLeads: INITIAL_BD, samples: INITIAL_SAMPLES,
          markets: INITIAL_MARKETS, rdProjects: INITIAL_RD,
        });
      }
      setDbReady(true);
    })();

    return () => { cancelled = true; };
  }, []);

  // ── Audit logging ─────────────────────────────────────────────────────────
  const logAudit = useCallback((action: string, details: string) => {
    const log: AuditLog = {
      id: generateId('LOG'), action, user: 'Current User', details, timestamp: new Date().toISOString(),
    };
    setAuditLogs(prev => [log, ...prev]);
    db.saveAuditLog(log);
  }, []);

  // ── CRUD helpers ──────────────────────────────────────────────────────────
  const openModal = useCallback((mode: ModalState['mode'], type: ModalState['type'], data: Record<string, unknown> = {}) => {
    setModal({ isOpen: true, mode, type, data });
  }, []);

  const closeModal = useCallback(() => {
    setModal(prev => ({ ...prev, isOpen: false }));
  }, []);

  const saveWidgets = useCallback((ids: WidgetId[]) => {
    setVisibleWidgets(ids);
    localStorage.setItem('erp_v2_widgets', JSON.stringify(ids));
  }, []);

  const saveApiConfig = useCallback((cfg: ApiConfig) => {
    setApiConfig(cfg);
    localStorage.setItem('erp_v2_api_config', JSON.stringify(cfg));
  }, []);

  const handleSave = useCallback((type: ModalState['type'], data: Record<string, unknown>) => {
    const action = modal.mode === 'add' ? 'ADD' : 'EDIT';

    // Persist to Supabase in background
    if (type) db.saveByType(type, data);

    switch (type) {
      case 'production':
        setBatches(prev =>
          modal.mode === 'add' ? [...prev, data as unknown as Batch]
            : prev.map(b => b.id === (data as Batch).id ? { ...b, ...data } as Batch : b)
        );
        logAudit(`${action}_BATCH`, `Batch ${(data as Batch).id}`);
        break;
      case 'inventory':
        setInventory(prev =>
          modal.mode === 'add' ? [...prev, data as unknown as InventoryItem]
            : prev.map(i => i.id === (data as InventoryItem).id ? { ...i, ...data } as InventoryItem : i)
        );
        logAudit(`${action}_INVENTORY`, `Item ${(data as InventoryItem).name}`);
        break;
      case 'sales':
        setOrders(prev =>
          modal.mode === 'add' ? [...prev, data as unknown as Order]
            : prev.map(o => o.id === (data as Order).id ? { ...o, ...data } as Order : o)
        );
        logAudit(`${action}_ORDER`, `Order ${(data as Order).invoiceNo}`);
        break;
      case 'vendors':
      case 'procurement':
        setVendors(prev =>
          modal.mode === 'add' ? [...prev, data as unknown as Vendor]
            : prev.map(v => v.id === (data as Vendor).id ? { ...v, ...data } as Vendor : v)
        );
        logAudit(`${action}_VENDOR`, `Vendor ${(data as Vendor).name}`);
        break;
      case 'accounting':
        setExpenses(prev =>
          modal.mode === 'add' ? [...prev, data as unknown as Expense]
            : prev.map(e => e.id === (data as Expense).id ? { ...e, ...data } as Expense : e)
        );
        logAudit(`${action}_EXPENSE`, `${(data as Expense).description}`);
        break;
      case 'hr':
        setEmployees(prev =>
          modal.mode === 'add' ? [...prev, data as unknown as Employee]
            : prev.map(e => e.id === (data as Employee).id ? { ...e, ...data } as Employee : e)
        );
        logAudit(`${action}_EMPLOYEE`, `${(data as Employee).name}`);
        break;
      case 'rd':
        setRdProjects(prev =>
          modal.mode === 'add' ? [...prev, data as unknown as RDProject]
            : prev.map(p => p.id === (data as RDProject).id ? { ...p, ...data } as RDProject : p)
        );
        logAudit(`${action}_RD`, `Project ${(data as RDProject).id}`);
        break;
      case 'bd':
        setBdLeads(prev =>
          modal.mode === 'add' ? [...prev, data as unknown as BDLead]
            : prev.map(l => l.id === (data as BDLead).id ? { ...l, ...data } as BDLead : l)
        );
        logAudit(`${action}_BD`, `Lead ${(data as BDLead).opportunity}`);
        break;
      case 'samples':
        setSamples(prev =>
          modal.mode === 'add' ? [...prev, data as unknown as SampleStatus]
            : prev.map(s => s.id === (data as SampleStatus).id ? { ...s, ...data } as SampleStatus : s)
        );
        logAudit(`${action}_SAMPLE`, `Sample ${(data as SampleStatus).id}`);
        break;
      case 'markets':
        setMarkets(prev =>
          modal.mode === 'add' ? [...prev, data as unknown as Market]
            : prev.map(m => m.id === (data as Market).id ? { ...m, ...data } as Market : m)
        );
        logAudit(`${action}_MARKET`, `Market ${(data as Market).name}`);
        break;
    }
    closeModal();
  }, [modal.mode, logAudit, closeModal]);

  const handleDelete = useCallback((type: string, id: string, name: string) => {
    setConfirmDialog({
      isOpen: true,
      message: `Delete "${name}"? This cannot be undone.`,
      onConfirm: () => {
        // Delete from Supabase in background
        db.deleteRow(type, id);

        switch (type) {
          case 'production': setBatches(prev => prev.filter(b => b.id !== id)); break;
          case 'inventory':  setInventory(prev => prev.filter(i => i.id !== id)); break;
          case 'sales':      setOrders(prev => prev.filter(o => o.id !== id)); break;
          case 'vendors':
          case 'procurement':setVendors(prev => prev.filter(v => v.id !== id)); break;
          case 'accounting': setExpenses(prev => prev.filter(e => e.id !== id)); break;
          case 'hr':         setEmployees(prev => prev.filter(e => e.id !== id)); break;
          case 'rd':         setRdProjects(prev => prev.filter(p => p.id !== id)); break;
          case 'bd':         setBdLeads(prev => prev.filter(l => l.id !== id)); break;
          case 'samples':    setSamples(prev => prev.filter(s => s.id !== id)); break;
          case 'markets':    setMarkets(prev => prev.filter(m => m.id !== id)); break;
        }
        logAudit(`DELETE_${type.toUpperCase()}`, `Deleted: ${name} (id: ${id})`);
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      },
    });
  }, [logAudit]);

  // ── Bulk import (used by Universal File Reader) ───────────────────────────
  const importRecords = useCallback((type: string, records: Record<string, unknown>[]) => {
    for (const data of records) {
      if (!data.id) data.id = generateId(type.toUpperCase().slice(0, 3));
      db.saveByType(type, data);
    }
    switch (type) {
      case 'production': setBatches(prev => [...prev, ...records as unknown as Batch[]]); break;
      case 'inventory':  setInventory(prev => [...prev, ...records as unknown as InventoryItem[]]); break;
      case 'sales':      setOrders(prev => [...prev, ...records as unknown as Order[]]); break;
      case 'accounting': setExpenses(prev => [...prev, ...records as unknown as Expense[]]); break;
      case 'hr':         setEmployees(prev => [...prev, ...records as unknown as Employee[]]); break;
      case 'vendors':
      case 'procurement':setVendors(prev => [...prev, ...records as unknown as Vendor[]]); break;
      case 'rd':         setRdProjects(prev => [...prev, ...records as unknown as RDProject[]]); break;
      case 'bd':         setBdLeads(prev => [...prev, ...records as unknown as BDLead[]]); break;
      case 'samples':    setSamples(prev => [...prev, ...records as unknown as SampleStatus[]]); break;
      case 'markets':    setMarkets(prev => [...prev, ...records as unknown as Market[]]); break;
    }
    logAudit(`IMPORT_${type.toUpperCase()}`, `Imported ${records.length} record(s) via AI File Reader`);
  }, [logAudit]);

  return {
    // nav
    activeTab, setActiveTab, isMobileMenuOpen, setIsMobileMenuOpen,
    // data
    batches, setBatches, inventory, setInventory, orders, setOrders,
    expenses, setExpenses, employees, setEmployees, vendors, setVendors,
    bdLeads, setBdLeads, samples, setSamples, markets, setMarkets,
    rdProjects, setRdProjects, auditLogs, insights, setInsights,
    // dashboard
    visibleWidgets, isCustomizeOpen, setIsCustomizeOpen, saveWidgets,
    // settings
    isSettingsOpen, setIsSettingsOpen, apiConfig, saveApiConfig,
    // modal
    modal, openModal, closeModal, handleSave,
    // confirm
    confirmDialog, handleDelete,
    setConfirmDialog,
    // AI
    chatSessions, setChatSessions, activeChatId, setActiveChatId,
    activeProvider, setActiveProvider,
    // calc
    calcData, setCalcData, calcResults, setCalcResults,
    // utils
    logAudit, today,
    // DB
    dbReady, importRecords,
  };
}
