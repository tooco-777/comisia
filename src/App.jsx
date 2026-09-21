import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import AuthModal from './components/AuthModal';
import ProfileEditor from './components/ProfileEditor';
import UserProfile from './components/UserProfile';
import PageViewer from './components/PageViewer';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';

export default function App() {
  // 画面ルーティング状態: 'landing' (トップ) | 'publicPage' (公開ページ) | 'editor' (マイページ編集) | 'about' | 'faq' | 'developer' | 'terms' | 'contact'
  const [view, setView] = useState('landing');
  const [authMode, setAuthMode] = useState(null); // null | 'login' | 'register'
  // アクティブハンドル状態 (localStorageから復元)
  const [activeHandle, setActiveHandle] = useState(() => {
    try {
      return localStorage.getItem('v_art_active_handle') || 'default';
    } catch (e) {
      return 'default';
    }
  });

  // マルチクリエイターデータストア
  const [creators, setCreators] = useState(() => {
    try {
      const saved = localStorage.getItem('v_art_creators');
      if (saved) {
        const parsed = JSON.parse(saved);
        Object.keys(parsed).forEach(k => {
          parsed[k].bio = '';
        });
        return parsed;
      }
    } catch (e) {}

    return {
      default: {
        handle: 'default',
        name: 'イラストスタジオ LUNA',
        bio: '',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
        banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
        websiteLinks: [{ url: 'https://x.com', label: 'X' }]
      },
      astral: {
        handle: 'astral',
        name: 'アストラル工房',
        bio: '',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
        banner: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&auto=format&fit=crop&q=80',
        websiteLinks: [{ url: 'https://x.com', label: 'X' }]
      }
    };
  });

  // ログインユーザー状態 (localStorageおよびアクティブプロフィールから復元)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('v_art_current_user');
      if (savedUser) return JSON.parse(savedUser);

      const savedCreators = localStorage.getItem('v_art_creators');
      const handle = localStorage.getItem('v_art_active_handle') || 'default';
      if (savedCreators) {
        const parsed = JSON.parse(savedCreators);
        const prof = parsed[handle] || parsed.default;
        if (prof) {
          return {
            id: prof.id || 'default-user',
            handle: prof.handle || handle,
            name: prof.name || 'イラストスタジオ LUNA',
            avatar: prof.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
            email: 'creator@example.com'
          };
        }
      }
    } catch (e) {}

    return {
      id: 'default-user',
      handle: 'default',
      name: 'イラストスタジオ LUNA',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      email: 'creator@example.com'
    };
  });
  const [toastMessage, setToastMessage] = useState(null);

  // アドプトモデルデータ (デモデータは全て削除)
  const [adopts, setAdopts] = useState(() => {
    try {
      const saved = localStorage.getItem('v_art_adopts');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  // 料金表データ
  const [priceList, setPriceList] = useState(() => {
    try {
      const saved = localStorage.getItem('v_art_price_list');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  // Supabase セッション ＆ データ同期
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const handle = session.user.user_metadata?.handle || session.user.email.split('@')[0];
        setCurrentUser({
          id: session.user.id,
          handle,
          name: session.user.user_metadata?.name || 'クリエイターユーザー',
          email: session.user.email,
          verified: true
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const handle = session.user.user_metadata?.handle || session.user.email.split('@')[0];
        setCurrentUser({
          id: session.user.id,
          handle,
          name: session.user.user_metadata?.name || 'クリエイターユーザー',
          email: session.user.email,
          verified: true
        });
      } else {
        setCurrentUser(null);
      }
    });

    // Supabaseからプロフィールの取得
    supabase.from('profiles').select('*').then(({ data, error }) => {
      if (data && data.length > 0 && !error) {
        const newCreators = { ...creators };
        data.forEach(p => {
          newCreators[p.handle] = {
            id: p.id,
            handle: p.handle,
            name: p.name,
            bio: p.bio,
            avatar: p.avatar_url,
            banner: p.banner_url,
            snsLinks: p.sns_links || {}
          };
        });
        setCreators(newCreators);
      }
    });

    // Supabaseからアドプト作品の取得
    supabase.from('adopts').select('*').then(({ data, error }) => {
      if (data && data.length > 0 && !error) {
        const formatted = data.map(a => ({
          id: a.id,
          name: a.name,
          price: a.price,
          status: a.status,
          category: a.category,
          image: a.image_url,
          tags: a.tags || [],
          description: a.description
        }));
        setAdopts(formatted);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ストレージ保存エフェクト
  useEffect(() => {
    try {
      localStorage.setItem('v_art_creators', JSON.stringify(creators));
    } catch (e) {}
  }, [creators]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('v_art_current_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('v_art_current_user');
      }
    } catch (e) {}
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem('v_art_active_handle', activeHandle);
    } catch (e) {}
  }, [activeHandle]);

  useEffect(() => {
    try {
      localStorage.setItem('v_art_adopts', JSON.stringify(adopts));
    } catch (e) {}
  }, [adopts]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const currentCreator = creators[activeHandle] || creators.default;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* サイトヘッダー */}
      <Header 
        currentView={view} 
        setView={setView} 
        currentUser={currentUser}
        activeHandle={activeHandle}
        onOpenAuth={(mode) => setAuthMode(mode)}
        onLogout={async () => {
          if (isSupabaseConfigured && supabase) {
            await supabase.auth.signOut();
          }
          setCurrentUser(null);
          showToast('ログアウトいたしました');
          if (view === 'editor') setView('landing');
        }}
      />

      {/* メイン画面切替 */}
      <main style={{ flexGrow: 1 }}>
        
        {/* 1. サイトのトップページ */}
        {view === 'landing' && (
          <LandingPage 
            creators={creators}
            onOpenAuth={(mode) => setAuthMode(mode)}
            onSelectCreator={(handle) => {
              setActiveHandle(handle);
              setView('publicPage');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* 2. マイページ ＆ 編集管理 */}
        {view === 'editor' && (
          <ProfileEditor 
            profile={currentCreator}
            onSaveProfile={(newProf) => {
              setCreators(prev => ({
                ...prev,
                [activeHandle]: { ...prev[activeHandle], ...newProf }
              }));
              setCurrentUser(prev => ({
                ...(prev || { id: 'default-user', handle: activeHandle, email: 'creator@example.com' }),
                avatar: newProf.avatar || prev?.avatar,
                name: newProf.name || prev?.name
              }));
              showToast('プロフィールを保存しました');
            }}
            adopts={adopts}
            onSaveAdopts={(newAdopts) => {
              setAdopts(newAdopts);
              showToast('アドプト作品情報を保存しました');
            }}
            onGoToPublicPage={() => {
              setView('publicPage');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* 3. ユーザーの公開ページ */}
        {view === 'publicPage' && (
          <div className="container" style={{ padding: '2rem 1.5rem' }}>
            <UserProfile 
              profile={currentCreator}
              adopts={adopts}
              currentUser={currentUser}
              onEditClick={() => setView('editor')}
              onAdoptRequest={(msg) => showToast(msg)}
              showToast={showToast}
            />
          </div>
        )}

        {/* 4. 独立フッターWebページ (Comisiaとは？, FAQ, 開発者, 利用規約, 運営お問い合わせ) */}
        {['about', 'faq', 'developer', 'terms', 'contact'].includes(view) && (
          <PageViewer 
            pageType={view} 
            onGoBack={() => {
              setView('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }} 
          />
        )}
      </main>

      {/* 洗練されたフッター (画面遷移Webページリンク化) */}
      <footer style={{
        background: '#ffffff',
        borderTop: '1px solid var(--border-color)',
        padding: '3rem 0 2rem 0',
        marginTop: 'auto'
      }}>
        <div className="container">
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.5fr 1fr 1fr 1fr',
            gap: '2.5rem',
            paddingBottom: '2.5rem',
            borderBottom: '1px solid var(--border-color)',
            alignItems: 'start'
          }}>
            
            {/* ブランドロゴ ＆ 「スマートに」で改行された文章 */}
            <div>
              <img 
                src="/rogo.png" 
                alt="Comisia" 
                style={{ 
                  height: '38px', 
                  width: 'auto', 
                  marginBottom: '0.6rem', 
                  display: 'block',
                  objectFit: 'contain' 
                }} 
              />
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6', maxWidth: '300px' }}>
                イラスト料金表とアドプト募集を<br />
                スマートにまとめて公開できるサービス。
              </p>
            </div>

            {/* カラム1: サービス情報 (Webページ遷移) */}
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.85rem' }}>
                サービス情報
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <li>
                  <a href="#about" onClick={(e) => { e.preventDefault(); setView('about'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ color: 'inherit' }}>
                    Comisiaとは？
                  </a>
                </li>
                <li>
                  <a href="#faq" onClick={(e) => { e.preventDefault(); setView('faq'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ color: 'inherit' }}>
                    よくある質問
                  </a>
                </li>
              </ul>
            </div>

            {/* カラム2: サポート・お問い合わせ (運営お問い合わせへ飛ぶ) */}
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.85rem' }}>
                サポート
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <li>
                  <a href="#contact" onClick={(e) => { e.preventDefault(); setView('contact'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ color: 'inherit' }}>
                    お問い合わせ
                  </a>
                </li>
                <li>
                  <a href="#developer" onClick={(e) => { e.preventDefault(); setView('developer'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ color: 'inherit' }}>
                    開発者
                  </a>
                </li>
              </ul>
            </div>

            {/* カラム3: 規約・免責 */}
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.85rem' }}>
                規約・免責
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <li>
                  <a href="#terms" onClick={(e) => { e.preventDefault(); setView('terms'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ color: 'inherit' }}>
                    利用規約
                  </a>
                </li>
              </ul>
            </div>

          </div>

          <div style={{ textAlign: 'center', paddingTop: '1.5rem', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            <p>© 2026 Comisia (コミシア) All Rights Reserved.</p>
          </div>

        </div>
      </footer>

      {/* セキュア認証モーダル */}
      {authMode && (
        <AuthModal 
          initialMode={authMode}
          onClose={() => setAuthMode(null)}
          onLoginSuccess={(userData) => {
            setCurrentUser(userData);

            if (!creators[userData.handle]) {
              setCreators(prev => ({
                ...prev,
                [userData.handle]: {
                  handle: userData.handle,
                  name: userData.name,
                  bio: '',
                  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
                  banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
                  snsLinks: { x: '', pixiv: '' }
                }
              }));
            }

            setActiveHandle(userData.handle);
            setView('editor');
            showToast(`認証完了: ようこそ ${userData.name} 様。マイページ編集へ移動しました。`);
          }}
        />
      )}

      {/* トースト */}
      {toastMessage && (
        <div className="toast-container">
          <div className="toast">
            {toastMessage}
          </div>
        </div>
      )}
    </div>
  );
}
