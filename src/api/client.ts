/**
 * API 客户端
 * 统一封装对后端的请求、鉴权与错误处理
 *
 * 后端地址通过 VITE_API_URL 配置：
 * - 开发环境：留空（走 Vite 代理 /api → localhost:3001）
 * - 生产/APK：设置为云端后端完整地址，如 https://your-backend.example.com
 */

import type { Task, Plan, Tag, DailyRecord } from '../types';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

let authToken: string | null = null;

/** 设置认证 token（登录后调用） */
export function setAuthToken(token: string | null): void {
  authToken = token;
}

/** 是否已有 token */
export function hasAuthToken(): boolean {
  return !!authToken;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * 序列化请求体：将 undefined 递归转为 null，
 * 使前端可用 undefined 表示"清空可选字段"
 */
function serializeBody(value: unknown): unknown {
  if (value === undefined) return null;
  if (Array.isArray(value)) return value.map(serializeBody);
  if (value !== null && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = serializeBody(v);
    }
    return out;
  }
  return value;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

  const body =
    options.body !== undefined ? JSON.stringify(serializeBody(options.body)) : undefined;

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { method: options.method || 'GET', headers, body });
  } catch {
    throw new ApiError('网络连接失败，请检查网络', 0);
  }

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const errMsg =
      data && typeof data === 'object' ? (data as { error?: string }).error : undefined;
    throw new ApiError(typeof errMsg === 'string' ? errMsg : '请求失败，请稍后重试', res.status);
  }

  return data as T;
}

export interface AuthResult {
  token: string;
  user: { id: string; username: string };
}

export interface AllData {
  tasks: Task[];
  plans: Plan[];
  tags: Tag[];
  dailyRecords: DailyRecord[];
}

export const api = {
  // ---- 认证 ----
  register: (username: string, password: string) =>
    request<AuthResult>('/api/auth/register', { method: 'POST', body: { username, password } }),
  login: (username: string, password: string) =>
    request<AuthResult>('/api/auth/login', { method: 'POST', body: { username, password } }),
  me: () => request<{ user: { id: string; username: string } }>('/api/auth/me'),

  // ---- 全量数据 ----
  getData: () => request<AllData>('/api/data'),

  // ---- 任务 ----
  createTask: (task: Partial<Task>) => request<Task>('/api/tasks', { method: 'POST', body: task }),
  updateTask: (id: string, task: Partial<Task>) =>
    request<Task>(`/api/tasks/${id}`, { method: 'PUT', body: task }),
  deleteTask: (id: string) => request<{ ok: boolean }>(`/api/tasks/${id}`, { method: 'DELETE' }),

  // ---- 计划 ----
  createPlan: (plan: Partial<Plan>) => request<Plan>('/api/plans', { method: 'POST', body: plan }),
  updatePlan: (id: string, plan: Partial<Plan>) =>
    request<Plan>(`/api/plans/${id}`, { method: 'PUT', body: plan }),
  deletePlan: (id: string) => request<{ ok: boolean }>(`/api/plans/${id}`, { method: 'DELETE' }),

  // ---- 标签 ----
  createTag: (tag: Partial<Tag>) => request<Tag>('/api/tags', { method: 'POST', body: tag }),
  updateTag: (id: string, tag: Partial<Tag>) =>
    request<Tag>(`/api/tags/${id}`, { method: 'PUT', body: tag }),
  deleteTag: (id: string) => request<{ ok: boolean }>(`/api/tags/${id}`, { method: 'DELETE' }),

  // ---- 每日记录 ----
  createRecord: (record: Partial<DailyRecord>) =>
    request<DailyRecord>('/api/records', { method: 'POST', body: record }),
  updateRecord: (id: string, record: Partial<DailyRecord>) =>
    request<DailyRecord>(`/api/records/${id}`, { method: 'PUT', body: record }),
  deleteRecord: (id: string) =>
    request<{ ok: boolean }>(`/api/records/${id}`, { method: 'DELETE' }),
};
