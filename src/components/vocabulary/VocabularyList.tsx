'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MagnifyingGlassIcon,
    BookOpenIcon,
    CheckBadgeIcon,
    AcademicCapIcon,
    SpeakerWaveIcon,
    HeartIcon,
    PlusIcon,
    ArrowUpTrayIcon,
    PencilIcon,
    XMarkIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useGameStore } from '@/stores/gameStore';
import { Word } from '@/types';
import { cn } from '@/lib/utils';
import { SoundManager } from '@/lib/sound';

import { getWordsFromBook } from '@/data/wordBooks';

export function VocabularyList() {
    const {
        words,
        learnedWords,
        masteredWords,
        favoriteWords,
        markAsLearned,
        markAsMastered,
        toggleFavorite,
        wordMetadata,
        preferredAudioEngine,
        customWords,
        addWord,
        updateWord,
        wordBooks,
        currentBookId,
        setCurrentBookId,
        subscribeToBook,
        showToast
    } = useGameStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'unlearned' | 'learned' | 'mastered' | 'favorite'>('all');
    const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
    const [activeView, setActiveView] = useState<'words' | 'books'>('words');

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingWord, setEditingWord] = useState<Word | null>(null);
    const [newWordData, setNewWordData] = useState<Partial<Word>>({
        word: '',
        definition: '',
        difficulty: 'medium',
        category: '自定义',
        tags: []
    });

    const soundManager = SoundManager.getInstance();

    const processedWords = useMemo(() => {
        const bookWords = currentBookId ? getWordsFromBook(currentBookId) : [];
        const allWords = [...customWords, ...bookWords];
        return allWords.map(w => {
            const meta = wordMetadata[w.id] || {};
            return {
                ...w,
                learned: learnedWords.has(w.id),
                mastered: masteredWords.has(w.id),
                isFavorite: favoriteWords.has(w.id),
                srsLevel: meta.srsLevel || 0,
                definition: meta.customDefinition || w.definition,
                notes: meta.notes || w.notes
            };
        });
    }, [currentBookId, customWords, learnedWords, masteredWords, favoriteWords, wordMetadata]);

    const filteredWords = useMemo(() => {
        return processedWords.filter(word => {
            const matchesSearch = word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
                word.definition.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = filter === 'all' ? true :
                filter === 'unlearned' ? !word.learned :
                    filter === 'learned' ? (word.learned && !word.mastered) :
                        filter === 'mastered' ? word.mastered :
                            filter === 'favorite' ? word.isFavorite : true;

            const matchesDifficulty = difficultyFilter === 'all' ? true : word.difficulty === difficultyFilter;

            return matchesSearch && matchesStatus && matchesDifficulty;
        });
    }, [processedWords, searchQuery, filter, difficultyFilter]);

    const stats = {
        total: processedWords.length,
        learned: learnedWords.size,
        mastered: masteredWords.size,
        favorites: favoriteWords.size
    };

    const handlePlaySound = (word: string) => {
        if (preferredAudioEngine === 'premium') {
            soundManager.playHighQualityTTS(word);
        } else {
            soundManager.playBasicTTS(word);
        }
    };

    const handleAddWord = () => {
        if (!newWordData.word || !newWordData.definition) return;

        const newWord: Word = {
            id: `custom_${Date.now()}`,
            word: newWordData.word,
            definition: newWordData.definition,
            pronunciation: newWordData.pronunciation || '',
            example: newWordData.example || '',
            difficulty: newWordData.difficulty as any || 'medium',
            category: '自定义',
            tags: newWordData.tags || ['User'],
            learned: false,
            mastered: false,
            isFavorite: false,
            srsLevel: 0,
            reviewCount: 0,
            correctCount: 0,
            createdAt: new Date()
        };

        addWord(newWord);
        setIsAddModalOpen(false);
        setNewWordData({ word: '', definition: '', difficulty: 'medium' });
    };

    const [isAIImportOpen, setIsAIImportOpen] = useState(false);
    const [aiInputText, setAIInputText] = useState('');
    const [isAIProcessing, setIsAIProcessing] = useState(false);

    const handleAIParse = async () => {
        if (!aiInputText.trim()) return;
        setIsAIProcessing(true);

        // 模拟 AI 解析逻辑
        setTimeout(() => {
            const lines = aiInputText.split(/[\n;]/);
            let addedCount = 0;
            lines.forEach(line => {
                const parts = line.split(/[:：-]/);
                if (parts.length >= 2) {
                    const word = parts[0].trim();
                    const def = parts.slice(1).join(':').trim();
                    if (word && def) {
                        addWord({
                            id: `ai_${Date.now()}_${Math.random()}`,
                            word,
                            definition: def,
                            difficulty: 'medium',
                            category: 'AI 提取',
                            tags: ['AI'],
                            learned: false,
                            mastered: false,
                            isFavorite: false,
                            srsLevel: 0,
                            reviewCount: 0,
                            correctCount: 0,
                            createdAt: new Date()
                        });
                        addedCount++;
                    }
                }
            });
            setIsAIProcessing(false);
            setIsAIImportOpen(false);
            setAIInputText('');
            showToast(`AI 解析成功！已提取 ${addedCount} 个新单词。`, 'success');
        }, 1500);
    };

    const handleImportTxt = () => {
        setIsAIImportOpen(true);
    };

    return (
        <div className="relative min-h-screen">
            {/* Main Content Wrap with Fade-in */}
            <div className="space-y-8 fade-in pb-20">
                {/* Header and View Switcher */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-100 pb-8">
                    <div className="flex items-center gap-8">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 font-heading">词库扩展</h2>
                            <p className="text-slate-500 font-bold mt-1">管理你的专属词书与自建词库</p>
                        </div>
                        <div className="hidden md:flex bg-slate-50 p-1 rounded-2xl border border-slate-100">
                            <button
                                onClick={() => setActiveView('words')}
                                className={cn(
                                    "px-6 py-2 rounded-xl text-xs font-black uppercase transition-all",
                                    activeView === 'words' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                我的单词
                            </button>
                            <button
                                onClick={() => setActiveView('books')}
                                className={cn(
                                    "px-6 py-2 rounded-xl text-xs font-black uppercase transition-all",
                                    activeView === 'books' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                公共词书
                            </button>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="secondary" className="flex-1 lg:flex-none py-3" onClick={handleImportTxt}>
                            <ArrowUpTrayIcon className="w-5 h-5 mr-2" /> AI 解析
                        </Button>
                        <Button variant="primary" className="flex-1 lg:flex-none py-3 shadow-xl shadow-indigo-100" onClick={() => setIsAddModalOpen(true)}>
                            <PlusIcon className="w-5 h-5 mr-2" /> 新增词条
                        </Button>
                    </div>
                </div>

                {activeView === 'words' ? (
                    <>
                        {/* Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: '当前词书', value: stats.total, color: 'text-indigo-600', icon: BookOpenIcon },
                                { label: '学习中', value: stats.learned, color: 'text-amber-500', icon: AcademicCapIcon },
                                { label: '已掌握', value: stats.mastered, color: 'text-emerald-500', icon: CheckBadgeIcon },
                                { label: '生词本', value: stats.favorites, color: 'text-rose-500', icon: HeartIcon },
                            ].map((stat, i) => (
                                <Card key={i} variant="premium" className="p-6 bg-white border-transparent">
                                    <div className="flex items-center gap-4">
                                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner", stat.color.replace('text', 'bg').replace('600', '50').replace('500', '50'))}>
                                            <stat.icon className={cn("w-6 h-6", stat.color)} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{stat.label}</p>
                                            <p className={cn("text-3xl font-black font-heading", stat.color)}>{stat.value}</p>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {/* Toolbar */}
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="搜索全站词库或自定义词义..."
                                    className="premium-input w-full !pl-14 h-14 bg-white/50 focus:bg-white"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <select className="premium-input h-14 px-6 bg-white cursor-pointer font-black text-xs uppercase" value={filter} onChange={e => setFilter(e.target.value as any)}>
                                    <option value="all">全状态</option>
                                    <option value="unlearned">未学</option>
                                    <option value="learned">练习</option>
                                    <option value="mastered">掌握</option>
                                    <option value="favorite">收藏</option>
                                </select>
                                <select className="premium-input h-14 px-6 bg-white cursor-pointer font-black text-xs uppercase" value={difficultyFilter} onChange={e => setDifficultyFilter(e.target.value as any)}>
                                    <option value="all">全难度</option>
                                    <option value="easy">入门级</option>
                                    <option value="medium">进阶级</option>
                                    <option value="hard">专业级</option>
                                </select>
                            </div>
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            <AnimatePresence mode="popLayout">
                                {filteredWords.map((word) => (
                                    <motion.div layout key={word.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
                                        <Card variant="premium" className="group p-6 bg-white hover:border-indigo-100 transition-all duration-300 relative overflow-hidden">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex gap-2">
                                                    <span className={cn("text-[9px] px-2.5 py-1.5 rounded-lg font-black uppercase tracking-tighter", word.difficulty === 'easy' ? 'bg-emerald-50 text-emerald-600' : word.difficulty === 'medium' ? 'bg-orange-50 text-orange-600' : 'bg-rose-50 text-rose-600')}>
                                                        {word.difficulty}
                                                    </span>
                                                    {word.bookId && (
                                                        <span className="text-[9px] px-2.5 py-1.5 rounded-lg font-black uppercase bg-slate-50 text-slate-400 tracking-tighter">
                                                            {wordBooks.find(b => b.id === word.bookId)?.name || 'Default'}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex gap-1">
                                                    <button onClick={() => setEditingWord(word as Word)} className="text-slate-300 hover:text-indigo-500 p-2 rounded-lg hover:bg-slate-50 transition-colors"><PencilIcon className="w-5 h-5" /></button>
                                                    <button onClick={() => toggleFavorite(word.id)} className={cn("p-2 rounded-lg transition-all", word.isFavorite ? "text-rose-500 bg-rose-50" : "text-slate-200 hover:bg-rose-50/30 hover:text-rose-300")}>
                                                        {word.isFavorite ? <HeartSolid className="w-5 h-5" /> : <HeartIcon className="w-5 h-5" />}
                                                    </button>
                                                    <button onClick={() => handlePlaySound(word.word)} className="text-slate-300 hover:text-indigo-600 p-2 rounded-lg hover:bg-indigo-50 transition-colors"><SpeakerWaveIcon className="w-5 h-5" /></button>
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-3xl font-black text-slate-900 font-heading mb-1">{word.word}</h3>
                                                <p className="text-slate-400 text-sm font-bold mb-4">/{word.pronunciation}/</p>
                                                <p className="text-slate-600 font-bold text-lg mb-8 leading-snug line-clamp-2 min-h-[3.5rem] italic">{word.definition}</p>
                                            </div>
                                            <div className="flex gap-2 mt-auto">
                                                {!word.learned ? (
                                                    <Button variant="primary" size="sm" className="flex-1 py-4" onClick={() => markAsLearned(word.id)}>加入学习</Button>
                                                ) : !word.mastered ? (
                                                    <Button variant="secondary" size="sm" className="flex-1 py-4 border-emerald-100 text-emerald-600 bg-emerald-50 hover:bg-emerald-100" onClick={() => markAsMastered(word.id)}>标记掌握</Button>
                                                ) : (
                                                    <div className="flex-1 flex items-center justify-center gap-2 text-emerald-600 text-[10px] font-black uppercase py-4 bg-emerald-50 rounded-2xl border border-emerald-100"><CheckBadgeIcon className="w-5 h-5" /> MASTERED</div>
                                                )}
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {wordBooks.map(book => (
                            <Card key={book.id} variant="premium" className={cn(
                                "p-8 group cursor-pointer transition-all duration-500 relative overflow-hidden h-full flex flex-col",
                                currentBookId === book.id ? "border-indigo-500 bg-indigo-50/30" : "bg-white hover:border-indigo-100"
                            )} onClick={() => setCurrentBookId(book.id)}>
                                <div className="absolute -right-8 -top-8 w-32 h-32 bg-indigo-50 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-700" />
                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={cn(
                                            "w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner",
                                            currentBookId === book.id ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-600"
                                        )}>
                                            <BookOpenIcon className="w-8 h-8" />
                                        </div>
                                        {book.isSubscribed && (
                                            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase rounded-lg border border-emerald-100">已订阅</span>
                                        )}
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 font-heading mb-2">{book.name}</h3>
                                    <p className="text-slate-500 font-bold mb-8 text-sm leading-relaxed flex-1">{book.description}</p>
                                    <div className="flex items-center justify-between mt-auto">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{book.wordCount} 词条</div>
                                        {currentBookId === book.id ? (
                                            <span className="text-indigo-600 font-black text-xs uppercase flex items-center gap-2 tracking-tighter">当前激活 <SparklesIcon className="w-4 h-4" /></span>
                                        ) : (
                                            <div className="text-indigo-600 font-black text-xs uppercase hover:underline">点击切换</div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                        <Card variant="premium" className="p-8 border-dashed border-2 border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center text-center group hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer">
                            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
                                <PlusIcon className="w-8 h-8 text-slate-400 group-hover:text-indigo-600" />
                            </div>
                            <h4 className="text-lg font-black text-slate-400 group-hover:text-indigo-900 font-heading">发现更多词书</h4>
                            <p className="text-xs text-slate-400 font-bold max-w-[200px] mt-2 group-hover:text-indigo-600">更多官方与社区词书即将上线</p>
                        </Card>
                    </div>
                )}
            </div>

            {/* Modals - Outside Fade-in to fix position:fixed issues */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <motion.div key="add-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
                        <motion.div
                            initial={{ scale: 0.9, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 40 }}
                            className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl p-8 space-y-6 relative max-h-[90vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900 font-heading">录入新词汇</h3>
                                    <p className="text-slate-400 text-sm">完善你的私人语料库</p>
                                </div>
                                <button onClick={() => setIsAddModalOpen(false)} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors"><XMarkIcon className="w-6 h-6 text-slate-400" /></button>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">单词</label>
                                        <input type="text" placeholder="Word" className="premium-input w-full bg-slate-50" value={newWordData.word} onChange={e => setNewWordData({ ...newWordData, word: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">音标</label>
                                        <input type="text" placeholder="/phonetic/" className="premium-input w-full bg-slate-50" value={newWordData.pronunciation} onChange={e => setNewWordData({ ...newWordData, pronunciation: e.target.value })} />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">释义</label>
                                    <input type="text" placeholder="多重含义请用分号隔开" className="premium-input w-full bg-slate-50" value={newWordData.definition} onChange={e => setNewWordData({ ...newWordData, definition: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">难度</label>
                                        <div className="flex bg-slate-50 p-1 rounded-xl">
                                            {['easy', 'medium', 'hard'].map(lvl => (
                                                <button key={lvl} onClick={() => setNewWordData({ ...newWordData, difficulty: lvl as any })} className={cn("flex-1 py-2 text-[9px] font-black uppercase rounded-lg transition-all", newWordData.difficulty === lvl ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400")}>{lvl}</button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">标签 (用逗号隔开)</label>
                                        <input type="text" placeholder="School, Exam..." className="premium-input w-full bg-slate-50" onChange={e => setNewWordData({ ...newWordData, tags: e.target.value.split(',') })} />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">例句</label>
                                    <textarea placeholder="语境记忆法..." className="premium-input w-full h-24 pt-3 resize-none bg-slate-50" value={newWordData.example} onChange={e => setNewWordData({ ...newWordData, example: e.target.value })} />
                                </div>
                            </div>
                            <Button variant="primary" className="w-full py-4 text-lg shadow-xl shadow-indigo-100" onClick={handleAddWord}>确认保存</Button>
                        </motion.div>
                    </motion.div>
                )}

                {editingWord && (
                    <motion.div key="edit-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-backdrop" onClick={() => setEditingWord(null)}>
                        <motion.div
                            initial={{ scale: 0.9, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 40 }}
                            className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl p-8 space-y-6 relative"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-2xl font-bold text-indigo-600 font-heading">个性化: {editingWord.word}</h3>
                                    <p className="text-slate-400 text-sm">定制你的专属记忆笔记</p>
                                </div>
                                <button onClick={() => setEditingWord(null)} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors"><XMarkIcon className="w-6 h-6 text-slate-400" /></button>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">重写释义</label>
                                    <input type="text" placeholder={editingWord.definition} className="premium-input w-full bg-slate-50" defaultValue={wordMetadata[editingWord.id]?.customDefinition} onChange={e => updateWord(editingWord.id, { customDefinition: e.target.value })} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">助记心得</label>
                                    <textarea placeholder="写下你的联想方式..." className="premium-input w-full h-40 pt-3 resize-none bg-slate-50" defaultValue={wordMetadata[editingWord.id]?.notes} onChange={e => updateWord(editingWord.id, { notes: e.target.value })} />
                                </div>
                            </div>
                            <Button variant="primary" className="w-full py-4 shadow-xl shadow-indigo-100" onClick={() => setEditingWord(null)}>保存设置</Button>
                        </motion.div>
                    </motion.div>
                )}

                {isAIImportOpen && (
                    <motion.div key="ai-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-backdrop" onClick={() => setIsAIImportOpen(false)}>
                        <motion.div
                            initial={{ scale: 0.9, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 40 }}
                            className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl p-8 space-y-6 relative"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 font-heading">AI 词库解析器</h3>
                                    <p className="text-slate-400 text-sm font-bold">粘贴任意文本，AI 将自动提取单词与释义</p>
                                </div>
                                <button onClick={() => setIsAIImportOpen(false)} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors"><XMarkIcon className="w-6 h-6 text-slate-400" /></button>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                                    <p className="text-[10px] text-indigo-600 font-black uppercase mb-1">提示</p>
                                    <p className="text-xs text-indigo-500 font-bold leading-relaxed">
                                        您可以粘贴如 "apple - 苹果; banana: 香蕉" 格式的文本，或者直接粘贴一段文章。
                                    </p>
                                </div>
                                <textarea
                                    placeholder="在此粘贴文本..."
                                    className="premium-input w-full h-64 pt-4 resize-none bg-slate-50"
                                    value={aiInputText}
                                    onChange={e => setAIInputText(e.target.value)}
                                />
                            </div>

                            <Button
                                variant="primary"
                                className="w-full py-4 text-lg shadow-xl shadow-indigo-100"
                                onClick={handleAIParse}
                                disabled={isAIProcessing}
                            >
                                {isAIProcessing ? 'AI 正在深度解析中...' : '立即开始智能化提取'}
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
