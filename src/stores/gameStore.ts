import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Word, WordBook, UserProgress, StudySession, GameSession, Achievement, AuthUser, UserProfile } from '@/types';
import { calculateLevel } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { wordBooks as defaultBooks } from '@/data/wordBooks';

interface GameStore {
  // 单词相关
  words: Word[];
  currentWord: Word | null;
  learnedWords: Set<string>;
  masteredWords: Set<string>;
  favoriteWords: Set<string>;
  customWords: Word[];
  wordMetadata: Record<string, {
    srsLevel: number;
    nextReviewDate?: string;
    isFavorite: boolean;
    notes?: string;
    customDefinition?: string;
  }>;

  // 词书相关
  wordBooks: WordBook[];
  currentBookId: string | null;

  // 游戏状态
  gameMode: 'flashcard' | 'spelling' | 'quiz' | 'matching' | null;
  gameState: 'idle' | 'playing' | 'paused' | 'completed';
  currentSession: GameSession | null;
  score: number;

  // 用户进度与认证
  user: AuthUser | null;
  profile: UserProfile | null;
  userProgress: UserProgress;
  achievements: Achievement[];

  // 学习会话
  currentStudySession: StudySession | null;
  studyHistory: StudySession[];

  // Navigation & Theme
  activeTab: string;
  theme: 'light' | 'dark' | 'system';
  preferredAudioEngine: 'premium' | 'standard';

  // Actions
  setWords: (words: Word[]) => void;
  setCurrentWord: (word: Word) => void;
  markAsLearned: (wordId: string) => void;
  markAsMastered: (wordId: string) => void;
  toggleFavorite: (wordId: string) => void;
  updateSRS: (wordId: string, isCorrect: boolean) => void;
  startGame: (mode: 'flashcard' | 'spelling' | 'quiz' | 'matching', words: Word[]) => void;
  endGame: () => void;
  updateScore: (points: number) => void;
  startStudySession: () => void;
  endStudySession: () => void;
  unlockAchievement: (achievement: Achievement) => void;
  addStudyHistory: (session: StudySession) => void;
  setGameState: (state: 'idle' | 'playing' | 'paused' | 'completed') => void;
  setActiveTab: (tab: string) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setPreferredAudioEngine: (engine: 'premium' | 'standard') => void;
  addWord: (word: Word) => void;
  updateWord: (wordId: string, updates: Partial<Word>) => void;

  // 词书 Actions
  setCurrentBookId: (bookId: string) => void;
  subscribeToBook: (bookId: string) => void;

