// src/data/supply_chain_data.ts
export interface SupplyChainRow {
  category: string;
  supplier: string;
  material: string;
  monthly_cost_usd: number;
  lead_time_days: number;
  country: string;
}

export const supplyChainData: SupplyChainRow[] = [
  { category: 'API',       supplier: 'Astra Biotech',        material: 'Esomeprazole Mg Trihydrate', monthly_cost_usd: 28500, lead_time_days: 20, country: 'Germany' },
  { category: 'API',       supplier: 'Luzhou Chemicals',     material: 'Omeprazole Powder',          monthly_cost_usd: 12000, lead_time_days: 18, country: 'China'   },
  { category: 'API',       supplier: 'Dr Reddys',            material: 'Lansoprazole',               monthly_cost_usd: 9600,  lead_time_days: 22, country: 'India'   },
  { category: 'Excipient', supplier: 'Ashland Global',       material: 'HPMC E-5',                  monthly_cost_usd: 7200,  lead_time_days: 15, country: 'USA'     },
  { category: 'Excipient', supplier: 'Evonik',               material: 'Drug Coat L30 D',            monthly_cost_usd: 11000, lead_time_days: 25, country: 'Germany' },
  { category: 'Packing',   supplier: 'Constantia Flexibles', material: 'Alu-Alu Foil',              monthly_cost_usd: 4400,  lead_time_days: 10, country: 'Austria' },
  { category: 'Packing',   supplier: 'ACG Capsules',         material: 'Empty HPMC Capsules',        monthly_cost_usd: 3800,  lead_time_days: 12, country: 'India'   },
  { category: 'Logistics', supplier: 'DHL Express',          material: 'Air Freight API',            monthly_cost_usd: 3200,  lead_time_days: 3,  country: 'Oman'    },
  { category: 'Utilities', supplier: 'Sohar Industrial',     material: 'Electricity & Water',        monthly_cost_usd: 14500, lead_time_days: 0,  country: 'Oman'    },
];
