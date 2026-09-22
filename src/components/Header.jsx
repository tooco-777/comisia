import React, { useState, useRef, useEffect } from 'react';
import { LogIn, Bell, Mail, ChevronDown, User, LogOut } from 'lucide-react';
import { DEFAULT_AVATAR } from '../constants/defaults';

export default function Header({ currentView, setView, currentUser, onOpenAuth, onLogout }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ドロップダウン外側クリックで閉じる処理
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0.75rem 0'
    }}>
      <div style={{ 
        maxWidth: '1440px', 
        width: '100%', 
        margin: '0 auto', 
        padding: '0 1rem', 
        display: 'flex', 
        justify: 'space-between', 
        alignItems: 'center' 
      }}>
        
        {/* 左グループ (左詰め): 【サイトロゴ】のみ (サイトアイコンは削除) */}
        <a 
          href="/"
          onClick={(e) => {
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
            e.preventDefault();
            setView('landing');
            window.scrollTo(0, 0);
          }}
          style={{ 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center',
            textDecoration: 'none'
          }}
        >
          {/* サイトロゴ (Comisia文字) */}
          <img 
            src="/rogo.png" 
            alt="Comisia" 
            style={{ 
              height: '56px', 
              width: 'auto',
              objectFit: 'contain'
            }} 
          />
        </a>

        {/* 右グループ (右詰め): 【ベルマーク】 ＋ 【マイページ】 ＋ 【ユーザーアイコン・ユーザーネーム】 */}
        <nav style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              
              {/* ベルマーク (通知) */}
              <button
                type="button"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#475569',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '6px',
                  borderRadius: '50%',
                  transition: 'all 0.2s ease'
                }}
                title="通知"
                onMouseEnter={(e) => e.currentTarget.style.color = '#0f172a'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#475569'}
              >
                <Bell size={22} />
              </button>

              {/* ユーザーネーム (クリックでマイページ移動) */}
              <a
                href="/editor"
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
                  e.preventDefault();
                  setView('editor');
                  window.scrollTo(0, 0);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#475569',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '700',
                  padding: '4px 6px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#0f172a'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#475569'}
              >
                {currentUser.name || currentUser.handle || 'ユーザー'}
              </a>

              {/* ユーザーアイコン ＆ プルダウン */}
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{
                    background: dropdownOpen ? '#f1f5f9' : 'none',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    cursor: 'pointer',
                    padding: '4px 6px',
                    borderRadius: '9999px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                  onMouseLeave={(e) => {
                    if (!dropdownOpen) e.currentTarget.style.background = 'none';
                  }}
                >
                  <img
                    src={currentUser.avatar || DEFAULT_AVATAR}
                    alt={currentUser.name || 'ユーザー'}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '1.5px solid #cbd5e1'
                    }}
                  />
                  <ChevronDown 
                    size={16} 
                    color="#64748b" 
                    style={{ 
                      transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', 
                      transition: 'transform 0.2s ease' 
                    }} 
                  />
                </button>

                {/* プルダウンメニュー */}
                {dropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 8px)',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    padding: '0.5rem',
                    minWidth: '160px',
                    zIndex: 200,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px'
                  }}>
                    <a
                      href="/editor"
                      onClick={(e) => {
                        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
                        e.preventDefault();
                        setView('editor');
                        window.scrollTo(0, 0);
                        setDropdownOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        width: '100%',
                        padding: '0.6rem 0.85rem',
                        border: 'none',
                        background: 'none',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#0f172a',
                        cursor: 'pointer',
                        textAlign: 'left',
                        textDecoration: 'none',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                    >
                      <User size={16} color="#3b82f6" />
                      マイページ
                    </a>

                    <div style={{ height: '1px', background: '#f1f5f9', margin: '2px 0' }}></div>

                    <button
                      type="button"
                      onClick={() => {
                        onLogout();
                        setDropdownOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        width: '100%',
                        padding: '0.6rem 0.85rem',
                        border: 'none',
                        background: 'none',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#ef4444',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                    >
                      <LogOut size={16} color="#ef4444" />
                      ログアウト
                    </button>
                  </div>
                )}
              </div>

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

