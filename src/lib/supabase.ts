import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getRuntimeConfig } from './runtime-config';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (typeof window === 'undefined') {
    // 服务端渲染时使用默认配置（不会实际使用）
    return createClient('https://placeholder.supabase.co', 'placeholder-key');
  }

  if (supabaseInstance) {
    return supabaseInstance;
  }

  const config = getRuntimeConfig();
  const supabaseUrl = config.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = config.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase configuration missing! Cloud sync will not work. Please configure environment variables.');
  }

  supabaseInstance = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key'
  );

  return supabaseInstance;
}

// 保持向后兼容的导出
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    const client = getSupabaseClient();
    return (client as any)[prop];
  }
});
