import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import AuthModal from './components/AuthModal';
import ProfileEditor from './components/ProfileEditor';
import UserProfile from './components/UserProfile';
import PageViewer from './components/PageViewer';
import DeleteAccountPage from './components/DeleteAccountPage';
import { supabase, isSupabaseConfigured } from './lib/supabaseClient';
import { DEFAULT_AVATAR, DEFAULT_BANNER } from './constants/defaults';

export default function App() {
  // 画面ルーティング状態: 'landing' (トップ) | 'publicPage' (公開ページ) | 'editor' (マイページ編集) | 'about' | 'faq' | 'developer' | 'terms' | 'contact' | 'delete-account'
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
        return JSON.parse(saved);
      }
    } catch (e) {}

    return {
      default: {
        handle: 'default',
        name: 'イラストスタジオ LUNA',
        bio: '',
        avatar: DEFAULT_AVATAR,
        banner: DEFAULT_BANNER,
        websiteLinks: [{ url: 'https://x.com', label: 'X' }]
      },
      astral: {
        handle: 'astral',
        name: 'アストラル工房',
        bio: '',
        avatar: DEFAULT_AVATAR,
        banner: DEFAULT_BANNER,
        websiteLinks: [{ url: 'https://x.com', label: 'X' }]
      }
    };
  });

  // ログインユーザー状態 (localStorageから復元。無い場合は未ログイン: null)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('v_art_current_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.id) return parsed;
      }
    } catch (e) {}

    return null; // 未ログイン状態
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

    // Supabase セッション情報を反映するヘルパー (マイページ保存された名前・アバターを最優先)
    const syncUserFromSession = async (sessionUser) => {
      if (!sessionUser) return;

      const userMeta = sessionUser.user_metadata || {};
      const handle = userMeta.handle || sessionUser.email.split('@')[0];

      let savedCreator = {};
      try {
        const saved = localStorage.getItem('v_art_creators');
        if (saved) savedCreator = JSON.parse(saved)[handle] || {};
      } catch (e) {}

      let savedCurrentUser = null;
      try {
        const saved = localStorage.getItem('v_art_current_user');
        if (saved) savedCurrentUser = JSON.parse(saved);
      } catch (e) {}

      // マイページで編集・保存された名前・アバターを最優先で維持する
      const savedName = savedCreator.name || (savedCurrentUser?.handle === handle ? savedCurrentUser.name : null);
      const savedAvatar = savedCreator.avatar || (savedCurrentUser?.handle === handle ? savedCurrentUser.avatar : null);

      const unifiedName = savedName || userMeta.name || handle;
      const unifiedAvatar = savedAvatar || userMeta.avatar || DEFAULT_AVATAR;

      setCurrentUser({
        id: sessionUser.id,
        handle,
        name: unifiedName,
        avatar: unifiedAvatar,
        email: sessionUser.email,
        verified: true
      });

      setCreators(prev => ({
        ...prev,
        [handle]: {
          ...(prev[handle] || {}),
          ...savedCreator,
          name: unifiedName,
          avatar: unifiedAvatar,
          handle
        }
      }));
    };

    // OAuth エラーパラメータの検知
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const authError = urlParams.get('error_description') || hashParams.get('error_description');

    if (authError) {
      console.error('OAuth Auth Error:', authError);
      showToast(`Google認証エラー: Supabaseの設定をご確認ください (${decodeURIComponent(authError).replace(/\+/g, ' ')})`);
      window.history.replaceState(null, '', window.location.pathname);
    }

    // OAuth / メール認証リダイレクトパラメータの検知
    const isAuthRedirect = window.location.hash.includes('access_token=') || window.location.search.includes('code=');

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setAuthMode(null);
        syncUserFromSession(session.user);
        if (isAuthRedirect) {
          setView('editor');
          showToast('ログイン・メール認証が完了いたしました');
          window.history.replaceState(null, '', window.location.pathname);
        }
      } else {
        const savedUser = localStorage.getItem('v_art_current_user');
        if (!savedUser) {
          setCurrentUser(null);
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setAuthMode(null);
        syncUserFromSession(session.user);
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          setView('editor');
          showToast(`ログイン完了: ようこそ ${session.user.user_metadata?.name || session.user.email.split('@')[0]} 様`);
          if (window.location.hash.includes('access_token=') || window.location.search.includes('code=')) {
            window.history.replaceState(null, '', window.location.pathname);
          }
        }
      } else if (event === 'SIGNED_OUT' || !session) {
        setCurrentUser(null);
        localStorage.removeItem('v_art_current_user');
      }
    });

    // Supabaseからプロフィールの取得 ＆ 最新情報で更新
    supabase.from('profiles').select('*').then(({ data, error }) => {
      if (data && data.length > 0 && !error) {
        setCreators(prev => {
          const updated = { ...prev };
          data.forEach(p => {
            updated[p.handle] = {
              ...(updated[p.handle] || {}),
              id: p.id,
              handle: p.handle,
              name: p.name || updated[p.handle]?.name,
              bio: p.bio !== undefined ? p.bio : updated[p.handle]?.bio,
              avatar: p.avatar_url || p.avatar || updated[p.handle]?.avatar,
              banner: p.banner_url || p.banner || updated[p.handle]?.banner,
              snsLinks: p.sns_links || updated[p.handle]?.snsLinks || {}
            };
          });
          return updated;
        });

        // ログイン中ユーザーのプロファイル・アバター・名前を最新同期
        setCurrentUser(prev => {
          if (!prev) return prev;
          const myProf = data.find(p => p.id === prev.id || p.handle === prev.handle);
          if (myProf) {
            return {
              ...prev,
              name: myProf.name || prev.name,
              avatar: myProf.avatar_url || prev.avatar
            };
          }
          return prev;
        });
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

  // activeHandle を currentUser.handle に常時追従
  useEffect(() => {
    if (currentUser?.handle && activeHandle !== currentUser.handle) {
      setActiveHandle(currentUser.handle);
    }
  }, [currentUser?.handle]);

  // クリエイター名 ＝ ユーザーネーム の完全同一化・自動同期エフェクト（マイページ保存された名前を保護）
  useEffect(() => {
    if (!currentUser) return;
    const handleKey = currentUser.handle || activeHandle;

    setCreators(prev => {
      const targetCreator = prev[handleKey] || prev[activeHandle] || prev.default;
      if (!targetCreator) return prev;

      // マイページで保存された targetCreator.name / avatar を優先
      const unifiedName = targetCreator.name || currentUser.name || 'クリエイターユーザー';
      const unifiedAvatar = targetCreator.avatar || currentUser.avatar;

      if (targetCreator.name !== unifiedName || targetCreator.avatar !== unifiedAvatar || currentUser.name !== unifiedName || currentUser.avatar !== unifiedAvatar) {
        if (currentUser.name !== unifiedName || currentUser.avatar !== unifiedAvatar) {
          setCurrentUser(curr => curr ? { ...curr, name: unifiedName, avatar: unifiedAvatar } : null);
        }
        return {
          ...prev,
          [handleKey]: {
            ...targetCreator,
            name: unifiedName,
            avatar: unifiedAvatar,
            handle: handleKey
          }
        };
      }
      return prev;
    });
  }, [currentUser?.handle, activeHandle]);

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

  // ユーザー専用指定URL (/@handle) ＆ 独立ページURL (/faq, /about 等) の自動同期エフェクト
  useEffect(() => {
    let path = '/';
    if (view === 'publicPage' && activeHandle) {
      path = `/@${activeHandle}`;
    } else if (['about', 'faq', 'developer', 'terms', 'contact', 'delete-account'].includes(view)) {
      path = `/${view}`;
    } else if (view === 'editor') {
      path = '/editor';
    }

    if (window.location.hash.includes('access_token=') || window.location.search.includes('code=')) {
      return;
    }

    if (decodeURIComponent(window.location.pathname) !== path) {
      window.history.pushState({ view, activeHandle }, '', path);
    }
  }, [view, activeHandle]);

  // URL直接アクセス (https://comisia.app/@tooco_777) ＆ ブラウザ「戻る/進む」同期
  useEffect(() => {
    const handleUrlRouting = async () => {
      const pathname = decodeURIComponent(window.location.pathname);

      if (pathname.startsWith('/@')) {
        const handle = pathname.replace('/@', '').trim();
        if (handle) {
          setActiveHandle(handle);
          setView('publicPage');

          if (!creators[handle] && isSupabaseConfigured && supabase) {
            try {
              const { data } = await supabase.from('profiles').select('*').eq('handle', handle).maybeSingle();
              if (data) {
                setCreators(prev => ({
                  ...prev,
                  [handle]: {
                    id: data.id,
                    handle: data.handle,
                    name: data.name,
                    bio: data.bio || '',
                    avatar: data.avatar_url || DEFAULT_AVATAR,
                    banner: data.banner_url || DEFAULT_BANNER,
                    snsLinks: data.sns_links || {}
                  }
                }));
              }
            } catch (e) {}
          }
        }
      } else if (['/about', '/faq', '/developer', '/terms', '/contact', '/delete-account', '/editor'].includes(pathname)) {
        const pageKey = pathname.replace('/', '');
        setView(pageKey);
      } else if (pathname === '/' || pathname === '') {
        setView('landing');
      }
    };

    handleUrlRouting();
    window.addEventListener('popstate', handleUrlRouting);
    return () => window.removeEventListener('popstate', handleUrlRouting);
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 退会処理 (Supabase auth.users およびデータベース・ローカルデータの完全物理消去)
  const handleDeleteAccount = async () => {
    if (isSupabaseConfigured && supabase && currentUser) {
      // Supabase Postgres SECURITY DEFINER 関数 delete_user により、auth.users および全関連データを一括完全物理消去
      const { error: rpcErr } = await supabase.rpc('delete_user');
      if (rpcErr) {
        console.error('RPC delete_user error:', rpcErr);
        throw new Error(`Supabase退会処理エラー: ${rpcErr.message || '認証ユーザーの削除に失敗しました。'}`);
      }

      // Supabase Auth セッションのクリア・ログアウト
      await supabase.auth.signOut();
    }

    // 3. ローカルストレージおよび React ステータスの完全物理消去
    if (currentUser) {
      const handleToRemove = currentUser.handle;
      setCreators(prev => {
        const updated = { ...prev };
        delete updated[handleToRemove];
        try {
          localStorage.setItem('v_art_creators', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });

      try {
        const saved = localStorage.getItem('v_art_creators');
        if (saved) {
          const parsed = JSON.parse(saved);
          delete parsed[handleToRemove];
          localStorage.setItem('v_art_creators', JSON.stringify(parsed));
        }
      } catch (e) {}
    }

    setCurrentUser(null);
    localStorage.removeItem('v_art_current_user');
    localStorage.removeItem('v_art_active_handle');
    localStorage.removeItem('v_art_adopts');
    localStorage.removeItem('v_art_price_list');
    setView('landing');
  };

  const activeUserHandle = currentUser?.handle || activeHandle;
  const currentCreator = creators[activeUserHandle] || creators[activeHandle] || creators.default;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* サイトヘッダー */}
      <Header 
        currentView={view} 
        setView={setView} 
        currentUser={currentUser}
        activeHandle={activeUserHandle}
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
              const handleKey = currentUser?.handle || activeHandle;
              setCreators(prev => ({
                ...prev,
                [handleKey]: {
                  ...(prev[handleKey] || {}),
                  ...newProf,
                  handle: handleKey
                }
              }));
              setCurrentUser(prev => ({
                ...(prev || { id: 'default-user', handle: handleKey, email: 'creator@example.com' }),
                ...newProf,
                handle: handleKey
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

        {/* 5. 退会手続き専用Webページ */}
        {view === 'delete-account' && (
          <DeleteAccountPage 
            currentUser={currentUser}
            onGoBack={() => {
              setView('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenAuth={(mode) => setAuthMode(mode)}
            onDeleteAccount={handleDeleteAccount}
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
                <li>
                  <a 
                    href="#delete-account" 
                    onClick={(e) => { 
                      e.preventDefault(); 
                      setView('delete-account'); 
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }} 
                    style={{ color: '#ef4444', fontWeight: '600' }}
                  >
                    退会はこちら
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
            const handleKey = userData.handle;
            let savedName = userData.name;
            let savedAvatar = userData.avatar || DEFAULT_AVATAR;

            if (!userData.isNewRegistration) {
              const existing = creators[handleKey];
              if (existing) {
                if (existing.name) savedName = existing.name;
                if (existing.avatar) savedAvatar = existing.avatar;
              } else {
                try {
                  const saved = localStorage.getItem('v_art_creators');
                  if (saved) {
                    const parsed = JSON.parse(saved)[handleKey];
                    if (parsed) {
                      if (parsed.name) savedName = parsed.name;
                      if (parsed.avatar) savedAvatar = parsed.avatar;
                    }
                  }
                } catch (e) {}
              }
            } else {
              // 新規登録 (または退会済みアカウントでの再登録) の場合:
              // 古いキャッシュを完全に消去し、デフォルト初期値へ完全リセット
              savedName = userData.name;
              savedAvatar = DEFAULT_AVATAR;
              try {
                const saved = localStorage.getItem('v_art_creators');
                if (saved) {
                  const parsed = JSON.parse(saved);
                  delete parsed[handleKey];
                  localStorage.setItem('v_art_creators', JSON.stringify(parsed));
                }
                localStorage.removeItem('v_art_current_user');
              } catch (e) {}
            }

            const finalUserData = {
              ...userData,
              name: savedName,
              avatar: savedAvatar
            };

            setCurrentUser(finalUserData);

            if (userData.isNewRegistration || !creators[handleKey]) {
              setCreators(prev => ({
                ...prev,
                [handleKey]: {
                  handle: handleKey,
                  name: finalUserData.name,
                  bio: '',
                  avatar: finalUserData.avatar,
                  banner: DEFAULT_BANNER,
                  websiteLinks: [{ url: 'https://x.com', label: 'X' }]
                }
              }));
            }

            setActiveHandle(handleKey);
            setView('editor');
            showToast(userData.isNewRegistration ? `新規アカウント登録完了: ようこそ ${finalUserData.name} 様。` : `ログイン完了: ようこそ ${finalUserData.name} 様。`);
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
