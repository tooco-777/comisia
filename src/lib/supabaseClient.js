import { createClient } from '@supabase/supabase-js';

// Supabase 接続設定 (環境変数または規定プロジェクト接続情報)
const DEFAULT_SUPABASE_URL = 'https://jathslaymfbqyvvcpqvj.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphdGhzbGF5bWZicXl2dmNwcXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5OTIwMTQsImV4cCI6MjEwNTU2ODAxNH0.7aO7uEKGuV6zxrLOlGqhaB3Ue9-efvIDp28kSxm0oLA';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

// 環境変数が設定されているかどうかの判定フラグ
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'YOUR_SUPABASE_URL' &&
  supabaseUrl !== 'https://your-project-id.supabase.co'
);

// Supabase クライアントインスタンス
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

