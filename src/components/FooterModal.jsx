import React from 'react';
import { X, ShieldCheck, HelpCircle, Info, FileText, Code, Mail } from 'lucide-react';

export default function FooterModal({ modalType, onClose, onOpenContact }) {
  if (!modalType) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 1200 }}>
      <div className="clean-card" style={{ maxWidth: '680px', width: '100%', maxHeight: '88vh', overflowY: 'auto', padding: '2.25rem', position: 'relative' }}>
        
        {/* 閉じるボタン */}
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '18px', right: '18px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        {/* 1. Comisiaとは？ */}
        {modalType === 'about' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
              <Info size={24} color="#6495ed" />
              <h2 style={{ fontSize: '1.6rem', fontWeight: '800' }}>Comisia (コミシア) とは？</h2>
            </div>

            <p style={{ lineHeight: '1.7', color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              Comisia は、イラストレーター・デザイナーのための<strong>「料金表公開」「通常依頼受付」「アドプトモデル（キャラ販売）募集」</strong>をひとつの公開ページにまとめて運用できるポートフォリオ＆依頼受付プラットフォームです。
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.3rem' }}>1. 透明性の高いお見積もり計算機</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>描写範囲や利用用途を選ぶだけで概算制作費がリアルタイム算出されます。</p>
              </div>

              <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.3rem' }}>2. アドプトモデル（キャラ販売）管理</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>一点ものオリジナルキャラクターの募集ステータスやお迎え申請を管理できます。</p>
              </div>

              <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '0.3rem' }}>3. 無料で簡単スタート</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>アカウントを作成するだけで、自分だけの公開プロフィールページが完成します。</p>
              </div>
            </div>
          </div>
        )}

        {/* 2. よくある質問 (FAQ) */}
        {modalType === 'faq' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
              <HelpCircle size={24} color="#6495ed" />
              <h2 style={{ fontSize: '1.6rem', fontWeight: '800' }}>よくある質問 (FAQ)</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                  Q. サービスの利用料金はかかりますか？
                </h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  A. いいえ、Comisia のプラットフォーム利用料・会員登録費は完全無料です。
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                  Q. イラストのご依頼やお支払いはどうすればいいですか？
                </h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  A. 公開ページの依頼フォーム・お迎え申請フォームより送信後、クリエイターより折り返しご連絡とお手続きのご案内が送られます。
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                  Q. 商用利用や二次創作の権利はどうなりますか？
                </h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  A. 各クリエイターの料金表およびアドプトモデル詳細ページに記載されている利用規約・説明に従ってご利用いただけます。
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 3. 開発者 */}
        {modalType === 'developer' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
              <Code size={24} color="#6495ed" />
              <h2 style={{ fontSize: '1.6rem', fontWeight: '800' }}>開発者情報 (Developer)</h2>
            </div>

            <p style={{ lineHeight: '1.7', color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              Comisia は、個人イラストレーター様やクリエイターの皆様が、より円滑で安心な依頼受付・作品公開を行える環境を目指して個人開発・提供されているプラットフォームです。
            </p>

            <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}>
              <div style={{ fontWeight: '700', marginBottom: '0.4rem' }}>開発・運営理念</div>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                「複雑な手続きをシンプルに、クリエイターの価値を正しく届ける」をビジョンとしています。ご要望や不具合報告などございましたら、お問い合わせフォームよりお気軽にお寄せください。
              </p>
            </div>
          </div>
        )}

        {/* 4. 利用規約 ＆ 免責事項 */}
        {modalType === 'terms' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
              <FileText size={24} color="#6495ed" />
              <h2 style={{ fontSize: '1.6rem', fontWeight: '800' }}>利用規約 ＆ 免責規定</h2>
            </div>

            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.7', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.2rem' }}>第1条（目的と本サービスの性質）</h4>
                <p>Comisia（以下「本サービス」）は、クリエイターと依頼主のやり取りを円滑にする場を提供する無料プラットフォームです。運営者はユーザーから直接の金銭・対価を受領しないため、特定商取引法に基づく表示義務の対象外となります。</p>
              </div>

              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.2rem' }}>第2条（当事者間取引および免責）</h4>
                <p>本サービスを通じて行われるイラスト依頼、金銭支払、データの納品、著作権交渉等は、すべて依頼主とクリエイター間の当事者直接取引となります。当事者間で発生したトラブル等について、運営者は一切の法的責任を負いかねます。</p>
              </div>

              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.2rem' }}>第3条（個人情報の取り扱い）</h4>
                <p>登録時に取得したメールアドレス等の個人情報は、アカウント認証および連絡目的のみに使用し、法令に基づく場合を除き第三者に提供いたしません。</p>
              </div>
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <button className="btn btn-secondary" onClick={onClose}>
            閉じる
          </button>
        </div>

      </div>
    </div>
  );
}
