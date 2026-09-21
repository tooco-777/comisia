import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { 
  checkPasswordStrength, 
  hashPassword, 
  generateVerificationCode, 
  validateEmail,
  checkLockoutStatus,
  recordFailedAttempt,
  resetFailedAttempts
} from '../utils/security';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export default function AuthModal({ initialMode = 'login', onClose, onLoginSuccess }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'verify'
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });

  const [errors, setErrors] = useState({});
  const [verificationCode, setVerificationCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const passwordStrength = checkPasswordStrength(form.password);

  // ログイン処理
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const errs = {};

    const status = checkLockoutStatus(form.email);
    if (status.isLocked) {
      setErrors({ global: `セキュリティ保護のため、あと ${status.remainingSec} 秒間ログインが制限されています。` });
      return;
    }

    if (!form.email.trim() || !validateEmail(form.email)) errs.email = '有効なメールアドレスを入力してください';
    if (!form.password) errs.password = 'パスワードを入力してください';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password
      });

      if (error) {
        recordFailedAttempt(form.email);
        setSubmitting(false);
        setErrors({ global: `ログイン認証エラー: ${error.message}` });
        return;
      }

      resetFailedAttempts(form.email);
      setSubmitting(false);
      const handleName = data.user?.user_metadata?.handle || form.email.split('@')[0];
      onLoginSuccess({
        id: data.user?.id,
        handle: handleName,
        name: data.user?.user_metadata?.name || 'クリエイターユーザー',
        email: data.user?.email,
        verified: true
      });
      onClose();
      return;
    }

    const hashedPassword = await hashPassword(form.password);

    setTimeout(() => {
      setSubmitting(false);
      resetFailedAttempts(form.email);

      const handleName = form.email.split('@')[0] || 'creator';
      const userData = {
        handle: handleName,
        name: form.name || 'クリエイターユーザー',
        email: form.email,
        verified: true
      };

      onLoginSuccess(userData);
      onClose();
    }, 600);
  };

  // 新規登録処理 (ステップ1)
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    const errs = {};

    if (!form.name.trim()) errs.name = 'お名前 / 表示名を入力してください';
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

    const code = generateVerificationCode();
    setVerificationCode(code);
    setMode('verify');
    setErrors({});
  };

  // 2段階検証コード処理 (ステップ2)
  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (inputCode !== verificationCode) {
      setErrors({ code: '検証コードが正しくありません' });
      return;
    }

    setSubmitting(true);

    if (isSupabaseConfigured && supabase) {
      const handleName = form.email.split('@')[0] || 'creator';
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            name: form.name,
            handle: handleName
          }
        }
      });

      if (error) {
        setSubmitting(false);
        setErrors({ global: `新規登録エラー: ${error.message}` });
        return;
      }

      setSubmitting(false);
      onLoginSuccess({
        id: data.user?.id,
        handle: handleName,
        name: form.name,
        email: form.email,
        verified: true
      });
      onClose();
      return;
    }

    const hashedPassword = await hashPassword(form.password);

    setTimeout(() => {
      setSubmitting(false);
      const handleName = form.email.split('@')[0] || 'creator';

      const newUserData = {
        handle: handleName,
        name: form.name,
        email: form.email,
        passwordHash: hashedPassword,
        verified: true
      };

      onLoginSuccess(newUserData);
      onClose();
    }, 700);
  };

  return (
    <div className="modal-overlay">
      <div className="clean-card" style={{ maxWidth: '460px', width: '100%', padding: '2.25rem', position: 'relative' }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: '#f1f5f9',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.75rem auto',
            color: '#0f172a'
          }}>
            <ShieldCheck size={24} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>
            {mode === 'login' && 'クリエイターログイン'}
            {mode === 'register' && '新規アカウント登録'}
            {mode === 'verify' && '2段階メール検証コード入力'}
          </h2>
        </div>

        {errors.global && (
          <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={16} /> {errors.global}
          </div>
        )}

        {/* ログイン */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label>メールアドレス</label>
              <input 
                type="email" className="form-input"
                value={form.email}
                onChange={(e) => setForm({...form, email: e.target.value})}
                placeholder="example@domain.com"
              />
              {errors.email && <div className="form-error">{errors.email}</div>}
            </div>

            <div className="form-group">
              <label>パスワード</label>
              <input 
                type="password" className="form-input"
                value={form.password}
                onChange={(e) => setForm({...form, password: e.target.value})}
                placeholder="••••••••"
              />
              {errors.password && <div className="form-error">{errors.password}</div>}
            </div>

            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%', marginTop: '1rem', padding: '0.85rem' }}>
              {submitting ? 'ログイン照合中...' : <><Lock size={16} /> ログイン</>}
            </button>
          </form>
        )}

        {/* 新規登録 (ステップ1) */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit}>
            <div className="form-group">
              <label>お名前 / 表示名 *</label>
              <input 
                type="text" className="form-input"
                value={form.name}
                onChange={(e) => setForm({...form, name: e.target.value})}
                placeholder="例: 山田 イラスト"
              />
              {errors.name && <div className="form-error">{errors.name}</div>}
            </div>

            <div className="form-group">
              <label>メールアドレス *</label>
              <input 
                type="email" className="form-input"
                value={form.email}
                onChange={(e) => setForm({...form, email: e.target.value})}
                placeholder="example@domain.com"
              />
              {errors.email && <div className="form-error">{errors.email}</div>}
            </div>

            <div className="form-group">
              <label>パスワード設定 *</label>
              <input 
                type="password" className="form-input"
                value={form.password}
                onChange={(e) => setForm({...form, password: e.target.value})}
                placeholder="8文字以上 (英数・記号)"
              />
              <div style={{ fontSize: '0.8rem', color: passwordStrength.color, marginTop: '4px', fontWeight: '600' }}>
                パスワード強度: {passwordStrength.label}
              </div>
              {errors.password && <div className="form-error">{errors.password}</div>}
            </div>

            <div className="form-group">
              <label>パスワード確認（再入力） *</label>
              <input 
                type="password" className="form-input"
                value={form.confirmPassword}
                onChange={(e) => setForm({...form, confirmPassword: e.target.value})}
                placeholder="パスワードを再入力"
              />
              {errors.confirmPassword && <div className="form-error">{errors.confirmPassword}</div>}
            </div>

            <div style={{ margin: '1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
              <input 
                type="checkbox" id="terms"
                checked={form.agreeTerms}
                onChange={(e) => setForm({...form, agreeTerms: e.target.checked})}
              />
              <label htmlFor="terms">利用規約およびプライバシーポリシーに同意する *</label>
            </div>
            {errors.agreeTerms && <div className="form-error">{errors.agreeTerms}</div>}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', padding: '0.85rem' }}>
              次へ: メール検証コード入力 <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* 2段階コード確認 (ステップ2) */}
        {mode === 'verify' && (
          <form onSubmit={handleVerifySubmit}>
            <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📧 発行された検証コード (デモ表示)</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', letterSpacing: '4px', color: '#0f172a' }}>{verificationCode}</div>
            </div>

            <div className="form-group">
              <label>6桁の検証コードを入力 *</label>
              <input 
                type="text" className="form-input" maxLength="6"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="123456"
                style={{ textAlign: 'center', fontSize: '1.3rem', letterSpacing: '4px', fontWeight: '700' }}
              />
              {errors.code && <div className="form-error">{errors.code}</div>}
            </div>

            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%', marginTop: '1rem', padding: '0.85rem' }}>
              {submitting ? '登録処理中...' : <><CheckCircle2 size={16} /> 本人検証を完了して本登録</>}
            </button>
          </form>
        )}

        {/* 切替 */}
        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {mode === 'login' ? (
            <span>アカウントをお持ちでないですか？ <a href="#r" onClick={() => setMode('register')} style={{ color: 'var(--accent-blue)', fontWeight: '600' }}>新規登録</a></span>
          ) : (
            <span>すでにアカウントをお持ちですか？ <a href="#l" onClick={() => setMode('login')} style={{ color: 'var(--accent-blue)', fontWeight: '600' }}>ログイン</a></span>
          )}
        </div>
      </div>
    </div>
  );
}
