import React from 'react';
import { ArrowRight, Sparkles, Heart, CheckCircle2, UserPlus, LogIn, ExternalLink } from 'lucide-react';

export default function LandingPage({ creators, onOpenAuth, onSelectCreator }) {
  return (
    <div>
      {/* ヒーローセクション */}
      <section style={{
        padding: '5rem 0 4rem 0',
        textAlign: 'center',
        background: 'linear-gradient(to bottom, #ffffff, #f8fafc)',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          
          <h1 style={{ fontSize: '3rem', fontWeight: '800', lineHeight: '1.25', marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
            依頼受付からアドプト募集まで<br />スマートにまとめて公開
          </h1>

          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: '1.7', marginBottom: '2.5rem' }}>
            Comisia (コミシア) は、イラストの通常依頼受付、料金プラン設定、<br />
            そして一点ものアドプトモデル（キャラ販売）の募集をまとめて公開できるサービスです。
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button 
              className="btn btn-primary"
              onClick={() => onOpenAuth('register')}
              style={{ padding: '0.9rem 2.2rem', fontSize: '1rem' }}
            >
              <UserPlus size={18} /> 無料でマイページを作成する <ArrowRight size={18} />
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => onOpenAuth('login')}
              style={{ padding: '0.9rem 1.8rem', fontSize: '1rem' }}
            >
              <LogIn size={18} /> ログイン
            </button>
          </div>
        </div>
      </section>

      {/* サービスの特徴 3つのポイント */}
      <section style={{ padding: '4rem 0', background: '#ffffff', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.5rem' }}>主な機能とできること</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>クリエイターと依頼主の双方にとって使いやすい安心設計</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div className="clean-card" style={{ padding: '2rem' }}>
              <div style={{ width: '48px', height: '48px', background: 'rgba(100, 149, 237, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6495ed', marginBottom: '1.25rem' }}>
                <Sparkles size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem' }}>プロフィール公開ページ</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                自分好みのプロフィール、アバター、SNSリンクカードを配置し、あなた専用の公開ページをかんたんに作成できます。
              </p>
            </div>

            <div className="clean-card" style={{ padding: '2rem' }}>
              <div style={{ width: '48px', height: '48px', background: 'rgba(100, 149, 237, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6495ed', marginBottom: '1.25rem' }}>
                <CheckCircle2 size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem' }}>概算お見積もり計算機</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                描写範囲やオプションに応じた概算料金がその場でリアルタイム算出される、透明性の高い料金表機能。
              </p>
            </div>

            <div className="clean-card" style={{ padding: '2rem' }}>
              <div style={{ width: '48px', height: '48px', background: 'rgba(100, 149, 237, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6495ed', marginBottom: '1.25rem' }}>
                <Heart size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem' }}>アドプトモデル管理</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                一点ものキャラクターデザインの募集ステータス管理や、お迎え（購入）申請を安全に受付可能です。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 注目のクリエイター Showcase */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.5rem' }}>人気のクリエイター公開ページ</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>クリックすると各クリエイターの専用ページをご覧いただけます</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {Object.keys(creators).map(handle => {
              const c = creators[handle];
              return (
                <div 
                  key={handle}
                  className="clean-card"
                  style={{ padding: '1.75rem', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
                  onClick={() => onSelectCreator(handle)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <img 
                      src={c.avatar} 
                      alt={c.name} 
                      style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>{c.name}</h3>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: @{handle}</div>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem', flexGrow: 1, lineHeight: '1.6' }}>
                    {c.bio}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                    <span style={{ color: '#6495ed', fontWeight: '600' }}>公開ページを見る</span>
                    <ExternalLink size={16} color="var(--text-light)" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
