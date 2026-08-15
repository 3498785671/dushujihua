/**
 * 独属计划 - 后端服务入口（零第三方依赖）
 * 使用 Node 内置 http + crypto + sqlite，实现 REST API + 认证 + 静态托管
 * 运行：node index.js
 */

import http from 'node:http';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { db } from './db.js';
import { makeSalt, hashPassword, verifyPassword, signToken, authFromRequest } from './auth.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;

// ==================== 工具函数 ====================

function send(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error('请求体过大'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('无效的 JSON'));
      }
    });
    req.on('error', reject);
  });
}

// ==================== 行映射（snake_case → camelCase） ====================

function mapTask(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    status: row.status,
    priority: row.priority,
    dueDate: row.due_date ?? undefined,
    tags: JSON.parse(row.tags || '[]'),
    planId: row.plan_id ?? undefined,
    order: row.order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at ?? undefined,
  };
}

function mapPlan(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    type: row.type,
    startDate: row.start_date ?? undefined,
    endDate: row.end_date ?? undefined,
    priority: row.priority,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapTag(row) {
  return { id: row.id, name: row.name, color: row.color, createdAt: row.created_at };
}

function mapRecord(row) {
  return {
    id: row.id,
    date: row.date,
    notes: row.notes,
    mood: row.mood ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const n = (v) => (v === undefined || v === null || v === '' ? null : v);

// ==================== 认证辅助 ====================

function requireAuth(req, res) {
  const user = authFromRequest(req);
  if (!user) {
    send(res, 401, { error: '未登录或登录已过期' });
    return null;
  }
  return user;
}

// ==================== 路由 ====================

const routes = [];

function route(method, pattern, handler) {
  const keys = [];
  const regex = new RegExp(
    '^' + pattern.replace(/:[^/]+/g, (m) => { keys.push(m.slice(1)); return '([^/]+)'; }) + '$'
  );
  routes.push({ method, regex, keys, handler });
}

function matchRoute(method, pathname) {
  for (const r of routes) {
    if (r.method !== method) continue;
    const m = pathname.match(r.regex);
    if (m) {
      const params = {};
      r.keys.forEach((k, i) => { params[k] = decodeURIComponent(m[i + 1]); });
      return { handler: r.handler, params };
    }
  }
  return null;
}

// ==================== 认证接口 ====================

route('POST', '/api/auth/register', async (req, res, params, body) => {
  const name = String(body?.username || '').trim();
  const password = body?.password || '';
  if (!name || name.length < 2 || name.length > 20) {
    return send(res, 400, { error: '用户名需 2-20 个字符' });
  }
  if (!/^[\w\u4e00-\u9fa5-]+$/.test(name)) {
    return send(res, 400, { error: '用户名只能包含中文、字母、数字、下划线或连字符' });
  }
  if (!password || password.length < 6 || password.length > 64) {
    return send(res, 400, { error: '密码需 6-64 位' });
  }
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(name);
  if (existing) return send(res, 409, { error: '用户名已被占用' });

  const id = crypto.randomUUID();
  const salt = makeSalt();
  const hash = hashPassword(password, salt);
  db.prepare('INSERT INTO users (id, username, password_hash, salt, created_at) VALUES (?, ?, ?, ?, ?)').run(
    id, name, hash, salt, new Date().toISOString()
  );

  // 预置默认标签
  const insertTag = db.prepare('INSERT INTO tags (id, user_id, name, color, created_at) VALUES (?, ?, ?, ?, ?)');
  const ts = new Date().toISOString();
  for (const tag of [
    { name: '工作', color: '#3b82f6' },
    { name: '生活', color: '#22c55e' },
    { name: '学习', color: '#8b5cf6' },
    { name: '健康', color: '#ef4444' },
  ]) {
    insertTag.run(crypto.randomUUID(), id, tag.name, tag.color, ts);
  }

  send(res, 201, { token: signToken({ id, username: name }), user: { id, username: name } });
});

route('POST', '/api/auth/login', async (req, res, params, body) => {
  const name = String(body?.username || '').trim();
  const password = body?.password || '';
  if (!name || !password) return send(res, 400, { error: '请输入用户名和密码' });
  const row = db.prepare('SELECT * FROM users WHERE username = ?').get(name);
  if (!row || !verifyPassword(password, row.salt, row.password_hash)) {
    return send(res, 401, { error: '用户名或密码错误' });
  }
  send(res, 200, { token: signToken({ id: row.id, username: row.username }), user: { id: row.id, username: row.username } });
});

route('GET', '/api/auth/me', async (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const row = db.prepare('SELECT id, username FROM users WHERE id = ?').get(user.id);
  if (!row) return send(res, 401, { error: '用户不存在' });
  send(res, 200, { user: row });
});

// ==================== 全量数据 ====================

route('GET', '/api/data', async (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const uid = user.id;
  send(res, 200, {
    tasks: db.prepare('SELECT * FROM tasks WHERE user_id = ? ORDER BY "order" DESC').all(uid).map(mapTask),
    plans: db.prepare('SELECT * FROM plans WHERE user_id = ? ORDER BY updated_at DESC').all(uid).map(mapPlan),
    tags: db.prepare('SELECT * FROM tags WHERE user_id = ? ORDER BY created_at ASC').all(uid).map(mapTag),
    dailyRecords: db.prepare('SELECT * FROM daily_records WHERE user_id = ?').all(uid).map(mapRecord),
  });
});

// ==================== 任务 ====================

route('GET', '/api/tasks', async (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const rows = db.prepare('SELECT * FROM tasks WHERE user_id = ? ORDER BY "order" DESC').all(user.id);
  send(res, 200, rows.map(mapTask));
});

route('POST', '/api/tasks', async (req, res, params, body) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const t = body || {};
  if (!t.title || !String(t.title).trim()) return send(res, 400, { error: '任务标题不能为空' });
  const id = t.id || crypto.randomUUID();
  const now = new Date().toISOString();
  const finalStatus = t.status || 'todo';
  const completedAt = finalStatus === 'done' ? (t.completedAt || now) : null;
  db.prepare(
    `INSERT INTO tasks (id, user_id, title, description, status, priority, due_date, tags, plan_id, "order", created_at, updated_at, completed_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id, user.id, String(t.title).trim(), n(t.description), finalStatus, t.priority || 'medium',
    n(t.dueDate), JSON.stringify(Array.isArray(t.tags) ? t.tags : []), n(t.planId),
    typeof t.order === 'number' ? t.order : Date.now(), t.createdAt || now, now, completedAt
  );
  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  send(res, 201, mapTask(row));
});

route('PUT', '/api/tasks/:id', async (req, res, params, body) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?').get(params.id, user.id);
  if (!existing) return send(res, 404, { error: '任务不存在' });
  const t = body || {};
  const now = new Date().toISOString();
  const finalStatus = t.status !== undefined ? t.status : existing.status;
  let completedAt;
  if (t.completedAt !== undefined) {
    completedAt = t.completedAt === null ? null : t.completedAt;
  } else if (finalStatus === 'done') {
    completedAt = existing.completed_at || now;
  } else {
    completedAt = null;
  }
  db.prepare(
    `UPDATE tasks SET title=?, description=?, status=?, priority=?, due_date=?, tags=?, plan_id=?, updated_at=?, completed_at=? WHERE id=?`
  ).run(
    t.title !== undefined ? String(t.title).trim() : existing.title,
    t.description !== undefined ? n(t.description) : existing.description,
    finalStatus,
    t.priority !== undefined ? t.priority : existing.priority,
    t.dueDate !== undefined ? n(t.dueDate) : existing.due_date,
    t.tags !== undefined ? JSON.stringify(Array.isArray(t.tags) ? t.tags : []) : existing.tags,
    t.planId !== undefined ? n(t.planId) : existing.plan_id,
    now,
    completedAt,
    params.id
  );
  const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(params.id);
  send(res, 200, mapTask(row));
});

route('DELETE', '/api/tasks/:id', async (req, res, params) => {
  const user = requireAuth(req, res);
  if (!user) return;
  db.prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?').run(params.id, user.id);
  send(res, 200, { ok: true });
});

// ==================== 计划 ====================

route('GET', '/api/plans', async (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const rows = db.prepare('SELECT * FROM plans WHERE user_id = ? ORDER BY updated_at DESC').all(user.id);
  send(res, 200, rows.map(mapPlan));
});

route('POST', '/api/plans', async (req, res, params, body) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const p = body || {};
  if (!p.title || !String(p.title).trim()) return send(res, 400, { error: '计划标题不能为空' });
  const id = p.id || crypto.randomUUID();
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO plans (id, user_id, title, description, type, start_date, end_date, priority, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id, user.id, String(p.title).trim(), n(p.description), p.type || 'shortTerm',
    n(p.startDate), n(p.endDate), p.priority || 'medium', p.status || 'active', p.createdAt || now, now
  );
  const row = db.prepare('SELECT * FROM plans WHERE id = ?').get(id);
  send(res, 201, mapPlan(row));
});

route('PUT', '/api/plans/:id', async (req, res, params, body) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const existing = db.prepare('SELECT * FROM plans WHERE id = ? AND user_id = ?').get(params.id, user.id);
  if (!existing) return send(res, 404, { error: '计划不存在' });
  const p = body || {};
  const now = new Date().toISOString();
  db.prepare(
    `UPDATE plans SET title=?, description=?, type=?, start_date=?, end_date=?, priority=?, status=?, updated_at=? WHERE id=?`
  ).run(
    p.title !== undefined ? String(p.title).trim() : existing.title,
    p.description !== undefined ? n(p.description) : existing.description,
    p.type !== undefined ? p.type : existing.type,
    p.startDate !== undefined ? n(p.startDate) : existing.start_date,
    p.endDate !== undefined ? n(p.endDate) : existing.end_date,
    p.priority !== undefined ? p.priority : existing.priority,
    p.status !== undefined ? p.status : existing.status,
    now,
    params.id
  );
  const row = db.prepare('SELECT * FROM plans WHERE id = ?').get(params.id);
  send(res, 200, mapPlan(row));
});

route('DELETE', '/api/plans/:id', async (req, res, params) => {
  const user = requireAuth(req, res);
  if (!user) return;
  db.prepare('UPDATE tasks SET plan_id = NULL WHERE plan_id = ? AND user_id = ?').run(params.id, user.id);
  db.prepare('DELETE FROM plans WHERE id = ? AND user_id = ?').run(params.id, user.id);
  send(res, 200, { ok: true });
});

// ==================== 标签 ====================

route('GET', '/api/tags', async (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const rows = db.prepare('SELECT * FROM tags WHERE user_id = ? ORDER BY created_at ASC').all(user.id);
  send(res, 200, rows.map(mapTag));
});

route('POST', '/api/tags', async (req, res, params, body) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const t = body || {};
  const name = String(t.name || '').trim();
  if (!name) return send(res, 400, { error: '标签名称不能为空' });
  const dup = db.prepare('SELECT id FROM tags WHERE user_id = ? AND name = ?').get(user.id, name);
  if (dup) return send(res, 409, { error: '标签名称已存在' });
  const id = t.id || crypto.randomUUID();
  db.prepare('INSERT INTO tags (id, user_id, name, color, created_at) VALUES (?, ?, ?, ?, ?)').run(
    id, user.id, name, t.color || '#6366f1', t.createdAt || new Date().toISOString()
  );
  const row = db.prepare('SELECT * FROM tags WHERE id = ?').get(id);
  send(res, 201, mapTag(row));
});

route('PUT', '/api/tags/:id', async (req, res, params, body) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const existing = db.prepare('SELECT * FROM tags WHERE id = ? AND user_id = ?').get(params.id, user.id);
  if (!existing) return send(res, 404, { error: '标签不存在' });
  const t = body || {};
  const name = t.name !== undefined ? String(t.name).trim() : existing.name;
  if (t.name !== undefined) {
    const dup = db.prepare('SELECT id FROM tags WHERE user_id = ? AND name = ? AND id != ?').get(user.id, name, params.id);
    if (dup) return send(res, 409, { error: '标签名称已存在' });
  }
  db.prepare('UPDATE tags SET name=?, color=? WHERE id=?').run(
    name, t.color !== undefined ? t.color : existing.color, params.id
  );
  const row = db.prepare('SELECT * FROM tags WHERE id = ?').get(params.id);
  send(res, 200, mapTag(row));
});

route('DELETE', '/api/tags/:id', async (req, res, params) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const tasks = db.prepare('SELECT id, tags FROM tasks WHERE user_id = ?').all(user.id);
  for (const task of tasks) {
    const tags = JSON.parse(task.tags || '[]');
    if (tags.includes(params.id)) {
      db.prepare('UPDATE tasks SET tags = ? WHERE id = ?').run(
        JSON.stringify(tags.filter((id) => id !== params.id)), task.id
      );
    }
  }
  db.prepare('DELETE FROM tags WHERE id = ? AND user_id = ?').run(params.id, user.id);
  send(res, 200, { ok: true });
});

// ==================== 每日记录 ====================

route('GET', '/api/records', async (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const rows = db.prepare('SELECT * FROM daily_records WHERE user_id = ?').all(user.id);
  send(res, 200, rows.map(mapRecord));
});

route('POST', '/api/records', async (req, res, params, body) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const r = body || {};
  if (!r.date) return send(res, 400, { error: '日期不能为空' });
  const id = r.id || crypto.randomUUID();
  const now = new Date().toISOString();
  db.prepare(
    'INSERT INTO daily_records (id, user_id, date, notes, mood, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(id, user.id, r.date, r.notes || '', n(r.mood), r.createdAt || now, now);
  const row = db.prepare('SELECT * FROM daily_records WHERE id = ?').get(id);
  send(res, 201, mapRecord(row));
});

route('PUT', '/api/records/:id', async (req, res, params, body) => {
  const user = requireAuth(req, res);
  if (!user) return;
  const existing = db.prepare('SELECT * FROM daily_records WHERE id = ? AND user_id = ?').get(params.id, user.id);
  if (!existing) return send(res, 404, { error: '记录不存在' });
  const r = body || {};
  const now = new Date().toISOString();
  db.prepare('UPDATE daily_records SET notes=?, mood=?, updated_at=? WHERE id=?').run(
    r.notes !== undefined ? r.notes : existing.notes,
    r.mood !== undefined ? n(r.mood) : existing.mood,
    now,
    params.id
  );
  const row = db.prepare('SELECT * FROM daily_records WHERE id = ?').get(params.id);
  send(res, 200, mapRecord(row));
});

route('DELETE', '/api/records/:id', async (req, res, params) => {
  const user = requireAuth(req, res);
  if (!user) return;
  db.prepare('DELETE FROM daily_records WHERE id = ? AND user_id = ?').run(params.id, user.id);
  send(res, 200, { ok: true });
});

// ==================== 健康检查 ====================

route('GET', '/api/health', async (req, res) => {
  send(res, 200, { ok: true, name: 'dushu-plan-server', time: new Date().toISOString() });
});

// ==================== 静态资源托管 ====================

const distDir = path.join(__dirname, '..', 'dist');
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json',
};

function serveStatic(req, res, pathname) {
  if (!fs.existsSync(distDir)) {
    send(res, 200, { ok: true, name: 'dushu-plan-server', note: '前端尚未构建，请先运行 npm run build' });
    return;
  }
  let filePath = path.join(distDir, pathname === '/' ? 'index.html' : pathname);
  // 防止路径穿越
  if (!filePath.startsWith(distDir)) {
    filePath = path.join(distDir, 'index.html');
  }
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(distDir, 'index.html'); // SPA 回退
  }
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
}

// ==================== 服务入口 ====================

const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  let pathname;
  try {
    pathname = new URL(req.url, 'http://localhost').pathname;
  } catch {
    return send(res, 400, { error: '无效的请求路径' });
  }

  // API 路由
  const matched = matchRoute(req.method, pathname);
  if (matched) {
    try {
      const body = req.method === 'GET' || req.method === 'DELETE' ? {} : await readBody(req);
      await matched.handler(req, res, matched.params, body);
    } catch (err) {
      console.error('[server error]', err);
      send(res, 500, { error: '服务器内部错误' });
    }
    return;
  }

  // 静态资源
  if (req.method === 'GET') {
    serveStatic(req, res, pathname);
  } else {
    send(res, 404, { error: '接口不存在' });
  }
});

server.on('clientError', (err, socket) => {
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

server.listen(PORT, () => {
  console.log(`独属计划后端已启动: http://localhost:${PORT}`);
});