  // Auth Actions
  setUser: (user: AuthUser | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  logout: () => Promise<void>;
  syncProgressToCloud: () => Promise<void>;
  loadProgressFromCloud: () => Promise<void>;

  // Toast Actions
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  toasts: { id: string, message: string, type: 'success' | 'error' | 'info' }[];
}

const defaultUserProgress: UserProgress = {
  totalWordsLearned: 0,
  totalWordsMastered: 0,
  currentStreak: 0,
  bestStreak: 0,
  totalPoints: 0,
  level: 1,
  achievements: [],
  weeklyStats: {
    wordsLearned: 0,
    timeSpent: 0,
    accuracy: 0,
  },
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // 初始状态
      words: [],
      currentWord: null,
      learnedWords: new Set(),
      masteredWords: new Set(),
      favoriteWords: new Set(),
      customWords: [],
      wordMetadata: {},
      wordBooks: defaultBooks,
      currentBookId: 'book_k9',
      gameMode: null,
      gameState: 'idle',
      currentSession: null,
      score: 0,
      user: null,
      profile: null,
      userProgress: defaultUserProgress,
      achievements: [],
      currentStudySession: null,
      studyHistory: [],
      activeTab: '主页',
      theme: 'system',
      preferredAudioEngine: 'premium',
      toasts: [],

      showToast: (message, type = 'info') => {
        const id = Math.random().toString(36).substring(7);
        set(state => ({
          toasts: [...state.toasts, { id, message, type }]
        }));
      },

      removeToast: (id) => {
        set(state => ({
          toasts: state.toasts.filter(t => t.id !== id)
        }));
      },

      // Actions
      setWords: (words) => set({ words }),
      setCurrentWord: (word) => set({ currentWord: word }),

      markAsLearned: (wordId) => set((state) => {
        const newLearnedWords = new Set(state.learnedWords).add(wordId);
        const updatedProgress = {
          ...state.userProgress,
          totalWordsLearned: newLearnedWords.size,
        };
        const newState = {
          learnedWords: newLearnedWords,
          userProgress: updatedProgress,
        };
        // Trigger cloud sync if logged in
        if (state.user) setTimeout(() => get().syncProgressToCloud(), 100);
        return newState;
      }),

      markAsMastered: (wordId) => set((state) => {
        const newMasteredWords = new Set(state.masteredWords).add(wordId);
        const updatedProgress = {
          ...state.userProgress,
          totalWordsMastered: newMasteredWords.size,
        };
        const newState = {
          masteredWords: newMasteredWords,
          userProgress: updatedProgress,
        };
        if (state.user) setTimeout(() => get().syncProgressToCloud(), 100);
        return newState;
      }),

      addWord: (word) => set((state) => ({
        customWords: [word, ...state.customWords],
      })),

      updateWord: (wordId, updates) => set((state) => {
        const metadata = state.wordMetadata[wordId] || { srsLevel: 0, isFavorite: false };
        const metadataUpdates: any = {};
        if ('notes' in updates) metadataUpdates.notes = updates.notes;
        if ('customDefinition' in updates) metadataUpdates.customDefinition = updates.customDefinition;
        if ('isFavorite' in updates) metadataUpdates.isFavorite = updates.isFavorite;

        const newMetadata = {
          ...state.wordMetadata,
          [wordId]: { ...metadata, ...metadataUpdates }
        };

        const customWords = state.customWords.map(w => w.id === wordId ? { ...w, ...updates } : w);

        const newState = {
          wordMetadata: newMetadata,
          customWords
        };
        if (state.user) setTimeout(() => get().syncProgressToCloud(), 100);
        return newState;
      }),

      toggleFavorite: (wordId) => set((state) => {
        const metadata = state.wordMetadata[wordId] || { srsLevel: 0, isFavorite: false };
        const newFavoriteWords = new Set(state.favoriteWords);
        const isFavorite = !metadata.isFavorite;

        if (isFavorite) {
          newFavoriteWords.add(wordId);
        } else {
          newFavoriteWords.delete(wordId);
        }

        const newState = {
          favoriteWords: newFavoriteWords,
          wordMetadata: {
            ...state.wordMetadata,
            [wordId]: { ...metadata, isFavorite }
          }
        };
        if (state.user) setTimeout(() => get().syncProgressToCloud(), 100);
        return newState;
      }),

      updateSRS: (wordId, isCorrect) => set((state) => {
        const metadata = state.wordMetadata[wordId] || { srsLevel: 0, isFavorite: false };
        let newLevel = isCorrect ? metadata.srsLevel + 1 : Math.max(0, metadata.srsLevel - 1);
        if (newLevel > 7) newLevel = 7;

        const intervals = [0, 1, 2, 4, 7, 15, 30, 60, 180];
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + intervals[newLevel]);

        const newState = {
          wordMetadata: {
            ...state.wordMetadata,
            [wordId]: {
              ...metadata,
              srsLevel: newLevel,
              nextReviewDate: nextDate.toISOString()
            }
          }
        };
        if (state.user) setTimeout(() => get().syncProgressToCloud(), 100);
        return newState;
      }),

      startGame: (mode, words) => set((state) => ({
        gameMode: mode,
        gameState: 'playing',
        currentSession: {
          id: Date.now().toString(),
          gameType: mode,
          words,
          startTime: new Date(),
          score: 0,
          maxScore: words.length * 2,
          accuracy: 0,
          completed: false,
        },
        score: 0,
      })),

