// ═══════════════════════════════════════════════════════════════════
// Supabase CRUD service — maps camelCase ↔ snake_case automatically
// Falls back to local state gracefully if Supabase is not configured.
// ═══════════════════════════════════════════════════════════════════

import { getSupabaseClient, isSupabaseConfigured } from './supabase';
import type {
  Batch, InventoryItem, Order, Expense, Employee, Vendor,
  BDLead, SampleStatus, Market, RDProject, AuditLog,
} from '@/types';

// ── Helpers ─────────────────────────────────────────────────────────

function toSnake(s: string): string {
  return s.replace(/[A-Z]/g, c => '_' + c.toLowerCase());
}
function toCamel(s: string): string {
  return s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function mapKeys(obj: Record<string, unknown>, fn: (k: string) => string): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) out[fn(k)] = v;
  return out;
}

function toDb<T>(row: T): Record<string, unknown> {
  return mapKeys(row as Record<string, unknown>, toSnake);
}
function fromDb<T>(row: Record<string, unknown>): T {
  const mapped = mapKeys(row, toCamel);
  delete mapped.createdAt;
  return mapped as T;
}

export function isSupabaseReady(): boolean {
  return isSupabaseConfigured();
}

// ── Generic CRUD ────────────────────────────────────────────────────

type TableName = 'batches' | 'inventory' | 'orders' | 'expenses' | 'employees'
  | 'vendors' | 'bd_leads' | 'samples' | 'markets' | 'rd_projects' | 'audit_logs';

async function fetchAll<T>(table: TableName): Promise<T[] | null> {
  const sb = getSupabaseClient();
  if (!sb) return null;
  const { data, error } = await sb.from(table).select('*').order('created_at', { ascending: false });
  if (error) { console.warn(`[DB] fetch ${table}:`, error.message); return null; }
  return (data ?? []).map(r => fromDb<T>(r));
}

async function upsertRow<T extends { id: string }>(table: TableName, row: T): Promise<boolean> {
  const sb = getSupabaseClient();
  if (!sb) return false;
  const { error } = await sb.from(table).upsert(toDb(row), { onConflict: 'id' });
  if (error) { console.warn(`[DB] upsert ${table}:`, error.message); return false; }
  return true;
}

async function deleteRow(table: TableName, id: string): Promise<boolean> {
  const sb = getSupabaseClient();
  if (!sb) return false;
  const { error } = await sb.from(table).delete().eq('id', id);
  if (error) { console.warn(`[DB] delete ${table}:`, error.message); return false; }
  return true;
}

async function bulkUpsert<T extends { id: string }>(table: TableName, rows: T[]): Promise<boolean> {
  const sb = getSupabaseClient();
  if (!sb || rows.length === 0) return false;
  const { error } = await sb.from(table).upsert(rows.map(r => toDb(r)), { onConflict: 'id' });
  if (error) { console.warn(`[DB] bulk upsert ${table}:`, error.message); return false; }
  return true;
}

// ── Entity-specific exports ─────────────────────────────────────────

const TABLE_MAP: Record<string, TableName> = {
  production: 'batches',
  inventory: 'inventory',
  sales: 'orders',
  procurement: 'vendors',
  vendors: 'vendors',
  accounting: 'expenses',
  hr: 'employees',
  rd: 'rd_projects',
  bd: 'bd_leads',
  samples: 'samples',
  markets: 'markets',
};

export const db = {
  isReady: isSupabaseReady,

  batches:    () => fetchAll<Batch>('batches'),
  inventory:  () => fetchAll<InventoryItem>('inventory'),
  orders:     () => fetchAll<Order>('orders'),
  expenses:   () => fetchAll<Expense>('expenses'),
  employees:  () => fetchAll<Employee>('employees'),
  vendors:    () => fetchAll<Vendor>('vendors'),
  bdLeads:    () => fetchAll<BDLead>('bd_leads'),
  samples:    () => fetchAll<SampleStatus>('samples'),
  markets:    () => fetchAll<Market>('markets'),
  rdProjects: () => fetchAll<RDProject>('rd_projects'),
  auditLogs:  () => fetchAll<AuditLog>('audit_logs'),

  saveBatch:    (r: Batch) => upsertRow('batches', r),
  saveInventory:(r: InventoryItem) => upsertRow('inventory', r),
  saveOrder:    (r: Order) => upsertRow('orders', r),
  saveExpense:  (r: Expense) => upsertRow('expenses', r),
  saveEmployee: (r: Employee) => upsertRow('employees', r),
  saveVendor:   (r: Vendor) => upsertRow('vendors', r),
  saveBdLead:   (r: BDLead) => upsertRow('bd_leads', r),
  saveSample:   (r: SampleStatus) => upsertRow('samples', r),
  saveMarket:   (r: Market) => upsertRow('markets', r),
  saveRdProject:(r: RDProject) => upsertRow('rd_projects', r),
  saveAuditLog: (r: AuditLog) => upsertRow('audit_logs', r),

  deleteRow: (entityType: string, id: string) => {
    const table = TABLE_MAP[entityType];
    return table ? deleteRow(table, id) : Promise.resolve(false);
  },

  seedAll: async (data: {
    batches: Batch[]; inventory: InventoryItem[]; orders: Order[];
    expenses: Expense[]; employees: Employee[]; vendors: Vendor[];
    bdLeads: BDLead[]; samples: SampleStatus[]; markets: Market[];
    rdProjects: RDProject[];
  }) => {
    if (!isSupabaseReady()) return;
    await Promise.all([
      bulkUpsert('batches', data.batches),
      bulkUpsert('inventory', data.inventory),
      bulkUpsert('orders', data.orders),
      bulkUpsert('expenses', data.expenses),
      bulkUpsert('employees', data.employees),
      bulkUpsert('vendors', data.vendors),
      bulkUpsert('bd_leads', data.bdLeads),
      bulkUpsert('samples', data.samples),
      bulkUpsert('markets', data.markets),
      bulkUpsert('rd_projects', data.rdProjects),
    ]);
  },

  saveByType: (entityType: string, data: Record<string, unknown>) => {
    const table = TABLE_MAP[entityType];
    if (!table || !data.id) return Promise.resolve(false);
    return upsertRow(table, data as { id: string });
  },
};
