'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { Card, CardContent } from '@/components/ui/Card';
import {
    TrophyIcon,
    SparklesIcon,
    FireIcon,
    StarIcon,
    AcademicCapIcon,
    BoltIcon,
    BookOpenIcon,
    CheckBadgeIcon
} from '@heroicons/react/24/outline';
import {
    TrophyIcon as TrophySolid,
    FireIcon as FireSolid,
    StarIcon as StarSolid,
    AcademicCapIcon as AcademicCapSolid,
    BoltIcon as BoltSolid,
    BookOpenIcon as BookOpenSolid
} from '@heroicons/react/24/solid';
import { cn } from '@/lib/utils';

export function AchievementsWall() {
    const { achievements, userProgress } = useGameStore();

    const allAchievements = useMemo(() => [
        {
            id: 'first_steps',
            name: '第一步',
            description: '学习超过 5 个单词',
            icon: BookOpenIcon,
            solidIcon: BookOpenSolid,
            target: 5,
            current: userProgress.totalWordsLearned,
            color: 'text-blue-500',
            bg: 'bg-blue-50',
        },
        {
            id: 'word_master',
            name: '单词达人',
            description: '学习超过 50 个单词',
            icon: AcademicCapIcon,
            solidIcon: AcademicCapSolid,
            target: 50,
            current: userProgress.totalWordsLearned,
            color: 'text-indigo-500',
            bg: 'bg-indigo-50',
        },
        {
            id: 'streak_3',
            name: '三日连胜',
            description: '连续 3 天进行学习',
            icon: FireIcon,
            solidIcon: FireSolid,
            target: 3,
            current: userProgress.currentStreak,
            color: 'text-orange-500',
            bg: 'bg-orange-50',
        },
        {
            id: 'precision',
            name: '精准打击',
            description: '完成一次 100% 准确率的练习',
            icon: BoltIcon,
            solidIcon: BoltSolid,
            target: 100,
            current: userProgress.weeklyStats.accuracy,
            color: 'text-yellow-500',
            bg: 'bg-yellow-50',
        },
        {
            id: 'marathon',
            name: '词汇马拉松',
            description: '熟练掌握超过 20 个单词',
            icon: TrophyIcon,
            solidIcon: TrophySolid,
            target: 20,
            current: userProgress.totalWordsMastered,
            color: 'text-amber-500',
            bg: 'bg-amber-50',
        },
        {
            id: 'collector',
            name: '星级收藏家',
            description: '累计获得超过 1000 积分',
            icon: StarIcon,
            solidIcon: StarSolid,
            target: 1000,
            current: userProgress.totalPoints,
            color: 'text-rose-500',
            bg: 'bg-rose-50',
        },
    ], [userProgress]);

    return (
        <div className="space-y-10 fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allAchievements.map((achievement, i) => {
                    const isUnlocked = achievement.current >= achievement.target;
                    const progress = Math.min((achievement.current / achievement.target) * 100, 100);
                    const Icon = isUnlocked ? achievement.solidIcon : achievement.icon;

                    return (
                        <motion.div
                            layout
                            key={achievement.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <Card variant="premium" className={cn(
                                "p-10 h-full flex flex-col items-center text-center transition-all duration-500",
                                !isUnlocked && "opacity-60 grayscale-[0.4]"
                            )}>
                                <div className={cn(
                                    "w-24 h-24 rounded-3xl flex items-center justify-center mb-8 shadow-inner ring-8 ring-white",
                                    isUnlocked ? achievement.bg : "bg-slate-50"
                                )}>
                                    <Icon className={cn("w-12 h-12", isUnlocked ? achievement.color : "text-slate-300")} />
                                </div>

                                <h3 className="text-2xl font-bold text-[var(--foreground)] font-heading mb-2">
                                    {achievement.name}
                                    {isUnlocked && <span className="ml-2 text-xs bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full uppercase tracking-tighter">Unlocked</span>}
                                </h3>

                                <p className="text-base text-[var(--slate-500)] font-bold mb-10 min-h-[3rem] leading-tight">
                                    {achievement.description}
                                </p>

                                <div className="w-full mt-auto space-y-3">
                                    <div className="flex justify-between text-[10px] font-bold text-[var(--slate-400)] uppercase tracking-widest">
                                        <span>{achievement.current} / {achievement.target}</span>
                                        <span>{Math.round(progress)}%</span>
                                    </div>
                                    <div className="h-2.5 bg-[var(--slate-50)] rounded-full overflow-hidden shadow-inner">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            className={cn("h-full rounded-full transition-all duration-500", isUnlocked ? "bg-[var(--primary)] shadow-[0_0_15px_rgba(79,70,229,0.3)]" : "bg-[var(--slate-300)]")}
                                        />
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {/* Stats Summary Panel */}
            <Card variant="premium" className="p-10 border-indigo-100/50 bg-indigo-50/10">
                <div className="flex flex-col md:flex-row items-center gap-10">
                    <div className="w-32 h-32 flex items-center justify-center bg-indigo-600 rounded-3xl shrink-0 shadow-xl shadow-indigo-100 ring-8 ring-indigo-50">
                        <SparklesIcon className="w-16 h-16 text-white" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h3 className="text-3xl font-bold text-slate-900 font-heading mb-4">荣誉奖章</h3>
                        <p className="text-slate-500 font-medium leading-relaxed mb-6">
                            你已经解锁了 {allAchievements.filter(a => a.current >= a.target).length} 个成就。
                            每一个徽章都见证了你对词汇掌握的坚持与热爱。
                        </p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                            <div className="px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-100 text-sm font-bold text-slate-700">
                                🏆 顶级王牌: {userProgress.bestStreak} 天连续
                            </div>
                            <div className="px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-100 text-sm font-bold text-slate-700">
                                💎 收集点数: {userProgress.totalPoints}
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
