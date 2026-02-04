import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getRuntimeConfig } from './runtime-config';

// 只在客户端创建真实的 Supabase 客户端
let supabaseInstance: SupabaseClient | null = null;

function createSupabaseClient(): SupabaseClient {
  const config = getRuntimeConfig();
  const supabaseUrl = config.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = config.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window !== 'undefined') {
      console.error('Supabase configuration missing! Cloud sync will not work. Please configure environment variables.');
    }
  }

  return createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key'
  );
}

// 服务端渲染时返回空操作的 mock 对象
const serverMock: Partial<SupabaseClient> = {
  auth: {
    getUser: async () => ({ data: { user: null }, error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: async () => ({ data: null, error: null }),
    signUp: async () => ({ data: null, error: null }),
    signOut: async () => ({ error: null }),
  } as any,
  from: () => ({
    select: () => ({ data: null, error: null }),
    insert: () => ({ data: null, error: null }),
    update: () => ({ data: null, error: null }),
    delete: () => ({ data: null, error: null }),
  }) as any,
};

export function getSupabaseClient(): SupabaseClient {
  if (typeof window === 'undefined') {
    // 服务端渲染时返回 mock
    return serverMock as SupabaseClient;
  }

  if (!supabaseInstance) {
    supabaseInstance = createSupabaseClient();
  }

  return supabaseInstance;
}

// 导出单例 - 在服务端是 mock，在客户端是真实客户端
export const supabase = typeof window === 'undefined'
  ? (serverMock as SupabaseClient)
  : getSupabaseClient();
