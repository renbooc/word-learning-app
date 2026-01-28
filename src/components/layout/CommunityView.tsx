'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { UserProfile } from '@/types';
import { TrophyIcon, FireIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

export function CommunityView() {
    const [profiles, setProfiles] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProfiles() {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('total_points', { ascending: false })
                .limit(10);

            if (data) {
                setProfiles(data as UserProfile[]);
            }
            setLoading(false);
        }

        fetchProfiles();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-slate-400 font-bold">正在加载社区数据...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-12 fade-in">
            {/* Community Hero */}
            <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 text-xs font-black uppercase tracking-widest">
                    <SparklesIcon className="w-4 h-4" /> 词汇竞技场
                </div>
                <h2 className="text-5xl font-black text-slate-900 font-heading">勇攀巅峰</h2>
                <p className="text-slate-500 font-bold text-lg">与全球学习者一起竞争，见证你的成长</p>
            </div>

            {/* Leaderboard */}
            <section className="space-y-6">
                <div className="flex items-center justify-between px-4">
                    <h3 className="text-xl font-bold text-slate-900 font-heading">本周排行榜</h3>
                    <span className="text-sm font-bold text-slate-400">实时更新</span>
                </div>

                <div className="grid gap-4">
                    {profiles.map((profile, index) => (
                        <Card
                            key={profile.id}
                            variant="premium"
                            className={cn(
                                "p-6 flex items-center justify-between border-transparent hover:border-indigo-100 transition-all group",
                                index === 0 && "bg-gradient-to-r from-amber-50 to-amber-50/30 border-amber-100",
                                index === 1 && "bg-gradient-to-r from-slate-50 to-slate-50/30 border-slate-100",
                                index === 2 && "bg-gradient-to-r from-orange-50/50 to-orange-50/10 border-orange-100"
                            )}
                        >
                            <div className="flex items-center gap-6">
                                <div className={cn(
                                    "w-12 h-12 flex items-center justify-center rounded-2xl font-black font-heading text-xl shadow-inner",
                                    index === 0 ? "bg-amber-500 text-white" :
                                        index === 1 ? "bg-slate-400 text-white" :
                                            index === 2 ? "bg-orange-400 text-white" : "bg-slate-100 text-slate-400"
                                )}>
                                    {index + 1}
                                </div>

                                <img
                                    src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`}
                                    alt={profile.username || 'User'}
                                    className="w-14 h-14 rounded-2xl shadow-sm bg-white"
                                />

                                <div>
                                    <h4 className="font-black text-slate-900 font-heading text-xl flex items-center gap-2">
                                        {profile.username || '匿名用户'}
                                        {index === 0 && <TrophyIcon className="w-5 h-5 text-amber-500" />}
                                    </h4>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-600 text-[10px] font-black italic">
                                            LV {profile.level}
                                        </span>
                                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                            <FireIcon className="w-3.5 h-3.5 text-orange-500" /> {profile.current_streak} 天坚持
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="text-2xl font-black text-slate-900 font-heading leading-tight">
                                    {profile.total_points.toLocaleString()}
                                </div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">总能量 (PTS)</div>
                            </div>
                        </Card>
                    ))}
                </div>
            </section>

            <Card variant="glass" className="p-10 text-center border-dashed border-2 border-indigo-200 bg-indigo-50/20">
                <SparklesIcon className="w-12 h-12 text-indigo-600 mx-auto mb-4 opacity-50" />
                <h4 className="text-2xl font-bold text-slate-900 font-heading mb-2">更多社交功能即将到来</h4>
                <p className="text-slate-500 font-medium">语伴互动、战队比拼、学习勋章分享，敬请期待 ✨</p>
            </Card>
        </div>
    );
}
