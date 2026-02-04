import { createClient } from '@supabase/supabase-js';
import { getRuntimeConfig } from './runtime-config';

const config = getRuntimeConfig();
const supabaseUrl = config.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = config.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

if (!config.NEXT_PUBLIC_SUPABASE_URL || !config.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Supabase configuration missing! Cloud sync will not work. Please configure environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
