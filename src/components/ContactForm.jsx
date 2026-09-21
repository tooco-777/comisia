import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { sanitizeText, validateEmail } from '../utils/security';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { sendInquiryAutoReply } from '../utils/emailService';

export default function ContactForm({ onSuccess }) {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};

    if (!formData.name.trim()) errs.name = 'お名前を入力してください';
    if (!formData.email.trim() || !validateEmail(formData.email)) errs.email = '有効なメールアドレスを入力してください';
    if (!formData.message.trim()) errs.message = 'お問い合わせ内容を入力してください';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('inquiries').insert({
          name: sanitizeText(formData.name),
          email: formData.email,
          subject: sanitizeText(formData.subject),
          message: sanitizeText(formData.message)
        });

        if (error) {
          console.error('Supabase inquiry insert error:', error);
        }
      } catch (err) {
        console.error('Inquiry submit error:', err);
      }
    }

    // 自動返信メールの送信
    await sendInquiryAutoReply({
      name: formData.name,
      email: formData.email,
      subject: formData.subject,
      message: formData.message
    });

    setSubmitting(false);
    setSubmitted(true);
    if (onSuccess) onSuccess('お問い合わせを送信しました。');
  };

  if (submitted) {
    return (
      <div className="clean-card" style={{ padding: '3rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '2rem auto' }}>
        <CheckCircle2 size={48} color="#16a34a" style={{ margin: '0 auto 1rem auto' }} />
        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '0.5rem' }}>お問い合わせを送信しました</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>ご連絡いただきありがとうございます。</p>
        <button className="btn btn-primary" onClick={() => setSubmitted(false)}>別のお問い合わせを入力</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem 0', maxWidth: '680px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem' }}>お問い合わせフォーム</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>事前相談や各種ご質問はこちらからお送りください。</p>
      </div>

      <form onSubmit={handleSubmit} className="clean-card" style={{ padding: '2rem' }}>
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

        <div className="form-group">
          <label>件名</label>
          <input type="text" className="form-input" value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} placeholder="例: 制作のご相談について" />
        </div>

        <div className="form-group">
          <label>お問い合わせ内容 *</label>
          <textarea className="form-textarea" rows="5" value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} placeholder="具体的な内容をご記入ください"></textarea>
          {errors.message && <div className="form-error">{errors.message}</div>}
        </div>

        <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%', marginTop: '1rem', padding: '0.85rem' }}>
          {submitting ? '送信中...' : <><Send size={16} /> 送信する</>}
        </button>
      </form>
    </div>
  );
}
