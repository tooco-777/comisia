import React, { useState } from 'react';
import { AlertTriangle, ArrowLeft, ShieldAlert, LogIn, Trash2, CheckCircle2 } from 'lucide-react';
import { DEFAULT_AVATAR } from '../constants/defaults';

export default function DeleteAccountPage({ 
  currentUser, 
  onGoBack, 
  onOpenAuth, 
  onDeleteAccount
}) {
  const [agreed, setAgreed] = useState(false);
  const [deletingState, setDeletingState] = useState(null); // null | 'deleting' | 'completed'
  const [errorMessage, setErrorMessage] = useState('');

  const handleDeleteSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) return;

    setDeletingState('deleting');
    setErrorMessage('');

    try {
      await onDeleteAccount();
      setDeletingState('completed');

      // 2.5秒後に自動的にトップページへリダイレクト
      setTimeout(() => {
        setDeletingState(null);
        onGoBack();
      }, 2500);
    } catch (err) {
      console.error('Delete account error:', err);
      setErrorMessage(err.message || '退会処理中にエラーが発生しました。SQL Editorで修正スクリプトを実行してください。');
      setDeletingState(null);
    }
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: 'calc(100vh - 80px)', padding: '3rem 1rem' }}>
      <div className="container" style={{ maxWidth: '640px', margin: '0 auto' }}>
        
        {/* 上部ナビゲーション */}
        <button
          type="button"
          onClick={onGoBack}
          disabled={Boolean(deletingState)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'none',
            border: 'none',
            color: '#64748b',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: deletingState ? 'not-allowed' : 'pointer',
            marginBottom: '1.5rem',
            padding: '4px 8px',
            borderRadius: '6px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => { if (!deletingState) e.currentTarget.style.color = '#0f172a'; }}
          onMouseLeave={(e) => { if (!deletingState) e.currentTarget.style.color = '#64748b'; }}
        >
          <ArrowLeft size={18} /> トップページへ戻る
        </button>

        {/* 退会メインカード */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)',
          padding: '2.5rem 2rem'
        }}>
          
          {/* 未ログイン状態 */}
          {!currentUser ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%', background: '#eff6ff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem'
              }}>
                <LogIn size={32} color="#3b82f6" />
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.75rem' }}>
                ログインが必要です
              </h2>
              <p style={{ fontSize: '0.95rem', color: '#64748b', lineHeight: '1.6', marginBottom: '2rem', maxWidth: '420px', margin: '0 auto 2rem' }}>
                退会手続き（アカウント削除）を行うには、対象のアカウントでログインしている必要があります。
              </p>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onGoBack}
                  style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}
                >
                  トップページへ
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    if (onOpenAuth) onOpenAuth('login');
                  }}
                  style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}
                >
                  ログインする
                </button>
              </div>
            </div>
          ) : (
            /* ログイン状態 */
            <div>
              {/* ページタイトル */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1.25rem', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{
                  background: '#fef2f2', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <AlertTriangle size={26} color="#ef4444" />
                </div>
                <div>
                  <h1 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                    退会手続き (アカウント削除)
                  </h1>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0 0' }}>
                    Comisia アカウントの削除を行います
                  </p>
                </div>
              </div>

              {/* 対象ユーザー表示 */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1rem 1.25rem',
                marginBottom: '1.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <img
                  src={currentUser.avatar || DEFAULT_AVATAR}
                  alt={currentUser.name}
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #cbd5e1' }}
                />
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: '750', color: '#0f172a' }}>
                    {currentUser.name} <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'normal' }}>(@{currentUser.handle || 'user'})</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
                    {currentUser.email || 'メールアドレス登録済み'}
                  </div>
                </div>
              </div>

              {/* 注意事項カード */}
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fca5a5',
                borderRadius: '12px',
                padding: '1.25rem',
                marginBottom: '1.75rem'
              }}>
                <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#991b1b', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldAlert size={20} /> 退会処理に関する注意事項
                </div>
                <p style={{ fontSize: '0.875rem', color: '#7f1d1d', lineHeight: '1.6', marginBottom: '0.85rem' }}>
                  退会手続きを実行すると、アカウントおよび関連データは永久に削除されます。削除されたデータを復元することはできません。
                </p>
                <ul style={{
                  fontSize: '0.85rem',
                  color: '#991b1b',
                  lineHeight: '1.75',
                  paddingLeft: '1.25rem',
                  margin: 0
                }}>
                  <li>プロフィール設定（名前・アバター・ヘッダー・SNSリンク等）</li>
                  <li>登録されたアドプト作品データ・画像データ</li>
                  <li>料金表設定および過去の掲載情報</li>
                  <li>マイページのログインおよび編集管理権限</li>
                </ul>
              </div>

              {/* エラーメッセージ表示 */}
              {errorMessage && (
                <div style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                  padding: '1rem',
                  borderRadius: '10px',
                  marginBottom: '1.5rem',
                  fontSize: '0.9rem',
                  lineHeight: '1.6'
                }}>
                  <strong>⚠️ 退会エラー:</strong><br />
                  {errorMessage}
                </div>
              )}

              {/* 退会フォーム */}
              <form onSubmit={handleDeleteSubmit}>
                <label style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  cursor: 'pointer',
                  marginBottom: '2rem',
                  background: '#ffffff',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '1rem',
                  userSelect: 'none',
                  transition: 'border-color 0.2s ease'
                }}>
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    disabled={Boolean(deletingState)}
                    style={{ width: '20px', height: '20px', marginTop: '2px', cursor: 'pointer', accentColor: '#ef4444' }}
                  />
                  <span style={{ fontSize: '0.875rem', color: '#1e293b', lineHeight: '1.6', fontWeight: '600' }}>
                    注意事項をすべて確認し、アカウントおよびデータが永久に消去されることに同意して退会します。
                  </span>
                </label>

                {/* 操作ボタン */}
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={onGoBack}
                    disabled={Boolean(deletingState)}
                    style={{ padding: '0.8rem 1.5rem', fontSize: '0.9rem' }}
                  >
                    キャンセル（戻る）
                  </button>

                  <button
                    type="submit"
                    disabled={!agreed || Boolean(deletingState)}
                    style={{
                      background: agreed && !deletingState ? '#ef4444' : '#cbd5e1',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.8rem 1.75rem',
                      fontSize: '0.95rem',
                      fontWeight: '700',
                      cursor: agreed && !deletingState ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      boxShadow: agreed && !deletingState ? '0 4px 12px rgba(239, 68, 68, 0.25)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Trash2 size={18} />
                    退会を実行する
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

      </div>

      {/* 退会アニメーション ＆ 完了ポップアップモーダル */}
      {deletingState && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 2000,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            maxWidth: '440px',
            width: '100%',
            padding: '2.5rem 2rem',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)'
          }}>
            {deletingState === 'deleting' ? (
              <div>
                {/* スピナーアニメーション */}
                <div style={{
                  width: '64px',
                  height: '64px',
                  border: '4px solid #fee2e2',
                  borderTop: '4px solid #ef4444',
                  borderRadius: '50%',
                  margin: '0 auto 1.5rem',
                  animation: 'spin 0.9s linear infinite'
                }}></div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.6rem' }}>
                  アカウントデータを削除中...
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: '1.6', margin: 0 }}>
                  データベースおよび関連設定を完全消去しています。<br />少々お待ちください。
                </p>
              </div>
            ) : (
              <div>
                {/* 完了アイコン ＆ メッセージ */}
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#ecfdf5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem'
                }}>
                  <CheckCircle2 size={38} color="#10b981" />
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.6rem' }}>
                  退会手続きが完了いたしました
                </h3>
                <p style={{ fontSize: '0.95rem', color: '#334155', fontWeight: '600', lineHeight: '1.6', marginBottom: '1.25rem' }}>
                  ご利用ありがとうございました。
                </p>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
                  数秒後に自動的にトップページへ移動します...
                </p>
              </div>
            )}
          </div>

          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