      endGame: () => set((state) => {
        if (state.currentSession) {
          const endTime = new Date();
          const completedSession = {
            ...state.currentSession,
            endTime,
            score: state.score,
            accuracy: state.currentSession.maxScore > 0 ? state.score / state.currentSession.maxScore : 0,
            completed: true,
          };

          const newPoints = state.userProgress.totalPoints + state.score;
          const updatedProgress = {
            ...state.userProgress,
            totalPoints: newPoints,
            level: calculateLevel(newPoints)
          };

          const historyEntry: StudySession = {
            id: state.currentSession.id,
            startTime: state.currentSession.startTime,
            endTime: endTime,
            wordsStudied: state.currentSession.words.length,
            correctAnswers: state.currentSession.maxScore > 0
              ? Math.round((state.score / state.currentSession.maxScore) * state.currentSession.words.length)
              : 0,
            timeSpent: Math.round((endTime.getTime() - state.currentSession.startTime.getTime()) / 60000),
            pointsEarned: state.score
          };

          const newState = {
            gameState: 'completed' as const,
            currentSession: completedSession,
            userProgress: updatedProgress,
            studyHistory: [...state.studyHistory, historyEntry],
          };
          if (state.user) setTimeout(() => get().syncProgressToCloud(), 100);
          return newState;
        }
        return { gameState: 'completed' as const };
      }),

      updateScore: (points) => set((state) => {
        const newPoints = state.userProgress.totalPoints + points;
        const newState = {
          score: state.score + points,
          userProgress: {
            ...state.userProgress,
            totalPoints: newPoints,
            level: calculateLevel(newPoints)
          }
        };
        if (state.user) setTimeout(() => get().syncProgressToCloud(), 100);
        return newState;
      }),

      startStudySession: () => set({
        currentStudySession: {
          id: Date.now().toString(),
          startTime: new Date(),
          wordsStudied: 0,
          correctAnswers: 0,
          timeSpent: 0,
          pointsEarned: 0,
        },
      }),

      endStudySession: () => set((state) => {
        if (state.currentStudySession) {
          const completedSession = {
            ...state.currentStudySession,
            endTime: new Date(),
          };
          const newState = {
            currentStudySession: null,
            studyHistory: [...state.studyHistory, completedSession],
          };
          if (state.user) setTimeout(() => get().syncProgressToCloud(), 100);
          return newState;
        }
        return {};
      }),

      unlockAchievement: (achievement) => set((state) => {
        const newState = {
          achievements: [...state.achievements, achievement],
          userProgress: {
            ...state.userProgress,
            totalPoints: state.userProgress.totalPoints + achievement.points,
          },
        };
        if (state.user) setTimeout(() => get().syncProgressToCloud(), 100);
        return newState;
      }),

      addStudyHistory: (session) => set((state) => ({
        studyHistory: [...state.studyHistory, session],
      })),

