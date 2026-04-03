import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) ?? '';
const supabaseKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ?? '';

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    '[Supabase] Missing env vars.\n' +
    'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local\n' +
    'or Vercel → Settings → Environment Variables.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder'
);
