export interface Word {
  id: string;
  word: string;
  pronunciation?: string;
  definition: string;
  example?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  tags: string[];
  learned: boolean;
  mastered: boolean;
  isFavorite: boolean;
  srsLevel: number;
  nextReviewDate?: Date;
  lastReviewed?: Date;
  reviewCount: number;
  correctCount: number;
  notes?: string;
  customDefinition?: string;
  createdAt: Date;
  bookId?: string; // 所属词书ID
}

export interface WordBook {
  id: string;
  name: string;
  description: string;
  coverUrl?: string;
  wordCount: number;
  category: 'Official' | 'User' | 'Community';
  isSubscribed: boolean;
}

export interface GameSession {
  id: string;
  userId?: string;
  gameType: 'flashcard' | 'spelling' | 'quiz' | 'matching';
  words: Word[];
  startTime: Date;
  endTime?: Date;
  score: number;
  maxScore: number;
  accuracy: number;
  completed: boolean;
}

export interface UserProgress {
  userId?: string;
  totalWordsLearned: number;
  totalWordsMastered: number;
  currentStreak: number;
  bestStreak: number;
  totalPoints: number;
  level: number;
  role?: 'user' | 'admin';
  achievements: Achievement[];
  weeklyStats: {
    wordsLearned: number;
    timeSpent: number;
    accuracy: number;
  };
}

export interface UserProfile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin';
  total_points: number;
  level: number;
  current_streak: number;
  best_streak: number;
  total_words_learned: number;
  total_words_mastered: number;
  created_at: string;
  updated_at: string;
}

export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: {
    username?: string;
    avatar_url?: string;
  };
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date | string;
  points: number;
}

export interface StudySession {
  id: string;
  userId?: string;
  startTime: Date;
  endTime?: Date;
  wordsStudied: number;
  correctAnswers: number;
  timeSpent: number;
  pointsEarned: number;
}

export type Difficulty = 'easy' | 'medium' | 'hard';
export type GameState = 'idle' | 'playing' | 'paused' | 'completed';