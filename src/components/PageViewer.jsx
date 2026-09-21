import React, { useState } from 'react';
import { Info, HelpCircle, Code, FileText, Mail, Send, CheckCircle2, ArrowLeft } from 'lucide-react';
import { sanitizeText, validateEmail } from '../utils/security';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export default function PageViewer({ pageType, onGoBack }) {
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    const errs = {};

    if (!contactForm.name.trim()) errs.name = 'お名前を入力してください';
    if (!contactForm.email.trim() || !validateEmail(contactForm.email)) errs.email = '有効なメールアドレスを入力してください';
    if (!contactForm.message.trim()) errs.message = 'お問い合わせ内容を入力してください';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('inquiries').insert({
          name: sanitizeText(contactForm.name),
          email: contactForm.email,
          subject: sanitizeText(contactForm.subject),
          message: sanitizeText(contactForm.message)
        });
      } catch (err) {
        console.error('Supabase admin inquiry insert error:', err);
      }
    }

    setSubmitted(true);
  };

  return (
    <div style={{ padding: '3rem 0 5rem 0', minHeight: '70vh' }}>
      <div className="container" style={{ maxWidth: '850px' }}>
        
        {/* 戻るボタン */}
        <button 
          className="btn btn-secondary" 
          onClick={onGoBack} 
          style={{ marginBottom: '2rem', fontSize: '0.85rem' }}
        >
          <ArrowLeft size={16} /> トップページへ戻る
        </button>

        <div className="clean-card" style={{ padding: '3rem' }}>

          {/* 1. Comisiaとは？ ページ */}
          {pageType === 'about' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <Info size={28} color="#6495ed" />
                <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Comisia (コミシア) とは？</h1>
              </div>

              <p style={{ lineHeight: '1.8', color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1rem' }}>
                Comisia は、イラストレーター・デザイナーのための<strong>「料金表公開」「通常依頼受付」「アドプトモデル（キャラ販売）募集」</strong>をひとつの公開ページにまとめて運用できるポータル＆依頼受付プラットフォームです。
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
                <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-sm)' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '0.4rem' }}>1. 透明性の高い概算お見積もり計算機</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>描写範囲や利用用途を選ぶだけで概算制作費がリアルタイム算出される、分かりやすい料金表機能です。</p>
                </div>

                <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-sm)' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '0.4rem' }}>2. アドプトモデル（キャラ販売）管理</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>一点ものオリジナルキャラクターの募集ステータス管理やお迎え（購入）申請を安全に受付できます。</p>
                </div>

                <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-sm)' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '0.4rem' }}>3. 無料で簡単スタート</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>アカウントを作成するだけで、自分だけの公開プロフィールページがすぐに完成します。</p>
                </div>
              </div>
            </div>
          )}

          {/* 2. よくある質問 (FAQ) ページ */}
          {pageType === 'faq' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <HelpCircle size={28} color="#6495ed" />
                <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>よくある質問 (FAQ)</h1>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                    Q. サービスの利用料金はかかりますか？
                  </h3>
                  <p style={{ fontSize: '0.925rem', color: 'var(--text-muted)', lineHeight: '1.7' }}>
                    A. いいえ、Comisia のプラットフォーム利用料・会員登録費は完全無料です。
                  </p>
                </div>

                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                    Q. イラストのご依頼やお支払いはどうすればいいですか？
                  </h3>
                  <p style={{ fontSize: '0.925rem', color: 'var(--text-muted)', lineHeight: '1.7' }}>
                    A. 各クリエイターの公開ページの依頼フォーム・お迎え申請フォームより送信後、クリエイターより折り返しご連絡とお手続きのご案内が送られます。
                  </p>
                </div>

                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                    Q. 商用利用や二次創作の権利はどうなりますか？
                  </h3>
                  <p style={{ fontSize: '0.925rem', color: 'var(--text-muted)', lineHeight: '1.7' }}>
                    A. 各クリエイターの料金表およびアドプトモデル詳細ページに記載されている利用規約・説明に従ってご利用いただけます。
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 3. 開発者 ページ */}
          {pageType === 'developer' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <Code size={28} color="#6495ed" />
                <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>開発者情報 (Developer)</h1>
              </div>

              <p style={{ lineHeight: '1.8', color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1rem' }}>
                Comisia は、個人イラストレーター様やクリエイターの皆様が、より円滑で安心な依頼受付・作品公開を行える環境を目指して個人開発・提供されているプラットフォームです。
              </p>

              <div style={{ background: 'var(--bg-subtle)', padding: '1.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.95rem' }}>
                <h3 style={{ fontWeight: '700', marginBottom: '0.5rem' }}>開発・運営理念</h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.7' }}>
                  「複雑な手続きをシンプルに、クリエイターの価値を正しく届ける」をビジョンとしています。ご要望や不具合報告などございましたら、お問い合わせフォームよりお気軽にお寄せください。
                </p>
              </div>
            </div>
          )}

          {/* 4. 利用規約 ページ (後で再設定可能) */}
          {pageType === 'terms' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <FileText size={28} color="#6495ed" />
                <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>利用規約 ＆ 免責規定</h1>
              </div>

              <div style={{ fontSize: '0.925rem', color: 'var(--text-muted)', lineHeight: '1.8', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.3rem' }}>第1条（目的と本サービスの性質）</h3>
                  <p>Comisia（以下「本サービス」）は、クリエイターと依頼主のやり取りを円滑にする場を提供する無料プラットフォームです。運営者はユーザーから直接の金銭・対価を受領しないため、特定商取引法に基づく表示義務の対象外となります。</p>
                </div>

                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.3rem' }}>第2条（当事者間取引および免責）</h3>
                  <p>本サービスを通じて行われるイラスト依頼、金銭支払、データの納品、著作権交渉等は、すべて依頼主とクリエイター間の当事者直接取引となります。当事者間で発生したトラブル等について、運営者は一切の法的責任を負いかねます。</p>
                </div>

                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.3rem' }}>第3条（個人情報の取り扱い）</h3>
                  <p>登録時に取得したメールアドレス等の個人情報は、アカウント認証および連絡目的のみに使用し、法令に基づく場合を除き第三者に提供いたしません。</p>
                </div>
              </div>
            </div>
          )}

          {/* 5. 運営お問い合わせ（開発者側へのお問い合わせ）ページ */}
          {pageType === 'contact' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <Mail size={28} color="#6495ed" />
                <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Comisia 運営事務局へのお問い合わせ</h1>
              </div>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '2rem' }}>
                本プラットフォーム（Comisia）の開発者・運営事務局へのお問い合わせフォームです。サービスに関するご質問やご要望、不具合報告などはこちらから送信してください。
              </p>

              {submitted ? (
                <div style={{ textAlign: 'center', padding: '3rem 0', color: '#16a34a' }}>
                  <CheckCircle2 size={52} style={{ margin: '0 auto 1rem auto' }} />
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>運営事務局へ送信いたしました</h2>
                  <p style={{ color: 'var(--text-muted)' }}>ご連絡いただきありがとうございます。内容を確認のうえ折り返しご連絡いたします。</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit}>
                  <div className="form-group">
                    <label>お名前 *</label>
                    <input type="text" className="form-input" value={contactForm.name} onChange={(e) => setContactForm({...contactForm, name: e.target.value})} placeholder="例: 山田 太郎" />
                    {errors.name && <div className="form-error">{errors.name}</div>}
                  </div>

                  <div className="form-group">
                    <label>メールアドレス *</label>
                    <input type="email" className="form-input" value={contactForm.email} onChange={(e) => setContactForm({...contactForm, email: e.target.value})} placeholder="example@domain.com" />
                    {errors.email && <div className="form-error">{errors.email}</div>}
                  </div>

                  <div className="form-group">
                    <label>件名</label>
                    <input type="text" className="form-input" value={contactForm.subject} onChange={(e) => setContactForm({...contactForm, subject: e.target.value})} placeholder="例: サービス機能のご要望について" />
                  </div>

                  <div className="form-group">
                    <label>お問い合わせ内容 *</label>
                    <textarea className="form-textarea" rows="6" value={contactForm.message} onChange={(e) => setContactForm({...contactForm, message: e.target.value})} placeholder="具体的にご記入ください"></textarea>
                    {errors.message && <div className="form-error">{errors.message}</div>}
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.9rem' }}>
                    <Send size={16} /> 運営事務局へ送信する
                  </button>
                </form>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
