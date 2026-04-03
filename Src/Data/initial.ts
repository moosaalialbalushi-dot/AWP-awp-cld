import type {
  Batch, InventoryItem, Order, Expense, Employee,
  Vendor, BDLead, SampleStatus, Market, RDProject, WidgetId
} from '@/types';

export const INITIAL_BATCHES: Batch[] = [
  {
    id: 'B-25-101', product: 'Esomeprazole EC Pellets 22.5%',
    quantity: 5000, actualYield: 99.2, expectedYield: 100,
    status: 'In-Progress', timestamp: '2025-11-20', dispatchDate: '2025-12-15',
  },
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 'RM-001', sNo: '1', name: 'OMEPRAZOLE POWDER', category: 'API', requiredForOrders: 1105, stock: 15, balanceToPurchase: 1090, unit: 'kg', stockDate: '31.12.25' },
  { id: 'RM-002', sNo: '2', name: 'Esomeprazole', category: 'API', requiredForOrders: 1600, stock: 55, balanceToPurchase: 1545, unit: 'kg', stockDate: '31.12.25' },
  { id: 'RM-003', sNo: '3', name: 'Lansoprazole', category: 'API', requiredForOrders: 0, stock: 84, balanceToPurchase: 0, unit: 'kg', stockDate: '31.12.25' },
  { id: 'RM-026', sNo: '26', name: 'HPMC E-5', category: 'Excipient', requiredForOrders: 3000, stock: 8642, balanceToPurchase: -5642, unit: 'kg', stockDate: '31.12.25' },
  { id: 'RM-030', sNo: '30', name: 'TALCUM', category: 'Excipient', requiredForOrders: 1000, stock: 500, balanceToPurchase: 500, unit: 'kg', stockDate: '31.12.25' },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-01', sNo: '1', date: '2025-01-19', invoiceNo: 'AWP/INV-01-25',
    customer: 'FEROZSONS', lcNo: '-', country: 'Pakistan',
    product: 'Esomeprazole EC Pellets 22.5%', quantity: 5000,
    rateUSD: 24, amountUSD: 120000, amountOMR: 46200, status: 'Pending',
  },
];

export const INITIAL_EXPENSES: Expense[] = [
  { id: 'EXP-001', description: 'Monthly Electricity - Sohar Plant', category: 'Utilities', amount: 14500, status: 'Pending', dueDate: '2025-12-05' },
  { id: 'EXP-002', description: 'Astra Biotech API Payment', category: 'Raw Materials', amount: 85000, status: 'Paid', dueDate: '2025-11-15' },
  { id: 'EXP-003', description: 'Logistics - MENA Export', category: 'Logistics', amount: 3200, status: 'Pending', dueDate: '2025-12-10' },
];

export const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'EMP-001', name: 'Dr. Sarah Ahmed', role: 'Head of R&D', department: 'R&D', salary: 12000, status: 'Active', joinDate: '2023-05-12' },
  { id: 'EMP-002', name: 'John Doe', role: 'Production Manager', department: 'Production', salary: 8500, status: 'Active', joinDate: '2022-10-01' },
  { id: 'EMP-003', name: 'Alia Khan', role: 'QC Chemist', department: 'QC', salary: 5500, status: 'Active', joinDate: '2024-01-20' },
];

export const INITIAL_VENDORS: Vendor[] = [
  { id: 'V-001', name: 'Astra Biotech API', category: 'API', rating: 4.8, status: 'Verified', country: 'Germany' },
  { id: 'V-002', name: 'Luzhou Chemicals', category: 'Excipient', rating: 4.2, status: 'Audit Pending', country: 'China' },
];

export const INITIAL_BD: BDLead[] = [
  { id: 'BD-01', targetMarket: 'GCC - Kuwait', opportunity: 'Public Tender Omeprazole', potentialValue: '$1.2M', status: 'Negotiation', probability: 75 },
];

export const INITIAL_SAMPLES: SampleStatus[] = [
  { id: 'SMP-102', product: 'Esomeprazole 40mg Pellets', destination: 'Ministry of Health, UAE', quantity: '5kg', status: 'QC Testing' },
];

export const INITIAL_MARKETS: Market[] = [
  { id: 'M-01', name: 'UAE', region: 'GCC', status: 'Active' },
  { id: 'M-02', name: 'Saudi Arabia', region: 'GCC', status: 'Active' },
];

function calcRDCosts(projects: RDProject[]): RDProject[] {
  return projects.map(p => {
    const ings = p.ingredients.map(i => ({ ...i, cost: Number((i.quantity * i.rateUSD).toFixed(3)) }));
    const totalRMC = Number(ings.reduce((s, i) => s + i.cost, 0).toFixed(3));
    const totalFinalRMC = Number(((totalRMC / p.batchSize) + p.loss).toFixed(3));
    return { ...p, ingredients: ings, totalRMC, totalFinalRMC };
  });
}

