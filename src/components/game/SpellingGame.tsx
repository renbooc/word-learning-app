'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Word } from '@/types';
import { shuffleArray, cn } from '@/lib/utils';
import { SoundManager } from '@/lib/sound';
import {
    SpeakerWaveIcon,
    ArrowPathIcon,
    PencilSquareIcon,
    CheckBadgeIcon,
    HeartIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';

interface SpellingGameProps {
    words: Word[];
    onComplete: (score: number, maxScore: number) => void;
}

export function SpellingGame({ words, onComplete }: SpellingGameProps) {
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [showHint, setShowHint] = useState(false);
    const [gameWords, setGameWords] = useState<Word[]>([]);
    const [score, setScore] = useState(0);
    const [attempts, setAttempts] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const soundManager = SoundManager.getInstance();

    const { updateScore, updateSRS, toggleFavorite, wordMetadata, preferredAudioEngine } = useGameStore();

    const playTTS = (text: string) => {
        if (preferredAudioEngine === 'premium') {
            soundManager.playHighQualityTTS(text);
        } else {
            soundManager.playBasicTTS(text);
        }
    };

    useEffect(() => {
        setGameWords(shuffleArray(words));
    }, [words]);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [currentWordIndex]);

    const currentWord = gameWords[currentWordIndex];
    const progress = ((currentWordIndex) / gameWords.length) * 100;

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!currentWord || isCorrect !== null) return;

        const normalizedInput = userInput.trim().toLowerCase();
        const normalizedWord = currentWord.word.toLowerCase();

        if (normalizedInput === normalizedWord) {
            setIsCorrect(true);
            updateSRS(currentWord.id, true);
            const points = attempts === 0 ? 10 : 5;
            setScore(prev => prev + points);
            updateScore(points);
            soundManager.playCorrect();
            playTTS(currentWord.word);

            setTimeout(() => {
                nextWord();
            }, 1500);
        } else {
            setIsCorrect(false);
            updateSRS(currentWord.id, false);
            setAttempts(prev => prev + 1);
            soundManager.playIncorrect();

            setTimeout(() => {
                setIsCorrect(null);
                if (attempts >= 1) {
                    setShowHint(true);
                }
            }, 800);
        }
    };

    const nextWord = () => {
        setIsCorrect(null);
        setUserInput('');
        setShowHint(false);
        setAttempts(0);
        if (currentWordIndex < gameWords.length - 1) {
            setCurrentWordIndex(prev => prev + 1);
        } else {
            onComplete(score, words.length * 10);
        }
    };

    const handleRestart = () => {
        setCurrentWordIndex(0);
        setUserInput('');
        setIsCorrect(null);
        setShowHint(false);
        setScore(0);
        setAttempts(0);
        setGameWords(shuffleArray(words));
    };

    const getHint = () => {
        if (!currentWord) return '';
        const word = currentWord.word;
        return word.split('').map((char, i) => (i === 0 || i === word.length - 1 ? char : '_')).join(' ');
    };

    if (gameWords.length === 0) return null;

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

            <Card variant="premium" className="mb-12 overflow-visible border-transparent relative">
                <div className="absolute top-6 right-6 z-10">
                    <button
                        onClick={() => toggleFavorite(currentWord.id)}
                        className={cn(
                            "p-3 rounded-2xl transition-all duration-300 transform active:scale-125",
                            wordMetadata[currentWord.id]?.isFavorite ? "text-rose-500 bg-rose-50" : "text-[var(--slate-300)] hover:text-rose-300 bg-[var(--slate-50)]"
                        )}
                    >
                        {wordMetadata[currentWord.id]?.isFavorite ? <HeartSolid className="w-8 h-8" /> : <HeartIcon className="w-8 h-8" />}
                    </button>
                </div>
                <CardContent className="p-10 text-center">
                    <div className="space-y-8">
                        <div className="flex justify-center">
                            <div className="w-20 h-20 rounded-3xl bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center shadow-inner">
                                <PencilSquareIcon className="w-10 h-10" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <p className="text-[10px] font-bold text-[var(--slate-400)] uppercase tracking-widest">根据释义拼写单词</p>
                            <h2 className="text-4xl font-bold text-[var(--foreground)] font-heading leading-tight italic">
                                {currentWord.definition}
                            </h2>
                            <div
                                className="group/example relative inline-flex items-center gap-2 cursor-pointer"
                                onClick={(e) => { e.stopPropagation(); playTTS(currentWord.example || 'Try spelling this word'); }}
                            >
                                <p className="text-[var(--slate-400)] font-bold italic text-lg hover:text-[var(--primary)] transition-colors">
                                    {currentWord.example ? `"${currentWord.example}"` : '试着拼出这个单词'}
                                </p>
                                <SpeakerWaveIcon className="w-4 h-4 text-[var(--slate-300)] group-hover/example:text-[var(--primary)] transition-colors" />
                            </div>
                        </div>

                        {showHint && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-6 bg-orange-50 rounded-2xl border-2 border-orange-100 text-[var(--accent)] font-heading font-extrabold tracking-[0.5em] text-2xl shadow-inner"
                            >
                                {getHint()}
                            </motion.div>
                        )}

                        <form onSubmit={handleSubmit} className="relative mt-8">
                            <input
                                ref={inputRef}
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                autoComplete="off"
                                autoFocus
                                className={cn(
                                    "premium-input w-full h-24 text-center text-5xl font-bold font-heading tracking-wide transition-all duration-300",
                                    isCorrect === true && "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-[0_0_30px_rgba(16,185,129,0.2)]",
                                    isCorrect === false && "border-rose-500 bg-rose-50 text-rose-700 shadow-[0_0_30px_rgba(244,63,94,0.2)] animate-shake",
                                    "shadow-inner"
                                )}
                                placeholder="拼写单词..."
                                disabled={isCorrect === true}
                            />

                            <AnimatePresence>
                                {isCorrect === true && (
                                    <motion.div
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1.1, opacity: 1 }}
                                        className="absolute -right-6 -top-6 w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-100"
                                    >
                                        <CheckBadgeIcon className="w-10 h-10" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </form>

                        <div className="flex justify-center gap-4">
                            <button
                                type="button"
                                className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                                onClick={() => { soundManager.playFlip(); playTTS(currentWord.word); }}
                            >
                                <SpeakerWaveIcon className="w-6 h-6" />
                            </button>
                            <Button
                                variant="primary"
                                className="h-14 px-10 text-lg font-heading"
                                onClick={() => handleSubmit()}
                                disabled={!userInput.trim() || isCorrect === true}
                            >
                                提交答案
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-center flex-col items-center gap-4">
                <Button
                    variant="ghost"
                    onClick={handleRestart}
                    size="sm"
                    className="text-slate-400 hover:text-slate-600"
                >
                    <ArrowPathIcon className="w-4 h-4 mr-2" /> 重新开始这次练习
                </Button>
            </div>

            <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          50% { transform: translateX(10px); }
          75% { transform: translateX(-10px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
        </div>
    );
}
