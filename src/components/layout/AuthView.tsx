'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSupabaseClient } from '@/lib/supabase';
import { useGameStore } from '@/stores/gameStore';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
    EnvelopeIcon,
    LockClosedIcon,
    UserIcon,
    SparklesIcon,
    ArrowRightIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    EyeIcon,
    EyeSlashIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

export function AuthView() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const { setUser, loadProgressFromCloud } = useGameStore();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            const supabase = getSupabaseClient();
            if (isLogin) {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                if (data.user) {
                    setUser({
                        id: data.user.id,
                        email: data.user.email!,
                        user_metadata: data.user.user_metadata
                    });
                    await loadProgressFromCloud();
                }
            } else {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            username,
                            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
                        }
                    }
                });
                if (error) throw error;
                setMessage('验证邮件已发送，请检查您的收件箱以激活账号。');
            }
        } catch (err: any) {
            setError(err.message || '发生错误，请稍后再试');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <Card variant="glass" className="p-10 border-white/40 shadow-2xl relative overflow-hidden">
                    {/* Background Glow */}
                    <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl" />

                    <div className="relative z-10 space-y-8">
                        {/* Logo/Header */}
                        <div className="text-center space-y-2">
                            <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-indigo-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-200 mb-4">
                                <SparklesIcon className="w-10 h-10 text-white" />
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 font-heading tracking-tight">
                                {isLogin ? '欢迎回来' : '开启词汇对决'}
                            </h2>
                            <p className="text-slate-400 font-medium">加入 LexiFlow 在线词汇社区</p>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-4 rounded-xl bg-rose-50 border border-rose-100 flex items-center gap-3 text-rose-600 text-sm font-bold"
                            >
                                <ExclamationCircleIcon className="w-5 h-5 shrink-0" />
                                {error}
                            </motion.div>
                        )}

                        {message && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-3 text-emerald-600 text-sm font-bold"
                            >
                                <CheckCircleIcon className="w-5 h-5 shrink-0" />
                                {message}
                            </motion.div>
                        )}

                        <form onSubmit={handleAuth} className="space-y-4">
                            {!isLogin && (
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">用户名</label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                        <input
                                            type="text"
                                            required
                                            placeholder="选择你的社区昵称"
                                            className="premium-input w-full !pl-12 bg-white/50 border-white/50 focus:bg-white"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">电子邮箱</label>
                                <div className="relative">
                                    <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                    <input
                                        type="email"
                                        required
                                        placeholder="your@email.com"
                                        className="premium-input w-full !pl-12 bg-white/50 border-white/50 focus:bg-white"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">密码安全</label>
                                <div className="relative">
                                    <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        placeholder="••••••••"
                                        className="premium-input w-full !pl-12 !pr-12 bg-white/50 border-white/50 focus:bg-white"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-500 transition-colors p-1"
                                    >
                                        {showPassword ? (
                                            <EyeSlashIcon className="w-5 h-5" />
                                        ) : (
                                            <EyeIcon className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full py-4 text-lg shadow-xl shadow-indigo-100 group"
                                disabled={loading}
                            >
                                {loading ? '同步中...' : (isLogin ? '立即登录' : '创建账号')}
                                <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </form>

                        <div className="text-center">
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                            >
                                {isLogin ? '还没有账号？现在注册' : '已有账号？直接登录'}
                            </button>
                        </div>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}
