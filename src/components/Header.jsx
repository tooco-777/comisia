import React from 'react';
import { LogIn, LogOut, Edit3 } from 'lucide-react';

export default function Header({ currentView, setView, currentUser, onOpenAuth, onLogout }) {
  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0.85rem 0'
    }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        
        {/* ロゴ (絵文字・アイコンなし、カッコなしテキスト「Comisia」) */}
        <div 
          onClick={() => setView('landing')} 
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <span style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.5px', color: '#6495ed' }}>
            Comisia
          </span>
        </div>

        {/* ナビゲーション */}
        <nav style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <button 
                className={`btn ${currentView === 'editor' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
                onClick={() => setView('editor')}
              >
                <Edit3 size={15} /> マイページ編集
              </button>

              <button 
                className="btn btn-outline" 
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
                onClick={onLogout}
              >
                <LogOut size={14} /> ログアウト
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
                onClick={() => onOpenAuth('login')}
              >
                <LogIn size={15} /> ログイン
              </button>
              <button 
                className="btn btn-primary" 
                style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
                onClick={() => onOpenAuth('register')}
              >
                新規登録
              </button>
            </div>
          )}
        </nav>

      </div>
    </header>
  );
}
