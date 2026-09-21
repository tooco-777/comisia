import React, { useState } from 'react';
import { Calculator, CheckCircle2, Sparkles, Send, Shield } from 'lucide-react';

export default function PriceCalculator({ onProceedWithEstimate }) {
  const [useCase, setUseCase] = useState('personal');
  const [characterScope, setCharacterScope] = useState('bustup');
  const [options, setOptions] = useState({
    extraCharacter: false,
    detailedBackground: false,
    expressionPack: false,
    fastDelivery: false,
    psdLayers: false
  });

  const basePrices = { sd: 6000, bustup: 12000, half: 18000, full: 28000, kv: 42000 };
  const useCaseMultipliers = { personal: 1.0, streaming: 1.3, commercial: 1.8 };
  const optionPrices = { extraCharacter: 8000, detailedBackground: 7000, expressionPack: 3000, fastDelivery: 6000, psdLayers: 4000 };

  const calculateTotal = () => {
    let base = basePrices[characterScope] || 12000;
    let optionTotal = 0;
    if (options.extraCharacter) optionTotal += optionPrices.extraCharacter;
    if (options.detailedBackground) optionTotal += optionPrices.detailedBackground;
    if (options.expressionPack) optionTotal += optionPrices.expressionPack;
    if (options.fastDelivery) optionTotal += optionPrices.fastDelivery;
    if (options.psdLayers) optionTotal += optionPrices.psdLayers;

    return Math.round((base + optionTotal) * useCaseMultipliers[useCase]);
  };

  const totalEstimate = calculateTotal();

  const handleProceed = () => {
    const scopeNames = { sd: 'SDミニキャラ', bustup: 'バストアップ', half: '半身立ち絵', full: '全身立ち絵', kv: 'キービジュアル' };
    const useNames = { personal: '個人鑑賞用', streaming: 'SNS・配信・動画用', commercial: '完全商用利用' };

    onProceedWithEstimate({
      scope: scopeNames[characterScope],
      useCase: useNames[useCase],
      estimatedPrice: `￥${totalEstimate.toLocaleString()}`
    });
  };

  return (
    <div style={{ padding: '2rem 0' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem' }}>
          料金表 ＆ 概算お見積もりシミュレーター
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          ご希望の条件を選択するだけで、概算料金がその場でわかります。
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem', alignItems: 'start' }}>
        
        <div className="clean-card" style={{ padding: '2rem' }}>
          <div style={{ marginBottom: '1.75rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '0.85rem' }}>1. キャラクター描き込み範囲</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.6rem' }}>
              {[
                { id: 'sd', label: 'SDミニキャラ', price: '￥6,000〜' },
                { id: 'bustup', label: 'バストアップ', price: '￥12,000〜' },
                { id: 'half', label: '半身立ち絵', price: '￥18,000〜' },
                { id: 'full', label: '全身立ち絵', price: '￥28,000〜' },
                { id: 'kv', label: 'キービジュアル', price: '￥42,000〜' }
              ].map(item => (
                <div 
                  key={item.id}
                  onClick={() => setCharacterScope(item.id)}
                  style={{
                    padding: '0.85rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    border: characterScope === item.id ? '2px solid #6495ed' : '1px solid var(--border-color)',
                    background: characterScope === item.id ? 'rgba(100, 149, 237, 0.08)' : '#ffffff',
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>{item.label}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.price}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '1.75rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '0.85rem' }}>2. 利用用途</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.6rem' }}>
              {[
                { id: 'personal', label: '個人鑑賞用' },
                { id: 'streaming', label: 'SNS・配信・動画用' },
                { id: 'commercial', label: '完全商用利用' }
              ].map(item => (
                <div 
                  key={item.id}
                  onClick={() => setUseCase(item.id)}
                  style={{
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    border: useCase === item.id ? '2px solid #6495ed' : '1px solid var(--border-color)',
                    background: useCase === item.id ? 'rgba(100, 149, 237, 0.08)' : '#ffffff',
                    cursor: 'pointer',
                    textAlign: 'center',
                    fontWeight: '600',
                    fontSize: '0.85rem'
                  }}
                >
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '0.85rem' }}>3. カスタムオプション</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { id: 'extraCharacter', label: '人物1人追加 (+￥8,000)', key: 'extraCharacter' },
                { id: 'detailedBackground', label: '描き込み背景追加 (+￥7,000)', key: 'detailedBackground' },
                { id: 'expressionPack', label: '表情差分3種パック (+￥3,000)', key: 'expressionPack' },
                { id: 'fastDelivery', label: '早期仕上げ (+￥6,000)', key: 'fastDelivery' },
                { id: 'psdLayers', label: 'レイヤー分けPSD (+￥4,000)', key: 'psdLayers' }
              ].map(opt => (
                <label key={opt.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.65rem 0.85rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <span>{opt.label}</span>
                  <input 
                    type="checkbox" 
                    checked={options[opt.key]}
                    onChange={() => setOptions(prev => ({ ...prev, [opt.key]: !prev[opt.key] }))}
                  />
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="clean-card" style={{ padding: '2rem', background: '#ffffff' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '1.25rem' }}>
            概算お見積もり結果
          </h3>

          <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>概算制作費</div>
            <div style={{ fontSize: '2.4rem', fontWeight: '800', color: '#0f172a' }}>
              ￥{totalEstimate.toLocaleString()}
            </div>
          </div>

          <button className="btn btn-primary" onClick={handleProceed} style={{ width: '100%', padding: '0.9rem' }}>
            この内容で通常依頼フォームへ連携 <Send size={16} />
          </button>
        </div>

      </div>
    </div>
  );
}
