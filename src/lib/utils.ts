import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function calculateLevel(points: number): number {
  // 100 * lvl^1.5 difficulty curve
  let level = 1;
  while (points >= Math.floor(100 * Math.pow(level, 1.5))) {
    level++;
  }
  return level;
}

export function getUserTitle(level: number): { title: string; color: string; icon: string } {
  if (level >= 30) return { title: '语言传奇', color: 'text-rose-600', icon: '👑' };
  if (level >= 20) return { title: '词源宗师', color: 'text-orange-600', icon: '💎' };
  if (level >= 15) return { title: '博学者', color: 'text-indigo-600', icon: '📖' };
  if (level >= 10) return { title: '资深翻译官', color: 'text-emerald-600', icon: '🎓' };
  if (level >= 5) return { title: '词汇猎手', color: 'text-blue-600', icon: '🏹' };
  if (level >= 3) return { title: '探险者', color: 'text-amber-600', icon: '🧗' };
  return { title: '新手学徒', color: 'text-slate-500', icon: '🌱' };
}

export function calculateProgress(points: number): number {
  const currentLevel = calculateLevel(points);
  const currentLevelThreshold = Math.floor(100 * Math.pow(currentLevel - 1, 1.5));
  const nextLevelThreshold = Math.floor(100 * Math.pow(currentLevel, 1.5));

  if (nextLevelThreshold === currentLevelThreshold) return 0;
  return ((points - currentLevelThreshold) / (nextLevelThreshold - currentLevelThreshold)) * 100;
}

export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function getDifficultyColor(difficulty: 'easy' | 'medium' | 'hard'): string {
  switch (difficulty) {
    case 'easy':
      return 'text-green-600 bg-green-100';
    case 'medium':
      return 'text-yellow-600 bg-yellow-100';
    case 'hard':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}


export function isToday(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

export function isStreakActive(lastStudyDate?: Date): boolean {
  if (!lastStudyDate) return false;
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  return isToday(lastStudyDate) || lastStudyDate.toDateString() === yesterday.toDateString();
}