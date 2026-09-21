import React, { useState, useEffect } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { sanitizeText, validateEmail } from '../utils/security';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export default function CommissionForm({ estimateSummary, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    planType: estimateSummary ? `${estimateSummary.scope} (${estimateSummary.estimatedPrice})` : 'バストアップ (￥12,000〜)',
    useCase: estimateSummary ? estimateSummary.useCase : 'SNS・配信・動画用',
    characterDetail: '',
    budget: estimateSummary ? estimateSummary.estimatedPrice : '',
    deadline: '',
    remarks: ''
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (estimateSummary) {
      setFormData(prev => ({
        ...prev,
        planType: `${estimateSummary.scope} (${estimateSummary.estimatedPrice})`,
        useCase: estimateSummary.useCase,
        budget: estimateSummary.estimatedPrice
      }));
    }
  }, [estimateSummary]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};

    if (!formData.name.trim()) errs.name = 'お名前を入力してください';
    if (!formData.email.trim() || !validateEmail(formData.email)) errs.email = '有効なメールアドレスを入力してください';
    if (!formData.characterDetail.trim()) errs.characterDetail = '依頼内容・キャラクター詳細を入力してください';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('commissions').insert({
          client_name: sanitizeText(formData.name),
          client_email: formData.email,
          plan_type: sanitizeText(formData.planType),
          use_case: sanitizeText(formData.useCase),
          character_detail: sanitizeText(formData.characterDetail),
          budget: sanitizeText(formData.budget),
          deadline: sanitizeText(formData.deadline),
          remarks: sanitizeText(formData.remarks)
        });

        if (error) {
          console.error('Supabase commission insert error:', error);
        }
      } catch (err) {
        console.error('Commission submit error:', err);
      }
    }

    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      if (onSuccess) onSuccess('通常依頼を受け付けました。');
    }, 600);
  };

  if (submitted) {
    return (
      <div className="clean-card" style={{ padding: '3rem 2rem', textAlign: 'center', maxWidth: '650px', margin: '2rem auto' }}>
        <CheckCircle2 size={48} color="#16a34a" style={{ margin: '0 auto 1rem auto' }} />
        <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '0.5rem' }}>通常依頼を受信いたしました</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>確認後、担当クリエイターよりご返信いたします。</p>
        <button className="btn btn-primary" onClick={() => setSubmitted(false)}>新しい依頼を入力する</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem 0', maxWidth: '750px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem' }}>通常イラスト依頼 受付フォーム</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>ご希望内容をご入力のうえ送信してください。</p>
      </div>

      <form onSubmit={handleSubmit} className="clean-card" style={{ padding: '2.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div className="form-group">
            <label>お名前 *</label>
            <input type="text" className="form-input" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="例: 山田 太郎" />
            {errors.name && <div className="form-error">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label>メールアドレス *</label>
            <input type="email" className="form-input" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="example@domain.com" />
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div className="form-group">
            <label>ご希望の制作範囲</label>
            <input type="text" className="form-input" value={formData.planType} onChange={(e) => setFormData({...formData, planType: e.target.value})} />
          </div>

          <div className="form-group">
            <label>主な利用用途</label>
            <input type="text" className="form-input" value={formData.useCase} onChange={(e) => setFormData({...formData, useCase: e.target.value})} />
          </div>
        </div>

        <div className="form-group">
          <label>キャラクター・構図詳細 *</label>
          <textarea className="form-textarea" rows="4" value={formData.characterDetail} onChange={(e) => setFormData({...formData, characterDetail: e.target.value})} placeholder="髪型、表情、ポーズ、背景のご希望など"></textarea>
          {errors.characterDetail && <div className="form-error">{errors.characterDetail}</div>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div className="form-group">
            <label>ご予算目安</label>
            <input type="text" className="form-input" value={formData.budget} onChange={(e) => setFormData({...formData, budget: e.target.value})} placeholder="例: 25,000円" />
          </div>

          <div className="form-group">
            <label>ご希望納期</label>
            <input type="text" className="form-input" value={formData.deadline} onChange={(e) => setFormData({...formData, deadline: e.target.value})} placeholder="例: 10月末日まで" />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%', marginTop: '1rem', padding: '0.85rem' }}>
          {submitting ? '送信中...' : <><Send size={16} /> 依頼フォームを送信する</>}
        </button>
      </form>
    </div>
  );
}
