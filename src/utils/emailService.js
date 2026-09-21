/**
 * Comisia メール送信ヘルパーユーティリティ
 */

// お問い合わせ自動返信メールの送信
export const sendInquiryAutoReply = async ({ name, email, subject, message }) => {
  const mailSubject = '【Comisia】お問い合わせを受け付けいたしました';
  const htmlContent = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <h2 style="color: #0f172a; font-size: 18px; margin-bottom: 16px;">${name} 様</h2>
      <p style="color: #334155; line-height: 1.6;">Comisia（コミシア）運営事務局でございます。<br>この度はお問い合わせいただき、誠にありがとうございます。</p>
      <p style="color: #334155; line-height: 1.6;">以下の内容でお問い合わせを受け付けいたしました。<br>内容を確認のうえ、担当者より順次ご返信させていただきます。</p>
      
      <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6495ed;">
        <p style="margin: 4px 0; font-size: 14px;"><strong>■ お名前：</strong> ${name} 様</p>
        <p style="margin: 4px 0; font-size: 14px;"><strong>■ 返信先メール：</strong> ${email}</p>
        <p style="margin: 4px 0; font-size: 14px;"><strong>■ 件名：</strong> ${subject || 'なし'}</p>
        <p style="margin: 12px 0 4px 0; font-size: 14px;"><strong>■ お問い合わせ内容：</strong></p>
        <p style="white-space: pre-wrap; font-size: 14px; color: #475569; margin: 0;">${message}</p>
      </div>

      <p style="font-size: 12px; color: #94a3b8; line-height: 1.5;">※本メールは送信専用アドレスより自動送信されています。</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
      <p style="font-size: 12px; color: #64748b; text-align: center; margin: 0;">
        <strong>Comisia（コミシア）運営事務局</strong><br>
        <a href="https://comisia.app" style="color: #6495ed; text-decoration: none;">https://comisia.app</a> | contact@comisia.app
      </p>
    </div>
  `;

  return sendViaResend({ to: email, subject: mailSubject, html: htmlContent });
};

// 通常依頼 受付完了自動返信メールの送信
export const sendCommissionAutoReply = async ({ name, email, planType, budget, deadline, characterDetail }) => {
  const mailSubject = '【Comisia】イラスト制作のご依頼を受け付けいたしました';
  const htmlContent = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <h2 style="color: #0f172a; font-size: 18px; margin-bottom: 16px;">${name} 様</h2>
      <p style="color: #334155; line-height: 1.6;">Comisia（コミシア）をご利用いただき、誠にありがとうございます。<br>イラスト制作のご依頼を受信いたしました。</p>
      <p style="color: #334155; line-height: 1.6;">ご送信いただいた内容を確認のうえ、クリエイターより折り返しご連絡を差し上げます。</p>

      <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #6495ed;">
        <p style="margin: 4px 0; font-size: 14px;"><strong>■ お名前：</strong> ${name} 様</p>
        <p style="margin: 4px 0; font-size: 14px;"><strong>■ プラン/範囲：</strong> ${planType}</p>
        <p style="margin: 4px 0; font-size: 14px;"><strong>■ ご予算目安：</strong> ${budget || '未指定'}</p>
        <p style="margin: 4px 0; font-size: 14px;"><strong>■ 希望納期：</strong> ${deadline || '未指定'}</p>
        <p style="margin: 12px 0 4px 0; font-size: 14px;"><strong>■ ご依頼詳細：</strong></p>
        <p style="white-space: pre-wrap; font-size: 14px; color: #475569; margin: 0;">${characterDetail}</p>
      </div>

      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
      <p style="font-size: 12px; color: #64748b; text-align: center; margin: 0;">
        <strong>Comisia（コミシア）運営事務局</strong><br>
        <a href="https://comisia.app" style="color: #6495ed; text-decoration: none;">https://comisia.app</a> | contact@comisia.app
      </p>
    </div>
  `;

  return sendViaResend({ to: email, subject: mailSubject, html: htmlContent });
};

// Resend API 送信処理 (VITE_RESEND_API_KEY が設定されていれば実際に送信、無ければログ記録)
const sendViaResend = async ({ to, subject, html }) => {
  const resendApiKey = import.meta.env.VITE_RESEND_API_KEY;

  if (resendApiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`
        },
        body: JSON.stringify({
          from: 'Comisia <noreply@comisia.app>',
          to: [to],
          subject,
          html
        })
      });
      return res.ok;
    } catch (e) {
      console.error('Resend API send error:', e);
      return false;
    }
  }

  console.log('📧 自動返信メールをシミュレート（環境変数 VITE_RESEND_API_KEY が設定されていません）:', { to, subject });
  return true;
};
