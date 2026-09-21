import React from 'react';
import { CheckCircle2, ShieldCheck, Clock, FileText, Send } from 'lucide-react';

export default function PriceList({ priceData, onSelectPlan }) {
  // デフォルト料金表（カスタムプロフィールのデータがあればそれを優先）
  const defaultPrices = [
    {
      id: 'icon',
      title: 'SNSアイコン / SDイラスト',
      price: '￥5,000〜',
      description: 'SNSアカウントや配信用のデフォルメアイコン・ミニキャライラスト',
      features: ['サイズ: 1000×1000px', '納期: 1〜2週間', '修正2回まで無料', '背景: 簡易 / 単色'],
      recommended: false
    },
    {
      id: 'bustup',
      title: '通常バストアップイラスト',
      price: '￥12,000〜',
      description: '胸より上のキャラクターイラスト。一番人気の立ち絵・配信用プランです。',
      features: ['サイズ: A4 300dpi高画質', '納期: 2〜3週間', '修正3回まで無料', '差分表情1種サービス'],
      recommended: true
    },
    {
      id: 'fullbody',
      title: '全身立ち絵・一枚絵',
      price: '￥25,000〜',
      description: 'Vtuber用立ち絵・キャラクターデザイン、背景込みの一枚絵イラスト。',
      features: ['サイズ: 自由（高画質対応）', '納期: 3〜4週間', '商用利用のご相談可', 'レイアー分けPSD納品対応'],
      recommended: false
    }
  ];

  const items = priceData && priceData.length > 0 ? priceData : defaultPrices;

  return (
    <div style={{ padding: '2.5rem 0' }}>
      {/* ヒーローセクション */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem' }}>
          イラスト制作 <span className="gradient-text">料金プラン一覧</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '650px', margin: '0 auto', fontSize: '1rem' }}>
          個人様・企業様問わずご依頼を受け付けております。<br />
          ご希望の用途や予算に合わせてお気軽にお見積もりフォームよりご相談ください。
        </p>
      </div>

      {/* 料金カード一覧 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        marginBottom: '3.5rem'
      }}>
        {items.map((item) => (
          <div 
            key={item.id} 
            className="glass-card" 
            style={{
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              border: item.recommended ? '2px solid var(--accent-purple)' : '1px solid var(--border-color)',
              background: item.recommended ? 'rgba(139, 92, 246, 0.08)' : 'var(--bg-card)'
            }}
          >
            {item.recommended && (
              <div style={{
                position: 'absolute',
                top: '-12px',
                right: '20px',
                background: 'var(--accent-gradient)',
                color: '#fff',
                fontSize: '0.75rem',
                fontWeight: '700',
                padding: '0.2rem 0.8rem',
                borderRadius: 'var(--radius-full)',
                boxShadow: 'var(--accent-glow)'
              }}>
                一番人気 ⭐
              </div>
            )}

            <h3 style={{ fontSize: '1.35rem', fontWeight: '700', marginBottom: '0.5rem' }}>
              {item.title}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem', minHeight: '40px' }}>
              {item.description}
            </p>

            <div style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--accent-cyan)', marginBottom: '1.5rem' }}>
              {item.price}
            </div>

            <ul style={{ listStyle: 'none', marginBottom: '2rem', flexGrow: 1 }}>
              {item.features && item.features.map((feat, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                  <CheckCircle2 size={16} color="var(--accent-purple)" />
                  {feat}
                </li>
              ))}
            </ul>

            <button 
              className={`btn ${item.recommended ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => onSelectPlan(item)}
              style={{ width: '100%' }}
            >
              <Send size={16} /> このプランで依頼・見積もり
            </button>
          </div>
        ))}
      </div>

      {/* オプション・ガイドライン */}
      <div className="glass-card" style={{ padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', marginBottom: '1rem' }}>
            <Clock size={20} color="var(--accent-pink)" /> 制作の流れ
          </h4>
          <ol style={{ paddingLeft: '1.2rem', color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.8' }}>
            <li><strong>お見積もり相談:</strong> フォームよりご希望内容を入力送信</li>
            <li><strong>ラフ案の確認:</strong> 構図・色味のご確認（修正対応）</li>
            <li><strong>完成・納品:</strong> 高解像度データにて納品いたします</li>
          </ol>
        </div>

        <div>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', marginBottom: '1rem' }}>
            <ShieldCheck size={20} color="var(--accent-purple)" /> ご依頼時の安心お約束
          </h4>
          <ul style={{ listStyle: 'none', color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.8' }}>
            <li>✅ 事前の無料お見積もりで追加料金の不安はありません</li>
            <li>✅ 納品データはセキュリティチェック済みです</li>
            <li>✅ 著作権譲渡・商用利用についても柔軟にご相談可能です</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
