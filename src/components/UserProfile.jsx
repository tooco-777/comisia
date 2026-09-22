import React, { useState } from 'react';
import { ExternalLink, Edit3, Sparkles, Send, Globe, ShieldCheck, Heart, Layers, MessageSquare, Calculator, PhoneCall } from 'lucide-react';
import PriceCalculator from './PriceCalculator';
import CommissionForm from './CommissionForm';
import AdoptSection from './AdoptSection';
import ContactForm from './ContactForm';

export default function UserProfile({ profile, adopts, currentUser, onEditClick, onAdoptRequest, showToast }) {
  const [activeTab, setActiveTab] = useState('all'); // all, prices, order, adopt, contact
  const [estimateSummary, setEstimateSummary] = useState(null);

  const user = profile || {
    name: 'イラストレーター / デザイナー',
    bio: '',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    snsLinks: {
      x: 'https://twitter.com',
      pixiv: 'https://pixiv.net',
      instagram: 'https://instagram.com'
    }
  };

  const handleProceedWithEstimate = (summary) => {
    setEstimateSummary(summary);
    setActiveTab('order');
    window.scrollTo({ top: 400, behavior: 'smooth' });
    if (showToast) showToast(`概算見積もり (${summary.estimatedPrice}) を引き継いで通常依頼フォームへ移動しました`);
  };

  return (
    <div style={{ paddingBottom: '4rem' }}>
      
      {/* 1. ヘッダーバナー */}
      <div style={{ position: 'relative', marginBottom: '5rem' }}>
        <div style={{
          height: '240px',
          width: '100%',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <img 
            src={user.banner} 
            alt="Banner" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        {/* アバター & プロフィールカード */}
        <div style={{
          position: 'absolute',
          bottom: '-55px',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          width: '100%',
          maxWidth: '650px',
          padding: '0 1rem'
        }}>
          <div style={{
            position: 'relative',
            width: '110px',
            height: '110px',
            margin: '0 auto 1rem auto',
            borderRadius: '50%',
            padding: '4px',
            background: '#ffffff',
            boxShadow: 'var(--shadow-md)'
          }}>
            <img 
              src={user.avatar} 
              alt={user.name} 
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-main)' }}>
            {user.name}
          </h1>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.25rem', lineHeight: '1.6' }}>
            {user.bio}
          </p>

          {/* SNS / Webサイト リンク集 */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {Array.isArray(user.websiteLinks) && user.websiteLinks.length > 0 ? (
              user.websiteLinks.map((item, i) => {
                if (!item.url && !item.label) return null;
                const href = item.url ? (item.url.startsWith('http') ? item.url : `https://${item.url}`) : '#';
                return (
                  <a 
                    key={i}
                    href={href} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="btn btn-secondary" 
                    style={{ padding: '0.45rem 1.1rem', fontSize: '0.85rem' }}
                  >
                    {item.label || item.url} <ExternalLink size={14} />
                  </a>
                );
              })
            ) : (
              <>
                {user.snsIds?.x && (
                  <a 
                    href={user.snsIds.x.startsWith('http') ? user.snsIds.x : `https://x.com/${user.snsIds.x.replace(/^@/, '')}`} 
                    target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: '0.45rem 1.1rem', fontSize: '0.85rem' }}
                  >
                    𝕏 (@{user.snsIds.x.replace(/^@/, '')}) <ExternalLink size={14} />
                  </a>
                )}
                {user.snsIds?.instagram && (
                  <a 
                    href={user.snsIds.instagram.startsWith('http') ? user.snsIds.instagram : `https://instagram.com/${user.snsIds.instagram.replace(/^@/, '')}`} 
                    target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: '0.45rem 1.1rem', fontSize: '0.85rem' }}
                  >
                    Instagram <ExternalLink size={14} />
                  </a>
                )}
                {user.snsIds?.youtube && (
                  <a 
                    href={user.snsIds.youtube.startsWith('http') ? user.snsIds.youtube : `https://youtube.com/${user.snsIds.youtube.startsWith('@') ? user.snsIds.youtube : '@' + user.snsIds.youtube}`} 
                    target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: '0.45rem 1.1rem', fontSize: '0.85rem' }}
                  >
                    YouTube <ExternalLink size={14} />
                  </a>
                )}
                {Array.isArray(user.extraSns) && user.extraSns.map((item, i) => (
                  item.label && item.id && (
                    <a 
                      key={i}
                      href={item.id.startsWith('http') ? item.id : `https://${item.id}`} 
                      target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ padding: '0.45rem 1.1rem', fontSize: '0.85rem' }}
                    >
                      {item.label} <ExternalLink size={14} />
                    </a>
                  )
                ))}
              </>
            )}
          </div>

          {/* 本人ログイン時の編集ボタン (自分のプロフィール時のみ表示) */}
          {currentUser && (currentUser.handle === user.handle || currentUser.id === user.id || activeTab === 'editor') && (
            <button 
              className="btn btn-primary"
              onClick={onEditClick}
              style={{ fontSize: '0.85rem', padding: '0.45rem 1.25rem' }}
            >
              <Edit3 size={15} /> この公開ページを編集する
            </button>
          )}
        </div>
      </div>

      {/* ナビゲーションタブ */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '5rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
        <button 
          className={`btn ${activeTab === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('all')}
        >
          全コンテンツ
        </button>
        <button 
          className={`btn ${activeTab === 'prices' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('prices')}
        >
          <Calculator size={16} /> 料金表 & 見積
        </button>
        <button 
          className={`btn ${activeTab === 'order' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('order')}
        >
          通常依頼受付
        </button>
        <button 
          className={`btn ${activeTab === 'adopt' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('adopt')}
        >
          <Sparkles size={16} /> アドプト募集
        </button>
        <button 
          className={`btn ${activeTab === 'contact' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('contact')}
        >
          <PhoneCall size={16} /> お問い合わせ
        </button>
      </div>

      {/* セクション表示 */}
      {(activeTab === 'all' || activeTab === 'prices') && (
        <section style={{ marginBottom: '4rem' }}>
          <PriceCalculator onProceedWithEstimate={handleProceedWithEstimate} />
        </section>
      )}

      {(activeTab === 'all' || activeTab === 'order') && (
        <section style={{ marginBottom: '4rem' }}>
          <CommissionForm 
            creatorId={user.id}
            estimateSummary={estimateSummary} 
            onSuccess={(msg) => showToast && showToast(msg)} 
          />
        </section>
      )}

      {(activeTab === 'all' || activeTab === 'adopt') && (
        <section style={{ marginBottom: '4rem' }}>
          <AdoptSection adoptList={adopts} currentUser={currentUser} onAdoptRequest={onAdoptRequest} />
        </section>
      )}

      {(activeTab === 'all' || activeTab === 'contact') && (
        <section style={{ marginBottom: '4rem' }}>
          <ContactForm onSuccess={(msg) => showToast && showToast(msg)} />
        </section>
      )}
    </div>
  );
}
