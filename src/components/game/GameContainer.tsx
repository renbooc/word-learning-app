'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FlashcardGame } from '@/components/game/FlashcardGame';
import { SpellingGame } from '@/components/game/SpellingGame';
import { QuizGame } from '@/components/game/QuizGame';
import { MatchingGame } from '@/components/game/MatchingGame';
import {
  TrophyIcon,
  SparklesIcon,
  ArrowLeftIcon,
  ArrowPathIcon,
  AcademicCapIcon,
  PencilSquareIcon,
  QueueListIcon,
  BoltIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';

export function GameContainer() {
  const { gameState, currentSession, endGame, setGameState, startGame } = useGameStore();
  const [showResults, setShowResults] = useState(false);

  const handleGameComplete = (score: number, maxScore: number) => {
    endGame();
    setShowResults(true);
  };

  const handleBackToMenu = () => {
    setShowResults(false);
    setGameState('idle');
  };

  if (showResults && currentSession) {
    const accuracy = Math.round((currentSession.score / currentSession.maxScore) * 100);

    return (
      <div className="max-w-2xl mx-auto p-6 fade-in">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        >
          <Card variant="premium" className="overflow-visible">
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-200">
              {accuracy >= 90 ? <TrophyIcon className="w-12 h-12 text-white" /> : <SparklesIcon className="w-12 h-12 text-white" />}
            </div>

            <CardHeader className="text-center pt-16">
              <h2 className="text-3xl font-bold text-slate-900 font-heading">练习挑战完成！</h2>
              <p className="text-slate-400 mt-2 font-medium">你做得非常棒，继续保持这个节奏</p>
            </CardHeader>

            <CardContent className="text-center space-y-8 py-10">
              <div className="flex flex-col items-center">
                <div className="text-6xl font-bold text-indigo-600 font-heading tracking-tight mb-2">
                  {currentSession.score}
                </div>
                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">本次获得积分 / 总分 {currentSession.maxScore}</div>
              </div>

              <div className="grid grid-cols-3 gap-4 py-8 border-y border-slate-50">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900 font-heading">
                    {currentSession.words.length}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">练习单词</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-500 font-heading">
                    {accuracy}%
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">准确率</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600 font-heading">
                    {Math.round(currentSession.accuracy * currentSession.words.length)}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">正确回答</div>
                </div>
              </div>

              <div className="flex gap-4 justify-center pt-4">
                <Button variant="ghost" className="flex-1" onClick={handleBackToMenu}>
                  <ArrowLeftIcon className="w-5 h-5 mr-2" /> 返回主页
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={() => {
                    startGame(currentSession.gameType as any, currentSession.words);
                    setShowResults(false);
                  }}
                >
                  <ArrowPathIcon className="w-5 h-5 mr-2" /> 再次挑战
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (gameState === 'playing' && currentSession) {
    const GameIcon = {
      flashcard: AcademicCapIcon,
      spelling: PencilSquareIcon,
      quiz: QueueListIcon,
      matching: BoltIcon
    }[currentSession.gameType as 'flashcard' | 'spelling' | 'quiz' | 'matching'] || AcademicCapIcon;

    const gameTitle = {
      flashcard: '记忆卡片',
      spelling: '拼写练习',
      quiz: '选择测验',
      matching: '语义配对'
    }[currentSession.gameType as 'flashcard' | 'spelling' | 'quiz' | 'matching'] || '练习中';

    return (
      <div className="fade-in">
        <div className="flex items-center justify-between mb-10 px-4">
          <Button variant="ghost" size="sm" onClick={handleBackToMenu} className="group">
            <ArrowLeftIcon className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" /> 退出
          </Button>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <GameIcon className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 font-heading">{gameTitle}</h1>
          </div>

          <div className="w-16" /> {/* Spacer */}
        </div>

        {currentSession.gameType === 'flashcard' && (
          <FlashcardGame
            words={currentSession.words}
            onComplete={handleGameComplete}
          />
        )}

        {currentSession.gameType === 'spelling' && (
          <SpellingGame
            words={currentSession.words}
            onComplete={handleGameComplete}
          />
        )}

        {currentSession.gameType === 'quiz' && (
          <QuizGame
            words={currentSession.words}
            onComplete={handleGameComplete}
          />
        )}

        {currentSession.gameType === 'matching' && (
          <MatchingGame
            words={currentSession.words}
            onComplete={handleGameComplete}
          />
        )}
      </div>
    );
  }

  return null;
}