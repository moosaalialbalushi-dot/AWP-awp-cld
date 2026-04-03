export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  if (currency === 'OMR') return `OMR ${amount.toLocaleString()}`;
  return `$${amount.toLocaleString()}`;
}

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

export function today(): string {
  return new Date().toISOString().split('T')[0];
}

export function clsx(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
