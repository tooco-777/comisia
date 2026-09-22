import React, { useState } from 'react';
import { 
  Save, Plus, Trash2, Edit3, Check, Upload, Camera, Image as ImageIcon, 
  DollarSign, Globe, XCircle, Youtube, Instagram
} from 'lucide-react';
import { sanitizeText } from '../utils/security';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import ImageCropModal from './ImageCropModal';

export default function ProfileEditor({ 
  profile, 
  onSaveProfile, 
  adopts = [], 
  onSaveAdopts, 
  priceList = [], 
  onSavePriceList 
}) {
  // 初期 Webサイト リンク集 (デフォルトで X を含める)
  const initialWebsiteLinks = () => {
    if (Array.isArray(profile?.websiteLinks) && profile.websiteLinks.length > 0) {
      return profile.websiteLinks;
    }
    const legacy = [];
    if (profile?.snsIds?.x) legacy.push({ url: profile.snsIds.x, label: 'X' });
    if (profile?.snsIds?.instagram) legacy.push({ url: profile.snsIds.instagram, label: 'Instagram' });
    if (profile?.snsIds?.youtube) legacy.push({ url: profile.snsIds.youtube, label: 'YouTube' });
    if (Array.isArray(profile?.extraSns)) {
      profile.extraSns.forEach(item => {
        if (item.label || item.id) legacy.push({ url: item.id || '', label: item.label || '' });
      });
    }
    if (legacy.length > 0) return legacy;
    return [{ url: '', label: 'X' }];
  };

  const [editedProfile, setEditedProfile] = useState({
    name: profile?.name || '',
    bio: profile?.bio || '',
    avatar: profile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    banner: profile?.banner || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    websiteLinks: initialWebsiteLinks()
  });

  // 対象プロファイル(handle)切り替え時に同期
  React.useEffect(() => {
    if (profile) {
      setEditedProfile({
        name: profile.name || '',
        bio: profile.bio || '',
        avatar: profile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
        banner: profile.banner || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
        websiteLinks: initialWebsiteLinks()
      });
    }
  }, [profile?.handle]);

  // 画像トリミング用ステート
  const [cropTarget, setCropTarget] = useState(null); // { src, type: 'avatar' | 'banner', aspect }

  // アドプトモデル管理ステート
  const [editingAdoptId, setEditingAdoptId] = useState(null);
  const [showAdoptForm, setShowAdoptForm] = useState(false);
  const [adoptForm, setAdoptForm] = useState({
    name: '',
    price: '',
    category: '通常立ち絵',
    description: '',
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
    tags: 'オリジナル, 立ち絵'
  });

  // 料金表管理ステート
  const [editingPriceId, setEditingPriceId] = useState(null);
  const [showPriceForm, setShowPriceForm] = useState(false);
  const [priceForm, setPriceForm] = useState({
    title: '',
    price: '',
    description: '',
    estimatePeriod: ''
  });
  const [localPriceList, setLocalPriceList] = useState(priceList);

  const [savedMessage, setSavedMessage] = useState(false);

  // ファイル選択時の画像処理
  const handleFileSelect = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCropTarget({
        src: reader.result,
        type,
        aspect: type === 'avatar' ? 1 : 3
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // トリミング決定処理 (即座に親ステート & ヘッダーユーザーアイコンへ同期)
  const handleCropComplete = (croppedDataUrl) => {
    if (cropTarget?.type === 'avatar') {
      const updated = { ...editedProfile, avatar: croppedDataUrl };
      setEditedProfile(updated);
      if (onSaveProfile) {
        onSaveProfile(updated);
      }
    } else if (cropTarget?.type === 'banner') {
      const updated = { ...editedProfile, banner: croppedDataUrl };
      setEditedProfile(updated);
      if (onSaveProfile) {
        onSaveProfile(updated);
      }
    }
  };

  // Webサイト リンク操作
  const handleAddWebsiteLink = () => {
    setEditedProfile(prev => ({
      ...prev,
      websiteLinks: [...prev.websiteLinks, { url: '', label: '' }]
    }));
  };

  const handleWebsiteLinkChange = (index, field, value) => {
    setEditedProfile(prev => {
      const updated = [...prev.websiteLinks];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, websiteLinks: updated };
    });
  };

  const handleRemoveWebsiteLink = (index) => {
    setEditedProfile(prev => ({
      ...prev,
      websiteLinks: prev.websiteLinks.filter((_, i) => i !== index)
    }));
  };

  // リンクのアイコン判別
  const getLinkIcon = (url = '', label = '') => {
    const lowerUrl = (url || '').toLowerCase();
    const lowerLabel = (label || '').toLowerCase();

    if (lowerUrl.includes('x.com') || lowerUrl.includes('twitter.com') || lowerLabel === 'x' || lowerLabel === 'twitter') {
      return (
        <span style={{ fontWeight: '800', fontSize: '1.05rem', fontFamily: 'sans-serif', color: '#0f172a', lineHeight: 1 }}>
          𝕏
        </span>
      );
    }
    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be') || lowerLabel.includes('youtube')) {
      return <Youtube size={18} color="#ef4444" />;
    }
    if (lowerUrl.includes('instagram.com') || lowerLabel.includes('instagram')) {
      return <Instagram size={18} color="#e1306c" />;
    }
    return <Globe size={18} color="#64748b" />;
  };

  // プロフィール送信 (自動で公開ページに飛ばないように修正)
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const safeData = {
      ...editedProfile,
      name: sanitizeText(editedProfile.name),
      bio: sanitizeText(editedProfile.bio)
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('profiles').upsert({
            id: user.id,
            handle: profile?.handle || user.email.split('@')[0],
            name: safeData.name,
            bio: safeData.bio,
            avatar_url: safeData.avatar,
            banner_url: safeData.banner,
            sns_links: { websiteLinks: safeData.websiteLinks }
          });
          await supabase.auth.updateUser({
            data: {
              name: safeData.name,
              avatar: safeData.avatar,
              handle: profile?.handle || user.email.split('@')[0]
            }
          });
        }
      } catch (err) {
        console.error('Supabase profile update error:', err);
      }
    }

    onSaveProfile(safeData);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  // アドプトモデルフォーム送信
  const handleAdoptFormSubmit = async (e) => {
    e.preventDefault();
    if (!adoptForm.name || !adoptForm.price) return;

    if (editingAdoptId) {
      const updatedAdopts = adopts.map(item => {
        if (item.id === editingAdoptId) {
          return {
            ...item,
            name: sanitizeText(adoptForm.name),
            price: sanitizeText(adoptForm.price),
            category: sanitizeText(adoptForm.category),
            description: sanitizeText(adoptForm.description),
            image: adoptForm.image,
            tags: typeof adoptForm.tags === 'string' ? adoptForm.tags.split(',').map(t => t.trim()) : adoptForm.tags
          };
        }
        return item;
      });

      if (isSupabaseConfigured && supabase && !editingAdoptId.startsWith('adopt-')) {
        try {
          await supabase.from('adopts').update({
            name: sanitizeText(adoptForm.name),
            price: sanitizeText(adoptForm.price),
            category: sanitizeText(adoptForm.category),
            image_url: adoptForm.image,
            description: sanitizeText(adoptForm.description)
          }).eq('id', editingAdoptId);
        } catch (err) {
          console.error('Supabase adopt update error:', err);
        }
      }

      onSaveAdopts(updatedAdopts);
      setEditingAdoptId(null);
      setShowAdoptForm(false);
    } else {
      const newItem = {
        id: 'adopt-' + Date.now(),
        name: sanitizeText(adoptForm.name),
        price: sanitizeText(adoptForm.price),
        category: sanitizeText(adoptForm.category),
        description: sanitizeText(adoptForm.description),
        image: adoptForm.image,
        status: 'AVAILABLE',
        tags: typeof adoptForm.tags === 'string' ? adoptForm.tags.split(',').map(t => t.trim()) : adoptForm.tags
      };

      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data } = await supabase.from('adopts').insert({
              creator_id: user.id,
              name: newItem.name,
              price: newItem.price,
              category: newItem.category,
              image_url: newItem.image,
              tags: newItem.tags,
              description: newItem.description
            }).select().single();

            if (data) newItem.id = data.id;
          }
        } catch (err) {
          console.error('Supabase adopt insert error:', err);
        }
      }

      onSaveAdopts([...adopts, newItem]);
      setShowAdoptForm(false);
    }

    setAdoptForm({
      name: '', price: '', category: '通常立ち絵', description: '',
      image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
      tags: 'オリジナル, 立ち絵'
    });
  };

  const handleStartEditAdopt = (item) => {
    setEditingAdoptId(item.id);
    setAdoptForm({
      name: item.name,
      price: item.price,
      category: item.category || '通常立ち絵',
      description: item.description || '',
      image: item.image,
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : item.tags
    });
    setShowAdoptForm(true);
  };

  const handleDeleteAdopt = async (id) => {
    if (isSupabaseConfigured && supabase && !id.startsWith('adopt-')) {
      try {
        await supabase.from('adopts').delete().eq('id', id);
      } catch (err) {
        console.error('Supabase adopt delete error:', err);
      }
    }
    onSaveAdopts(adopts.filter(a => a.id !== id));
  };

  // 料金表項目フォーム送信
  const handlePriceFormSubmit = (e) => {
    e.preventDefault();
    if (!priceForm.title || !priceForm.price) return;

    let updatedList;
    if (editingPriceId) {
      updatedList = localPriceList.map(item => item.id === editingPriceId ? { ...item, ...priceForm } : item);
      setEditingPriceId(null);
    } else {
      const newItem = { id: 'price-' + Date.now(), ...priceForm };
      updatedList = [...localPriceList, newItem];
    }

    setLocalPriceList(updatedList);
    if (onSavePriceList) onSavePriceList(updatedList);
    setShowPriceForm(false);
    setPriceForm({ title: '', price: '', description: '', estimatePeriod: '' });
  };

  const handleStartEditPrice = (item) => {
    setEditingPriceId(item.id);
    setPriceForm({
      title: item.title,
      price: item.price,
      description: item.description || '',
      estimatePeriod: item.estimatePeriod || ''
    });
    setShowPriceForm(true);
  };

  const handleDeletePrice = (id) => {
    const updated = localPriceList.filter(item => item.id !== id);
    setLocalPriceList(updated);
    if (onSavePriceList) onSavePriceList(updated);
  };

  return (
    <div style={{ padding: '2.5rem 0', maxWidth: '840px', margin: '0 auto' }}>
      
      {/* トリミング用モーダル */}
      {cropTarget && (
        <ImageCropModal 
          imageSrc={cropTarget.src}
          aspect={cropTarget.aspect}
          title={cropTarget.type === 'avatar' ? 'アイコン画像のトリミング' : 'ヘッダー画像のトリミング'}
          onCropComplete={handleCropComplete}
          onClose={() => setCropTarget(null)}
        />
      )}

      {/* ダッシュボードヘッダー (説明文なし) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>マイページ</h1>
        </div>

        {savedMessage && (
          <span style={{ color: '#16a34a', fontWeight: '600', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Check size={16} /> 保存しました
          </span>
        )}
      </div>

      {/* 1. プロフィール設定 */}
      <form 
        onSubmit={handleProfileSubmit} 
        onKeyDown={(e) => {
          if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
            e.preventDefault();
          }
        }}
        className="clean-card" 
        style={{ padding: '2rem', marginBottom: '2rem' }}
      >
        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Edit3 size={18} /> プロフィール
        </h3>

        {/* 【アイコン・ヘッダー登録】 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '1.5rem', background: '#f8fafc', padding: '1.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
          {/* アバター画像 */}
          <div style={{ textAlign: 'center' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>アイコン画像</label>
            <div style={{ position: 'relative', width: '90px', height: '90px', margin: '0 auto 8px auto', borderRadius: '50%', overflow: 'hidden', border: '2px solid #ffffff', boxShadow: 'var(--shadow-sm)' }}>
              <img src={editedProfile.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <label className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', cursor: 'pointer', display: 'inline-flex' }}>
              <Camera size={14} /> 画像を選択・トリミング
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileSelect(e, 'avatar')} />
            </label>
          </div>

          {/* ヘッダー画像 */}
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px', display: 'block' }}>ヘッダー背景画像</label>
            <div style={{ position: 'relative', width: '100%', height: '90px', borderRadius: '8px', overflow: 'hidden', marginBottom: '8px', border: '1px solid var(--border-color)' }}>
              <img src={editedProfile.banner} alt="Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <label className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', cursor: 'pointer', display: 'inline-flex' }}>
              <ImageIcon size={14} /> 画像を選択・トリミング
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileSelect(e, 'banner')} />
            </label>
          </div>
        </div>

        {/* クリエイター名 ＝ ユーザーネーム */}
        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>クリエイター名（ユーザーネーム）</label>
          <input 
            type="text" className="form-input"
            value={editedProfile.name}
            onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
            placeholder="例: イラストスタジオ LUNA"
          />
        </div>

        {/* 自己紹介文 (デフォは完全空白) */}
        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>自己紹介文</label>
          <textarea 
            className="form-textarea" rows="4"
            value={editedProfile.bio}
            onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
            placeholder="自己紹介や制作受付状況などを入力してください"
          ></textarea>
        </div>

        {/* Webサイト / SNS リンク集 */}
        <div style={{ marginBottom: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1.5rem', alignItems: 'start' }}>
            <div>
              <label style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}>Webサイト</label>
            </div>
            <div>
              <p style={{ fontSize: '0.825rem', color: '#64748b', marginBottom: '0.75rem', lineHeight: '1.5' }}>
                ソーシャルサイト や Webサイト などへのリンクをショップに表示できます
              </p>

              <button
                type="button"
                onClick={handleAddWebsiteLink}
                style={{
                  background: '#e2e8f0',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#334155',
                  fontWeight: '600',
                  fontSize: '0.825rem',
                  padding: '0.4rem 0.9rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginBottom: '1rem',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#cbd5e1'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#e2e8f0'}
              >
                + Webサイトを追加
              </button>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {editedProfile.websiteLinks.map((item, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{ width: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      {getLinkIcon(item.url, item.label)}
                    </div>
                    <input
                      type="text"
                      className="form-input"
                      style={{ flex: '1.6', fontSize: '0.85rem', padding: '0.45rem 0.75rem' }}
                      placeholder="URLを入力 (https://...)"
                      value={item.url}
                      onChange={(e) => handleWebsiteLinkChange(index, 'url', e.target.value)}
                    />
                    <input
                      type="text"
                      className="form-input"
                      style={{ flex: '1', fontSize: '0.85rem', padding: '0.45rem 0.75rem' }}
                      placeholder="表示名"
                      value={item.label}
                      onChange={(e) => handleWebsiteLinkChange(index, 'label', e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveWebsiteLink(index)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'color 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                      title="削除"
                    >
                      <XCircle size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
            <Save size={16} /> プロフィールを保存
          </button>
        </div>
      </form>

      {/* 2. アドプトモデル作品 */}
      <div className="clean-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>
            アドプトモデル作品 ({adopts.length}件)
          </h3>
          <button 
            className="btn btn-primary" style={{ fontSize: '0.85rem' }} 
            onClick={() => {
              setEditingAdoptId(null);
              setAdoptForm({ name: '', price: '', category: '通常立ち絵', description: '', image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80', tags: 'オリジナル, 立ち絵' });
              setShowAdoptForm(!showAdoptForm);
            }}
          >
            <Plus size={16} /> 新しいモデルを登録
          </button>
        </div>

        {/* 新規登録 / 編集フォーム */}
        {showAdoptForm && (
          <form onSubmit={handleAdoptFormSubmit} style={{ background: 'var(--bg-subtle)', padding: '1.5rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
            <h4 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: '700' }}>
              {editingAdoptId ? 'アドプトモデルの編集' : '新規アドプトモデル作成'}
            </h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>モデル名 *</label>
                <input 
                  type="text" className="form-input"
                  value={adoptForm.name}
                  onChange={(e) => setAdoptForm({ ...adoptForm, name: e.target.value })}
                  placeholder="例: サイバー少女"
                />
              </div>

              <div className="form-group">
                <label>頒布価格 *</label>
                <input 
                  type="text" className="form-input"
                  value={adoptForm.price}
                  onChange={(e) => setAdoptForm({ ...adoptForm, price: e.target.value })}
                  placeholder="例: ￥35,000"
                />
              </div>
            </div>

            <div className="form-group">
              <label>画像URL</label>
              <input 
                type="text" className="form-input"
                value={adoptForm.image}
                onChange={(e) => setAdoptForm({ ...adoptForm, image: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>商品説明・付属PSD詳細</label>
              <textarea 
                className="form-textarea" rows="3"
                value={adoptForm.description}
                onChange={(e) => setAdoptForm({ ...adoptForm, description: e.target.value })}
              ></textarea>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowAdoptForm(false)}>キャンセル</button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                {editingAdoptId ? '更新内容を保存' : 'モデルを登録公開する'}
              </button>
            </div>
          </form>
        )}

        {/* 作品一覧 */}
        {adopts.length === 0 ? (
          <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)' }}>
            まだ登録されたアドプトモデル作品はありません。「新しいモデルを登録」ボタンから作品を公開できます。
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {adopts.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-subtle)', padding: '0.8rem 1rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img src={item.image} alt={item.name} style={{ width: '45px', height: '45px', borderRadius: '8px', objectFit: 'cover' }} />
                  <div>
                    <div style={{ fontWeight: '750' }}>{item.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.price} ({item.status})</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    type="button"
                    className="btn btn-secondary" 
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                    onClick={() => handleStartEditAdopt(item)}
                  >
                    <Edit3 size={14} /> 編集
                  </button>
                  <button 
                    type="button"
                    className="btn btn-secondary" 
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', color: '#dc2626' }}
                    onClick={() => handleDeleteAdopt(item.id)}
                  >
                    <Trash2 size={14} /> 削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. 料金表設定パネル */}
      <div className="clean-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <DollarSign size={18} /> 料金表設定 ({localPriceList.length}件)
          </h3>
          <button 
            type="button"
            className="btn btn-primary" style={{ fontSize: '0.85rem' }} 
            onClick={() => {
              setEditingPriceId(null);
              setPriceForm({ title: '', price: '', description: '', estimatePeriod: '' });
              setShowPriceForm(!showPriceForm);
            }}
          >
            <Plus size={16} /> 料金メニューを追加
          </button>
        </div>

        {/* 料金メニュー作成 / 編集フォーム */}
        {showPriceForm && (
          <form onSubmit={handlePriceFormSubmit} style={{ background: 'var(--bg-subtle)', padding: '1.5rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
            <h4 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: '700' }}>
              {editingPriceId ? '料金メニューの編集' : '新規料金メニューの作成'}
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>プラン/メニュー名 *</label>
                <input 
                  type="text" className="form-input"
                  value={priceForm.title}
                  onChange={(e) => setPriceForm({ ...priceForm, title: e.target.value })}
                  placeholder="例: バストアップ イラスト"
                />
              </div>

              <div className="form-group">
                <label>料金目安 *</label>
                <input 
                  type="text" className="form-input"
                  value={priceForm.price}
                  onChange={(e) => setPriceForm({ ...priceForm, price: e.target.value })}
                  placeholder="例: ￥12,000〜"
                />
              </div>
            </div>

            <div className="form-group">
              <label>納期目安</label>
              <input 
                type="text" className="form-input"
                value={priceForm.estimatePeriod}
                onChange={(e) => setPriceForm({ ...priceForm, estimatePeriod: e.target.value })}
                placeholder="例: 1〜2週間"
              />
            </div>

            <div className="form-group">
              <label>メニュー概要・内容詳細</label>
              <textarea 
                className="form-textarea" rows="3"
                value={priceForm.description}
                onChange={(e) => setPriceForm({ ...priceForm, description: e.target.value })}
                placeholder="基本内容や背景オプションについての説明"
              ></textarea>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowPriceForm(false)}>キャンセル</button>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                {editingPriceId ? '料金メニューを保存' : '料金メニューを追加'}
              </button>
            </div>
          </form>
        )}

        {/* 料金メニュー一覧 */}
        {localPriceList.length === 0 ? (
          <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)' }}>
            まだ設定された料金メニューはありません。「料金メニューを追加」ボタンから通常依頼のプランを設定できます。
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {localPriceList.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-subtle)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)' }}>
                <div>
                  <div style={{ fontWeight: '750', fontSize: '1rem' }}>{item.title}</div>
                  <div style={{ fontSize: '0.825rem', color: '#6495ed', fontWeight: '600' }}>{item.price} {item.estimatePeriod && `(納期: ${item.estimatePeriod})`}</div>
                  {item.description && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{item.description}</div>}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    type="button"
                    className="btn btn-secondary" 
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                    onClick={() => handleStartEditPrice(item)}
                  >
                    <Edit3 size={14} /> 編集
                  </button>
                  <button 
                    type="button"
                    className="btn btn-secondary" 
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', color: '#dc2626' }}
                    onClick={() => handleDeletePrice(item.id)}
                  >
                    <Trash2 size={14} /> 削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
