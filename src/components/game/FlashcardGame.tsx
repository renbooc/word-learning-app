'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Word } from '@/types';
import { getDifficultyColor, shuffleArray, cn } from '@/lib/utils';
import { SoundManager } from '@/lib/sound';
import {
  SpeakerWaveIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  SparklesIcon,
  ArrowPathIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';

interface FlashcardGameProps {
  words: Word[];
  onComplete: (score: number, maxScore: number) => void;
}

export function FlashcardGame({ words, onComplete }: FlashcardGameProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studiedWords, setStudiedWords] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const soundManager = SoundManager.getInstance();

  const { markAsLearned, markAsMastered, updateScore, updateSRS, toggleFavorite, wordMetadata, preferredAudioEngine } = useGameStore();

  // 随机打乱单词顺序
  const [gameWords, setGameWords] = useState<Word[]>([]);

  useEffect(() => {
    setGameWords(shuffleArray(words));
  }, [words]);

  const currentWord = gameWords[currentWordIndex];
  const progress = ((currentWordIndex + 1) / gameWords.length) * 100;

  const playTTS = (text: string) => {
    if (preferredAudioEngine === 'premium') {
      soundManager.playHighQualityTTS(text);
    } else {
      soundManager.playBasicTTS(text);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    soundManager.playFlip();
    if (!isFlipped && currentWord) {
      playTTS(currentWord.word);
    }
  };

  const handleMarkLearned = () => {
    if (currentWord && !studiedWords.has(currentWord.id)) {
      markAsLearned(currentWord.id);
      updateSRS(currentWord.id, true);
      setStudiedWords(new Set([...studiedWords, currentWord.id]));
      setScore(score + 5);
      updateScore(5);
      soundManager.playCorrect();
      setShowProgress(true);
      setTimeout(() => setShowProgress(false), 1000);
    }
    nextWord();
  };

  const handleMarkMastered = () => {
    if (currentWord && !studiedWords.has(currentWord.id)) {
      markAsMastered(currentWord.id);
      updateSRS(currentWord.id, true);
      setStudiedWords(new Set([...studiedWords, currentWord.id]));
      setScore(score + 10);
      updateScore(10);
      soundManager.playCorrect();
      setShowProgress(true);
      setTimeout(() => setShowProgress(false), 1000);
    }
    nextWord();
  };

  const handleSkip = () => {
    if (currentWord) {
      updateSRS(currentWord.id, false);
    }
    soundManager.playClick();
    nextWord();
  };

  const nextWord = () => {
    setIsFlipped(false);
    if (currentWordIndex < gameWords.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    } else {
      onComplete(score, words.length * 10);
    }
  };

  const handleRestart = () => {
    setCurrentWordIndex(0);
    setIsFlipped(false);
    setStudiedWords(new Set());
    setScore(0);
    setShowProgress(false);
    setGameWords(shuffleArray(words));
  };

  if (gameWords.length === 0) {
    return (
      <div className="text-center py-20 fade-in">
        <p className="text-slate-500 font-medium">准备中...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-4 lg:p-0 fade-in">
      {/* Header Info */}
      <div className="flex justify-between items-center mb-8">
        <div className="space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">当前进度</p>
          <p className="text-lg font-bold text-slate-900 font-heading">
            {currentWordIndex + 1} <span className="text-slate-300 font-medium">/</span> {gameWords.length}
          </p>
        </div>
        <div className="text-right space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">当前得分</p>
          <p className="text-lg font-bold text-indigo-600 font-heading">{score} PTS</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[var(--primary-light)] rounded-full h-3 mb-12 shadow-inner">
        <motion.div
          className="bg-indigo-600 h-3 rounded-full shadow-[0_2px_4px_rgba(79,70,229,0.2)]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Card Container with Perspective */}
      <div className="relative h-[480px] mb-12 perspective-1000">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentWordIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="w-full h-full"
          >
            {currentWord && (
              <Card
                variant="premium"
                className="h-full cursor-pointer select-none bg-white border-transparent"
                onClick={handleFlip}
              >
                <CardContent className="h-full flex flex-col p-10 text-center relative overflow-hidden">

                  {/* Decorative Background Element */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-bl-full -mr-10 -mt-10" />

                  <AnimatePresence mode="wait">
                    {!isFlipped ? (
                      /* Front Side */
                      <motion.div
                        key="front"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        className="flex-1 flex flex-col justify-center items-center gap-6"
                      >
                        <div className="absolute top-6 right-6">
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(currentWord.id); }}
                            className={cn(
                              "p-3 rounded-2xl transition-all duration-300 transform active:scale-125",
                              wordMetadata[currentWord.id]?.isFavorite ? "text-rose-500 bg-rose-50" : "text-[var(--slate-300)] hover:text-rose-300 bg-[var(--slate-50)]"
                            )}
                          >
                            {wordMetadata[currentWord.id]?.isFavorite ? <HeartSolid className="w-8 h-8" /> : <HeartIcon className="w-8 h-8" />}
                          </button>
                        </div>
                        <div className="bg-[var(--primary-light)] text-[var(--primary)] p-4 rounded-2xl mb-2 shadow-inner" onClick={(e) => { e.stopPropagation(); playTTS(currentWord.word); }}>
                          <SpeakerWaveIcon className="w-8 h-8" />
                        </div>
                        <h2 className="text-6xl lg:text-7xl font-bold text-[var(--foreground)] font-heading tracking-tight">
                          {currentWord.word}
                        </h2>
                        <p className="text-2xl text-[var(--slate-400)] font-bold">
                          /{currentWord.pronunciation}/
                        </p>
                        <div className="mt-8">
                          <span className={cn(
                            "text-[10px] px-4 py-2 rounded-xl font-bold uppercase tracking-widest",
                            currentWord.difficulty === 'easy' ? 'bg-emerald-50 text-emerald-600' :
                              currentWord.difficulty === 'medium' ? 'bg-orange-50 text-orange-600' : 'bg-rose-50 text-rose-600'
                          )}>
                            {currentWord.difficulty}
                          </span>
                        </div>

                        <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm text-[var(--slate-300)] font-bold uppercase tracking-widest">
                          点击卡片翻面
                        </p>
                      </motion.div>
                    ) : (
                      /* Back Side */
                      <motion.div
                        key="back"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        className="flex-1 flex flex-col justify-center items-center gap-6"
                      >
                        <div className="text-center">
                          <h3 className="text-3xl font-bold text-[var(--foreground)] font-heading mb-1">
                            {currentWord.word}
                          </h3>
                          <p className="text-[var(--primary)] font-bold text-lg">
                            {currentWord.pronunciation}
                          </p>
                        </div>

                        <div className="space-y-6 max-w-sm">
                          <p className="text-3xl lg:text-4xl text-[var(--foreground)] font-bold font-heading leading-tight italic">
                            {currentWord.definition}
                          </p>
                          {currentWord.example && (
                            <div
                              className="group/example relative p-5 bg-[var(--slate-50)] rounded-2xl border-2 border-[var(--slate-100)] italic text-[var(--slate-500)] text-base font-bold leading-relaxed shadow-inner cursor-pointer hover:bg-white transition-all"
                              onClick={(e) => { e.stopPropagation(); playTTS(currentWord.example!); }}
                            >
                              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center shadow-lg opacity-0 group-hover/example:opacity-100 transition-opacity">
                                <SpeakerWaveIcon className="w-4 h-4" />
                              </div>
                              "{currentWord.example}"
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 justify-center mt-6">
                          {currentWord.tags?.map((tag, index) => (
                            <span
                              key={index}
                              className="text-[10px] bg-white border-2 border-[var(--slate-100)] text-[var(--slate-400)] px-4 py-1.5 rounded-xl font-bold uppercase tracking-widest"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Score Popup */}
        <AnimatePresence>
          {showProgress && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: -40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: -40 }}
              className="absolute -top-10 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-6 py-2 rounded-full font-bold shadow-xl shadow-indigo-200"
            >
              +{studiedWords.has(currentWord?.id || '') ? 10 : 5} POINTS!
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Button
          variant="outline"
          onClick={handleSkip}
          className="h-14 font-heading text-lg"
        >
          <ChevronRightIcon className="w-5 h-5 mr-2" /> 跳过
        </Button>
        <Button
          variant="secondary"
          onClick={handleMarkLearned}
          disabled={studiedWords.has(currentWord?.id || '')}
          className="h-14 font-heading text-lg"
        >
          <CheckCircleIcon className="w-5 h-5 mr-2" /> 学习
        </Button>
        <Button
          variant="primary"
          onClick={handleMarkMastered}
          disabled={studiedWords.has(currentWord?.id || '')}
          className="h-14 font-heading text-lg"
        >
          <SparklesIcon className="w-5 h-5 mr-2" /> 掌握
        </Button>
      </div>

      <div className="flex justify-center mt-12">
        <Button
          variant="ghost"
          onClick={handleRestart}
          size="sm"
          className="text-slate-400 hover:text-slate-600"
        >
          <ArrowPathIcon className="w-4 h-4 mr-2" /> 重新开始这次练习
        </Button>
      </div>
    </div>
  );
}