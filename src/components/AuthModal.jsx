import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, User, ShieldCheck, ArrowRight, CheckCircle2, AlertTriangle, RefreshCw, KeyRound, Eye, EyeOff } from 'lucide-react';
import { 
  checkPasswordStrength, 
  hashPassword, 
  validateEmail,
  checkLockoutStatus,
  recordFailedAttempt,
  resetFailedAttempts
} from '../utils/security';
import { DEFAULT_AVATAR } from '../constants/defaults';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

// Supabase認証エラーメッセージの日本語翻訳ヘルパー
const translateAuthError = (msg = '') => {
  if (!msg) return 'エラーが発生しました。時間をおいて再試行してください。';
  if (msg.includes('User already registered') || msg.includes('already registered')) {
    return 'このメールアドレスは既に登録されています。';
  }
  if (msg.includes('Invalid login credentials') || msg.includes('invalid_credentials')) {
    return 'ログイン失敗: メールアドレスまたはパスワードが正しくありません。';
  }
  if (msg.includes('Email not confirmed')) {
    return 'メール認証が完了していません。届いた確認メールをご覧ください。';
  }
  if (msg.includes('Password should be at least')) {
    return 'パスワードは8文字以上で設定してください。';
  }
  return `エラー: ${msg}`;
};

export default function AuthModal({ initialMode = 'login', onClose, onLoginSuccess }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'email-sent' | 'forgot' | 'forgot-sent'
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem('comisia_remember_me') !== 'false';
  });

  const [errors, setErrors] = useState({});
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // モード切替時にフォーム状態とエラーを適切にリセット
  useEffect(() => {
    setErrors({});
    if (mode === 'register') {
      setForm({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeTerms: false
      });
    } else if (mode === 'login') {
      const savedEmail = localStorage.getItem('comisia_remember_email');
      const savedPassword = localStorage.getItem('comisia_remember_password');
      setForm(prev => ({
        ...prev,
        email: savedEmail || '',
        password: savedPassword || '',
        confirmPassword: ''
      }));
    }
  }, [mode]);

  // メール認証完了の自動検出 (他タブやスマホでの認証完了を検知して自動でマイページへ遷移)
  useEffect(() => {
    if (mode !== 'email-sent') return;

    let isMounted = true;
    const checkAuthStatus = async () => {
      if (isSupabaseConfigured && supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && (session.user.email_confirmed_at || session.user.confirmed_at)) {
          if (!isMounted) return;
          const handleName = session.user.user_metadata?.handle || registeredEmail.split('@')[0] || 'creator';
          const defaultName = session.user.user_metadata?.name || handleName;
          onLoginSuccess({
            id: session.user.id,
            handle: handleName,
            name: defaultName,
            avatar: session.user.user_metadata?.avatar || DEFAULT_AVATAR,
            email: registeredEmail,
            verified: true
          });
          onClose();
        }
      }
    };

    checkAuthStatus();
    const interval = setInterval(checkAuthStatus, 2000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [mode, registeredEmail]);

  const passwordStrength = checkPasswordStrength(form.password);

  // Google OAuth 認証
  const handleGoogleAuth = async () => {
    setSubmitting(true);
    setErrors({});

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) {
        setSubmitting(false);
        setErrors({ global: `Google認証エラー: ${translateAuthError(error.message)}` });
      }
      return;
    }

    // デモ・未接続時のフォールバック動作
    setTimeout(() => {
      setSubmitting(false);
      onLoginSuccess({
        id: 'demo-google-user',
        handle: 'google_creator',
        name: 'Google アカウントユーザー',
        email: 'google-demo@example.com',
        verified: true
      });
      onClose();
    }, 800);
  };

  // メール＆パスワード ログイン
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    const errs = {};

    const status = checkLockoutStatus(form.email);
    if (status.isLocked) {
      setErrors({ global: `連続失敗により保護中。あと ${status.remainingSec} 秒間ログインが制限されています。` });
      return;
    }

    if (!form.email.trim() || !validateEmail(form.email)) errs.email = '有効なメールアドレスを入力してください';
    if (!form.password) errs.password = 'パスワードを入力してください';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);

    // 自動入力・記憶設定の保存/削除
    if (rememberMe) {
      localStorage.setItem('comisia_remember_email', form.email);
      localStorage.setItem('comisia_remember_password', form.password);
      localStorage.setItem('comisia_remember_me', 'true');
    } else {
      localStorage.removeItem('comisia_remember_email');
      localStorage.removeItem('comisia_remember_password');
      localStorage.setItem('comisia_remember_me', 'false');
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password
      });

      if (error) {
        recordFailedAttempt(form.email);
        setSubmitting(false);
        setErrors({ global: translateAuthError(error.message) });
        return;
      }

      resetFailedAttempts(form.email);
      setSubmitting(false);
      const handleName = data.user?.user_metadata?.handle || form.email.split('@')[0];
      
      // プロフィール・アバター画像の復元参照
      const userAvatar = data.user?.user_metadata?.avatar;
      const userName = data.user?.user_metadata?.name;

      onLoginSuccess({
        id: data.user?.id,
        handle: handleName,
        name: userName || handleName,
        avatar: userAvatar,
        email: data.user?.email,
        verified: true
      });
      onClose();
      return;
    }

    // デモ動作
    setTimeout(() => {
      setSubmitting(false);
      resetFailedAttempts(form.email);

      const handleName = form.email.split('@')[0] || 'creator';
      onLoginSuccess({
        handle: handleName,
        name: handleName,
        email: form.email,
        verified: true
      });
      onClose();
    }, 600);
  };

  // メール新規登録処理
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    const errs = {};

    if (!form.email.trim() || !validateEmail(form.email)) errs.email = '有効なメールアドレスを入力してください';
    if (!passwordStrength.isValid) {
      errs.password = 'パスワードは8文字以上で大・小文字・数字・記号を含めてください';
    }
    if (form.password !== form.confirmPassword) {
      errs.confirmPassword = '再入力パスワードが一致しません';
    }
    if (!form.agreeTerms) {
      errs.agreeTerms = '利用規約への同意が必要です';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    const handleName = form.email.split('@')[0] || 'creator';
    const defaultName = handleName;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            name: defaultName,
            handle: handleName
          },
          emailRedirectTo: window.location.origin
        }
      });

      if (error) {
        setSubmitting(false);
        setErrors({ global: translateAuthError(error.message) });
        return;
      }

      // 新規登録成功時: メール認証画面へ遷移（未検証状態でのマイページ遷移を防止）
      if (data?.user) {
        setSubmitting(false);

        // Supabaseでメール認証が未完了（または自動ログインセッションが有効な場合もログアウト処理）
        if (!data.session || !data.user.email_confirmed_at) {
          if (data.session) {
            await supabase.auth.signOut();
          }
          setRegisteredEmail(form.email);
          setMode('email-sent');
          return;
        }

        // メール認証が完了済みの場合のみログイン許可
        onLoginSuccess({
          id: data.user.id,
          handle: handleName,
          name: defaultName,
          avatar: DEFAULT_AVATAR,
          email: form.email,
          verified: true,
          isNewRegistration: true
        });
        onClose();
        return;
      }

      setSubmitting(false);
      setRegisteredEmail(form.email);
      setMode('email-sent');
      return;
    }

    // デモ・未接続時
    setTimeout(() => {
      setSubmitting(false);
      onLoginSuccess({
        handle: handleName,
        name: defaultName,
        email: form.email,
        verified: true
      });
      onClose();
    }, 600);
  };

  // 認証メール再送信
  const handleResendEmail = async () => {
    if (resendCooldown > 0) return;
    if (isSupabaseConfigured && supabase && registeredEmail) {
      await supabase.auth.resend({
        type: 'signup',
        email: registeredEmail,
        options: {
          emailRedirectTo: window.location.origin
        }
      });
    }
    setResendCooldown(60);
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // パスワード再設定メール送信
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!form.email.trim() || !validateEmail(form.email)) {
      setErrors({ email: '有効なメールアドレスを入力してください' });
      return;
    }

    setSubmitting(true);

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
        redirectTo: `${window.location.origin}`
      });

      if (error) {
        setSubmitting(false);
        setErrors({ global: `パスワード再設定エラー: ${error.message}` });
        return;
      }
    }

    setSubmitting(false);
    setRegisteredEmail(form.email);
    setMode('forgot-sent');
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div className="clean-card" style={{ maxWidth: '460px', width: '100%', padding: '2.25rem', position: 'relative', margin: '1rem' }}>
        <button 
          onClick={onClose}
          aria-label="閉じる"
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
        >
          <X size={20} />
        </button>

        {/* ヘッダー */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: '#e0e7ff',
            color: '#4f46e5',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.75rem auto'
          }}>
            <ShieldCheck size={24} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a' }}>
            {mode === 'login' && 'ログイン'}
            {mode === 'register' && '新規アカウント登録'}
            {mode === 'email-sent' && '認証メールを確認してください'}
            {mode === 'forgot' && 'パスワードの再設定'}
            {mode === 'forgot-sent' && '再設定メールを送信しました'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {(mode === 'login' || mode === 'register') && 'Comisia で創作活動・依頼受付をはじめましょう'}
          </p>
        </div>

        {errors.global && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={16} style={{ flexShrink: 0 }} /> <span>{errors.global}</span>
          </div>
        )}

        {/* Google OAuth ボタン（ログイン・新規登録画面で共通表示） */}
        {(mode === 'login' || mode === 'register') && (
          <>
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={submitting}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#1e293b',
                fontWeight: '600',
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
            >
              {/* Official Google G Logo SVG */}
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{mode === 'login' ? 'Google でログイン' : 'Google で新規登録'}</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', margin: '1.25rem 0', color: 'var(--text-light)', fontSize: '0.8rem' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
              <span style={{ padding: '0 0.75rem' }}>またはメールアドレスで</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
            </div>
          </>
        )}

        {/* ログインフォーム */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px', display: 'block' }}>メールアドレス</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="email" className="form-input"
                  value={form.email}
                  onChange={(e) => setForm({...form, email: e.target.value})}
                  placeholder="example@domain.com"
                  style={{ width: '100%', paddingLeft: '2.5rem' }}
                />
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
              </div>
              {errors.email && <div className="form-error" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px' }}>{errors.email}</div>}
            </div>

            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px', display: 'block' }}>パスワード</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? "text" : "password"} className="form-input"
                  value={form.password}
                  onChange={(e) => setForm({...form, password: e.target.value})}
                  placeholder="••••••••"
                  style={{ width: '100%', paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                />
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  aria-label={showPassword ? 'パスワードを非表示' : 'パスワードを表示'}
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '0.8rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span>次回から自動入力する</span>
                </label>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  style={{ background: 'none', border: 'none', color: '#6495ed', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  パスワードをお忘れですか？
                </button>
              </div>
              {errors.password && <div className="form-error" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px' }}>{errors.password}</div>}
            </div>

            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%', marginTop: '1rem', padding: '0.8rem' }}>
              {submitting ? '照合中...' : <><Lock size={16} /> ログイン</>}
            </button>
          </form>
        )}

        {/* 新規登録フォーム */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} autoComplete="off">
            <div className="form-group" style={{ marginBottom: '0.85rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px', display: 'block' }}>メールアドレス *</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="email" className="form-input"
                  value={form.email}
                  onChange={(e) => setForm({...form, email: e.target.value})}
                  placeholder="example@domain.com"
                  autoComplete="off"
                  style={{ width: '100%', paddingLeft: '2.5rem' }}
                />
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
              </div>
              {errors.email && <div className="form-error" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px' }}>{errors.email}</div>}
            </div>

            <div className="form-group" style={{ marginBottom: '0.85rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px', display: 'block' }}>パスワード設定 *</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? "text" : "password"} className="form-input"
                  value={form.password}
                  onChange={(e) => setForm({...form, password: e.target.value})}
                  placeholder="8文字以上 (英数・記号)"
                  autoComplete="new-password"
                  style={{ width: '100%', paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                />
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  aria-label={showPassword ? 'パスワードを非表示' : 'パスワードを表示'}
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>

              {/* パスワード強度メーター */}
              {form.password.length > 0 && (
                <div style={{ marginTop: '6px' }}>
                  <div style={{ display: 'flex', height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${(passwordStrength.score + 1) * 20}%`,
                      background: passwordStrength.color,
                      transition: 'all 0.3s ease'
                    }}></div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: passwordStrength.color, marginTop: '4px', fontWeight: '600' }}>
                    {passwordStrength.label}
                  </div>
                </div>
              )}
              {errors.password && <div className="form-error" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px' }}>{errors.password}</div>}
            </div>

            <div className="form-group" style={{ marginBottom: '0.85rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px', display: 'block' }}>パスワード確認（再入力） *</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showConfirmPassword ? "text" : "password"} className="form-input"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({...form, confirmPassword: e.target.value})}
                  placeholder="パスワードを再入力"
                  style={{ width: '100%', paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                />
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  aria-label={showConfirmPassword ? 'パスワードを非表示' : 'パスワードを表示'}
                >
                  {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
              {errors.confirmPassword && <div className="form-error" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px' }}>{errors.confirmPassword}</div>}
            </div>

            <div style={{ margin: '1rem 0', display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <input 
                type="checkbox" id="terms"
                checked={form.agreeTerms}
                onChange={(e) => setForm({...form, agreeTerms: e.target.checked})}
                style={{ marginTop: '3px' }}
              />
              <label htmlFor="terms" style={{ cursor: 'pointer' }}>
                利用規約およびプライバシーポリシーに同意する *
              </label>
            </div>
            {errors.agreeTerms && <div className="form-error" style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '0.5rem' }}>{errors.agreeTerms}</div>}

            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%', marginTop: '0.5rem', padding: '0.8rem' }}>
              {submitting ? 'アカウント作成中...' : <><ArrowRight size={16} /> 認証メールを送信して登録</>}
            </button>
          </form>
        )}

        {/* 認証メール送信完了画面 */}
        {mode === 'email-sent' && (
          <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: '#dcfce7',
              color: '#16a34a',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto'
            }}>
              <Mail size={32} />
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem' }}>確認メールを送信しました</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1rem' }}>
              <strong style={{ color: '#0f172a' }}>{registeredEmail}</strong> 宛に認証メールをお送りしました。<br />
              メール本文に記載されている<strong>「メールアドレスを確認する」</strong>リンクをクリックして本登録を完了してください。
            </p>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              padding: '0.65rem 1rem',
              borderRadius: '8px',
              color: '#1d4ed8',
              fontSize: '0.82rem',
              fontWeight: '500',
              marginBottom: '1.25rem'
            }}>
              <RefreshCw size={14} style={{ animation: 'spin 2s linear infinite' }} />
              <span>認証リンクのクリックを待機中... (完了すると自動でマイページへ切り替わります)</span>
            </div>

            <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', padding: '0.85rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem', textAlign: 'left' }}>
              メールが届かない場合：<br />
              ・迷惑メールフォルダをご確認ください。<br />
              ・メールアドレスに間違いがないかご確認ください。
            </div>

            <button 
              type="button" 
              onClick={handleResendEmail}
              disabled={resendCooldown > 0}
              className="btn" 
              style={{ width: '100%', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '0.75rem' }}
            >
              <RefreshCw size={16} className={resendCooldown > 0 ? 'spin' : ''} />
              {resendCooldown > 0 ? `再送信まで ${resendCooldown} 秒` : '認証メールを再送信する'}
            </button>

            <div style={{ marginTop: '1.25rem' }}>
              <button 
                type="button" 
                onClick={() => setMode('login')} 
                style={{ background: 'none', border: 'none', color: '#6495ed', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                ログイン画面へ戻る
              </button>
            </div>
          </div>
        )}

        {/* パスワード再設定フォーム */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotSubmit}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              ご登録のメールアドレスを入力してください。パスワード再設定用の案内リンクをお送りします。
            </p>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px', display: 'block' }}>メールアドレス</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="email" className="form-input"
                  value={form.email}
                  onChange={(e) => setForm({...form, email: e.target.value})}
                  placeholder="example@domain.com"
                  style={{ width: '100%', paddingLeft: '2.5rem' }}
                />
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
              </div>
              {errors.email && <div className="form-error" style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px' }}>{errors.email}</div>}
            </div>

            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%', padding: '0.8rem' }}>
              {submitting ? '送信中...' : <><KeyRound size={16} /> 再設定リンクを送信</>}
            </button>

            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button 
                type="button" 
                onClick={() => setMode('login')} 
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer' }}
              >
                ログイン画面に戻る
              </button>
            </div>
          </form>
        )}

        {/* パスワード再設定メール送信完了 */}
        {mode === 'forgot-sent' && (
          <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: '#e0e7ff',
              color: '#4f46e5',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto'
            }}>
              <CheckCircle2 size={32} />
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem' }}>案内メールを送信しました</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              <strong style={{ color: '#0f172a' }}>{registeredEmail}</strong> 宛にパスワード再設定用のリンクをお送りしました。メールをご確認ください。
            </p>

            <button 
              type="button" 
              onClick={() => setMode('login')} 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '0.8rem' }}
            >
              ログイン画面へ戻る
            </button>
          </div>
        )}

        {/* モード切り替えフッター */}
        {(mode === 'login' || mode === 'register') && (
          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {mode === 'login' ? (
              <span>アカウントをお持ちでないですか？ <button type="button" onClick={() => { setMode('register'); setErrors({}); }} style={{ background: 'none', border: 'none', color: '#6495ed', fontWeight: '700', cursor: 'pointer', padding: 0 }}>新規登録</button></span>
            ) : (
              <span>すでにアカウントをお持ちですか？ <button type="button" onClick={() => { setMode('login'); setErrors({}); }} style={{ background: 'none', border: 'none', color: '#6495ed', fontWeight: '700', cursor: 'pointer', padding: 0 }}>ログイン</button></span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
