import { createClient } from '@supabase/supabase-js';

// 環境変数からのSupabase接続設定 (Vite / Next.js 両対応)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 環境変数が設定されているかどうかの判定フラグ
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'YOUR_SUPABASE_URL' &&
  supabaseUrl !== 'https://your-project-id.supabase.co'
);

// Supabase クライアントインスタンス（未設定時はnull）
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

