import React, { useState } from 'react';
import { AlertTriangle, X, ShieldAlert, CheckCircle2, LogIn, Trash2 } from 'lucide-react';

export default function DeleteAccountModal({ 
  currentUser, 
  onClose, 
  onOpenAuth, 
  onDeleteAccount 
}) {
  const [agreed, setAgreed] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 未ログイン時の表示
  if (!currentUser) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}>
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          maxWidth: '480px',
          width: '100%',
          padding: '2rem',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
          position: 'relative'
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              position: 'absolute', right: '1.25rem', top: '1.25rem',
              background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px'
            }}
          >
            <X size={20} />
          </button>

          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%', background: '#eff6ff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem'
            }}>
              <LogIn size={28} color="#3b82f6" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.75rem' }}>
              ログインが必要です
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              退会手続きを行うには、対象のアカウントでログインする必要があります。
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}
              >
                キャンセル
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  onClose();
                  if (onOpenAuth) onOpenAuth('login');
                }}
                style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem' }}
              >
                ログイン画面へ
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const [errorMessage, setErrorMessage] = useState('');

  // ログイン済みの退会確認画面
  const handleDeleteSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) return;

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await onDeleteAccount();
    } catch (err) {
      console.error('Delete account error:', err);
      setErrorMessage(err.message || '退会処理中にエラーが発生しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        maxWidth: '520px',
        width: '100%',
        padding: '2rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        position: 'relative',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        {/* ヘッダー */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              background: '#fef2f2', padding: '8px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <AlertTriangle size={22} color="#ef4444" />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              退会手続き (アカウント削除)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* ユーザー情報確認 */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '0.85rem 1rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <img
            src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
            alt={currentUser.name}
            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: '750', color: '#0f172a' }}>
              {currentUser.name} (@{currentUser.handle || 'user'})
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              {currentUser.email || '未設定'}
            </div>
          </div>
        </div>

        {/* 警告ボックス */}
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fca5a5',
          borderRadius: '12px',
          padding: '1.15rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ fontSize: '0.875rem', fontWeight: '800', color: '#991b1b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldAlert size={18} /> 退会に関する注意事項
          </div>
          <p style={{ fontSize: '0.825rem', color: '#7f1d1d', lineHeight: '1.65', marginBottom: '0.75rem' }}>
            退会処理を完了すると、以下のデータが完全に削除され、復元することはできません。
          </p>
          <ul style={{
            fontSize: '0.825rem',
            color: '#991b1b',
            lineHeight: '1.6',
            paddingLeft: '1.25rem',
            margin: 0
          }}>
            <li>登録済みのプロフィール情報・アバター・SNS設定</li>
            <li>掲載中のアドプト作品および料金表データ</li>
            <li>アカウントのログイン権限およびマイページ閲覧権限</li>
          </ul>
        </div>

        {errorMessage && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '0.85rem',
            borderRadius: '10px',
            marginBottom: '1.25rem',
            fontSize: '0.85rem',
            lineHeight: '1.5'
          }}>
            <strong>⚠️ エラー:</strong> {errorMessage}
          </div>
        )}

        <form onSubmit={handleDeleteSubmit}>
          {/* 確認チェックボックス */}
          <label style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.6rem',
            cursor: 'pointer',
            marginBottom: '1.5rem',
            userSelect: 'none'
          }}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              style={{ width: '18px', height: '18px', marginTop: '2px', cursor: 'pointer', accentColor: '#ef4444' }}
            />
            <span style={{ fontSize: '0.85rem', color: '#334155', lineHeight: '1.5', fontWeight: '600' }}>
              上記の注意事項を理解し、すべてのアカウントデータが永久に削除されることに同意して退会します。
            </span>
          </label>

          {/* ボタンエリア */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
              style={{ padding: '0.7rem 1.25rem', fontSize: '0.9rem' }}
            >
              キャンセル
            </button>

            <button
              type="submit"
              disabled={!agreed || isSubmitting}
              style={{
                background: agreed ? '#ef4444' : '#cbd5e1',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.7rem 1.25rem',
                fontSize: '0.9rem',
                fontWeight: '700',
                cursor: agreed ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease'
              }}
            >
              <Trash2 size={16} />
              {isSubmitting ? '退会処理中...' : '退会する'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
