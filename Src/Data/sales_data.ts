// src/data/sales_data.ts
export interface SalesRow {
  customer: string;
  product: string;
  quantity_kg: number;
  rate_usd: number;
  amount_usd: number;
  status: string;
  date: string;
}

export const salesData: SalesRow[] = [
  { customer: 'FEROZSONS',       product: 'Esomeprazole EC Pellets 22.5%', quantity_kg: 5000, rate_usd: 24, amount_usd: 120000, status: 'Pending',    date: '2025-01-19' },
  { customer: 'FEROZSONS',       product: 'Omeprazole Pellets 8.5%',       quantity_kg: 3000, rate_usd: 14, amount_usd: 42000,  status: 'Shipped',    date: '2025-02-10' },
  { customer: 'GULF PHARMA',     product: 'Lansoprazole EC Pellets',        quantity_kg: 2000, rate_usd: 32, amount_usd: 64000,  status: 'Pending',    date: '2025-02-15' },
  { customer: 'AL NAHDI',        product: 'Esomeprazole EC Pellets 22.5%', quantity_kg: 4000, rate_usd: 25, amount_usd: 100000, status: 'Processing', date: '2025-03-01' },
  { customer: 'IQVIA HEALTH',    product: 'Pantoprazole Pellets',           quantity_kg: 1500, rate_usd: 28, amount_usd: 42000,  status: 'Pending',    date: '2025-03-10' },
  { customer: 'TABUK PHARMA',    product: 'Omeprazole Pellets 8.5%',       quantity_kg: 6000, rate_usd: 13, amount_usd: 78000,  status: 'New Expected', date: '2025-03-20' },
  { customer: 'JULPHAR',         product: 'Esomeprazole EC Pellets 22.5%', quantity_kg: 3500, rate_usd: 24, amount_usd: 84000,  status: 'Pending',    date: '2025-04-01' },
  { customer: 'BAHWAN PHARMA',   product: 'Lansoprazole EC Pellets',        quantity_kg: 1000, rate_usd: 33, amount_usd: 33000,  status: 'Processing', date: '2025-04-15' },
  { customer: 'FEROZSONS',       product: 'Pantoprazole Pellets',           quantity_kg: 2500, rate_usd: 27, amount_usd: 67500,  status: 'Pending',    date: '2025-05-01' },
  { customer: 'GULF PHARMA',     product: 'Esomeprazole EC Pellets 22.5%', quantity_kg: 2000, rate_usd: 25, amount_usd: 50000,  status: 'Shipped',    date: '2025-05-10' },
];
