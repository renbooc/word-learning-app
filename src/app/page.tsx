'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GameContainer } from '@/components/game/GameContainer';
import { Layout } from '@/components/layout/Layout';
import { getCompleteWords } from '@/data/words';
import { cn } from '@/lib/utils';
import { SoundManager } from '@/lib/sound';
import {
  SpeakerWaveIcon,
  BookOpenIcon,
  CheckBadgeIcon,
  BoltIcon,
  ChartPieIcon,
  HeartIcon,
  SparklesIcon,
  AcademicCapIcon,
  PencilSquareIcon,
  QueueListIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';

import { getWordsFromBook } from '@/data/wordBooks';

function HomePageContent() {
  const {
    userProgress,
    setWords,
    startGame,
    toggleFavorite,
    wordMetadata,
    favoriteWords,
    preferredAudioEngine,
    currentBookId,
    wordBooks
  } = useGameStore();
  const soundManager = SoundManager.getInstance();

  const currentBook = wordBooks.find(b => b.id === currentBookId);
  const bookWords = currentBookId ? getWordsFromBook(currentBookId) : [];

  useEffect(() => {
    if (bookWords.length > 0) {
      setWords(bookWords);
    }
  }, [currentBookId]);

  const wordsDueForReview = bookWords.filter(w => {
    const meta = wordMetadata[w.id];
    if (!meta || !meta.nextReviewDate) return false;
    return new Date(meta.nextReviewDate) <= new Date();
  });

  const handleStartGame = (gameMode: 'flashcard' | 'spelling' | 'quiz' | 'matching', source: 'all' | 'review' = 'all') => {
    let gameWords = [];
    if (source === 'review' && wordsDueForReview.length > 0) {
      gameWords = wordsDueForReview.slice(0, 10);
    } else {
      gameWords = bookWords.slice(0, 10);
    }
    startGame(gameMode, gameWords);
  };

  return (
    <div className="space-y-16 pb-20 fade-in">
      {/* Metrics Section - Modern Bento */}
      <section>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
          <Card variant="premium" className="flex flex-col p-8 bg-white border-transparent">
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-indigo-50 text-[var(--primary)] shadow-inner">
                <BookOpenIcon className="w-8 h-8" />
              </div>
              {currentBook && (
                <div className="text-[9px] font-black uppercase text-indigo-400 bg-indigo-50/50 px-2 py-1 rounded-lg">
                  {currentBook.name}
                </div>
              )}
            </div>
            <div className="text-5xl font-black text-[var(--foreground)] font-heading mb-1">
              {userProgress.totalWordsLearned}
            </div>
            <div className="text-[10px] font-black text-[var(--slate-400)] uppercase tracking-widest">已学词汇</div>
          </Card>

          <Card variant="premium" className="flex flex-col p-8 bg-white border-transparent">
            <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-6 shadow-inner">
              <CheckBadgeIcon className="w-8 h-8" />
            </div>
            <div className="text-5xl font-black text-[var(--foreground)] font-heading mb-1">
              {userProgress.totalWordsMastered}
            </div>
            <div className="text-[10px] font-black text-[var(--slate-400)] uppercase tracking-widest">熟练掌握</div>
          </Card>

          <Card variant="premium" className="flex flex-col p-8 bg-white border-transparent">
            <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-rose-50 text-rose-500 mb-6 shadow-inner">
              <HeartIcon className="w-8 h-8" />
            </div>
            <div className="text-5xl font-black text-[var(--foreground)] font-heading mb-1">
              {favoriteWords.size}
            </div>
            <div className="text-[10px] font-black text-[var(--slate-400)] uppercase tracking-widest">生词本</div>
          </Card>

          <Card variant="premium" className="flex flex-col p-8 bg-white border-transparent">
            <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-orange-50 text-orange-600 mb-6 shadow-inner">
              <BoltIcon className="w-8 h-8" />
            </div>
            <div className="text-5xl font-black text-[var(--foreground)] font-heading mb-1">
              {userProgress.currentStreak}
            </div>
            <div className="text-[10px] font-black text-[var(--slate-400)] uppercase tracking-widest">持续天数</div>
          </Card>

          <Card variant="premium" className="flex flex-col p-8 bg-white border-transparent">
            <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500 mb-6 shadow-inner">
              <ChartPieIcon className="w-8 h-8" />
            </div>
            <div className="text-5xl font-black text-[var(--foreground)] font-heading mb-1">
              {Math.round(userProgress.weeklyStats.accuracy)}%
            </div>
            <div className="text-[10px] font-black text-[var(--slate-400)] uppercase tracking-widest">周准确率</div>
          </Card>
        </div>
      </section>

      {/* Ebbinghaus Review Hub - Fixed UI for maximum clarity and aesthetics */}
      {wordsDueForReview.length > 0 && (
        <div className="space-y-6 fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-indigo-600 rounded-full" />
              <h3 className="text-2xl font-black text-slate-900 font-heading">复习工作台</h3>
            </div>
            <span className="px-4 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black uppercase rounded-full shadow-sm">
              艾宾浩斯记忆曲线已激活
            </span>
          </div>

          <div
            className="rounded-[2.5rem] text-white p-8 lg:p-12 relative overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-indigo-200/50"
            style={{ background: 'linear-gradient(135deg, #4338ca 0%, #312e81 100%)' }}
          >
            {/* Background Decorative Elements */}
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />
            <SparklesIcon className="absolute top-10 right-10 w-32 h-32 opacity-10 pointer-events-none" />

            <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-12">
              <div className="space-y-6 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/20 text-amber-300 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-400/30">
                  <BoltIcon className="w-3.5 h-3.5" /> 黄金复习周期
                </div>
                <div className="space-y-2">
                  <h3 className="text-4xl lg:text-6xl font-black font-heading tracking-tight leading-none">
                    待复习: <span className="text-amber-400">{wordsDueForReview.length}</span>
                  </h3>
                  <p className="text-indigo-100 font-bold text-lg lg:text-xl leading-relaxed opacity-90">
                    你的大脑记忆已经过半，现在复习可节省 <span className="text-white underline underline-offset-4 decoration-amber-400/50">80%</span> 的重学时间。
                  </p>
                </div>

                <div className="flex flex-wrap gap-4 pt-2">
                  <Button
                    variant="primary"
                    className="!bg-white !text-indigo-900 hover:!bg-indigo-50 border-none px-10 py-6 h-auto text-lg font-black shadow-[0_20px_40px_rgba(0,0,0,0.25)] rounded-[1.5rem] group/btn transition-all active:scale-95"
                    onClick={() => handleStartGame('flashcard', 'review')}
                  >
                    <AcademicCapIcon className="w-7 h-7 mr-3 transition-transform group-hover/btn:scale-110" /> 立即开始温故
                  </Button>
                  <Button
                    variant="ghost"
                    className="bg-white/10 backdrop-blur-md !text-white hover:bg-white/20 border-2 border-white/20 px-8 py-6 h-auto text-base font-black rounded-[1.5rem]"
                    onClick={() => handleStartGame('spelling', 'review')}
                  >
                    <PencilSquareIcon className="w-6 h-6 mr-2" /> 拼写锁定
                  </Button>
                </div>
              </div>

              {/* Word Cards Reel */}
              <div className="xl:w-1/3 w-full">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200/60 mb-4 ml-1">待复习词汇预览</p>
                <div className="flex xl:flex-col gap-4 overflow-x-auto xl:max-h-[300px] xl:overflow-y-auto no-scrollbar pb-4 xl:pb-0 pr-4">
                  {wordsDueForReview.slice(0, 10).map((word) => (
                    <div
                      key={word.id}
                      className="shrink-0 xl:w-full w-48 p-5 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/10 hover:bg-white/15 transition-all group/item"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-black text-indigo-200/80 uppercase tracking-tighter">Due Today</span>
                        <button
                          onClick={() => {
                            const utterance = new SpeechSynthesisUtterance(word.word);
                            utterance.lang = 'en-US';
                            window.speechSynthesis.speak(utterance);
                          }}
                          className="text-white/40 hover:text-white transition-colors"
                        >
                          <SpeakerWaveIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <h4 className="text-2xl font-black text-white group-hover/item:text-amber-300 transition-colors">{word.word}</h4>
                      <p className="text-xs text-indigo-100/60 font-bold italic line-clamp-1 mt-1">{word.definition}</p>
                    </div>
                  ))}
                  {wordsDueForReview.length > 10 && (
                    <div className="shrink-0 xl:w-full w-48 flex items-center justify-center p-6 bg-black/20 rounded-2xl border border-dashed border-white/20 text-indigo-200 text-xs font-black uppercase">
                      + {wordsDueForReview.length - 10} 更多单词
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Game Modes Section */}
      <section>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="w-3 h-3 rounded-full bg-indigo-600 animate-pulse" />
              <span className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em]">Learning Hub</span>
            </div>
            <h2 className="text-4xl font-black text-[var(--foreground)] font-heading">
              学习模式
            </h2>
            <p className="text-[var(--slate-500)] mt-2 font-bold text-lg">选择适合你的方式开启高效记忆之旅</p>
          </div>
          <div className="px-5 py-2 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">当前词书</span>
            <span className="text-sm font-black text-slate-900">{currentBook?.name || '未选择'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { id: 'flashcard', name: '记忆卡片', desc: '看词想义，快速复习', icon: AcademicCapIcon, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { id: 'spelling', name: '拼写练习', desc: '听音写形，深度锁定', icon: PencilSquareIcon, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { id: 'quiz', name: '词汇测验', desc: '四选一，检验掌握度', icon: QueueListIcon, color: 'text-orange-600', bg: 'bg-orange-50' },
            { id: 'matching', name: '语义配对', desc: '连连看，建立联结', icon: PlayIcon, color: 'text-rose-600', bg: 'bg-rose-50' },
          ].map((mode) => (
            <Card
              key={mode.id}
              variant="premium"
              className="p-8 cursor-pointer group hover:bg-indigo-50/50 transition-all duration-500 border-transparent relative overflow-hidden"
              onClick={() => handleStartGame(mode.id as any)}
            >
              <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-slate-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700" />
              <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-inner relative z-10", mode.bg, mode.color)}>
                <mode.icon className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-[var(--foreground)] font-heading mb-2 relative z-10">
                {mode.name}
              </h3>
              <p className="text-[var(--slate-500)] font-bold mb-8 relative z-10">
                {mode.desc}
              </p>
              <div className="flex items-center text-[var(--primary)] font-black text-[10px] uppercase tracking-widest group-hover:translate-x-2 transition-transform relative z-10">
                进入模式 <BoltIcon className="w-3.5 h-3.5 ml-2" />
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Daily Selection Section */}
      <section>
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-4xl font-black text-[var(--foreground)] font-heading">
              今日推荐
            </h2>
            <p className="text-[var(--slate-500)] mt-2 font-bold text-lg">为你挑选的 6 个核心词汇 ✨</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {bookWords.slice(0, 6).map((word) => (
            <Card key={word.id} variant="premium" className="group p-8 bg-white border-transparent hover:border-indigo-100 transition-all duration-300 relative shadow-sm">
              <div className="flex justify-between items-start mb-8">
                <div className="flex gap-2">
                  <span className={cn(
                    "text-[10px] px-3 py-1.5 rounded-lg font-black uppercase tracking-tighter",
                    word.difficulty === 'easy' ? 'bg-emerald-50 text-emerald-600' :
                      word.difficulty === 'medium' ? 'bg-orange-50 text-orange-600' : 'bg-rose-50 text-rose-600'
                  )}>
                    {word.difficulty}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => toggleFavorite(word.id)}
                    className={cn(
                      "transition-all duration-300 p-2 rounded-xl",
                      favoriteWords.has(word.id) ? "text-rose-500 bg-rose-50" : "text-[var(--slate-200)] hover:text-rose-300 hover:bg-rose-50/30"
                    )}
                  >
                    {favoriteWords.has(word.id) ? <HeartSolid className="w-6 h-6" /> : <HeartIcon className="w-6 h-6" />}
                  </button>
                  <button
                    className="text-[var(--slate-300)] hover:text-indigo-600 transition-colors p-2 rounded-xl hover:bg-indigo-50"
                    onClick={() => {
                      if (preferredAudioEngine === 'premium') {
                        soundManager.playHighQualityTTS(word.word);
                      } else {
                        soundManager.playBasicTTS(word.word);
                      }
                    }}
                  >
                    <SpeakerWaveIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <h3 className="text-4xl font-black text-[var(--foreground)] font-heading mb-1">
                {word.word}
              </h3>
              <p className="text-[var(--slate-400)] font-bold mb-8">/{word.pronunciation}/</p>

              <p className="text-[var(--slate-600)] font-bold text-xl mb-12 leading-snug min-h-[5rem] italic">
                {word.definition}
              </p>

              <div className="flex gap-4">
                <Button
                  variant="primary"
                  className="flex-1 py-4 text-xs font-black"
                  onClick={() => startGame('flashcard', [word])}
                >
                  探索深度释处
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

import { VocabularyList } from '@/components/vocabulary/VocabularyList';
import { StatsDashboard } from '@/components/stats/StatsDashboard';
import { AchievementsWall } from '@/components/achievements/AchievementsWall';
import { SettingsView } from '@/components/layout/SettingsView';
import { AuthView } from '@/components/layout/AuthView';
import { CommunityView } from '@/components/layout/CommunityView';
import { AdminView } from '@/components/layout/AdminView';

export default function Home() {
  const { gameState, activeTab, user, userProgress } = useGameStore();
  const [isHydrated, setIsHydrated] = useState(false);

  // 确保 Zustand 状态已从 LocalStorage 恢复
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  const renderContent = () => {
    // 强制登录逻辑：如果用户未登录，始终展示登录界面
    if (!user) {
      return <AuthView />;
    }

    if (gameState === 'playing' || gameState === 'completed') {
      return <GameContainer />;
    }

    switch (activeTab) {
      case '词库':
        return <VocabularyList />;
      case '成就':
        return <AchievementsWall />;
      case '统计':
        return <StatsDashboard />;
      case '社区':
        return <CommunityView />;
      case '设置':
        return <SettingsView />;
      case '管理':
        return userProgress.role === 'admin' ? <AdminView /> : <HomePageContent />;
      case '主页':
      default:
        return <HomePageContent />;
    }
  };

  return (
    <Layout>
      {renderContent()}
    </Layout>
  );
}