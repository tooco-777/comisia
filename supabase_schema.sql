-- ===================================================
-- Comisia (コミシア) Supabase 決定版 データベース初期化スクリプト
-- Supabase コンソールの「SQL Editor」でこのスクリプトを一度だけ実行してください。
-- ===================================================

-- 1. 既存の退会関数のクリーンアップ
DROP FUNCTION IF EXISTS public.delete_user();

-- 2. profiles テーブル（クリエイタープロフィール情報）
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  handle TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  sns_links JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. adopts テーブル（アドプトモデル募集作品）
CREATE TABLE IF NOT EXISTS public.adopts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price TEXT NOT NULL,
  status TEXT DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'RESERVED', 'ADOPTED')),
  category TEXT DEFAULT '立ち絵モデル',
  image_url TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. commissions テーブル（通常依頼の受注・管理）
CREATE TABLE IF NOT EXISTS public.commissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  plan_type TEXT,
  use_case TEXT,
  character_detail TEXT NOT NULL,
  budget TEXT,
  deadline TEXT,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. inquiries テーブル（Comisia 運営事務局宛てお問い合わせ）
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ===================================================
-- Row Level Security (RLS) セキュリティ設定
-- ===================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adopts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- profiles ポリシー
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can delete their own profile" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- adopts ポリシー
DROP POLICY IF EXISTS "Adopts are viewable by everyone" ON public.adopts;
DROP POLICY IF EXISTS "Creators can insert their own adopts" ON public.adopts;
DROP POLICY IF EXISTS "Creators can update their own adopts" ON public.adopts;
DROP POLICY IF EXISTS "Creators can delete their own adopts" ON public.adopts;

CREATE POLICY "Adopts are viewable by everyone" ON public.adopts FOR SELECT USING (true);
CREATE POLICY "Creators can insert their own adopts" ON public.adopts FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators can update their own adopts" ON public.adopts FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Creators can delete their own adopts" ON public.adopts FOR DELETE USING (auth.uid() = creator_id);

-- commissions ポリシー
DROP POLICY IF EXISTS "Anyone can submit a commission" ON public.commissions;
DROP POLICY IF EXISTS "Creators can view their received commissions" ON public.commissions;

CREATE POLICY "Anyone can submit a commission" ON public.commissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Creators can view their received commissions" ON public.commissions FOR SELECT USING (auth.uid() = creator_id);

-- inquiries ポリシー
DROP POLICY IF EXISTS "Anyone can submit an inquiry" ON public.inquiries;
CREATE POLICY "Anyone can submit an inquiry" ON public.inquiries FOR INSERT WITH CHECK (true);

-- ===================================================
-- 新規ユーザー登録時の自動プロフィール作成トリガー
-- ===================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, handle, name, bio, avatar_url, banner_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'handle', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    '',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80'
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    avatar_url = EXCLUDED.avatar_url;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===================================================
-- ユーザー完全物理削除関数 (delete_user)
-- ===================================================

-- 重複シグネチャによる曖昧さ回避のため、既存の全関数を消去
DROP FUNCTION IF EXISTS public.delete_user();
DROP FUNCTION IF EXISTS public.delete_user(UUID);
DROP FUNCTION IF EXISTS public.delete_user_by_email(TEXT);

-- 単一・全ユーザー共通の完全物理削除関数 (0引数)
CREATE OR REPLACE FUNCTION public.delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, storage
AS $$
DECLARE
  v_uid UUID;
BEGIN
  -- ログイン中ユーザー (auth.uid()) を自動取得
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION '未ログイン状態のため削除できません。';
  END IF;

  -- 1. パブリックテーブルの関連データ削除
  DELETE FROM public.adopts WHERE creator_id = v_uid;
  DELETE FROM public.commissions WHERE creator_id = v_uid;
  DELETE FROM public.profiles WHERE id = v_uid;

  -- 2. Storage 関連データの削除
  BEGIN
    DELETE FROM storage.objects WHERE owner = v_uid;
  EXCEPTION WHEN OTHERS THEN END;

  -- 3. Supabase Auth サブテーブル・セッション・トークンの完全クリア
  BEGIN DELETE FROM auth.mfa_amr_claims WHERE session_id IN (SELECT id FROM auth.sessions WHERE user_id = v_uid); EXCEPTION WHEN OTHERS THEN END;
  BEGIN DELETE FROM auth.mfa_challenges WHERE factor_id IN (SELECT id FROM auth.mfa_factors WHERE user_id = v_uid); EXCEPTION WHEN OTHERS THEN END;
  BEGIN DELETE FROM auth.mfa_factors WHERE user_id = v_uid; EXCEPTION WHEN OTHERS THEN END;
  BEGIN DELETE FROM auth.refresh_tokens WHERE session_id IN (SELECT id FROM auth.sessions WHERE user_id = v_uid); EXCEPTION WHEN OTHERS THEN END;
  BEGIN DELETE FROM auth.sessions WHERE user_id = v_uid; EXCEPTION WHEN OTHERS THEN END;
  BEGIN DELETE FROM auth.identities WHERE user_id = v_uid; EXCEPTION WHEN OTHERS THEN END;
  BEGIN DELETE FROM auth.one_time_tokens WHERE user_id = v_uid; EXCEPTION WHEN OTHERS THEN END;

  -- 4. auth.users 認証テーブル本体から完全物理削除
  DELETE FROM auth.users WHERE id = v_uid;
END;
$$;

-- 実行権限の付与
GRANT EXECUTE ON FUNCTION public.delete_user() TO authenticated, anon, service_role;


