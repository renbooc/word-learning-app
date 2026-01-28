'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Word } from '@/types';
import { shuffleArray, cn } from '@/lib/utils';
import { SoundManager } from '@/lib/sound';
import {
    SpeakerWaveIcon,
    XCircleIcon,
    SparklesIcon,
    ArrowPathIcon,
    QuestionMarkCircleIcon,
    CheckBadgeIcon,
    HeartIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';

interface QuizGameProps {
    words: Word[];
    onComplete: (score: number, maxScore: number) => void;
}

interface QuizQuestion {
    word: Word;
    options: string[];
    correctAnswer: string;
}

export function QuizGame({ words, onComplete }: QuizGameProps) {
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [score, setScore] = useState(0);
    const [gameWords, setGameWords] = useState<Word[]>([]);
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

    const currentWord = gameWords[currentWordIndex];
    const progress = (currentWordIndex / gameWords.length) * 100;

    const quizQuestion = useMemo((): QuizQuestion | null => {
        if (!currentWord || gameWords.length === 0) return null;

        // Generate distractors from all available words (prefer matching category if possible, but here we just take random ones)
        const otherWords = gameWords.filter(w => w.id !== currentWord.id);
        const distractors = shuffleArray(otherWords)
            .slice(0, 3)
            .map(w => w.definition);

        const options = shuffleArray([...distractors, currentWord.definition]);

        return {
            word: currentWord,
            options,
            correctAnswer: currentWord.definition
        };
    }, [currentWord, gameWords]);

    const handleSelectOption = (option: string) => {
        if (selectedOption !== null) return;

        setSelectedOption(option);
        const correct = option === currentWord?.definition;
        setIsCorrect(correct);

        if (currentWord) {
            updateSRS(currentWord.id, correct);
        }

        if (correct) {
            setScore(prev => prev + 10);
            updateScore(10);
            soundManager.playCorrect();
            playTTS(currentWord?.word || '');
        } else {
            soundManager.playIncorrect();
        }

        setTimeout(() => {
            nextWord();
        }, 1500);
    };

    const nextWord = () => {
        setSelectedOption(null);
        setIsCorrect(null);
        if (currentWordIndex < gameWords.length - 1) {
            setCurrentWordIndex(prev => prev + 1);
        } else {
            onComplete(score, words.length * 10);
        }
    };

    const handleRestart = () => {
        setCurrentWordIndex(0);
        setSelectedOption(null);
        setIsCorrect(null);
        setScore(0);
        setGameWords(shuffleArray(words));
    };

    if (!quizQuestion || !currentWord) return null;

    return (
        <div className="max-w-2xl mx-auto p-4 lg:p-0 fade-in">
            {/* Header Info */}
            <div className="flex justify-between items-center mb-8">
                <div className="space-y-1">
                    <p className="text-[10px] font-bold text-[var(--slate-400)] uppercase tracking-widest">当前进度</p>
                    <p className="text-xl font-bold text-[var(--foreground)] font-heading">
                        {currentWordIndex + 1} <span className="text-[var(--slate-300)]">/</span> {gameWords.length}
                    </p>
                </div>
                <div className="text-right space-y-1">
                    <p className="text-[10px] font-bold text-[var(--slate-400)] uppercase tracking-widest">当前得分</p>
                    <p className="text-xl font-bold text-[var(--primary)] font-heading">{score} PTS</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[var(--primary-light)] rounded-full h-3 mb-12 shadow-inner">
                <motion.div
                    className="bg-[var(--primary)] h-3 rounded-full shadow-[0_2px_4px_rgba(79,70,229,0.2)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>

            <Card variant="premium" className="mb-10 overflow-visible relative border-transparent">
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
                                <QuestionMarkCircleIcon className="w-10 h-10" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <p className="text-[10px] font-bold text-[var(--slate-400)] uppercase tracking-widest">选择正确的选项</p>
                            <div className="flex items-center justify-center gap-4">
                                <h2 className="text-5xl font-bold text-[var(--foreground)] font-heading">
                                    {currentWord.word}
                                </h2>
                                <button
                                    onClick={() => playTTS(currentWord.word)}
                                    className="p-3 rounded-2xl bg-[var(--slate-50)] text-[var(--slate-400)] hover:text-[var(--primary)] transition-all"
                                >
                                    <SpeakerWaveIcon className="w-6 h-6" />
                                </button>
                            </div>
                            <p className="text-xl text-[var(--slate-400)] font-bold italic">
                                /{currentWord.pronunciation}/
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 mt-12">
                            {quizQuestion.options.map((option, index) => {
                                const isSelected = selectedOption === option;
                                const isAnswerCorrect = option === currentWord.definition;

                                let buttonStyle = "bg-white border-2 border-[var(--slate-100)] text-[var(--slate-600)] hover:border-[var(--primary)] hover:bg-[var(--primary-light)]";

                                if (selectedOption !== null) {
                                    if (isAnswerCorrect) {
                                        buttonStyle = "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-[0_4px_0_#16a34a]";
                                    } else if (isSelected) {
                                        buttonStyle = "bg-rose-50 border-rose-500 text-rose-700 shadow-[0_4px_0_#be123c]";
                                    } else {
                                        buttonStyle = "bg-white border-2 border-[var(--slate-50)] text-[var(--slate-300)] opacity-50";
                                    }
                                }

                                return (
                                    <motion.button
                                        key={index}
                                        whileHover={selectedOption === null ? { translateY: -2 } : {}}
                                        whileTap={selectedOption === null ? { scale: 0.98 } : {}}
                                        onClick={() => handleSelectOption(option)}
                                        disabled={selectedOption !== null}
                                        className={cn(
                                            "w-full p-6 text-left rounded-2xl font-bold transition-all duration-200 text-lg flex items-center justify-between",
                                            buttonStyle
                                        )}
                                    >
                                        <span>{option}</span>
                                        {selectedOption !== null && isAnswerCorrect && <CheckBadgeIcon className="w-6 h-6" />}
                                        {selectedOption !== null && isSelected && !isAnswerCorrect && <XCircleIcon className="w-6 h-6" />}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-center flex-col items-center gap-4">
                <Button
                    variant="ghost"
                    onClick={handleRestart}
                    size="sm"
                    className="text-[var(--slate-400)] hover:text-[var(--foreground)]"
                >
                    <ArrowPathIcon className="w-4 h-4 mr-2" /> 重新开始这次练习
                </Button>
            </div>
        </div>
    );
}
