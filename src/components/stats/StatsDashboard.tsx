'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { Card, CardContent } from '@/components/ui/Card';
import {
    ArrowUpIcon,
    ArrowDownIcon,
    ClockIcon,
    AcademicCapIcon,
    CheckBadgeIcon,
    CalendarIcon,
    FireIcon
} from '@heroicons/react/24/outline';
import { cn, calculateProgress, getUserTitle } from '@/lib/utils';

export function StatsDashboard() {
    const { userProgress, studyHistory } = useGameStore();

    // 计算过去 7 天的数据
    const weeklyDetailedData = useMemo(() => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const now = new Date();
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(now.getDate() - (6 - i));
            return {
                dateStr: date.toDateString(),
                label: days[date.getDay()],
                value: 0,
                accuracy: 0,
                sessions: 0
            };
        });

        studyHistory.forEach(session => {
            const sessionDate = new Date(session.startTime).toDateString();
            const dayData = last7Days.find(d => d.dateStr === sessionDate);
            if (dayData) {
                dayData.value += session.wordsStudied;
                dayData.accuracy += (session.correctAnswers / session.wordsStudied);
                dayData.sessions += 1;
            }
        });

        return last7Days.map(d => ({
            ...d,
            accuracy: d.sessions > 0 ? Math.round((d.accuracy / d.sessions) * 100) : 0
        }));
    }, [studyHistory]);

    const maxVal = Math.max(...weeklyDetailedData.map(d => d.value), 10);

    const statsSummary = useMemo(() => {
        const today = new Date().toDateString();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();

        const todaySessions = studyHistory.filter(s => new Date(s.startTime).toDateString() === today);
        const yesterdaySessions = studyHistory.filter(s => new Date(s.startTime).toDateString() === yesterdayStr);

        const todayPoints = todaySessions.reduce((acc, curr) => acc + curr.pointsEarned, 0);
        const yesterdayPoints = yesterdaySessions.reduce((acc, curr) => acc + curr.pointsEarned, 0);

        const pointDiff = todayPoints - yesterdayPoints;
        const pointGrowth = yesterdayPoints === 0 ? (todayPoints > 0 ? 100 : 0) : Math.round((pointDiff / yesterdayPoints) * 100);

        return {
            todayPoints,
            pointGrowth,
            isPositive: pointDiff >= 0
        };
    }, [studyHistory]);

    return (
        <div className="space-y-8 fade-in">
            {/* Level & Title Header */}
            <Card variant="premium" className="p-8 bg-white border-transparent relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-all duration-700">
                    <AcademicCapIcon className="w-64 h-64 text-indigo-600" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-[2.5rem] bg-indigo-600 flex items-center justify-center text-5xl shadow-2xl shadow-indigo-200">
                            {getUserTitle(userProgress.level).icon}
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h2 className="text-4xl font-black text-slate-900 font-heading tracking-tight">{getUserTitle(userProgress.level).title}</h2>
                                <span className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-black italic border border-indigo-100">LV {userProgress.level}</span>
                            </div>
                            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">当前荣誉称号 - 每一个单词都在铸就卓越</p>
                        </div>
                    </div>

                    <div className="flex-1 max-w-md space-y-4">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">累计经验值 (EXP)</p>
                                <p className="text-3xl font-black text-slate-900 font-heading leading-none">
                                    {userProgress.totalPoints} <span className="text-sm text-slate-300">Total Points</span>
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">今日增益</p>
                                <div className="flex items-center gap-1.5 text-orange-500 font-black font-heading text-xl">
                                    <FireIcon className="w-5 h-5" />
                                    +{statsSummary.todayPoints}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <span>升至下一等级进度</span>
                                <span>{Math.round(calculateProgress(userProgress.totalPoints))}%</span>
                            </div>
                            <div className="h-4 bg-slate-100 rounded-full overflow-hidden p-1 shadow-inner">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${calculateProgress(userProgress.totalPoints)}%` }}
                                    className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full shadow-lg"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card variant="premium" className="p-8 bg-white border-transparent">
                    <div className="flex items-center gap-5 mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
                            <ClockIcon className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">累计学习时长</p>
                            <h4 className="text-2xl font-bold text-slate-900 font-heading">
                                {studyHistory.reduce((acc, curr) => acc + curr.timeSpent, 0)} mins
                            </h4>
                        </div>
                    </div>
                    <div className="flex items-center text-xs font-bold text-slate-500 bg-slate-50 w-fit px-3 py-1 rounded-full border border-slate-100">
                        <CalendarIcon className="w-3 h-3 mr-1" /> Total sessions: {studyHistory.length}
                    </div>
                </Card>

                <Card variant="premium" className="p-8 bg-white border-transparent">
                    <div className="flex items-center gap-5 mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
                            <AcademicCapIcon className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">今日获得积分</p>
                            <h4 className="text-2xl font-bold text-slate-900 font-heading">{statsSummary.todayPoints} PTS</h4>
                        </div>
                    </div>
                    <div className={cn(
                        "flex items-center text-xs font-bold w-fit px-3 py-1 rounded-full border",
                        statsSummary.isPositive ? "text-emerald-500 bg-emerald-50 border-emerald-100" : "text-rose-500 bg-rose-50 border-rose-100"
                    )}>
                        {statsSummary.isPositive ? <ArrowUpIcon className="w-3 h-3 mr-1" /> : <ArrowDownIcon className="w-3 h-3 mr-1" />}
                        {Math.abs(statsSummary.pointGrowth)}% vs yesterday
                    </div>
                </Card>

                <Card variant="premium" className="p-8 bg-white border-transparent">
                    <div className="flex items-center gap-5 mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shadow-inner">
                            <CheckBadgeIcon className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">整体正确率</p>
                            <h4 className="text-2xl font-bold text-slate-900 font-heading">
                                {studyHistory.length > 0
                                    ? Math.round((studyHistory.reduce((acc, curr) => acc + curr.correctAnswers, 0) / studyHistory.reduce((acc, curr) => acc + curr.wordsStudied, 0)) * 100)
                                    : 0}%
                            </h4>
                        </div>
                    </div>
                    <p className="text-xs font-bold text-slate-400 px-1">基于 {studyHistory.reduce((acc, curr) => acc + curr.wordsStudied, 0)} 次题目回答</p>
                </Card>
            </div>

            {/* Weekly Activity Chart */}
            <Card variant="premium" className="p-8 bg-white border-transparent overflow-hidden relative">
                <div className="flex items-center justify-between mb-10 relative z-10">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 font-heading">学习趋势对比</h3>
                        <p className="text-sm text-slate-400 font-medium">近 7 天每日词汇量统计</p>
                    </div>
                    <div className="hidden sm:flex gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-indigo-500" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">练习词数</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-400" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">平均准确率</span>
                        </div>
                    </div>
                </div>

                <div className="relative h-64 flex items-end justify-between gap-4 px-2">
                    {/* Grid Lines */}
                    <div className="absolute inset-x-0 bottom-0 top-0 flex flex-col justify-between pointer-events-none opacity-5">
                        {[0, 25, 50, 75, 100].map(p => (
                            <div key={p} className="w-full border-t border-slate-900" />
                        ))}
                    </div>

                    {weeklyDetailedData.map((data, i) => (
                        <div key={data.dateStr} className="relative flex-1 flex flex-col items-center gap-4 group">
                            {/* Accuracy Indicator (Floating Dot) */}
                            <motion.div
                                className="absolute w-2 h-2 rounded-full bg-emerald-400 z-20 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                                initial={{ bottom: 0 }}
                                animate={{ bottom: `${data.accuracy}%` }}
                                transition={{ delay: i * 0.12, duration: 1 }}
                            />

                            {/* Bar */}
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${(data.value / maxVal) * 100}%` }}
                                transition={{ delay: i * 0.1, duration: 0.8, ease: "circOut" }}
                                className="w-full max-w-[48px] bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-2xl group-hover:from-indigo-500 group-hover:to-indigo-300 transition-all shadow-lg shadow-indigo-100 relative"
                            >
                                <div className="opacity-0 group-hover:opacity-100 absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-extrabold py-1.5 px-2.5 rounded-lg transition-all transform scale-90 group-hover:scale-100 whitespace-nowrap z-50 shadow-xl">
                                    {data.value} words / {data.accuracy}% acc
                                </div>
                            </motion.div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{data.label}</span>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Recent History Table */}
            <Card variant="premium" className="overflow-hidden border-transparent shadow-xl shadow-slate-100/50">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-white">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 font-heading">最近学习活动</h3>
                        <p className="text-sm text-slate-400 font-medium">查看详细的练习日志</p>
                    </div>
                </div>
                <div className="overflow-x-auto bg-white">
                    <table className="w-full">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-8 py-5 text-left text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">日期时间</th>
                                <th className="px-8 py-5 text-left text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">专注时长</th>
                                <th className="px-8 py-5 text-left text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">词汇规模</th>
                                <th className="px-8 py-5 text-left text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">得分结果</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {studyHistory.length > 0 ? [...studyHistory].reverse().slice(0, 8).map((session) => (
                                <tr key={session.id} className="hover:bg-slate-50/50 transition-all group">
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-bold text-slate-700">{new Date(session.startTime).toLocaleDateString()}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
                                            {session.timeSpent} mins
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-sm font-extrabold text-slate-900">
                                        {session.wordsStudied} words
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-extrabold text-indigo-600">+{session.pointsEarned} PTS</span>
                                            <div className={cn(
                                                "px-2 py-0.5 rounded text-[9px] font-black uppercase",
                                                (session.correctAnswers / session.wordsStudied) >= 0.8 ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"
                                            )}>
                                                {Math.round((session.correctAnswers / session.wordsStudied) * 100)}%
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-2 opacity-30">
                                            <CalendarIcon className="w-12 h-12 text-slate-300" />
                                            <p className="text-slate-500 font-bold font-heading text-lg italic">暂无学习数据</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
