import React, { useState } from 'react';
import { Save, Plus, Trash2, Edit3, Check, ExternalLink, ShieldCheck } from 'lucide-react';
import { sanitizeText } from '../utils/security';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export default function ProfileEditor({ profile, onSaveProfile, adopts, onSaveAdopts, onGoToPublicPage }) {
  const [editedProfile, setEditedProfile] = useState({
    name: profile?.name || 'クリエイター名',
    bio: profile?.bio || 'キャラクターイラスト・立ち絵・アドプトモデル制作を受け付けています。',
    avatar: profile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    banner: profile?.banner || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    snsLinks: profile?.snsLinks || { x: '', pixiv: '', instagram: '' }
  });

  const [newAdopt, setNewAdopt] = useState({
    name: '',
    price: '',
    category: '通常立ち絵',
    description: '',
    image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
    tags: 'オリジナル, 立ち絵'
  });

  const [showAddAdopt, setShowAddAdopt] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);

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
            handle: profile.handle || user.email.split('@')[0],
            name: safeData.name,
            bio: safeData.bio,
            avatar_url: safeData.avatar,
            banner_url: safeData.banner,
            sns_links: safeData.snsLinks
          });
        }
      } catch (err) {
        console.error('Supabase profile update error:', err);
      }
    }

    onSaveProfile(safeData);
    setSavedMessage(true);

    // 保存後、マイページ（公開ページ）へ自動移動
    if (onGoToPublicPage) {
      setTimeout(() => {
        onGoToPublicPage();
      }, 500);
    }
  };

  const handleAddAdopt = async (e) => {
    e.preventDefault();
    if (!newAdopt.name || !newAdopt.price) return;

    const item = {
      id: 'adopt-' + Date.now(),
      name: sanitizeText(newAdopt.name),
      price: sanitizeText(newAdopt.price),
      category: sanitizeText(newAdopt.category),
      description: sanitizeText(newAdopt.description),
      image: newAdopt.image,
      status: 'AVAILABLE',
      tags: newAdopt.tags.split(',').map(t => t.trim())
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase.from('adopts').insert({
            creator_id: user.id,
            name: item.name,
            price: item.price,
            category: item.category,
            image_url: item.image,
            tags: item.tags,
            description: item.description
          }).select().single();

          if (data && !error) {
            item.id = data.id;
          }
        }
      } catch (err) {
        console.error('Supabase adopt insert error:', err);
      }
    }

    onSaveAdopts([...adopts, item]);
    setShowAddAdopt(false);
    setNewAdopt({
      name: '',
      price: '',
      category: '通常立ち絵',
      description: '',
      image: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
      tags: 'オリジナル, 立ち絵'
    });
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

  return (
    <div style={{ padding: '2.5rem 0', maxWidth: '840px', margin: '0 auto' }}>
      
      {/* ダッシュボードヘッダー */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>マイページ ＆ 編集管理</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            公開ページのプロフィール、SNSリンク、アドプト募集作品の管理を行えます。
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {savedMessage && (
            <span style={{ color: '#16a34a', fontWeight: '600', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Check size={16} /> 保存しました
            </span>
          )}
        </div>
      </div>

      {/* 1. プロフィール設定 */}
      <form onSubmit={handleProfileSubmit} className="clean-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Edit3 size={18} /> プロフィール ＆ 公開基本設定
        </h3>

        <div className="form-group">
          <label>表示名 / クリエイター名</label>
          <input 
            type="text" className="form-input"
            value={editedProfile.name}
            onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>自己紹介文</label>
          <textarea 
            className="form-textarea" rows="4"
            value={editedProfile.bio}
            onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
          ></textarea>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div className="form-group">
            <label>アバター画像URL</label>
            <input 
              type="text" className="form-input"
              value={editedProfile.avatar}
              onChange={(e) => setEditedProfile({ ...editedProfile, avatar: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>ヘッダー背景画像URL</label>
            <input 
              type="text" className="form-input"
              value={editedProfile.banner}
              onChange={(e) => setEditedProfile({ ...editedProfile, banner: e.target.value })}
            />
          </div>
        </div>

        <div className="form-group">
          <label>SNSリンクカード設定</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <input 
              type="text" className="form-input" placeholder="𝕏 (Twitter) URL" 
              value={editedProfile.snsLinks.x || ''}
              onChange={(e) => setEditedProfile({
                ...editedProfile,
                snsLinks: { ...editedProfile.snsLinks, x: e.target.value }
              })}
            />
            <input 
              type="text" className="form-input" placeholder="Pixiv URL" 
              value={editedProfile.snsLinks.pixiv || ''}
              onChange={(e) => setEditedProfile({
                ...editedProfile,
                snsLinks: { ...editedProfile.snsLinks, pixiv: e.target.value }
              })}
            />
            <input 
              type="text" className="form-input" placeholder="Instagram URL" 
              value={editedProfile.snsLinks.instagram || ''}
              onChange={(e) => setEditedProfile({
                ...editedProfile,
                snsLinks: { ...editedProfile.snsLinks, instagram: e.target.value }
              })}
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
          <Save size={16} /> プロフィールを保存
        </button>
      </form>

      {/* 2. アドプトモデル管理 */}
      <div className="clean-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>
            登録済みアドプトモデル作品 ({adopts.length}件)
          </h3>
          <button className="btn btn-primary" style={{ fontSize: '0.85rem' }} onClick={() => setShowAddAdopt(!showAddAdopt)}>
            <Plus size={16} /> 新しいモデルを登録
          </button>
        </div>

        {showAddAdopt && (
          <form onSubmit={handleAddAdopt} style={{ background: 'var(--bg-subtle)', padding: '1.5rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
            <h4 style={{ marginBottom: '1rem', fontSize: '1rem' }}>新規アドプトモデル作成</h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>モデル名 *</label>
                <input 
                  type="text" className="form-input"
                  value={newAdopt.name}
                  onChange={(e) => setNewAdopt({ ...newAdopt, name: e.target.value })}
                  placeholder="例: サイバー少女"
                />
              </div>

              <div className="form-group">
                <label>頒布価格 *</label>
                <input 
                  type="text" className="form-input"
                  value={newAdopt.price}
                  onChange={(e) => setNewAdopt({ ...newAdopt, price: e.target.value })}
                  placeholder="例: ￥35,000"
                />
              </div>
            </div>

            <div className="form-group">
              <label>画像URL</label>
              <input 
                type="text" className="form-input"
                value={newAdopt.image}
                onChange={(e) => setNewAdopt({ ...newAdopt, image: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>商品説明・付属PSD詳細</label>
              <textarea 
                className="form-textarea" rows="3"
                value={newAdopt.description}
                onChange={(e) => setNewAdopt({ ...newAdopt, description: e.target.value })}
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              モデルを登録公開する
            </button>
          </form>
        )}

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

              <button 
                className="btn btn-secondary" 
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', color: '#dc2626' }}
                onClick={() => handleDeleteAdopt(item.id)}
              >
                <Trash2 size={14} /> 削除
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
