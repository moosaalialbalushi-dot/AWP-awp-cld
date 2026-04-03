// ─── Core ERP Types ──────────────────────────────────────────────────────────

export type TabId =
  | 'dashboard' | 'production' | 'inventory' | 'sales'
  | 'procurement' | 'accounting' | 'hr' | 'rd'
  | 'industrial' | 'bd' | 'samples' | 'costing'
  | 'filereader' | 'ai' | 'history';

export interface Batch {
  id: string;
  product: string;
  quantity: number;
  actualYield: number;
  expectedYield: number;
  status: 'In-Progress' | 'Completed' | 'Quarantine' | 'Scheduled';
  timestamp: string;
  dispatchDate?: string;
}

export interface InventoryItem {
  id: string;
  sNo: string;
  name: string;
  category: 'API' | 'Excipient' | 'Packing' | 'Finished' | 'R&D' | 'Spare' | 'Other';
  requiredForOrders: number;
  stock: number;
  balanceToPurchase: number;
  unit: string;
  stockDate?: string;
  safetyStock?: number;
}

export interface Order {
  id: string;
  sNo: string;
  date: string;
  invoiceNo: string;
  customer: string;
  lcNo: string;
  country: string;
  product: string;
  quantity: number;
  rateUSD: number;
  amountUSD: number;
  amountOMR: number;
  status: string;
  materialDispatched?: string;
  paymentTerms?: string;
  receivedAmountOMR?: number;
  pendingAmountOMR?: number;
  remarks?: string;
  paymentMethod?: string;
  shippingMethod?: string;
}

export interface Expense {
  id: string;
  description: string;
  category: 'Utilities' | 'Salaries' | 'Maintenance' | 'Logistics' | 'Raw Materials';
  amount: number;
  status: 'Paid' | 'Pending';
  dueDate: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: 'Production' | 'QC' | 'Sales' | 'Admin' | 'R&D';
  salary: number;
  status: 'Active' | 'On Leave' | 'Terminated';
  joinDate: string;
}

export interface Vendor {
  id: string;
  name: string;
  category: 'API' | 'Excipient' | 'Packing' | 'Equipment';
  rating: number;
  status: 'Verified' | 'Audit Pending' | 'Blacklisted';
  country: string;
}

export interface BDLead {
  id: string;
  targetMarket: string;
  opportunity: string;
  potentialValue: string;
  status: 'Prospecting' | 'Negotiation' | 'Contracting' | 'Closed';
  probability: number;
}

export interface SampleStatus {
  id: string;
  product: string;
  destination: string;
  quantity: string;
  status: 'Requested' | 'Production' | 'QC Testing' | 'Dispatched' | 'Arrived';
  trackingNumber?: string;
}

export interface COOInsight {
  type: 'Production' | 'Inventory' | 'Procurement' | 'Sales' | 'R&D' | 'BD' | 'Finance' | 'HR';
  message: string;
  severity: 'info' | 'warning' | 'critical';
  actionTaken?: string;
}

export interface Ingredient {
  sNo?: string;
  name: string;
  quantity: number;
  unit: string;
  rateUSD: number;
  cost: number;
  role: 'API' | 'Filler' | 'Binder' | 'Coating' | 'Disintegrant' | 'Lubricant' | 'Plasticizer' | 'Surfactant' | 'Excipient' | 'Other';
  supplier?: string;
  grade?: string;
  notes?: string;
}

export interface PackingMaterial {
  sNo?: string;
  name: string;
  quantity: number;
  unit: string;
  rateUSD: number;
  cost: number;
  notes?: string;
}

export interface RDVersion {
  version: string;
  date: string;
  changedBy?: string;
  summary: string;
  snapshot: Partial<RDProject>;
}

export interface RDProject {
  id: string;
  title: string;
  productCode?: string;
  dosageForm?: string;
  strength?: string;
  therapeuticCategory?: string;
  shelfLife?: string;
  storageCondition?: string;
  manufacturingProcess?: string;
  qualityStandards?: string;
  regulatoryStatus?: string;
  status: 'Formulation' | 'Stability' | 'Bioequivalence' | 'Clinical' | 'Optimizing' | 'Approved';
  ingredients: Ingredient[];
  packingMaterials?: PackingMaterial[];
  optimizationScore: number;
  aiOptimizationNotes?: string;
  lastUpdated: string;
  batchSize: number;
  batchUnit: string;
  totalRMC: number;
  loss: number;
  totalFinalRMC: number;
  versions?: RDVersion[];
}

export interface FileAnalysisResult {
  fileName: string;
  analysis: string;
  timestamp: string;
}

export interface Market {
  id: string;
  name: string;
  region: string;
  status: 'Active' | 'Pending' | 'Exit';
}

export interface AuditLog {
  id: string;
  action: string;
  user: string;
  details: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  provider: string;
  messages: ChatMessage[];
  archived: boolean;
  createdAt: number;
}

export interface ApiConfig {
  claudeKey: string;
  notebookLmSource: string;
  supabaseUrl: string;
  supabaseKey: string;
}

export interface UploadProgress {
  isUploading: boolean;
  fileName: string;
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  message: string;
}

export interface CalcData {
  product: string;
  volume: number;
  targetPrice: number;
  rmc: number;
  labor: number;
  packing: number;
  logistics: number;
  shippingCost: number;
  shippingMethod: string;
}

export type ModalMode = 'add' | 'edit' | 'view';

export type EntityType =
  | 'production' | 'inventory' | 'sales' | 'procurement'
  | 'accounting' | 'hr' | 'rd' | 'vendors' | 'bd'
  | 'samples' | 'markets';

export interface ModalState {
  isOpen: boolean;
  mode: ModalMode;
  type: EntityType | null;
  data: Record<string, unknown>;
}

export type WidgetId =
  | 'stats_yield' | 'stats_orders' | 'stats_markets' | 'stats_pipeline'
  | 'stats_inventory' | 'stats_vendors' | 'stats_expenses' | 'stats_liability'
  | 'stats_staff' | 'stats_rd' | 'stats_samples'
  | 'feed_ai' | 'feed_batches' | 'feed_inventory' | 'feed_orders'
  | 'feed_hr' | 'feed_finance';