const RAW_RD: RDProject[] = [
  {
    id: 'RD-001',
    title: 'Esomeprazole Magnesium Trihydrate Formulation',
    status: 'Formulation', optimizationScore: 95,
    lastUpdated: '2026-02-27', batchSize: 100, batchUnit: 'Kg',
    totalRMC: 0, loss: 0.02, totalFinalRMC: 0,
    ingredients: [
      { sNo: '1',  name: 'Esomeprazole Magnesium Trihydrate', quantity: 28.5,   unit: 'Kg', rateUSD: 48,   cost: 0, role: 'API' },
      { sNo: '2',  name: 'NPS 20/24',                         quantity: 43.637, unit: 'Kg', rateUSD: 2.05, cost: 0, role: 'Filler' },
      { sNo: '3',  name: 'HPMC E5 (Layer 1)',                 quantity: 13.12,  unit: 'Kg', rateUSD: 7.25, cost: 0, role: 'Binder' },
      { sNo: '4',  name: 'Sodium Hydroxide Pellets (NaOH)',   quantity: 2.63,   unit: 'Kg', rateUSD: 1.80, cost: 0, role: 'Excipient' },
      { sNo: '5',  name: 'TiO2 (Layer 1)',                    quantity: 1.75,   unit: 'Kg', rateUSD: 3.50, cost: 0, role: 'Coating' },
      { sNo: '6',  name: 'HPMC E5 (Layer 2)',                 quantity: 7.98,   unit: 'Kg', rateUSD: 7.25, cost: 0, role: 'Binder' },
      { sNo: '7',  name: 'Drug Coat L30 D',                   quantity: 86.66,  unit: 'Kg', rateUSD: 4.20, cost: 0, role: 'Coating' },
      { sNo: '8',  name: 'DEP / PEG 6000',                    quantity: 0.95,   unit: 'Kg', rateUSD: 2.80, cost: 0, role: 'Plasticizer' },
      { sNo: '9',  name: 'TiO2 (Layer 2)',                    quantity: 0.25,   unit: 'Kg', rateUSD: 3.50, cost: 0, role: 'Coating' },
      { sNo: '10', name: 'Talcum',                             quantity: 0.42,   unit: 'Kg', rateUSD: 1.20, cost: 0, role: 'Lubricant' },
      { sNo: '11', name: 'Tween 80',                           quantity: 0.04,   unit: 'Kg', rateUSD: 3.00, cost: 0, role: 'Surfactant' },
      { sNo: '12', name: 'Sodium Hydroxide Pellets (NaOH) 2',  quantity: 0.02,   unit: 'Kg', rateUSD: 1.80, cost: 0, role: 'Excipient' },
    ],
  },
];

export const INITIAL_RD = calcRDCosts(RAW_RD);

export const DEFAULT_WIDGETS: WidgetId[] = [
  'stats_yield', 'stats_orders', 'stats_markets', 'stats_pipeline',
  'feed_ai', 'feed_batches',
];

export const ALL_WIDGETS: { id: WidgetId; label: string; category: string; type: 'stat' | 'feed'; default: boolean }[] = [
  { id: 'stats_yield',     label: 'Yield Accuracy',   category: 'Production',  type: 'stat', default: true },
  { id: 'stats_orders',    label: 'Order Volume',      category: 'Sales',       type: 'stat', default: true },
  { id: 'stats_markets',   label: 'Active Markets',    category: 'BD',          type: 'stat', default: true },
  { id: 'stats_pipeline',  label: 'Pipeline Value',    category: 'BD',          type: 'stat', default: true },
  { id: 'stats_inventory', label: 'Critical Stock',    category: 'Inventory',   type: 'stat', default: false },
  { id: 'stats_vendors',   label: 'Active Vendors',    category: 'Procurement', type: 'stat', default: false },
  { id: 'stats_expenses',  label: 'Total Expenses',    category: 'Accounting',  type: 'stat', default: false },
  { id: 'stats_liability', label: 'Liabilities',       category: 'Accounting',  type: 'stat', default: false },
  { id: 'stats_staff',     label: 'Staff Count',       category: 'HR',          type: 'stat', default: false },
  { id: 'stats_rd',        label: 'R&D Projects',      category: 'R&D',         type: 'stat', default: false },
  { id: 'stats_samples',   label: 'Active Samples',    category: 'Samples',     type: 'stat', default: false },
  { id: 'feed_ai',         label: 'AI Ops Feed',       category: 'AI Ops',      type: 'feed', default: true },
  { id: 'feed_batches',    label: 'Recent Batches',    category: 'Production',  type: 'feed', default: true },
  { id: 'feed_inventory',  label: 'Inventory Alerts',  category: 'Inventory',   type: 'feed', default: false },
  { id: 'feed_orders',     label: 'Recent Orders',     category: 'Sales',       type: 'feed', default: false },
  { id: 'feed_finance',    label: 'Expense Ledger',    category: 'Accounting',  type: 'feed', default: false },
  { id: 'feed_hr',         label: 'HR Updates',        category: 'HR',          type: 'feed', default: false },
];
