/**
 * 认证工具：密码哈希（scrypt）、JWT 签发与校验（HMAC-SHA256）
 * 仅依赖 Node 内置 crypto，零第三方依赖
 */

import crypto from 'node:crypto';

// 生产环境务必通过环境变量 JWT_SECRET 设置强随机密钥
const JWT_SECRET = process.env.JWT_SECRET || 'dushu-plan-dev-secret-change-me-in-production';

/** 生成随机盐 */
export function makeSalt() {
  return crypto.randomBytes(16).toString('hex');
}

/** 用 scrypt 哈希密码 */
export function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

/** 校验密码（恒时比较，防时序攻击） */
export function verifyPassword(password, salt, expectedHash) {
  const hash = hashPassword(password, salt);
  const a = Buffer.from(hash, 'hex');
  const b = Buffer.from(expectedHash, 'hex');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// ==================== JWT（HMAC-SHA256） ====================

const b64url = (str) => Buffer.from(str).toString('base64url');
const fromB64url = (str) => Buffer.from(str, 'base64url').toString('utf8');

const TOKEN_TTL = 30 * 24 * 60 * 60; // 30 天

/** 签发 JWT */
export function signToken(user) {
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const payload = b64url(
    JSON.stringify({ id: user.id, username: user.username, iat: now, exp: now + TOKEN_TTL })
  );
  const sig = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url');
  return `${header}.${payload}.${sig}`;
}

/** 校验 JWT，返回 payload（失败抛错） */
export function verifyToken(token) {
  const parts = String(token).split('.');
  if (parts.length !== 3) throw new Error('无效的 token');
  const [header, payload, sig] = parts;
  const expected = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    throw new Error('token 签名无效');
  }
  const data = JSON.parse(fromB64url(payload));
  if (data.exp && Date.now() / 1000 > data.exp) {
    throw new Error('token 已过期');
  }
  return data;
}

/** 从请求头解析并校验用户，失败返回 null */
export function authFromRequest(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return null;
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}
