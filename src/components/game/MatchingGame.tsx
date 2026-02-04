'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Word } from '@/types';
import { shuffleArray, cn } from '@/lib/utils';
import { SoundManager } from '@/lib/sound';
import {
    BoltIcon,
    ArrowPathIcon,
    ClockIcon,
    FireIcon,
    TrophyIcon
} from '@heroicons/react/24/outline';

interface MatchingGameProps {
    words: Word[];
    onComplete: (stats: { score: number; maxScore: number; correctAnswers: number; totalQuestions: number; words: Word[] }) => void;
}

interface MatchingPair {
    id: string;
    text: string;
    type: 'word' | 'definition';
    wordId: string;
}

export function MatchingGame({ words, onComplete }: MatchingGameProps) {
    const [items, setItems] = useState<MatchingPair[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set());
    const [wrongId, setWrongId] = useState<string | null>(null);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30); // 30 seconds for Blitz
    const [combo, setCombo] = useState(0);
    const [showCombo, setShowCombo] = useState(false);
    const [isGameOver, setIsGameOver] = useState(false);

    const [gamePool, setGamePool] = useState<Word[]>([]);
    const [correctCount, setCorrectCount] = useState(0);

    const soundManager = SoundManager.getInstance();
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const { updateScore, updateSRS, preferredAudioEngine } = useGameStore();

    // Start/Reset Game
    const initGame = () => {
        const pool = shuffleArray(words).slice(0, Math.min(words.length, 10)); // Use up to 10 words
        setGamePool(pool);
        const wordItems: MatchingPair[] = pool.map(w => ({
            id: `word-${w.id}`,
            text: w.word,
            type: 'word',
            wordId: w.id
        }));
        const defItems: MatchingPair[] = pool.map(w => ({
            id: `def-${w.id}`,
            text: w.definition,
            type: 'definition',
            wordId: w.id
        }));

        setItems(shuffleArray([...wordItems, ...defItems]));
        setMatchedIds(new Set());
        setSelectedId(null);
        setScore(0);
        setCorrectCount(0);
        setTimeLeft(30);
        setCombo(0);
        setIsGameOver(false);
    };

    useEffect(() => {
        initGame();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [words]);

    // Timer Logic
    useEffect(() => {
        if (timeLeft > 0 && !isGameOver && matchedIds.size < items.length) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && !isGameOver) {
            handleGameOver();
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [timeLeft, isGameOver, matchedIds.size, items.length]);

    const handleGameOver = (finalScore?: number, finalCorrectCount?: number) => {
        setIsGameOver(true);
        if (timerRef.current) clearInterval(timerRef.current);
        const s = finalScore !== undefined ? finalScore : score;
        const c = finalCorrectCount !== undefined ? finalCorrectCount : correctCount;
        setTimeout(() => {
            onComplete({
                score: s,
                maxScore: gamePool.length * 2,
                correctAnswers: c,
                totalQuestions: gamePool.length,
                words: gamePool
            });
        }, 2000);
    };

    const handleSelectItem = (item: MatchingPair) => {
        if (isGameOver || matchedIds.has(item.id) || wrongId !== null) return;

        if (selectedId === null) {
            setSelectedId(item.id);
            soundManager.playFlip();
            return;
        }

        if (selectedId === item.id) {
            setSelectedId(null);
            return;
        }

        const firstItem = items.find(i => i.id === selectedId)!;

        // Check if they match
        if (firstItem.wordId === item.wordId && firstItem.type !== item.type) {
            // Match found!
            const newMatched = new Set(matchedIds);
            newMatched.add(firstItem.id);
            newMatched.add(item.id);
            setMatchedIds(newMatched);
            setSelectedId(null);

            // Score with Combo Multiplier
            const newCombo = combo + 1;
            setCombo(newCombo);
            setShowCombo(true);
            setTimeout(() => setShowCombo(false), 800);

            const basePoints = 1;
            const comboBonus = newCombo > 1 ? 2 : 0;
            const speedBonus = timeLeft > 15 ? 1 : 0;
            const totalPoints = basePoints + comboBonus + speedBonus;

            setScore(prev => prev + totalPoints);
            setCorrectCount(prev => prev + 1);
            updateScore(totalPoints, true);
            updateSRS(item.wordId, true);
            soundManager.playCorrect();

            // Add time bonus for match
            setTimeLeft(prev => Math.min(prev + 2, 45));

            if (newMatched.size === items.length) {
                // All cleared!
                handleGameOver(score + totalPoints, correctCount + 1);
            }
        } else {
            // Wrong match
            setWrongId(item.id);
            setCombo(0);
            setScore(prev => Math.max(0, prev - 1));
            updateScore(-1);
            soundManager.playIncorrect();
            setTimeout(() => {
                setWrongId(null);
                setSelectedId(null);
            }, 600);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-4 lg:p-0 fade-in relative min-h-[600px]">
            {/* Blitz Status Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
                <div className="flex items-center gap-6">
                    <Card className="px-6 py-4 bg-white flex items-center gap-4 border-transparent shadow-xl rounded-3xl">
                        <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                            timeLeft < 10 ? "bg-rose-50 text-rose-500 animate-pulse" : "bg-indigo-50 text-indigo-600"
                        )}>
                            <ClockIcon className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">剩余时间</p>
                            <p className={cn("text-3xl font-black font-heading leading-none", timeLeft < 10 ? "text-rose-500" : "text-slate-900")}>
                                {timeLeft}s
                            </p>
                        </div>
                    </Card>

                    <Card className="px-6 py-4 bg-white flex items-center gap-4 border-transparent shadow-xl rounded-3xl overflow-hidden relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center relative z-10">
                            <FireIcon className="w-7 h-7" />
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">连击倍数</p>
                            <p className="text-3xl font-black font-heading text-slate-900 leading-none">x{combo}</p>
                        </div>
                    </Card>
                </div>

                <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">当前 Blitz 得分</p>
                    <h2 className="text-6xl font-black text-indigo-600 font-heading tracking-tight underline elevation-4 decoration-indigo-100 underline-offset-8">
                        {score}
                    </h2>
                </div>
            </div>

            {/* Grid Container */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-100/50 rounded-[3rem] border-4 border-white shadow-inner mb-10">
                <AnimatePresence>
                    {items.map((item) => {
                        const isSelected = selectedId === item.id;
                        const isMatched = matchedIds.has(item.id);
                        const isWrong = wrongId === item.id || (wrongId !== null && selectedId === item.id);

                        return (
                            <motion.button
                                key={item.id}
                                layout
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{
                                    opacity: isMatched ? 0 : 1,
                                    scale: isMatched ? 0.5 : 1,
                                    y: isMatched ? -20 : isSelected ? -8 : 0,
                                    rotate: isSelected ? [0, -2, 2, 0] : 0
                                }}
                                transition={{
                                    rotate: { type: 'keyframes', duration: 0.3 },
                                    default: { type: 'spring', damping: 20 }
                                }}
                                onClick={() => handleSelectItem(item)}
                                disabled={isMatched || isGameOver}
                                className={cn(
                                    "p-4 h-36 flex items-center justify-center text-center rounded-[2rem] font-bold transition-all duration-300 border-4 select-none group",
                                    isSelected ? "bg-indigo-600 border-indigo-400 text-white shadow-2xl scale-105" :
                                        isWrong ? "bg-rose-50 border-rose-500 text-rose-600 animate-shake" :
                                            "bg-white border-white text-slate-700 hover:border-indigo-100 hover:shadow-xl shadow-md"
                                )}
                            >
                                <div className="space-y-2">
                                    <span className={cn(
                                        "block leading-tight break-words",
                                        item.type === 'word' ? "text-2xl font-black font-heading" : "text-sm font-bold line-clamp-4"
                                    )}>
                                        {item.text}
                                    </span>
                                </div>
                            </motion.button>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Speed Feedback Overlay */}
            <AnimatePresence>
                {showCombo && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, y: 0 }}
                        animate={{ opacity: 1, scale: 1.5, y: -100 }}
                        exit={{ opacity: 0 }}
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 pointer-events-none z-50"
                    >
                        <div className="flex flex-col items-center">
                            <span className="text-6xl font-black text-orange-500 drop-shadow-lg font-heading italic">
                                COMBO x{combo}
                            </span>
                            <span className="text-xl font-bold text-indigo-600 uppercase tracking-tighter bg-white px-4 py-1 rounded-full shadow-lg">
                                Match! +{1 + (combo > 1 ? 2 : 0)}
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Footer */}
            <div className="flex justify-between items-center px-6">
                <div className="flex items-center gap-3 text-slate-400 font-bold uppercase tracking-widest text-xs">
                    <BoltIcon className="w-5 h-5 text-indigo-400" />
                    <span>Blitz Mode: 速度越快，得分越高！</span>
                </div>

                <Button
                    variant="ghost"
                    onClick={initGame}
                    size="sm"
                    className="text-slate-400 hover:text-slate-900 group"
                >
                    <ArrowPathIcon className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                    重置本局
                </Button>
            </div>

            {/* Game Over Overlay */}
            <AnimatePresence>
                {isGameOver && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md rounded-[3rem]"
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white p-12 rounded-[3rem] text-center shadow-2xl space-y-6"
                        >
                            <TrophyIcon className="w-24 h-24 text-orange-500 mx-auto" />
                            <h3 className="text-4xl font-black font-heading text-slate-900">Blitz 挑战结束！</h3>
                            <div className="space-y-2">
                                <p className="text-slate-400 font-bold uppercase tracking-widest">最终得分</p>
                                <p className="text-6xl font-black text-indigo-600 font-heading">{score}</p>
                            </div>
                            <p className="text-slate-400 font-medium">正在同步您的成就进度...</p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    20% { transform: translateX(-8px); rotate: -1deg; }
                    40% { transform: translateX(8px); rotate: 1deg; }
                    60% { transform: translateX(-8px); rotate: -1deg; }
                    80% { transform: translateX(8px); rotate: 1deg; }
                }
                .animate-shake {
                    animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
                }
            `}</style>
        </div>
    );
}
