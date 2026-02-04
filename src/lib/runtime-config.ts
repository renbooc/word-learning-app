// 运行时配置 - 用于静态导出环境
// 这些值会在构建后被注入

export interface RuntimeConfig {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
}

// 默认配置（开发环境）
const defaultConfig: RuntimeConfig = {
  NEXT_PUBLIC_SUPABASE_URL: '',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: '',
};

// 尝试从 window 对象获取配置（用于 Huggingface Spaces 运行时注入）
export function getRuntimeConfig(): RuntimeConfig {
  if (typeof window !== 'undefined') {
    const windowConfig = (window as any).__RUNTIME_CONFIG__;
    if (windowConfig) {
      return {
        ...defaultConfig,
        ...windowConfig,
      };
    }
  }
  
  // 回退到环境变量（用于开发环境）
  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  };
}
