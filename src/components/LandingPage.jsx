import React from 'react';
import { Star, ChevronRight } from 'lucide-react';

export default function LandingPage({ creators = {}, adopts = [], onOpenAuth, onSelectCreator }) {

  // 10名/10作品 ピックアップデータ
  const popularCreators = [
    {
      id: 'pop-1',
      title: '【受付中】SDミニキャラ・ちびキャラ制作',
      creatorName: 'イラストスタジオ LUNA',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      rating: '5 (493)',
      price: '5,000円',
      image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'pop-2',
      title: 'SNSアイコン・ヘッダーイラスト制作',
      creatorName: 'アストラル工房',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
      rating: '5 (345)',
      price: '3,500円',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'pop-3',
      title: 'キャラクターデザイン・三面図作成',
      creatorName: 'toooco777',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      rating: '5 (348)',
      price: '12,000円',
      image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'pop-4',
      title: '【商用利用OK】VTuber用Live2D立ち絵',
      creatorName: 'Studio Prism',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
      rating: '5 (281)',
      price: '35,000円',
      image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'pop-5',
      title: '【即納】表紙・挿絵一枚絵制作',
      creatorName: '星空イラスト',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      rating: '5 (190)',
      price: '15,000円',
      image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'pop-6',
      title: '一枚絵・歌ってみたサムネイルイラスト',
      creatorName: '月影デザイン',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
      rating: '5 (210)',
      price: '8,000円',
      image: 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'pop-7',
      title: 'ドット絵アニメーション＆アイコン制作',
      creatorName: 'PixelArt Lab',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      rating: '5 (155)',
      price: '4,000円',
      image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'pop-8',
      title: 'ダークファンタジー系キャラクターデザイン',
      creatorName: 'Grimm Studio',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
      rating: '5 (142)',
      price: '18,000円',
      image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'pop-9',
      title: '【期間限定】SNS用ミニイラストおためしプラン',
      creatorName: 'Sakura Art',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      rating: '5 (310)',
      price: '2,500円',
      image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'pop-10',
      title: '【衣装デザイン】ファンタジー衣装提案',
      creatorName: 'Couture Design',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
      rating: '5 (98)',
      price: '10,000円',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80'
    }
  ];

  const trendingModels = [
    {
      id: 'trend-1',
      title: '【1点ものアドプト】サイバーパンク狐耳少女',
      creatorName: 'アストラル工房',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
      rating: '5 (120)',
      price: '28,000円',
      image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'trend-2',
      title: '【Live2Dパーツ分け済】ゴシック系魔女モデル',
      creatorName: 'Studio Prism',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      rating: '5 (89)',
      price: '45,000円',
      image: 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'trend-3',
      title: '【アドプト】和風天狗少年モデル（差分5種付き）',
      creatorName: '月影デザイン',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
      rating: '5 (210)',
      price: '32,000円',
      image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'trend-4',
      title: '【立ち絵素材】近未来SFメカ少女モデル',
      creatorName: 'PixelArt Lab',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      rating: '5 (175)',
      price: '22,000円',
      image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'trend-5',
      title: '【商用OK】天使系VTuber準備中モデル',
      creatorName: 'イラストスタジオ LUNA',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
      rating: '5 (305)',
      price: '50,000円',
      image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'trend-6',
      title: '【アドプト】ケモミミメイドさん立ち絵',
      creatorName: 'Sakura Art',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      rating: '5 (140)',
      price: '18,000円',
      image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'trend-7',
      title: '【完成品】ファンタジー騎士キャラモデル',
      creatorName: 'Grimm Studio',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
      rating: '5 (92)',
      price: '25,000円',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'trend-8',
      title: '【表情差分8種】サイバーアイドルモデル',
      creatorName: 'Couture Design',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      rating: '5 (230)',
      price: '38,000円',
      image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'trend-9',
      title: '【商用利用可】魔法学園の錬金術師モデル',
      creatorName: 'toooco777',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
      rating: '5 (184)',
      price: '30,000円',
      image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'trend-10',
      title: '【1点限定】竜人ハイブリッドキャラクター',
      creatorName: 'アストラル工房',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      rating: '5 (115)',
      price: '42,000円',
      image: 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?w=600&auto=format&fit=crop&q=80'
    }
  ];

  const newModels = [
    {
      id: 'new-1',
      title: '【新作】クラシックメイドさんイラストモデル',
      creatorName: 'Sakura Art',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      rating: '5 (150)',
      price: '15,000円',
      image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'new-2',
      title: '【新着アドプト】黒髪ロングセーラー服少女',
      creatorName: 'イラストスタジオ LUNA',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
      rating: '5 (98)',
      price: '20,000円',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'new-3',
      title: '【新作素材】カジュアル私服系男子立ち絵',
      creatorName: '月影デザイン',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      rating: '5 (210)',
      price: '12,000円',
      image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'new-4',
      title: '【新着Live2D】ねこみみVライバーモデル',
      creatorName: 'Studio Prism',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
      rating: '5 (175)',
      price: '40,000円',
      image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'new-5',
      title: '【限定公開】スチームパンク冒険者モデル',
      creatorName: 'Grimm Studio',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      rating: '5 (132)',
      price: '28,000円',
      image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'new-6',
      title: '【新作アドプト】星空モチーフの魔導士少女',
      creatorName: 'アストラル工房',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
      rating: '5 (260)',
      price: '26,000円',
      image: 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'new-7',
      title: '【新着キャラ】ストリートファッションダンサー',
      creatorName: 'Couture Design',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      rating: '5 (88)',
      price: '16,000円',
      image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'new-8',
      title: '【新作立ち絵】サイバー忍者モデル',
      creatorName: 'PixelArt Lab',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
      rating: '5 (195)',
      price: '24,000円',
      image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'new-9',
      title: '【新着モデル】マリン風水着少女立ち絵',
      creatorName: 'toooco777',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      rating: '5 (140)',
      price: '18,000円',
      image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'new-10',
      title: '【限定アドプト】雪の妖精プリンセス',
      creatorName: 'イラストスタジオ LUNA',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
      rating: '5 (310)',
      price: '35,000円',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80'
    }
  ];

  // 無限ループアニメーション用に配列を二重化
  const renderMarqueeSection = (items, sectionKey, showMoreLink = true, linkLabel = 'もっとみる') => {
    // 20個のループ用配列
    const duplicatedItems = [...items, ...items];

    return (
      <div style={{
        maxWidth: '1440px', // パネル約6個分の配置幅に制限 (中央揃え)
        margin: '0 auto',
        position: 'relative',
        padding: '0 1rem'
      }}>
        {/* カード表示エリア (左右フェード付き) */}
        <div style={{
          overflow: 'hidden',
          padding: '0.5rem 0 0.4rem 0',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 2%, black 98%, transparent 100%)',
          maskImage: 'linear-gradient(to right, transparent 0%, black 2%, black 98%, transparent 100%)'
        }}>
          <div
            className={`marquee-track marquee-${sectionKey}`}
            style={{
              display: 'flex',
              gap: '1.75rem', // カード同士の間隔 (28px)
              width: 'max-content'
            }}
          >
            {duplicatedItems.map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                style={{
                  minWidth: '240px',
                  maxWidth: '240px',
                  background: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  overflow: 'hidden',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  flexShrink: 0,
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.03)';
                }}
              >
                <div style={{ height: '170px', background: '#f1f5f9', overflow: 'hidden', position: 'relative' }}>
                  <img
                    src={item.image}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80';
                    }}
                  />
                </div>
                <div style={{ padding: '0.85rem' }}>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: '750', color: '#0f172a', marginBottom: '0.5rem', lineHeight: '1.4', height: '2.5em', overflow: 'hidden' }}>
                    {item.title}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem' }}>
                    <img src={item.avatar} alt={item.creatorName} style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
                    <span style={{ fontSize: '0.725rem', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', color: '#475569' }}>
                      {item.creatorName}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.825rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#eab308', fontWeight: '700' }}>
                      <Star size={13} fill="#eab308" />
                      <span>{item.rating}</span>
                    </div>
                    <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.95rem' }}>
                      {item.price}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 右詰めの「もっと見る >」カプセルボタン (上部に詰めた配置) */}
        {showMoreLink && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.4rem' }}>
            <button
              type="button"
              style={{
                background: '#ffffff',
                border: '1px solid #6495ed',
                borderRadius: '9999px',
                color: '#3b82f6',
                fontWeight: '600',
                fontSize: '0.825rem',
                padding: '0.4rem 1.1rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#eff6ff';
                e.currentTarget.style.borderColor = '#2563eb';
                e.currentTarget.style.color = '#1d4ed8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#ffffff';
                e.currentTarget.style.borderColor = '#6495ed';
                e.currentTarget.style.color = '#3b82f6';
              }}
            >
              もっと見る <ChevronRight size={14} color="#3b82f6" />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '5rem', overflowX: 'hidden' }}>
      {/* 右から左へゆったり流れる無限アニメーション用 CSS */}
      <style>{`
        @keyframes marqueeLeft {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-50% - 0.875rem));
          }
        }
        .marquee-track {
          animation: marqueeLeft 80s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
        .marquee-popular {
          animation-duration: 75s;
        }
        .marquee-trending {
          animation-duration: 85s;
        }
        .marquee-new {
          animation-duration: 80s;
        }
      `}</style>
      
      {/* ヒーローセクション */}
      <section style={{
        padding: '3.5rem 1.5rem 3rem 1.5rem',
        textAlign: 'center',
        background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '800', lineHeight: '1.3', marginBottom: '0.75rem', color: '#0f172a', letterSpacing: '-0.02em' }}>
            依頼受付からアドプト募集まで<br />スマートにまとめて公開
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.7' }}>
            Comisia (コミシア) は、イラストの通常依頼受付、料金プラン設定、<br />
            そして一点ものアドプトモデル（キャラ販売）の募集をまとめて公開できるクリエイターポータルです。
          </p>
        </div>
      </section>

      {/* メインコンテンツエリア */}
      <div style={{ padding: '3.5rem 0' }}>

        {/* ==================================================
            1. 人気クリエイター セクション (10名ピックアップ & 無限ループ / もっとみる無し)
            ================================================== */}
        <section style={{ marginBottom: '5.5rem' }}>
          <h2 style={{ textAlign: 'center', fontSize: '1.45rem', fontWeight: '800', color: '#0f172a', marginBottom: '2rem' }}>
            【人気クリエイター】
          </h2>
          {renderMarqueeSection(popularCreators, 'popular', false)}
        </section>

        {/* ==================================================
            2. 急上昇モデル セクション (10名ピックアップ & 無限ループ / もっとみる有り)
            ================================================== */}
        <section style={{ marginBottom: '5.5rem' }}>
          <h2 style={{ textAlign: 'center', fontSize: '1.45rem', fontWeight: '800', color: '#0f172a', marginBottom: '2rem' }}>
            【急上昇モデル】
          </h2>
          {renderMarqueeSection(trendingModels, 'trending', true, 'もっとみる')}
        </section>

        {/* ==================================================
            3. 新着モデル セクション (10名ピックアップ & 無限ループ / もっとみる有り)
            ================================================== */}
        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{ textAlign: 'center', fontSize: '1.45rem', fontWeight: '800', color: '#0f172a', marginBottom: '2rem' }}>
            【新着モデル】
          </h2>
          {renderMarqueeSection(newModels, 'new', true, 'もっとみる')}
        </section>

      </div>
    </div>
  );
}

