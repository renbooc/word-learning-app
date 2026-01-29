'use client';

import { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SoundToggle } from '@/components/ui/SoundToggle';
import { cn } from '@/lib/utils';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import {
    TrashIcon,
    InformationCircleIcon,
    LanguageIcon,
    SpeakerWaveIcon,
    BoltIcon,
    ArrowPathIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';

export function SettingsView() {
    const {
        user,
        userProgress,
        preferredAudioEngine,
        setPreferredAudioEngine,
        theme,
        setTheme,
        logout,
        setActiveTab,
        syncProgressToCloud,
        loadProgressFromCloud
    } = useGameStore();

    const [isResetModalOpen, setIsResetModalOpen] = useState(false);

    const handleResetData = () => {
        localStorage.removeItem('word-game-storage');
        window.location.reload();
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 fade-in">
            <section className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2">偏好设置</h3>
                <Card variant="premium" className="divide-y divide-slate-50">
                    <div className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center shadow-inner">
                                <SpeakerWaveIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="font-bold text-[var(--foreground)] font-heading text-lg">音效</p>
                                <p className="text-sm text-[var(--slate-500)] font-bold">开启或关闭练习时的音效</p>
                            </div>
                        </div>
                        <SoundToggle className="bg-[var(--slate-50)] hover:bg-[var(--slate-100)]" />
                    </div>

                    <div className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
                                <SparklesIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="font-bold text-[var(--foreground)] font-heading text-lg">显示主题</p>
                                <p className="text-sm text-[var(--slate-500)] font-bold">切换明亮或暗黑模式</p>
                            </div>
                        </div>
                        <div className="flex gap-1 p-1 bg-slate-50 rounded-2xl border border-slate-100">
                            {[
                                { id: 'light', label: '🌞' },
                                { id: 'dark', label: '🌙' },
                                { id: 'system', label: '🖥️' }
                            ].map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => setTheme(t.id as any)}
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-xs font-black transition-all",
                                        theme === t.id ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-inner">
                                <BoltIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="font-bold text-[var(--foreground)] font-heading text-lg">发音引擎</p>
                                <p className="text-sm text-[var(--slate-500)] font-bold">选择发音质量级别</p>
                            </div>
                        </div>
                        <div className="flex gap-2 p-1 bg-slate-50 rounded-2xl border border-slate-100">
                            <button
                                onClick={() => setPreferredAudioEngine('premium')}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                                    preferredAudioEngine === 'premium' ? "bg-white text-[var(--primary)] shadow-sm" : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                Premium ✨
                            </button>
                            <button
                                onClick={() => setPreferredAudioEngine('standard')}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                                    preferredAudioEngine === 'standard' ? "bg-white text-[var(--primary)] shadow-sm" : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                Standard
                            </button>
                        </div>
                    </div>

                    <div className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
                                <LanguageIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="font-bold text-[var(--foreground)] font-heading text-lg">发音语速</p>
                                <p className="text-sm text-[var(--slate-500)] font-bold">调整 TTS 朗读单词的速度</p>
                            </div>
                        </div>
                        <select className="premium-input py-1 px-4 text-sm h-12 cursor-pointer font-bold" defaultValue="0.9x">
                            <option>0.8x</option>
                            <option>0.9x</option>
                            <option>1.0x</option>
                            <option>1.2x</option>
                        </select>
                    </div>
                </Card>
            </section>

            <section className="space-y-4">
                <h3 className="text-sm font-bold text-[var(--slate-400)] uppercase tracking-widest px-2">账户管理</h3>
                {user ? (
                    <div className="space-y-4">
                        <Card variant="premium" className="p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <img
                                        src={user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                                        alt="Avatar"
                                        className="w-16 h-16 rounded-2xl shadow-inner bg-indigo-50"
                                    />
                                    <div>
                                        <p className="font-bold text-[var(--foreground)] font-heading text-xl">
                                            {user.user_metadata?.username || user.email.split('@')[0]}
                                        </p>
                                        <p className="text-sm text-[var(--slate-400)] font-medium">{user.email}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">当前等级</div>
                                    <div className="text-3xl font-black text-indigo-600 font-heading">LV {userProgress.level}</div>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                className="w-full py-4 text-rose-500 hover:bg-rose-50 border-2 border-transparent hover:border-rose-100"
                                onClick={() => logout()}
                            >
                                退出登录
                            </Button>
                        </Card>

                        {/* 云端同步卡片 - 调整为与偏好设置一致的干净风格 */}
                        <Card variant="premium" className="divide-y divide-slate-50">
                            <div className="p-6 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
                                        <ArrowPathIcon className="w-6 h-6 animate-spin-slow" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-[var(--foreground)] font-heading text-lg">云端同步状态</p>
                                        <p className="text-sm text-[var(--slate-500)] font-bold">学习进度与自定义词库已联网</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="h-10 px-4 text-[10px] font-black uppercase"
                                        onClick={() => syncProgressToCloud()}
                                    >
                                        立即上传
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-10 px-4 text-[10px] font-black uppercase border-slate-100"
                                        onClick={() => loadProgressFromCloud()}
                                    >
                                        拉取云端
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                ) : (
                    <Card variant="premium" className="p-8 text-center space-y-4">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-2">
                            <InformationCircleIcon className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-[var(--slate-500)] font-bold">登录后即可将学习进度与 AI 提取内容同步到云端</p>
                        <Button variant="primary" className="px-10 py-5 shadow-xl shadow-indigo-100" onClick={() => setActiveTab('社区')}>
                            立即登录 / 注册
                        </Button>
                    </Card>
                )}
            </section>

            <section className="space-y-4">
                <h3 className="text-sm font-bold text-[var(--slate-400)] uppercase tracking-widest px-2">数据管理</h3>
                <Card variant="premium" className="p-6 flex items-center justify-between border-rose-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-inner">
                            <TrashIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-bold text-[var(--foreground)] font-heading text-lg">重置所有数据</p>
                            <p className="text-sm text-[var(--slate-500)] font-bold">清除词库进度、积分和记录</p>
                        </div>
                    </div>
                    <Button variant="ghost" className="text-rose-500 hover:bg-rose-50" onClick={() => setIsResetModalOpen(true)}>
                        立即重置
                    </Button>
                </Card>
            </section>

            <section className="space-y-4">
                <h3 className="text-sm font-bold text-[var(--slate-400)] uppercase tracking-widest px-2">关于 LexiFlow</h3>
                <Card variant="premium" className="p-10 text-center space-y-6">
                    <div className="w-24 h-24 bg-[var(--primary)] rounded-[2rem] mx-auto flex items-center justify-center shadow-lg shadow-indigo-100 mb-2 border-4 border-white">
                        <InformationCircleIcon className="w-12 h-12 text-white" />
                    </div>
                    <h4 className="text-3xl font-bold text-[var(--foreground)] font-heading tracking-tight">LexiFlow v1.0</h4>
                    <p className="text-[var(--slate-500)] font-bold max-w-sm mx-auto leading-relaxed text-lg">
                        LexiFlow 是一款极简且高效的单词学习工具，旨在通过沉浸式的练习体验帮助你快速扩充词汇量。
                    </p>
                    <div className="pt-4 text-[10px] font-bold text-[var(--slate-300)] uppercase tracking-widest">
                        Made with ❤️ for Learners
                    </div>
                </Card>
            </section>

            <ConfirmModal
                isOpen={isResetModalOpen}
                title="重置所有数据？"
                description="确定要清除所有学习进度、积分和记录吗？此操作不可撤销，且本地缓存将被清空。"
                confirmLabel="确定重置"
                cancelLabel="暂时取消"
                onConfirm={handleResetData}
                onCancel={() => setIsResetModalOpen(false)}
                variant="danger"
            />
        </div>
    );
}
