-- 1. 创建 profiles 表，存储用户信息
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  avatar_url TEXT,
  role TEXT DEFAULT 'user', -- user, admin
  total_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  total_words_learned INTEGER DEFAULT 0,
  total_words_mastered INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. 创建 word_progress 表，存储用户对每个单词的学习进度
CREATE TABLE IF NOT EXISTS public.word_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  word_id TEXT NOT NULL,
  status TEXT DEFAULT 'unlearned', -- unlearned, learned, mastered
  is_favorite BOOLEAN DEFAULT false,
  srs_level INTEGER DEFAULT 0,
  next_review_date TIMESTAMP WITH TIME ZONE,
  custom_definition TEXT,
  notes TEXT,
  review_count INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, word_id)
);

-- 3. 创建 study_history 表，存储学习记录
CREATE TABLE IF NOT EXISTS public.study_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  game_mode TEXT,
  words_studied INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  points_earned INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0, -- 单位：秒
  start_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. 开启 Row Level Security (RLS) 保证数据安全
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.word_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_history ENABLE ROW LEVEL SECURITY;

-- 5. 创建安全策略 (Policies)
-- Profiles 策略
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Word Progress 策略
CREATE POLICY "Users can view own word progress" ON public.word_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own word progress" ON public.word_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own word progress" ON public.word_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Study History 策略
CREATE POLICY "Users can view own study history" ON public.study_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own study history" ON public.study_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. 创建触发器函数：自动为新注册用户创建 profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. 绑定触发器到 auth.users 表
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
