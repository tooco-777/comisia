import React, { useState } from 'react';
import { Sparkles, Heart, Eye, X, Check, ShoppingBag, ShieldCheck } from 'lucide-react';
import { sanitizeText, validateEmail } from '../utils/security';
import { DEFAULT_BANNER } from '../constants/defaults';

export default function AdoptSection({ adoptList, currentUser, onAdoptRequest }) {
  const [selectedAdopt, setSelectedAdopt] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [interests, setInterests] = useState({});
  const [applyForm, setApplyForm] = useState({ name: '', email: '', message: '' });
  const [applyErrors, setApplyErrors] = useState({});
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  const defaultAdopts = [
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
      image: DEFAULT_BANNER,
      tags: ['ケモミミ', 'ご約定済み'],
      description: '【ご成約済み】森の守護霊をイメージしたオリジナルデザイン。素敵なオーナー様に引き取られました。'
    }
  ];

  const list = adoptList && adoptList.length > 0 ? adoptList : defaultAdopts;

  const toggleInterest = (e, id) => {
    e.stopPropagation();
    setInterests(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleApplySubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!applyForm.name.trim()) errs.name = 'お名前を入力してください';
    if (!applyForm.email.trim() || !validateEmail(applyForm.email)) errs.email = '有効なメールアドレスを入力してください';
    
    if (Object.keys(errs).length > 0) {
      setApplyErrors(errs);
      return;
    }

    setAppliedSuccess(true);
    setTimeout(() => {
      setAppliedSuccess(false);
      setShowApplyModal(false);
      setSelectedAdopt(null);
      setApplyForm({ name: '', email: '', message: '' });
      if (onAdoptRequest) onAdoptRequest('アドプトモデルのお迎え・購入申請を受け付けました！');
    }, 1200);
  };

  return (
    <div style={{ padding: '2rem 0' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem' }}>
          アドプトモデル募集
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          一点ものオリジナルキャラクターデザインの販売・オーナー募集一覧です。
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '2rem' }}>
        {list.map((item) => (
          <div 
            key={item.id} 
            className="clean-card"
            style={{ overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
            onClick={() => setSelectedAdopt(item)}
          >
            <div style={{ position: 'relative', width: '100%', paddingTop: '100%', background: '#f1f5f9' }}>
              <img 
                src={item.image} alt={item.name}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                {item.status === 'AVAILABLE' && <span className="badge badge-available">お迎え可能 🟢</span>}
                {item.status === 'RESERVED' && <span className="badge badge-reserved">交渉中 🟡</span>}
                {item.status === 'ADOPTED' && <span className="badge badge-sold">ご成約済み 🔴</span>}
              </div>
              <button 
                onClick={(e) => toggleInterest(e, item.id)}
                style={{
                  position: 'absolute', top: '12px', right: '12px',
                  background: '#ffffff', border: '1px solid var(--border-color)',
                  width: '36px', height: '36px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: interests[item.id] ? '#db2777' : 'var(--text-muted)'
                }}
              >
                <Heart size={16} fill={interests[item.id] ? '#db2777' : 'none'} />
              </button>
            </div>

            <div style={{ padding: '1.5rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{item.category}</div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '0.5rem' }}>{item.name}</h3>
              <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '1rem' }}>{item.price}</div>

              <button className="btn btn-secondary" style={{ marginTop: 'auto', width: '100%', fontSize: '0.85rem' }}>
                <Eye size={15} /> 詳細を見る・お迎え申請
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 詳細ダイアログ */}
      {selectedAdopt && (
        <div className="modal-overlay">
          <div className="clean-card" style={{ maxWidth: '850px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <button 
              onClick={() => setSelectedAdopt(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <div style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: '#f1f5f9' }}>
              <img src={selectedAdopt.image} alt={selectedAdopt.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ marginBottom: '0.75rem' }}>
                {selectedAdopt.status === 'AVAILABLE' && <span className="badge badge-available">お迎え可能 🟢</span>}
                {selectedAdopt.status === 'RESERVED' && <span className="badge badge-reserved">交渉中 🟡</span>}
                {selectedAdopt.status === 'ADOPTED' && <span className="badge badge-sold">ご成約済み 🔴</span>}
              </div>

              <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '0.25rem' }}>{selectedAdopt.name}</h2>
              <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '1rem' }}>{selectedAdopt.price}</div>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1.25rem' }}>
                {selectedAdopt.description}
              </p>

              <div style={{ background: '#f8fafc', border: '1px solid var(--border-color)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <strong>付属・納品データ内容:</strong><br />
                ・高解像度PNGイラスト（背景透過付き）<br />
                ・レイヤー分けPSDデータ（差分パーツ収録）<br />
                ・商用利用権・二次創作権権譲渡
              </div>

              {selectedAdopt.status === 'AVAILABLE' ? (
                <button className="btn btn-primary" onClick={() => setShowApplyModal(true)} style={{ marginTop: 'auto', width: '100%', padding: '0.9rem' }}>
                  <ShoppingBag size={16} /> このモデルのお迎え（購入）申請をする
                </button>
              ) : selectedAdopt.status === 'RESERVED' ? (
                <button className="btn btn-secondary" disabled style={{ marginTop: 'auto', width: '100%', opacity: 0.6 }}>
                  交渉中（申請受付一時停止中）
                </button>
              ) : (
                <button className="btn btn-secondary" disabled style={{ marginTop: 'auto', width: '100%', opacity: 0.6 }}>
                  ご成約済み
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* お迎え申請 */}
      {showApplyModal && selectedAdopt && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="clean-card" style={{ maxWidth: '460px', width: '100%', padding: '2rem', position: 'relative' }}>
            <button onClick={() => setShowApplyModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '0.5rem' }}>【{selectedAdopt.name}】お迎え申請</h3>

            {appliedSuccess ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: '#16a34a' }}>
                <Check size={40} style={{ margin: '0 auto 0.5rem auto', display: 'block' }} />
                申請を送信しました！
              </div>
            ) : (
              <form onSubmit={handleApplySubmit}>
                <div className="form-group">
                  <label>お名前 *</label>
                  <input type="text" className="form-input" value={applyForm.name} onChange={(e) => setApplyForm({...applyForm, name: e.target.value})} placeholder="例: 山田 花子" />
                  {applyErrors.name && <div className="form-error">{applyErrors.name}</div>}
                </div>

                <div className="form-group">
                  <label>メールアドレス *</label>
                  <input type="email" className="form-input" value={applyForm.email} onChange={(e) => setApplyForm({...applyForm, email: e.target.value})} placeholder="example@domain.com" />
                  {applyErrors.email && <div className="form-error">{applyErrors.email}</div>}
                </div>

                <div className="form-group">
                  <label>メッセージ・用途</label>
                  <textarea className="form-textarea" rows="3" value={applyForm.message} onChange={(e) => setApplyForm({...applyForm, message: e.target.value})} placeholder="例: 配信用キャラクターとして使用します。" />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                  お迎え申請を確定送信する
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
