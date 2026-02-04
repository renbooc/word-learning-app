'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { UserProfile } from '@/types';
import {
    UsersIcon,
    ShieldCheckIcon,
    ChartBarIcon,
    TrashIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export function AdminView() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalPoints: 0,
        avgLevel: 0
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const supabase = getSupabaseClient();
        const { data: profiles } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (profiles) {
            setUsers(profiles as UserProfile[]);

            const totalPoints = profiles.reduce((sum: number, p: any) => sum + (p.total_points || 0), 0);
            const totalLevel = profiles.reduce((sum: number, p: any) => sum + (p.level || 0), 0);

            setStats({
                totalUsers: profiles.length,
                totalPoints,
                avgLevel: profiles.length > 0 ? Math.round(totalLevel / profiles.length) : 0
            });
        }
        setLoading(false);
    };

    const toggleAdmin = async (userId: string, currentRole: string) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        if (confirm(`确定要将该用户的权限更改为 ${newRole} 吗？`)) {
            const { error } = await getSupabaseClient()
                .from('profiles')
                .update({ role: newRole })
                .eq('id', userId);

            if (!error) fetchData();
        }
    };

    if (loading) return <div className="p-20 text-center font-bold text-slate-400">正在进入管理面板...</div>;

    return (
        <div className="space-y-10 fade-in">
            <header className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-rose-600 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-100">
                        <ShieldCheckIcon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-4xl font-black text-slate-900 font-heading">超级管理后台</h2>
                        <p className="text-slate-500 font-bold">全站数据监控与权限控制</p>
                    </div>
                </div>
            </header>

            {/* Stats Bento */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card variant="premium" className="p-8 border-transparent">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                            <UsersIcon className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">总注册用户</span>
                    </div>
                    <div className="text-4xl font-black text-slate-900 font-heading">{stats.totalUsers}</div>
                </Card>

                <Card variant="premium" className="p-8 border-transparent">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                            <ChartBarIcon className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">全站总积分</span>
                    </div>
                    <div className="text-4xl font-black text-slate-900 font-heading">{stats.totalPoints.toLocaleString()}</div>
                </Card>

                <Card variant="premium" className="p-8 border-transparent">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                            <ShieldCheckIcon className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">平均等级</span>
                    </div>
                    <div className="text-4xl font-black text-slate-900 font-heading">LV {stats.avgLevel}</div>
                </Card>
            </div>

            {/* Users Table */}
            <Card variant="premium" className="overflow-hidden border-transparent">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">用户信息</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">权限</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">等级/积分</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">学习天数</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">管理操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {users.map(u => (
                                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <img src={u.avatar_url || ''} className="w-10 h-10 rounded-xl bg-slate-100 shadow-inner" alt="avatar" />
                                            <div>
                                                <p className="font-bold text-slate-900">{u.username || '未设置'}</p>
                                                <p className="text-xs text-slate-400">{u.id.substring(0, 8)}...</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${u.role === 'admin' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="font-black text-slate-900 leading-none">LV {u.level}</p>
                                        <p className="text-[10px] font-bold text-slate-400 mt-1">{u.total_points} PTS</p>
                                    </td>
                                    <td className="px-8 py-6 font-bold text-slate-600">
                                        {u.current_streak} 天
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                className={`text-xs h-9 ${u.role === 'admin' ? 'text-slate-400' : 'text-rose-600 hover:bg-rose-50'}`}
                                                onClick={() => toggleAdmin(u.id, u.role)}
                                            >
                                                {u.role === 'admin' ? '取消管理' : '设为管理'}
                                            </Button>
                                            <Button variant="ghost" className="text-slate-300 hover:text-rose-600 h-9 p-2">
                                                <TrashIcon className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-4">
                <ExclamationTriangleIcon className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                <div>
                    <h4 className="font-bold text-amber-900">管理说明</h4>
                    <p className="text-sm text-amber-700 font-medium">只有当前邮箱为系统的初始管理邮箱时，才能操作其他管理员权限。请谨慎使用删除和降权功能。</p>
                </div>
            </div>
        </div>
    );
}
