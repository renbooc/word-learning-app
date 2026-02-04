'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { useGameStore } from '@/stores/gameStore';

export function AuthListener() {
    const { setUser, setProfile, loadProgressFromCloud } = useGameStore();
    const [supabase, setSupabase] = useState<ReturnType<typeof getSupabaseClient> | null>(null);

    useEffect(() => {
        // 在客户端初始化 supabase 客户端
        setSupabase(getSupabaseClient());
    }, []);

    useEffect(() => {
        if (!supabase) return;

        // 1. 获取当前会话
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                setUser({
                    id: session.user.id,
                    email: session.user.email!,
                    user_metadata: session.user.user_metadata,
                });
                loadProgressFromCloud();
            } else {
                setUser(null);
                setProfile(null);
            }
        });

        // 2. 监听认证状态变化
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                setUser({
                    id: session.user.id,
                    email: session.user.email!,
                    user_metadata: session.user.user_metadata,
                });

                // 如果是登录事件，加载云端进度
                if (event === 'SIGNED_IN') {
                    await loadProgressFromCloud();
                }
            } else {
                setUser(null);
                setProfile(null);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase, setUser, setProfile, loadProgressFromCloud]);

    return null;
}
