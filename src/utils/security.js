/**
 * 本格セキュア認証 & セキュリティユーティリティ
 */

// 1. パスワード強度判定 (Password Strength Checker)
export const checkPasswordStrength = (password) => {
  let score = 0;
  const checks = {
    length: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password)
  };

  if (checks.length) score += 1;
  if (checks.hasUpper && checks.hasLower) score += 1;
  if (checks.hasNumber) score += 1;
  if (checks.hasSpecial) score += 1;

  let label = '未入力';
  let color = '#64748b';

  if (password.length > 0) {
    if (score <= 1) {
      label = '脆弱 (8文字以上で大・小文字・数字を含めてください)';
      color = '#ef4444';
    } else if (score === 2) {
      label = '普通 (記号などを追加すると強固になります)';
      color = '#f59e0b';
    } else if (score === 3) {
      label = '強固';
      color = '#10b981';
    } else {
      label = '非常に強固';
      color = '#06b6d4';
    }
  }

  return { score, checks, label, color, isValid: score >= 2 && checks.length };
};

// 2. Web Crypto API を利用したパスワードハッシュ化 (SHA-256)
export const hashPassword = async (password, salt = 'v_adopt_salt_2026') => {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + salt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    console.error('Crypto hashing fallback', e);
    return btoa(password + salt);
  }
};

// 3. 2段階認証用の6桁ワンタイム検証コード生成 (2FA Verification Code)
export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// 4. 厳格なXSS・スクリプトエスケープ (DOM Sanitization)
export const sanitizeText = (text) => {
  if (typeof text !== 'string') return text;
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\//g, '&#x2F;');
};

export const validateEmail = (email) => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(String(email).toLowerCase());
};

// 5. アカウントロックアウト管理 (連続失敗時の防護機能)
const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME_MS = 30000; // 30秒間ロックアウト

export const checkLockoutStatus = (email) => {
  try {
    const data = JSON.parse(localStorage.getItem(`lockout_${email}`) || '{}');
    if (data.lockedUntil && Date.now() < data.lockedUntil) {
      const remainingSec = Math.ceil((data.lockedUntil - Date.now()) / 1000);
      return { isLocked: true, remainingSec };
    }
  } catch (e) {}
  return { isLocked: false, remainingSec: 0 };
};

export const recordFailedAttempt = (email) => {
  try {
    const data = JSON.parse(localStorage.getItem(`lockout_${email}`) || '{"attempts": 0}');
    data.attempts = (data.attempts || 0) + 1;
    if (data.attempts >= MAX_ATTEMPTS) {
      data.lockedUntil = Date.now() + LOCKOUT_TIME_MS;
      data.attempts = 0;
    }
    localStorage.setItem(`lockout_${email}`, JSON.stringify(data));
    return data.attempts;
  } catch (e) {
    return 1;
  }
};

export const resetFailedAttempts = (email) => {
  try {
    localStorage.removeItem(`lockout_${email}`);
  } catch (e) {}
};
