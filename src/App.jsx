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
  const [currentUser, setCurrentUser] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // マルチクリエイターデータストア
  const [creators, setCreators] = useState(() => {
    try {
      const saved = localStorage.getItem('v_art_creators');
      if (saved) return JSON.parse(saved);
    } catch (e) {}

    return {
      default: {
        handle: 'default',
        name: 'イラストスタジオ LUNA',
        bio: 'キャラクターデザイン・Live2Dモデル・アドプトモデルの制作をしております。立ち絵のご相談やご依頼はお気軽にどうぞ！',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
        banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
        snsLinks: {
          x: 'https://twitter.com',
          pixiv: 'https://pixiv.net',
          instagram: 'https://instagram.com'
        }
      },
      astral: {
        handle: 'astral',
        name: 'アストラル工房',
        bio: 'ファンタジー・魔法世界観のキャラクターイラスト専門のクリエイターです。商用利用・配信素材のご依頼も歓迎です。',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
        banner: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&auto=format&fit=crop&q=80',
        snsLinks: {
          x: 'https://twitter.com',
          pixiv: 'https://pixiv.net'
        }
      }
    };
  });

  const [activeHandle, setActiveHandle] = useState('default');

  // アドプトモデルデータ
  const [adopts, setAdopts] = useState(() => {
    try {
      const saved = localStorage.getItem('v_art_adopts');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'adopt-01',
        name: 'サイバーポップ少女 - ルナ',
        price: '￥38,000',
        status: 'AVAILABLE',
        category: '立ち絵モデル / 一点もの',
        image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
        tags: ['サイバー', '女の子', 'PSD付属', '商用可'],
        description: 'サイバーテイストのオリジナル少女キャラクター。三面図、表情差分4種、レイヤー分けPSD・商用利用権込みの一点ものキャラクターです。'
      },
      {
        id: 'adopt-02',
        name: '星詠みの魔導士 - アストラ',
        price: '￥45,000',
        status: 'AVAILABLE',
        category: 'ファンタジー / 魔法使',
        image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
        tags: ['ファンタジー', '星詠み', '魔法使い'],
        description: '星と夜空をモチーフにした魔導士キャラクター。武器パーツ・魔法エフェクト差分が付属します。'
      },
      {
        id: 'adopt-03',
        name: '森の守護霊 - エルヴィン',
        price: '￥32,000',
        status: 'ADOPTED',
        category: 'ケモミミ / 守護者',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
        tags: ['ケモミミ', 'ご約定済み'],
        description: '【ご成約済み】森の守護霊をイメージしたオリジナルデザイン。素敵なオーナー様に引き取られました。'
      }
    ];
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
              showToast('プロフィール変更を保存しました');
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
              <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#6495ed', marginBottom: '0.5rem' }}>
                Comisia
              </div>
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
                  bio: '新規登録クリエイターです。立ち絵イラストやアドプト募集を行っています。',
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