      setGameState: (state) => set({ gameState: state }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setTheme: (theme) => set({ theme }),
      setPreferredAudioEngine: (preferredAudioEngine) => set({ preferredAudioEngine }),

      // 词书 Actions
      setCurrentBookId: (currentBookId) => set({ currentBookId }),
      subscribeToBook: (bookId) => set((state) => ({
        wordBooks: state.wordBooks.map(b => b.id === bookId ? { ...b, isSubscribed: true } : b)
      })),

      // Auth actions
      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      logout: async () => {
        await supabase.auth.signOut();
        set({
          user: null,
          profile: null,
          learnedWords: new Set(),
          masteredWords: new Set(),
          favoriteWords: new Set(),
          wordMetadata: {},
          userProgress: defaultUserProgress,
          achievements: [],
          studyHistory: []
        });
      },

      syncProgressToCloud: async () => {
        const { user, userProgress, wordMetadata, customWords } = get();
        if (!user) return;

        try {
          // 1. Sync Profile
          await supabase.from('profiles').update({
            total_points: userProgress.totalPoints,
            level: userProgress.level,
            total_words_learned: userProgress.totalWordsLearned,
            total_words_mastered: userProgress.totalWordsMastered,
          }).eq('id', user.id);

          // 2. Sync Custom Words (AI extracted)
          if (customWords.length > 0) {
            const customData = customWords.map(w => ({
              ...w,
              user_id: user.id,
              // Cleanup frontend-only properties before sync if necessary
            }));
            const { error: customError } = await supabase.from('custom_words').upsert(customData, { onConflict: 'id' });
            if (customError) console.warn('Custom words sync issue:', customError);
          }

          // 3. Sync word progress (SRS, Notes, Favorites)
          const upsertData = Object.entries(wordMetadata).map(([wordId, meta]) => ({
            user_id: user.id,
            word_id: wordId,
            srs_level: meta.srsLevel,
            is_favorite: meta.isFavorite,
            notes: meta.notes,
            custom_definition: meta.customDefinition,
            next_review_date: meta.nextReviewDate,
            status: get().masteredWords.has(wordId) ? 'mastered' : get().learnedWords.has(wordId) ? 'learned' : 'unlearned'
          }));

          if (upsertData.length > 0) {
            const { error: progressError } = await supabase.from('word_progress').upsert(upsertData, { onConflict: 'user_id,word_id' });
            if (progressError) throw progressError;
          }

          console.log('✅ Sync Completed successfully');
          get().showToast('云端同步成功！', 'success');
        } catch (error) {
          console.error('❌ Sync Failed:', error);
          get().showToast('同步失败，请检查网络连接', 'error');
        }
      },

      loadProgressFromCloud: async () => {
        const { user } = get();
        if (!user) return;

        try {
          // Parallel loading
          const [profileRes, progressRes, customRes] = await Promise.all([
            supabase.from('profiles').select('*').eq('id', user.id).single(),
            supabase.from('word_progress').select('*').eq('user_id', user.id),
            supabase.from('custom_words').select('*').eq('user_id', user.id)
          ]);

          if (profileRes.data) {
            set({
              userProgress: {
                ...get().userProgress,
                totalPoints: profileRes.data.total_points,
                level: profileRes.data.level,
                totalWordsLearned: profileRes.data.total_words_learned,
                totalWordsMastered: profileRes.data.total_words_mastered,
                role: profileRes.data.role
              }
            });
          }

          if (customRes.data) {
            set({ customWords: customRes.data });
          }

          if (progressRes.data) {
            const metadata: any = {};
            const favoriteIds = new Set<string>();
            const learnedIds = new Set<string>();
            const masteredIds = new Set<string>();

            progressRes.data.forEach(p => {
              metadata[p.word_id] = {
                srsLevel: p.srs_level,
                isFavorite: p.is_favorite,
                notes: p.notes,
                customDefinition: p.custom_definition,
                nextReviewDate: p.next_review_date
              };
              if (p.is_favorite) favoriteIds.add(p.word_id);
              if (p.status === 'learned') learnedIds.add(p.word_id);
              if (p.status === 'mastered') masteredIds.add(p.word_id);
            });

            set({
              wordMetadata: metadata,
              favoriteWords: favoriteIds,
              learnedWords: learnedIds,
              masteredWords: masteredIds
            });
          }

          get().showToast('云端数据拉取成功！', 'success');
        } catch (error) {
          console.error('Error loading cloud progress:', error);
          get().showToast('拉取数据失败', 'error');
        }
      }
    }),
    {
      name: 'word-game-storage',
      partialize: (state) => ({
        learnedWords: Array.from(state.learnedWords),
        masteredWords: Array.from(state.masteredWords),
        favoriteWords: Array.from(state.favoriteWords),
        wordMetadata: state.wordMetadata,
        userProgress: state.userProgress,
        achievements: state.achievements,
        studyHistory: state.studyHistory,
        activeTab: state.activeTab,
        theme: state.theme,
        preferredAudioEngine: state.preferredAudioEngine,
        customWords: state.customWords,
        user: state.user,
        profile: state.profile
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.learnedWords = new Set(state.learnedWords);
          state.masteredWords = new Set(state.masteredWords);
          state.favoriteWords = new Set(state.favoriteWords);
        }
      },
    }
  )
);