'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  calculateProgress,
  getUserTitle,
  cn
} from '@/lib/utils';
import { useGameStore } from '@/stores/gameStore';
import { Button } from '@/components/ui/Button';
import { SoundToggle } from '@/components/ui/SoundToggle';
import { Card } from '@/components/ui/Card';
import { ToastContainer } from '@/components/ui/Toast';
import {
  HomeIcon,
  BookOpenIcon,
  TrophyIcon,
  ChartBarIcon,
  Bars3Icon as MenuIcon,
  XMarkIcon,
  FireIcon,
  SparklesIcon,
  UserIcon,
  Cog6ToothIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, userProgress, activeTab, setActiveTab, setGameState, toasts, removeToast } = useGameStore();

  const navigation = [
    { name: '主页', icon: HomeIcon },
    { name: '词库', icon: BookOpenIcon },
    { name: '成就', icon: TrophyIcon },
    { name: '统计', icon: ChartBarIcon },
    { name: '社区', icon: UserIcon },
    { name: '设置', icon: Cog6ToothIcon },
    ...(userProgress.role === 'admin' ? [{ name: '管理', icon: ShieldCheckIcon }] : []),
  ];

  const handleNavClick = (name: string) => {
    setActiveTab(name);
    setGameState('idle');
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-30 px-6 py-4 bg-[var(--card-bg)]/80 backdrop-blur-xl border-b border-[var(--border-color)]">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 flex items-center justify-center bg-[var(--primary)] rounded-lg">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[var(--foreground)] font-heading">
              LexiFlow
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 rounded-full"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <MenuIcon className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Desktop Layout */}
      <div className="flex-1 flex max-w-[1440px] mx-auto w-full lg:px-8 lg:py-10 gap-10">

        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-72 shrink-0">
          <div className="flex flex-col h-[calc(100vh-5rem)] sticky top-10">
            {/* Logo */}
            <div className="flex items-center space-x-3 px-2 py-4 mb-10">
              <div className="w-10 h-10 flex items-center justify-center bg-[var(--primary)] rounded-xl shadow-[0_4px_12px_rgba(79,70,229,0.3)]">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-[var(--foreground)] font-heading">
                LexiFlow
              </h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-3">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isCurrent = activeTab === item.name;
                const isCommunity = item.name === '社区';
                return (
                  <Button
                    key={item.name}
                    variant={isCurrent ? 'primary' : 'ghost'}
                    onClick={() => handleNavClick(item.name)}
                    className={cn(
                      "w-full px-5 py-4 gap-4 justify-start text-lg relative overflow-hidden",
                      !isCurrent && "text-[var(--slate-500)]"
                    )}
                  >
                    {isCommunity && user ? (
                      <div className="relative">
                        <img
                          src={user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                          className="h-7 w-7 rounded-lg shadow-sm"
                          alt="avatar"
                        />
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-[var(--card-bg)] rounded-full" />
                      </div>
                    ) : (
                      <Icon className={cn("h-6 w-6 stroke-[2.5]", isCurrent ? "text-white" : "text-[var(--primary)]")} />
                    )}
                    <span className="font-heading font-bold">{item.name}</span>
                  </Button>
                );
              })}
            </nav>

            {/* Progress Card */}
            <div className="mt-auto pt-8">
              <Card variant="premium" className="p-6 border-transparent shadow-xl relative overflow-hidden group">
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-[var(--primary-light)] rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{getUserTitle(userProgress.level).icon}</span>
                      <span className={cn("font-black font-heading text-sm uppercase tracking-tighter", getUserTitle(userProgress.level).color)}>
                        {getUserTitle(userProgress.level).title}
                      </span>
                    </div>
                    <div className="px-2 py-0.5 rounded-md bg-[var(--primary-light)] text-[var(--primary)] text-[10px] font-black italic">
                      LV {userProgress.level}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-[10px] font-bold text-[var(--slate-400)] uppercase tracking-widest mb-1">经验值 (EXP)</div>
                    <div className="text-lg font-black text-[var(--foreground)] font-heading leading-none">
                      {userProgress.totalPoints} <span className="text-xs text-[var(--slate-300)] font-bold">Total PTS</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-[9px] font-black text-[var(--slate-400)] uppercase tracking-widest">
                      <span>Next Level</span>
                      <span>{Math.round(calculateProgress(userProgress.totalPoints))}%</span>
                    </div>
                    <div className="h-2.5 bg-[var(--slate-100)] rounded-full overflow-hidden p-0.5 shadow-inner">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${calculateProgress(userProgress.totalPoints)}%` }}
                        className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full shadow-sm"
                      />
                    </div>
                  </div>
                </div>
              </Card>

              <div className="mt-6 flex items-center justify-between px-2">
                <SoundToggle className="bg-transparent hover:bg-[var(--slate-100)] p-2 rounded-lg" />
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Header Dashboard Info */}
          <header className="hidden lg:flex items-center justify-between mb-12">
            <div>
              <h2 className="text-5xl font-bold text-[var(--foreground)] font-heading">
                {activeTab}
              </h2>
              <p className="text-[var(--slate-500)] mt-2 font-bold text-lg">
                {user
                  ? `欢迎回来, ${user.user_metadata?.username || user.email.split('@')[0]}! ✨`
                  : '开始你的词汇冒险吧！ ✨'}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Card variant="glass" className="flex items-center gap-6 px-8 py-4 rounded-3xl shadow-sm border-[var(--card-border)]">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-[var(--slate-400)] uppercase tracking-widest">今日能量</span>
                  <span className="text-2xl font-bold font-heading text-[var(--foreground)]">{userProgress.totalPoints}</span>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center shadow-inner">
                  <FireIcon className="w-8 h-8 text-orange-500" />
                </div>
              </Card>
            </div>
          </header>

          <div className="pb-20">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Navigation */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-md lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />

            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-80 lg:hidden flex"
            >
              <div className="bg-[var(--card-bg)] w-full h-full p-6 flex flex-col border-r border-[var(--border-color)]">
                <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                      <SparklesIcon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-[var(--foreground)] font-heading">LexiFlow</span>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setIsSidebarOpen(false)}>
                    <XMarkIcon className="h-6 w-6" />
                  </Button>
                </div>

                <nav className="flex-1 space-y-2">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    const isCurrent = activeTab === item.name;
                    return (
                      <Button
                        key={item.name}
                        variant={isCurrent ? 'primary' : 'ghost'}
                        className="w-full justify-start gap-4 text-lg py-4"
                        onClick={() => handleNavClick(item.name)}
                      >
                        <Icon className="h-6 w-6" />
                        <span className="font-heading font-medium">{item.name}</span>
                      </Button>
                    );
                  })}
                </nav>

                <div className="mt-auto border-t border-[var(--border-color)] pt-6">
                  <div className="flex items-center justify-between text-sm text-[var(--slate-500)] font-medium">
                    <span>Sound Effects</span>
                    <SoundToggle />
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}